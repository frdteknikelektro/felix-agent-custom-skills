import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("mailjet skill", () => {
  it("defines Mailjet permissions and the runtime credential contract", async () => {
    const skillMarkdown = await fs.readFile(new URL("../skills/mailjet/SKILL.md", import.meta.url), "utf8");

    expect(skillMarkdown).toContain("name: mailjet");
    expect(skillMarkdown).toContain("permissions: read, send, write");
    expect(skillMarkdown).toContain("Permissions are skill-local");
    expect(skillMarkdown).not.toContain("permissions: mailjet.read");
    expect(skillMarkdown).toContain("MAILJET_API_KEY");
    expect(skillMarkdown).toContain("MAILJET_SECRET_KEY");
    expect(skillMarkdown).toContain("secret: true");
    expect(skillMarkdown).toContain("MAILJET_API_BASE_URL");
    expect(skillMarkdown).toContain("Basic Auth");
    expect(skillMarkdown).toContain("Felix injects the declared variables");
  });

  it("uses the documented skill structure and gates writes", async () => {
    const skillMarkdown = await fs.readFile(new URL("../skills/mailjet/SKILL.md", import.meta.url), "utf8");
    const sections = [
      "## Purpose",
      "## When to use",
      "## Out of scope",
      "## Use Cases",
      "## Permissions",
      "## Workflow",
      "## Environment",
      "## Checks",
    ];

    for (const section of sections) expect(skillMarkdown).toContain(section);
    expect(skillMarkdown).toContain("Every send and every write that creates, updates, validates, imports, subscribes, unsubscribes, changes callback configuration, or deletes Mailjet state requires explicit confirmation");
    expect(skillMarkdown).toContain("Before every send or state-changing write, confirm the exact target, scope, and action");
    expect(skillMarkdown).toContain("registered and validated sender");
    expect(skillMarkdown).toContain("documented 50-message limit");
    expect(skillMarkdown).toContain("SandboxMode: true");
    expect(skillMarkdown).toContain("accepted/queued rather than delivered");
  });

  it("keeps linked references non-empty and local links resolvable", async () => {
    const skillMarkdown = await fs.readFile(new URL("../skills/mailjet/SKILL.md", import.meta.url), "utf8");
    const references = [
      "sending",
      "contacts-and-lists",
      "senders",
      "templates",
      "events-and-statistics",
      "quick-examples",
    ];

    for (const reference of references) {
      expect(skillMarkdown).toContain(`references/${reference}.md`);
      const content = await fs.readFile(
        new URL(`../skills/mailjet/references/${reference}.md`, import.meta.url),
        "utf8",
      );
      expect(content.trim().length).toBeGreaterThan(80);
    }
  });

  it("documents current Send API, contact jobs, templates, and delivery evidence", async () => {
    const sending = await fs.readFile(new URL("../skills/mailjet/references/sending.md", import.meta.url), "utf8");
    const contacts = await fs.readFile(
      new URL("../skills/mailjet/references/contacts-and-lists.md", import.meta.url),
      "utf8",
    );
    const templates = await fs.readFile(new URL("../skills/mailjet/references/templates.md", import.meta.url), "utf8");
    const events = await fs.readFile(
      new URL("../skills/mailjet/references/events-and-statistics.md", import.meta.url),
      "utf8",
    );

    expect(sending).toContain("POST /v3.1/send");
    expect(sending).toContain("Every send requires explicit confirmation immediately before submission");
    expect(sending).toContain("SandboxMode");
    expect(sending).toContain("MessageUUID");
    expect(sending).toContain("dev.mailjet.com");
    expect(contacts).toContain("/contact/managemanycontacts");
    expect(contacts).toContain("JobID");
    expect(contacts).toContain("/contactslist/{list_ID}/managemanycontacts/{job_ID}");
    expect(contacts).toContain("/contactslist/{list_ID}/importlist/{job_ID}");
    expect(templates).toContain("/detailcontent");
    expect(templates).toContain("PUT");
    expect(events).toContain("/messagehistory");
    expect(events).toContain("/statcounters");
  });
});
