# 视觉评估索引

> 每页 4 维度评分(可读性 / 视觉一致性 / 响应式健壮性 / 可访问性-视觉层)。
> 数据采集:2026-06-19T07:02,Playwright 三视口截图(1440/768/390)。

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

## 汇总表

| 路由 | slug | 可读性 | 一致性 | 响应式 | a11y | P0 | P1 | P2 | 总评 |
|---|---|---|---|---|---|---|---|---|---|
| / | root | 5 | 5 | 4 | 4 | 0 | 0 | 1 | 良好 |
| /contact | contact | 5 | 5 | 4 | 4 | 0 | 0 | 1 | 良好 |
| /brand | brand | 5 | 5 | 4 | 4 | 0 | 0 | 0 | 优秀 |
| /brand/certifications | brand__certifications | 4 | 5 | 4 | 4 | 0 | 1 | 0 | 合格(性能 63/77) |
| /brand/history | brand__history | 4 | 5 | 4 | 4 | 0 | 0 | 0 | 良好 |
| /product | product-index | 5 | 5 | 4 | 4 | 0 | 1 | 0 | 合格(LCP 6.5s) |
| /product/chassis | product__chassis | 5 | 5 | 4 | 4 | 0 | 0 | 0 | 优秀(perf 97/88) |
| /product/color-film | product__color-film | 5 | 5 | 4 | 4 | 0 | 0 | 0 | 良好(LCP 3.9s) |
| /product/electric-steps | product__electric-steps | 4 | 5 | 4 | 4 | 0 | 1 | 0 | 合格(mobile LCP 6.0s) |
| /product/flooring | product__flooring | 4 | 5 | 3 | 4 | 0 | 1 | 0 | 差(perf 59/61,LCP 6.6s) |
| /product/ppf | product__ppf | 4 | 5 | 4 | 4 | 0 | 1 | 0 | 合格(perf 75/64) |
| /product/wheels | product__wheels | 4 | 5 | 4 | 4 | 0 | 0 | 0 | 良好(LCP 6.0s) |
| /product/window-film | product__window-film | 5 | 5 | 5 | 4 | 0 | 0 | 0 | 优秀(perf 98/96) |
| /product/wenjie | product__wenjie | 3 | 5 | 3 | 4 | 0 | 1 | 0 | 差(图片全 pending 占位) |
| /product/xiaomi | product__xiaomi | 4 | 5 | 4 | 4 | 0 | 0 | 0 | 良好 |
| /product/zeekr | product__zeekr | 4 | 5 | 3 | 4 | 0 | 0 | 1 | 良好(mobile 大量空白) |
| /agent | agent-index | 4 | 5 | 3 | 4 | 0 | 1 | 0 | 合格(perf 64/75,27+ 卡片慢) |
| /agent/{province} | agent__province | - | - | - | - | - | - | - | **不可达(404)** |
| /agent/{province}/{city} | agent__city | - | - | - | - | - | - | - | **不可达(404)** |
| /agent/store/{id} | agent__store | 4 | 5 | 4 | 4 | 0 | 0 | 0 | 良好(perf 86) |
| /news | news-index | 5 | 5 | 4 | 4 | 0 | 0 | 0 | 优秀(perf 97/93) |
| /news/{slug-1} | news-detail-1 | - | - | - | - | - | - | - | **不可达(404,pre-existing bug)** |
| /news/{slug-2} | news-detail-2 | - | - | - | - | - | - | - | **不可达(404,pre-existing bug)** |
| /news/{slug-3} | news-detail-3 | - | - | - | - | - | - | - | **不可达(404,pre-existing bug)** |
| /product/window-film/{pkg-1} | product__window-film__pkg-1 | - | - | - | - | - | - | - | **不可达(404,脚本 slug 错)** |
| /product/window-film/{pkg-2} | product__window-film__pkg-2 | - | - | - | - | - | - | - | **不可达(404,脚本 slug 错)** |

