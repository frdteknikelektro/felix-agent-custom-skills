import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("gitlab skill", () => {
  it("keeps GitLab access split by text-guided read and write permissions", async () => {
    const raw = await fs.readFile(new URL("../skills/gitlab/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("gitlab.read");
    expect(raw).toContain("gitlab.review");
    expect(raw).toContain("gitlab.write");
    expect(raw).not.toContain("gitlab:gitlab.read");
    expect(raw).not.toContain("gitlab:gitlab.review");
    expect(raw).not.toContain("gitlab:gitlab.write");
    expect(raw).toContain("Request the bare permission shown below");
    expect(raw).toContain("Use text-based permission judgment");
    expect(raw).toContain("Do not add or rely on hardcoded TypeScript command detection");
    expect(raw).toContain("If an operation is ambiguous, treat it as `gitlab.write`");
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
    const repositories = await fs.readFile(
      new URL("../skills/gitlab/references/commands/repositories.md", import.meta.url),
      "utf8",
    );

    expect(raw).toContain("Destructive operations are allowed only when the user explicitly asks");
    expect(raw).toContain("repo delete");
    expect(raw).toContain("release delete");
    expect(raw).toContain("variable delete");
    expect(raw).toContain("snippet delete");
    expect(repositories).toContain("Only run when the user explicitly asks");
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

    expect(raw).toContain("[auth-and-identity](references/commands/auth-and-identity.md)");
    expect(raw).toContain("[repositories](references/commands/repositories.md)");
    expect(raw).toContain("[issues](references/commands/issues.md)");
    expect(raw).toContain("[merge-requests](references/commands/merge-requests.md)");
    expect(raw).toContain("[releases](references/commands/releases.md)");
    expect(raw).toContain("[pipelines-and-ci-cd](references/commands/pipelines-and-ci-cd.md)");
    expect(raw).toContain("[variables](references/commands/variables.md)");
    expect(raw).toContain("[snippets](references/commands/snippets.md)");
    expect(raw).toContain("[api-access](references/commands/api-access.md)");
    expect(raw).toContain("[local-operations-and-project-workspace](references/commands/local-operations-and-project-workspace.md)");
  });

  it("uses GitLab-specific terminology (MR not PR, CI not Actions)", async () => {
    const raw = await fs.readFile(new URL("../skills/gitlab/SKILL.md", import.meta.url), "utf8");
    const pipelines = await fs.readFile(
      new URL("../skills/gitlab/references/commands/pipelines-and-ci-cd.md", import.meta.url),
      "utf8",
    );
    const snippets = await fs.readFile(new URL("../skills/gitlab/references/commands/snippets.md", import.meta.url), "utf8");
    const variables = await fs.readFile(new URL("../skills/gitlab/references/commands/variables.md", import.meta.url), "utf8");

    expect(raw).toContain("merge request");
    expect(raw).toContain("glab mr");
    expect(pipelines).toContain("glab ci");
    expect(snippets).toContain("glab snippet");
    expect(variables).toContain("glab variable");
    expect(raw).toContain("%2F");
    expect(raw).toContain("glab auth status");
  });

  it("includes quick examples with full env sourcing in every recipe", async () => {
    const raw = await fs.readFile(new URL("../skills/gitlab/SKILL.md", import.meta.url), "utf8");
    const quickExamples = await fs.readFile(
      new URL("../skills/gitlab/references/commands/quick-examples.md", import.meta.url),
      "utf8",
    );

    expect(raw).toContain("[quick-examples](references/commands/quick-examples.md)");
    expect(raw).toContain("[list-your-gitlab-repositories](references/commands/list-your-gitlab-repositories.md)");
    expect(raw).toContain("[view-a-specific-repository](references/commands/view-a-specific-repository.md)");
    expect(raw).toContain("[create-a-private-repository](references/commands/create-a-private-repository.md)");
    expect(raw).toContain("[list-issues-with-labels](references/commands/list-issues-with-labels.md)");
    expect(raw).toContain("[create-an-issue](references/commands/create-an-issue.md)");
    expect(raw).toContain("[create-and-merge-a-merge-request](references/commands/create-and-merge-a-merge-request.md)");
    expect(raw).toContain("[create-a-release](references/commands/create-a-release.md)");
    expect(raw).toContain("[view-and-retry-a-failed-pipeline](references/commands/view-and-retry-a-failed-pipeline.md)");
    expect(raw).toContain("[set-a-ci-cd-variable](references/commands/set-a-ci-cd-variable.md)");
    expect(raw).toContain("[list-and-view-a-snippet](references/commands/list-and-view-a-snippet.md)");
    expect(raw).toContain("[trigger-a-pipeline](references/commands/trigger-a-pipeline.md)");
    expect(raw).toContain("[clone-and-work-on-a-project](references/commands/clone-and-work-on-a-project.md)");

    expect(quickExamples).toContain("Copy the full sequence");
  });

  it("includes cross-skill routing convention", async () => {
    const raw = await fs.readFile(new URL("../skills/gitlab/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("## Cross-skill convention");
    expect(raw).toContain("Route GitLab work through this skill");
  });
});
