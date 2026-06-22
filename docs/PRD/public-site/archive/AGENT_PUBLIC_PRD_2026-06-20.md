# AGENT_PUBLIC_PRD_2026-06-20.md — 门店网络 `/agent` 系列完整规格(含 P0-1 修复)

> 蓝辉轻改 LANHUI 门店网络子站 v1 规格文档。覆盖 `/agent`(省份选择)、`/agent/[slug]`(省内城市列表)、`/agent/[slug]/[city]`(城市门店列表)、`/agent/store/[id]`(门店详情)4 个公开路由。**P0-1 修复**:`scripts/audit/lib/collect-routes.mjs` `extractAgentRegion()` 用 `china-regions.ts` 首个 `value: "beijing"` 当省 slug,但 `src/lib/store.ts` 实际用的是拼音(`"guangdong"`),导致 audit 脚本生成的 `/agent/beijing` `/agent/beijing/dongcheng` 全部 404。本 PRD 同时给出**生产侧(公众路由)** 和**审计侧(脚本)** 双修复方案,以及 `/product/window-film/[packageSlug]` 同源 P0-1c 修复点。

---

## 1. 概述

**页面**: `/agent`、`/agent/[slug]`、`/agent/[slug]/[city]`、`/agent/store/[id]`
**类型**: 公开站(SSG + ISR)
**优先级**: P0(动态路由 404 是阻断)
**Owner**: 冯科雅(Coya)
**版本**: v1
**最后更新**: 2026-06-20

### 1.1 目标

1. 让潜客从"全国门店网络"入口,经"省 → 市 → 门店详情" 3 步找到离自己最近的蓝辉轻改门店。
2. 当前阶段(单店运营)`/agent` 列表 1 条(`shunde-daliang`),多店扩展时直接走 `src/lib/store.ts` 追加。
3. 修复 P0-1 动态路由 404:从 audit 脚本侧(根因) + 生产路由侧(加固)双管齐下。
4. 门店详情页输出 `LocalBusiness` + `BreadcrumbList` 双重 JSON-LD,SEO 满分。
5. 数据源从静态 `src/lib/store.ts` + `src/lib/china-regions.ts` → 逐步迁移到 DB(本期保留静态兜底)。

### 1.2 范围

- ✅ 包含: 4 路由 + 完整 SEO / a11y / 性能 / 埋点
- ✅ 包含: P0-1 修复方案(audit 脚本根因 + 生产路由加固)
- ✅ 包含: 单店阶段(顺德大良)→ 多店阶段的扩展路径
- ✅ 包含: 门店卡片 / 城市卡片 / 省份卡片三套卡片规格
- ❌ 不包含: 地图嵌入(本版本用文字地址 + 导航链接)
- ❌ 不包含: 在线预约 / 加盟申请(后续 Q3 路线)

---

## 2. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|
| 车主 / 潜客 | 想看附近门店 | 看到省份卡片 + 已开放门店列表 | P0 |
| 车主 / 潜客 | 点省份 | 看到该省城市列表 | P0 |
| 车主 / 潜客 | 点城市 | 看到该市门店列表 | P0 |
| 车主 / 潜客 | 点门店 | 看到详情(地址 / 电话 / 营业时间 / 描述) | P0 |
| 车主 | 想打电话给门店 | 看到可点击 tel: 链接 | P0 |
| 车主 | 想导航 | 看到"导航到店" CTA(→ `/agent/store/[id]`) | P0 |
| 搜索引擎 | 抓取门店 | 看到 LocalBusiness + BreadcrumbList JSON-LD | P0 |
| 审计 | 跑全站审计 | audit 脚本能正确枚举所有动态路由 | P0(P0-1) |

---

## 3. 功能清单

