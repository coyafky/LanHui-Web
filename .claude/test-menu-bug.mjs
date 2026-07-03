#!/usr/bin/env node
/**
 * Playwright bug verification test for the MoreHorizontal "..." menu on
 * /admin/articles.
 *
 * Hypothesis: the document-level click handler at page.tsx:127-133 closes
 * the menu on every click, and `e.stopPropagation()` inside the button
 * onClick (line 329-332) only stops React's synthetic event, not the
 * native event bubbling up to document.
 *
 * Result: the menu is never visible because the document handler runs
 * AFTER the button handler (or fires on the same click).
 */

import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const EMAIL = "admin@lanhui.com";
const PASSWORD = "admin123";
const REPORT_DIR = "/tmp/articles-menu-bug-screenshots";

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

  console.log("=== Step 1: navigate to /admin/login ===");
  await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");

  // The login form uses #username + #password (NextAuth credentials provider).
  console.log("=== Step 2: log in as admin ===");
  const emailInput = page.locator('input#username');
  const passwordInput = page.locator('input#password');
  await emailInput.fill(EMAIL);
  await passwordInput.fill(PASSWORD);
  // Submit form (button[type="submit"] inside the form, or press Enter).
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith("/admin/login"), { timeout: 15000 }),
    page.locator('form button[type="submit"]').first().click(),
  ]);
  console.log(`Logged in, current URL: ${page.url()}`);

  console.log("=== Step 3: navigate to /admin/articles ===");
  await page.goto(`${BASE}/admin/articles`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");

  // Wait for the table to render.
  await page.waitForSelector("table", { timeout: 10000 });
  // Wait for at least one row in tbody (article data is async-loaded).
  try {
    await page.waitForSelector("table tbody tr", { timeout: 10000 });
  } catch {
    console.log("No rows in tbody after 10s — dumping page state.");
    await page.screenshot({ path: `${REPORT_DIR}/no-rows.png`, fullPage: true });
    const html = await page.content();
    console.log("Page title:", await page.title());
    console.log("Body text (first 500 chars):", (await page.locator("body").innerText()).slice(0, 500));
    await browser.close();
    process.exit(2);
  }
  // Wait for at least one MoreHorizontal button (the icon renders as lucide-ellipsis).
  const moreButton = page.locator('button:has(svg.lucide-ellipsis)').first();
  await moreButton.waitFor({ state: "visible", timeout: 10000 });
  const moreCount = await page.locator('button:has(svg.lucide-ellipsis)').count();
  console.log(`MoreHorizontal buttons found: ${moreCount}`);

  if (moreCount === 0) {
    console.log("No articles in list — cannot exercise menu. Aborting.");
    await page.screenshot({ path: `${REPORT_DIR}/no-articles.png`, fullPage: true });
    await browser.close();
    process.exit(2);
  }

  // 1. Snapshot of closed state.
  await page.screenshot({ path: `${REPORT_DIR}/01-list-closed.png`, fullPage: false });

  // 2. Click and immediately check whether menu is visible.
  console.log("=== Step 4: click first MoreHorizontal button ===");
  await moreButton.click();

  // Probe multiple times to catch the flicker.
  const probes = [];
  for (const delay of [0, 50, 100, 200, 500, 1000]) {
    await page.waitForTimeout(delay);
    // Menu items: links with text "编辑" and buttons with text "发布" / "置顶" / "取消发布" / "取消置顶" / "删除"
    const menuVisible = await page.locator('div.absolute:has(a:has-text("编辑"))').isVisible().catch(() => false);
    const editLinkVisible = await page.locator('a:has-text("编辑")').first().isVisible().catch(() => false);
    const stickyBtnVisible = await page.locator('button:has-text("置顶"), button:has-text("取消置顶")').first().isVisible().catch(() => false);
    const deleteBtnVisible = await page.locator('button:has-text("删除")').first().isVisible().catch(() => false);
    probes.push({ delay, menuVisible, editLinkVisible, stickyBtnVisible, deleteBtnVisible });
  }
  console.log("=== Probe results ===");
  console.log(JSON.stringify(probes, null, 2));

  await page.screenshot({ path: `${REPORT_DIR}/02-after-click.png`, fullPage: false });

  // 3. Wait a beat and re-check.
  await page.waitForTimeout(500);
  const finalMenuVisible = await page.locator('div.absolute:has(a:has-text("编辑"))').isVisible().catch(() => false);
  console.log(`Final menu visible (after 500ms wait): ${finalMenuVisible}`);
  await page.screenshot({ path: `${REPORT_DIR}/03-after-500ms.png`, fullPage: false });

  // 4. Check the DOM directly for menu presence.
  const menuDOMCount = await page.locator('div.absolute.right-0.top-full.z-10:has(a:has-text("编辑"))').count();
  console.log(`Menu div count in DOM: ${menuDOMCount}`);

  // 5. Try clicking again to see if toggle works.
  console.log("=== Step 5: click again to test toggle ===");
  await moreButton.click();
  await page.waitForTimeout(200);
  const secondMenuVisible = await page.locator('div.absolute:has(a:has-text("编辑"))').isVisible().catch(() => false);
  console.log(`Menu visible after second click: ${secondMenuVisible}`);

  // 6. Check if menu items are clickable.
  console.log("=== Step 6: try clicking sticky button ===");
  await moreButton.click(); // re-open if needed
  await page.waitForTimeout(50);
  const stickyBtns = page.locator('button:has-text("置顶"), button:has-text("取消置顶")');
  const stickyCount = await stickyBtns.count();
  console.log(`Sticky button count: ${stickyCount}`);

  // Final report
  console.log("\n=== SUMMARY ===");
  console.log(`Menu shows after click: ${probes[0].menuVisible || probes[2].menuVisible}`);
  console.log(`Menu still visible after 500ms: ${finalMenuVisible}`);
  console.log(`Menu shows on 2nd click: ${secondMenuVisible}`);
  console.log(`Menu div in DOM: ${menuDOMCount}`);
  console.log(`Console errors: ${consoleMessages.length}`);
  consoleMessages.slice(0, 5).forEach((m) => console.log(`  ${m}`));
  console.log(`Page errors: ${pageErrors.length}`);
  pageErrors.slice(0, 5).forEach((m) => console.log(`  ${m}`));

  await browser.close();
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
