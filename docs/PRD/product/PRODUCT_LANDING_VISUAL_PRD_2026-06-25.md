# 产品中心入口页视觉与移动端规范 PRD v3

> 本文是 `/product` 产品中心入口页的 **v3 视觉 + 移动端** 升级 PRD。
> v2 ([PRODUCT_INDEX_PRD_2026-06-25.md](./PRODUCT_INDEX_PRD_2026-06-25.md)) 已落地"按项目找 + 按车型找"双入口的内容架构，路由骨架已落地（24 个新路由 + 11 个 legacy redirect）。
> **v3 专门解决 4 个 v1/v2 残留问题**：(1) 首屏不够"汽车轻改"；(2) 三大业务分类视觉表达弱；(3) 视觉太像卡片数据库；(4) 移动端太长。

---

## 1. 概述

| 项目 | 内容 |
|---|---|
| 页面 | `/product` |
| 页面类型 | Product Index / 产品中心聚合入口（v3 视觉与移动端升级） |
| 版本 | v3 |
| 状态 | 待实现 |
| 编写日期 | 2026-06-25 |
| Owner | 蓝辉轻改 |
| 上一版本 | v2 [PRODUCT_INDEX_PRD_2026-06-25.md](./PRODUCT_INDEX_PRD_2026-06-25.md)（内容架构） |
| 上位规范 | [PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md](./PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md) v0.1 |
| 关联设计草稿 | `/tmp/wde-artifacts/product-v1.html` (webdesign-engineer v1 探索稿) |
| 关联 registry | `src/lib/product-routes.ts` (已落地) |

### 1.1 背景与问题陈述

| # | 问题 | 用户原话 | 根因 |
|---|---|---|---|
| P1 | 首屏不够"汽车轻改" | "深色网格 + 大标题… 新能源车主第一眼看不出'这是为我的车做方案的地方'" | Hero 缺汽车视觉、车辆剪影、材质切片、车型方案地图 |
| P2 | 三大业务分类不够突出 | "车膜 / 轻改装 / 车型专题三大分类在后面才出现" | 双入口是导航分类，不是视觉地图；首屏下方应该直接做"三大产品地图" |
| P3 | 视觉太像卡片数据库 | "车型区、项目区、P1 区全部是同一种深色卡片" | 三个区域没做视觉差异化：膜片/金属/品牌矩阵 |
| P4 | 移动端太长 | "390px 下卡片一张张堆下来… 用户可能读不到后半段" | 无 sticky tab 切换；P1 项目全展开 |

### 1.2 目标

1. **首屏必须有"汽车感"** — 车辆剪影 / 局部 + 车膜/轮毂/踏板/底盘护板材质切片 + "车型方案地图" 11 品牌色块矩阵。
2. **三大业务地图视觉差异化** — 车膜 = 半透明膜片 + 光线 + 玻璃质感；轻改装 = 金属 + 结构线 + 安装位；车型专题 = 车主视角 + 品牌车型矩阵。
3. **移动端 ≤ 768px 不再"卡片长龙"** — 顶部 sticky tab 切三段（按车型 / 按项目 / 组合），P1 项目默认折叠只展示前 4 个。
4. **补充视觉模块** — 车型方案地图、推荐组合（4 个场景）、FAQ 折叠列表。

### 1.3 范围

- ✅ 包含：Hero 视觉重构、三大业务地图视觉差异化、车型方案地图、推荐组合、FAQ、移动端 sticky tab、P1 折叠
- ✅ 包含：复用 `product-routes.ts` 路由注册表 + `BrandPlaceholder` 占位风格保持一致
- ❌ 不包含：内容架构调整（v2 已稳定不动）、路由新增（24 个新路由已落地）、单车型页改版
- ❌ 不包含：UI 之外的 SEO/埋点/合规大改（沿用 v2 §9-10）

### 1.4 非目标

- 暂不做电商 SKU / 价格体系。
- 暂不实现车型页项目对比表。
- 暂不做用户登录 / 个性化推荐。

---

## 2. 用户故事

