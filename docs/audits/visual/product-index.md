# /product (产品中心)

**截图**:`desktop/product.png` · `tablet/product.png` · `mobile/product.png`
**采集时间**:2026-06-19T06:20
**Lighthouse**:perf_m=76, perf_d=76, a11y=96, seo=100, LCP_m=6.5s, CLS=0, TBT_m=110ms

## 评分
| 维度 | 分数 | 备注 |
|---|---|---|
| 可读性 | 5/5 | 4 主题卡片(汽车/小米/问界/极氪改色专题)+ 轻改装备/汽车膜系 2 分类,信息架构清晰 |
| 视觉一致性 | 5/5 | 与全站统一,主题色对比(xiaomi=orange,wenjie=cyan,zeekr=orange) |
| 响应式健壮性 | 4/5 | mobile 4 卡片降为 2 列 → 1 列,无溢出 |
| 可访问性(视觉层) | 4/5 | a11y 96 ✓ |

## 发现
- **P1-1**:`perf_m=76, perf_d=76`,LCP 6.5s
- 推测原因:页面含 4 大主题 hero + 6 个子分类卡片,首屏图片加载慢

## 重构建议
- 优先级 P1:`src/app/product/page.tsx` —— 首屏 4 主题图加 `priority`
- 验收:Lighthouse mobile perf ≥ 85
