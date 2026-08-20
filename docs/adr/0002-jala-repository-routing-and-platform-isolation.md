# Jala repository routing and platform isolation

## Status

Accepted

## Decision

Repository conversations and actions for Jala targets use the Jala overlay skill for the platform involved:

- GitHub `Atnic/*` uses `github-jala`.
- GitLab `atnic/*` uses `gitlab-jala`.
- A future exact `jala/*` namespace is treated as Jala when the provider is known.
- Known Jala project profiles and confirmed active remotes establish the same context.

Namespace matching is case-insensitive. An explicit generic provider word does not override a confirmed Jala owner, group, profile, or remote. Generic GitHub/GitLab skills are not eligible for the same Jala operation and never provide fallback credentials or permissions. If Jala context is confirmed but the overlay, permission, or Jala credential is unavailable, the request fails closed.

Existing permission declaration strings remain unchanged for now. Felix keeps them isolated through the selected skill ID, so the selected Jala skill—not a generic GitHub or GitLab skill—owns the permission gate and credential mapping.

Comments on existing issues and PRs/MRs, review submissions, approvals, requests for changes, and merges remain in the `review` scope. Creating or editing repository resources remains `write`. Purely conceptual conversation is permission-free; reading actual remote state requires the matching Jala platform read permission.

The skill repository documents this contract, while the Felix runtime’s authoritative skill-invocation contract must require Jala-first selection before the permission gate.

## Consequences

- Generic match terms such as `repo`, `issue`, `PR`, and `release` cannot win over a confirmed Jala target.
- A repository name containing `jala` alone is not proof of Jala ownership; resolve the owner, group, remote, or known profile first.
- Runtime and skill tests must cover namespace precedence, generic-skill exclusion, fail-closed behavior, and the review permission matrix.
