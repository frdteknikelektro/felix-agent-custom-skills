"""Small, API-only client for remote BYOP authoring.

This module deliberately contains no prediction interpreter.  JALA owns
calculation, persistence, generated-row cleanup, and result generation; the
client only transports ASTs and verifies safe response properties.
"""

import argparse
from datetime import datetime, timezone
import hashlib
import json
import math
import os
import socket
import sys
import urllib.error
import urllib.parse
import urllib.request


class HttpResponse:
    def __init__(self, status, headers=None, body=b""):
        self.status = status
        self.headers = headers or {}
        self.body = body


class ConfigurationError(Exception):
    pass


class CandidateRequired(Exception):
    pass


class ApprovalRequired(Exception):
    pass


class StaleCalculation(Exception):
    pass


class MutationOutcomeUnknown(Exception):
    pass


class MutationRetryLimitExceeded(Exception):
    pass


class RemoteApiError(Exception):
    def __init__(self, code, message, status=None, details=None):
        self.code = code
        self.status = status
        self.details = details if isinstance(details, dict) else {}
        super().__init__(message)


class TransportTimeout(Exception):
    pass


def normalize_as_of(value):
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValueError("as_of must be an ISO-8601 instant")
    candidate = value[:-1] + "+00:00" if value.endswith("Z") else value
    try:
        parsed = datetime.fromisoformat(candidate)
    except ValueError as error:
        raise ValueError("as_of must be an ISO-8601 instant") from error
    if parsed.tzinfo is None:
        raise ValueError("as_of must include a timezone")
    return parsed.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


class UrllibTransport:
    """Default stdlib transport; tests can replace it with a fake object."""

    def request(self, method, url, headers, body, timeout):
        request = urllib.request.Request(url, data=body, headers=headers, method=method)
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return HttpResponse(response.getcode(), dict(response.headers), response.read())
        except urllib.error.HTTPError as error:
            return HttpResponse(error.code, dict(error.headers or {}), error.read())
        except (socket.timeout, TimeoutError):
            raise TransportTimeout("The JALA API request timed out.")
        except urllib.error.URLError as error:
            if isinstance(error.reason, (socket.timeout, TimeoutError)):
                raise TransportTimeout("The JALA API request timed out.")
            raise


