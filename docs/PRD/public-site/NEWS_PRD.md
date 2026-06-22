# 蓝辉内容博客系统 PRD

> **路由**：`/news`、`/news/[slug]`
> **版本**：v1（合并 2026-06-20 实现版 + 2026-06-22 规划版）
> **最后更新**：2026-06-22
>
> **来源**：从 `NEWS_PRD_2026-06-20.md`（v1 实现版）与 `CONTENT_BLOG_PRD_2026-06-22.md`（v0.1 规划版）合并
> **当前实现状态**：见 `docs/SPEC/public-site/news.md`

---

## 1. 系统目标

将"品牌资讯"升级为"内容中心"——从公告栏变成帮助车主做决策的内容体系。让运营人员发布的品牌动态、门店动态、产品知识和车型方案能够在官网有效展示，并帮助车主做出产品和服务决策。

系统必须保证：
- 已发布内容在官网立即可见
- 撤回内容 404 + 从 sitemap 移除
- 每个发布状态变化有权限校验和操作日志
- 图片失败、保存失败时尽量保留用户输入

---

## 2. 用户故事

| # | 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|---|
| US-1 | 车主 | 浏览最新品牌资讯 | `/news` 列表展示已发布文章，分类筛选可用 | P0 |
| US-2 | 车主 | 阅读某篇具体文章 | `/news/[slug]` 内容完整渲染 | P0（P0-7 修复） |
| US-3 | 车主 | 想了解某车型的产品方案 | 看到车型方案分类文章 | P1 |
| US-4 | 车主 | 阅读后想咨询 | 文章底部 CTA 引导咨询 | P1 |
| US-5 | 搜索引擎 | 抓取文章内容 | Article JSON-LD + 清晰正文结构 | P0 |

---

## 3. 功能清单

| # | 功能 | 路由 | 优先级 | 状态 |
|---|---|---|---|---|
| F1 | `/news` 文章列表（分页 + 分类筛选） | `/news` | P0 | ✅ |
| F2 | `/news/[slug]` 文章详情渲染 | `/news/[slug]` | P0 | ⚪ 待补（P0-7） |
| F3 | 分类筛选（URL 带分类参数） | `/news?category=` | P1 | ⚪ 待补 |
| F4 | 置顶文章（最多一篇 `isSticky`） | `/news` | P1 | ⚪ 待补 |
| F5 | 相关文章（按同分类推荐） | `/news/[slug]` | P1 | ⚪ 待补 |
| F6 | 文章关联产品/车型/门店 | `/news/[slug]` | P2 | ⚪ 待规划 |
| F7 | 阅读计数 | `/news/[slug]` | P2 | ⚪ 待补 |
| F8 | 文章详情 TOC（超 3 个二级标题自动生成） | `/news/[slug]` | P1 | ⚪ 待补 |
| F9 | 文章底部 CTA 引导咨询 | `/news/[slug]` | P1 | ⚪ 待补 |

---

## 4. 内容分类

一期使用 5 个固定分类：

| 分类 | 说明 |
|---|---|
| 车型方案 | 具体车型的轻改方案与产品推荐 |
| 产品知识 | 窗膜、改色膜、电动踏板等产品科普 |
| 施工与养护 | 施工流程、养护建议 |
| 门店动态 | 门店活动、服务更新 |
| 品牌动态 | 公司新闻、品牌公告 |

---

## 5. 页面结构

### 5.1 内容列表 `/news`

- 分类 Tab 或下拉筛选（默认全部）
- 文章卡片网格，展示标题、摘要、分类、发布时间
- 置顶文章优先显示
- 分页支持
- URL 带分类参数 `/news?category=车型方案`
- SEO：CollectionPage JSON-LD

### 5.2 文章详情 `/news/[slug]`

- 阅读优先排版（反对厚重卡片风格）
- 标题 + 分类标签 + 发布时间
- 正文（Markdown 渲染）
- 超过 3 个二级标题时自动生成目录
- 关联内容（产品/车型/门店）
- 文章底部 CTA 引导咨询
- SEO：Article JSON-LD + BreadcrumbList

---

## 6. UI / 交互规范

### 6.1 视觉规范

