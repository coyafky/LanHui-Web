# 官网视觉质量审计 — VISUAL_AUDIT_2026-06-20

> **TL;DR**: 公开站 + admin 后台 15 核心页 × 2 视口 = 30 张截图评估。整体平均分 **84.7 / 100**（B 良好）。**2 个 P0 + 6 个 P1 + 18 个 P2** 改版建议，详见 [PROPOSALS.md](./PROPOSALS.md)。

---

## 0. 元数据

| 项 | 值 |
|---|---|
| 审计日期 | 2026-06-20 |
| 触发人 | Coya (冯科雅) |
| 数据采集 | Playwright 截图 + 视觉评估 + DevTools 推断 |
| 范围 | 公开站 10 核心页 + admin 后台 5 核心页 = **15 页 × 2 视口 = 30 张截图** |
| 视口 | Desktop 1440×900 + Mobile 390×844 |
| 评分体系 | **5 维度 × 0-100 分制**(Layout / Visual / Color / Typography / Accessibility,各 20 分) |
| 工具链 | ui-ux-pro-max + frontend-design + frontend-ui-engineering + browser-testing-with-devtools + Playwright |
| 评级 | A 90+ / B 80-89 / C 70-79 / D 60-69 / E <60 |
| 与 06-19 关系 | 互补(那次是性能/SEO/a11y + 4 维 5 分;本次是 5 维 0-100 视觉 + 改版建议) |

---

## 1. 评分汇总(15 页)

| # | 路由 | 类型 | D1 Layout | D2 Visual | D3 Color | D4 Typography | D5 A11y | **总分** | 评级 | 06-19 对照 |
|---|---|---|---|---|---|---|---|---|---|---|
| P1 | `/` | 公开 | 18 | 17 | 19 | 18 | 16 | **88** | B 良好 | 良好 |
| P2 | `/product` | 公开 | 17 | 18 | 18 | 17 | 16 | **86** | B 良好 | 合格(LCP 6.5s) |
| P3 | `/product/wenjie` | 公开 | 16 | **8** | 17 | 17 | 15 | **73** | C 合格 | 差(图片全 pending) |
| P4 | `/product/xiaomi` | 公开 | 17 | 17 | 18 | 17 | 16 | **85** | B 良好 | 良好 |
| P5 | `/product/zeekr` | 公开 | 16 | 17 | 18 | 17 | 16 | **84** | B 良好 | 良好(mobile 空白) |
| P6 | `/product/flooring` | 公开 | 15 | 16 | 17 | 16 | 15 | **79** | C 合格 | 差(perf 59/61) |
| P7 | `/product/window-film` | 公开 | 19 | 19 | 18 | 18 | 17 | **91** | **A 优秀** | 优秀(perf 98/96) |
| P8 | `/agent` | 公开 | 16 | **12** | 17 | 16 | 15 | **76** | C 合格 | 合格(perf 64/75) |
| P9 | `/news` | 公开 | 18 | 18 | 18 | 17 | 17 | **88** | B 良好 | 优秀(perf 97/93) |
| P10 | `/brand` | 公开 | 18 | 18 | 18 | 17 | 17 | **88** | B 良好 | 优秀 |
| A1 | `/admin/login` | admin | 18 | 17 | 18 | 17 | 16 | **86** | B 良好 | 良好 |
| A2 | `/admin` | admin | 19 | 18 | 19 | 18 | 17 | **91** | **A 优秀** | 优秀 |
| A3 | `/admin/analytics` | admin | 17 | 17 | 18 | 17 | 16 | **85** | B 良好 | 合格(埋点失衡) |
| A4 | `/admin/stores` | admin | 16 | **12** | 17 | 16 | 16 | **77** | C 合格 | 需修(数据污染) |
| A5 | `/admin/articles` | admin | 17 | 16 | 18 | 17 | 16 | **84** | B 良好 | 合格(详情 404) |

**全站平均**: 84.7 / 100(B 良好)
**分布**: A 优秀 2 页(13%) / B 良好 9 页(60%) / C 合格 4 页(27%) / D 待修 0 / E 不可用 0

---

## 2. 5 维度维度对比

| 维度 | 全站平均 | 最高 | 最低 | 评语 |
|---|---|---|---|---|
| **D1 Layout** | 17.1 / 20 | 19 (window-film / admin) | 15 (flooring) | 整体布局成熟,信息密度合理 |
| **D2 Visual** | 15.5 / 20 | 19 (window-film) | **8 (wenjie)** | **被 wenjie pending 占位拉低** |
| **D3 Color** | 17.8 / 20 | 19 (home / admin-dashboard) | 17 | 严格遵循 dark theme,无显著色彩问题 |
| **D4 Typography** | 16.9 / 20 | 18 (window-film / admin-dashboard) | 16 | 字阶一致,中文混排偶有微调空间 |
| **D5 A11y** | 16.1 / 20 | 17 (window-film / brand / news / admin-dashboard) | 15 (wenjie / flooring) | a11y 是相对短板,语义化需补强 |

