import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("onesignal skill", () => {
  it("defines OneSignal permissions and separates app and organization credentials", async () => {
    const skillMarkdown = await fs.readFile(new URL("../skills/onesignal/SKILL.md", import.meta.url), "utf8");

    expect(skillMarkdown).toContain("name: onesignal");
    expect(skillMarkdown).toContain("permissions: read, send, write");
    expect(skillMarkdown).toContain("Permissions are skill-local");
    expect(skillMarkdown).not.toContain("permissions: onesignal.read");
    expect(skillMarkdown).toContain("ONESIGNAL_APP_ID");
    expect(skillMarkdown).toContain("secret: false");
    expect(skillMarkdown).toContain("ONESIGNAL_APP_API_KEY");
    expect(skillMarkdown).toContain("ONESIGNAL_ORG_API_KEY");
    expect(skillMarkdown).toContain("secret: true");
    expect(skillMarkdown).toContain("Authorization: Key");
    expect(skillMarkdown).toContain("Felix injects the declared variables");
  });

  it("uses the documented Felix skill structure and safety gates", async () => {
    const skillMarkdown = await fs.readFile(new URL("../skills/onesignal/SKILL.md", import.meta.url), "utf8");
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
    expect(skillMarkdown).toContain("Every send and every state-changing write requires explicit confirmation");
    expect(skillMarkdown).toContain("Deletions and message cancellation require an explicit destructive confirmation");
    expect(skillMarkdown).toContain("exactly one targeting method");
    expect(skillMarkdown).toContain("20,000-entry audience limits");
    expect(skillMarkdown).toContain("accepted/created, not delivered");
    expect(skillMarkdown).toContain("legacy Player/device endpoints");
  });

  it("keeps linked references non-empty and local links resolvable", async () => {
    const skillMarkdown = await fs.readFile(new URL("../skills/onesignal/SKILL.md", import.meta.url), "utf8");
    const references = [
      "messaging",
      "users-and-subscriptions",
      "messages-and-delivery",
      "exports",
      "apps-and-auth",
      "quick-examples",
    ];

    for (const reference of references) {
      expect(skillMarkdown).toContain(`references/${reference}.md`);
      const content = await fs.readFile(
        new URL(`../skills/onesignal/references/${reference}.md`, import.meta.url),
        "utf8",
      );
      expect(content.trim().length).toBeGreaterThan(80);
    }
  });

  it("documents current messaging, user, message, export, and app endpoints", async () => {
    const messaging = await fs.readFile(new URL("../skills/onesignal/references/messaging.md", import.meta.url), "utf8");
    const users = await fs.readFile(
      new URL("../skills/onesignal/references/users-and-subscriptions.md", import.meta.url),
      "utf8",
    );
    const messages = await fs.readFile(
      new URL("../skills/onesignal/references/messages-and-delivery.md", import.meta.url),
      "utf8",
    );
    const exportsReference = await fs.readFile(
      new URL("../skills/onesignal/references/exports.md", import.meta.url),
      "utf8",
    );
    const apps = await fs.readFile(new URL("../skills/onesignal/references/apps-and-auth.md", import.meta.url), "utf8");

    expect(messaging).toContain("POST /notifications");
    expect(messaging).toContain("include_aliases");
    expect(messaging).toContain("20,000");
    expect(messaging).toContain("documentation.onesignal.com");
    expect(users).toContain("POST /apps/{app_id}/users");
    expect(users).toContain("PATCH /apps/{app_id}/users/by/{alias_label}/{alias_id}");
    expect(users).toContain("DELETE /apps/{app_id}/subscriptions/{subscription_id}");
    expect(messages).toContain("GET /notifications/{message_id}?app_id={app_id}");
    expect(exportsReference).toContain("GET /notifications?app_id={app_id}&limit=50&offset=0");
    expect(exportsReference).toContain("POST /notifications/{message_id}/history");
    expect(exportsReference).toContain("7 days");
    expect(exportsReference).toContain("Professional or Enterprise");
    expect(exportsReference).toContain("Send History via OneSignal API");
    expect(exportsReference).toContain("does not include Journey-sent messages");
    expect(exportsReference).toContain("message was sent after that setting was enabled");
    expect(exportsReference).toContain("destination_url");
    expect(exportsReference).toContain("Event Streams");
    expect(apps).toContain("GET /apps");
    expect(apps).toContain("Organization API Key");
    expect(apps).toContain("App API Key");
  });
});
