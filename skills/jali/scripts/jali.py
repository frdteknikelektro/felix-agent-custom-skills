#!/usr/bin/env python3
"""Instruction-bound Jali helper. Secret values stay inside this process.

Current event selection is governed by the skill, not an OS security boundary.
Credentials remain opaque session uploads; the local state stores only the thread binding,
verified profile ID and file reference.
"""
import argparse
from contextlib import contextmanager
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
import uuid

LIMIT = 4 * 1024 * 1024


class Refused(Exception):
    pass


def require(condition, code):
    if not condition:
        raise Refused(code)


def api_origin():
    value = os.environ.get('JALI_JALA_BASE_URL', 'https://app.jala.tech')
    try:
        parsed = urllib.parse.urlsplit(value)
        valid = (value == value.strip() and not any(c.isspace() for c in value) and
                 not any(c in value for c in ('\\', '?', '#')) and
                 parsed.scheme == 'https' and bool(parsed.hostname) and
                 parsed.username is None and parsed.password is None and
                 parsed.path in ('', '/') and parsed.port != 0)
        require(valid, 'invalid_jala_base_url')
    except ValueError:
        raise Refused('invalid_jala_base_url') from None
    return value.rstrip('/')


def unique(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, 'invalid_json')
        result[key] = value
    return result


def decode(value):
    try:
        return json.loads(value, object_pairs_hook=unique,
                          parse_constant=lambda _: require(False, 'invalid_json'))
    except (ValueError, UnicodeError):
        raise Refused('invalid_json') from None


def safe_file(value, base):
    file = Path(os.path.abspath(value))
    base = Path(base).resolve()
    require(file.is_relative_to(base), 'unsafe_file')
    for item in [file, *file.parents]:
        require(not item.is_symlink(), 'unsafe_file')
        if item == base:
            break
    info = file.stat()
    require(stat.S_ISREG(info.st_mode) and info.st_nlink == 1, 'unsafe_file')
    return file


def read_json(file, limit=LIMIT):
    with open(file, 'rb') as stream:
        raw = stream.read(limit + 1)
    require(len(raw) <= limit, 'file_too_large')
    return decode(raw)


def credential(value):
    require(isinstance(value, dict) and len(value) == 1, 'invalid_auth_file')
    key = next(iter(value))
    require(key in ('cache_key', 'access_token'), 'invalid_auth_file')
    require(isinstance(value[key], str) and bool(value[key].strip()) and
            len(value[key]) <= 32768, 'invalid_auth_file')
    return value


def context(event_file):
    workspace = Path(os.environ['WORKSPACE_DIR']).resolve()
    file = safe_file(event_file, workspace)
    require(file.parent.name == 'events', 'invalid_event')
    # Felix writes YAML frontmatter. Use its installed YAML dependency, not an
    # unsafe home-made parser; only selected metadata returns to Python.
    parser = r'''
const fs=require('node:fs');
const yaml=require(process.env.JALI_YAML_MODULE||'/app/node_modules/yaml');
const raw=fs.readFileSync(process.argv[1],'utf8');
if(!raw.startsWith('---\n'))process.exit(2);
const end=raw.indexOf('\n---',4);if(end<0)process.exit(2);
const e=yaml.parse(raw.slice(4,end));
console.log(JSON.stringify({type:e.type,source:e.source,sender:e.sender,
 thread_key:e.thread_key,visibility:e.visibility,attachments:e.attachments||[]}));
'''
    parsed = subprocess.run(['node', '-e', parser, str(file)], capture_output=True,
                            timeout=10, check=False)
    require(parsed.returncode == 0, 'invalid_event')
    event = decode(parsed.stdout)
    require(isinstance(event, dict) and event.get('type') == 'source_event' and
            event.get('visibility') == 'dm', 'private_source_event_required')
    sender = event.get('sender', {})
    source, user, thread = event.get('source'), sender.get('id'), event.get('thread_key')
    require(isinstance(source, str) and source and isinstance(user, str) and user and
            isinstance(thread, str) and thread, 'invalid_event')
    require(sender.get('source', source) == source, 'invalid_event')
    sender_key = json.dumps([source, user], separators=(',', ':'))
    thread_key = hashlib.sha256(json.dumps([source, user, thread]).encode()).hexdigest()
    return {'workspace': workspace, 'thread_dir': file.parent.parent,
            'sender_key': sender_key, 'thread_key': thread_key, 'source': source,
            'sender_id': user, 'attachments': event['attachments']}


