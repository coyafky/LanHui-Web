# PERFORMANCE_OPTIMIZATION_PRD_2026-06-20 — 性能优化

> 目的:把 Lighthouse 性能分从 70-98 提升到 ≥ 90,LCP 从 0.6-8.0s 压到 < 2.5s。
> 关联:`docs/audits/lighthouse/SUMMARY.md` (2026-06-19 基线) + AUDIT_AND_REGRESSION §4 性能表 + ZEEKR 主题模式。
> 复用 ZEEKR build 模式:每个 P1 任务独立 commit + RED→GREEN→回归 + Lighthouse 阈值验证。

## 0. 元信息
| 项 | 值 |
|---|---|
| 日期 | 2026-06-20 |
| 触发 | 2026-06-19 全站 Lighthouse 审计完成,12 路由 perf < 80,10 路由 LCP > 6s |
| 范围 | 公开站 21 路由(SSG 优先 + 动态展开) + CMS 10 路由(admin 不在 Lighthouse 范围) |
| 方法 | Lighthouse 数据驱动 + 4 类策略(Image/Static/Code/Network) + 性能门禁 |
| 输出 | 本 PRD + 5 个 P1 性能任务 + `scripts/verify-perf-budget.mjs` + CI 阈值 |
| 目标 | 6 个月内:perf_m 全站 ≥ 85,LCP_m 全站 < 4s,perf_d ≥ 90 |
| 复测节奏 | 每次发版前 + 季度全量复测 |

## 1. 背景与目标

蓝辉轻改性能现状(Lighthouse 2026-06-19):

| 维度 | desktop | mobile | 目标 |
|---|---|---|---|
| 性能分范围 | 70-98 | 61-96 | ≥ 90 |
| LCP | 0.6-6.6s | 0.7-8.0s | < 2.5s |
| CLS | 0 | 0 | < 0.1 |
| TBT | < 200ms | < 200ms | < 200ms |
| SEO | 100 | 100 | 100 |
| a11y | 89-96 | 89-96 | ≥ 95 |

**5 个 P1 任务**(LCP > 6s 或 perf < 80):
1. **P1-1** `/product/flooring` 性能极差(perf_m=59,perf_d=61,LCP=6.6s,全站最差)
2. **P1-2** `/brand/certifications` 性能 63/77,LCP=6.0s(证书图 6+ 张未 lazy)
3. **P1-3** `/agent` 列表性能 64/75,LCP=6.0s(27+ store 卡片)
4. **P1-4** `/product/wenjie` 30+ 车型图片 pending(占位空方框)
5. **P1-5** `/product` 入口 LCP=6.5s(4 大主题图未 priority)

**根因共性**:首屏 Hero/卡片图未用 `next/image priority`、无 `sizes`、视口外图未 lazy、字体未 `font-display: swap`、长列表无分页/虚拟滚动。

**目标**:
- 短期(本季度):5 个 P1 全修复,perf 全站 ≥ 85
- 中期(下季度):LCP 全站 < 4s,TBT < 200ms
- 长期(2027):接入 RUM(Real User Monitoring),Lighthouse 仅作合成基线

## 2. 范围与边界

### 2.1 包含
- ✅ 5 个 P1 性能任务(P1-1 ~ P1-5)
- ✅ 4 类策略(Image / Static / Code / Network)
- ✅ 性能预算(`scripts/verify-perf-budget.mjs` + 阈值)
- ✅ CI 门禁(perf budget 失败 → PR 阻塞)
- ✅ 真实用户监控(RUM)规划(2027)

### 2.2 不包含
- ❌ 后台 `/admin/*` 性能优化(Lighthouse 排除 admin,但 admin LCP 也需 < 1s)
- ❌ 服务端 TTFB 优化(已用 Nginx + Docker + SSG,理论 < 200ms)
- ❌ CDN / 边缘缓存(待 OSS 迁移 + 业务量达阈值时启动)

## 3. 当前状态 (Status)

### 3.1 数据看板

