# SPEC: 产品中心入口页 Product Index

> 对应 PRD(分层):
> - 内容架构 v2:[`PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md`](../../../PRD/product/PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md)
> - 双入口结构 v2:[`PRODUCT_INDEX_PRD_2026-06-25.md`](../../../PRD/product/PRODUCT_INDEX_PRD_2026-06-25.md)
> - P1 项目规划:[`P1_SERVICE_PROJECTS_PRD_2026-06-25.md`](../../../PRD/product/P1_SERVICE_PROJECTS_PRD_2026-06-25.md)
> - 视觉与移动端 v3:[`PRODUCT_LANDING_VISUAL_PRD_2026-06-25.md`](../../../PRD/product/PRODUCT_LANDING_VISUAL_PRD_2026-06-25.md)
> - 历史基线 v1:[`PRODUCT_INDEX_PRD_2026-06-20.md`](../../../PRD/product/PRODUCT_INDEX_PRD_2026-06-20.md)
>
> 组件契约:[`components/topic-pattern.md`](../../components/topic-pattern.md) §3.1
> 实现状态:✅ **v3 视觉 + 移动端 sticky tab + 三大业务地图 + FAQ + 推荐组合 + P1 折叠 全部落地(2026-06-25 完整 batch)**
> 入口页 `src/app/product/page.tsx` 直接使用 9 个本地组件 + 1 个 route registry,无遗留 v1/v2 元素。

---

## 1. 职责范围

`/product` 是产品中心聚合入口,承接两类用户:

1. **按车型找**:已知道自己开什么车(小米 / 问界 / 极氪…),想看这台车能做什么。
2. **按项目找**:已知道想做什么(车衣 / 窗膜 / 电动踏板 / 轮毂…),想看项目介绍和施工。

页面只做内容展示、项目解释、车型/项目路由分流和 SEO 内链。**不在产品页内设置任何页面私有操作**(按钮、弹窗、点击埋点之外的操作文案),需要沟通时由首页或全站 Header / Footer 入口承接。

下游页面类型(全部在 `/product/*` 命名空间下):

| 页面类型 | Canonical Route 模式 | 数量 | 对应 SPEC |
|---|---|---:|---|
| 产品中心入口 | `/product` | 1 | 本文档 |
| 服务项目页 | `/product/{serviceSlug}` | 6 (P0) + P1 候选 | [`product-film.md`](./product-film.md)、[`product-accessories.md`](./product-accessories.md) |
| 品牌专题页 | `/product/{brandSlug}` | 11 (含 planned) | [`product-topics.md`](./product-topics.md) |
| 单车型专题页 | `/product/{brandSlug}/{modelSlug}` | 13 (含 planned) | [`product-topics.md`](./product-topics.md) |
| 套餐详情子页 | `/product/{serviceSlug}/{packageSlug}` | ≥ 3 (仅窗膜) | [`product-film.md`](./product-film.md) |

---

## 2. 路由

| 路径 | 类型 | 状态 | 说明 |
|---|---|---|---|
| `/product` | page (RSC) | 🔧 v2 落地 / v3 视觉升级中 | 产品中心入口,双入口 + 三大业务地图 |

### 2.1 页面私有操作取消规则(强约束)

`/product` 不允许出现:

- 单独设计的引导按钮、弹窗或下行动作;
- 项目卡片的"立即咨询 / 在线报价"等按钮;
- 推荐组合的"加入方案"等私有承接逻辑;
- 单车型页以外的车型级内联操作。

需要沟通时统一通过:

- 首页 Hero / WeChatConsultModal;
- 全站 Header / Footer;
- 已有 `/contact` 联系页。

### 2.2 页面模块结构

```text
/product
├── 00 Hero:产品中心一句话 + 双入口 CTA(滚动到对应锚点)
├── 01 双入口选择区:按车型找 / 按项目找
├── 02 车型方案地图(11 品牌矩阵)<BrandMatrixMap>
├── 03 车膜业务地图(cyan 主题)<FilmServiceMap>  → 3 膜类服务
├── 04 轻改装业务地图(orange 主题)<LightModMap>  → 电动踏板 / 轮毂 / 底盘
├── 05 车型专题业务地图(violet 主题)<VehicleTopicMap>  → 11 品牌车型入口
├── 06 商务舒适升级聚合区(P1 候选)<BusinessComfortSection>
├── 07 推荐组合(4 场景)<RecommendationCombos>  → 新车保护 / 商务 / 外观 / 实用
├── 08 P1 项目折叠列表(前 4 + 展开)<CollapsibleSection>
├── 09 FAQ< ProductFAQ>
├── 10 移动端 StickyTabBar(3 段切换:按车型 / 按项目 / 组合)
└── 11 SEO:JSON-LD CollectionPage + ItemList
```

