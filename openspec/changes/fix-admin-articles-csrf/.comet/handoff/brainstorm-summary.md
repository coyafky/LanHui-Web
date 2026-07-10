# Brainstorm Summary

- Change: fix-admin-articles-csrf
- Date: 2026-07-10

## 确认的技术方案

1. **根因**: 前端 `...` 菜单调用了错误的 API 路由 — `PUT /api/articles/[id]` 无 CSRF 且无 `revalidatePath()`，而 `POST /api/articles/[id]/[action]` 已有完整的 CSRF + revalidate + 状态机
2. **修复**: 状态转换改为调用 action 路由，删除保持 `DELETE /api/articles/[id]`，所有写请求通过 `adminCsrfFetch` 携带 CSRF token
3. **后端补全**: `articles/[id]/route.ts` PUT/DELETE 和 `articles/route.ts` POST 补 `requireCsrf`
4. **编辑页暂不改**: `articles/[id]/page.tsx` 和 `articles/new/page.tsx` 本次不改造

## 关键取舍与风险

- Action 路由使用 `withdrawn` 状态（非 `unpublish`），前端 `ArticleAction` 类型需适配
- 编辑页仍走 `PUT /api/articles/[id]`，补 `requireCsrf` 后需确保编辑页后续也适配
- Token 模块级缓存，403 自动重试一次

## 测试策略

- 单元: `admin-csrf-fetch.test.ts` — token 缓存、header、403 重试
- 组件: `articles/page.test.tsx` — action 路由调用、CSRF header、toast
- API: `articles/[id]/route.test.ts` + `articles/route.test.ts` — CSRF 校验用例

## Spec Patch

无（安全加固 + bug fix，不涉及需求规格变更）
