import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

const read = (path: string) => fs.readFile(new URL(`../skills/${path}`, import.meta.url), "utf8");

describe("jala-byop skill", () => {
  it("follows the skill template and runs on the jali thread credential", async () => {
    const raw = await read("jala-byop/SKILL.md");

    expect(raw).toContain("name: jala-byop");
    expect(raw).toContain("author: felix-agent");
    for (const section of ["Purpose", "When to use", "Out of scope", "Use Cases", "Permissions", "Workflow", "Environment", "Checks"]) {
      expect(raw).toContain(`## ${section}`);
    }
    expect(raw).not.toMatch(/^\s*permissions:/m);
    expect(raw).not.toMatch(/^env:/m);
    expect(raw).not.toContain("JALA_BYOP_");
    expect(raw).toContain("requires no permission grant");
    expect(raw).toContain("`jali` helper");
    expect(raw).toContain("--event-file <current_event>");
    expect(raw).toContain("explicit approval in the current turn");
    expect(raw).toContain("jala partial harvest");
    const description = raw.split("metadata:")[0];
    expect(description).toContain("thread_key starts with api:jala-byop-");
    expect(description).toContain("jali (production)");
    expect(description).toContain("jali-staging (staging)");
    expect(raw).toContain("`thread_key` starting with `api:jala-byop-`");
    expect(raw.match(/Completion:/g)?.length).toBeGreaterThanOrEqual(5);
  });

  it("keeps one maintained calculation workflow", async () => {
    const raw = await read("jala-byop/SKILL.md");
    const workflow = await read("jala-byop/references/calculation-workflow.md");

    expect(raw).toContain("references/calculation-workflow.md");
    expect(workflow).not.toContain("JALA_BYOP_");
    expect(workflow).toContain("## Thread transport");
    expect(workflow).toContain("RemoteCalculationClient.for_event(current_event)");
    expect(workflow).toContain("Freshness gate");
    expect(workflow).toContain("GET /api/calculation_contract");
    expect(workflow).toContain("POST /api/cycles/{cycle_id}/calculation/preview");
    expect(workflow).toContain("PUT    /api/cycles/{id}/calculation");
    expect(workflow).toContain("DELETE /api/farms/{id}/calculation");
    expect(workflow).toContain("AuthoringLoop");
    expect(workflow).toContain("verify_applied");
    expect(workflow).toContain("passed_with_warnings");
    expect(workflow).toContain("### FR-preserving future partial harvest");
    expect(workflow).toContain("0.425 * harvest");
    await expect(read("jali/references/calculation-workflow.md")).rejects.toThrow();
    await expect(read("jali/references/use-cases/byop-widget.md")).rejects.toThrow();
  });

  it("owns the widget protocol, including prompt choices within the widget parser limits", async () => {
    const raw = await read("jala-byop/SKILL.md");
    const widget = await read("jala-byop/references/widget-protocol.md");

    expect(raw).toContain("references/widget-protocol.md");
    expect(widget).toContain("<byop-panel>JSON</byop-panel>");
    expect(widget).toContain("<byop-action>");
    expect(widget).toContain("## Prompt choices");
    expect(widget).toContain("`options` holds 1–4 objects with exactly `label` and `prompt`");
    expect(widget).toContain("`label` is 1–64 characters");
    expect(widget).toContain("`prompt` is 1–2000 characters");
    const example = widget.match(/<byop-prompts>(\{.*\})<\/byop-prompts>/);
    expect(example).not.toBeNull();
    const parsed = JSON.parse(example![1]);
    expect(parsed.version).toBe(1);
    expect(parsed.options.length).toBeGreaterThan(0);
  });

  it("sends every client call through the jali helper", async () => {
    const client = await read("jala-byop/scripts/client.py");
    const yaml = await read("jala-byop/agents/openai.yaml");

    expect(client).toContain('DEFAULT_HELPER = Path(__file__).resolve().parents[2] / "jali" / "scripts" / "jali.py"');
    expect(client).toContain("class JaliTransport");
    expect(client).toContain('"--event-file", self.event_file, "request"');
    expect(client).not.toContain("JALA_BYOP_");
    expect(client).not.toContain("Authorization");
    expect(client).toContain('return self._request("GET", "calculation_contract")');
    expect(client).toContain("class AuthoringLoop");
    expect(client).toContain("def verify_applied");
    expect(client).toContain("no prediction interpreter");
    expect(yaml).toContain('display_name: "Jala BYOP"');
    expect(yaml).toContain("$jala-byop");
  });

  it("points jali at the BYOP skill", async () => {
    const jali = await read("jali/SKILL.md");
    const readme = await fs.readFile(new URL("../README.md", import.meta.url), "utf8");

    expect(jali).toContain("use the `jala-byop` skill");
    expect(readme).toContain("`jala-byop`");
    expect(readme).toContain("Bring Your Own Prediction");
  });
});
