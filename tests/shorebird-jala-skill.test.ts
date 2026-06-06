import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("shorebird-jala skill", () => {
  it("keeps the skill remote-only and env-driven", async () => {
    const raw = await fs.readFile(new URL("../skills/shorebird-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).not.toContain("source /run/secrets/.env");
    expect(raw).toContain('export SHOREBIRD_TOKEN="$SHOREBIRD_JALA_TOKEN"');
    expect(raw).toContain("SHOREBIRD_JALA_TOKEN");
    expect(raw).toContain("SHOREBIRD_JALA_APP_ID");
    expect(raw).toContain("npx shorebird");
    expect(raw).toContain("patches set-track");
    expect(raw).toContain("Do not read a live repo `shorebird.yaml`");
    expect(raw).toContain("pubspec.yaml");
  });
});
