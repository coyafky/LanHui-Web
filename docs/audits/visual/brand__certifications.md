# /brand/certifications (品牌资质)

**截图**:`desktop/brand__certifications.png` · `tablet/brand__certifications.png` · `mobile/brand__certifications.png`
**采集时间**:2026-06-19T06:20
**Lighthouse**:perf_m=63, perf_d=77, a11y=95, seo=100, LCP_m=6.0s, CLS=0, TBT_m=190ms

## 评分
| 维度 | 分数 | 备注 |
|---|---|---|
| 可读性 | 4/5 | 证书网格布局清晰,文字标签完整 |
| 视觉一致性 | 5/5 | 与品牌页统一,卡片样式延续 |
| 响应式健壮性 | 4/5 | mobile 网格降为 1 列,触摸目标足够 |
| 可访问性(视觉层) | 4/5 | a11y 95 ✓ |

## 发现
- **P1-1**:`perf_m=63` 性能低于阈值(50-89 区间),LCP 6.0s
- 推测原因:页面含大量证书图片,未做 lazy loading 或 next/image 优化

## 重构建议
- 优先级 P1:`src/app/brand/certifications/page.tsx` —— 证书图片改为 `next/image` + `loading="lazy"`
- 验收:Lighthouse mobile perf ≥ 80
