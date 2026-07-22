---
name: aws
description: Use for broad AWS account administration through the AWS CLI, including read-only inspection, billing lookups, and explicitly requested remote-state changes. Uses text-based read/write permission guidance with the standard AWS_* secret env contract.
metadata:
  author: felix-agent
  kind: operational
  version: "1.0.0"
  permissions: aws.read, aws.write
  match: aws, s3, ec2, iam, lambda, cloudformation, billing, cost explorer, cost and usage, rds, ecs, ecr, cloudwatch
env:
  - key: AWS_ACCESS_KEY_ID
    description: AWS IAM access key
    required: true
  - key: AWS_SECRET_ACCESS_KEY
    description: AWS IAM secret access key
    required: true
  - key: AWS_SESSION_TOKEN
    description: AWS STS session token (if using temporary credentials)
    required: false
  - key: AWS_REGION
    description: AWS region override (e.g. ap-southeast-1)
    required: false
---

# AWS Management

## Purpose

Operate an AWS account through the AWS CLI. This skill covers AWS inventory, diagnostics, billing lookups, and broad admin operations when the requester has the matching permission.

Use text-based permission judgment. Do not add or rely on hardcoded TypeScript command detection for AWS read/write classification.

## When to use

Activate when the user asks about an AWS account, resources, billing, or infrastructure. Trigger words include "aws", "ec2", "s3", "iam", "lambda", "rds", "billing", "cost explorer".

## Out of scope

- Creating AWS resources through CloudFormation/CDK templates (those require separate deployment tooling)
- Operations requiring AWS console-only access

## Use Cases

Use cases are repeatable operating recipes. They may produce artifacts, but they do not have to. Load the relevant reference only when the user's request matches it.

- **Monthly cost summary report** — read `references/use-cases/cost-summary-monthly-report.md` when the user asks for a monthly AWS cost summary report, billing report bundle, two-month cost comparison, service cost breakdown, Name-tag cost breakdown, no-credit view, charts, markdown summary, or monthly cost artifacts.
- **EC2 inventory** — read `references/use-cases/ec2-inventory.md` when the user asks which EC2 instances are running, what instances exist, or needs a compact compute inventory.
- **IAM access review** — read `references/use-cases/iam-access-review.md` when the user asks to inspect IAM users, access keys, attached policies, or broad access risk.

## Permissions

Use the user's requested intent and the likely AWS effect to choose the required permission:

Request the bare permission shown below; Felix stores grants under this skill id.

- `aws.read` — inspection, inventory, diagnostics, billing lookups, Cost Explorer reads, and commands whose purpose is to observe existing state. Examples: `list`, `get`, `describe`, `show`, `head`, `sts get-caller-identity`, `ce get-cost-and-usage`.
- `aws.write` — create, update, delete, attach, detach, put, revoke, terminate, deploy, restore, modify, or any other operation that can change remote AWS state.

If an operation is ambiguous, treat it as `aws.write` unless the user is only asking to inspect or explain current state.

Destructive operations are allowed only when the user explicitly asks for the specific destructive intent, such as deleting a bucket object, terminating an instance, deleting a stack, revoking IAM access, or removing a policy.

## Execution

1. Classify the requested work as read or write using the permission policy above.
2. Verify required AWS credentials are present in the environment without exposing values.
3. Use direct `aws` CLI commands. If `aws` is missing, use the `install-tool` skill to install it before continuing.
4. For read tasks, return confirmed AWS facts and include the relevant command summary.
5. For write tasks, perform only the requested change. For destructive work, proceed only when the user's request explicitly names the destructive intent.
6. Report command outcomes concisely, including the affected service, resource identifiers, region when known, and any AWS errors.

## Environment

Credentials are in the environment and match the AWS CLI's native variable names. Do not use credential files, and do not require `AWS_PROFILE`.

Required variables:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Optional variables:
- `AWS_SESSION_TOKEN`
- `AWS_REGION`

Before AWS work, verify required values without printing secrets:

```bash
test -n "$AWS_ACCESS_KEY_ID" &&
test -n "$AWS_SECRET_ACCESS_KEY" &&
aws sts get-caller-identity
```

Never print credential values, secret-derived env, or full signed request material.

## Quick Examples

Read-only inventory uses `aws.read`:

```bash
aws ec2 describe-instances \
  --filters Name=instance-state-name,Values=running \
  --query 'Reservations[].Instances[].{InstanceId:InstanceId,Name:Tags[?Key==`Name`]|[0].Value,Type:InstanceType,AZ:Placement.AvailabilityZone}' \
  --output table
```

Remote-state changes use `aws.write`:

```bash
aws lambda update-function-configuration \
  --function-name <function-name> \
  --environment Variables='{KEY=value}'
```

## References

- `references/platform-context.md` — AWS operating context, common service areas, and fallback notes.

## Output

- Keep replies concise and operational.
- Separate confirmed AWS facts from assumptions.
- Include exact commands run or command summaries, with secrets redacted.
- If blocked by missing env, missing AWS CLI, missing region, permissions, or AWS API errors, state the blocker and the smallest next step.

## Constraints

- Always verify credentials with `aws sts get-caller-identity` before doing real work.
- Never print credential values, secret-derived env, or signed request material.
- If the `aws` CLI binary is missing, tell the user to use `install-tool` first.
- If an operation is ambiguous, treat it as write.
- Destructive operations must be explicitly requested by the user before proceeding.
- Tokens are in the environment.

## Cross-skill convention

Other skills that need AWS inspection or administration should not embed their own AWS commands. Route AWS work through this skill. Organization-specific overlays (e.g. `aws-jala`) extend this skill and only override the credential contract.
