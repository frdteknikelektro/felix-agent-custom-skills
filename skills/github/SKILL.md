---
name: github
description: Full GitHub management via the gh CLI — repos, issues, PRs, releases, workflows, secrets, variables, gists, search, and auth. Uses GITHUB_TOKEN (available in environment). Uses text-based read/write permission guidance.
metadata:
  author: felix-agent
  kind: operational
  version: "1.0.0"
  permissions: github.read, github.review, github.write
  match: github, repo, repository, issue, issues, pr, pull request, release, workflow, actions, gist, secret, variable, code search, codespace, git clone, git branch, git commit, git push, git checkout
env:
  - key: GITHUB_TOKEN
    description: GitHub personal access token or fine-grained token for gh CLI
    required: true
---

# GitHub Management

## Purpose

Operate GitHub through the `gh` CLI. This skill covers repository management, issues, pull requests, releases, Actions workflows, secrets and variables, gists, search, and API access.

Use text-based permission judgment. Do not add or rely on hardcoded TypeScript command detection for GitHub read/write classification.

## When to use

Activate when the user asks to interact with GitHub repositories, issues, pull requests, releases, Actions workflows, secrets, variables, gists, code search, or any git operation through the GitHub CLI.

## Out of scope

- Local git operations not involving a GitHub remote — those belong to the general git tooling
- GitHub Enterprise Server instances not covered by the configured token
- Operations that require GitHub UI interaction only (e.g., organization settings that have no CLI or API counterpart)

## Use cases

- **List repositories**: user asks "what repos does org X have" → `gh repo list <owner>`
- **Create an issue**: user asks "file a bug about..." → `gh issue create --title ... --body ...`
- **Review a PR**: user asks "review PR #42 on repo X" → `gh pr review 42`
- **Create a release**: user asks "cut a release v1.0" → `gh release create v1.0`
- **Rerun a failed workflow**: user asks "rerun the CI" → `gh run rerun <id>`
- **Search code**: user asks "find where X is used in repo Y" → `gh search code ...`
- **Clone and work locally**: user asks to edit code in a repo → clone into workspace, branch, commit, push, create PR

## Permissions

Use the requested intent and the likely GitHub effect to choose the required permission:

Request the bare permission shown below; Felix stores grants under this skill id.

- `github.read` — inspection, listing, viewing, searching, downloading, and commands whose purpose is to observe existing state. Examples: `repo list`, `repo view`, `issue list`, `issue view`, `issue search`, `pr list`, `pr view`, `pr diff`, `release list`, `release view`, `release download`, `run list`, `run view`, `run watch`, `workflow list`, `secret list`, `variable list`, `gist list`, `gist view`, `search`, `auth status`, `api GET`.
- `github.review` — adding comments, approving pull requests, merging pull requests, and other collaborative review actions that do not create, edit, or delete GitHub resources. Examples: `pr review --approve`, `pr review --comment`, `pr review --request-changes`, `pr merge`, `pr merge --squash`, `pr merge --rebase`.
- `github.write` — create, edit, close, reopen, fork, archive, rename, delete, rerun, cancel, set, and any other operation that can change remote GitHub state.

If an operation is ambiguous, treat it as `github.write` unless the user is only asking to inspect or explain current state.

Destructive operations are allowed only when the user explicitly asks for the specific destructive intent: `repo delete`, `release delete`, `secret delete`, `variable delete`, `gist delete`, `pr close` without merge, merging conflicting PRs.

## Execution

0. **Resolve permissions FIRST.** Before doing anything else — before checking CLI availability, before running any command — determine whether the user has permission for the requested work. If permission is missing, emit PERMISSION_REQUIRED. Never skip this step. Never run operational checks (CLI, token, env) before the permission gate.
1. Classify the requested work as read or write using the permission policy above.
2. Export `GITHUB_TOKEN`, and verify with `gh auth status` without exposing the token value. Determine the target repo with `gh repo view` or `gh repo list` if needed.
3. Run direct `gh` CLI commands. If the `gh` binary is not found (exit code 127, "command not found"), tell the user to install it with `install-tool` and stop — do not retry. Use `--repo owner/repo` explicitly when the current working directory is not a git clone of the target. Completion: the command has exited and produced output or an error.
4. For read tasks, return confirmed GitHub facts and include the relevant command summary. Completion: every fact reported is directly visible in the command output — no inferred state.
5. For write tasks, perform only the requested change. For destructive work, proceed only when the user's request explicitly names the destructive intent. Completion: the command exited 0 and the remote state changed (verify with a follow-up read if the platform exposes one).
6. Report command outcomes concisely, including the repo name, issue/PR number, release tag, workflow name, secret/variable key (values redacted), and any GitHub errors. Completion: every output identifier matches the command output exactly.

