# NIO ES8 单车型专题页 — 实施计划

> **状态**：待用户审批（plan 阶段，未授权编码）
> **创建日期**：2026-06-27
> **架构师**：prompt-boost + planning-and-task-breakdown / Coya
> **规划输入**：[`NIO_ES8_TOPIC_PRD_2026-06-27.md`](../PRD/product/NIO_ES8_TOPIC_PRD_2026-06-27.md)
> **Skill 路由**：next-best-practices / react-best-practices / faker+MSW（无）

---

## 0. 文档定位与架构总览

### 0.1 PRD 来源

| 层级 | PRD 文档 | 路由 | 内容 |
|---|---|---|---|
| **唯一输入** | [`NIO_ES8_TOPIC_PRD_2026-06-27.md`](../PRD/product/NIO_ES8_TOPIC_PRD_2026-06-27.md) | `/product/nio/es8` | 17 项 AI 预览图项目 + 4 场景 + 4 组合 + 7 步服务 + 9 FAQ；品牌 `/product/nio` 注册 planned 不实装 UI |

### 0.2 架构决策（已固化）

| # | 决策 | 决议 | 理由 |
|---|---|---|---|
| 1 | 路由层级 | **单车型专题页** `/product/nio/es8`（nested canonical）；legacy alias `/product/nio-es8` | 架构 PRD §3.4 / §4.2；与 wenjie-m8 平铺 alias 模式一致 |
| 2 | 品牌专题页 `/product/nio` | **planned**（仅 `product-routes.ts` 注册条目，**不实装** UI） | 用户决策 #1 范围；架构 PRD §6.1 品牌预留规则 |
| 3 | 海报模块 | **不实现**任何海报相关模块、组件、埋点（详见 §0.3 红线） | 用户硬约束；Tesla / Xpeng GX 已识别为 PRD 设计失误；架构 PRD §17 |
| 4 | 图片状态枚举 | 新增 `"generated-preview"` 态；ES8 全部 17 项为此态 | manifest.json 已使用；区别于 `matched/pending-review/missing` |
| 5 | 主题色 | **sky**（`#0ea5e9` = `sky-500`；Tailwind v4 独立色板，与 `cyan`/`blue` 区分；中文「天蓝色」） | 用户决策 2026-06-27；NIO 蔚来视觉识别优先于品牌色 `#00BCD4`；规避与 wenjie `cyan` 撞色 |
| 6 | 项目结构 | **4 场景**（新车保护 / 外观个性 / 家庭座舱 / 行车防护），**不**使用 wenjie 三层 | ES8 17 项偏少，三层会空分类；PRD §8 已定 4 场景 |
| 7 | 推荐组合 | **4 个**（与 4 场景对应） | PRD §9 |
| 8 | FAQ | **9 条**（含「图片是真实施工案例吗」澄清 generated-preview 状态） | PRD §14 |
| 9 | 服务流程 | **7 步**统一流程（与 wenjie M6 一致） | PRD §13 |
| 10 | 图片规格 | `aspect-[4/3] + object-contain + Next/Image sizes`，1448×1086 字面量类型 | manifest.json 已确认；ZEEKR canonical 字面量防漂移 |
| 11 | 数据文件 | `src/lib/nio-products.ts`（17 项 + `nioProducts.{es6,et5,et7,et9}` 注释占位） | 与 wenjie-products.ts / tesla-products.ts 命名一致；预留多车型扩展 |
| 12 | JSON-LD | `ItemList` 含 17 项 + `Vehicle` 标注 | 沿用 wenjie 模式 |
| 13 | 埋点 SDK | 复用 `src/lib/analytics.ts` 的 `trackClick`，不扩展 SDK 事件类型 | 沿用项目惯例 |
| 14 | Worktree 隔离 | `worktree-nio-es8-<id>` 隔离；orchestrator `--no-ff` 合并 | 与 wenjie/tesla/xpeng-gx 一致 |
| 15 | status 翻转 | 所有验收通过后单独 task 翻 planned → live | 与 wenjie M8 / tesla / xpeng-gx 流程一致 |
| 16 | Verify 脚本 | 2 个：`verify-nio-images.mjs`（文件存在 + 字面量）+ `verify-nio-content.mjs`（数据 shape + 合规红线 + JSON-LD） | 与 xpeng-gx/tesla 一致 |
| 17 | UI 组件数量 | **5 件**（3 RSC + 2 Client），**不**复用 wenjie 组件 | 避免被 wenjie 组件 PosterStub 污染；ES8 无海报语义 |
| 18 | 路由元数据查询 | 复用 `src/lib/product-routes.ts` 的 `getBrandRoute("nio")` + `getModelRoute("nio", "es8")` | 现有 stub 注册模式 |
| 19 | 入口 Banner 实现 | 内容**全部 inline**，**不**依赖 `src/lib/nio-products.ts` 数据层 | 与 Tesla/Wenjie TopicBanner 模式一致；Banner 是入口组件，可在数据层前先发布 |
| 20 | sitemap 注册 | `src/app/sitemap.ts` 追加 `nioEs8ModelRoute`（1 行） | 沿用 xpengGxModelRoute 模式 |
| 21 | **AccentColor 扩展** | **新增 `sky` 枚举值** + 8 处 `Record<AccentColor, string>` 映射（`product-routes.ts` + `VehicleTopicMap.tsx` × 3 + `BrandMatrixMap.tsx` × 3 + `StickyTabBar.tsx` × 2） | 用户决策 2026-06-27 改 sky；枚举无 sky 必须先扩展；TS strict 自动校验映射完整性 |

### 0.3 关键红线（**禁止任何海报相关内容**）

> 来源：Tesla 海报模块移除 commit `d3c8cab`、Xpeng GX 海报模块移除 commit `2c9d698`、架构 PRD §17

- ❌ **不创建** `NioEs8PosterStub.tsx` / `NioSeriesPosterStub.tsx` 等任何 PosterStub 组件
- ❌ **不创建** 「查看完整海报」「完整海报展示」「海报素材展示」任何章节或 UI 模块
- ❌ **不引用** 海报原图（`nio-es8-poster.png` 等）
- ❌ **不添加** `poster_expand_click` / `poster_asset_view` 等任何海报相关埋点事件
- ❌ **不写** PRD §X 海报信息表格（海报原图尺寸 941×1672 等）
- ✅ 17 项项目以 HTML 文本方式结构化展示（**这本来就**是页面核心内容，不是「海报」）
- ✅ 图片作为每个项目的卡片背景（4 态 UI），不是页面独立模块