| 用户 | 场景 | 页面应该怎么回应 | 优先级 |
|---|---|---|---|
| 明确车型车主 | "我是问界 M8，想看看能做什么" | 在"按车型找"区看到问界 → 11 品牌矩阵点入 → 车型方案 | P0 |
| 明确项目车主 | "我想贴窗膜 / 车衣" | 在"按项目找"区看到 P0 三大地图 → 选车膜地图 → 进入 /product/window-film | P0 |
| 视觉导向车主 | 首屏就被车辆剪影+材质切片吸引 | Hero 车辆剪影 + 4 材质切片 + 11 品牌矩阵 hover | P0 |
| 移动端用户 | 390px 视口浏览 | sticky tab 切三段，滚动可控 | P0 |
| 商务车车主 | 想了解商务舒适升级 | 在"按项目"段或"组合"段看到商务舒适升级 | P1 |
| 比较型用户 | "小米 YU7 和问界 M8 区别" | 从品牌矩阵进入各车型方案（不在入口页展开细节） | P1 |

---

## 3. 功能清单

| # | 功能 | 优先级 | 状态 | 关联组件 |
|---|---|---|---|---|
| F1 | Hero 重构（汽车视觉） | P0 | ⚪ | `<ProductHero>` `<VehicleSilhouette>` `<MaterialSlice>` `<BrandMatrixMap>` |
| F2 | 车膜业务地图（cyan 主题） | P0 | ⚪ | `<FilmServiceMap>` |
| F3 | 轻改装业务地图（orange 主题） | P0 | ⚪ | `<LightModMap>` |
| F4 | 车型专题业务地图（violet 主题） | P0 | ⚪ | `<VehicleTopicMap>` |
| F5 | 推荐组合（4 个场景） | P1 | ⚪ | `<RecommendationCombos>` |
| F6 | FAQ 折叠列表 | P1 | ⚪ | `<ProductFAQ>` |
| F7 | 移动端 sticky tab（3 段切换） | P0 | ⚪ | `<StickyTabBar>` |
| F8 | P1 项目折叠（前 4 个 + 展开） | P0 | ⚪ | `<CollapsibleSection>` |
| F9 | 三视口响应式 | P0 | ⚪ | `md:` `lg:` 断点 |
| F10 | JSON-LD CollectionPage + ItemList | P1 | ⚪ | 沿用 v2 §9 |

---

## 4. UI / 交互

### 4.1 视觉规范（design tokens）

继承 v1 design tokens（`/tmp/wde-artifacts/product-v1.html`）：

```css
:root {
  --ink: #fafafa;
  --canvas: #09090b;
  --surface-1: #18181b;
  --surface-2: #27272a;
  --surface-3: #3f3f46;
  --border-soft: rgba(255,255,255,0.08);
  --border-strong: rgba(255,255,255,0.16);
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  --accent-primary: #f97316;       /* orange-500 */
  --accent-secondary: #60a5fa;     /* blue-400 */

  /* 三大业务分类色（v3 新增） */
  --cat-film: #22d3ee;             /* cyan-400   — 车膜 */
  --cat-light: #fb923c;            /* orange-400 — 轻改装 */
  --cat-topic: #a78bfa;            /* violet-400 — 车型专题 */

  /* 11 品牌色 — 沿用 product-routes.ts accentColor */
  --brand-wenjie:  #22d3ee;
  --brand-xiaomi:  #fb923c;
  --brand-zeekr:   #fb923c;
  --brand-li-auto: #fbbf24;
  --brand-tesla:   #f87171;
  --brand-xpeng:   #34d399;
  --brand-denza:   #f472b6;
  --brand-voyah:   #c084fc;
  --brand-ledao:   #60a5fa;
  --brand-gaoshan: #2dd4bf;
  --brand-zhijie:  #fbbf24;

  --status-live:    #34d399;       /* emerald-400 */
  --status-planned: #fbbf24;       /* amber-400 */
}
```

- **字体**：Geist Sans（沿用主站）
- **背景**：zinc-950 / 900 / 800（zinc 三阶 + 透明度叠加）
- **圆角**：`--r-md: 0.5rem` / `--r-lg: 0.75rem` / `--r-xl: 1rem` / `--r-2xl: 1.5rem`
- **缓动**：`--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)`
- **anti-cliché**：不用紫色渐变、Inter 字体、emoji 滥用、CSS silhouette 偷懒

