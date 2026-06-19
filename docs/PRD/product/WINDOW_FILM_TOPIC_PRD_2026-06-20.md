# 汽车窗膜 PRD (v1)

> 面向 Claude Code 架构师、coder、测试使用的执行规范文档。本版本基于 v0
> (2026-06-14, 已归档为 `.archive`) 重写,把"主题专项 5 组件模式 + 字面量类型防
> 图片规格漂移"从 wenjie/xiaomi/zeekr/flooring 已落地的模式中抽取出来,固化为窗膜
> 专题的实现蓝本。同时显式拆出 **6 通用产品线模式 vs 主题专项模式**两条技术路
> 线,避免与 wenjie/xiaomi/zeekr/flooring 混淆。

## 1. 文档信息

| 项目 | 内容 |
| --- | --- |
| 产品 | 蓝辉轻改 LANHUI 官网 |
| 需求名称 | 汽车窗膜专题页 (含子页 `/[packageSlug]`) |
| 版本 | v1 |
| 日期 | 2026-06-20 |
| 上一版本 | v0 (2026-06-14, 已归档为 `WINDOW_FILM_PACKAGE_DETAIL_PRD_2026-06-14.md.archive`) |
| 页面范围 | `/product/window-film` (列表) + `/product/window-film/[packageSlug]` (套餐详情) |
| 主题色 | `orange` |
| 产品行数量 | 通用产品线 1 项 (`window-film`) + 子页套餐 ≥ 3 (待业务补) |
| 静态数据源 | `src/lib/products.ts` (6 通用产品线聚合) |
| 套餐子页数据源 | `src/lib/window-film-products.ts` (静态) |
| 核心目标 | 把窗膜从"6 通用产品线"模式接入 `getProduct()` 渲染器,同时新增套餐子页 `[packageSlug]` (P0-1 动态路由) |

## 2. 背景

蓝辉轻改的汽车膜业务包括窗膜、改色膜、隐形车衣 (PPF) 三大方向。其中窗膜在用户
购买决策中关注度最高,涉及到隔热、紫外线阻隔、防爆、隐私等多个维度的搭配组合。
当前 `/product/window-film` 页面承载窗膜总览,但缺少"按套餐型号查看参数"的子页
入口。门店反馈客户常询问"哪一款隔热最好""哪一款适合前挡",需要一个稳定的子页
路由承载套餐详情,便于分享、SEO 与埋点分析。

### 2.1 窗膜 vs 其他主题专项的关键差异

| 维度 | wenjie / xiaomi / zeekr / flooring | window-film |
| --- | --- | --- |
| 业务模式 | 主题专项:按车型 / 品牌聚合多个改装款式 | 通用产品线:单一品类多参数搭配 |
| 组件数 | 5 组件 (`AnchorNav` / `ProductCard` / `ProductGrid` / `ProductTable` / `TopicBanner`) | 0 专题组件 (复用 `ProductDetail` 渲染器) |
| 数据源 | `src/lib/<topic>-products.ts` 静态数组 | `src/lib/products.ts` → `getProduct("window-film")` |
| 子页 | 无 | **有** `/[packageSlug]` 套餐子页 (P0-1 动态路由) |
| `imageStatus` 三态 | 必填 (`matched` / `pending-review` / `missing`) | **本期不强制** (通用模式无款式卡片) |
| 字面量类型约束 | 1448×1086 / 4:3 | **本期不强制** (套餐子页图由业务补齐) |

> **重要**:窗膜页面属于"6 通用产品线"模式,与 wenjie/xiaomi/zeekr/flooring 的
> "主题专项"模式**不共用组件**。本 PRD 不强制 `ProductCard` 3 态 UI,但子页
> `[packageSlug]` 的套餐图仍建议走字面量类型规范 (后续迭代可统一)。

### 2.2 源文件

本 PRD 基于以下源文件编写:

- `src/app/product/window-film/page.tsx` — 当前列表页 (使用 `ProductDetail` 渲染器)
- `src/lib/products.ts` — 6 通用产品线聚合 (`getProduct("window-film")`)
- `src/app/product/window-film/[packageSlug]/` — 套餐子页 (P0-1 中,待建)
- `src/lib/window-film-details.ts` — 套餐详情静态数据 (待补,本期 P1)

