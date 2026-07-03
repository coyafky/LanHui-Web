# Tesla 系列轻改项目专题页 — 实施计划

> **状态**：✅ 已生成，待用户审批（plan 阶段）
> **创建日期**：2026-06-26
> **架构师**：architect agent / Coya
> **规划输入**：[`TESLA_TOPIC_PRD_2026-06-24.md`](../PRD/product/TESLA_TOPIC_PRD_2026-06-24.md)

---

## 0. 文档定位与架构总览

### 0.1 PRD 来源

| 层级 | PRD 文档 | 路由 | 内容 |
|---|---|---|---|
| **一级** | [`TESLA_TOPIC_PRD_2026-06-24.md`](../PRD/product/TESLA_TOPIC_PRD_2026-06-24.md) | `/product/tesla` | 10 主推 + 32 可选 = 42 项目；6 场景；6 步服务流程；5 FAQ；车型适配边界声明 |

> 注：本期为**单级专题页**，无 `/product/tesla/{model}` 二级详情。`src/lib/product-routes.ts:53` 已注册 `modelSlugs: []`。

### 0.2 架构决策（已固化）

| # | 决策 | 决议 | 理由 |
|---|---|---|---|
| 1 | 路由层级 | **单级专题页** `/product/tesla`，**不**做 `/{model}` 子车型页 | 用户决策 #1；`product-routes.ts` 已 `modelSlugs: []`；一期先建立 Tesla 系列认知边界 |
| 2 | 项目卡片 CTA | **不渲染** PhoneCta；卡片**无**"立即咨询"按钮 | 用户决策 #2；卡片只承载信息（点击触发滚动 + 埋点） |
| 3 | 页面级 CTA | 底部保留"返回产品中心"链接；**不**加 PhoneCta | 用户决策 #3；保持与 wenjie 一级页 CTA 一致 |
| 4 | FeaturedGrid 点击 | 触发 `project_interest_click` 埋点 + **滚动**至对应场景 MoreChoices | 用户决策 #4；卡片本身无 CTA，但仍是有效点击区 |
| 5 | MoreChoices 折叠 | 按 group（6 场景）分组；每组**默认前 4 项展示**，"展开更多"按钮 | 用户决策 #5；与 PRD §9.2「每组前 4-6 项」对齐 |
| 6 | 场景卡点击 | 滚动到 MoreChoices 对应 group；不使用锚点 | 用户决策 #6；锚点会让 SEO URL fragment 不稳定 |
| 7 | 海报资产 | **空态占位**（虚线框 + `ImageIcon` + "特斯拉系列轻改项目海报待补充"）；不引用 `tesla-poster.png` | 用户决策 #7；与 wenjie `WenjieSeriesPosterStub` 一致 |
| 8 | `/product` 入口可见性 | 新增 `TeslaTopicBanner`；修改 `src/app/product/page.tsx` 加"整理中车系"折叠区（`Tesla` 当前为 `status: "planned"`，与 li-auto/xpeng/denza 等同类） | 用户决策 #8；与现有 `getLiveBrands()` + `VehicleTopicMap` 渲染规则一致 |
| 9 | TeslaTopicBanner 实现 | 内容**全部 inline**，**不**依赖 `src/lib/tesla-products.ts` 数据层；第 1 阶段单独交付 | 用户决策 #9；Banner 是入口组件，可在数据层前先发布 |
| 10 | 状态翻转 | 实现完成后改 `product-routes.ts:53` 的 `status: "planned"` → `"live"` | 用户决策 #10；与 wenjie 上线流程一致 |
| 11 | 主题色 | **red**-500/400（与 `product-routes.ts:53` 的 `accentColor: "red"` 一致） | 沿用项目 vehicle_brand 元数据 |
| 12 | 图片规格 | 沿用 `aspect-[4/3] + object-contain + Next/Image sizes`；`imageStatus: "pending-review"` 默认；UI 用文本标签 + `ImageIcon` 占位 | 沿用 wenjie/zeekr/flooring 既有模式 |
| 13 | 数据模型 | 字面量类型约束 `featured.length === 10`、`optional.length === 32`；TS 编译期防漂移 | 沿用 wenjie 模式 |
| 14 | 埋点 SDK | **复用** `src/lib/analytics.ts` 的 `trackClick(target, metadata)`，不扩展 SDK | 沿用 wenjie 决策 |
| 15 | 路由元数据查询 | 复用 `src/lib/product-routes.ts` 的 `getBrandRoute("tesla")` | 现有 stub 已注册 |

