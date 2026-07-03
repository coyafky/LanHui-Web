# Tesla 专题页流水线 — 启动

**时间**：2026-06-26
**Orchestrator**：prompt-boost / Coya
**main HEAD**：`c8d6636`（问界 P2 修复后）
**PRD**：`docs/PRD/product/TESLA_TOPIC_PRD_2026-06-24.md`（v0.1, 2026-06-24）
**模板参考**：`docs/plans/wenjie-series-upgrade-implementation-plan-2026-06-26.md` + `docs/daily/2026-06-26/dispatch/06-final-delivery.md`

---

## 启动上下文

- **需求**：基于 Tesla PRD 实现 `/product/tesla` 单级专题页
- **关键约束**：单级（modelSlugs: []）、项目卡片无 CTA、海报展示必有、车型适配边界声明必备、主题色 red、字面量 as const、0 any
- **状态**：✅ 已通过 prompt-boost 阶段 + 用户两次确认（默认决策 + visibility 模块）

## Worktree 规划

| 阶段 | Worktree | 角色 | 状态 |
|---|---|---|---|
| 0 | 主 repo | orchestrator | running |
| 1（前置） | `worktree-agent-tesla-prep` | coder | 启动 |
| 2 | `worktree-agent-tesla-data` | coder | 待 0 后 |
| 3 | `worktree-agent-tesla-ui` | webdesign-engineer | 待 2 后 |
| 4 | `worktree-agent-tesla-page` | webdesign-engineer | 待 3 后 |
| 5 | 主 repo（最后收尾） | coder | 待合并后 |
| 6 | 主 repo | tester | 待 5 后 |
| 7 | 主 repo | orchestrator | 待 6 后 |

## 依赖图

```
阶段 1 (prep) ──┐
                ├─ 阶段 2 (data) → 阶段 3 (ui) → 阶段 4 (page) → 阶段 5 (sitemap) → 阶段 6 (tester) → 阶段 7 (gate) → 阶段 8 (报告)
阶段 1 (prep) ──┘ (独立)
```

## 文件级影响

```
src/
├── app/product/
│   ├── page.tsx                          [修改] 加"整理中车系"折叠区
│   ├── tesla/page.tsx                    [新增] 单级专题页
│   └── sitemap.ts (实际 src/app/sitemap.ts) [修改] +1 行
├── components/tesla/                     [新增目录] 8 件组件 + 1 banner
│   ├── TeslaTopicBanner.tsx              [新增] 入口卡
│   ├── TeslaHero.tsx
│   ├── TeslaFeaturedGrid.tsx             [无 CTA]
│   ├── TeslaScenarios.tsx
│   ├── TeslaMoreChoices.tsx              [按 group 折叠]
│   ├── TeslaServiceFlow.tsx
│   ├── TeslaFaq.tsx
│   ├── TeslaPosterSection.tsx
│   └── TeslaModelFitmentNotice.tsx
├── lib/
│   ├── tesla-products.ts                 [新增] 主数据层
│   ├── tesla-products.test.ts            [新增] 单测 ≥ 30
│   └── product-routes.ts                 [修改] tesla status live
```

## 阶段 0 动作

- [x] git status 检查（main ahead of origin/main 38 commits, expected）
- [x] tsc 基线确认（9 pre-existing 错误，与 AGENTS.md 一致）
- [x] dispatch logs 目录就绪（已有 7 个问界 log 文件）
- [x] 任务清单创建（10 个 task）
- [ ] 启动 Architect agent（生成 plan 文档）
- [ ] 启动 Coder 前置任务（TeslaTopicBanner + product/page.tsx）
