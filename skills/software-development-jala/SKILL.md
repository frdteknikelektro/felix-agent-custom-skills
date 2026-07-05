---
id: software-development-jala
name: Software Development Jala
description: Jala-specific software development overlay. Routes project work through base software-development and per-project workflow profiles.
version: 1
enabled: true
kind: operational
permissions:
  - repo.write
match:
  - software development jala
  - jala software development
  - jala code
  - jala implement
  - jala feature
  - jala bug fix
  - jala debug
  - jala refactor
  - jala test
  - jala build
  - jala review code
---

# Software Development Jala

## Purpose

Route Jala software-development work through the base `software-development` workflow plus Jala project workflow profiles.

Use this skill for Jala project setup, implementation, debugging, TDD, review, refactor, PR preparation, release-flow questions, and handoffs when project-specific workflow matters.

This is an overlay skill. Deploy it with the base `software-development` skill. If the base skill is unavailable, stop and report the missing dependency instead of improvising the generic software-development workflow.

## When to use

Activate when the user asks for software-development work on a Jala project or names a known Jala project.

## Out of scope

- Non-Jala software-development work — route to the base `software-development` skill.
- Platform operations that are already owned by a Jala platform skill, such as deployment, GitHub management, GitLab management, Vercel, AWS, Odoo, PostHog, or Shorebird. Route through the matching skill when the work is platform-specific.

## Project profiles

Each project workflow profile lives in `references/projects/<project-name>.md`.

To discover available projects, list the files in `references/projects/`. Each filename (without `.md`) is a known project name. Load the matching profile when the user names a project or the active context implies one.

To add a new project, create `references/projects/<project-name>.md` following the existing profile structure. No changes to this skill file are required.

## Permissions

- `repo.write` — cloning projects, creating local work artifacts, editing code, changing dependencies, resolving conflicts, staging, committing, pushing, or opening PRs.

Read-only asking is open: explain, plan, review, inspect, list candidate projects, and draft chat-only recommendations without permission. Emit `PERMISSION_REQUIRED` for `repo.write` before any mutation.

Stage, commit, pull, rebase, force, or destructive operations only when explicitly requested and safe for the worktree.

## Workflow

1. Resolve whether the request is for a Jala project.
   Completion: the project is known, explicitly provided, inferred from active-session context, or the user is asked to choose.
2. Load the base `software-development` skill.
   Completion: the generic engineering workflow, safety rules, and verification expectations are known, or the missing dependency is reported.
3. Load the matching project workflow profile when one exists.
   Completion: the project's branch policy, setup expectations, checks, and release/deployment notes are known before acting.
4. If no project workflow profile exists, use the Default Project Workflow.
   Completion: the base workflow is followed conservatively, repo docs/manifests are inspected, and no project-specific branch, deploy, release, or test behavior is guessed.
5. Route platform-specific operations through the matching Jala skill.
   Completion: GitHub, GitLab, Vercel, AWS, Odoo, PostHog, Shorebird, and deployment work is handled by the skill that owns that platform.
6. Verify and report.
   Completion: targeted checks were run, or the exact blocker is stated; report changed files, behavior, commands, failures, residual risks, and paths relative to `$WORKSPACE_DIR`.

## Default Project Workflow

When a Jala project has no project workflow profile yet:

- Follow the base `software-development` skill.
- Inspect repository docs, manifests, current branch, remotes, and dirty state before changing anything.
- Prefer creating a new `references/projects/<repo-name>.md` only after a workflow difference is confirmed.
- Do not guess project-specific commands, deployment paths, branch rules, release process, or required git identity.
- Ask when the requested action depends on unknown project policy.

## Checks

- The selected project is explicit.
- The base `software-development` skill has been loaded.
- The relevant project workflow profile has been loaded, or Default Project Workflow has been applied.
- No hard project branch policy has been bypassed.
- No secret value is printed.
