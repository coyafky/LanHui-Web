# 膜小二（moxiaoer.com.cn）技术分析

> 竞品深度技术分析，作为蓝辉轻改官网后续开发的架构参考基准
>
> 分析日期：2026-06-09

---

## 1. 技术栈对比

| 维度 | 膜小二 (moxiaoer.com.cn) | 蓝辉当前 | 蓝辉目标 |
|------|--------------------------|----------|----------|
| 框架 | Next.js 16+ (App Router) | Next.js 16.2.1 | Next.js 16.2.1 |
| UI 库 | React 19 | React 19.2.4 | React 19.2.4 |
| 样式 | Tailwind CSS v4 | Tailwind CSS v4 | Tailwind CSS v4 |
| 类型 | TypeScript | TypeScript strict | TypeScript strict |
| 渲染模式 | SSR + RSC | SSG + SS（无 RSC 数据获取） | SSR + RSC |
| 图片 | Next.js Image 优化（AVIF/WebP） | 0 真实图片 | Next.js Image 优化 |
| Schema.org | Organization + LocalBusiness + Product | 无 | 完整结构化数据 |
| Sitemap | 2770 URLs，动态生成 | 静态 | 动态生成 |
| 门店数据 | 完整地理层级（27 省份 / 257 城市） | 1 家门店 | 完整地理层级 |
| 预渲染页 | ~2770 | 25 | 动态 ISR |
| 首屏时间 | 469ms | 未测量 | < 600ms |

---

## 2. 架构分析

### 2.1 渲染模式：SSR + RSC

所有页面采用服务端渲染，网络请求中可见 `_rsc=` 参数，表明启用了 React Server Components 流式传输。

```
# 典型 RSC 请求
GET /product/ppf?_rsc=1x2k3
Accept: text/x-component
```

**关键特征：**
- 页面初始 HTML 服务端渲染，SEO 友好
- 客户端导航通过 RSC payload 增量更新，避免全页刷新
- 数据获取在服务端完成，客户端零 API 调用

### 2.2 路由设计

```
产品三级路由
/product                           → 产品总览
/product/ppf                       → PPF 分类
/product/window-film               → 车窗膜分类
/product/color-film                → 改色膜分类
/product/[cat]/[model]             → 产品型号详情

门店四级路由
/agent                             → 门店总览
/agent/[province]                  → 省份聚合（如 /agent/guangdong）
/agent/[province]/[city]           → 城市细分（如 /agent/guangdong/foshan-shunde）
/agent/store/[id]                  → 单店详情

品牌二级路由
/brand                             → 品牌介绍
/brand/certifications              → 资质认证
/brand/history                     → 发展历程
```

### 2.3 Sitemap 策略

| 指标 | 值 |
|------|-----|
| 总 URLs | 2770 |
| 生成方式 | 动态（`/sitemap.ts`） |
| 门店页面占比 | ~93%（2570+ URLs） |
| 优先级分布 | 首页 1.0 / 分类 0.8 / 省份 0.65 / 城市 0.65 / 单店 0.6 |

### 2.4 代码分割

```
JS Bundles（10 chunks）
├── webpack.js          — 框架运行时
├── main.js             — 应用入口
├── pages/_app.js       — 布局
├── pages/index.js      — 首页
├── chunks/*.js (6)     — 共享模块 + 按需加载
└── 合计: ~134KB (gzip)

CSS
└── 单文件: 7.7KB (gzip)
```

### 2.5 首屏性能

| 指标 | 值 |
|------|-----|
| 首屏加载 | 469ms |
| CSS 体积 | 7.7KB（单文件） |
| JS 体积 | 134KB（10 chunk） |
| 并发请求数 | 18 |
| 图片总体积 | ~58KB（优化后） |

---

## 3. SEO / Schema.org 策略

### 3.1 Organization Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "膜小二",
  "alternateName": "MX2",
  "url": "https://www.moxiaoer.com.cn",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+86-400-073-7518",
    "contactType": "customer service",
    "areaServed": "CN"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "上海市闵行区宜山路1618号新意城T座7楼",
    "addressCountry": "CN"
  }
}
```

### 3.2 完整 Meta 配置

```html
<!-- 标准 SEO -->
<title>页面标题 | 膜小二</title>
<meta name="description" content="页面描述" />
<meta name="keywords" content="关键词1,关键词2,关键词3" />

<!-- Open Graph -->
<meta property="og:title" content="页面标题 | 膜小二" />
<meta property="og:description" content="页面描述" />
<meta property="og:url" content="https://www.moxiaoer.com.cn/..." />
<meta property="og:site_name" content="膜小二" />
<meta property="og:locale" content="zh_CN" />

