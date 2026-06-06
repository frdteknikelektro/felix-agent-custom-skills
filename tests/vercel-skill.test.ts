import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("vercel skill", () => {
  it("keeps Vercel access split by text-guided read and write permissions", async () => {
    const raw = await fs.readFile(new URL("../skills/vercel/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("vercel.read");
    expect(raw).toContain("vercel.write");
    expect(raw).toContain("vercel:vercel.read");
    expect(raw).toContain("vercel:vercel.write");
    expect(raw).toContain("Use text-based permission judgment");
    expect(raw).toContain("Do not add or rely on hardcoded TypeScript command detection");
    expect(raw).toContain("If an operation is ambiguous, treat it as `vercel:vercel.write`");
  });

  it("keeps credentials in the runtime secret env without local env files", async () => {
    const raw = await fs.readFile(new URL("../skills/vercel/SKILL.md", import.meta.url), "utf8");

    expect(raw).not.toContain("source /run/secrets/.env");
    expect(raw).toContain("VERCEL_TOKEN");
    expect(raw).toContain('export VERCEL_TOKEN="$VERCEL_TOKEN"');
    expect(raw).toContain("Never print the token value");
    expect(raw).toContain("Never print credential values");
    expect(raw).toContain("Tokens are in the environment");
    expect(raw).not.toContain("VERCEL_JALA_TOKEN");
  });

  it("preserves explicit destructive-operation gating", async () => {
    const raw = await fs.readFile(new URL("../skills/vercel/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("Destructive operations are allowed only when the user explicitly asks");
    expect(raw).toContain("domains rm");
    expect(raw).toContain("projects rm");
    expect(raw).toContain("unlink");
    expect(raw).toContain("env rm");
    expect(raw).toContain("alias rm");
    expect(raw).toContain("certificates");
    expect(raw).toContain("Only run when the user explicitly asks");
  });

  it("checks for vercel CLI and defers to install-tool when missing", async () => {
    const raw = await fs.readFile(new URL("../skills/vercel/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("install-tool");
    expect(raw).toContain("CLI Not Found");
    expect(raw).toContain("Do not pre-emptively check for the CLI");
    expect(raw).toContain("The only gate in this skill is the permission gate");
  });

  it("includes quick examples with full env sourcing in every recipe", async () => {
    const raw = await fs.readFile(new URL("../skills/vercel/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("## Quick Examples");
    expect(raw).toContain("Deploy from scratch");
    expect(raw).toContain("Deploy and promote to production alias");
    expect(raw).toContain("Add an environment variable");
    expect(raw).toContain("Inspect a deployment and tail logs");
    expect(raw).toContain("Add a custom domain");
    expect(raw).toContain("Rollback a production deployment");
    expect(raw).toContain("List all projects");
    expect(raw).toContain("List environment variables for production");
    expect(raw).toContain("Set an alias");
    expect(raw).toContain("Team-scoped deployment");
    expect(raw).toContain("Pull env vars to local");
    expect(raw).toContain("Build a workspace project without deploying");
    expect(raw).toContain("Deploy a workspace project");
    expect(raw).toContain("vercel build --prod");

    // Every example includes env sourcing
    expect(raw).toContain("Copy the full sequence");
  });
});
