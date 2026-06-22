# SPEC: 资讯中心 News

> 对应 PRD：`docs/PRD/public-site/NEWS_PRD.md`
> 实现状态：❌ **有问题**

---

## 1. 职责范围

品牌资讯/文章列表和详情页。DB 驱动，Admin 端发布后公开站展示。

## 2. 路由

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/news` | page (RSC, revalidate=3600) | 资讯列表（分页） | ✅ |
| `/news/[slug]` | page (RSC, revalidate=3600, generateStaticParams) | 文章详情 | ❌ 404 |

## 3. 数据模型

### NewsItem (静态类型 `src/lib/news.ts`)

```typescript
interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  authorName: string;
  publishedAt: string;
  featuredImage?: string;
  content?: string;    // ← 可选字段，但详情页强制引用
}
```

### DB 数据 (API → data.ts)

- GET /api/articles 返回 published 文章
- GET /api/articles/[id] 返回单篇
- 3 条静态 + DB 动态数据

## 4. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| ArticleContent | `src/components/ArticleContent.tsx` | 是 | react-markdown 渲染 |
| ArticleEditor | `src/components/ArticleEditor.tsx` | 是 | Admin 端编辑器 |

## 5. 已知问题

- [P0-7] `/news/[slug]` 404：`NewsItem` 类型无 `content` 字段，8 条已发布文章详情页全不可达
- [P0-7] 详情页 `page.tsx:94` 引用 `item.content` 但类型未标记为必需
- [P2] 所有文章作者="系统管理员"（无 `authorId` 字段）

---

## 6. 内容分类

5 个固定分类，用于分类筛选和文章标签展示：

| 分类 | 说明 | 分类 key |
|------|------|----------|
| 车型方案 | 具体车型的轻改方案与产品推荐 | `scheme` |
| 产品知识 | 窗膜、改色膜、电动踏板等产品科普 | `knowledge` |
| 施工与养护 | 施工流程、养护建议 | `maintenance` |
| 门店动态 | 门店活动、服务更新 | `store` |
| 品牌动态 | 公司新闻、品牌公告 | `brand` |

## 7. 待补功能清单（F3-F9）

| # | 功能 | 路由 | 优先级 | 状态 |
|---|------|------|--------|------|
| F3 | 分类筛选（URL 带分类参数 `/news?category=scheme`） | `/news` | P1 | ⚪ 待补 |
| F4 | 置顶文章（最多一篇 `isSticky`，优先显示） | `/news` | P1 | ⚪ 待补 |
| F5 | 相关文章（按同分类推荐） | `/news/[slug]` | P1 | ⚪ 待补 |
| F6 | 文章关联产品/车型/门店 | `/news/[slug]` | P2 | ⚪ 待规划 |
| F7 | 阅读计数 | `/news/[slug]` | P2 | ⚪ 待补 |
| F8 | 文章详情 TOC（超 3 个二级标题自动生成） | `/news/[slug]` | P1 | ⚪ 待补 |
| F9 | 文章底部 CTA 引导咨询 | `/news/[slug]` | P1 | ⚪ 待补 |

## 8. 页面规范

### 8.1 阅读优先排版

文章详情页采用"阅读优先"排版原则，反对厚重卡片风格：

- **背景**：`bg-zinc-950`（与全站统一）
- **正文容器**：居中窄栏（max-w-3xl），无边框无阴影
- **排版**：舒适行距（leading-relaxed 或 leading-8），适当留白
- **字体**：正文 16px+，标题层级分明
- **图片**：封面图建议 16:9，正文图片支持懒加载

### 8.2 分类筛选 UI

列表页 `/news` 的分类筛选控件规范：

- **Tab 栏**（桌面）：水平排列分类 Tab，默认选中"全部"
- **下拉选择**（移动端）：折叠式下拉，选中项高亮
- **样式**：分类标签统一 `bg-zinc-800 text-zinc-300`，hover 时 `text-orange-400`
- **URL 同步**：筛选状态反映到 URL 参数 `/news?category=scheme`
- **置顶徽章**：置顶文章显示 `bg-orange-500/20 text-orange-400` Badge

### 8.3 TOC 自动生成

文章详情 `/news/[slug]` 的目录生成规则：

- **触发条件**：正文超过 **3 个二级标题（`##`）** 时自动生成
- **桌面端**：侧边栏悬浮目录，跟随滚动高亮当前章节
- **移动端**：折叠式目录，点击展开/收起
- **锚点**：每个标题自动生成 id，支持 URL 锚点定位

### 8.4 Article JSON-LD

详情页 `<head>` 输出 Article 结构化数据：

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "文章标题",
  "description": "文章摘要",
  "image": "封面图 URL",
  "datePublished": "2026-01-01T00:00:00Z",
  "author": { "@type": "Person", "name": "作者名" },
  "publisher": { "@type": "Organization", "name": "蓝辉轻改" }
}
```

列表页输出 `CollectionPage` JSON-LD。

### 8.5 性能基线

| 指标 | 目标值 | 说明 |
|------|--------|------|
| LCP | < 2.5s | 首屏最大内容绘制 |
| CLS | 0 | 累计布局偏移 |
| FCP | < 1.5s | 首屏内容绘制 |
| TTI | < 3.0s | 可交互时间 |

---

> 最后更新: 2026-06-22

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-20 | Claude Code | 资讯中心列表+详情页实现 | 完成 | — |
| 2026-06-19 | Claude Code | 全站审计发现 P0-7（/news/[slug] 404） | 完成 | — |
| 2026-06-22 | Claude Code | Canonical PRD 合并 + SPEC 文档创建 | 完成 | — |
