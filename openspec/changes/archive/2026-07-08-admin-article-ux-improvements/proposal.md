## Why

当前文章后台存在 3 个交互缺陷：新建/编辑页无客户端校验直接裸传 API（M12）、编辑页无未保存离开保护（M13）、文章操作使用浏览器原生 `confirm()` 与后台 `ConfirmDialog` 风格不一致（M14）。三个问题处于同一条表单状态链上，需要一起修复。

## What Changes

- 新增 `ArticleForm` 共享表单组件，统一新建/编辑文章 UI，替代死代码 `ArticleEditor`
- 扩展 `validations/article.ts` 增加客户端校验 helper，复用已有 Zod schema
- 新增 `use-unsaved-changes-guard` hook，覆盖 beforeunload + 站内链接拦截 + router.push 拦截
- 文章列表页 3 处 `confirm()` 全部替换为 `ConfirmDialog`（含批量操作 danger 风格）
- 置顶/取消置顶跳过确认，直接执行

## Capabilities

### New Capabilities
- `article-client-validation`: 文章表单客户端 Zod 校验，字段级错误展示，服务端 details 映射
- `article-unsaved-guard`: 编辑/新建页未保存离开保护（beforeunload + 站内链接 + 路由拦截）
- `article-confirm-dialog`: 文章操作确认统一使用 ConfirmDialog（单篇/批量/删除 danger）

### Modified Capabilities
<!-- 无已有 spec 需要修改 -->

## Impact

- 新增: `src/components/admin/ArticleForm.tsx`, `src/hooks/use-unsaved-changes-guard.ts`
- 修改: `src/app/admin/(dashboard)/articles/new/page.tsx`, `[id]/page.tsx`, `page.tsx`
- 扩展: `src/lib/validations/article.ts`
- 删除: `src/components/ArticleEditor.tsx`（零引用死代码）
- 新增测试: `validations/article.test.ts`, `use-unsaved-changes-guard.test.tsx`, `articles/page.test.tsx`
