# SPEC: 轻改装备 / 实用配件服务页 Product Accessories

> 对应 PRD:
> - P0 轻改装备(电动踏板):[`ELECTRIC_STEPS_PRD_2026-06-20.md`](../../../PRD/product/ELECTRIC_STEPS_PRD_2026-06-20.md)(v1)
> - P0 轻改装备(轮毂):[`WHEELS_PRD_2026-06-20.md`](../../../PRD/product/WHEELS_PRD_2026-06-20.md)(v1)
> - P0 轻改装备(底盘):[`CHASSIS_PRD_2026-06-20.md`](../../../PRD/product/CHASSIS_PRD_2026-06-20.md)(v1)
> - P1 实用配件(地板):[`FLOORING_TOPIC_PRD_2026-06-20.md`](../../../PRD/product/FLOORING_TOPIC_PRD_2026-06-20.md)(v1,专题页)
> - P1 项目规划:[`P1_SERVICE_PROJECTS_PRD_2026-06-25.md`](../../../PRD/product/P1_SERVICE_PROJECTS_PRD_2026-06-25.md)
>
> 路由治理:[`PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md`](../../../PRD/product/PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md) §5.2
> 共享数据源:`src/lib/products.ts` → `getProduct(slug)`
> 地板专题数据源:`src/lib/flooring-products.ts`(4 品牌 × 4 色 = 16 张图)
>
> 实现状态:✅ **3 个 P0 轻改装备服务页 + 1 个 P1 地板专题页全部落地;3 个 P1 planned 服务尚未建页**

---

## 1. 职责范围

承接四类非膜类升级服务:

1. **电动踏板**(`/product/electric-steps`)— P0 · 高底盘 SUV / MPV 上下车便利
2. **轮毂升级**(`/product/wheels`)— P0 · 外观姿态与数据匹配
3. **底盘升级**(`/product/chassis`)— P0 · 避震/连杆/加强件轻度升级
4. **汽车地板**(`/product/flooring`)— P1 · MPV / 新能源地板总成(4 品牌 × 4 色 = 16 张产品图)

页面只做内容展示、项目解释、施工流程、车型适配;**不设置页面私有操作**(电话 / 微信弹窗 / 报价按钮等),需要沟通走首页 / Header / Footer。

下游 3 个 P1 planned 服务(尚未建页,仅在 `product-routes.ts` 注册):

- `/product/floor-mats` — 360 软包脚垫
- `/product/business-comfort` — 商务舒适升级(小桌板 / 后排娱乐 / 氛围灯 / 腿托 聚合)
- `/product/skid-plate` — 底盘护板(可先并入底盘页 `#skid-plate` 锚点)

---

## 2. 路由

| 路径 | 类型 | 状态 | 数据源 | 渲染器 |
|---|---|---|---|---|
| `/product/electric-steps` | page (RSC) | ✅ v1 落地 | `products.ts` | 共享 `<ProductDetail>` |
| `/product/wheels` | page (RSC) | ✅ v1 落地 | `products.ts` | 共享 `<ProductDetail>` |
| `/product/chassis` | page (RSC) | ✅ v1 落地 | `products.ts` | 共享 `<ProductDetail>` |
| `/product/flooring` | page (RSC) | ✅ v1 落地(专题) | `flooring-products.ts` | 自定义 4 组件布局 |
| `/product/floor-mats` | page (RSC) | ⚪ P1 planned | (未实现) | (未实现) |
| `/product/business-comfort` | page (RSC) | ⚪ P1 planned | (未实现) | (未实现) |
| `/product/skid-plate` | page (RSC) | ⚪ P1 planned | (未实现) | (未实现) |

### 2.1 路由类型对比(关键技术差异)

| 维度 | P0 共享(电踏/轮毂/底盘) | P1 自定义(地板) | P1 planned(脚垫/商务/护板) |
|---|---|---|---|
| 页面代码量 | 17 行 | 223 行 | 0 行(未实现) |
| 数据源 | `products.ts` 单一字段 | `flooring-products.ts` 多字段 | (待定) |
| 渲染器 | 共享 `<ProductDetail>` | 4 个 `<Flooring*>` 组件 + 内联流程 | (待定) |
| 业务区块 | Hero + 4 卖点 + 4 步流程 | Hero + 7 卖点 + 5 结构 + 4 品牌区 + 图库 + 4 步流程 | (待定) |
| 主题色 | `blue-500`(light_mod 主题) | `amber-400`(实用配件主题) | (待定) |
| 图片 | ❌ 暂无(预留 `productImageMap` 空值) | ✅ 16 张产品图(4 品牌 × 4 色) | (待定) |
| 车型分组 | ❌ | ✅ 4 品牌 li-auto/aito/zeekr/xpeng | (待定) |
| 颜色轮播 | ❌ | ✅ 4 色 snow-white/neutral-gray/rock-black/wood-brown | (待定) |
| 卖点数量 | 4 | 7 | (待定) |

