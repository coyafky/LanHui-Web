# /admin/analytics — 数据分析评分卡

**路由**: `/admin/analytics`
**评分日期**: 2026-06-20
**截图**: [desktop](../screenshots/desktop/admin-analytics.png) · [mobile](../screenshots/mobile/admin-analytics.png)

---

## 评分汇总

| 维度 | 得分 | 满分 | 评语 |
|---|---|---|---|
| D1 Layout | 17 | 20 | sidebar + 图表区,布局整齐 |
| D2 Visual | 17 | 20 | 多种图表(折线/柱状/饼图),但**配色单一(仅 orange)** |
| D3 Color | 18 | 20 | orange 主色,但缺多色对比 |
| D4 Typography | 17 | 20 | 图表标签字号偏小,密集时难读 |
| D5 Accessibility | 16 | 20 | 图表缺数据表 fallback;事件分布失衡(P1-12) |
| **总分** | **85** | **100** | **B 良好** |

---

## 5 维度详细

### D1 Layout 布局 (17/20)
- ✅ sidebar + 多图表网格,布局稳定

### D2 Visual 视觉 (17/20)
- ⚠️ **P2-3: 图表配色单一**(所有图表仅 orange,缺对比色)
- ⚠️ 事件分布"页面浏览 695 / 点击 5"对比悬殊,视觉上像 bug

### D3 Color 色彩 (18/20)
- ✅ orange 主色一致
- ⚠️ 多图表场景下需补 blue-400 / green-500 / red-500 区分

### D4 Typography 排版 (17/20)
- ⚠️ 图表标签字号偏小(可能 10px/12px),密集难读

### D5 Accessibility 可访问性 (16/20)
- ⚠️ 图表缺 `<figcaption>` 文字版数据
- ⚠️ 鼠标 hover 数据点显示数值,但键盘不可达

---

## 改版建议

| 优先级 | 改法 | 估时 |
|---|---|---|
| **P2-3** | 图表配色多色化(orange 主 + blue-400 + green-500) | 2h |
| **P2** | 图表标签字号 ≥ 12px | 0.5h |
| **P1**(继承 06-19) | 全站 Button/Link 加自动 click 埋点(解决 P1-12 失衡) | 4h |
| **P2** | 图表加 `<figcaption>` 文字版 + Tab 键可达 | 2h |