| 指标 | 当前 | 短期目标 | 长期目标 |
|---|---|---|---|
| perf_m ≥ 90 路由数 | 6/21(29%) | ≥ 15/21(71%) | 21/21(100%) |
| perf_d ≥ 90 路由数 | 13/21(62%) | ≥ 18/21(86%) | 21/21(100%) |
| LCP_m < 2.5s 路由数 | 6/21(29%) | ≥ 15/21 | 21/21 |
| LCP_m > 6s 路由数 | 10/21(48%) | 0 | 0 |
| CLS 全站 | 0 | 0 | < 0.05 |
| TBT_m < 200ms 路由数 | 18/21(86%) | ≥ 20/21 | 21/21 |
| a11y ≥ 95 路由数 | 14/21(67%) | ≥ 19/21 | 21/21 |
| SEO 100 路由数 | 21/21(100%) | 21/21 | 21/21 |
| 性能预算 CI 阻断 | ❌ 未启用 | ✅ 启用 | ✅ |

### 3.2 已知问题

| ID | 问题 | 优先级 | 状态 |
|---|---|---|---|
| P1-1 | `/product/flooring` perf_m=59,LCP=6.6s | **P1** | 🟡 待优化 §5.1 |
| P1-2 | `/brand/certifications` perf_m=63,LCP=6.0s(6+ 证书图未 lazy) | **P1** | 🟡 待优化 §5.2 |
| P1-3 | `/agent` perf_m=64,LCP=6.0s(27+ store 卡片) | **P1** | 🟡 待优化 §5.3 |
| P1-4 | `/product/wenjie` 30+ 车型图片 pending 占位 | **P1** | 🟡 待优化 §5.4 |
| P1-5 | `/product` 入口 LCP=6.5s(4 大主题图未 priority) | **P1** | 🟡 待优化 §5.5 |
| P2-1 | `/` 首页 Hero LCP=6.4s,TBT=290ms | P2 | 🟡 计划 §6.1 |
| P2-2 | `/contact` a11y=89(略低阈值 95) | P2 | 🟡 计划 §6.2 |
| P2-3 | `/product/zeekr` mobile 14578px 极高 | P2 | 🟡 计划 §6.3 |
| P2-4 | `/product/electric-steps` mobile LCP=6.0s | P2 | 🟡 计划 §6.4 |
| P2-5 | `/product/ppf` desktop perf=64 | P2 | 🟡 计划 §6.5 |
| P2-6 | `/product/wheels` LCP=6.0s | P2 | 🟡 计划 §6.6 |
| P2-7 | 10 个路由 LCP > 6s(根因:Hero 图未 priority) | P2 | 🟡 联动 P1-5 |

### 3.3 已达标路由(参考基准)

✅ perf_m ≥ 90:`/brand`(96)、`/product/chassis`(97)、`/product/window-film`(98)、`/product/xiaomi`(90)、`/product/zeekr`(94)、`/news`(97)、`/agent/store/[id]`(86)
✅ perf_d ≥ 90:`/brand`(98)、`/contact`(97)、`/news`(93)、`/product/electric-steps`(98)、`/product/wheels`(93)、`/product/window-film`(96)、`/product/wenjie`(88)、`/product/chassis`(88)

## 4. 改进路线

### 4.1 已完成
- 2026-06-19: 全站 + 后台 Lighthouse 审计(SUMMARY.md 完整)
- 2026-06-19: AUDIT_AND_REGRESSION 21 个 P0/P1/P2 任务清单
- 2026-06-14: ZEEKR 主题页 5 组件结构 + 字面量类型(性能 94/86 可作基准)

### 4.2 进行中
- 本 PRD 编写
- 5 个 P1 性能任务认领

### 4.3 计划
- 2026-Q3:5 个 P1 全部完成 + 5 个 P2 高优
- 2026-Q4:接入 Sentry Performance Monitoring(免费版够用)
- 2027-H1:RUM(Real User Monitoring)接入 web-vitals 库,采集真实用户数据

## 5. P1 任务详解(4 类策略)

### 5.1 P1-1 `/product/flooring` 性能优化

**现状**:perf_m=59,perf_d=61,LCP=6.6s(全站最差)

