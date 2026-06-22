# 🦊 Felix Custom Skills

Custom skills for [Felix Agent](https://github.com/frdteknikelektro/felix-agent) — an AI agent that wraps an LLM backend and routes messages through skill-gated turns.

> 📦 Skills in this repo extend Felix's built-in capabilities. Copy them into a running Felix instance to deploy.

## 🚀 Quick Start

```bash
# Deploy a skill
cp -r skills/<skill-name> /path/to/felix/workspace/catalog/skills/
docker restart felix

# Run tests
npm install
npm test
```

> 💡 Skills are loaded by Felix on boot. You can also create or remove skills via the Felix WebUI (`POST /api/skills` / `DELETE /api/skills/:id`).

## 🧩 Skills

### 💻 Platform Skills

| Skill | Description |
|---|---|
| 🐙 `github` | Full GitHub management via `gh` CLI — repos, issues, PRs, releases, workflows, secrets, gists, search |
| 🦊 `gitlab` | Full GitLab management via `glab` CLI — repos, issues, MRs, releases, pipelines, variables, snippets |
| 📊 `posthog` | PostHog analytics via REST API — events, feature flags, dashboards, HogQL, cohorts, experiments |
| ⚡ `vercel` | Vercel platform management via `vercel` CLI — deploy, domains, env vars, logs, rollback, SSL |

### 🏢 Organization-Specific Skills

| Skill | Extends | Description |
|---|---|---|
| 🐙 `github-jala` | `github` | Jala GithHub account (Atnic org) — same operations with `GITHUB_JALA_TOKEN` |
| 🦊 `gitlab-jala` | `gitlab` | Jala GitLab account (atnic group) — same operations with `GITLAB_JALA_TOKEN` |
| 📊 `posthog-jala` | `posthog` | Jala PostHog orgs (10590, 28053) — same operations with `POSTHOG_JALA_PERSONAL_KEY` |
| ⚡ `vercel-jala` | `vercel` | Jala Vercel account — same operations with `VERCEL_JALA_TOKEN` |

### ⚙️ Standalone Jala Skills

| Skill | Description |
|---|---|
| ☁️ `aws-jala` | AWS management for Jala — EC2, IAM, Lambda, billing, Cost Explorer. Reference-backed use-case runbooks |
| 🚢 `shorebird-jala` | Shorebird Flutter code-push patch management — inspect releases, move tracks, rollback investigation |

### 🎭 Persona Skills

| Skill | Description |
|---|---|
| 😭 `art-of-melancomedy` | Indonesian gen-z heartbreak comedy persona. Dispatches punchline generation to a high-reasoning subagent via `delegate.sh` |

## 📂 Skill Anatomy

Every skill follows a consistent structure defined by `SKILL.md`:

```
skills/<skill-name>/
├── SKILL.md                  # 🗒️  Skill definition with YAML frontmatter
├── agents/                   # 🔌 Agent harness config (optional)
│   └── openai.yaml
├── references/               # 📖 Context docs and use-case runbooks (optional)
│   └── use-cases/
└── scripts/                  # 🔨 Helper scripts (optional)
```

### 📋 SKILL.md Sections

Each `SKILL.md` follows this template order:

```
## Purpose       — 🎯 what the skill does and why
## When to use   — 🔔 trigger phrases and activation conditions
## Out of scope  — 🚫 what this skill does NOT handle
## Use Cases     — 📝 concrete end-to-end scenarios
## Permissions   — 🔐 {skill-id}.{action} permission contract
## Workflow      — 🔄 step-by-step operating procedure
## Checks        — ✅ pre/post execution checklist
```

## 🔗 Relationship with Felix Agent

This repo provides skills for the **[🦊 felix-agent](https://github.com/frdteknikelektro/felix-agent)** runtime. Skills here are not bundled in the Felix base image — deploy them by copying into Felix's `workspace/catalog/skills/` directory. Felix auto-loads all skills from that path on startup.

For the core agent (Docker setup, owner console, chat adapters), see the [felix-agent repository](https://github.com/frdteknikelektro/felix-agent).

## 🧪 Development

```bash
npm install          # 📥 install dev dependencies
npm test             # ✅ run all tests (vitest)
npm run lint         # 🔍 typecheck (tsc --noEmit)
```

### ✨ Adding a New Skill

1. 📋 Copy `template-skill` from felix-agent as a starting point
2. 📝 Create `skills/<skill-name>/SKILL.md` with the required YAML frontmatter (`id`, `name`, `description`, `version`, `kind`, `permissions`, `match`)
3. 📐 Follow the section order: `Purpose` → `When to use` → `Out of scope` → `Use Cases` → `Permissions` → `Workflow` → `Checks`
4. 📁 Add references, agent configs, or scripts as needed
5. 🧪 Write tests in `tests/<skill-name>.test.ts`