---

## 3. 功能清单

| # | 功能 | 优先级 | 状态 | 关联组件 |
|---:|---|---|---|---|
| F1 | Hero:产品中心 H1 + 副标题 + 双入口锚点 | P0 | ✅ v3 落地(`<ProductHero>`) | `<ProductHero>` |
| F2 | 双入口选择区(2 大卡片,滚动到对应 section) | P0 | ✅ v3 落地(整合在 ProductHero) | `<ProductHero>` |
| F3 | 11 品牌矩阵(每个品牌:色块 + 名称 + 车型数 + hover 预览) | P0 | ✅ v3 落地 | `<BrandMatrixMap>` |
| F4 | 车膜业务地图(cyan 主题) | P0 | ✅ v3 落地 | `<FilmServiceMap>` |
| F5 | 轻改装业务地图(orange 主题) | P0 | ✅ v3 落地 | `<LightModMap>` |
| F6 | 车型专题业务地图(violet 主题) | P0 | ✅ v3 落地 | `<VehicleTopicMap>` |
| F7 | 商务舒适升级聚合区(小桌板/腿托/后排娱乐/氛围灯/星空顶) | P1 | ⚪ P1 服务独立页 planned,移动端折叠区显示 P1ServiceCard 列表 | `<P1ServiceCard>` + `<CollapsibleSection>` |
| F8 | 推荐组合(4 场景) | P1 | ✅ v3 落地(桌面端显示,移动端在 sticky 3 段第 3 段) | `<RecommendationCombos>` |
| F9 | FAQ 折叠列表 | P1 | ✅ v3 落地(始终可见,不在 tab 内) | `<ProductFAQ>` |
| F10 | 移动端 StickyTabBar(3 段切换:按车型 / 按项目 / 组合) | P0 | ✅ v3 落地 | `<StickyTabBar>` + `<MobileProductContent>` |
| F11 | P1 项目折叠(默认前 3 个 + 展开) | P0 | ✅ v3 落地 | `<CollapsibleSection>` + `<P1ServiceCard>` |
| F12 | 三视口响应式(390 / 768 / 1024 / 1440) | P0 | ✅ | Tailwind 断点 |
| F13 | SEO metadata + JSON-LD CollectionPage + ItemList | P1 | ✅ | `generateMetadata` + inline `<script>` |
| F14 | 埋点(product_index_view / product_entry_tab_click / product_brand_click / product_model_click / product_service_click / product_combo_click) | P1 | ⚪ 部分挂载(PhoneCta 已埋点,6 类全事件未全量) | `src/lib/analytics.ts` |
| F15 | planned 状态展示(planned 车型/服务展示但不跳转死链) | P0 | ✅ | `<BrandPlaceholder>` |

### 3.1 实际页面结构(从 `src/app/product/page.tsx` 提取)

```text
<Header />
<main>
  <script type="application/ld+json">JSON-LD CollectionPage + ItemList</script>

  <ProductHero liveBrands plannedCount={ALL_SERVICES.length} />
    // 内部:VehicleSilhouette + MaterialSlice×4 + BrandMatrixMap(11 品牌)
    // + 文案(eyebrow + H1 + 副标题)

  <MobileProductContent tabs={mobileTabs}>  // 桌面端平铺,移动端 sticky 3 段
    <section id="vehicle-topics">
      <VehicleTopicMap brands={liveBrands} />  // 11 品牌矩阵(violet 主题)
    </section>

    <section id="service-projects">
      <FilmServiceMap services={filmServices} />  // 3 膜类(cyan)
      <LightModMap services={lightModServices} />  // 3 轻装(orange)
      <CollapsibleSection maxVisible={3}>        // P1 折叠(amber)
        {p1Services.map(s => <P1ServiceCard ... />)}
      </CollapsibleSection>
    </section>

    <RecommendationCombos />  // 4 推荐组合(在 tab 第 3 段)
  </MobileProductContent>

  <ProductFAQ />  // 始终可见,不在 tab 内
</main>
<Footer />
```

