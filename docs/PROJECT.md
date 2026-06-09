# 膜小二官网复刻项目 — 工程文档

> 本文档描述**这个复刻项目本身**的工程实现,而非原网站的产品需求。
> 适用读者:接手维护的前端工程师、代码审计者、文档阅读者。
>
> 最后更新: 2026-06-06 · 项目版本: v0.3.1 · Next.js 16.2.1

---

## 1. 项目概览

### 1.1 这是什么
对 [https://www.moxiaoer.com.cn](https://www.moxiaoer.com.cn) 的**像素级复刻**项目。仅使用静态数据(无后端、无数据库、无第三方 API 调用),作为:
- 设计参考实现
- 静态站点 (SSG) 部署演示
- 门店数据的 mock 数据源

### 1.2 核心指标
| 维度 | 值 |
|------|---|
| 路由数 (用户可见) | 13 |
| 构建时预渲染页数 | **242** |
| 省份数 | 27 |
| 城市数 | 75 |
| 收录门店数 | ~150 |
| 静态资产 | 12 张图片 (~1.9 MB) |
| `npm run build` 时间 | ~10 秒 |
| TypeScript 严格模式 | ✅ |

### 1.3 与原站的关系
- **不联网** (除 `tel:` 协议、ICP 链接)
- **不调用原站 API** (数据全部硬编码)
- **不抓取原站图片** (仅使用人工下载到 `public/images/` 的资源)

---

## 2. 技术栈

| 类别 | 选型 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 16.2.1 |
| UI 库 | React | 19 |
| 语言 | TypeScript (strict) | 5.x |
| 样式 | Tailwind CSS v4 (oklch tokens) | 4.x |
| 组件 | shadcn/ui 风格 (但本项目极少使用) | — |
| 图标 | lucide-react | latest |
| 构建 | Turbopack (默认) | — |
| 包管理 | npm | — |

**无第三方状态管理** — 项目纯展示,无 Redux/Zustand/Context 需要。

---

## 3. 目录结构

```
ai-website-cloner-template/
├── src/
│   ├── app/                        # Next.js App Router 入口
│   │   ├── layout.tsx              # 根布局 (html/body/metadata)
│   │   ├── page.tsx                # / 首页
│   │   ├── globals.css             # 全局 CSS
│   │   ├── product/                # /product + 3 个子页
│   │   │   ├── page.tsx
│   │   │   ├── ppf/page.tsx
│   │   │   ├── window-film/page.tsx
│   │   │   └── color-film/page.tsx
│   │   ├── agent/                  # /agent 省份 + /agent/[省] + /agent/[省]/[市] + /agent/store/[id]
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       ├── page.tsx
│   │   │       └── [city]/page.tsx
│   │   ├── brand/                  # /brand + 2 个子页
│   │   │   ├── page.tsx
│   │   │   ├── certifications/page.tsx
│   │   │   └── history/page.tsx
│   │   ├── news/page.tsx           # /news
│   │   └── not-found.tsx           # 404 页 (Next.js 默认)
│   ├── components/
│   │   ├── Header.tsx              # 全站顶部导航
│   │   ├── Footer.tsx              # 全站底部
│   │   ├── Hero.tsx                # 首页 hero 区
│   │   ├── WhyChooseUs.tsx         # 首页"为什么选择膜小二"
│   │   ├── CoreServices.tsx        # 首页 3 大服务卡片
│   │   └── ui/
│   │       └── button.tsx          # shadcn 风格按钮 (未实际使用)
│   └── lib/
│       ├── agent-data.ts           # ⭐ 门店数据 + 查询函数
│       └── utils.ts                # cn() 工具函数
├── public/
│   └── images/
│       ├── logo/                   # 品牌 logo
│       ├── home/                   # 首页图片
│       ├── brand/                  # 品牌介绍图片
│       └── cert/                   # 资质证书
├── docs/
│   ├── PROJECT.md                  # 本文档
│   ├── research/                   # 复刻调研记录
│   └── design-references/          # 设计参考截图
├── AGENTS.md                       # AI 代理工作规范
├── package.json
├── next.config.mjs
├── tsconfig.json
└── tailwind.config (内联在 globals.css)
```

---

## 4. 路由系统

### 4.1 完整路由表

| URL 模式 | 渲染方式 | 页面数 | 文件 |
|----------|---------|-------|------|
| `/` | SS (Static) | 1 | `src/app/page.tsx` |
| `/product` | SS | 1 | `src/app/product/page.tsx` |
| `/product/ppf` | SS | 1 | `src/app/product/ppf/page.tsx` |
| `/product/window-film` | SS | 1 | `src/app/product/window-film/page.tsx` |
| `/product/color-film` | SS | 1 | `src/app/product/color-film/page.tsx` |
| `/agent` | SS | 1 | `src/app/agent/page.tsx` |
| `/agent/[slug]` | **SSG** | 27 | `src/app/agent/[slug]/page.tsx` |
| `/agent/[slug]/[city]` | **SSG** | 71 | `src/app/agent/[slug]/[city]/page.tsx` |
| `/agent/store/[id]` | **SSG** | 130 | `src/app/agent/store/[id]/page.tsx` |
| `/brand` | SS | 1 | `src/app/brand/page.tsx` |
| `/brand/certifications` | SS | 1 | `src/app/brand/certifications/page.tsx` |
| `/brand/history` | SS | 1 | `src/app/brand/history/page.tsx` |
| `/news` | SS | 1 | `src/app/news/page.tsx` |
| **合计** | | **242** | |

### 4.2 SSG 机制 (重要)

3 个动态路由都使用 `generateStaticParams()` 预渲染:

```typescript
// src/app/agent/[slug]/page.tsx:8
export function generateStaticParams() {
  return PROVINCES.map((p) => ({ slug: p.slug }));
}
```

```typescript
// src/app/agent/[slug]/[city]/page.tsx:8
export function generateStaticParams() {
  return PROVINCES.flatMap((p) =>
    p.cities.map((c) => ({ slug: p.slug, city: c.slug }))
  );
}
```

```typescript
// src/app/agent/store/[id]/page.tsx:9
export function generateStaticParams() {
  return getAllStoreIds().map((id) => ({ id }));
}
```

**含义**:
- 任意不匹配的 URL 都会返回 404 (Next.js 静态生成行为的硬约束)
- 若要新增省份/城市/门店,**必须**重新运行 `npm run build`
- 所有数据在构建时定型,运行时无后端调用

### 4.3 路由不存在的处理

动态路由都遵循同一个模式:

```typescript
export default async function Page({ params }) {
  const { slug } = await params;          // Next.js 15+ params 是 Promise
  const result = findProvince(slug);
  if (!result) notFound();                // 触发 404.tsx
  // ... 渲染
}
```

---

## 5. 数据层 (核心)

### 5.1 数据文件: `src/lib/agent-data.ts`

**这是整个项目最重要的文件**。所有省份、城市、门店数据都硬编码在这里。

#### 5.1.1 类型定义

```typescript
export type Store = {
  id: string;         // 6 位数字, 全局唯一
  name: string;       // 例 "广州天河店"
  address: string;    // 完整地址
  phone: string;      // 11 位手机号
};

export type City = {
  name: string;       // 例 "广州市"
  count: number;      // 该城市门店总数 (可能 > stores.length)
  slug: string;       // 例 "guangzhou"
  stores?: Store[];   // 可选 — 缺失表示暂无数据
};

export type Province = {
  name: string;       // 例 "广东省"
  count: number;      // 该省门店总数
  slug: string;       // 例 "guangdong"
  cities: City[];
};
```

#### 5.1.2 核心常量

```typescript
export const PROVINCES: Province[] = [/* 27 个省 */];
```

每个 `Province` 包含 `cities: City[]`,每个 `City` 包含可选的 `stores: Store[]`。

#### 5.1.3 辅助构造函数

```typescript
type StoreSeed = [string, string, string]; // [id, name, address]
const S = (data: StoreSeed[]): Store[] => /* 自动生成 phone */;
```

`S` 接受 `[id, name, address]` 元组,自动用确定性算法生成合理的 phone (基于 id),避免重复硬编码。

#### 5.1.4 查询函数

| 函数 | 用途 | 返回 |
|------|------|------|
| `findProvince(slug)` | 查省份 | `Province \| undefined` |
| `findCity(provSlug, citySlug)` | 查城市 | `{ province, city } \| undefined` |
| `findStore(id)` | 查门店 | `{ store, province, city } \| undefined` |
| `getRelatedStores(provSlug, excludeId, limit)` | 同省其他门店 | `StoreLocation[]` (默认 6 条) |
| `getAllStoreIds()` | 所有门店 id (用于 SSG 预渲染) | `string[]` |

### 5.2 数据流向图

```
┌─────────────────────┐
│  agent-data.ts      │  静态数据源
│  (PROVINCES, S, fn) │
└──────────┬──────────┘
           │ import
           ▼
┌──────────────────────────────────────────┐
│  page.tsx (每个动态路由)                  │
│  1. await params                         │
│  2. findStore / findCity / findProvince  │
│  3. 找不到 → notFound()                  │
│  4. 找到 → 渲染 <Header> + 主体 + <Footer>│
└──────────┬───────────────────────────────┘
           │ SSG 在 build 时
           ▼
┌─────────────────────┐
│  .next/server/app/  │  静态 HTML 文件
│  *.html (242 个)     │
└─────────────────────┘
```

---

## 6. 页面执行详解

### 6.1 首页 `/`

**文件**: `src/app/page.tsx` (组合式,内联 3 个组件)
**渲染时机**: 构建时

```typescript
// src/app/page.tsx 简版
<Header />
<Hero />              // src/components/Hero.tsx
<WhyChooseUs />       // src/components/WhyChooseUs.tsx
<CoreServices />      // src/components/CoreServices.tsx
<Footer />
```

每个子组件都是独立文件,可在其他页面复用 (但本项目目前只首页用)。

### 6.2 产品中心 `/product`

**文件**: `src/app/product/page.tsx`
**结构**: 3 个分类卡片 → 链接到子页

### 6.3 产品详情页 `/product/ppf` 等

**模式**: 内联常量数据 + 表格渲染

以 `ppf/page.tsx` 为例:
- 顶部导出 `metadata` (Next.js 内置 SEO)
- 内联 `SERIES` 常量 (6 个系列)
- 渲染 N 个 `<table>`,每行一个产品

### 6.4 省份列表 `/agent`

**文件**: `src/app/agent/page.tsx`
**结构**:
- Hero 介绍
- 搜索框 (UI 占位,无功能)
- 27 个省份卡片网格 (链接到 `/agent/[slug]`)

### 6.5 省份详情 `/agent/[slug]`

**文件**: `src/app/agent/[slug]/page.tsx`
**SSG**: ✅ (27 个)
**关键逻辑**:
```typescript
const province = findProvince(slug);
if (!province) notFound();
// 渲染: 面包屑 + 标题 + 城市芯片网格
{cities.map(city => <Link href={`/agent/${slug}/${city.slug}`}>)}
```

### 6.6 城市门店列表 `/agent/[slug]/[city]`

**文件**: `src/app/agent/[slug]/[city]/page.tsx`
**SSG**: ✅ (71 个)
**关键逻辑**:
```typescript
const result = findCity(slug, city);
if (!result) notFound();
const { province, city: cityData } = result;
const stores = cityData.stores ?? [];
const hasStores = stores.length > 0;
```

**两种渲染分支**:
- `hasStores === true`: 门店卡片网格 (3 列)
- `hasStores === false`: 空状态 ("暂无门店数据" + 返回按钮)

**示例可访问**:
- ✅ `/agent/guangdong/guangzhou` — 9 家门店
- ❌ `/agent/shanghai/pudong` — 5 家但无 stores 数据,显示空状态
- ❌ `/agent/ningxia/yinchuan` — 1 家但无 stores 数据,显示空状态

### 6.7 门店详情 `/agent/store/[id]`

**文件**: `src/app/agent/store/[id]/page.tsx`
**SSG**: ✅ (130 个)
**关键逻辑**:
```typescript
const { id } = await params;
const result = findStore(id);
if (!result) notFound();
const { store, province, city } = result;
const related = getRelatedStores(province.slug, store.id, 6);
```

**页面结构**:
1. Hero: 4 级面包屑 + 旗舰店红章 + H1
2. 主区 (2 列):
   - 左: 主图 + 4 缩略图 (第 1 张高亮)
   - 右: 地址 / 电话 / 营业时间 + 双 CTA
3. 关联: 同省其他门店 (6 个)

### 6.8 品牌页 `/brand` + 子页

**文件**: 3 个 page.tsx
- `/brand` — 简介 + 数据统计 + 价值观
- `/brand/certifications` — 6 张证书图片 (用普通 `<img>`,非 Next.js Image)
- `/brand/history` — 8 年时间线 (左右交替 + 红点)

### 6.9 新闻 `/news`

**文件**: `src/app/news/page.tsx`
**结构**: 6 篇文章卡片 (硬编码)

---

## 7. 共享组件

### 7.1 Header (客户端组件)

**文件**: `src/components/Header.tsx`
**标识**: `"use client"` (需要 `useState` 和 `usePathname`)

**职责**:
1. 渲染导航
2. 检测当前路由 (用 `usePathname`) → 高亮 (红色下边框)
3. 桌面端: 下拉菜单
4. 移动端 (< md): 汉堡菜单 + 全屏抽屉
5. 右上角: 客服电话 (tel: 协议)

**导航配置** (`NAV_ITEMS`):
| Label | href | matchPrefix | children |
|-------|------|-------------|----------|
| 首页 | `/` | — | — |
| 产品中心 | `/product` | `/product` | 3 子项 |
| 全国门店 | `/agent` | `/agent` | — |
| 品牌介绍 | `/brand` | `/brand` | 3 子项 |
| 服务中心 | — | — | 1 子项 (外链) |

**高亮逻辑**:
```typescript
const isActive = (item) => {
  if (item.matchPrefix) return pathname.startsWith(item.matchPrefix);
  if (item.href) return pathname === item.href;
  return false;
};
```

### 7.2 Footer (服务端组件)

**文件**: `src/components/Footer.tsx`
**标识**: 无 `"use client"` (纯静态)

**结构** (4 列响应式 grid):
| 列 | 内容 |
|----|------|
| 1 | Logo + 品牌简介 |
| 2 | 快捷导航 (5 链接) |
| 3 | 联系我们 (客服电话) |
| 4 | 服务保障 (ICP 备案号) |

**底部**: 版权 + 备案号 (重复显示在桌面底部)

### 7.3 首页 3 大组件

| 文件 | 用途 | 内容 |
|------|------|------|
| `Hero.tsx` | 顶部 hero | 背景图 + 标题 + CTA 按钮 |
| `WhyChooseUs.tsx` | 为什么选择 | 3 个特性卡片 (盾形 / 奖杯 / 闪光图标) |
| `CoreServices.tsx` | 3 大服务 | 产品中心 / 旗舰店 / 品牌介绍卡片 |

---

## 8. 静态生成 (SSG) 与构建

### 8.1 构建命令

```bash
npm run dev        # 开发服务器 (默认端口 3000,被占用则 3001/3002...)
npm run build      # 生产构建 (.next/)
npm run start      # 启动生产服务器
npm run lint       # ESLint 检查
npm run typecheck  # TypeScript 类型检查
npm run check      # lint + typecheck + build (CI 用)
```

### 8.2 构建产物结构

```
.next/
├── server/app/
│   ├── index.html
│   ├── agent.html
│   ├── agent/anhui.html, beijing.html, ... (27 个)
│   ├── agent/anhui/, beijing/, ... (各含子目录)
│   │   ├── [slug].html
│   │   ├── beijing.segments/
│   │   │   └── agent/$d$slug/$d$city/*.html
│   └── ... (共 242 个 HTML)
└── static/
    └── images/  (资源副本)
```

### 8.3 已知 SSG 行为

- 每次 `npm run build` 会重新生成**所有** 242 个页面
- 增量构建由 Next.js 处理 (未变化页面秒级通过)
- 构建时间主要花在静态预渲染,典型 ~10 秒

---

## 9. 资源 (Assets)

### 9.1 资源目录

```
public/images/
├── logo/
│   ├── mx2logo_white.png    22×128, Header + Footer 用
│   └── warranty.png         质保徽章
├── home/
│   ├── hero_bg.png          首页 hero 背景
│   ├── product_center.png   首页"产品中心"卡片
│   ├── flagship_store.png   首页"旗舰店"卡片
│   └── brand_intro.png      首页"品牌介绍"卡片
├── brand/
│   └── about_mx2.png        /brand 页用
└── cert/
    ├── cert_1.jpg
    ├── cert_2.jpg
    ├── cert_3.jpg
    ├── cert_4.jpg
    ├── cert_5.jpg
    └── cert_6.jpg           /brand/certifications 页 6 张图
```

### 9.2 资源使用模式

- **Header/Footer logo**: Next.js `Image` 组件,`width=128, height=22, priority`
- **首页 hero/卡片**: Next.js `Image` 组件,带 `fill` 和 `sizes`
- **证书图片**: 普通 `<img>` 标签 (有意的 — 之前用 Next.js Image 出现过生产环境问题)

### 9.3 缺失的资源

- 首页 hero 在生产环境用占位符背景渐变
- 门店详情页用 Building2 图标占位 (不下载原图)
- 产品中心卡片图也用占位符

---

## 10. 开发与运行

### 10.1 启动开发服务器

```bash
npm run dev
```

**端口行为**:
- 默认 3000
- 被占用时自动选 3001, 3002, ...
- 查看 `tail /tmp/devserver.log` 确认实际端口

### 10.2 测试关键路由 (curl)

```bash
# 静态页
curl -I http://localhost:3000/

# 动态页 (SSG)
curl -I http://localhost:3000/agent/guangdong
curl -I http://localhost:3000/agent/guangdong/guangzhou
curl -I http://localhost:3000/agent/store/184279

# 不存在 (404)
curl -I http://localhost:3000/agent/nonexistent
```

### 10.3 调试技巧

```bash
# 查看生成的所有路由
ls .next/server/app/agent/

# 查看 build summary
npm run build 2>&1 | grep -A 20 "Route (app)"

# 类型检查 (比 build 快)
npx tsc --noEmit

# 重新生成单一数据 (改 agent-data.ts 后)
npm run dev  # dev 模式 HMR 自动更新
npm run build  # 重新预渲染所有 SSG 页
```

---

## 11. 扩展指南

### 11.1 添加新产品系列

**例**: 添加 `/product/ceramic-coating` (镀晶)

1. 在 `src/app/product/page.tsx` 添加卡片链接
2. 创建 `src/app/product/ceramic-coating/page.tsx`,参考 `ppf/page.tsx` 结构
3. (可选) 在 `Header.tsx` 的 NAV_ITEMS 添加子菜单
4. 运行 `npm run build`

### 11.2 添加新省份

1. 打开 `src/lib/agent-data.ts`
2. 在 `PROVINCES` 数组末尾添加:
   ```typescript
   {
     name: "西藏自治区",
     count: 1,
     slug: "xizang",
     cities: [
       { name: "拉萨市", count: 1, slug: "lasa", stores: S([
         ["000001", "拉萨店", "西藏自治区拉萨市..."]
       ])}
     ]
   }
   ```
3. 同步更新 `src/app/agent/page.tsx` 的 `REGIONS` 数组 (用于首页省份列表)
4. 重新 build

### 11.3 添加新门店到已有城市

```typescript
// 在 agent-data.ts 中找到对应城市,追加 store
{ name: "广州市", count: 10, slug: "guangzhou", stores: S([
  // ... 已有 9 家
  ["999999", "广州第十店", "广州市..."]  // 新增
])}
```

注意:同时把 `count` 加 1。

### 11.4 修改导航

**单处修改即可** (Header 自带 `matchPrefix` 高亮):

```typescript
// src/components/Header.tsx
const NAV_ITEMS = [
  // ... 现有项
  { label: "新闻", href: "/news", matchPrefix: "/news" },  // 新增
];
```

### 11.5 接入真实图片 (可选)

1. 下载图片到 `public/images/`
2. 在页面中替换占位符:

```tsx
// src/app/agent/store/[id]/page.tsx
<div className="absolute inset-0 ...">  // 渐变占位
  <Image
    src={`/images/stores/${store.id}.jpg`}
    alt={store.name}
    fill
    className="object-cover"
  />
</div>
```

### 11.6 切换到动态数据 (P2)

如果将来要接入真实后端:

1. 移除 `generateStaticParams` 中的 `getAllStoreIds()`
2. 把 `findStore` 改为 `await fetch(...)`
3. 在 `next.config.mjs` 添加 `revalidate` (ISR) 或 `dynamic = 'force-dynamic'`

---

## 12. 已知限制与注意事项

### 12.1 数据限制

- **不完整**: 27 省中仅 20 省有 stores 数据,北京/上海/天津/重庆/宁夏 整省无数据
- **ID 不一致**: 个别门店的 ID 来自人工录入,可能与原站实时数据有偏差
- **占位电话**: `S()` 函数生成的电话号码是**假的**,不可拨打
- **零门店城市** (例上海浦东): 显示空状态而非真实门店

### 12.2 功能限制

- 搜索框是**纯 UI 占位** (无功能)
- 门店详情页的图片是渐变占位 (无真实店招图)
- 没有 CMS,所有内容改一处需重新 build
- 没有预约表单 (CTA 跳 `tel:` 协议)
- 没有 LBS / 地图集成
- 没有多语言 (仅中文)

### 12.3 技术约束

- **完全静态**: 没有 ISR/SSR,所有页面都是 build-time 渲染
- **params 是 Promise**: Next.js 15+ 必须 `await params`,旧版文档可能误导
- **Turbopack 默认**: 与 Webpack 行为略有差异,部分老插件不兼容
- **TypeScript 严格**: `any` 不可用,所有数据必须有类型

### 12.4 SEO 现状

✅ 已做:
- 每页有独立 `metadata` (title + description)
- HTML lang="zh-CN"
- 图片有 alt 文本

❌ 未做:
- 无 sitemap.xml
- 无 robots.txt
- 无 OG / Twitter cards
- 无结构化数据 (Schema.org) — 除空状态
- 无 canonical URL

---

## 13. 常用文件位置速查

| 想改什么 | 去看哪个文件 |
|---------|-------------|
| 导航栏 | `src/components/Header.tsx` |
| 底部信息 | `src/components/Footer.tsx` |
| 首页结构 | `src/app/page.tsx` |
| 产品表格 | `src/app/product/*/page.tsx` |
| 门店数据 | `src/lib/agent-data.ts` |
| 全站样式 | `src/app/globals.css` |
| HTML lang / metadata | `src/app/layout.tsx` |
| 路由配置 | 无 — App Router 约定式 |
| 静态资源 | `public/images/` |

---

## 14. 调试与排错

### 14.1 页面 404

**原因**: SSG 预渲染列表中无此 URL
**解决**:
- 检查 `generateStaticParams` 是否包含该组合
- 检查 `agent-data.ts` 是否有该省/市/店

### 14.2 端口被占用

```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
npm run dev
```

### 14.3 样式不生效

- Tailwind v4 不需要 `tailwind.config.js` — 配置在 `globals.css` 的 `@theme` 块
- 检查类名是否拼写正确
- 暗色模式由 `className="dark"` (在 `<html>`) 强制开启

### 14.4 构建失败

```bash
# 最常见: 数据类型不匹配
npx tsc --noEmit  # 单独跑类型检查
```

---

## 15. 未来工作 (Roadmap)

**P0 - 必做** (如果上线):
- [ ] 补齐所有 27 省的门店数据
- [ ] 添加 sitemap.xml / robots.txt
- [ ] 接入真实图片 (门店店招)

**P1 - 重要**:
- [ ] 搜索功能 (Algolia 或自研 Fuse.js)
- [ ] 表单线索 → CRM
- [ ] 微信小程序同构

**P2 - 体验**:
- [ ] LBS 距离排序
- [ ] 视频探店模块
- [ ] 车主案例 UGC

**P3 - 商业化**:
- [ ] 在线预约排期
- [ ] 经销商后台
- [ ] 微信支付定金

**明确不做**:
- 在线商城 (线下转化为主)
- 论坛/社区
- 国际化

---

## 16. 术语表

| 术语 | 含义 |
|------|------|
| **SSG** | Static Site Generation, 构建时生成 HTML |
| **SS** | Static, 不依赖 params 的静态页 |
| **PPF** | Paint Protection Film, 漆面保护膜 (隐形车衣) |
| **TPU** | Thermoplastic Polyurethane, 热塑性聚氨酯 (PPF 原料) |
| **ICP** | 互联网内容提供商 (中国网站备案) |
| **门店 ID** | 6 位数字, 原站用于 `/agent/store/{id}` |
| **省份 slug** | 拼音, 例 `guangdong`, 用于 URL |

---

## 17. 维护者注意

- 修改 `agent-data.ts` 后**必须**重新 build (`npm run dev` 可热更新,但 SSG 列表需要重生成)
- 任何新增路由都要检查:
  1. 是否在 `Header.tsx` 的导航里
  2. 是否在 `Footer.tsx` 的快捷链接里
  3. 是否有 `metadata` (SEO)
- 公共资源放到 `public/images/`,文件名用 kebab-case
- 不要给页面添加 `"use client"`,除非真的需要 (会影响 SSG)

---

**最后更新**: 2026-06-06 · **作者**: Claude (反向工程自动化)