<!-- canonical -->
<link rel="canonical" href="https://www.moxiaoer.com.cn/..." />
```

### 3.3 robots.txt

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: https://www.moxiaoer.com.cn/sitemap.xml
```

---

## 4. 图片优化方案

### 4.1 Next.js Image 优化管道

```
原始图片 → /_next/image?url=...&w=...&q=75
         → 格式协商: AVIF → WebP → PNG/JPEG
         → 响应式 srcset 输出
```

### 4.2 响应式断点（srcset）

| 断点 | 宽度 |
|------|------|
| 256w | 256px |
| 384w | 384px |
| 640w | 640px |
| 750w | 750px |
| 828w | 828px |
| 1080w | 1080px |
| 1200w | 1200px |
| 1920w | 1920px |
| 2048w | 2048px |
| 3840w | 3840px |

### 4.3 优化参数

- **质量**：`q=75`（默认）
- **懒加载**：71% 图片 `loading="lazy"`，首屏关键图无 lazy
- **格式协商**：自动 AVIF → WebP → 原格式回退

### 4.4 实际图片性能示例

| 图片类型 | 优化后体积 | 加载时间 |
|----------|-----------|----------|
| Logo | 7.3KB | 51.5ms |
| Hero 背景 | 10.1KB | 120.5ms |
| 产品卡片 | 38.6KB | 73.9ms |
| **合计** | **~58KB** | — |

---

## 5. GEO 地理页面策略

### 5.1 三级页面结构

```
/agent                         → 全国门店总览
  └── /agent/[province]        → 省份聚合页（27 个省/直辖市）
        └── /agent/[province]/[city]  → 城市细分页（257 个城市）
              └── /agent/store/[id]   → 单店详情页
```

### 5.2 URL Slug 规范

- 省份：拼音全称（如 `guangdong`、`zhejiang`、`shanghai`）
- 城市：拼音全称，多字用连字符（如 `foshan-shunde`、`guangzhou`）
- 门店 ID：数字（如 `/agent/store/101`）

### 5.3 广东省示例

| 指标 | 值 |
|------|-----|
| 门店数 | 41 |
| 覆盖城市 | 14 |
| 平均每城市 | ~2.9 家 |
| URL 示例 | `/agent/guangdong` → `/agent/guangdong/foshan-shunde` → `/agent/store/101` |

### 5.4 各级页面 SEO Metadata 模式

```
省份聚合页
  title:    "膜小二{省名}门店_膜小二{省名}授权店查询"
  desc:     "膜小二{省名}共{count}家门店，覆盖{cities}个城市..."

城市细分页
  title:    "膜小二{市名}门店_膜小二{市名}{count}家门店地址电话"
  desc:     "膜小二{市名}共{count}家门店，提供车窗膜/PPF/改色膜..."

单店详情页
  title:    "{店名}_膜小二{市名}门店_地址电话营业时间"
  desc:     "{店名}位于{地址}，营业时间{hours}，电话{phone}..."
```

### 5.5 Sitemap Priority 分布

| 页面级别 | Priority |
|----------|----------|
| 首页 | 1.0 |
| 产品/品牌分类 | 0.8 |
| 省份聚合页 | 0.65 |
| 城市细分页 | 0.65 |
| 单店详情页 | 0.6 |

---

## 6. API 架构

### 6.1 已识别接口

```
报价接口
POST https://api.moxiaoer.com.cn/client/baojia
Content-Type: application/json
→ 请求车型/产品类型，返回报价范围
```

### 6.2 RSC 数据获取

```
GET /agent/guangdong?_rsc=1x2k3
Accept: text/x-component
→ 返回 RSC payload（非 JSON），客户端增量合并

特征：
- 服务端获取数据，客户端无直接 API 调用
- 结合 ISR（增量静态再生），缓存命中率高
- 导航时仅传输变化部分，减少数据量
```

### 6.3 ISR 增量静态再生

- 门店页面：按需生成 + 后台定期重新验证
- 产品页面：构建时预渲染 + ISR 更新
- Sitemap：动态生成，包含所有已生成页面

---

## 7. 性能指标基准

| 指标 | 膜小二值 | 蓝辉目标 |
|------|----------|----------|
| 首屏加载 (FCP) | 469ms | < 600ms |
| CSS 体积 | 7.7KB（单文件） | < 10KB |
| JS 体积 | 134KB（10 chunk） | < 150KB |
| 并发请求数 | 18 | < 25 |
| 图片总体积（首屏） | ~58KB | < 80KB |
| Sitemap URLs | 2770 | 按需增长 |
| Lighthouse SEO | 预估 95+ | 90+ |

---

