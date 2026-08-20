import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Jala repository routing ADR", () => {
  it("records the accepted routing and isolation boundary", async () => {
    const raw = await fs.readFile(
      new URL("../docs/adr/0002-jala-repository-routing-and-platform-isolation.md", import.meta.url),
      "utf8",
    );

    expect(raw).toContain("GitHub `Atnic/*` uses `github-jala`");
    expect(raw).toContain("GitLab `atnic/*` uses `gitlab-jala`");
    expect(raw).toContain("future exact `jala/*` namespace");
    expect(raw).toContain("fails closed");
    expect(raw).toContain("Existing permission declaration strings remain unchanged");
    expect(raw).toContain("remain in the `review` scope");
    expect(raw).toContain("Felix runtime");
  });
});
