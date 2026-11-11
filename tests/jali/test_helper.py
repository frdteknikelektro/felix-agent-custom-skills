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
import uuid

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
        # The helper parses Felix event frontmatter with Felix's own YAML module; use the repo copy outside the container.
        environment = {'WORKSPACE_DIR': str(self.workspace), 'JALI_PRIVATE_DIR': str(self.private), 'JALI_JALA_BASE_URL': 'https://app.jala.tech'}
        if 'JALI_YAML_MODULE' not in os.environ and not Path('/app/node_modules/yaml').exists():
            environment['JALI_YAML_MODULE'] = str(Path(__file__).resolve().parents[2] / 'node_modules/yaml')
        self.environment = patch.dict(os.environ, environment, clear=False)
        self.environment.start()
        self.calls = []; self.profile_id = 123; self.reject = None; self.reject_body = None
        def opened(request, timeout):
            self.calls.append(request)
            if self.reject:
                raise urllib.error.HTTPError(request.full_url, self.reject, '', {}, io.BytesIO(self.reject_body) if self.reject_body else None)
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
            file_id = 'file_' + str(uuid.uuid4())
            base = folder / 'attachments' / 'api-inputs'; base.mkdir(exist_ok=True)
            uploaded = base / (file_id + '.bin')
            uploaded.write_text(json.dumps(auth))
            (base / (file_id + '.json')).write_text(json.dumps({'id': file_id, 'session_id': 'session_' + name, 'filename': filename, 'size_bytes': uploaded.stat().st_size}))
            attachments.append({'file_id': file_id, 'filename': filename, 'local_path': str(uploaded)})
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
        self.assertEqual(result['status'], 'authenticated')
        self.assertEqual(result['user_id'], 'jala-123')
        self.assertTrue(file.exists())
        self.assertNotIn('fake-cache-secret', json.dumps(result))
        state = event.parent.parent / '.jali' / 'auth-state.json'
        self.assertEqual(stat.S_IMODE(state.stat().st_mode), 0o600)
        self.assertNotIn('fake-cache-secret', state.read_text())
        self.assertEqual(stat.S_IMODE(state.parent.stat().st_mode), 0o700)
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

    def test_contacts_bind_independent_profiles_per_thread(self):
        event, file = self.event(sender='arbitrary-contact', auth={'cache_key': 'fake-cache-secret'})
        self.authenticate(event, file)
        event, file = self.event('two', sender='arbitrary-contact', auth={'access_token': 'other-secret'})
        self.profile_id = 124
        result = self.authenticate(event, file)
        self.assertEqual(result['user_id'], 'arbitrary-contact')
        self.assertTrue(file.exists())
        first = json.loads((self.workspace / 'sessions/one/.jali/auth-state.json').read_text())
        second = json.loads((self.workspace / 'sessions/two/.jali/auth-state.json').read_text())
        self.assertEqual(first['profile_id'], '123')
        self.assertEqual(second['profile_id'], '124')

    def test_labelled_contact_ids_such_as_byop_authenticate_for_the_same_profile(self):
        for sender in ('jala-123', 'jala-byop-123', 'jala-any-label-123'):
            event, file = self.event(sender.replace('-', '_'), sender=sender, auth={'cache_key': 'fake-cache-secret'})
            result = self.authenticate(event, file)
            self.assertEqual(result, {'status': 'authenticated', 'user_id': sender, 'file_id': result['file_id']})
            self.assertEqual(self.request(event)['data']['farms'], [])

    def test_existing_state_without_profile_id_keeps_its_labelled_contact_binding(self):
        event, file = self.event(sender='jala-byop-123', auth={'cache_key': 'fake-cache-secret'})
        self.authenticate(event, file)
        state = self.workspace / 'sessions/one/.jali/auth-state.json'
        data = json.loads(state.read_text()); del data['profile_id']; state.write_text(json.dumps(data))
        event, file = self.event(sender='jala-byop-123', auth={'cache_key': 'renewed-secret'})
        self.assertEqual(self.authenticate(event, file)['status'], 'authenticated')
        self.profile_id = 124
        event, file = self.event(sender='jala-byop-123', auth={'cache_key': 'other-user-secret'})
        with self.assertRaisesRegex(jali.Refused, 'identity_mismatch'):
            self.authenticate(event, file)

    def test_rejected_request_returns_jala_error_details_without_the_credential(self):
        event, file = self.event(auth={'cache_key': 'fake-cache-secret'})
        self.authenticate(event, file)
        self.reject = 422
        self.reject_body = json.dumps({'error': {'code': 'INVALID_DEFINITION', 'message': 'Unknown node fake-cache-secret', 'details': {'path': 'overrides.fr'}}}).encode()
        with self.assertRaises(jali.Refused) as caught:
            self.request(event, '/api/cycles/1/calculation/preview', 'POST')
        self.assertEqual(str(caught.exception), 'request_rejected')
        self.assertEqual(caught.exception.details, {'http_status': 422, 'error': {'code': 'INVALID_DEFINITION', 'message': 'Unknown node [redacted]', 'details': {'path': 'overrides.fr'}}})

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
        metadata = json.loads(file.with_suffix('.json').read_text())
        metadata['size_bytes'] = file.stat().st_size
        file.with_suffix('.json').write_text(json.dumps(metadata))
        with self.assertRaisesRegex(jali.Refused, 'invalid_json'):
            self.authenticate(event, file)
        self.assertFalse(file.exists())
        self.assertEqual(self.calls, [])

    def test_disconnect_and_credentials_are_session_scoped(self):
        first, file = self.event(auth={'cache_key': 'first-credential'})
        self.authenticate(first, file)
        second, file = self.event('two', auth={'access_token': 'latest-credential'})
        self.authenticate(second, file)
        self.request(first)
        self.assertIsNone(self.calls[-1].get_header('Authorization'))
        self.assertIn('first-credential', self.calls[-1].full_url)
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

    def test_corrupt_session_state_does_not_silently_reset(self):
        event, file = self.event(auth={'cache_key': 'fake-cache-secret'})
        self.authenticate(event, file)
        state = event.parent.parent / '.jali' / 'auth-state.json'
        state.write_text('corrupt')
        with self.assertRaisesRegex(jali.Refused, 'store_unavailable'):
            jali.execute(self.args(event, 'status'))
        self.assertEqual(state.read_text(), 'corrupt')

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
        for index in (123, 124):
            data = json.loads((self.workspace / ('sessions/parallel-' + str(index)) / '.jali/auth-state.json').read_text())
            self.assertEqual(data['user_id'], 'jala-' + str(index))

    def test_upload_from_another_thread_cannot_be_consumed(self):
        event, _ = self.event('one')
        _, file = self.event('two', auth={'cache_key': 'fake-cache-secret'})
        with self.assertRaisesRegex(jali.Refused, 'unsafe_file'):
            self.authenticate(event, file)
        self.assertTrue(file.exists())
        self.assertEqual(self.calls, [])

    def test_configured_origin_is_used_for_profile_and_subsequent_requests(self):
        event, file = self.event(auth={'cache_key': 'fake-cache-secret'})
        with patch.dict(os.environ, {'JALI_JALA_BASE_URL': 'https://staging-app.jala.tech/'}):
            self.authenticate(event, file)
            self.request(event)
        self.assertEqual(len(self.calls), 2)
        for request in self.calls:
            self.assertEqual(urllib.parse.urlsplit(request.full_url).netloc, 'staging-app.jala.tech')
            self.assertNotIn('//api', request.full_url)

    def test_default_origin_preserves_existing_production_configuration(self):
        environment = dict(os.environ)
        environment.pop('JALI_JALA_BASE_URL', None)
        with patch.dict(os.environ, environment, clear=True):
            self.assertEqual(jali.api_origin(), 'https://app.jala.tech')

    def test_invalid_configured_origin_never_sends_credentials(self):
        invalid = ['', 'http://staging-app.jala.tech', 'https://staging-app.jala.tech/api',
                   'https://user:password@staging-app.jala.tech',
                   'https://staging-app.jala.tech?x=1', 'https://staging-app.jala.tech#fragment',
                   'https://staging-app.jala.tech:wrong', 'https://staging-app.jala.tech:0',
                   ' https://staging-app.jala.tech', 'https://staging-app.jala.tech\n',
                   'https://staging-app.jala.tech\\evil']
        for value in invalid:
            with self.subTest(value=value), patch.dict(os.environ, {'JALI_JALA_BASE_URL': value}):
                with self.assertRaisesRegex(jali.Refused, 'invalid_jala_base_url'):
                    jali.call_api({'cache_key': 'fake-cache-secret'}, 'GET', '/api/profile')
        self.assertEqual(self.calls, [])

    def test_origin_change_requires_fresh_authentication(self):
        event, file = self.event(auth={'cache_key': 'fake-cache-secret'})
        self.authenticate(event, file)
        with patch.dict(os.environ, {'JALI_JALA_BASE_URL': 'https://staging-app.jala.tech'}):
            with self.assertRaisesRegex(jali.Refused, 'authentication_required'):
                jali.execute(self.args(event, 'status'))

    def test_mid_chat_renewal_replaces_exact_upload_and_deletes_old_bytes(self):
        event, first = self.event(auth={'cache_key': 'fake-cache-secret'})
        result = self.authenticate(event, first)
        self.assertEqual(self.authenticate(event, first), result)
        event, second = self.event(auth={'access_token': 'new-secret'})
        self.authenticate(event, second)
        self.assertFalse(first.exists())
        self.assertTrue(second.exists())
        self.request(event)
        self.assertEqual(self.calls[-1].get_header('Authorization'), 'Bearer new-secret')

    def test_failed_renewal_keeps_previous_binding(self):
        event, first = self.event(auth={'cache_key': 'fake-cache-secret'})
        self.authenticate(event, first)
        event, second = self.event(auth={'access_token': 'wrong-user'})
        self.profile_id = 124
        with self.assertRaisesRegex(jali.Refused, 'identity_mismatch'):
            self.authenticate(event, second)
        self.assertFalse(second.exists())
        self.assertTrue(first.exists())
        self.assertEqual(jali.execute(self.args(event, 'status'))['status'], 'authenticated')

    def test_late_401_does_not_expire_new_revision(self):
        event, first = self.event(auth={'cache_key': 'fake-cache-secret'})
        self.authenticate(event, first)
        original = jali.call_api
        def replace_then_fail(auth, method, route, query=None, body=None):
            event2, second = self.event(auth={'access_token': 'replacement'})
            with patch.object(jali, 'call_api', original):
                self.authenticate(event2, second)
            raise jali.Refused('authentication_required')
        with patch.object(jali, 'call_api', replace_then_fail):
            with self.assertRaisesRegex(jali.Refused, 'authentication_required'):
                self.request(event)
        self.assertEqual(jali.execute(self.args(event, 'status'))['status'], 'authenticated')



if __name__ == '__main__': unittest.main()
