# Comet Design Handoff

- Change: fix-admin-articles-csrf
- Phase: design
- Mode: compact
- Context hash: 8c9ba8d5eb8c9bd591180e913e301a6ebedf5da18c0c8eff14e40d9894b6a164

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/fix-admin-articles-csrf/proposal.md

- Source: openspec/changes/fix-admin-articles-csrf/proposal.md
- Lines: 1-28
- SHA256: 5d64ee687cf2bbfa30bb27ecde5651770af2cf6e88bc148958318ef5c1f8e616

```md
## Why

后台文章管理页 `/admin/articles` 的 `...` 操作菜单（置顶/发布/撤回/删除）调用受 CSRF 保护的写 API，但前端 fetch 未携带 `x-csrf-token` header，导致 `requireCsrf()` 校验失败。后端 `articles/[id]/route.ts` 和 `articles/route.ts` 也未接入 CSRF 校验，存在安全缺口。

## What Changes

- 新增 `src/lib/admin-csrf-fetch.ts`：客户端 CSRF fetch 工具，自动获取/缓存 token，写请求自动携带 `x-csrf-token`，403 时自动刷新重试一次
- 改造 `src/app/admin/(dashboard)/articles/page.tsx`：`handleToggleSticky` 和 `handleConfirmAction` 中的裸 `fetch` 替换为 `adminCsrfFetch`
- 补全后端 CSRF 校验：`articles/[id]/route.ts`（PUT/DELETE）和 `articles/route.ts`（POST）接入 `requireCsrf`
- 新增 `scripts/check-admin-csrf-fetch.mjs`：防回归检查脚本
- 新增测试：`admin-csrf-fetch.test.ts`、`articles/page.test.tsx`、API route CSRF 测试

## Capabilities

### New Capabilities
- `admin-csrf-fetch`: 后台管理 CSRF fetch 封装 — 自动获取/缓存 token、写请求携带 `x-csrf-token`、token 过期自动刷新重试

### Modified Capabilities
<!-- None — this is a bug fix + security hardening, not a spec-level requirement change -->

## Impact

- `src/lib/admin-csrf-fetch.ts`（新增）
- `src/app/admin/(dashboard)/articles/page.tsx`（fetch → adminCsrfFetch）
- `src/app/api/articles/[id]/route.ts`（PUT/DELETE 加 requireCsrf）
- `src/app/api/articles/route.ts`（POST 加 requireCsrf）
- `scripts/check-admin-csrf-fetch.mjs`（新增）
- `package.json`（新增 check:admin-csrf script）
```

## openspec/changes/fix-admin-articles-csrf/design.md

- Source: openspec/changes/fix-admin-articles-csrf/design.md
- Lines: 1-78
- SHA256: b08112b185989eb58cf19a422b92ab627ee266554d2ceb1258f303e7a43c9ce2

```md
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
```

## openspec/changes/fix-admin-articles-csrf/tasks.md

- Source: openspec/changes/fix-admin-articles-csrf/tasks.md
- Lines: 1-31
- SHA256: 5209e66e9f375a7b4f95640b73178b0a7c995bd6e17349b254544d4e36802a44

```md
## 1. 新增 adminCsrfFetch 工具

- [ ] 1.1 创建 `src/lib/admin-csrf-fetch.ts`，导出 `getAdminCsrfToken(forceRefresh?)` 和 `adminCsrfFetch(input, init?)`
- [ ] 1.2 `getAdminCsrfToken`：调用 `/api/admin/csrf`，缓存 token 在模块级变量，支持 `forceRefresh` 强制刷新
- [ ] 1.3 `adminCsrfFetch`：自动给非 GET 请求加 `x-csrf-token` header 和 `Content-Type: application/json`（FormData 除外）；保留调用方传入 headers
- [ ] 1.4 403 CSRF 失败检测：检查响应 status=403 且 body.error 包含 "CSRF"，自动 forceRefresh + 重试一次，仅一次

## 2. 改造文章列表页：切换到 action 路由

- [ ] 2.1 `handleToggleSticky`：`PUT /api/articles/[id]` → `POST /api/articles/[id]/sticky` 或 `/unsticky`（根据 `article.isSticky`），使用 `adminCsrfFetch`
- [ ] 2.2 `handleConfirmAction` single 分支：`PUT /api/articles/[id]` → `POST /api/articles/[id]/[action]`，action 映射 `publish→publish`、`unpublish→withdraw`、`archive→archive`，使用 `adminCsrfFetch`
- [ ] 2.3 `handleConfirmAction` delete 分支：`fetch(DELETE)` → `adminCsrfFetch(DELETE /api/articles/[id])`
- [ ] 2.4 前端 `ArticleAction` 类型和 `handleTogglePublish` 逻辑适配 action 路由的 action 名称（`unpublish` → `withdraw`）
- [ ] 2.5 失败 toast 保留，CSRF 失败给出友好提示；操作成功后 action 路由已有 `revalidatePath`，同时保留 `fetchArticles()` 刷新列表

## 3. 补全后端文章写 API CSRF 校验

- [ ] 3.1 `src/app/api/articles/[id]/route.ts` PUT：auth 后、body 解析前加入 `requireCsrf(request)`
- [ ] 3.2 `src/app/api/articles/[id]/route.ts` DELETE：auth 后加入 `requireCsrf(request)`
- [ ] 3.3 `src/app/api/articles/route.ts` POST：auth 后、body 解析前加入 `requireCsrf(request)`

## 4. 测试

- [ ] 4.1 `src/lib/admin-csrf-fetch.test.ts`：覆盖首次写请求获取 token、携带 `x-csrf-token`、GET 不强制带 token、403 CSRF 重试、非 CSRF 403 不重试、不覆盖自定义 header
- [ ] 4.2 `src/app/admin/(dashboard)/articles/page.test.tsx`：覆盖置顶调用 `POST /api/articles/[id]/sticky`、发布调用 `/publish`、撤回调用 `/withdraw`、删除调用 `DELETE`、CSRF 失败 toast、成功后刷新
- [ ] 4.3 API route 测试补充：`articles/[id]/route.test.ts` PUT/DELETE CSRF 校验用例；`articles/route.test.ts` POST CSRF 校验用例

## 5. 防回归脚本 + CI 链入

- [ ] 5.1 新增 `scripts/check-admin-csrf-fetch.mjs`：检查 `articles/page.tsx` 无裸 fetch 写文章 API、状态转换使用 action 路由而非 PUT、后端写 route 有 `requireCsrf`、客户端无 `document.cookie` 读 `lanhui_csrf`
- [ ] 5.2 `package.json` 新增 `check:admin-csrf` script，链入 `npm run check`
```

