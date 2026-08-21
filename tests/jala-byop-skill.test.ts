import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("jala-byop skill", () => {
  it("defines the standalone Jala calculation contract", async () => {
    const raw = await fs.readFile(new URL("../skills/jala-byop/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("name: jala-byop");
    expect(raw).toContain("Jala BYOP");
    expect(raw).toContain("JALA_BYOP_API_BASE_URL");
    expect(raw).toContain("JALA_BYOP_ACCESS_TOKEN");
    expect(raw).not.toContain("JALA_API_BASE_URL");
    expect(raw).not.toContain("JALA_ACCESS_TOKEN");
    expect(raw).toContain("calculation.read");
    expect(raw).toContain("calculation.write");
    expect(raw).toContain("current turn");
    expect(raw).toContain("direct result-row editing");
  });

  it("routes the detailed workflow through a maintained reference", async () => {
    const raw = await fs.readFile(new URL("../skills/jala-byop/SKILL.md", import.meta.url), "utf8");
    const workflow = await fs.readFile(
      new URL("../skills/jala-byop/references/calculation-workflow.md", import.meta.url),
      "utf8",
    );

    expect(raw).toContain("references/calculation-workflow.md");
    expect(raw).toContain("scripts/client.py");
    expect(workflow).toContain("Freshness gate");
    expect(workflow).toContain("POST /api/cycles/{cycle_id}/calculation/preview");
    expect(workflow).toContain("PUT    /api/cycles/{id}/calculation");
    expect(workflow).toContain("DELETE /api/farms/{id}/calculation");
    expect(workflow).toContain("AuthoringLoop");
    expect(workflow).toContain("verify_applied");
    expect(workflow).toContain("passed_with_warnings");
  });

  it("bundles the dependency-free client under the Jala credential names", async () => {
    const client = await fs.readFile(new URL("../skills/jala-byop/scripts/client.py", import.meta.url), "utf8");
    const yaml = await fs.readFile(new URL("../skills/jala-byop/agents/openai.yaml", import.meta.url), "utf8");

    expect(client).toContain("JALA_BYOP_API_BASE_URL");
    expect(client).toContain("JALA_BYOP_ACCESS_TOKEN");
    expect(client).not.toContain("JALA_API_BASE_URL");
    expect(client).not.toContain("JALA_ACCESS_TOKEN");
    expect(client).toContain("class AuthoringLoop");
    expect(client).toContain("def verify_applied");
    expect(client).toContain("no prediction interpreter");
    expect(yaml).toContain('display_name: "Jala BYOP"');
    expect(yaml).toContain("$jala-byop");
  });

  it("documents the catalog entry", async () => {
    const readme = await fs.readFile(new URL("../README.md", import.meta.url), "utf8");

    expect(readme).toContain("`jala-byop`");
    expect(readme).toContain("Bring Your Own Prediction");
  });
});

