---
name: gitlab-jala
description: "Manage Jala's GitLab account (atnic group) via the glab CLI — repos, issues, merge requests, pipelines, variables, releases."
metadata:
  author: felix-agent
  kind: operational
  version: "1.0.0"
  permissions: gitlab.read, gitlab.review, gitlab.write
  match: gitlab jala, jala gitlab, jala glab, jala merge request, jala mr, jala pipeline, atnic, atnic gitlab
env:
  - key: GITLAB_JALA_TOKEN
    description: GitLab token for atnic group (exported as GITLAB_TOKEN for the glab CLI)
    required: true
---

# GitLab Jala Management

## Purpose

Operate Jala's GitLab account (group: `atnic`) through the `glab` CLI. This skill extends the base `gitlab` skill. Every operation, permission policy, destructive-operation gate, CLI availability check, and command reference is identical. This skill only overrides the credential contract and the default group context.

**Execution:** Resolve permissions first (emit PERMISSION_REQUIRED if missing). Export `GITLAB_TOKEN="$GITLAB_JALA_TOKEN"` and verify with `glab auth status` before any command. Then follow the base `gitlab` skill's execution steps.

**Default group**: All Jala repositories live under the `atnic` GitLab group. When no specific namespace is provided, default to `atnic`. For repo-scoped operations, use `--repo atnic/<project-name>`. To list all Jala repos, use `glab repo list --group atnic`.

Do not duplicate operation documentation. This file documents only what is different.

## When to use

Activate when the user asks to interact with Jala's specific GitLab account (atnic group). Trigger words include "gitlab jala", "jala gitlab", "atnic gitlab", "jala mr", "jala pipeline".

## Out of scope

- Non-Jala GitLab accounts or projects — route to the base `gitlab` skill
- Operations not covered by GitLab CLI/API

## Use cases

- **List Jala repos**: user asks "what repos does Jala have on gitlab" → `glab repo list --group atnic`
- **Create Jala issue**: user asks "file a bug in atnic/core" → `glab issue create --repo atnic/<project> ...`
- **Review Jala MR**: user asks "approve MR on atnic/infra" → `glab mr approve <number> --repo atnic/<project>`
- **Trigger Jala pipeline**: user asks "run CI on atnic/core" → `glab ci run --repo atnic/<project> --branch main`

## Permissions

Same permission policy as the base `gitlab` skill. Request the bare permission shown below; Felix stores grants under this skill id.

- `gitlab.read` — inspection, listing, viewing, searching, downloading.
- `gitlab.review` — adding comments, approving and merging merge requests.
- `gitlab.write` — create, edit, close, reopen, fork, archive, delete, retry, cancel, set.

If an operation is ambiguous, treat it as `gitlab.write` unless the user is only asking to inspect or explain current state.

Destructive operations are allowed only when the user explicitly asks — same gating as the base skill.

## Environment (overrides base)

Tokens are in the environment. The Jala account uses its own token:

- `GITLAB_JALA_TOKEN` — Jala-specific GitLab personal access token

Command pattern:

```bash
export GITLAB_TOKEN="$GITLAB_JALA_TOKEN"
```

Verify:

```bash
test -n "$GITLAB_JALA_TOKEN" &&
export GITLAB_TOKEN="$GITLAB_JALA_TOKEN" &&
glab auth status
```

Note: the `glab` CLI reads `GITLAB_TOKEN` from the environment. The Jala value is mapped in: `GITLAB_TOKEN="$GITLAB_JALA_TOKEN"`. Never print the token value.

## CLI Not Found

If a `glab` command fails because the binary is missing, report it as a runtime error. Say: "The `glab` CLI is not installed. Use `install-tool` to install it, then retry." Do not pre-emptively check for the CLI.

## Operations

Read [../gitlab/SKILL.md](../gitlab/SKILL.md) for any operation not documented here.

Every command must be preceded by using `GITLAB_TOKEN="$GITLAB_JALA_TOKEN"`.

For local operations (clone, edit, MRs), use the project workspace directory (`workspace/projects/<namespace>/<project>/`) exactly as documented in the base gitlab skill. Always `cd` into the project directory before running git or project-local glab commands.

## Quick Examples

Every example maps `GITLAB_JALA_TOKEN` to `GITLAB_TOKEN`:

```bash
export GITLAB_TOKEN="$GITLAB_JALA_TOKEN"
glab auth status
```

- `glab repo list --group atnic` — list Jala repos
- `glab repo view atnic/core` — view a Jala repo
- `glab issue list --repo atnic/core --state opened` — list Jala issues
- `glab mr create --repo atnic/core --title "Fix" --description "..." --target-branch main` — create an MR
- `glab release create v1.2.0 --repo atnic/core --name "v1.2.0" --notes "..."` — create a release

## Output

Same as base `gitlab` skill. Keep replies concise and operational. Include project path, issue/MR number, release tag, pipeline ID, and relevant identifiers. Never print the `GITLAB_JALA_TOKEN` value, variable values, or full token material.