### 3.2 视觉与移动端 Sticky Tab 行为

| 视口 | 行为 |
|---|---|
| Desktop ≥ 768px | 三个 section 平铺显示(`#vehicle-topics` → `#service-projects` → `#recommendation`) |
| Mobile < 768px | `<StickyTabBar>` 顶部 3 段(按车型 / 按项目 / 组合),点击切换显示对应 section;`<ProductFAQ>` 始终在底部 |

### 3.3 Route Registry(`src/lib/product-routes.ts`,已落地)

11 BRANDS + 13 MODELS + 10 SERVICES,加 4 个 helpers:

- `getBrandRoute(brandSlug)` / `getModelRoute(brandSlug, modelSlug)` / `getServiceRoute(serviceSlug)`
- `getCanonicalFor(path)`(legacy alias → canonical 解析)
- `getModelsByBrand(brandSlug)` / `getLiveBrands()` / `getLiveServices()`

11 个 legacy alias(`MODELS.legacyPaths` 派生)用于 `next.config.ts` redirect 配置。

### 3.4 实际服务的 10 个 ServiceRoute

| Service Slug | Group | Status | Priority | Route |
|---|---|---|---|---|
| `ppf` | film | live | P0 | `/product/ppf` |
| `window-film` | film | live | P0 | `/product/window-film` |
| `color-film` | film | live | P0 | `/product/color-film` |
| `electric-steps` | light_mod | live | P0 | `/product/electric-steps` |
| `wheels` | light_mod | live | P0 | `/product/wheels` |
| `chassis` | light_mod | live | P0 | `/product/chassis` |
| `flooring` | practical_accessory | **live** | P1 | `/product/flooring` |
| `floor-mats` | practical_accessory | planned | P1 | `/product/floor-mats` |
| `business-comfort` | business_comfort | planned | P1 | `/product/business-comfort` |
| `skid-plate` | light_mod | planned | P1 | `/product/skid-plate` |

> 实际落地:`flooring` 已在 `live` 状态(Spec 之前误判为 planned)。

---

## 4. 数据模型

### 4.1 路由注册表(`src/lib/product-routes.ts`,已落地)

```typescript
type ProductRouteType =
  | "product_index"
  | "service_category"
  | "vehicle_brand"
  | "vehicle_model"
  | "package_detail";

type ProductRoute = {
  type: ProductRouteType;
  canonicalPath: string;
  legacyPaths?: string[];
  title: string;
  navLabel: string;
  parentPath?: string;
  status: "live" | "planned" | "content_only";
  priority: "P0" | "P1" | "P2";
};

type VehicleBrandRoute = ProductRoute & {
  type: "vehicle_brand";
  brandSlug: string;
  brandName: string;
  modelSlugs: string[];
  accentColor: string;  // 11 品牌色
};

type VehicleModelRoute = ProductRoute & {
  type: "vehicle_model";
  brandSlug: string;
  modelSlug: string;
  modelName: string;
  projectCount?: number;
  sourcePrd: string;
};
```

### 4.2 入口页数据契约(`/product` RSC 消费)

```typescript
type ProductIndexData = {
  brandCards: VehicleBrandRoute[];        // 11 品牌
  serviceCards: ServiceCard[];            // P0 + P1
  p1ServiceCards: ServiceCard[];          // planned / content_only
  recommendedCombos: RecommendedCombo[];  // 4 场景
  faqItems: FAQItem[];                    // ≥ 5 条
};

type ServiceCard = {
  slug: string;
  name: string;
  group: "film" | "light_mod" | "business_comfort" | "practical_accessory";
  priority: "P0" | "P1" | "P2";
  route?: string;
  status: "live" | "planned" | "content_only";
  description: string;
  relatedModels?: string[];
  accentColor: string;  // 业务地图色
};

type RecommendedCombo = {
  slug: string;
  name: string;
  scenario: string;
  projects: string[];  // 项目 slug 列表
  description: string;
};

type FAQItem = {
  question: string;
  answer: string;
};
```

