import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("crisp-jala skill", () => {
  it("declares the Jala overlay and delegates endpoint knowledge", async () => {
    const skill = await fs.readFile(new URL("../skills/crisp-jala/SKILL.md", import.meta.url), "utf8");

    expect(skill).toContain("name: crisp-jala");
    expect(skill).toContain("base [`crisp`](../crisp/SKILL.md) skill");
    expect(skill).toContain("Recreating Crisp endpoint recipes");
    expect(skill).toContain("CRISP_JALA_TOKEN_ID");
    expect(skill).toContain("CRISP_JALA_TOKEN_KEY");
    expect(skill).toContain("CRISP_JALA_WEBSITE_ID");
    expect(skill).toContain("CRISP_JALA_API_BASE_URL");
    expect(skill).toContain("export CRISP_TOKEN_ID=\"$CRISP_JALA_TOKEN_ID\"");
    expect(skill).toContain("export CRISP_WEBSITE_ID=\"$CRISP_JALA_WEBSITE_ID\"");
    expect(skill).not.toContain("CRISP_JALA_EXTRA_HEADERS_JSON");
    expect(skill).not.toContain("CRISP_JALA_COOKIE");
    expect(skill).not.toMatch(/export CRISP_TOKEN_ID="\$CRISP_TOKEN_ID"/);
  });

  it("preserves Jala confirmation, deletion, and tier rules", async () => {
    const skill = await fs.readFile(new URL("../skills/crisp-jala/SKILL.md", import.meta.url), "utf8");

    expect(skill).toContain("permissions: read, send, write");
    expect(skill).toContain("exact Jala `website_id`");
    expect(skill).toContain("destructive confirmation");
    expect(skill).toContain("website/plugin tier");
    expect(skill).toContain("../crisp/SKILL.md");
    for (const section of ["## Purpose", "## When to use", "## Out of scope", "## Use Cases", "## Permissions", "## Workflow", "## Environment", "## Checks"]) {
      expect(skill).toContain(section);
    }
  });
});
