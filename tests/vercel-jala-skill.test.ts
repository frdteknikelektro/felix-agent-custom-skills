import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("vercel-jala skill", () => {
  it("uses bare Vercel permissions for the vercel-jala skill id", async () => {
    const raw = await fs.readFile(new URL("../skills/vercel-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("vercel.read");
    expect(raw).toContain("vercel.write");
    expect(raw).not.toContain("vercel-jala:vercel.read");
    expect(raw).not.toContain("vercel-jala:vercel.write");
    expect(raw).toContain("Request the bare permission shown below");
  });

  it("uses VERCEL_JALA_TOKEN and maps it to VERCEL_TOKEN", async () => {
    const raw = await fs.readFile(new URL("../skills/vercel-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("VERCEL_JALA_TOKEN");
    expect(raw).toContain('export VERCEL_TOKEN="$VERCEL_JALA_TOKEN"');
    expect(raw).not.toContain("source /run/secrets/.env");
    expect(raw).toContain("Never print the token value");
    expect(raw).toContain("Tokens are in the environment");
    // Should NOT reference the generic VERCEL_TOKEN as the source
    expect(raw).not.toMatch(/export VERCEL_TOKEN="\$VERCEL_TOKEN"/);
  });

  it("references the base vercel skill for operation documentation", async () => {
    const raw = await fs.readFile(new URL("../skills/vercel-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("../vercel/SKILL.md");
    expect(raw).toContain("extends the base `vercel` skill");
    expect(raw).toContain("only overrides the credential contract");
    expect(raw).toContain("Do not duplicate operation documentation");
    expect(raw).toContain("Read [../vercel/SKILL.md](../vercel/SKILL.md) for any operation not documented here");
  });

  it("keeps destructive gating consistent with base skill", async () => {
    const raw = await fs.readFile(new URL("../skills/vercel-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("Destructive operations are allowed only when the user explicitly asks");
    expect(raw).toContain("same gating as the base skill");
  });

  it("includes Jala-specific quick examples with env sourcing", async () => {
    const raw = await fs.readFile(new URL("../skills/vercel-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("## Quick Examples");
    expect(raw).toContain("Deploy a Jala project");
    expect(raw).toContain("List Jala environment variables");
    expect(raw).toContain("Add a Jala environment variable");
    expect(raw).toContain("Inspect a Jala deployment");
    expect(raw).toContain("Add a custom domain to a Jala project");
    expect(raw).toContain("Rollback a Jala production deployment");
    expect(raw).toContain("List all Jala projects");
    // Every example maps VERCEL_JALA_TOKEN
    const examples = raw.split("```bash");
    const jalaExamples = examples.filter((b) => b.includes("VERCEL_JALA_TOKEN"));
    expect(jalaExamples.length).toBeGreaterThanOrEqual(7);
  });

  it("has Jala-specific match terms", async () => {
    const raw = await fs.readFile(new URL("../skills/vercel-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("vercel jala");
    expect(raw).toContain("jala vercel");
    expect(raw).toContain("jala deploy");
    expect(raw).toContain("jala domain");
    expect(raw).toContain("jala env");
    expect(raw).toContain("jala logs");
  });
});
