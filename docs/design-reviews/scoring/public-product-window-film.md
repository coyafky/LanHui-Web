# /product/window-film — 窗膜套餐评分卡

**路由**: `/product/window-film`
**评分日期**: 2026-06-20
**截图**: [desktop](../screenshots/desktop/public-product-window-film.png) · [mobile](../screenshots/mobile/public-product-window-film.png)

---

## 评分汇总

| 维度 | 得分 | 满分 | 评语 |
|---|---|---|---|
| D1 Layout | 19 | 20 | 06-19 评 5/5/5/4 优秀,布局最成熟页 |
| D2 Visual | 19 | 20 | 套餐卡片真实图+参数,视觉饱满 |
| D3 Color | 18 | 20 | orange 主色,玻璃透光感视觉好 |
| D4 Typography | 18 | 20 | 字阶清晰,套餐名/价格/规格层级好 |
| D5 Accessibility | 17 | 20 | 语义 OK;价格缺 `<del>` 划线原价 vs 当前价 |
| **总分** | **91** | **100** | **A 优秀(06-19 perf 98/96)** |

---

## 5 维度详细

### D1 Layout 布局 (19/20)
- ✅ Hero + 套餐网格 + 对比 + CTA 节奏优秀
- ✅ 套餐卡片统一规格,网格对齐精准

### D2 Visual 视觉 (19/20)
- ✅ 玻璃/车窗真实图,视觉通透
- ✅ 套餐层级清晰(图 + 套餐名 + 价格 + 规格)

### D3 Color 色彩 (18/20)
- ✅ orange 主色,玻璃透光感恰到好处

### D4 Typography 排版 (18/20)
- ✅ 套餐名 2xl / 价格 xl / 规格 sm,层级完整

### D5 Accessibility 可访问性 (17/20)
- ✅ 语义化好
- ⚠️ 价格缺原价 vs 现价对比的可访问语义(屏幕阅读器难懂)

---

## 改版建议

| 优先级 | 改法 | 估时 |
|---|---|---|
| **P2** | 价格对比加 `<del>` + `aria-label="原价 X 元,现价 Y 元"` | 0.5h |
| **P2** | 套餐卡片增加 hover 动效(图片轻放大) | 0.5h |