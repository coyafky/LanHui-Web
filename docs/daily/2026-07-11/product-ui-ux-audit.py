import json
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "docs" / "daily" / "2026-07-11" / "product-ui-ux-audit"
OUT.mkdir(parents=True, exist_ok=True)


def audit(browser, name, width, height):
    context = browser.new_context(viewport={"width": width, "height": height})
    page = context.new_page()
    errors = []
    failures = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("requestfailed", lambda req: failures.append({"url": req.url, "failure": req.failure}))
    response = page.goto("http://127.0.0.1:3000/product", wait_until="networkidle")

    page.screenshot(path=str(OUT / f"{name}-full.png"), full_page=True)
    page.screenshot(path=str(OUT / f"{name}-fold.png"))

    metrics = page.evaluate(
        """() => ({
          viewport: {width: innerWidth, height: innerHeight},
          document: {width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight},
          headings: [...document.querySelectorAll('h1,h2,h3,h4')].filter(x => getComputedStyle(x).display !== 'none').map(x => ({tag:x.tagName,text:x.innerText.trim(),y:Math.round(x.getBoundingClientRect().top+scrollY)})),
          images: [...document.images].map(x => ({src:x.currentSrc,alt:x.alt,width:x.naturalWidth,height:x.naturalHeight})),
          svgs: document.querySelectorAll('svg').length,
          visibleLinks: [...document.querySelectorAll('a[href]')].filter(x => {const r=x.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(x).visibility!=='hidden'}).map(x => ({text:(x.innerText||x.getAttribute('aria-label')||'').trim().replace(/\\s+/g,' ').slice(0,140),href:x.getAttribute('href'),w:Math.round(x.getBoundingClientRect().width),h:Math.round(x.getBoundingClientRect().height)})),
          buttons: [...document.querySelectorAll('button')].filter(x => {const r=x.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(x).visibility!=='hidden'}).map(x => ({text:(x.innerText||x.getAttribute('aria-label')||'').trim().replace(/\\s+/g,' '),role:x.getAttribute('role'),id:x.id,selected:x.getAttribute('aria-selected'),expanded:x.getAttribute('aria-expanded'),w:Math.round(x.getBoundingClientRect().width),h:Math.round(x.getBoundingClientRect().height)})),
          panels: [...document.querySelectorAll('[role=tabpanel]')].map(x => ({id:x.id,labelledby:x.getAttribute('aria-labelledby'),display:getComputedStyle(x).display,hidden:x.hidden,y:Math.round(x.getBoundingClientRect().top+scrollY)})),
          smallTargets: [...document.querySelectorAll('a[href],button')].filter(x => {const r=x.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(x).visibility!=='hidden'&&(r.width<44||r.height<44)}).map(x => ({text:(x.innerText||x.getAttribute('aria-label')||'').trim().replace(/\\s+/g,' ').slice(0,100),tag:x.tagName,w:Math.round(x.getBoundingClientRect().width),h:Math.round(x.getBoundingClientRect().height)})),
          text: document.querySelector('main').innerText.replace(/\\s+/g,' ').slice(0,2000)
        })"""
    )

    axe_source = (ROOT / "node_modules" / "axe-core" / "axe.min.js").read_text()
    page.add_script_tag(content=axe_source)
    axe = page.evaluate("async () => await axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})")
    violations = [{"id":v["id"],"impact":v["impact"],"nodes":len(v["nodes"]),"help":v["help"],"targets":[n["target"] for n in v["nodes"][:12]]} for v in axe["violations"]]

    interactions = {}
    if width < 768:
        vehicle_tab = page.get_by_role("tab", name="按车型", exact=True)
        project_tab = page.get_by_role("tab", name="按项目", exact=True)
        interactions["tabsInitial"] = {
            "vehicleSelected": vehicle_tab.get_attribute("aria-selected"),
            "projectSelected": project_tab.get_attribute("aria-selected"),
            "vehiclePanelVisible": page.locator("#tab-panel-vehicle").is_visible(),
            "projectPanelVisible": page.locator("#tab-panel-project").is_visible(),
        }
        project_tab.click()
        page.wait_for_timeout(250)
        interactions["tabsAfterClick"] = {
            "vehicleSelected": vehicle_tab.get_attribute("aria-selected"),
            "projectSelected": project_tab.get_attribute("aria-selected"),
            "vehiclePanelVisible": page.locator("#tab-panel-vehicle").is_visible(),
            "projectPanelVisible": page.locator("#tab-panel-project").is_visible(),
        }
        page.screenshot(path=str(OUT / f"{name}-project-tab.png"), full_page=True)

        page.goto("http://127.0.0.1:3000/product", wait_until="networkidle")
        project_anchor = page.get_by_role("link", name="按项目看", exact=True)
        project_anchor.click()
        page.wait_for_timeout(250)
        interactions["heroProjectAnchor"] = {
            "hash": page.evaluate("location.hash"),
            "scrollY": page.evaluate("Math.round(scrollY)"),
            "projectPanelVisible": page.locator("#tab-panel-project").is_visible(),
            "projectTabSelected": page.get_by_role("tab", name="按项目", exact=True).get_attribute("aria-selected"),
        }

        vehicle_tab = page.get_by_role("tab", name="按车型", exact=True)
        vehicle_tab.focus()
        page.keyboard.press("ArrowRight")
        interactions["tabKeyboard"] = {
            "focusedText": page.locator(":focus").inner_text(),
            "projectSelected": page.get_by_role("tab", name="按项目", exact=True).get_attribute("aria-selected"),
        }

    focus_order = []
    page.keyboard.press("Home")
    for _ in range(30):
        page.keyboard.press("Tab")
        focused = page.locator(":focus")
        if focused.count():
            focus_order.append(focused.evaluate("x => ({tag:x.tagName,text:(x.innerText||x.getAttribute('aria-label')||'').trim().replace(/\\s+/g,' ').slice(0,100),href:x.getAttribute('href'),role:x.getAttribute('role')})"))

    result = {
        "name": name,
        "status": response.status if response else None,
        "metrics": metrics,
        "axe": violations,
        "interactions": interactions,
        "focusOrder": focus_order,
        "pageErrors": errors,
        "failedRequests": failures,
    }
    context.close()
    return result


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    results = [
        audit(browser, "mobile-390", 390, 844),
        audit(browser, "tablet-768", 768, 1024),
        audit(browser, "desktop-1440", 1440, 1000),
    ]
    browser.close()

(OUT / "results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2))
print(json.dumps(results, ensure_ascii=False, indent=2))
