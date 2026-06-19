# / (首页)

**截图**:`desktop/root.png` · `tablet/root.png` · `mobile/root.png`
**采集时间**:2026-06-19T06:20
**Lighthouse**:perf_m=69, perf_d=75, a11y=96, seo=100, LCP_m=6.4s, CLS=0, TBT_m=290ms

## 评分
| 维度 | 分数 | 备注 |
|---|---|---|
| 可读性 | 5/5 | Hero 主标题"蓝辉轻改"层次清晰,蓝色品牌色突出 |
| 视觉一致性 | 5/5 | Header/Footer/卡片样式与全站统一,深色 + 琥珀强调 |
| 响应式健壮性 | 4/5 | mobile Hero 文字可读,3 列卡片降为 1 列,无溢出 |
| 可访问性(视觉层) | 4/5 | 对比度合格,CTA 按钮"获取专属改装方案"焦点可见 |

## 发现
- **P2-1**:Hero 右侧在 desktop 视口有大块空白(可能是装饰图未加载),建议补图或调整 layout
- **P2-2**:mobile LCP 6.4s,Hero 文字 + 装饰元素加载慢,建议 next/image 优先级 `priority`

## 重构建议
- 优先级 P2:`src/components/Hero.tsx` L? 添加 `priority` 到 Hero image
- 验收:`npm run lighthouse:run` 后首页 mobile perf ≥ 80

## Lighthouse 改进方向
- LCP 6.4s → 目标 ≤ 2.5s:启用 next/image priority + 优化字体加载
- TBT 290ms → ≤ 200ms:减少 main thread 阻塞
