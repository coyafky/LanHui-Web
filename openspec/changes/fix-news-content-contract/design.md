# Design: NewsItem 数据归一化

## 方案

在 `src/lib/data.ts` 新增 `normalizeArticle()` 函数，作为所有文章数据的**唯一归一化入口**。

### 归一化函数

```ts
function normalizeArticle(raw: Record<string, unknown>): NewsItem {
  // content fallback 链: content → summary/excerpt → ""
  const content = (() => {
    if (typeof raw.content === "string" && raw.content.trim()) return raw.content;
    if (typeof raw.summary === "string" && raw.summary.trim()) return raw.summary;
    if (typeof raw.excerpt === "string" && raw.excerpt.trim()) return raw.excerpt;
    return "";
  })();

  // summary fallback: excerpt → content 截取 → ""
  const summary = (() => {
    if (typeof raw.excerpt === "string" && raw.excerpt.trim()) return raw.excerpt;
    if (typeof raw.summary === "string" && raw.summary.trim()) return raw.summary;
    if (content) return content.slice(0, 120);
    return "";
  })();

  return {
    slug: typeof raw.slug === "string" ? raw.slug : "",
    title: typeof raw.title === "string" ? raw.title : "未命名",
    date: typeof raw.publishedAt === "string"
      ? raw.publishedAt.slice(0, 10)
      : typeof raw.createdAt === "string"
        ? new Date(raw.createdAt).getFullYear().toString()
        : "2026",
    category: typeof raw.category === "string" ? raw.category : "品牌动态",
    summary,
    content,
  };
}
```

### 调用方调整

- `mapApiArticle()` → 委托给 `normalizeArticle()`
- `getArticles()` fallback 分支 → 不再对 `newsItems` 调 `mapApiArticle`，直接返回（newsItems 已满足 NewsItem 契约）
- `getArticleBySlug()` fallback 分支 → 同上

### 页面防御（第二层）

`/news/[slug]/page.tsx` 保留 `content ?? ""` 作为显示层兜底，但因为数据层已保证类型，正常情况下不会触发。

## 数据流

```
API /api/articles → json.data → normalizeArticle() → NewsItem → page.tsx
静态 newsItems ─────────────────────────────────────────────────→ page.tsx
                                (不再经过 mapApiArticle)
```

## 风险

- 低风险：归一化逻辑纯函数，不涉及 DB 或网络
- `raw.slug` 为空字符串时 `getArticleBySlug` 不会匹配，页面正常 404
