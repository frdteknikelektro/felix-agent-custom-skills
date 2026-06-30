---
id: gitlab
name: GitLab Management
description: Full GitLab management via the glab CLI — repos, issues, merge requests, releases, pipelines, variables, snippets, API, and auth. Uses GITLAB_TOKEN (available in environment). Uses text-based read/write permission guidance.
version: 1
enabled: true
kind: operational
permissions:
  - gitlab.read
  - gitlab.review
  - gitlab.write
env:
  - key: GITLAB_TOKEN
    description: GitLab personal access token or group access token for glab CLI
    required: true
match:
  - gitlab
  - glab
  - merge request
  - mr
  - pipeline
  - ci/cd
  - snippet
  - gitlab ci
  - gitlab variable
---

# GitLab Management

## Purpose

Operate GitLab through the `glab` CLI. This skill covers repository management, issues, merge requests, releases, CI/CD pipelines, variables, snippets, and API access. Defaults to gitlab.com.

Use text-based permission judgment. Do not add or rely on hardcoded TypeScript command detection for GitLab read/write classification.

## When to use

Activate when the user asks to interact with GitLab repositories, issues, merge requests, releases, CI/CD pipelines, variables, snippets, or any GitLab API operation.

## Out of scope

- Git operations not involving a GitLab remote — those belong to the general git tooling
- Self-managed GitLab instances not covered by the configured token/host
- Operations that require GitLab UI interaction only

## Use cases

- **List repositories**: user asks "what repos do I have on gitlab" → `glab repo list`
- **Create an issue**: user asks "file a bug" → `glab issue create --title ... --description ...`
- **Review an MR**: user asks "approve MR #42" → `glab mr approve 42`
- **Create a release**: user asks "cut a release v1.0" → `glab release create v1.0`
- **View a pipeline**: user asks "how did CI go" → `glab ci view <id>`
- **Set a CI/CD variable**: user asks "add a deploy key" → `glab variable set ...`
- **Clone and work locally**: user asks to edit code → clone into workspace, branch, commit, push, create MR

## Permissions

Use the requested intent and the likely GitLab effect to choose the required permission:

Request the bare permission shown below; Felix stores grants under this skill id.

- `gitlab.read` — inspection, listing, viewing, searching, downloading, and commands whose purpose is to observe existing state. Examples: `repo list`, `repo view`, `issue list`, `issue view`, `mr list`, `mr view`, `mr diff`, `mr approvers`, `release list`, `release view`, `release download`, `ci list`, `ci view`, `ci trace`, `ci status`, `variable list`, `snippet list`, `snippet view`, `auth status`, `api GET`.
- `gitlab.review` — adding comments, approving and merging merge requests, and other collaborative review actions that do not create, edit, or delete GitLab resources. Examples: `issue note`, `mr note`, `mr approve`, `mr approve --sha`, `mr merge`, `mr merge --squash`, `mr merge --delete-source-branch`.
- `gitlab.write` — create, edit, close, reopen, fork, archive, delete, retry, cancel, set, and any other operation that can change remote GitLab state.

If an operation is ambiguous, treat it as `gitlab.write` unless the user is only asking to inspect or explain current state.

Destructive operations are allowed only when the user explicitly asks for the specific destructive intent: `repo delete`, `release delete`, `variable delete`, `snippet delete`, `mr close` without merge, merging conflicting MRs.

## Workflow

0. **Resolve permissions FIRST.** Before doing anything else — before checking CLI availability, before running any command — determine whether the user has permission for the requested work. If permission is missing, emit PERMISSION_REQUIRED. Never skip this step. Never run operational checks (CLI, token, env) before the permission gate.
1. Classify the requested work as read or write using the permission policy above.
2. Export `GITLAB_TOKEN`, and verify with `glab auth status` without exposing the token value. Determine the target project/group with `glab repo list` if needed.
3. Run direct `glab` CLI commands. If the `glab` binary is not found (exit code 127, "command not found"), tell the user to install it with `install-tool` and stop — do not retry.
4. For read tasks, return confirmed GitLab facts and include the relevant command summary.
5. For write tasks, perform only the requested change. For destructive work, proceed only when the user's request explicitly names the destructive intent.
6. Report command outcomes concisely, including the project path, issue/MR number or URL, release tag, pipeline ID, variable key (values redacted), and any GitLab errors.

## Environment

Use tokens from the environment before every `glab` CLI command. Do not use credential files.

Required variable:
- `GITLAB_TOKEN` — GitLab personal access token with `api`, `read_user`, `read_repository`, `write_repository` scopes

Command pattern:

```bash
export GITLAB_TOKEN="$GITLAB_TOKEN"
```