### 2.2 3 个共享 page.tsx 的实际内容(electric-steps/wheels/chassis)

```typescript
// src/app/product/electric-steps/page.tsx (17 行)
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { getProduct } from "@/lib/products";

export const metadata: Metadata = {
  title: "电动踏板 | 蓝辉轻改 LANHUI",
  description: "蓝辉轻改电动踏板服务,...",
};

export default async function ElectricStepsPage() {
  const product = getProduct("electric-steps");
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
```

`/product/wheels` 和 `/product/chassis` 结构完全相同,仅 `metadata.title` / `description` 和 `getProduct(slug)` 三处不同。

### 2.3 地板专题 page.tsx 的实际内容(223 行)

```typescript
// src/app/product/flooring/page.tsx 实际结构
<Header />
<main>
  {/* Hero:面包屑 + heading + 3 主卖点 + 1 张主图 */}
  <section className="bg-zinc-950">
    <nav>...面包屑(产品中心 → 地板改装专题)...</nav>
    <div>
      <p>FLOORING TOPIC</p>
      <h1>地板改装专题</h1>
      <p>围绕地板主板、滑轨、脚踏和尾箱区域...</p>
      <div>{PRIMARY_HIGHLIGHTS.map(...)}</div>  {/* 7 卖点取前 3 */}
      <Image src={HERO_IMAGE.assetPath} ... />   {/* 理想 木纹咖 */}
    </div>
  </section>

  <FlooringFeatureGrid />   {/* 7 卖点全量 */}
  <FlooringStructureGrid /> {/* 5 结构组成 */}

  {/* 4 品牌车型分组 */}
  <section>
    {flooringVehicleGroups.map(group => (
      <FlooringVehicleGroup key={group.id} group={group} />
    ))}
  </section>

  <FlooringGallery />       {/* 4×2 网格,16 张图 */}

  {/* 内联 4 步服务流程 */}
  <section>{[01 车型确认, 02 款式选择, 03 安装评估, 04 施工交付]}</section>
</main>
<Footer />

{/* JSON-LD: CollectionPage + ItemList(4 品牌 ListItem) */}
<script type="application/ld+json" />
```

---

## 3. 功能清单

### 3.1 P0 共享产品线(电动踏板 / 轮毂 / 底盘)— `ProductDetail` 共享渲染器

| # | 功能 | 优先级 | 状态 | 备注 |
|---:|---|---|---|---|
| F1 | Hero:面包屑(产品中心 → 项目名)+ 组别标签 + H1 + heroDescription | P0 | ✅ | `<ProductDetail>` 内置 |
| F2 | Tagline 横幅:渐变文字(blue-500 主题) | P0 | ✅ | `<ProductDetail>` 内置 |
| F3 | 核心价值区:4 张卡片 | P0 | ✅ | `<ProductDetail>` 内置 |
| F4 | 服务流程区:4 步(到店沟通 / 车型确认 / 方案推荐 / 施工交付) | P0 | ✅ | `<ProductDetail>` 内置 |
| F5 | 三视口响应式(390 / 768 / 1440) | P0 | ✅ | Tailwind 断点 |
| F6 | SEO metadata(`title` + `description`) | P0 | ✅ | `generateMetadata` |
| F7 | 面包屑导航 | P0 | ✅ | `<ProductDetail>` 内置 |
| F8 | 图片容器 | P1 | ⚪ `productImageMap` 为空字符串,Hero 暂用纯色背景 | 已知 gap |

### 3.2 P1 地板专题页 `/product/flooring`(自定义布局)

| # | 功能 | 优先级 | 状态 | 关联组件 |
|---:|---|---|---|---|
| F1 | Hero(面包屑 + heading + 3 主卖点 + 1 张代表图) | P0 | ✅ | page.tsx 内联 |
| F2 | 7 个卖点全量展示(amber 主题图标 grid 3 列) | P0 | ✅ | `<FlooringFeatureGrid>` |
| F3 | 5 个结构组成(主板 / 滑轨 / 迎宾踏板 / 脚踏 / 尾箱) | P0 | ✅ | `<FlooringStructureGrid>` |
| F4 | 4 品牌车型分组(理想 / 问界 / 极氪 / 小鹏)— 每品牌含代表图 + 颜色轮播 + 4 卖点 + 适配提示 | P0 | ✅ | `<FlooringVehicleGroup>` (CC) |
| F5 | 16 张图库(4 品牌 × 4 色,4×2 grid 响应式) | P0 | ✅ | `<FlooringGallery>` |
| F6 | 4 步服务流程(车型确认 / 款式选择 / 安装评估 / 施工交付) | P0 | ✅ | page.tsx 内联 |
| F7 | JSON-LD `CollectionPage` + `ItemList`(4 品牌 ListItem) | P0 | ✅ | inline `<script>` |
| F8 | SEO metadata + `openGraph.images` | P0 | ✅ | `generateMetadata` |
| F9 | 三视口响应式(390 / 768 / 1440) | P0 | ✅ | Tailwind 断点 |

