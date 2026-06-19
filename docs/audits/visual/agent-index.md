# /agent (全国门店网络)

**截图**:`desktop/agent.png` · `tablet/agent.png` · `mobile/agent.png`
**采集时间**:2026-06-19T06:20
**Lighthouse**:perf_m=64, perf_d=75, a11y=96, seo=100, LCP_m=6.0s, CLS=0, TBT_m=240ms

## 评分
| 维度 | 分数 | 备注 |
|---|---|---|
| 可读性 | 4/5 | 顶部省/市筛选(广东省/山东省/湖北省)+ 27+ 卡片网格清晰 |
| 视觉一致性 | 5/5 | 卡片样式延续,store icon 一致 |
| 响应式健壮性 | 3/5 | mobile 网格降为 1 列,30+ 卡片 scroll 久 |
| 可访问性(视觉层) | 4/5 | a11y 96 ✓ |

## 发现
- **P1-1**:`perf_m=64, perf_d=75`,LCP 6.0s
- **P1-2**:观察到部分 store 卡片图片为空(灰色 placeholder,可能 store 暂无 logo)

## 重构建议
- 优先级 P1:`src/app/agent/page.tsx` —— store 列表加 `next/image` + 视口外 lazy load
- 优先级 P1:无 logo 的 store 用首字母占位(目前是空方框)
- 验收:Lighthouse mobile perf ≥ 80

## Lighthouse 改进方向
- LCP 6.0s → ≤ 2.5s:分页 / 虚拟滚动
- TBT 240ms → ≤ 200ms:store 列表的卡片内容可 SSR