| # | 功能 | 路由 | 优先级 | 状态 |
|---|---|---|---|---|
| F1 | 全国门店 Hero(STORES 标签 + H1 + 副标 + N 省 N 店统计) | `/agent` | P0 | ✅ |
| F2 | 按省份浏览卡片网格(3 列响应式) | `/agent` | P0 | ✅ |
| F3 | 已开放门店列表(3 列卡片,占位图 + LANHUI badge) | `/agent` | P0 | ✅ |
| F4 | 省份 Hero(面包屑 + H1 + N 店 N 城统计) | `/agent/[slug]` | P0 | ✅ |
| F5 | 按城市浏览卡片网格(3 列响应式) | `/agent/[slug]` | P0 | ✅ |
| F6 | 省内门店列表(若该省有店) | `/agent/[slug]` | P0 | ✅ |
| F7 | 城市 Hero(面包屑 + H1 + N 店统计) | `/agent/[slug]/[city]` | P0 | ✅ |
| F8 | 城市门店卡片列表 | `/agent/[slug]/[city]` | P0 | ✅ |
| F9 | 城市无门店空状态 | `/agent/[slug]/[city]` | P1 | ✅ |
| F10 | 门店详情 Hero(5 级面包屑 + LANHUI badge + H1) | `/agent/store/[id]` | P0 | ✅ |
| F11 | 门店双栏(主图占位 + 信息卡) | `/agent/store/[id]` | P0 | ✅ |
| F12 | 门店电话点击 tel: | `/agent/store/[id]` | P0 | ✅ |
| F13 | "返回{城市}" CTA | `/agent/store/[id]` | P0 | ✅ |
| F14 | LocalBusiness JSON-LD | `/agent/store/[id]` | P0 | ✅(`generateLocalBusinessSchema`) |
| F15 | BreadcrumbList JSON-LD | 3 个动态路由 | P0 | ✅(`generateBreadcrumbSchema`) |
| F16 | **P0-1 修复**:`collect-routes.mjs` `extractAgentRegion` 改用拼音真实省 | 脚本 | P0 | ⚠️ 当前未修 |
| F17 | **P0-1 修复**:`extractWindowFilmSlugs` 改用真实套餐 slug | 脚本 | P0 | ⚠️ 当前未修 |
| F18 | **P0-1 修复**:生产路由 `generateStaticParams` fallback 真实 store id | 3 个动态路由 | P1 | ⚪ 加固 |
| F19 | 埋点:`agent_view_store` / `agent_click_phone` | 全部 | P1 | ⚪ 待补 |

---

## 4. UI / 交互

### 4.1 视觉规范(沿用公开站)

- **背景**: `bg-zinc-950` / `bg-black`
- **强调**: 卡片 hover 边框 `border-zinc-700` + 微上移 `-translate-y-0.5` + 阴影
- **门店图占位**: `bg-gradient-to-br from-zinc-800 to-zinc-900` + `Building2` icon + 左上角 `LANHUI` badge
- **门店名**: `text-lg font-bold text-white`
- **InfoRow** (图标 + 标签 + 内容): `MapPin` / `Phone` / `Clock` 全部 `text-orange-400`
- **CTA**: 导航到店 `bg-gradient-to-r from-orange-500 to-orange-600` + `shadow-orange-500/25`
- **次 CTA**: 浏览产品 / 返回城市 `bg-zinc-900 border-zinc-800`

### 4.2 组件清单

| 组件 | 路径 | 类型 | 说明 |
|---|---|---|---|
| `Header` / `Footer` | 共享 | — | — |
| `ProvinceCard`(内联于 `agent/page.tsx`) | RSC | 省份卡片 |
| `StoreCard`(内联于多个 agent 路由) | RSC | 门店卡片(占位图 + 信息) |
| `InfoRow` | `src/components/InfoRow.tsx` | RSC | 单行"图标 + 标签 + 内容" |
| `generateLocalBusinessSchema` | `src/lib/geo.ts` | util | LocalBusiness JSON-LD 生成 |
| `generateBreadcrumbSchema` | `src/lib/geo.ts` | util | BreadcrumbList JSON-LD 生成 |

### 4.3 路由结构

| 路由 | 文件 | revalidate | generateStaticParams |
|---|---|---|---|
| `/agent` | `src/app/agent/page.tsx` | 3600 | — |
| `/agent/[slug]` | `src/app/agent/[slug]/page.tsx` | 3600 | `getAllProvinceSlugs()` |
| `/agent/[slug]/[city]` | `src/app/agent/[slug]/[city]/page.tsx` | 3600 | 笛卡尔积(省 × 市) |
| `/agent/store/[id]` | `src/app/agent/store/[id]/page.tsx` | 86400(24h) | `getAllStoreIds()` |

