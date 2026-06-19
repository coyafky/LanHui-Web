# LANHUI 全站审计索引(2026-06-19)

## 0. 元数据
- 日期:2026-06-19
- 触发人:Coya
- 方法:Playwright 截图 + Lighthouse 性能 + Claude 视觉评估 + Playwright e2e
- 覆盖率:**26 路由 × 3 视口 = 78 张截图**;**21 路由 × 2 formFactor = 42 份 Lighthouse 报告**;**23 个 e2e 用例(20 pass / 3 fail / 1 skip)**

## 1. 入口
- [截图归档](./screenshots/INDEX.md) —— 78 张页面截图(57 成功,21 失败 — 5 路由 × 3 视口)
- [视觉评估](./visual/INDEX.md) —— 21 可达路由 4 维度评分 + 8 份详细评估
- [Lighthouse 分数](./lighthouse/SUMMARY.md) —— 21 路由 × mobile/desktop,perf/a11y/seo + LCP/CLS/TBT
- [最终 PRD](../PRD/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) —— P0/P1 修复任务源(给 /build 消费)

## 2. 怎么跑

```bash
# 后台起 dev server
npm run dev > /tmp/dev.log 2>&1 &

# 截图
BASE_URL=http://localhost:3000 npm run screenshot:all

# 性能
BASE_URL=http://localhost:3000 npm run lighthouse:run

# e2e
npx playwright test e2e/audit-full-site.spec.ts
```

需 dev server(可选 Postgres,只影响 agent/store 动态页)。耗时约 30-60 分钟。

## 3. 关键发现 TL;DR

| 严重度 | 数量 | 典型例子 |
|---|---|---|
| **P0** | 1 类(5 路由 404) | /news/[slug] pre-existing bug,/agent 动态页脚本 slug 错 |
| **P1** | 5 类 | wenjie 图片全 pending,/product/flooring perf 59/61,/agent 列表 27+ 卡片慢 |
| **P2** | 7+ | 首页 Hero LCP 6.4s,zeekr mobile 空白 section |

## 4. 历史
- 2026-06-19:首次全站审计(本次)
