---
comet_change: fix-admin-articles-csrf
role: technical-design
canonical_spec: openspec
---

# Design Doc — 修复文章管理 CSRF 适配

## 1. 问题根因

前端 `articles/page.tsx` 的 `...` 菜单操作调用错误的 API 路由，导致两个 bug 叠加：

| Bug | 原因 | 现象 |
|-----|------|------|
| CSRF 校验失败 | `PUT/DELETE /api/articles/[id]` 无 CSRF header，前端裸 `fetch` 不携带 `x-csrf-token` | 操作被后端 `requireCsrf` 拦截 |
| 缓存不刷新 | `PUT /api/articles/[id]` 无 `revalidatePath()` 调用 | DB 更新成功但页面刷新后显示旧数据 |

而 `POST /api/articles/[id]/[action]` 路由已实现：状态机校验 + CSRF + 频率限制 + `revalidateArticlePaths()`，前端没有使用。

## 2. 架构设计

### 2.1 数据流

```
用户点击操作 → adminCsrfFetch(url, init)
                  │
                  ├─ token 已缓存? ──→ 直接使用
                  │
                  ├─ token 未缓存 ──→ GET /api/admin/csrf
                  │                    └─ 返回 { token } + set-cookie: lanhui_csrf
                  │                    └─ 缓存到模块级变量
                  │
                  ├─ method !== 'GET'? ──→ headers['x-csrf-token'] = token
                  │                       └─ headers['Content-Type'] = 'application/json'
                  │                         (仅当 body 存在且非 FormData)
                  │
                  ├─ 执行 fetch
                  │
                  └─ 响应 403 + body.error 含 'CSRF'?
                       ├─ YES → forceRefresh token → 重试一次（仅一次）
                       └─ NO  → 返回响应
```

### 2.2 模块接口

```ts
// src/lib/admin-csrf-fetch.ts

export async function getAdminCsrfToken(options?: {
  forceRefresh?: boolean;
}): Promise<string>;

export async function adminCsrfFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response>;
```

## 3. 前端改造：切换到 action 路由

### 3.1 操作映射

| 前端操作 | 当前（错误） | 改为（action 路由） |
|---------|------------|-------------------|
| 置顶 | `PUT /api/articles/[id]` `{isSticky:true}` | `POST /api/articles/[id]/sticky` |
| 取消置顶 | `PUT /api/articles/[id]` `{isSticky:false}` | `POST /api/articles/[id]/unsticky` |
| 发布 | `PUT /api/articles/[id]` `{status:"published"}` | `POST /api/articles/[id]/publish` |
| 撤回 | `PUT /api/articles/[id]` `{status:"draft"}` | `POST /api/articles/[id]/withdraw` |
| 归档 | `PUT /api/articles/[id]` `{status:"archived"}` | `POST /api/articles/[id]/archive` |
| 删除 | `DELETE /api/articles/[id]` | 保持不变，补 CSRF |

### 3.2 函数改造

**`handleToggleSticky`**：`fetch(PUT)` → `adminCsrfFetch(POST /api/articles/[id]/sticky|unsticky)`

**`handleConfirmAction` single 分支**：`fetch(PUT)` → `adminCsrfFetch(POST /api/articles/[id]/[action])`，action 映射：`publish→publish`、`unpublish→withdraw`、`archive→archive`

**`handleConfirmAction` delete 分支**：`fetch(DELETE)` → `adminCsrfFetch(DELETE /api/articles/[id])`

### 3.3 不改的范围

- `fetchArticles`（GET，不需要 CSRF）
- `fetch("/api/articles/categories")`（GET）
- 编辑页 `articles/[id]/page.tsx`、`articles/new/page.tsx`（本次不改）

## 4. 后端 CSRF 补全

```
articles/[id]/route.ts:
  PUT:    auth() → requireCsrf(request) → body 解析 → DB 写入
  DELETE: auth() → requireCsrf(request) → DB 操作

articles/route.ts:
  POST:   auth() → requireCsrf(request) → body 解析 → DB 创建
```

已有 CSRF 的路由（无需改动）：
- `articles/[id]/[action]/route.ts` POST — 已有
- `articles/bulk/route.ts` POST — 已有

## 5. 测试策略

### 5.1 `admin-csrf-fetch.test.ts`

| 场景 | 验证点 |
|------|--------|
| 首次写请求 | 自动请求 `/api/admin/csrf` 获取 token |
| 写请求头 | 携带 `x-csrf-token` 和 `Content-Type: application/json` |
| GET 请求 | 不强制带 token |
| 第二次写请求 | 使用缓存 token，不再次请求 csrf |
| 403 CSRF 错误 | 检测 `body.error` 含 "CSRF" → forceRefresh → 重试一次成功 |
| 非 CSRF 403 | 不重试，直接返回 |
| 自定义 header | 不覆盖调用方传入的 headers |
| FormData body | 不设置 `Content-Type` |

### 5.2 `articles/page.test.tsx`

| 场景 | 验证点 |
|------|--------|
| 置顶/取消置顶 | 调用 `POST /api/articles/[id]/sticky` 或 `/unsticky`，携带 `x-csrf-token` |
| 发布/撤回 | 调用 `POST /api/articles/[id]/publish` 或 `/withdraw`，携带 token |
| 删除 | 调用 `DELETE /api/articles/[id]`，携带 token |
| CSRF 失败 | toast error 显示 |
| 操作成功 | 刷新文章列表 |
| 操作失败 | toast error 显示后端返回的错误信息 |

### 5.3 API route 测试补充

| 文件 | 新增用例 |
|------|---------|
| `articles/[id]/route.test.ts` | PUT/DELETE 缺 token → 403；token 不匹配 → 403；正确 token → 继续 |
| `articles/route.test.ts` | POST 缺 token → 403；不匹配 → 403；正确 → 继续 |

## 6. 防回归脚本

`scripts/check-admin-csrf-fetch.mjs` 检查规则：

1. `articles/page.tsx` 中不允许对 `/api/articles` 路径使用裸 `fetch`
2. 状态转换操作（置顶/发布/撤回/归档）必须调用 action 路由而非 PUT
3. 后端 articles 写 route 必须导入并调用 `requireCsrf`
4. 客户端代码不允许通过 `document.cookie` 读取 `lanhui_csrf`

## 7. 关键取舍

- **Action 路由的 `withdraw` 状态**: action 路由使用 `withdrawn` 状态（published↔withdrawn↔published），前端 `ArticleAction` 类型需从 `"unpublish"` 适配为 `"withdraw"`
- **Token 缓存粒度**: 模块级单例 — CSRF token 与 cookie 绑定，同页单用户足够
- **重试上限**: 仅一次 — 避免死循环
- **编辑页 PUT 兼容**: 编辑页保存仍走 `PUT /api/articles/[id]`，补 `requireCsrf` 后编辑页后续也需适配