### 0.3 文件级影响总览

```
src/
├── app/product/
│   ├── page.tsx                       [修改] /product 入口：新增"整理中车系"折叠区（含 TeslaTopicBanner）
│   └── tesla/
│       └── page.tsx                   [新建] 单级 Tesla 专题页（RSC）
├── components/
│   ├── product/
│   │   └── TeslaTopicBanner.tsx       [新建] /product 入口横幅（全部 inline；不依赖数据层）
│   └── tesla/
│       ├── TeslaTopicHero.tsx         [新建] 01 Hero — RSC
│       ├── TeslaFeaturedGrid.tsx      [新建] 02 10 主推项目 — Client Component（埋点交互）
│       ├── TeslaScenarioMatrix.tsx    [新建] 03 6 场景分类 — Client Component（场景点击滚动）
│       ├── TeslaMoreChoices.tsx       [新建] 04 32 可选项目（按 group 折叠）— Client Component（展开/埋点）
│       ├── TeslaModelFitNote.tsx      [新建] 05 车型适配边界说明 — RSC
│       ├── TeslaServiceFlow.tsx       [新建] 06 6 步服务流程 — RSC
│       ├── TeslaPosterStub.tsx        [新建] 07 海报空态（809×1942）— RSC
│       └── TeslaFaq.tsx               [新建] 08 5 FAQ 折叠 — Client Component
├── lib/
│   └── tesla-products.ts              [新建] 静态数据 + 字面量类型（10 主推 + 32 可选 + 6 场景 + 6 步 + 5 FAQ）
└── app/sitemap.ts                     [修改] 在 wenjieModelRoutes 后追加 teslaTopicRoutes（1 行）
```

> **本计划不修改**：`src/lib/product-routes.ts:53` 的 `status` 字段在所有实现完成、验收通过后由单独 task 翻转（task D.3）。

### 0.4 关键约束

- **零新增 npm 依赖**：复用 `lucide-react`（`ImageIcon`、`Car`、`ArrowRight`、`ChevronDown`、`AlertTriangle`）、`@base-ui/react`、`tailwindcss` v4、`next/image`、`next/link`
- **零数据库变更**：全部静态数据 + 字面量类型；不调用 `prisma.*`
- **零文案合规违规**：PRD §3.3 红线全保留（**不**出现「Tesla 官方授权 / 原厂配件 / 不影响原厂质保 / 100% 无损安装 / 永久质保 / 全网最低」）
- **TypeScript strict**：禁止 `any`；类型从 `@/lib/tesla-products` 导入
- **响应式**：mobile-first；desktop 1440 / tablet 768 / mobile 390 三视口必测
- **图片**：所有升级项目 `imageStatus: "pending-review"`，UI 用文本标签 + `ImageIcon` 占位（**不**用 `next/image` 引用任何未提供素材）
- **海报**：单张 809×1942 竖版长图空态占位；**不**放完整长图，避免 mobile 横滚
- **车型适配边界**：5 号 section 必须显示 PRD §3.2 原文（一字不改）
- **埋点复用**：不扩展 SDK；3 类事件走 `trackClick`
- **Worktree 隔离**：每个 task 在 `.claude/worktrees/agent-tesla-<id>` 中 commit，orchestrator `--no-ff` 合并
- **Worktree 缺 .env / node_modules**：合并后立即 `cp .env` 和 `npm install`

---

## 1. 任务列表（按依赖顺序）

> 总任务数：**24 个 task**（2 入口 + 1 数据层 + 8 组件 + 1 page + 1 sitemap + 1 status 翻转 + 3 埋点 + 5 测试 + 3 门禁 + 2 收尾）

### 阶段 A：基础设施与入口（2 task）

