# Brainstorm Summary

- Change: fix-news-content-contract
- Date: 2026-07-08

## 确认的技术方案

方案 A：数据归一化 + 页面兜底

- 新增 `normalizeArticle(raw: Record<string, unknown>): NewsItem`，所有字段 typeof 守卫
- content fallback 链：`content → summary → excerpt → ""`
- summary fallback：`excerpt → summary → content.slice(0,120) → ""`
- 删除旧 `mapApiArticle(raw: any)`
- 静态 `newsItems` 不再经过映射函数（已满足 NewsItem 契约）
- 页面层 `item.content || item.summary || ""` 作为第二层防御

## 关键取舍与风险

- 风险低：归一化逻辑纯函数，不涉及 DB 或网络
- `raw.slug` 为空字符串时 `getArticleBySlug` 不会匹配，页面正常 404
- 静态数据不再映射 → 消除不必要的双重转换噪音

## 测试策略

- `data.test.ts`：normalizeArticle 的 content/summary 缺失场景
- `page.test.tsx`：content undefined 时不 throw、不渲染 "undefined"
- 防回归脚本：`scripts/check-news-content-contract.mjs`

## Spec Patch

无（不涉及 capability 变更，不需 delta spec）
