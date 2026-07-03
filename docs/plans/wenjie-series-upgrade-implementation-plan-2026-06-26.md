# 问界系列项目升级方案 — 实施计划

> **状态**：待用户审批（plan 阶段，未授权编码）
> **创建日期**：2026-06-26
> **架构师**：prompt-boost / Coya
> **规划输入**：4 份 PRD（1 份一级 + 3 份二级）

---

## 0. 文档定位与架构总览

### 0.1 PRD 来源

| 层级 | PRD 文档 | 路由 | 内容 |
|---|---|---|---|
| **一级** | [`WENJIE_SERIES_UPGRADE_PRD_2026-06-24.md`](../PRD/product/WENJIE_SERIES_UPGRADE_PRD_2026-06-24.md) | `/product/wenjie` | 系列总入口：10 热门 + 24 更多 + 7 场景 + 6 步服务流程 + 6 条 FAQ |
| **二级** | [`WENJIE_M6_TOPIC_PRD_2026-06-25.md`](../PRD/product/WENJIE_M6_TOPIC_PRD_2026-06-25.md) | `/product/wenjie/m6` | 17 项 M6 单车型方案（单层级） |
| **二级** | [`WENJIE_M7_TOPIC_PRD_2026-06-25.md`](../PRD/product/WENJIE_M7_TOPIC_PRD_2026-06-25.md) | `/product/wenjie/m7` | 30 项 M7（5 必改 + 15 商务 + 10 小配件，三层结构） |
| **二级** | [`WENJIE_M8_TOPIC_PRD_2026-06-25.md`](../PRD/product/WENJIE_M8_TOPIC_PRD_2026-06-25.md) | `/product/wenjie/m8` | 30 项 M8（5 必改 + 15 商务 + 10 小配件，三层结构 + 电动门适配提示） |

### 0.2 架构决策（已固化）

| 决策 | 决议 | 理由 |
|---|---|---|
| 一级 vs 二级拆分 | **采用** `/product/wenjie` 一级入口 + `/product/wenjie/{m6,m7,m8}` 二级详情 | PRD §4 推荐；SEO/分享/埋点更清晰；与已存在的子路由目录一致 |
| 海报资产处理 | **不做**，4 个 PRD 的"海报素材展示"模块统一做**空态占位**（虚线框 + "海报待补充"） | 用户 2026-06-26 决策："先不用海报资产" |
| 海报原图尺寸 | 不引入任何 `upgrade-poster*.png` 文件 | 资产未到位前不污染 `public/` |
| M7/M8/M9 旧 44 个产品款式数据 | **从 `/product/wenjie` 移除**；保留 `src/lib/wenjie-products.ts` 文件以备后端回退，但**不渲染** | 新架构以"项目升级方案"为一级内容，旧 44 个款式数据可迁移至 `/product/wenjie/{model}/products` 二级路由（不在本期范围） |
| M9 车型 | **不在本期实现**。子路由只有 M6/M7/M8 | 用户未提 M9，3 个子车型 PRD 都是 M6/M7/M8 |
| 路由命名 | 一级 `/product/wenjie`；二级 `/product/wenjie/m6`、`m7`、`m8`（小写） | 现有 stub 目录已是小写，无需迁移 |
| 主题色 | wenjie = **cyan**-500/400（M6/M7/M8 沿用，与项目既有 `WenjieTopicBanner` 一致） | `WenjieTopicBanner.tsx:30` 已用 cyan-950/400 |
| 图片规格 | 沿用项目标准 `1448×1086 / 4:3 / PNG / ASCII slug` | `WENJIE_TOPIC_PRD_2026-06-20.md §8.2` |
| 数据模型 | 字面量类型约束 `featured.length === 10`、`optional.length === 24`、`M6 === 17`、`M7 === 30`、`M8 === 30` | TS 编译期防漂移 |
| 埋点 SDK | **复用** `src/lib/analytics.ts` 的 `trackClick(target, metadata)`，不扩展 SDK 事件类型 | 现有 SDK 已支持 click + metadata |
| 路由元数据查询 | 复用 `src/lib/product-routes.ts` 的 `getBrandRoute("wenjie")` 和 `getModelRoute("wenjie", "m6")` | 现有 stub 已在用，brand/model 字段已注册 |
| 复用组件 | `PhoneCta`、`Header`、`Footer`、`Badge`、lucide 图标；shadcn `Card`/`Tabs`/`Accordion` | 项目已装 Base UI + Tailwind v4 |

### 0.3 文件级影响总览

