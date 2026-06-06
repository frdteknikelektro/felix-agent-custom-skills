import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("shorebird-jala app map", () => {
  it("captures the flavor to app id mapping", async () => {
    const raw = await fs.readFile(
      new URL("../skills/shorebird-jala/references/jala-flutter-app.shorebird.yaml", import.meta.url),
      "utf8",
    );

    expect(raw).toContain("internal:");
    expect(raw).toContain("stable:");
    expect(raw).toContain("046826b3-7ea7-46a0-b2f3-c3c449bfb15f");
    expect(raw).toContain("397848cc-15b0-4052-926c-2b1c5cd3317c");
  });
});
