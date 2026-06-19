/**
 * 路由枚举工具 — 全站审计脚本层
 *
 * 导出:
 *   - ROUTE_PATTERNS:   静态路由模板数组
 *   - VIEWPORTS:        { DESKTOP, TABLET, MOBILE }
 *   - slugify(path):   "/product/zeekr" -> "product__zeekr"
 *   - collectRoutes({ withAdmin, withDynamic, baseUrl }): 异步展开
 *
 * 约束: 纯 ESM,无 npm 依赖(只用 node:fs / node:path)。
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── VIEWPORTS ──
export const VIEWPORTS = Object.freeze({
  DESKTOP: Object.freeze({ width: 1440, height: 900, name: "desktop" }),
  TABLET:  Object.freeze({ width: 768, height: 1024, name: "tablet"  }),
  MOBILE:  Object.freeze({ width: 390, height: 844,  name: "mobile"  }),
});

// ── ROUTE_PATTERNS ──
export const ROUTE_PATTERNS = Object.freeze([
  { path: "/",                          kind: "static",                label: "home" },
  { path: "/contact",                   kind: "static",                label: "contact" },
  { path: "/brand",                     kind: "static",                label: "brand" },
  { path: "/brand/certifications",      kind: "static",                label: "brand-certifications" },
  { path: "/brand/history",             kind: "static",                label: "brand-history" },
  { path: "/product",                   kind: "static",                label: "product" },
  { path: "/product/chassis",           kind: "static",                label: "product-chassis" },
  { path: "/product/color-film",        kind: "static",                label: "product-color-film" },
  { path: "/product/electric-steps",    kind: "static",                label: "product-electric-steps" },
  { path: "/product/flooring",          kind: "static",                label: "product-flooring" },
  { path: "/product/ppf",               kind: "static",                label: "product-ppf" },
  { path: "/product/wheels",            kind: "static",                label: "product-wheels" },
  { path: "/product/window-film",       kind: "static",                label: "product-window-film" },
  { path: "/product/wenjie",            kind: "static",                label: "product-wenjie" },
  { path: "/product/xiaomi",            kind: "static",                label: "product-xiaomi" },
  { path: "/product/zeekr",             kind: "static",                label: "product-zeekr" },
  { path: "/agent",                     kind: "static",                label: "agent" },
  { path: "/agent/guangdong",           kind: "dynamic:agent-province", label: "agent-province" },
  { path: "/agent/guangdong/guangzhou", kind: "dynamic:agent-city",    label: "agent-city" },
  { path: "/agent/store/placeholder",   kind: "dynamic:agent-store",    label: "agent-store" },
  { path: "/news",                      kind: "static",                label: "news" },
  { path: "/news/placeholder",          kind: "dynamic:news",           label: "news-detail" },
  { path: "/product/window-film/placeholder", kind: "dynamic:window-film", label: "window-film-detail" },
]);

// ── slugify ──
export function slugify(path) {
  return String(path).replace(/^\//, "").replace(/\//g, "__") || "root";
}

// ── 数据源读取 ──
const SRC_LIB = join(__dirname, "..", "..", "..", "src", "lib");

function safeReadText(fileRel) {
  try { return readFileSync(join(SRC_LIB, fileRel), "utf8"); } catch { return null; }
}

function extractNewsSlugs(limit = 3) {
  const src = safeReadText("news.ts");
  if (!src) return [];
  const re = /slug:\s*["']([^"']+)["']/g;
  const out = []; let m;
  while ((m = re.exec(src)) !== null && out.length < limit) out.push(m[1]);
  return out;
}

function extractAgentRegion() {
  const src = safeReadText("china-regions.ts");
  if (!src) return { province: null, city: null };
  const re = /value:\s*["']([a-z0-9-]+)["']/g;
  const out = []; let m;
  while ((m = re.exec(src)) !== null && out.length < 2) out.push(m[1]);
  return { province: out[0] || "beijing", city: out[1] || "dongcheng" };
}

function extractWindowFilmSlugs(limit = 2) {
  const src = safeReadText("products.ts");
  if (!src) return [];
  const re = /slug:\s*["']([^"']+)["']/g;
  const seen = new Set(); const out = []; let m;
  while ((m = re.exec(src)) !== null) {
    if (!seen.has(m[1])) { seen.add(m[1]); out.push(m[1]); if (out.length >= limit) break; }
  }
  return out;
}

async function fetchStoreIds(baseUrl) {
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/stores`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return [{ skipped: "http-error" }];
    const json = await res.json();
    const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
    const ids = list.map((s) => s?.id ?? s?.slug ?? s?.code).filter(Boolean).slice(0, 1);
    if (ids.length === 0) return [{ skipped: "empty" }];
    return ids.map((id) => ({ slug: String(id) }));
  } catch {
    return [{ skipped: "no-db" }];
  }
}

// ── collectRoutes ──
export async function collectRoutes({
  withAdmin = false,
  withDynamic = true,
  baseUrl = "http://localhost:3000",
} = {}) {
  const out = [];

  for (const tpl of ROUTE_PATTERNS) {
    if (tpl.kind === "static") {
      out.push({ path: tpl.path, label: tpl.label, kind: "static" });
      continue;
    }
    if (!withDynamic) {
      out.push({ path: tpl.path, label: tpl.label, kind: tpl.kind, status: "skipped:dynamic-disabled" });
      continue;
    }

    if (tpl.kind === "dynamic:news") {
      const slugs = extractNewsSlugs(3);
      if (slugs.length === 0) {
        out.push({ path: tpl.path, label: tpl.label, kind: tpl.kind, status: "skipped:no-source" });
        continue;
      }
      for (const slug of slugs) {
        out.push({ path: `/news/${slug}`, label: `news-detail-${slug}`, kind: tpl.kind });
      }
      continue;
    }

    if (tpl.kind === "dynamic:agent-province" || tpl.kind === "dynamic:agent-city") {
      const { province, city } = extractAgentRegion();
      if (!province) {
        out.push({ path: tpl.path, label: tpl.label, kind: tpl.kind, status: "skipped:no-source" });
        continue;
      }
      if (tpl.kind === "dynamic:agent-province") {
        out.push({ path: `/agent/${province}`, label: `agent-province-${province}`, kind: tpl.kind });
      } else {
        out.push({ path: `/agent/${province}/${city}`, label: `agent-city-${province}-${city}`, kind: tpl.kind });
      }
      continue;
    }

    if (tpl.kind === "dynamic:agent-store") {
      const ids = await fetchStoreIds(baseUrl);
      for (const item of ids) {
        if (item.skipped) {
          out.push({ path: tpl.path, label: tpl.label, kind: tpl.kind, status: `skipped:${item.skipped}` });
        } else {
          out.push({ path: `/agent/store/${item.slug}`, label: `agent-store-${item.slug}`, kind: tpl.kind });
        }
      }
      continue;
    }

    if (tpl.kind === "dynamic:window-film") {
      const slugs = extractWindowFilmSlugs(2);
      if (slugs.length === 0) {
        out.push({ path: tpl.path, label: tpl.label, kind: tpl.kind, status: "skipped:no-source" });
        continue;
      }
      for (const slug of slugs) {
        out.push({ path: `/product/window-film/${slug}`, label: `window-film-${slug}`, kind: tpl.kind });
      }
      continue;
    }

    out.push({ path: tpl.path, label: tpl.label, kind: tpl.kind, status: "skipped:unknown-kind" });
  }

  if (withAdmin) {
    out.push({ path: "/admin/login",      label: "admin-login",      kind: "static", requiresAdmin: false });
    out.push({ path: "/admin/dashboard",  label: "admin-dashboard",  kind: "static", requiresAdmin: true  });
    out.push({ path: "/admin/analytics",  label: "admin-analytics",  kind: "static", requiresAdmin: true  });
    out.push({ path: "/admin/stores",     label: "admin-stores",     kind: "static", requiresAdmin: true  });
    out.push({ path: "/admin/articles",   label: "admin-articles",   kind: "static", requiresAdmin: true  });
  }

  return out;
}