```
src/
├── app/product/wenjie/
│   ├── page.tsx                       [重写] 一级入口
│   ├── m6/page.tsx                    [重写] 二级 M6 详情
│   ├── m7/page.tsx                    [重写] 二级 M7 详情
│   └── m8/page.tsx                    [重写] 二级 M8 详情
├── components/wenjie/
│   ├── WenjieAnchorNav.tsx            [扩展] 支持多 group 锚点
│   ├── WenjieProductCard.tsx          [保留] 不动（M9 旧款式用，本期不渲染）
│   ├── WenjieProductGrid.tsx          [保留] 不动
│   ├── WenjieProductTable.tsx         [保留] 不动
│   ├── WenjieTopicBanner.tsx          [保留] 不动（`/product` 入口）
│   ├── WenjieSeriesUpgradeHero.tsx    [新增] 一级 Hero
│   ├── WenjieSeriesFeaturedGrid.tsx   [新增] 10 项热门
│   ├── WenjieSeriesScenarios.tsx      [新增] 7 场景分类
│   ├── WenjieSeriesMoreChoices.tsx    [新增] 24 项更多
│   ├── WenjieSeriesSubModelsGrid.tsx  [新增] 3 子车型入口
│   ├── WenjieSeriesServiceFlow.tsx    [新增] 6 步流程
│   ├── WenjieSeriesFaq.tsx            [新增] FAQ 折叠
│   ├── WenjieSeriesPosterStub.tsx     [新增] 海报空态占位
│   ├── WenjieModelUpgradeHero.tsx     [新增] M6/M7/M8 共用 Hero
│   ├── WenjieModelProjectGrid.tsx     [新增] M6 单层 17 项网格
│   ├── WenjieModelTierSection.tsx     [新增] M7/M8 三层结构组件
│   ├── WenjieModelScenarios.tsx       [新增] 二级场景分类
│   ├── WenjieModelBundles.tsx         [新增] 推荐组合（M6=3 / M7=4 / M8=4）
│   ├── WenjieModelServiceFlow.tsx     [新增] 二级 7 步流程
│   ├── WenjieModelFaq.tsx             [新增] 二级 FAQ
│   └── WenjieModelPosterStub.tsx      [新增] 海报空态（M6/M7/M8）
├── lib/
│   ├── wenjie-products.ts             [保留数据] 旧 44 款式保留备用，本期不渲染
│   ├── wenjie-series-upgrade-projects.ts [新增] 一级 10+24+7+6+FAQ
│   ├── wenjie-m6-upgrade-projects.ts  [新增] M6 17 项 + 场景 + 组合 + 服务 + FAQ
│   ├── wenjie-m7-upgrade-projects.ts  [新增] M7 30 项 + 场景 + 组合 + 服务 + FAQ
│   └── wenjie-m8-upgrade-projects.ts  [新增] M8 30 项 + 场景 + 组合 + 服务 + FAQ
└── ... (其他既有文件不动)
```

### 0.4 关键约束

- **零新增 npm 依赖**：复用 `lucide-react`、`@base-ui/react`、`tailwindcss` v4、`zod`
- **零数据库变更**：全部静态数据 + 字面量类型
- **零文案合规违规**：4 个 PRD §3.3 红线全保留（不问界/华为/鸿蒙智行官方、不原厂件、不影响质保、不 100% 无损、不永久质保、不全网最低、不性能/操控/制动承诺）
- **TypeScript strict**：禁止 `any`；类型从 `@/lib/wenjie-*-upgrade-projects` 导入
- **响应式**：mobile-first；desktop 1440 / tablet 768 / mobile 390 三视口必测
- **图片**：所有升级项目 `imageStatus: "pending-review"`，UI 用文本标签 + `ImageIcon` 占位
- **埋点复用**：不扩展 SDK；4 类事件走 `trackClick`
- **Worktree 隔离**：每个 task 在 `.claude/worktrees/agent-wenjie-upg-<id>` 中 commit，orchestrator `--no-ff` 合并
- **Worktree 缺 .env / node_modules**：合并后立即 `cp .env` 和 `npm install`

---

## 1. 任务列表（按依赖顺序）

> 总任务数：**45 个 task**（5 数据层 + 8 一级组件 + 1 一级页面 + 12 M6 组件 + 1 M6 页面 + 12 M7 组件 + 1 M7 页面 + 12 M8 组件 + 1 M8 页面 + 9 埋点 + 6 测试 + 3 门禁 + 3 收尾）

### 阶段 A：基础设施与数据层（5 task）

#### A.1 — 路由元数据补全
- **文件**：`src/lib/product-routes.ts`
- **改动**：检查 `getModelRoute("wenjie", "m6"|"m7"|"m8")` 是否都已注册；如有缺失，按 `product-routes.ts` 既有 schema 补全 `modelName`、`status`、`accentColor`（cyan）
- **验证**：`npx tsc --noEmit` 通过；现有 stub 三页能 `notFound()` 通过
- **依赖**：无
- **风险**：低；既有 stub 已在用此 API

#### A.2 — 一级数据文件
- **文件**：`src/lib/wenjie-series-upgrade-projects.ts`（新建）
- **导出**：
  ```ts
  export type WenjieSeriesUpgradePriority = "featured" | "optional";
  export type WenjieSeriesUpgradeCategory = ... // PRD §16 字面量类型
  export type WenjieSeriesUpgradeProject = {
    key: string;                // "wenjie-series-paint-film" 等稳定 slug
    name: string;
    category: WenjieSeriesUpgradeCategory;
    priority: WenjieSeriesUpgradePriority;
    order: number;
    summary: string;
    applicableModels?: Array<"M6" | "M7" | "M8">;
    imageStatus: "matched" | "pending-review" | "missing";
  };
  export const wenjieSeriesFeaturedProjects: WenjieSeriesUpgradeProject[]; // length === 10 (字面量)
  export const wenjieSeriesOptionalProjects: WenjieSeriesUpgradeProject[];  // length === 24 (字面量)
  export const wenjieSeriesScenarios: WenjieSeriesScenario[];               // length === 7
  export const wenjieSeriesServiceSteps: WenjieSeriesServiceStep[];         // length === 6
  export const wenjieSeriesFaq: WenjieSeriesFaqItem[];                      // length === 6
  ```
- **数据来源**：直接按 PRD §7.1（10 项）+ §9.1（24 项）+ §8（7 场景）+ §12（6 步）+ §13（6 FAQ）抄写，**字段值零变更**
- **验证**：单文件 vitest 单元测试 `wenjie-series-upgrade-projects.test.ts` 验证长度、key 唯一性、order 单调递增
- **依赖**：无