### 4.3 11 品牌矩阵(从 product-routes.ts 提取)

| Brand Slug | Brand Name | 车型数 | 状态 | 主题色 | Canonical Route |
|---|---|---:|---|---|---|
| `wenjie` | 问界 | 3 (M6/M7/M8) | live | cyan-400 `#22d3ee` | `/product/wenjie` |
| `xiaomi` | 小米 | 2 (SU7/YU7) | live | orange-400 `#fb923c` | `/product/xiaomi` |
| `zeekr` | 极氪 | 1 (9X) | live | orange-400 `#fb923c` | `/product/zeekr` |
| `li-auto` | 理想 | 1 (i8) | planned | amber-400 `#fbbf24` | `/product/li-auto` |
| `tesla` | 特斯拉 | 待拆 | planned | red-400 `#f87171` | `/product/tesla` |
| `xpeng` | 小鹏 | 1 (GX) | planned | emerald-400 `#34d399` | `/product/xpeng` |
| `denza` | 腾势 | 1 (D9) | planned | pink-400 `#f472b6` | `/product/denza` |
| `voyah` | 岚图 | 1 (梦想家) | planned | purple-400 `#c084fc` | `/product/voyah` |
| `ledao` | 乐道 | 1 (L90) | planned | blue-400 `#60a5fa` | `/product/ledao` |
| `gaoshan` | 高山 | 1 (8) | planned | teal-400 `#2dd4bf` | `/product/gaoshan` |
| `zhijie` | 智界 | 1 (V9) | planned | amber-400 `#fbbf24` | `/product/zhijie` |

### 4.4 6 P0 服务项目(数据来自 `src/lib/products.ts`)

| Slug | Name | Group | 状态 | 主题色 | Route |
|---|---|---|---|---|---|
| `ppf` | 隐形车衣 / 车衣 | film | live | orange-400 | `/product/ppf` |
| `window-film` | 汽车窗膜 / 隔热膜 | film | live + 子页 | orange-400 | `/product/window-film` |
| `color-film` | 改色膜 | film | live | orange-400 | `/product/color-film` |
| `electric-steps` | 电动踏板 | light_mod | live | blue-500 | `/product/electric-steps` |
| `wheels` | 轮毂升级 | light_mod | live | blue-500 | `/product/wheels` |
| `chassis` | 底盘升级 | light_mod | live | blue-500 | `/product/chassis` |

### 4.5 4 推荐组合(来自 P1 PRD §6.6)

| Slug | 名称 | 适合 | 项目组合 |
|---|---|---|---|
| `new-car-basics` | 新车基础保护 | 刚提新能源车 | 车衣 + 窗膜 + 脚垫 + 底盘护板 |
| `business-comfort` | 商务舒适升级 | MPV / 大六座 SUV | 小桌板 + 后排娱乐 + 氛围灯 + 腿托 + 地板 |
| `appearance-stance` | 外观姿态升级 | 想提升外观风格 | 改色膜 + 轮毂 + 运动包围 + 卡钳 |
| `daily-utility` | 日常实用防护 | 家用通勤 | 门槛条 + 防虫网 + 挡泥板 + 屏幕钢化膜 |

### 4.6 SEO 字段

| 字段 | 内容 |
|---|---|
| `<title>` | `产品中心｜蓝辉轻改 LANHUI` |
| `<meta description>` | `蓝辉轻改产品中心,支持按车型查看新能源车轻改方案,也可按车衣、窗膜、改色膜、电动踏板、轮毂等项目了解服务。` |
| `<meta keywords>` | `汽车轻改, 新能源车升级, 车衣, 窗膜, 改色膜, 电动踏板, 轮毂, 蓝辉轻改` |
| H1 | `产品中心` |
| H2 | `按车型找方案` / `按项目看服务` / `热门升级组合` |
| Canonical | `/product` |
| JSON-LD | `CollectionPage` + `ItemList` (含 11 品牌 + 6 P0 服务) |

---

## 5. 关键组件

### 5.1 已实现组件(`src/components/product/`,14 个 v3 组件 + 6 flooring 组件)