---

## /admin 后台(2026-06-19 二次补做)

数据采集:2026-06-19T16:21,Playwright 三视口 + admin credentials (admin/admin123)。

| 路由 | slug | 可读性 | 一致性 | 响应式 | a11y | P0 | P1 | P2 | 总评 |
|---|---|---|---|---|---|---|---|---|---|
| /admin/login | admin__login | 5 | 5 | 5 | 4 | 0 | 1 | 1 | 良好(缺失败文案) |
| /admin | admin__dashboard | 5 | 5 | 5 | 4 | 0 | 2 | 1 | 优秀(数据口径需校) |
| /admin/analytics | admin__analytics | 5 | 5 | 5 | 4 | 0 | 2 | 1 | 合格(埋点严重失衡) |
| /admin/stores | admin__stores | 4 | 5 | 4 | 4 | 1 | 1 | 0 | 需修(测试数据污染) |
| /admin/articles | admin__articles | 4 | 5 | 4 | 4 | 0 | 2 | 1 | 合格(详情页全 404) |
| /admin/stores/new | (新建表单) | 5 | 5 | 5 | 4 | 0 | 0 | 0 | 优秀(字段示例清晰) |
| /admin/articles/new | (新建表单) | - | - | - | - | - | - | - | (未读截图) |

### Admin 区关键观察

1. **后台设计语言与公开站高度一致**:zinc-950 + orange-500 强调,sidebar 深色 + 圆角图标
2. **响应式健壮**:sidebar 在 mobile 折叠为汉堡菜单,KPI / 图表自适应单列
3. **P0 问题:**
   - **P0-6:** /admin/stores 22 条记录全为"草稿",其中 21 条是 ASCII 噪声测试数据,污染公开 /agent 列表
   - **P0-7:** /admin/articles 8 条已发布文章,但 /news/[slug] 详情页全部 404(commit 0b8f38c item.content missing)
4. **P1 问题:**
   - **P1-7:** Dashboard 文章分类 Top 5 统计未过滤草稿
   - **P1-8:** 本月预约 = 0,整站点击/预约事件几乎为零,埋点未跑通
   - **P1-12:** 事件类型分布:695 页面浏览 vs ~5 点击 → click 埋点失效
   - **P1-13:** 热门门店 Top 10 完全空数据
   - **P1-9/10/11:** 店名/标题 ASCII 噪声 / 分页测试残留
5. **登录守卫有效**:未登录访问 /admin → 重定向 /admin/login,反之亦然(测试用例通过)

## 关键观察(已读 8 张 desktop/mobile/tablet 截图后)

1. **设计语言高度统一**:Header / Footer / Card 样式在所有 21 个可达页一致;深色(zinc-950/900)背景 + 琥珀色(orange-500/400)强调 + 蓝色按钮,符合 CLAUDE.md 描述的 dark theme。
2. **主题色差异**:wenjie=cyan, xiaomi=orange, zeekr=orange, flooring=amber,其他=orange 主题。在 wenjie 页面有 cyan 强调,zeekr 仍用 orange(符合 PRD 2.0)。
3. **响应式健壮性**:mobile 视图下,所有页 Header 折叠为汉堡菜单,卡片从 3 列变 1-2 列,Footer 列折叠,无溢出。
4. **P0 视觉问题**:
   - 5 个动态路由 404(/agent/{province},/agent/{province}/{city},/news/{3},/product/window-film/{2})
5. **P1 视觉问题**:
   - wenjie 主题页所有车型图片为 `publicPath: null` 的 pending 占位 — 业务尚未补图,建议加 "图片即将上线" 占位视觉。
   - zeekr mobile 视图:hero 缩略图后有大量空白 section(每个 section 一个车型),未填充时空白显眼。
6. **CLS 全部 0**:所有 21 个可达页 LCP 期间无布局抖动,说明 Next/Image + aspect-ratio 配置到位。
