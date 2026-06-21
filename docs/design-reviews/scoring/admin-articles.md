# /admin/articles — 文章管理评分卡

**路由**: `/admin/articles`
**评分日期**: 2026-06-20
**截图**: [desktop](../screenshots/desktop/admin-articles.png) · [mobile](../screenshots/mobile/admin-articles.png)

---

## 评分汇总

| 维度 | 得分 | 满分 | 评语 |
|---|---|---|---|
| D1 Layout | 17 | 20 | sidebar + 表格 + 操作列,布局稳定 |
| D2 Visual | 16 | 20 | 表格整齐,但**8 条详情全 404(P0-7)** |
| D3 Color | 18 | 20 | 草稿/已发布状态色清晰 |
| D4 Typography | 17 | 20 | 表格密度合理 |
| D5 Accessibility | 16 | 20 | 缺筛选/分页 |
| **总分** | **84** | **100** | **B 良好(继承 P0-7)** |

---

## 5 维度详细

### D1 Layout 布局 (17/20)
- ✅ sidebar + 表格 + 操作列,布局稳定

### D2 Visual 视觉 (16/20)
- ⚠️ 8 条文章标题正常,但**点击进入详情页全 404**(继承 06-19 P0-7,`item.content` missing)
- ⚠️ 表格密度高,mobile 横向滚动多

### D3 Color 色彩 (18/20)
- ✅ 草稿橙 / 已发布绿状态色对比清晰

### D4 Typography 排版 (17/20)
- ✅ 表格密度合理

### D5 Accessibility 可访问性 (16/20)
- ⚠️ 缺筛选 UI(分类/状态)
- ⚠️ 缺分页(数据量小时可接受)
- ⚠️ 批量操作缺

---

## 改版建议

| 优先级 | 改法 | 估时 |
|---|---|---|
| **P0**(继承 06-19) | 修复 `/news/[slug]` 详情页(`item.content` missing) | 2h |
| **P1** | 增加状态/分类筛选 | 2h |
| **P1** | 增加批量发布/下线操作 | 3h |
| **P2** | mobile 表格横向滚动优化(sticky 首列) | 1h |
| **P2** | 增加每行 hover 高亮(更明显反馈) | 0.5h |