# /admin — 后台仪表盘评分卡

**路由**: `/admin`
**评分日期**: 2026-06-20
**截图**: [desktop](../screenshots/desktop/admin-dashboard.png) · [mobile](../screenshots/mobile/admin-dashboard.png)

---

## 评分汇总

| 维度 | 得分 | 满分 | 评语 |
|---|---|---|---|
| D1 Layout | 19 | 20 | sidebar + 4 KPI + 内容健康 + 门店网络 + 趋势 + 活动 + 入口,布局成熟 |
| D2 Visual | 18 | 20 | orange 折线图 + KPI 大字数字 + 圆角图标,视觉饱满 |
| D3 Color | 19 | 20 | orange 主题贯穿 sidebar/KPI/图表,与 CLAUDE.md dark theme 一致 |
| D4 Typography | 18 | 20 | "仪表盘" h1 + KPI 数字 4xl + 标签 sm,层级清晰 |
| D5 Accessibility | 17 | 20 | sidebar 用 `<nav>`;mobile 折叠为汉堡;KPI 卡需键盘可达 |
| **总分** | **91** | **100** | **A 优秀(06-19 评优秀)** |

---

## 5 维度详细

### D1 Layout 布局 (19/20)
- ✅ sidebar(深色) + 内容区(浅色) 双栏布局,信息密度高
- ✅ 4 KPI 横排 + 内容健康/门店网络 + 趋势图 + 活动 + 入口,层级分明
- ✅ mobile sidebar 折叠为汉堡菜单,KPI 单列堆叠

### D2 Visual 视觉 (18/20)
- ✅ orange 折线图(高对比)、KPI 大字数字、圆角图标,视觉饱满
- ⚠️ "本月预约 0" 大字与橙色图标对比稍弱,视觉重点不突出

### D3 Color 色彩 (19/20)
- ✅ orange 主题贯穿 sidebar/KPI/图表;zinc-950/900 黑底严格遵循 dark theme
- ⚠️ "已发布 8"绿/草稿橙/趋势橙 三色对比清晰,但绿稍暗

### D4 Typography 排版 (18/20)
- ✅ "仪表盘" h1 + KPI 数字 4xl + 标签 sm,层级清晰
- ⚠️ 数字与单位(家/篇)间距偶尔偏小

### D5 Accessibility 可访问性 (17/20)
- ✅ sidebar 用 `<nav>`;汉堡菜单有 `aria-expanded`
- ⚠️ KPI 卡缺 `<a>` 包裹(整张卡不可点击跳转)
- ⚠️ 趋势图缺 `<figcaption>` 文字版数据(屏幕阅读器读不到)

---

## 改版建议

| 优先级 | 改法 | 估时 |
|---|---|---|
| **P2** | KPI 整张卡加 `<a>` 包裹跳转对应模块 | 1h |
| **P2** | 趋势图增加 `<figcaption>` 文字版(供 a11y) | 1h |
| **P2** | "本月预约" 0 状态增加视觉强调(如红色 / ⚠️ 图标) | 0.5h |