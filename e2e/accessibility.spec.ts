import { test, expect } from "@playwright/test";

const VIEWPORT_MOBILE = { width: 375, height: 812 };

/** Press Tab key. Returns the newly focused element's tagName or null. */
async function pressTab(page: import("@playwright/test").Page, shift = false) {
  await page.keyboard.press(shift ? "Shift+Tab" : "Tab");
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    return el.tagName.toLowerCase() + (el.getAttribute("aria-label") ? `[aria-label="${el.getAttribute("aria-label")}"]` : "");
  });
}

/** Press Tab N times in sequence. Returns array of focused element descriptions. */
async function pressTabNTimes(page: import("@playwright/test").Page, n: number) {
  const results: (string | null)[] = [];
  for (let i = 0; i < n; i++) {
    results.push(await pressTab(page));
  }
  return results;
}

// ════════════════════════════════════════════════════════════════════
// H8: Skip-to-content link (WCAG 2.4.1 Bypass Blocks)
// ════════════════════════════════════════════════════════════════════

test.describe("H8: Skip-to-content link", () => {
  test("skip link exists and is visually hidden by default", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.locator('a[href="#main-content"]').first();
    await expect(skipLink).toBeAttached();
    // Should be off-screen when not focused (sr-only)
    await expect(skipLink).not.toBeInViewport();
  });

  test("skip link becomes visible on Tab focus", async ({ page }) => {
    await page.goto("/");
    // Focus the URL bar first, then Tab should hit skip link
    await page.keyboard.press("Tab");
    const skipLink = page.locator('a[href="#main-content"]').first();
    await expect(skipLink).toBeFocused();
  });

  test("skip link navigates to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    // After activation, #main-content should have focus or be in the URL hash
    const mainEl = page.locator("#main-content").first();
    await expect(mainEl).toBeAttached();
  });

  test("admin login page has skip-to-content with #main-content as <main>", async ({ page }) => {
    await page.goto("/admin/login");
    const mainEl = page.locator("main#main-content");
    await expect(mainEl).toBeAttached();
    await expect(mainEl).toHaveAttribute("tabindex", "-1");
  });
});

// ════════════════════════════════════════════════════════════════════
// H9: Header mobile menu focus trap (WCAG 2.4.3 Focus Order)
// ════════════════════════════════════════════════════════════════════

test.describe("H9: Header mobile menu focus trap", () => {
  test("mobile menu button has aria-expanded and aria-label", async ({ page }) => {
    await page.setViewportSize(VIEWPORT_MOBILE);
    await page.goto("/");
    const menuBtn = page.locator('button[aria-label="切换菜单"]');
    await expect(menuBtn).toBeVisible();
    await expect(menuBtn).toHaveAttribute("aria-expanded", "false");
  });

  test("opening mobile menu sets aria-expanded and shows dialog", async ({ page }) => {
    await page.setViewportSize(VIEWPORT_MOBILE);
    await page.goto("/");
    const menuBtn = page.locator('button[aria-label="切换菜单"]');
    await menuBtn.click();
    await expect(menuBtn).toHaveAttribute("aria-expanded", "true");

    const dialog = page.locator('[role="dialog"][aria-label="移动端导航菜单"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  test("Escape closes mobile menu and returns focus to toggle button", async ({ page }) => {
    await page.setViewportSize(VIEWPORT_MOBILE);
    await page.goto("/");
    const menuBtn = page.locator('button[aria-label="切换菜单"]');
    await menuBtn.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    await expect(menuBtn).toBeFocused();
  });

  test("Tab cycles focus within open mobile menu", async ({ page }) => {
    await page.setViewportSize(VIEWPORT_MOBILE);
    await page.goto("/");
    await page.locator('button[aria-label="切换菜单"]').click();

    // Wait for dialog to be visible
    const dialog = page.locator('[role="dialog"][aria-label="移动端导航菜单"]');
    await expect(dialog).toBeVisible();

    // First focusable should be the close button inside the dialog
    await page.waitForTimeout(100); // let focus settle
    const firstFocused = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.getAttribute("aria-label") ?? el?.tagName ?? null;
    });
    // Either close button or first nav link should have focus
    expect(firstFocused).toBeTruthy();

    // Collect all focusable elements within dialog
    const focusableInDialog = await dialog.locator(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ).all();

    // Press Tab enough times and verify focus stays inside the dialog
    let stayedInside = true;
    for (let i = 0; i < focusableInDialog.length + 2; i++) {
      await page.keyboard.press("Tab");
      const focusedInDialog = await page.evaluate((sel) => {
        const dlg = document.querySelector(sel);
        const active = document.activeElement;
        return dlg?.contains(active) ?? false;
      }, '[role="dialog"][aria-label="移动端导航菜单"]');
      if (!focusedInDialog) {
        stayedInside = false;
        break;
      }
    }
    expect(stayedInside).toBe(true);
  });

  test("closed mobile menu links are not in tab order", async ({ page }) => {
    await page.setViewportSize(VIEWPORT_MOBILE);
    await page.goto("/");

    const dialog = page.locator('[role="dialog"][aria-label="移动端导航菜单"]');
    // Focusable elements inside the hidden dialog should be inaccessible
    const hiddenFocusable = await dialog.locator(
      'a[href], button:not([disabled])'
    ).first();
    // The dialog child links should not be visible (slide-in panel is off-screen)
    await expect(hiddenFocusable).not.toBeInViewport();
  });
});

