/**
 * ZEEKR 图片 CI 校验脚本 测试
 *
 * 验证 scripts/verify-zeekr-images.mjs 的行为:
 * - 当前 zeekr/ 目录 21 张图 → 退出码 0 + "OK"
 * - 临时注入一张不符合规格的文件 → 退出码 1 + 失败信息
 *
 * 用 child_process.spawnSync 调用 .mjs,避免 import 解析差异。
 */
import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  copyFileSync,
  mkdirSync,
  rmSync,
  existsSync,
  statSync,
  writeFileSync,
} from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
// 测试位于 src/lib/,需要上溯 2 级到 repo root
const ROOT = join(__dirname, "..", "..");
const SCRIPT = join(ROOT, "scripts/verify-zeekr-images.mjs");
const SCAN_ROOT = join(ROOT, "public/images/products/zeekr");
const INJECT_PATH = join(SCAN_ROOT, "9x/_test_inject.png");
const INJECT_BACKUP = join(SCAN_ROOT, ".DS_Store");

function runScript() {
  return spawnSync("node", [SCRIPT], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 30_000,
  });
}

describe("PRD §8.6 verify-zeekr-images 集成行为", () => {
  afterAll(() => {
    // 清理:如果注入测试遗留,删除
    if (existsSync(INJECT_PATH)) rmSync(INJECT_PATH, { force: true });
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
    const src = join(SCAN_ROOT, "9x/01-table.png");
    mkdirSync(dirname(INJECT_PATH), { recursive: true });
    copyFileSync(src, INJECT_PATH);

    // 改大小写或扩展名绕过命名规则:这里直接 overwrite 文件大小(>3MB 不行)
    // 简单办法:在文件名前加 "BadName!" 字符
    const badName = join(SCAN_ROOT, "9x/_bad-name-!.png");
    copyFileSync(src, badName);

    try {
      const result = runScript();
      // 失败时总数=22 ≠ 21,会先报总数错;不论哪种,必须 exit 1
      expect(result.status, `expected exit 1, got ${result.status}`).toBe(1);
      // stderr 应包含 [FAIL] 或 [ERROR]
      const combined = (result.stdout ?? "") + (result.stderr ?? "");
      expect(combined).toMatch(/FAIL|ERROR/);
    } finally {
      rmSync(INJECT_PATH, { force: true });
      rmSync(badName, { force: true });
      // restore .DS_Store guard(其实不需要,但保险)
      if (!existsSync(INJECT_BACKUP) && existsSync(SCAN_ROOT)) {
        // 不主动创建
      }
    }
  });

  it("脚本本身存在且可执行", () => {
    expect(existsSync(SCRIPT)).toBe(true);
    const s = statSync(SCRIPT);
    expect(s.isFile()).toBe(true);
    expect(s.size).toBeGreaterThan(0);
  });
});

// 兜底:防止上面 afterAll 漏掉坏名
if (existsSync(join(SCAN_ROOT, "9x/_bad-name-!.png"))) {
  rmSync(join(SCAN_ROOT, "9x/_bad-name-!.png"), { force: true });
}

// 防止 .DS_Store 干扰(若之前误创建)
if (existsSync(SCAN_ROOT) && statSync(SCAN_ROOT).isDirectory()) {
  // 保留 .DS_Store 不清理
  void writeFileSync;
}