## 3. 用户与业务目标

### 3.1 用户角色

| 用户 | 需求 |
| --- | --- |
| 新车主 | 想了解窗膜隔热与防紫外线效果,需要看总览与基础概念 |
| 升级车主 | 想对比不同套餐 (前挡 / 侧后挡 / 全车) 的参数 |
| 商务接待用户 | 关注隐私膜与防爆性能,需要按场景选择套餐 |
| 门店销售/运营 | 用一个统一子页向客户展示窗膜套餐参数,减少反复发图 |
| 品牌负责人 | 通过子页落地页提升窗膜业务的咨询转化率 |

### 3.2 业务结果

1. 用户在 `/product` 看到"汽车窗膜"卡片并点击进入。
2. 用户在 `/product/window-film` 查看窗膜总览与卖点。
3. 用户通过套餐子页 `/product/window-film/<slug>` 查看单套餐详细参数 (隔热率、紫外线阻隔率、可见光透过率、厚度、适用部位等)。
4. 用户通过全站统一咨询入口完成转化。

## 4. 范围定义

### 4.1 本轮必须完成

- `/product/window-film` 列表页继续使用 `ProductDetail` 渲染器 (现状保持)。
- 在 `/product/window-film` 列表页下方追加"窗膜套餐"区块,展示 3 个以上套餐入口卡片 (静态数据)。
- 新增动态路由 `/product/window-film/[packageSlug]/page.tsx`,支持按 `slug` 渲染套餐详情。
- 新增 `src/lib/window-film-details.ts` 静态数据文件,字段见 §5。
- 套餐子页 metadata + OpenGraph + JSON-LD (`Product` + `Offer`) 三件套齐全。
- 套餐子页 `generateStaticParams` 枚举所有套餐 slug,SSG 优先。
- 套餐子页缺失或 slug 不存在时 `notFound()`。
- 套餐子页不得暗示"3M 官方授权""龙膜官方合作"等未经确认的主张。
- 列表页与子页均支持桌面、平板、移动端。
- 列表页与子页均通过 `npm run check` (`lint` + `typecheck` + `build`)。

### 4.2 本轮不做

- 不做窗膜电商下单。
- 不做在线报价计算器 (前挡 / 侧后挡组合报价留待后续)。
- 不做库存状态。
- 不做后台 CMS 录入 (套餐数据用静态 TS 文件)。
- 不做 3M / 龙膜 / 威固等品牌官方接口对接。
- 不在套餐子页内嵌入产品视频。
- **本轮不强制 5 组件模式**:列表页继续用 `ProductDetail`,子页用专用 `WindowFilmPackageDetail` 渲染器。
- **本轮不强制 `imageStatus` 三态**:子页套餐图由业务补齐,缺失时直接 `notFound` 或展示默认占位 (不带 3 态)。

## 5. 信息架构

### 5.1 列表页结构 `/product/window-film`

1. Hero (复用 `ProductDetail` 的 hero 区):窗膜品类名 + 卖点 + 总览图。
2. 卖点区:隔热、紫外线阻隔、隐私、防爆。
3. 服务流程:车型确认 → 部位选择 → 套餐推荐 → 施工交付。
4. **新增**:窗膜套餐入口区块 (3+ 套餐卡片,横向 grid)。
5. 底部 CTA + 合规说明。

### 5.2 套餐子页结构 `/product/window-film/[packageSlug]`

1. Hero:套餐名 + 适用部位 + 一句话卖点。
2. 核心参数表 (隔热率、紫外线阻隔率、可见光透过率、厚度、适用部位、质保时长等)。
3. 适用场景描述。
4. 价格信息 (如未确认则不展示,留 TODO)。
5. 服务流程 + 底部 CTA。
6. JSON-LD `Product` + `Offer`。

### 5.3 套餐子页 metadata

| 字段 | 内容 |
| --- | --- |
| title | `<套餐名> | 汽车窗膜套餐 | 蓝辉轻改 LANHUI` |
| description | `<套餐名>:隔热率 X%、紫外线阻隔 Y%、适用部位 ...。蓝辉轻改窗膜服务介绍,到店沟通具体适配。` |
| keywords | `汽车窗膜, 隔热膜, 防爆膜, 隐私膜, <套餐名>, 蓝辉轻改` |
| openGraph.type | `article` |
| JSON-LD | `Product` + `Offer` |

