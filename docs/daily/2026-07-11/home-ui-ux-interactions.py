import json
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "docs" / "daily" / "2026-07-11" / "home-ui-ux-audit"
results = {}

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    page.goto("http://127.0.0.1:3000/", wait_until="networkidle")

    menu = page.get_by_role("button", name="切换菜单", exact=True)
    menu.click()
    page.wait_for_timeout(400)
    menu_dialog = page.get_by_role("dialog", name="移动端导航菜单", exact=True)
    results["mobileMenu"] = {
        "expanded": menu.get_attribute("aria-expanded"),
        "dialogVisible": menu_dialog.is_visible(),
        "bodyOverflow": page.evaluate("document.body.style.overflow"),
        "focused": page.locator(":focus").get_attribute("aria-label"),
    }
    page.screenshot(path=str(OUT / "production-mobile-menu.png"))
    page.keyboard.press("Escape")
    page.wait_for_timeout(400)
    results["mobileMenu"]["expandedAfterEscape"] = menu.get_attribute("aria-expanded")
    results["mobileMenu"]["focusRestored"] = page.locator(":focus").get_attribute("aria-label")

    consult = page.get_by_role("button", name="企业微信咨询", exact=True)
    consult.click()
    page.wait_for_timeout(300)
    consult_dialog = page.get_by_role("dialog", name="关注蓝辉轻改公众号", exact=True)
    results["consultDialog"] = {
        "visible": consult_dialog.is_visible(),
        "bodyOverflow": page.evaluate("document.body.style.overflow"),
        "focused": page.locator(":focus").get_attribute("aria-label"),
        "heading": consult_dialog.get_by_role("heading").inner_text(),
    }
    page.screenshot(path=str(OUT / "production-consult-dialog.png"))
    page.keyboard.press("Escape")
    page.wait_for_timeout(300)
    results["consultDialog"]["closedAfterEscape"] = not consult_dialog.is_visible()
    results["consultDialog"]["focusRestoredText"] = page.locator(":focus").inner_text()

    hrefs = page.locator('a[href^="/"]').evaluate_all("els => [...new Set(els.map(x => x.getAttribute('href')).filter(x => !x.includes('#')))]")
    broken = []
    for href in hrefs:
        response = context.request.get(f"http://127.0.0.1:3000{href}")
        if response.status >= 400:
            broken.append({"href": href, "status": response.status})
    results["internalLinks"] = {"checked": len(hrefs), "broken": broken}
    context.close()
    browser.close()

(OUT / "interaction-results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2))
print(json.dumps(results, ensure_ascii=False, indent=2))