class Store:
    def __init__(self, ctx):
        self.ctx = ctx
        self.root = ctx['thread_dir'] / '.jali'
        require(not self.root.is_symlink(), 'store_unavailable')
        self.root.mkdir(mode=0o700, exist_ok=True)
        self.root.chmod(0o700)
        self.file = self.root / 'auth-state.json'

    @contextmanager
    def locked(self):
        require(not (self.root / '.lock').is_symlink(), 'store_unavailable')
        fd = os.open(self.root / '.lock', os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
        with os.fdopen(fd, 'r+') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)
            require(not self.file.is_symlink(), 'store_unavailable')
            data = {}
            if self.file.exists():
                try:
                    data = read_json(self.file, 65536)
                    require(isinstance(data, dict) and data.get('version') == 2 and
                            data.get('sender') == self.ctx['sender_key'] and
                            data.get('thread') == self.ctx['thread_key'], 'store_unavailable')
                except (Refused, OSError):
                    raise Refused('store_unavailable') from None
            yield data

    def save(self, data):
        fd, temporary = tempfile.mkstemp(prefix='.auth-', dir=self.root)
        try:
            with os.fdopen(fd, 'w') as stream:
                os.fchmod(stream.fileno(), 0o600)
                json.dump(data, stream, separators=(',', ':'))
                stream.flush()
                os.fsync(stream.fileno())
            os.replace(temporary, self.file)
        finally:
            if os.path.exists(temporary):
                os.unlink(temporary)


def upload(ctx, file_id):
    require(isinstance(file_id, str) and re.fullmatch(r'file_[a-f0-9-]{36}', file_id), 'invalid_auth_file')
    base = ctx['thread_dir'] / 'attachments' / 'api-inputs'
    metadata = read_json(safe_file(base / (file_id + '.json'), base), 65536)
    require(metadata.get('id') == file_id and metadata.get('filename') == 'jali-auth.json' and
            isinstance(metadata.get('session_id'), str), 'invalid_auth_file')
    file = safe_file(base / (file_id + '.bin'), base)
    require(file.stat().st_size == metadata.get('size_bytes'), 'invalid_auth_file')
    return file, metadata


def attachment_file(ctx, attachment):
    require(isinstance(attachment, dict) and attachment.get('filename') == 'jali-auth.json' and
            attachment.get('status', 'available') == 'available' and
            isinstance(attachment.get('file_id'), str) and attachment.get('file_id'),
            'auth_attachment_required')
    base = ctx['thread_dir'] / 'attachments'
    file = safe_file(attachment.get('local_path', ''), base)
    if ctx['source'] == 'api':
        uploaded, _ = upload(ctx, attachment['file_id'])
        require(uploaded == file, 'auth_attachment_required')
    return file, file.relative_to(ctx['thread_dir']).as_posix(), attachment['file_id']


def stored_file(ctx, data):
    relative = data.get('credential_path')
    if isinstance(relative, str) and relative:
        return safe_file(ctx['thread_dir'] / relative, ctx['thread_dir'] / 'attachments')
    # Version 2 API sessions stored only the native Felix upload ID.
    file, _ = upload(ctx, data.get('file_id'))
    return file


def stored_reference(data):
    return data.get('credential_path') or data.get('file_id')


def clean_superseded(ctx, data):
    for reference in data.get('superseded', []):
        if reference == stored_reference(data):
            continue
        try:
            if ctx['source'] == 'api' and isinstance(reference, str) and re.fullmatch(r'file_[a-f0-9-]{36}', reference):
                file, _ = upload(ctx, reference)
            else:
                file = safe_file(ctx['thread_dir'] / str(reference), ctx['thread_dir'] / 'attachments')
            file.unlink(missing_ok=True)
        except FileNotFoundError:
            pass