### 4.2 Hero 视觉规范（核心：解决 P1）

#### 4.2.1 必含元素

| 元素 | 实现 | 备注 |
|---|---|---|
| 车辆侧影 | `<VehicleSilhouette>` SVG inline | 新能源 SUV 侧视，金属漆面高光，避免 emoji |
| 4 材质切片 | `<MaterialSlice>` × 4 | 车衣（半透明反光）、窗膜（光线透射）、轮毂（金属结构线）、踏板（安装位） |
| 11 品牌矩阵 | `<BrandMatrixMap>` | 11 个 brand 色块，hover 高亮 + 品牌名浮现，**click 进入品牌页** |
| H1 | `<h1>产品中心</h1>` | 大字号，zinc-50 |
| 副标题 | "按车型找方案，按项目看服务" | zinc-400 |

#### 4.2.2 排版规则

| 视口 | Hero 布局 |
|---|---|
| Desktop ≥ 1024px | 左侧 60% 车辆剪影 + 4 材质切片，右侧 40% 文案 + 11 品牌矩阵 |
| Tablet 768-1023px | 顶部车辆剪影横排（高度 240px），下方文案 + 11 品牌矩阵（3 列） |
| Mobile < 768px | 顶部车辆剪影（高度 180px）+ 4 材质切片缩略横排 + 文案 + 11 品牌矩阵（2 列） |

#### 4.2.3 anti-cliché 检查

- ❌ 不用 emoji 替代车辆剪影
- ❌ 不用紫色 / 粉红渐变
- ❌ 不用 Inter 字体（已用 Geist Sans）
- ❌ 不用"豪华""尊享"等夸张词
- ✅ 4 材质切片是真实质感，不是 CSS 偷懒 gradient

### 4.3 三大业务地图视觉差异化（核心：解决 P3）

#### 4.3.1 车膜业务地图 `<FilmServiceMap>`（cyan 主题）

| 维度 | 规则 |
|---|---|
| 背景 | `linear-gradient(135deg, cyan-400/10 0%, transparent 60%)` + backdrop-blur-md |
| 卡片风格 | 半透明膜片（border cyan-800/50，bg cyan-950/20） |
| 视觉纹理 | 内嵌 4-6 条 `linear-gradient(to right, transparent, cyan-400/8, transparent)` 模拟光透射 |
| Hover 动效 | 整卡片 `backdrop-blur-xl` + 1.02 scale，200ms ease-out-expo |
| 内容密度 | 紧凑网格 3 列（车衣 / 窗膜 / 改色膜 + 套餐卡） |
| 包含项目 | PPF / Window Film / Color Film（3 个 P0 live） |

#### 4.3.2 轻改装业务地图 `<LightModMap>`（orange 主题）

| 维度 | 规则 |
|---|---|
| 背景 | `repeating-linear-gradient(45deg, orange-500/3 0 1px, transparent 1px 12px)` 模拟金属拉丝 |
| 卡片风格 | 厚边框（border-2 border-orange-700/40）+ 内阴影 `inset 0 2px 8px rgba(0,0,0,0.3)` |
| 视觉纹理 | 圆角矩形（rounded-2xl）+ 螺丝孔点装饰（4 角 4px 圆点） |
| Hover 动效 | 边框颜色由 orange-700/40 → orange-500，金属反光扫过（`bg-gradient-to-r` 200ms） |
| 内容密度 | 大图少卡片（2 列，每张含安装位示意图） |
| 包含项目 | Electric Steps / Wheels / Chassis（3 个 P0 live） |

#### 4.3.3 车型专题业务地图 `<VehicleTopicMap>`（violet 主题）

