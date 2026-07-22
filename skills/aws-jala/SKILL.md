---
name: aws-jala
description: Use for broad Jala AWS account administration through the AWS CLI, including read-only inspection, billing lookups, and explicitly requested remote-state changes. Uses text-based read/write permission guidance with the project-level AWS_JALA_* secret env contract.
metadata:
  author: felix-agent
  kind: operational
  version: "1.0.0"
  permissions: aws.read, aws.write
  match: aws jala, jala aws, jala ec2, jala s3, jala iam, jala lambda, jala billing, jala cost explorer, jala rds, jala ecs, jala ecr, jala cloudwatch
env:
  - key: AWS_JALA_ACCESS_KEY_ID
    description: AWS IAM access key for Jala account (exported as AWS_ACCESS_KEY_ID)
    required: true
  - key: AWS_JALA_SECRET_ACCESS_KEY
    description: AWS IAM secret access key for Jala account (exported as AWS_SECRET_ACCESS_KEY)
    required: true
  - key: AWS_JALA_SESSION_TOKEN
    description: AWS STS session token for Jala account, if using temporary credentials (exported as AWS_SESSION_TOKEN)
    required: false
  - key: AWS_JALA_REGION
    description: AWS region override for Jala account (exported as AWS_REGION)
    required: false
---

# AWS Jala Management

## Purpose

Operate Jala's AWS account through the AWS CLI. This skill extends the base `aws` skill. Every operation, permission policy, destructive-operation gate, CLI availability check, and use-case reference is identical. This skill only overrides the credential contract.

**Execution:** Resolve permissions first (emit PERMISSION_REQUIRED if missing). Map `AWS_JALA_*` to the native `AWS_*` variables and verify with `aws sts get-caller-identity` before any command. Then follow the base `aws` skill's execution steps.

Do not duplicate operation documentation. This file documents only what is different.

## When to use

Activate when the user asks to operate specifically on Jala's AWS account. Trigger words include "aws jala", "jala aws", "jala ec2", "jala s3", "jala billing".

## Out of scope

- Non-Jala AWS accounts — route to the base `aws` skill
- Operations not covered by the AWS CLI

## Use Cases

Same use-case recipes as the base `aws` skill, run against Jala's credentials:

- **Monthly cost summary report** — read [../aws/references/use-cases/cost-summary-monthly-report.md](../aws/references/use-cases/cost-summary-monthly-report.md) when the user asks for a Jala monthly AWS cost summary, billing report bundle, two-month cost comparison, or cost artifacts. Use `workspace/reports/aws-jala/cost-summary/...` as the working directory and prefix the markdown report `aws-jala-${PREFIX}-report.md`.
- **EC2 inventory** — read [../aws/references/use-cases/ec2-inventory.md](../aws/references/use-cases/ec2-inventory.md) when the user asks which Jala EC2 instances exist or are running.
- **IAM access review** — read [../aws/references/use-cases/iam-access-review.md](../aws/references/use-cases/iam-access-review.md) when the user asks to inspect Jala IAM users, access keys, or attached policies.

## Permissions

Same permission policy as the base `aws` skill. Request the bare permission shown below; Felix stores grants under this skill id.

- `aws.read` — inspection, inventory, diagnostics, billing lookups, Cost Explorer reads.
- `aws.write` — create, update, delete, attach, detach, put, revoke, terminate, deploy, restore, modify.

If an operation is ambiguous, treat it as `aws.write` unless the user is only asking to inspect or explain current state.

Destructive operations are allowed only when the user explicitly asks — same gating as the base skill.

## Environment (overrides base)

Use credentials from the environment before every AWS CLI command. Do not use credential files, and do not require `AWS_JALA_PROFILE`.

Required variables:
- `AWS_JALA_ACCESS_KEY_ID`
- `AWS_JALA_SECRET_ACCESS_KEY`

Optional variables:
- `AWS_JALA_SESSION_TOKEN`
- `AWS_JALA_REGION`

Command pattern:

```bash
export AWS_ACCESS_KEY_ID="$AWS_JALA_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$AWS_JALA_SECRET_ACCESS_KEY"
if [ -n "${AWS_JALA_SESSION_TOKEN:-}" ]; then export AWS_SESSION_TOKEN="$AWS_JALA_SESSION_TOKEN"; fi
if [ -n "${AWS_JALA_REGION:-}" ]; then export AWS_REGION="$AWS_JALA_REGION"; export AWS_DEFAULT_REGION="$AWS_JALA_REGION"; fi
aws <service> <operation> ...
```

Verify before any work:

```bash
test -n "$AWS_JALA_ACCESS_KEY_ID" &&
test -n "$AWS_JALA_SECRET_ACCESS_KEY" &&
export AWS_ACCESS_KEY_ID="$AWS_JALA_ACCESS_KEY_ID" &&
export AWS_SECRET_ACCESS_KEY="$AWS_JALA_SECRET_ACCESS_KEY" &&
aws sts get-caller-identity
```

Note: the `aws` CLI reads native `AWS_*` variables. The Jala values are mapped in as shown above. Never print credential values, secret-derived env, or full signed request material.

## Operations

Read [../aws/SKILL.md](../aws/SKILL.md) for any operation not documented here.

Every command must be preceded by mapping `AWS_JALA_*` to `AWS_*` as shown above.

## Quick Examples

```bash
export AWS_ACCESS_KEY_ID="$AWS_JALA_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$AWS_JALA_SECRET_ACCESS_KEY"
aws sts get-caller-identity
```

- `aws ec2 describe-instances --filters Name=instance-state-name,Values=running` — running instances
- `aws iam list-users --output table` — list IAM users
- `aws ce get-cost-and-usage --time-period Start=...,End=... --granularity MONTHLY --metrics UnblendedCost` — cost lookup

See base `aws` SKILL.md and its `references/use-cases/` for full command syntax.

## Output

Same as base `aws` skill. Keep replies concise and operational. Separate confirmed AWS facts from assumptions. Never print `AWS_JALA_ACCESS_KEY_ID`, `AWS_JALA_SECRET_ACCESS_KEY`, `AWS_JALA_SESSION_TOKEN`, or any mapped credential value.

## Constraints

- Always map `AWS_JALA_*` to native `AWS_*` before any command.
- Always verify credentials with `aws sts get-caller-identity` before doing real work.
- Never print credential values, secret-derived env, or signed request material.
- If the `aws` CLI binary is missing, tell the user to use `install-tool` first.
- If an operation is ambiguous, treat it as write.
- Destructive operations must be explicitly requested by the user before proceeding.
