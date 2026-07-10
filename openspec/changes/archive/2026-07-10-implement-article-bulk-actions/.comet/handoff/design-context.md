# Comet Design Handoff

- Change: implement-article-bulk-actions
- Phase: design
- Mode: compact
- Context hash: 0d164beb833bda845b4138743b3b620a8681ad914a57251c1c6d52e6630a9a0a

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/implement-article-bulk-actions/proposal.md

- Source: openspec/changes/implement-article-bulk-actions/proposal.md
- Lines: 1-30
- SHA256: 77a01c8d6e260219a0f18393f6a94a3d47236a7adcf9ea16c43bf026202fe7c6

```md
## Why

后端 `POST /api/articles/bulk` 已完整实现（auth + CSRF + rate limiting + 状态机校验 + 日志 + `revalidatePath`），前端 `articles/page.tsx` 也已经定义了：
- `{ type: "bulk"; action: ArticleAction; ids: string[] }` 类型
- `getConfirmDialogProps` 中 `case "bulk"` 的 ConfirmDialog 配置

但 `handleConfirmAction` 中写着 `// bulk actions handled in future enhancement`，没有真正发起 API 调用。同时页面缺少复选框和批量操作栏，用户无法选中文章并触发批量操作。

这导致一个已经写完后端、写完类型、写完对话框的产品功能没有闭环。

## What Changes

- 在文章列表表格中添加复选框列（表头全选 + 每行选中）
- 添加 `selectedIds` 状态管理（Set<string>）
- 选中文章后显示批量操作工具栏（批量发布/撤回/归档/删除）
- 在 `handleConfirmAction` 中实现 `case "bulk"`：调用 `POST /api/articles/bulk`，处理 `succeeded/skipped/failed` 响应，toast 反馈
- 扩展 `page.test.tsx` 覆盖批量操作流程

## Impact

- Affected files:
  - `src/app/admin/(dashboard)/articles/page.tsx`
  - `src/app/admin/(dashboard)/articles/page.test.tsx`
- Behavior risk:
  - 单篇操作逻辑不受影响（新增代码路径，不改现有逻辑）
  - 批量删除不可逆，ConfirmDialog 已就绪
- Verification:
  - `npx vitest run src/app/admin/(dashboard)/articles/page.test.tsx`
  - `npm run typecheck`
  - `npm run lint`
```

## openspec/changes/implement-article-bulk-actions/design.md

- Source: openspec/changes/implement-article-bulk-actions/design.md
- Lines: 1-100
- SHA256: 225a6bfd68a473a7b751ff11c105ccb6c5cf636f8db94c595f2cf715a3cae128

[TRUNCATED]

```md
---
comet_change: implement-article-bulk-actions
role: technical-design
canonical_spec: openspec
---

# Design Doc — 文章批量操作前端实现

## 1. 问题分析

后端 `POST /api/articles/bulk` 已完整实现：
- Auth + role check (admin only)
- CSRF (`requireCsrf`)
- 速率限制 (60/min)
- 状态机校验 (`canRunArticleAction` + `validateArticlePublishFields`)
- 逐个处理，返回 `{ succeeded, skipped, failed }` 分类结果
- 日志 (`logActivity`) + 缓存刷新 (`revalidateArticlePaths`)

前端差距：
- `selectedIds` 状态不存在 → 没有复选框
- `handleConfirmAction` 的 `bulk` 分支是空实现
- 没有批量操作触发 UI

## 2. UI 设计

### 2.1 复选框

表格新增首列（表头 + 每行）：
- 表头复选框：全选/取消全选当前页文章
- 行复选框：切换单篇文章选中状态
- 翻页后清空选中（避免跨页选中已不可见的文章）

### 2.2 批量操作栏

当 `selectedIds.size > 0` 时，在筛选栏下方显示工具栏：
- 显示已选数量："已选 N 篇"
- 按钮组：批量发布、批量归档、批量删除（danger 样式）
- 取消选择按钮
- 不提供"批量撤回"（业务上撤回是精细化操作，不适合批量）

没有选中时不显示工具栏，保持现有布局。

### 2.3 handleConfirmAction bulk 分支

```typescript
case "bulk": {
  const { action, ids } = pendingConfirm;
  const res = await adminCsrfFetch("/api/articles/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ids }),
  });
  const json = await res.json();
  if (json.success) {
    const { succeeded, skipped, failed } = json.data;
    if (failed.length === 0 && skipped.length === 0) {
      toast.success(`已${ACTION_LABELS[action]} ${succeeded.length} 篇文章`);
    } else {
      toast.success(
        `完成 ${succeeded.length} 篇，跳过 ${skipped.length} 篇，失败 ${failed.length} 篇`
      );
    }
    setPendingConfirm(null);
    setSelectedIds(new Set());
    fetchArticles();
  } else {
    toast.error(json.error || "批量操作失败");
  }
}
```

## 3. 状态管理