### 3.3 P1 planned 服务(脚垫 / 商务 / 护板)

| # | 功能 | 优先级 | 状态 | 说明 |
|---:|---|---|---|---|
| F1 | `/product/floor-mats` 服务页 | P1 | ⚪ planned | 待 PRD 详细化 + 实现 |
| F2 | `/product/business-comfort` 聚合页(小桌板 + 后排娱乐 + 氛围灯 + 腿托 + 地板) | P1 | ⚪ planned | 待 PRD + 实现 |
| F3 | `/product/skid-plate` 服务页(或并入 `/product/chassis#skid-plate` 锚点) | P1 | ⚪ planned | 可与 chassis 合并 |

### 3.4 `/product` 入口回链

- `<LightModMap>` 渲染 `electric-steps` / `wheels` / `chassis` 3 个 light_mod 服务(orange 主题)
- `<FlooringTopicBanner>` 已实现但 **当前未在 `/product` 入口页渲染**(仅 FilmServiceMap / LightModMap / VehicleTopicMap / P1ServiceCard 折叠区)— 详见 §10.2 已知问题

---

## 4. 数据模型

### 4.1 共享产品线数据(`src/lib/products.ts`)

3 个 P0 服务共享 `Product` 类型,每个含 4 核心价值 + 4 步流程:

```typescript
type Product = {
  slug: "electric-steps" | "wheels" | "chassis";  // light_mod 子集
  name: string;                  // "电动踏板" / "轮毂升级" / "底盘升级"
  group: "light-mod";
  groupLabel: "轻改装备";
  tagline: string;               // 1 句话定位
  cardDescription: string;       // 卡片描述
  heroDescription: string;       // Hero 副标题
  audience: string[];            // 3 类适合人群
  values: { title: string; description: string }[];  // 4 条核心价值
  process: { step: string; title: string; description: string }[];  // 4 步
};

const PROCESS_TEMPLATE = [
  { step: "01", title: "到店沟通",   description: "到蓝辉轻改顺德大良店,面对面沟通用车场景与升级需求。" },
  { step: "02", title: "车型确认",   description: "确认车型、年款与原车状态,给出可执行的升级建议。" },
  { step: "03", title: "方案推荐",   description: "结合预算与风格偏好,推荐轻改或膜系方案。" },
  { step: "04", title: "施工交付",   description: "按标准流程施工交付,并提示后续用车与维护建议。" },
];
```

**3 个服务的实际卖点矩阵**:

| 服务 | tagline | 4 个 values |
|---|---|---|
| 电动踏板 | "上下车更从容,也更稳" | 迎宾便利 / 姿态保留 / 承重稳定 / 无损安装 |
| 轮毂升级 | "换一套轮毂,换一种风格" | 数据匹配 / 款式多样 / 动平衡考虑 / 施工标准 |
| 底盘升级 | "更稳的姿态,更好的质感" | 姿态升级 / 支撑增强 / 日常可保留 / 规范施工 |

### 4.2 地板专题数据(`src/lib/flooring-products.ts`)

地板专题独立数据,4 个字面量类型约束 + 多字段结构:

```typescript
// 字面量类型约束(与 ZEEKR / 窗膜 保持一致,防规格漂移)
type Width = number;             // 798 (理想/极氪/小鹏) | 1075 (问界)
type Height = number;            // 528 (理想/极氪/小鹏) | 1052 (问界)
type AspectRatio = "4/3";        // 强制 4:3

// 7 个字面量 ID
type FlooringSellingPointId =
  | "model-fitment"           // 按热门车型适配
  | "color-match"             // 多色效果对比
  | "floor-rail-integration"  // 地板与滑轨整合
  | "door-step-comfort"       // 上下车与脚部体验
  | "trunk-continuity"        // 尾箱区域联动
  | "easy-care"               // 日常清洁维护
  | "premium-cabin";          // 座舱质感提升

// 5 个字面量 ID
type FlooringFunctionId =
  | "main-floor-board"   // 地板主板
  | "rail-trim"          // 滑轨区域
  | "door-sill-step"     // 中门迎宾踏板
  | "foot-rest"          // 休息脚踏
  | "trunk-floor";       // 尾箱地板

// 4 个字面量 ID
type FlooringColorId =
  | "snow-white"     // 雪霜白
  | "neutral-gray"   // 中性灰
  | "rock-black"     // 岩石黑
  | "wood-brown";    // 木纹咖

// 5 个字面量品牌 ID
type FlooringHotBrand =
  | "li-auto"
  | "aito"
  | "zeekr"
  | "xpeng"
  | "mercedes-benz";  // 当前 missing-assets,不渲染

type FlooringColorVariant = {
  id: string;                // "li-auto-wood-brown"
  colorId: FlooringColorId;
  colorName: string;         // "木纹咖"
  description: string;       // 适合场景描述
  assetPath: string;         // "/images/products/flooring/图片/理想/1.png"
  width: number;             // 798 或 1075
  height: number;            // 528 或 1052
  alt: string;               // 详细 alt
};

type FlooringVehicleGroup = {
  id: FlooringHotBrand;      // "li-auto" / "aito" / "zeekr" / "xpeng"
  brand: FlooringHotBrand;
  brandName: string;         // "理想" / "问界" / "极氪" / "小鹏"
  models: string[];          // ["理想 L 系列", "理想 MEGA"]
  headline: string;          // 1 句话核心价值
  summary: string;           // 段落描述
  productIntro: string;      // 产品介绍
  fitmentNote: string;       // 适配提示(统一文案)
  sellingPointIds: FlooringSellingPointId[];  // 引用的卖点(5-6 个)
  functionIds: FlooringFunctionId[];          // 引用的结构(5 个)
  colorVariants: FlooringColorVariant[];      // 4 个色变体
};
```

