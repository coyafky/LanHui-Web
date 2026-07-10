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
