import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("github skill", () => {
  it("keeps GitHub access split by text-guided read and write permissions", async () => {
    const raw = await fs.readFile(new URL("../skills/github/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("github.read");
    expect(raw).toContain("github.review");
    expect(raw).toContain("github.write");
    expect(raw).toContain("github:github.read");
    expect(raw).toContain("github:github.review");
    expect(raw).toContain("github:github.write");
    expect(raw).toContain("Use text-based permission judgment");
    expect(raw).toContain("Do not add or rely on hardcoded TypeScript command detection");
    expect(raw).toContain("If an operation is ambiguous, treat it as `github:github.write`");
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

    expect(raw).toContain("Destructive operations are allowed only when the user explicitly asks");
    expect(raw).toContain("repo delete");
    expect(raw).toContain("release delete");
    expect(raw).toContain("secret delete");
    expect(raw).toContain("gist delete");
    expect(raw).toContain("Only run when the user explicitly asks");
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

    expect(raw).toContain("### Auth & Identity");
    expect(raw).toContain("### Repositories");
    expect(raw).toContain("### Issues");
    expect(raw).toContain("### Pull Requests");
    expect(raw).toContain("### Releases");
    expect(raw).toContain("### Actions & Workflows");
    expect(raw).toContain("### Secrets & Variables");
    expect(raw).toContain("### Gists");
    expect(raw).toContain("### Search");
    expect(raw).toContain("### API Access");
  });

  it("includes quick examples with full env sourcing in every recipe", async () => {
    const raw = await fs.readFile(new URL("../skills/github/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("## Quick Examples");
    expect(raw).toContain("List repositories for an owner");
    expect(raw).toContain("View a specific repository");
    expect(raw).toContain("Create a private repository");
    expect(raw).toContain("List issues with labels");
    expect(raw).toContain("Create an issue");
    expect(raw).toContain("Create and merge a pull request");
    expect(raw).toContain("Create a release with notes");
    expect(raw).toContain("View and rerun a failed workflow");
    expect(raw).toContain("Set a repository secret");
    expect(raw).toContain("Search code across repositories");
    expect(raw).toContain("Create and view a gist");
    expect(raw).toContain("Trigger a workflow dispatch");

    expect(raw).toContain("Copy the full sequence");
  });

  it("includes cross-skill routing convention", async () => {
    const raw = await fs.readFile(new URL("../skills/github/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("## Cross-skill convention");
    expect(raw).toContain("Route GitHub work through this skill");
  });
});