## Environment

Tokens are in the environment. Use tokens from the environment before every `gh` CLI command. Do not use credential files.

Required variable:
- `GITHUB_TOKEN` — GitHub personal access token (classic or fine-grained)

Command pattern:

```bash
export GITHUB_TOKEN="$GITHUB_TOKEN"
```

Verify the token is valid before any GitHub work:

```bash
test -n "$GITHUB_TOKEN" &&
export GITHUB_TOKEN="$GITHUB_TOKEN" &&
gh auth status
```

If `gh auth status` fails, check that `GITHUB_TOKEN` is set and valid. Never print the token value.

For self-managed GitHub Enterprise Server instances, export the host:

```bash
export GH_HOST="github.example.com"
```

## CLI Not Found

If a `gh` command fails because the binary is missing (exit code 127, "command not found"), report it as a runtime error — not as a pre-check. Say: "The `gh` CLI is not installed. Use `install-tool` to install it, then retry."

Do not pre-emptively check for the CLI. Do not gate the workflow on CLI presence. Let gh commands fail naturally and handle the failure. The only gate in this skill is the permission gate.

## Operation references

Keep this file for routing, permission policy, environment setup, output rules, and completion checks. Load only the reference needed for the requested branch:

- **Auth & Identity** — read [auth-and-identity](references/commands/auth-and-identity.md).
- **Repositories** — read [repositories](references/commands/repositories.md).
- **Local Operations & Project Workspace** — read [local-operations-and-project-workspace](references/commands/local-operations-and-project-workspace.md).
- **Issues** — read [issues](references/commands/issues.md).
- **Pull Requests** — read [pull-requests](references/commands/pull-requests.md).
- **Releases** — read [releases](references/commands/releases.md).
- **Actions & Workflows** — read [actions-and-workflows](references/commands/actions-and-workflows.md).
- **Secrets & Variables** — read [secrets-and-variables](references/commands/secrets-and-variables.md).
- **Gists** — read [gists](references/commands/gists.md).
- **Search** — read [search](references/commands/search.md).
- **API Access** — read [api-access](references/commands/api-access.md).
- **Command Reference** — read [command-reference](references/commands/command-reference.md).
- **Global Flags** — read [global-flags](references/commands/global-flags.md).
- **The `--repo` Flag** — read [the-repo-flag](references/commands/the-repo-flag.md).
- **Quick Examples** — read [quick-examples](references/commands/quick-examples.md).
- **List repositories for an owner** — read [list-repositories-for-an-owner](references/commands/list-repositories-for-an-owner.md).
- **View a specific repository** — read [view-a-specific-repository](references/commands/view-a-specific-repository.md).
- **Create a private repository** — read [create-a-private-repository](references/commands/create-a-private-repository.md).
- **List issues with labels** — read [list-issues-with-labels](references/commands/list-issues-with-labels.md).
- **Create an issue** — read [create-an-issue](references/commands/create-an-issue.md).
- **Create and merge a pull request** — read [create-and-merge-a-pull-request](references/commands/create-and-merge-a-pull-request.md).
- **Create a release with notes** — read [create-a-release-with-notes](references/commands/create-a-release-with-notes.md).
- **View and rerun a failed workflow** — read [view-and-rerun-a-failed-workflow](references/commands/view-and-rerun-a-failed-workflow.md).
- **Set a repository secret** — read [set-a-repository-secret](references/commands/set-a-repository-secret.md).
- **Search code across repositories** — read [search-code-across-repositories](references/commands/search-code-across-repositories.md).
- **Create and view a gist** — read [create-and-view-a-gist](references/commands/create-and-view-a-gist.md).
- **Trigger a workflow dispatch** — read [trigger-a-workflow-dispatch](references/commands/trigger-a-workflow-dispatch.md).

For any mutating branch, completion requires the requested remote state to be observed directly or by a follow-up read when the platform exposes one.

## Output

- Keep replies concise and operational.
- Include repo name, issue/PR number, release tag, workflow name, and relevant identifiers.
- When listing, use a compact format: one line per item.
- Report errors with the exact `gh` command attempted and the error message.
- Separate confirmed GitHub facts from assumptions.
- If blocked by missing token, missing CLI, or API errors, state the blocker and the smallest next step.
- Never print credential values.
- Never print the `GITHUB_TOKEN` value, secret values, or full signed request material.

## Cross-skill convention

Other skills that need GitHub operations (creating issues, triggering workflows, reading repo data) should not embed their own `gh` commands. Route GitHub work through this skill.
