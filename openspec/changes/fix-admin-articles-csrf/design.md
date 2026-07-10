## Context

当前 CSRF 机制：`GET /api/admin/csrf` 返回 token 并写入 `lanhui_csrf` HttpOnly cookie；`requireCsrf(request)` 比对 cookie 与 `x-csrf-token` header。

**根因发现**：前端 `articles/page.tsx` 的 `...` 菜单操作调用了**错误的 API 路由**，导致两个 bug 叠加：

1. **CSRF 失败**：`handleToggleSticky` 和 `handleConfirmAction` 使用裸 `fetch` 调用 `PUT/DELETE /api/articles/[id]`，未携带 `x-csrf-token`
2. **缓存不刷新**：`PUT /api/articles/[id]` 没有调用 `revalidatePath()`，导致 DB 更新后 Next.js 缓存未失效，刷新页面显示旧数据

而 `POST /api/articles/[id]/[action]` 路由已经实现了完整的状态机校验、CSRF、频率限制和 `revalidateArticlePaths()`，前端却没有使用。

**API 路由对比**：

| 路由 | CSRF | revalidatePath | 状态机校验 | 前端当前使用 |
|------|------|---------------|-----------|-------------|
| `PUT /api/articles/[id]` | ❌ | ❌ | ❌ | ✅ (错误) |
| `DELETE /api/articles/[id]` | ❌ | ❌ | ❌ | ✅ |
| `POST /api/articles/[id]/[action]` | ✅ | ✅ | ✅ | ❌ (应该用) |
| `POST /api/articles/bulk` | ✅ | - | ✅ | 未实现 |

**Action 路由支持的操作**：`publish`、`withdraw`、`republish`、`archive`、`restore`、`sticky`、`unsticky`

## Goals / Non-Goals

**Goals:**
- 前端状态转换操作（置顶/发布/撤回/归档）改为调用 `POST /api/articles/[id]/[action]`，利用已有的 CSRF 和 revalidatePath
- 前端通过 `adminCsrfFetch` 自动携带 `x-csrf-token`
- 删除操作保持 `DELETE /api/articles/[id]`，后端补 `requireCsrf`
- 后端 `articles/[id]/route.ts` PUT/DELETE 和 `articles/route.ts` POST 补 `requireCsrf`

**Non-Goals:**
- 不修改 `requireCsrf` 安全语义或 CSRF cookie 机制
- 不改造其他 admin 页面（stores 等）
- 不修改 action 路由已有的状态机逻辑
- 不改变 UI 样式或交互流程
- 编辑页 `articles/[id]/page.tsx`、`articles/new/page.tsx` 本次不改

## Decisions

### 1. 状态转换改用 action 路由

**选择**: `handleToggleSticky` 调用 `POST /api/articles/[id]/sticky` 或 `/unsticky`；`handleConfirmAction` 调用 `POST /api/articles/[id]/[action]`（publish/withdraw/archive 等）。

**理由**: action 路由已有 CSRF + revalidatePath + 状态机校验，是设计正确的实现。前端之前绕过了它直接调 PUT 是历史遗留 bug。

**映射关系**：
| 前端操作 | 当前（错误） | 改为 |
|---------|------------|------|
| 置顶 | `PUT /api/articles/[id]` `{isSticky:true}` | `POST /api/articles/[id]/sticky` |
| 取消置顶 | `PUT /api/articles/[id]` `{isSticky:false}` | `POST /api/articles/[id]/unsticky` |
| 发布(draft→) | `PUT` `{status:"published"}` | `POST /api/articles/[id]/publish` |
| 撤回(published→) | `PUT` `{status:"draft"}` | `POST /api/articles/[id]/withdraw` |
| 归档 | `PUT` `{status:"archived"}` | `POST /api/articles/[id]/archive` |
| 删除 | `DELETE /api/articles/[id]` | 保持不变，补 CSRF |

### 2. `adminCsrfFetch` 模块级 token 缓存

**选择**: 模块级变量 `let cachedToken: string | null` + `getAdminCsrfToken({ forceRefresh })` 异步获取。

**理由**: 模块级缓存在 SPA 生命周期内有效，避免每次操作都请求 `/api/admin/csrf`。`forceRefresh` 参数用于 403 重试场景。

### 3. 后端 CSRF 放置位置

**选择**: auth 校验后、body 解析/DB 写入前执行 `requireCsrf`。

**理由**: 尽早失败，避免无效 body 解析和 DB 操作。

### 4. 不创建 delta spec

**选择**: 不创建 `specs/` 目录。

**理由**: 这是 bug fix（前端调错路由 + 后端缺 CSRF），不涉及需求规格变更。

## Risks / Trade-offs

- **Action 路由的 `withdraw` 状态**：action 路由使用 `withdrawn` 状态（中间态），前端需要适配 `ArticleAction` 类型映射
- **Token 与 cookie 不同步**: 新标签页刷新获得新 token，缓存旧 token 触发 403 → 自动刷新重试已覆盖
- **编辑页 PUT 兼容**：编辑页保存仍用 `PUT /api/articles/[id]`，需要在 PUT 补 `requireCsrf` 后确保编辑页也走 `adminCsrfFetch`
