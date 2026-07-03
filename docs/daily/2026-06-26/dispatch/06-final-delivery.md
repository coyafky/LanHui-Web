# 交付报告 — 问界系列项目升级方案

**日期**：2026-06-26
**Orchestrator**：prompt-boost / Coya
**main HEAD**：`c8d6636` (4 路由 + P2 修复合并)
**Plan**：`docs/plans/wenjie-series-upgrade-implementation-plan-2026-06-26.md`
**PRDs**（4 份）：
- `docs/PRD/product/WENJIE_SERIES_UPGRADE_PRD_2026-06-24.md`（一级）
- `docs/PRD/product/WENJIE_M6_TOPIC_PRD_2026-06-25.md`（M6）
- `docs/PRD/product/WENJIE_M7_TOPIC_PRD_2026-06-25.md`（M7）
- `docs/PRD/product/WENJIE_M8_TOPIC_PRD_2026-06-25.md`（M8）

---

## 概要

- **需求**：将问界（M6/M7/M8）从原 44 个混合款式的零散页，升级为**两级导航体系**：
  - 一级 `/product/wenjie` 入口（10 热门 + 24 更多 + 7 场景 + 6 步 + 6 FAQ + 3 子车型卡）
  - 二级 `/product/wenjie/{m6,m7,m8}` 详情页（M6=17 项 / M7=30 项分 3 层 / M8=30 项分 3 层 + 电动门警示）
- **状态**：✅ 成功
- **阶段**：Architect（5 修订）→ Coder 数据层 → Webdesign L1 → Webdesign 二级共用 → 3 个 Page 并行 → Tester → P2 修复

## 决策采纳（Architect §6 5 条建议）

| # | 建议 | 采纳 |
|---|---|---|
| 1 | D.1-D.7 共用组件 + F.1 拆给 Architect 独占 | ✅（改用 webdesign 独占 worktree 顺序执行，避免 3 Coder 抢占 prop 接口） |
| 2 | A.1 显式修 productCount | ✅（m6: 30→17, m7: 32→30, m8: 30） |
| 3 | sitemap 同步 | ✅（由 M8 page 任务合并时一并 `src/app/sitemap.ts` 加 3 子路由） |
| 4 | G.6 AnchorNav 扩展跳过（P3） | ✅（标 P3，未来按需） |
| 5 | H.3 加 `any` grep | ✅（验收 grep 0 命中） |

## 变更文件汇总

### 新增数据层（5 文件，+2799 行）
- `src/lib/wenjie-series-upgrade-projects.ts`（530 行）— 10 热门 + 24 更多 + 7 场景 + 6 步 + 6 FAQ
- `src/lib/wenjie-m6-upgrade-projects.ts`（397 行）— 17 项目 + 6 场景 + 3 套餐 + 7 步 + 7 FAQ
- `src/lib/wenjie-m7-upgrade-projects.ts`（639 行）— 5+15+10 项目 + 7 场景 + 4 套餐 + 7 步 + 8 FAQ
- `src/lib/wenjie-m8-upgrade-projects.ts`（635 行）— 5+15+10 项目 + 6 场景 + 4 套餐 + 7 步 + 8 FAQ + `wenjieM8ElectricDoorProject`
- 4 个对应 `.test.ts`，共 **82 单测全 pass**

### 新增一级组件（8 文件，873 行）
- `src/components/wenjie/WenjieSeriesHero.tsx`（121）
- `WenjieSeriesFeaturedGrid.tsx`（100）
- `WenjieSeriesScenarios.tsx`（94）
- `WenjieSeriesMoreChoices.tsx`（89）
- `WenjieSeriesSubModelsGrid.tsx`（90）
- `WenjieSeriesServiceFlow.tsx`（54）
- `WenjieSeriesFaq.tsx`（82，client 折叠）
- `WenjieSeriesPosterStub.tsx`（60）

### 新增二级共用组件（8 文件，822 行，命名空间 `WenjieModel*`）
- `src/components/wenjie/model/WenjieModelUpgradeHero.tsx`（144）
- `WenjieModelProjectGrid.tsx`（174，泛型 + tier 派生 id 修 P2）
- `WenjieModelScenarios.tsx`（108）
- `WenjieModelBundles.tsx`（—）
- `WenjieModelServiceFlow.tsx`（57）
- `WenjieModelFaq.tsx`（85，client 折叠）
- `WenjieModelPosterStub.tsx`（73）
- `WenjieM8ElectricDoorCautionCard.tsx`（M8 专属警示）

### 新增 / 重写 page（4 文件）
- `src/app/product/wenjie/page.tsx`（183）— 一级入口重写
- `src/app/product/wenjie/m6/page.tsx`（157）— 替换 32 行 stub
- `src/app/product/wenjie/m7/page.tsx`（176）— 替换 32 行 stub
- `src/app/product/wenjie/m8/page.tsx`（205）— 替换 32 行 stub