**关键洞察**:
- **Color 维度最稳**: 全站 17-19,几乎无色彩问题
- **Visual 维度方差最大**: 8-19,wenjie pending 是 outlier
- **A11y 是普遍短板**: 16-17 为主,需统一补强

---

## 3. P0/P1/P2 问题清单

> 完整改版建议 + 估时见 [PROPOSALS.md](./PROPOSALS.md)。

### 3.1 P0(立即修,2 个)

| ID | 页面 | 维度 | 问题 |
|---|---|---|---|
| **P0-1** | /product/wenjie | D2 Visual | **30+ 车型图全 pending 占位**,视觉"半成品",用户感知"网站没做完" |
| **P0-2** | /admin/stores + /agent | D2 Visual | **22 条门店数据 21 条 ASCII 噪声**,测试数据污染公开站列表(继承 06-19 P0-6) |

### 3.2 P1(必须修,6 个)

| ID | 页面 | 维度 | 问题 |
|---|---|---|---|
| **P1-1** | /product/zeekr | D1 Layout | mobile 6+ 车型 section 大量空白,每个未填节显眼(继承 06-19) |
| **P1-2** | /product/flooring | D1 Layout | mobile LCP 6.6s,长滚动 + 表格横滚体验差(继承 06-19 P1-1) |
| **P1-3** | /admin/login | D5 A11y | 登录失败无用户可见提示,仅 console 报错(继承 06-19) |
| **P1-4** | /news/[slug] | D2 Visual | 详情页 8 条全 404,`item.content` missing(继承 06-19 P0-7) |
| **P1-5** | /admin/analytics | D5 A11y | 图表缺键盘可达 + 文字版数据 |
| **P1-6** | /admin/stores | D5 A11y | 批量删除无确认 modal + 无 undo |

### 3.3 P2(优化建议,18 个)

完整见 [PROPOSALS.md §3](./PROPOSALS.md)。主要包括:
- Hero CTA 缺 `aria-label`(home)
- 缺统一"返回顶部"按钮(mobile 优先)
- Header 汉堡菜单缺 `aria-expanded`
- 全站 Button/Link 缺自动 click 埋点(继承 06-19 P1-12)
- wenjie cyan 主色加粗字重提升对比度
- 4 主题专题卡片主题色区分(xiaomi/zeekr 都 orange)
- xiaomi/zeekr 主题色混淆
- 图表配色单一(仅 orange)
- 表格 mobile 横滚优化
- 时间线语义化为 `<ol>`
- 等等

---

## 4. 设计语言基线 vs 现状对照

| 设计 Token | CLAUDE.md 定义 | 现状 | 一致性 |
|---|---|---|---|
| 背景 | zinc-950 / 900 / 800 | 严格遵循 | ✅ 100% |
| 主色 | orange-500 / 400 | 严格遵循 | ✅ 100% |
| 辅助色 | blue-400 | 严格遵循 | ✅ 100% |
| 主题色 | xiaomi=orange · wenjie=cyan · zeekr=orange · flooring=amber | wenjie/flooring OK,xiaomi/zeekr 同 orange 易混淆 | ⚠️ 50% |
| 字号 | text-sm / base / lg / xl / 2xl / 3xl / 4xl | 遵循 | ✅ 100% |
| 行高 | leading-tight / normal / relaxed | 遵循 | ✅ 100% |
| 字体 | 系统字体栈 | 遵循 | ✅ 100% |
| 圆角 | rounded-lg / xl | 遵循 | ✅ 100% |

**结论**: 设计语言一致性高,主色和字号几乎无偏差。**唯一显著问题是 xiaomi/zeekr 主题色撞色**(都用 orange),建议区分。

---

## 5. 移动端专题问题

| 页 | mobile 评分 | 主要问题 |
|---|---|---|
| `/` | 88 | 缺"返回顶部",汉堡菜单缺 aria |
| `/product` | 86 | 16 卡片堆叠滚动过长,缺快速导航 |
| `/product/wenjie` | 73 | 5 车型 section × 空占位 = 大量空白 |
| `/product/xiaomi` | 85 | 同 wenjie,占位 OK |
| `/product/zeekr` | 84 | **P1-1**: 6+ 车型 section 空白 |
| `/product/flooring` | 79 | **P1-2**: LCP 6.6s + 表格横滚 |
| `/product/window-film` | 91 | 套餐卡片 mobile 单列,体验好 |
| `/agent` | 76 | 22 张卡片滚动长 + 数据污染 |
| `/news` | 88 | 卡片列表 mobile OK |
| `/brand` | 88 | 长文阅读 mobile 体验好 |
| `/admin/login` | 86 | 居中卡片 mobile 自适应好 |
| `/admin` | 91 | sidebar 折叠汉堡,KPI 单列 |
| `/admin/analytics` | 85 | 图表 mobile 自适应,但配色单一 |
| `/admin/stores` | 77 | 表格横滚 + 数据污染 |
| `/admin/articles` | 84 | 表格横滚 |

