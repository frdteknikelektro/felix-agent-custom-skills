# jala-web-next

## Purpose

`jala-web-next` follows the same project-specific Git Flow policy as `jala-web`, except production is represented by `main`.

Canonical repository: `https://github.com/Atnic/jala-web-next`

## Branch Policy

- `main` is the Production Branch.
- `develop` is the Next Release Branch.
- `feature/compile-to-test` is the Staging Integration Branch used by the staging server for testing development `feature/*` work.
- All implementation changes must be made on the original `feature/*` branch for the work.
- Do not update `main`, `develop`, or `feature/compile-to-test` directly.
- If the user asks for code changes without naming the intended original `feature/*` branch, ask for the branch name before editing code.
- Normal development PRs must target `feature/compile-to-test`.
- Normal development PRs must not target `develop` or `main`.
- Do not delete `feature/*` branches.
- Do not delete published `release/*` branches.
- Hotfix and release work follow Git Flow. When exact hotfix or release details are ambiguous, ask before proceeding.

## Conflict Workflow

When a `feature/*` PR conflicts with `feature/compile-to-test`:

1. Create a new staging-resolution branch from the original `feature/*` branch.
2. Merge `feature/compile-to-test` into that staging-resolution branch locally.
3. Resolve integration conflicts there without adding unrelated implementation changes.
4. Open a new PR from the staging-resolution branch to `feature/compile-to-test`.

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
