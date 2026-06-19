# 视觉评估索引

> 每页 4 维度评分(可读性 / 视觉一致性 / 响应式健壮性 / 可访问性-视觉层)。
> 主控 session 跑 `npm run screenshot:all` 后,Read 截图并填值。

## 评分标准
- 5/5:业界领先
- 4/5:合格,小问题
- 3/5:需修
- 2/5:严重问题
- 1/5:不可用

## 优先级
- P0:阻断核心功能 / 严重视觉破损
- P1:影响转化 / 跨页不一致
- P2:可优化但可接受
- P3:锦上添花

| 路由 | slug | 可读性 | 一致性 | 响应式 | a11y | P0 | P1 | P2 | 总评 |
|---|---|---|---|---|---|---|---|---|---|
| / | home | TBD | TBD | TBD | TBD | - | - | - | - |
| /contact | contact | TBD | TBD | TBD | TBD | - | - | - | - |
| /brand | brand | TBD | TBD | TBD | TBD | - | - | - | - |
| /brand/certifications | brand__certifications | TBD | TBD | TBD | TBD | - | - | - | - |
| /brand/history | brand__history | TBD | TBD | TBD | TBD | - | - | - | - |
| /product | product-index | TBD | TBD | TBD | TBD | - | - | - | - |
| /product/chassis | product__chassis | TBD | TBD | TBD | TBD | - | - | - | - |
| /product/color-film | product__color-film | TBD | TBD | TBD | TBD | - | - | - | - |
| /product/electric-steps | product__electric-steps | TBD | TBD | TBD | TBD | - | - | - | - |
| /product/flooring | product__flooring | TBD | TBD | TBD | TBD | - | - | - | - |
| /product/ppf | product__ppf | TBD | TBD | TBD | TBD | - | - | - | - |
| /product/wheels | product__wheels | TBD | TBD | TBD | TBD | - | - | - | - |
| /product/window-film | product__window-film | TBD | TBD | TBD | TBD | - | - | - | - |
| /product/wenjie | product__wenjie | TBD | TBD | TBD | TBD | - | - | - | - |
| /product/xiaomi | product__xiaomi | TBD | TBD | TBD | TBD | - | - | - | - |
| /product/zeekr | product__zeekr | TBD | TBD | TBD | TBD | - | - | - | - |
| /product/window-film/{pkg-1} | product__window-film__pkg-1 | TBD | TBD | TBD | TBD | - | - | - | - |
| /product/window-film/{pkg-2} | product__window-film__pkg-2 | TBD | TBD | TBD | TBD | - | - | - | - |
| /agent | agent-index | TBD | TBD | TBD | TBD | - | - | - | - |
| /agent/{province} | agent__province | TBD | TBD | TBD | TBD | - | - | - | - |
| /agent/{province}/{city} | agent__city | TBD | TBD | TBD | TBD | - | - | - | - |
| /agent/store/{id} | agent__store | TBD | TBD | TBD | TBD | - | - | - | - |
| /news | news-index | TBD | TBD | TBD | TBD | - | - | - | - |
| /news/{slug-1} | news-detail-1 | TBD | TBD | TBD | TBD | - | - | - | - |
| /news/{slug-2} | news-detail-2 | TBD | TBD | TBD | TBD | - | - | - | - |
| /news/{slug-3} | news-detail-3 | TBD | TBD | TBD | TBD | - | - | - | - |