## 6. 内容与数据

### 6.1 套餐数据结构 (`src/lib/window-film-details.ts`)

```ts
// 字面量类型 (与 ZEEKR 主题专项同款,后续迭代可统一)
type Width = 1448;       // 字面量类型
type Height = 1086;
type AspectRatio = "4/3";
type MinPackages = 3;

export type WindowFilmPackage = {
  slug: string;              // 套餐 slug,例 "front-windshield-premium"
  name: string;              // 展示名,例 "前挡尊享套餐"
  position: "前挡" | "侧后挡" | "全车" | "天窗";
  highlights: string[];      // 一句话卖点,例 ["隔热率 95%", "紫外线阻隔 99%"]
  specs: {
    heatRejection: string;   // 隔热率
    uvRejection: string;     // 紫外线阻隔率
    visibleLightTransmittance: string; // 可见光透过率
    thickness: string;       // 厚度,mil
    warranty: string;        // 质保时长
    suitableParts: string[]; // 适用部位
  };
  scenario: string;          // 适用场景描述
  previewImage: string;      // Hero 预览图路径
  image: {
    publicPath: string;
    width: Width | null;     // 业务补图后必填
    height: Height | null;
    aspectRatio: AspectRatio | null;
  };
};
```

### 6.2 字面量类型 (防图片规格漂移)

参照 [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) §8.2 / §8.5:

```ts
type Width = 1448;
type Height = 1086;
type AspectRatio = "4/3";
type MinPackages = 3;
```

> **关键**:用字面量类型而非 `number`,从 TS 编译期杜绝"图片规格漂移"。
> 后续如果套餐图需要新规格 (例如 1200×900),必须通过 PRD refine 明确规格,
> 而不是悄悄换值。本期 `image.width/height/aspectRatio` 允许 `null`,因为
> 业务补图过程中可能临时缺图,但**一旦填入必须是字面量类型值**。

### 6.3 套餐清单 (示例,≥ 3 条)

| slug | 套餐名 | 适用部位 | 核心参数 |
| --- | --- | --- | --- |
| `front-windshield-premium` | 前挡尊享套餐 | 前挡 | 隔热 95% · 紫外线阻隔 99% · 可见光透过率 70% |
| `side-rear-comfort` | 侧后挡舒适套餐 | 侧后挡 | 隔热 80% · 紫外线阻隔 99% · 隐私增强 |
| `full-car-protection` | 全车防护套餐 | 前挡 + 侧后挡 | 隔热 88% · 紫外线阻隔 99% · 防爆 |

> **套餐清单 ≥ 3 条**是字面量类型 `MinPackages = 3` 的硬性约束,数据少于 3 条
> TS 编译期就会报错。

### 6.4 合规措辞

页面必须避免:

- "3M 官方"、"龙膜官方"、"威固官方"、"厂家授权"
- "原厂膜"、"100% 隔热"、"永久质保"

如果业务能提供对应证明,再通过 PRD refine 单独补充。

## 7. UI / 交互

### 7.1 视觉规范

- **主色**: orange-500/400 (与小米 / 极氪一致,窗膜走"暖橙"调性)
- **背景**: zinc-950
- **图片容器**: `aspect-[4/3] + object-contain` (子页套餐图)
- **字体**: Geist Sans

### 7.2 5 组件清单

| 组件 | 路径 | 类型 | 说明 |
| --- | --- | --- | --- |
| — | — | — | **本期不强制 5 组件** |

> 窗膜属于"6 通用产品线"模式,复用 `<ProductDetail>` 渲染器。本表保留 5 组件
> 表头仅为符合模板占位。子页 `[packageSlug]` 使用专用 `WindowFilmPackageDetail`
> 渲染器 (内嵌在 page.tsx 或单独组件)。

### 7.3 3 态 imageStatus UI

| 状态 | 显示 |
| --- | --- |
| `matched` | 正常图片 + 套餐名 + 核心参数 |
| `pending-review` | 占位 + "图片审核中" 标签 |
| `missing` | 占位 + "图片即将上线" 标签 |

> **本期不强制** 3 态 UI。子页套餐图缺失时直接 `notFound` 或展示默认占位
> (单态降级)。后续迭代如窗膜升级为主题专项模式,需补齐 3 态。