| 维度 | 规则 |
|---|---|
| 背景 | `radial-gradient(circle at 20% 30%, violet-500/8 0%, transparent 50%)` |
| 卡片风格 | 品牌色块矩阵（11 个 brand，rounded-xl，每个独立色） |
| 视觉纹理 | 矩阵网格 + 品牌 hover 时小色块放大 1.1 |
| Hover 动效 | 色块放大 + 品牌名浮现（opacity 0→1，150ms） |
| 内容密度 | 11 品牌矩阵 4-6 列 + 重点品牌 3 个（wenjie / xiaomi / zeekr）放大显示 |
| 文案视角 | "我是 [品牌] 车主" 第一人称（"我开问界 M8"、"我是小米 YU7 车主"） |
| 包含项目 | 11 品牌 + 13 车型（live + planned） |

#### 4.3.4 三大地图对比

| 维度 | 车膜 | 轻改装 | 车型专题 |
|---|---|---|---|
| 主色 | cyan-400 | orange-400 | violet-400 |
| 背景纹理 | 半透明光透射 | 金属拉丝 | 径向辉光 |
| 卡片风格 | backdrop-blur 膜片 | 厚边框金属 | 品牌色块矩阵 |
| Hover 动效 | 1.02 scale + blur | 边框变色 + 金属扫光 | 色块放大 + 文案浮现 |
| 内容密度 | 高（3 列紧凑） | 中（2 列大图） | 矩阵 + 重点放大 |
| 视角 | 项目 | 项目 | 车主 |

### 4.4 移动端 sticky tab + 三段切换（核心：解决 P4）

#### 4.4.1 组件规范 `<StickyTabBar>`

| 属性 | 值 |
|---|---|
| 显示条件 | `viewport < 768px` |
| 高度 | 56px |
| 位置 | `position: sticky; top: 64px`（Header 64px 之下） |
| z-index | z-50 |
| 背景 | `zinc-950/80 backdrop-blur-md` |
| Tab 数 | 3（按车型 / 按项目 / 组合） |
| Active 标识 | 下划线 4px，对应业务色（film/cyan、light/orange、topic/violet） |
| 状态 | useState 本地，不持久化 |

#### 4.4.2 三段内容切换

| Tab | 显示内容 |
|---|---|
| 按车型 | `<VehicleTopicMap>` 的 11 品牌矩阵（前 6 品牌 + "查看全部"按钮） |
| 按项目 | `<FilmServiceMap>` + `<LightModMap>` + P1 折叠区 |
| 组合 | `<RecommendationCombos>` 4 个组合 |

#### 4.4.3 桌面端行为

- 视口 ≥ 768px 不显示 sticky tab
- 沿用 v2 的滚动结构（Hero → 按车型找 → 按项目找 → 推荐组合）

### 4.5 P1 项目折叠（核心：解决 P4）

#### 4.5.1 组件规范 `<CollapsibleSection>`

| 属性 | 值 |
|---|---|
| 触发条件 | `viewport < 768px` + P1 项目区 |
| 默认状态 | 折叠（只显示前 4 个） |
| 展开按钮 | "展开更多（+N）" / "收起" |
| 动效 | height 0→auto + opacity，250ms ease-out-expo |
| 状态 | useState 纯前端，刷新后恢复默认 |

#### 4.5.2 桌面端

- 视口 ≥ 768px 不折叠
- 全部 P1 项目平铺

### 4.6 组件清单

| 组件 | 路径 | 类型 | 说明 |
|---|---|---|---|
| `<ProductHero>` | `src/components/product/ProductHero.tsx` | RSC | Hero 容器（车剪影 + 材质切片 + 品牌矩阵 + 文案） |
| `<VehicleSilhouette>` | `src/components/product/VehicleSilhouette.tsx` | RSC | SVG inline 车辆侧影 |
| `<MaterialSlice>` | `src/components/product/MaterialSlice.tsx` | RSC | 4 材质切片（车衣/窗膜/轮毂/踏板） |
| `<BrandMatrixMap>` | `src/components/product/BrandMatrixMap.tsx` | "use client" | 11 品牌色块矩阵（hover 互动 + click 入页） |
| `<FilmServiceMap>` | `src/components/product/FilmServiceMap.tsx` | RSC | 车膜业务地图（cyan 主题） |
| `<LightModMap>` | `src/components/product/LightModMap.tsx` | RSC | 轻改装业务地图（orange 主题） |
| `<VehicleTopicMap>` | `src/components/product/VehicleTopicMap.tsx` | RSC | 车型专题业务地图（violet 主题） |
| `<StickyTabBar>` | `src/components/product/StickyTabBar.tsx` | "use client" | 移动端 sticky tab（3 段切换） |
| `<CollapsibleSection>` | `src/components/product/CollapsibleSection.tsx` | "use client" | P1 项目折叠（useState） |
| `<RecommendationCombos>` | `src/components/product/RecommendationCombos.tsx` | RSC | 4 个推荐组合 |
| `<ProductFAQ>` | `src/components/product/ProductFAQ.tsx` | RSC | FAQ 折叠列表（沿用 shadcn Accordion） |
| `<ProductIndexPage>` | `src/app/product/page.tsx` | RSC | 改写入口页，组合上述组件 |