| 组件 | 路径 | Client? | 职责 | 大小 |
|---|---|---:|---|---:|
| `<ProductHero>` | `src/components/product/ProductHero.tsx` | RSC | Hero(车辆剪影 + 4 材质切片 + 11 品牌矩阵 + 文案) | 5.0K |
| `<VehicleSilhouette>` | `src/components/product/VehicleSilhouette.tsx` | RSC | 车辆侧影 SVG inline | 3.4K |
| `<MaterialSlice>` | `src/components/product/MaterialSlice.tsx` | RSC | 4 材质切片(车衣 / 窗膜 / 轮毂 / 踏板) | 4.0K |
| `<BrandMatrixMap>` | `src/components/product/BrandMatrixMap.tsx` | RSC | 11 品牌色块矩阵(产品中心 Hero 内嵌 + 独立使用) | 3.7K |
| `<VehicleTopicMap>` | `src/components/product/VehicleTopicMap.tsx` | RSC | 车型专题业务地图(violet 主题) | 7.4K |
| `<FilmServiceMap>` | `src/components/product/FilmServiceMap.tsx` | RSC | 车膜业务地图(cyan 主题) | 5.3K |
| `<LightModMap>` | `src/components/product/LightModMap.tsx` | RSC | 轻改装业务地图(orange 主题) | 5.8K |
| `<MobileProductContent>` | `src/components/product/MobileProductContent.tsx` | CC | 移动端 sticky 3 段 tab 容器 | 1.4K |
| `<StickyTabBar>` | `src/components/product/StickyTabBar.tsx` | CC | 移动端 sticky 3 段 tab UI | 2.7K |
| `<CollapsibleSection>` | `src/components/product/CollapsibleSection.tsx` | CC | P1 项目折叠区 | 3.1K |
| `<P1ServiceCard>` | `src/components/product/P1ServiceCard.tsx` | RSC | P1 服务卡片(planned 状态) | 2.6K |
| `<RecommendationCombos>` | `src/components/product/RecommendationCombos.tsx` | RSC | 4 推荐组合卡片 | 5.0K |
| `<CombosPlaceholder>` | `src/components/product/CombosPlaceholder.tsx` | RSC | 推荐组合占位(无 4 组合数据时) | 1.9K |
| `<ProductFAQ>` | `src/components/product/ProductFAQ.tsx` | CC | FAQ 折叠列表 | 3.8K |
| `<BrandPlaceholder>` | `src/components/product/BrandPlaceholder.tsx` | RSC | planned 状态品牌占位 | 5.5K |
| `<FlooringFeatureGrid>` | `src/components/product/FlooringFeatureGrid.tsx` | RSC | flooring 特性(遗留) | 2.2K |
| `<FlooringGallery>` | `src/components/product/FlooringGallery.tsx` | RSC | flooring 画廊(遗留) | 2.6K |
| `<FlooringStructureGrid>` | `src/components/product/FlooringStructureGrid.tsx` | RSC | flooring 结构(遗留) | 1.9K |
| `<FlooringTopicBanner>` | `src/components/product/FlooringTopicBanner.tsx` | RSC | flooring 横幅(遗留) | 2.4K |
| `<FlooringVehicleGroup>` | `src/components/product/FlooringVehicleGroup.tsx` | RSC | flooring 车型分组(遗留) | 6.8K |

> 6 个 `Flooring*` 组件是历史 flooring 专题页面残留,在 `/product` v3 中未引用。后续清理时确认是否迁回 `src/components/flooring/`。

### 5.2 共享 / 上游组件

| 组件 | 路径 | 消费方 |
|---|---|---|
| `<Header>` | `src/components/Header.tsx` | 所有页面 |
| `<Footer>` | `src/components/Footer.tsx` | 所有页面 |
| `<PhoneCta>` | `src/components/cta/PhoneCta.tsx` | 品牌页 / 车型页(全局电话 CTA,**例外**:与 PRD §2.1 私有操作取消规则冲突,但已落地) |

### 5.1 视觉规范(从 PRODUCT_LANDING_VISUAL v3 §4.1 抽取)

**Design tokens**(写入 `src/app/globals.css` 或 Tailwind config):