### 0.4 文件级影响总览

```
src/
├── app/product/
│   ├── page.tsx                       [修改] /product 入口：新增"整理中车系"折叠区（含 NioTopicBanner）
│   ├── nio/
│   │   ├── page.tsx                   [新建] 蔚来品牌专题（planned 占位，不实装 UI）
│   │   └── es8/
│   │       └── page.tsx               [新建] 蔚来 ES8 单车型专题页（RSC，主目标）
├── components/
│   ├── product/
│   │   ├── NioTopicBanner.tsx         [新建] /product 入口横幅（全部 inline；不依赖数据层）
│   │   ├── VehicleTopicMap.tsx        [修改] AccentColor "sky" 映射（3 处 Record：BG/BORDER/TEXT）
│   │   ├── BrandMatrixMap.tsx         [修改] AccentColor "sky" 映射（3 处 Record：BORDER/TEXT/BG）
│   │   └── StickyTabBar.tsx           [修改] AccentColor "sky" 映射（2 处 Record：BG/TEXT）
│   └── nio/
│       ├── NioEs8Hero.tsx             [新建] 01 Hero — RSC
│       ├── NioEs8ProjectGrid.tsx      [新建] 02 17 项项目网格 + 4 场景筛选 — Client
│       ├── NioEs8Bundles.tsx          [新建] 03 4 个推荐组合 — RSC
│       ├── NioEs8ServiceFlow.tsx      [新建] 04 7 步服务流程 — RSC
│       └── NioEs8Faq.tsx              [新建] 05 9 FAQ 折叠 — Client
├── lib/
│   ├── nio-products.ts                [新建] 静态数据 + 字面量类型（17 项 + 4 场景 + 4 组合 + 7 步 + 9 FAQ）
│   └── product-routes.ts              [修改] AccentColor 枚举加 "sky"；BRANDS 追加 nio；MODELS 追加 nio/es8；ALL_LEGACY_ALIASES 自动包含
└── app/sitemap.ts                     [修改] 追加 nioEs8ModelRoute（1 行）

scripts/
├── verify-nio-images.mjs              [新建] 文件存在 + 字面量类型校验
└── verify-nio-content.mjs             [新建] 数据 shape + 合规红线 + JSON-LD 校验

e2e/
└── nio-es8-verify.spec.ts             [新建] Playwright 三视口截图 + 交互测试

docs/
├── PRD/product/
│   ├── README.md                      [修改] 表格追加蔚来 NIO 条目
│   └── PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md  [修改] §6.1/§6.2 表追加 NIO + ES8
└── plans/nio-es8-implementation-plan-2026-06-27.md  [本文件]
```

### 0.5 关键约束

- **零新增 npm 依赖**：复用 `lucide-react`、`@base-ui/react`、`tailwindcss` v4、`next/image`、`next/link`
- **零数据库变更**：全部静态数据 + 字面量类型；不调用 `prisma.*`
- **零文案合规违规**：PRD §3.3 红线全保留（**不**出现「蔚来官方授权 / 原厂配件 / 不影响原车质保 / 100% 无损安装 / 永久质保 / 全网最低 / 性能提升 / 制动提升 / 操控提升」）
- **TypeScript strict**：禁止 `any`；类型从 `@/lib/nio-products` 导入
- **响应式**：mobile-first；desktop 1440 / tablet 768 / mobile 390 三视口必测
- **图片**：所有升级项目 `imageStatus: "generated-preview"`；UI 用「预览图」角标区分真实施工图（沿用 wenjie 模式但扩展 4 态）
- **海报红线**：**不实现任何海报相关模块**（参见 §0.3）
- **车型适配边界**：PRD §3.2 原文必须出现于适配说明区（一字不改）
- **埋点复用**：不扩展 SDK；5 类事件走 `trackClick`
- **Worktree 隔离**：每个 task 在 `.claude/worktrees/agent-nio-es8-<id>` 中 commit，orchestrator `--no-ff` 合并
- **Worktree 缺 .env / node_modules**：合并后立即 `cp .env` 和 `npm install`（worktree 隔离经验，见 MEMORY.md）

---

## 1. 任务列表（按依赖顺序）

> 总任务数：**24 个 task**（3 基础设施（含 A.0 AccentColor 扩展）+ 1 数据层 + 5 UI 组件 + 1 页面组装 + 3 埋点 + 5 测试 + 3 门禁 + 2 收尾 + 2 status/legacy）
>
> **垂直切片**：每个 task 一次只解决一个完整可验证路径（如「路由注册 → 数据层 → 单测 → sitemap」是一个垂直切片，不分层做）

### 阶段 A：基础设施与路由（3 task）

> 本阶段 A.0 → A.1 → A.2 严格顺序执行（同一 worktree 内串行；A.0 必须在 A.1 前完成，因 A.1 引用 `accentColor: "sky"`）

#### A.0 — 扩展 `AccentColor` 枚举 + 8 处 Record 映射（**新增**）
- **背景**：2026-06-27 用户决策 NIO 主题色改 sky；当前枚举无 sky
- **文件**：
  - `src/lib/product-routes.ts`（修改，**枚举类型扩展**）
  - `src/components/product/VehicleTopicMap.tsx`（修改，**3 处 Record 映射**）
  - `src/components/product/BrandMatrixMap.tsx`（修改，**3 处 Record 映射**）
  - `src/components/product/StickyTabBar.tsx`（修改，**2 处 Record 映射**）
- **改动 `product-routes.ts`**：
  ```ts
  // 第 10-12 行 AccentColor 联合类型追加 "sky"
  export type AccentColor =
    | "cyan" | "orange" | "amber" | "emerald" | "violet"
    | "pink" | "blue" | "teal" | "red" | "sky";   // ← 新增
  ```
- **改动 3 个组件文件**（每文件末尾追加 `sky` 行）：
  - `VehicleTopicMap.tsx`：
    - `ACCENT_BG.sky = "bg-sky-500"`
    - `ACCENT_BORDER.sky = "border-sky-400"`
    - `ACCENT_TEXT.sky = "text-sky-300"`
  - `BrandMatrixMap.tsx`：同上 3 行
  - `StickyTabBar.tsx`：
    - `ACCENT_BG.sky = "bg-sky-400"`
    - `ACCENT_TEXT.sky = "text-sky-300"`
