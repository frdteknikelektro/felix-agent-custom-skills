import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("shorebird-jala env", () => {
  it("keeps Shorebird values in the runtime secret env", async () => {
    const raw = await fs.readFile(new URL("../config/.env", import.meta.url), "utf8");
    const legacyToken = ["SHOREBIRD", "TOKEN"].join("_");

    expect(raw).toContain("SHOREBIRD_JALA_TOKEN");
    expect(raw).toContain("SHOREBIRD_JALA_APP_ID");
    expect(raw).toContain("SHOREBIRD_JALA_ORG_ID");
    expect(raw).toContain("397848cc-15b0-4052-926c-2b1c5cd3317c");
    expect(raw).toContain("5037");
    expect(raw).not.toContain(legacyToken);
  });
});