class RemoteCalculationClient:
    """Authenticated transport for the existing unversioned JALA API routes."""

    def __init__(self, api_base_url, transport=None, timeout=30.0):
        self.api_base_url = self._normalize_base(api_base_url)
        access_token = os.environ.get("JALA_BYOP_ACCESS_TOKEN")
        if not access_token:
            raise ConfigurationError("JALA_BYOP_ACCESS_TOKEN is required.")
        self._access_token = access_token
        self.transport = transport or UrllibTransport()
        self.timeout = float(timeout)
        self._confirmed_farm_samples = {}

    @classmethod
    def from_environment(cls, transport=None):
        return cls(
            os.environ.get("JALA_BYOP_API_BASE_URL"),
            transport=transport,
        )

    def __repr__(self):
        return "RemoteCalculationClient(api_base_url={!r}, timeout={!r})".format(
            self.api_base_url, self.timeout
        )

    @staticmethod
    def _normalize_base(api_base_url):
        if not api_base_url:
            raise ConfigurationError("JALA_BYOP_API_BASE_URL is required.")
        parsed = urllib.parse.urlparse(api_base_url)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            raise ConfigurationError("JALA_BYOP_API_BASE_URL must be an absolute HTTP(S) URL.")
        path = parsed.path.rstrip("/")
        if path != "/api" and not path.endswith("/api"):
            raise ConfigurationError("JALA_BYOP_API_BASE_URL must include the /api prefix.")
        return urllib.parse.urlunparse((parsed.scheme, parsed.netloc, path, "", "", ""))

    def _request(self, method, path, query=None, payload=None, unwrap_data=True):
        url = self.api_base_url + "/" + path.lstrip("/")
        if query:
            encoded = urllib.parse.urlencode(
                [(key, value) for key, value in query.items() if value is not None]
            )
            if encoded:
                url += "?" + encoded

        body = None
        headers = {
            "Accept": "application/json",
            "Authorization": "Bearer " + self._access_token,
        }
        if payload is not None:
            body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
            headers["Content-Type"] = "application/json"

        try:
            response = self.transport.request(method, url, headers, body, self.timeout)
        except (TransportTimeout, socket.timeout, TimeoutError) as error:
            raise TransportTimeout(str(error) or "The JALA API request timed out.")
        except Exception as error:
            # Do not expose transport internals, request bodies, or headers.
            raise RemoteApiError("NETWORK_ERROR", "The JALA API request failed.") from error

        decoded = self._decode(response.body)
        if response.status < 200 or response.status >= 300:
            error = decoded.get("error", {}) if isinstance(decoded, dict) else {}
            code = error.get("code") if isinstance(error, dict) else None
            message = error.get("message") if isinstance(error, dict) else None
            raise RemoteApiError(
                code or "HTTP_ERROR",
                message or "The JALA API request failed.",
                response.status,
                error.get("details") if isinstance(error, dict) else {},
            )

        if unwrap_data and isinstance(decoded, dict) and "data" in decoded:
            return decoded["data"]
        return decoded

    @staticmethod
    def _decode(body):
        if not body:
            return {}
        try:
            decoded = json.loads(body.decode("utf-8") if isinstance(body, bytes) else body)
        except (ValueError, UnicodeDecodeError) as error:
            raise RemoteApiError("INVALID_RESPONSE", "The JALA API returned an invalid response.") from error
        return decoded

    @staticmethod
    def _scope_path(scope, target_id, suffix="calculation"):
        if scope not in ("farm", "cycle"):
            raise ValueError("scope must be 'farm' or 'cycle'")
        resource = "farms" if scope == "farm" else "cycles"
        return "{}/{}/{}".format(resource, target_id, suffix)

    def contract(self):
        return self._request("GET", "calculation/contract")

    def resource(self, path, query=None):
        return self._request("GET", path, query)

    def resource_page(self, path, query=None, page=1):
        query = dict(query or {})
        query["page"] = page
        return self._request("GET", path, query, unwrap_data=False)

    def resources(self, path, query=None):
        rows = []
        page = 1
        while True:
            response = self.resource_page(path, query, page)
            if isinstance(response, list):
                rows.extend(response)
                break
            if not isinstance(response, dict):
                raise RemoteApiError("INVALID_RESPONSE", "The resource endpoint returned an invalid page.")
            page_rows = response.get("data")
            if not isinstance(page_rows, list):
                raise RemoteApiError("INVALID_RESPONSE", "The resource endpoint returned malformed rows.")
            rows.extend(page_rows)
            meta = response.get("meta", {})
            current = meta.get("current_page", page)
            last = meta.get("last_page", current)
            if current >= last:
                break
            page = current + 1
        return rows

    def resolve_target(self, scope, identifier=None, search=None):
        """Resolve exactly one authorized target without broad enumeration."""
        if scope not in ("farm", "cycle"):
            raise ValueError("scope must be 'farm' or 'cycle'")
        if identifier is None and not search:
            raise ValueError("an exact target identifier or narrow search is required")

        if identifier is not None:
            target_id = self._target_id_from_identifier(scope, identifier)
            resource = self.current(scope, target_id)
            return {"scope": scope, "target_id": target_id, "resource": resource}

        if not isinstance(search, dict) or not search:
            raise ValueError("target search must contain narrow filters")
        rows = self.farms(search) if scope == "farm" else self.resources("cycles", search)
        if not rows:
            raise RemoteApiError("TARGET_NOT_FOUND", "No authorized target matched the supplied search.")
        if len(rows) > 1:
            candidates = [row.get("id") for row in rows[:5] if isinstance(row, dict) and row.get("id") is not None]
            raise RemoteApiError(
                "AMBIGUOUS_TARGET",
                "More than one authorized target matched the supplied search.",
                details={"candidate_ids": candidates},
            )
        row = rows[0]
        if not isinstance(row, dict) or row.get("id") is None:
            raise RemoteApiError("INVALID_RESPONSE", "The target search returned an invalid resource.")
        return {"scope": scope, "target_id": row["id"], "resource": row}

    def _target_id_from_identifier(self, scope, identifier):
        if not isinstance(identifier, (str, int)):
            raise ValueError("target identifier must be an ID or API URL")
        if isinstance(identifier, int) or str(identifier).isdigit():
            return str(identifier)

        parsed = urllib.parse.urlparse(str(identifier))
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            raise ValueError("target identifier must be an ID or absolute API URL")
        path = parsed.path.rstrip("/").split("/")
        resource = "farms" if scope == "farm" else "cycles"
        try:
            resource_index = path.index(resource)
            target_id = path[resource_index + 1]
        except (ValueError, IndexError):
            raise ValueError("target URL does not identify the requested scope")
        if not target_id or not target_id.isdigit():
            raise ValueError("target URL does not identify a numeric target")
        return target_id

    def farms(self, query=None):
        return self.resources("farms", query)

    def farm_cycles(self, farm_id, query=None):
        return self.resources("farms/{}/cycles".format(farm_id), query)

    def farm_ponds(self, farm_id, query=None):
        return self.resources("farms/{}/ponds".format(farm_id), query)

    def farm_batches(self, farm_id, query=None):
        return self.resources("farms/{}/batches".format(farm_id), query)

    def batch_cycles(self, batch_id, query=None):
        return self.resources("batches/{}/cycles".format(batch_id), query)

    def confirm_farm_samples(self, farm_id, cycles):
        selected = select_representative_cycles(cycles)
        if not selected:
            raise ValueError("farm behavioral approval requires confirmed real representative cycles")
        for cycle in selected:
            cycle_id = cycle["id"]
            resource = self.resource("cycles/{}".format(cycle_id))
            if not isinstance(resource, dict) or str(resource.get("farm_id")) != str(farm_id):
                raise RemoteApiError("INVALID_CONTEXT_SELECTION", "A representative cycle is outside the farm.")
            current = self.current("cycle", cycle_id)
            if isinstance(current, dict) and current.get("effective", {}).get("source") == "cycle":
                raise RemoteApiError("CYCLE_CALCULATION_CONFLICT", "A cycle-owned calculation cannot represent farm behavior.")
        self._confirmed_farm_samples[str(farm_id)] = {str(cycle["id"]) for cycle in selected}
        return selected

    def assert_confirmed_farm_samples(self, farm_id, cycle_ids):
        requested = {str(cycle_id) for cycle_id in cycle_ids}
        confirmed = self._confirmed_farm_samples.get(str(farm_id), set())
        if not requested or not requested.issubset(confirmed):
            raise RemoteApiError(
                "UNCONFIRMED_CONTEXT_SELECTION",
                "Farm preview requires representative cycles confirmed through the farm sample workflow.",
            )

    def current(self, scope, target_id):
        return self._request("GET", self._scope_path(scope, target_id))

    def context(self, cycle_id, as_of=None):
        return self._request(
            "GET", "cycles/{}/calculation/context".format(cycle_id), {"as_of": normalize_as_of(as_of)}
        )

    def preview_cycle(self, cycle_id, definition, as_of=None):
        return self._request(
            "POST",
            "cycles/{}/calculation/preview".format(cycle_id),
            {"as_of": normalize_as_of(as_of)},
            {"definition": definition},
        )

    def preview_farm(self, farm_id, definition, cycle_ids, as_of=None):
        cycle_ids = list(cycle_ids)
        if not 1 <= len(cycle_ids) <= 3 or len(set(cycle_ids)) != len(cycle_ids):
            raise ValueError("farm preview requires one to three distinct representative cycles")
        self.assert_confirmed_farm_samples(farm_id, cycle_ids)
        return self._request(
            "POST",
            "farms/{}/calculation/preview".format(farm_id),
            {"as_of": normalize_as_of(as_of)},
            {"definition": definition, "cycle_ids": cycle_ids},
        )

    def preview_current(self, scope, target_id, cycle_ids=None, as_of=None, current=None):
        current = current if current is not None else self.current(scope, target_id)
        effective = current.get("effective", {}) if isinstance(current, dict) else {}
        definition = effective.get("ast")
        if definition is None:
            raise RemoteApiError("INVALID_RESPONSE", "The current calculation has no previewable AST.")
        if scope == "cycle":
            return self.preview_cycle(target_id, definition, as_of)
        return self.preview_farm(target_id, definition, cycle_ids or [], as_of)

    def _mutation(self, method, path, definition=None):
        try:
            return self._request(
                method,
                path,
                payload={"definition": definition} if definition is not None else None,
            )
        except (TransportTimeout, socket.timeout, TimeoutError) as error:
            raise MutationOutcomeUnknown(
                "The mutation timed out; reconcile the effective definition before retrying."
            ) from error

    def apply_cycle(self, cycle_id, definition):
        return self._mutation("PUT", "cycles/{}/calculation".format(cycle_id), definition)

    def apply_farm(self, farm_id, definition):
        return self._mutation("PUT", "farms/{}/calculation".format(farm_id), definition)

    def reset_cycle(self, cycle_id):
        return self._mutation("DELETE", "cycles/{}/calculation".format(cycle_id))

    def reset_farm(self, farm_id):
        return self._mutation("DELETE", "farms/{}/calculation".format(farm_id))

    def result_page(self, cycle_id, series, page=1):
        paths = {
            "prediction": "cycle_predictions",
            "target": "cycle_targets",
            "actual": "cycle_actuals",
        }
        if series not in paths:
            raise ValueError("series must be prediction, target, or actual")
        return self._request(
            "GET",
            "cycles/{}/{}".format(cycle_id, paths[series]),
            {"page": page},
            unwrap_data=False,
        )

    def result_series(self, cycle_id, series):
        rows = []
        page = 1
        while True:
            response = self.result_page(cycle_id, series, page)
            if isinstance(response, list):
                rows.extend(response)
                break
            if not isinstance(response, dict):
                raise RemoteApiError("INVALID_RESPONSE", "The result endpoint returned an invalid page.")
            rows.extend(response.get("data", []))
            meta = response.get("meta", {})
            current = meta.get("current_page", page)
            last = meta.get("last_page", current)
            if current >= last:
                break
            page = current + 1
        return rows