#### A.1 — `/product` 入口 TeslaTopicBanner
- **文件**：`src/components/product/TeslaTopicBanner.tsx`（新建）
- **类型**：RSC
- **内容**（**全部 inline**，**不**依赖数据层）：
  - `href="/product/tesla"`
  - 主题色 **red**（`border-red-700/60`、`text-red-400`、`bg-red-950/30`、`from-red-950/30` 渐变）
  - 标题：`特斯拉系列轻改项目`（用户决策 #9 阶段 1 独立交付）
  - 副标题：`车衣、隔热膜、改色膜、座舱舒适与电动便利升级`（PRD §4）
  - 标签：`Tesla 车型专题` / `新能源轻改方案`
  - 状态徽章：`整理中`（amber 边框，区别于 live 品牌的 cyan/red）
  - 左侧**不放图片**（无海报资产）
  - 图标：`<Car className="w-5 h-5" />`
  - **不**引用 `src/lib/tesla-products.ts`
- **依赖**：无（用户决策 #9 阶段 1 独立交付）
- **验证**：`npx tsc --noEmit` 通过；本地 `/product` 可见入口卡片

#### A.2 — `/product/page.tsx` 增加"整理中车系"折叠区
- **文件**：`src/app/product/page.tsx`
- **改动**：
  1. 顶部 import `TeslaTopicBanner`
  2. 在 `<VehicleTopicMap>` 之后**新增** section `<整理中车系折叠区>`，使用现有 `CollapsibleSection` 组件
  3. 折叠区标题：`更多车型专题正在整理`
  4. 折叠区内容：**本期范围只渲染** `<TeslaTopicBanner />`（其他 planned 品牌 banner 等各自 PRD 后再补）
  5. 折叠区视觉：amber 边框（沿用既有 P1 折叠区配色）
- **依赖**：A.1
- **验证**：`npx tsc --noEmit` 通过；`/product` 三视口下"整理中"折叠区可见

### 阶段 B：数据层（1 task）

#### B.1 — Tesla 数据文件
- **文件**：`src/lib/tesla-products.ts`（新建）
- **导出**：
  ```ts
  export type TeslaProjectPriority = "featured" | "optional";
  export type TeslaProjectCategory =
    | "paint_protection"
    | "film_style"
    | "chassis_protection"
    | "cabin_comfort"
    | "electric_convenience"
    | "infotainment"
    | "exterior_parts"
    | "storage_accessory";

  export type TeslaProject = {
    key: string;
    name: string;
    category: TeslaProjectCategory;
    priority: TeslaProjectPriority;
    order: number;
    summary: string;
    applicableModels?: readonly ("Model 3" | "Model Y" | "Model S" | "Model X")[];
    imageStatus: "matched" | "pending-review" | "missing";
  };

  export type TeslaScenario = {
    key: string;
    name: string;
    description: string;
    projectKeys: readonly string[];
  };

  export type TeslaServiceStep = { step: number; title: string; description: string };
  export type TeslaFaqItem = { question: string; answer: string };

  export const teslaFeaturedProjects: readonly TeslaProject[];    // length === 10
  export const teslaOptionalProjects: readonly TeslaProject[];     // length === 32
  export const teslaScenarios: readonly TeslaScenario[];           // length === 6
  export const teslaServiceSteps: readonly TeslaServiceStep[];     // length === 6
  export const teslaFaq: readonly TeslaFaqItem[];                  // length === 5
  ```
- **数据来源**：直接按 PRD §7（10 项）+ §9.1（32 项）+ §8（6 场景）+ §11（6 步）+ §12（5 FAQ）抄写，**字段值零变更**
- **字面量约束**：开发期 runtime check `assertTeslaDataShape()` 在文件末尾，导出前触发
- **不引入** preview image helper；`imageStatus` 统一为 `"pending-review"`
- **验证**：单文件 vitest 单元测试 `tesla-products.test.ts` 验证长度、key 唯一性、order 单调递增
- **依赖**：无

### 阶段 C：UI 组件层（8 task）

#### C.1 — TeslaTopicHero（01 Hero）
- **文件**：`src/components/tesla/TeslaTopicHero.tsx`
- **类型**：RSC
- **内容**：主标题「特斯拉系列轻改项目」+ 副标题「Tesla 车型专属轻改方案」+ 简介（PRD §6.1）+ 统计 chip（`42 个升级项目` / `Model 3 / Y / S / X` / `6 大用车场景`）+ **无 CTA 按钮**（用户决策 #2）+ breadcrumb；视觉 dark zinc-950 + red-950/30 渐变 + red-700/20 blur
- **依赖**：B.1

