# /news — 资讯列表评分卡

**路由**: `/news`
**评分日期**: 2026-06-20
**截图**: [desktop](../screenshots/desktop/public-news.png) · [mobile](../screenshots/mobile/public-news.png)

---

## 评分汇总

| 维度 | 得分 | 满分 | 评语 |
|---|---|---|---|
| D1 Layout | 18 | 20 | 06-19 评 5/5/4/4 优秀 perf 97/93 |
| D2 Visual | 18 | 20 | 卡片图真实,信息密度合理 |
| D3 Color | 18 | 20 | orange 主色,与 home 一致 |
| D4 Typography | 17 | 20 | 标题/摘要/日期层级清晰 |
| D5 Accessibility | 17 | 20 | 语义 OK;所有卡片作者 = "系统管理员"(待补 authorId) |
| **总分** | **88** | **100** | **B 良好(继承 06-19 P1-9)** |

---

## 5 维度详细

### D1 Layout 布局 (18/20)
- ✅ 卡片网格 + 分类筛选 + 分页节奏好

### D2 Visual 视觉 (18/20)
- ✅ 真实封面图,信息密度合理

### D3 Color 色彩 (18/20)
- ✅ orange 主色一致

### D4 Typography 排版 (17/20)
- ✅ 标题/摘要/日期/作者 4 级层级清晰

### D5 Accessibility 可访问性 (17/20)
- ⚠️ 所有卡片作者 = "系统管理员"(继承 06-19 P1-9,NewsItem schema 缺 authorId)
- ⚠️ 详情页 8 条全 404(继承 06-19 P0-7,`item.content` missing)

---

## 改版建议

| 优先级 | 改法 | 估时 |
|---|---|---|
| **P0**(继承) | 修复 `/news/[slug]` 详情页(补 `content` 字段) | 2h |
| **P1**(继承) | NewsItem schema 增加 `authorId` 关联 User | 3h |
| **P2** | 卡片增加 hover 时图片轻放大 | 0.5h |