**实际数据(4 active+ready 品牌,1 reference-only 不渲染)**:

| 品牌 | brandName | models | headline | 色变体数 |
|---|---|---|---|---:|
| `li-auto` | 理想 | L 系列 / MEGA | 家庭出行场景下的地板总成升级 | 4 |
| `aito` | 问界 | M7 / M8 / M9 | 新能源家庭与商务兼顾的地板总成方案 | 4 |
| `zeekr` | 极氪 | 009 / 7X | 高端新能源座舱的地板总成展示 | 4 |
| `xpeng` | 小鹏 | X9 / G9 | 科技家庭座舱的地板与后排空间整合 | 4 |
| `mercedes-benz` | 奔驰 | (missing assets) | — | ❌ 不渲染 |
| `denza` | 腾势 | (reference-only) | — | ❌ 不渲染 |

**4 个 FlooringColorId**:

| colorId | colorName | 适合场景 |
|---|---|---|
| `snow-white` | 雪霜白 | 浅色内饰,视觉更明亮干净 |
| `neutral-gray` | 中性灰 | 灰色或冷色内饰,整体更克制耐看 |
| `rock-black` | 岩石黑 | 深色内饰,视觉更稳重 |
| `wood-brown` | 木纹咖 | 棕色、暖色或木纹风格内饰 |

### 4.3 路由注册表(`src/lib/product-routes.ts`)

7 个非膜类服务(4 live + 3 planned):

| Service Slug | Group | Status | Priority | Route |
|---|---|---|---|---|
| `electric-steps` | `light_mod` | live | P0 | `/product/electric-steps` |
| `wheels` | `light_mod` | live | P0 | `/product/wheels` |
| `chassis` | `light_mod` | live | P0 | `/product/chassis` |
| `flooring` | `practical_accessory` | **live** | P1 | `/product/flooring` |
| `floor-mats` | `practical_accessory` | planned | P1 | `/product/floor-mats` |
| `business-comfort` | `business_comfort` | planned | P1 | `/product/business-comfort` |
| `skid-plate` | `light_mod` | planned | P1 | `/product/skid-plate` |

注:`group` 类型还包含 `film` (见 [`product-film.md`](./product-film.md))。

### 4.4 SEO 字段

**P0 共享模板**:

| 字段 | 模板 |
|---|---|
| `<title>` | `{项目名} | 蓝辉轻改 LANHUI` |
| `<meta description>` | `蓝辉轻改{项目名}服务,围绕{核心价值}展开。` |
| H1 | `{项目名}` |
| H2 | `核心价值` / `服务流程` |
| Canonical | `/product/{slug}` |

**P1 地板专题**(实际值):

| 字段 | 实际值 |
|---|---|
| `<title>` | `地板改装专题 | 蓝辉轻改 LANHUI` |
| `<meta description>` | `蓝辉轻改地板改装分类专题,覆盖 MPV / 新能源家庭车的地板总成、尾箱地板、迎宾踏板、休息脚踏等组件,按理想、问界、极氪、小鹏等热门车型分组展示多色效果。` |
| `<meta keywords>` | `地板改装, 地板总成, 尾箱地板, 迎宾踏板, MPV, 新能源车型, 蓝辉轻改, 理想, 问界, 极氪, 小鹏` |
| `openGraph.type` | `article` |
| `openGraph.images` | `HERO_IMAGE.assetPath` (理想 木纹咖) |
| H1 | `地板改装专题` |
| H2 | `地板改装能解决什么问题` / `地板总成的 5 个组成部分` / `按品牌车型查看地板总成` / `热门车型地板总成图库` / `到店沟通流程` |
| JSON-LD | `CollectionPage` + `ItemList`(4 品牌 ListItem) |
| Canonical | `/product/flooring` |