#### A.3 — M6 数据文件
- **文件**：`src/lib/wenjie-m6-upgrade-projects.ts`（新建）
- **导出**：17 项 projects（字面量 `as const`）+ 6 场景 + 3 组合（PRD §9.1/9.2/9.3）+ 7 步服务流程 + 7 FAQ（PRD §14）
- **类型**：按 PRD §16 的 `WenjieM6UpgradeProject` schema，**无 tier 字段**（M6 单层级）
- **验证**：单元测试 `wenjie-m6-upgrade-projects.test.ts` 验证长度、key 唯一
- **依赖**：无

#### A.4 — M7 数据文件
- **文件**：`src/lib/wenjie-m7-upgrade-projects.ts`（新建）
- **导出**：30 项 projects（**带 `tier: 'must_have' | 'business_upgrade' | 'practical_accessory'`**）+ 7 场景 + 4 组合（PRD §9.1/9.2/9.3/9.4）+ 7 步服务 + 8 FAQ
- **字面量约束**：
  ```ts
  const MUST_HAVE = 5;      // 字面量
  const BUSINESS = 15;      // 字面量
  const PRACTICAL = 10;     // 字面量
  // 验证 must_have.length === 5 && business_upgrade.length === 15 && practical_accessory.length === 10
  ```
- **验证**：单元测试 `wenjie-m7-upgrade-projects.test.ts`
- **依赖**：无

#### A.5 — M8 数据文件
- **文件**：`src/lib/wenjie-m8-upgrade-projects.ts`（新建）
- **导出**：30 项 projects（**带 `tier` 字段 + 电动门项目带 `caution` 字段**）+ 6 场景 + 4 组合 + 7 步服务 + 8 FAQ
- **特殊**：`electric_door` 项目的 `caution` 字段必须有"电动门适配提示"（PRD §10 P0 优先级）
- **字面量约束**：同 M7
- **验证**：单元测试 `wenjie-m8-upgrade-projects.test.ts` + 电动门 caution 非空校验
- **依赖**：无

---

### 阶段 B：一级入口组件（8 task）

#### B.1 — WenjieSeriesUpgradeHero
- **文件**：`src/components/wenjie/WenjieSeriesUpgradeHero.tsx`
- **内容**：RSC；主标题"问界系列项目升级方案"；副标题"专业轻改，安全可靠，提升体验，焕新出行"；简介文案按 PRD §6.1；CTA 两个：`<PhoneCta source="wenjie_series_hero_phone_click" />` + `<Link href="#featured">查看热门项目</Link>`
- **视觉**：dark zinc-950 + cyan-950/30 渐变 + cyan-700/20 blur（沿用 `wenjie/page.tsx:51-55` 现有 hero 视觉）
- **图片**：**不引用** `wenjieTopicMeta.previewImage`；左侧文案、右侧留空（待后续海报资产到位再加图）
- **依赖**：A.2

#### B.2 — WenjieSeriesFeaturedGrid
- **文件**：`src/components/wenjie/WenjieSeriesFeaturedGrid.tsx`
- **类型**：CC（埋点交互）
- **内容**：10 张重点卡片；desktop `2行5列`、tablet `2列`、mobile `1列`
- **卡片要素**：项目名 + 分类标签 + 1 句价值说明 + "展开"按钮
- **点击行为**：滚动到 `#scenarios` 对应锚点 + `trackClick("wenjie_series_featured_click", { projectKey, category, priority: "featured" })`
- **3 态图片降级**：沿用 `WenjieProductCard.tsx:38-49` 的虚线 + ImageIcon + "图片待补充"模式（**重写为组件内函数，不复用 ProductCard**）
- **依赖**：A.2

#### B.3 — WenjieSeriesScenarios
- **文件**：`src/components/wenjie/WenjieSeriesScenarios.tsx`
- **类型**：CC（场景切换交互）
- **内容**：7 个场景 tabs/手风琴；每个场景下显示对应项目列表（按 PRD §8 映射）
- **依赖**：A.2

#### B.4 — WenjieSeriesMoreChoices
- **文件**：`src/components/wenjie/WenjieSeriesMoreChoices.tsx`
- **类型**：CC（展开按钮）
- **内容**：24 项文字标签网格；每组默认前 4-6 项，"展开更多"按钮；点击记录 `trackClick("wenjie_series_optional_click", { projectKey, category, priority: "optional" })`
- **依赖**：A.2

#### B.5 — WenjieSeriesSubModelsGrid
- **文件**：`src/components/wenjie/WenjieSeriesSubModelsGrid.tsx`
- **类型**：RSC
- **内容**：3 张子车型入口卡片（M6/M7/M8），每张含车型名 + 项目数 + 必改/商务/小配件提示 + "查看方案"按钮 → 跳 `/product/wenjie/{m6,m7,m8}`
- **视觉**：与 `WenjieTopicBanner.tsx` 一致（cyan 主题 + 圆角 + 边框）
- **依赖**：A.3/A.4/A.5

#### B.6 — WenjieSeriesServiceFlow
- **文件**：`src/components/wenjie/WenjieSeriesServiceFlow.tsx`
- **类型**：RSC
- **内容**：6 步服务流程（PRD §12：车型确认 → 项目选择 → 到店评估 → 施工安装 → 验收交付 → 售后支持）；每步含 step 编号 + 标题 + 描述
- **依赖**：A.2

#### B.7 — WenjieSeriesFaq
- **文件**：`src/components/wenjie/WenjieSeriesFaq.tsx`
- **类型**：CC（折叠交互）
- **内容**：6 条 FAQ 折叠手风琴（PRD §13）
- **依赖**：A.2

#### B.8 — WenjieSeriesPosterStub
- **文件**：`src/components/wenjie/WenjieSeriesPosterStub.tsx`
- **类型**：RSC
- **内容**：**海报空态占位**：虚线框 + `ImageIcon` + "问界系列项目升级方案海报待补充"文案 + 尺寸提示"原图 941 × 1672"
- **依赖**：A.2

