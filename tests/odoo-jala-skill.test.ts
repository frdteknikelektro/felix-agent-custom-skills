import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("odoo-jala skill", () => {
  it("keeps Odoo access split by text-guided read and write permissions", async () => {
    const raw = await fs.readFile(new URL("../skills/odoo-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("odoo.read");
    expect(raw).toContain("odoo.write");
    expect(raw).toContain("odoo-jala:odoo.read");
    expect(raw).toContain("odoo-jala:odoo.write");
    expect(raw).toContain("Use text-based permission judgment");
    expect(raw).toContain("Do not add or rely on hardcoded TypeScript command detection");
    expect(raw).toContain("treat it as `odoo-jala:odoo.write`");
  });

  it("uses ODOO_JALA_* env vars and never prints secrets", async () => {
    const raw = await fs.readFile(new URL("../skills/odoo-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("ODOO_JALA_URL");
    expect(raw).toContain("ODOO_JALA_DB");
    expect(raw).toContain("ODOO_JALA_USERNAME");
    expect(raw).toContain("ODOO_JALA_API_KEY");
    expect(raw).toContain("ODOO_JALA_PASSWORD");
    expect(raw).toContain("odoo.jala.tech");
    expect(raw).toContain("Never print credential values");
    expect(raw).toContain("Do not use credential files");
    expect(raw).toContain("Redact credential values");
  });

  it("preserves destructive-operation gating for unlink", async () => {
    const raw = await fs.readFile(new URL("../skills/odoo-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("Destructive operations are allowed only when the user explicitly asks");
    expect(raw).toContain("unlink");
    expect(raw).toContain("Confirm the record ID and model before proceeding");
    expect(raw).toContain("must be explicitly requested by the user before proceeding");
  });

  it("covers search_read, create, write, unlink, and fields_get", async () => {
    const raw = await fs.readFile(new URL("../skills/odoo-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("search_read");
    expect(raw).toContain("search_count");
    expect(raw).toContain("fields_get");
    expect(raw).toContain("render_report");
    expect(raw).toContain("Create a record");
    expect(raw).toContain("Update a record");
    expect(raw).toContain("Delete records");
    expect(raw).toContain("unlink");
  });

  it("includes Python xmlrpc.client as the transport", async () => {
    const raw = await fs.readFile(new URL("../skills/odoo-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("xmlrpc.client");
    expect(raw).toContain("/xmlrpc/2/common");
    expect(raw).toContain("/xmlrpc/2/object");
    expect(raw).toContain("/xmlrpc/2/report");
    expect(raw).toContain("authenticate(");
  });

  it("has report download via XML-RPC report endpoint", async () => {
    const raw = await fs.readFile(new URL("../skills/odoo-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("render_report");
    expect(raw).toContain("xmlrpc/2/report");
    expect(raw).toContain("account.report_invoice");
    expect(raw).toContain("sale.report_saleorder");
  });

  it("mentions Jala defaults and ir.model discovery", async () => {
    const raw = await fs.readFile(new URL("../skills/odoo-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("odoo.jala.tech");
    expect(raw).toContain("ODOO_JALA_URL");
    expect(raw).toContain("Jala-specific custom modules");
    expect(raw).toContain("ir.model");
  });

  it("follows template section ordering", async () => {
    const raw = await fs.readFile(new URL("../skills/odoo-jala/SKILL.md", import.meta.url), "utf8");

    const purpose = raw.indexOf("## Purpose");
    const when = raw.indexOf("## When to use");
    const out = raw.indexOf("## Out of scope");
    const useCases = raw.indexOf("## Use cases");
    const permissions = raw.indexOf("## Permissions");
    const workflow = raw.indexOf("## Workflow");
    const checks = raw.indexOf("## Checks");

    expect(purpose).toBeGreaterThan(0);
    expect(when).toBeGreaterThan(purpose);
    expect(out).toBeGreaterThan(when);
    expect(useCases).toBeGreaterThan(out);
    expect(permissions).toBeGreaterThan(useCases);
    expect(workflow).toBeGreaterThan(permissions);
    expect(checks).toBeGreaterThan(workflow);
  });
});
