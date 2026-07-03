# SPEC: 品牌与车型专题页 Product Topics

> 对应 PRD(分四类):
> - 路由治理:[`PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md`](../../../PRD/product/PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md) §3.3 / §3.4
> - 品牌 PRD:
>   - 问界 [`WENJIE_TOPIC_PRD_2026-06-20.md`](../../../PRD/product/WENJIE_TOPIC_PRD_2026-06-20.md) + [`WENJIE_SERIES_UPGRADE_PRD_2026-06-24.md`](../../../PRD/product/WENJIE_SERIES_UPGRADE_PRD_2026-06-24.md)
>   - 小米 [`XIAOMI_TOPIC_PRD_2026-06-20.md`](../../../PRD/product/XIAOMI_TOPIC_PRD_2026-06-20.md) + [`XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md`](../../../PRD/product/XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md)
>   - 极氪 [`ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md`](../../../PRD/product/ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) + [`ZEEKR_9X_UPGRADE_PRD_2026-06-24.md`](../../../PRD/product/ZEEKR_9X_UPGRADE_PRD_2026-06-24.md)
>   - 理想 [`LI_AUTO_TOPIC_PRD_2026-06-24.md`](../../../PRD/product/LI_AUTO_TOPIC_PRD_2026-06-24.md)
>   - 特斯拉 [`TESLA_TOPIC_PRD_2026-06-24.md`](../../../PRD/product/TESLA_TOPIC_PRD_2026-06-24.md)
> - 单车型 PRD(12 个):`WENJIE_M6/M7/M8`、`XIAOMI_YU7_UPGRADE`、`LI_AUTO_I8_TOPIC_PRD`、`LEDAO_L90_TOPIC_PRD`、`DENZA_D9_TOPIC_PRD`、`VOYAH_DREAMER_TOPIC_PRD`、`XPENG_GX_TOPIC_PRD`、`GAOSHAN_8_TOPIC_PRD`、`ZHIJIE_V9_TOPIC_PRD`
>
> 组件契约:[`components/topic-pattern.md`](../../components/topic-pattern.md)
> 实现状态:🔧 **3 品牌(问界 / 小米 / 极氪)+ canonical 5 组件已落地;8 品牌 + 13 单车型页 planned**

---

## 1. 职责范围

承接两类页面:

1. **品牌专题页**(`/product/{brandSlug}`):聚合某品牌下所有车型 + 品牌共性优势 + 热门项目入口。
2. **单车型专题页**(`/product/{brandSlug}/{modelSlug}`):展示某一车型的完整升级方案,按"必改 / 商务 / 实用"或"内饰 / 外观 / 防护"分组。

承接用户意图:

- 明确车型车主:"我是问界 M8 / 小米 YU7,想看这台车能做什么";
- 品牌车主:"我是问界车主,蓝辉有什么方案";
- 比较型用户:从品牌矩阵或车型页 PK 多个车型方案。

页面只做内容展示、项目解释、品牌 / 车型路由分流。**不设置页面私有操作**,需要沟通走首页 / Header / Footer。

---

## 2. 路由

### 2.1 品牌专题页(11 个,含 planned)

| Brand Slug | Brand Name | Canonical Route | 状态 | 主题色 | 车型数 | 上位 PRD |
|---|---|---|---|---|---:|---|
| `wenjie` | 问界 | `/product/wenjie` | 🟢 live | cyan-400 | 3 (M6/M7/M8) | WENJIE_TOPIC + SERIES_UPGRADE |
| `xiaomi` | 小米 | `/product/xiaomi` | 🟢 live | orange-400 | 2 (SU7/YU7) | XIAOMI_TOPIC + SERIES_UPGRADE |
| `zeekr` | 极氪 | `/product/zeekr` | 🟢 live | orange-400 | 1 (9X) | ZEEKR_MODIFICATION_TOPIC + 9X_UPGRADE |
| `li-auto` | 理想 | `/product/li-auto` | 🟡 planned | amber-400 | 1 (i8) | LI_AUTO_TOPIC + LI_AUTO_I8_TOPIC |
| `tesla` | 特斯拉 | `/product/tesla` | 🟡 planned | red-400 | 待拆 (3/Y/S/X) | TESLA_TOPIC |
| `xpeng` | 小鹏 | `/product/xpeng` | 🟡 planned | emerald-400 | 1 (GX) | XPENG_GX_TOPIC |
| `denza` | 腾势 | `/product/denza` | 🟡 planned | pink-400 | 1 (D9) | DENZA_D9_TOPIC |
| `voyah` | 岚图 | `/product/voyah` | 🟡 planned | purple-400 | 1 (梦想家) | VOYAH_DREAMER_TOPIC |
| `ledao` | 乐道 | `/product/ledao` | 🟡 planned | blue-400 | 1 (L90) | LEDAO_L90_TOPIC |
| `gaoshan` | 高山 | `/product/gaoshan` | 🟡 planned | teal-400 | 1 (8) | GAOSHAN_8_TOPIC |
| `zhijie` | 智界 | `/product/zhijie` | 🟡 planned | amber-400 | 1 (V9) | ZHIJIE_V9_TOPIC |

