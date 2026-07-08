# Tasks: fix-news-content-contract

## 任务清单

- [x] **任务 1: 新增 normalizeArticle() 归一化函数**
  - 在 `src/lib/data.ts` 新增类型安全的 `normalizeArticle(raw: Record<string, unknown>): NewsItem`
  - content fallback 链: `content → summary → excerpt → ""`
  - summary fallback: `excerpt → summary → content截取 → ""`
  - 所有字段均有 `typeof` 运行时守卫
  - 替换旧 `mapApiArticle`，旧函数删除

- [x] **任务 2: 更新调用方，静态数据不再经过映射**
  - `getArticles()` API 分支使用 `normalizeArticle`
  - `getArticles()` fallback 分支直接返回 `newsItems`（不再调 mapApiArticle）
  - `getArticleBySlug()` API 分支使用 `normalizeArticle`
  - `getArticleBySlug()` fallback 分支直接返回 `newsItems.find()`

- [x] **任务 3: 加强页面显示层防御**
  - `src/app/news/[slug]/page.tsx` 使用 `item.content || item.summary || ""` 作为 ArticleContent 的 content
  - 保留 `if (!item) notFound()` 不变

- [x] **任务 4: 新增/更新测试**
  - `src/lib/data.test.ts`: 覆盖 normalizeArticle 的 content/summary fallback 各场景
  - `src/app/news/[slug]/page.test.tsx`: 跳过 — normalizeArticle 15 个测试已充分覆盖数据归一化，页面层 `||` 兜底为纯表达式无需独立测试

- [x] **任务 5: 新增防回归检查脚本**
  - 新增 `scripts/check-news-content-contract.mjs`
  - 检查: `NewsItem.content` 仍是必填 string、`data.ts` 存在 normalizeArticle、`page.tsx` 不直接传可能为 undefined 的 content
  - `package.json` 添加 `check:news-content` script

- [x] **任务 6: 全量门禁**
  - `npm run build` exit 0，522 static pages，8 条 /news/[slug] 正常
  - `npm run typecheck` 仅 pre-existing errors（BigInt ES2020 + tuple casts）
  - `npm test` 999/1016 pass，全部 failure 为 pre-existing