---

## 5. 关键组件

### 5.1 已实现组件清单(2026-06-25 实测)

#### 5.1.1 P0 共享渲染器(`/product/electric-steps` / `wheels` / `chassis`)

| 组件 | 路径 | Client? | 职责 |
|---|---|---:|---|
| `<ProductDetail>` | `src/components/ProductDetail.tsx` | RSC | 6 大产品线共享渲染器(470 行) |

`ProductDetail` 内部按 `product.slug` 分支渲染:

- `ppf` → 系列 + 性能对比(`<StarRating>`) + 防护场景
- `window-film` → 通用产品线 + 7 套餐入口(实际由 `/product/window-film` 独立 page.tsx 接管)
- `color-film` → 系列 + 热门颜色
- `electric-steps` / `wheels` / `chassis` → **仅 Hero + 4 卖点 + 4 步流程**(无额外 section)

`ProductDetail` 关键逻辑(theme 分支):

```typescript
const isLightMod = product.group === "light-mod";
const accentText  = isLightMod ? "text-blue-400" : "text-orange-400";
const accentBg    = isLightMod ? "bg-blue-500"  : "bg-orange-500";
const accentGradient = isLightMod
  ? "from-blue-500 to-blue-700"
  : "from-orange-500 to-orange-600";
```

#### 5.1.2 P1 地板专题(`/product/flooring`)

| 组件 | 路径 | Client? | 职责 | 文件大小 |
|---|---|---:|---|---:|
| `<FlooringFeatureGrid>` | `src/components/product/FlooringFeatureGrid.tsx` | RSC | 7 卖点全量 grid(amber 图标 3 列) | 2.2K |
| `<FlooringStructureGrid>` | `src/components/product/FlooringStructureGrid.tsx` | RSC | 5 结构组成 grid(amber 图标 5 列) | 1.9K |
| `<FlooringVehicleGroup>` | `src/components/product/FlooringVehicleGroup.tsx` | **CC** | 单品牌车型组(代表图 + 颜色轮播 + 4 卖点 + 适配提示) | 6.8K |
| `<FlooringGallery>` | `src/components/product/FlooringGallery.tsx` | RSC | 16 张图库 4×2 grid(响应式 2/3/4 列) | 2.6K |
| `<FlooringTopicBanner>` | `src/components/product/FlooringTopicBanner.tsx` | RSC | 入口卡片(代表图 + 标签 + 跳转)— **当前未在 `/product` 入口页渲染** | 2.4K |

**关键交互**:
- `<FlooringVehicleGroup>` 是唯一 client component(因 `<Carousel>` 需状态)
- 颜色轮播用 shadcn/ui `<Carousel>`(loop + align start)
- 单图 fallback:只有 1 个色变体时(`hasCarousel = false`)直接渲染,不挂载 carousel
- `<FlooringGallery>` 用 `loading="lazy"` + `sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"`

### 5.2 视觉规范

| Token | light_mod (P0) | practical_accessory (P1 flooring) |
|---|---|---|
| 背景 | `bg-zinc-950` / `bg-black` | `bg-zinc-950` / `bg-black` |
| 文字主色 | `text-white` / `text-zinc-300` | `text-white` / `text-zinc-300` |
| 强调色 | `blue-400/500` | `amber-400` |
| 渐变 | `from-blue-500 to-blue-700` | `from-amber-950/30 via-zinc-950 to-zinc-950` |
| 卡片 | `rounded-2xl bg-zinc-900 border border-zinc-800` | 同上 |
| 面包屑 | `text-zinc-500` → `text-zinc-300` | 同上 |
| 字体 | Geist Sans + 系统中文 | 同上 |

### 5.3 图片规范

| 类型 | 规格 | 路径模式 |
|---|---|---|
| 地板 Hero(代表图) | 798×528 / 1075×1052 + `object-cover` + `aspect-[4/3]` | `/images/products/flooring/图片/{品牌}/{序号}.png` |
| 地板轮播 / Gallery | 同上 + `sizes="(min-width: 1024px) 50vw, 100vw"` / `25vw, 33vw, 50vw` | 同上 |
| 电动踏板 / 轮毂 / 底盘 | ⚪ `productImageMap` 暂为 `""`,Hero 用纯背景 + tagline 渐变 | (无图) |
| 加载策略 | 首屏 hero `priority` / gallery `loading="lazy"` | — |

**字面量类型保证**: `FlooringColorVariant.width` / `height` 是 `number` 而非字面量;4:3 比例由 `aspect-[4/3]` 容器硬保证。

---

