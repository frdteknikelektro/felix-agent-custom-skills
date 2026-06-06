import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("github-jala skill", () => {
  it("namespaces permissions under github-jala", async () => {
    const raw = await fs.readFile(new URL("../skills/github-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("github.read");
    expect(raw).toContain("github.review");
    expect(raw).toContain("github.write");
    expect(raw).toContain("github-jala:github.read");
    expect(raw).toContain("github-jala:github.review");
    expect(raw).toContain("github-jala:github.write");
  });

  it("uses GITHUB_JALA_TOKEN and maps it to GITHUB_TOKEN", async () => {
    const raw = await fs.readFile(new URL("../skills/github-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("GITHUB_JALA_TOKEN");
    expect(raw).toContain('export GITHUB_TOKEN="$GITHUB_JALA_TOKEN"');
    expect(raw).not.toContain("source /run/secrets/.env");
    expect(raw).toContain("Never print the token value");
    expect(raw).toContain("Tokens are in the environment");
    // Should NOT reference the generic GITHUB_TOKEN as the source
    expect(raw).not.toMatch(/export GITHUB_TOKEN="\$GITHUB_TOKEN"/);
  });

  it("references the base github skill for operation documentation", async () => {
    const raw = await fs.readFile(new URL("../skills/github-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("skills/github/SKILL.md");
    expect(raw).toContain("extends the base `github` skill");
    expect(raw).toContain("only overrides the credential contract");
    expect(raw).toContain("Do not duplicate operation documentation");
    expect(raw).toContain("Read `skills/github/SKILL.md` for any operation not documented here");
  });

  it("keeps destructive gating consistent with base skill", async () => {
    const raw = await fs.readFile(new URL("../skills/github-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("Destructive operations are allowed only when the user explicitly asks");
    expect(raw).toContain("same gating as the base skill");
  });

  it("includes Jala-specific quick examples with env sourcing", async () => {
    const raw = await fs.readFile(new URL("../skills/github-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("## Quick Examples");
    expect(raw).toContain("List Jala repositories");
    expect(raw).toContain("View a Jala repository");
    expect(raw).toContain("Create a Jala repository");
    expect(raw).toContain("List Jala issues");
    expect(raw).toContain("Create a Jala pull request");
    expect(raw).toContain("Set a Jala repository secret");
    expect(raw).toContain("Create a Jala release");
    // Every example maps GITHUB_JALA_TOKEN
    const examples = raw.split("```bash");
    const jalaExamples = examples.filter((b) => b.includes("GITHUB_JALA_TOKEN"));
    expect(jalaExamples.length).toBeGreaterThanOrEqual(7);
  });

  it("has Jala-specific match terms", async () => {
    const raw = await fs.readFile(new URL("../skills/github-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("github jala");
    expect(raw).toContain("jala github");
    expect(raw).toContain("jala repo");
    expect(raw).toContain("jala issue");
    expect(raw).toContain("jala pr");
    expect(raw).toContain("jala release");
    expect(raw).toContain("jala workflow");
    expect(raw).toContain("jala secret");
    expect(raw).toContain("atnic");
    expect(raw).toContain("jalaproduct");
  });

  it("defaults to Atnic org for all Jala repo operations", async () => {
    const raw = await fs.readFile(new URL("../skills/github-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("Default org");
    expect(raw).toContain("Atnic");
    expect(raw).toContain("jalaproduct");
    expect(raw).toContain("gh repo list Atnic");
    expect(raw).toContain("Atnic/jala-web-next");
    expect(raw).toContain("--repo Atnic");
  });
});