```typescript
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

function toggleSelectAll() {
  if (selectedIds.size === articles.length) {
    setSelectedIds(new Set());
  } else {
```

Full source: openspec/changes/implement-article-bulk-actions/design.md

## openspec/changes/implement-article-bulk-actions/tasks.md

- Source: openspec/changes/implement-article-bulk-actions/tasks.md
- Lines: 1-36
- SHA256: d9f1f95daeeea69db1d50ced032758b4191d0e60a922e6108d2c1ad82ff76917

```md
## 1. 复选框与选中状态

- [ ] 1.1 添加 `selectedIds` state（`useState<Set<string>>`）
- [ ] 1.2 添加表头全选复选框（`toggleSelectAll`）
- [ ] 1.3 添加每行复选框（`toggleSelectOne`）
- [ ] 1.4 分页/筛选变化时清空选中

## 2. 批量操作栏

- [ ] 2.1 添加批量操作工具栏 UI（显示已选数量 + 操作按钮组 + 取消选择）
- [ ] 2.2 批量发布按钮 → 调用 `setPendingConfirm({ type: "bulk", action: "publish", ids })`
- [ ] 2.3 批量归档按钮 → 调用 `setPendingConfirm({ type: "bulk", action: "archive", ids })`
- [ ] 2.4 批量删除按钮 → 调用 `setPendingConfirm({ type: "bulk", action: "delete", ids })`
- [ ] 2.5 取消选择按钮 → `setSelectedIds(new Set())`

## 3. 接通后端 API

- [ ] 3.1 在 `handleConfirmAction` 中实现 `case "bulk"` 分支
- [ ] 3.2 调用 `POST /api/articles/bulk` 通过 `adminCsrfFetch`
- [ ] 3.3 处理响应：succeeded/skipped/failed toast 反馈
- [ ] 3.4 成功后清空选中 + 刷新列表 + 关闭 ConfirmDialog

## 4. 测试

- [ ] 4.1 复选框全选/取消全选测试
- [ ] 4.2 单行选中/取消选中测试
- [ ] 4.3 批量操作栏显示/隐藏测试（有选中/无选中）
- [ ] 4.4 批量发布 API 调用路径测试
- [ ] 4.5 批量删除 API 调用路径测试
- [ ] 4.6 选中清空测试（分页切换后）

## 5. 验证

- [ ] 5.1 `npx vitest run src/app/admin/(dashboard)/articles/page.test.tsx`
- [ ] 5.2 `npm run typecheck`
- [ ] 5.3 `npm run lint`
```

## openspec/changes/implement-article-bulk-actions/specs/article-bulk-actions/spec.md

- Source: openspec/changes/implement-article-bulk-actions/specs/article-bulk-actions/spec.md
- Lines: 1-54
- SHA256: 772d1d5495e6d354c45bb15dafeb36f3ebf8aa4310737dad60e2bd8a65b59073

```md
## ADDED Requirements

### Requirement: Article batch selection
The admin articles page SHALL allow selecting multiple articles via checkboxes for batch operations.

#### Scenario: Select all on current page
- **WHEN** the admin clicks the header checkbox
- **THEN** all articles on the current page are selected

#### Scenario: Deselect all
- **WHEN** the admin clicks the header checkbox while all articles are selected
- **THEN** all selections are cleared

#### Scenario: Select single article
- **WHEN** the admin clicks a row checkbox
- **THEN** that article is added to the selection set

#### Scenario: Deselect single article
- **WHEN** the admin clicks a checked row checkbox
- **THEN** that article is removed from the selection set

#### Scenario: Clear selection on filter change
- **WHEN** the admin changes pagination or filter
- **THEN** the selection is cleared

### Requirement: Batch action toolbar
When articles are selected, the admin articles page SHALL show a batch action toolbar with publish, archive, and delete buttons.

#### Scenario: Toolbar visible when articles selected
- **WHEN** at least one article is selected
- **THEN** a toolbar appears showing the selected count and batch action buttons

#### Scenario: Toolbar hidden when no selection
- **WHEN** no articles are selected
- **THEN** the toolbar is not rendered

### Requirement: Batch API integration
The admin articles page SHALL call `POST /api/articles/bulk` via `adminCsrfFetch` with the selected action and article IDs.

#### Scenario: Batch publish
- **WHEN** the admin confirms batch publish
- **THEN** `POST /api/articles/bulk` is called with `{ action: "publish", ids: [...] }`

#### Scenario: Batch delete
- **WHEN** the admin confirms batch delete
- **THEN** `POST /api/articles/bulk` is called with `{ action: "delete", ids: [...] }`

#### Scenario: Batch success feedback
- **WHEN** the bulk API returns success
- **THEN** the admin sees a toast with the count of succeeded articles and the list refreshes

#### Scenario: Batch partial failure feedback
- **WHEN** the bulk API returns with some skipped or failed items
- **THEN** the admin sees a toast summarizing succeeded, skipped, and failed counts
```