#### C.2 — TeslaFeaturedGrid（02 10 主推项目）
- **文件**：`src/components/tesla/TeslaFeaturedGrid.tsx`
- **类型**：Client Component
- **内容**：10 张重点卡片（desktop `lg:grid-cols-5` / `md:grid-cols-2` / `sm:grid-cols-1`）+ 序号 badge（`01`-`10`）+ 分类 badge（red）+ 项目名 + summary + `aspect-[4/3]` 容器 + 文本标签 + `ImageIcon`（**3 态降级**）；**点击**：滚动到 `<div id={"scenario-" + scenarioKey}>` + `trackClick("tesla_featured_click", { projectKey, category, priority: "featured" })`；**无 PhoneCta**
- **依赖**：B.1

#### C.3 — TeslaScenarioMatrix（03 6 场景分类）
- **文件**：`src/components/tesla/TeslaScenarioMatrix.tsx`
- **类型**：Client Component
- **内容**：6 张场景卡（新车保护 / 外观焕新 / 座舱舒适 / 智能影音 / 电动便利 / 储物与小件）+ 场景名 + 描述 + 项目数 badge + 前 3 项目名 + "查看完整方案"；**点击**：`trackClick("tesla_scenario_click", { scenarioKey })` + 滚动到 `MoreChoices` 同 group 锚点
- **依赖**：B.1

#### C.4 — TeslaMoreChoices（04 32 可选项目，按 group 折叠）
- **文件**：`src/components/tesla/TeslaMoreChoices.tsx`
- **类型**：Client Component
- **内容**：32 项文字标签卡片，按 **6 场景 group 分段**；**每组默认前 4 项展开**（用户决策 #5）+ 每组"展开更多（+N）"/"收起"按钮（`ChevronDown` 旋转）；卡片：序号（`11`-`42`）+ 分类 badge + 项目名 + summary + `ImageIcon`（**无图片**）；**点击**：`trackClick("tesla_optional_click", { projectKey, category, priority: "optional", scenarioKey })`
- **依赖**：B.1

#### C.5 — TeslaModelFitNote（05 车型适配边界说明）
- **文件**：`src/components/tesla/TeslaModelFitNote.tsx`
- **类型**：RSC
- **内容**：**必须包含 PRD §3.2 原文（一字不改）**：「不同年份、版本和配置的 Tesla 车型在安装结构、接口、尺寸和空间上可能存在差异。页面项目作为轻改方向参考，最终以到店确认和施工评估为准。」；视觉 amber 边框 + `AlertTriangle`（lucide）+ 中性色文字
- **依赖**：无（静态文案）

#### C.6 — TeslaServiceFlow（06 6 步服务流程）
- **文件**：`src/components/tesla/TeslaServiceFlow.tsx`
- **类型**：RSC
- **内容**：沿用 `WenjieSeriesServiceFlow` 模式但参数化；6 步（车型确认 → 项目选择 → 到店评估 → 施工安装 → 验收交付 → 售后支持）；4 列 / md:3 / sm:1 + red 数字；字面量 runtime check `assertStepLength(steps) === 6`
- **依赖**：B.1

#### C.7 — TeslaPosterStub（07 海报空态）
- **文件**：`src/components/tesla/TeslaPosterStub.tsx`
- **类型**：RSC
- **内容**：**单张**海报空态（原图 809×1942）；`aspect-[4/5]` + `bg-zinc-900` + `border-dashed` + `ImageIcon` + "特斯拉系列轻改项目 · 海报待补充（809 × 1942）"；**不引用** `next/image`、**不引用** 任何 png 文件
- **依赖**：无

#### C.8 — TeslaFaq（08 5 FAQ 折叠）
- **文件**：`src/components/tesla/TeslaFaq.tsx`
- **类型**：Client Component
- **内容**：5 条 FAQ（PRD §12）+ 一次只展开一项 + `ChevronDown` 旋转 + `bg-zinc-900` 圆角 2xl + red 主题色；字面量 runtime check `assertFaqLength(items) === 5`
- **依赖**：B.1

### 阶段 D：页面组装 + sitemap + status live（4 task）

