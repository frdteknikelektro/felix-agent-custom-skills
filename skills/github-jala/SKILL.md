---
name: github-jala
description: "Manage Jala's GitHub account (Atnic org, jalaproduct user) via the gh CLI — repos, issues, PRs, releases, workflows, secrets."
metadata:
  author: felix-agent
  kind: operational
  version: "1.0.0"
  permissions: github.read, github.review, github.write
  match: github jala, jala github, jala repo, jala issue, jala pr, jala release, jala workflow, jala actions, jala secret, jala gist, atnic, jalaproduct
env:
  - key: GITHUB_JALA_TOKEN
    description: GitHub token for Jala org account (exported as GITHUB_TOKEN for the gh CLI)
    required: true
---

# GitHub Jala Management

## Purpose

Operate Jala's GitHub account (user `jalaproduct`, org `Atnic`) through the `gh` CLI. This skill extends the base `github` skill. Every operation, permission policy, destructive-operation gate, CLI availability check, and command reference is identical. This skill only overrides the credential contract and the default organization context.

**Execution:** Resolve permissions first (emit PERMISSION_REQUIRED if missing). Export `GITHUB_TOKEN="$GITHUB_JALA_TOKEN"` and verify with `gh auth status` before any command. Then follow the base `github` skill's execution steps.

**Default org**: All Jala repositories live under the `Atnic` GitHub organization. When no specific owner is provided, default to `Atnic`. For repo-scoped operations, use `--repo Atnic/<repo-name>`. To list all Jala repos, use `gh repo list Atnic`.

Do not duplicate operation documentation. This file documents only what is different.

## When to use

Activate when the user asks to interact with Jala's specific GitHub account (Atnic org, jalaproduct user). Trigger words include "jala github", "atnic", "jala repo", "jala issue", "jala pr", etc.

## Out of scope

- Non-Jala GitHub accounts or repositories — route to the base `github` skill
- Operations not covered by GitHub CLI/API

## Use cases

- **List Jala repos**: user asks "what repos does Jala have" → `gh repo list Atnic`
- **Create Jala issue**: user asks "file a bug in jala-web-next" → `gh issue create --repo Atnic/jala-web-next ...`
- **Review Jala PR**: user asks "review PR on atnic/core" → `gh pr review <number> --repo Atnic/<repo>`
- **Trigger Jala workflow**: user asks "deploy jala-api" → `gh workflow run deploy.yml --repo Atnic/<repo>`

## Permissions

Same permission policy as the base `github` skill. Request the bare permission shown below; Felix stores grants under this skill id.

- `github.read` — inspection, listing, viewing, searching, downloading.
- `github.review` — adding comments, approving pull requests, merging pull requests.
- `github.write` — create, edit, close, reopen, fork, archive, rename, delete, rerun, cancel, set.

If an operation is ambiguous, treat it as `github.write` unless the user is only asking to inspect or explain current state.

Destructive operations are allowed only when the user explicitly asks — same gating as the base skill.

## Environment (overrides base)

Tokens are in the environment. The Jala account uses its own token:

- `GITHUB_JALA_TOKEN` — Jala-specific GitHub personal access token

Command pattern:

```bash
export GITHUB_TOKEN="$GITHUB_JALA_TOKEN"
```

Verify:

```bash
test -n "$GITHUB_JALA_TOKEN" &&
export GITHUB_TOKEN="$GITHUB_JALA_TOKEN" &&
gh auth status
```

Note: the `gh` CLI reads `GITHUB_TOKEN` (and falls back to `GH_TOKEN`). The Jala value is mapped in: `GITHUB_TOKEN="$GITHUB_JALA_TOKEN"`. Never print the token value.

## CLI Not Found

If a `gh` command fails because the binary is missing, report it as a runtime error. Say: "The `gh` CLI is not installed. Use `install-tool` to install it, then retry." Do not pre-emptively check for the CLI.

## Operations

Read [../github/SKILL.md](../github/SKILL.md) for any operation not documented here.

Every command must be preceded by using `GITHUB_TOKEN="$GITHUB_JALA_TOKEN"`.

For local operations (clone, edit, PRs), use the project workspace directory (`workspace/projects/<owner>/<repo>/`) exactly as documented in the base github skill. Always `cd` into the repo directory before running git or repo-local gh commands.

## Quick Examples

Every example maps `GITHUB_JALA_TOKEN` to `GITHUB_TOKEN`:

```bash
export GITHUB_TOKEN="$GITHUB_JALA_TOKEN"
gh auth status
```

- `gh repo list Atnic --limit 50` — list Jala repos
- `gh repo view Atnic/jala-web-next` — view a Jala repo
- `gh issue list --repo Atnic/jala-web-next --state open` — list Jala issues
- `gh pr create --repo Atnic/jala-web-next --title "Fix" --body "..." --base main --head fix` — create a PR
- `gh release create v1.2.0 --repo Atnic/jala-web-next --generate-notes` — create a release

## Output

Same as base `github` skill. Keep replies concise and operational. Include repo name, issue/PR number, release tag, workflow name, and relevant identifiers. Never print the `GITHUB_JALA_TOKEN` value, secret values, or full signed request material.
