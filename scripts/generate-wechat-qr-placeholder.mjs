#!/usr/bin/env node
/**
 * 生成企业微信二维码占位图（220×220 纯灰色 PNG）
 *
 * 用途：
 * - WeChatConsultModal 需要 /images/brand/wechat-qr.png 资源才能渲染。
 * - 当前没有真实二维码，先放一个统一灰色占位（zinc-700 调性），
 *   由后续运营/设计同学用真实二维码覆盖。
 *
 * 实现：
 * - 不引入 sharp / canvas 等依赖。
 * - 手工构造一个最小的 220×220 8-bit RGBA PNG，纯色 #3f3f46。
 *
 * 运行：node scripts/generate-wechat-qr-placeholder.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_PATH = join(
  __dirname,
  "..",
  "public",
  "images",
  "brand",
  "wechat-qr.png",
);

const SIZE = 220;
const FILL_R = 0x3f;
const FILL_G = 0x3f;
const FILL_B = 0x46;
const FILL_A = 0xff;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function buildPng(width, height) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const rowSize = width * 4;
  const raw = Buffer.alloc(height * (rowSize + 1));
  for (let y = 0; y < height; y += 1) {
    raw[y * (rowSize + 1)] = 0; // filter type none
    for (let x = 0; x < width; x += 1) {
      const off = y * (rowSize + 1) + 1 + x * 4;
      raw[off] = FILL_R;
      raw[off + 1] = FILL_G;
      raw[off + 2] = FILL_B;
      raw[off + 3] = FILL_A;
    }
  }

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function main() {
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  const png = buildPng(SIZE, SIZE);
  writeFileSync(OUTPUT_PATH, png);
  console.log(`Wrote ${OUTPUT_PATH} (${png.length} bytes, ${SIZE}x${SIZE})`);
}

main();
