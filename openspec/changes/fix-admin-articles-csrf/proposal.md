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
