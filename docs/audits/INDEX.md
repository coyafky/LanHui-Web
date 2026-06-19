# LANHUI 全站审计索引(2026-06-19)

## 0. 元数据
- 日期:2026-06-19
- 触发人:Coya
- 方法:Playwright 截图 + Lighthouse 性能 + Claude 视觉评估
- 覆盖率:TBD 路由 × 3 视口(desktop/tablet/mobile)= TBD 张图 + TBD 份 Lighthouse 报告

## 1. 入口
- [截图归档](./screenshots/INDEX.md) —— 页面截图(由 `npm run screenshot:all` 生成)
- [视觉评估](./visual/INDEX.md) —— 每页 4 维度评分卡
- [Lighthouse 分数](./lighthouse/SUMMARY.md) —— perf/a11y/seo/best-practices × mobile/desktop
- [最终 PRD](../PRD/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) —— 修复任务源

## 2. 怎么跑

```bash
npm run audit:full
```

需 dev server(自动起)+ Postgres(可选,只影响 agent/store 动态页)。耗时约 30-60 分钟。

## 3. 历史
- 2026-06-19:首次全站审计