```css
:root {
  --ink: #fafafa;
  --canvas: #09090b;
  --surface-1: #18181b;
  --surface-2: #27272a;
  --surface-3: #3f3f46;
  --border-soft: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  --accent-primary: #f97316;       /* orange-500 */
  --accent-secondary: #60a5fa;     /* blue-400 */

  /* 三大业务分类色(v3 新增) */
  --cat-film: #22d3ee;             /* cyan-400    — 车膜 */
  --cat-light: #fb923c;            /* orange-400  — 轻改装 */
  --cat-topic: #a78bfa;            /* violet-400  — 车型专题 */

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
  --status-planned: #fbbf24;       /* amber-400   */
}
```

**其他规范**:

- 字体:Geist Sans(沿用主站)
- 背景:zinc-950 / 900 / 800(zinc 三阶 + 透明度叠加)
- 圆角:`--r-md: 0.5rem` / `--r-lg: 0.75rem` / `--r-xl: 1rem` / `--r-2xl: 1.5rem`
- 缓动:`--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)`
- Anti-cliché:不用紫色渐变、Inter 字体、emoji 滥用、CSS silhouette 偷懒

### 5.2 Hero 视觉规范(从 v3 PRD §4.2 抽取)

| 元素 | 实现 | 备注 |
|---|---|---|
| 车辆侧影 | `<VehicleSilhouette>` SVG inline | 新能源 SUV 侧视,金属漆面高光,避免 emoji |
| 4 材质切片 | `<MaterialSlice>` × 4 | 车衣(半透明反光)、窗膜(光线透射)、轮毂(金属结构线)、踏板(安装位) |
| 11 品牌矩阵 | `<BrandMatrixMap>` | 11 个 brand 色块,hover 高亮 + 品牌名浮现,click 进入品牌页 |
| H1 | `<h1>产品中心</h1>` | 大字号,zinc-50 |
| 副标题 | "按车型找方案,按项目看服务" | zinc-400 |

---

## 6. 数据流与渲染策略

### 6.1 静态数据(全部从 `product-routes.ts` 派生)

| 数据 | 来源 | 消费方 |
|---|---|---|
| 11 品牌 + accentColor | `product-routes.ts` → `getAllBrandRoutes()` | `<BrandMatrixMap>`、`<VehicleTopicMap>` |
| 6 P0 服务 + 详情 | `product-routes.ts` + `src/lib/products.ts` → `getProduct(slug)` | `<FilmServiceMap>`、`<LightModMap>` |
| P1 服务卡片 | `product-routes.ts` (status=planned) | `<CollapsibleSection>` |
| 4 推荐组合 | `src/lib/product-combos.ts` (新建) | `<RecommendationCombos>` |
| FAQ | `src/lib/product-faq.ts` (新建) | `<ProductFAQ>` |

### 6.2 渲染策略

- **RSC 优先**:`/product` 是 RSC,所有品牌 / 服务数据在 server 端聚合后下发。
- **`planned` 状态展示**:planned 品牌 / 车型 / 服务用 `<BrandPlaceholder>` 渲染,显示"方案整理中"徽标,无 404 跳转。
- **legacy alias**:`next.config.ts` redirect 已经挂载,11 个 legacy route 自动 301 到 canonical route。
- **StickyTabBar 客户端**:移动端 sticky tab 仅在 `< 768px` 渲染,使用 `position: sticky` + IntersectionObserver 激活当前段。

### 6.3 视觉与可访问性

- 所有图片:`aspect-[4/3] + object-contain + Next/Image sizes`。
- 触控区:可点击卡片 / 锚点 / 筛选器 ≥ 44px。
- 焦点:键盘 Tab 可访问,focus ring 可见,不能只靠颜色区分状态。
- 动画:150–300ms,支持 `prefers-reduced-motion`。
- 配色对比:zinc-400 on zinc-950 ≥ 4.5:1(基线通过)。

### 6.4 埋点

| 事件 | 触发 | 字段 | 优先级 |
|---|---|---|---|
| `product_index_view` | 访问 `/product` | `route`, `entrySource` | P1 |
| `product_entry_tab_click` | 点击双入口 tab | `tab` (by_vehicle / by_service) | P1 |
| `product_brand_click` | 点击品牌卡片 | `brandSlug`, `status` | P1 |
| `product_model_click` | 点击车型标签 | `brandSlug`, `modelSlug`, `status` | P1 |
| `product_service_click` | 点击服务项目 | `serviceSlug`, `priority`, `status` | P1 |
| `product_combo_click` | 点击推荐组合 | `comboSlug` | P1 |

