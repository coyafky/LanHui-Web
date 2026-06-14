/**
 * 一次性生成占位图（PRD §4.1）。
 *
 * 运行： node scripts/generate-placeholders.mjs
 *
 * 输出：
 *   public/images/placeholders/store.webp
 *   public/images/placeholders/province.webp
 */

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "public", "images", "placeholders");

const ITEMS = [
  { name: "store.webp", label: "Store Placeholder" },
  { name: "province.webp", label: "Province Placeholder" },
];

const WIDTH = 1200;
const HEIGHT = 800;

async function generateOne(name, label) {
  const text = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1f1f1f"/>
      <text
        x="50%"
        y="50%"
        font-family="-apple-system, system-ui, sans-serif"
        font-size="56"
        font-weight="500"
        fill="#ffffff"
        text-anchor="middle"
        dominant-baseline="central"
      >${label}</text>
      <text
        x="50%"
        y="58%"
        font-family="-apple-system, system-ui, sans-serif"
        font-size="24"
        fill="#888888"
        text-anchor="middle"
        dominant-baseline="central"
      >1200 × 800</text>
    </svg>
  `;

  const buffer = Buffer.from(text);
  return sharp(buffer)
    .webp({ quality: 80 })
    .toFile(path.join(OUT_DIR, name));
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const item of ITEMS) {
    await generateOne(item.name, item.label);
    console.log(`  [ok] ${item.name}`);
  }
  console.log("占位图生成完成。");
}

main().catch((err) => {
  console.error("生成失败:", err);
  process.exit(1);
});