**根因分析**(推断):
- 地板展示图(多张木地板样图)未用 `next/image priority`
- 可能存在大尺寸图未压缩
- 字体 `font-display: swap` 未配置

**优化方案**(4 类策略):

#### Image 策略
```tsx
// src/app/product/flooring/page.tsx
import Image from "next/image";

// 1. 首屏 hero 图加 priority + sizes
<Image
  src="/images/products/flooring-hero.webp"
  alt="蓝辉轻改木地板升级"
  width={1600}
  height={1000}
  priority  // LCP 关键图
  sizes="(max-width: 768px) 100vw, (max-width: 1440px) 80vw, 1200px"
  className="object-cover"
/>

// 2. 其余样图 lazy
{samples.map((s) => (
  <Image
    key={s.slug}
    src={s.imagePath}
    alt={s.name}
    width={1200}
    height={800}
    loading="lazy"
    sizes="(max-width: 768px) 100vw, 33vw"
  />
))}
```

#### Static 策略
- 公开 SSG,`generateStaticParams` 一次性渲染所有 flooring 套餐
- 检查 `src/app/product/flooring/page.tsx` 是否有 `force-dynamic` / `revalidate = 0`,改为 `revalidate = 3600`(1 小时 ISR)

#### Code 策略
- 检查页面是否引入重型客户端组件(如 Hero 内的 Header 已经 client,但若 flooring 有额外 `useState`/`useEffect` 抽离)
- `import dynamic from "next/dynamic"` 用于非首屏客户端组件

#### Network 策略
- 检查 `public/images/products/flooring/` 目录所有图 < 250KB(超出需 sharp 重处理)

**验收**:
- `node scripts/audit/lighthouse-run.mjs --route /product/flooring` 输出 `perf_m ≥ 80`
- LCP_m < 4s
- 写入 `docs/test-reports/PERF_FIX_FLOORING_2026-XX-XX.md`

### 5.2 P1-2 `/brand/certifications` 性能优化

**现状**:perf_m=63,perf_d=77,LCP=6.0s

**根因**:6+ 张证书图全部首屏加载,未 lazy

**优化方案**:
```tsx
// src/app/brand/certifications/page.tsx
// 首屏只显示第一张证书 + 文字介绍
// 其余证书使用懒加载
<section>
  {/* LCP 图:第一张证书 */}
  <Image
    src={certs[0].imageUrl}
    alt={certs[0].name}
    width={1200}
    height={1200}
    priority
    sizes="(max-width: 768px) 100vw, 50vw"
  />
  {/* 其余证书 */}
  {certs.slice(1).map((cert) => (
    <Image
      key={cert.slug}
      src={cert.imageUrl}
      alt={cert.name}
      width={1200}
      height={1200}
      loading="lazy"
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  ))}
</section>
```

**额外**:
- 若证书图 > 500KB,压缩到 ≤ 250KB(`sharp -i input.jpg -o output.webp -f webp -q 80`)
- 用 Intersection Observer 替代原生 `loading="lazy"`(兼容性更好)

**验收**:perf_m ≥ 80,LCP_m < 4s

### 5.3 P1-3 `/agent` 列表性能优化

**现状**:perf_m=64,perf_d=75,LCP=6.0s(27+ store 卡片)

**根因**:首屏 12+ store 卡片图全部 eager load

**优化方案**:
```tsx
// src/app/agent/page.tsx
// 1. 分页:首屏 12 个,其余点击"加载更多"或分页
// 2. 首屏卡片图 priority,其余 lazy

const FIRST_BATCH = 12;
const visibleStores = stores.slice(0, FIRST_BATCH);

{visibleStores.map((s, i) => (
  <StoreCard
    key={s.id}
    store={s}
    priority={i < 4}  // 仅最前 4 张 priority
  />
))}

{stores.length > FIRST_BATCH && (
  <Link href={`/agent/page/2`}>查看更多 ({stores.length - FIRST_BATCH})</Link>
)}
```

#### Static 策略
- `/agent/page/[n]/page.tsx` 新增分页路由(若数据量大)
- 或单页 + 客户端虚拟滚动(react-window)

