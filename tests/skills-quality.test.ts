import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);
const skillsRoot = path.join(repoRoot, "skills");

async function readSkillFiles() {
  const entries = await fs.readdir(skillsRoot, { withFileTypes: true });
  const skillFiles = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const file = path.join(skillsRoot, entry.name, "SKILL.md");
    try {
      const raw = await fs.readFile(file, "utf8");
      skillFiles.push({ id: entry.name, file, raw });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }

  return skillFiles;
}

async function readAllSkillTextFiles() {
  const files: string[] = [];

  async function walk(dir: string) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (entry.name.endsWith(".md") || entry.name.endsWith(".sh")) files.push(fullPath);
    }
  }

  await walk(skillsRoot);
  return Promise.all(files.map(async (file) => ({ file, raw: await fs.readFile(file, "utf8") })));
}

function frontmatterValue(raw: string, key: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return undefined;
  const value = match[1].match(new RegExp(`^${key}:\\s*(.*)$`, "m"))?.[1];
  return value?.replace(/^["']|["']$/g, "");
}

describe("skill quality guardrails", () => {
  it("keeps SKILL.md descriptions concise and ids aligned with directories", async () => {
    for (const skill of await readSkillFiles()) {
      expect(frontmatterValue(skill.raw, "id")).toBe(skill.id);
      expect(frontmatterValue(skill.raw, "description")?.length ?? 0, `${skill.id} description`).toBeLessThanOrEqual(300);
      expect(skill.raw.split(/\r?\n/).length, `${skill.id} line count`).toBeLessThanOrEqual(300);
    }
  });

  it("keeps local markdown links resolvable", async () => {
    const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;

    for (const skill of await readSkillFiles()) {
      for (const match of skill.raw.matchAll(linkPattern)) {
        const href = match[1];
        if (/^(https?:|mailto:|#)/.test(href)) continue;
        if (href.startsWith("<")) continue;

        const target = href.split("#")[0];
        if (!target) continue;

        const resolved = path.resolve(path.dirname(skill.file), target);
        await expect(fs.access(resolved), `${skill.id} link ${href}`).resolves.toBeUndefined();
      }
    }
  });

  it("does not use old deployment paths, namespaced permission literals, or permission bypass flags", async () => {
    const files = await readAllSkillTextFiles();

    for (const { file, raw } of files) {
      expect(raw, file).not.toContain("/home/agent/workspace/skills");
      expect(raw, file).not.toContain("workspace/skills/");
      expect(raw, file).not.toContain("--dangerously-skip-permissions");
      expect(raw, file).not.toContain("--dangerously-bypass-approvals-and-sandbox");
      expect(raw, file).not.toMatch(/\b[a-z][a-z-]+:[a-z][a-z-]+\.(read|write|review|run)\b/);
    }
  });

  it("does not leave linked command reference files as empty stubs", async () => {
    const files = await readAllSkillTextFiles();
    const commandReferences = files.filter(({ file }) => file.includes(`${path.sep}references${path.sep}commands${path.sep}`));

    for (const { file, raw } of commandReferences) {
      const body = raw
        .split(/\r?\n/)
        .filter((line) => line.trim() && !line.startsWith("#"))
        .join("\n");

      expect(body.length, file).toBeGreaterThan(40);
      expect(raw, file).toMatch(/```|\[[^\]]+\]\([^)]+\)|^\|.+\|$|^- .+/m);
    }
  });
});
