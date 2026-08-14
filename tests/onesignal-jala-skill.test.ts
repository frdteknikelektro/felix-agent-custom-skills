import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("onesignal-jala skill", () => {
  it("declares the Jala overlay and delegates API details to OneSignal", async () => {
    const skillMarkdown = await fs.readFile(new URL("../skills/onesignal-jala/SKILL.md", import.meta.url), "utf8");

    expect(skillMarkdown).toContain("name: onesignal-jala");
    expect(skillMarkdown).toContain("permissions: read, send, write");
    expect(skillMarkdown).toContain("base [`onesignal`](../onesignal/SKILL.md) skill");
    expect(skillMarkdown).toContain("Recreating OneSignal endpoint recipes");
    expect(skillMarkdown).toContain("does not define a canonical Jala App ID");
    expect(skillMarkdown).toContain("base skill’s confirmation rule applies to every Jala send");
    for (const section of [
      "## Purpose",
      "## When to use",
      "## Out of scope",
      "## Use Cases",
      "## Permissions",
      "## Workflow",
      "## Environment",
      "## Checks",
    ]) {
      expect(skillMarkdown).toContain(section);
    }
  });

  it("uses secret Jala credentials and maps both key scopes", async () => {
    const skillMarkdown = await fs.readFile(new URL("../skills/onesignal-jala/SKILL.md", import.meta.url), "utf8");

    expect(skillMarkdown).toContain("ONESIGNAL_JALA_APP_ID");
    expect(skillMarkdown).toContain("ONESIGNAL_JALA_APP_API_KEY");
    expect(skillMarkdown).toContain("ONESIGNAL_JALA_ORG_API_KEY");
    expect(skillMarkdown).toContain("ONESIGNAL_JALA_API_BASE_URL");
    expect(skillMarkdown).toContain("secret: true");
    expect(skillMarkdown).toContain('export ONESIGNAL_APP_ID="$ONESIGNAL_JALA_APP_ID"');
    expect(skillMarkdown).toContain('export ONESIGNAL_APP_API_KEY="$ONESIGNAL_JALA_APP_API_KEY"');
    expect(skillMarkdown).toContain('export ONESIGNAL_API_BASE_URL="${ONESIGNAL_JALA_API_BASE_URL:-https://api.onesignal.com}"');
    expect(skillMarkdown).toContain('export ONESIGNAL_ORG_API_KEY="$ONESIGNAL_JALA_ORG_API_KEY"');
    expect(skillMarkdown).not.toMatch(/export ONESIGNAL_APP_API_KEY="\$ONESIGNAL_APP_API_KEY"/);
    expect(skillMarkdown).not.toMatch(/export ONESIGNAL_ORG_API_KEY="\$ONESIGNAL_ORG_API_KEY"/);
  });

  it("preserves exact app targeting and the base safety rules", async () => {
    const skillMarkdown = await fs.readFile(new URL("../skills/onesignal-jala/SKILL.md", import.meta.url), "utf8");

    expect(skillMarkdown).toContain("exact Jala App ID");
    expect(skillMarkdown).toContain("exact app, audience, scope, and action immediately before every Jala send");
    expect(skillMarkdown).toContain("onesignal/SKILL.md");
    expect(skillMarkdown).toContain("App API Key and Organization API Key");
    expect(skillMarkdown).toContain("accepted-versus-delivered");
  });
});