---

### 阶段 C：一级入口页面重构（1 task）

#### C.1 — 重写 `/product/wenjie/page.tsx`
- **文件**：`src/app/product/wenjie/page.tsx`
- **改动**：
  1. **移除**：原 `<section id="m7|m8|m9">` 三个车型款式区块
  2. **移除**：原 `wenjieProducts.map(...)` JSON-LD ItemList；改为 `wenjieSeriesFeaturedProjects` + `wenjieSeriesOptionalProjects` 合并 ItemList
  3. **更新 metadata**：按 PRD §15 — title `问界轻改项目｜问界车衣、隔热膜、二排铝地板、底盘护板与电动踏板｜蓝辉轻改`；description 含 10+ 项目关键词
  4. **插入组件顺序**：`<WenjieSeriesUpgradeHero />` → `<WenjieSeriesFeaturedGrid />` → `<WenjieSeriesScenarios />` → `<WenjieSeriesMoreChoices />` → `<WenjieSeriesSubModelsGrid />` → `<WenjieSeriesServiceFlow />` → `<WenjieSeriesPosterStub />` → `<WenjieSeriesFaq />` → 底部 CTA
  5. **保留**：Header / Footer / 原 Hero 文案保留但替换为新 `WenjieSeriesUpgradeHero`
- **删除旧锚点**：M7/M8/M9 的 `<section id="m7|m8|m9">` 移除（与 `WenjieAnchorNav` 解耦）
- **依赖**：B.1-B.8

---

### 阶段 D：二级 M6 详情页组件（8 task）

#### D.1 — WenjieModelUpgradeHero（共用）
- **文件**：`src/components/wenjie/WenjieModelUpgradeHero.tsx`
- **类型**：RSC
- **内容**：参数化 `{ modelName, modelKey, poster }`；主标题"问界 {model} 专属升级方案"；副标题按各 PRD §6.1
- **依赖**：A.3/A.4/A.5

#### D.2 — WenjieModelProjectGrid（M6 单层）
- **文件**：`src/components/wenjie/WenjieModelProjectGrid.tsx`
- **类型**：CC
- **内容**：单层级网格；desktop 4-5 列 / tablet 2 列 / mobile 1 列；卡片含序号（PRD §7.1 要求"保留序号，方便和海报对应"）+ 名称 + 分类 + 1 句说明 + 适配提示；点击展开说明（**一期就地展开，不做详情页**）；埋点 `trackClick("wenjie_m6_project_click", { projectId, projectName, category })`
- **依赖**：A.3

#### D.3 — WenjieModelScenarios（共用）
- **文件**：`src/components/wenjie/WenjieModelScenarios.tsx`
- **类型**：CC
- **内容**：参数化 `{ modelKey, scenarios }`；6 个场景（M6）或 7 个（M7/M8）
- **依赖**：A.3/A.4/A.5

#### D.4 — WenjieModelBundles（共用）
- **文件**：`src/components/wenjie/WenjieModelBundles.tsx`
- **类型**：CC
- **内容**：参数化 `{ modelKey, bundles }`；3（M6）/ 4（M7）/ 4（M8）个推荐组合；点击组合高亮项目（PRD §11.2："点击组合后高亮组合内项目"）
- **埋点**：`trackClick("wenjie_{modelKey}_bundle_click", { bundleName })`
- **依赖**：A.3/A.4/A.5

#### D.5 — WenjieModelServiceFlow（共用）
- **文件**：`src/components/wenjie/WenjieModelServiceFlow.tsx`
- **类型**：RSC
- **内容**：参数化 `{ steps }`；7 步流程（M6/M7/M8 统一 PRD §12）
- **依赖**：A.3/A.4/A.5

#### D.6 — WenjieModelFaq（共用）
- **文件**：`src/components/wenjie/WenjieModelFaq.tsx`
- **类型**：CC
- **内容**：参数化 `{ items }`；FAQ 折叠手风琴
- **依赖**：A.3/A.4/A.5

#### D.7 — WenjieModelPosterStub（共用）
- **文件**：`src/components/wenjie/WenjieModelPosterStub.tsx`
- **类型**：RSC
- **内容**：参数化 `{ modelName, originalSize }`；M6 原图 1055×1491、M7 941×1672、M8 864×1821
- **依赖**：A.3/A.4/A.5

#### D.8 — 重写 `/product/wenjie/m6/page.tsx`
- **文件**：`src/app/product/wenjie/m6/page.tsx`
- **改动**：移除 `BrandPlaceholder` stub；按 PRD §5 信息架构组装组件
- **metadata**：按 PRD §16
- **JSON-LD**：17 项 ItemList
- **依赖**：D.1-D.7

---

### 阶段 E：二级 M7 详情页组件（8 task）

#### E.1 — WenjieModelTierSection（M7/M8 三层结构）
- **文件**：`src/components/wenjie/WenjieModelTierSection.tsx`
- **类型**：CC
- **内容**：参数化 `{ projects, must_have, business_upgrade, practical_accessory }`；渲染三个层级区块；每层级显示对应卡片
- **卡片**：复用 D.2 的 `WenjieModelProjectGrid` 卡片样式但加 `tier` 标签
- **埋点**：增加 `tier` 字段到 `trackClick` metadata
- **依赖**：D.2

#### E.2 — 重写 `/product/wenjie/m7/page.tsx`
- **文件**：`src/app/product/wenjie/m7/page.tsx`
- **改动**：同 D.8，差异：用 `WenjieModelTierSection` 替代单层网格；4 个推荐组合
- **metadata**：按 PRD §15.1
- **JSON-LD**：30 项 ItemList
- **依赖**：D.1-D.7、E.1

