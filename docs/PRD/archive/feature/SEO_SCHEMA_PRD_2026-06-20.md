# SEO_SCHEMA_PRD_2026-06-20 — SEO 优化(SEO/Sitemap/JSON-LD)v1

> 横切功能子 PRD — 搜索引擎优化、结构化数据、社交分享卡片

---

## 0. 元信息

| 项 | 值 |
|---|---|
| 日期 | 2026-06-20 |
| 父 PRD | [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.4 |
| 审计依据 | [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §3 P0-7](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) |
| 数据表 | 多表(Provider/Store/Article/Product) |
| 维护者 | 冯科雅 (Coya) |
| 类型 | 横切功能 (无独立路由,涉及 metadata + sitemap + JSON-LD) |
| 状态 | 🟢 v1 |
| 优先级 | P0 |

---

## 1. 概述

### 1.1 目标

为蓝辉轻改 LANHUI 全站维持**Lighthouse SEO 100/100 的基线**(2026-06-19 审计结论),并补齐动态详情页的 metadata / OG 图 / JSON-LD,提升搜索引擎收录效率与社交平台分享卡片质量。本期重点修复 P0-7(`/news/[slug]` 因 `item.content` 缺失导致整页 404 + meta 全无)。

### 1.2 适用页面

| 路由 | metadata 类型 | JSON-LD | OG 图 |
|---|---|---|---|
| `/` (首页) | title / description / OG | `Organization` | `og-default.png` |
| `/brand` `/brand/certifications` `/brand/history` | 各页 title | `AboutPage` | `og-default.png` |
| `/contact` | title + 邮箱/电话 | `ContactPage` | `og-default.png` |
| `/product` (产品中心) | title + 6 类目列表 | `CollectionPage` + `ItemList` | `og-products.png` |
| `/product/electric-steps` 等 6 类目页 | 类目 title | `CollectionPage` + `ItemList` | 类目 og |
| `/product/wenjie` 等 4 主题专项 | 主题 title + ItemList | `CollectionPage` + `ItemList` (每车型 Product) | 主题 og |
| `/product/window-film/[packageSlug]` | 套餐 title | `Product` | 套餐头图 |
| `/news` (列表) | title | `CollectionPage` | `og-news.png` |
| `/news/[slug]` | **P0-7 修复** — title + excerpt + cover | `Article` + `BreadcrumbList` | 文章 featuredImage |
| `/agent` (省份选择) | title | `LocalBusiness` (聚合) | `og-stores.png` |
| `/agent/[province]` | 省 + 类目 title | `Place` + `BreadcrumbList` | `og-stores.png` |
| `/agent/[province]/[city]` | 市 + 门店列表 | `LocalBusiness` (聚合) | `og-stores.png` |
| `/agent/store/[id]` | 门店名 + 省/市 | `LocalBusiness` + `BreadcrumbList` | 门店 imagePath |
| `/admin/*` | robots: noindex,nofollow | — | — |

### 1.3 范围与非目标

**本期(v1)范围**:
- ✅ `sitemap.xml` 动态生成(Next.js MetadataRoute.Sitemap)
- ✅ `robots.txt` 生成 + `Sitemap` 引用
- ✅ 各路由 `metadata` / `generateMetadata` 规范(title 60 / description 160)
- ✅ 5 类 JSON-LD:Organization / Article / Product / LocalBusiness / ItemList
- ✅ Canonical URL
- ✅ OG 图规范(1200×630)
- ✅ **P0-7 修复**:`/news/[slug]` metadata 补全

**本期不在范围**:
- ❌ hreflang / 多语言(v2,海外布局时)
- ❌ AMP / Web Stories(v3)
- ❌ 站点链接搜索框(等数据沉淀后 Google Search Console 申请)

---

## 2. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|
| Googlebot | 抓取首页 | 收到 title / description / sitemap / robots | P0 |
| Googlebot | 抓取 `/news/[slug]` | 收到 `Article` JSON-LD(含 headline/author/datePublished/image) | P0 |
| 车主 | 微信分享 `/agent/store/[id]` | 卡片显示门店名 + 主图 + 简介 | P1 |
| 车主 | 微信分享 `/news/[slug]` | 卡片显示文章标题 + 头图 + 摘要 | P1 |
| 站长 | 新增门店 | sitemap.xml 自动含新 URL | P0 |
| 站长 | 下架门店 | sitemap.xml 不再含该 URL(等 `status=published`) | P1 |
| 站长 | 404 文章 | 返回 404 + 不被收录 | P0 |

---

## 3. 功能清单

| # | 功能 | 优先级 | 状态 | 说明 |
|---|---|---|---|---|
| F1 | `sitemap.xml` 动态生成 | P0 | ✅ | `src/app/sitemap.ts` |
| F2 | `robots.txt` 生成 | P0 | ✅ | `src/app/robots.ts` |
| F3 | 各路由 `metadata` export | P0 | 🟡 | 静态 OK,动态详情页需补 |
| F4 | OG 图(1200×630) | P0 | ✅ | `public/og-default.png` 等 |
| F5 | Twitter Card | P0 | ✅ | `summary_large_image` |
| F6 | Canonical URL | P0 | ✅ | 各 metadata `alternates.canonical` |
| F7 | `Organization` JSON-LD | P0 | ✅ | 根 layout |
| F8 | `Article` JSON-LD | P0 | 🟡 | `/news/[slug]` 缺(P0-7) |
| F9 | `Product` JSON-LD | P0 | 🟡 | `/product/window-film/[packageSlug]` 等 |
| F10 | `LocalBusiness` JSON-LD | P0 | 🟡 | `/agent/store/[id]` |
| F11 | `ItemList` JSON-LD | P0 | ✅ | wenjie / zeekr / xiaomi 主题 |
| F12 | `BreadcrumbList` JSON-LD | P1 | 🟡 | 详情页 |
| F13 | hreflang 多语言 | P2 | ⚪ | v2 |
| F14 | **P0-7 修复**:`/news/[slug]` metadata | P0 | 🟡 | 本期补 |
| F15 | sitemap 过滤草稿门店 / 文章 | P1 | 🟡 | 等 `Store.status` 字段启用 |

---

## 4. UI / 交互

### 4.1 视觉规范

- OG 图主色:`zinc-950` 背景 + `orange-500` 主标 + 蓝 400 辅
- 尺寸:1200×630(JPEG / PNG,控制在 200KB 内)
- 字体:Noto Sans SC + system-ui fallback
- 卡片风格:左上角 logo + 居中标题 + 右下角 URL

### 4.2 各页 metadata 规范

```ts
// 通用模板
export const metadata: Metadata = {
  title: '<页面名> - 蓝辉轻改',           // ≤ 60 字符
  description: '<页面描述>',               // ≤ 160 字符
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://lanhui.example.com<path>',
    siteName: '蓝辉轻改 LANHUI',
    title: '<页面名> - 蓝辉轻改',
    description: '<页面描述>',
    images: [{ url: '<og-url>', width: 1200, height: 630, alt: '...' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '<页面名> - 蓝辉轻改',
    description: '<页面描述>',
    images: ['<og-url>'],
  },
  alternates: {
    canonical: 'https://lanhui.example.com<path>',
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

### 4.3 动态详情页 metadata

```ts
// src/app/news/[slug]/page.tsx (P0-7 修复后)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: '文章不存在' };

  return {
    title: `${article.title} - 蓝辉轻改`,
    description: article.excerpt ?? article.title,
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt ?? '',
      images: article.featuredImage ? [{ url: article.featuredImage, width: 1200, height: 630 }] : [],
      publishedTime: article.publishedAt?.toISOString(),
      authors: ['蓝辉轻改'],
    },
    alternates: { canonical: `https://lanhui.example.com/news/${slug}` },
  };
}
```

---

## 5. 数据模型

### 5.1 sitemap.xml 输出结构

```
GET /sitemap.xml
Content-Type: application/xml

