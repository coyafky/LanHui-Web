#!/usr/bin/env node
/**
 * Download all image assets for moxiaoer.com.cn clone
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public', 'images');

const ASSETS = [
  // Logo
  { url: 'https://www.moxiaoer.com.cn/_next/image?url=%2Fimages%2Flogo%2Fmx2logo_white.png&w=384&q=100', local: 'logo/mx2logo_white.png' },
  { url: 'https://www.moxiaoer.com.cn/_next/image?url=%2Fimages%2Flogo%2Fwarranty.png&w=256&q=100', local: 'logo/warranty.png' },
  // Hero
  { url: 'https://www.moxiaoer.com.cn/_next/image?url=%2Fimages%2Fhome%2Fhero_bg.png&w=1920&q=90', local: 'home/hero_bg.png' },
  // Service cards
  { url: 'https://www.moxiaoer.com.cn/_next/image?url=%2Fimages%2Fhome%2Fproduct_center.png&w=1080&q=90', local: 'home/product_center.png' },
  { url: 'https://www.moxiaoer.com.cn/_next/image?url=%2Fimages%2Fhome%2Fflagship_store.png&w=1080&q=90', local: 'home/flagship_store.png' },
  { url: 'https://www.moxiaoer.com.cn/_next/image?url=%2Fimages%2Fhome%2Fbrand_intro.png&w=1080&q=90', local: 'home/brand_intro.png' },
];

async function downloadOne(asset) {
  const dest = join(PUBLIC, asset.local);
  if (existsSync(dest)) {
    return { local: asset.local, status: 'skipped' };
  }
  await mkdir(dirname(dest), { recursive: true });
  const res = await fetch(asset.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Referer': 'https://www.moxiaoer.com.cn/'
    }
  });
  if (!res.ok) {
    return { local: asset.local, status: 'failed', code: res.status };
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return { local: asset.local, status: 'ok', size: buf.length };
}

async function main() {
  console.log(`Downloading ${ASSETS.length} assets to ${PUBLIC}...`);
  const results = await Promise.all(ASSETS.map(downloadOne));
  for (const r of results) {
    if (r.status === 'ok') {
      console.log(`✓ ${r.local} (${(r.size / 1024).toFixed(1)} KB)`);
    } else if (r.status === 'skipped') {
      console.log(`= ${r.local} (cached)`);
    } else {
      console.log(`✗ ${r.local} (HTTP ${r.code})`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