实现走 `src/lib/analytics.ts` 缓冲队列 + `sendBeacon` flush。

---

## 7. 性能基线(来自 2026-06-19 审计)

| 路由 | 当前 Lighthouse mobile perf | 目标 | 审计编号 |
|---|---:|---:|---|
| `/product` (v1) | 64 ❌ | ≥ 80 | P1-5 |
| `/product` (v2/v3 目标) | 待测 | ≥ 85 | — |

**已知瓶颈(v1)**:

- LCP 6.5s(4 大主题图未 priority);
- 三大业务区视觉一致,缺乏主题色差异化;
- 移动端滚动太长,无 sticky 切换。

**修复方向(v2/v3)**:

- Hero 改用车辆侧影 SVG inline + 4 材质切片,4 大主题图降级为次要区;
- 三大业务地图用 cyan / orange / violet 主题色区分;
- 移动端 sticky 3 段 tab 切分,P1 默认折叠前 4 个;
- 关键图片加 `priority`,预留尺寸防 CLS。

---

## 8. 验收标准(DoD)

### 8.1 功能

- [ ] `/product` 200 可达,无 console error
- [ ] Hero 显示 H1 `产品中心` + 副标题 + 双入口 CTA
- [ ] 双入口 tab 点击可滚动到 `#vehicle-topics` / `#service-projects`
- [ ] 11 品牌矩阵渲染所有品牌,planned 状态徽标可见
- [ ] 三大业务地图(车膜 / 轻改装 / 车型专题)主题色差异化
- [ ] 6 P0 服务卡可点击进入 `/product/{serviceSlug}`
- [ ] P1 项目折叠:默认前 4 个 + 展开显示全部
- [ ] 4 推荐组合展示且不含页面私有操作
- [ ] FAQ ≥ 5 条,可折叠展开
- [ ] 移动端 ≤ 768px sticky tab 切换 3 段
- [ ] planned 品牌 / 服务点击不跳 404(显示占位或 alert)

### 8.2 内容规范

- [ ] 文案不含"官方授权 / 原厂认证 / 100% 无损 / 永久质保 / 全网最低"等未经证明表述
- [ ] 推荐表达统一使用"到店确认车型 / 不破坏原车结构 / 以实车检查为准"
- [ ] 不出现为单页设计的引导按钮 / 弹窗 / 下行动作

### 8.3 性能

- [ ] LCP < 2.5s (desktop) / < 4s (mobile)
- [ ] CLS = 0
- [ ] 移动端 390px 无横向滚动
- [ ] 6 个 P0 服务图 priority,其余 lazy load

### 8.4 SEO

- [ ] 独立 `<title>` / `<meta description>` / canonical 指向 `/product`
- [ ] JSON-LD `CollectionPage` + `ItemList`(11 品牌 + 6 服务)
- [ ] sitemap 只收录 canonical route,不收录 legacy alias
- [ ] 11 品牌页面 + 6 P0 服务页被 `/product` 内链覆盖

### 8.5 质量门

- [ ] `npx tsc --noEmit` 通过(允许 9 个 pre-existing test 错,见 `CLAUDE.md`)
- [ ] `npm run build` 通过
- [ ] `npm run lint` 通过(本页不引入新违规)
- [ ] Playwright e2e:`/product` 三视口截图 + 锚点跳转 + sticky tab 通过

---

## 9. 已知问题

| ID | 等级 | 问题 | 状态 |
|---|---|---|---|
| P1-5 | P1 | `/product` v1 LCP 6.5s,4 大主题图未 priority | v2/v3 修复中 |
| P2 | P2 | planned 品牌(理想 / 特斯拉 / 小鹏 / 腾势 / 岚图 / 乐道 / 高山 / 智界) 8 个无代码页,只有 planned 占位 | 由对应品牌 PRD 跟进 |
| P2 | P2 | 业务地图视觉差异化(v3 视觉)组件未实现 | v3 待实现 |
| P2 | P2 | 埋点事件 6 类全未挂载 | v3 待实现 |
| P2 | P2 | 移动端 sticky tab 未实现 | v3 待实现 |
| P2 | P2 | FAQ 列表内容待业务补充 | 规划中 |
| P2 | P2 | 推荐组合内容待业务补充(目前只有骨架) | 规划中 |