- **验证**：
  - `npx tsc --noEmit` 通过（TS strict 强制 `Record<AccentColor, string>` 完整性）
  - `grep -E "sky-500|sky-400|sky-300" src/components/product/*.tsx` 命中 8 处
- **依赖**：无
- **风险**：低；TS strict 编译期兜底；如漏补任意一处 Record 映射，typecheck 立即 fail
- **worktree**：infra

#### A.1 — 路由注册表更新（`product-routes.ts` 追加 NIO）
- **文件**：`src/lib/product-routes.ts`（修改）
- **改动**：
  1. `BRANDS` 数组末尾追加：
     ```ts
     { type: "vehicle_brand", brandSlug: "nio", brandName: "蔚来", accentColor: "sky", status: "planned", priority: "P1", canonicalPath: "/product/nio", title: "蔚来轻改方案", navLabel: "蔚来", modelSlugs: ["es8"] }
     ```
  2. `MODELS` 数组末尾追加：
     ```ts
     { type: "vehicle_model", brandSlug: "nio", modelSlug: "es8", modelName: "蔚来 ES8", parentPath: "/product/nio", canonicalPath: "/product/nio/es8", title: "蔚来 ES8 专属升级方案", navLabel: "ES8", status: "planned", priority: "P1", projectCount: 17, sourcePrd: "docs/PRD/product/NIO_ES8_TOPIC_PRD_2026-06-27.md", legacyPaths: ["/product/nio-es8"] }
     ```
  3. `ALL_LEGACY_ALIASES` 通过 `MODELS.flatMap` 自动包含 `/product/nio-es8` → `/product/nio/es8`，**无需修改**
- **验证**：
  - `npx tsc --noEmit` 通过
  - `getBrandRoute("nio")` 返回新条目
  - `getModelRoute("nio", "es8")` 返回新条目
  - `getCanonicalFor("/product/nio-es8")` 返回 `/product/nio/es8`
- **依赖**：无
- **风险**：低；既有 BRANDS/MODELS 模式已稳定

#### A.2 — `/product` 入口 NioTopicBanner + 折叠区
- **文件**：
  - `src/components/product/NioTopicBanner.tsx`（新建，RSC）
  - `src/app/product/page.tsx`（修改）
- **改动 NioTopicBanner**（**全部 inline**，**不**依赖 `nio-products.ts`）：
  - `href="/product/nio/es8"`
  - 主题色 **sky**（`border-sky-700/60`、`text-sky-400`、`bg-sky-950/30`、`from-sky-950/30` 渐变）
  - 标题：`蔚来 ES8 专属升级方案`
  - 副标题：`新车保护、彩绘双拼、铝地板与底盘防护`
  - 标签：`蔚来 ES8` / `大型纯电 SUV 轻改`
  - 状态徽章：`整理中`（amber 边框，区别于 live 品牌的 sky/red）
  - 左侧**不放图片**（无海报资产）
  - 图标：`<Car className="w-5 h-5" />`（沿用 TeslaTopicBanner 模式）
- **改动 `/product/page.tsx`**：
  - import `NioTopicBanner`
  - 在 `<VehicleTopicMap>` 之后**新增** section `<整理中车系折叠区>`（沿用 TeslaTopicBanner 集成模式）
  - 折叠区标题：`更多车型专题正在整理`
  - 折叠区内容：本期渲染 `<NioTopicBanner />`（其他 planned 品牌 banner 等各自 PRD 后再补）
  - 折叠区视觉：amber 边框（沿用既有 P1 折叠区配色）
- **验证**：
  - `npx tsc --noEmit` 通过
  - `/product` 三视口下 `NioTopicBanner` 可见，hover/click 跳 `/product/nio/es8`
- **依赖**：A.1

### 阶段 B：数据层（1 task）

#### B.1 — NIO 数据文件 + 字面量类型 + 单测
- **文件**：
  - `src/lib/nio-products.ts`（新建）
  - `src/lib/nio-products.test.ts`（新建）
- **导出**：
  ```ts
  export type NioEs8ImageStatus = "matched" | "generated-preview" | "pending-review" | "missing";

  export type NioEs8Category =
    | "protection" | "film" | "appearance" | "cabin_protection"
    | "family_cabin" | "chassis" | "driving_protection" | "screen_care" | "interior_care";

  export type NioEs8UpgradeProject = {
    order: number;              // 01-17
    key: string;                // "paint-protection-film" 等稳定 slug
    name: string;               // "车衣" 等中文名
    category: NioEs8Category;
    summary: string;            // 1 句价值说明
    promptSummary: string;      // 来自 manifest promptSummary
    publicPath: `/images/products/nio-es8/generated/${string}.png`;
    width: 1448;                // 字面量
    height: 1086;               // 字面量
    aspectRatio: "4/3";         // 字面量
    imageStatus: NioEs8ImageStatus;  // ES8 全部 "generated-preview"
    suitableFor: readonly string[];  // ["new_car"] / ["family"] / ["appearance"] 等
    caution?: string;
  };

  export type NioEs8Scenario = {
    key: "protection" | "appearance" | "family_cabin" | "driving_protection";
    name: string;
    description: string;
    projectKeys: readonly string[];  // 引用 NioEs8UpgradeProject.key
  };

  export type NioEs8Bundle = {
    key: string;
    name: string;
    description: string;
    projectKeys: readonly string[];
  };

  export type NioEs8ServiceStep = { step: number; title: string; description: string };
  export type NioEs8FaqItem = { question: string; answer: string };

  // 字面量约束（防漂移）
  export const NIO_ES8_PROJECT_COUNT = 17;
  export const NIO_ES8_SCENARIO_COUNT = 4;
  export const NIO_ES8_BUNDLE_COUNT = 4;
  export const NIO_ES8_SERVICE_STEP_COUNT = 7;
  export const NIO_ES8_FAQ_COUNT = 9;

  export const nioEs8UpgradeProjects: readonly NioEs8UpgradeProject[];        // length === 17
  export const nioEs8Scenarios: readonly NioEs8Scenario[];                    // length === 4
  export const nioEs8Bundles: readonly NioEs8Bundle[];                        // length === 4
  export const nioEs8ServiceSteps: readonly NioEs8ServiceStep[];              // length === 7
  export const nioEs8Faq: readonly NioEs8FaqItem[];                           // length === 9

  // 多车型扩展位（注释占位，本期仅 ES8）
  export const nioProducts = {
    es8: nioEs8UpgradeProjects,
    // es6: [] as const,   // 后续 batch
    // et5: [] as const,
    // et7: [] as const,
    // et9: [] as const,
  } as const;
  ```
