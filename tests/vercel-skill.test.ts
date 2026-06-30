import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("vercel skill", () => {
  it("keeps Vercel access split by text-guided read and write permissions", async () => {
    const raw = await fs.readFile(new URL("../skills/vercel/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("vercel.read");
    expect(raw).toContain("vercel.write");
    expect(raw).not.toContain("vercel:vercel.read");
    expect(raw).not.toContain("vercel:vercel.write");
    expect(raw).toContain("Request the bare permission shown below");
    expect(raw).toContain("Use text-based permission judgment");
    expect(raw).toContain("Do not add or rely on hardcoded TypeScript command detection");
    expect(raw).toContain("If an operation is ambiguous, treat it as `vercel.write`");
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
    const domains = await fs.readFile(new URL("../skills/vercel/references/commands/domains.md", import.meta.url), "utf8");

    expect(raw).toContain("Destructive operations are allowed only when the user explicitly asks");
    expect(raw).toContain("domains rm");
    expect(raw).toContain("projects rm");
    expect(raw).toContain("unlink");
    expect(raw).toContain("env rm");
    expect(raw).toContain("alias rm");
    expect(raw).toContain("certificates");
    expect(domains).toContain("Only run when the user explicitly asks");
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
    const quickExamples = await fs.readFile(
      new URL("../skills/vercel/references/commands/quick-examples.md", import.meta.url),
      "utf8",
    );
    const buildExample = await fs.readFile(
      new URL("../skills/vercel/references/commands/build-a-workspace-project-without-deploying.md", import.meta.url),
      "utf8",
    );

    expect(raw).toContain("[quick-examples](references/commands/quick-examples.md)");
    expect(raw).toContain("[deploy-from-scratch](references/commands/deploy-from-scratch.md)");
    expect(raw).toContain("[deploy-and-promote-to-production-alias](references/commands/deploy-and-promote-to-production-alias.md)");
    expect(raw).toContain("[add-an-environment-variable](references/commands/add-an-environment-variable.md)");
    expect(raw).toContain("[inspect-a-deployment-and-tail-logs](references/commands/inspect-a-deployment-and-tail-logs.md)");
    expect(raw).toContain("[add-a-custom-domain](references/commands/add-a-custom-domain.md)");
    expect(raw).toContain("[rollback-a-production-deployment](references/commands/rollback-a-production-deployment.md)");
    expect(raw).toContain("[list-all-projects-and-their-latest-deployments]");
    expect(raw).toContain("[list-environment-variables-for-production]");
    expect(raw).toContain("[set-an-alias-to-point-a-deployment-to-a-domain]");
    expect(raw).toContain("[team-scoped-deployment]");
    expect(raw).toContain("[pull-env-vars-to-local-env-file]");
    expect(raw).toContain("[build-a-workspace-project-without-deploying]");
    expect(raw).toContain("[deploy-a-workspace-project-linked-with-vercel-json]");
    expect(buildExample).toContain("vercel build --prod");

    expect(quickExamples).toContain("Copy the full sequence");
  });
});
