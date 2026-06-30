import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("posthog skill", () => {
  it("keeps PostHog access split by text-guided read and write permissions", async () => {
    const raw = await fs.readFile(new URL("../skills/posthog/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("posthog.read");
    expect(raw).toContain("posthog.write");
    expect(raw).not.toContain("posthog:posthog.read");
    expect(raw).not.toContain("posthog:posthog.write");
    expect(raw).toContain("Request the bare permission shown below");
    expect(raw).toContain("Use text-based permission judgment");
    expect(raw).toContain("Do not add or rely on hardcoded TypeScript command detection");
    expect(raw).toContain("If an operation is ambiguous, treat it as `posthog.write`");
    expect(raw).toContain("HogQL queries are `posthog.read`");
  });

  it("keeps credentials in the runtime secret env without local env files", async () => {
    const raw = await fs.readFile(new URL("../skills/posthog/SKILL.md", import.meta.url), "utf8");

    expect(raw).not.toContain("source /run/secrets/.env");
    expect(raw).toContain("POSTHOG_PERSONAL_KEY");
    expect(raw).toContain('export POSTHOG_PERSONAL_KEY="$POSTHOG_PERSONAL_KEY"');
    expect(raw).toContain("Never print the key value");
    expect(raw).toContain("Never print credential values");
    expect(raw).toContain("Tokens are in the environment");
    expect(raw).not.toContain("POSTHOG_JALA_PERSONAL_KEY");
  });

  it("routes command details into reference files", async () => {
    const raw = await fs.readFile(new URL("../skills/posthog/SKILL.md", import.meta.url), "utf8");
    const featureFlags = await fs.readFile(
      new URL("../skills/posthog/references/commands/feature-flags.md", import.meta.url),
      "utf8",
    );
    const hogql = await fs.readFile(new URL("../skills/posthog/references/commands/hogql-queries.md", import.meta.url), "utf8");

    expect(raw).toContain("[feature-flags](references/commands/feature-flags.md)");
    expect(raw).toContain("[hogql-queries](references/commands/hogql-queries.md)");
    expect(raw).toContain("[schema-and-taxonomy](references/commands/schema-and-taxonomy.md)");
    expect(raw).toContain("[quick-examples](references/commands/quick-examples.md)");
    expect(featureFlags).toContain("/feature_flags/");
    expect(hogql).toContain("/api/projects/{project_id}/query/");
    expect(hogql).toContain("Warn about PII");
  });

  it("preserves project confirmation and destructive-operation gates", async () => {
    const raw = await fs.readFile(new URL("../skills/posthog/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("Never guess a project ID");
    expect(raw).toContain("Destructive operations");
    expect(raw).toContain("DELETE");
    expect(raw).toContain("must be explicitly requested by the user");
  });
});