### 4.4 路由关系图

```
/agent                          # 入口
  └─ /agent/<province>          # 27 省
       └─ /agent/<province>/<city>    # 75 市
            └─ /agent/store/<id>       # 1+ 门店
```

### 4.5 关键交互

- **省份卡片 hover**: 边框变 `zinc-700`,背景 `zinc-800/80`,MapPin icon 变 `orange-400`,chevron 右移
- **门店卡片 hover**: 边框 `zinc-700` + 上移 + 阴影
- **门店详情主 CTA "电话咨询"**: 调 `tel:075722881001` 协议
- **"返回{城市}"**: 回 `/agent/<province>/<city>`
- **面包屑可点击**: 5 级全链回首页

### 4.6 三视口响应式

| 视口 | 省份 / 城市 / 门店卡片 |
|---|---|
| Desktop 1440 | 3 列网格 |
| Tablet 768 | 2-3 列 |
| Mobile 390 | 全单列 |

### 4.7 可访问性

- 卡片是 `<Link>`,有 `aria-label="进入{城市/门店}"`
- 面包屑 `<nav aria-label="面包屑">` 5 级
- 颜色对比度 ≥ 4.5:1
- 键盘 Tab 顺序合理
- 屏幕阅读器朗读店名 + 地址 + 电话 + 营业时间

---

## 5. 数据模型

### 5.1 静态数据(当前)

| 文件 | 导出 | 用途 |
|---|---|---|
| `src/lib/china-regions.ts` | `regions: Region[]` | 27 省 × 多市(用作省份/城市卡片 + 城市选择) |
| `src/lib/store.ts` | `stores: Store[]` | 22+ 条门店(从 100001 起编号) |
| `src/lib/data.ts` | `getProvinces()` / `getCities(slug)` / `getStores(filter)` / `getStoreById(id)` | 聚合 API(当前走静态) |

### 5.2 Region / Store 类型

```ts
// src/lib/china-regions.ts
export interface Region {
  label: string;       // 中文,如 "广东省"
  value: string;       // slug,如 "guangdong"
  children?: Region[]; // 城市级联
}

// src/lib/store.ts
export type Store = {
  id: string;             // 6 位数字 / cuid
  name: string;           // 店名
  province: string;      // 拼音 slug
  provinceLabel: string; // 中文
  city: string;           // 拼音 slug
  cityLabel: string;
  district: string;
  address: string;
  phone: string;
  phoneTel: string;      // tel:075722881001 格式
  businessHours: string;
  description: string;
  image?: string;
};
```

### 5.3 DB Store Schema(参考 [../../database/SCHEMA.md](../../database/SCHEMA.md) §4)

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `String` (cuid) | 主键 |
| `slug` | `String` (unique) | URL slug |
| `name` | `String` | 店名 |
| `provinceSlug` | `String` | FK → `Province.slug` |
| `provinceLabel` | `String` | 冗余 |
| `citySlug` | `String` | FK → `City.slug` |
| `cityLabel` | `String` | 冗余 |
| `district` | `String?` | 区/县 |
| `address` | `String` | 详细地址 |
| `phone` / `phoneTel` | `String` | 展示 / 拨号 |
| `businessHours` | `String?` | 营业时间 |
| `description` | `String?` | 描述 |
| `imageUrl` / `imagePath` | `String?` | 主图 |
| `isActive` | `Boolean` | 启用/禁用 |
| `status` | `String` | `"published"` / `"draft"`(P0-6 新增过滤) |
| `createdAt` / `updatedAt` | `DateTime` | — |

### 5.4 SSR / ISR 配置

