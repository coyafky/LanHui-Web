# /contact (联系我们)

**截图**:`desktop/contact.png` · `tablet/contact.png` · `mobile/contact.png`
**采集时间**:2026-06-19T06:20
**Lighthouse**:perf_m=75, perf_d=97, a11y=89, seo=100, LCP_m=5.9s, CLS=0, TBT_m=190ms

## 评分
| 维度 | 分数 | 备注 |
|---|---|---|
| 可读性 | 5/5 | 大字号客服电话"0757-2288 1001"突出,4 卡片信息层次清晰 |
| 视觉一致性 | 5/5 | 与全站统一,服务流程 4 步用数字 + 卡片 |
| 响应式健壮性 | 4/5 | mobile 下客服电话保持可点击 tel: 链接,4 卡片垂直堆叠 |
| 可访问性(视觉层) | 4/5 | a11y 89,需检查对比度 |

## 发现
- **P2-1**:mobile LCP 5.9s 偏高(主因可能是地图嵌入或外链),建议移动端懒加载地图
- **P2-2**:a11y 89,可能缺 aria-label 或表单 label(联系表单如存在)

## 重构建议
- 优先级 P2:`src/app/contact/page.tsx` —— mobile 端地图组件 `loading="lazy"`
- 优先级 P2:检查所有 `<a>` 缺 aria-label 的地方
- 验收:Lighthouse a11y ≥ 95