#### 备选方案:虚拟滚动
```tsx
"use client";
import { FixedSizeGrid } from "react-window";

<FixedSizeGrid
  columnCount={3}
  rowCount={Math.ceil(stores.length / 3)}
  columnWidth={300}
  rowHeight={400}
  height={1200}
  width="100%"
>
  {({ columnIndex, rowIndex, style }) => (
    <div style={style}>
      <StoreCard store={stores[rowIndex * 3 + columnIndex]} />
    </div>
  )}
</FixedSizeGrid>
```

**验收**:perf_m ≥ 80,LCP_m < 4s

### 5.4 P1-4 `/product/wenjie` 图片 pending 占位

**现状**:30+ 车型卡片图片全为空方框(`publicPath: null`,3 视口 × 30 车型 = 90 占位)

**根因**:`src/lib/wenjie-products.ts` 所有车型 `image.publicPath = null`,业务未补图

**优化方案**(3 步):

#### Step 1:短期 — UI fallback(2h)
```tsx
// src/components/wenjie/ProductCard.tsx
{imageStatus === "pending" && (
  <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-400">
    <span>图片即将上线</span>
  </div>
)}
```

#### Step 2:中期 — 补真实图(由 Coya 业务侧,5d)
- 拍摄 / 委托设计 30 张车型图
- 存放 `public/images/products/wenjie/{M7,M8,M9,New}/<slug>.webp`
- 字面量类型(同 ZEEKR `Width=1448 / Height=1086 / Ratio="4/3"`)

#### Step 3:长期 — CI 校验脚本(2h)
```js
// scripts/verify-wenjie-images.mjs
import fs from "node:fs";
import path from "node:path";
import { wenjieProducts } from "../src/lib/wenjie-products.ts";

const errors = [];
for (const car of wenjieProducts) {
  const p = path.join("public", car.image.publicPath);
  if (!fs.existsSync(p)) errors.push(`missing: ${p}`);
}
if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}
```

接入 `npm run check`(同 `verify:zeekr-images` 模式)。

**验收**:所有 wenjie 车型图非空 + CI 脚本检查通过 + perf_m 不恶化(当前 77,补图后可能 LCP 上升)

### 5.5 P1-5 `/product` 入口优化

**现状**:perf_m=76,perf_d=76,LCP=6.5s

**根因**:4 大主题 hero 图(electric-steps / wheels / window-film / ppf)未 priority

**优化方案**:
```tsx
// src/app/product/page.tsx
const themes = [
  { slug: "electric-steps", src: "/images/products/electric-steps.webp" },
  { slug: "wheels", src: "/images/products/wheels.webp" },
  { slug: "window-film", src: "/images/products/window-film.webp" },
  { slug: "ppf", src: "/images/products/ppf.webp" },
];

{themes.map((t, i) => (
  <Link key={t.slug} href={`/product/${t.slug}`}>
    <Image
      src={t.src}
      alt={t.name}
      width={1200}
      height={800}
      priority={i === 0}  // 仅首张 priority(其余用 eager 也可接受)
      loading={i === 0 ? "eager" : "lazy"}
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  </Link>
))}
```

**额外**:检查 4 大主题图大小是否 < 300KB(`sharp` 重新压)。

**验收**:perf_m ≥ 85,LCP_m < 4s

## 6. P2 任务概览(本季度后置)

| ID | 任务 | 当前 | 目标 | 估时 |
|---|---|---|---|---|
| P2-1 | `/` 首页 Hero LCP=6.4s + TBT=290ms | 69/75 | 85/95 | 1h |
| P2-2 | `/contact` a11y=89 → ≥ 95(补 form label / aria) | 75/97 | 80/95 | 1h |
| P2-3 | `/product/zeekr` mobile 14578px 过高(缩减 section 间距) | 94/86 | 94/86 不变 | 2h |
| P2-4 | `/product/electric-steps` mobile LCP=6.0s | 76/98 | 85/98 | 1h |
| P2-5 | `/product/ppf` desktop perf=64 → ≥ 80 | 75/64 | 80/75 | 1h |
| P2-6 | `/product/wheels` LCP=6.0s | 77/93 | 85/93 | 1h |
| P2-7 | 10 路由 LCP > 6s 全栈排查(非 priority 根因) | 多 | 全部 < 4s | 5h |