Verify the token is valid before any GitLab work:

```bash
test -n "$GITLAB_TOKEN" &&
export GITLAB_TOKEN="$GITLAB_TOKEN" &&
glab auth status
```

If `glab auth status` fails, check that `GITLAB_TOKEN` is set and valid. Never print the token value.

For self-managed GitLab instances (non-gitlab.com), export the host:

```bash
export GITLAB_HOST="gitlab.example.com"
```

## CLI Not Found

If a `glab` command fails because the binary is missing (exit code 127, "command not found"), report it as a runtime error — not as a pre-check. Say: "The `glab` CLI is not installed. Use `install-tool` to install it, then retry."

Do not pre-emptively check for the CLI. Do not gate the workflow on CLI presence. Let glab commands fail naturally and handle the failure. The only gate in this skill is the permission gate.

## Operation references

Keep this file for routing, permission policy, environment setup, output rules, and completion checks. Load only the reference needed for the requested branch:

- **Auth & Identity** — read [auth-and-identity](references/commands/auth-and-identity.md).
- **Repositories** — read [repositories](references/commands/repositories.md).
- **Issues** — read [issues](references/commands/issues.md).
- **Merge Requests** — read [merge-requests](references/commands/merge-requests.md).
- **Releases** — read [releases](references/commands/releases.md).
- **Pipelines & CI/CD** — read [pipelines-and-ci-cd](references/commands/pipelines-and-ci-cd.md).
- **Variables** — read [variables](references/commands/variables.md).
- **Snippets** — read [snippets](references/commands/snippets.md).
- **API Access** — read [api-access](references/commands/api-access.md).
- **Local Operations & Project Workspace** — read [local-operations-and-project-workspace](references/commands/local-operations-and-project-workspace.md).
- **Command Reference** — read [command-reference](references/commands/command-reference.md).
- **Global Flags** — read [global-flags](references/commands/global-flags.md).
- **Quick Examples** — read [quick-examples](references/commands/quick-examples.md).
- **List your GitLab repositories** — read [list-your-gitlab-repositories](references/commands/list-your-gitlab-repositories.md).
- **View a specific repository** — read [view-a-specific-repository](references/commands/view-a-specific-repository.md).
- **Create a private repository** — read [create-a-private-repository](references/commands/create-a-private-repository.md).
- **List issues with labels** — read [list-issues-with-labels](references/commands/list-issues-with-labels.md).
- **Create an issue** — read [create-an-issue](references/commands/create-an-issue.md).
- **Create and merge a merge request** — read [create-and-merge-a-merge-request](references/commands/create-and-merge-a-merge-request.md).
- **Create a release** — read [create-a-release](references/commands/create-a-release.md).
- **View and retry a failed pipeline** — read [view-and-retry-a-failed-pipeline](references/commands/view-and-retry-a-failed-pipeline.md).
- **Set a CI/CD variable** — read [set-a-ci-cd-variable](references/commands/set-a-ci-cd-variable.md).
- **List and view a snippet** — read [list-and-view-a-snippet](references/commands/list-and-view-a-snippet.md).
- **Trigger a pipeline** — read [trigger-a-pipeline](references/commands/trigger-a-pipeline.md).
- **Clone and work on a project** — read [clone-and-work-on-a-project](references/commands/clone-and-work-on-a-project.md).

For any mutating branch, completion requires the requested remote state to be observed directly or by a follow-up read when the platform exposes one.

## Output

- Keep replies concise and operational.
- Include project path, issue/MR number, release tag, pipeline ID, and relevant identifiers.
- When listing, use a compact format: one line per item.
- Report errors with the exact `glab` command attempted and the error message.
- Separate confirmed GitLab facts from assumptions.
- If blocked by missing token, missing CLI, or API errors, state the blocker and the smallest next step.
- Never print the `GITLAB_TOKEN` value, variable values, or full token material.

## Checks

- Always export `GITLAB_TOKEN` before any GitLab command.
- Always verify the token with `glab auth status` before doing real work.
- Never print credential values, tokens, or variable values.
- If the `glab` CLI binary is missing, tell the user to use `install-tool` first.
- If an operation is ambiguous, treat it as write.
- Destructive operations must be explicitly requested by the user before proceeding.
- Use `--repo namespace/project` explicitly when the current working directory is not a git clone of the target.
- For API calls, project paths use `%2F` as the namespace separator (e.g., `group%2Fproject`).
- Tokens are in the environment.

## Cross-skill convention

Other skills that need GitLab operations (creating issues, triggering pipelines, reading project data) should not embed their own `glab` commands. Route GitLab work through this skill.