- **数据来源**：PRD §7.1（17 项）+ §8（4 场景）+ §9（4 组合）+ §13（7 步）+ §14（9 FAQ）抄写，**字段值零变更**
- **字面量 runtime check**：`assertNioEs8DataShape()` 在文件末尾、导出前触发
- **验证**：
  - 单文件 vitest 单元测试 `nio-products.test.ts` 验证：
    - 5 个数组长度严格对齐字面量
    - `key` 唯一性
    - `order` 1-17 严格单调
    - `scenario.projectKeys` 引用的 key 全部存在
    - `bundle.projectKeys` 引用的 key 全部存在
    - 全部 17 项 `imageStatus === "generated-preview"`
    - 全部 `width === 1448` / `height === 1086` / `aspectRatio === "4/3"`
    - 全部 `publicPath` 以 `/images/products/nio-es8/generated/` 开头
- **依赖**：无
- **风险**：低；字段值直接来自 PRD 表格，复制即可

### 阶段 C：UI 组件层（5 task）

> 注意：**NIO ES8 不需要 PosterStub 组件**——这是与 wenjie M6/M7/M8 和 Tesla 的关键差异（参见 §0.3 红线）

#### C.1 — `NioEs8Hero`（01 Hero）
- **文件**：`src/components/nio/NioEs8Hero.tsx`
- **类型**：RSC
- **内容**：
  - 主标题「蔚来 ES8 专属升级方案」（PRD §6.1）
  - 副标题「17 项热门轻改产品目录」
  - 简介（PRD §6.1）
  - 4 场景锚点导航（新车保护 / 外观个性 / 家庭座舱 / 行车防护）
  - 统计 chip：`17 个升级项目` / `4 大用车场景` / `sky 主题色`
  - **无 CTA 按钮**（架构 PRD §2.1：产品页不设计私有操作）
  - breadcrumb
  - **不使用** `next/image` 引用 hero.png（AI 预览图不抢首屏，hero 左侧留文案 + 锚点；hero.png 仅在「17 项素材库」章节作为目录列表的视觉元素）
- **视觉**：dark zinc-950 + sky-950/30 渐变 + sky-700/20 blur（沿用 `WenjieSeriesHero` 模式但改为 sky）
- **依赖**：B.1

#### C.2 — `NioEs8ProjectGrid`（02 17 项项目网格 + 4 场景筛选）
- **文件**：`src/components/nio/NioEs8ProjectGrid.tsx`
- **类型**：Client Component
- **内容**：
  - 4 场景 tab 切换（默认全部展开）
  - 17 张项目卡（desktop `lg:grid-cols-4` / `md:grid-cols-2` / `sm:grid-cols-1`）
  - 序号 badge（`01`-`17`）
  - 分类 badge（sky）+ 场景 badge（sky-700）
  - 项目名 + summary + 1 句 promptSummary
  - `aspect-[4/3]` 容器 + `next/image` + 「预览图」角标（generated-preview 状态）
  - 点击卡片：展开说明面板（不跳转详情页）；埋点 `trackClick("nio_es8_project_click", { projectKey, projectName, category, scenarioKey, imageStatus })`
- **依赖**：B.1

#### C.3 — `NioEs8Bundles`（03 4 个推荐组合）
- **文件**：`src/components/nio/NioEs8Bundles.tsx`
- **类型**：RSC
- **内容**：
  - 4 张组合卡片（新车基础保护 / 外观个性升级 / 家庭座舱升级 / 行车与日常防护）
  - 每张含：组合名 + 价值描述 + 项目数 + 项目列表（紧凑文字标签）
  - 视觉：sky 主题 + 圆角 2xl + 边框
  - **无 CTA 按钮**（架构 PRD §2.1）
  - 组合卡片点击：在 `NioEs8ProjectGrid` 中高亮对应项目（通过事件机制或 hash）
- **依赖**：B.1

#### C.4 — `NioEs8ServiceFlow`（04 7 步服务流程）
- **文件**：`src/components/nio/NioEs8ServiceFlow.tsx`
- **类型**：RSC
- **内容**：
  - 7 步服务流程（PRD §13：车型确认 → 项目选择 → 到店评估 → 方案确认 → 施工安装 → 验收交付 → 售后支持）
  - desktop 4 列 / md:3 列 / sm:1 列
  - sky 数字 + 中性色文字
  - 字面量 runtime check `assertStepLength(steps) === 7`
- **依赖**：B.1

#### C.5 — `NioEs8Faq`（05 9 FAQ 折叠）
- **文件**：`src/components/nio/NioEs8Faq.tsx`
- **类型**：Client Component
- **内容**：
  - 9 条 FAQ（PRD §14，含「图片是真实施工案例吗」澄清 generated-preview 状态）
  - 一次只展开一项（沿用 wenjie TeslaFaq 模式）
  - `ChevronDown` 旋转 + `bg-zinc-900` 圆角 2xl + sky 主题色
  - 字面量 runtime check `assertFaqLength(items) === 9`
- **依赖**：B.1

### 阶段 D：页面组装 + sitemap（2 task）

#### D.1 — `/product/nio/es8/page.tsx`
- **文件**：`src/app/product/nio/es8/page.tsx`（新建）
- **类型**：RSC
- **内容**：
  - **Metadata**（PRD §15）：
    - title：`蔚来 ES8 轻改升级方案｜车衣隔热膜彩绘双拼底盘护板｜蓝辉轻改`
    - description：含 17 项项目关键词
    - keywords：`蔚来 ES8 轻改 / 蔚来 ES8 改装 / 蔚来 ES8 车衣 / 蔚来 ES8 隔热膜 / 蔚来 ES8 彩绘 / 蔚来 ES8 双拼改色 / 蔚来 ES8 铝地板 / 蔚来 ES8 软包脚垫 / 蓝辉轻改`
    - canonical：`/product/nio/es8`
  - **页面结构**（PRD §5）：
    - Header → Hero → 17 项项目网格（4 场景筛选）→ 4 个推荐组合 → 适配说明 → 7 步服务流程 → 9 FAQ → Footer
  - **车型适配边界**：PRD §3.2 原文必须出现于适配说明区（一字不改）
  - **JSON-LD ItemList**：17 项（projectKey, name, category）
  - **不引用** `next/image` 引用 hero.png 在 Hero 位置（参见 C.1）；仅在「17 项素材库」章节作为目录图引用
  - **不使用** `PhoneCta`（架构 PRD §2.1）
