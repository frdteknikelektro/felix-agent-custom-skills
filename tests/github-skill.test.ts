import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("github skill", () => {
  it("keeps GitHub access split by text-guided read and write permissions", async () => {
    const raw = await fs.readFile(new URL("../skills/github/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("github.read");
    expect(raw).toContain("github.review");
    expect(raw).toContain("github.write");
    expect(raw).not.toContain("github:github.read");
    expect(raw).not.toContain("github:github.review");
    expect(raw).not.toContain("github:github.write");
    expect(raw).toContain("Request the bare permission shown below");
    expect(raw).toContain("Use text-based permission judgment");
    expect(raw).toContain("Do not add or rely on hardcoded TypeScript command detection");
    expect(raw).toContain("If an operation is ambiguous, treat it as `github.write`");
  });

  it("keeps credentials in the runtime secret env without local env files", async () => {
    const raw = await fs.readFile(new URL("../skills/github/SKILL.md", import.meta.url), "utf8");

    expect(raw).not.toContain("source /run/secrets/.env");
    expect(raw).toContain("GITHUB_TOKEN");
    expect(raw).toContain('export GITHUB_TOKEN="$GITHUB_TOKEN"');
    expect(raw).toContain("Never print the token value");
    expect(raw).toContain("Never print credential values");
    expect(raw).toContain("Tokens are in the environment");
    expect(raw).not.toContain("GITHUB_JALA_TOKEN");
  });

  it("preserves explicit destructive-operation gating", async () => {
    const raw = await fs.readFile(new URL("../skills/github/SKILL.md", import.meta.url), "utf8");
    const repositories = await fs.readFile(
      new URL("../skills/github/references/commands/repositories.md", import.meta.url),
      "utf8",
    );

    expect(raw).toContain("Destructive operations are allowed only when the user explicitly asks");
    expect(raw).toContain("repo delete");
    expect(raw).toContain("release delete");
    expect(raw).toContain("secret delete");
    expect(raw).toContain("gist delete");
    expect(repositories).toContain("Only run when the user explicitly asks");
  });

  it("checks for gh CLI and defers to install-tool when missing", async () => {
    const raw = await fs.readFile(new URL("../skills/github/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("install-tool");
    expect(raw).toContain("CLI Not Found");
    expect(raw).toContain("Do not pre-emptively check for the CLI");
    expect(raw).toContain("The only gate in this skill is the permission gate");
  });

  it("includes all 9 operation categories", async () => {
    const raw = await fs.readFile(new URL("../skills/github/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("[auth-and-identity](references/commands/auth-and-identity.md)");
    expect(raw).toContain("[repositories](references/commands/repositories.md)");
    expect(raw).toContain("[issues](references/commands/issues.md)");
    expect(raw).toContain("[pull-requests](references/commands/pull-requests.md)");
    expect(raw).toContain("[releases](references/commands/releases.md)");
    expect(raw).toContain("[actions-and-workflows](references/commands/actions-and-workflows.md)");
    expect(raw).toContain("[secrets-and-variables](references/commands/secrets-and-variables.md)");
    expect(raw).toContain("[gists](references/commands/gists.md)");
    expect(raw).toContain("[search](references/commands/search.md)");
    expect(raw).toContain("[api-access](references/commands/api-access.md)");
  });

  it("includes quick examples with full env sourcing in every recipe", async () => {
    const raw = await fs.readFile(new URL("../skills/github/SKILL.md", import.meta.url), "utf8");
    const quickExamples = await fs.readFile(
      new URL("../skills/github/references/commands/quick-examples.md", import.meta.url),
      "utf8",
    );

    expect(raw).toContain("[quick-examples](references/commands/quick-examples.md)");
    expect(raw).toContain("[list-repositories-for-an-owner](references/commands/list-repositories-for-an-owner.md)");
    expect(raw).toContain("[view-a-specific-repository](references/commands/view-a-specific-repository.md)");
    expect(raw).toContain("[create-a-private-repository](references/commands/create-a-private-repository.md)");
    expect(raw).toContain("[list-issues-with-labels](references/commands/list-issues-with-labels.md)");
    expect(raw).toContain("[create-an-issue](references/commands/create-an-issue.md)");
    expect(raw).toContain("[create-and-merge-a-pull-request](references/commands/create-and-merge-a-pull-request.md)");
    expect(raw).toContain("[create-a-release-with-notes](references/commands/create-a-release-with-notes.md)");
    expect(raw).toContain("[view-and-rerun-a-failed-workflow](references/commands/view-and-rerun-a-failed-workflow.md)");
    expect(raw).toContain("[set-a-repository-secret](references/commands/set-a-repository-secret.md)");
    expect(raw).toContain("[search-code-across-repositories](references/commands/search-code-across-repositories.md)");
    expect(raw).toContain("[create-and-view-a-gist](references/commands/create-and-view-a-gist.md)");
    expect(raw).toContain("[trigger-a-workflow-dispatch](references/commands/trigger-a-workflow-dispatch.md)");

    expect(quickExamples).toContain("Copy the full sequence");
  });

  it("includes cross-skill routing convention", async () => {
    const raw = await fs.readFile(new URL("../skills/github/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("## Cross-skill convention");
    expect(raw).toContain("Route GitHub work through this skill");
  });
});