### 4.7 响应式规范

| 视口 | 行为 |
|---|---|
| Desktop ≥ 1024px | Hero 横排（60/40 分割），三大地图全宽，P1 不折叠，sticky tab 不显示 |
| Tablet 768-1023px | Hero 上下结构（车剪影 + 文案），三大地图 2 列，P1 不折叠，sticky tab 不显示 |
| Mobile < 768px | Hero 缩略（180px 车剪影），sticky tab 显示，P1 折叠前 4 个，组合区紧凑 |

### 4.8 交互细节

| 元素 | 行为 |
|---|---|
| 11 品牌矩阵 hover | 色块放大 1.1 + 品牌名浮现 150ms |
| 4 材质切片 hover | 整卡片 scale 1.02 + 阴影加深 |
| 车膜/轻改装地图卡片 click | 跳转服务项目页（如 /product/ppf） |
| 品牌矩阵 click | 跳转品牌页（如 /product/wenjie） |
| Sticky tab 切换 | 平滑滚动到对应 section（scrollIntoView smooth） |
| P1 展开/折叠 | 250ms ease-out-expo 高度动画 |
| FAQ 展开 | 沿用 shadcn Accordion 标准交互 |

---

## 5. 数据模型

### 5.1 复用（已落地）

- `src/lib/product-routes.ts` 全部导出
- `ALL_BRANDS`, `ALL_MODELS`, `ALL_SERVICES`
- `getLiveBrands`, `getLiveServices`, `getModelsByBrand`

### 5.2 新增（v3）

```ts
// src/lib/product-landing.ts (新建)

export type ProductComboSlug =
  | "new-car-protection"      // 新车基础保护
  | "business-comfort"        // 商务舒适升级
  | "appearance-stance"       // 外观姿态升级
  | "daily-protection";       // 日常实用防护

export type ProductCombo = {
  slug: ProductComboSlug;
  title: string;
  description: string;
  iconKey: "shield" | "sofa" | "sparkles" | "wrench";
  includes: readonly string[];      // serviceSlugs (e.g. ["ppf","window-film"])
  suitableFor: readonly string[];   // brandSlugs (e.g. ["wenjie","xiaomi"])
};

export type ProductFAQ = {
  question: string;
  answer: string;
  category: "general" | "service" | "vehicle" | "compliance";
};

export const COMBOS: readonly ProductCombo[] = [
  {
    slug: "new-car-protection",
    title: "新车基础保护",
    description: "刚提新能源车的优先级：漆面 / 玻璃 / 底盘 / 脚垫 一次到位",
    iconKey: "shield",
    includes: ["ppf", "window-film", "floor-mats", "skid-plate"],
    suitableFor: ["xiaomi", "wenjie", "zeekr"],
  },
  {
    slug: "business-comfort",
    title: "商务舒适升级",
    description: "MPV / 大六座 SUV 后排体验升级",
    iconKey: "sofa",
    includes: ["flooring", "business-comfort"],
    suitableFor: ["voyah", "denza", "gaoshan", "wenjie"],
  },
  {
    slug: "appearance-stance",
    title: "外观姿态升级",
    description: "改色 / 轮毂 / 包围 组合表达",
    iconKey: "sparkles",
    includes: ["color-film", "wheels", "chassis"],
    suitableFor: ["xiaomi", "zeekr", "xpeng"],
  },
  {
    slug: "daily-protection",
    title: "日常实用防护",
    description: "家用通勤常用小配件集合",
    iconKey: "wrench",
    includes: ["floor-mats", "skid-plate"],
    suitableFor: ["li-auto", "tesla", "ledao", "zhijie"],
  },
] as const;

export const FAQS: readonly ProductFAQ[] = [
  {
    question: "项目到店都做吗？需要预约吗？",
    answer: "建议提前到店或线上沟通车型与年款，确认方案后再约施工时间。",
    category: "general",
  },
  {
    question: "施工会影响原车质保吗？",
    answer: "具体项目需结合车型年款与原车结构确认；优先选择不破坏原车结构的安装方式。",
    category: "compliance",
  },
  {
    question: "所有车型都能做吗？",
    answer: "我们已为问界 / 小米 / 极氪 / 理想等主流新能源车型整理方案；其他车型可到店沟通。",
    category: "vehicle",
  },
  {
    question: "项目组合有套餐价吗？",
    answer: "我们按项目独立报价，组合方案提供整体优惠；具体以到店沟通为准。",
    category: "service",
  },
  {
    question: "施工周期一般多长？",
    answer: "不同项目差异较大：贴膜类通常 1-2 天，电动踏板安装约 3-4 小时，轮毂升级 1 天。",
    category: "service",
  },
] as const;
```

