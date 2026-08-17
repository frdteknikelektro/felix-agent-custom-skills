#!/usr/bin/env python3
"""Send one authenticated, workspace-scoped Crisp REST API request."""

from __future__ import annotations

import argparse
import base64
import json
import os
import sys
import time
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qsl, quote, urlencode, urlsplit, urlunsplit
from urllib.request import Request, urlopen


METHODS = ("GET", "HEAD", "POST", "PUT", "PATCH", "DELETE")
PROTECTED_HEADERS = {
    "authorization",
    "connection",
    "content-length",
    "cookie",
    "host",
    "transfer-encoding",
    "x-crisp-tier",
}


def make_parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(
        description="Call a Crisp REST API route with Felix-managed auth and headers."
    )
    result.add_argument("method", choices=METHODS, help="HTTP method")
    result.add_argument(
        "path",
        help="Workspace-scoped path beginning with /v1/website/{CRISP_WEBSITE_ID}",
    )
    result.add_argument(
        "--query",
        action="append",
        default=[],
        metavar="NAME=VALUE",
        help="Additional query parameter; may be repeated",
    )
    body = result.add_mutually_exclusive_group()
    body.add_argument("--json", help="JSON request body")
    body.add_argument(
        "--json-file",
        metavar="PATH",
        help="Read a JSON request body from PATH, or '-' for stdin",
    )
    result.add_argument(
        "--header",
        action="append",
        default=[],
        metavar="NAME: VALUE",
        help="Additional non-auth, non-secret header; may be repeated",
    )
    result.add_argument(
        "--max-retries",
        type=int,
        default=2,
        help="Retries for explicit HTTP 420/429 responses (default: 2 for reads)",
    )
    result.add_argument(
        "--retry-mutations",
        action="store_true",
        help="Also retry POST/PUT/PATCH/DELETE after explicit HTTP 420/429 responses",
    )
    result.add_argument("--timeout", type=float, default=30.0, help="Request timeout in seconds")
    return result


def env_required(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise ValueError(f"missing required environment variable: {name}")
    return value


def parse_header(value: str) -> tuple[str, str]:
    name, separator, content = value.partition(":")
    name = name.strip()
    if not separator or not name:
        raise ValueError(f"invalid header format: {value!r}; expected NAME: VALUE")
    if any(character in name or character in content for character in "\r\n"):
        raise ValueError("header names and values cannot contain CR or LF")
    if name.lower() in PROTECTED_HEADERS:
        raise ValueError(f"header is managed by the script and cannot be overridden: {name}")
    return name, content.strip()


def load_cli_headers(cli_headers: list[str]) -> dict[str, str]:
    headers: dict[str, str] = {}
    for item in cli_headers:
        name, value = parse_header(item)
        headers[name] = value
    return headers


def build_url(base_url: str, website_id: str, path: str, query: list[str]) -> str:
    base = urlsplit(base_url.rstrip("/"))
    if base.scheme not in {"http", "https"} or not base.netloc:
        raise ValueError("CRISP_API_BASE_URL must be an http(s) URL")

    parsed = urlsplit(path)
    if parsed.scheme or parsed.netloc or not parsed.path.startswith("/") or parsed.path.startswith("//"):
        raise ValueError("path must be a relative URL path")

    encoded_website_id = quote(website_id, safe="")
    expected_prefix = f"/v1/website/{encoded_website_id}"
    if parsed.path != expected_prefix and not parsed.path.startswith(f"{expected_prefix}/"):
        raise ValueError(f"path must stay within {expected_prefix}")

    parameters = parse_qsl(parsed.query, keep_blank_values=True)
    for item in query:
        name, separator, value = item.partition("=")
        if not separator or not name:
            raise ValueError(f"invalid query format: {item!r}; expected NAME=VALUE")
        parameters.append((name, value))

    joined_query = urlencode(parameters)
    return urlunsplit((base.scheme, base.netloc, f"{base.path}{parsed.path}", joined_query, ""))


def load_json_body(json_value: str | None, json_file: str | None) -> bytes | None:
    if json_value is None and json_file is None:
        return None

    if json_value is not None:
        value: Any = json.loads(json_value)
        return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")

    assert json_file is not None
    raw = sys.stdin.buffer.read() if json_file == "-" else Path(json_file).read_bytes()
    json.loads(raw)
    return raw


def build_user_session_cookie(token_id: str, token_key: str) -> str:
    value = json.dumps(
        {"identifier": token_id, "key": token_key},
        ensure_ascii=True,
        separators=(",", ":"),
    )
    return f"user_session={value}"


def request_once(request: Request, timeout: float) -> bytes:
    with urlopen(request, timeout=timeout) as response:
        return response.read()


def main() -> int:
    args = make_parser().parse_args()
    try:
        token_id = env_required("CRISP_TOKEN_ID")
        token_key = env_required("CRISP_TOKEN_KEY")
        tier = env_required("CRISP_TOKEN_TIER")
        website_id = env_required("CRISP_WEBSITE_ID")
        if tier not in {"website", "plugin"}:
            raise ValueError("CRISP_TOKEN_TIER must be website or plugin")
        if args.max_retries < 0:
            raise ValueError("--max-retries must be zero or greater")

        url = build_url(
            os.environ.get("CRISP_API_BASE_URL", "https://api.crisp.chat"),
            website_id,
            args.path,
            args.query,
        )
        body = load_json_body(args.json, args.json_file)
        headers = load_cli_headers(args.header)
        credentials = base64.b64encode(f"{token_id}:{token_key}".encode("utf-8")).decode("ascii")
        request_headers = {
            "Accept": "application/json",
            "Authorization": f"Basic {credentials}",
            "User-Agent": "felix-crisp-skill/1.0",
            "X-Crisp-Tier": tier,
            **headers,
        }
        request_headers["Cookie"] = build_user_session_cookie(token_id, token_key)
        if body is not None:
            request_headers["Content-Type"] = "application/json"

        request = Request(url, data=body, headers=request_headers, method=args.method)
        can_retry = args.method in {"GET", "HEAD"} or args.retry_mutations
        retries = args.max_retries if can_retry else 0
        for attempt in range(retries + 1):
            try:
                response_body = request_once(request, args.timeout)
                if response_body:
                    sys.stdout.buffer.write(response_body)
                    if not response_body.endswith(b"\n"):
                        sys.stdout.buffer.write(b"\n")
                return 0
            except HTTPError as error:
                response_body = error.read()
                if error.code in {420, 429} and attempt < retries:
                    time.sleep(min(30.0, 2.0**attempt))
                    continue
                print(f"crisp_api.py: HTTP {error.code}", file=sys.stderr)
                if response_body:
                    sys.stderr.buffer.write(response_body)
                    if not response_body.endswith(b"\n"):
                        sys.stderr.buffer.write(b"\n")
                return 1
            except URLError as error:
                print(f"crisp_api.py: request failed: {error.reason}", file=sys.stderr)
                return 1
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(f"crisp_api.py: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