def profile_id(data):
    value = data.get('profile_id')
    if isinstance(value, str) and re.fullmatch(r'[1-9][0-9]*', value):
        return value
    # Existing sessions used the contact ID as the JALA profile binding.
    legacy = data.get('user_id')
    match = re.fullmatch(r'jala(?:-[a-z0-9]+)*-([1-9][0-9]*)', legacy) if isinstance(legacy, str) else None
    require(match is not None, 'identity_mismatch')
    return match.group(1)


def active(ctx, data):
    require(data.get('origin') == api_origin() and data.get('status') == 'authenticated',
            'authentication_required')
    require(ctx['sender_id'] == data.get('user_id'), 'identity_mismatch')
    try:
        file = stored_file(ctx, data)
        auth = credential(read_json(file, 65536))
    except (OSError, Refused):
        raise Refused('authentication_required') from None
    return auth


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def reserved(name):
    return re.sub(r'[. ]', '_', str(name).split('[', 1)[0]).lower() in {
        'cache_key', 'access_token', 'authorization', 'refresh_token'}


def redact(value, secret):
    if isinstance(value, dict):
        return {k: '[redacted]' if reserved(k) or k.lower() in ('password', 'secret', 'client_secret')
                else redact(v, secret) for k, v in value.items()}
    if isinstance(value, list):
        return [redact(v, secret) for v in value]
    return value.replace(secret, '[redacted]') if isinstance(value, str) else value


def call_api(auth, method, route, query=None, body=None):
    require(method in ('GET', 'POST', 'PUT', 'PATCH', 'DELETE') and
            re.fullmatch(r'/api/[A-Za-z0-9_/-]+', route) and '//' not in route,
            'invalid_operation')
    require(not re.match(r'/api/(request_access|oauth|register|password)(/|$)', route, re.I),
            'credential_operation_forbidden')
    query = dict(query or {})
    require(not any(reserved(k) for k in query), 'credential_override_forbidden')
    require(not isinstance(body, dict) or not any(reserved(k) for k in body),
            'credential_override_forbidden')
    headers = {'Accept': 'application/json'}
    secret = next(iter(auth.values()))
    if 'cache_key' in auth:
        query['cache_key'] = secret
    else:
        headers['Authorization'] = 'Bearer ' + secret
    url = api_origin() + route + ('?' + urllib.parse.urlencode(query) if query else '')
    if body is not None:
        require(method != 'GET', 'invalid_operation')
        headers['Content-Type'] = 'application/json'
    request = urllib.request.Request(url, method=method, headers=headers,
                                    data=None if body is None else json.dumps(body).encode())
    try:
        with urllib.request.build_opener(NoRedirect()).open(request, timeout=20) as response:
            raw = response.read(LIMIT + 1)
            require(len(raw) <= LIMIT, 'response_too_large')
            return None if not raw else decode(raw)
    except urllib.error.HTTPError as error:
        if error.code == 401:
            raise Refused('authentication_required') from None
        if error.code == 403:
            raise Refused('permission_denied') from None
        raise Refused('request_rejected' if error.code < 500 else ('jala_unavailable' if method == 'GET' else 'request_outcome_unknown')) from None
    except (urllib.error.URLError, TimeoutError, OSError, ValueError):
        raise Refused('request_outcome_unknown' if method != 'GET' else 'jala_unavailable') from None


