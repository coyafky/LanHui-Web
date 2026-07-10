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
