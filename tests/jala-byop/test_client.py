import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

SOURCE = Path(__file__).resolve().parents[2] / 'skills/jala-byop/scripts/client.py'
spec = importlib.util.spec_from_file_location('jala_byop_client', SOURCE)
client = importlib.util.module_from_spec(spec)
spec.loader.exec_module(client)


class FakeHelper:
    """Stands in for `jali.py request`, recording each call and the files it was given."""

    def __init__(self, *results):
        self.results = list(results)
        self.calls = []

    def __call__(self, command, capture_output, timeout, check):
        files = {}
        for flag in ('--query-file', '--body-file'):
            if flag in command:
                path = Path(command[command.index(flag) + 1])
                files[flag] = (path, json.loads(path.read_text()))
        self.calls.append({'command': command, 'files': files})
        result = self.results.pop(0)
        if isinstance(result, Exception):
            raise result
        return subprocess.CompletedProcess(command, 0, json.dumps(result).encode(), b'')


class ClientTransportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='jala-byop-')
        thread = Path(self.temp.name) / 'sessions' / 'one'
        (thread / 'events').mkdir(parents=True)
        (thread / 'work').mkdir()
        self.event = thread / 'events' / 'current.md'
        self.event.write_text('---\n{}\n---\n')
        self.work = thread / 'work'

    def tearDown(self):
        self.temp.cleanup()

    def client(self, *results):
        helper = FakeHelper(*results)
        transport = client.JaliTransport(self.event, helper='/skills/jali/scripts/jali.py', runner=helper)
        return client.RemoteCalculationClient(transport), helper

    def test_requests_go_through_the_jali_helper_for_the_current_event(self):
        api, helper = self.client({'status': 'ok', 'data': {'data': {'version': 1}}})
        self.assertEqual(api.contract(), {'version': 1})
        command = helper.calls[0]['command']
        self.assertEqual(command[1:], ['/skills/jali/scripts/jali.py', '--event-file', str(self.event), 'request', 'GET', '/api/calculation_contract'])

    def test_query_and_body_are_passed_as_work_files_and_removed_afterwards(self):
        api, helper = self.client({'status': 'ok', 'data': {'data': {'ok': True}}})
        api.preview_cycle('42', {'base': 'fr'}, '2026-11-11T00:00:00Z')
        files = helper.calls[0]['files']
        self.assertEqual(files['--query-file'][1], {'as_of': '2026-11-11T00:00:00Z'})
        self.assertEqual(files['--body-file'][1], {'definition': {'base': 'fr'}})
        for path, _ in files.values():
            self.assertEqual(path.parent, self.work.resolve())
            self.assertFalse(path.exists())

    def test_unset_query_values_send_no_query_file(self):
        api, helper = self.client({'status': 'ok', 'data': {'data': {}}})
        api.context('42')
        self.assertNotIn('--query-file', helper.calls[0]['command'])

    def test_rejected_request_keeps_jala_error_code_and_message(self):
        api, _ = self.client({'status': 'request_rejected', 'http_status': 422, 'error': {'code': 'INVALID_DEFINITION', 'message': 'Unknown node', 'details': {'path': 'overrides.fr'}}})
        with self.assertRaises(client.RemoteApiError) as caught:
            api.preview_cycle('42', {'base': 'fr'})
        self.assertEqual((caught.exception.code, caught.exception.status), ('INVALID_DEFINITION', 422))
        self.assertEqual(caught.exception.details, {'path': 'overrides.fr'})

    def test_helper_refusals_become_api_errors(self):
        api, _ = self.client({'status': 'authentication_required'})
        with self.assertRaises(client.RemoteApiError) as caught:
            api.current('cycle', '42')
        self.assertEqual(caught.exception.code, 'AUTHENTICATION_REQUIRED')

    def test_unknown_write_outcome_requires_reconciliation(self):
        api, _ = self.client({'status': 'request_outcome_unknown'})
        with self.assertRaises(client.MutationOutcomeUnknown):
            api.apply_cycle('42', {'base': 'fr'})

    def test_helper_timeout_is_a_transport_timeout(self):
        api, _ = self.client(subprocess.TimeoutExpired('jali.py', 60))
        with self.assertRaises(client.MutationOutcomeUnknown):
            api.reset_cycle('42')

    def test_paginated_resources_follow_meta_pages(self):
        api, helper = self.client(
            {'status': 'ok', 'data': {'data': [{'id': 1}], 'meta': {'current_page': 1, 'last_page': 2}}},
            {'status': 'ok', 'data': {'data': [{'id': 2}], 'meta': {'current_page': 2, 'last_page': 2}}},
        )
        self.assertEqual(api.farm_cycles('7'), [{'id': 1}, {'id': 2}])
        self.assertEqual([call['files']['--query-file'][1] for call in helper.calls], [{'page': 1}, {'page': 2}])

    def test_default_helper_is_the_sibling_jali_skill(self):
        self.assertEqual(client.DEFAULT_HELPER, SOURCE.parents[2] / 'jali/scripts/jali.py')
        self.assertTrue(client.DEFAULT_HELPER.exists())


if __name__ == '__main__':
    unittest.main()
