# Brainstorm Summary

- Change: admin-article-ux-improvements
- Date: 2026-07-08

## 确认的技术方案

1. **ArticleForm 替代 ArticleEditor**: 新建受控组件，接管 new/edit 页共享表单 UI + 字段级错误展示。ArticleEditor 是死代码，直接删除。
2. **客户端校验复用 ArticleCreateSchema**: 新增 `validateArticleForm()` helper，内部调用 Zod safeParse，发布状态额外检查 category 不为空。
3. **use-unsaved-changes-guard**: 三层保护 — beforeunload + document click 委托拦截 `<a>` + confirmLeave 回调。
4. **PendingArticleConfirm 联合类型**: 管理 ConfirmDialog 状态，区分单篇/删除/批量操作。
5. **置顶跳过确认**: 直接执行 API 调用。

## 关键取舍与风险

- ArticleEditor 是死代码（零引用），新组件不复用其接口
- 离开保护不覆盖浏览器后退（best-effort），只覆盖 beforeunload + 站内链接 + router.push
- pages 级测试可能需要额外 mock；降级策略：单测保证 hook + validation，用 Playwright 手动验收列表页

## 测试策略

- `article.test.ts`: Zod schema 边界用例
- `use-unsaved-changes-guard.test.tsx`: 四种场景
- `articles/page.test.tsx`: 列表页 confirm 替换验证（或降级 Playwright）

## Spec Patch

无（OpenSpec delta spec 在 open 阶段已完整）
