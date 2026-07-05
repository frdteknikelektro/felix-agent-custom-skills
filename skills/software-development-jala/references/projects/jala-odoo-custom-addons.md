# jala-odoo-custom-addons

## Purpose

`jala-odoo-custom-addons` uses module-oriented work branches for Odoo 16.0 custom addon changes.

Canonical repository: `https://gitlab.com/atnic/jala-odoo-custom-addons`

## Branch Policy

- `16.0-staging` is the Staging Integration Branch.
- Work is module-based, not feature-based.
- All implementation changes must be made on the module branch for the work.
- Module branches must be named `16.0-modules-<module_name>`.
- Do not update `16.0-staging` directly.
- If the user asks for code changes without naming the intended module branch or module name, ask before editing code.
- Normal module PRs must target `16.0-staging`.
- Do not delete published module branches.

## Conflict Workflow

When a module branch PR conflicts with `16.0-staging`:

1. Create a new staging-resolution branch from the original module branch.
2. Merge `16.0-staging` into that staging-resolution branch locally.
3. Resolve integration conflicts there without adding unrelated implementation changes.
4. Open a new PR from the staging-resolution branch to `16.0-staging`.

Name staging-resolution branches as `16.0-modules-<module_name>-staging`. If that branch already exists, append a numbered suffix such as `16.0-modules-<module_name>-staging-2`.

Do not rewrite, delete, or replace the original module branch unless the user explicitly asks.

## Local Git Config

Before committing, pushing, or opening a PR, verify the repository's local git identity configuration:

```bash
git config --local user.name
git config --local user.email
```

Do not commit or push until local `user.name` and `user.email` are confirmed with the user.

## Checks

Use the base `software-development` inspection and verification workflow. Add project-specific commands here once they are confirmed.
