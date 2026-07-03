# Stage 2b 完成 — L1 + 共用组件

**时间**：2026-06-26 12:50
**分支**：`worktree-agent-wenjie-l1` + `worktree-agent-wenjie-shared`（均已 `--no-ff` 合并到 main）
**累计 main**：`31b4f4e`（待确认）= 数据层 162f448 + L1 3289aa2 + 共用 8 组件

## L1 一级（worktree-agent-wenjie-l1 @ 3289aa2）

8 组件 + 1 page 重写，873 行：
- `WenjieSeriesHero.tsx` (121) — 1 级 hero + 面包屑 + 2 CTA
- `WenjieSeriesFeaturedGrid.tsx` (100) — 10 热门推荐
- `WenjieSeriesScenarios.tsx` (94) — 7 场景
- `WenjieSeriesMoreChoices.tsx` (89) — 24 更多项目
- `WenjieSeriesSubModelsGrid.tsx` (90) — 3 子车型卡
- `WenjieSeriesServiceFlow.tsx` (54) — 6 步流程
- `WenjieSeriesFaq.tsx` (82) — 6 FAQ（useState 折叠）
- `WenjieSeriesPosterStub.tsx` (60) — 4 海报空态
- `page.tsx` 重写 (183) — 完整一级入口

JSON-LD：`name: "问界系列项目升级方案"`，34 个 ListItem（10 热门 + 24 更多）

## 共用二级（worktree-agent-wenjie-shared @ 82d6534）

8 组件，822 行（命名空间 `WenjieModel*` + `WenjieM8ElectricDoorCautionCard`）：
- `WenjieModelUpgradeHero.tsx` (144) — 2 级 hero
- `WenjieModelProjectGrid.tsx` (174) — 通用项目网格（tier 可选，M6 无 tier 可用）
- `WenjieModelScenarios.tsx` (108) — 场景列表
- `WenjieModelBundles.tsx` (—) — 套餐
- `WenjieModelServiceFlow.tsx` (57) — 7 步流程
- `WenjieModelFaq.tsx` (85) — FAQ
- `WenjieModelPosterStub.tsx` (73) — 4 海报
- `WenjieM8ElectricDoorCautionCard.tsx` (—) — M8 专属警示卡

**关键 prop 设计**：D.2-D.4 用泛型，让 M6/M7/M8 page 直接传 `WenjieM6UpgradeProject` / `WenjieM7UpgradeProject` / `WenjieM8UpgradeProject`，无需映射。

## 累计门禁

- ✅ 0 `any` 关键字（验收 grep 0 命中）
- ✅ 0 新 tsc 错误（9 pre-existing 与 AGENTS.md 一致）
- ✅ 0 新 vitest 失败
- ✅ `npm run build` 通过
- ✅ JSON-LD ItemList × 34（一级）
- ✅ 命名空间隔离：`WenjieSeries*` 一级 / `WenjieModel*` 二级

## 后续

启动 3 个并行 page worktree：
- Task 6 (M6): 重写 `src/app/product/wenjie/m6/page.tsx` — 17 项目 + 6 场景 + 3 bundles + 7 步 + 7 FAQ
- Task 1 (M7): 重写 `src/app/product/wenjie/m7/page.tsx` — 5+15+10 三层 + 7 场景 + 4 bundles + 7 步 + 8 FAQ
- Task 8 (M8): 重写 `src/app/product/wenjie/m8/page.tsx` — 5+15+10 三层 + 6 场景 + 4 bundles + 7 步 + 8 FAQ + F.1 电动门警示卡 + sitemap.xml 同步
