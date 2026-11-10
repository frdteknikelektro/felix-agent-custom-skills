#!/usr/bin/env python3
"""Instruction-bound Jali helper. Secret values stay inside this process.

Current event selection is governed by the skill, not an OS security boundary.
The private JSON directory must be outside the shared model Workspace.
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

ORIGIN = 'https://app.jala.tech'
LIMIT = 4 * 1024 * 1024


class Refused(Exception):
    pass


def require(condition, code):
    if not condition:
        raise Refused(code)


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
    def __init__(self, workspace):
        self.root = Path(os.environ.get('JALI_PRIVATE_DIR', '/run/jali-private'))
        require(self.root.is_absolute() and not self.root.is_symlink(), 'private_store_unavailable')
        require(not self.root.resolve().is_relative_to(workspace), 'private_store_unavailable')
        try:
            self.root.mkdir(mode=0o700, parents=True, exist_ok=True)
            self.root.chmod(0o700)
        except OSError:
            raise Refused('private_store_unavailable') from None
        self.file = self.root / 'auth.json'

    @contextmanager
    def locked(self):
        require(not (self.root / '.lock').is_symlink(), 'store_unavailable')
        fd = os.open(self.root / '.lock', os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
        with os.fdopen(fd, 'r+') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)
            require(not self.file.is_symlink(), 'store_unavailable')
            if self.file.exists():
                try:
                    data = read_json(self.file, 16 * 1024 * 1024)
                except (Refused, OSError):
                    raise Refused('store_unavailable') from None
                require(isinstance(data, dict) and data.get('version') == 1 and
                        set(data) == {'version', 'users', 'senders', 'threads'} and
                        all(isinstance(data[k], dict) for k in ('users', 'senders', 'threads')),
                        'store_unavailable')
            else:
                data = {'version': 1, 'users': {}, 'senders': {}, 'threads': {}}
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
    url = ORIGIN + route + ('?' + urllib.parse.urlencode(query) if query else '')
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
               Path(a['local_path']).resolve() == file.resolve()]
    require(len(matches) == 1, 'auth_attachment_required')
    # Once bound to this authorized upload, consume/clean only this file.
    try:
        auth = credential(read_json(file, 65536))
        result = call_api(auth, 'GET', '/api/profile')
        profile = result.get('data') if isinstance(result, dict) else None
        require(isinstance(profile, dict), 'invalid_profile')
        user_id = str(profile.get('id', ''))
        require(re.fullmatch(r'[1-9][0-9]*', user_id), 'invalid_profile')
        key = 'jala-' + user_id
        if ctx['source'] == 'api' and ctx['sender_id'].startswith('jala-'):
            require(ctx['sender_id'] == key, 'identity_mismatch')
        with store.locked() as data:
            known = data['senders'].get(ctx['sender_key'])
            require(known is None or known == key, 'identity_mismatch')
            data['senders'][ctx['sender_key']] = key
            data['users'][key] = {'credential': auth, 'revision': uuid.uuid4().hex,
                                  'profile': {'id': user_id, 'name': profile.get('name', '')}}
            data['threads'][ctx['thread_key']] = {'user': key}
            store.save(data)
        return {'status': 'authenticated', 'user_id': key}
    finally:
        file.unlink(missing_ok=True)


def authenticated(ctx, data):
    binding = data['threads'].get(ctx['thread_key'])
    require(isinstance(binding, dict), 'authentication_required')
    user = binding.get('user')
    require(data['senders'].get(ctx['sender_key']) == user, 'identity_mismatch')
    record = data['users'].get(user)
    require(isinstance(record, dict) and record.get('credential'), 'authentication_required')
    credential(record['credential'])
    return user, record


def execute(args):
    ctx = context(args.event_file)
    store = Store(ctx['workspace'])
    if args.command == 'authenticate':
        return authenticate(ctx, store, args.credential_file)
    with store.locked() as data:
        if args.command == 'disconnect':
            data['threads'].pop(ctx['thread_key'], None)
            store.save(data)
            return {'status': 'disconnected'}
        user, record = authenticated(ctx, data)
        if args.command == 'status':
            return {'status': 'authenticated', 'user_id': user}
        auth, revision = record['credential'], record['revision']
    query = read_json(safe_file(args.query_file, ctx['thread_dir'] / 'work')) if args.query_file else {}
    require(isinstance(query, dict) and all(isinstance(v, (str, int, float, bool)) for v in query.values()), 'invalid_query')
    body = read_json(safe_file(args.body_file, ctx['thread_dir'] / 'work')) if args.body_file else None
    try:
        result = call_api(auth, args.method, args.route, query, body)
    except Refused as error:
        if str(error) == 'authentication_required':
            with store.locked() as data:
                current = data['users'].get(user, {})
                if current.get('revision') == revision:
                    current.pop('credential', None)
                    store.save(data)
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
