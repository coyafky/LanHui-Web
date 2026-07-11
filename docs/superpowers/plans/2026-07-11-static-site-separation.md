# Static Public Site Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 在分支 codex/static-site-extraction 中把现有项目精简为可由 Next.js 16 static export 构建和托管的公开官网，同时让 main 分支继续保留 Admin、API、Prisma 和完整动态能力。

**Architecture:** 静态分支继续使用仓库根目录，不引入 apps/site monorepo。公开首页、品牌、产品、联系和门店页面保留；门店与产品数据全部来自构建期 TypeScript 数据，图片来自 public/images；next build 生成 out/，由 CloudBase 静态托管。Admin、API、Article、Auth、数据库、在线上传和第一方服务端分析从静态分支删除。

**Tech Stack:** Next.js 16.2.1 App Router、React 19.2.4、TypeScript strict、Tailwind v4、Vitest、Playwright、CloudBase Static Hosting。

## Global Constraints

- 只在 /Users/fkycoya/Documents/WebsiteClone/lanhui-website/.claude/worktrees/static-site-extraction 执行。
- 分支固定为 codex/static-site-extraction，不修改 main 工作区。
- 只保留公开路由：/、/brand、/product、/agent、/contact 及其公开子路由。
- Article 已关闭，不重新引入 /news、文章 CMS 或 react-markdown。
- 静态分支不得包含可运行的 /admin、/api、NextAuth、Prisma、PostgreSQL 或上传接口。
- 门店搜索必须改为浏览器端本地过滤，不请求 /api/stores。
- 所有动态路由必须提供 generateStaticParams 且 dynamicParams = false。
- 不使用 cookies、headers、Server Actions、ISR、runtime redirects 或默认 Next Image optimizer。
- next.config.ts 使用 output: "export"、trailingSlash: true、images.unoptimized: true。
- 图片只保留产品和门店展示资产；每个引用必须在 public/images 中存在。
- TypeScript strict，禁止 any；named exports；2-space；Tailwind utilities。
- 不以当前全量 npm test 作为起始绿灯：基线已知存在极氪旧目录残留和一次 jest-dom matcher 不稳定。每个任务使用定向测试，最终静态分支全量测试必须归零。
- 每个任务独立 commit；禁止将 node_modules、out、.next 或 worktree 元数据提交。
- 云端发布凭证不写入 Git；计划执行阶段先产出 out artifact，正式部署需要用户授权。

---

## Current Baseline

Worktree:

~~~text
Path: /Users/fkycoya/Documents/WebsiteClone/lanhui-website/.claude/worktrees/static-site-extraction
Branch: codex/static-site-extraction
Base: cc899658eed20d8a3894272b841a02ab331b17e3
~~~

已知测试基线：

~~~text
可重复精简运行：68 test files passed，2 failed
通过 tests：1049
失败 tests：5
其中 2 个由 LOG_LEVEL=silent 测试命令引入
真实剩余：public/images/products/ZEEKR 下 3 个旧目录残留
首次全量运行还出现 jest-dom matcher 加载不稳定，需要在 Task 1 复核
~~~

---

### Task 1: Freeze Scope and Add Static Boundary Guard

**Files:**
- Create: scripts/check-static-export-boundary.mjs
- Create: scripts/check-static-export-boundary.test.mjs
- Modify: package.json
- Create: docs/test-reports/2026-07-12/STATIC_SITE_BASELINE.md

**Interfaces:**
- Produces: npm run check:static-boundary
- Produces: machine-readable PASS/FAIL exit code used by CI.
- Consumes: repository filesystem only; no database or network.

- [ ] **Step 1: Write the failing guard test**

Create scripts/check-static-export-boundary.test.mjs:

~~~js
import { describe, expect, it } from "vitest";
import { inspectStaticBoundary } from "./check-static-export-boundary.mjs";

describe("static export boundary", () => {
  it("reports current dynamic surfaces before separation", () => {
    const result = inspectStaticBoundary(process.cwd());
    expect(result.violations).toContain("src/app/admin");
    expect(result.violations).toContain("src/app/api");
    expect(result.violations).toContain("src/lib/prisma.ts");
    expect(result.violations).toContain("src/lib/auth.ts");
  });
});
~~~

- [ ] **Step 2: Run the test and verify RED**

Run:

~~~bash
npx vitest run scripts/check-static-export-boundary.test.mjs
~~~

Expected: FAIL because the guard module does not exist.

- [ ] **Step 3: Implement the boundary inspector**

Create scripts/check-static-export-boundary.mjs:

~~~js
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const FORBIDDEN_PATHS = [
  "src/app/admin",
  "src/app/api",
  "src/lib/prisma.ts",
  "src/lib/auth.ts",
  "prisma",
];

