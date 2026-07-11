import json
from collections import Counter
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "docs" / "daily" / "2026-07-11" / "brand-ui-ux-audit"
OUT.mkdir(parents=True, exist_ok=True)


def audit(browser, name, width, height):
    context = browser.new_context(viewport={"width": width, "height": height})
    page = context.new_page()
    page_errors = []
    failed_requests = []
    page.on("pageerror", lambda error: page_errors.append(str(error)))
    page.on("requestfailed", lambda req: failed_requests.append({"url": req.url, "failure": req.failure}))
    response = page.goto("http://127.0.0.1:3000/brand", wait_until="networkidle")
    page.screenshot(path=str(OUT / f"{name}-full.png"), full_page=True)
    page.screenshot(path=str(OUT / f"{name}-fold.png"))

    metrics = page.evaluate(
        """() => ({
          viewport:{width:innerWidth,height:innerHeight},
          document:{width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight},
          headings:[...document.querySelectorAll('main h1,main h2,main h3')].map(x=>({tag:x.tagName,text:x.innerText.trim(),y:Math.round(x.getBoundingClientRect().top+scrollY)})),
          sections:[...document.querySelectorAll('main section')].map(x=>({text:(x.querySelector('h1,h2,h3')?.innerText||'').trim(),y:Math.round(x.getBoundingClientRect().top+scrollY),height:Math.round(x.getBoundingClientRect().height)})),
          mainText:document.querySelector('main')?.innerText.replace(/\\s+/g,' ').slice(0,3500),
          mainLinks:[...document.querySelectorAll('main a[href]')].map(x=>({text:(x.innerText||x.getAttribute('aria-label')||'').trim().replace(/\\s+/g,' '),href:x.getAttribute('href'),w:Math.round(x.getBoundingClientRect().width),h:Math.round(x.getBoundingClientRect().height)})),
          mainButtons:[...document.querySelectorAll('main button')].map(x=>({text:(x.innerText||x.getAttribute('aria-label')||'').trim().replace(/\\s+/g,' '),w:Math.round(x.getBoundingClientRect().width),h:Math.round(x.getBoundingClientRect().height)})),
          images:[...document.images].map(x=>({src:x.currentSrc,alt:x.alt,naturalWidth:x.naturalWidth,naturalHeight:x.naturalHeight,y:Math.round(x.getBoundingClientRect().top+scrollY)})),
          svgs:document.querySelectorAll('main svg').length,
          smallTargets:[...document.querySelectorAll('a[href],button')].filter(x=>{const r=x.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(x).visibility!=='hidden'&&(r.width<44||r.height<44)}).map(x=>({text:(x.innerText||x.getAttribute('aria-label')||'').trim().replace(/\\s+/g,' ').slice(0,100),tag:x.tagName,w:Math.round(x.getBoundingClientRect().width),h:Math.round(x.getBoundingClientRect().height)})),
        })"""
    )
    image_counts = Counter(image["src"] for image in metrics["images"])
    metrics["duplicateImages"] = [{"src": src, "count": count} for src, count in image_counts.items() if count > 1]

    axe_source = (ROOT / "node_modules" / "axe-core" / "axe.min.js").read_text()
    page.add_script_tag(content=axe_source)
    axe = page.evaluate("async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})")
    violations = [{"id":v["id"],"impact":v["impact"],"nodes":len(v["nodes"]),"help":v["help"],"targets":[n["target"] for n in v["nodes"][:12]]} for v in axe["violations"]]

    result = {
        "name": name,
        "status": response.status if response else None,
        "metrics": metrics,
        "axe": violations,
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
