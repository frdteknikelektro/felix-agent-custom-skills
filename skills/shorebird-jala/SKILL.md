---
id: shorebird-jala
name: Shorebird Jala Management
description: Use for Jala Shorebird remote inspection and existing patch track management through npx Shorebird or verified API calls. Do not create, build, upload, push, or publish release or patch artifacts.
version: 1
enabled: true
kind: operational
permissions:
  - shell.run
env:
  - key: SHOREBIRD_JALA_TOKEN
    description: Shorebird token for Jala account
    required: true
  - key: SHOREBIRD_JALA_APP_ID
    description: Shorebird application ID for Jala
    required: true
  - key: SHOREBIRD_JALA_API_BASE_URL
    description: Shorebird API base URL override
    required: false
  - key: SHOREBIRD_JALA_ORG_ID
    description: Shorebird organization ID for Jala
    required: false
match:
  - shorebird
  - shorebird jala
  - jala shorebird
  - code push
  - release track
  - patch track
  - staging
  - stable
  - rollback patch
---

# Shorebird Jala Management

## Purpose

Manage Jala's Shorebird account state for releases and patches that already exist. This skill is for remote inspection and post-publish management only: status checks, release/patch lookup, track changes, validation, rollback investigation, and reporting.

## When to use

Activate when the request mentions Jala's Shorebird account, Flutter code push, OTA patching, release tracks, staging patches, stable promotion, rollback, or patch status. Also when the user asks whether a release or patch exists, which track a patch is on, what patch is active, or to change the track of an existing Shorebird patch.

## Out of scope

Never run commands that create, build, upload, push, publish, or delete release artifacts or patch artifacts.

Forbidden commands include:

```bash
shorebird release ...
shorebird patch ...
shorebird init
shorebird create ...
shorebird releases delete ...
```

Do not read a live repo `shorebird.yaml`, `pubspec.yaml`, platform folders, or CI files for this skill. Use the temporary app map in `references/jala-flutter-app.shorebird.yaml` when you need flavor-to-app-id routing.

## Use cases

- **Check patch status**: user asks "what patch is active on jala-flutter-app" → inspect patches via CLI or API
- **Move patch to staging**: user asks "move patch #3 to staging" → `npx shorebird patches set-track ...`
- **Promote to stable**: user asks "promote that patch to production" → verify then change track to stable
- **Rollback investigation**: user asks "can we roll back the last patch" → inspect existing releases and patches
- **Validate release**: user asks "is release 1.2.0 valid" → `npx shorebird preview --app-id ...`

## Permissions

This skill uses `shell.run` permission. All track-change operations require the user to explicitly ask for the change. The skill will report what would be changed before running any mutating management command.

## Execution

### Inspection workflow
1. Use environment variables and verify the required `SHOREBIRD_JALA_*` variables for the chosen command are present without printing secret values.
2. Load the temporary app map from `references/jala-flutter-app.shorebird.yaml` when the command needs flavor-to-app-id routing.
3. Run `npx shorebird --version` and relevant `npx shorebird help ...` commands when command execution is permitted.
4. Prefer non-mutating list/show/status commands. Verify exact command names from CLI help because Shorebird CLI capabilities can vary by version.
5. If CLI cannot provide the requested information, use a verified Shorebird API call with the minimum env needed for that endpoint.
6. Return a concise status report with confirmed facts, unknowns, and recommended next safe action.

### Track-change workflow
Track changes are allowed only for patches that already exist.

1. Require the release version, patch number, `SHOREBIRD_JALA_APP_ID` or the matching flavor from the app map, current track if known, and target track.
2. Inspect existing patch/release information via CLI, API, or console-backed evidence before making changes.
3. If the target is `stable`, verify the user explicitly requested stable and, when possible, that QA/staging validation already happened.
4. Show the exact command or API request summary before running it.
5. For CLI, verify this command is supported in the installed version before use:

```bash
export SHOREBIRD_TOKEN="$SHOREBIRD_JALA_TOKEN"
npx shorebird patches set-track --release-version <version> --patch-number <number> --track <track>
```

6. After running, report the result and whether the new track was confirmed.

## App Map

