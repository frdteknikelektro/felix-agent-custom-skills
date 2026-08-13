import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("mailgun skill", () => {
  it("defines Mailgun permissions and the runtime credential contract", async () => {
    const skillMarkdown = await fs.readFile(new URL("../skills/mailgun/SKILL.md", import.meta.url), "utf8");

    expect(skillMarkdown).toContain("name: mailgun");
    expect(skillMarkdown).toContain("permissions: read, send, write");
    expect(skillMarkdown).toContain("Permissions are skill-local");
    expect(skillMarkdown).not.toContain("permissions: mailgun.read");
    expect(skillMarkdown).toContain("MAILGUN_API_KEY");
    expect(skillMarkdown).toContain("secret: true");
    expect(skillMarkdown).toContain("MAILGUN_API_BASE_URL");
    expect(skillMarkdown).toContain("MAILGUN_DOMAIN");
    expect(skillMarkdown).toContain("Felix injects the declared variables");
  });

  it("documents region-aware endpoints and modern analytics APIs", async () => {
    const skillMarkdown = await fs.readFile(new URL("../skills/mailgun/SKILL.md", import.meta.url), "utf8");
    const analytics = await fs.readFile(
      new URL("../skills/mailgun/references/analytics.md", import.meta.url),
      "utf8",
    );

    expect(skillMarkdown).toContain("https://api.eu.mailgun.net");
    expect(skillMarkdown).toContain("https://api.mailgun.net");
    expect(analytics).toContain("/v1/analytics/logs");
    expect(analytics).toContain("/v1/analytics/metrics");
    expect(analytics).toContain("deprecated");
    expect(analytics).toContain("Completion:");
  });

  it("uses the documented skill structure and gates sending and destructive operations", async () => {
    const skillMarkdown = await fs.readFile(new URL("../skills/mailgun/SKILL.md", import.meta.url), "utf8");
    const sending = await fs.readFile(new URL("../skills/mailgun/references/sending.md", import.meta.url), "utf8");
    const sections = ["## Purpose", "## When to use", "## Out of scope", "## Use Cases", "## Permissions", "## Workflow", "## Environment", "## Checks"];

    for (const section of sections) expect(skillMarkdown).toContain(section);
    expect(skillMarkdown).toContain("update, rename, copy to an existing destination, import, or deletion");
    expect(skillMarkdown).toContain("explicit confirmation naming the exact target");
    expect(skillMarkdown).toContain("overwrite or remove existing state");
    expect(skillMarkdown).toContain("For sends, verify `from`");
    expect(skillMarkdown).toContain("Require a confirmed domain");
    expect(sending).toContain("Required permission: `send`");
    expect(sending).toContain("Resolve the recipient list");
    expect(sending).toContain("message ID");
  });

  it("keeps linked references non-empty and local links resolvable", async () => {
    const skillMarkdown = await fs.readFile(new URL("../skills/mailgun/SKILL.md", import.meta.url), "utf8");
    const references = [
      "sending",
      "domains-and-suppressions",
      "routes-and-webhooks",
      "templates",
      "analytics",
      "quick-examples",
    ];

    for (const reference of references) {
      expect(skillMarkdown).toContain(`references/${reference}.md`);
      const content = await fs.readFile(
        new URL(`../skills/mailgun/references/${reference}.md`, import.meta.url),
        "utf8",
      );
      expect(content.trim().length).toBeGreaterThan(80);
    }
  });

  it("documents direct suppression mutations and the official template rename path", async () => {
    const suppressions = await fs.readFile(
      new URL("../skills/mailgun/references/domains-and-suppressions.md", import.meta.url),
      "utf8",
    );
    const templates = await fs.readFile(new URL("../skills/mailgun/references/templates.md", import.meta.url), "utf8");

    expect(suppressions).toContain("POST /v3/{domain_name}/bounces");
    expect(suppressions).toContain("DELETE /v3/{domain_name}/bounces/{address}");
    expect(suppressions).toContain("POST /v3/{domain_name}/complaints");
    expect(suppressions).toContain("DELETE /v3/{domain_name}/complaints/{address}");
    expect(suppressions).toContain("documentation.mailgun.com");
    expect(templates).toContain("/templates/{template_name}/rename/{new_template_name}");
    expect(templates).not.toContain("update or rename a template");
    expect(templates).toContain("Updates, renames, copies to existing destinations, and deletions");
    expect(templates).toContain("documentation.mailgun.com");
  });

  it("uses domain_name as the only endpoint domain placeholder", async () => {
    const referenceFiles = [
      "analytics",
      "domains-and-suppressions",
      "quick-examples",
      "routes-and-webhooks",
      "sending",
      "templates",
    ];

    for (const reference of referenceFiles) {
      const referenceMarkdown = await fs.readFile(
        new URL(`../skills/mailgun/references/${reference}.md`, import.meta.url),
        "utf8",
      );
      expect(referenceMarkdown).not.toContain("{domain}");
      expect(referenceMarkdown).not.toContain("{name}");
    }
  });
});
