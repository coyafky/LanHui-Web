/**
 * ZEEKR 图片 CI 校验脚本 测试
 *
 * 验证 scripts/verify-zeekr-images.mjs 的行为:
 * - 当前 zeekr/ 目录 21 张图 → 退出码 0 + "OK"
 * - 临时注入一张不符合规格的文件 → 退出码 1 + 失败信息
 *
 * 用 child_process.spawnSync 调用 .mjs,避免 import 解析差异。
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  cpSync,
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
  existsSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
// 测试位于 src/lib/,需要上溯 2 级到 repo root
const ROOT = join(__dirname, "..", "..");
const SCRIPT = join(ROOT, "scripts/verify-zeekr-images.mjs");
const SOURCE_SCAN_ROOT = join(ROOT, "public/images/products/zeekr");
let scanRoot = "";

function injectPath() {
  return join(scanRoot, "9x/_test_inject.webp");
}

function runScript() {
  return spawnSync("node", [SCRIPT], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 30_000,
    env: { ...process.env, ZEEKR_IMAGE_SCAN_ROOT: scanRoot },
  });
}

describe("PRD §8.6 verify-zeekr-images 集成行为", () => {
  beforeAll(() => {
    scanRoot = mkdtempSync(join(tmpdir(), "lanhui-zeekr-images-"));
    cpSync(SOURCE_SCAN_ROOT, scanRoot, { recursive: true });
  });

  afterAll(() => {
    if (scanRoot) rmSync(scanRoot, { recursive: true, force: true });
  });

  it("正常状态:21 张图全部通过 → 退出码 0 + stdout 含 'OK'", () => {
    const result = runScript();
    expect(result.status, `stderr: ${result.stderr}`).toBe(0);
    expect(result.stdout).toMatch(/扫描 21 个文件/);
    expect(result.stdout).toMatch(/所有校验通过/);
    expect(result.stderr).toBe("");
  });

  it("注入不符合规格的文件 → 退出码 1 + stderr 含失败原因", () => {
    // 用任意一张 9x 图改名复制(模拟 1x1 假图)
    const src = join(scanRoot, "9x/01-table.webp");
    const injected = injectPath();
    mkdirSync(dirname(injected), { recursive: true });
    copyFileSync(src, injected);

    // 改大小写或扩展名绕过命名规则:这里直接 overwrite 文件大小(>3MB 不行)
    // 简单办法:在文件名前加 "BadName!" 字符
    const badName = join(scanRoot, "9x/_bad-name-!.webp");
    copyFileSync(src, badName);

    try {
      const result = runScript();
      // 失败时总数=22 ≠ 21,会先报总数错;不论哪种,必须 exit 1
      expect(result.status, `expected exit 1, got ${result.status}`).toBe(1);
      // stderr 应包含 [FAIL] 或 [ERROR]
      const combined = (result.stdout ?? "") + (result.stderr ?? "");
      expect(combined).toMatch(/FAIL|ERROR/);
    } finally {
      rmSync(injected, { force: true });
      rmSync(badName, { force: true });
    }
  });

  it("脚本本身存在且可执行", () => {
    expect(existsSync(SCRIPT)).toBe(true);
    const s = statSync(SCRIPT);
    expect(s.isFile()).toBe(true);
    expect(s.size).toBeGreaterThan(0);
  });
});