### 2.2 单车型专题页(13 个,含 planned)

| Model Slug | Model Name | Canonical Route | Legacy Alias | 状态 | 上位 PRD |
|---|---|---|---|---|---|
| `m6` | 问界 M6 | `/product/wenjie/m6` | `/product/wenjie-m6` | 🟡 planned | WENJIE_M6_TOPIC |
| `m7` | 问界 M7 | `/product/wenjie/m7` | `/product/wenjie-m7` | 🟡 planned | WENJIE_M7_TOPIC |
| `m8` | 问界 M8 | `/product/wenjie/m8` | `/product/wenjie-m8` | 🟡 planned | WENJIE_M8_TOPIC |
| `su7` | 小米 SU7 | `/product/xiaomi/su7` | (暂无) | 🟡 planned | XIAOMI_SERIES_UPGRADE |
| `yu7` | 小米 YU7 | `/product/xiaomi/yu7` | `/product/xiaomi-yu7` | 🟡 planned | XIAOMI_YU7_UPGRADE |
| `9x` | 极氪 9X | `/product/zeekr/9x` | `/product/zeekr-9x` | 🟡 planned | ZEEKR_9X_UPGRADE |
| `i8` | 理想 i8 | `/product/li-auto/i8` | (暂无) | 🟡 planned | LI_AUTO_I8_TOPIC |
| `l90` | 乐道 L90 | `/product/ledao/l90` | `/product/ledao-l90` | 🟡 planned | LEDAO_L90_TOPIC |
| `d9` | 腾势 D9 | `/product/denza/d9` | `/product/denza-d9` | 🟡 planned | DENZA_D9_TOPIC |
| `dreamer` | 岚图梦想家 | `/product/voyah/dreamer` | `/product/voyah-dreamer` | 🟡 planned | VOYAH_DREAMER_TOPIC |
| `gx` | 小鹏 GX | `/product/xpeng/gx` | `/product/xpeng-gx` | 🟡 planned | XPENG_GX_TOPIC |
| `8` | 高山 8 | `/product/gaoshan/8` | `/product/gaoshan-8` | 🟡 planned | GAOSHAN_8_TOPIC |
| `v9` | 智界 V9 | `/product/zhijie/v9` | `/product/zhijie-v9` | 🟡 planned | ZHIJIE_V9_TOPIC |

### 2.3 强规则:品牌预留车型二级分类

每个品牌都必须预留车型二级分类。即使当前只有 1 个车型,也必须先建 `/product/{brandSlug}` 占位页,避免后续新增车型时重新迁移路由。

### 2.4 路由迁移

所有 legacy 平铺路由(`/product/wenjie-m8`、`/product/xiaomi-yu7` 等)通过 `next.config.ts` redirect 配置 301 跳转到 canonical 嵌套路由。sitemap 只收录 canonical。

---

## 3. 功能清单

### 3.1 品牌专题页功能

| # | 功能 | 优先级 | 状态 | 备注 |
|---:|---|---|---|---|
| F1 | `<BrandTopicHero>` 品牌首屏(品牌名 + tagline + 车型统计) | P0 | ✅ zeekr/wenjie/xiaomi 落地 | — |
| F2 | `<ModelSwitcher>` 车型切换(同品牌下车型导航) | P0 | ⚪ v0.1 待实现 | wenjie / xiaomi 必需 |
| F3 | 品牌共性优势 3-4 列(座舱质感 / 防护 / 收纳 / 适配) | P0 | ✅ zeekr 落地 | — |
| F4 | 车型卡片网格(品牌下所有车型 + 跳转单车型页) | P0 | ✅ wenjie / xiaomi 落地,其他 planned | — |
| F5 | 热门项目聚合(电动车系高频项目卡) | P1 | ✅ zeekr 落地 | — |
| F6 | 服务流程(到店沟通 → 车型确认 → 方案推荐 → 施工交付) | P0 | ✅ zeekr 落地 | — |
| F7 | JSON-LD `ItemList`(车型 + 项目) | P1 | ✅ zeekr 落地 | — |
| F8 | 计划中车型占位(`BrandPlaceholder` 显示"方案整理中") | P0 | ✅ v0.1 落地 | planned 品牌(8 个) |

