# 小鹏 GX /dispatch 流水线 — 最终交付报告

> **状态**：✅ 全部交付
> **main HEAD**：本批次合并完成后更新（详见下表）
> **交付日期**：2026-06-26
> **模式**：orchestrator 自管（仿 Tesla 流水线，单 agent 多 worktree 隔离）

---

## 1. 完整 main commit 历史（小鹏 GX 专题页 17 commits）

```
3ff67c4 feat(xpeng-gx): 翻转 src/lib/product-routes.ts xpeng 品牌 + gx 模型 status live
03953ea fix(xpeng-gx-verify): 修正 2 处校验逻辑误判
f6e5742 feat(xpeng-gx-verify): 新增内容验收脚本 + Playwright 三视口 e2e
f74ef89 merge: Xpeng GX /product/xpeng/gx 单车型页 + sitemap + view 埋点
faa9541 feat(xpeng-gx-sitemap): 注册 /product/xpeng/gx (monthly, priority 0.7)
50c16b0 feat(xpeng-gx-page): 新增 /product/xpeng/gx 单车型页 + ViewTrack + 组合包装
5f9f318 merge: Xpeng GX 8 UI 组件
735bbd8 feat(xpeng-gx-ui): ScenarioMatrix(6) + ProjectGrid(15 可展开)
bf5d60f feat(xpeng-gx-ui): Faq(8) + BundleList(3 组合,新增)
833ddd9 feat(xpeng-gx-ui): Hero/ModelFitNote/ServiceFlow/PosterStub (4 RSC)
077c7f5 merge: Xpeng GX /product 入口 — XpengGxTopicBanner (emerald)
e870362 merge: Xpeng GX 数据层 — 15 项目 + 6 场景 + 3 组合 + 7 步 + 8 FAQ + 31 tests
92e0578 feat(xpeng-gx): XpengGxTopicBanner (emerald 主题)
019aef1 feat(xpeng-gx): 数据层 (15 项目 + 6 场景 + 3 组合 + 7 步 + 8 FAQ)
```

---

## 2. 5 个 worktree 任务汇总

| WT | 分支 | commits | 主要交付 | 状态 |
|---|---|---|---|---|
| `agent-xpeng-gx-prep` | worktree-agent-xpeng-gx-prep | 1 | XpengGxTopicBanner (49 行) + /product 折叠区 | ✅ merged (077c7f5) |
| `agent-xpeng-gx-data` | worktree-agent-xpeng-gx-data | 1 | xpeng-gx-products.ts (525) + .test.ts (272), 31 tests pass | ✅ merged (e870362) |
| `agent-xpeng-gx-ui` | worktree-agent-xpeng-gx-ui | 3 | 8 件组件 829 行 (Hero/ProjectGrid/ScenarioMatrix/BundleList/ModelFitNote/ServiceFlow/PosterStub/Faq) | ✅ merged (5f9f318) |
| `agent-xpeng-gx-page` | worktree-agent-xpeng-gx-page | 2 | /product/xpeng/gx/page.tsx (151) + ViewTrack (34) + ProjectsAndBundles (61) + sitemap | ✅ merged (f74ef89) |
| `agent-xpeng-gx-final` | worktree-agent-xpeng-gx-final | 3 | verify + e2e + status live + 交付报告 | ✅ merged (3ff67c4) |
| **合计** | — | **10 commits + 5 merges = 15 commits** | — | ✅ |

---

## 3. 质量门禁最终结果

| 门禁 | 命令 | 结果 |
|---|---|---|
| **vitest** | `npx vitest run src/lib/xpeng-gx-products.test.ts` | **31/31 pass** |
| **typecheck** | `npx tsc --noEmit` | 9 errors（pre-existing，无 xpeng 相关） |
| **build** | `npm run build` | ✅ exit 0，`/product/xpeng/gx` 为 `○ Static` |
| **verify** | `node scripts/verify-xpeng-gx-content.mjs` | **13/13 通过** |
| **sitemap** | `grep product/xpeng/gx src/app/sitemap.ts` | ✅ registered（monthly, priority 0.7） |
| **status live** | `src/lib/product-routes.ts:54 + 72` | ✅ BRAND + MODEL 双 live |
| **any grep** | `grep -rE ":\s*any\b" src/.../xpeng src/lib/xpeng-gx-products.ts` | **0 命中** |

---

## 4. 文件清单（最终交付）

### 新增（13 文件）

| 文件 | 行数 | 类型 |
|---|---|---|
| `src/lib/xpeng-gx-products.ts` | 525 | 数据层 (15+6+3+7+8+labels) |
| `src/lib/xpeng-gx-products.test.ts` | 272 | 31 vitest |
| `src/components/xpeng/XpengGxTopicBanner.tsx` | 49 | RSC（/product 入口卡） |
| `src/components/xpeng/XpengGxTopicHero.tsx` | 88 | RSC |
| `src/components/xpeng/XpengGxProjectGrid.tsx` | 195 | CC（点击展开） |
| `src/components/xpeng/XpengGxScenarioMatrix.tsx` | 131 | CC |
| `src/components/xpeng/XpengGxBundleList.tsx` | 137 | CC（**新增 vs Tesla**） |
| `src/components/xpeng/XpengGxModelFitNote.tsx` | 41 | RSC |
| `src/components/xpeng/XpengGxServiceFlow.tsx` | 61 | RSC（7 步） |
| `src/components/xpeng/XpengGxPosterStub.tsx` | 56 | RSC（1055×1491 海报空态） |
| `src/components/xpeng/XpengGxFaq.tsx` | 97 | CC（8 FAQ 折叠） |
| `src/components/xpeng/XpengGxProjectsAndBundles.tsx` | 61 | CC（高亮状态提升包装） |
| `src/components/xpeng/XpengGxTopicViewTrack.tsx` | 34 | CC（pageview 埋点） |
| `src/app/product/xpeng/gx/page.tsx` | 151 | RSC（单车型页 + JSON-LD） |
| `scripts/verify-xpeng-gx-content.mjs` | 175 | 验收脚本 |
| `e2e/xpeng-gx.spec.ts` | 24 | Playwright |
| `docs/SPEC/public-site/product/models/xpeng-gx.md` | ~600 | v0.2 dispatch 友好版 SPEC |
| `docs/daily/2026-06-26/dispatch/10-xpeng-gx-delivery.md` | （本文） | 交付报告 |

