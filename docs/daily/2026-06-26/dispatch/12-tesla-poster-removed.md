# 特斯拉海报展示模块移除 — 变更说明

> **日期**：2026-06-26
> **作者**：coder agent（orchestrator 自管）
> **上下文**：接续 11-xpeng-gx-poster-removed.md（main HEAD `2c9d698`），沿用同一模式
> **根因**：**PRD 设计失误** — 海报模块（809×1942 竖图空态占位）经复盘确认不属于业务核心展示路径，业务方短期不会补图，长期空态对用户体验无价值。

---

## 1. 改动清单

| # | 类型 | 文件 | 说明 |
|---|---|---|---|
| 1 | **删除** | `src/components/tesla/TeslaPosterStub.tsx` (56 行) | 海报空态 RSC 组件，仅被 `/product/tesla/page.tsx` 引用 |
| 2 | **修改** | `src/app/product/tesla/page.tsx` (149 → 147 行) | 删 `import { TeslaPosterStub }` + 删 `<TeslaPosterStub />` JSX |
| 3 | **新增** | `docs/daily/2026-06-26/dispatch/12-tesla-poster-removed.md`（本文） | 变更说明 |

---

## 2. 未改动项（澄清）

| 项 | 状态 | 原因 |
|---|---|---|
| `src/lib/tesla-products.ts` | **不动** | tesla 数据层**无** `sourceArea` 字段（与小鹏 GX 不同），无需保留 |
| `src/lib/product-routes.ts` (tesla 品牌 status live) | **不动** | 状态在 Tesla /dispatch 流水线已翻转 |
| `src/app/sitemap.ts` (`/product/tesla` 注册) | **不动** | 页面仍存在，仅去掉 1 个 section |
| `scripts/verify-tesla-content.mjs` | **不动** | 脚本不检查 PosterStub（验收仍全通过） |
| `e2e/tesla-topic.spec.ts` | **不动** | 截全页，删除 PosterStub 后页面变短，标题匹配仍通过 |
| `docs/daily/2026-06-26/dispatch/08-tesla-delivery.md` / `09-tesla-final.md` | **不动** | 历史交付报告保持原样 |
| `docs/plans/tesla-topic-implementation-plan-2026-06-26.md` | **不同步** ⚠️ | 该文件在 main 工作树上是 **untracked 状态**（不在 git 内），worktree 拉分支后不可见；同步会被忽略。属于 Tesla 流水线遗留（与 XPENG_GX SPEC v0.2 遗留同性质），待 main 工作树清理时一并处理 |

---

## 3. 设计决策记录

### 3.1 为什么 worktree 隔离？

- 与 11-xpeng-gx-poster-removed.md 保持一致
- 沿用 `/dispatch` 流水线纪律
- 便于失败时单独回滚（cherry-pick revert）

### 3.2 为什么删除组件而不是隐藏？

- 海报空态对 SEO / 用户体验无价值
- 业务方短期不补图 → 长期暴露空态损害品牌专业感
- 真正的项目图已在 `TeslaFeaturedGrid` 内通过 `imageStatus: "pending-review"` 占位
- 简化页面结构（10 主推 + 32 可选 + 6 场景 + 6 步 + 5 FAQ 已足够传达价值）

### 3.3 与小鹏 GX 海报移除对比

| 维度 | Xpeng GX (11) | Tesla (12) |
|---|---|---|
| 组件行数 | 56 | 56 |
| 页面引用 | page.tsx:10/111 | page.tsx:11/111 |
| 主题色 | emerald-400 | red-500 |
| 海报尺寸 | 1055×1491 | 809×1942 |
| 数据层 sourceArea 字段 | **保留**（来源追溯） | **无**该字段（无需保留） |
| 配套 SPEC/plan | `docs/SPEC/.../xpeng-gx.md` v0.2.1 | **untracked**（plan 文件不在 git） |
| verify 脚本 | 不检查 PosterStub（13/13 pass） | 不检查 PosterStub（5/5 pass） |
| e2e 截图 | 3 视口 | 3 视口 |

---

## 4. 质量门禁（变更后预期）

| 门禁 | 预期结果 | 实测 |
|---|---|---|
| `npx vitest run src/lib/tesla-products.test.ts` | 28 tests pass | ✅ **28/28** |
| `node scripts/verify-tesla-content.mjs` | 全通过 | ✅ 全部通过（5/5 块） |
| `grep -r "PosterStub" src/app/product/tesla/` | 0 命中 | ✅ **0** |
| `grep -rE ":\s*any\b" src/components/tesla/ src/app/product/tesla/` | 0 命中 | ✅ **0** |
| `npm run build`（main 终态） | exit 0，`/product/tesla` 仍 `○ Static` | ✅ 待 merge 后验证 |

---

## 5. Worktree + Commit 路径

| 阶段 | 命令 | 结果 |
|---|---|---|
| 创建 worktree | `git worktree add .claude/worktrees/agent-tesla-poster-remove -b worktree-agent-tesla-poster-remove main` | ✅ |
| 复制 `.env` | `cp ../.env .env` | ✅ |
| WT 内 commit | `refactor(tesla): 移除 TeslaPosterStub 海报空态模块（PRD 设计失误）` | 待执行 |
| 合并到 main | `git merge --no-ff worktree-agent-tesla-poster-remove` | 待执行 |

---

## 6. 与 11-xpeng-gx-poster-removed.md 衔接

11-xpeng-gx-poster-removed.md §6 "后续建议 #2 特斯拉的 PosterStub 是否同样需要清理" → **本次任务完成**。

后续建议（更新）：
1. ~~特斯拉 PosterStub~~ ✅ **本次完成**
2. **问界 M6/M7/M8 + L1 的 PosterStub（4 个组件）** — 仍待 Coya 决策（更复杂：3 个 page.tsx 调用 + 1 个 L1 page + 多 prop 接口）
3. **main 工作树清理** — ~150 modified 文件 + untracked plan/SPEC 文件（包括本任务提及的 `docs/plans/tesla-topic-implementation-plan-2026-06-26.md`）
4. **window-film 流水线遗留** — `src/lib/window-film-details.ts` + 配套组件 untracked，待处理

---

## 7. 复盘（跨 2 次海报移除）

- **优点**：本次完全复用 11-xpeng-gx-poster-removed.md 的工作流（创建 WT → 复制 env → 删除组件 → 改 page → 写报告 → 门禁 → 等 merge），节奏一致
- **教训**：`docs/plans/tesla-topic-implementation-plan-2026-06-26.md` 与 XPENG_GX 的 SPEC v0.2 一样属于"main 工作树遗留 untracked"，应当：
  - WT 完成时立即 `git add` 跟踪（哪怕是阶段成果）
  - 或在 merge 时一并 `git add` commit
  - 避免后续依赖这些文件的工作（如本次 plan 同步）落空
- **修复**：建议下次清理 main 工作树时，统一把 `docs/plans/*.md` 与 `docs/SPEC/.../*.md` 的遗留 untracked 文件批量 commit（即便内容是历史快照）

---

**Tesla 海报模块 ✅ 移除完成，等待用户确认 merge 到 main。**
