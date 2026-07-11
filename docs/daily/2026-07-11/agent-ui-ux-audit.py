import json
from collections import Counter
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "docs" / "daily" / "2026-07-11" / "agent-ui-ux-audit"
OUT.mkdir(parents=True, exist_ok=True)


def audit(browser, name, width, height):
    context = browser.new_context(viewport={"width": width, "height": height})
    page = context.new_page()
    page_errors = []
    failed_requests = []
    page.on("pageerror", lambda error: page_errors.append(str(error)))
    page.on("requestfailed", lambda req: failed_requests.append({"url": req.url, "failure": req.failure}))
    response = page.goto("http://127.0.0.1:3000/agent", wait_until="networkidle")
    page.screenshot(path=str(OUT / f"{name}-full.png"), full_page=True)
    page.screenshot(path=str(OUT / f"{name}-fold.png"))

    metrics = page.evaluate(
        """() => ({
          viewport:{width:innerWidth,height:innerHeight},
          document:{width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight},
          headings:[...document.querySelectorAll('h1,h2,h3')].map(x=>({tag:x.tagName,text:x.innerText.trim(),y:Math.round(x.getBoundingClientRect().top+scrollY)})),
          summaryText:document.querySelector('main')?.innerText.replace(/\\s+/g,' ').slice(0,2500),
          provinceLinks:[...document.querySelectorAll('a[href^="/agent/"]')].filter(x=>!x.getAttribute('href').startsWith('/agent/store/')).map(x=>({text:x.innerText.trim().replace(/\\s+/g,' '),href:x.getAttribute('href'),y:Math.round(x.getBoundingClientRect().top+scrollY),w:Math.round(x.getBoundingClientRect().width),h:Math.round(x.getBoundingClientRect().height)})),
          storeLinks:[...document.querySelectorAll('a[href^="/agent/store/"]')].map(x=>({label:x.getAttribute('aria-label'),text:x.innerText.trim().replace(/\\s+/g,' ').slice(0,220),href:x.getAttribute('href'),y:Math.round(x.getBoundingClientRect().top+scrollY),h:Math.round(x.getBoundingClientRect().height)})),
          images:[...document.images].map(x=>({src:x.currentSrc,alt:x.alt,naturalWidth:x.naturalWidth,naturalHeight:x.naturalHeight})),
          telLinks:[...document.querySelectorAll('a[href^="tel:"]')].map(x=>({text:x.innerText.trim(),href:x.getAttribute('href')})),
          mapLinks:[...document.querySelectorAll('a[href*="map"],a[href*="amap"],a[href*="baidu"]')].map(x=>({text:x.innerText.trim(),href:x.getAttribute('href')})),
          forms:[...document.querySelectorAll('form')].map(x=>({action:x.action,method:x.method})),
          inputs:[...document.querySelectorAll('input')].map(x=>({type:x.type,role:x.getAttribute('role'),label:x.getAttribute('aria-label'),placeholder:x.placeholder,height:Math.round(x.getBoundingClientRect().height)})),
          buttons:[...document.querySelectorAll('button')].filter(x=>{const r=x.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(x).visibility!=='hidden'}).map(x=>({text:(x.innerText||x.getAttribute('aria-label')||'').trim(),label:x.getAttribute('aria-label'),w:Math.round(x.getBoundingClientRect().width),h:Math.round(x.getBoundingClientRect().height)})),
          smallTargets:[...document.querySelectorAll('a[href],button')].filter(x=>{const r=x.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(x).visibility!=='hidden'&&(r.width<44||r.height<44)}).map(x=>({text:(x.innerText||x.getAttribute('aria-label')||'').trim().replace(/\\s+/g,' ').slice(0,100),tag:x.tagName,w:Math.round(x.getBoundingClientRect().width),h:Math.round(x.getBoundingClientRect().height)})),
        })"""
    )
    image_counts = Counter(image["src"] for image in metrics["images"])
    metrics["duplicateImages"] = [{"src": src, "count": count} for src, count in image_counts.items() if count > 1]

    axe_source = (ROOT / "node_modules" / "axe-core" / "axe.min.js").read_text()
    page.add_script_tag(content=axe_source)
    axe = page.evaluate("async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})")
    violations = [{"id":v["id"],"impact":v["impact"],"nodes":len(v["nodes"]),"help":v["help"],"targets":[n["target"] for n in v["nodes"][:12]]} for v in axe["violations"]]

    interactions = {}
    search = page.get_by_role("combobox", name="搜索门店")
    search.fill("佛山")
    page.wait_for_timeout(600)
    listbox = page.locator("#store-search-listbox")
    interactions["suggestions"] = {
        "visible": listbox.is_visible(),
        "options": listbox.get_by_role("option").count() if listbox.is_visible() else 0,
        "text": listbox.inner_text()[:800] if listbox.is_visible() else "",
        "expanded": search.get_attribute("aria-expanded"),
    }
    if listbox.is_visible() and listbox.get_by_role("option").count() > 0:
        search.press("ArrowDown")
        interactions["keyboardSuggestion"] = {
            "activeDescendant": search.get_attribute("aria-activedescendant"),
            "firstSelected": listbox.get_by_role("option").first.get_attribute("aria-selected"),
        }
        search.press("Escape")
        interactions["keyboardSuggestion"]["closedAfterEscape"] = not listbox.is_visible()

    page.goto("http://127.0.0.1:3000/agent?q=%E4%B8%8D%E5%AD%98%E5%9C%A8%E7%9A%84%E9%97%A8%E5%BA%97", wait_until="networkidle")
    interactions["emptySearch"] = {
        "url": page.url,
        "heading": page.locator("h2").last.inner_text() if page.locator("h2").count() else "",
        "emptyVisible": page.get_by_text("未找到匹配的门店", exact=True).is_visible(),
        "clearLinkVisible": page.get_by_role("link", name="清除搜索，查看全部门店").is_visible(),
        "provinceSectionStillVisible": page.get_by_role("heading", name="按省份浏览").is_visible(),
    }
    page.screenshot(path=str(OUT / f"{name}-empty-search.png"), full_page=False)

    result = {
        "name": name,
        "status": response.status if response else None,
        "metrics": metrics,
        "axe": violations,
        "interactions": interactions,
        "pageErrors": page_errors,
        "failedRequests": failed_requests,
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
