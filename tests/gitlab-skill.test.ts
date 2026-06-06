import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("gitlab skill", () => {
  it("keeps GitLab access split by text-guided read and write permissions", async () => {
    const raw = await fs.readFile(new URL("../skills/gitlab/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("gitlab.read");
    expect(raw).toContain("gitlab.review");
    expect(raw).toContain("gitlab.write");
    expect(raw).toContain("gitlab:gitlab.read");
    expect(raw).toContain("gitlab:gitlab.review");
    expect(raw).toContain("gitlab:gitlab.write");
    expect(raw).toContain("Use text-based permission judgment");
    expect(raw).toContain("Do not add or rely on hardcoded TypeScript command detection");
    expect(raw).toContain("If an operation is ambiguous, treat it as `gitlab:gitlab.write`");
  });

  it("keeps credentials in the runtime secret env without local env files", async () => {
    const raw = await fs.readFile(new URL("../skills/gitlab/SKILL.md", import.meta.url), "utf8");

    expect(raw).not.toContain("source /run/secrets/.env");
    expect(raw).toContain("GITLAB_TOKEN");
    expect(raw).toContain('export GITLAB_TOKEN="$GITLAB_TOKEN"');
    expect(raw).toContain("Never print the token value");
    expect(raw).toContain("Never print credential values");
    expect(raw).toContain("Tokens are in the environment");
    expect(raw).not.toContain("GITLAB_JALA_TOKEN");
  });

  it("preserves explicit destructive-operation gating", async () => {
    const raw = await fs.readFile(new URL("../skills/gitlab/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("Destructive operations are allowed only when the user explicitly asks");
    expect(raw).toContain("repo delete");
    expect(raw).toContain("release delete");
    expect(raw).toContain("variable delete");
    expect(raw).toContain("snippet delete");
    expect(raw).toContain("Only run when the user explicitly asks");
  });

  it("checks for glab CLI and defers to install-tool when missing", async () => {
    const raw = await fs.readFile(new URL("../skills/gitlab/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("install-tool");
    expect(raw).toContain("CLI Not Found");
    expect(raw).toContain("Do not pre-emptively check for the CLI");
    expect(raw).toContain("The only gate in this skill is the permission gate");
  });

  it("includes all operation categories with GitLab-specific naming", async () => {
    const raw = await fs.readFile(new URL("../skills/gitlab/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("### Auth & Identity");
    expect(raw).toContain("### Repositories");
    expect(raw).toContain("### Issues");
    expect(raw).toContain("### Merge Requests");
    expect(raw).toContain("### Releases");
    expect(raw).toContain("### Pipelines & CI/CD");
    expect(raw).toContain("### Variables");
    expect(raw).toContain("### Snippets");
    expect(raw).toContain("### API Access");
    expect(raw).toContain("### Local Operations & Project Workspace");
  });

  it("uses GitLab-specific terminology (MR not PR, CI not Actions)", async () => {
    const raw = await fs.readFile(new URL("../skills/gitlab/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("merge request");
    expect(raw).toContain("glab mr");
    expect(raw).toContain("glab ci");
    expect(raw).toContain("glab snippet");
    expect(raw).toContain("glab variable");
    expect(raw).toContain("%2F");
    expect(raw).toContain("glab auth status");
  });

  it("includes quick examples with full env sourcing in every recipe", async () => {
    const raw = await fs.readFile(new URL("../skills/gitlab/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("## Quick Examples");
    expect(raw).toContain("List your GitLab repositories");
    expect(raw).toContain("View a specific repository");
    expect(raw).toContain("Create a private repository");
    expect(raw).toContain("List issues with labels");
    expect(raw).toContain("Create an issue");
    expect(raw).toContain("Create and merge a merge request");
    expect(raw).toContain("Create a release");
    expect(raw).toContain("View and retry a failed pipeline");
    expect(raw).toContain("Set a CI/CD variable");
    expect(raw).toContain("List and view a snippet");
    expect(raw).toContain("Trigger a pipeline");
    expect(raw).toContain("Clone and work on a project");

    expect(raw).toContain("Copy the full sequence");
  });

  it("includes cross-skill routing convention", async () => {
    const raw = await fs.readFile(new URL("../skills/gitlab/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("## Cross-skill convention");
    expect(raw).toContain("Route GitLab work through this skill");
  });
});
