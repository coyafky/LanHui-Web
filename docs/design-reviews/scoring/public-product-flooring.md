# /product/flooring — 地板改装评分卡

**路由**: `/product/flooring`
**评分日期**: 2026-06-20
**截图**: [desktop](../screenshots/desktop/public-product-flooring.png) · [mobile](../screenshots/mobile/public-product-flooring.png)

---

## 评分汇总

| 维度 | 得分 | 满分 | 评语 |
|---|---|---|---|
| D1 Layout | 15 | 20 | 06-19 评 mobile 健壮性 3/5;desktop OK |
| D2 Visual | 16 | 20 | amber 主色一致,产品图饱满 |
| D3 Color | 17 | 20 | amber 主题色,与 zeekr/xiaomi 区分 |
| D4 Typography | 16 | 20 | 字阶 OK,mobile 表格密度大 |
| D5 Accessibility | 15 | 20 | mobile 长滚动 + 表格横滚需优化 |
| **总分** | **79** | **100** | **C 合格(06-19 perf 59/61)** |

---

## 5 维度详细

### D1 Layout 布局 (15/20)
- ⚠️ 06-19 评 mobile 健壮性 3/5,卡顿明显
- ⚠️ 桌面 OK,Hero+6 卡片+表格节奏合理

### D2 Visual 视觉 (16/20)
- ✅ 真实地板纹理图,视觉饱满
- ⚠️ amber 与 orange 接近,品牌色差异不够显著

### D3 Color 色彩 (17/20)
- ✅ amber 主题色一致
- ⚠️ 与 orange (xiaomi/zeekr) 色相接近,需加深饱和度区分

### D4 Typography 排版 (16/20)
- ⚠️ mobile 表格行密度大,小字易疲劳

### D5 Accessibility 可访问性 (15/20)
- ⚠️ mobile 长滚动需"返回顶部"按钮
- ⚠️ 表格横滚体验需优化(sticky 首列?)

---

## 改版建议

| 优先级 | 改法 | 估时 |
|---|---|---|
| **P1** | mobile 性能优化(LCP 6.6s → 3s):图片 lazy + 关键图 priority | 3h |
| **P2** | 表格 mobile 改卡片式(免横滚) | 2h |
| **P2** | amber 主题色加深区分于 orange | 0.5h |