## 6. 数据流与渲染策略

### 6.1 渲染架构

```text
RSC 请求 /product/{serviceSlug}
  │
  ├─ P0 共享 (electric-steps/wheels/chassis)
  │    └─ page.tsx (17 行)
  │         ├─ metadata (静态)
  │         └─ getProduct(slug) → <ProductDetail product={...} />
  │              └─ RSC 渲染: Hero + Tagline + 4 Values + 4 Process
  │
  ├─ P1 自定义 (flooring)
  │    └─ page.tsx (223 行)
  │         ├─ metadata + HERO_IMAGE
  │         └─ <FlooringFeatureGrid /> (RSC)
  │              └─ flooringSellingPoints (7 条)
  │         └─ <FlooringStructureGrid /> (RSC)
  │              └─ flooringFunctions (5 条)
  │         └─ flooringVehicleGroups.map → <FlooringVehicleGroup> (CC, per brand)
  │              └─ 颜色轮播 + 4 卖点
  │         └─ <FlooringGallery /> (RSC)
  │              └─ flooringGalleryItems (16 条)
  │         └─ 内联 4 步流程
  │         └─ inline JSON-LD
  │
  └─ P1 planned (floor-mats/business-comfort/skid-plate)
       └─ (page.tsx 不存在 → 404,但 `product-routes.ts` 已注册)
```

### 6.2 SSG / 动态策略

| 页面 | 策略 | 原因 |
|---|---|---|
| `/product/electric-steps` | RSC 静态(无 IO) | 数据纯静态,build 时静态生成 |
| `/product/wheels` | RSC 静态 | 同上 |
| `/product/chassis` | RSC 静态 | 同上 |
| `/product/flooring` | RSC 静态 | 数据纯静态(`flooring-products.ts`) |
| 3 P1 planned | 动态(404 until built) | page.tsx 缺失 |

### 6.3 与入口页 `/product` 的回链

- P0 light_mod → `<LightModMap>` 在 `/product` `#service-projects` section 渲染 3 个卡片
- P1 flooring → `<FlooringTopicBanner>` 已实现但 **当前未在 `/product` 入口页渲染**(详见 §10.2)
- P1 planned → `<P1ServiceCard>` × 3 在 `/product` 折叠区显示(默认前 3 个可见,展开看全)

### 6.4 与全站 Header / Footer 的关系

- 3 个 P0 page.tsx 与 flooring page.tsx 都直接 import `<Header />` / `<Footer />`,与品牌专题页一致
- **不** import `<PhoneCta>` / `<WeChatConsultModal>` — 沟通走全站 Header / Footer 入口

---

## 7. 路由组 / 导航接入

### 7.1 内部导航

- `<Breadcrumb>`(各 page.tsx 内联):`/product` → 当前项目名
- 3 个 P0 共享 page 之间无相互跳转(各自独立)
- flooring 内部锚点:无(各品牌组平铺展示)

### 7.2 与 `/product` 入口的相互关系

- 入口 → 服务:`<LightModMap>` / `<FlooringTopicBanner>` 卡片链接到本类页面
- 服务 → 入口:面包屑 + Footer logo 链回首页
- 入口 → P1 折叠:`<CollapsibleSection>` + `<P1ServiceCard>` 显示 3 个 planned 服务(包含 floor-mats / business-comfort / skid-plate 之一或多个)

### 7.3 与 `/agent` 门店网络的关系

- 不在门店页直接出现
- flooring 的"适配提示"统一文案:`具体车型、年份、座椅布局和安装方案需要业务/门店二次确认。` — 隐式引导到店

---

## 8. 性能与可访问性

### 8.1 性能预算

| 页面 | LCP 目标 | 主要成本 | 优化策略 |
|---|---|---|---|
| `/product/electric-steps` | < 2.5s | 纯文本,无图 | Hero 用渐变 + tagline 文字,无 IO |
| `/product/wheels` | < 2.5s | 同上 | 同上 |
| `/product/chassis` | < 2.5s | 同上 | 同上 |
| `/product/flooring` | < 3.0s | 16 张图(1.5MB 总) | Hero 1 张 `priority`;Gallery 15 张 `loading="lazy"` |

**实测历史数据**(2026-06-19 lighthouse + 4x CPU throttling):

- `/product/flooring` mobile perf **59** / desktop 61,LCP 6.6s(**全站最差**,P1-1 已记入 PRD)
- 其他 3 个 P0 共享页未单独测速(纯文本预估性能优异)

### 8.2 关键优化项(待办)