const FORBIDDEN_PATTERNS = [
  /from [\"']@\\/lib\\/prisma[\"']/,
  /from [\"']@\\/lib\\/auth[\"']/,
  /from [\"']next-auth/,
  /fetch\\([\"'\x60]\\/api\\//,
];

function sourceFiles(root) {
  const result = [];
  function visit(path) {
    for (const name of readdirSync(path)) {
      const absolute = join(path, name);
      const stat = statSync(absolute);
      if (stat.isDirectory()) visit(absolute);
      else if (/\\.(ts|tsx|js|mjs)$/.test(name)) result.push(absolute);
    }
  }
  visit(join(root, "src"));
  return result;
}

export function inspectStaticBoundary(root) {
  const violations = FORBIDDEN_PATHS.filter((path) =>
    existsSync(join(root, path)),
  );

  if (existsSync(join(root, "src"))) {
    for (const file of sourceFiles(root)) {
      const source = readFileSync(file, "utf8");
      if (FORBIDDEN_PATTERNS.some((pattern) => pattern.test(source))) {
        violations.push(relative(root, file));
      }
    }
  }

  return { violations: [...new Set(violations)].sort() };
}

if (process.argv[1]?.endsWith("check-static-export-boundary.mjs")) {
  const result = inspectStaticBoundary(process.cwd());
  if (result.violations.length > 0) {
    console.error(result.violations.join("\\n"));
    process.exit(1);
  }
  console.log("Static export boundary: PASS");
}
~~~

- [ ] **Step 4: Update the test to define the final contract**

Replace the current-state assertion with:

~~~js
it("contains no dynamic server surface", () => {
  expect(inspectStaticBoundary(process.cwd())).toEqual({ violations: [] });
});
~~~

Do not expect this test to pass until Task 5 removes dynamic surfaces.

- [ ] **Step 5: Add package script**

Add:

~~~json
"check:static-boundary": "node scripts/check-static-export-boundary.mjs"
~~~

- [ ] **Step 6: Record the exact baseline**

Document the worktree path, base SHA, baseline failures, and the rule that new failures must not be hidden by changing assertions.

- [ ] **Step 7: Commit**

~~~bash
git add scripts/check-static-export-boundary.mjs \
  scripts/check-static-export-boundary.test.mjs package.json \
  docs/test-reports/2026-07-12/STATIC_SITE_BASELINE.md
git commit -m "test: define static export boundary"
~~~

---

### Task 2: Replace Runtime Store Access with Static Queries

**Files:**
- Create: src/lib/store-query.ts
- Create: src/lib/store-query.test.ts
- Modify: src/app/agent/page.tsx
- Modify: src/app/agent/[slug]/page.tsx
- Modify: src/app/agent/[slug]/[city]/page.tsx
- Modify: src/app/agent/store/[id]/page.tsx
- Modify: src/components/FeaturedStores.tsx
- Modify: src/components/FeaturedStores.test.tsx
- Modify: src/app/sitemap.ts
- Delete later: src/lib/data.ts、src/lib/data.test.ts

**Interfaces:**
- Consumes: Store、Province、City、stores、provinces、cities from src/lib/store.ts.
- Produces: listStores(query): Store[]
- Produces: findStore(id): Store | undefined
- Produces: listProvinces(): Province[]
- Produces: findProvince(slug): Province | undefined
- Produces: listCities(province?): City[]
- Produces: listStaticStoreParams(): Array<{ id: string }>
- Produces: listStaticCityParams(): Array<{ slug: string; city: string }>

- [ ] **Step 1: Write static query tests**

Create tests covering province, city, level, search, active filtering, limit, deterministic ordering and missing IDs:

~~~ts
import { describe, expect, it } from "vitest";
import { findStore, listStores } from "./store-query";

describe("static store query", () => {
  it("filters public stores without network access", () => {
    const result = listStores({
      province: "guangdong",
      city: "foshan",
      search: "顺德",
      limit: 2,
    });

    expect(result.length).toBeLessThanOrEqual(2);
    expect(result.every((store) => store.isActive !== false)).toBe(true);
    expect(result.every((store) => store.province === "guangdong")).toBe(true);
  });

  it("returns undefined for an unknown store", () => {
    expect(findStore("missing")).toBeUndefined();
  });
});
~~~

- [ ] **Step 2: Verify RED**

Run:

~~~bash
npx vitest run src/lib/store-query.test.ts
~~~

Expected: FAIL because store-query.ts does not exist.

- [ ] **Step 3: Implement static query functions**

~~~ts
import type { City, Province, Store } from "@/lib/store";
import { cities, provinces, stores } from "@/lib/store";

export type StoreQuery = {
  province?: string;
  city?: string;
  search?: string;
  level?: Store["level"] | readonly NonNullable<Store["level"]>[];
  limit?: number;
};

export function listStores(query: StoreQuery = {}): Store[] {
  const levels = query.level
    ? Array.isArray(query.level)
      ? query.level
      : [query.level]
    : null;
  const keyword = query.search?.trim().toLowerCase();

  const result = stores.filter((store) => {
    if (store.isActive === false) return false;
    if (query.province && store.province !== query.province) return false;
    if (query.city && store.city !== query.city) return false;
    if (levels && !levels.includes(store.level ?? "flagship")) return false;
    if (!keyword) return true;
    return [
      store.name,
      store.provinceLabel,
      store.cityLabel,
      store.district,
      store.address,
    ].some((value) => value.toLowerCase().includes(keyword));
  });

  return query.limit ? result.slice(0, query.limit) : result;
}

export function findStore(id: string): Store | undefined {
  return stores.find((store) => store.id === id && store.isActive !== false);
}

export function listProvinces(): Province[] {
  return provinces;
}

export function listCities(province?: string): City[] {
  return province
    ? cities.filter((city) => city.province === province)
    : cities;
}

export function listStaticStoreParams(): Array<{ id: string }> {
  return listStores().map((store) => ({ id: store.id }));
}

export function listStaticCityParams(): Array<{ slug: string; city: string }> {
  return cities.map((city) => ({ slug: city.province, city: city.slug }));
}
~~~

- [ ] **Step 4: Migrate public pages**

Replace imports from @/lib/data with @/lib/store-query. Remove revalidate exports. Add dynamicParams = false to every dynamic agent route.

Store detail:

~~~ts
export const dynamicParams = false;

export function generateStaticParams() {
  return listStaticStoreParams();
}
~~~

City detail:

~~~ts
export const dynamicParams = false;

export function generateStaticParams() {
  return listStaticCityParams();
}
~~~

- [ ] **Step 5: Make FeaturedStores static**

Use listStores({ level: "flagship", limit: 4 }) directly. Keep the component as a Server Component and update its test mock from @/lib/data to @/lib/store-query.

- [ ] **Step 6: Rewrite sitemap store sources**

Use listProvinces、listCities、listStaticStoreParams directly. Remove try/catch blocks that hide data errors. Do not include /news or /admin URLs.

- [ ] **Step 7: Verify**

~~~bash
npx vitest run src/lib/store-query.test.ts \
  src/components/FeaturedStores.test.tsx \
  src/components/agent/StoreCard.test.tsx
npm run typecheck
~~~

Expected: new and migrated tests pass; existing unrelated baseline failures are unchanged.

- [ ] **Step 8: Commit**

~~~bash
git add src/lib/store-query.ts src/lib/store-query.test.ts \
  src/app/agent src/components/FeaturedStores.tsx \
  src/components/FeaturedStores.test.tsx src/app/sitemap.ts
git commit -m "refactor: source public stores from static data"
~~~

---

### Task 3: Convert Store Search to Client-Side Filtering

**Files:**
- Modify: src/components/agent/StoreSearch.tsx
- Modify: src/components/agent/StoreSearch.test.tsx
- Modify: src/app/agent/page.tsx
- Test: src/components/agent/StoreSearch.test.tsx

**Interfaces:**
- Consumes: StoreSuggestion[] serialized by AgentPage.
- Produces: StoreSearchProps = { stores: readonly StoreSuggestion[] }
- Removes: every request to /api/stores and every loading/error network state.

- [ ] **Step 1: Replace API-oriented tests with local-filter tests**

The first test must fail until the component accepts stores:

~~~tsx
it("filters supplied stores without fetch", async () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch");
  render(<StoreSearch stores={SUGGESTIONS} />);

  await userEvent.type(screen.getByRole("combobox"), "顺德");

  expect(await screen.findByText("蓝辉轻改顺德大良店")).toBeInTheDocument();
  expect(fetchSpy).not.toHaveBeenCalled();
});
~~~

Retain tests for IME composition、ArrowDown/ArrowUp、Enter、Escape、click outside and six-result limit. Delete assertions that require loading/error HTTP states.

- [ ] **Step 2: Run RED**

~~~bash
npx vitest run src/components/agent/StoreSearch.test.tsx
~~~

Expected: FAIL because stores is not a valid prop and the component still fetches /api/stores.

- [ ] **Step 3: Implement local suggestions**

~~~tsx
export type StoreSuggestion = {
  id: string;
  name: string;
  provinceLabel: string;
  cityLabel: string;
  district?: string;
  address: string;
  level?: string;
};

export type StoreSearchProps = {
  stores: readonly StoreSuggestion[];
};

function matchesStore(store: StoreSuggestion, keyword: string): boolean {
  const normalized = keyword.trim().toLowerCase();
  return [
    store.name,
    store.provinceLabel,
    store.cityLabel,
    store.district ?? "",
    store.address,
  ].some((value) => value.toLowerCase().includes(normalized));
}
~~~

Inside the component derive at most six suggestions with useMemo. Remove AbortController、fetch、loading and error. Enter with no highlighted result selects the first result when one exists; otherwise it leaves focus in the input. Do not navigate to /agent?q= because AgentPage must no longer consume runtime searchParams.

- [ ] **Step 4: Update AgentPage**

AgentPage must not accept searchParams. Pass the serialized store list:

~~~tsx
const publicStores = sortStoresByLevel(listStores());

<StoreSearch stores={publicStores} />
~~~

The main card grid always renders publicStores. Search suggestions navigate to static detail pages.

- [ ] **Step 5: Verify**

~~~bash
npx vitest run src/components/agent/StoreSearch.test.tsx
npm run typecheck
~~~

Expected: no fetch to /api/stores, all keyboard and accessibility tests pass.

- [ ] **Step 6: Commit**

~~~bash
git add src/components/agent/StoreSearch.tsx \
  src/components/agent/StoreSearch.test.tsx src/app/agent/page.tsx
git commit -m "refactor: filter stores entirely in the browser"
~~~

---

### Task 4: Remove First-Party Server Analytics Without Breaking CTAs

**Files:**
- Modify: src/app/layout.tsx
- Delete: src/components/AnalyticsProvider.tsx
- Delete: src/components/AnalyticsProvider.test.tsx
- Modify: src/lib/analytics.ts
- Modify: src/lib/analytics.test.ts
- Delete later: src/app/api/analytics
- Test: src/lib/analytics.test.ts
- Verify callers: src/components/cta/PhoneCta.tsx and product tracking components

**Interfaces:**
- Preserves: trackClick(target, metadata?): void
- Preserves: trackPageView(pathname?): void
- Preserves: trackFormSubmit、trackStoreView、trackReservation.
- Removes: fetch and sendBeacon calls to /api/analytics/track.

- [ ] **Step 1: Rewrite analytics contract tests**

~~~ts
it("does not call a first-party API in the static build", () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch");
  const beaconSpy = vi.spyOn(navigator, "sendBeacon");

  trackClick("product_cta", { model: "su7" });
  trackPageView("/product/xiaomi/su7");

  expect(fetchSpy).not.toHaveBeenCalled();
  expect(beaconSpy).not.toHaveBeenCalled();
});
~~~

- [ ] **Step 2: Run RED**

~~~bash
npx vitest run src/lib/analytics.test.ts
~~~

Expected: FAIL because current analytics schedules /api/analytics/track.

- [ ] **Step 3: Implement a static-safe adapter**

Keep all existing exported function signatures so dozens of product components do not need mechanical edits:

~~~ts
"use client";

export type StaticAnalyticsEvent = {
  name: string;
  metadata?: Record<string, unknown>;
};

function emit(event: StaticAnalyticsEvent): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<StaticAnalyticsEvent>("lanhui:analytics", {
      detail: event,
    }),
  );
}

export function trackPageView(pathname?: string): void {
  emit({ name: "pageview", metadata: { pathname } });
}

export function trackClick(
  target: string,
  metadata?: Record<string, unknown>,
): void {
  emit({ name: "click", metadata: { target, ...metadata } });
}

export function trackFormSubmit(
  formName: string,
  metadata?: Record<string, unknown>,
): void {
  emit({ name: "form_submit", metadata: { formName, ...metadata } });
}

export function trackStoreView(storeId: string): void {
  emit({ name: "store_view", metadata: { storeId } });
}

export function trackReservation(
  storeId: string,
  metadata?: Record<string, unknown>,
): void {
  emit({ name: "reservation", metadata: { storeId, ...metadata } });
}
~~~

This preserves a future hook for an external analytics script while performing no network request.

- [ ] **Step 4: Remove pageview provider**

Delete AnalyticsTracker import and JSX from src/app/layout.tsx. Keep product CTA tracking calls unchanged.

- [ ] **Step 5: Verify all API references are gone from public components**

~~~bash
rg -n "/api/analytics|AnalyticsTracker" src/app src/components src/lib
npx vitest run src/lib/analytics.test.ts
npm run typecheck
~~~

Expected: rg only finds files scheduled for deletion in Task 5; analytics tests pass.

- [ ] **Step 6: Commit**

~~~bash
git add src/app/layout.tsx src/lib/analytics.ts src/lib/analytics.test.ts
git rm src/components/AnalyticsProvider.tsx \
  src/components/AnalyticsProvider.test.tsx
git commit -m "refactor: make analytics static-hosting safe"
~~~

---

### Task 5: Delete Dynamic Application Surfaces and Dependencies

**Files:**
- Delete: src/app/admin/**
- Delete: src/app/api/**
- Delete: src/lib/auth.ts、src/lib/auth.test.ts、src/lib/auth-callbacks.ts
- Delete: src/lib/prisma.ts
- Delete: src/lib/admin-csrf-fetch.ts、src/lib/admin-csrf-fetch.test.ts
- Delete: src/lib/admin-dashboard.ts、src/lib/admin-dashboard.test.ts
- Delete: src/lib/request-context.ts、src/lib/request-context.test.ts
- Delete: src/lib/security/csrf.ts、src/lib/security/csrf.test.ts
- Delete: src/lib/stores/flagship-constraint.ts
- Delete: src/lib/data.ts、src/lib/data.test.ts
- Delete: src/components/admin/**
- Delete: src/hooks/use-store-action.ts、src/hooks/use-store-action.test.tsx
- Delete: src/types/next-auth.d.ts
- Delete: prisma/**
- Delete: scripts/create-admin.ts、scripts/db-backup.mjs、scripts/db-restore.mjs
- Delete: Dockerfile、Dockerfile.dev、docker-compose.yml、nginx.conf
- Modify: package.json、package-lock.json、tsconfig.json
- Modify: vitest.setup.ts、src/mocks/handlers.ts、src/mocks/handlers.test.ts

**Interfaces:**
- Consumes: static public code completed by Tasks 2–4.
- Produces: no server-only runtime surface and no dynamic runtime dependency.
- Must pass: npm run check:static-boundary.

- [ ] **Step 1: Confirm public code no longer imports files scheduled for deletion**

~~~bash
rg -n "@/lib/(data|prisma|auth|admin-csrf-fetch|admin-dashboard|request-context)" \
  src/app src/components src/lib --glob "*.{ts,tsx}"
rg -n "/api/" src/app src/components src/lib --glob "*.{ts,tsx}"
~~~

Expected: matches are restricted to admin/api/dynamic files in the deletion list. Stop and migrate any public caller before deleting.

- [ ] **Step 2: Delete dynamic routes and modules**

Use git rm with the exact paths above. Do not delete src/app/error.tsx、global-error.tsx、not-found.tsx、robots.ts or sitemap.ts.

- [ ] **Step 3: Remove runtime packages**

Run:

~~~bash
npm uninstall @auth/prisma-adapter @prisma/adapter-pg @prisma/client \
  next-auth pg bcryptjs ali-oss react-markdown recharts
npm uninstall -D prisma @types/bcryptjs @types/pg
~~~

Keep sharp because static product image verification uses it. Keep pino only if rg proves a retained public module imports it; otherwise uninstall pino too.

- [ ] **Step 4: Remove dynamic test setup**

Remove MSW server lifecycle from vitest.setup.ts after confirming no retained static test performs API fetch. Delete src/mocks if rg shows no retained imports.

Final setup:

~~~ts
import "@testing-library/jest-dom/vitest";
~~~

- [ ] **Step 5: Simplify package scripts**

Remove db backup/restore、admin CSRF、admin duplication and Prisma scripts. Define the static gate:

~~~json
"check:static": "npm run lint && npm run typecheck && npm test && npm run verify:zeekr-images && npm run check:static-boundary && npm run build && npm run check:static-output"
~~~

check:static-output is added in Task 8; temporarily omit it until then.

- [ ] **Step 6: Run the boundary test**

~~~bash
npx vitest run scripts/check-static-export-boundary.test.mjs
npm run check:static-boundary
~~~

Expected: PASS and no src/app/admin、src/app/api、prisma or auth imports remain.

- [ ] **Step 7: Commit**

~~~bash
git add -A
git commit -m "refactor: remove dynamic runtime from static branch"
~~~

---

### Task 6: Enable Next.js Static Export and Preserve Legacy URLs

**Files:**
- Modify: next.config.ts
- Create: src/lib/site-url.ts
- Create: src/lib/site-url.test.ts
- Modify: src/app/robots.ts
- Modify: src/app/sitemap.ts
- Modify: src/app/product/window-film/[packageSlug]/page.tsx
- Create: scripts/generate-static-aliases.ts
- Create: scripts/check-static-output.mjs
- Create: scripts/check-static-output.test.mjs
- Modify: package.json

**Interfaces:**
- Produces: getSiteUrl(): string
- Produces: out/ static artifact.
- Produces: npm run build:static、generate:static-aliases、check:static-output.
- Consumes: ALL_LEGACY_ALIASES from src/lib/product-routes.ts.

- [ ] **Step 1: Add site URL tests**

~~~ts
import { describe, expect, it } from "vitest";
import { normalizeSiteUrl } from "./site-url";

describe("normalizeSiteUrl", () => {
  it("removes a trailing slash", () => {
    expect(normalizeSiteUrl("https://www.lanhui.com/")).toBe(
      "https://www.lanhui.com",
    );
  });

  it("rejects localhost in production", () => {
    expect(() =>
      normalizeSiteUrl("http://localhost:3000", "production"),
    ).toThrow();
  });
});
~~~

- [ ] **Step 2: Implement build-time site URL**

~~~ts
export function normalizeSiteUrl(
  value: string,
  nodeEnv = process.env.NODE_ENV,
): string {
  const url = new URL(value);
  if (nodeEnv === "production" && url.hostname === "localhost") {
    throw new Error("Production site URL cannot use localhost");
  }
  return url.toString().replace(/\\/$/, "");
}

export function getSiteUrl(): string {
  return normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  );
}
~~~

Use getSiteUrl in robots and sitemap. Remove hard-coded lanhui.example.com and remove /admin、/api disallow entries because those routes no longer exist.

- [ ] **Step 3: Change Next configuration**

Final next.config.ts:

~~~ts
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  telemetry: false,
});
~~~

Remove redirects(). Static export does not support runtime redirects or the default Image optimizer.

- [ ] **Step 4: Close every dynamic route**

For window-film package route:

~~~ts
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllWindowFilmPackageSlugsWithDetails().map((packageSlug) => ({
    packageSlug,
  }));
}
~~~

Run the following scan and add the same boundary to every remaining bracket route:

~~~bash
rg --files src/app | rg "\\[.+\\]/page\\.tsx$"
rg -L "generateStaticParams" $(rg --files src/app | rg "\\[.+\\]/page\\.tsx$")
~~~

Expected second command: no output.

- [ ] **Step 5: Generate portable legacy alias HTML**

Create scripts/generate-static-aliases.ts:

~~~ts
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ALL_LEGACY_ALIASES } from "../src/lib/product-routes";

function redirectHtml(target: string): string {
  const escaped = target.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  return [
    "<!doctype html>",
    '<html lang="zh-CN"><head>',
    '<meta charset="utf-8">',
    '<meta http-equiv="refresh" content="0;url=' + escaped + '">',
    '<link rel="canonical" href="' + escaped + '">',
    "<title>页面已迁移</title></head>",
    '<body><a href="' + escaped + '">前往新页面</a></body></html>',
  ].join("");
}

for (const alias of ALL_LEGACY_ALIASES) {
  const directory = join("out", alias.from.replace(/^\\//, ""));
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "index.html"), redirectHtml(alias.to));
}
~~~

This is a portable fallback. Production hosting should additionally configure true 301 rules for the same alias list.

- [ ] **Step 6: Add build scripts**

~~~json
"build:static": "next build && npm run generate:static-aliases",
"generate:static-aliases": "tsx scripts/generate-static-aliases.ts",
"check:static-output": "node scripts/check-static-output.mjs"
~~~

check-static-output must assert:

~~~js
const required = [
  "out/index.html",
  "out/404.html",
  "out/product/index.html",
  "out/agent/index.html",
  "out/brand/index.html",
  "out/contact/index.html",
];

const forbiddenText = [
  "/api/",
  "localhost:3000",
  "_next/image?",
];
~~~

It must also verify every sitemap URL maps to an out directory containing index.html.

- [ ] **Step 7: Run static build**

~~~bash
NEXT_PUBLIC_SITE_URL=https://www.lanhui.com npm run build:static
npm run check:static-output
~~~

Expected: out/ exists, no Node server artifact is required, no forbidden runtime URL appears in HTML.

- [ ] **Step 8: Commit**

~~~bash
git add next.config.ts src/lib/site-url.ts src/lib/site-url.test.ts \
  src/app/robots.ts src/app/sitemap.ts src/app/product/window-film \
  scripts/generate-static-aliases.ts scripts/check-static-output.mjs \
  scripts/check-static-output.test.mjs package.json
git commit -m "feat: enable portable Next.js static export"
~~~

---

### Task 7: Make Product and Store Images Deployment-Ready

**Files:**
- Modify: src/lib/store.ts
- Create: scripts/verify-static-images.mjs
- Create: scripts/verify-static-images.test.mjs
- Modify: scripts/migrate-zeekr-images.mjs
- Modify: package.json
- Test: src/lib/zeekr-migration.test.ts
- Required assets: public/images/stores/100001.webp through 100007.webp

**Interfaces:**
- Every public Store.image is a root-relative public path.
- Store image contract: WebP、1200×800、3:2、maximum 400 KiB.
- Existing topic product contracts remain authoritative; Zeekr remains 1448×1086.
- Produces: npm run verify:static-images.

- [ ] **Step 1: Add failing image contract test**

The test must enumerate every image reference from static Store data and fail when any file is absent. Current expected RED is that 100001.webp through 100007.webp are not yet available.

~~~js
it("requires a real image for every public store", async () => {
  const result = await verifyStaticImages(process.cwd());
  expect(result.missingStoreImages).toEqual([]);
});
~~~

- [ ] **Step 2: Run RED**

~~~bash
npx vitest run scripts/verify-static-images.test.mjs \
  src/lib/zeekr-migration.test.ts
~~~

Expected: store image files are missing; Zeekr reports three legacy source directories.

- [ ] **Step 3: Resolve Zeekr legacy directories safely**

First compare source and destination file counts and checksums:

~~~bash
find public/images/products/ZEEKR -type f -print
find public/images/products/zeekr -type f -print
node scripts/verify-zeekr-images.mjs
~~~

Then run the existing migration script once:

~~~bash
node scripts/migrate-zeekr-images.mjs
npx vitest run src/lib/zeekr-migration.test.ts
~~~

Expected: target remains 21 valid files and the three non-ASCII source subdirectories no longer exist. Do not delete any source directory before the migration command exits 0.

- [ ] **Step 4: Add seven reviewed store images**

Content owner supplies actual storefront photos with these exact paths:

~~~text
public/images/stores/100001.webp
public/images/stores/100002.webp
public/images/stores/100003.webp
public/images/stores/100004.webp
public/images/stores/100005.webp
public/images/stores/100006.webp
public/images/stores/100007.webp
~~~

Do not duplicate the placeholder under these names. Each image must be an actual corresponding store photo.

- [ ] **Step 5: Map Store.image explicitly**

~~~ts
{
  id: "100001",
  name: "蓝辉轻改顺德大良店",
  image: "/images/stores/100001.webp",
  // existing fields remain unchanged
}
~~~

Repeat for all seven stores with the matching ID. Do not derive paths at render time; explicit data makes content review auditable.

- [ ] **Step 6: Implement static image verification**

verify-static-images.mjs must:

1. Read the seven expected Store image paths.
2. Reject missing files and symlinks.
3. Use Sharp metadata to require WebP、1200×800.
4. Require each Store image at most 400 KiB.
5. Scan retained product data modules for referenced root-relative images.
6. Reject every referenced file missing from public/.
7. Delegate existing topic-specific size/dimension rules to existing verify scripts rather than weakening them.

- [ ] **Step 7: Verify**

~~~bash
node scripts/verify-zeekr-images.mjs
node scripts/verify-static-images.mjs
npx vitest run scripts/verify-static-images.test.mjs \
  src/lib/zeekr-migration.test.ts \
  src/components/FeaturedStores.test.tsx \
  src/components/agent/StoreCard.test.tsx
~~~

Expected: zero missing product/store images; no placeholder is used by a public Store.

- [ ] **Step 8: Commit**

~~~bash
git add public/images/products public/images/stores src/lib/store.ts \
  scripts/migrate-zeekr-images.mjs scripts/verify-static-images.mjs \
  scripts/verify-static-images.test.mjs package.json
git commit -m "feat: validate static product and store imagery"
~~~

---

### Task 8: Replace Dynamic CI with Static Artifact Verification

**Files:**
- Modify: .github/workflows/ci.yml
- Modify: playwright.config.ts
- Modify: package.json
- Create: .github/workflows/release-static.yml
- Create: docs/deployment/static-nextjs/CLOUDBASE-RUNBOOK.md
- Create: docs/test-reports/2026-07-12/STATIC_SITE_RELEASE_REPORT.md

**Interfaces:**
- CI artifact name: lanhui-static-site.
- Artifact content: out/** only.
- Local preview command: npm run preview:static.
- Manual deploy command: npx tcb hosting deploy out / -e ENV_ID.
- Production deployment remains approval-gated.

- [ ] **Step 1: Install the static preview and CloudBase CLIs**

~~~bash
npm install --save-dev serve@14.2.6 @cloudbase/cli@3.6.1
~~~

Add:

~~~json
"preview:static": "serve out -l 3000 --no-clipboard"
~~~

- [ ] **Step 2: Make Playwright test the real artifact**

Update playwright.config.ts:

~~~ts
webServer: {
  command: "npm run preview:static",
  url: "http://localhost:3000",
  reuseExistingServer: !process.env.CI,
  timeout: 60_000,
},
~~~

CI must run build:static before Playwright.

- [ ] **Step 3: Remove Postgres and Prisma from CI**

Final CI order:

~~~yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: 24
      cache: npm
  - run: npm ci
  - run: npm run lint
  - run: npm run typecheck
  - run: npm test
  - run: npm run verify:static-images
  - run: npm run check:static-boundary
  - run: npm run build:static
    env:
      NEXT_PUBLIC_SITE_URL: https://www.lanhui.com
  - run: npm run check:static-output
  - run: npx playwright install --with-deps chromium
  - run: npm run test:e2e
  - uses: actions/upload-artifact@v4
    with:
      name: lanhui-static-site
      path: out
      if-no-files-found: error
~~~

Remove the Postgres service、DATABASE_URL、NextAuth secrets、prisma generate and migrate deploy.

- [ ] **Step 4: Add an approval-gated release workflow**

release-static.yml must use workflow_dispatch and GitHub Environment production. It downloads the exact lanhui-static-site artifact from a successful CI run; it must not rebuild a different commit during deployment.

The deploy step runs:

~~~bash
npx tcb hosting deploy out / -e "$CLOUDBASE_ENV_ID"
~~~

Use GitHub Environment secrets only. The operator must validate the exact CloudBase CLI authentication variables against the Tencent Cloud account before enabling the workflow. Until that approval, keep the workflow disabled with environment protection; do not place credentials in repository variables.

- [ ] **Step 5: Write the CloudBase runbook**

The runbook must include:

1. Create/select CloudBase environment.
2. Enable static hosting.
3. Configure custom domain and HTTPS.
4. Set index.html and 404.html.
5. Upload assets before HTML.
6. Smoke test /、/product、/agent、one product detail、one store detail.
7. Roll back by deploying the out artifact from the previous successful CI run.
8. Record commit SHA、artifact ID、operator and timestamp.

- [ ] **Step 6: Run the full static gate**

~~~bash
npm run check:static
npm run test:e2e
git status --short
~~~

Expected: all retained tests pass; out/ passes static checks; git status contains only intended tracked changes.

- [ ] **Step 7: Browser verification**

Run against the static artifact at 390×844、768×1024 and 1440×900:

- Header and mobile navigation.
- Homepage product and featured store images.
- Product index and at least one page from each retained product family.
- Agent index、province、city and all seven store details.
- Contact links and WeChat modal.
- Direct refresh on a nested trailing-slash URL.
- 404 page.
- No request URL contains /api/ or /_next/image.

Record screenshots and results in STATIC_SITE_RELEASE_REPORT.md.

- [ ] **Step 8: Commit**

~~~bash
git add .github/workflows/ci.yml .github/workflows/release-static.yml \
  playwright.config.ts package.json package-lock.json \
  docs/deployment/static-nextjs/CLOUDBASE-RUNBOOK.md \
  docs/test-reports/2026-07-12/STATIC_SITE_RELEASE_REPORT.md
git commit -m "ci: publish verified static site artifacts"
~~~

---

## Final Acceptance Criteria

- [ ] main worktree remains unchanged and retains the dynamic application.
- [ ] static worktree branch contains no /admin or /api route.
- [ ] package.json contains no NextAuth、Prisma、PostgreSQL、Article CMS dependencies.
- [ ] all public store and product data is available at build time.
- [ ] StoreSearch performs no network request.
- [ ] every dynamic route has generateStaticParams and dynamicParams = false.
- [ ] next build creates out/.
- [ ] HTML contains no /api/、localhost or /_next/image.
- [ ] all seven stores use reviewed, real WebP images.
- [ ] retained product image verification passes.
- [ ] nested URLs refresh successfully from the static server.
- [ ] CI uploads an out artifact tied to one Git SHA.
- [ ] CloudBase deployment can roll back by redeploying the prior artifact.
- [ ] no production credential is committed.

## Known Risks and Stop Conditions

- Stop if a retained public component still requires Prisma、auth or a Route Handler; migrate it before deletion.
- Stop if output export requires removing a public feature not explicitly listed in this plan.
- Stop if any of the seven real store images is unavailable; do not disguise the gap with renamed placeholders.
- Stop if Zeekr source and target files differ after migration; preserve both and investigate checksums.
- Stop if CloudBase CLI authentication cannot be verified without exposing credentials; ship the CI artifact and perform no cloud mutation.
- Stop if npm test remains flaky after dynamic tests and MSW setup are removed; investigate test isolation before claiming completion.

## Self-Review Checklist

- Spec coverage: public routes、static store data、local search、analytics、dynamic deletion、export config、redirects、images、CI、CloudBase and rollback each map to one task.
- Placeholder scan: every implementation step is concrete. Domain and environment identifiers are explicit operator inputs, not code placeholders.
- Type consistency: StoreQuery、StoreSuggestion、tracking functions and static parameter shapes are defined once and reused consistently.
- Rollback: main branch remains the complete dynamic source; every static task is an isolated commit; CloudBase rollback uses a prior immutable out artifact.