> **E.3-E.7 占位**：M7 复用了 D.1-D.7 共用组件，无额外组件

---

### 阶段 F：二级 M8 详情页组件（8 task）

#### F.1 — ElectricDoorCautionCard（M8 专用）
- **文件**：`src/components/wenjie/ElectricDoorCautionCard.tsx`
- **类型**：RSC
- **内容**：高亮卡片 + 警示色（amber-500 边框 + 三角警告图标）；文案"电动门属于高级商务升级，必须确认车型版本、门体结构、安装方式和施工风险，到店评估后再施工"
- **位置**：紧跟 `WenjieModelTierSection` 之后
- **依赖**：A.5

#### F.2 — 重写 `/product/wenjie/m8/page.tsx`
- **文件**：`src/app/product/wenjie/m8/page.tsx`
- **改动**：同 E.2；额外插入 `ElectricDoorCautionCard`
- **metadata**：按 PRD §15
- **JSON-LD**：30 项 ItemList
- **依赖**：D.1-D.7、E.1、F.1

---

### 阶段 G：埋点 + 视觉接入（9 task）

#### G.1 — Topic View 埋点
- **位置**：4 个页面（`/product/wenjie`、`/product/wenjie/m6/m7/m8`）的 RSC 顶部
- **API**：用现有 `trackPageView()`（已有 pageview 类型） + 在页面渲染时调用一次 `trackClick` 带 `topicKey`
- **依赖**：C.1/D.8/E.2/F.2

#### G.2 — 项目兴趣埋点
- **位置**：所有 `trackClick` 调用已在 B.2/B.4/D.2/E.1 接入
- **验证**：跨 4 个页面检查 `trackClick` 调用数

#### G.3 — 子车型入口埋点
- **位置**：`WenjieSeriesSubModelsGrid` 3 张卡片
- **API**：`trackClick("wenjie_series_submodel_click", { model: "m6"|"m7"|"m8" })`

#### G.4 — 组合埋点
- **位置**：`WenjieModelBundles` 点击
- **API**：`trackClick("wenjie_{model}_bundle_click", { bundleName })`

#### G.5 — 海报占位点击埋点
- **位置**：3 个 `PosterStub` 点击"展开海报"按钮（虽然是空态，也记录）
- **API**：`trackClick("wenjie_{model}_poster_expand_click", { assetType: "poster", status: "missing" })`

#### G.6 — AnchorNav 扩展
- **文件**：`src/components/wenjie/WenjieAnchorNav.tsx`
- **改动**：扩展 `models: AnchorItem[]` → `navItems: Array<AnchorItem & { group?: "upgrade" | "model" }>`；现有调用兼容（`group` 默认 `"model"`）；新调用从一级页面传 `{ id: "featured", group: "upgrade", label: "热门项目" }` 等
- **风险**：现有 wenjie/page.tsx 不再使用 anchor nav（已移除 M7/M8/M9 锚点），但兼容调用保留

#### G.7 — JSON-LD ItemList 接入
- **位置**：4 个页面的 RSC 末尾
- **结构**：`@type: ItemList, itemListElement: ListItem[]` 含所有项目

#### G.8 — OpenGraph image 字段
- **位置**：4 个 metadata
- **值**：暂时不引入图片；`images: []` 或注释"待海报资产到位"

#### G.9 — 埋点一致性审计
- **验证**：跑 `grep -r "trackClick" src/app/product/wenjie/` 检查 4 个页面埋点完整

---

### 阶段 H：测试（6 task）

#### H.1 — vitest 单元测试
- **文件**：`src/lib/wenjie-series-upgrade-projects.test.ts` 等 4 个测试文件
- **内容**：验证 length 字面量、key 唯一性、order 单调、electric_door caution 非空
- **依赖**：A.2-A.5

#### H.2 — Playwright 三视口截图
- **文件**：`e2e/wenjie-series.spec.ts`（新建）
- **内容**：
  - 4 个页面 × 3 视口（390 / 768 / 1440）= 12 张截图
  - 截图存 `docs/test-reports/wenjie-series-2026-06-26/{viewport}/{page}.png`
- **依赖**：C.1/D.8/E.2/F.2

#### H.3 — 内容验收（脚本）
- **文件**：`scripts/verify-wenjie-content.mjs`（新建）
- **内容**：启动 dev server → 抓 `/product/wenjie` HTML → 用 cheerio 验证 10+24+7+6+6 文本存在 → 验证 4 个二级页 17/30/30 项目名匹配 PRD → 验证合规红线（grep 不出现"问界官方|华为官方|原厂件"）
- **依赖**：C.1/D.8/E.2/F.2

#### H.4 — 海报占位验证
- **验证**：4 个页面 PosterStub 显示空态（不引用任何图片资源）

#### H.5 — 埋点端到端验证
- **文件**：`e2e/wenjie-analytics.spec.ts`（新建）
- **内容**：点击 10 项热门 + 24 项更多 + 3 子车型卡片 + 组合 → 验证 `/api/analytics/track` 收到正确 metadata

#### H.6 — 移动端横向溢出检查
- **内容**：mobile 390px 视口下，海报空态宽度不超过视口（`max-w-full`）；表格不出现横向滚动

---

### 阶段 I：质量门禁（3 task）

#### I.1 — npm run lint
- **预期**：0 新增 error；已知 1227 个 pre-existing lint error 来自 `.claude/worktrees/agent-a3994bc6/.next/` + `.claude/plugins/`，**不视为回归**
- **风险**：可能误判——只关注 `src/app/product/wenjie/**` 和 `src/components/wenjie/**` 路径下的 error

