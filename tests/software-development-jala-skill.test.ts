import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("software-development-jala skill", () => {
  it("documents itself as an overlay that depends on base software-development", async () => {
    const raw = await fs.readFile(new URL("../skills/software-development-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("id: software-development-jala");
    expect(raw).toContain("This is an overlay skill");
    expect(raw).toContain("Deploy it with the base `software-development` skill");
    expect(raw).toContain("If the base skill is unavailable, stop and report the missing dependency");
  });

  it("registers project profiles via dynamic directory discovery", async () => {
    const raw = await fs.readFile(new URL("../skills/software-development-jala/SKILL.md", import.meta.url), "utf8");

    expect(raw).toContain("references/projects/<project-name>.md");
    expect(raw).toContain("list the files in `references/projects/`");
    expect(raw).toContain("No changes to this skill file are required");

    const projectsDir = new URL("../skills/software-development-jala/references/projects/", import.meta.url);
    const entries = await fs.readdir(projectsDir);
    const mdFiles = entries.filter((e) => e.endsWith(".md"));

    expect(mdFiles.length).toBeGreaterThanOrEqual(4);
    for (const file of mdFiles) {
      const name = file.replace(/\.md$/, "");
      expect(raw).not.toContain(`- ${name}`);
    }
  });

  it("requires local git identity confirmation before commit or push in every project profile", async () => {
    for (const project of ["jala-web", "jala-web-next", "jala-point", "jala-odoo-custom-addons"]) {
      const raw = await fs.readFile(
        new URL(`../skills/software-development-jala/references/projects/${project}.md`, import.meta.url),
        "utf8",
      );

      expect(raw).toContain("git config --local user.name");
      expect(raw).toContain("git config --local user.email");
      expect(raw).not.toContain("git config --global");
      expect(raw).toContain("Do not commit or push until local `user.name` and `user.email` are confirmed with the user");
    }
  });

  it("pins jala-web hard branch policy", async () => {
    const raw = await fs.readFile(
      new URL("../skills/software-development-jala/references/projects/jala-web.md", import.meta.url),
      "utf8",
    );

    expect(raw).toContain("`master` is the Production Branch");
    expect(raw).toContain("Canonical repository: `https://gitlab.com/atnic/jala-web`");
    expect(raw).toContain("`develop` is the Next Release Branch");
    expect(raw).toContain("`feature/compile-to-test` is the Staging Integration Branch");
    expect(raw).toContain("All implementation changes must be made on the original `feature/*` branch");
    expect(raw).toContain("Do not update `master`, `develop`, or `feature/compile-to-test` directly");
    expect(raw).toContain("ask for the branch name before editing code");
    expect(raw).toContain("Do not delete `feature/*` branches");
    expect(raw).toContain("Do not delete published `release/*` branches");
  });

  it("documents jala-web staging conflict branch flow", async () => {
    const raw = await fs.readFile(
      new URL("../skills/software-development-jala/references/projects/jala-web.md", import.meta.url),
      "utf8",
    );

    expect(raw).toContain("Create a new staging-resolution branch from the original `feature/*` branch");
    expect(raw).toContain("Merge `feature/compile-to-test` into that staging-resolution branch locally");
    expect(raw).toContain("Name staging-resolution branches as `feature/<original-name>-staging`");
    expect(raw).toContain("Do not rewrite, delete, or replace the original `feature/*` branch");
  });

  it("pins jala-web-next as jala-web policy with main as production", async () => {
    const raw = await fs.readFile(
      new URL("../skills/software-development-jala/references/projects/jala-web-next.md", import.meta.url),
      "utf8",
    );

    expect(raw).toContain("Canonical repository: `https://github.com/Atnic/jala-web-next`");
    expect(raw).toContain("`main` is the Production Branch");
    expect(raw).toContain("`develop` is the Next Release Branch");
    expect(raw).toContain("`feature/compile-to-test` is the Staging Integration Branch");
    expect(raw).toContain("All implementation changes must be made on the original `feature/*` branch");
    expect(raw).toContain("Do not update `main`, `develop`, or `feature/compile-to-test` directly");
    expect(raw).toContain("Normal development PRs must target `feature/compile-to-test`");
    expect(raw).toContain("Normal development PRs must not target `develop` or `main`");
    expect(raw).toContain("Name staging-resolution branches as `feature/<original-name>-staging`");
  });

  it("pins jala-point develop-as-staging workflow", async () => {
    const raw = await fs.readFile(
      new URL("../skills/software-development-jala/references/projects/jala-point.md", import.meta.url),
      "utf8",
    );

    expect(raw).toContain("`main` is the Production Branch");
    expect(raw).toContain("`develop` is the Staging Integration Branch");
    expect(raw).toContain("All implementation changes must be made on the original `feature/*` branch");
    expect(raw).toContain("Do not update `main` or `develop` directly");
    expect(raw).toContain("Normal development PRs must target `develop`");
    expect(raw).toContain("When a feature is satisfied and ready for production, open a PR from the original `feature/*` branch to `main`");
    expect(raw).toContain("Merge `develop` into that staging-resolution branch locally");
    expect(raw).toContain("Name staging-resolution branches as `feature/<original-name>-staging`");
  });

  it("pins jala-odoo-custom-addons module branch workflow", async () => {
    const raw = await fs.readFile(
      new URL("../skills/software-development-jala/references/projects/jala-odoo-custom-addons.md", import.meta.url),
      "utf8",
    );

    expect(raw).toContain("`16.0-staging` is the Staging Integration Branch");
    expect(raw).toContain("Work is module-based, not feature-based");
    expect(raw).toContain("Module branches must be named `16.0-modules-<module_name>`");
    expect(raw).toContain("Do not update `16.0-staging` directly");
    expect(raw).toContain("Normal module PRs must target `16.0-staging`");
    expect(raw).toContain("Merge `16.0-staging` into that staging-resolution branch locally");
    expect(raw).toContain("Name staging-resolution branches as `16.0-modules-<module_name>-staging`");
    expect(raw).toContain("Do not rewrite, delete, or replace the original module branch");
  });
});