| 优先级 | 项目 | 原因 |
|---|---|---|
| P0 | flooring Hero 图 `priority` 验证 | 已加 `priority`,需 lighthouse 复测 |
| P0 | flooring Gallery `loading="lazy"` 验证 | 已加,需确认不阻塞 LCP |
| P1 | flooring 16 张图转 webp / AVIF | 当前 PNG,体积可优化 30-50% |
| P1 | P0 共享页加入产品图(`productImageMap` 留空) | 当前纯文字,SEO 与吸引力弱 |
| P2 | flooring 品牌区按需懒加载(carousel 内部) | 当前轮播预渲染所有 slide |

### 8.3 可访问性

- 所有 hero / section 使用 `bg-zinc-950` + `text-white` 对比度 16:1(AAA)
- 面包屑 `<nav>` 元素包裹
- 图片全部含 `alt`(中英混合)
- 颜色轮播有 `CarouselPrevious` / `CarouselNext` 键盘可达
- 4 步流程用 `<ol>` 有序列表 + 编号
- ⚪ `<FlooringVehicleGroup>` 内部 `sellingPointLabel` 简化为客户端字符串映射(原 `sellingPointLabel` 函数)— 已符合 a11y

---

## 9. 验收标准(对应 PRD §7.6 + P1 PRD §6.7)

### 9.1 通用验收(P0 + P1 live)

- [x] **A1**: SSG 静态生成所有 live 页面(build 通过)
- [x] **A2**: 三视口响应式(390 / 768 / 1440)
- [x] **A3**: `npm run typecheck` 通过(9 个 pre-existing 错误不计入)
- [x] **A4**: `npm run build` 通过(无需 Postgres)
- [x] **A5**: SEO metadata + 面包屑 + JSON-LD(仅 flooring)
- [x] **A6**: 不在页面内设置私有操作(无 PhoneCta / 弹窗 / 报价按钮)
- [x] **A7**: P0 共享页通过 `<ProductDetail>` 渲染(无重复实现)
- [x] **A8**: flooring 通过 4 个 `<Flooring*>` 组件 + 内联流程 + JSON-LD
- [x] **A9**: 主题色一致:light_mod=blue,practical_accessory=amber
- [x] **A10**: 入口页 `<LightModMap>` 3 卡片全部指向 live 服务

### 9.2 专项验收

**P0 共享页**:

- [x] 每个服务 4 个 values 与 `products.ts` 数据一致
- [x] 4 步流程文案统一(共享 `PROCESS_TEMPLATE`)
- [x] `isLightMod` 主题色分支正确(blue-500)
- [x] `getProduct(slug)` 返回 undefined 时 `notFound()`

**P1 地板专题**:

- [x] 4 品牌全部 active+ready 才渲染(`mercedes-benz` missing assets + `denza` reference-only 不渲染)
- [x] 颜色轮播 `loop: true` + `align: "start"`
- [x] JSON-LD `ItemList` 包含 4 个品牌 ListItem
- [x] 适配提示统一文案
- [x] 16 张图路径正确(`/images/products/flooring/图片/{品牌}/{1-4}.png`)
- [ ] **GAP**: `public/images/products/flooring/manifest.json` 与代码数据需 CI 校验脚本(参考 ZEEKR `verify-zeekr-images.mjs`)

**P1 planned**:

- [ ] floor-mats / business-comfort / skid-plate page.tsx 尚未实现(只在路由注册表)

### 9.3 不在验收范围(明确边界)

- ❌ 不实现页面内"立即咨询 / 报价"等私有按钮
- ❌ 不写具体价格(到店沟通)
- ❌ 不写官方合作 / 原厂件 / 厂家授权等未经确认表述(flooring 明确)
- ❌ 不引入图片规格漂移 — 用 `aspect-[4/3]` 容器硬保证

---

## 10. 已知问题与待办

### 10.1 P0 共享页缺口

| # | 问题 | 影响 | 建议方案 |
|---|---|---|---|
| 1 | `productImageMap["electric-steps" / "wheels" / "chassis"] = ""` | Hero 仅有渐变 + tagline,视觉吸引力弱 | 拍摄或采购代表图后填入 |
| 2 | 无 `<ElectricStepsBanner>` / `<WheelsBanner>` / `<ChassisBanner>` 入口卡片 | `/product` 入口页用 `<LightModMap>` 占位,无独立主题卡 | P2:三个 banner 组件 + 在入口 `<LightModMap>` 中替换 |
| 3 | 无对应 verify 脚本 | 图缺失时不会 fail build | P2:参照 `verify-zeekr-images.mjs` 加 `verify-accessories-images.mjs` |

### 10.2 flooring 缺口