### 3.2 单车型专题页功能

| # | 功能 | 优先级 | 状态 | 备注 |
|---:|---|---|---|---|
| F1 | `<VehicleTopicHero>` 车型首屏(车型名 + 升级方案 + 视觉) | P0 | ⚪ v0.1 待实现 | — |
| F2 | 项目分组(必改产品 / 高级商务升级 / 实用小配件 或 内饰 / 外观 / 防护) | P0 | ⚪ v0.1 待实现 | 按海报分层 |
| F3 | 30 个项目卡片(每个项目:名称、分类、卖点、图片三态、回链服务页) | P0 | ⚪ v0.1 待实现 | — |
| F4 | 场景矩阵(新车保护 / 商务座舱 / 电动便利 / 外观运动 / 户外 / 实用) | P0 | ⚪ v0.1 待实现 | — |
| F5 | 推荐组合(4 个组合:新车必改 / 商务座舱 / 电动便利 / 实用配件) | P1 | ⚪ v0.1 待实现 | — |
| F6 | 适配说明(年份 / 批次 / 版本 / 配置差异提示) | P0 | ⚪ v0.1 待实现 | 避免过度承诺 |
| F7 | 施工服务流程(7 步:车型确认 → 项目选择 → 到店评估 → 方案确认 → 施工 → 验收 → 售后) | P0 | ⚪ v0.1 待实现 | — |
| F8 | 海报素材展示(完整长图入口,不作首屏) | P2 | ⚪ v0.1 待实现 | — |
| F9 | FAQ(≥ 5 条:适配、工期、单项了解、质保边界、电动门等) | P1 | ⚪ v0.1 待实现 | — |
| F10 | `<AnchorNav>` 锚点导航(桌面 sticky,移动端可横滚) | P0 | ⚪ v0.1 待实现 | — |
| F11 | `<ProductCard>` 3 态 imageStatus UI(matched / pending-review / missing) | P0 | ✅ wenjie/zeekr 落地 | — |
| F12 | JSON-LD `ItemList` | P1 | ⚪ v0.1 待实现 | — |
| F13 | 三视口响应式(390 / 768 / 1024 / 1440) | P0 | ✅ | — |
| F14 | 埋点(`vehicle_model_topic_view` / `vehicle_project_click`) | P1 | ⚪ v0.1 待实现 | — |

---

## 4. 数据模型

### 4.1 品牌数据(从 product-routes.ts 派生)

```typescript
type VehicleBrandRoute = ProductRoute & {
  type: "vehicle_brand";
  brandSlug: string;       // "wenjie" | "xiaomi" | ...
  brandName: string;       // "问界" | "小米" | ...
  modelSlugs: string[];    // ["m6", "m7", "m8"]
  accentColor: string;     // 11 品牌色
  totalModels: number;     // modelSlugs.length
  totalProjects?: number;  // 品牌下项目总数(可选)
};
```

### 4.2 车型数据(`src/lib/<brand>-products.ts` 静态 + 字面量类型)

ZEEKR canonical 模式,所有品牌统一:

```typescript
type Width = 1448;       // 字面量类型
type Height = 1086;
type AspectRatio = "4/3";
type AspectRatio2x1 = "2/1";  // 海报长图比例,单独声明

// 产品行(从海报 / Excel manifest 提取)
export type Product = {
  id: string;
  slug: string;
  order: number;
  name: string;
  modelSlug: string;          // 所属车型
  category: ProductCategory;
  tier: ProductTier;          // must_have | business_upgrade | practical_accessory
  summary: string;
  suitableFor: string[];
  caution?: string;
  imageStatus: "matched" | "pending-review" | "missing";
  image: {
    publicPath: string | null;
    width: Width | null;      // 一旦填入必须是 1448
    height: Height | null;    // 一旦填入必须是 1086
    aspectRatio: AspectRatio | null;  // 一旦填入必须是 "4/3"
  };
  serviceRoute?: string;      // 回链到服务项目页(若有)
  sourceLabel: string;        // "poster_must_have" / "海报-高级商务升级" 等
};

type ProductCategory =
  | "protection"        // 防护
  | "cabin_comfort"     // 座舱舒适
  | "business_cabin"    // 商务座舱
  | "appearance"        // 外观
  | "outdoor"           // 户外
  | "electric_convenience"  // 电动便利
  | "practical_accessory"   // 实用配件
  | "screen_care"       // 屏幕保护
  | "noise_sealing"     // 隔音
  | "film"              // 膜系
  | "exterior"          // 外观装备
  | "interior"          // 内饰
  | "comfort"           // 舒适
  | "chassis"           // 底盘
  | "wheel"             // 轮毂
  | "lighting"          // 灯光
  | "accessory";        // 配件

type ProductTier =
  | "must_have"             // 必改
  | "business_upgrade"      // 商务升级
  | "practical_accessory"   // 实用配件
  | "popular"               // 热门推荐
  | "optional";             // 可选
```