### 5.3 组件 Props 约定

```ts
type ProductHeroProps = {
  liveBrands: readonly VehicleBrandRoute[];
};

type FilmServiceMapProps = {
  services: readonly ServiceRoute[];   // group === "film" 过滤后
};

type LightModMapProps = {
  services: readonly ServiceRoute[];   // group === "light_mod" 过滤后
};

type VehicleTopicMapProps = {
  brands: readonly VehicleBrandRoute[];
};

type CollapsibleSectionProps = {
  defaultExpanded?: boolean;
  maxVisible?: number;       // 默认 4
  children: React.ReactNode;
  triggerLabel?: (visible: number, total: number) => string;
};

type StickyTabBarProps = {
  tabs: readonly { id: string; label: string; color: string }[];
  activeTab: string;
  onChange: (id: string) => void;
};
```

---

## 6. API 接口

| Method | 路径 | 用途 | 状态 |
|---|---|---|---|
| — | — | 此页面无新增 API | 沿用 v2 |

- 复用 `/api/analytics/track`（埋点）
- 复用 `/api/stores`（不修改）

---

## 7. 验收标准（DoD）

### 7.1 视觉

- [ ] Hero 含车辆剪影（SVG inline，金属漆面高光）+ 4 材质切片 + 11 品牌矩阵
- [ ] 三大业务地图视觉差异化（背景纹理 / 卡片风格 / hover 动效 / 内容密度全部不同）
- [ ] 配色与 design tokens 完全对齐（无 hardcode 色值）
- [ ] 无 anti-cliché（不用紫色渐变、Inter、emoji 滥用）
- [ ] 11 品牌矩阵每个色块 hover 时品牌名浮现，click 进入品牌页

### 7.2 移动端（核心）

- [ ] 390px 视口下 sticky tab 显示（Header 之下 64px 位置）
- [ ] sticky tab 切三段（按车型 / 按项目 / 组合）行为正确
- [ ] P1 项目默认折叠前 4 个
- [ ] "展开更多（+N）" / "收起" 按钮可用
- [ ] 展开/折叠动效 < 300ms
- [ ] 390px 下无横向滚动
- [ ] 移动端 Hero 简化为 180px 车辆剪影

### 7.3 性能

- [ ] LCP < 3s（desktop 1440px）/ < 4s（mobile 390px）
- [ ] CLS = 0
- [ ] 图片 aspect-ratio 统一 4/3
- [ ] 车辆剪影是 SVG inline（不引入额外 HTTP 请求）

### 7.4 质量门

