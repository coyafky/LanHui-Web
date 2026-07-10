下面是对应的完整修复提示词，直接交给 Claude Code / Comet 都可以：

```markdown
# 修复文章管理列表 `...` 操作菜单的 CSRF 适配问题

## 问题背景

当前后台文章管理页 `/admin/articles` 中，表格右侧 `...` 操作菜单里的操作会触发 CSRF 限制，例如：

- 撤回
- 置顶
- 取消置顶
- 发布 / 重新发布
- 归档 / 恢复
- 删除
- 批量操作

但进入具体文章编辑页后再保存编辑，目前不会遇到这个问题。

现象说明：  
`...` 菜单下的快捷操作调用了受 CSRF 保护的写 API，但前端 fetch 没有携带 `x-csrf-token` header，导致后端 `requireCsrf()` 校验失败。

## 当前已知代码位置

重点检查：

- `src/app/admin/(dashboard)/articles/page.tsx`
  - `handleArticleAction`
  - `handleBulkAction`
  - `handleDelete`
  - 当前这些 fetch 没有携带 `x-csrf-token`

- `src/app/api/admin/csrf/route.ts`
  - `GET /api/admin/csrf`
  - 返回 `{ success: true, data: { token } }`
  - 同时写入 `lanhui_csrf` HttpOnly cookie

- `src/lib/security/csrf.ts`
  - `requireCsrf(request)`
  - 校验 cookie `lanhui_csrf` 与 header `x-csrf-token` 是否一致

- `src/app/api/articles/[id]/[action]/route.ts`
  - 已经使用 `requireCsrf(request)`

- `src/app/api/articles/bulk/route.ts`
  - 已经使用 `requireCsrf(request)`

- `src/app/api/articles/[id]/route.ts`
  - 检查 PUT / DELETE 是否需要统一 CSRF 保护

## 修复目标

请让文章列表 `...` 操作菜单中的所有写操作，都能正确适配当前 CSRF 机制。

目标：

1. 不关闭后端 CSRF 校验
2. 不绕过 `requireCsrf`
3. 前端快捷操作自动获取 CSRF token
4. 调用写 API 时携带 `x-csrf-token`
5. 遇到 token 过期或 403 时，可以刷新 token 后重试一次
6. 保持编辑页现有功能不回归
7. 后台所有文章写操作尽量统一走同一个 CSRF fetch helper

## 推荐实现方案

### 1. 新增后台 CSRF fetch 工具

新增：

`src/lib/admin-csrf-fetch.ts`

这个文件必须是客户端可用工具，不要导入服务端专用模块。

建议导出：

```ts
export async function getAdminCsrfToken(options?: {
  forceRefresh?: boolean;
}): Promise<string>;