- **依赖**：A.1 + C.1-C.5

#### D.2 — sitemap 注册
- **文件**：`src/app/sitemap.ts`（修改）
- **改动**：在 `xpengGxModelRoute` 后追加 `nioEs8ModelRoute`（1 行）：
  ```ts
  const nioEs8ModelRoute: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/product/nio/es8`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ];
  ```
  并在 `return [...]` 中加 `...nioEs8ModelRoute`
- **依赖**：D.1

### 阶段 E：埋点（3 task）

#### E.1 — Topic View 埋点
- **文件**：`src/components/nio/NioEs8TopicViewTrack.tsx`（新建，CC）
- **位置**：在 `/product/nio/es8/page.tsx` 顶部 RSC 渲染一次
- **API**：`trackClick("nio_es8_topic_view", { topicKey: "nio-es8", brandSlug: "nio", modelSlug: "es8", projectCount: 17 })` 调用一次
- **依赖**：D.1

#### E.2 — 项目点击埋点
- **位置**：`NioEs8ProjectGrid`（C.2）
- **API**：`trackClick("nio_es8_project_click", { projectKey, projectName, category, scenarioKey, imageStatus })`
- **依赖**：C.2

#### E.3 — 场景筛选 + 组合点击埋点
- **位置**：
  - `NioEs8ProjectGrid`：4 场景 tab 切换 → `trackClick("nio_es8_scenario_filter", { scenarioKey })`
  - `NioEs8Bundles`：组合卡片点击 → `trackClick("nio_es8_bundle_click", { bundleName })`
- **依赖**：C.2 + C.3

### 阶段 F：测试（5 task）

#### F.1 — vitest 单元测试
- **文件**：`src/lib/nio-products.test.ts`（新建）
- **内容**：
  - 5 个数组长度严格对齐字面量
  - key 唯一性、order 单调、scenario.projectKeys 引用、bundle.projectKeys 引用
  - 全部 17 项 `imageStatus === "generated-preview"`
  - 全部 `width === 1448` / `height === 1086` / `aspectRatio === "4/3"`
  - 全部 `publicPath` 以 `/images/products/nio-es8/generated/` 开头
- **依赖**：B.1

#### F.2 — Playwright 三视口截图
- **文件**：`e2e/nio-es8-verify.spec.ts`（新建）
- **内容**：
  - 1 页 × 3 视口（390 / 768 / 1440）= 3 张截图 → `docs/test-reports/nio-es8-2026-06-27/{viewport}/nio-es8.png`
  - `/product` 折叠区验证：NioTopicBanner 可见 + 跳转 `/product/nio/es8`
- **依赖**：D.1 + D.2

#### F.3 — 内容验收脚本
- **文件**：`scripts/verify-nio-content.mjs`（新建）
- **内容**：
  - 启动 dev server → 抓 `/product/nio/es8` HTML → cheerio 验证：
    - 17 项项目 key/name 全部出现
    - 4 场景 + 4 组合 + 9 FAQ 文本出现
    - PRD §3.2 适配边界原文一字不差出现
    - JSON-LD ItemList 含 17 项
  - **合规红线 grep**（9 关键词命中即 fail）：
    - 蔚来官方授权 / 原厂配件 / 不影响原车质保 / 不影响原厂质保
    - 100% 无损安装 / 永久质保 / 全网最低
    - 性能提升 / 制动提升 / 操控提升
  - **海报红线 grep**（3 关键词命中即 fail）：
    - `poster_expand_click` / `poster_asset_view` / `PosterStub`
- **依赖**：D.1

#### F.4 — 移动端横向溢出检查
- **位置**：扩展 `e2e/nio-es8-verify.spec.ts`
- **验证**：mobile 390px 视口下页面 scrollWidth === clientWidth（**海报空态不存在，本项主要校验表格 / 网格**）
- **依赖**：D.1

#### F.5 — `/product` 折叠区验证
- **位置**：扩展 `e2e/nio-es8-verify.spec.ts`
- **验证**：三视口下 `<NioTopicBanner>` 可见且 `href="/product/nio/es8"` 可跳转
- **依赖**：A.2 + D.1

### 阶段 G：质量门禁（3 task）

#### G.1 — `npm run lint`
- **预期**：0 新增 error（已知 1227 个 pre-existing 来自 `.claude/worktrees/.../.next/` + `.claude/plugins/`，**不视为回归**）
- **过滤**：仅检查本计划涉及路径
- **依赖**：所有代码完成

#### G.2 — `npm run typecheck`
- **预期**：0 新增 error（已知 9 个 pre-existing test 文件错误**不视为回归**）
- **依赖**：所有数据文件 + 组件

#### G.3 — `npm run build`
- **预期**：build 成功；SSG fallback 静态数据（无 Postgres 也可跑）
- **依赖**：所有页面

### 阶段 H：收尾（2 task）

#### H.1 — 文档同步
- **文件**：
  - `docs/PRD/product/README.md`（修改）— 表格追加蔚来 NIO 条目
  - `docs/PRD/product/PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md`（修改）— §6.1 加 NIO 行，§6.2 加 ES8 行
- **依赖**：所有代码完成

#### H.2 — Worktree 合并
- **步骤**：
  1. 在 main 跑 `npm install`（worktree 独立 node_modules 经验）
  2. 主分支 `git pull --no-rebase`
  3. 依次 merge 各 worktree：`git merge --no-ff worktree-nio-es8-{id}`
  4. 解决冲突（`product-routes.ts` 数组末尾 / `sitemap.ts` 中部）
  5. 推 main 前**等用户确认**
- **依赖**：所有验收通过

### 阶段 I：status 翻转（1 task）

#### I.1 — `product-routes.ts` 翻 NIO + nio/es8 为 live
- **文件**：`src/lib/product-routes.ts`（修改）
- **改动**：NIO brand 与 nio/es8 model 的 `status: "planned"` → `"live"`
- **执行时机**：所有 task A.1 + D + E + F + G + H 完成后单独执行
- **影响**：
  - `/product` `getLiveBrands()` 自动包含 NIO
  - `VehicleTopicMap` 可能自动渲染 NIO（取决于实现）— **需检查**：避免与 `<NioTopicBanner>` 折叠区冲突
- **依赖**：A.1 + D.1 + D.2 + 所有验收通过

---

## 2. 验收标准（按 PRD §19 一一对应）

### 2.1 内容验收（PRD §19.3 + §18.1）

- [ ] 页面 `/product/nio/es8` 可访问
- [ ] 17 项项目 key/name/category 与 `manifest.json` 完全一致
- [ ] 4 场景（新车保护 / 外观个性 / 家庭座舱 / 行车防护）覆盖 17 项项目
- [ ] 4 个推荐组合（新车基础保护 / 外观个性升级 / 家庭座舱升级 / 行车与日常防护）完整
- [ ] 7 步服务流程完整
- [ ] 9 FAQ 完整（含「图片是真实施工案例吗」澄清 generated-preview 状态）
- [ ] 车型适配边界 PRD §3.2 原文一字不差出现于适配说明区
- [ ] **页面不包含**「海报素材展示」「完整海报展示」「PosterStub」任何章节 / 模块 / 埋点
- [ ] 全文 grep 9 个合规红线关键词**不出现**
- [ ] 全文 grep 3 个海报红线关键词**不出现**

### 2.2 页面验收（PRD §19.3 + §18.4）

- [ ] `/product` 有蔚来 ES8 入口（折叠区 NioTopicBanner）
- [ ] `/product/nio/es8` 页面可访问（sitemap 注册 + status live）
- [ ] `/product/nio-es8` legacy alias 301 → `/product/nio/es8`（`getCanonicalFor` 验证）
- [ ] Desktop / Tablet / Mobile 三视口正常
- [ ] mobile 390px 无横向滚动（`scrollWidth === clientWidth`）
- [ ] JSON-LD ItemList 含 17 项
- [ ] metadata title/description 按 PRD §15

### 2.3 交互验收（PRD §19.3 + §17）

- [ ] 点击 17 项项目触发 `nio_es8_project_click` 埋点 + 展开说明
- [ ] 4 场景 tab 切换触发 `nio_es8_scenario_filter` 埋点 + 网格筛选
- [ ] 4 推荐组合点击触发 `nio_es8_bundle_click` 埋点 + 项目高亮
- [ ] 9 FAQ 折叠交互正常（一次只展开一项）
- [ ] 进入 `/product/nio/es8` 自动触发 `nio_es8_topic_view` 埋点

### 2.4 工程验收（PRD §19.3 + §7）

- [ ] 新增数据文件不使用 `any`
- [ ] 不新增数据库表
- [ ] `npm run lint` 在相关路径下 0 新增 error
- [ ] `npm run typecheck` 0 新增 error
- [ ] `npm run build` 通过
- [ ] 字面量类型防漂移：projects=17 / scenarios=4 / bundles=4 / steps=7 / faq=9
- [ ] 全部 17 项 `imageStatus === "generated-preview"`
- [ ] worktree 合并后 `npm install` + `npm run check` 全绿
- [ ] sitemap 注册 `/product/nio/es8`
- [ ] `product-routes.ts` 含 NIO brand + nio/es8 model
- [ ] `getCanonicalFor("/product/nio-es8") === "/product/nio/es8"`
- [ ] `src/lib/nio-products.ts` 预留 `nioProducts.es6/et5/et7/et9` 注释占位

---

## 3. 验证命令

```bash
# 阶段 B 单元测试
npx vitest run src/lib/nio-products.test.ts