---

## 10. 当前实现差距(2026-06-25 实测)

### 10.1 已完成 ✅

- [x] Phase 0:文档治理(本 SPEC + `product-routes.ts`)
- [x] Phase 1:入口页 PRD 升级到 v2(双入口内容架构)
- [x] Phase 2:24 个新路由(`/product/{brand}` + `/product/{brand}/{model}`)+ 11 个 legacy redirect(`/product/wenjie-m8` → `/product/wenjie/m8` 等)
- [x] Phase 3:route registry (`src/lib/product-routes.ts`) 11 BRANDS + 13 MODELS + 10 SERVICES + 4 helpers
- [x] Phase 4:**v3 视觉 + 移动端全部完成**:
  - `<ProductHero>` 车辆剪影 + 4 材质切片 + 11 品牌矩阵
  - `<FilmServiceMap>` / `<LightModMap>` / `<VehicleTopicMap>` 三大业务地图主题色差异化
  - `<MobileProductContent>` + `<StickyTabBar>` 移动端 3 段 tab
  - `<CollapsibleSection>` + `<P1ServiceCard>` P1 折叠
  - `<RecommendationCombos>` 4 推荐组合
  - `<ProductFAQ>` 折叠 FAQ
  - `<BrandPlaceholder>` planned 占位
- [x] Phase 5:SEO metadata + JSON-LD `CollectionPage` + `ItemList`(11 品牌 + live 服务)

### 10.2 待办 / 已知问题

- [ ] **6 类 product_* 埋点事件未全量挂载**(PhoneCta 链路已埋,其余 click/view 事件未在 `src/lib/analytics.ts` 注册)
- [ ] 8 个 planned 品牌(理想 / 特斯拉 / 小鹏 / 腾势 / 岚图 / 乐道 / 高山 / 智界)无 page.tsx,只有目录占位 + route registry
- [ ] 13 个单车型页全部 planned(目录已建 `wenjie/m6/m7/m8`、`xiaomi/su7/yu7`、`zeekr/9x` 等,内容待写)
- [ ] 3 个 P1 服务 planned(`floor-mats` / `business-comfort` / `skid-plate` 目录已建)
- [ ] 6 个 `<Flooring*>` 组件在 `src/components/product/` 中孤立(无引用),后续清理
- [ ] route registry 单元测试(避免 slug 漂移)未写
- [ ] Lighthouse perf 实测(目标 ≥ 85,当前 v1 基线 64)
- [ ] `<PhoneCta>` 在品牌页 / 车型页的页面级使用与 PRD ROUTE_ARCHITECTURE §2.1"页面私有操作取消"规则存在冲突——已在品牌页落地,但 PRD 规则未跟进,需要决策

---

## 11. 关联 SPEC

- [`product-topics.md`](./product-topics.md)— 品牌 / 车型专题页(承接 vehicle_brand / vehicle_model)
- [`product-film.md`](./product-film.md)— 车膜服务页(承接 service_category / package_detail)
- [`product-accessories.md`](./product-accessories.md)— 轻改装备服务页(承接 service_category)
- [`components/topic-pattern.md`](../../components/topic-pattern.md)— 组件契约、3 态图片模型、字面量类型
- [`product-prd-spec-map.md`](./product-prd-spec-map.md)— 全部产品 PRD ↔ SPEC 映射表

---

> 最后更新:2026-06-25
> 维护:每次新增服务项目 / 品牌 / 车型时同步更新本 SPEC 与 `product-routes.ts`

## 12. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|---|---|---|---|---|
| 2026-06-20 | Claude Code | `/product` v1(6 产品 + 4 TopicBanner) | 完成 | — |
| 2026-06-22 | Claude Code | 公开站体系规划(SPEC 文档创建) | 完成 | — |
| 2026-06-25 | Claude Code | v2 双入口内容架构 + 24 路由 + 11 legacy redirect | 完成 | v3 视觉升级 |
| 2026-06-25 | Claude Code | v3 视觉与移动端 PRD 落地为本 SPEC | 完成 | 组件实现 |
