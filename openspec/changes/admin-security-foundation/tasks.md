## 1. 安全基础设施模块

- [x] 1.1 新增 `src/lib/security/rate-limit.ts`：`RateLimiter` 类，基于 Map 的固定窗口限流，支持 `check(key, max, windowMs)` → `{ ok, retryAfter, limit, remaining, resetAt }`，每次 check 时清理过期记录。默认限流：管理写 API 60/min/user
- [x]1.2 新增 `src/lib/security/csrf.ts`：`generateCsrfToken()` 和 `requireCsrf(request)` 函数，双重提交令牌模式，token 使用 `crypto.randomUUID()`。Cookie: `lanhui_csrf` (httpOnly, sameSite=lax, path=/)

## 2. CSRF Token 端点

- [x]2.1 新增 `src/app/api/admin/csrf/route.ts`：`GET` 端点，已登录用户获取 CSRF token，设置 `lanhui_csrf` cookie + JSON 返回 token

## 3. API 路由接入 CSRF + 限流（叠加模式，不动现有 auth/role）

- [x]3.1 接入 `src/app/api/articles/route.ts`：POST 在现有 auth/role 检查后加入 `requireCsrf()` + `rateLimiter.check()`
- [x]3.2 接入 `src/app/api/articles/[id]/route.ts`：PUT/DELETE 加入 CSRF + 限流
- [x]3.3 接入 `src/app/api/articles/[id]/[action]/route.ts`：POST 加入 CSRF + 限流
- [x]3.4 接入 `src/app/api/articles/bulk/route.ts`：POST 加入 CSRF + 限流
- [x]3.5 接入 `src/app/api/stores/route.ts`：POST 加入 CSRF + 限流
- [x]3.6 接入 `src/app/api/stores/[id]/route.ts`：PUT/PATCH/DELETE 加入 CSRF + 限流
- [x]3.7 接入 `src/app/api/stores/[id]/[action]/route.ts`：POST 加入 CSRF + 限流
- [x]3.8 接入 `src/app/api/upload/route.ts`：POST/DELETE 加入 CSRF + 限流（上传用更严格策略：10/min + 30/day）

## 4. 测试

- [x]4.1 新增 `src/lib/security/rate-limit.test.ts`：窗口内超限、窗口过期恢复、不同 key 互不影响、retryAfter 正确计算
- [x]4.2 新增 `src/lib/security/csrf.test.ts`：缺 header 返回 403、token 不匹配返回 403、token 匹配通过
- [x]4.3 更新已有 API route 测试：为写操作补充合法 CSRF cookie + header mock，确保安全校验通过