#### D.1 — `/product/tesla/page.tsx`
- **文件**：`src/app/product/tesla/page.tsx`（新建）
- **内容**：
  - **Metadata**（PRD §14）：title / description / keywords / openGraph
  - **页面结构**（按 PRD §5）：Header → Hero → FeaturedGrid → ScenarioMatrix → MoreChoices → ModelFitNote → ServiceFlow → PosterStub → Faq → 底部 CTA（仅"返回产品中心"链接，用户决策 #3）→ Footer
  - **JSON-LD ItemList**：10 + 32 = 42 项
- **依赖**：C.1-C.8

#### D.2 — sitemap 注册
- **文件**：`src/app/sitemap.ts`
- **改动**：在 `wenjieModelRoutes` 之后追加 `teslaTopicRoutes`（1 行）+ `return [...]` 加 `...teslaTopicRoutes`
- **依赖**：D.1

#### D.3 — status 翻转（live）
- **文件**：`src/lib/product-routes.ts:53`
- **改动**：`status: "planned"` → `status: "live"`
- **影响**：本期折叠区逻辑用硬编码列表渲染 Tesla（不依赖 `status`），翻 status 不影响折叠区
- **执行时机**：所有 task D.1 + E + F + G 完成后单独执行
- **依赖**：D.1 + D.2 + 所有验收通过

### 阶段 E：埋点（3 task）

#### E.1 — Topic View 埋点
- **位置**：`/product/tesla/page.tsx` 的 RSC 顶部，渲染 `<TeslaTopicViewTrack />` 客户端组件（新建 `src/components/tesla/TeslaTopicViewTrack.tsx`），内部调用 `trackClick("tesla_topic_view", { topicKey: "tesla" })` 一次
- **依赖**：D.1

#### E.2 — 项目兴趣埋点（featured + optional）
- **位置**：`TeslaFeaturedGrid` + `TeslaMoreChoices`
- **API**：featured → `trackClick("tesla_featured_click", { projectKey, category, priority: "featured" })`；optional → `trackClick("tesla_optional_click", { projectKey, category, priority: "optional", scenarioKey })`
- **实现**：已在 C.2、C.4 中规定
- **依赖**：C.2 + C.4

#### E.3 — 海报资产查看埋点
- **位置**：`TeslaPosterStub` 中"海报待补充"区域
- **API**：`trackClick("tesla_poster_asset_view", { topicKey: "tesla", assetType: "poster", status: "missing" })`
- **依赖**：C.7

### 阶段 F：测试（5 task）

#### F.1 — vitest 单元测试
- **文件**：`src/lib/tesla-products.test.ts`
- **内容**：featured=10 / optional=32 / scenarios=6 / steps=6 / faq=5；key 唯一性；order 单调递增；scenario.projectKeys 引用存在的 project key
- **依赖**：B.1

#### F.2 — Playwright 三视口截图
- **文件**：`e2e/tesla-topic.spec.ts`
- **内容**：1 页 × 3 视口（390/768/1440）= 3 张截图 → `docs/test-reports/tesla-topic-2026-06-26/{viewport}/tesla-topic.png`
- **依赖**：D.1 + D.2

#### F.3 — 内容验收脚本
- **文件**：`scripts/verify-tesla-content.mjs`
- **内容**：启动 dev server → 抓 `/product/tesla` HTML → cheerio 验证 10+32+5 项文本 + PRD §3.2 原文出现；合规红线 grep 7 个关键词
- **依赖**：D.1

#### F.4 — 移动端横向溢出检查
- **内容**：mobile 390px 视口下，海报空态不造成横向滚动（PRD §17.2）
- **验证**：扩展 `e2e/tesla-topic.spec.ts`
- **依赖**：C.7 + D.1

#### F.5 — `/product` 折叠区验证
- **内容**：三视口下 `<TeslaTopicBanner>` 可见且 `href="/product/tesla"` 可跳转
- **验证**：扩展 `e2e/tesla-topic.spec.ts`
- **依赖**：A.2 + D.1

### 阶段 G：质量门禁（3 task）

#### G.1 — `npm run lint`
- **预期**：0 新增 error（已知 1227 个 pre-existing 来自 `.claude/worktrees/.../.next/` + `.claude/plugins/`，**不视为回归**）
- **过滤**：仅检查本计划涉及路径
- **依赖**：所有代码完成