## 7. 4 类策略技术规范(沉淀)

### 7.1 Image 策略
| 规则 | 实现 |
|---|---|
| LCP 图必须 `priority` | Hero 首屏图 / 入口 banner |
| 视口外图 `loading="lazy"` | 滚动后才出现的卡片 / 长列表 |
| 写 `sizes` | `< 768px`:100vw / `< 1440px`:50vw / `≥ 1440px`:33vw |
| 容器固定 `aspect-ratio` | `aspect-[4/3]` / `aspect-video` / `aspect-[16/10]` |
| 格式优先 AVIF/WebP | `next.config.ts` `images.formats: ['image/avif', 'image/webp']` |
| 单图 < 250KB(Hero < 500KB) | CI 检查 `scripts/check-image-size.mjs` |
| alt 必填,业务化 | "蓝辉轻改 X" 不用"图片1" |

### 7.2 Static 策略
| 规则 | 实现 |
|---|---|
| 公开站优先 SSG | `generateStaticParams` 枚举动态路由 |
| 长列表 ISR | `export const revalidate = 3600`(1 小时) |
| CMS `force-dynamic` | `export const dynamic = 'force-dynamic'` 强制每次请求重新渲染 |
| 数据访问 fallback | `src/lib/data.ts` API → 静态数据 fallback,build 可在无 DB 跑通 |

### 7.3 Code 策略
| 规则 | 实现 |
|---|---|
| 默认 RSC | 组件不写 `"use client"` 除非必要 |
| 客户端组件 dynamic import | 非首屏客户端组件用 `dynamic(() => import(...))` |
| 第三方库按需 | 重型库(recharts / embla-carousel)走 dynamic |
| Bundle < 200KB 首屏 | `npm run build` 检查 First Load JS |

### 7.4 Network 策略
| 规则 | 实现 |
|---|---|
| `/_next/static/*` cache 365 天 | nginx `expires 365d;` |
| `/images/*` cache 30 天 | nginx `expires 30d;` |
| API 不 cache | `Cache-Control: no-store` |
| gzip level 6 | nginx 已配 |
| HTTP/2 | nginx `listen 443 ssl http2;` |
| DNS prefetch / preload | 关键 `<link rel="preload" as="image">` |

## 8. 性能门禁(`scripts/verify-perf-budget.mjs`)

### 8.1 阈值定义

```js
const PERF_BUDGET = {
  // 路由级 perf 阈值(mobile / desktop)
  "/": { perf_m: 85, perf_d: 90, lcp_m: 4.0 },
  "/product": { perf_m: 85, perf_d: 90, lcp_m: 4.0 },
  "/brand": { perf_m: 90, perf_d: 95, lcp_m: 2.5 },
  "/brand/certifications": { perf_m: 80, perf_d: 90, lcp_m: 4.0 },
  "/brand/history": { perf_m: 85, perf_d: 90, lcp_m: 4.0 },
  "/contact": { perf_m: 85, perf_d: 95, lcp_m: 4.0 },
  "/agent": { perf_m: 80, perf_d: 90, lcp_m: 4.0 },
  "/news": { perf_m: 95, perf_d: 95, lcp_m: 2.5 },
  "/product/flooring": { perf_m: 80, perf_d: 80, lcp_m: 4.0 },
  "/product/electric-steps": { perf_m: 85, perf_d: 95, lcp_m: 4.0 },
  "/product/wheels": { perf_m: 85, perf_d: 95, lcp_m: 4.0 },
  "/product/chassis": { perf_m: 95, perf_d: 90, lcp_m: 2.5 },
  "/product/window-film": { perf_m: 95, perf_d: 95, lcp_m: 2.5 },
  "/product/color-film": { perf_m: 90, perf_d: 90, lcp_m: 4.0 },
  "/product/ppf": { perf_m: 80, perf_d: 80, lcp_m: 4.0 },
  "/product/wenjie": { perf_m: 85, perf_d: 90, lcp_m: 4.0 },
  "/product/xiaomi": { perf_m: 90, perf_d: 85, lcp_m: 4.0 },
  "/product/zeekr": { perf_m: 90, perf_d: 90, lcp_m: 3.0 },
  "/agent/store/[id]": { perf_m: 90, perf_d: 90, lcp_m: 4.0 },
};

const GLOBAL = { cls: 0.1, tbt: 300, a11y: 95, seo: 100 };
```

