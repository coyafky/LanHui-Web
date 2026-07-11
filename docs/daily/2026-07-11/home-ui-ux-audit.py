import json
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "docs" / "daily" / "2026-07-11" / "home-ui-ux-audit"
OUT.mkdir(parents=True, exist_ok=True)


def element_summary(locator):
    return locator.evaluate(
        """el => ({
          tag: el.tagName,
          text: (el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ').slice(0, 120),
          href: el.getAttribute('href'),
          role: el.getAttribute('role'),
          box: (() => { const r = el.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height}; })()
        })"""
    )


def audit_viewport(browser, name, width, height):
    context = browser.new_context(viewport={"width": width, "height": height}, device_scale_factor=1)
    page = context.new_page()
    console_errors = []
    page_errors = []
    failed_requests = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda error: page_errors.append(str(error)))
    page.on("requestfailed", lambda req: failed_requests.append({"url": req.url, "failure": req.failure}))

    response = page.goto("http://127.0.0.1:3000/", wait_until="networkidle")
    page.screenshot(path=str(OUT / f"{name}-full.png"), full_page=True)
    page.screenshot(path=str(OUT / f"{name}-fold.png"), full_page=False)

    metrics = page.evaluate(
        """() => ({
          title: document.title,
          lang: document.documentElement.lang,
          viewport: {w: innerWidth, h: innerHeight},
          document: {scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight},
          body: {scrollWidth: document.body.scrollWidth, scrollHeight: document.body.scrollHeight},
          h1: [...document.querySelectorAll('h1')].map(x => x.innerText.trim()),
          headings: [...document.querySelectorAll('h1,h2,h3')].map(x => ({level:x.tagName, text:x.innerText.trim(), y:Math.round(x.getBoundingClientRect().top + scrollY)})),
          landmarks: [...document.querySelectorAll('header,nav,main,section,footer')].map(x => ({tag:x.tagName, label:x.getAttribute('aria-label'), y:Math.round(x.getBoundingClientRect().top + scrollY), h:Math.round(x.getBoundingClientRect().height)})),
          images: [...document.images].map(x => ({src:x.currentSrc, alt:x.alt, complete:x.complete, naturalWidth:x.naturalWidth, naturalHeight:x.naturalHeight})),
          links: [...document.querySelectorAll('a[href]')].map(x => ({text:(x.innerText || x.getAttribute('aria-label') || '').trim().replace(/\\s+/g,' '), href:x.getAttribute('href')})),
          buttons: [...document.querySelectorAll('button')].map(x => ({text:(x.innerText || x.getAttribute('aria-label') || '').trim().replace(/\\s+/g,' '), disabled:x.disabled, ariaExpanded:x.getAttribute('aria-expanded')})),
          smallTargets: [...document.querySelectorAll('a[href],button,input,select,textarea')].map(x => {const r=x.getBoundingClientRect(); return {text:(x.innerText || x.getAttribute('aria-label') || '').trim().replace(/\\s+/g,' ').slice(0,80), tag:x.tagName, w:Math.round(r.width), h:Math.round(r.height), visible:!!(r.width&&r.height)};}).filter(x => x.visible && (x.w < 44 || x.h < 44)),
          fixed: [...document.querySelectorAll('body *')].filter(x => ['fixed','sticky'].includes(getComputedStyle(x).position)).map(x => ({tag:x.tagName, text:(x.innerText||'').trim().replace(/\\s+/g,' ').slice(0,80), position:getComputedStyle(x).position})),
        })"""
    )

    axe_source = (ROOT / "node_modules" / "axe-core" / "axe.min.js").read_text()
    page.add_script_tag(content=axe_source)
    axe = page.evaluate("async () => await axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa']}})")
    axe_summary = [
        {
            "id": violation["id"],
            "impact": violation["impact"],
            "help": violation["help"],
            "nodes": len(violation["nodes"]),
            "targets": [node["target"] for node in violation["nodes"][:8]],
        }
        for violation in axe["violations"]
    ]

    focus_order = []
    page.keyboard.press("Home")
    for _ in range(24):
        page.keyboard.press("Tab")
        active = page.locator(":focus")
        if active.count():
            focus_order.append(element_summary(active.first))

    interactions = {}
    if width < 1024:
        menu = page.get_by_role("button", name="切换菜单")
        menu.click()
        page.wait_for_timeout(350)
        interactions["mobileMenu"] = {
            "open": menu.get_attribute("aria-expanded"),
            "bodyOverflow": page.evaluate("getComputedStyle(document.body).overflow"),
            "dialogVisible": page.get_by_role("dialog", name="移动端导航菜单").is_visible(),
        }
        page.screenshot(path=str(OUT / f"{name}-menu.png"), full_page=False)
        page.keyboard.press("Escape")
        page.wait_for_timeout(350)
        interactions["mobileMenu"]["closedAfterEscape"] = menu.get_attribute("aria-expanded")

    consult = page.get_by_role("button", name="微信咨询")
    if consult.count():
        consult.first.click()
        page.wait_for_timeout(250)
        dialogs = page.locator('[role="dialog"]')
        interactions["consultDialog"] = {
            "visible": dialogs.count() > 0 and dialogs.first.is_visible(),
            "text": dialogs.first.inner_text()[:500] if dialogs.count() else "",
        }
        page.screenshot(path=str(OUT / f"{name}-consult.png"), full_page=False)
        page.keyboard.press("Escape")

    result = {
        "name": name,
        "status": response.status if response else None,
        "metrics": metrics,
        "axe": axe_summary,
        "focusOrder": focus_order,
        "interactions": interactions,
        "consoleErrors": console_errors,
        "pageErrors": page_errors,
        "failedRequests": failed_requests,
    }
    context.close()
    return result


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    results = [
        audit_viewport(browser, "mobile-390", 390, 844),
        audit_viewport(browser, "tablet-768", 768, 1024),
        audit_viewport(browser, "desktop-1440", 1440, 1000),
    ]
    browser.close()

(OUT / "results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2))
print(json.dumps(results, ensure_ascii=False, indent=2))