#### I.2 — npm run typecheck
- **预期**：0 新增 error；已知 9 个 pre-existing test 文件错误**不视为回归**
- **依赖**：所有数据文件 + 组件

#### I.3 — npm run build
- **预期**：build 成功；SSG fallback 静态数据（无 Postgres 也可跑）
- **依赖**：所有页面

---

### 阶段 J：收尾（3 task）

#### J.1 — Daily journal
- **文件**：`docs/journal/2026-06-26-wenjie-series-upgrade.md`
- **内容**：架构决策、任务分解、验收结果、截图索引、已知遗留

#### J.2 — Worktree 合并
- **步骤**：
  1. 在 main 跑 `npm install`（合并后统一 node_modules）
  2. 主分支 `git pull --no-rebase`
  3. 依次 merge 各 worktree：`git merge --no-ff worktree-wenjie-upg-{id}`
  4. 解决冲突（数据文件 / metadata）
  5. 推 main（不自动推，**等用户确认**）

#### J.3 — Screenshots 归档
- **位置**：`docs/test-reports/wenjie-series-2026-06-26/`
- **命名**：`{viewport}/{page-name}.png`（如 `mobile/wenjie-series.png`、`tablet/wenjie-m7.png`）

---

## 2. 验收标准（按 PRD 验收章节聚合）

### 2.1 一级入口（PRD §18）

- [ ] 页面 `/product/wenjie` 可访问
- [ ] 包含 PRD §7.1 的 10 个热门推荐项目（顺序、名称、分类、价值说明完全一致）
- [ ] 包含 PRD §9.1 的 24 个更多选择项目
- [ ] 热门推荐和更多选择有视觉区分（featured = 重点卡片，optional = 文字标签）
- [ ] 项目按 PRD §8 的 7 个场景分类，不按海报顺序平铺
- [ ] 3 个子车型卡片（M6/M7/M8）正确跳转至 `/product/wenjie/{model}`
- [ ] 服务流程升级为 6 步（PRD §12）
- [ ] 6 条 FAQ 完整（PRD §13）
- [ ] 海报模块显示空态占位（不引用实际图片）
- [ ] 全文检索不含"问界官方/华为官方/鸿蒙智行官方/原厂件/永久质保/100% 无损/全网最低/性能提升"
- [ ] Desktop / Tablet / Mobile 三视口正常
- [ ] metadata title/description 按 PRD §15

### 2.2 二级 M6（PRD §19/§20）

- [ ] 页面 `/product/wenjie/m6` 可访问
- [ ] 17 个项目全部展示（顺序、名称、分类、summary 与 PRD §7 完全一致）
- [ ] 按 PRD §8 的 6 个场景分类（新车保护/外观个性/电动便利/底盘防护/家庭座舱/屏幕维护）
- [ ] 3 个推荐组合（新车基础保护/家庭舒适/外观运动）可点击高亮
- [ ] 7 步服务流程（车型确认→项目选择→到店评估→方案确认→施工安装→验收交付→售后支持）
- [ ] 7 条 FAQ 完整
- [ ] 海报显示空态（不引用图片）
- [ ] 项目点击埋点能带上 projectId、projectName、category

### 2.3 二级 M7（PRD §18/§19）

- [ ] 页面 `/product/wenjie/m7` 可访问
- [ ] 30 个项目按 5 必改 + 15 商务 + 10 小配件三层展示
- [ ] 4 个推荐组合（新车必改/商务座舱/外观运动/实用小配件）可点击高亮
- [ ] 7 步服务流程
- [ ] 8 条 FAQ 完整
- [ ] 海报空态
- [ ] 项目点击埋点带 tier 字段

### 2.4 二级 M8（PRD §19/§20）

- [ ] 页面 `/product/wenjie/m8` 可访问
- [ ] 30 个项目按 5+15+10 三层展示
- [ ] **电动门高亮警示卡**显示（PRD §10 P0）
- [ ] 4 个推荐组合
- [ ] 7 步服务流程
- [ ] 8 条 FAQ
- [ ] 海报空态
- [ ] 电动门项目点击埋点带 `electric_door_project_click` 字段

### 2.5 工程验收

- [ ] `npm run typecheck` 通过（已知 9 个 pre-existing test 文件错误除外）
- [ ] `npm run build` 通过
- [ ] `npm run lint` 无新增 error
- [ ] 不新增数据库表
- [ ] 不引入新 npm 依赖
- [ ] 新文件不使用 `any`
- [ ] 字面量类型防漂移：featured=10 / optional=24 / M6=17 / M7=30 / M8=30
- [ ] 海报模块在 4 个页面均不引用实际图片（仅空态占位）
- [ ] 4 个页面均不引用 `wenjie-products.ts` 的 M7/M8/M9 旧数据
- [ ] worktree 合并后 `npm install` + `npm run check` 全绿

---

## 3. 验证命令

```bash
# 阶段 A 单元测试
npx vitest run src/lib/wenjie-series-upgrade-projects.test.ts
npx vitest run src/lib/wenjie-m6-upgrade-projects.test.ts
npx vitest run src/lib/wenjie-m7-upgrade-projects.test.ts
npx vitest run src/lib/wenjie-m8-upgrade-projects.test.ts

# 阶段 I 质量门禁
npm run lint 2>&1 | tee /tmp/lint.log | grep -E "src/app/product/wenjie|src/components/wenjie|src/lib/wenjie-"
npm run typecheck
npm run build

# 阶段 H 内容验收
node scripts/verify-wenjie-content.mjs

# 阶段 H 三视口截图
npm run dev &
sleep 30
BASE_URL=http://localhost:3000 npx playwright test e2e/wenjie-series.spec.ts
BASE_URL=http://localhost:3000 npx playwright test e2e/wenjie-analytics.spec.ts

# 合规红线全站检索
cd src && grep -rE "问界官方|华为官方|鸿蒙智行官方|原厂配件|原厂件|100%无损|永久质保|全网最低|性能提升|操控提升|制动提升" \
  app/product/wenjie components/wenjie lib/wenjie-*.ts \
  && echo "FAIL: 合规红线触发" || echo "PASS: 合规红线全清"
```