export async function adminCsrfFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response>;
```

实现要求：

- `getAdminCsrfToken()` 调用 `/api/admin/csrf`
- 读取返回的 `json.data.token`
- token 缓存在模块级变量中，避免每次点击都请求
- `adminCsrfFetch()` 自动给非 GET 请求加：

```ts
headers: {
  "Content-Type": "application/json",
  "x-csrf-token": token
}
```

- 如果请求返回 `403` 且响应 error 包含 `CSRF`，则：
  - 强制刷新 token
  - 使用新 token 重试一次
- 只重试一次，避免死循环
- 保留调用方传入的 headers
- 不覆盖 `FormData` 请求的 `Content-Type`

### 2. 修改文章管理列表操作

修改：

`src/app/admin/(dashboard)/articles/page.tsx`

将以下位置的 `fetch` 替换为 `adminCsrfFetch`：

#### `handleArticleAction`

当前：

```ts
fetch(`/api/articles/${article.id}/${action}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({}),
});
```

改为：

```ts
adminCsrfFetch(`/api/articles/${article.id}/${action}`, {
  method: "POST",
  body: JSON.stringify({}),
});
```

#### `handleBulkAction`

当前：

```ts
fetch("/api/articles/bulk", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action, ids: Array.from(selectedIds) }),
});
```

改为走 `adminCsrfFetch`。

#### `handleDelete`

当前：

```ts
fetch(`/api/articles/${id}`, { method: "DELETE" });
```

改为：

```ts
adminCsrfFetch(`/api/articles/${id}`, { method: "DELETE" });
```

要求：

- 成功后继续刷新列表
- 失败 toast 保持
- CSRF 失败时给出友好提示：
  - `登录状态或安全校验已过期，请刷新页面后重试`
- 不要把 token 打到 console 或日志里

### 3. 统一文章编辑页写请求

检查文章编辑相关文件，例如：

- `src/app/admin/(dashboard)/articles/[id]/page.tsx`
- `src/app/admin/(dashboard)/articles/new/page.tsx`
- 文章表单组件，如果有：
  - `ArticleForm`
  - `ArticleEditor`
  - `ArticleImageUploader`

如果这些页面直接调用：

- `POST /api/articles`
- `PUT /api/articles/[id]`
- `DELETE /api/articles/[id]`
- `POST /api/upload`

请确认是否需要也改为 `adminCsrfFetch`。

注意：  
如果某个后端写接口已经要求 CSRF，则前端必须使用 `adminCsrfFetch`。  
如果后端写接口暂时没有要求 CSRF，请不要为了“让编辑页继续没问题”而降低安全标准；建议统一补上后端 `requireCsrf`，并同步前端使用 `adminCsrfFetch`。

### 4. 后端 CSRF 一致性检查

检查这些 route：

- `src/app/api/articles/route.ts`
  - POST 创建文章

- `src/app/api/articles/[id]/route.ts`
  - PUT 更新文章
  - DELETE 删除文章

- `src/app/api/articles/[id]/[action]/route.ts`
  - POST 状态流转 / 置顶

- `src/app/api/articles/bulk/route.ts`
  - POST 批量操作

要求：

- 所有文章写接口都应该在鉴权通过后执行 `requireCsrf(request)`
- `GET` 不需要 CSRF
- CSRF 失败直接返回 `csrf.response`
- 不要把 CSRF 校验放在读取大量 body 或执行 DB 写入之后

推荐顺序：

```ts
const session = await auth();
if (!session?.user) return 401;
if (!hasPermission) return 403;

const csrf = requireCsrf(request);
if (!csrf.ok) return csrf.response;

// 再解析 body / 执行业务逻辑
```

### 5. 测试要求

新增或更新：

- `src/lib/admin-csrf-fetch.test.ts`
- `src/app/admin/(dashboard)/articles/page.test.tsx`
- 相关 API route test

#### `admin-csrf-fetch` 测试

覆盖：

- 首次写请求会先请求 `/api/admin/csrf`
- 写请求带上 `x-csrf-token`
- GET 请求不强制带 token
- 403 CSRF 失败时刷新 token 并重试一次
- 非 CSRF 403 不无限重试
- 不覆盖调用方自定义 header

#### 文章列表测试

覆盖：

- 点击 `...` 菜单里的置顶按钮时，请求包含 `x-csrf-token`
- 撤回 / 归档 / 删除同样走 `adminCsrfFetch`
- 批量发布 / 批量撤回 / 批量删除走 `adminCsrfFetch`
- CSRF 失败时显示 toast error
- 成功后刷新文章列表

#### API 测试

针对文章写 API 增加或确认：

- 缺少 `x-csrf-token` 返回 403
- token 不匹配返回 403
- token 正确时继续执行业务逻辑

## 防回归脚本

新增：

`scripts/check-admin-csrf-fetch.mjs`

检查：

1. `src/app/admin/(dashboard)/articles/page.tsx` 中不允许直接对文章写 API 使用裸 `fetch`
2. 以下路径的写请求必须使用 `adminCsrfFetch`：
   - `/api/articles`
   - `/api/articles/bulk`
   - `/api/articles/{id}`
   - `/api/articles/{id}/{action}`
3. 后端文章写 route 必须导入并调用 `requireCsrf`
4. 不允许在客户端代码中读取 `document.cookie` 来取 `lanhui_csrf`，因为 cookie 是 HttpOnly

在 `package.json` 增加：

```json
{
  "scripts": {
    "check:admin-csrf": "node scripts/check-admin-csrf-fetch.mjs"
  }
}
```

## 约束条件

- 不关闭 CSRF
- 不改 `requireCsrf` 的安全语义
- 不把 CSRF token 存 localStorage
- 不读取 HttpOnly cookie
- 不把 token 输出到日志
- 不引入新依赖
- TypeScript strict，禁止 `any`
- 保持现有 UI 样式基本不变
- 本次重点修复 `...` 操作菜单，不做无关重构

## 验收标准

完成后需要满足：

- [ ] `/admin/articles` 的 `...` 菜单中，置顶 / 取消置顶 / 撤回 / 删除等操作不再触发 CSRF 失败
- [ ] 批量操作不再触发 CSRF 失败
- [ ] 所有文章写请求携带 `x-csrf-token`
- [ ] token 失效时自动刷新并重试一次
- [ ] 编辑页保存文章不回归
- [ ] 后端文章写接口 CSRF 规则一致
- [ ] 新增防回归脚本
- [ ] 运行并汇报：

```bash
npx vitest run src/lib/admin-csrf-fetch.test.ts
npx vitest run src/app/api/articles/route.test.ts src/app/api/articles/[id]/route.test.ts src/app/api/articles/[id]/[action]/route.test.ts src/app/api/articles/bulk/route.test.ts
npm run lint
npm run typecheck
npm run build
npm run check:admin-csrf
```

如果 `typecheck` 命中项目已知测试历史错误，请说明不是本次修改引入，并确认业务代码无新增类型错误。

## 交付说明

最终回复请说明：

- 新增了哪个 CSRF fetch helper
- `...` 菜单里的哪些操作已改造
- 批量操作是否已改造
- 编辑页是否同步适配
- 后端哪些文章写 API 已确认有 CSRF
- 测试命令结果
```

核心修复方向是：不要放松后端 CSRF，而是把后台写请求统一走 `adminCsrfFetch`。这样 `...` 菜单、批量操作、编辑页保存都会和当前 CSRF 机制对齐。