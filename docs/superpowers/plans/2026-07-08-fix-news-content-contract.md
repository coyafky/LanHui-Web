---
change: fix-news-content-contract
design-doc: docs/superpowers/specs/2026-07-08-fix-news-content-contract-design.md
base-ref: bf571fa
---

# Plan: fix-news-content-contract

## 全局约束

- TypeScript strict，禁止 `any`
- 不改变 `/news/[slug]` 路由、不关闭静态生成、不删除 fallback 静态数据
- 不引入新依赖
- `ArticleContent` props 保持 `{ content: string }`

## 任务

### 任务 1: 新增 normalizeArticle() 归一化函数
- 在 `src/lib/data.ts` 新增 `normalizeArticle(raw: Record<string, unknown>): NewsItem`
- content fallback: `content → summary → excerpt → ""`
- summary fallback: `excerpt → summary → content.slice(0,120) → ""`
- 所有字段 `typeof` 守卫
- 删除旧 `mapApiArticle`

### 任务 2: 更新调用方
- `getArticles()` API 分支 → `normalizeArticle`
- `getArticles()` fallback 分支 → 直接返回 `newsItems`（不重新映射）
- `getArticleBySlug()` API 分支 → `normalizeArticle`

### 任务 3: 页面防御
- `page.tsx` 改为 `item.content || item.summary || ""`

### 任务 4: 测试
- `data.test.ts`: normalizeArticle 各 fallback 场景

### 任务 5: 防回归脚本
- `scripts/check-news-content-contract.mjs`
- `package.json` 添加 `check:news-content` script

### 任务 6: 全量门禁
- `npm run build`、`npm run typecheck`、`npm test`