# 阶段 A 路由注册表测试
npx vitest run src/lib/product-routes.test.ts 2>/dev/null || echo "(需补测试)"

# 阶段 G 质量门禁
npm run lint 2>&1 | tee /tmp/lint.log | grep -E "src/app/product/nio|src/components/nio|src/lib/nio-products|src/components/product/NioTopicBanner|src/app/product/page.tsx|src/app/sitemap.ts"
npm run typecheck
npm run build

# 阶段 F 内容验收
node scripts/verify-nio-content.mjs

# 阶段 F 三视口截图
npm run dev &
sleep 30
BASE_URL=http://localhost:3000 npx playwright test e2e/nio-es8-verify.spec.ts

# 阶段 F 物料校验
node scripts/verify-nio-images.mjs

# 合规红线全站检索
cd src && grep -rE "蔚来官方授权|原厂配件|原厂件|不影响原车质保|不影响原厂质保|100% ?无损安装|100%无损安装|永久质保|全网最低|性能提升|制动提升|操控提升" \
  app/product/nio components/nio lib/nio-products.ts components/product/NioTopicBanner.tsx \
  && echo "FAIL: 合规红线触发" || echo "PASS: 合规红线全清"

# 海报红线全站检索（必须为 0 命中）
cd src && grep -rE "poster_expand_click|poster_asset_view|PosterStub|海报.*展示|完整海报" \
  app/product/nio components/nio lib/nio-products.ts components/product/NioTopicBanner.tsx \
  && echo "FAIL: 海报红线触发" || echo "PASS: 海报红线全清"
