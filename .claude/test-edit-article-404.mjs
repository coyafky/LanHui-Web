#!/usr/bin/env node
/**
 * Playwright bug verification test: /admin/articles/[id] shows "文章不存在"
 * for an existing article.
 *
 * Hypothesis (from code analysis):
 *   GET /api/articles/[id] at src/app/api/articles/[id]/route.ts:16-18
 *     const isCuid = id.startsWith("cl") && id.length > 20;
 *     const article = await prisma.article.findFirst({
 *       where: isCuid ? { id } : { slug: id },
 *       ...
 *     });
 *
 *   Real cuids in the DB start with "cm" (e.g. "cmq7f2na60000oig6vigpzqll"),
 *   never "cl". So the check is always false → the route always tries
 *   findFirst({ where: { slug: <cuid> } }) → null → 404 "文章不存在".
 *
 *   The edit page at src/app/admin/(dashboard)/articles/[id]/page.tsx:54-58
 *   then sets error="文章不存在".
 */

import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const EMAIL = "admin@lanhui.com";
const PASSWORD = "admin123";
const KNOWN_ARTICLE_ID = "cmq7f2na60000oig6vigpzqll"; // "蓝辉轻改品牌官网正式上线"
const KNOWN_ARTICLE_SLUG = "brand-website-launch";
const KNOWN_ARTICLE_TITLE = "蓝辉轻改品牌官网正式上线";
const REPORT_DIR = "/tmp/articles-edit-404-screenshots";

import { mkdirSync } from "node:fs";
mkdirSync(REPORT_DIR, { recursive: true });

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleMessages = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));
  const apiCalls = [];
  page.on("response", async (resp) => {
    const url = resp.url();
    if (url.includes("/api/articles/")) {
      let body = "<unread>";
      try { body = await resp.text(); } catch {}
      apiCalls.push({
        method: resp.request().method(),
        url: url.replace(BASE, ""),
        status: resp.status(),
        body: body.slice(0, 300),
      });
    }
  });

  // ── Login ──
  console.log("=== Step 1: log in as admin ===");
  await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded" });
  await page.locator("input#username").fill(EMAIL);
  await page.locator("input#password").fill(PASSWORD);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith("/admin/login"), { timeout: 15000 }),
    page.locator("form button[type=submit]").click(),
  ]);
  console.log(`Logged in: ${page.url()}`);

  // ── Test 1: Visit edit page with KNOWN cuid ──
  console.log(`\n=== Step 2: navigate to /admin/articles/${KNOWN_ARTICLE_ID} (cuid) ===`);
  await page.goto(`${BASE}/admin/articles/${KNOWN_ARTICLE_ID}`, { waitUntil: "networkidle" });

  // Wait for either the form to render OR the error banner to show.
  await page.waitForTimeout(1000);

  const titleInput = page.locator('input[placeholder="输入文章标题"]');
  const titleVisible = await titleInput.isVisible().catch(() => false);
  const titleValue = titleVisible ? await titleInput.inputValue() : null;

  // "文章不存在" red banner check.
  const errorBanner = page.locator('div:has-text("文章不存在")');
  const errorBannerVisible = await errorBanner.isVisible().catch(() => false);
  const errorBannerText = errorBannerVisible ? await errorBanner.first().innerText() : null;

  console.log(`Title input visible: ${titleVisible}`);
  console.log(`Title input value: ${titleValue}`);
  console.log(`Error banner "文章不存在" visible: ${errorBannerVisible}`);
  console.log(`Error banner text: ${errorBannerText}`);

  await page.screenshot({ path: `${REPORT_DIR}/01-edit-by-cuid.png`, fullPage: true });

  // ── Test 2: Visit edit page with KNOWN slug ──
  console.log(`\n=== Step 3: navigate to /admin/articles/${KNOWN_ARTICLE_SLUG} (slug) ===`);
  await page.goto(`${BASE}/admin/articles/${KNOWN_ARTICLE_SLUG}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const titleInput2 = page.locator('input[placeholder="输入文章标题"]');
  const titleVisible2 = await titleInput2.isVisible().catch(() => false);
  const titleValue2 = titleVisible2 ? await titleInput2.inputValue() : null;
  const errorBanner2 = page.locator('div:has-text("文章不存在")');
  const errorBannerVisible2 = await errorBanner2.isVisible().catch(() => false);

  console.log(`Title input visible (by slug): ${titleVisible2}`);
  console.log(`Title input value (by slug): ${titleValue2}`);
  console.log(`Error banner visible (by slug): ${errorBannerVisible2}`);

  await page.screenshot({ path: `${REPORT_DIR}/02-edit-by-slug.png`, fullPage: true });

  // ── Test 3: Direct API call to /api/articles/<cuid> ──
  console.log(`\n=== Step 4: direct API call GET /api/articles/${KNOWN_ARTICLE_ID} ===`);
  const apiRes = await page.request.get(`${BASE}/api/articles/${KNOWN_ARTICLE_ID}`);
  const apiStatus = apiRes.status();
  const apiBody = await apiRes.json().catch(() => ({}));
  console.log(`API status: ${apiStatus}`);
  console.log(`API response success: ${apiBody.success}`);
  console.log(`API response error: ${apiBody.error}`);
  if (apiBody.data) {
    console.log(`API data title: ${apiBody.data.title}`);
  }

  // ── Test 4: Direct API call to /api/articles/<slug> ──
  console.log(`\n=== Step 5: direct API call GET /api/articles/${KNOWN_ARTICLE_SLUG} ===`);
  const apiRes2 = await page.request.get(`${BASE}/api/articles/${KNOWN_ARTICLE_SLUG}`);
  const apiStatus2 = apiRes2.status();
  const apiBody2 = await apiRes2.json().catch(() => ({}));
  console.log(`API status (slug): ${apiStatus2}`);
  console.log(`API response success (slug): ${apiBody2.success}`);
  console.log(`API response error (slug): ${apiBody2.error}`);

  // ── Summary ──
  console.log("\n=== SUMMARY ===");
  console.log(`Bug confirmed: edit page with cuid → ${errorBannerVisible ? "shows '文章不存在' (BUG)" : "loads form (FIXED)"}`);
  console.log(`Bug confirmed: edit page with slug → ${errorBannerVisible2 ? "shows '文章不存在'" : "loads form"}`);
  console.log(`API GET by cuid: ${apiStatus} ${apiBody.success ? "✓" : "✗"}`);
  console.log(`API GET by slug: ${apiStatus2} ${apiBody2.success ? "✓" : "✗"}`);
  console.log(`Captured ${apiCalls.length} API calls during the test.`);
  for (const c of apiCalls) {
    console.log(`  ${c.method} ${c.url} → ${c.status} | body: ${c.body.slice(0, 100)}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