```ts
// /agent/page.tsx
export const revalidate = 3600;  // 1h

// /agent/[slug]/page.tsx
export const revalidate = 3600;
export async function generateStaticParams() {
  const slugs = await getAllProvinceSlugs();
  return slugs.map((slug) => ({ slug }));
}

// /agent/[slug]/[city]/page.tsx
export const revalidate = 3600;
export async function generateStaticParams() {
  const provinceSlugs = await getAllProvinceSlugs();
  const params = [];
  for (const provinceSlug of provinceSlugs) {
    const citySlugs = await getAllCitySlugs(provinceSlug);
    for (const citySlug of citySlugs) {
      params.push({ slug: provinceSlug, city: citySlug });
    }
  }
  return params;
}

// /agent/store/[id]/page.tsx
export const revalidate = 86400;  // 24h
export async function generateStaticParams() {
  const ids = await getAllStoreIds();
  return ids.map((id) => ({ id }));
}
```

### 5.5 数据流

```
RSC (default):
  getStores() → API first → fallback static store.ts
  getProvinces() → API first → fallback static china-regions.ts
  getCities(slug) → API first → fallback static
  getStoreById(id) → API first → fallback static

API:
  /api/stores (public, status='published' filter after P0-6)
  /api/stores/[id] (public)
  /api/provinces
  /api/cities?province=guangdong
```

---

## 6. API 接口

### 6.1 公开 API

| Method | 路径 | 用途 | 权限 |
|---|---|---|---|
| GET | `/api/stores?status=published` | 门店列表(P0-6 加 status 过滤) | 公开 |
| GET | `/api/stores/[id]` | 门店详情 | 公开 |
| GET | `/api/provinces` | 省份列表 | 公开 |
| GET | `/api/cities?province=guangdong` | 城市列表(按省) | 公开 |
| GET | `/api/regions` | 省+市树(可选) | 公开 |

### 6.2 Schema.org(JSON-LD)

| 路由 | JSON-LD 类型 | 生成函数 |
|---|---|---|
| `/agent` | `WebSite` + `ItemList`(可选) | — |
| `/agent/[slug]` | `BreadcrumbList` | `generateBreadcrumbSchema` |
| `/agent/[slug]/[city]` | `BreadcrumbList` | `generateBreadcrumbSchema` |
| `/agent/store/[id]` | `LocalBusiness` + `BreadcrumbList` | `generateLocalBusinessSchema` + `generateBreadcrumbSchema` |

### 6.3 客户端埋点(待补)

| 事件 | 触发 | 元数据 |
|---|---|---|
| `agent_view_province` | 省份页加载 | `provinceSlug` |
| `agent_view_city` | 城市页加载 | `provinceSlug` / `citySlug` |
| `agent_view_store` | 详情页加载 | `storeId` / `provinceSlug` / `citySlug`(P1-13 关联) |
| `agent_click_phone` | 电话点击 | `storeId` / `phoneType: 'store'` |
| `agent_click_navigate` | 导航 CTA 点击 | `storeId` |

---

## 7. P0-1 修复完整方案(必修)

> P0-1 影响 5 个动态路由(`/news/[slug]`、2 个 agent 路由、2 个 window-film 路由)。**本 PRD 修复 agent 4 路由 + window-film 1 路由**;news 在 [NEWS_PRD_2026-06-20.md §8](./NEWS_PRD_2026-06-20.md) 修复。

### 7.1 根因分析

```js
// scripts/audit/lib/collect-routes.mjs:74-81 (当前 buggy)
function extractAgentRegion() {
  const src = safeReadText("china-regions.ts");
  if (!src) return { province: null, city: null };
  const re = /value:\s*["']([a-z0-9-]+)["']/g;
  const out = []; let m;
  while ((m = re.exec(src)) !== null && out.length < 2) out.push(m[1]);
  return { province: out[0] || "beijing", city: out[1] || "dongcheng" };
}
```

**bug**:`china-regions.ts` 第 1 个省是"北京市" → `value: "beijing"`,第 1 个城市是"东城区" → `value: "dongcheng"`。但 `src/lib/store.ts` 实际门店都是 `province: "guangdong"` / `city: "foshan"` 等拼音,**没有北京门店** → `getProvinceBySlug("beijing")` 返回 `null` → `notFound()` → 路由 404。