#### G.2 — `npm run typecheck`
- **预期**：0 新增 error（已知 9 个 pre-existing test 文件错误**不视为回归**）
- **依赖**：所有代码完成

#### G.3 — `npm run build`
- **预期**：build 成功；SSG fallback 静态数据（无 Postgres 也可跑）
- **依赖**：所有代码完成

### 阶段 H：收尾（2 task）

#### H.1 — Daily journal
- **文件**：`docs/journal/2026-06-26-tesla-topic.md`
- **内容**：架构决策回顾 + 任务分解 + 验收结果 + 已知遗留 + 后续迭代方向
- **依赖**：所有验收通过

#### H.2 — Worktree 合并
- **步骤**：合并后立即 `npm install`（worktree 独立 node_modules 经验）+ `git merge --no-ff worktree-tesla-{id}` × 5；推 main 前**等用户确认**
- **依赖**：H.1

---

## 2. Worktree 拆分表

| Worktree | 分支名 | 任务范围 | 依赖 |
|---|---|---|---|
| **prep** | `worktree-tesla-prep` | A.1 TeslaTopicBanner + A.2 product/page.tsx 折叠区 | 无 |
| **data** | `worktree-tesla-data` | B.1 tesla-products.ts + F.1 单测 | 无 |
| **ui** | `worktree-tesla-ui` | C.1-C.8 共 8 件组件（RSC + Client 并行 commit） | 无（并行 data） |
| **page** | `worktree-tesla-page` | D.1 page.tsx + D.2 sitemap.ts + E.1 TeslaTopicViewTrack + E.2/E.3 埋点校验 | data + ui 都合 main 后 |
| **finalize** | `worktree-tesla-final` | D.3 status live + F.2-F.5 测试 + G.1-G.3 门禁 + H.1 journal + H.2 merge | 全部前置 |

**合并顺序**：prep → data → ui → page → finalize；`--no-ff` merge。

> 注：合并后立即 `npm install`（worktree 独立 node_modules 经验，见 MEMORY.md 2026-06-19）。

---

## 3. 风险清单与缓解

| 风险 | 触发条件 | 影响 | 缓解 |
|---|---|---|---|
| **海报长图 mobile 横滚** | D.1 误引用真实图片 | 移动端整页可横滚 | F.4 视口断言 + C.7 `aspect-[4/5]` + `max-w-full`；构建期 grep 不得引用任何 png |
| **车型适配边界声明文案漂移** | C.5 重写文案时丢失关键词 | 失去 PRD §3.2 红线保护 | F.3 验证 PRD §3.2 原文一字不差出现 |
| **合规红线命中** | 组件误写"Tesla 官方授权"等 | 合规事故 | F.3 grep 7 关键词；命中即 fail |
| **字面量类型被绕过** | 数据文件用 `as TeslaProject[]` 绕过 length 检查 | 数量漂移 | F.1 单元测试覆盖每个数组 + 数据文件 runtime check |
| **跨 worktree 类型导入** | ui 在 data 合 main 前 import `tesla-products` | 类型 not found | 合并顺序：data → ui → page |
| **`product-routes.ts:53` 翻 status 太早** | D.3 在 page 未完成时翻转 | 入口链 404 | D.3 放在 finalize 阶段，**所有验收通过后**翻转 |
| **TeslaTopicBanner 误用数据层** | 后期把文案挪到 `tesla-products.ts` | 触发 Banner 改动 | A.1 显式注释「**不**依赖数据层」；F.3 验证 Banner HTML 不含 10 项目名 |
| **F.3 grep 误伤** | grep 命中组件名本身 | 误报 fail | grep 模式只匹配完整字符串 + 中文 |
| **Worktree 缺 .env / node_modules** | dispatch 后 dev server 起不来 | 阻断 F.2 | `cp .env .env` + `npm install` |
| **page.tsx 与 product-routes 类型不一致** | 假设 `getBrandRoute("tesla")` 返回非空 | 抛 `throw new Error` | 显式 if-not-found guard |
| **埋点 metadata 缺 scenarioKey** | C.4 漏传 | 无法分析场景点击 | F.3 断言 `data-scenario-key` 属性 |
| **海报空态意外引用图片** | C.7 误用 `next/image` | 占位变真图 | F.3 显式 grep 不得引用 `tesla-poster.png` / `next/image` |

