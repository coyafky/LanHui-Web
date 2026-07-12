import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");
const scriptPath = resolve(import.meta.dirname, "verify-static-images.mjs");

describe("verify-static-images", () => {
  it("accepts every image referenced by confirmed static store data", () => {
    const output = execFileSync(process.execPath, [scriptPath], {
      cwd: projectRoot,
      encoding: "utf8",
    });

    expect(output).toContain("Store images referenced: 1");
    expect(output).not.toContain("Missing files");
  });
});
