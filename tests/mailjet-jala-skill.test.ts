import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("mailjet-jala skill", () => {
  it("declares the Jala overlay and delegates API details to Mailjet", async () => {
    const skillMarkdown = await fs.readFile(new URL("../skills/mailjet-jala/SKILL.md", import.meta.url), "utf8");

    expect(skillMarkdown).toContain("name: mailjet-jala");
    expect(skillMarkdown).toContain("permissions: read, send, write");
    expect(skillMarkdown).toContain("base [`mailjet`](../mailjet/SKILL.md) skill");
    expect(skillMarkdown).toContain("Recreating Mailjet endpoint recipes");
    expect(skillMarkdown).toContain("base skill’s confirmation rule applies to every Jala send and every state-changing write");
    expect(skillMarkdown).toContain("does not define one");
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

  it("uses secret Jala credentials and maps them to the base contract", async () => {
    const skillMarkdown = await fs.readFile(new URL("../skills/mailjet-jala/SKILL.md", import.meta.url), "utf8");

    expect(skillMarkdown).toContain("MAILJET_JALA_API_KEY");
    expect(skillMarkdown).toContain("MAILJET_JALA_SECRET_KEY");
    expect(skillMarkdown).toContain("MAILJET_JALA_API_BASE_URL");
    expect(skillMarkdown).toContain("secret: true");
    expect(skillMarkdown).toContain('export MAILJET_API_KEY="$MAILJET_JALA_API_KEY"');
    expect(skillMarkdown).toContain('export MAILJET_SECRET_KEY="$MAILJET_JALA_SECRET_KEY"');
    expect(skillMarkdown).toContain('export MAILJET_API_BASE_URL="${MAILJET_JALA_API_BASE_URL:-https://api.mailjet.com}"');
    expect(skillMarkdown).not.toMatch(/export MAILJET_API_KEY="\$MAILJET_API_KEY"/);
    expect(skillMarkdown).not.toMatch(/export MAILJET_SECRET_KEY="\$MAILJET_SECRET_KEY"/);
  });

  it("requires exact Jala targets and preserves the base safety checks", async () => {
    const skillMarkdown = await fs.readFile(new URL("../skills/mailjet-jala/SKILL.md", import.meta.url), "utf8");

    expect(skillMarkdown).toContain("exact validated Jala sender");
    expect(skillMarkdown).toContain("exact target, scope, and action immediately before every Jala send or state-changing write");
    expect(skillMarkdown).toContain("mailjet/SKILL.md");
    expect(skillMarkdown).toContain("mapped Jala variables");
    expect(skillMarkdown).toContain("accepted-versus-delivered");
  });
});