```

---

## 4. 浏览器视口检查（PRD §18.4）

| 视口 | 设备 | 验收项 |
|---|---|---|
| **Mobile 390px** | iPhone 14 Pro | Hero 一屏半内；17 项目单列；4 场景 tab 横排；4 组合单列；7 步服务单列；9 FAQ 折叠正常；无横向滚动 |
| **Tablet 768px** | iPad | 17 项目 2 列；4 场景 tab 横排；4 组合 2 列；7 步服务 3 列；FAQ 折叠正常 |
| **Desktop 1440px** | MacBook | 17 项目 2 行（4 列 + 1）；4 场景 tab 横排；4 组合 4 列；7 步服务 4 列；JSON-LD ItemList 全渲染 |

---

## 5. 复用与新增组件清单

### 5.1 复用（不动）

| 组件 | 路径 | 用途 |
|---|---|---|
| `Header` / `Footer` | `src/components/{Header,Footer}.tsx` | 全站壳 |
| `Badge` | `src/components/ui/badge.tsx` | 分类标签 |
| `CollapsibleSection` | `src/components/product/CollapsibleSection.tsx` | /product 折叠区 |
| `VehicleTopicMap` | `src/components/product/VehicleTopicMap.tsx` | /product 主入口渲染（status live 才渲染；NIO 在 I.1 翻转后才进 live brands） |
| `trackClick` / `trackPageView` | `src/lib/analytics.ts` | 埋点 |
| `getBrandRoute` / `getModelRoute` / `getCanonicalFor` | `src/lib/product-routes.ts` | 路由元数据 + legacy alias |
| `lucide-react` 图标 | `Car` / `ChevronDown` / `ArrowRight` / `AlertTriangle` / `ImageIcon` | UI 图标 |
| `WenjieSeriesHero` / `WenjieSeriesFeaturedGrid` / `WenjieSeriesScenarios` 等 | `src/components/wenjie/` | **不复用**（语义差异 + 避免 PosterStub 污染） |

### 5.2 新增（按依赖顺序）

| # | 组件 | 类型 | 复用度 |
|---|---|---|---|
| 1 | `NioTopicBanner` | RSC | /product 入口 |
| 2 | `NioEs8Hero` | RSC | /product/nio/es8 用 |
| 3 | `NioEs8ProjectGrid` | Client（埋点 + 筛选） | /product/nio/es8 用 |
| 4 | `NioEs8Bundles` | RSC | /product/nio/es8 用 |
| 5 | `NioEs8ServiceFlow` | RSC | /product/nio/es8 用 |
| 6 | `NioEs8Faq` | Client（折叠） | /product/nio/es8 用 |
| 7 | `NioEs8TopicViewTrack` | Client（pageview 埋点） | /product/nio/es8 用 |

**总计**：7 个新组件（5 RSC + 3 Client，含 TopicViewTrack）。
**对比**：wenjie M6/M7/M8 共 17 件组件（含 PosterStub × 3），Tesla 共 10 件（含 PosterStub × 1）；NIO ES8 仅 7 件，**不含任何 PosterStub**——这是合规与设计成熟度的体现。

---

## 6. Worktree 拆分表

| Worktree | 分支名 | 任务范围 | 依赖 |
|---|---|---|---|
| **infra** | `worktree-nio-es8-infra` | **A.0 扩展 AccentColor 枚举**（4 文件 9 处改动） + A.1 路由注册 + A.2 NioTopicBanner + product/page.tsx 折叠区 | 无 |
| **data** | `worktree-nio-es8-data` | B.1 nio-products.ts + F.1 单测 | 无（并行 infra） |
| **ui** | `worktree-nio-es8-ui` | C.1-C.5 共 5 件组件 + D.1 page.tsx + D.2 sitemap | data + infra 都合 main 后 |
| **track** | `worktree-nio-es8-track` | E.1 TopicViewTrack + E.2 项目点击 + E.3 场景/组合埋点 | ui 合 main 后 |
| **verify** | `worktree-nio-es8-verify` | F.2 Playwright + F.3 verify-nio-content + F.4/F.5 e2e + verify-nio-images + G.1-G.3 门禁 + H.1 文档 + H.2 合并 | 全部前置 |
| **status-live** | `worktree-nio-es8-status` | I.1 status 翻转 | verify 合 main 后 |

**合并顺序**：infra → data → ui → track → verify → status-live；`--no-ff` merge。

> 注：合并后立即 `npm install`（worktree 独立 node_modules 经验，见 MEMORY.md 2026-06-19）。

---

## 7. 风险清单与缓解

| 风险 | 触发条件 | 影响 | 缓解 |
|---|---|---|---|
| **海报模块复活（最严重）** | 误创建 PosterStub 组件 / 引用 hero.png 作为海报 | 重蹈 Tesla/Xpeng-GX 覆辙 | §0.3 红线 + F.3 grep 3 关键词 + 阶段 C 验收清单显式禁止 PosterStub |
| **车型适配边界文案漂移** | 重写文案丢失关键词 | 失去 PRD §3.2 红线保护 | F.3 验证 PRD §3.2 原文一字不差出现 |
| **合规红线命中** | 组件误写"蔚来官方授权"等 | 合规事故 | F.3 grep 9 关键词；命中即 fail |
| **字面量类型被绕过** | 数据文件用 `as NioEs8UpgradeProject[]` 绕过 length 检查 | 数量漂移 | F.1 单元测试覆盖每个数组 + 数据文件 runtime check |
| **跨 worktree 类型导入** | ui 在 data 合 main 前 import `nio-products` | 类型 not found | 合并顺序：data → ui |
| **`product-routes.ts` 翻 status 太早** | I.1 在 page 未完成时翻转 | `/product` `VehicleTopicMap` 自动渲染 NIO（如果其渲染逻辑基于 live），与 `<NioTopicBanner>` 折叠区冲突 | I.1 放在最末，所有验收通过后翻转 |
| **imageStatus 4 态未识别** | UI 不区分 `generated-preview` 与 `pending-review` | 用户误以为 AI 预览图是真实施工 | C.2 在 `next/image` 上加「预览图」角标；F.1 断言全部 17 项为 `generated-preview` |
| **legacy alias 不生效** | `ALL_LEGACY_ALIASES` 未自动包含 `/product/nio-es8` | 301 跳转失效 | A.1 验证 `getCanonicalFor("/product/nio-es8") === "/product/nio/es8"`；`legacyPaths: ["/product/nio-es8"]` 已写 |
| **Worktree 缺 .env / node_modules** | dispatch 后 dev server 起不来 | 阻断 F.2 | `cp .env .env` + `npm install` |
| **page.tsx 与 product-routes 类型不一致** | 假设 `getModelRoute("nio", "es8")` 返回非空 | 抛 `throw new Error` | 显式 if-not-found guard（沿用 wenjie 模式） |
| **埋点 metadata 缺 scenarioKey** | C.2 漏传 | 无法分析场景点击 | F.3 断言 `data-scenario-key` 属性 |
| **NIO 与 wenjie 撞色风险** | 旧决策 cyan 撞色 | 品牌识别混乱 | **已解决**（2026-06-27）：NIO 改 sky（`#0ea5e9`），wenjie 仍 cyan（`#22d3ee`），色相差 > 40°；后续如需进一步区分可加 brand-icon SVG |

---

## 8. 团队分工（dispatch 推荐）