**同源 bug**:`extractWindowFilmSlugs(2)` 从 `src/lib/products.ts` 取前 2 个 `slug` → `electric-steps` / `wheels` → 但 `/product/window-film/[packageSlug]` 期望真实窗膜套餐 slug(应从 `src/lib/window-film-details.ts` 取)。

### 7.2 修复方案 A:audit 脚本侧(根因,必修)

**改 `extractAgentRegion` 为显式取真实拼音省**:

```js
// scripts/audit/lib/collect-routes.mjs (v1 fix)
function extractAgentRegion() {
  // 1. 优先从 src/lib/store.ts 取真实存在的省
  const storeSrc = safeReadText("store.ts");
  if (storeSrc) {
    const m = storeSrc.match(/province:\s*["']([a-z]+)["']/);
    if (m) {
      const province = m[1];
      // 2. 在同一文件里再取一个该省的城市
      const cityM = storeSrc.match(/city:\s*["']([a-z]+)["']/);
      return { province, city: cityM?.[1] ?? "foshan" };
    }
  }
  // fallback: 用 china-regions.ts 的拼音(避免 beijing/dongcheng)
  return { province: "guangdong", city: "foshan" };
}
```

**改 `extractWindowFilmSlugs` 从 `src/lib/window-film-details.ts` 取**:

```js
// scripts/audit/lib/collect-routes.mjs (v1 fix)
function extractWindowFilmSlugs(limit = 2) {
  // 优先从 window-film-details.ts 取真实套餐 slug
  const detailSrc = safeReadText("window-film-details.ts");
  if (detailSrc) {
    const re = /slug:\s*["']([a-z0-9-]+)["']/g;
    const out = []; let m;
    while ((m = re.exec(detailSrc)) !== null) {
      out.push(m[1]);
      if (out.length >= limit) break;
    }
    if (out.length > 0) return out;
  }
  // fallback: 取静态 placeholder(避免误中 electric-steps)
  return ["default-package"];
}
```

### 7.3 修复方案 B:生产路由侧(加固,P1)

`/agent/[slug]/page.tsx` 等路由的 `getProvinceBySlug(slug)` 找不到时,生产环境走 404(正确)。但 `getStores({ province: slug })` 找不到时**显示空状态而非 500**,已实现。无需额外修。

### 7.4 修复方案 C:CI 防御(可选,优先级 P1)

- 加 `scripts/verify-agent-routes.mjs`:遍历 `src/lib/store.ts` 全部 `province` 字段,在 `china-regions.ts` 验证 slug 存在
- 加 `scripts/verify-window-film-slugs.mjs`:`src/lib/window-film-details.ts` slug 唯一性
- 链入 `npm run check`

### 7.5 修复任务工单

| ID | 描述 | 工时 | 依赖 |
|---|---|---|---|
| **B1** | 改 `extractAgentRegion` 真实拼音省 | 30min | 无 |
| **B2** | 改 `extractWindowFilmSlugs` 从 window-film-details.ts | 30min | 无 |
| **B3** | 重跑 `npm run audit:full`,3 路由全 200 | 5min | B1+B2 |
| **B4** | (可选)加 `verify-agent-routes.mjs` CI 脚本 | 1h | — |

---

## 8. 验收标准(DoD)

### 8.1 P0-1 修复(必修)

- [ ] `collect-routes.mjs` `extractAgentRegion` 改为读 `store.ts` 真实拼音
- [ ] `collect-routes.mjs` `extractWindowFilmSlugs` 改为读 `window-film-details.ts`
- [ ] `npm run audit:full` 后 5 个动态路由全 200(agent 2 路由 + window-film 2 路由 + news 3 路由 — news 在 NEWS PRD 修)
- [ ] Playwright e2e 全部 24 用例 24 pass / 0 fail
- [ ] `npx tsc --noEmit` 通过
- [ ] `npm run build` 通过(generateStaticParams 预渲染 27 省 × 75 市 = 2025 城市页 + 1 门店)

### 8.2 功能(常规)

- [ ] 4 路由全部 200 可达
- [ ] 面包屑 5 级正确
- [ ] 门店卡片 hover 状态正常
- [ ] 城市无门店显示"暂无已开放门店数据"空状态
- [ ] 省份无城市显示"该省份暂无已开放城市"
- [ ] 门店电话 tel: 协议触发
- [ ] "返回{城市}" CTA 跳转正确