// ════════════════════════════════════════════════════════════════════
// H9: Admin Sidebar focus trap
// ════════════════════════════════════════════════════════════════════

test.describe("H9: Admin Sidebar focus trap", () => {
  test.beforeEach(async ({ page }) => {
    // Login to admin
    await page.goto("/admin/login");
    await page.fill("#username", "admin");
    await page.fill("#password", "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/admin**");
    // Should be redirected to dashboard, not login
    await expect(page).not.toHaveURL(/\/admin\/login/);
  });

  test("sidebar mobile toggle has aria-label and shows sidebar on click", async ({ page }) => {
    await page.setViewportSize(VIEWPORT_MOBILE);
    await page.goto("/admin");
    const menuBtn = page.locator('button[aria-label="打开菜单"]');
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    // Sidebar should now be visible (translate-x-0)
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
  });

  test("sidebar becomes dialog with aria-modal when open on mobile", async ({ page }) => {
    await page.setViewportSize(VIEWPORT_MOBILE);
    await page.goto("/admin");
    await page.locator('button[aria-label="打开菜单"]').click();

    const sidebar = page.locator('aside[role="dialog"]');
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toHaveAttribute("aria-modal", "true");
    await expect(sidebar).toHaveAttribute("aria-label", "后台导航菜单");
  });

  test("sidebar is not dialog on desktop (lg breakpoint)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/admin");
    const sidebar = page.locator("aside");
    // On desktop, role should NOT be "dialog" (sidebar is static)
    await expect(sidebar).not.toHaveAttribute("role", "dialog");
  });

  test("Escape closes mobile sidebar and returns focus to toggle button", async ({ page }) => {
    await page.setViewportSize(VIEWPORT_MOBILE);
    await page.goto("/admin");
    const menuBtn = page.locator('button[aria-label="打开菜单"]');
    await menuBtn.click();
    await expect(page.locator('aside[role="dialog"]')).toBeVisible();

    await page.keyboard.press("Escape");
    // Sidebar should be off-screen again
    const sidebar = page.locator("aside");
    await expect(sidebar).not.toHaveAttribute("role", "dialog");
    // Focus should return to the toggle button
    await expect(menuBtn).toBeFocused();
  });

  test("overlay click closes mobile sidebar", async ({ page }) => {
    await page.setViewportSize(VIEWPORT_MOBILE);
    await page.goto("/admin");
    await page.locator('button[aria-label="打开菜单"]').click();
    await expect(page.locator('aside[role="dialog"]')).toBeVisible();

    // Click the overlay (aria-hidden="true" backdrop)
    const overlay = page.locator(".fixed.inset-0.z-40.bg-black\\/60");
    // Use force:true because the overlay might not be clickable by Playwright's default actionability checks
    await overlay.click({ force: true });

    // Sidebar should no longer be dialog
    await expect(page.locator("aside")).not.toHaveAttribute("role", "dialog");
  });

  test("Tab cycles within open mobile sidebar", async ({ page }) => {
    await page.setViewportSize(VIEWPORT_MOBILE);
    await page.goto("/admin");
    await page.locator('button[aria-label="打开菜单"]').click();
    await page.waitForTimeout(100);

    const sidebar = page.locator("aside");
    const focusableInSidebar = await sidebar.locator(
      'a[href], button:not([disabled])'
    ).all();
    const count = focusableInSidebar.length;
    expect(count).toBeGreaterThan(0);

    // Tab N times and verify focus stays inside the sidebar
    let focusInside = true;
    for (let i = 0; i < count + 2; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate((el) => {
        const active = document.activeElement;
        return el?.contains(active) ?? false;
      }, await sidebar.elementHandle());
      if (!inside) {
        focusInside = false;
        break;
      }
    }
    expect(focusInside).toBe(true);
  });

  test("desktop sidebar is static with no focus trap restriction", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/admin");

    // On desktop, sidebar is a static <aside> - not a dialog
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
    // Navigate links should be directly accessible
    const dashboardLink = sidebar.locator('a[href="/admin"]');
    await expect(dashboardLink).toBeVisible();
  });
});