def select_representative_cycles(cycles):
    """Select confirmed real farm samples by the agreed evidence roles."""
    candidates = [
        cycle for cycle in cycles
        if isinstance(cycle, dict)
        and cycle.get("id") is not None
        and cycle.get("confirmed") is True
        and cycle.get("is_real") is True
    ]
    selected = []

    def choose(predicate):
        for cycle in candidates:
            if cycle.get("id") not in {item.get("id") for item in selected} and predicate(cycle):
                selected.append(cycle)
                return cycle
        return None

    choose(lambda cycle: cycle.get("sample_role") == "recent_unfinished_inheriting")
    choose(lambda cycle: cycle.get("sample_role") == "finished_strong_events")
    choose(lambda cycle: cycle.get("sample_role") == "edge_case")
    return selected[:3]


class AuthoringLoop:
    """Approval-gated state machine for an unlimited authoring/re-preview loop."""

    MAX_FARM_SAMPLE_CYCLES = 3
    MAX_MUTATION_ATTEMPTS = 2

    def __init__(self, client):
        self.client = client
        self.scope = None
        self.target_id = None
        self.cycle_ids = []
        self.as_of = None
        self.baseline = None
        self.baseline_preview = None
        self.contexts = {}
        self.contract_payload = None
        self.candidate = None
        self._approval = None
        self._mutation_attempts = {"apply": 0, "reset": 0}
        self._last_mutation = None

    def set_target(self, scope, target_id, cycle_ids=None, as_of=None):
        if scope not in ("farm", "cycle"):
            raise ValueError("scope must be 'farm' or 'cycle'")
        as_of = normalize_as_of(as_of)
        cycle_ids = list(cycle_ids or [])
        if scope == "cycle":
            cycle_ids = [target_id]
        elif cycle_ids:
            self._validate_sample_ids(cycle_ids, target_id, scope)
        self.scope = scope
        self.target_id = target_id
        self.cycle_ids = cycle_ids
        self.as_of = as_of
        self._invalidate()

    def set_as_of(self, as_of):
        self.as_of = normalize_as_of(as_of)
        self._invalidate()

    def set_sample(self, cycle_ids):
        if self.scope != "farm":
            raise ValueError("representative samples apply only to farm scope")
        cycle_ids = list(cycle_ids)
        if not 1 <= len(cycle_ids) <= self.MAX_FARM_SAMPLE_CYCLES:
            raise ValueError("farm scope requires one to three representative cycles")
        if len(set(cycle_ids)) != len(cycle_ids):
            raise ValueError("farm scope requires distinct representative cycles")
        self._validate_sample_ids(cycle_ids)
        self.cycle_ids = cycle_ids
        self._invalidate()

    def set_confirmed_sample(self, cycles):
        if self.scope != "farm":
            raise ValueError("representative samples apply only to farm scope")
        selected = self.client.confirm_farm_samples(self.target_id, cycles)
        self.set_sample([cycle["id"] for cycle in selected])
        return selected

    def _invalidate(self):
        self.baseline = None
        self.baseline_preview = None
        self.contexts = {}
        self.contract_payload = None
        self.candidate = None
        self._approval = None
        self._mutation_attempts = {"apply": 0, "reset": 0}
        self._last_mutation = None

    def _validate_sample_ids(self, cycle_ids, farm_id=None, scope=None):
        if (scope if scope is not None else self.scope) != "farm":
            return
        if not 1 <= len(cycle_ids) <= self.MAX_FARM_SAMPLE_CYCLES:
            raise ValueError("farm scope requires one to three representative cycles")
        if len(set(cycle_ids)) != len(cycle_ids):
            raise ValueError("farm scope requires distinct representative cycles")
        self.client.assert_confirmed_farm_samples(farm_id if farm_id is not None else self.target_id, cycle_ids)

    def _record_baseline(self, payload):
        effective = payload.get("effective", {}) if isinstance(payload, dict) else {}
        if not isinstance(effective, dict) or not effective.get("definition_hash"):
            raise ValueError("baseline must include effective.definition_hash")
        self.baseline = {
            "scope": self.scope,
            "target_id": self.target_id,
            "cycle_ids": list(self.cycle_ids),
            "as_of": self.as_of,
            "source": effective.get("source"),
            "definition_hash": effective.get("definition_hash"),
            "runtime_version": effective.get("runtime_version"),
        }
        self._approval = None
        self._mutation_attempts = {"apply": 0, "reset": 0}
        self._last_mutation = None

    def read_baseline(self):
        if self.scope is None or self.target_id is None:
            raise ValueError("set a target before reading a baseline")
        if self.scope == "farm":
            self._validate_sample_ids(self.cycle_ids)
        self.contract_payload = self.client.contract()
        self.contexts = {}
        context_cycle_ids = [self.target_id] if self.scope == "cycle" else list(self.cycle_ids)
        for cycle_id in context_cycle_ids:
            context = self.client.context(cycle_id, self.as_of)
            self.contexts[str(cycle_id)] = context
            returned_as_of = self._context_as_of(context)
            if self.as_of is None and returned_as_of is not None:
                self.as_of = returned_as_of
        payload = self.client.current(self.scope, self.target_id)
        self.baseline_preview = self.client.preview_current(
            self.scope, self.target_id, self.cycle_ids, self.as_of, current=payload
        )
        if not self._preview_succeeded(self.baseline_preview):
            raise RemoteApiError("PREVIEW_FAILED", "The current calculation baseline did not produce all three series.")
        returned_as_of = self._preview_as_of(self.baseline_preview)
        if self.as_of is None:
            if returned_as_of is None:
                raise RemoteApiError("INVALID_RESPONSE", "The baseline preview did not return as_of.")
            self.as_of = returned_as_of
        elif returned_as_of is not None and returned_as_of != self.as_of:
            raise StaleCalculation("The baseline preview used a different calculation input snapshot.")
        self._record_baseline(payload)
        return {"current": payload, "preview": self.baseline_preview}

    @staticmethod
    def _context_as_of(payload):
        if isinstance(payload, dict) and payload.get("as_of") is not None:
            return normalize_as_of(payload["as_of"])
        return None

    @staticmethod
    def _preview_as_of(payload):
        if isinstance(payload, dict) and payload.get("as_of") is not None:
            return normalize_as_of(payload["as_of"])
        for cycle in (payload.get("cycles", []) if isinstance(payload, dict) else []):
            if isinstance(cycle, dict) and cycle.get("as_of") is not None:
                return normalize_as_of(cycle["as_of"])
        return None

    def record_candidate(self, payload, definition=None):
        if not isinstance(payload, dict) or not payload.get("definition_hash"):
            raise ValueError("candidate must include definition_hash")
        if not self._preview_succeeded(payload):
            raise ValueError("candidate preview must succeed for prediction, target, and actual calculation series")
        candidate_as_of = self._preview_as_of(payload)
        if self.as_of is None and candidate_as_of is not None:
            self.as_of = candidate_as_of
            if self.baseline is not None:
                self.baseline["as_of"] = candidate_as_of
        elif candidate_as_of is not None and candidate_as_of != self.as_of:
            raise ValueError("candidate preview as_of does not match the active iteration")
        stored_definition = definition
        if stored_definition is None:
            stored_definition = payload.get("definition", payload.get("ast"))
        self.candidate = {
            "definition_hash": payload["definition_hash"],
            "runtime_version": payload.get("runtime_version"),
            "definition": stored_definition,
            "payload": payload,
            "scope": self.scope,
            "target_id": self.target_id,
            "cycle_ids": list(self.cycle_ids),
            "as_of": self.as_of,
        }
        self._approval = None
        self._mutation_attempts = {"apply": 0, "reset": 0}
        self._last_mutation = None

    def preview_candidate(self, definition):
        if self.scope is None or self.target_id is None:
            raise ValueError("set a target before previewing")
        if self.baseline is None:
            raise ApprovalRequired("Read the current effective calculation before previewing a candidate.")
        if self.scope == "cycle":
            payload = self.client.preview_cycle(self.target_id, definition, self.as_of)
        else:
            payload = self.client.preview_farm(self.target_id, definition, self.cycle_ids, self.as_of)
        self.record_candidate(payload, definition)
        return payload

    def repreview_candidate(self):
        if self.candidate is None or self.candidate.get("definition") is None:
            raise CandidateRequired("A candidate AST is required for re-preview.")
        self.read_baseline()
        return self.preview_candidate(self.candidate["definition"])

    @classmethod
    def _preview_succeeded(cls, payload):
        series = payload.get("series")
        if isinstance(series, dict):
            required = {"prediction", "target", "actual"}
            return required.issubset(series) and all(
                isinstance(series[name], dict) and series[name].get("status") == "succeeded"
                for name in required
            )
        cycles = payload.get("cycles")
        if isinstance(cycles, list) and cycles:
            return all(cls._preview_succeeded(cycle) for cycle in cycles)
        return False

    def approve(self, action):
        if action not in ("apply", "reset"):
            raise ValueError("action must be apply or reset")
        if self.baseline is None:
            raise ApprovalRequired("Read and record the current effective calculation first.")
        if action == "apply" and self.candidate is None:
            raise ApprovalRequired("Preview and record a candidate before applying it.")
        self._approval = self._fingerprint(action)

    def assert_approved(self, action):
        if self._approval != self._fingerprint(action):
            raise ApprovalRequired("Explicit approval is required for the current target and candidate.")

    def _fingerprint(self, action):
        value = {
            "action": action,
            "scope": self.scope,
            "target_id": self.target_id,
            "cycle_ids": self.cycle_ids,
            "as_of": self.as_of,
            "baseline": self.baseline,
            "candidate": self.candidate and self.candidate["definition_hash"],
        }
        return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":")).encode("utf-8")).hexdigest()

    def _check_current(self):
        current = self.client.current(self.scope, self.target_id)
        effective = current.get("effective", {}) if isinstance(current, dict) else {}
        expected = self.baseline or {}
        if (
            (current.get("scope") if isinstance(current, dict) else None) != expected.get("scope")
            or self.target_id != expected.get("target_id")
            or effective.get("definition_hash") != expected.get("definition_hash")
            or effective.get("source") != expected.get("source")
        ):
            self._approval = None
            raise StaleCalculation("The effective calculation changed after approval; preview again.")
        return current

    def _begin_mutation(self, action):
        attempts = self._mutation_attempts.get(action, 0)
        if attempts >= self.MAX_MUTATION_ATTEMPTS:
            raise MutationRetryLimitExceeded(
                "The mutation retry limit was reached; start a fresh authoring iteration before retrying."
            )
        self._mutation_attempts[action] = attempts + 1

    def apply(self):
        self.assert_approved("apply")
        self._check_current()
        if self.candidate.get("definition") is None:
            raise CandidateRequired("The candidate AST is required for apply.")
        self._begin_mutation("apply")
        if self.scope == "cycle":
            result = self.client.apply_cycle(self.target_id, self.candidate["definition"])
        else:
            result = self.client.apply_farm(self.target_id, self.candidate["definition"])
        self._approval = None
        return result

    def reset(self):
        self.assert_approved("reset")
        self._check_current()
        self._begin_mutation("reset")
        if self.scope == "cycle":
            result = self.client.reset_cycle(self.target_id)
        else:
            result = self.client.reset_farm(self.target_id)
        self._approval = None
        effective = result.get("effective", {}) if isinstance(result, dict) else {}
        self._last_mutation = {
            "action": "reset",
            "expected": {
                "scope": result.get("scope", self.scope) if isinstance(result, dict) else self.scope,
                "source": effective.get("source"),
                "runtime_version": effective.get("runtime_version"),
                "definition_hash": effective.get("definition_hash"),
            },
            "definition": effective.get("ast"),
        }
        self._last_mutation["preview"] = self.client.preview_current(
            self.scope, self.target_id, self.cycle_ids, self.as_of, current=result
        )
        return result

    def verify(self, expected=None):
        if self._last_mutation and self._last_mutation.get("action") == "reset":
            reset = self._last_mutation
            return verify_applied(
                self.client,
                self.scope,
                self.target_id,
                expected or reset["expected"],
                reset["preview"],
                self.cycle_ids,
                definition=reset.get("definition"),
                as_of=self.as_of,
            )
        if self.candidate is None:
            raise CandidateRequired("A candidate is required for verification.")
        return verify_applied(
            self.client,
            self.scope,
            self.target_id,
            expected,
            self.candidate["payload"],
            self.cycle_ids,
            definition=self.candidate.get("definition"),
            as_of=self.as_of,
        )

    def reconcile_timeout(self, observed_payload, desired_hash, fallback_hash=None):
        previous_hash = (self.baseline or {}).get("definition_hash")
        status = self._reconcile_timeout(observed_payload, desired_hash, previous_hash, fallback_hash)
        self._approval = None
        return status

    @staticmethod
    def _reconcile_timeout(observed_payload, desired_hash, previous_hash=None, fallback_hash=None):
        effective = observed_payload.get("effective", {}) if isinstance(observed_payload, dict) else {}
        observed_hash = effective.get("definition_hash") if isinstance(effective, dict) else None
        if observed_hash == desired_hash:
            return "applied"
        if (previous_hash and observed_hash == previous_hash) or (fallback_hash and observed_hash == fallback_hash):
            return "not_applied"
        return "indeterminate"