### 7.4 三视口响应式

| 视口 | 行为 |
| --- | --- |
| Desktop 1440 | 套餐卡片网格 3 列,参数表 2 列 |
| Tablet 768 | 套餐卡片网格 2 列,参数表 1 列 |
| Mobile 390 | 套餐卡片网格 1 列,Hero 文字不溢出 |

### 7.5 锚点导航

> **本期不做**锚点导航。列表页套餐入口区块直接用 grid 展示,无需锚点跳转。
> 后续如窗膜升级为多品牌 / 多车型主题专项,再补 `AnchorNav`。

## 8. 数据模型

### 8.1 静态数据

- `src/lib/products.ts` — 6 通用产品线聚合 (`getProduct("window-film")`)
- `src/lib/window-film-details.ts` — 套餐详情静态数组 (本期新增)

**字面量类型**:

```ts
type Width = 1448;
type Height = 1086;
type AspectRatio = "4/3";
type MinPackages = 3;
```

### 8.2 数据结构

```ts
type WindowFilmPackage = {
  slug: string;
  name: string;
  position: "前挡" | "侧后挡" | "全车" | "天窗";
  highlights: string[];
  specs: {
    heatRejection: string;
    uvRejection: string;
    visibleLightTransmittance: string;
    thickness: string;
    warranty: string;
    suitableParts: string[];
  };
  scenario: string;
  previewImage: string;
  image: {
    publicPath: string;
    width: Width | null;
    height: Height | null;
    aspectRatio: AspectRatio | null;
  };
};
```

### 8.3 CI 验证脚本

> **本期不做** `verify-window-film-images.mjs`。理由:
>
> - 6 通用产品线模式无 `ProductCard` 3 态 UI 容器,图片规格漂移风险低。
> - 套餐子页图由业务补齐,补图过程已用字面量类型 `Width/Height/AspectRatio`
>   在 TS 编译期约束。
> - 后续如窗膜升级为主题专项模式 (与 wenjie/xiaomi/zeekr/flooring 拉齐),
>   再补 `scripts/verify-window-film-images.mjs` 并链入 `npm run check`。

## 9. API 接口

| Method | 路径 | 用途 |
| --- | --- | --- |
| — | — | 列表页与子页均为 SSG 静态,**不调用 API** |

> 窗膜数据走 `src/lib/products.ts` 与 `src/lib/window-film-details.ts` 静态聚合,
> 与 wenjie/xiaomi/zeekr/flooring 主题专项模式一致 (RSC 优先 + API-first
> fallback 静态)。

## 10. SEO 与内容合规

### 10.1 Metadata

列表页 metadata 保持现状 (title: `汽车窗膜 | 蓝辉轻改 LANHUI`)。

套餐子页 metadata:

| 字段 | 内容 |
| --- | --- |
| title | `<套餐名> | 汽车窗膜套餐 | 蓝辉轻改 LANHUI` |
| description | `<套餐名>:隔热率 X%、紫外线阻隔 Y%、适用部位 ...。蓝辉轻改窗膜服务介绍,到店沟通具体适配。` |
| keywords | `汽车窗膜, 隔热膜, 防爆膜, 隐私膜, <套餐名>, 蓝辉轻改` |
| openGraph.title | 同 title |
| openGraph.description | 同 description |
| openGraph.type | `article` |
| openGraph.images | 套餐预览图 |
| JSON-LD | `Product` + `Offer` |

### 10.2 合规措辞

页面必须避免:

- "3M 官方"、"龙膜官方"、"威固官方"、"厂家授权"
- "原厂膜"、"100% 隔热"、"永久质保"

### 10.3 推荐在套餐子页底部加入:

```
本套餐参数来自窗膜厂商公开技术资料,品牌与型号名称仅用于说明适配对象;具体
施工效果以门店实际沟通为准。
```

## 11. shadcn 使用边界

可以优先复用:

- `Card`:套餐入口卡片、参数卡
- `Table`:核心参数表
- `Badge`:套餐类型、适用部位

UI 决策仍以本 PRD、`CLAUDE.md`、`AGENTS.md` 和蓝辉项目视觉规范为准。

## 12. 数据模型建议