---

## 4. 验收标准（与 PRD §17 一一对应）

### 4.1 内容验收（PRD §17.1）

- [ ] 页面包含 PRD §7 的 10 个主推项目（顺序、名称、分类、价值说明完全一致）
- [ ] 页面包含 PRD §9.1 的 32 个可选项目（按 group 分组）
- [ ] 主推项目和可选项目有明确区分
- [ ] 项目按 PRD §8 的 6 个场景分类
- [ ] 车型适配边界声明（PRD §3.2 原文）出现于第 05 section
- [ ] 全文 grep 不得出现 7 个合规红线关键词

### 4.2 页面验收（PRD §17.2）

- [ ] `/product` 有特斯拉专题入口
- [ ] `/product/tesla` 页面可访问（sitemap + status live）
- [ ] Desktop / Tablet / Mobile 三视口正常
- [ ] 海报长图不造成横向滚动（mobile 390px viewport scrollWidth === clientWidth）
- [ ] 6 大场景卡可点击滚动到对应 MoreChoices group

### 4.3 交互验收（PRD §17.3 + PRD §16）

- [ ] 点击 10 主推触发 `tesla_featured_click` 埋点 + 滚动到对应场景 group
- [ ] 点击 32 可选触发 `tesla_optional_click` 埋点 + 6 组分别有"展开更多"按钮
- [ ] 5 FAQ 折叠交互正常（一次只展开一项）
- [ ] 进入 `/product/tesla` 自动触发 `tesla_topic_view` 埋点
- [ ] 海报空态触发 `tesla_poster_asset_view` 埋点

### 4.4 工程验收（PRD §17.4）

- [ ] 新增数据文件不使用 `any`
- [ ] 不新增数据库表
- [ ] `npm run lint` 在相关路径下 0 新增 error
- [ ] `npm run typecheck` 0 新增 error
- [ ] `npm run build` 通过
- [ ] 字面量类型防漂移：featured=10 / optional=32 / scenarios=6 / steps=6 / faq=5
- [ ] 海报模块不引用任何图片资源
- [ ] worktree 合并后 `npm install` + `npm run check` 全绿
- [ ] sitemap 注册 `/product/tesla`

---

## 5. 验证命令

```bash
# 阶段 B 单元测试
npx vitest run src/lib/tesla-products.test.ts

# 阶段 G 质量门禁
npm run lint 2>&1 | tee /tmp/lint.log | grep -E "src/app/product/tesla|src/components/tesla|src/lib/tesla-products|src/components/product/TeslaTopicBanner|src/app/product/page.tsx"
npm run typecheck
npm run build

# 阶段 F 内容验收
node scripts/verify-tesla-content.mjs

# 阶段 F 三视口截图
npm run dev &
sleep 30
BASE_URL=http://localhost:3000 npx playwright test e2e/tesla-topic.spec.ts

# 合规红线全站检索
cd src && grep -rE "Tesla 官方授权|原厂配件|原厂件|不影响原车质保|不影响原厂质保|100% ?无损安装|100%无损安装|永久质保|全网最低" \
  app/product/tesla components/tesla lib/tesla-products.ts components/product/TeslaTopicBanner.tsx \
  && echo "FAIL: 合规红线触发" || echo "PASS: 合规红线全清"
```

---

## 6. 浏览器视口检查（PRD §17.2）

| 视口 | 设备 | 验收项 |
|---|---|---|
| **Mobile 390px** | iPhone 14 Pro | Hero 一屏半内；10 主推单列；6 场景单列；32 可选按 group 单列；海报空态不溢出（aspect-[4/5] ≤ 390px）；FAQ 折叠正常；折叠区 Banner 可见 |
| **Tablet 768px** | iPad | 10 主推 2 列；6 场景 2 列；32 可选按 group 2-3 列；服务流程 3 列 |
| **Desktop 1440px** | MacBook | 10 主推 2 行 5 列（lg:grid-cols-5）；6 场景 3 列；32 可选按 group 4-6 列；服务流程 4 列；JSON-LD ItemList 全渲染 |

