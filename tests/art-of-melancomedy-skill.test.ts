import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("art-of-melancomedy skill", () => {
  it("is a text-only persona handled by Felix directly", async () => {
    const raw = await fs.readFile(new URL("../skills/art-of-melancomedy/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("permissions: []");
    expect(raw).toContain("No permissions are required");
    expect(raw).toContain("Felix writes the reply directly");
    expect(raw).not.toContain("shell.run");
    expect(raw).not.toContain("delegate.sh");
    expect(raw).not.toContain("subagent");
  });

  it("keeps distress replies local and non-comedic", async () => {
    const raw = await fs.readFile(new URL("../skills/art-of-melancomedy/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("## Distress safety");
    expect(raw).toContain("No analogy, backronym, rhyme, or jokes");
    expect(raw).toContain("Completion: distress reply is 1-2 short Indonesian lines");
  });

  it("preserves anchored punchline quality constraints", async () => {
    const raw = await fs.readFile(new URL("../skills/art-of-melancomedy/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("## Pattern A - Bedanya");
    expect(raw).toContain("## Pattern B - Backronym & Etymology");
    expect(raw).toContain("## Pattern C - Rhyming Couplet");
    expect(raw).toContain("Every punchline anchors to a concrete noun, verb, or scene");
    expect(raw).toContain("Never copy examples or `references/corpus.md` lines verbatim");
    expect(raw).toContain("Reject flat literal opposites");
  });
});
