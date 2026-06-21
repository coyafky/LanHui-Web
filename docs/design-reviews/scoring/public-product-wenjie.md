# /product/wenjie — 问界主题评分卡

**路由**: `/product/wenjie`
**评分日期**: 2026-06-20
**视口**: Desktop 1440 + Mobile 390
**截图**: [desktop](../screenshots/desktop/public-product-wenjie.png) · [mobile](../screenshots/mobile/public-product-wenjie.png)

---

## 评分汇总

| 维度 | 得分 | 满分 | 评语 |
|---|---|---|---|
| D1 Layout | 16 | 20 | 布局结构完整,Hero+锚点+5 车型 section+CTA,但 mobile 大量空白 |
| D2 Visual | **8** | 20 | **P0: 30+ 车型图全 pending 占位,视觉"半成品"** |
| D3 Color | 17 | 20 | cyan 主色一致(符合 wenjie 主题色定义) |
| D4 Typography | 17 | 20 | "问界 M7 改装案例"h3 + 表格行高合理 |
| D5 Accessibility | 15 | 20 | 占位图缺 alt="图片即将上线"语义,辅助技术读到空 |
| **总分** | **73** | **100** | **C 合格(P0 严重视觉问题)** |

---

## 5 维度详细

### D1 Layout 布局 (16/20)
- ✅ Hero + 锚点 + 5 车型 section + 服务流程 + CTA,结构完整
- ✅ 表格(车型参数) 行高合理,信息密度适中
- ⚠️ mobile 5 个 section,每个 1 个空图占位区,滚动距离长且视觉空白

### D2 Visual 视觉 (**8/20**) — P0
- ❌ **P0-1: 30+ 车型图全为深灰色 pending 占位框**(业务未补图)
- ❌ 视觉感受"半成品",与 home/product 等已完善页对比明显
- ⚠️ 顶 hero 缩略图是真实彩色仪表板图,但下面所有车型图都是空框
- ⚠️ 缺"图片即将上线"/"该车型图待补" 占位视觉提示

### D3 Color 色彩 (17/20)
- ✅ cyan 主色一致(hero 蓝绿光晕 + 强调文字)
- ⚠️ cyan 在 zinc-950 黑底上对比度 5.8:1,达 AA 但边缘(可加粗字重)

### D4 Typography 排版 (17/20)
- ✅ "问界 M7 改装案例" h3 + 副标题 + 表格行层级清晰
- ⚠️ 表格"动力参数/续航"等列宽偏窄,中文字符偶有截断

### D5 Accessibility 可访问性 (15/20)
- ✅ 表格 `<th>` / `<td>` 语义正确
- ❌ 占位图无 `alt` 文本,屏幕阅读器读到空字符串
- ⚠️ 锚点导航缺 `aria-current` 状态

---

## 改版建议

| 优先级 | 改法 | 估时 |
|---|---|---|
| **P0-1** | 业务补图(短期): 占位图加 `alt="问界 M7 图片待补"` + 视觉提示文案"图片即将上线" + icon | 2h |
| **P0-1** | 长期: 业务补 30+ 张真实车型图(资源/拍摄) | 4-8h(待业务) |
| **P1** | cyan 主色加粗字重(font-medium → font-semibold)提升对比度 | 0.5h |
| **P1** | 锚点导航增加 `aria-current="location"` | 0.5h |
| **P2** | 表格列宽统一,中文字符不截断 | 1h |