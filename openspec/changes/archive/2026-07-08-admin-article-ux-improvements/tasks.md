## 1. 客户端校验基础

- [x] 1.1 扩展 `src/lib/validations/article.ts`：新增 `ArticleFormSchema`（Zod）、`validateArticleForm()` helper、`ArticleFormInput` 类型
- [x] 1.2 新增 `src/lib/validations/article.test.ts`：标题为空、内容为空、发布无分类、draft 无分类允许、slug 非法、tags trim 去重、摘要超长

## 2. 共享文章表单组件

- [x] 2.1 新增 `src/components/admin/ArticleForm.tsx`：受控组件，mode create/edit，字段级错误展示，校验错误时聚焦第一个错误字段，服务端 details 映射
- [x] 2.2 删除 `src/components/ArticleEditor.tsx`（零引用死代码）

## 3. 未保存离开保护

- [x] 3.1 新增 `src/hooks/use-unsaved-changes-guard.ts`：beforeunload + 站内 `<a>` 点击拦截 + `confirmLeave()` 回调，排除 target="_blank"/修饰键/download/hash/保存中
- [x] 3.2 新增 `src/hooks/use-unsaved-changes-guard.test.tsx`：dirty 时 beforeunload 注册、clean 不拦截、站内链接弹确认、确认后执行回调

## 4. 新建页改造

- [x] 4.1 改造 `src/app/admin/(dashboard)/articles/new/page.tsx`：使用 ArticleForm，提交前校验，校验失败不发 API，成功后 router.push

## 5. 编辑页改造

- [x] 5.1 改造 `src/app/admin/(dashboard)/articles/[id]/page.tsx`：使用 ArticleForm，加载后设 snapshot，dirty 追踪，保存成功后更新 snapshot，接入离开保护

## 6. 文章列表 ConfirmDialog 迁移

- [x] 6.1 改造 `src/app/admin/(dashboard)/articles/page.tsx`：新增 PendingArticleConfirm 状态，全部 `confirm()` 替换为 ConfirmDialog，置顶跳过确认
- [x] 6.2 新增 `src/app/admin/(dashboard)/articles/page.test.tsx`：删除不调 window.confirm、渲染 ConfirmDialog、确认后调 DELETE、批量删除 danger dialog

## 7. 构建验证

- [x] 7.1 运行 `npm run lint`，确保零新增错误
- [x] 7.2 运行 `npm test`，确保新增测试通过，无回归
- [x] 7.3 运行 `npm run build`，确保构建成功