### 4.3 海报长图(单独数据源,不能用 4:3)

```typescript
// 海报长图类型,与 4:3 产品卡区分
type PosterImage = {
  publicPath: string;
  width: number;             // 864
  height: number;            // 1821
  aspectRatio: "864/1821";   // 竖版长图
  usage: "promotion" | "sales_share";
};
```

### 4.4 数据文件组织

| 品牌 | 静态数据文件 | 目录命名 | 主题色 | 5 组件 |
|---|---|---|---|:---:|
| 问界 | `src/lib/wenjie-products.ts` | `wenjie/{m6,m7,m8}/` | cyan-400 | ✅ |
| 小米 | `src/lib/xiaomi-products.ts` | `xiaomi/{su7,yu7}/` | orange-400 | ✅ |
| 极氪 | `src/lib/zeekr-products.ts` | `zeekr/{9x,8x,009}/` | orange-400 | ✅ (canonical) |
| 理想 | `src/lib/li-auto-products.ts` | `li-auto/{i8,l6,l7,...}/` | amber-400 | ⚪ planned |
| 特斯拉 | `src/lib/tesla-products.ts` | `tesla/{model-3,model-y,...}/` | red-400 | ⚪ planned |
| 小鹏 | `src/lib/xpeng-products.ts` | `xpeng/{gx,...}/` | emerald-400 | ⚪ planned |
| 腾势 | `src/lib/denza-products.ts` | `denza/{d9,...}/` | pink-400 | ⚪ planned |
| 岚图 | `src/lib/voyah-products.ts` | `voyah/{dreamer,...}/` | purple-400 | ⚪ planned |
| 乐道 | `src/lib/ledao-products.ts` | `ledao/{l90,...}/` | blue-400 | ⚪ planned |
| 高山 | `src/lib/gaoshan-products.ts` | `gaoshan/{8,...}/` | teal-400 | ⚪ planned |
| 智界 | `src/lib/zhijie-products.ts` | `zhijie/{v9,...}/` | amber-400 | ⚪ planned |

### 4.5 字面量类型保证(防图片规格漂移)

参照 [`ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md` §8.2 / §8.5](../../../PRD/product/ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md):

```typescript
type Width = 1448;
type Height = 1086;
type AspectRatio = "4/3";
type AspectRatio2x1 = "2/1";
```

**关键**:用字面量类型而非 `number`,从 TS 编译期杜绝"图片规格漂移"。后续如果需要新规格(例如 1200×900),必须通过 PRD refine 明确规格,而不是悄悄换值。

### 4.6 SEO 字段

**品牌页**:

| 字段 | 模板 |
|---|---|
| `<title>` | `{品牌名}轻改方案｜蓝辉轻改 LANHUI` |
| `<meta description>` | `查看{品牌名}热门车型轻改项目,覆盖膜系、防护、舒适与实用配件。` |
| H1 | `{品牌名}轻改方案` |
| H2 | `车型方案` / `品牌优势` / `热门项目` |
| Canonical | `/product/{brandSlug}` |
| JSON-LD | `CollectionPage` + `ItemList` (含车型 + 项目) |

**单车型页**:

| 字段 | 模板 |
|---|---|
| `<title>` | `{车型名}专属升级方案｜蓝辉轻改 LANHUI` |
| `<meta description>` | `蓝辉轻改整理{车型名}常见升级项目,包含必改产品、舒适升级与实用配件。` |
| H1 | `{车型名}专属升级方案` |
| H2 | `必改产品` / `高级商务升级` / `实用小配件` / `30 个热门轻改产品` |
| Canonical | `/product/{brandSlug}/{modelSlug}` |
| JSON-LD | `CollectionPage` + `ItemList` |

---

## 5. 关键组件

### 5.1 通用组件契约(5 组件 + 3 态图片模型)

