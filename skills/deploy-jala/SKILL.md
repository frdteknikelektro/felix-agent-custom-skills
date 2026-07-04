---
id: deploy-jala
name: Deploy Jala
description: "Deploy Jala products to staging or production. Use when the user says 'deploy jala', 'deploy jala-web', 'deploy jala-web-next', 'deploy staging', 'deploy production', or asks to ship a Jala product."
version: 1
enabled: true
kind: operational
permissions:
  - deploy.write
match:
  - deploy jala
  - deploy jala-web
  - deploy jala-web-next
  - deploy staging
  - deploy production
  - ship jala
  - release jala
---

# Deploy Jala

## Purpose

Orchestrate deployment of Jala products to staging or production. Each product has its own deploy sequence — this skill resolves which one, then delegates to the use case file that holds the exact steps.

## When to use

Activate when the user asks to deploy, ship, or release any Jala product. Trigger words include "deploy jala", "deploy jala-web", "deploy jala-web-next", "deploy staging", "deploy production".

## Out of scope

- Non-Jala products
- Infrastructure changes (use `aws-jala`, `vercel-jala`)
- Code changes or commits — this skill only deploys

## Use cases

- **Deploy jala-web** — read `references/use-cases/deploy-jala-web.md` when the user asks to deploy jala-web, ship jala-web, or release jala-web to staging or production.
- **Deploy jala-web-next** — read `references/use-cases/deploy-jala-web-next.md` when the user asks to deploy jala-web-next, ship jala-web-next, or release jala-web-next to staging or production.

## Permissions

Request the bare permission shown below; Felix stores grants under this skill id.

- `deploy.write` — execute deploy commands, restart services, pull code on servers.

## Workflow

1. **Resolve permissions.** Before anything else, check that the required permission is granted. If missing, emit PERMISSION_REQUIRED.
2. **Identify product and environment.** From the user's request, determine which product (jala-web, jala-web-next) and which environment (staging, production). Both must be known before proceeding — if either is unclear, ask and wait for the answer.
3. **Load the use case.** Read the matching use case file. It holds the exact steps, branch rules, and commands.
4. **Confirm before deploy.** Show the user the commands that will run and the target environment. Proceed only after explicit confirmation.
5. **Execute the deploy.** Run the commands in order. Report each step's outcome.
6. **Verify.** Confirm the deploy succeeded — check process status, HTTP response, or relevant health indicator.

## Output

Keep replies concise and operational. Show the commands being run, the environment targeted, and the outcome. Flag any step that fails before continuing.

## Checks

- If SSH fails, report the connection error and stop.
- If a deploy command fails, stop and report — do not skip to the next step.
- If a verification check fails, report the failure and do not proceed to other work.
