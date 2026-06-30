import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("gitlab-jala skill", () => {
  it("uses bare GitLab permissions for the gitlab-jala skill id", async () => {
    const raw = await fs.readFile(new URL("../skills/gitlab-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("gitlab.read");
    expect(raw).toContain("gitlab.review");
    expect(raw).toContain("gitlab.write");
    expect(raw).not.toContain("gitlab-jala:gitlab.read");
    expect(raw).not.toContain("gitlab-jala:gitlab.review");
    expect(raw).not.toContain("gitlab-jala:gitlab.write");
    expect(raw).toContain("Request the bare permission shown below");
  });

  it("uses GITLAB_JALA_TOKEN and maps it to GITLAB_TOKEN", async () => {
    const raw = await fs.readFile(new URL("../skills/gitlab-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("GITLAB_JALA_TOKEN");
    expect(raw).toContain('export GITLAB_TOKEN="$GITLAB_JALA_TOKEN"');
    expect(raw).not.toContain("source /run/secrets/.env");
    expect(raw).toContain("Never print the token value");
    expect(raw).toContain("Tokens are in the environment");
    // Should NOT reference the generic GITLAB_TOKEN as the source
    expect(raw).not.toMatch(/export GITLAB_TOKEN="\$GITLAB_TOKEN"/);
  });

  it("references the base gitlab skill for operation documentation", async () => {
    const raw = await fs.readFile(new URL("../skills/gitlab-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("../gitlab/SKILL.md");
    expect(raw).toContain("extends the base `gitlab` skill");
    expect(raw).toContain("only overrides the credential contract");
    expect(raw).toContain("Do not duplicate operation documentation");
    expect(raw).toContain("Read [../gitlab/SKILL.md](../gitlab/SKILL.md) for any operation not documented here");
  });

  it("keeps destructive gating consistent with base skill", async () => {
    const raw = await fs.readFile(new URL("../skills/gitlab-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("Destructive operations are allowed only when the user explicitly asks");
    expect(raw).toContain("same gating as the base skill");
  });

  it("includes Jala-specific quick examples with env sourcing", async () => {
    const raw = await fs.readFile(new URL("../skills/gitlab-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("## Quick Examples");
    expect(raw).toContain("List Jala repositories");
    expect(raw).toContain("View a Jala repository");
    expect(raw).toContain("Create a Jala repository");
    expect(raw).toContain("List Jala issues");
    expect(raw).toContain("Create a Jala merge request");
    expect(raw).toContain("Set a Jala CI/CD variable");
    expect(raw).toContain("Create a Jala release");
    // Every example maps GITLAB_JALA_TOKEN
    const examples = raw.split("```bash");
    const jalaExamples = examples.filter((b) => b.includes("GITLAB_JALA_TOKEN"));
    expect(jalaExamples.length).toBeGreaterThanOrEqual(7);
  });

  it("has Jala-specific match terms", async () => {
    const raw = await fs.readFile(new URL("../skills/gitlab-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("gitlab jala");
    expect(raw).toContain("jala gitlab");
    expect(raw).toContain("jala glab");
    expect(raw).toContain("jala merge request");
    expect(raw).toContain("jala mr");
    expect(raw).toContain("jala pipeline");
    expect(raw).toContain("atnic");
  });

  it("defaults to atnic group for all Jala repo operations", async () => {
    const raw = await fs.readFile(new URL("../skills/gitlab-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("Default group");
    expect(raw).toContain("atnic");
    expect(raw).toContain("glab repo list --group atnic");
    expect(raw).toContain("atnic/core");
    expect(raw).toContain("--repo atnic");
  });
});