| 组件 | 命名模式 | Client? | 职责 | props 关键字段 |
|---|---|---:|---|---|
| `BrandTopicHero` | `{Brand}TopicHero.tsx` | RSC | 品牌首屏 | brandName, tagline, modelCount, accentColor |
| `VehicleTopicHero` | `{Model}TopicHero.tsx` | RSC | 单车型首屏 | modelName, sourceLabel, projectCount, accentColor |
| `ModelSwitcher` | `{Brand}ModelSwitcher.tsx` | CC | 品牌下车型切换 | models[], activeSlug, accentColor |
| `AnchorNav` | `{Topic}AnchorNav.tsx` | CC | 页面内项目分组跳转 | sections[], activeSection, accentColor |
| `ProductCard` | `{Topic}ProductCard.tsx` | CC | 项目卡片(三态 UI) | product, imageStatus, serviceRoute?, onTierClick? |
| `ProductGrid` | `{Topic}ProductGrid.tsx` | RSC | 项目网格 | products[], tier?, categoryFilter?, onFilter? |
| `ProductTable` | `{Topic}ProductTable.tsx` | RSC | 参数 / 适配 / 验收表格 | products[], columns[] |
| `TopicBanner` | `{Topic}TopicBanner.tsx` | RSC | 产品中心入口横幅 | topicName, projectCount, modelCount, route, accentColor |
| `BrandPlaceholder` | `BrandPlaceholder.tsx` | RSC | planned 状态占位 | brandName, modelName?, message? |

### 5.2 3 态 imageStatus UI

```typescript
type ImageStatus = "matched" | "pending-review" | "missing";
```

| 状态 | 显示 | UI 要求 |
|---|---|---|
| `matched` | 真实产品图 | 正常展示,`aspect-[4/3] + object-contain` |
| `pending-review` | 占位 + "图片待确认" 角标 | 已有素材但未确认,显示审核状态徽标 |
| `missing` | 占位图形 + 文案"暂无图片" | 有稳定占位和文字说明 |

### 5.3 现有实现完整度(2026-06-25 实测)

| 专题 | 组件目录 | page.tsx | 5 组件完备 | 3 态图片 | 字面量类型 | CI 验证脚本 | 备注 |
|---|---|:---:|:---:|:---:|:---:|---|---|
| 问界 `/product/wenjie` | `src/components/wenjie/` | ✅ | ✅ | ✅ | ✅ | ❌ | 44 款全 pending(待素材) |
| 小米 `/product/xiaomi` | `src/components/xiaomi/` | ✅ | ✅ | ✅ | ✅ | ❌ | SU7/YU7 单车型子目录已建,内容待写 |
| 极氪 `/product/zeekr` | `src/components/zeekr/` | ✅ | ✅ | ✅ | ✅ | ✅ | canonical(21 张图 4:3 统一) |
| 理想 `/product/li-auto` | (planned) | ❌ | ❌ | ❌ | ❌ | ❌ | 仅目录,等 i8 落地 |
| 特斯拉 `/product/tesla` | (planned) | ❌ | ❌ | ❌ | ❌ | ❌ | 仅目录,待业务 |
| 小鹏 `/product/xpeng` | (planned) | ❌ | ❌ | ❌ | ❌ | ❌ | 仅目录 |
| 腾势 `/product/denza` | (planned) | ❌ | ❌ | ❌ | ❌ | ❌ | 仅目录 |
| 岚图 `/product/voyah` | (planned) | ❌ | ❌ | ❌ | ❌ | ❌ | 仅目录 |
| 乐道 `/product/ledao` | (planned) | ❌ | ❌ | ❌ | ❌ | ❌ | 仅目录 |
| 高山 `/product/gaoshan` | (planned) | ❌ | ❌ | ❌ | ❌ | ❌ | 仅目录 |
| 智界 `/product/zhijie` | (planned) | ❌ | ❌ | ❌ | ❌ | ❌ | 仅目录 |

> 详见 [`components/topic-pattern.md` §7](../../components/topic-pattern.md)

### 5.4 已落地的 5 组件文件

**问界**(`src/components/wenjie/`):
- `WenjieAnchorNav.tsx`(锚点导航,sticky)
- `WenjieProductCard.tsx`(3 态 imageStatus UI)
- `WenjieProductGrid.tsx`(产品网格)
- `WenjieProductTable.tsx`(产品清单表格)
- `WenjieTopicBanner.tsx`(`/product` 入口横幅)

**小米**(`src/components/xiaomi/`):`XiaomiAnchorNav` / `XiaomiProductCard` / `XiaomiProductGrid` / `XiaomiProductTable` / `XiaomiTopicBanner`