Use `references/jala-flutter-app.shorebird.yaml` as the temporary app map for jala-flutter-app.

- `internal` -> `046826b3-7ea7-46a0-b2f3-c3c449bfb15f`
- `stable` -> `397848cc-15b0-4052-926c-2b1c5cd3317c`

## Environment

Use environment variables instead of hard-coded credentials. The runtime provides all tokens as environment variables — use them before every CLI command, API request, script, or helper.

After sourcing, export the Shorebird-compatible token name:

```bash
export SHOREBIRD_TOKEN="$SHOREBIRD_JALA_TOKEN"
```

Project-required variables in environment variables:
- `SHOREBIRD_JALA_TOKEN`: Jala Shorebird API key.
- `SHOREBIRD_JALA_APP_ID`: Jala Shorebird app id to inspect/manage.

Optional variables in environment variables:
- `SHOREBIRD_JALA_API_BASE_URL`: Shorebird API base URL, normally `https://api.shorebird.dev`.
- `SHOREBIRD_JALA_ORG_ID`: Jala Shorebird organization id for API endpoints that require organization scope.

Command pattern:

```bash
export SHOREBIRD_TOKEN="$SHOREBIRD_JALA_TOKEN"
npx shorebird <safe-command>
```

API/script pattern:

```bash
export SHOREBIRD_TOKEN="$SHOREBIRD_JALA_TOKEN"
node <script-or-inline-request>
```

Before doing any Shorebird work, verify the required variables are present without printing values:

```bash
export SHOREBIRD_TOKEN="$SHOREBIRD_JALA_TOKEN"
test -n "$SHOREBIRD_JALA_TOKEN" &&
test -n "$SHOREBIRD_JALA_APP_ID"
```

Do not print token values.

## Command Fit

Commands that do not need a checkout:
- `npx shorebird --version`
- `npx shorebird doctor`
- `npx shorebird help <command>`
- API lookups for existing releases and patches

Commands that need app context:
- `npx shorebird preview --app-id <app-id> --release-version <version> [--track <track>]`
- `npx shorebird patches set-track --app-id <app-id> --release-version <version> --patch-number <number> --track <track>`

Commands that need the matching project checkout:
- `npx shorebird init`
- `npx shorebird release <platform>`
- `npx shorebird patch <platform>`

## Information sources

Use remote/account sources only:
- Required env values for the chosen command.
- Safe `npx shorebird` commands such as version/help/list/show/status commands.
- Verified Shorebird API calls.

Current public docs say the recommended way to interact with Shorebird servers is the Shorebird CLI or Console. The public API host is `https://api.shorebird.dev`, but do not assume undocumented endpoint shapes. If CLI coverage is insufficient:
1. Check official docs first.
2. Inspect `npx shorebird help <command>` behavior.
3. If necessary, inspect Shorebird's public CLI/source for the endpoint and request shape.
4. Use direct HTTP only after verifying method, path, auth header, request body, and response schema.

Useful docs:
- `https://docs.shorebird.dev/account/api-keys/`
- `https://docs.shorebird.dev/code-push/guides/staging-patches/`
- `https://docs.shorebird.dev/code-push/guides/testing-patches/`
- `https://docs.shorebird.dev/code-push/rollback/`
- `https://docs.shorebird.dev/code-push/faq/`

## Output

- Keep replies concise and operational.
- Include exact commands run or proposed.
- Separate confirmed facts from assumptions.
- If blocked by missing required env values, missing CLI/API coverage, or missing release identifiers, state the blocker and the smallest next step.

## Constraints

- Always export `SHOREBIRD_TOKEN="$SHOREBIRD_JALA_TOKEN"` before any Shorebird command.
- Always verify `SHOREBIRD_JALA_TOKEN` and `SHOREBIRD_JALA_APP_ID` are set before doing real work.
- Never print credential values or tokens.
- Never run commands that create, build, upload, push, publish, or delete release/patch artifacts.
- Always load the app map from `references/jala-flutter-app.shorebird.yaml` when flavor-to-app-id routing is needed.
- Before mutating a track, show the exact command first and require explicit user confirmation.
- Tokens are in the environment.
