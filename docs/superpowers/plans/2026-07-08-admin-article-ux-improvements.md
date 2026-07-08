---
change: admin-article-ux-improvements
design-doc: docs/superpowers/specs/2026-07-08-admin-article-ux-improvements-design.md
base-ref: 63009a6dabda1798e5bd98213cd0f7a8e62d89f3
archived-with: 2026-07-08-admin-article-ux-improvements
---

# Admin Article UX 改进 — 实施计划

## 架构

新增 `ArticleForm` 受控组件统一新建/编辑表单，替代零引用死代码 `ArticleEditor`；扩展 `validations/article.ts` 增加表单校验 schema 和 helper；新增 `use-unsaved-changes-guard` hook 覆盖 beforeunload + 站内链接拦截；文章列表页引入 `PendingArticleConfirm` 联合类型管理确认弹窗状态。

## 文件变更

| 操作 | 文件 | 职责 |
|------|------|------|
| 修改 | `src/lib/validations/article.ts` | 新增 `ArticleFormSchema` (Zod)、`ArticleFormInput` 类型、`validateArticleForm()` helper |
| 新增 | `src/lib/validations/article.test.ts` | 客户端校验所有场景测试 |
| 新增 | `src/components/admin/ArticleForm.tsx` | 受控表单组件，字段级错误展示，聚焦第一个错误字段 |
| 删除 | `src/components/ArticleEditor.tsx` | 零引用死代码 |
| 新增 | `src/hooks/use-unsaved-changes-guard.ts` | beforeunload + 站内 `<a>` 拦截 + `confirmLeave()` |
| 新增 | `src/hooks/use-unsaved-changes-guard.test.tsx` | 离开保护 hook 单元测试 |
| 修改 | `src/app/admin/(dashboard)/articles/new/page.tsx` | 使用 ArticleForm，提交前校验 |
| 修改 | `src/app/admin/(dashboard)/articles/[id]/page.tsx` | 使用 ArticleForm + dirty 追踪 + 离开保护 |
| 修改 | `src/app/admin/(dashboard)/articles/page.tsx` | confirm() 替换为 ConfirmDialog |

## 任务

### 任务 1: 扩展客户端校验层

**文件:** `src/lib/validations/article.ts`

新增 `ArticleFormSchema`（Zod schema，含 superRefine 条件校验——published 时 category 必填）、`ArticleFormInput` 类型、`validateArticleForm()` helper（返回 `{ valid, fieldErrors }`）。

校验规则：
- title/content 必填
- slug 可选，只允许 `[a-z0-9-]`
- excerpt 最多 300 字
- featuredImage 匹配 `/images/articles/*.webp`
- tags 自动 trim/去空/去重
- status="published" 且 category 为空时报错

### 任务 2: 客户端校验测试

**文件:** `src/lib/validations/article.test.ts`

覆盖：标题为空、内容为空、published 无分类、draft 无分类允许、slug 非法、slug 中文/大写拒绝、摘要超长/边界、tags trim/去重/去空、featuredImage 校验、validateArticleForm 返回结构。

### 任务 3: 创建 ArticleForm 共享表单组件

**文件:** `src/components/admin/ArticleForm.tsx`

受控组件，接口 `ArticleFormProps`：
- `mode: "create" | "edit"`（create 时隐藏 archived 状态选项）
- 字段级 onChange props + fieldErrors 展示
- 错误字段 `border-red-500` 红色边框
- 校验失败自动聚焦第一个错误字段（FIELD_ORDER 数组驱动）
- 标签输入支持回车添加和删除
- 内容编辑/预览双栏布局（引用 ArticleContent）
- autoSlug 自动从标题生成 slug

### 任务 4: 删除 ArticleEditor 死代码

**文件:** `src/components/ArticleEditor.tsx` — 删除

确认零引用后 `git rm`。

### 任务 5: 创建 use-unsaved-changes-guard hook

**文件:** `src/hooks/use-unsaved-changes-guard.ts`

接口返回 `{ confirmLeave, confirmDialogProps }`。

三层保护：
1. `beforeunload` — dirty 时注册，clean/saving 时自动移除
2. document click 捕获 — 拦截同源 `<a>` 点击，排除 target="_blank"/修饰键/download/hash/外部链接
3. `confirmLeave(callback)` — 供程序化导航使用

弹窗文案：title="有未保存的修改"，description="离开后当前编辑内容将丢失，确定离开吗？"，confirmLabel="离开页面"，cancelLabel="继续编辑"，variant="danger"

### 任务 6: use-unsaved-changes-guard 测试

**文件:** `src/hooks/use-unsaved-changes-guard.test.tsx`

覆盖：dirty 时 beforeunload 注册、clean 不注册、dirty→clean 移除监听、saving 时不注册、confirmLeave 弹窗状态、确认后执行回调、取消后清空 pending。

### 任务 7: 改造新建文章页

**文件:** `src/app/admin/(dashboard)/articles/new/page.tsx`

- 使用 `ArticleForm` 替代内联表单 UI
- 提交前调用 `validateArticleForm()`，校验失败不发送 API
- dirty 判定：所有字段与初始值对比
- 离开保护接入：取消按钮、返回箭头均走 `confirmLeave`
- 成功跳转 `/admin/articles`，失败 toast.error + 映射服务端 details

### 任务 8: 改造编辑文章页

**文件:** `src/app/admin/(dashboard)/articles/[id]/page.tsx`

- 使用 `ArticleForm` 替代内联表单 UI
- 加载文章后保存 snapshot，字段变更对比判定 dirty
- 保存成功后更新 snapshot（清除 dirty）
- 离开保护接入：取消按钮、返回箭头均走 `confirmLeave`
- 成功跳转 `/admin/articles`

### 任务 9: 文章列表 ConfirmDialog 迁移

**文件:** `src/app/admin/(dashboard)/articles/page.tsx`

- 新增 `PendingArticleConfirm` 联合类型：`single | delete | bulk | null`
- 置顶/取消置顶跳过确认直接执行
- 删除操作 variant="danger"，description="删除后不可恢复"
- 批量删除 variant="danger"，description="此操作不可撤销"
- 批量操作显示文章数量
- 错误使用 toast.error 而非 alert
- 确认后零 `confirm(`/`window.confirm` 残留

### 任务 10: 文章列表 ConfirmDialog 测试

**文件:** `src/app/admin/(dashboard)/articles/page.test.tsx`

在现有测试基础上追加：删除不调 window.confirm、渲染 ConfirmDialog、确认后调 DELETE API、取消关闭弹窗、批量删除 danger dialog。

### 任务 11: 构建验证

- `npm run lint` — 零新增错误
- `npm test` — 新增测试 PASS，无回归
- `npm run build` — 构建成功
- 验证 `grep -rn "confirm(" src/app/admin/(dashboard)/articles/page.tsx` 零匹配