**极氪**(`src/components/zeekr/`):`ZeekrAnchorNav` / `ZeekrProductCard` / `ZeekrProductGrid` / `ZeekrProductTable` / `ZeekrTopicBanner`(canonical)

### 5.5 已建但未填充的单车型子目录

- `/product/wenjie/{m6,m7,m8}` — 目录已建,page.tsx 未写
- `/product/xiaomi/{su7,yu7}` — 目录已建,page.tsx 未写
- `/product/zeekr/9x` — 目录已建,page.tsx 未写
- `/product/{li-auto,tesla,xpeng,denza,voyah,ledao,gaoshan,zhijie}/<model>` — 目录已建,page.tsx 未写

### 5.4 视觉规范

**主题色**(从 `product-routes.ts` accentColor 派生):

- wenjie = cyan-400 `#22d3ee`
- xiaomi = orange-400 `#fb923c`
- zeekr = orange-400 `#fb923c`
- li-auto = amber-400 `#fbbf24`
- tesla = red-400 `#f87171`
- xpeng = emerald-400 `#34d399`
- denza = pink-400 `#f472b6`
- voyah = purple-400 `#c084fc`
- ledao = blue-400 `#60a5fa`
- gaoshan = teal-400 `#2dd4bf`
- zhijie = amber-400 `#fbbf24`

**图片容器**(统一规范,所有专题):

- 产品卡:`aspect-[4/3] + object-contain + Next/Image sizes`
- 海报长图:独立容器宽度,`object-contain`,比例 `864/1821`
- Hero / 大图:`(min-width: 1024px) 50vw, 100vw`

**字体**:Geist Sans(全站统一)
**背景**:zinc-950 / 900 / 800
**圆角**:`rounded-2xl`(卡片) / `rounded-xl`(icon 容器)

---

## 6. 数据流与渲染策略

### 6.1 静态数据(全部从 `<brand>-products.ts` 派生)

| 数据 | 来源 | 消费方 |
|---|---|---|
| 车型产品行 | `<brand>-products.ts` (静态数组) | `<ProductGrid>`、`<ProductTable>`、`<AnchorNav>` |
| 品牌元信息 | `product-routes.ts` | `<BrandTopicHero>`、`<ModelSwitcher>` |
| 项目分组 / 场景 | `<brand>-products.ts` 中 tier / category 派生 | `<AnchorNav>`、`<ProductGrid>` 筛选 |
| 图片 3 态 | `imageStatus` 字段 | `<ProductCard>` |

### 6.2 渲染策略

- **RSC 优先**:品牌 / 车型页是 RSC,所有数据 server 端聚合后下发。
- **`generateStaticParams` 枚举**:所有车型 / 品牌页 SSG 预生成,确保 `/product/wenjie/m8` 不会因运行时数据问题 404。
- **legacy alias 跳转**:`next.config.ts` redirect 已挂载,11 个 legacy route 301 → canonical。
- **planned 状态**:planned 品牌 / 车型用 `<BrandPlaceholder>` 渲染,不跳 404。

### 6.3 内容回链(强约束)

**车型 → 服务**(项目卡片回链):

| 项目 | 服务 Route | 行为 |
|---|---|---|
| 隔热膜 / 窗膜 | `/product/window-film` | 跳转服务项目页 |
| 改色膜 / 改色 | `/product/color-film` | 跳转服务项目页 |
| 车衣 | `/product/ppf` | 跳转服务项目页 |
| 电动踏板 | `/product/electric-steps` | 跳转服务项目页 |
| 轮毂 | `/product/wheels` | 跳转服务项目页 |
| 底盘护板 / 平衡杆 | `/product/chassis` | 跳转服务项目页或页面锚点 |
| 三防软包脚垫 | `/product/floor-mats` (P1 planned) | 跳转或停留卡片详情 |
| 铝地板 / 木地板 | `/product/flooring` | 跳转服务项目页 |
| 小桌板 / 后排娱乐 / 氛围灯 / 腿托 | `/product/business-comfort` (P1 planned) | 跳转聚合页 |

**服务 → 车型**(服务项目页"常见适配车型"区块):

- 电动踏板:问界 M7/M8、高山 8、理想 L 系列、岚图梦想家等
- 轮毂:小米 SU7/YU7、问界 M6、极氪 9X、小鹏 GX 等
- 窗膜:几乎所有车型,突出新能源热门车型
- 改色膜:小米 SU7/YU7、问界 M6/M7、极氪 9X 等
- 车衣:新车交付、热门新能源车、高价值车型

### 6.4 视觉与可访问性