---

## 4. 浏览器视口检查（PRD §18.2 / 各二级 PRD §18.3）

| 视口 | 设备 | 验收项 |
|---|---|---|
| **Mobile 390px** | iPhone 14 Pro | Hero 一屏半内；10 项热门单列；24 项更多可横滑（无横向滚动）；3 子车型卡片单列；海报空态不溢出；表格不溢出 |
| **Tablet 768px** | iPad | 10 项热门 2 列；24 项更多 3 列；3 子车型卡片横排；FAQ 折叠正常 |
| **Desktop 1440px** | MacBook | 10 项热门 2 行 5 列；24 项更多 4-6 列；3 子车型卡片横排；6 步服务流程横排；JSON-LD ItemList 全渲染 |

---

## 5. 复用与新增组件清单

### 5.1 复用（不动）

| 组件 | 路径 | 用途 |
|---|---|---|
| `PhoneCta` | `src/components/cta/PhoneCta.tsx` | CTA 按钮 |
| `Header` / `Footer` | `src/components/{Header,Footer}.tsx` | 全站壳 |
| `Badge` | `src/components/ui/badge.tsx` | 分类标签 |
| `WenjieProductCard` | `src/components/wenjie/WenjieProductCard.tsx` | **不直接复用**（语义不同）；参考其 3 态 UI 模式 |
| `trackClick` | `src/lib/analytics.ts` | 埋点 |
| `getBrandRoute` / `getModelRoute` | `src/lib/product-routes.ts` | 路由元数据 |
| `Header` / `Footer` | — | — |

### 5.2 新增（按依赖顺序）

| # | 组件 | 复用度 |
|---|---|---|
| 1 | `WenjieSeriesUpgradeHero` | 仅一级用 |
| 2 | `WenjieSeriesFeaturedGrid` | 仅一级用 |
| 3 | `WenjieSeriesScenarios` | 仅一级用 |
| 4 | `WenjieSeriesMoreChoices` | 仅一级用 |
| 5 | `WenjieSeriesSubModelsGrid` | 仅一级用 |
| 6 | `WenjieSeriesServiceFlow` | 仅一级用 |
| 7 | `WenjieSeriesFaq` | 仅一级用 |
| 8 | `WenjieSeriesPosterStub` | 仅一级用 |
| 9 | `WenjieModelUpgradeHero` | M6/M7/M8 共用 |
| 10 | `WenjieModelProjectGrid` | M6 单层；M7/M8 也可调用（参数 `tier` 决定渲染） |
| 11 | `WenjieModelTierSection` | M7/M8 三层结构专用 |
| 12 | `WenjieModelScenarios` | M6/M7/M8 共用 |
| 13 | `WenjieModelBundles` | M6/M7/M8 共用 |
| 14 | `WenjieModelServiceFlow` | M6/M7/M8 共用 |
| 15 | `WenjieModelFaq` | M6/M7/M8 共用 |
| 16 | `WenjieModelPosterStub` | M6/M7/M8 共用 |
| 17 | `ElectricDoorCautionCard` | M8 专用 |

**总计**：8 个一级专用 + 8 个二级共用 + 1 个 M8 专用 = **17 个新组件**。

---

## 6. 关键风险与预防

| 风险 | 触发条件 | 预防 |
|---|---|---|
| **worktree 缺 .env / node_modules** | dispatch 后 dev server 起不来 | worktree 创建后 `cp .env .env` + `npm install` |
| **worktree 合并后 main 缺模块** | 合并到 main 后 build 失败 | 合并后 main 立即 `npm install` + `npm run build` |
| **现有 `/product/wenjie` M7/M8/M9 数据残留** | 移除旧 `<section id="m7|m8|m9">` 时漏删 JSON-LD | 阶段 C 验收清单显式检查 JSON-LD `itemListElement` 已替换 |
| **BrandPlaceholder 残留** | 二级页 stub 没完全替换 | 阶段 D/E/F 验收清单显式 grep `BrandPlaceholder` |
| **海报空态意外引用图片** | 误用 `next/image` 引用 `upgrade-poster.png` | 阶段 H 内容验收脚本显式 grep `upgrade-poster` / `wenjieTopicMeta.previewImage` |
| **字面量类型被绕过** | 某个数据文件用 `as WenjieSeriesUpgradeProject[]` 绕过 length 检查 | 单元测试覆盖每个数据文件 `expect(arr.length).toBe(N as const)` |
| **M9 旧数据被引用** | 误用 `wenjieProductsByModel.M7` 等 | 阶段 I 显式 `grep wenjie-products src/app/product/wenjie/**` |
| **埋点元数据 PII** | 用户输入混入 metadata | 仅允许白名单字段：`projectKey`、`category`、`priority`、`modelKey`、`topicKey`、`bundleName`、`assetType` |
| **shadcn 组件误用** | 把 shadcn 组件当 PRD 指令源 | 阶段 H 验收清单显式检查每个新组件遵循 PRD 视觉规范 |
| **Worktree 平行合并冲突** | 两个 agent 同时改 `wenjieAnchorNav.tsx` | 任务 G.6 anchor nav 扩展由 architect 独占 commit |
| **字体 / 颜色漂移** | 一级/二级页面主题色不一致 | 全用 `cyan-500/400`；统一从 `tailwind.config.ts` 读取 |

