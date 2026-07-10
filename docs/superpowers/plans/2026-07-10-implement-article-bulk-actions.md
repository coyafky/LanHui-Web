---
change: implement-article-bulk-actions
design-doc: openspec/changes/implement-article-bulk-actions/design.md
created: 2026-07-10
status: complete
archived-with: 2026-07-10-implement-article-bulk-actions
---

# Plan — 文章批量操作前端实现

## Summary

后端 `POST /api/articles/bulk` 已完整实现，前端类型 `PendingArticleConfirm({ type: "bulk" })` 和 `getConfirmDialogProps` 也已就绪，仅缺 UI（复选框、工具栏）和 API 调用。

## Tasks

### 1. 复选框与选中状态

- [x] 1.1 添加 `selectedIds` state（`useState<Set<string>>`）
- [x] 1.2 添加表头全选复选框（`toggleSelectAll`）
- [x] 1.3 添加每行复选框（`toggleSelectOne`）
- [x] 1.4 分页/筛选变化时清空选中

### 2. 批量操作栏

- [x] 2.1 添加批量操作工具栏 UI（显示已选数量 + 操作按钮组 + 取消选择）
- [x] 2.2 批量发布按钮 → `setPendingConfirm({ type: "bulk", action: "publish", ids })`
- [x] 2.3 批量归档按钮 → `setPendingConfirm({ type: "bulk", action: "archive", ids })`
- [x] 2.4 批量删除按钮 → `setPendingConfirm({ type: "bulk", action: "delete", ids })`
- [x] 2.5 取消选择按钮 → `setSelectedIds(new Set())`

### 3. 接通后端 API

- [x] 3.1 在 `handleConfirmAction` 中实现 `case "bulk"` 分支
- [x] 3.2 调用 `POST /api/articles/bulk` 通过 `adminCsrfFetch`
- [x] 3.3 处理响应：succeeded/skipped/failed toast 反馈
- [x] 3.4 成功后清空选中 + 刷新列表 + 关闭 ConfirmDialog

### 4. 测试

- [x] 4.1 复选框全选/取消全选测试
- [x] 4.2 单行选中/取消选中测试
- [x] 4.3 批量操作栏显示/隐藏测试
- [x] 4.4 批量发布 API 调用路径测试
- [x] 4.5 批量删除 API 调用路径测试
- [x] 4.6 选中清空测试（分页切换后）

### 5. 验证

- [x] 5.1 `npx vitest run src/app/admin/(dashboard)/articles/page.test.tsx` — 12/12 passed
- [x] 5.2 `npm run typecheck` — no new errors
- [x] 5.3 `npm run lint` — passed

## Verification

- `npx vitest run src/app/admin/(dashboard)/articles/page.test.tsx` — 12 passed
- `npx tsc --noEmit` — no new errors in page.tsx
