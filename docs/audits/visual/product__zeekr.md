# /product/zeekr (极氪改色专题)

**截图**:`desktop/product__zeekr.png` · `tablet/product__zeekr.png` · `mobile/product__zeekr.png`
**采集时间**:2026-06-19T06:20
**Lighthouse**:perf_m=94, perf_d=86, a11y=94, seo=100, LCP_m=2.2s, CLS=0, TBT_m=230ms

## 评分
| 维度 | 分数 | 备注 |
|---|---|---|
| 可读性 | 4/5 | 3 车型(009 / 8X / 9X)section 标题 + 价格表清晰 |
| 视觉一致性 | 5/5 | 与全站统一,orange 主题色(zeekr PRD 2.0) |
| 响应式健壮性 | 3/5 | mobile 14578px 极高,每个车型 section 间有大空白 |
| 可访问性(视觉层) | 4/5 | a11y 94 ✓ |

## 发现
- **P2-1**:mobile 视图每个车型 section 间隔大,scroll 体验可优化
- **P2-2**:TBT 230ms 略高(可能与 3 车型 × N 表格的客户端 hydration 相关)

## 重构建议
- 优先级 P2:`src/components/zeekr/ProductGrid.tsx` —— mobile 下 section 间距收紧
- 验收:mobile 视觉总高 < 12000px
- 备注:本主题页是 2026-06-16 ZEEKR build 的产物,perf 94/86 已优秀
