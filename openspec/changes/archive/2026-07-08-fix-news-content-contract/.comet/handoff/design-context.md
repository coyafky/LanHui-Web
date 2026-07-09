# Comet Design Handoff

- Change: fix-news-content-contract
- Phase: design
- Mode: compact
- Context hash: 75bc1575d941f11defbf8d58d953c14c9ca12b545ef9427a16b0c130eab77fc8

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/fix-news-content-contract/proposal.md

- Source: openspec/changes/fix-news-content-contract/proposal.md
- Lines: 1-46
- SHA256: 2a972c6a4035fc98e3555a45289cce6e7d66c564afe887f6fe859d303cfd7fac

```md
# Proposal: 修复 NewsItem.content 类型契约

## 问题

`/news/[slug]` 详情页在静态 fallback 或 API 数据缺 `content` 时构建报错。

### 根因

`src/lib/data.ts` 的 `mapApiArticle()` 使用 `raw: any`，缺少对字段类型的运行时守卫：

```ts
// 当前 (data.ts:56-69)
function mapApiArticle(raw: any): NewsItem {
  return {
    content: raw.content ?? "",  // raw.content 可能为 object/number/undefined
    summary: raw.excerpt ?? raw.content?.slice(0, 120) ?? "",
    // ...
  };
}
```

- `raw: any` 绕过了 TypeScript 类型检查
- `raw.content` 可能是 `object`、`number`、`null` 等非 string 值
- `?? ""` 只在值为 `null`/`undefined` 时兜底，不处理类型错误
- 静态 fallback 的 `newsItems` 也被传入 `mapApiArticle`，双重映射引入噪音

### 影响范围

- `getArticleBySlug()` → `/news/[slug]` 页面渲染
- `getArticles()` → `/news` 列表页
- 构建时 `generateStaticParams` 枚举所有 slug 触发 `getArticleBySlug()`

## 修复目标

1. `NewsItem.content` 对消费方永远是 `string`
2. `mapApiArticle()` 有完整的类型守卫和 fallback 链
3. 静态 fallback 数据不再经过 API 映射函数
4. 页面不渲染 `"undefined"` 字符串
5. 测试覆盖 content 缺失回归场景

## 非目标

- 不改变 `NewsItem` 类型定义
- 不改变 `/news/[slug]` 路由或 SSG 策略
- 不修改 `ArticleContent` 组件接口
- 不做新闻模块 UI 重构
```

## openspec/changes/fix-news-content-contract/design.md

- Source: openspec/changes/fix-news-content-contract/design.md
- Lines: 1-63
- SHA256: ae79ef3b35bbdbb2ffe327d1994e83d750b2a483ed2f6476f15eefe2a9b2926a

```md
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
```

## openspec/changes/fix-news-content-contract/tasks.md

- Source: openspec/changes/fix-news-content-contract/tasks.md
- Lines: 1-34
- SHA256: 4fb9142df2ee04e8fe1ea60aae6982608f47dce319da09d08eb558ab722e1207

```md
# Tasks: fix-news-content-contract

## 任务清单

- [ ] **任务 1: 新增 normalizeArticle() 归一化函数**
  - 在 `src/lib/data.ts` 新增类型安全的 `normalizeArticle(raw: Record<string, unknown>): NewsItem`
  - content fallback 链: `content → summary → excerpt → ""`
  - summary fallback: `excerpt → summary → content截取 → ""`
  - 所有字段均有 `typeof` 运行时守卫
  - 替换旧 `mapApiArticle`，旧函数删除

- [ ] **任务 2: 更新调用方，静态数据不再经过映射**
  - `getArticles()` API 分支使用 `normalizeArticle`
  - `getArticles()` fallback 分支直接返回 `newsItems`（不再调 mapApiArticle）
  - `getArticleBySlug()` API 分支使用 `normalizeArticle`
  - `getArticleBySlug()` fallback 分支直接返回 `newsItems.find()`

- [ ] **任务 3: 加强页面显示层防御**
  - `src/app/news/[slug]/page.tsx` 使用 `item.content || item.summary || ""` 作为 ArticleContent 的 content
  - 保留 `if (!item) notFound()` 不变

- [ ] **任务 4: 新增/更新测试**
  - `src/lib/data.test.ts`: 覆盖 normalizeArticle 的 content/summary fallback 各场景
  - 新增 `src/app/news/[slug]/page.test.tsx`: 覆盖 content 缺失时不 throw、不渲染 "undefined"

- [ ] **任务 5: 新增防回归检查脚本**
  - 新增 `scripts/check-news-content-contract.mjs`
  - 检查: `NewsItem.content` 仍是必填 string、`data.ts` 存在 normalizeArticle、`page.tsx` 不直接传可能为 undefined 的 content
  - `package.json` 添加 `check:news-content` script

- [ ] **任务 6: 全量门禁**
  - 运行 `npm run build` 确认不再报 content 错误
  - 运行 `npm run typecheck` 确认业务代码无新增类型错误
  - 运行 `npm test` 确认全部测试通过
```

