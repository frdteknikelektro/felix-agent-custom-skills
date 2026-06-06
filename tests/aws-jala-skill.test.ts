import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("aws-jala skill", () => {
  it("keeps AWS access split by text-guided read and write permissions", async () => {
    const raw = await fs.readFile(new URL("../skills/aws-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("aws.read");
    expect(raw).toContain("aws.write");
    expect(raw).toContain("aws-jala:aws.read");
    expect(raw).toContain("aws-jala:aws.write");
    expect(raw).toContain("Use text-based permission judgment");
    expect(raw).toContain("Do not add or rely on hardcoded TypeScript command detection");
    expect(raw).toContain("If an operation is ambiguous, treat it as `aws-jala:aws.write`");
  });

  it("keeps credentials in the runtime secret env without profile or skill-local env requirements", async () => {
    const raw = await fs.readFile(new URL("../skills/aws-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).not.toContain("source /run/secrets/.env");
    expect(raw).toContain("AWS_JALA_ACCESS_KEY_ID");
    expect(raw).toContain("AWS_JALA_SECRET_ACCESS_KEY");
    expect(raw).toContain("AWS_JALA_SESSION_TOKEN");
    expect(raw).toContain("AWS_JALA_REGION");
    expect(raw).toContain("Never print credential values");
    expect(raw).toContain("Do not use credential files");
    expect(raw).toContain("do not require `AWS_JALA_PROFILE`");
    expect(raw).not.toContain("AWS_PROFILE");
  });

  it("preserves explicit destructive-operation gating", async () => {
    const raw = await fs.readFile(new URL("../skills/aws-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("Destructive operations are allowed only when the user explicitly asks");
    expect(raw).toContain("deleting a bucket object");
    expect(raw).toContain("terminating an instance");
    expect(raw).toContain("deleting a stack");
    expect(raw).toContain("revoking IAM access");
  });

  it("keeps growing workflows as reference-backed use case recipes", async () => {
    const raw = await fs.readFile(new URL("../skills/aws-jala/SKILL.md", import.meta.url), "utf8");
    const monthlyReport = await fs.readFile(
      new URL("../skills/aws-jala/references/use-cases/cost-summary-monthly-report.md", import.meta.url),
      "utf8",
    );

    expect(raw).toContain("## Use Cases");
    expect(raw).toContain("repeatable operating recipes");
    expect(raw).toContain("references/use-cases/cost-summary-monthly-report.md");
    expect(raw).toContain("references/use-cases/ec2-inventory.md");
    expect(raw).toContain("references/use-cases/iam-access-review.md");
    expect(monthlyReport).toContain("# Cost Summary Monthly Report");
    expect(monthlyReport).toContain("latest completed calendar month");
    expect(monthlyReport).toContain("immediately previous completed calendar month");
    expect(monthlyReport).toContain("Allow explicit overrides");
    expect(monthlyReport).toContain("Required permission: `aws-jala:aws.read`");
    expect(monthlyReport).toContain("Six Cost Explorer JSON exports");
    expect(monthlyReport).toContain("Nine PNG charts");
    expect(monthlyReport).toContain("One markdown summary report");
    expect(monthlyReport).toContain("Do not call checked-in shell orchestration scripts");
    expect(monthlyReport).toContain("session-local Python files");
    expect(monthlyReport).toContain('RECORD_TYPE","Values":["Credit"]');
  });
});