<urlset>
  <url>
    <loc>https://lanhui.example.com/</loc>
    <lastmod>2026-06-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  ... 27 静态路由 + N 动态路由(产品/省/市/门店/文章)
</urlset>
```

来源:`src/app/sitemap.ts`
- 静态路由 8 条(首页 / 产品中心 / 品牌 4 子页 / 联系 / 资讯)
- 产品详情:`getAllProductSlugs()` (来自 `src/lib/products.ts`)
- 省份 / 城市 / 门店:`getAllProvinceSlugs()` + `getAllCitySlugs()` + `getAllStoreIds()`
- 资讯:`getAllArticleSlugs()`

**已知短板**:所有 lastModified 写死 `2026-06-01`(代码 13 行),v1 修复为各路由真实 updatedAt。

### 5.2 robots.txt 输出

```
GET /robots.txt
Content-Type: text/plain

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin

Sitemap: https://lanhui.example.com/sitemap.xml
Host: https://lanhui.example.com
```

来源:`src/app/robots.ts`

### 5.3 JSON-LD 字典

| 类型 | 必填字段 | 来源 |
|---|---|---|
| `Organization` | `@id`, `name`, `url`, `logo`, `contactPoint` | `src/lib/brand.ts` |
| `LocalBusiness` | `@id`, `name`, `address`, `telephone`, `geo`, `openingHours` | `src/lib/store.ts` + DB |
| `Product` | `name`, `image`, `description`, `brand`, `offers` | 产品页静态 |
| `Article` | `headline`, `image`, `datePublished`, `author` | DB `Article` 表 |
| `ItemList` | `itemListElement[]` (`ListItem` 含 `position` / `name` / `url`) | 主题页 |
| `BreadcrumbList` | `itemListElement[]` (`ListItem` 含 `position` / `name` / `item`) | 详情页 |

### 5.4 涉及的数据表

| 表 | 用于 | 字段 |
|---|---|---|
| `Store` | `LocalBusiness` | `name` / `address` / `phone` / `imagePath` / `provinceLabel` / `cityLabel` |
| `Article` | `Article` JSON-LD | `title` / `excerpt` / `featuredImage` / `publishedAt` / `authorId` |
| `Province` / `City` | `BreadcrumbList` | `label` / `slug` |
| 产品静态 | `Product` / `ItemList` | `src/lib/products.ts` / `wenjie-products.ts` / `zeekr-products.ts` 等 |

---

## 6. API/路由输出

### 6.1 `GET /sitemap.xml`

| 项 | 值 |
|---|---|
| 类型 | Next.js `MetadataRoute.Sitemap` |
| 路由 | `src/app/sitemap.ts` |
| 状态 | ✅ 200 |
| 输出 | XML,UTF-8 |
| 路由数 | 静态 8 + 动态 N(产品 6 + 省 27 + 市 75 + 门店 22 + 文章 9 ≈ 147) |

### 6.2 `GET /robots.txt`

| 项 | 值 |
|---|---|
| 类型 | Next.js `MetadataRoute.Robots` |
| 路由 | `src/app/robots.ts` |
| 输出 | 允许公开站 + 禁止 `/api/` `/admin` + 引用 sitemap |

### 6.3 P0-7 修复 plan(代码层)

**问题**:`src/app/news/[slug]/page.tsx:94` 引用 `item.content` 字段不存在,SSR 抛错 → 整页 404 → metadata 完全缺失 → 搜索引擎把死链判 404 不收录。

**修复步骤**(2 个 commit):

```ts
// Step 1: src/types/news.ts — 加 content 字段
export interface NewsItem {
  slug: string;
  title: string;
  excerpt?: string;
  content: string;     // ← 新增
  cover?: string;
  category?: string;
  publishedAt?: string;
  // ...
}

