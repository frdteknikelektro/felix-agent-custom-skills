import argparse
from contextlib import redirect_stdout
import importlib.util
import io
import json
import multiprocessing
import os
from pathlib import Path
import stat
import tempfile
import unittest
from unittest.mock import patch
import urllib.error
import urllib.parse

SOURCE = Path(__file__).resolve().parents[2] / 'skills/jali/scripts/jali.py'
spec = importlib.util.spec_from_file_location('jali_helper', SOURCE)
jali = importlib.util.module_from_spec(spec)
spec.loader.exec_module(jali)


class Response:
    def __init__(self, data): self.raw = json.dumps(data).encode()
    def __enter__(self): return self
    def __exit__(self, *args): return False
    def read(self, size): return self.raw[:size]


class HelperTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='jali-skill-')
        self.base = Path(self.temp.name).resolve()
        self.workspace = self.base / 'workspace'; self.workspace.mkdir()
        self.private = self.base / 'private'
        self.environment = patch.dict(os.environ, {'WORKSPACE_DIR': str(self.workspace), 'JALI_PRIVATE_DIR': str(self.private)}, clear=False)
        self.environment.start()
        self.calls = []; self.profile_id = 123; self.reject = None
        def opened(request, timeout):
            self.calls.append(request)
            if self.reject:
                raise urllib.error.HTTPError(request.full_url, self.reject, '', {}, None)
            data = {'data': {'id': self.profile_id, 'name': 'Test User'}} if urllib.parse.urlparse(request.full_url).path == '/api/profile' else {'farms': [], 'access_token': 'must-not-return', 'message': 'fake-cache-secret'}
            return Response(data)
        self.transport = patch.object(jali.urllib.request, 'build_opener', return_value=argparse.Namespace(open=opened))
        self.transport.start()

    def tearDown(self):
        self.transport.stop(); self.environment.stop(); self.temp.cleanup()

    def event(self, name='one', sender='jala-123', auth=None, filename='jali-auth.json'):
        folder = self.workspace / 'sessions' / name
        for child in ('events', 'attachments', 'work'): (folder / child).mkdir(parents=True, exist_ok=True)
        attachments = []
        uploaded = None
        if auth is not None:
            uploaded = folder / 'attachments' / ('upload-' + filename)
            uploaded.write_text(json.dumps(auth))
            attachments.append({'filename': filename, 'local_path': str(uploaded)})
        data = {'type': 'source_event', 'source': 'api', 'visibility': 'dm', 'sender': {'source': 'api', 'id': sender}, 'thread_key': 'api:' + sender + ':' + name, 'attachments': attachments}
        event = folder / 'events' / 'current.md'
        event.write_text('---\n' + json.dumps(data) + '\n---\nUser message\n')
        return event, uploaded

    def args(self, event, command, **fields):
        return argparse.Namespace(event_file=str(event), command=command, **fields)

    def authenticate(self, event, file):
        return jali.execute(self.args(event, 'authenticate', credential_file=str(file)))

    def request(self, event, route='/api/farms', method='GET', **fields):
        return jali.execute(self.args(event, 'request', method=method, route=route, query_file=fields.get('query_file'), body_file=fields.get('body_file')))

    def test_authentication_saves_verified_user_privately_without_returning_secret(self):
        event, file = self.event(auth={'cache_key': 'fake-cache-secret'})
        result = self.authenticate(event, file)
        self.assertEqual(result, {'status': 'authenticated', 'user_id': 'jala-123'})
        self.assertFalse(file.exists())
        self.assertNotIn('fake-cache-secret', json.dumps(result))
        self.assertEqual(stat.S_IMODE((self.private / 'auth.json').stat().st_mode), 0o600)
        self.assertEqual(stat.S_IMODE(self.private.stat().st_mode), 0o700)
        self.assertFalse((self.workspace / 'auth.json').exists())
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.calls[0].full_url).query)
        self.assertEqual(query, {'cache_key': ['fake-cache-secret']})
        self.assertIsNone(self.calls[0].get_header('Authorization'))

    def test_new_thread_requires_upload_even_for_known_user_and_same_thread_retains_auth(self):
        event, file = self.event(auth={'cache_key': 'fake-cache-secret'})
        self.authenticate(event, file)
        self.assertEqual(jali.execute(self.args(event, 'status'))['status'], 'authenticated')
        second, _ = self.event('two')
        with self.assertRaisesRegex(jali.Refused, 'authentication_required'):
            jali.execute(self.args(second, 'status'))

    def test_other_account_cannot_replace_sender_identity(self):
        event, file = self.event(auth={'cache_key': 'fake-cache-secret'})
        self.authenticate(event, file)
        event, file = self.event('two', auth={'access_token': 'other-secret'})
        self.profile_id = 124
        with self.assertRaisesRegex(jali.Refused, 'identity_mismatch'):
            self.authenticate(event, file)
        self.assertFalse(file.exists())
        data = json.loads((self.private / 'auth.json').read_text())
        self.assertEqual(set(data['users']), {'jala-123'})

    def test_oauth_and_cache_key_are_exclusive_and_credentials_are_redacted_from_results(self):
        event, file = self.event(auth={'access_token': 'fake-oauth-secret'})
        self.authenticate(event, file)
        self.assertEqual(self.calls[0].get_header('Authorization'), 'Bearer fake-oauth-secret')
        self.assertEqual(urllib.parse.urlparse(self.calls[0].full_url).query, '')
        result = self.request(event)
        self.assertEqual(result['data']['access_token'], '[redacted]')
        event, file = self.event('two', auth={'cache_key': 'fake-cache-secret'})
        self.authenticate(event, file)
        result = self.request(event)
        self.assertEqual(result['data']['message'], '[redacted]')
        self.assertIsNone(self.calls[-1].get_header('Authorization'))

    def test_invalid_format_and_wrong_original_filename_are_rejected(self):
        for data in [{'cache_key': 'x', 'access_token': 'y'}, {'cache_key': ''}, {'user_id': '123'}, {'access_token': 'x', 'user_id': 123}]:
            event, file = self.event(auth=data)
            with self.assertRaisesRegex(jali.Refused, 'invalid_auth_file'):
                self.authenticate(event, file)
        event, file = self.event(auth={'cache_key': 'x'}, filename='receipt.json')
        with self.assertRaisesRegex(jali.Refused, 'auth_attachment_required'):
            self.authenticate(event, file)
        self.assertEqual(self.calls, [])

    def test_duplicate_json_keys_are_rejected_opaquely(self):
        event, file = self.event(auth={'cache_key': 'x'})
        file.write_text('{"cache_key":"x","cache_key":"y"}')
        with self.assertRaisesRegex(jali.Refused, 'invalid_json'):
            self.authenticate(event, file)
        self.assertFalse(file.exists())
        self.assertEqual(self.calls, [])

    def test_disconnect_is_thread_only_and_renewal_uses_latest_user_credential(self):
        first, file = self.event(auth={'cache_key': 'first-credential'})
        self.authenticate(first, file)
        second, file = self.event('two', auth={'access_token': 'latest-credential'})
        self.authenticate(second, file)
        self.request(first)
        self.assertEqual(self.calls[-1].get_header('Authorization'), 'Bearer latest-credential')
        jali.execute(self.args(first, 'disconnect'))
        with self.assertRaisesRegex(jali.Refused, 'authentication_required'):
            self.request(first)
        self.assertEqual(jali.execute(self.args(second, 'status'))['status'], 'authenticated')

    def test_expiry_requires_reauthentication_and_does_not_borrow_other_users_credentials(self):
        event, file = self.event(auth={'cache_key': 'fake-cache-secret'})
        self.authenticate(event, file)
        self.reject = 401
        with self.assertRaisesRegex(jali.Refused, 'authentication_required'):
            self.request(event)
        with self.assertRaisesRegex(jali.Refused, 'authentication_required'):
            jali.execute(self.args(event, 'status'))

    def test_permission_denial_is_not_expiry_and_uncertain_write_is_not_retried(self):
        event, file = self.event(auth={'cache_key': 'fake-cache-secret'})
        self.authenticate(event, file)
        self.reject = 403
        with self.assertRaisesRegex(jali.Refused, 'permission_denied'):
            self.request(event)
        self.assertEqual(jali.execute(self.args(event, 'status'))['status'], 'authenticated')
        before = len(self.calls); self.reject = 500
        with self.assertRaisesRegex(jali.Refused, 'request_outcome_unknown'):
            self.request(event, '/api/profile', 'PUT')
        self.assertEqual(len(self.calls), before + 1)

    def test_refuses_auth_overrides_minting_endpoints_and_arbitrary_hosts(self):
        event, file = self.event(auth={'cache_key': 'fake-cache-secret'})
        self.authenticate(event, file); before = len(self.calls)
        for route in ['https://attacker.test/api/farms', '//attacker/api/farms', '/api/farms?cache_key=x', '/api/request_access', '/api/oauth/google']:
            with self.assertRaises(jali.Refused): self.request(event, route)
        for key in ['cache_key', 'cache.key', 'cache_key[0]', 'access_token']:
            query = event.parent.parent / 'work' / 'query.json'; query.write_text(json.dumps({key: 'other'}))
            with self.assertRaisesRegex(jali.Refused, 'credential_override_forbidden'):
                self.request(event, query_file=str(query))
        self.assertEqual(len(self.calls), before)

    def test_corrupt_store_and_workspace_store_do_not_silently_reset(self):
        event, file = self.event(auth={'cache_key': 'fake-cache-secret'})
        self.authenticate(event, file)
        (self.private / 'auth.json').write_text('corrupt')
        with self.assertRaisesRegex(jali.Refused, 'store_unavailable'):
            jali.execute(self.args(event, 'status'))
        self.assertEqual((self.private / 'auth.json').read_text(), 'corrupt')
        with patch.dict(os.environ, {'JALI_PRIVATE_DIR': str(self.workspace / 'private')}):
            with self.assertRaisesRegex(jali.Refused, 'private_store_unavailable'):
                jali.execute(self.args(event, 'status'))

    def test_parallel_authentication_preserves_both_users_in_json_store(self):
        inputs = [self.event('parallel-' + str(i), sender='jala-' + str(i),
                             auth={'cache_key': 'fake-parallel-' + str(i)}) for i in (123, 124)]
        fork = multiprocessing.get_context('fork')
        results = fork.Queue()
        def consume(index, event, file):
            self.profile_id = index
            try:
                results.put(self.authenticate(event, file)['status'])
            except Exception:
                results.put('failed')
        workers = [fork.Process(target=consume, args=(index, *item))
                   for index, item in zip((123, 124), inputs)]
        for worker in workers: worker.start()
        for worker in workers: worker.join(15)
        self.assertTrue(all(not worker.is_alive() and worker.exitcode == 0 for worker in workers))
        self.assertEqual([results.get(timeout=1), results.get(timeout=1)], ['authenticated', 'authenticated'])
        data = json.loads((self.private / 'auth.json').read_text())
        self.assertEqual(set(data['users']), {'jala-123', 'jala-124'})
        self.assertEqual(len(data['threads']), 2)

    def test_upload_from_another_thread_cannot_be_consumed(self):
        event, _ = self.event('one')
        _, file = self.event('two', auth={'cache_key': 'fake-cache-secret'})
        with self.assertRaisesRegex(jali.Refused, 'unsafe_file'):
            self.authenticate(event, file)
        self.assertTrue(file.exists())
        self.assertEqual(self.calls, [])


if __name__ == '__main__': unittest.main()
