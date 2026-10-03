import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

async function markdownFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await markdownFiles(file));
    else if (entry.name.endsWith(".md")) files.push(file);
  }
  return files;
}

describe("Skill display identity", () => {
  it("keeps Skill bodies and references independent of the product name", async () => {
    const directory = new URL("../skills/", import.meta.url);
    for (const file of await markdownFiles(directory.pathname)) {
      const raw = await fs.readFile(file, "utf8");
      const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
      expect(body, file).not.toMatch(/\bfelix\b/i);
    }
  });
});