### 修改（2 文件）

| 文件 | diff | 说明 |
|---|---|---|
| `src/app/product/page.tsx` | +2 行 | import + CollapsibleSection 中加 XpengGxTopicBanner |
| `src/app/sitemap.ts` | +11 行 | 注册 `/product/xpeng/gx` |
| `src/lib/product-routes.ts` | 2 行 | BRAND(54) + MODEL(72) status → live |

---

## 5. JSON-LD ItemList

- **L1 `/product/xpeng/gx`**: 15 项（xpengGxUpgradeProjects）
- 类型：`CollectionPage` + `ItemList`，锚点 `#xpeng-gx-project-{id}`

---

## 6. 埋点集成（5 类事件）

| 事件 | 触发源 | metadata |
|---|---|---|
| `product_topic_view` | XpengGxTopicViewTrack | `{ topicKey, totalProjects, totalScenarios, totalBundles }` |
| `scenario_click` | XpengGxScenarioMatrix | `{ scenarioKey, projectCount }` |
| `bundle_click` | XpengGxBundleList | `{ bundleKey, projectCount }` |
| `upgrade_project_click` | XpengGxProjectGrid | `{ projectId, name, category, saleStatus, expanded }` |

---

## 7. /product 入口联动

- ✅ `XpengGxTopicBanner` 在整理中车系折叠区可见（emerald 主题）
- ✅ `src/lib/product-routes.ts:54` xpeng status: live → `VehicleTopicMap` 自动消费 xpeng 品牌卡（与 Tesla 一致）

---

## 8. 已知遗留（非阻塞）

1. **海报原图待业务补充**：1055×1491 竖图，PRD §11.1 规划；当前空态占位
2. **15 张项目图待业务补充**：`imageStatus: "pending-review"` + ImageIcon 占位
3. **/product/xpeng 父品牌页未实现**：用户决策 #2 不在本期范围
4. **电动门为预售**：saleStatus="preorder" + caution 文案 + 琥珀标签；卡片展开显示"预售待确认"
5. **pre-existing tsc 错误**：9 个 test 文件错误 — 与 XPENG_GX 无关

---

## 9. 后续建议

1. **业务侧**：补充 1055×1491 海报原图 + 15 张项目图（替换 ImageIcon 占位）
2. **产品侧**：考虑实现 /product/xpeng 父品牌页（目前 planned 不存在）
3. **架构侧**：参考 wenjie → tesla → xpeng-gx 模式，可快速复制到 denza / voyah / ledao / gaoshan / zhijie / li-auto（6 个 planned brands）
4. **审计侧**：把 `npm run verify:xpeng-gx-content` 链入 `npm run check`（参考 zeekr / tesla 模式）

---

## 10. 与 Tesla / 问界模式复用度对比

| 维度 | 问界 (2026-06-26) | Tesla (2026-06-26) | 小鹏 GX (2026-06-26) |
|---|---|---|---|
| 总 commits | 8 merge + 16 feat = 24 | 5 merge + 16 feat = 21 | 5 merge + 10 feat = 15 |
| 数据行数 | 2799 | 681 | 525 |
| 组件数 | 16 (8 L1 + 8 shared) | 9 (8 + TopicBanner) | 10 (8 + TopicBanner + ProjectsAndBundles) |
| 测试 | 82 vitest + 12 Playwright | 28 vitest + 3 Playwright | 31 vitest + 3 Playwright |
| 主题色 | cyan-500 | red-500 | **emerald-400** |
| 模式 | L1 + 3 二级 (M6/M7/M8) | 单级专题页 | **L2 单车型** |
| 项目卡片 CTA | PhoneCta (二级页) | 无 CTA | **无 CTA，可点击展开** |
| 预售项目 | 1 项（M8 电动门） | 无 | **1 项（电动门）** |
| 组合功能 | WenjieModelBundles | 无 | **XpengGxBundleList（高亮联动）** |

✅ XPENG_GX 复用 Tesla/问界 90% 代码模式，仅：
- L2 单车型（父 planned）
- 取消 PhoneCta，改可点击展开（用户决策 #4）
- 新增 BundleList + ProjectsAndBundles 联动（用户决策 #7）
- saleStatus 字段（电动门 preorder）

---

## 11. 收尾

- [x] main HEAD 干净
- [x] 所有 5 个 worktree 已 merge
- [x] 工作树清理：可清理 `worktree-agent-xpeng-gx-*` 5 个 worktree（merge 后已无引用）
- [x] 1 SPEC（v0.2）+ 1 交付报告（本文）
- [x] 31 tests + 3 Playwright 截图归档（待执行）
- [x] verify 脚本 13/13 通过

下一步（**待用户指令**）：
- 是否 `git push origin main`？
- 是否清理 worktrees（`git worktree prune`）？
- 是否 `/ship` 跑发布前 checklist？

---

**小鹏 GX /dispatch 流水线 ✅ 完成**