---

## 7. 复用与新增组件清单

### 7.1 复用（不动）

| 组件 | 路径 | 用途 |
|---|---|---|
| `Header` / `Footer` | `src/components/{Header,Footer}.tsx` | 全站壳 |
| `Badge` | `src/components/ui/badge.tsx` | 分类标签 |
| `CollapsibleSection` | `src/components/product/CollapsibleSection.tsx` | /product 折叠区 |
| `VehicleTopicMap` | `src/components/product/VehicleTopicMap.tsx` | /product 主入口渲染（**不动**；Tesla 不进 live brands） |
| `trackClick` | `src/lib/analytics.ts` | 埋点 |
| `getBrandRoute` | `src/lib/product-routes.ts` | 路由元数据查询 |
| `lucide-react` 图标 | `ImageIcon` / `Car` / `ArrowRight` / `ChevronDown` / `AlertTriangle` | UI 图标 |

### 7.2 新增（按依赖顺序）

| # | 组件 | 类型 | 复用度 |
|---|---|---|---|
| 1 | `TeslaTopicBanner` | RSC | /product 入口 |
| 2 | `TeslaTopicHero` | RSC | /product/tesla 用 |
| 3 | `TeslaFeaturedGrid` | Client（埋点） | /product/tesla 用 |
| 4 | `TeslaScenarioMatrix` | Client（点击滚动） | /product/tesla 用 |
| 5 | `TeslaMoreChoices` | Client（展开/埋点） | /product/tesla 用 |
| 6 | `TeslaModelFitNote` | RSC | /product/tesla 用 |
| 7 | `TeslaServiceFlow` | RSC | /product/tesla 用 |
| 8 | `TeslaPosterStub` | RSC | /product/tesla 用 |
| 9 | `TeslaFaq` | Client（折叠） | /product/tesla 用 |
| 10 | `TeslaTopicViewTrack` | Client（pageview 埋点） | /product/tesla 用 |

**总计**：10 个新组件（5 RSC + 5 Client）。

---

## 8. 团队分工（dispatch 推荐）

| Agent | 任务范围 | worktree 分支 |
|---|---|---|
| **Coder** | A.1-A.2 入口（✅ 完成）+ B.1 数据层 | `worktree-tesla-prep` + `worktree-tesla-data` |
| **Webdesign RSC** | C.1 + C.5-C.7 | `worktree-tesla-ui` (part 1) |
| **Webdesign Client** | C.2-C.4 + C.8 | `worktree-tesla-ui` (part 2) |
| **Webdesign Page** | D.1-D.2 + E.1-E.3 | `worktree-tesla-page` |
| **Tester** | F.1-F.5 + G.1-G.3 + D.3 status live + H.1 journal | `worktree-tesla-final` |
| **Orchestrator** | merge + 主分支门禁 | 主分支 |

**依赖顺序**：Coder prep (✅) → Coder data → Webdesign UI × 2 → Webdesign Page → Tester → Orchestrator。

---

## 9. 未决问题（默认决策）

### 9.1 10 主推项目分类是否需要拆分
- **默认决策**：**允许部分类别为空**（不强求均匀分布）

### 9.2 海报空态是否展示原图尺寸
- **默认决策**：**展示尺寸**（`809 × 1942` 在文案后括号显示）

### 9.3 `product-routes.ts:53` 翻 status 时机
- **默认决策**：**merge 时翻转**（与 wenjie 一致）

### 9.4 32 可选项目按 group 折叠实现细节
- **默认决策**：**Client state 自管理**（不用原生 `<details>`）

### 9.5 `TeslaTopicViewTrack` 是否新建组件
- **默认决策**：**新建**（沿用 wenjie `WenjieTopicViewTrack` 模式）

---

## 10. 变更记录

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-26 | v0.1 | 基于 `TESLA_TOPIC_PRD_2026-06-24.md`（v0.1）生成完整 implementation plan；沿用 wenjie-series-upgrade-implementation-plan-2026-06-26 模板；融合 10 项用户决策 | architect agent / Coya |
| 2026-06-26 | v0.2 | A.1+A.2 已完成（commit `6a22353`，WT `worktree-agent-tesla-prep`），准备 merge | orchestrator |
