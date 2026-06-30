import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("shorebird-jala env", () => {
  it("declares the runtime Shorebird env contract without reading secret files", async () => {
    const raw = await fs.readFile(new URL("../skills/shorebird-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("SHOREBIRD_JALA_TOKEN");
    expect(raw).toContain("SHOREBIRD_JALA_APP_ID");
    expect(raw).toContain("SHOREBIRD_JALA_ORG_ID");
    expect(raw).not.toMatch(/^\s+- key: SHOREBIRD_TOKEN$/m);
  });
});
