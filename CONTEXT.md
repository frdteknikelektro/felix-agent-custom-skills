# Felix Custom Skills

This project defines custom Felix Agent skills and the vocabulary used to author, compose, and maintain them.

## Language

**Base Skill**:
A skill that owns the reusable workflow, permission policy, environment contract, and operation references for a broad tool or activity.
_Avoid_: Parent skill, common skill

**Overlay Skill**:
A skill that depends on a base skill and documents only the organization-specific or context-specific differences, such as credentials, default owners, or routing rules.
_Avoid_: Forked skill, duplicate skill

**Project Workflow Profile**:
A reference document that records how a specific project should be worked on when its workflow differs from the base software-development process.
_Avoid_: Project config, project notes

**Project**:
A repository-level workflow target that the agent can inspect and modify directly.
_Avoid_: Product, service, deployment environment

**Default Project Workflow**:
The conservative fallback used when a Jala project has no project workflow profile yet.
_Avoid_: Generic Jala workflow, guessed workflow

**Production Branch**:
The branch whose contents represent the production state for a project.
_Avoid_: Main branch, default branch

**Next Release Branch**:
The branch that accumulates work intended for the next production release.
_Avoid_: Development branch, integration branch

**Staging Integration Branch**:
The branch that receives development feature work for staging-server testing before it moves toward release.
_Avoid_: Test branch, QA branch

**Published Branch**:
A remote branch that has been shared and must not be deleted by the agent unless the user explicitly asks for that exact deletion.
_Avoid_: Old branch, stale branch

**Project Branch Policy**:
The non-negotiable branch targeting, merge, and deletion rules for a specific project workflow profile.
_Avoid_: Branch preference, branching notes

**Original Feature Branch**:
The `feature/*` branch where development changes for a specific unit of work must be made.
_Avoid_: Working branch, staging branch

**Protected Shared Branch**:
A branch used for production, next-release, or staging integration state that the agent must not update directly.
_Avoid_: Shared branch, protected branch

**Module Branch**:
The `16.0-modules-<module_name>` branch where Jala Odoo custom addon module changes must be made.
_Avoid_: Feature branch, addon branch
