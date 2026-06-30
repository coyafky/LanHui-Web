# 视觉评审索引 — docs/design-reviews/

> **首次视觉质量评审(2026-06-20)**: 公开站 + admin 后台,15 核心页 × 2 视口 = 30 张截图,5 维度 0-100 分制,产出 P0/P1/P2 改版建议。
>
> 后续视觉评审/改版记录归此目录。

---

## 入口

| 文档 | 说明 |
|---|---|
| **[VISUAL_AUDIT_2026-06-20.md](./VISUAL_AUDIT_2026-06-20.md)** | 主报告 — 评分汇总 + 维度对比 + 改版路线 |
| **[FRAME_EXPRESSION_AUDIT_2026-06-29.md](./FRAME_EXPRESSION_AUDIT_2026-06-29.md)** | 页面逐帧表达审计 — 基于 Playwright 逐屏截图，分析客户触达、语言组织和转化路径 |
| **[PROPOSALS.md](./PROPOSALS.md)** | 改版建议清单 — 2 P0 + 6 P1 + 18 P2,估时 + 优先级 |
| **[scoring/](./scoring/)** | 15 份评分卡(每页 1 份,含子项得分 + 理由 + 改版建议) |
| **[screenshots/desktop/](./screenshots/desktop/)** | 15 张 desktop 1440 截图 |
| **[screenshots/mobile/](./screenshots/mobile/)** | 15 张 mobile 390 截图 |
| **[screenshots/2026-06-29-frame-audit/](./screenshots/2026-06-29-frame-audit/)** | 10 个公开站页面的 desktop/mobile 逐帧截图 + `frames.json` |

---

## 使用边界

`docs/design-reviews/` 用于评估页面美观性和功能模块实现体验，重点包括:

- 视觉层级、密度、留白、色彩和组件一致性。
- 关键交互状态: hover / focus / loading / empty / error / success。
- 响应式表现: mobile 390、tablet 768、desktop 1440。
- 功能模块可用性: 用户能否完成 PRD 定义的关键路径。
- a11y: 键盘可达、语义化、aria、错误提示。

不在这里写完整需求或实现计划:

- 需求边界放 `docs/PRD/`。
- 实现合约放 `docs/SPEC/`。
- 执行计划放 `docs/plans/`。
- 命令和测试证据放 `docs/test-reports/`。
- 当日汇总放 `docs/daily/YYYY-MM-DD/`。

---

## 评分快速表(15 页)

| 路由 | 总分 | 评级 | 主要问题 |
|---|---|---|---|
| / | 88 | B | 缺 aria-label + 返回顶部 |
| /product | 86 | B | 主题色未区分 |
| /product/wenjie | 73 | C | **P0: 30+ 图 pending 占位** |
| /product/xiaomi | 85 | B | 与 zeekr 撞色 |
| /product/zeekr | 84 | B | **P1: mobile 空白 section** |
| /product/flooring | 79 | C | **P1: LCP 6.6s + 表格横滚** |
| /product/window-film | 91 | A | 几乎无问题 |
| /agent | 76 | C | **P1: 22 张卡片 ASCII 噪声** |
| /news | 88 | B | 详情页 404(继承) |
| /brand | 88 | B | 时间线缺语义化 |
| /admin/login | 86 | B | **P1: 失败无提示** |
| /admin | 91 | A | 几乎无问题 |
| /admin/analytics | 85 | B | 图表配色单一 + 键盘不可达 |
| /admin/stores | 77 | C | **P0: 21 条 ASCII 噪声** |
| /admin/articles | 84 | B | 详情页 404(继承) |

**平均**: 84.7 / 100(B 良好)
**分布**: A 13% / B 60% / C 27% / D 0% / E 0%

---

## 关键发现 TL;DR

1. **设计语言一致性高**(100% 遵循 CLAUDE.md dark theme)
2. **xiaomi/zeekr 主题色撞色**(都 orange,建议区分)
3. **wenjie 30+ 图全 pending 占位**(P0,视觉"半成品")
4. **22 条门店 21 条 ASCII 噪声**(P0,测试数据污染公开站)
5. **/news/[slug] 详情页全 404**(继承 06-19 P0-7)
6. **a11y 是普遍短板**(语义化需补强,aria-label/焦点/错误反馈)
7. **Color 维度最稳**(17-19 全站),**Visual 维度方差最大**(8-19)

---

## 历史

| 日期 | 版本 | 内容 |
|---|---|---|
| 2026-06-20 | v0 | 首次视觉质量评审(本次) |
| 2026-06-29 | v1 | 新增逐帧表达审计，聚焦客户触达、页面语言和转化路径 |

---

## 关联

- [../PRD/cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md](../PRD/cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) — 06-19 审计 PRD
- [../../CLAUDE.md](../../CLAUDE.md) — 设计语言基线(dark theme)