### 8.3 性能

- [ ] `/agent` Lighthouse mobile perf ≥ 80(当前 64 ⚠,P1-3 优化)
- [ ] `/agent/store/[id]` Lighthouse mobile perf ≥ 80(当前 86 ✓)
- [ ] LCP < 2.5s(desktop)/ < 4s(mobile)
- [ ] CLS = 0
- [ ] 门店卡片占位图不阻塞 LCP(占位图 < 5KB 或纯 CSS)
- [ ] `/agent` 列表分页(P1-3 优化):12/页 + 前 12 张 `priority`

### 8.4 质量门

- [ ] `npx tsc --noEmit` 通过
- [ ] `npm run build` 通过(2025 城市页 + 1 门店 + 27 省 = 2053 预渲染)
- [ ] `npm run lint` 通过
- [ ] Playwright e2e:4 路由 × 3 视口 + 真实 store id × 3 = 12+ 张截图
- [ ] 关键路径 e2e:点省份 → 城市 → 门店 → tel: 协议触发

### 8.5 SEO

- [ ] 4 路由独立 title / description(`generateMetadata` 实现)
- [ ] `/agent/store/[id]` 输出 LocalBusiness JSON-LD
- [ ] 3 动态路由输出 BreadcrumbList JSON-LD
- [ ] canonical URL 正确
- [ ] 城市页 description 含"${城市} + 门店 + 数量"
- [ ] 详情页 OG 图(待补)

### 8.6 可访问性

- [ ] 语义化 HTML(省份 / 城市 / 门店卡片是 `<Link>`)
- [ ] 颜色对比度 ≥ 4.5:1
- [ ] 键盘 Tab 顺序:面包屑 → H1 → 卡片网格 → 单卡 → CTA
- [ ] 屏幕阅读器朗读面包屑 5 级 + 卡片标题 + 地址
- [ ] 面包屑 `<nav aria-label="面包屑">`

### 8.7 回归

- [ ] Header / Footer 不破坏
- [ ] 单店阶段(1 店)列表/详情正常
- [ ] 多店阶段(扩展 store.ts)新店自动可见
- [ ] `/product/window-film/[packageSlug]` 不被影响(独立修复)

---

## 9. 变更记录(CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-19 | v0 | 初稿(在 audit PRD §3 P0-1 内联) | Coya |
| 2026-06-20 | v1 | 升级为独立 4 路由完整规格,显式收纳 P0-1 修复方案(脚本根因 + 生产加固 + CI 防御) | Coya |

---

## 附录 A: 相关文档

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §4.1 路由总览
- [../../ARCHITECTURE.md](../../ARCHITECTURE.md) — 静态优先 + API 聚合
- [../../database/SCHEMA.md](../../database/SCHEMA.md) §4 Store §2 Province §3 City
- [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) §P0-1 §P0-6 §P1-3 §P1-13
- [NEWS_PRD_2026-06-20.md](./NEWS_PRD_2026-06-20.md) — news P0-7 修复
- [HOMEPAGE_PRD_2026-06-20.md](./HOMEPAGE_PRD_2026-06-20.md) — Header 跳 `/agent/store/shunde-daliang`

## 附录 B: 截图占位

- `docs/audits/screenshots/{desktop,tablet,mobile}/agent.png`
- `docs/audits/screenshots/{desktop,tablet,mobile}/agent-province.png`
- `docs/audits/screenshots/{desktop,tablet,mobile}/agent-city.png`
- `docs/audits/screenshots/{desktop,tablet,mobile}/agent-store-100001.png`

## 附录 C: 修复任务工单(B1-B4)

- **B1**: 改 `extractAgentRegion` 真实拼音省(30min)
- **B2**: 改 `extractWindowFilmSlugs` 从 `window-film-details.ts`(30min)
- **B3**: 重跑 `npm run audit:full`,5 路由全 200(5min)
- **B4**: 加 `verify-agent-routes.mjs` CI 脚本(1h,可选)