| Agent | 任务范围 | worktree 分支 |
|---|---|---|
| **Coder infra** | A.0 + A.1 + A.2 | `worktree-nio-es8-infra` |
| **Coder data** | B.1 + F.1 单测 | `worktree-nio-es8-data` |
| **Coder ui (RSC)** | C.1 + C.3 + C.4 + D.1 page.tsx + D.2 sitemap | `worktree-nio-es8-ui` (part 1) |
| **Coder ui (Client)** | C.2 + C.5 | `worktree-nio-es8-ui` (part 2) |
| **Coder track** | E.1 + E.2 + E.3 | `worktree-nio-es8-track` |
| **Tester** | F.2-F.5 + G.1-G.3 + H.1 文档 + H.2 合并 + I.1 status live | `worktree-nio-es8-verify` + `worktree-nio-es8-status` |

**依赖顺序**：infra → data → ui → track → verify → status-live。

---

## 9. 未决问题（默认决策）

### 9.1 NIO 主题色选什么
- **问题（已解决）**：`product-routes.ts` `AccentColor` 枚举中 `cyan` 已被 wenjie 占用；NIO 蔚来原计划用 cyan 会撞色
- **解决**：2026-06-27 用户决策 — **NIO 改 sky**（Tailwind v4 `sky-500=#0ea5e9`，最接近中文「天蓝色」）
- **实现**：扩展 `AccentColor` 枚举加 `sky` 值；补 8 处 `Record<AccentColor, string>` 映射（详见 §0.2 #21 + 新增 A.0 任务）
- **新决策**：**sky**（详见 §0.2 #5）

### 9.2 `/product/nio` 品牌专题页是否本期实装
- **问题**：架构 PRD §6.1 要求每个品牌预留车型二级分类；但本期 PRD 仅 ES8
- **影响**：若实装 `/product/nio` 品牌页会引入「NIO 全系」内容（ES6/ET5 等），超出本期范围
- **建议**：**仅注册 planned**（`product-routes.ts` 留条目），不实装 UI
- **默认决策**：**仅注册不实装**（详见 §0.2 #2）

### 9.3 `imageStatus` 是否新增 `generated-preview` 态
- **问题**：项目现有 3 态 `matched/pending-review/missing`，蔚来 ES8 全部 17 项是 AI 预览图，不属于其中任何一种
- **影响**：若沿用 3 态，会被迫归入 `pending-review`，丢失「AI 预览图非真实施工」语义
- **建议**：**新增 `generated-preview` 态**，UI 显示「预览图」角标
- **默认决策**：**新增 4 态**（详见 §0.2 #4）

### 9.4 17 项是否使用 wenjie 三层结构（必改/商务/小配件）
- **问题**：wenjie M7/M8 用三层；ES8 17 项更接近 wenjie M6（17 项，未用三层）
- **影响**：三层分类会让 ES8 出现空层或分布不均
- **建议**：**用 4 场景**（PRD §8 已定），不强制套用三层
- **默认决策**：**4 场景**

### 9.5 Hero 是否使用 hero.png
- **问题**：manifest.json 提供了 hero.png（AI 生成预览图）
- **影响**：若放 Hero 会强化「蔚来 ES8 主视觉」，但图片是 AI 生成的非真实施工
- **建议**：**Hero 不引用 hero.png**（避免真实施工误判）；hero.png 仅在「17 项素材库」章节作为目录列表的视觉元素
- **默认决策**：**Hero 不引用**

### 9.6 是否复用 wenjie 组件（`WenjieProductCard` 等）
- **问题**：wenjie 已有 `WenjieProductCard` / `WenjieSeriesHero` 等可复用
- **影响**：复用可减少代码量；但 wenjie 组件中部分含 PosterStub 引用风险，且语义不同
- **建议**：**不复用**；新建 NIO 专用组件，避免 PosterStub 污染
- **默认决策**：**不复用**

---

## 10. 审批检查点

> ⚠️ **本 plan 等待用户审批后才能进入 `/dispatch` 阶段**

**必须确认**：
- [ ] 0.3 海报红线全部接受（不创建任何 PosterStub / 海报模块 / 海报埋点）
- [ ] 0.2 #5 主题色 **sky**（Tailwind v4 `sky-500=#0ea5e9`；与 wenjie `cyan` 区分）
- [ ] 0.2 #21 扩展 `AccentColor` 枚举加 `sky` + 8 处 `Record` 映射补全（详见 A.0 任务）
- [ ] 0.2 #2 `/product/nio` 仅注册 planned 不实装 UI
- [ ] 0.2 #4 新增 `generated-preview` 4 态图片
- [ ] 0.2 #6 用 4 场景不用 wenjie 三层
- [ ] 0.2 #9 FAQ 9 条（含 generated-preview 澄清）
- [ ] 0.2 #11 数据文件 `nio-products.ts` 命名（与 wenjie-products.ts / tesla-products.ts 一致）
- [ ] 9.5 Hero 不引用 hero.png（仅在「17 项素材库」章节作为目录图）
- [ ] 9.6 不复用 wenjie 组件（新建 NIO 专用组件）
- [ ] 路由策略：单车型 `/product/nio/es8` nested canonical + legacy alias `/product/nio-es8`
- [ ] 不引入新 npm 依赖
- [ ] 不新增数据库表
- [ ] 字面量类型防漂移（17/4/4/7/9）
- [ ] 任务分工接受 dispatch 多 agent 并行

**审批后流程**：
1. 创建 worktree 分支（infra / data / ui / track / verify / status-live）
2. 启动 Coder infra + Coder data 并行
3. infra + data 合 main 后启动 Coder ui（RSC + Client 并行）
4. ui 合 main 后启动 Coder track（埋点）
5. track 合 main 后启动 Tester verify
6. verify 合 main 后启动 status-live 翻转
7. 最终验收 + 文档 + 截图归档

---

## 11. 变更记录

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-27 | v0.1 | 基于 `NIO_ES8_TOPIC_PRD_2026-06-27.md` 生成完整 implementation plan；23 个 task；6 个 worktree；明确海报红线 + imageStatus 4 态；预留多车型扩展位 | prompt-boost + planning-and-task-breakdown / Coya |
| 2026-06-27 | v0.2 | **主题色 cyan → sky**（用户决策）：NIO 与 wenjie 同 cyan 撞色已避免；新增 A.0 任务扩展 `AccentColor` 枚举加 `sky` + 8 处 Record 映射补全（`product-routes.ts` + `VehicleTopicMap.tsx` × 3 + `BrandMatrixMap.tsx` × 3 + `StickyTabBar.tsx` × 2）；任务总数 23 → 24；worktree 拆分保持 6 个，infra 增加 A.0 | Coya |