// Step 2: src/app/news/[slug]/page.tsx
// (a) generateMetadata() 新加(如 §4.3)
// (b) 渲染 article.content 时用 ArticleContent 组件(Markdown 渲染)
```

**验证**:8 条已发布文章全部可访问 + Lighthouse SEO 仍 100 + sitemap 含 `/news/<slug>`。

### 6.4 各 JSON-LD 注入位置

| 路由 | 注入方式 |
|---|---|
| `/` | RSC 内 `<script type="application/ld+json">` |
| `/news/[slug]` | RSC 内 `<script type="application/ld+json" dangerouslySetInnerHTML>` |
| `/agent/store/[id]` | RSC 内 `<script>` |
| `/product/wenjie` 等主题 | RSC 内 `<script>`(已实施) |
| `/product/window-film/[packageSlug]` | RSC 内 `<script>` |

---

## 7. 验收标准 (DoD)

### 7.1 功能

- [x] `GET /sitemap.xml` 返回 200 + 有效 XML
- [x] `GET /robots.txt` 返回 200 + 正确规则
- [x] 首页 / 6 产品 / 主题 / 门店 / 资讯 路由 metadata 完整
- [ ] **P0-7 修复**:`/news/[slug]` metadata + content 字段补全
- [ ] F12 `BreadcrumbList` 详情页注入

### 7.2 质量门

- [x] `npx tsc --noEmit` 通过(允许 9 个 pre-existing 错)
- [x] `npm run build` 通过(SSG 不依赖 DB)
- [ ] vitest 覆盖:
  - [ ] `sitemap.ts` 输出包含 `/news/<slug>`
  - [ ] `generateMetadata()` 未命中文章 → 返回 `{ title: '文章不存在' }`
- [ ] Playwright e2e:
  - [ ] 访问 8 条文章无 404
  - [ ] 校验 `<meta property="og:title">` 与标题一致

### 7.3 SEO 验证(Lighthouse)

- [ ] **目标**:全站可达路由 SEO ≥ 95(基线 100,目标维持)
- [ ] `/news/[slug]` 修复后 SEO = 100(8 条全部)
- [ ] 结构化数据 0 个错误(用 https://search.google.com/test/rich-results 验证 Article + LocalBusiness)

### 7.4 已知问题跟踪

| ID | 描述 | 修复 |
|---|---|---|
| P0-7 | `/news/[slug]` 404 因 `item.content` 缺失 | 本期 PRD §6.3 |
| — | sitemap `lastModified` 写死 2026-06-01 | v1 修复为各路由真实 updatedAt |
| — | `/admin/*` 默认会被搜索引擎索引 | layout.tsx metadata 加 `robots: 'noindex,nofollow'`(v1 复查) |
| — | 多语言 hreflang | v2 |
| — | Store.status 字段启用前 sitemap 含草稿 | 等 B2 任务 |

---

## 8. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-20 | v1 | 初版横切 PRD;纳入 P0-7 修复 plan + JSON-LD 字典 + OG 图规范 | Coya |
| 2026-06-19 | v0 | 审计确认全站可达路由 SEO = 100 | Coya |
| 2026-06-16 | v0 | ZEEKR 主题页 ItemList JSON-LD 上线 | Coya |

---

## 附录 A: 相关文档

- [../00_MASTER_PRD.md §5.4](../00_MASTER_PRD.md) — 横切功能索引
- [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) — 审计源 P0-7
- [../../src/app/sitemap.ts](../../src/app/sitemap.ts) — sitemap 实现
- [../../src/app/robots.ts](../../src/app/robots.ts) — robots 实现
- [../../src/lib/brand.ts](../../src/lib/brand.ts) — 品牌基础信息(JSON-LD Organization)
- [../../src/app/layout.tsx](../../src/app/layout.tsx) — 根 metadata + 全局 JSON-LD
- [../../database/SCHEMA.md §4/§5](../../database/SCHEMA.md) — Store / Article 表(JSON-LD 数据源)

## 附录 B: 验证工具清单

| 工具 | 用途 | URL |
|---|---|---|
| Google Search Console | 收录监控 + sitemap 提交 | https://search.google.com/search-console |
| Google Rich Results Test | JSON-LD 验证 | https://search.google.com/test/rich-results |
| Schema.org Validator | 结构化数据校验 | https://validator.schema.org/ |
| Lighthouse SEO | 评分 | Chrome DevTools / `lighthouse https://lanhui.example.com --view` |
| OpenGraph Debugger | OG 卡预览 | https://www.opengraph.xyz/ |
| Twitter Card Validator | Twitter 卡预览 | https://cards-dev.twitter.com/validator |

## 附录 C: OG 图资源清单(`public/seo/`)

| 文件 | 用途 | 尺寸 |
|---|---|---|
| `og-default.png` | 全站默认 OG | 1200×630 |
| `og-home.png` | 首页 | 1200×630 |
| `og-products.png` | 产品中心 | 1200×630 |
| `og-news.png` | 资讯 | 1200×630 |
| `og-stores.png` | 门店 | 1200×630 |
| `og-zeekr.png` / `og-wenjie.png` 等 | 主题专项 | 1200×630 |
| `favicon.ico` | 浏览器图标 | 32×32 |
| `apple-touch-icon.png` | iOS 图标 | 180×180 |
| `logo.png` | JSON-LD Organization.logo | 512×512 |