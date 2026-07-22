import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("aws-jala skill", () => {
  it("uses bare AWS permissions for the aws-jala skill id", async () => {
    const raw = await fs.readFile(new URL("../skills/aws-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("aws.read");
    expect(raw).toContain("aws.write");
    expect(raw).not.toContain("aws-jala:aws.read");
    expect(raw).not.toContain("aws-jala:aws.write");
    expect(raw).toContain("Request the bare permission shown below");
  });

  it("uses AWS_JALA_* credentials and maps them to native AWS_* variables", async () => {
    const raw = await fs.readFile(new URL("../skills/aws-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("AWS_JALA_ACCESS_KEY_ID");
    expect(raw).toContain("AWS_JALA_SECRET_ACCESS_KEY");
    expect(raw).toContain("AWS_JALA_SESSION_TOKEN");
    expect(raw).toContain("AWS_JALA_REGION");
    expect(raw).not.toContain("source /run/secrets/.env");
    expect(raw).toContain('export AWS_ACCESS_KEY_ID="$AWS_JALA_ACCESS_KEY_ID"');
    expect(raw).toContain('export AWS_SECRET_ACCESS_KEY="$AWS_JALA_SECRET_ACCESS_KEY"');
    expect(raw).toContain("Never print credential values");
    expect(raw).toContain("Do not use credential files");
    expect(raw).toContain("do not require `AWS_JALA_PROFILE`");
    // Should not reference the generic AWS_ACCESS_KEY_ID as the source
    expect(raw).not.toMatch(/export AWS_ACCESS_KEY_ID="\$AWS_ACCESS_KEY_ID"/);
  });

  it("references the base aws skill for operation documentation", async () => {
    const raw = await fs.readFile(new URL("../skills/aws-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("../aws/SKILL.md");
    expect(raw).toContain("extends the base `aws` skill");
    expect(raw).toContain("only overrides the credential contract");
    expect(raw).toContain("Do not duplicate operation documentation");
    expect(raw).toContain("Read [../aws/SKILL.md](../aws/SKILL.md) for any operation not documented here");
  });

  it("routes use-case recipes to the base skill's references", async () => {
    const raw = await fs.readFile(new URL("../skills/aws-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("../aws/references/use-cases/cost-summary-monthly-report.md");
    expect(raw).toContain("../aws/references/use-cases/ec2-inventory.md");
    expect(raw).toContain("../aws/references/use-cases/iam-access-review.md");
    expect(raw).toContain("workspace/reports/aws-jala/cost-summary");
  });

  it("keeps destructive gating consistent with base skill", async () => {
    const raw = await fs.readFile(new URL("../skills/aws-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("Destructive operations are allowed only when the user explicitly asks");
    expect(raw).toContain("same gating as the base skill");
  });

  it("includes compact Jala-specific quick examples with credential mapping", async () => {
    const raw = await fs.readFile(new URL("../skills/aws-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("## Quick Examples");
    expect(raw).toContain('export AWS_ACCESS_KEY_ID="$AWS_JALA_ACCESS_KEY_ID"');
    expect(raw).toContain("aws sts get-caller-identity");
    expect(raw).toContain("aws ec2 describe-instances");
    expect(raw).toContain("aws iam list-users");
  });

  it("has Jala-specific match terms", async () => {
    const raw = await fs.readFile(new URL("../skills/aws-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("aws jala");
    expect(raw).toContain("jala aws");
    expect(raw).toContain("jala ec2");
    expect(raw).toContain("jala billing");
  });
});