### 8.2 脚本流程

```js
#!/usr/bin/env node
// 读 docs/audits/lighthouse/SUMMARY.md
// 解析所有路由的 perf_m / perf_d / LCP_m
// 与 PERF_BUDGET 比对
// 失败: process.exit(1),输出 violations
// 通过: console.log("All routes within budget")

import fs from "node:fs";

const summary = fs.readFileSync(
  "docs/audits/lighthouse/SUMMARY.md",
  "utf8"
);

let violations = 0;
for (const [route, budget] of Object.entries(PERF_BUDGET)) {
  // 解析 summary.md 行: | /route | 59 | 61 | 96 | 100 | 61 | 6.6s | 0 | 290ms |
  const re = new RegExp(`^\\|\\s*${escape(route)}\\s*\\|\\s*(\\d+)\\s*\\|\\s*(\\d+)\\s*\\|\\s*([\\d.]+)\\s*s`, "m");
  const m = summary.match(re);
  if (!m) {
    console.warn(`[perf-budget] ${route}: no Lighthouse data`);
    continue;
  }
  const [, perf_m, perf_d, lcp_m] = m;
  if (perf_m < budget.perf_m) {
    console.error(`[perf-budget] ${route} perf_m=${perf_m} < ${budget.perf_m}`);
    violations++;
  }
  // ... 同样检查 perf_d, lcp_m
}

if (violations > 0) {
  console.error(`[perf-budget] ${violations} violations`);
  process.exit(1);
}
console.log("[perf-budget] All routes within budget");
```

### 8.3 接入 `npm run check`

```json
{
  "scripts": {
    "verify:perf": "node scripts/verify-perf-budget.mjs",
    "check": "npm run lint && npm run typecheck && npm run verify:perf && npm run verify:zeekr-images && npm run build"
  }
}
```

**注意**:`verify:perf` 依赖 Lighthouse 数据,需先跑 `npm run lighthouse:run`。完整 CI 流程:
```bash
npm run dev  # 启动 dev server
npm run lighthouse:run  # 生成最新 SUMMARY.md
npm run check  # 含 verify:perf + verify:zeekr-images + build
```

## 9. 验收标准 (DoD)

- [ ] 本 PRD 文档完整(8 节,≥ 200 行)
- [ ] 5 个 P1 任务全部完成,perf_m ≥ 85(原 70-98 → 现 ≥ 85)
- [ ] LCP_m 全站 < 4s(原 0.7-8.0s → 现 < 4s)
- [ ] `scripts/verify-perf-budget.mjs` 实现并接入 `npm run check`
- [ ] 至少 3 次 Lighthouse 复测(基线 / 中间 / 完成),写入 `docs/audits/lighthouse/`
- [ ] 7 个 P2 任务认领优先级 + 估时
- [ ] 4 类策略(Image/Static/Code/Network)规则文档化(§7)
- [ ] RUM(Real User Monitoring)技术选型完成(web-vitals vs Sentry)
- [ ] 季度性能审计 SOP `docs/runbooks/PERF_AUDIT.md` 编写

## 10. 任务清单 (Backlog)

