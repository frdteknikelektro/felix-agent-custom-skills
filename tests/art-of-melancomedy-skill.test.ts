import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("art-of-melancomedy skill", () => {
  it("requires shell.run for delegation and keeps distress replies local", async () => {
    const raw = await fs.readFile(new URL("../skills/art-of-melancomedy/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("- shell.run");
    expect(raw).toContain("Delegated punchline generation requires `shell.run`");
    expect(raw).toContain("Distress backoff replies do not require shell execution");
    expect(raw).toContain("do NOT call the subagent");
  });

  it("uses catalog skill paths instead of the old workspace skills path", async () => {
    const raw = await fs.readFile(new URL("../skills/art-of-melancomedy/SKILL.md", import.meta.url), "utf8");
    const script = await fs.readFile(new URL("../skills/art-of-melancomedy/scripts/delegate.sh", import.meta.url), "utf8");

    expect(raw).toContain("/catalog/skills/art-of-melancomedy");
    expect(script).toContain("/catalog/skills/art-of-melancomedy");
    expect(script).toContain("MELANCOMEDY_SKILL_DIR");
    expect(raw).not.toContain("/home/agent/workspace/skills");
    expect(script).not.toContain("/home/agent/workspace/skills");
  });

  it("does not bypass permissions or persist full prompt dumps", async () => {
    const script = await fs.readFile(new URL("../skills/art-of-melancomedy/scripts/delegate.sh", import.meta.url), "utf8");

    expect(script).not.toContain("--dangerously-skip-permissions");
    expect(script).not.toContain("--dangerously-bypass-approvals-and-sandbox");
    expect(script).not.toContain("PROMPT_DUMP");
    expect(script).not.toContain('printf \'%s\' "$PROMPT"');
  });
});