---

## 7. 回滚（Rollback Notes）

### 7.1 软回滚（保留旧 44 个款式数据）

如果新架构上线后发现 SEO/转化数据下降，可：
1. **不删除** `src/lib/wenjie-products.ts`（旧数据保留）
2. **回滚** `src/app/product/wenjie/page.tsx` 到上一 commit
3. 旧的 `<section id="m7|m8|m9">` 立即恢复；3 个二级 stub 保留

### 7.2 硬回滚（git revert）

```bash
git log --oneline | grep -i "wenjie-series-upgrade" | head -5
# 找到主合并 commit
git revert --no-commit <merge-commit-sha>
git revert --no-commit <child-commits>
git commit -m "revert: wenjie series upgrade plan rollback"
```

### 7.3 数据回滚

```bash
# 删除新建数据文件（4 个）
rm src/lib/wenjie-series-upgrade-projects.ts
rm src/lib/wenjie-m6-upgrade-projects.ts
rm src/lib/wenjie-m7-upgrade-projects.ts
rm src/lib/wenjie-m8-upgrade-projects.ts

# 恢复旧数据（git checkout）
git checkout HEAD~N -- src/lib/wenjie-products.ts
```

### 7.4 二级路由回滚

```bash
# 恢复 stub 占位符
git checkout HEAD~N -- src/app/product/wenjie/m6/page.tsx
git checkout HEAD~N -- src/app/product/wenjie/m7/page.tsx
git checkout HEAD~N -- src/app/product/wenjie/m8/page.tsx
```

---

## 8. 团队分工（dispatch 推荐）

> **推荐使用 `/dispatch` 编排多 agent 并行**。任务分组：

| Agent | 任务范围 | worktree 分支 |
|---|---|---|
| **Architect（架构师）** | A.1-A.5 数据层 + G.6 anchor nav | `worktree-architect` |
| **Coder 1（一级）** | B.1-B.8 + C.1 + G.1-G.5 + G.7-G.9 | `worktree-coder-series` |
| **Coder 2（M6）** | D.1-D.7 + D.8 + 集成埋点 | `worktree-coder-m6` |
| **Coder 3（M7）** | E.1 + E.2 | `worktree-coder-m7` |
| **Coder 4（M8）** | F.1 + F.2 | `worktree-coder-m8` |
| **Tester** | H.1-H.6 + I.1-I.3 | `worktree-tester` |
| **Orchestrator** | J.1-J.3 + 合并 + 主分支门禁 | 主分支 |

**依赖顺序**：Architect → Coder 1/2/3/4 → Tester → Orchestrator。

---

## 9. 未决问题（需用户确认）

### 9.1 海报资产到位时间线
- **问题**：海报原图何时提供？（M6 1055×1491 / M7 941×1672 / M8 864×1821 / 一级 941×1672）
- **影响**：阶段 B.8 / D.7 / E.2 / F.2 的 PosterStub 当前是空态；资产到位后可平滑升级为真实图片
- **默认决策**：**先全部空态**，资产到位后由后续迭代切换（已在 PRD §21 后续迭代说明）

### 9.2 M9 旧 16 条产品款式去留
- **问题**：原 `/product/wenjie` 有 M9 16 条数据（wenjie-products.ts:375-555），新架构未覆盖
- **影响**：M9 旧数据保留在数据文件但不再渲染（迁移成本 0）
- **建议**：**保留数据文件** `src/lib/wenjie-products.ts` 不动；不渲染；后续如需 M9 页面另起 PRD
- **默认决策**：**保留不渲染**

### 9.3 M9 是否要新增 `/product/wenjie/m9` 子路由
- **问题**：本次 plan 不包含 M9，是否预留子路由？
- **建议**：**不预留**；后续单独规划
- **默认决策**：**不预留**

### 9.4 旧 `WenjieAnchorNav.tsx` 兼容调用方
- **问题**：当前 `wenjie/page.tsx` 调用 `WenjieAnchorNav`，新页面不再用，但组件保留供未来
- **建议**：扩展 props 兼容旧调用
- **默认决策**：**扩展向后兼容**（`group` 字段 optional）

### 9.5 /product 入口 WenjieTopicBanner 是否升级文案
- **问题**：PRD §4 建议升级为"问界系列项目升级方案"，但会改变既有 metadata
- **建议**：**不动** WenjieTopicBanner 入口；新入口在 `/product/wenjie` 内部
- **默认决策**：**不动**

---

## 10. 审批检查点

> ⚠️ **本 plan 等待用户审批后才能进入 `/build` 阶段**

**必须确认**：
- [ ] 9.1 海报资产先空态（已确认 2026-06-26）
- [ ] 9.2 M9 数据保留不渲染
- [ ] 9.3 M9 子路由不预留
- [ ] 9.4 AnchorNav 向后兼容
- [ ] 9.5 WenjieTopicBanner 文案不动
- [ ] 路由策略：4 个独立路由（`wenjie` + `wenjie/{m6,m7,m8}`）
- [ ] 不引入新 npm 依赖
- [ ] 不新增数据库表
- [ ] 字面量类型防漂移
- [ ] 任务分工接受 dispatch 多 agent 并行

**审批后流程**：
1. 创建 worktree 分支（4-5 个并行）
2. 启动 Architect agent 先做数据层
3. 数据层合 main 后启动 Coder agents
4. 测试 + 合并 + 截图归档

---

## 11. 变更记录

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-26 | v0.1 | 基于 4 个 PRD（WENJIE_SERIES_UPGRADE + WENJIE_M6/M7/M8_TOPIC）生成完整 implementation plan | prompt-boost / Coya |