_PERSISTENCE_FIELDS = {
    "id", "uuid", "created_at", "updated_at", "deleted_at", "cycle_id", "farm_id"
}


def _representative_indexes(length):
    if length <= 0:
        return []
    return sorted(set((0, length // 2, length - 1)))


def _same_value(left, right):
    if left is None or right is None:
        return left is right
    if isinstance(left, (int, float)) and isinstance(right, (int, float)):
        return math.isclose(float(left), float(right), rel_tol=1e-7, abs_tol=1e-9)
    return left == right


def _aggregate_status(results):
    statuses = [result["status"] for result in results.values()]
    if "failed" in statuses:
        return "failed"
    if "passed_with_warnings" in statuses:
        return "passed_with_warnings"
    return "passed"


def verify_series(preview, generated_rows):
    """Verify structure and representative values, never recompute predictions."""
    if "series" in preview and isinstance(generated_rows, dict):
        results = {
            name: verify_series(preview.get("series", {}).get(name, {}), generated_rows.get(name, []))
            for name in ("prediction", "target", "actual")
        }
        return {
            "status": _aggregate_status(results),
            "failures": sorted({failure for result in results.values() for failure in result["failures"]}),
            "warnings": sorted({warning for result in results.values() for warning in result["warnings"]}),
            "series": results,
        }
    failures = []
    warnings = []
    if not isinstance(preview, dict) or preview.get("status") != "succeeded":
        return {"status": "failed", "failures": ["preview_failed"], "warnings": []}
    expected_rows = preview.get("rows")
    if not isinstance(expected_rows, list) or not isinstance(generated_rows, list):
        return {"status": "failed", "failures": ["malformed_rows"], "warnings": []}
    if len(expected_rows) != len(generated_rows):
        failures.append("row_count")

    expected_coverage = [
        (row.get("age"), row.get("date")) if isinstance(row, dict) else (None, None)
        for row in expected_rows
    ]
    generated_coverage = [
        (row.get("age"), row.get("date")) if isinstance(row, dict) else (None, None)
        for row in generated_rows
    ]
    if expected_coverage != generated_coverage:
        failures.append("coverage")

    for index in range(min(len(expected_rows), len(generated_rows))):
        expected = expected_rows[index]
        actual = generated_rows[index]
        if not isinstance(expected, dict) or not isinstance(actual, dict):
            failures.append("malformed_rows")
            continue
        required = set(expected.keys()) - _PERSISTENCE_FIELDS
        missing = sorted(required - set(actual.keys()))
        if missing:
            failures.append("missing_fields:{}".format(",".join(missing)))
            continue
        for key in required:
            if (expected.get(key) is None) != (actual.get(key) is None):
                failures.append("null_behavior:{}".format(key))

    for index in _representative_indexes(min(len(expected_rows), len(generated_rows))):
        expected = expected_rows[index]
        actual = generated_rows[index]
        if not isinstance(expected, dict) or not isinstance(actual, dict):
            continue
        required = set(expected.keys()) - _PERSISTENCE_FIELDS
        missing = sorted(required - set(actual.keys()))
        if missing:
            continue
        for key in required - {"age", "date"}:
            if expected.get(key) is not None and actual.get(key) is not None and not _same_value(expected.get(key), actual.get(key)):
                warnings.append("representative_value_drift:{}:{}".format(index, key))

    return {
        "status": "failed" if failures else ("passed_with_warnings" if warnings else "passed"),
        "failures": sorted(set(failures)),
        "warnings": sorted(set(warnings)),
    }


def _generated_cycle_series(client, cycle_id):
    return {
        series: client.result_series(cycle_id, series)
        for series in ("prediction", "target", "actual")
    }


def verify_cycle(client, cycle_id, preview, generated_rows=None):
    generated_rows = generated_rows or _generated_cycle_series(client, cycle_id)
    results = {}
    for series in ("prediction", "target", "actual"):
        results[series] = verify_series(preview.get("series", {}).get(series, {}), generated_rows.get(series, []))
    return {"status": _aggregate_status(results), "series": results}


def verify_effective(current, expected):
    """Check identity evidence without inspecting or recalculating row values."""
    effective = current.get("effective", {}) if isinstance(current, dict) else {}
    expected = expected if isinstance(expected, dict) else {}
    checks = {
        "scope": current.get("scope") if isinstance(current, dict) else None,
        "source": effective.get("source") if isinstance(effective, dict) else None,
        "runtime_version": effective.get("runtime_version") if isinstance(effective, dict) else None,
        "definition_hash": effective.get("definition_hash") if isinstance(effective, dict) else None,
    }
    failures = [
        "effective_{}".format(name)
        for name, actual in checks.items()
        if expected.get(name) is None or actual != expected.get(name)
    ]
    return {
        "status": "failed" if failures else "passed",
        "failures": failures,
        "warnings": [],
        "effective": checks,
    }


def verify_applied(client, scope, target_id, expected, preview, cycle_ids=None, definition=None, as_of=None):
    """Verify effective identity and every approved cycle's three series."""
    if scope == "farm":
        client.assert_confirmed_farm_samples(target_id, cycle_ids or [])
    identity = verify_effective(client.current(scope, target_id), expected)
    cycles = {}
    generated_rows = {}
    if scope == "cycle":
        generated_rows[str(target_id)] = _generated_cycle_series(client, target_id)
        cycles[str(target_id)] = verify_cycle(client, target_id, preview, generated_rows[str(target_id)])
    else:
        preview_cycles = {
            str(item.get("cycle_id")): item
            for item in (preview.get("cycles", []) if isinstance(preview, dict) else [])
            if isinstance(item, dict) and item.get("cycle_id") is not None
        }
        for cycle_id in cycle_ids or []:
            cycle_preview = preview_cycles.get(str(cycle_id), {})
            generated_rows[str(cycle_id)] = _generated_cycle_series(client, cycle_id)
            cycles[str(cycle_id)] = verify_cycle(client, cycle_id, cycle_preview, generated_rows[str(cycle_id)])

    failures = list(identity["failures"])
    warnings = list(identity["warnings"])
    for result in cycles.values():
        failures.extend(result.get("failures", []))
        warnings.extend(result.get("warnings", []))
        for series_result in result.get("series", {}).values():
            failures.extend(series_result.get("failures", []))
            warnings.extend(series_result.get("warnings", []))
    status = "failed" if failures else ("passed_with_warnings" if warnings else "passed")
    result = {
        "status": status,
        "failures": sorted(set(failures)),
        "warnings": sorted(set(warnings)),
        "effective": identity["effective"],
        "cycles": cycles,
    }
    if warnings:
        selected_cycles = [target_id] if scope == "cycle" else list(cycle_ids or [])
        frozen_as_of = normalize_as_of(as_of)
        if frozen_as_of is None and isinstance(preview, dict):
            frozen_as_of = normalize_as_of(preview.get("as_of")) if preview.get("as_of") else None
        contexts = {}
        for cycle_id in selected_cycles:
            context = client.context(cycle_id, frozen_as_of)
            contexts[str(cycle_id)] = context
            if frozen_as_of is None and isinstance(context, dict) and context.get("as_of"):
                frozen_as_of = normalize_as_of(context["as_of"])
        refreshed_preview = None
        if definition is not None:
            if scope == "cycle":
                refreshed_preview = client.preview_cycle(target_id, definition, frozen_as_of)
            else:
                refreshed_preview = client.preview_farm(target_id, definition, selected_cycles, frozen_as_of)
        refreshed_cycles = {}
        if scope == "cycle" and refreshed_preview is not None:
            refreshed_cycles[str(target_id)] = verify_cycle(
                client, target_id, refreshed_preview, generated_rows[str(target_id)]
            )
        elif scope == "farm" and refreshed_preview is not None:
            refreshed_preview_cycles = {
                str(item.get("cycle_id")): item
                for item in refreshed_preview.get("cycles", [])
                if isinstance(item, dict) and item.get("cycle_id") is not None
            }
            for cycle_id in selected_cycles:
                refreshed_cycles[str(cycle_id)] = verify_cycle(
                    client,
                    cycle_id,
                    refreshed_preview_cycles.get(str(cycle_id), {}),
                    generated_rows.get(str(cycle_id), {}),
                )
        recheck_failures = []
        recheck_warnings = []
        for cycle_result in refreshed_cycles.values():
            recheck_failures.extend(cycle_result.get("failures", []))
            recheck_warnings.extend(cycle_result.get("warnings", []))
            for series_result in cycle_result.get("series", {}).values():
                recheck_failures.extend(series_result.get("failures", []))
                recheck_warnings.extend(series_result.get("warnings", []))
        recheck_status = "explained" if refreshed_cycles and not recheck_failures and not recheck_warnings else "unexplained"
        result["warning_recheck"] = {
            "status": recheck_status,
            "as_of": frozen_as_of,
            "contexts": contexts,
            "preview": refreshed_preview,
            "cycles": refreshed_cycles,
        }
        if recheck_status == "explained":
            result["drift"] = "confirmed_live_data_drift"
        else:
            result["status"] = "failed"
            result["failures"] = sorted(set(result["failures"] + ["unexplained_verification_drift"] + recheck_failures))
    return result


def _read_json_stdin():
    try:
        return json.load(sys.stdin)
    except ValueError as error:
        raise ConfigurationError("stdin must contain a JSON object") from error


def main(argv=None):
    parser = argparse.ArgumentParser(description="Author Jala BYOP calculations through the stateless API")
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("contract")

    resolve = subparsers.add_parser("resolve_target")
    resolve.add_argument("scope", choices=["farm", "cycle"])
    resolve.add_argument("identifier", nargs="?")
    resolve.add_argument("--search", action="store_true")

    current = subparsers.add_parser("current")
    current.add_argument("scope", choices=["farm", "cycle"])
    current.add_argument("target_id")

    context = subparsers.add_parser("context")
    context.add_argument("cycle_id")
    context.add_argument("--as-of")

    preview = subparsers.add_parser("preview")
    preview.add_argument("scope", choices=["farm", "cycle"])
    preview.add_argument("target_id")
    preview.add_argument("--as-of")
    preview.add_argument("--cycle-id", action="append", dest="cycle_ids")

    series = subparsers.add_parser("series")
    series.add_argument("cycle_id")
    series.add_argument("series", choices=["prediction", "target", "actual"])

    verify = subparsers.add_parser("verify")
    verify.add_argument("scope", choices=["farm", "cycle"])
    verify.add_argument("target_id")
    verify.add_argument("--cycle-id", action="append", dest="cycle_ids")

    args = parser.parse_args(argv)
    client = RemoteCalculationClient.from_environment()
    if args.command == "contract":
        result = client.contract()
    elif args.command == "resolve_target":
        if args.search:
            if args.identifier is not None:
                parser.error("resolve_target --search reads its narrow filters from stdin and takes no identifier")
            result = client.resolve_target(args.scope, search=_read_json_stdin())
        else:
            result = client.resolve_target(args.scope, identifier=args.identifier)
    elif args.command == "current":
        result = client.current(args.scope, args.target_id)
    elif args.command == "context":
        result = client.context(args.cycle_id, args.as_of)
    elif args.command == "series":
        result = client.result_series(args.cycle_id, args.series)
    elif args.command == "verify":
        evidence = _read_json_stdin()
        if args.scope == "farm":
            samples = evidence.get("samples")
            if not isinstance(samples, list):
                raise ValueError("farm verification evidence must include confirmed sample objects")
            client.confirm_farm_samples(args.target_id, samples)
        result = verify_applied(
            client,
            args.scope,
            args.target_id,
            evidence.get("expected", {}),
            evidence.get("preview", {}),
            args.cycle_ids,
            definition=evidence.get("definition"),
            as_of=evidence.get("as_of"),
        )
    else:
        definition = _read_json_stdin()
        if args.scope == "cycle":
            result = client.preview_cycle(args.target_id, definition, args.as_of)
        else:
            if not isinstance(definition, dict) or "definition" not in definition or "samples" not in definition:
                raise ValueError("farm preview input must include definition and confirmed samples")
            client.confirm_farm_samples(args.target_id, definition["samples"])
            definition = definition["definition"]
            result = client.preview_farm(args.target_id, definition, args.cycle_ids or [], args.as_of)
    print(json.dumps(result, sort_keys=True))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (
        ConfigurationError,
        ValueError,
        RemoteApiError,
        ApprovalRequired,
        CandidateRequired,
        StaleCalculation,
        MutationOutcomeUnknown,
        MutationRetryLimitExceeded,
    ) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)

