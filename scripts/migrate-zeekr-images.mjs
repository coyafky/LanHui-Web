#!/usr/bin/env node
/**
 * Zeekr 图片迁移脚本
 *
 * 按 PRD v2.0 §8.3 迁移清单,把源
 *   public/images/products/zeekr/{极氪9X,极氪8X,Zeeker009}/
 * 复制到目标
 *   public/images/products/zeekr/{9x,8x,009}/
 * 并删除源目录。
 *
 * 9X 行 8「挡泥板+内衬6件套」、行 9「双层脚垫」无源文件,跳过。
 * 9X 行 15 源「后备箱储物.webp」映射到「15-trunk-storage.webp」(pending-review)。
 * 8X 行 2 源「挡泥板+内衬  6件套.webp」(2 空格)清洗为「02-mudguard-liner-6pc.webp」。
 * 009 行 1 源「1-borad.webp」(typo)映射到「01-floor-trunk.webp」。
 *
 * 用法:
 *   node scripts/migrate-zeekr-images.mjs
 *
 * 幂等:21 张规范化目标图已存在且旧目录已清理时直接成功退出。
 */

import {
  mkdirSync,
  copyFileSync,
  rmSync,
  existsSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ASSET_ROOT = join(ROOT, "public/images/products/zeekr");
const SOURCE = ASSET_ROOT;
const TARGET = ASSET_ROOT;
const SOURCE_SUBDIRS = ["极氪9X", "极氪8X", "Zeeker009"];

/**
 * @typedef {Object} MigrationRow
 * @property {string} from 源文件相对 SOURCE 路径
 * @property {string} to 目标文件相对 TARGET 路径
 * @property {string} product 产品名(用于日志)
 * @property {"matched"|"pending-review"} status
 */

/** @type {MigrationRow[]} */
const MIGRATIONS = [
  // 9X(14 个有图)
  { from: "极氪9X/小桌板.webp", to: "9x/01-table.webp", product: "小桌板", status: "matched" },
  { from: "极氪9X/地板+尾箱地板+氛围灯.webp", to: "9x/02-floor-trunk-ambient.webp", product: "地板+尾箱地板+氛围灯", status: "matched" },
  { from: "极氪9X/后备箱垫-7件套.webp", to: "9x/03-trunk-mat-7pc.webp", product: "后备箱垫-7件套", status: "matched" },
  { from: "极氪9X/门槛条10件套.webp", to: "9x/04-door-sill-10pc.webp", product: "门槛条10件套", status: "matched" },
  { from: "极氪9X/天地门全套6件套.webp", to: "9x/05-tailgate-6pc.webp", product: "天地门全套6件套", status: "matched" },
  { from: "极氪9X/防虫网16件套.webp", to: "9x/06-bug-net-16pc.webp", product: "防虫网16件套", status: "matched" },
  { from: "极氪9X/全包坐垫.webp", to: "9x/07-seat-cover.webp", product: "全包坐垫", status: "matched" },
  // 行 8「挡泥板+内衬6件套」无源文件,跳过
  // 行 9「双层脚垫」无源文件,跳过
  { from: "极氪9X/外置门槛条.webp", to: "9x/10-exterior-sill.webp", product: "外置门槛条", status: "matched" },
  { from: "极氪9X/主副驾座椅防踢垫+脚踏套.webp", to: "9x/11-kick-pedal-pad.webp", product: "主副驾座椅防踢垫+脚踏套", status: "matched" },
  { from: "极氪9X/冰箱垃圾桶   按压款.webp", to: "9x/12-fridge-trash-press.webp", product: "冰箱垃圾桶按压款", status: "matched" },
  { from: "极氪9X/底盘护板.webp", to: "9x/13-underbody-plate.webp", product: "底盘护板", status: "matched" },
  { from: "极氪9X/三段式方向盘.webp", to: "9x/14-steering-wheel.webp", product: "三段式方向盘", status: "matched" },
  { from: "极氪9X/后备箱储物.webp", to: "9x/15-trunk-storage.webp", product: "后备箱储物盒(pending-review)", status: "pending-review" },
  { from: "极氪9X/电动踏板盖.webp", to: "9x/16-epedal-cover.webp", product: "电动踏板盖", status: "matched" },
  // 8X(6 个)
  { from: "极氪8X/尾箱垫7件套.webp", to: "8x/01-trunk-mat-7pc.webp", product: "尾箱垫7件套", status: "matched" },
  { from: "极氪8X/挡泥板+内衬  6件套.webp", to: "8x/02-mudguard-liner-6pc.webp", product: "挡泥板+内衬6件套", status: "matched" },
  { from: "极氪8X/门槛条10件套.webp", to: "8x/03-door-sill-10pc.webp", product: "门槛条10件套", status: "matched" },
  { from: "极氪8X/冰箱防踢垃圾桶.webp", to: "8x/04-fridge-trash.webp", product: "冰箱防踢垃圾桶", status: "matched" },
  { from: "极氪8X/尾门防刮面板1件套.webp", to: "8x/05-tailgate-guard.webp", product: "尾门防刮面板1件套", status: "matched" },
  { from: "极氪8X/三段式方向盘套.webp", to: "8x/06-steering-wheel-cover.webp", product: "三段式方向盘套", status: "matched" },
  // 009(1 个,源文件 typo 已纠正)
  { from: "Zeeker009/1-borad.webp", to: "009/01-floor-trunk.webp", product: "地板+尾箱地板", status: "matched" },
];

function main() {
  console.log("[migrate:zeekr-images] 启动");
  console.log(`  源: ${SOURCE}`);
  console.log(`  目标: ${TARGET}`);

  const targetsComplete = MIGRATIONS.every((row) =>
    existsSync(join(TARGET, row.to)),
  );
  const legacySourcesRemain = SOURCE_SUBDIRS.some((subdir) =>
    existsSync(join(SOURCE, subdir)),
  );
  if (targetsComplete && !legacySourcesRemain) {
    console.log("[migrate:zeekr-images] 图片迁移已完成，无需重复执行");
    process.exit(0);
  }

  if (!existsSync(SOURCE)) {
    console.error(`[error] 源目录不存在: ${SOURCE}`);
    process.exit(1);
  }

  if (existsSync(TARGET)) {
    console.warn(`[warn] 目标目录已存在,将覆盖: ${TARGET}`);
  }
  mkdirSync(TARGET, { recursive: true });

  let matched = 0;
  let pending = 0;
  let failed = 0;

  for (const row of MIGRATIONS) {
    const fromPath = join(SOURCE, row.from);
    const toPath = join(TARGET, row.to);
    mkdirSync(dirname(toPath), { recursive: true });

    if (!existsSync(fromPath)) {
      console.error(`[error] 源文件不存在: ${fromPath} (产品: ${row.product})`);
      failed++;
      continue;
    }

    copyFileSync(fromPath, toPath);
    if (row.status === "matched") matched++;
    else pending++;
    console.log(`  [${row.status}] ${row.from} → ${row.to}`);
  }

  console.log("");
  console.log(`[migrate:zeekr-images] 完成`);
  console.log(`  matched: ${matched}`);
  console.log(`  pending-review: ${pending}`);
  console.log(`  failed: ${failed}`);

  // 删除源目录(三个子目录 + 残留 .DS_Store)
  // macOS APFS 默认 case-insensitive:zeekr/ 和 ZEEKR/ 是同一目录
  // 因此最后一步「删除空源父目录」必须加 SOURCE !== TARGET 防御
  for (const sub of SOURCE_SUBDIRS) {
    const p = join(SOURCE, sub);
    if (existsSync(p)) {
      rmSync(p, { recursive: true, force: true });
      console.log(`  [clean] 删除源子目录: ${p}`);
    }
  }
  const dsStore = join(SOURCE, ".DS_Store");
  if (existsSync(dsStore)) {
    rmSync(dsStore, { force: true });
    console.log(`  [clean] 删除 .DS_Store: ${dsStore}`);
  }
  if (failed > 0) {
    console.error(`[error] ${failed} 个迁移失败,进程退出码 1`);
    process.exit(1);
  }
  process.exit(0);
}

main();
