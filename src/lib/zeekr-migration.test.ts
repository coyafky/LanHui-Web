/**
 * zeekr 图片迁移的集成测试
 *
 * 验证 PRD v2.0 §8.3 迁移清单的最终文件系统结构。
 * 测试在迁移前应失败(目标目录不存在),迁移后应通过。
 *
 * 验收点(对应 PRD §8.3 / §8.6 / §16):
 * 1. 目标目录 public/images/products/zeekr/{9x,8x,009}/ 全部存在
 * 2. 9X 14 个 WebP + 8X 6 个 WebP + 009 1 个 WebP = 21 个
 * 3. 所有文件名符合 ASCII slug 规范
 * 4. 旧目录 public/images/products/zeekr/{极氪9X,极氪8X,Zeeker009}/ 全部不存在
 * 5. 所有 WebP 像素 = 1448×1086,宽高比 4:3
 * 6. 所有 WebP 大小 ≤ 500 KB
 */
import { describe, it, expect, beforeAll } from "vitest";
import { execFileSync } from "node:child_process";
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = join(process.cwd(), "public/images/products");
const TARGET = join(ROOT, "zeekr");
const SOURCE = TARGET;
const ASCII_SLUG_REGEX = /^[a-z0-9-]+\.webp$/;

type Subdir = "9x" | "8x" | "009";
const EXPECTED_COUNTS: Record<Subdir, number> = {
  "9x": 14,
  "8x": 6,
  "009": 1,
};

const EXPECTED_WIDTH = 1448;
const EXPECTED_HEIGHT = 1086;
// PRD v2.0 §8.2 规格表(2026-06-16 build 修订):文件大小 ≤ 3 MB
// 转换后 WebP 应保持在 500 KB 以内。
const MAX_FILE_SIZE_BYTES = 500 * 1024;

describe("PRD §8.3 zeekr 图片迁移结果", () => {
  beforeAll(() => {
    if (!existsSync(TARGET)) {
      throw new Error(
        `目标目录不存在: ${TARGET}。先运行 npm run migrate:zeekr-images`,
      );
    }
  });

  describe("目录结构", () => {
    it.each(Object.entries(EXPECTED_COUNTS) as [Subdir, number][])(
      "%s 子目录存在且含 %i 个 WebP",
      (subdir, expectedCount) => {
        const dir = join(TARGET, subdir);
        expect(existsSync(dir), `目录应存在: ${dir}`).toBe(true);
        const files = readdirSync(dir).filter((f) => f.endsWith(".webp"));
        expect(files).toHaveLength(expectedCount);
      },
    );

    it("旧目录 zeekr/极氪9X/ 不应残留", () => {
      expect(existsSync(join(SOURCE, "极氪9X"))).toBe(false);
    });

    it("旧目录 zeekr/极氪8X/ 不应残留", () => {
      expect(existsSync(join(SOURCE, "极氪8X"))).toBe(false);
    });

    it("旧目录 zeekr/Zeeker009/ 不应残留", () => {
      expect(existsSync(join(SOURCE, "Zeeker009"))).toBe(false);
    });
  });

  describe("文件命名", () => {
    it.each(Object.keys(EXPECTED_COUNTS) as Subdir[])(
      "%s 子目录所有文件名符合 ASCII slug",
      (subdir) => {
        const dir = join(TARGET, subdir);
        const files = readdirSync(dir).filter((f) => f.endsWith(".webp"));
        for (const f of files) {
          expect(
            ASCII_SLUG_REGEX.test(f),
            `文件名不符合 ^[a-z0-9-]+\\.webp$: ${f}`,
          ).toBe(true);
        }
      },
    );
  });

  describe("像素规格", () => {
    it.each(Object.keys(EXPECTED_COUNTS) as Subdir[])(
      "%s 子目录所有 WebP 像素 = 1448×1086、宽高比 = 4:3",
      async (subdir) => {
        const dir = join(TARGET, subdir);
        const files = readdirSync(dir).filter((f) => f.endsWith(".webp"));
        for (const f of files) {
          const meta = await sharp(join(dir, f)).metadata();
          expect(meta.width, `${f} 宽度应为 ${EXPECTED_WIDTH}`).toBe(
            EXPECTED_WIDTH,
          );
          expect(meta.height, `${f} 高度应为 ${EXPECTED_HEIGHT}`).toBe(
            EXPECTED_HEIGHT,
          );
          const ratio = (meta.width ?? 0) / (meta.height ?? 1);
          expect(
            Math.abs(ratio - 4 / 3),
            `${f} 宽高比偏离 4:3 超过 0.01`,
          ).toBeLessThanOrEqual(0.01);
        }
      },
    );
  });

  describe("文件大小", () => {
    it.each(Object.keys(EXPECTED_COUNTS) as Subdir[])(
      "%s 子目录所有 WebP 大小 ≤ 500 KB",
      (subdir) => {
        const dir = join(TARGET, subdir);
        const files = readdirSync(dir).filter((f) => f.endsWith(".webp"));
        for (const f of files) {
          const size = statSync(join(dir, f)).size;
          expect(
            size,
            `文件 ${f} 超过 500 KB,实际 ${(size / 1024).toFixed(1)} KB`,
          ).toBeLessThanOrEqual(MAX_FILE_SIZE_BYTES);
        }
      },
    );
  });

  describe("总数", () => {
    it("21 个 WebP 全部就位", () => {
      const all: string[] = [];
      for (const sub of Object.keys(EXPECTED_COUNTS) as Subdir[]) {
        const dir = join(TARGET, sub);
        all.push(...readdirSync(dir).filter((f) => f.endsWith(".webp")));
      }
      expect(all).toHaveLength(21);
    });
  });

  describe("迁移脚本幂等性", () => {
    it("规范化图片已存在且旧目录已清理时重复执行成功", () => {
      const output = execFileSync(
        process.execPath,
        [join(process.cwd(), "scripts/migrate-zeekr-images.mjs")],
        { encoding: "utf8" },
      );

      expect(output).toContain("图片迁移已完成");
    });
  });
});
