import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);
const recipePath = path.join(repoRoot, "skills/deploy-jala/references/use-cases/deploy-jala-web.md");

describe("deploy-jala web recipe", () => {
  it("uses the expected branch and Composer command for each environment", async () => {
    const raw = await fs.readFile(recipePath, "utf8");

    expect(raw).toContain("Branch: staging uses `feature/compile-to-test`; production uses `release/*` or `master`.");
    expect(raw).not.toContain("git checkout feature/compile-to-test");
    expect(raw).not.toContain("git checkout master");
    expect(raw).not.toContain("/usr/bin/php7.3 composer");
    expect(raw).toContain("/usr/bin/php7.3 /home/ubuntu/bin/composer install");
    expect(raw).toContain("/usr/bin/php7.3 /home/ubuntu/bin/composer install --no-dev");
  });

  it("verifies the deployed application before reporting success", async () => {
    const raw = await fs.readFile(recipePath, "utf8");

    expect(raw).not.toContain("git branch --show-current");
    expect(raw).toContain("/usr/bin/php7.3 artisan --version");
  });
});
