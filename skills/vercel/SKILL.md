---
id: vercel
name: Vercel Management
description: Full Vercel platform management via the vercel CLI — deploy, domains, environment variables, projects, logs, rollback, aliases, DNS, SSL certificates, teams, and integrations. Uses VERCEL_TOKEN (available in environment). Uses text-based read/write permission guidance.
version: 1
enabled: true
kind: operational
permissions:
  - vercel.read
  - vercel.write
env:
  - key: VERCEL_TOKEN
    description: Vercel personal access token or team-scoped token for vercel CLI
    required: true
match:
  - vercel
  - deploy
  - deployment
  - domain
  - env var
  - environment variable
  - logs
  - rollback
  - promote
  - project
  - alias
  - dns
  - ssl
  - cert
  - certificate
  - team
  - integration
  - billing
---

# Vercel Management

## Purpose

Operate the Vercel platform through the `vercel` CLI. This skill covers deployment lifecycle, domain and DNS management, environment variables, project admin, log inspection, SSL certificates, team management, integrations, and billing.

Use text-based permission judgment. Do not add or rely on hardcoded TypeScript command detection for Vercel read/write classification.

## When to use

Activate when the user asks to deploy, manage domains/DNS, set environment variables, inspect logs, rollback, promote deployments, manage projects, aliases, SSL certificates, teams, integrations, or billing on Vercel.

## Out of scope

- Build or compilation steps outside of `vercel build`
- Infrastructure provisioning (databases, storage) not managed through Vercel
- Multi-cloud deployment strategies
- Vercel UI-only features with no CLI/API counterpart

## Use cases

- **Deploy**: user asks "deploy to vercel" → `vercel deploy --prod`
- **Add env var**: user asks "add DATABASE_URL to production" → `vercel env add DATABASE_URL production`
- **Inspect deployment**: user asks "what's deployed at example.vercel.app" → `vercel inspect <url>`
- **Rollback**: user asks "rollback production" → `vercel rollback --prod`
- **Add domain**: user asks "add mydomain.com" → `vercel domains add <domain>`
- **View logs**: user asks "show me error logs" → `vercel logs <url>`

## Permissions

Use the requested intent and the likely Vercel effect to choose the required permission:

Request the bare permission shown below; Felix stores grants under this skill id.

- `vercel.read` — inspection, listing, viewing, pulling, and commands whose purpose is to observe existing state. Examples: `ls`, `list`, `inspect`, `logs`, `whoami`, `env ls`, `env pull`, `domains ls`, `domains inspect`, `certs ls`, `projects ls`, `alias ls`, `teams ls`, `dns ls`, `integration ls`, `integration-resource ls`, `billing ls`, `target ls`.
- `vercel.write` — deploy, create, add, remove, set, delete, promote, rollback, link, unlink, switch, verify, issue, buy, transfer, and any other operation that can change remote Vercel state.

If an operation is ambiguous, treat it as `vercel.write` unless the user is only asking to inspect or explain current state.

Destructive operations are allowed only when the user explicitly asks for the specific destructive intent: `unlink`, `domains rm`, `projects rm`, `certs rm`, `env rm`, `alias rm`, `dns rm`, `integration rm`, `teams rm`, `rollback` to a specific deployment.

## Workflow

0. **Resolve permissions FIRST.** Before doing anything else — before checking CLI availability, before running any command — determine whether the user has permission for the requested work. If permission is missing, emit PERMISSION_REQUIRED. Never skip this step. Never run operational checks (CLI, token, env) before the permission gate.
1. Classify the requested work as read or write using the permission policy above.
2. Export `VERCEL_TOKEN`, and verify with `vercel whoami` without exposing the token value. Determine active scope if needed.
3. Run direct `vercel` CLI commands. If the `vercel` binary is not found (exit code 127, "command not found"), tell the user to install it with `install-tool` and stop — do not retry.
4. For read tasks, return confirmed Vercel facts and include the relevant command summary.
5. For write tasks, perform only the requested change. For destructive work, proceed only when the user's request explicitly names the destructive intent.
6. Report command outcomes concisely, including the project name, deployment URL or ID, domain, env key names (values redacted), scope, and any Vercel errors.

## Environment

Use tokens from the environment before every `vercel` CLI command. Do not use credential files.

Required variable:
- `VERCEL_TOKEN` — Vercel personal access token or team-scoped token

Command pattern:

```bash
export VERCEL_TOKEN="$VERCEL_TOKEN"
```

Verify the token is valid before any Vercel work:

```bash
test -n "$VERCEL_TOKEN" &&
export VERCEL_TOKEN="$VERCEL_TOKEN" &&
vercel whoami
```

If `vercel whoami` fails, check that `VERCEL_TOKEN` is set and valid. Never print the token value.

If the user wants team-scoped commands, include `--scope <team-slug>` in each command. Detect the team scope from `vercel teams ls` or user request. When a team is active, export the scope once:

```bash
export VERCEL_SCOPE="--scope <team-slug>"
```

## CLI Not Found

If a `vercel` command fails because the binary is missing (exit code 127, "command not found"), report it as a runtime error — not as a pre-check. Say: "The `vercel` CLI is not installed. Use `install-tool` to install it, then retry."

Do not pre-emptively check for the CLI. Do not gate the workflow on CLI presence. Let vercel commands fail naturally and handle the failure. The only gate in this skill is the permission gate.

## Operation references

Keep this file for routing, permission policy, environment setup, output rules, and completion checks. Load only the reference needed for the requested branch:

- **Auth & Identity** — read [auth-and-identity](references/commands/auth-and-identity.md).
- **Deployments** — read [deployments](references/commands/deployments.md).
- **Environment Variables** — read [environment-variables](references/commands/environment-variables.md).
- **Domains** — read [domains](references/commands/domains.md).
- **DNS Records** — read [dns-records](references/commands/dns-records.md).
- **SSL Certificates** — read [ssl-certificates](references/commands/ssl-certificates.md).
- **Projects** — read [projects](references/commands/projects.md).
- **Project Linking** — read [project-linking](references/commands/project-linking.md).
- **Aliases** — read [aliases](references/commands/aliases.md).
- **Teams** — read [teams](references/commands/teams.md).
- **Integrations** — read [integrations](references/commands/integrations.md).
- **Billing** — read [billing](references/commands/billing.md).
- **Local Development** — read [local-development](references/commands/local-development.md).
- **Targets** — read [targets](references/commands/targets.md).
- **Git Integration** — read [git-integration](references/commands/git-integration.md).
- **Command Reference** — read [command-reference](references/commands/command-reference.md).
- **Global Flags** — read [global-flags](references/commands/global-flags.md).
- **Output Flags** — read [output-flags](references/commands/output-flags.md).
- **Quick Examples** — read [quick-examples](references/commands/quick-examples.md).
- **Deploy from scratch** — read [deploy-from-scratch](references/commands/deploy-from-scratch.md).
- **Deploy and promote to production alias** — read [deploy-and-promote-to-production-alias](references/commands/deploy-and-promote-to-production-alias.md).
- **Add an environment variable** — read [add-an-environment-variable](references/commands/add-an-environment-variable.md).
- **Inspect a deployment and tail logs** — read [inspect-a-deployment-and-tail-logs](references/commands/inspect-a-deployment-and-tail-logs.md).
- **Add a custom domain** — read [add-a-custom-domain](references/commands/add-a-custom-domain.md).
- **Rollback a production deployment** — read [rollback-a-production-deployment](references/commands/rollback-a-production-deployment.md).
- **List all projects and their latest deployments** — read [list-all-projects-and-their-latest-deployments](references/commands/list-all-projects-and-their-latest-deployments.md).
- **List environment variables for production** — read [list-environment-variables-for-production](references/commands/list-environment-variables-for-production.md).
- **Build a workspace project without deploying** — read [build-a-workspace-project-without-deploying](references/commands/build-a-workspace-project-without-deploying.md).
- **Deploy a workspace project (linked, with vercel.json)** — read [deploy-a-workspace-project-linked-with-vercel-json](references/commands/deploy-a-workspace-project-linked-with-vercel-json.md).
- **Set an alias to point a deployment to a domain** — read [set-an-alias-to-point-a-deployment-to-a-domain](references/commands/set-an-alias-to-point-a-deployment-to-a-domain.md).
- **Team-scoped deployment** — read [team-scoped-deployment](references/commands/team-scoped-deployment.md).
- **Pull env vars to local .env file** — read [pull-env-vars-to-local-env-file](references/commands/pull-env-vars-to-local-env-file.md).

For any mutating branch, completion requires the requested remote state to be observed directly or by a follow-up read when the platform exposes one.

## Output

- Keep replies concise and operational.
- Include project name, deployment URL, domain, env key names (values redacted), and scope.
- When listing, use a compact format: one line per item.
- Report errors with the exact `vercel` command attempted and the error message.
- Separate confirmed Vercel facts from assumptions.
- If blocked by missing token, missing CLI, scope mismatch, or Vercel API errors, state the blocker and the smallest next step.
- Never print the `VERCEL_TOKEN` value, any env var values, or full signed request material.

## Checks

- Always export `VERCEL_TOKEN` before any Vercel command.
- Always verify the token with `vercel whoami` before doing real work.
- Never print credential values, token, or env var values.
- If the `vercel` CLI binary is missing, tell the user to use `install-tool` first.
- If an operation is ambiguous, treat it as write.
- Destructive operations must be explicitly requested by the user before proceeding.
- When the user mentions a specific team, include `--scope <team-slug>`.
- For non-interactive environments (CI), always use `--yes` flag to skip prompts.
- Tokens are in the environment.

## Cross-skill convention

Other skills that need Vercel deployment or inspection should not embed their own Vercel commands. Route Vercel work through this skill.