首版使用静态数据文件 `src/lib/window-film-details.ts`:

```ts
export const windowFilmPackages: WindowFilmPackage[] = [
  {
    slug: "front-windshield-premium",
    name: "前挡尊享套餐",
    position: "前挡",
    highlights: ["隔热率 95%", "紫外线阻隔 99%"],
    specs: {
      heatRejection: "95%",
      uvRejection: "99%",
      visibleLightTransmittance: "70%",
      thickness: "2 mil",
      warranty: "5 年",
      suitableParts: ["前挡风玻璃"],
    },
    scenario: "长途驾驶与城市通勤兼顾,前挡视线清晰且有效隔热。",
    previewImage: "/images/products/window-film/front-windshield-premium.jpg",
    image: {
      publicPath: "/images/products/window-film/front-windshield-premium.jpg",
      width: 1448,
      height: 1086,
      aspectRatio: "4/3",
    },
  },
  // ≥ 3 条套餐
];
```

实现要求:

- `slug` 使用稳定 slug,例 `front-windshield-premium`。
- `image.width/height/aspectRatio` 一旦填入必须是字面量类型值。
- 套餐数组长度 ≥ `MinPackages = 3`。
- 套餐子页通过 `generateStaticParams` 枚举所有 slug。
- 若后续接后台 CMS,再由单独 PRD 定义数据库模型。

## 13. 架构师执行规范

架构师负责定义页面结构、数据模型、组件边界和资产路径。

必须确认:

- 列表页继续使用 `<ProductDetail>` 渲染器,本期不重构。
- 套餐子页路由 `/product/window-film/[packageSlug]`,`generateStaticParams` 枚举所有 slug。
- 套餐静态数据文件 `src/lib/window-film-details.ts`,字段见 §6.1。
- `image.width/height/aspectRatio` 字段用字面量类型,业务补图过程 TS 编译期保证规格不漂移。
- 套餐 ≥ 3 条 (`MinPackages = 3`) 字面量约束。
- 子页 `notFound()` 行为:slug 不存在或业务标记"下架"时返回 404。
- 复用全站统一咨询组件 (`<PhoneCta>`),不新增专题私有咨询体系。
- 不扩大本轮范围到电商、报价、库存、后台或 3D 模拟。

**模式声明**:

> 窗膜属于"6 通用产品线"模式,与 wenjie/xiaomi/zeekr/flooring 的"主题专项"
> 模式不共用组件。架构师在评审其他专题 PRD 时不应要求窗膜走 5 组件 + 3 态 UI;
> 反之亦然,窗膜不强制字面量类型图约束 (但字面量类型字段保留,后续迭代可平滑升级)。

## 14. Coder 执行规范

Coder 根据架构师方案实现页面,必须遵守:

- 读取 Next.js 16 相关文档后再改 App Router 代码。
- 不在页面中引用微信缓存路径或本机绝对路径。
- 不使用 `any`。
- 图片使用 Next/Image 组件,带 `sizes` 属性。
- 保持 Tailwind v4 与当前产品页风格一致 (暗色主题、orange-500/400 主色)。
- 可复用 shadcn 组件,但 shadcn 只是组件库,不替代 PRD。
- 不破坏现有产品中心、其他产品页、门店页、新闻页。
- 不引入新 UI 库。
- 不把整个页面变成 Client Component,除非套餐 tabs 或埋点确实需要小型客户端组件。
- 套餐图 `image.width/height/aspectRatio` 一旦填入必须是字面量类型值,不允许 `number`。
- 完成后运行 `npm run lint`、`npm run typecheck`、`npm run build`。

## 15. 测试执行规范

### 15.1 功能测试

| 用例 | 步骤 | 期望 |
| --- | --- | --- |
| 列表页渲染 | 打开 `/product/window-film` | 显示窗膜总览 + 套餐入口区块 |
| 套餐入口跳转 | 点击任意套餐卡片 | 跳转到 `/product/window-film/<slug>` |
| 子页渲染 | 打开 `/product/window-film/front-windshield-premium` | Hero + 参数表 + 场景描述 + CTA |
| 套餐不存在 | 打开 `/product/window-film/non-existent` | 返回 404 |
| 参数表完整 | 查看任意子页 | 隔热率 / UV 阻隔 / 可见光透过率 / 厚度 / 质保 / 适用部位全部展示 |
| 合规文案 | 搜索页面文案 | 不出现 "3M 官方"、"原厂膜" 等 |

