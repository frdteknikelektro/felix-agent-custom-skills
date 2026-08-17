import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("crisp skill", () => {
  it("defines the Crisp permission and credential contract", async () => {
    const skill = await fs.readFile(new URL("../skills/crisp/SKILL.md", import.meta.url), "utf8");

    expect(skill).toContain("name: crisp");
    expect(skill).toContain("permissions: read, send, write");
    expect(skill).toContain("CRISP_TOKEN_ID");
    expect(skill).toContain("CRISP_TOKEN_KEY");
    expect(skill).toContain("CRISP_WEBSITE_ID");
    expect(skill).toContain("https://api.crisp.chat");
    expect(skill).not.toContain("CRISP_TOKEN_TIER");
    expect(skill).not.toContain("X-Crisp-Tier");
    expect(skill).toContain("secret: true");
  });

  it("documents the standard operational sections and confirmation gates", async () => {
    const skill = await fs.readFile(new URL("../skills/crisp/SKILL.md", import.meta.url), "utf8");
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

    for (const section of sections) expect(skill).toContain(section);
    expect(skill).toContain("explicit confirmation naming the exact `website_id`");
    expect(skill).toContain("destructive confirmation naming the exact resource");
    expect(skill).toContain("429");
    expect(skill).toContain("420");
    expect(skill).toContain("report acceptance and returned identifiers separately from delivery");
    expect(skill).toContain("curl --");
    const quickExamples = await fs.readFile(
      new URL("../skills/crisp/references/quick-examples.md", import.meta.url),
      "utf8",
    );
    expect(quickExamples).toContain("--request PATCH");
  });

  it("links the operational references and keeps them substantive", async () => {
    const skill = await fs.readFile(new URL("../skills/crisp/SKILL.md", import.meta.url), "utf8");
    const references = [
      "authentication",
      "conversations",
      "people-and-visitors",
      "workspace-and-analytics",
      "quick-examples",
    ];

    for (const reference of references) {
      expect(skill).toContain(`references/${reference}.md`);
      const content = await fs.readFile(
        new URL(`../skills/crisp/references/${reference}.md`, import.meta.url),
        "utf8",
      );
      expect(content.trim().length).toBeGreaterThan(100);
      expect(content).toContain("https://docs.crisp.chat/");
    }
  });

  it("documents exact conversation, profile, visitor, inbox, and analytics routes", async () => {
    const conversations = await fs.readFile(
      new URL("../skills/crisp/references/conversations.md", import.meta.url),
      "utf8",
    );
    const people = await fs.readFile(
      new URL("../skills/crisp/references/people-and-visitors.md", import.meta.url),
      "utf8",
    );
    const workspace = await fs.readFile(
      new URL("../skills/crisp/references/workspace-and-analytics.md", import.meta.url),
      "utf8",
    );

    expect(conversations).toContain("/v1/website/{website_id}/conversation/{session_id}/messages");
    expect(conversations).toContain("/v1/website/{website_id}/conversation/{session_id}/message");
    expect(conversations).toContain('"state": "resolved"');
    expect(conversations).toContain("timestamp_before");
    expect(people).toContain("/v1/website/{website_id}/people/profile/{people_id}");
    expect(people).toContain("/v1/website/{website_id}/people/export/profiles");
    expect(people).toContain("sent by email to the requesting user");
    expect(people).toContain("/v1/website/{website_id}/visitors/list/{page_number}");
    expect(workspace).toContain("/v1/website/{website_id}/inboxes/list/{page_number}");
    expect(workspace).toContain("/v1/website/{website_id}/analytics/generate");
    expect(workspace).toContain("/v1/website/{website_id}/campaign/{campaign_id}/dispatch");
  });
});
