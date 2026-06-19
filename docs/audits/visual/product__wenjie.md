# /product/wenjie (问界改色专题)

**截图**:`desktop/product__wenjie.png` · `tablet/product__wenjie.png` · `mobile/product__wenjie.png`
**采集时间**:2026-06-19T06:20
**Lighthouse**:perf_m=77, perf_d=88, a11y=94, seo=100, LCP_m=5.5s, CLS=0, TBT_m=190ms

## 评分
| 维度 | 分数 | 备注 |
|---|---|---|
| 可读性 | 3/5 | hero 与说明文字清晰,但 30+ 车型 section 标题相似,信息密度低 |
| 视觉一致性 | 5/5 | 与全站统一,cyan 主题色在 wenjie 主题突出 |
| 响应式健壮性 | 3/5 | mobile 长截图 24227px 高,scroll 体验差;tablet 24000+ px |
| 可访问性(视觉层) | 4/5 | a11y 94 ✓ |

## 发现 — **P1 重大**
- **P1-2**:**所有车型图片为 `publicPath: null` 的 pending 占位状态**。desktop/tablet/mobile 三视口均显示空方框图标,无实际产品图。
  - 根因:`src/lib/wenjie-products.ts` 数据层面所有 `image.publicPath = null`(业务尚未补图)
  - 影响:用户看到 30+ 个空白卡片,转化率为 0
  - 修复方向:
    1. 短期:UI 层加友好占位("图片即将上线" + 渐变背景)
    2. 中期:补全 M7/M8/M9/New 4 个车型目录下的真实产品图
    3. 长期:加 CI 脚本 `verify-wenjie-images.mjs` 类似 zeekr 的版本,防止 pending 状态进入生产

## 重构建议
- 优先级 P1:`src/components/wenjie/ProductCard.tsx` —— imageStatus='pending' 时显示渐变 + "图片即将上线" 文字
- 优先级 P1:`public/images/products/wenjie/{M7,M8,M9,New}/` 补全产品图
- 优先级 P1:新增 `scripts/verify-wenjie-images.mjs` 链入 `npm run check`
- 验收:Lighthouse mobile perf ≥ 85,所有车型图非空

## Lighthouse 改进方向
- LCP 5.5s → ≤ 2.5s:pending 占位改为文字后,首屏文字加载更快
- a11y 94 → 95:检查 pending 占位的 aria-label