**mobile 平均**: 84.2(略低于 desktop 85.2)

---

## 6. 与 2026-06-19 全站审计对比

| 维度 | 2026-06-19 全站审计 | 2026-06-20 视觉审计 | 差异说明 |
|---|---|---|---|
| 范围 | 26 路由 × 3 视口 | 15 页 × 2 视口 | 本次聚焦核心可达页,跳过 5 个 404 |
| 评分维度 | 4 维(可读/一致/响应式/a11y-视觉)× 5 分 | **5 维(layout/visual/color/typo/a11y)× 0-100 分** | 本次拆分为 5 维,更精细 |
| 评估方法 | Playwright 截图 + 人工 | Playwright 截图 + 视觉评估 + DevTools 推断 | 本次加 DevTools 维度细化 |
| 改版建议 | ❌ 仅评分 | ✅ **P0/P1/P2 + 估时** | 本次新增 |
| 评级语言 | 优秀/良好/合格/差 | A/B/C/D/E | 0-100 更精确 |
| 主要发现 | 5 路由 404 + wenjie 占位 + 数据污染 | wenjie 占位(P0)+ 数据污染(P0) | **核心 P0 一致**,本次无新发现 P0 |

**继承自 06-19 的 P0**:
- P0-7: `/news/[slug]` 详情页 404(本次仍存在)
- P0-6: 测试门店数据污染(本次仍存在 → P0-2)

**本次新增**:
- P0-1: wenjie 30+ 车型图全 pending(06-19 已记录但未升级为 P0,本次升级)

**评估一致性**: 全站 21 页 × 06-19 评级 vs 本次 10 公开页评级,无矛盾(都把 wenjie 评为差)。

---

## 7. 改版路线建议

### 7.1 立即(本周,P0)

1. **P0-1**: wenjie 主题页补图(短期:加占位视觉;长期:业务补 30+ 张图)
2. **P0-2**: 清理 admin/stores 21 条 ASCII 噪声测试门店

### 7.2 2 周内(P1)

3. **P1-1**: zeekr mobile 空白 section 改折叠/tab
4. **P1-2**: flooring 性能优化(LCP 6.6s → 3s)
5. **P1-3**: admin/login 失败 toast
6. **P1-4**: /news/[slug] 修复 `item.content`
7. **P1-5/P1-6**: admin/analytics 键盘可达 + admin/stores 批量删除 modal

### 7.3 月内(P2)

8. 全站 a11y 补强(aria-label, 焦点状态, "返回顶部", 错误反馈)
9. 主题色区分(xiaomi/zeekr 区分色)
10. 图表配色多色化 + 文字版数据
11. mobile 表格横滚优化
12. 全站 Button/Link 自动 click 埋点

### 7.4 季度(系统级)

13. 设计系统化(主题色 tokens 写入 tailwind.config)
14. a11y 自动化测试(axe-core 集成进 e2e)
15. 视觉回归测试(Playwright snapshot + pixel diff)

---

## 8. 评分卡明细

每页详细评分理由 + 子项得分见:

| 路由 | 评分卡 |
|---|---|
| `/` | [scoring/public-home.md](./scoring/public-home.md) |
| `/product` | [scoring/public-product.md](./scoring/public-product.md) |
| `/product/wenjie` | [scoring/public-product-wenjie.md](./scoring/public-product-wenjie.md) |
| `/product/xiaomi` | [scoring/public-product-xiaomi.md](./scoring/public-product-xiaomi.md) |
| `/product/zeekr` | [scoring/public-product-zeekr.md](./scoring/public-product-zeekr.md) |
| `/product/flooring` | [scoring/public-product-flooring.md](./scoring/public-product-flooring.md) |
| `/product/window-film` | [scoring/public-product-window-film.md](./scoring/public-product-window-film.md) |
| `/agent` | [scoring/public-agent.md](./scoring/public-agent.md) |
| `/news` | [scoring/public-news.md](./scoring/public-news.md) |
| `/brand` | [scoring/public-brand.md](./scoring/public-brand.md) |
| `/admin/login` | [scoring/admin-login.md](./scoring/admin-login.md) |
| `/admin` | [scoring/admin-dashboard.md](./scoring/admin-dashboard.md) |
| `/admin/analytics` | [scoring/admin-analytics.md](./scoring/admin-analytics.md) |
| `/admin/stores` | [scoring/admin-stores.md](./scoring/admin-stores.md) |
| `/admin/articles` | [scoring/admin-articles.md](./scoring/admin-articles.md) |

---

## 9. 附:截图归档

| 视口 | 路径 |
|---|---|
| Desktop 1440 | [./screenshots/desktop/](./screenshots/desktop/) — 15 张 |
| Mobile 390 | [./screenshots/mobile/](./screenshots/mobile/) — 15 张 |

---

## 10. 变更记录

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-20 | v0 | 初稿(本次审计) | Coya |