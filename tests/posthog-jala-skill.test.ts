import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("posthog-jala skill", () => {
  it("uses bare PostHog permissions for the posthog-jala skill id", async () => {
    const raw = await fs.readFile(new URL("../skills/posthog-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("posthog.read");
    expect(raw).toContain("posthog.write");
    expect(raw).not.toContain("posthog-jala:posthog.read");
    expect(raw).not.toContain("posthog-jala:posthog.write");
    expect(raw).toContain("Request the bare permission shown below");
  });

  it("uses POSTHOG_JALA_PERSONAL_KEY and maps it to POSTHOG_PERSONAL_KEY", async () => {
    const raw = await fs.readFile(new URL("../skills/posthog-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("POSTHOG_JALA_PERSONAL_KEY");
    expect(raw).toContain('export POSTHOG_PERSONAL_KEY="$POSTHOG_JALA_PERSONAL_KEY"');
    expect(raw).not.toContain("source /run/secrets/.env");
    expect(raw).toContain("Never print the key value");
    expect(raw).toContain("Tokens are in the environment");
    expect(raw).not.toMatch(/export POSTHOG_PERSONAL_KEY="\$POSTHOG_PERSONAL_KEY"/);
  });

  it("references the base posthog skill for operation documentation", async () => {
    const raw = await fs.readFile(new URL("../skills/posthog-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("../posthog/SKILL.md");
    expect(raw).toContain("extends the base `posthog` skill");
    expect(raw).toContain("only overrides the credential contract");
    expect(raw).toContain("Do not duplicate operation documentation");
    expect(raw).toContain("Read [../posthog/SKILL.md](../posthog/SKILL.md) for any operation not documented here");
  });

  it("keeps Jala organization routing explicit", async () => {
    const raw = await fs.readFile(new URL("../skills/posthog-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("org ID `10590`");
    expect(raw).toContain("org ID `28053`");
    expect(raw).toContain("references/jala-context.md");
    expect(raw).toContain("If there's ambiguity");
  });
});