### 修改（2 文件）
- `src/lib/product-routes.ts`（4 行）— wenjie m6: 30→17, m7: 32→30
- `src/app/sitemap.ts`（+23 行）— 注册 `/product/wenjie/{m6,m7,m8}` 3 个子路由

## 质量门禁

| 项 | 结果 |
|---|---|
| `npx tsc --noEmit` | 9 pre-existing / 0 新错误（与 AGENTS.md 基线一致） |
| `npx vitest run src/lib/wenjie-*.test.ts` | 4 文件 / 82 测试 / 全 pass |
| `npm run build` | ✅ exit 0，4 路由全为 ○ Static（509 静态页生成） |
| `grep -rE ":\s*any\b" src/app/product/wenjie/ src/components/wenjie/` | 0 命中 |
| 字面量类型 `as const` 断言 | series=5, m6=5, m7=8, m8=8（≥ PRD 阈值） |
| JSON-LD ListItem 数量 | L1=34（10+24）, M6=17, M7=30（5+15+10）, M8=30（5+15+10） |
| sitemap 新子路由 | 3 个：`m6` / `m7` / `m8`（monthly, priority 0.7） |
| Playwright e2e 12 截图 | 4 路由 × 3 视口 = 12/12 PASS，0 console error |
| H1 唯一性 | L1=「问界系列项目升级方案｜蓝辉轻改 LANHUI」 / M6/M7/M8=「问界 MX 专属升级方案」 |

## 埋点 + JSON-LD 验收

| 任务 | 状态 | 说明 |
|---|---|---|
| G.1-G.4 页面 + 组件埋点 | ✅ | `AnalyticsProvider` 自动 pageview + 各组件 `PhoneCta` 业务埋点（`source` 含 `wenjie_{series\|model}_*_phone/consult/bundle` + M8 电动门 `wenjie_m8_electric_door_caution`） |
| G.5 metadata 白名单 | ✅ | 全部字段在白名单 `{projectKey, category, priority, modelKey, tier, bundleName, section}` 内，无 PII |
| G.6 AnchorNav 扩展 | ⏭️ SKIP | P3 标记 |
| G.7 JSON-LD ItemList | ✅ | 4 page 各自含 ItemList（L1=34, M6=17, M7=30, M8=30） |
| G.8 OpenGraph | ✅ | 4 page metadata 含 `images: []`（海报空态） |
| G.9 埋点 audit | ✅ | grep 全通过 |

## Bug 报告

| # | 严重度 | 文件 | 状态 |
|---|---|---|---|
| 1 | **P2** | `src/components/wenjie/model/WenjieModelProjectGrid.tsx:132,140` | ✅ 已修（`c8d6636`）：用 `projects[0]?.tier` 派生唯一 id |

**Tester 总评**：0 P0 / 0 P1 / 1 P2（已修）/ 0 P3。

## 已知限制（设计决策，非 Bug）

1. **海报资产空态**：4 page 所有图位为 `aspect-[4/3]` 占位 + ImageIcon，等业务人工补图后切真图
2. **OpenGraph `images: []`**：海报未到位前 OG 分享无图（业务侧后续添加）
3. **M9 数据保留不渲染**：`src/lib/wenjie-products.ts` 仍存在 16 条 M9 历史数据，但 4 个 page 均不引用
4. **WenjieProductCard / WenjieTopicBanner / WenjieAnchorNav** 既有组件未动
5. **TrackClick `topicKey` 字段**：原 plan G.1 提到 RSC 顶部 `trackClick("wenjie_topic_view", { topicKey })`，实际由 `AnalyticsProvider` 自动 pageview 承担（`/admin` 跳过）；如需"按 topicKey 维度的聚合"分析，可后续追加客户端 track

## 后续建议

1. 业务补充问界 M6/M7/M8 海报原图（941×1672 / 1055×1491 / 864×1821）+ 项目款式图（1448×1086 4:3）
2. 补图后把 `imageStatus: "pending-review"` 改为 `"matched"` 并填 `publicPath`
3. `/product` 入口页加 `<WenjieSeriesTopicBanner />`（如有视觉空缺）
4. 后续可考虑：问界 M5 / M9 同样按本模式补 page

## 截图归档

`/tmp/wenjie-audit/` — 4 路由 × 3 视口 = 12 张全页截图（mobile 390 / tablet 768 / desktop 1440）

## 收尾

- [x] main 干净（9 pre-existing tsc 错误与基线一致）
- [x] 4 路由全为 ○ Static
- [x] 0 P0/P1 Bug
- [x] 1 P2 已修
- [x] sitemap 注册
- [x] 全部 worktree 已合并到 main
- [x] 交付报告归档 `docs/daily/2026-06-26/dispatch/06-final-delivery.md`
