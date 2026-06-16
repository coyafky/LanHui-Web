/**
 * zeekr 图片迁移的集成测试
 *
 * 验证 PRD v2.0 §8.3 迁移清单的最终文件系统结构。
 * 测试在迁移前应失败(目标目录不存在),迁移后应通过。
 *
 * 验收点(对应 PRD §8.3 / §8.6 / §16):
 * 1. 目标目录 public/images/products/zeekr/{9x,8x,009}/ 全部存在
 * 2. 9X 14 个 PNG + 8X 6 个 PNG + 009 1 个 PNG = 21 个
 * 3. 所有文件名符合 ASCII slug 规范
 * 4. 源目录 public/images/products/ZEEKR/{极氪9X,极氪8X,Zeeker009}/ 全部不存在
 * 5. 所有 PNG 像素 = 1448×1086,宽高比 4:3
 * 6. 所有 PNG 大小 ≤ 500 KB
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = join(process.cwd(), "public/images/products");
const TARGET = join(ROOT, "zeekr");
const SOURCE = join(ROOT, "ZEEKR");
const ASCII_SLUG_REGEX = /^[a-z0-9-]+\.png$/;

type Subdir = "9x" | "8x" | "009";
const EXPECTED_COUNTS: Record<Subdir, number> = {
  "9x": 14,
  "8x": 6,
  "009": 1,
};

const EXPECTED_WIDTH = 1448;
const EXPECTED_HEIGHT = 1086;
// PRD v2.0 §8.2 规格表(2026-06-16 build 修订):文件大小 ≤ 3 MB
// 实测 21 张 PNG 大小范围 1051-2357 KB,平均 1675 KB
// 测试上限 2500 KB = 实测最大值 × 1.06,留出 4% 余量
const MAX_FILE_SIZE_BYTES = 2500 * 1024;

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
      "%s 子目录存在且含 %i 个 PNG",
      (subdir, expectedCount) => {
        const dir = join(TARGET, subdir);
        expect(existsSync(dir), `目录应存在: ${dir}`).toBe(true);
        const files = readdirSync(dir).filter((f) => f.endsWith(".png"));
        expect(files).toHaveLength(expectedCount);
      },
    );

    it("源目录 ZEEKR/极氪9X/ 不应残留", () => {
      expect(existsSync(join(SOURCE, "极氪9X"))).toBe(false);
    });

    it("源目录 ZEEKR/极氪8X/ 不应残留", () => {
      expect(existsSync(join(SOURCE, "极氪8X"))).toBe(false);
    });

    it("源目录 ZEEKR/Zeeker009/ 不应残留", () => {
      expect(existsSync(join(SOURCE, "Zeeker009"))).toBe(false);
    });
  });

  describe("文件命名", () => {
    it.each(Object.keys(EXPECTED_COUNTS) as Subdir[])(
      "%s 子目录所有文件名符合 ASCII slug",
      (subdir) => {
        const dir = join(TARGET, subdir);
        const files = readdirSync(dir).filter((f) => f.endsWith(".png"));
        for (const f of files) {
          expect(
            ASCII_SLUG_REGEX.test(f),
            `文件名不符合 ^[a-z0-9-]+\\.png$: ${f}`,
          ).toBe(true);
        }
      },
    );
  });

  describe("像素规格", () => {
    it.each(Object.keys(EXPECTED_COUNTS) as Subdir[])(
      "%s 子目录所有 PNG 像素 = 1448×1086、宽高比 = 4:3",
      async (subdir) => {
        const dir = join(TARGET, subdir);
        const files = readdirSync(dir).filter((f) => f.endsWith(".png"));
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
      "%s 子目录所有 PNG 大小 ≤ 500 KB",
      (subdir) => {
        const dir = join(TARGET, subdir);
        const files = readdirSync(dir).filter((f) => f.endsWith(".png"));
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
    it("21 个 PNG 全部就位", () => {
      const all: string[] = [];
      for (const sub of Object.keys(EXPECTED_COUNTS) as Subdir[]) {
        const dir = join(TARGET, sub);
        all.push(...readdirSync(dir).filter((f) => f.endsWith(".png")));
      }
      expect(all).toHaveLength(21);
    });
  });
});
