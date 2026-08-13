import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("mailgun-jala skill", () => {
  it("declares the Jala overlay and isolates base operation permissions", async () => {
    const skillMarkdown = await fs.readFile(new URL("../skills/mailgun-jala/SKILL.md", import.meta.url), "utf8");

    expect(skillMarkdown).toContain("name: mailgun-jala");
    expect(skillMarkdown).toContain("permissions: read, send, write");
    expect(skillMarkdown).toContain("mailgun-jala");
    expect(skillMarkdown).toContain("base `mailgun` skill");
    expect(skillMarkdown).toContain("Recreating Mailgun endpoint recipes");
    expect(skillMarkdown).toContain("explicit confirmation rule applies to every Jala update");
    expect(skillMarkdown).toContain("overwrite or remove existing state");
    for (const section of ["## Purpose", "## When to use", "## Out of scope", "## Use Cases", "## Permissions", "## Workflow", "## Environment", "## Checks"]) {
      expect(skillMarkdown).toContain(section);
    }
  });

  it("uses secret Jala credentials and maps them to the base contract", async () => {
    const skillMarkdown = await fs.readFile(new URL("../skills/mailgun-jala/SKILL.md", import.meta.url), "utf8");

    expect(skillMarkdown).toContain("MAILGUN_JALA_API_KEY");
    expect(skillMarkdown).toContain("MAILGUN_JALA_API_BASE_URL");
    expect(skillMarkdown).toContain("MAILGUN_JALA_DOMAIN");
    expect(skillMarkdown).toContain("secret: true");
    expect(skillMarkdown).toContain('export MAILGUN_API_KEY="$MAILGUN_JALA_API_KEY"');
    expect(skillMarkdown).toContain('export MAILGUN_API_BASE_URL="${MAILGUN_JALA_API_BASE_URL:-https://api.mailgun.net}"');
    expect(skillMarkdown).toContain('export MAILGUN_DOMAIN="${MAILGUN_JALA_DOMAIN:-}"');
    expect(skillMarkdown).not.toMatch(/export MAILGUN_API_KEY="\$MAILGUN_API_KEY"/);
  });

  it("requires a confirmed Jala domain and routes API details to the base skill", async () => {
    const skillMarkdown = await fs.readFile(new URL("../skills/mailgun-jala/SKILL.md", import.meta.url), "utf8");

    expect(skillMarkdown).toContain("does not define one");
    expect(skillMarkdown).toContain("Require one for sending and domain-scoped work");
    expect(skillMarkdown).toContain("../mailgun/SKILL.md");
    expect(skillMarkdown).toContain("mailgun/SKILL.md");
    expect(skillMarkdown).toContain("Recreating Mailgun endpoint recipes");
  });
});
