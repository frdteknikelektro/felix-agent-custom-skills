---
id: vercel-jala
name: Vercel Jala Management
description: "Manage Jala's Vercel account via the vercel CLI — deploy, domains, env vars, projects, logs, rollback."
version: 1
enabled: true
kind: operational
permissions:
  - vercel.read
  - vercel.write
env:
  - key: VERCEL_JALA_TOKEN
    description: Vercel token for Jala account (exported as VERCEL_TOKEN for the vercel CLI)
    required: true
match:
  - vercel jala
  - jala vercel
  - jala deploy
  - jala domain
  - jala env
  - jala logs
  - jala rollback
  - jala project
  - jala alias
---

# Vercel Jala Management

## Purpose

Operate Jala's separate Vercel account through the `vercel` CLI. This skill extends the base `vercel` skill. Every operation, permission policy, destructive-operation gate, CLI availability check, and command reference is identical. This skill only overrides the credential contract and team/scope defaults.

**Execution:** Resolve permissions first (emit PERMISSION_REQUIRED if missing). Export `VERCEL_TOKEN="$VERCEL_JALA_TOKEN"` and verify with `vercel whoami` before any command. Then follow the base `vercel` skill's execution steps.

Do not duplicate operation documentation. This file documents only what is different.

## When to use

Activate when the user asks to operate specifically on Jala's Vercel account. Trigger words include "vercel jala", "jala vercel", "jala deploy", "jala domain", "jala project".

## Out of scope

- Non-Jala Vercel accounts or projects — route to the base `vercel` skill
- Operations not covered by the Vercel CLI

## Use cases

- **Deploy Jala project**: user asks "deploy jala-web to vercel" → `export VERCEL_TOKEN="$VERCEL_JALA_TOKEN" && vercel deploy --prod`
- **List Jala env vars**: user asks "what env vars does Jala production have" → `vercel env ls production`
- **Add Jala domain**: user asks "add jala.myapp.com" → `vercel domains add <domain>`
- **Rollback Jala deploy**: user asks "rollback jala production" → `vercel rollback --prod`

## Permissions

Same permission policy as the base `vercel` skill. Request the bare permission shown below; Felix stores grants under this skill id.

- `vercel.read` — inspection, listing, viewing, pulling.
- `vercel.write` — deploy, create, add, remove, set, delete, promote, rollback, link, unlink.

If an operation is ambiguous, treat it as `vercel.write` unless the user is only asking to inspect or explain current state.

Destructive operations are allowed only when the user explicitly asks — same gating as the base skill.

## Environment (overrides base)

Tokens are in the environment. The Jala account uses its own token:

- `VERCEL_JALA_TOKEN` — Jala-specific Vercel personal access token or team-scoped token

Command pattern:

```bash
export VERCEL_TOKEN="$VERCEL_JALA_TOKEN"
```

Verify:

```bash
test -n "$VERCEL_JALA_TOKEN" &&
export VERCEL_TOKEN="$VERCEL_JALA_TOKEN" &&
vercel whoami
```

Note: the `vercel` CLI reads `VERCEL_TOKEN`. The Jala value is mapped in: `VERCEL_TOKEN="$VERCEL_JALA_TOKEN"`. Never print the token value.

If the Jala account has a default team, scope commands:

```bash
export VERCEL_SCOPE="--scope <jala-team-slug>"
```

## CLI Not Found

If a `vercel` command fails because the binary is missing, report it as a runtime error. Say: "The `vercel` CLI is not installed. Use `install-tool` to install it, then retry." Do not pre-emptively check for the CLI.

## Operations

Read [../vercel/SKILL.md](../vercel/SKILL.md) for any operation not documented here.

Every command must be preceded by using `VERCEL_TOKEN="$VERCEL_JALA_TOKEN"`.

## Quick Examples

Every example maps `VERCEL_JALA_TOKEN` to `VERCEL_TOKEN`:

```bash
export VERCEL_TOKEN="$VERCEL_JALA_TOKEN"
vercel whoami
```

- `vercel deploy --prod` — deploy to production
- `vercel env ls production` — list production env vars
- `vercel env add DATABASE_URL production` — add an env var
- `vercel inspect <url>` — inspect a deployment
- `vercel domains add <domain>` — add a custom domain
- `vercel rollback --prod` — rollback production

## Output

Same as base `vercel` skill. Keep replies concise and operational. Include project name, deployment URL, domain, env key names (values redacted), and scope. Never print the `VERCEL_JALA_TOKEN` value, any env var values, or full signed request material.
