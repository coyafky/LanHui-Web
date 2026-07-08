# Comet Design Handoff

- Change: admin-article-ux-improvements
- Phase: design
- Mode: compact
- Context hash: 27158beddefdfafcdc27232bdd6d72cb48dc82e7833f860d999b97d10051a6b7

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/admin-article-ux-improvements/proposal.md

- Source: openspec/changes/admin-article-ux-improvements/proposal.md
- Lines: 1-29
- SHA256: 8012580a1b7f3996556d0cacf98e230c0b0822a8e9b38d119e98fe406324d4e8

```md
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
```

## openspec/changes/admin-article-ux-improvements/design.md

- Source: openspec/changes/admin-article-ux-improvements/design.md
- Lines: 1-82
- SHA256: 43d7130cb1e073b20a0f25fc968b6500d2d14187f9b0004a589f1a8fc0424ceb

[TRUNCATED]

```md
## Context

当前文章后台新建/编辑页各自内联了完整的表单 UI，存在约 200 行重复代码。`ArticleEditor.tsx` 是早期抽取的共享组件但从未被引用（死代码）。表单提交前无客户端校验，直接调用 API 等服务端 Zod 校验结果。编辑页无 dirty 状态追踪，离开页面无确认提示。文章列表页的发布/撤回/归档/删除/批量操作全部使用原生 `confirm()`。

`ConfirmDialog` 组件已存在，支持 `variant="danger"` 和异步 `onConfirm`，但未被文章模块使用。

## Goals / Non-Goals

**Goals:**
- 统一新建/编辑文章表单为 `ArticleForm` 共享组件
- 提交前执行客户端 Zod 校验，字段级错误展示
- 编辑/新建页增加未保存离开保护
- 文章列表所有操作从 `confirm()` 迁移到 `ConfirmDialog`

**Non-Goals:**
- 不改文章数据库模型
- 不改 `/api/articles` 状态流转逻辑和响应格式
- 不修改 `ConfirmDialog` 组件本身
- 不修复 pre-existing 问题

## Decisions

### 1. `ArticleForm` 替代 `ArticleEditor`

`ArticleEditor.tsx` 未被任何文件引用，且缺乏字段校验、错误展示、dirty 状态能力。新建 `ArticleForm` 作为受控组件，由父页面管理所有状态和副作用。

**备选方案**: 扩展 `ArticleEditor` — 但它的接口设计（props 透传每个字段的 value/onChange）不利于集中校验，且缺少 dirty 追踪、错误展示等能力。新建更干净。

### 2. 客户端校验复用 ArticleCreateSchema

`validations/article.ts` 已有 `ArticleCreateSchema`（Zod）。客户端调用 `safeParse` 执行校验，将 `fieldErrors` 映射到表单字段。发布状态额外检查 category 不为空。

规则:
- title/content 必填
- slug 可选填写但只允许 `[a-z0-9-]`
- excerpt 最多 300 字
- 状态为 `published` 时 category 必填
- tags 自动 trim/去空/去重
- featuredImage 需匹配 `/images/articles/*.webp`

**备选方案**: 新建独立客户端 schema — 会与 API schema 漂移，维护两套规则。

### 3. 离开保护实现

`use-unsaved-changes-guard` hook 提供三层保护:
1. `beforeunload` 事件 — 覆盖浏览器刷新/关闭 tab
2. 全局 `<a>` 点击捕获 — 拦截同源链接跳转（排除 target="_blank"/download/修饰键/hash 跳转）
3. `confirmLeave(callback)` — 供 `router.push` 场景使用

通过 `window.addEventListener('beforeunload', ...)` 注册，dirty=false 时自动移除。保存中 (`saving=true`) 跳过拦截。

**备选方案**: Next.js `useRouter` 的 `beforePopState` + `routeChangeStart` — 只能拦截路由内导航，不能拦截浏览器刷新和外部链接。

### 4. confirm() → ConfirmDialog

文章列表页有 3 处 `confirm()`: 单篇操作 (`handleArticleAction`)、批量操作 (`handleBulkAction`)、删除 (`handleDelete`)。

使用 `PendingArticleConfirm` 联合类型管理确认状态：

```ts
type PendingArticleConfirm =
  | { type: "single"; article: Article; action: ArticleAction }
  | { type: "delete"; article: Article }
  | { type: "bulk"; action: "publish" | "withdraw" | "archive" | "delete"; ids: string[] }
  | null;
```

点击操作时设置 pending，`ConfirmDialog` 根据 pending 类型生成对应文案。确认后执行 API 调用，成功后清空 pending 并刷新列表。

置顶/取消置顶跳过确认，直接调用 API。

### 5. 新建/编辑页改为使用 ArticleForm

- `new/page.tsx`: 状态管理保留在页面层（title/slug/content 等），传给 `ArticleForm`；提交前调 `validateArticleForm()`；成功后 `router.push("/admin/articles")`
- `[id]/page.tsx`: 加载文章后设 initial snapshot；`ArticleForm` 变化后对比 snapshot 判定 dirty；保存成功后更新 snapshot

## Risks / Trade-offs

- **ArticleEditor 删除风险**: 需确认零引用。已验证 `grep -r "ArticleEditor" src/` 零匹配 — 安全。
- **离开保护误拦**: 站内链接捕获可能误拦某些导航。通过排除修饰键点击、target="_blank"、download、hash 跳转来最小化风险。
```

Full source: openspec/changes/admin-article-ux-improvements/design.md

## openspec/changes/admin-article-ux-improvements/tasks.md

- Source: openspec/changes/admin-article-ux-improvements/tasks.md
- Lines: 1-33
- SHA256: 5b71148d771bf4350a9925a8e126c1ffc3690d8d7fef816ee3ed6944451a5c4d

```md
## 1. 客户端校验基础

- [ ] 1.1 扩展 `src/lib/validations/article.ts`：新增 `ArticleFormSchema`（Zod）、`validateArticleForm()` helper、`ArticleFormInput` 类型
- [ ] 1.2 新增 `src/lib/validations/article.test.ts`：标题为空、内容为空、发布无分类、draft 无分类允许、slug 非法、tags trim 去重、摘要超长

## 2. 共享文章表单组件

- [ ] 2.1 新增 `src/components/admin/ArticleForm.tsx`：受控组件，mode create/edit，字段级错误展示，校验错误时聚焦第一个错误字段，服务端 details 映射
- [ ] 2.2 删除 `src/components/ArticleEditor.tsx`（零引用死代码）

## 3. 未保存离开保护

- [ ] 3.1 新增 `src/hooks/use-unsaved-changes-guard.ts`：beforeunload + 站内 `<a>` 点击拦截 + `confirmLeave()` 回调，排除 target="_blank"/修饰键/download/hash/保存中
- [ ] 3.2 新增 `src/hooks/use-unsaved-changes-guard.test.tsx`：dirty 时 beforeunload 注册、clean 不拦截、站内链接弹确认、确认后执行回调

## 4. 新建页改造

- [ ] 4.1 改造 `src/app/admin/(dashboard)/articles/new/page.tsx`：使用 ArticleForm，提交前校验，校验失败不发 API，成功后 router.push

## 5. 编辑页改造

- [ ] 5.1 改造 `src/app/admin/(dashboard)/articles/[id]/page.tsx`：使用 ArticleForm，加载后设 snapshot，dirty 追踪，保存成功后更新 snapshot，接入离开保护

## 6. 文章列表 ConfirmDialog 迁移

- [ ] 6.1 改造 `src/app/admin/(dashboard)/articles/page.tsx`：新增 PendingArticleConfirm 状态，全部 `confirm()` 替换为 ConfirmDialog，置顶跳过确认
- [ ] 6.2 新增 `src/app/admin/(dashboard)/articles/page.test.tsx`：删除不调 window.confirm、渲染 ConfirmDialog、确认后调 DELETE、批量删除 danger dialog

## 7. 构建验证

- [ ] 7.1 运行 `npm run lint`，确保零新增错误
- [ ] 7.2 运行 `npm test`，确保新增测试通过，无回归
- [ ] 7.3 运行 `npm run build`，确保构建成功
```

## openspec/changes/admin-article-ux-improvements/specs/article-client-validation/spec.md

- Source: openspec/changes/admin-article-ux-improvements/specs/article-client-validation/spec.md
- Lines: 1-67
- SHA256: db2140042a72148b706fd5de46da2530b640b4908fba7eb234ab81457be052f4

```md
# Article Client Validation

文章表单提交前执行客户端 Zod 校验，字段级错误展示。

## ADDED

### Requirement: 客户端表单校验

提交前调用 Zod `safeParse` 校验表单数据，错误在对应字段下方展示，不发送 API 请求。

#### Scenario: 标题为空

- **GIVEN** 用户在新建/编辑文章页
- **WHEN** 标题为空时点击保存
- **THEN** API 不被调用
- **AND** 标题字段下方显示 "标题不能为空"
- **AND** 标题输入框边框变红

#### Scenario: 内容为空

- **GIVEN** 用户在新建/编辑文章页
- **WHEN** 内容为空时点击保存
- **THEN** API 不被调用
- **AND** 内容字段下方显示 "内容不能为空"

#### Scenario: 发布时分类为空

- **GIVEN** 用户在新建/编辑文章页
- **WHEN** 状态选择 "发布" 但分类为空时点击保存
- **THEN** API 不被调用
- **AND** 分类字段下方显示 "发布前请选择分类"

#### Scenario: draft 分类为空允许

- **GIVEN** 用户在新建/编辑文章页
- **WHEN** 状态为 "草稿" 且分类为空时点击保存
- **THEN** 校验通过，允许提交

#### Scenario: slug 格式非法

- **GIVEN** 用户在文章编辑页
- **WHEN** slug 输入包含中文或特殊字符时点击保存
- **THEN** slug 字段下方显示 "只允许小写字母、数字、短横线"

#### Scenario: 摘要超长

- **GIVEN** 用户在文章编辑页
- **WHEN** 摘要超过 300 字时点击保存
- **THEN** 摘要字段下方显示错误提示

#### Scenario: tags 自动清理

- **GIVEN** 用户添加标签含前后空格、重复标签
- **WHEN** 提交表单
- **THEN** tags 自动 trim、去空、去重

#### Scenario: 服务端 details 映射

- **GIVEN** 客户端校验通过但服务端返回 `{ success: false, details: { fieldErrors } }`
- **WHEN** 客户端收到响应
- **THEN** 将 `details.fieldErrors` 映射到对应字段的错误展示

#### Scenario: 聚焦第一个错误字段

- **GIVEN** 表单有多个字段校验失败
- **WHEN** 校验完成
- **THEN** 自动聚焦到第一个有错误的字段
```

## openspec/changes/admin-article-ux-improvements/specs/article-confirm-dialog/spec.md

- Source: openspec/changes/admin-article-ux-improvements/specs/article-confirm-dialog/spec.md
- Lines: 1-93
- SHA256: aa9d1c9586aa3065d7743f01a54a596542b669ef0bcd3c78598e8b6cfbc6e91e

[TRUNCATED]

```md
# Article Confirm Dialog

文章管理操作确认弹窗统一使用 `ConfirmDialog` 替代浏览器原生 `confirm()`。

## ADDED

### Requirement: 单篇文章操作确认

文章行内菜单操作（除置顶外）使用 ConfirmDialog 确认。

#### Scenario: 发布确认

- **GIVEN** 文章状态为 "草稿"
- **WHEN** 用户点击 "发布"
- **THEN** 弹出 ConfirmDialog，标题 "确认发布文章？"
- **AND** variant "default"（橙色按钮）

#### Scenario: 撤回确认

- **GIVEN** 文章状态为 "已发布"
- **WHEN** 用户点击 "撤回"
- **THEN** 弹出 ConfirmDialog，标题 "确认撤回文章？"

#### Scenario: 归档确认

- **GIVEN** 文章状态为 "草稿" 或 "已撤回"
- **WHEN** 用户点击 "归档"
- **THEN** 弹出 ConfirmDialog，标题 "确认归档文章？"

#### Scenario: 恢复确认

- **GIVEN** 文章状态为 "已归档"
- **WHEN** 用户点击 "恢复草稿"
- **THEN** 弹出 ConfirmDialog，标题 "确认恢复为草稿？"

#### Scenario: 删除确认 (danger)

- **GIVEN** 用户在文章列表
- **WHEN** 用户点击 "删除"
- **THEN** 弹出 ConfirmDialog，标题 "确认删除文章？"
- **AND** description "删除后不可恢复"
- **AND** variant "danger"
- **AND** confirmLabel "删除"

#### Scenario: 置顶跳过确认

- **GIVEN** 用户在文章列表
- **WHEN** 用户点击 "置顶" 或 "取消置顶"
- **THEN** 不弹出 ConfirmDialog，直接执行操作

#### Scenario: 确认后执行操作

- **GIVEN** ConfirmDialog 已弹出
- **WHEN** 用户点击确认
- **THEN** 执行对应 API 调用
- **AND** 成功后关闭 ConfirmDialog、关闭菜单、刷新列表

#### Scenario: 取消操作

- **GIVEN** ConfirmDialog 已弹出
- **WHEN** 用户点击取消或按 Esc
- **THEN** 关闭 ConfirmDialog，不调用 API

### Requirement: 批量操作确认

选中多篇文章后批量操作使用 ConfirmDialog 确认。

#### Scenario: 批量发布确认

- **GIVEN** 用户选中 3 篇文章
- **WHEN** 用户点击 "批量发布"
- **THEN** 弹出 ConfirmDialog，标题 "确认对 3 篇文章执行发布吗？"

#### Scenario: 批量删除确认 (danger)

- **GIVEN** 用户选中 5 篇文章
- **WHEN** 用户点击 "批量删除"
- **THEN** 弹出 ConfirmDialog，标题 "确认对 5 篇文章执行删除吗？"
- **AND** description "此操作不可撤销"
- **AND** variant "danger"
```

Full source: openspec/changes/admin-article-ux-improvements/specs/article-confirm-dialog/spec.md

## openspec/changes/admin-article-ux-improvements/specs/article-unsaved-guard/spec.md

- Source: openspec/changes/admin-article-ux-improvements/specs/article-unsaved-guard/spec.md
- Lines: 1-74
- SHA256: 5ecc57d259bcadeae72a167a1ed7b24e667af8031c3f37492f03d3ae692aa7f0

```md
# Article Unsaved Changes Guard

编辑/新建文章页离开时的未保存修改保护。

## ADDED

### Requirement: 离开保护

当表单有未保存修改时，拦截离开行为并弹出确认对话框。

#### Scenario: dirty 时浏览器刷新拦截

- **GIVEN** 用户在编辑页修改了内容
- **WHEN** 用户尝试刷新页面或关闭 tab
- **THEN** 浏览器显示 beforeunload 确认提示

#### Scenario: clean 时不拦截

- **GIVEN** 用户在编辑页未做任何修改或已保存成功
- **WHEN** 用户离开页面
- **THEN** 不显示任何确认提示

#### Scenario: 站内链接点击拦截

- **GIVEN** 用户在编辑页修改了内容
- **WHEN** 用户点击页面内的返回/取消链接
- **THEN** 弹出 ConfirmDialog，标题 "有未保存的修改"
- **AND** description "离开后当前编辑内容将丢失，确定离开吗？"
- **AND** confirmLabel "离开页面"，cancelLabel "继续编辑"
- **AND** variant "danger"

#### Scenario: 确认离开后执行跳转

- **GIVEN** 用户在编辑页修改了内容后点击返回链接
- **AND** ConfirmDialog 已弹出
- **WHEN** 用户点击 "离开页面"
- **THEN** 执行目标跳转

#### Scenario: 忽略外部链接和新窗口

- **GIVEN** 用户在编辑页修改了内容
- **WHEN** 用户点击 target="_blank" 链接
- **THEN** 不弹出确认，允许打开新窗口

#### Scenario: 忽略修饰键点击

- **GIVEN** 用户在编辑页修改了内容
- **WHEN** 用户 Cmd/Ctrl+点击链接
- **THEN** 不弹出确认，允许新 tab 打开

#### Scenario: 忽略 hash 跳转

- **GIVEN** 用户在编辑页
- **WHEN** 用户点击同页面 hash 链接（如 `#section`）
- **THEN** 不弹出确认

#### Scenario: 忽略 download 链接

- **GIVEN** 用户在编辑页修改了内容
- **WHEN** 用户点击带 download 属性的链接
- **THEN** 不弹出确认

#### Scenario: 保存中不拦截

- **GIVEN** 用户在编辑页修改了内容且正在保存中
- **WHEN** 用户尝试离开页面
- **THEN** 不弹出离开确认

#### Scenario: 保存成功后清理 dirty

- **GIVEN** 用户在编辑页修改了内容
- **WHEN** 保存成功
- **THEN** dirty 状态被清除
- **AND** 离开页面不再触发确认
```

