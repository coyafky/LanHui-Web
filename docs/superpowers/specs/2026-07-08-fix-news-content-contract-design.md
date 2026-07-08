---
comet_change: fix-news-content-contract
role: technical-design
canonical_spec: openspec
---

# 修复 NewsItem.content 类型契约 — 技术设计

## 架构

```
/api/articles/* → json.data (unknown) → normalizeArticle() → NewsItem → page.tsx
静态 newsItems ─────────────────────────────────────────────→ page.tsx
                              (不经过 normalizeArticle)
```

## 归一化函数

`normalizeArticle(raw: Record<string, unknown>): NewsItem`

| 字段 | 守卫逻辑 | fallback 链 |
|------|---------|-------------|
| `content` | `typeof string && trim()` | `summary → excerpt → ""` |
| `summary` | `typeof string && trim()` | `excerpt → content.slice(0,120) → ""` |
| `title` | `typeof string` | `"未命名"` |
| `slug` | `typeof string` | `""` |
| `category` | `typeof string` | `"品牌动态"` |
| `date` | `publishedAt.slice(0,10)` | `createdAt.getFullYear() → "2026"` |

## 调用方调整

- `getArticles()` API 分支 → `normalizeArticle`
- `getArticles()` fallback 分支 → 直接返回 `newsItems`（不再调映射函数）
- `getArticleBySlug()` API 分支 → `normalizeArticle`
- `getArticleBySlug()` fallback 分支 → 直接返回 `newsItems.find()`

## 页面防御

`/news/[slug]/page.tsx` 使用 `item.content || item.summary || ""` 作为显示层兜底。

## 测试策略

- `data.test.ts`：normalizeArticle 各字段 typeof 守卫 + content/summary fallback 场景
- `page.test.tsx`：content 缺失时不 throw、不渲染 "undefined"
- 防回归脚本：`scripts/check-news-content-contract.mjs` 检查数据契约