| # | 问题 | 影响 | 建议方案 |
|---|---|---|---|
| 1 | `<FlooringTopicBanner>` **未在 `/product` 入口页渲染** | 入口页没有 flooring 直达入口,用户需滚动到 P1 折叠区发现 | 在 `<LightModMap>` 后或 `<P1ServiceCard>` 列表头部插入 `<FlooringTopicBanner />` |
| 2 | flooring mobile perf 59 / LCP 6.6s(全站最差) | 移动端体验差 | 16 张图转 webp + 关键图 `priority` + Gallery 懒加载验证 |
| 3 | 缺 CI 校验脚本 | 图片缺失或路径变更不会 fail build | 加 `scripts/verify-flooring-images.mjs`(检查 4 品牌 × 4 色 = 16 张图存在) |
| 4 | `mercedes-benz` / `denza` 不渲染 | 数据层含 5 个品牌,页面只展示 4 个 | 在数据层加注释说明,代码保持渲染过滤 |
| 5 | 颜色轮播客户端渲染 | 增加 JS bundle | 已不可避免(需 Carousel 状态),关注 bundle 大小 |

### 10.3 P1 planned 全部缺口

| # | 问题 | 影响 | 建议方案 |
|---|---|---|---|
| 1 | `floor-mats` / `business-comfort` / `skid-plate` 无 page.tsx | 链接到这些 slug 全部 404 | P1 优先:`business-comfort` 聚合页;`skid-plate` 可并入 `/product/chassis#skid-plate` 锚点;`floor-mats` 单独建页 |
| 2 | `business-comfort` 聚合内容未规划 | 涵盖小桌板/后排娱乐/氛围灯/腿托,需业务确认范围 | 写 `BUSINESS_COMFORT_PRD_2026-06-XX.md`,再实现 |

### 10.4 数据一致性

- `src/lib/products.ts` 中 `serviceGuarantee` 字段对 light_mod 暂未使用(只 film 类用)— 不影响 P0 共享页,但 PRD §3.1 提到"P0 共享页共用施工保障"未落地
- `PRODUCT_ICON_MAP` 已映射 `electric-steps` / `wheels` / `chassis` 3 个图标(`Footprints` / `CircleDot` / `Wrench`),但 `<ProductDetail>` 当前未消费此映射

### 10.5 与 PRD 已知差异

- **PRD §2.1 "页面私有操作取消"** vs **当前实现**:3 个 P0 共享页与 flooring 都无 PhoneCta(✅ 一致)
- **PRD §3.1 "4 步流程模板"** vs **当前实现**:P0 共享页走 `PROCESS_TEMPLATE`(4 步),flooring 走内联自定义 4 步(车型确认/款式选择/安装评估/施工交付)— 不一致但合理(flooring 4 步更贴合业务)
- **PRD §6.7 "P1 验收"** vs **当前实现**:P1 PRD 提到"统一 4 卖点"已被 flooring 改写为"7 卖点 + 5 结构 + 4 品牌区"的更丰富结构

---

## 11. 变更历史

| 日期 | 版本 | 变更 | 关联 PRD |
|---|---|---|---|
| 2026-06-06 | v1 | 3 个 P0 共享页初版(electric-steps/wheels/chassis) | ELECTRIC_STEPS / WHEELS / CHASSIS_PRD |
| 2026-06-13 | v1 | flooring 专题页初版(基于 manifest.json v1) | FLOORING_TOPIC_PRD |
| 2026-06-20 | v1.1 | 3 个 P0 共享页文案对齐 `products.ts`,统一 4 步流程 | — |
| 2026-06-25 | v1.2 | 路由注册表统一;flooring 注册为 `practical_accessory` 组;P1 planned 3 项占位 | PRODUCT_ROUTE_ARCHITECTURE / P1_SERVICE_PROJECTS |

---

## 12. 附录:关键文件清单

| 文件 | 角色 | 行数 |
|---|---|---:|
| `src/app/product/electric-steps/page.tsx` | P0 共享页(电踏) | 17 |
| `src/app/product/wheels/page.tsx` | P0 共享页(轮毂) | 17 |
| `src/app/product/chassis/page.tsx` | P0 共享页(底盘) | 17 |
| `src/app/product/flooring/page.tsx` | P1 自定义页(地板) | 223 |
| `src/components/ProductDetail.tsx` | 6 产品线共享渲染器 | 470 |
| `src/components/product/FlooringFeatureGrid.tsx` | 7 卖点 grid | ~70 |
| `src/components/product/FlooringStructureGrid.tsx` | 5 结构 grid | ~50 |
| `src/components/product/FlooringVehicleGroup.tsx` | 品牌车型组(client) | ~187 |
| `src/components/product/FlooringGallery.tsx` | 16 张图库 | ~66 |
| `src/components/product/FlooringTopicBanner.tsx` | 入口卡片(未启用) | ~57 |
| `src/lib/products.ts` | 共享 Product 数据源 | 585 |
| `src/lib/flooring-products.ts` | flooring 专题数据源 | 491 |
| `src/lib/product-routes.ts` | 路由注册表(7 非膜服务) | 125 |

---

> 最后更新: 2026-06-25(基于实际代码核验,与 product-routes.ts / products.ts / flooring-products.ts 保持一致)