- **背景**：`bg-zinc-950`
- **分类标签**：`bg-zinc-800 text-zinc-300`，hover `text-orange-400`
- **置顶徽章**：`bg-orange-500/20 text-orange-400`
- **正文排版**：阅读优先，舒适行距，适当留白，非厚重卡片
- **TOC**：侧边栏（桌面）或折叠（移动端）

### 6.2 图片策略

- 封面图建议 16:9 比例
- 无封面图时不强制，使用纯色/渐变占位
- 正文图片支持点击放大（待规划）

---

## 7. 数据模型

### 7.1 NewsItem 类型

```ts
type NewsItem = {
  id: string;
  title: string;
  slug: string;         // URL 友好，唯一
  excerpt?: string;     // 摘要
  content: string;      // Markdown 正文（P0-7: 必须存在）
  category: string;     // 'brand' | 'store' | 'product' | ...
  tags: string[];
  status: string;       // 'draft' | 'published' | 'withdrawn' | 'archived'
  isSticky: boolean;
  publishedAt: string;
  viewCount: number;
  coverImageUrl?: string;
  authorName: string;
};
```

### 7.2 数据源

- **静态数据**：`src/lib/news.ts`（当前实现，需补 content 字段）
- **DB 数据**：Article 表（CMS 发布后）
- **数据流**：API-first（`GET /api/articles`），失败 fallback 静态数据

### 7.3 SSR / ISR 配置

- `/news`：ISR `revalidate = 3600`
- `/news/[slug]`：`generateStaticParams` 枚举已发布文章，ISR `revalidate = 3600`

---

## 8. API 接口

| Method | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/articles?page&limit&status&category&search` | 公开（只返回 published） | 文章列表 |
| GET | `/api/articles/[id]` | 公开 | 文章详情 |

**统一响应**：`{ success: boolean, data?, error?, details? }`

### 8.1 埋点事件

| 事件 | 触发条件 | 必需数据 |
|---|---|---|
| `page_view` | 列表页/详情页加载 | pathname, pageType |
| `article_view` | 进入文章详情 | articleId, category |
| `product_view` | 点击关联产品 | productKey |
| `contact_click` | 点击咨询入口 | channel, sourceArea |

---

## 9. 当前实现差距

### 9.1 P0-7：`/news/[slug]` 全部 404

**根因**：`src/app/news/[slug]/page.tsx:94` 引用 `item.content`，但 `NewsItem` 类型无 `content` 字段。

**修复方案**：
1. `src/types/news.ts` 加 `content: string`（必填）
2. `src/lib/news.ts` 静态数据每条 news 加 `content` 字段
3. 验证：`/news/[slug]` 所有路由 200

### 9.2 其他差距

- 静态兜底文章只有摘要，没有完整正文
- 缺少 `withdrawn` 状态（当前只有 draft/published/archived）
- 当前详情正文被包在厚重卡片中，阅读感更像后台预览
- 没有分类筛选（当前列为 P2 待补）
- 没有相关文章逻辑
- 没有置顶文章支持
- 没有自动目录

---

## 10. SEO

- 列表页：CollectionPage JSON-LD
- 详情页：Article JSON-LD + BreadcrumbList
- 撤回文章：返回 410 Gone 或 404，从 sitemap 移除
- 独立 title/description 每篇文章

---

## 11. 验收标准

- [ ] `/news` 列表正常展示已发布文章
- [ ] `/news/[slug]` 所有路由 200 + 内容渲染正常（P0-7）
- [ ] 分类筛选可用
- [ ] 置顶文章优先显示
- [ ] 相关文章推荐正常
- [ ] 详情 TOC 自动生成
- [ ] 文章底部 CTA 可点击
- [ ] 三视口布局正确
- [ ] Lighthouse mobile perf ≥ 80
- [ ] CLS = 0
- [ ] Article + CollectionPage JSON-LD 输出正确

---

## 12. 变更记录

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-20 | v1 | 完整 8 节资讯规格，含 P0-7 修复方案 + DoD | Coya |
| 2026-06-22 | v0.1 | 内容中心重新设计，5 分类 + 阅读优先排版 | Coya / Codex |
| 2026-06-22 | v1 | 合并实现版与规划版为 canonical PRD | Coya |