- 触控区:可点击卡片 / 锚点 / 筛选项 ≥ 44px
- 焦点:键盘 Tab 可访问,focus ring 可见
- 动画:150–300ms,支持 `prefers-reduced-motion`
- 配色对比:zinc-400 on zinc-950 ≥ 4.5:1
- 状态显示:3 态 imageStatus 不只靠颜色,需有"图片待确认" / "暂无图片" 文字

### 6.5 埋点

| 事件 | 触发 | 字段 |
|---|---|---|
| `brand_topic_view` | 访问品牌页 | `brandSlug`, `route` |
| `vehicle_model_topic_view` | 访问车型页 | `brandSlug`, `modelSlug`, `route` |
| `vehicle_model_card_click` | 点击品牌页车型卡片 | `brandSlug`, `modelSlug`, `fromRoute` |
| `vehicle_project_click` | 点击车型页项目 | `brandSlug`, `modelSlug`, `projectSlug`, `tier`, `serviceRoute` |
| `vehicle_scene_filter` | 切换场景筛选 | `brandSlug`, `modelSlug`, `scene` |

实现走 `src/lib/analytics.ts` 缓冲队列 + `sendBeacon` flush。

---

## 7. 性能基线(来自 2026-06-19 审计)

| 路由 | 当前 Lighthouse mobile perf | 目标 | 审计编号 |
|---|---:|---:|---|
| `/product/zeekr` | 🟢 ≥ 90 | ≥ 90 | canonical |
| `/product/wenjie` | 🟡 ~ 70-80 | ≥ 80 | P1-4 |
| `/product/xiaomi` | 🟡 ~ 70-80 | ≥ 80 | — |
| `/product/wenjie/m8` 等 | ⚪ 待实现 | ≥ 80 | — |

**已知瓶颈**:

- 问界 44 款图全 `pending` 占位 → 视觉空洞(P1-4)
- 业务素材未确认 → 大量 3 态 pending

**修复方向**:

- 业务核对图片后逐项切 `matched`,数据层 `image.width/height/aspectRatio` 已就绪
- 缺图行用稳定占位 + 文字说明,不静默缺图
- Hero 大图 priority,下方产品图 lazy load

---

## 8. 验收标准(DoD)

### 8.1 品牌页

- [ ] `/product/{brandSlug}` 200 可达(planned 品牌也 200,显示占位)
- [ ] `<BrandTopicHero>` 显示品牌名 + tagline + 车型统计
- [ ] 车型卡片网格显示所有 modelSlugs(planned 显示占位)
- [ ] `<ModelSwitcher>` 桌面端车型切换,移动端可横滚
- [ ] 品牌共性优势 3-4 列
- [ ] 服务流程 4 步(到店沟通 → 车型确认 → 方案推荐 → 施工交付)
- [ ] JSON-LD `ItemList` 含品牌下所有车型
- [ ] 移动端 390px 无横向滚动,锚点可点击
- [ ] planned 品牌点击车型不跳 404

### 8.2 单车型页

- [ ] `/product/{brandSlug}/{modelSlug}` 200 可达
- [ ] `<VehicleTopicHero>` 显示车型名 + 升级方案
- [ ] 项目分组(必改 / 商务 / 实用 或 内饰 / 外观 / 防护)清晰
- [ ] 30 个项目卡片渲染完整
- [ ] 3 态 imageStatus UI 正常显示
- [ ] 场景矩阵 6 个场景(新车 / 商务 / 电动 / 外观 / 户外 / 实用)
- [ ] 推荐组合 4 个,不含页面私有操作
- [ ] 适配说明(年份 / 批次 / 版本差异)清晰
- [ ] 服务流程 7 步
- [ ] FAQ ≥ 5 条,可折叠
- [ ] `<AnchorNav>` 桌面端 sticky,移动端可横滚
- [ ] JSON-LD `ItemList` 含所有项目
- [ ] 3 视口响应式(390 / 768 / 1024 / 1440)
- [ ] 不出现"问界官方 / 华为官方 / 原厂件 / 不影响质保"等表述

### 8.3 通用

- [ ] 所有图片 `aspect-[4/3] + object-contain + Next/Image sizes`
- [ ] 字面量类型(1448/1086/"4/3")在 TS 编译期生效
- [ ] legacy 平铺路由 301 → canonical
- [ ] sitemap 只收录 canonical route
- [ ] `npx tsc --noEmit` 通过
- [ ] `npm run build` 通过
- [ ] `npm run lint` 通过

### 8.4 SEO