### 15.2 响应式测试

至少验证 390 / 768 / 1440 三个视口:

- Hero 文案不溢出。
- 套餐卡片网格 3 → 2 → 1 列变化正常。
- 参数表 2 → 1 列变化正常。

### 15.3 回归测试

- `/product` 现有产品方向仍可访问。
- `/product/color-film`、`/product/ppf` 不受影响。
- Header / Footer 正常。
- `npm run lint`、`npm run typecheck`、`npm run build` 全部通过。

## 16. 验收标准

本需求完成必须同时满足:

- `/product/window-film` 列表页可见 ≥ 3 个套餐入口卡片。
- `/product/window-film/[packageSlug]` 子页可访问并具有独立 metadata + JSON-LD。
- 子页 `generateStaticParams` 枚举所有套餐 slug。
- 子页 slug 不存在时返回 404。
- 套餐静态数据数组长度 ≥ `MinPackages = 3`,TS 编译期强制。
- 子页 `image.width/height/aspectRatio` 一旦填入必须是字面量类型值 (1448/1086/"4/3")。
- 页面不出现 "3M 官方"、"龙膜官方"、"原厂膜" 等未经确认措辞。
- 移动端、平板端、桌面端布局正常。
- `lint`、`typecheck`、`build` 全部通过。
- 测试提供至少一张桌面截图和一张移动端截图。
- PR 描述或 commit message 引用本 PRD,标记「6 通用产品线 + 子页」模式。

## 17. 风险与处理

| 风险 | 处理 |
| --- | --- |
| 套餐图缺失 (业务未补齐) | 子页 `notFound()` 或单态占位降级,后续业务补图后切换 |
| 套餐参数来源不清晰 | 在数据文件中标注来源字段 (例 `source: "vendor-public-datasheet"`) |
| 用户误认为官方授权 | 套餐子页底部加入合规说明 |
| 子页路由与未来电商冲突 | 子页使用 `[packageSlug]` 而非 `[id]`,避免与商品 ID 混淆 |
| 字面量类型约束太严 | `image.width/height/aspectRatio` 允许 `null`,业务补图过程友好 |
| 与主题专项模式混淆 | 架构师评审时明确"6 通用产品线 vs 主题专项"两条线不互通 |

## 18. 后续迭代入口

本轮验收通过后,可进入下一轮:

1. **窗膜升级为主题专项模式** (参照 [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md)):
   - 新增 `src/components/window-film/` 5 组件 (`AnchorNav` / `ProductCard` / `ProductGrid` / `ProductTable` / `TopicBanner`)。
   - 新增 `scripts/verify-window-film-images.mjs`,链入 `npm run check`。
   - 把字面量类型从可选 (`null`) 升级为必填。
   - 套餐图全部补齐到 1448×1086 / 4:3 / PNG / ASCII slug。
2. **窗膜套餐电商化**:在子页内集成报价计算器 (前挡 / 侧后挡组合报价)。
3. **后台维护窗膜套餐数据**:从静态 TS 升级到 CMS + Prisma 数据库。
4. **窗膜效果案例图库**:收集实际施工案例,作为套餐子页的补充展示。
5. **窗膜咨询数据看板**:在 `/admin/analytics` 增加窗膜专题转化漏斗。

## 19. 变更记录

| 版本 | 日期 | 主要变更 | 作者 |
| --- | --- | --- | --- |
| v0 | 2026-06-14 | 初版 (套餐详情页 PRD,无主题专项模式) | — |
| v1 | 2026-06-20 | 重写。①明确"6 通用产品线 vs 主题专项"两条技术线;②新增 `[packageSlug]` 动态子页 + `generateStaticParams`;③新增 `src/lib/window-film-details.ts` 静态数据 + 字面量类型 `Width/Height/AspectRatio/MinPackages`;④套餐子页 metadata + JSON-LD 三件套;⑤套餐 ≥ 3 条字面量约束;⑥明确"本期不强制 5 组件 / 不强制 3 态 UI / 不强制 CI 脚本";⑦§18 后续迭代新增"窗膜升级为主题专项模式"路径 | Claude Code |