## 8. 蓝辉轻改可借鉴实践清单

### P0 — 必须实施（SEO 核心）

| # | 实践 | 说明 | 涉及文件 |
|---|------|------|----------|
| 1 | **Schema.org 结构化数据** | Organization + LocalBusiness + Product 三类 Schema，覆盖所有页面 | `layout.tsx` + 各页面 |
| 2 | **图片优化配置** | `next.config.ts` 配置 `formats: ['image/avif', 'image/webp']`、`deviceSizes`、`minimumCacheTTL` | `next.config.ts` |

**Schema.org 实施示例：**

```tsx
// layout.tsx — Organization Schema
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "蓝辉轻改",
  "alternateName": "Lanhui",
  "url": "https://www.lanhui.com",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+86-XXX-XXXX-XXXX",
    "contactType": "customer service",
    "areaServed": "CN"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "CN"
  }
};
```

```ts
// next.config.ts — 图片优化配置
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 天
  },
};
```

### P1 — 高优先级（搜索可见性）

| # | 实践 | 说明 | 涉及文件 |
|---|------|------|----------|
| 3 | **GEO 三级页面结构标准化** | 省份 → 城市 → 单店，统一 slug 规范 | `app/agent/` 路由 |
| 4 | **动态 SEO metadata 生成** | 每页独立 title/description/keywords，使用 `generateMetadata()` | 各 `page.tsx` |
| 5 | **canonical URL 配置** | 每页设置 `<link rel="canonical">`，防止重复索引 | 各 `page.tsx` |

**动态 Metadata 实施示例：**

```tsx
// app/agent/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const province = await getProvince(params.slug);
  return {
    title: `蓝辉轻改${province.name}门店_蓝辉轻改${province.name}授权店查询`,
    description: `蓝辉轻改${province.name}共${province.storeCount}家门店，覆盖${province.cityCount}个城市...`,
    keywords: `蓝辉轻改,${province.name},门店,汽车贴膜`,
    alternates: { canonical: `https://www.lanhui.com/agent/${params.slug}` },
    openGraph: {
      title: `蓝辉轻改${province.name}门店`,
      description: `蓝辉轻改${province.name}共${province.storeCount}家门店`,
      locale: 'zh_CN',
    },
  };
}
```

### P2 — 中优先级（功能增强）

| # | 实践 | 说明 | 涉及文件 |
|---|------|------|----------|
| 6 | **报价/询价 API 接口设计** | 按车型 + 产品类型返回报价范围，服务端 RSC 调用 | `app/api/` 或 RSC 直接调用 |
| 7 | **地图嵌入** | 门店详情页嵌入高德/百度地图，展示门店位置 | `agent/store/[id]/page.tsx` |
| 8 | **ISR 增量静态再生策略** | 门店页 `revalidate = 86400`，产品页 `revalidate = 3600` | 各 `page.tsx` |

**ISR 实施示例：**

```tsx
// app/agent/store/[id]/page.tsx
export const revalidate = 86400; // 24 小时重新验证

export default async function StorePage({ params }: Props) {
  const store = await getStore(params.id);
  return <StoreDetail store={store} />;
}
```

### P3 — 低优先级（锦上添花）

| # | 实践 | 说明 | 涉及文件 |
|---|------|------|----------|
| 9 | **门店营业时间结构化数据** | LocalBusiness Schema 包含 openingHours | `agent/store/[id]/page.tsx` |
| 10 | **BreadcrumbList 面包屑 Schema** | 所有二级以下页面添加面包屑结构化数据 | 全局组件 |

**BreadcrumbList 实施示例：**

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://www.lanhui.com" },
    { "@type": "ListItem", "position": 2, "name": "门店查询", "item": "https://www.lanhui.com/agent" },
    { "@type": "ListItem", "position": 3, "name": "广东省", "item": "https://www.lanhui.com/agent/guangdong" },
    { "@type": "ListItem", "position": 4, "name": "佛山顺德店" }
  ]
}
```

---

## 附录：膜小二关键数据摘要

| 数据维度 | 值 |
|----------|-----|
| 网站域名 | moxiaoer.com.cn |
| 技术框架 | Next.js 16+ / React 19 / Tailwind v4 |
| 渲染模式 | SSR + RSC |
| Sitemap URLs | 2770 |
| 省份覆盖 | 27 |
| 城市覆盖 | 257 |
| JS 体积 | 134KB (10 chunks) |
| CSS 体积 | 7.7KB (单文件) |
| 首屏时间 | 469ms |
| 图片优化 | AVIF/WebP 自适应, q=75 |
| API 域名 | api.moxiaoer.com.cn |
| Schema 类型 | Organization / LocalBusiness / Product |
