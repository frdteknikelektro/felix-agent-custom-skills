import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);
const recipePath = path.join(repoRoot, "skills/deploy-jala/references/use-cases/deploy-jala-web.md");

describe("deploy-jala web recipe", () => {
  it("uses the expected branch and Composer command for each environment", async () => {
    const raw = await fs.readFile(recipePath, "utf8");

    expect(raw).toContain("git checkout feature/compile-to-test");
    expect(raw).toContain("git checkout master");
    expect(raw).not.toContain("/usr/bin/php7.3 composer");
    expect(raw).toContain("/home/ubuntu/bin/composer install");
    expect(raw).toContain("/home/ubuntu/bin/composer install --no-dev");
  });

  it("verifies the deployed branch before reporting success", async () => {
    const raw = await fs.readFile(recipePath, "utf8");

    expect(raw).toContain("git branch --show-current");
    expect(raw).toContain("= feature/compile-to-test && /usr/bin/php7.3 artisan --version");
    expect(raw).toContain("= master && /usr/bin/php7.3 artisan --version");
  });
});