- [ ] 独立 `<title>` / `<meta description>` / canonical
- [ ] H1 / H2 语义层级正确
- [ ] 品牌页 → 单车型页内链完整
- [ ] 单车型页 → 服务项目页内链完整
- [ ] `ItemList` JSON-LD 含所有车型 / 项目

---

## 9. 已知问题

| ID | 等级 | 问题 | 状态 |
|---|---|---|---|
| P1-4 | P1 | 问界 44 款图全 `pending`,业务待核对 | 等业务补图 |
| P2 | P2 | 8 个 planned 品牌(理想 / 特斯拉 / 小鹏 / 腾势 / 岚图 / 乐道 / 高山 / 智界)无代码页 | 跟随单车型 PRD 落地 |
| P2 | P2 | 13 个单车型页全部 planned | 跟随各 PRD v0.2 落地 |
| P2 | P2 | 业务素材未到位,大量 `pending` 3 态 | 等业务核对 |
| P2 | P2 | 海报长图独立类型未在所有 PRD 落地 | 文档侧待统一 |
| P2 | P2 | 小米 SU7 单车型 PRD 缺位(目前由 SERIES_UPGRADE 承接) | 计划中 |
| P2 | P2 | 埋点事件全量未挂载 | 等组件落地 |
| P2 | P2 | 特斯拉 Model 3/Y/S/X 拆分待业务 | 计划中 |
| P2 | P2 | 5 组件模式各品牌独立组件目录,可能存在重复(锚点 / 卡片 / 表格) | 后续抽象 |

---

## 10. 当前实现差距

### 10.1 品牌页实现差距

| 品牌 | 当前状态 | 差距 |
|---|---|---|
| 问界 | live,5 组件 | 44 款 pending 图待补 |
| 小米 | live,5 组件 | 待拆 SU7/YU7 二级车型页 |
| 极氪 | live,5 组件 (canonical) | 仅 9X 1 个车型,品牌下车型待补 |
| 理想 / 特斯拉 / 小鹏 / 腾势 / 岚图 / 乐道 / 高山 / 智界 | planned | 无代码页,需按 canonical 模式实现 |

### 10.2 单车型页实现差距

13 个单车型页全部 planned,需按 WENJIE_M8 PRD §4-§17 统一实现,组件复用 ZEEKR canonical 模式。

### 10.3 实施阶段(从 ROUTE_ARCHITECTURE §14.2)

- [x] Phase 0:文档治理(route 总纲 + README)
- [x] Phase 1:`/product` 入口升级(v2)
- [x] Phase 2:24 个新路由 + 11 legacy redirect
- [ ] Phase 3:单车型页 PRD v0.2(route 字段改为 nested canonical)
- [ ] Phase 4:代码路由实现(`/product/{brand}/{model}`)
- [ ] Phase 5:route registry 测试(slug 漂移防御)
- [ ] Phase 6:5 组件模式各品牌实现(理想/特斯拉/小鹏/腾势/岚图/乐道/高山/智界)
- [ ] Phase 7:13 个单车型页实现
- [ ] Phase 8:业务素材补全 + 3 态切 matched
- [ ] Phase 9:埋点全量挂载 + 验收

---

## 11. 关联 SPEC

- [`product-center.md`](./product-center.md)— `/product` 入口页(11 品牌矩阵)
- [`product-film.md`](./product-film.md)— 车膜服务页(车型页 → 服务页回链)
- [`product-accessories.md`](./product-accessories.md)— 轻改装备服务页
- [`components/topic-pattern.md`](../../components/topic-pattern.md)— 5 组件契约、3 态图片模型、字面量类型
- [`product-prd-spec-map.md`](./product-prd-spec-map.md)— 全部产品 PRD ↔ SPEC 映射表

---

> 最后更新:2026-06-25
> 维护:每次新增品牌 / 车型 PRD 时同步更新本 SPEC,canonical 5 组件模式以 ZEEKR v1 为准。

## 12. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|---|---|---|---|---|
| 2026-06-13 | Claude Code | 问界 / 小米 专题组件模式初始定义 | 完成 | — |
| 2026-06-16 | Claude Code | ZEEKR 专题模式定型(canonical,21 张图 4:3 统一) | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 + 5 组件模式抽取 | 完成 | — |
| 2026-06-25 | Codex / Claude Code | 11 品牌 + 13 车型路由治理 + legacy redirect | 完成 | 单车型 PRD 落地 |
| 2026-06-25 | Claude Code | 整合 17 个品牌 / 车型 PRD 落地为本 SPEC | 完成 | 组件实现 + 业务素材 |