- [ ] `npx tsc --noEmit` 通过（不计已存在的 13 个 pre-existing 错误）
- [ ] `npm run build` 通过（不计 news/[slug] pre-existing bug）
- [ ] `npx vitest run` 通过
- [ ] Playwright e2e 截图：desktop 1440px / tablet 768px / mobile 390px 三视口 OK
- [ ] Playwright 交互测试：sticky tab 切换、P1 展开/折叠、品牌矩阵 hover 正确

### 7.5 合规

- [ ] 不出现"官方授权""100% 无损""不影响质保""原厂认证""全网最低""绝对安全"等禁止词
- [ ] 文案统一"以到店沟通为准"
- [ ] 借用车企商标时仅作为车型识别（不暗示品牌合作）

### 7.6 SEO

- [ ] title：`产品中心｜蓝辉轻改 LANHUI`
- [ ] description：含"按车型找方案，按项目看服务"语义
- [ ] H1：产品中心
- [ ] H2：按车型找方案 / 按项目看服务 / 热门升级组合
- [ ] JSON-LD：`CollectionPage` + `ItemList` 含所有 live 品牌/服务
- [ ] 11 品牌矩阵每个色块是 `<Link>`（非 `<div>`），保证 SEO 抓取

### 7.7 埋点

- [ ] `product_index_view` 触发
- [ ] `product_hero_brand_matrix_click` 触发（带 brandSlug）
- [ ] `product_sticky_tab_change` 触发（带 tab id）
- [ ] `product_p1_expand_click` 触发（带 expanded boolean）
- [ ] `product_combo_click` 触发（带 comboSlug）

---

## 8. 变更记录

| 日期 | 版本 | 说明 | 作者 |
|---|---|---|---|
| 2026-06-25 | v3 | 新建产品中心入口页视觉与移动端规范 PRD；补齐 Hero 汽车视觉、三大业务地图视觉差异化、移动端 sticky tab + P1 折叠、推荐组合、FAQ。 | Coya |

---

## 附录 A：视觉参考

- v1 design tokens 探索稿：`/tmp/wde-artifacts/product-v1.html`（webdesign-engineer 8 步流程产出）
- 11 品牌色严格对齐 `src/lib/product-routes.ts` `AccentColor` 类型
- 三大业务色固定：`--cat-film: #22d3ee` / `--cat-light: #fb923c` / `--cat-topic: #a78bfa`

## 附录 B：关联文档

| 文档 | 说明 |
|---|---|
| [PRODUCT_INDEX_PRD_2026-06-25.md](./PRODUCT_INDEX_PRD_2026-06-25.md) v2 | 内容架构基础（双入口、P0/P1 项目、品牌车型列表） |
| [PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md](./PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md) v0.1 | 路由总纲（11 品牌 / 13 车型 / 10 服务） |
| [P1_SERVICE_PROJECTS_PRD_2026-06-25.md](./P1_SERVICE_PROJECTS_PRD_2026-06-25.md) | P1 项目服务规划 |
| `src/lib/product-routes.ts` | 路由注册表（已落地） |
| `src/components/product/BrandPlaceholder.tsx` | 占位风格保持一致 |
| `/tmp/wde-artifacts/product-v1.html` | v1 视觉探索稿 |
| [../../ARCHITECTURE.md](../../ARCHITECTURE.md) | 工程架构 |

## 附录 C：实现优先级与拆分建议

| 阶段 | 内容 | 估计工作量 |
|---|---|---|
| Phase 1 | `<ProductHero>` + `<VehicleSilhouette>` + `<MaterialSlice>` + `<BrandMatrixMap>` | 1.5 天 |
| Phase 2 | `<FilmServiceMap>` + `<LightModMap>` + `<VehicleTopicMap>` | 1.5 天 |
| Phase 3 | `<StickyTabBar>` + `<CollapsibleSection>` 移动端交互 | 1 天 |
| Phase 4 | `<RecommendationCombos>` + `<ProductFAQ>` + `/product/page.tsx` 整合 | 1 天 |
| Phase 5 | 三视口截图 + 交互测试 + 性能验证 + 合规检查 | 0.5 天 |
| 总计 | 5 个子任务 | **5.5 工作日** |

每个 Phase 单独 commit + RED→GREEN→回归→build 验证。
