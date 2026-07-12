/**
 * check-static-export-boundary.test.mjs
 *
 * Tests for the static export boundary inspector.
 *
 * Contract:
 *   After Task 5 of the static site separation plan, all public-facing
 *   source files must have ZERO boundary violations.
 */

import { describe, it, expect } from "vitest";
import { execFileSync, execSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const SCRIPT = resolve(import.meta.dirname, "check-static-export-boundary.mjs");

function runInspector() {
  try {
    const output = execSync(`node "${SCRIPT}"`, {
      cwd: resolve(import.meta.dirname, ".."),
      encoding: "utf8",
      env: { ...process.env },
    });
    return { exitCode: 0, stdout: output, stderr: "" };
  } catch (err) {
    return {
      exitCode: err.status ?? 1,
      stdout: err.stdout?.toString() ?? "",
      stderr: err.stderr?.toString() ?? "",
    };
  }
}

describe("check-static-export-boundary", () => {
  it("post-extraction: zero violations, exit 0", () => {
    const result = runInspector();
    expect(result.exitCode).toBe(0);
  });

  it("contract: after Task 5, violations must be ZERO for public-facing files", () => {
    const result = runInspector();
    expect(
      result.exitCode === 0,
      `Expected zero boundary violations, but got:\n${result.stderr}`,
    ).toBe(true);
  });

  it("produces clean success message when no violations", () => {
    const expectedSuccess = "No static export boundary violations";
    const result = runInspector();
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(expectedSuccess);
  });

  it("rejects Prisma imports left in static-site scripts", () => {
    const fixtureRoot = mkdtempSync(join(tmpdir(), "static-boundary-"));
    try {
      mkdirSync(join(fixtureRoot, "scripts"), { recursive: true });
      mkdirSync(join(fixtureRoot, "src"), { recursive: true });
      const fixtureInspector = join(
        fixtureRoot,
        "scripts",
        "check-static-export-boundary.mjs",
      );
      copyFileSync(SCRIPT, fixtureInspector);
      writeFileSync(
        join(fixtureRoot, "scripts", "db-migration.ts"),
        'import { PrismaClient } from "@prisma/client";\n',
      );

      let exitCode = 0;
      let stderr = "";
      try {
        execFileSync(process.execPath, [fixtureInspector], {
          cwd: fixtureRoot,
          encoding: "utf8",
        });
      } catch (error) {
        exitCode = error.status ?? 1;
        stderr = error.stderr?.toString() ?? "";
      }

      expect(exitCode).toBe(1);
      expect(stderr).toContain("@prisma/client");
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });
});