def authenticate(ctx, store, supplied):
    file = safe_file(supplied, ctx['thread_dir'] / 'attachments')
    matches = [a for a in ctx['attachments'] if isinstance(a, dict) and
               a.get('filename') == 'jali-auth.json' and a.get('local_path') and
               Path(a['local_path']).resolve() == file.resolve() and a.get('file_id') and
               a.get('status', 'available') == 'available']
    require(len(matches) == 1, 'auth_attachment_required')
    file, relative_path, file_id = attachment_file(ctx, matches[0])
    with store.locked() as data:
        clean_superseded(ctx, data)
        if data.get('file_id') == file_id and data.get('status') == 'authenticated':
            active(ctx, data)
            return {'status': 'authenticated', 'user_id': ctx['sender_id'], 'file_id': file_id}
        try:
            auth = credential(read_json(file, 65536))
            result = call_api(auth, 'GET', '/api/profile')
            profile = result.get('data') if isinstance(result, dict) else None
            require(isinstance(profile, dict), 'invalid_profile')
            jala_user_id = str(profile.get('id', ''))
            require(re.fullmatch(r'[1-9][0-9]*', jala_user_id), 'invalid_profile')
            require(not data or (profile_id(data) == jala_user_id and data.get('origin') == api_origin()),
                    'identity_mismatch')
            prior = stored_reference(data)
            replacement = {'version': 2, 'sender': ctx['sender_key'], 'thread': ctx['thread_key'],
                           'origin': api_origin(), 'user_id': ctx['sender_id'], 'profile_id': jala_user_id,
                           'file_id': file_id, 'credential_path': relative_path, 'revision': uuid.uuid4().hex,
                           'status': 'authenticated', 'superseded': [prior] if prior else []}
            store.save(replacement)
        except Exception:
            if stored_reference(data) != relative_path:
                file.unlink(missing_ok=True)
            raise
        clean_superseded(ctx, replacement)
    return {'status': 'authenticated', 'user_id': ctx['sender_id'], 'file_id': file_id}


def execute(args):
    ctx = context(args.event_file)
    store = Store(ctx)
    if args.command == 'authenticate':
        return authenticate(ctx, store, args.credential_file)
    with store.locked() as data:
        clean_superseded(ctx, data)
        if args.command == 'disconnect':
            if data:
                previous = stored_reference(data)
                data.update(status='disconnected', file_id=None, credential_path=None,
                            revision=uuid.uuid4().hex,
                            superseded=[previous] if previous else [])
                store.save(data)
                clean_superseded(ctx, data)
            return {'status': 'disconnected'}
        auth = active(ctx, data)
        user, revision = data['user_id'], data['revision']
        if args.command == 'status':
            return {'status': 'authenticated', 'user_id': user, 'file_id': data['file_id']}
    query = read_json(safe_file(args.query_file, ctx['thread_dir'] / 'work')) if args.query_file else {}
    require(isinstance(query, dict) and all(isinstance(v, (str, int, float, bool)) for v in query.values()), 'invalid_query')
    body = read_json(safe_file(args.body_file, ctx['thread_dir'] / 'work')) if args.body_file else None
    try:
        result = call_api(auth, args.method, args.route, query, body)
    except Refused as error:
        if str(error) == 'authentication_required':
            with store.locked() as current:
                if current.get('revision') == revision:
                    current['status'] = 'expired'
                    store.save(current)
        raise
    return {'status': 'ok', 'data': redact(result, next(iter(auth.values())))}


class SafeParser(argparse.ArgumentParser):
    def error(self, message):
        raise Refused("invalid_arguments")


def main():
    parser = SafeParser(description='Opaque Jali thread authentication and REST requests')
    parser.add_argument('--event-file', required=True)
    commands = parser.add_subparsers(dest='command', required=True)
    commands.add_parser('status')
    commands.add_parser('disconnect')
    auth = commands.add_parser('authenticate')
    auth.add_argument('--credential-file', required=True)
    request = commands.add_parser('request')
    request.add_argument('method', choices=['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
    request.add_argument('route')
    request.add_argument('--query-file')
    request.add_argument('--body-file')
    try:
        result = execute(parser.parse_args())
    except Refused as error:
        result = {'status': str(error)}
    except Exception:
        result = {'status': 'unavailable'}
    print(json.dumps(result, ensure_ascii=False))
    return 0 if result['status'] in ('ok', 'authenticated', 'disconnected') else 1


if __name__ == '__main__':
    sys.exit(main())
