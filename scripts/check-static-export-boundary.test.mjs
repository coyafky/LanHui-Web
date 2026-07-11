/**
 * check-static-export-boundary.test.mjs
 *
 * Tests for the static export boundary inspector.
 *
 * Contract:
 *   After Task 5 of the static site separation plan, all public-facing
 *   source files must have ZERO boundary violations. Admin/API/prisma
 *   paths are excluded from the static build output but tested here
 *   to confirm they still exist (they are removed from the static build
 *   but kept in the monorepo for the CMS deployment).
 */

import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

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
  it("detects boundary violations in the CURRENT state (pre-extraction)", () => {
    const result = runInspector();
    // The inspector should FAIL (exit 1) because violations exist now
    expect(result.exitCode).toBe(1);

    const output = result.stderr + result.stdout;

    // Must detect at least the core paths
    expect(output).toContain("path-exists: src/app/admin");
    expect(output).toContain("path-exists: src/app/api");
    expect(output).toContain("path-exists: src/lib/prisma.ts");
    expect(output).toContain("path-exists: prisma");

    // Must detect at least one forbidden import (data.ts imports @/lib/prisma and next-auth)
    expect(output).toMatch(/forbidden-import:.*@\/lib\/prisma/);

    // Must detect at least one API fetch call
    expect(output).toMatch(/api-fetch:/);
  });

  it("contract: after Task 5, violations must be ZERO for public-facing files", () => {
    // This test defines the target contract.
    // It WILL FAIL now because violations exist — this is intentional.
    // After Task 5 completes, this test should pass.
    const result = runInspector();
    expect(
      result.exitCode === 0,
      `Expected zero boundary violations, but got:\n${result.stderr}`,
    ).toBe(true);
  });

  it("reports violation count in output on failure", () => {
    const result = runInspector();
    expect(result.stderr).toMatch(/violation\(s\) found/);
  });

  it("produces clean success message when no violations", () => {
    // This test documents the expected output format.
    // Skip for now since violations exist.
    const expectedSuccess = "No static export boundary violations";
    const result = runInspector();
    if (result.exitCode === 0) {
      expect(result.stdout).toContain(expectedSuccess);
    }
  });
});