| ID | 任务 | 优先级 | 估时 | 状态 |
|---|---|---|---|---|
| **P1-1** | `/product/flooring` 性能优化(hero priority + sizes + 字体 swap) | **P1** | 2h | ⚪ |
| **P1-2** | `/brand/certifications` 性能优化(证书图 lazy) | **P1** | 1h | ⚪ |
| **P1-3** | `/agent` 列表性能优化(分页 / 虚拟滚动) | **P1** | 2h | ⚪ |
| **P1-4a** | `/product/wenjie` pending 占位 UI fallback | **P1** | 0.5h | ⚪ |
| **P1-4b** | wenjie 30+ 车型图拍摄 / 设计 | **P1** | 5d | ⚪ 业务侧 |
| **P1-4c** | wenjie CI 校验脚本 `scripts/verify-wenjie-images.mjs` | **P1** | 1h | ⚪ |
| **P1-5** | `/product` 入口 4 大主题 hero priority | **P1** | 0.5h | ⚪ |
| PERF-T01 | 写 `scripts/verify-perf-budget.mjs` | P0 | 2h | ⚪ |
| PERF-T02 | 接入 `npm run check`(`verify:perf`) | P0 | 0.2h | ⚪ |
| PERF-T03 | `scripts/check-image-size.mjs`(单图 < 250KB) | P1 | 1h | ⚪ |
| PERF-T04 | P1-1 完成报告 `docs/test-reports/PERF_FIX_FLOORING_2026-XX-XX.md` | P1 | 0.3h | ⚪ |
| PERF-T05 | P1-2 完成报告 `docs/test-reports/PERF_FIX_CERT_2026-XX-XX.md` | P1 | 0.3h | ⚪ |
| PERF-T06 | P1-3 完成报告 `docs/test-reports/PERF_FIX_AGENT_2026-XX-XX.md` | P1 | 0.3h | ⚪ |
| PERF-T07 | P1-5 完成报告 `docs/test-reports/PERF_FIX_PRODUCT_2026-XX-XX.md` | P1 | 0.3h | ⚪ |
| PERF-T08 | 季度性能审计 SOP `docs/runbooks/PERF_AUDIT.md` | P2 | 2h | ⚪ |
| PERF-T09 | RUM 选型 + POC(Sentry vs web-vitals) | P2 | 4h | ⚪ |
| PERF-T10 | P2-* 高优 5 个任务认领 | P2 | 5h | ⚪ |
| PERF-T11 | 接入 Lighthouse CI(Lighthouse 自动化集成) | P3 | 4h | ⚪ |
| PERF-T12 | Bundle size budget(`@next/bundle-analyzer` 集成) | P3 | 2h | ⚪ |

## 11. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-20 | v0 | 初稿,5 P1 + 7 P2 + 4 类策略 + 性能门禁 | Coya |

---

## 附录 A: Lighthouse 命令速查

```bash
# 单路由 lighthouse
npx lighthouse http://localhost:3000/product/flooring \
  --preset=desktop \
  --output=json \
  --output-path=docs/audits/lighthouse/desktop/product-flooring.json \
  --chrome-flags="--headless --no-sandbox"

# 全量脚本(项目已有)
npm run lighthouse:run

# 全量审计(含截图)
npm run audit:full

# 复测单个 P1 优化
node scripts/audit/lighthouse-run.mjs --route /product/flooring
```

## 附录 B: Next/Image 配置参考

`next.config.ts` 已配:
```ts
{
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000, // 30 天
  },
}
```

**建议补充**:
```ts
{
  images: {
    // ... 已有配置
    remotePatterns: [],  // 不允许远程图(防 SSRF + 数据控制)
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@base-ui/react"],  // 树摇优化
  },
}
```

## 附录 C: 参考案例
- [AUDIT_AND_REGRESSION_PRD_2026-06-19.md](./AUDIT_AND_REGRESSION_PRD_2026-06-19.md) §3 P1 + §4 性能表 — 全站审计
- [SECURITY_AUDIT_PRD_2026-06-20.md](./SECURITY_AUDIT_PRD_2026-06-20.md) — 安全审计
- [DEPLOYMENT_RUNBOOK_PRD_2026-06-20.md](./DEPLOYMENT_RUNBOOK_PRD_2026-06-20.md) — 部署
- [../../docs/audits/lighthouse/SUMMARY.md](../../docs/audits/lighthouse/SUMMARY.md) — 性能基线
- [../../docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) §11 — 部署 + §9 — Next/Image 配置

## 附录 D: 相关文档
- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.5 / §8
- [../../CLAUDE.md](../../CLAUDE.md) — 主题专项模式参考(ZEEKR)
- [../../AGENTS.md](../../AGENTS.md) — Agent 协作规范