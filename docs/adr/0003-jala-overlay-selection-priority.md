# Jala overlay selection priority lives in overlay descriptions

## Status

Accepted

## Context

Skill selection is description-driven: the runtime presents each installed skill's `description` and the agent selects the matching skill. ADR-0002 placed Jala routing and generic-skill exclusion inside the base `github` and `gitlab` skills. That made organization-agnostic skills carry Jala- and Atnic-specific routing and limitation language.

## Decision

Base skills stay organization-agnostic: they never mention Jala, Atnic, or an overlay skill, and they never declare themselves ineligible. Cross-skill coordination stays generic ("route platform work through this skill").

Each `*-jala` overlay declares its own selection priority in its frontmatter `description`, so the description alone makes the overlay win for a Jala target, even when the request uses only generic terms (for example "the repo" or "the MR"). The overlay body keeps the routing, credential isolation, and fail-closed rules.

The overlay remains the only skill that owns Jala credentials and permissions. If Jala context is confirmed but the overlay, its permission, or its credential is unavailable, the request still fails closed; the generic skill never provides fallback credentials or permissions.

## Consequences

- ADR-0002's placement of routing and generic-skill exclusion inside the base skills is superseded; its platform-isolation and fail-closed outcomes still hold.
- Base skills can be reused without Jala-specific language.
- Skill tests assert that base skills contain no Jala or Atnic references and that each overlay description declares priority.
