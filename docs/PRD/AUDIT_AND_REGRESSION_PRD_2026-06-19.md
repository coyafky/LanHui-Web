# PRD-2026-06-19 全站审计与回归

> 状态:骨架(待 A worktree 跑出数据后由主控 session 填值)
> 关联:本次 audit 脚本在 worktree `worktree-agent-audit-scripts`,报告归档在 `docs/audits/`

## 0. 元信息
| 项 | 值 |
|---|---|
| 日期 | 2026-06-19 |
| 触发 | Coya 要求全站回归审计 |
| 范围 | 全站 26 公开路由(SSG 优先 + 动态展开) + 5 admin 页(可选) |
| 方法 | Playwright 截图(3 视口)+ Lighthouse 性能(mobile + desktop)+ Claude 视觉评估 + Playwright e2e |
| 输出 | 本文档 + docs/audits/ 全套归档 |

## 1. 背景与目标
全站上线前/迭代中的健康检查。识别 P0/P1 阻断/严重问题,生成可被 `/build` 直接消费的修复任务。

## 2. 扫描覆盖
| 视口 | 截图数 | Lighthouse 数 |
|---|---|---|
| Desktop 1440 | TBD | TBD |
| Tablet 768  | TBD | - |
| Mobile 390  | TBD | TBD |
| 合计 | TBD | TBD |

(动态展开的路由数:news=3, agent=省+市, window-film=2, store=1 或 skipped:no-db)

## 3. 关键发现 TL;DR
(主控 session 跑 `npm run screenshot:all` + `npm run lighthouse:run` + e2e 后填)

## 4. 全站性能基线
(主控 session 从 `docs/audits/lighthouse/SUMMARY.md` 拉,只列 < 90 分的页 + Top 3 LCP/CLS 异常)

## 5. 视觉一致性问题汇总
(主控 session 从 `docs/audits/visual/INDEX.md` 拉,按问题类型归并)

## 6. 功能测试矩阵
(主控 session 从 e2e Playwright 报告拉,每个用例的 pass/fail 状态 + 链接)

## 7. P0/P1 问题清单

### P0-1: TBD
- 现象:TBD
- 建议修复:TBD
- 验收:TBD

### P0-2: TBD
- 现象:TBD
- 建议修复:TBD
- 验收:TBD

(更多 P0/P1 待主控 session 填)

## 8. 与现有 PRD 的冲突
(主控 session 填,引用 `docs/PRD/*.md` 中与本次发现矛盾的条目)

## 9. 后续任务(给 /build 消费)
- [ ] 修 P0-1
- [ ] 修 P0-2
- [ ] 修 P1-1
- [ ] 跑 `npm run audit:full` 验证修复

## 10. 附录
- 脚本入口:`scripts/audit/screenshot-all.mjs` · `scripts/audit/lighthouse-run.mjs`
- 测试入口:`e2e/audit-full-site.spec.ts`
- 截图入口:`docs/audits/screenshots/INDEX.md`(在 .gitignore 中,需本地跑)
- 评估入口:`docs/audits/visual/INDEX.md`
- Lighthouse 入口:`docs/audits/lighthouse/SUMMARY.md`
- e2e 报告:`playwright-report/index.html`

## 11. 已知 pre-existing 问题(不计入本次审计)
- `src/app/news/[slug]/page.tsx:94` 引用 `item.content` 字段不存在(commit 0b8f38c)
- `npx tsc --noEmit` 9 个预存错位于 `src/app/api/analytics/stats/route.test.ts` 和 `src/lib/analytics.test.ts`
- `npm run build` 在缺 Postgres 时 OK,有 Postgres 也 OK(SSG 优先)
