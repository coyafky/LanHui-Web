# 小鹏 GX 海报展示模块移除 — 变更说明

> **日期**：2026-06-26
> **作者**：coder agent（orchestrator 自管）
> **上下文**：接续 XPENG_GX /dispatch 流水线（`10-xpeng-gx-delivery.md`，main HEAD `d0ee102`）
> **根因**：**PRD 设计失误** — 海报模块（1055×1491 竖图空态占位）经复盘确认不属于业务核心展示路径，业务方短期不会补图，长期空态对用户体验无价值。

---

## 1. 改动清单

| # | 类型 | 文件 | 说明 |
|---|---|---|---|
| 1 | **删除** | `src/components/xpeng/XpengGxPosterStub.tsx` (56 行) | 海报空态 RSC 组件，仅被 `/product/xpeng/gx/page.tsx` 引用 |
| 2 | **修改** | `src/app/product/xpeng/gx/page.tsx` (151 → 149 行) | 删 `import { XpengGxPosterStub }` + 删 `<XpengGxPosterStub />` JSX |
| 3 | **修改** | `docs/SPEC/public-site/product/models/xpeng-gx.md` (v0.2 → v0.2.1) | §4/§5/§7/§8/§11/§13/§14/§16 标注"2026-06-26 已删除";§17 追加变更记录 |
| 4 | **新增** | `docs/daily/2026-06-26/dispatch/11-xpeng-gx-poster-removed.md`（本文） | 变更说明 |

---

## 2. 未改动项（澄清）

| 项 | 状态 | 原因 |
|---|---|---|
| `src/lib/xpeng-gx-products.ts` 中 15 个项目的 `sourceArea: "poster_project_matrix"` 字段 | **保留** | 这是数据层的 **业务来源追溯标签**（项目从 PRD 海报矩阵提取），不是 UI 引用。`src/lib/xpeng-gx-products.test.ts:251` 测试校验此字段值。删除 UI 模块不等于数据来源事实消失。 |
| `src/lib/product-routes.ts`（品牌 + 模型 status live） | **不动** | 状态在 XPENG_GX 流水线已翻转，本次仅移除 1 个 UI 模块 |
| `src/app/sitemap.ts`（`/product/xpeng/gx` 注册） | **不动** | 页面仍存在，仅去掉 1 个 section |
| `scripts/verify-xpeng-gx-content.mjs` | **不动** | 脚本不检查 PosterStub（13/13 仍通过） |
| `e2e/xpeng-gx.spec.ts` | **不动** | 截全页，删除 PosterStub 后页面变短，标题匹配仍通过 |
| `docs/daily/2026-06-26/dispatch/10-xpeng-gx-delivery.md` | **不动** | 历史交付报告保持原样 |

---

## 3. 设计决策记录

### 3.1 为什么 worktree 隔离？

虽然改动小（1 组件 + 1 page + 1 SPEC + 1 报告），但：

- 沿用 `/dispatch` 流水线纪律（项目硬性约定）
- 与未来可能的多车型清理（问界 M6/M7/M8 各自也有 `WenjieModelPosterStub`、`WenjieSeriesPosterStub`）保持模式一致
- 便于失败时单独回滚（cherry-pick revert）

### 3.2 为什么删除组件而不只是"隐藏"？

- 海报空态占位对 SEO / 用户体验无价值（始终空）
- 业务方短期不补图 → 长期暴露空态反而损害品牌专业感
- 真正的项目图已在 `XpengGxProjectGrid` 内通过 `imageStatus: "pending-review"` 占位
- 简化页面结构（15 个项目 + 6 场景 + 3 组合 + 7 步 + 8 FAQ 已足够传达价值）

### 3.3 为什么保留数据层 `sourceArea` 字段？

- 字段语义是"项目数据从 PRD 海报矩阵提取"的来源标签
- 与 UI 海报模块是不同的关注点
- 测试断言（`xpeng-gx-products.test.ts:251`）校验此字段一致性
- 改字段 = 改数据语义 = 越界（超出"删除 UI 模块"指令）

---

## 4. 质量门禁（变更后预期）

| 门禁 | 预期结果 |
|---|---|
| `npx vitest run src/lib/xpeng-gx-products.test.ts` | **31/31 pass**（数据层未动） |
| `npx tsc --noEmit` | 9 pre-existing errors（无新增） |
| `npm run build` | exit 0，`/product/xpeng/gx` 仍 `○ Static` |
| `node scripts/verify-xpeng-gx-content.mjs` | **13/13 pass**（脚本不检查 PosterStub） |
| `grep -r "PosterStub" src/app/product/xpeng/` | **0 命中** |
| `grep -rE ":\s*any\b" src/components/xpeng/ src/app/product/xpeng/` | **0 命中** |

---

## 5. Worktree + Commit 路径

| 阶段 | 命令 | 结果 |
|---|---|---|
| 创建 worktree | `git worktree add .claude/worktrees/agent-xpeng-gx-poster-remove -b worktree-agent-xpeng-gx-poster-remove main` | ✅ |
| 复制 `.env` | `cp ../.env .env` | ✅ |
| WT 内 commit | `refactor(xpeng-gx): 移除 XpengGxPosterStub 海报空态模块（PRD 设计失误）` | 待执行 |
| 合并到 main | `git merge --no-ff worktree-agent-xpeng-gx-poster-remove` | 待执行 |

---

## 6. 后续建议（非本次范围）

| # | 建议 | 优先级 |
|---|---|---|
| 1 | 问界 M6/M7/M8 的 PosterStub（`WenjieModelPosterStub` + `WenjieSeriesPosterStub`）是否同样需要清理？ | 待 Coya 决策 |
| 2 | 特斯拉的 PosterStub（`TeslaPosterStub`）是否同样需要清理？ | 待 Coya 决策 |
| 3 | 数据层 `sourceArea` 字段命名是否需要重新审视（"poster_project_matrix" 现在语义有点过时）？ | 低 |
| 4 | main 工作树有未提交的 SPEC v0.2 改动（XPENG_GX 流水线遗留），本次 WT commit 后会被覆盖，可清理 | 提醒 |

---

## 7. 复盘（XPENG_GX 流水线）

- **优点**：WT-data 阶段产出了高质量 SPEC v0.2（dispatch 友好版），但**未 commit** 到 main → 这次作为 main 工作树"未保存工作"被 WT 海报移除一并承载
- **教训**：XPENG_GX 流水线在 WT-data / WT-final 阶段应当把 SPEC v0.2 commit 一次（"docs: SPEC v0.2 dispatch friendly version"），而不是留给工作树
- **修复**：本次 WT commit 包含 SPEC v0.2 + 海报移除；下次类似流水线应在每个阶段产出后立即 commit
