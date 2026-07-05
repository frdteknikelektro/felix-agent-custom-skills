# jala-point

## Purpose

`jala-point` uses a simpler branch workflow than Git Flow. The `develop` branch acts as the staging integration branch, and there is no `feature/compile-to-test` branch.

Canonical repository: `https://github.com/Atnic/jala-point`

## Branch Policy

- `main` is the Production Branch.
- `develop` is the Staging Integration Branch for testing development `feature/*` work.
- All implementation changes must be made on the original `feature/*` branch for the work.
- Do not update `main` or `develop` directly.
- If the user asks for code changes without naming the intended original `feature/*` branch, ask for the branch name before editing code.
- Normal development PRs must target `develop`.
- Normal development PRs must not target `main`.
- When a feature is satisfied and ready for production, open a PR from the original `feature/*` branch to `main`.
- Do not delete `feature/*` branches.

## Conflict Workflow

When a `feature/*` PR conflicts with `develop`:

1. Create a new staging-resolution branch from the original `feature/*` branch.
2. Merge `develop` into that staging-resolution branch locally.
3. Resolve integration conflicts there without adding unrelated implementation changes.
4. Open a new PR from the staging-resolution branch to `develop`.

Name staging-resolution branches as `feature/<original-name>-staging`. If that branch already exists, append a numbered suffix such as `feature/<original-name>-staging-2`.

Do not rewrite, delete, or replace the original `feature/*` branch unless the user explicitly asks.

## Local Git Config

Before committing, pushing, or opening a PR, verify the repository's local git identity configuration:

```bash
git config --local user.name
git config --local user.email
```

Do not commit or push until local `user.name` and `user.email` are confirmed with the user.

## Checks

Use the base `software-development` inspection and verification workflow. Add project-specific commands here once they are confirmed.
