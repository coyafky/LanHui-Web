已处理 1m 10s



下面是完整提示词，可以直接复制给 Claude Code：
请直接修复蓝辉轻改管理后台当前的 4 个安全与后台体验问题，不要只给方案。先阅读 AGENTS.md、README.md、docs/ARCHITECTURE.md，以及相关 API/auth/upload/admin 代码，再按下面需求实现并验证。

## 需求概述

当前系统存在以下问题：

- H2：写 API 缺少统一速率限制，尤其 `POST /api/upload` 可被恶意重复请求，消耗 CPU、sharp 转码资源与本地存储。
- H3：管理后台写 API 缺少 CSRF 保护，目前主要依赖 cookie session 认证。
- H4：Admin 侧边栏存在「系统设置」入口 `/admin/settings`，但页面不存在，点击后 404。
- H5：上传模块缺少明确的上传配额/文件数量策略，需要限制单实体图片数量、上传频率与异常临时文件残留。

本次需要补齐登录鉴权安全模块、写 API 防护、上传安全模块，以及 `/admin/settings` 系统设置页面设计。

## 当前项目上下文

技术栈：

- Next.js 16 App Router
- React 19
- TypeScript strict
- Prisma 7 + PostgreSQL adapter-pg
- NextAuth v5 beta，Credentials + JWT session
- Tailwind CSS v4
- API 响应格式统一为 `{ success, data?, error?, details? }`

重点文件：

- `src/lib/auth.ts`
- `src/types/next-auth.d.ts`
- `src/components/admin/Sidebar.tsx`
- `src/app/admin/(dashboard)/layout.tsx`
- `src/app/admin/login/page.tsx`
- `src/app/api/upload/route.ts`
- `src/components/admin/EntityImageUploader.tsx`

当前不存在但需要新增：

- `src/app/admin/(dashboard)/settings/page.tsx`

当前已发现的写 API 包括但不限于：

- `POST /api/analytics/track`
- `POST /api/articles`
- `PUT /api/articles/[id]`
- `DELETE /api/articles/[id]`
- `POST /api/articles/bulk`
- `POST /api/articles/[id]/[action]`
- `POST /api/stores`
- `PUT /api/stores/[id]`
- `PATCH /api/stores/[id]`
- `DELETE /api/stores/[id]`
- `POST /api/stores/[id]/[action]`
- `POST /api/upload`
- `DELETE /api/upload`

请重新 inventory 当前所有 `POST / PUT / PATCH / DELETE` route handlers，不要只依赖上面的列表。

## 实现目标

### 1. 新增统一速率限制模块

新增 server-only 安全工具，例如：

- `src/lib/security/rate-limit.ts`

要求：

- 不引入新依赖
- 使用内存 Map 实现当前版本
- 设计 API 时保留未来替换 Redis/外部存储的可能
- 支持按 key 限制，例如：
  - `ip`
  - `userId`
  - `ip:userId`
  - `route:userId`
- 支持窗口期、最大次数、清理过期记录
- 返回统一结构：
  - `ok: true`
  - `ok: false`
  - `retryAfter`
  - `limit`
  - `remaining`
  - `resetAt`

建议默认策略：

- 普通管理写 API：`60/min/user`
- 上传 API：`10/min/user + 30/day/user`
- 未登录请求：按 IP 限制
- `POST /api/analytics/track` 保留现有 60/min/IP 策略，可复用新模块替换旧 Map

速率限制响应：

```ts
return Response.json(
  {
    success: false,
    error: "请求过于频繁，请稍后再试",
    details: { retryAfter },
  },
  {
    status: 429,
    headers: { "Retry-After": String(retryAfter) },
  }
);
2. 为管理后台写 API 增加 CSRF 保护
新增 CSRF 工具模块，例如：
src/lib/security/csrf.ts
src/app/api/admin/csrf/route.ts
推荐实现双重提交令牌：
GET /api/admin/csrf必须已登录
生成随机 token
设置 cookie：lanhui_csrf
返回 { success: true, data: { token } }

管理后台所有写 API 必须要求请求头：x-csrf-token: <token>

服务端校验：请求必须有 session
cookie 中 token 与 header token 必须匹配
对 POST / PUT / PATCH / DELETE 生效
对公开的 POST /api/analytics/track 不强制 CSRF

Cookie 要求：
sameSite: "lax"
production 下 secure: true
path: "/"
建议 httpOnly: true，token 通过 /api/admin/csrf JSON 返回给前端缓存使用
新增统一校验函数：
export async function requireCsrf(request: NextRequest): Promise<
  | { ok: true }
  | { ok: false; response: Response }
>
CSRF 失败响应：
{
  success: false,
  error: "CSRF 校验失败，请刷新页面后重试"
}
状态码使用 403。
3. 新增后台 fetch helper，统一带 CSRF
新增客户端工具，例如：
src/lib/admin-fetch.ts
要求：
Client Component 可用
第一次写请求前自动调用 /api/admin/csrf
缓存 token
对 POST / PUT / PATCH / DELETE 自动添加 x-csrf-token
保留原有 fetch 使用体验
multipart/form-data 上传时不要手动覆盖 Content-Type
示例 API：
export async function adminFetch(input: RequestInfo | URL, init?: RequestInit) {
  // 自动为写请求附加 x-csrf-token
}
需要替换后台里的写请求，包括但不限于：
门店管理页面
门店新建/编辑页面
文章管理页面
文章新建/编辑页面
EntityImageUploader
bulk actions
store action/article action
不要修改公开站前台 fetch。
4. API 写入口接入鉴权、CSRF、限流
对所有管理后台写 API 统一接入：
auth() session 校验
role 权限校验
CSRF 校验
rate limit
原有 Zod / 业务校验
注意：
不要破坏现有 role 规则
不要把公开 analytics track 强行改为需要登录
不要在 RSC 里直接调用 prisma.*
保持现有 API response shape
建议抽取 helper，例如：
src/lib/security/api-guard.ts
用于减少重复代码：
export async function requireAdminWriteGuard(request, options)
但不要过度抽象，优先保证清晰、安全、测试可覆盖。
5. 强化上传模块
当前 src/app/api/upload/route.ts 已有：
auth
role 权限
entity 类型校验
文件大小 5MB
MIME 校验
sharp metadata 二次验证
本地 webp 转码
固定写入 public/images/<entity>/<id>.webp
需要补充：
5.1 上传速率限制
POST /api/upload：
admin/editor 登录后才可进入
按 userId + entity + entityId 限制
建议：单用户：10 次/分钟
单实体：5 次/小时
单用户：30 次/天

超限返回 429
5.2 单实体文件数量策略
当前本地存储应采用“单实体单主图”策略：
store 只能有 1 张主图
article 只能有 1 张封面图
上传新文件必须替换旧文件
不允许为同一个实体生成无限文件名
最终路径必须保持固定：store: /images/stores/<storeId>.webp
article: /images/articles/<articleId>.webp

请检查当前实现是否已经固定路径覆盖；如果是，补充注释、测试和 settings 页面说明。
5.3 临时文件清理
当前写入临时文件：
const tmpPath = `${finalPath}.${Date.now()}.tmp`;
需要确保：
sharp 转码失败不会产生最终文件
writeFile 后 rename 失败时会清理 tmp
catch/finally 中尽力删除 tmp
不删除非本模块路径文件
所有路径仍然通过 buildEntityPath 生成，禁止用户控制路径
5.4 上传配额说明
不需要立刻新增复杂 DB 表，但需要在 settings 页面展示当前策略：
最大文件：5MB
支持格式：jpg/png/webp
输出格式：webp q80
单实体：1 张主图/封面
上传限流：10/min/user、5/hour/entity、30/day/user
如果实现中选择把这些常量导出，请放在 server-safe 的配置模块中，例如：
src/lib/security/upload-policy.ts
6. 新增 /admin/settings 页面
创建：
src/app/admin/(dashboard)/settings/page.tsx
页面目标：
修复 Sidebar 链接 404
提供管理后台系统安全与上传策略说明
当前先做只读设置中心，不做可编辑保存
设计风格要和现有 admin dashboard 保持一致
页面模块建议：
系统安全
展示：
登录方式：Credentials + JWT Session
CSRF 防护：已启用 / 未启用
管理写 API：需要登录 + 角色权限 + CSRF
速率限制：已启用
Session 策略：JWT
上传策略
展示：
存储方式：本地 public/images
支持实体：store、article
拒绝实体：city
单文件大小：5MB
支持格式：jpg/png/webp
输出格式：webp q80
单实体文件数：1
上传限流策略
权限角色
展示：
admin：门店、文章、上传、系统设置
editor：文章相关、文章图片上传
未登录：禁止访问后台
系统状态
展示：
当前登录用户
当前角色
当前环境 process.env.NODE_ENV
数据库状态可不做实时探测，避免页面阻塞
视觉要求：
深色后台风格
使用卡片但不要嵌套卡片
rounded-xl border border-zinc-800 bg-zinc-900
标题、说明、状态 badge 清晰
移动端单列，桌面端 2 列
不要使用大面积渐变
不要引入新 UI 库
7. 登录鉴权模块整理
检查并整理：
src/lib/auth.ts
src/app/admin/login/page.tsx
src/app/admin/(dashboard)/layout.tsx
src/types/next-auth.d.ts
要求：
保持当前 NextAuth Credentials 登录逻辑
不改变用户登录方式
不破坏 JWT session
dashboard layout 仍然未登录重定向 /admin/login
settings 页面也受 dashboard layout 保护
新增 CSRF 不应该影响 NextAuth 自己的 signIn 流程
登录页无需加自定义 CSRF，NextAuth 自身有登录 CSRF 机制；本次重点是管理后台自定义写 API
8. 测试要求
必须新增或更新测试。
重点测试：
CSRF
新增：
src/lib/security/csrf.test.ts
或针对 API route 的 CSRF 测试
覆盖：
缺少 x-csrf-token 的管理写 API 返回 403
token 与 cookie 不匹配返回 403
token 匹配时允许继续业务逻辑
未登录仍返回 401，不要变成 403
Rate Limit
新增：
src/lib/security/rate-limit.test.ts
覆盖：
窗口内超过限制返回 blocked
reset 后恢复
不同 key 互不影响
返回 retryAfter
Upload
更新：
src/app/api/upload/route.test.ts
覆盖：
超过上传频率返回 429
缺少 CSRF 返回 403
有效 CSRF + 权限正确时可上传
同实体重复上传仍然只有固定目标路径
rename 失败时 tmp 文件会被清理
DELETE 上传图片也需要 CSRF
Settings
可增加轻量页面测试，或至少确保 build 可通过：
/admin/settings 页面存在
页面包含「系统安全」「上传策略」「权限角色」
写 API
至少抽样覆盖：
src/app/api/stores/route.test.ts
src/app/api/articles/route.test.ts
src/app/api/articles/bulk/route.test.ts
要求已有测试如果因为新增 CSRF 失败，需要按新安全要求补充合法 CSRF header/cookie mock，不要关闭安全校验。
需要修改/新增的文件
预计新增：
src/lib/security/rate-limit.ts
src/lib/security/csrf.ts
src/lib/security/api-guard.ts（可选）
src/lib/security/upload-policy.ts（可选）
src/lib/admin-fetch.ts
src/app/api/admin/csrf/route.ts
src/app/admin/(dashboard)/settings/page.tsx
src/lib/security/rate-limit.test.ts
src/lib/security/csrf.test.ts
预计修改：
src/app/api/upload/route.ts
src/components/admin/EntityImageUploader.tsx
src/app/api/stores/route.ts
src/app/api/stores/[id]/route.ts
src/app/api/stores/[id]/[action]/route.ts
src/app/api/articles/route.ts
src/app/api/articles/[id]/route.ts
src/app/api/articles/[id]/[action]/route.ts
src/app/api/articles/bulk/route.ts
后台所有直接使用管理写 API 的 Client Components
src/components/admin/Sidebar.tsx 如需要确认 /admin/settings 链接可访问
相关 API route tests
验收标准

/admin/settings 页面存在，不再 404

settings 页面包含系统安全、上传策略、权限角色、系统状态模块

管理后台写 API 缺少 CSRF token 时返回 403

管理后台正常页面操作会自动带 CSRF token，不影响用户使用

POST /api/upload 有登录、角色、CSRF、限流、文件大小、MIME、sharp 二次验证

上传同一实体不会生成无限文件，只保留固定主图/封面路径

上传临时文件在异常路径下会尽力清理

写 API 超过速率限制返回 429 和 Retry-After

未登录访问后台写 API 仍返回 401

权限不足仍返回 403

npm run lint 通过

npm run build 通过

如运行 npm run typecheck，注意项目已有测试文件中的 pre-existing errors，不要误报为本次回归
约束
不引入新依赖
TypeScript strict，禁止 any
保持 API 响应格式一致
不破坏 NextAuth 登录
不破坏 admin/editor 现有权限模型
不改变公开站前台访问逻辑
不将 CSRF 强制应用到公开 analytics track
不把上传改成 OSS；当前实现仍是本地存储
不在 RSC 中直接调用 prisma.*
不做无关 UI 重构
默认决策
如果没有额外说明，按以下规则执行：
CSRF 只保护管理后台自定义写 API，不保护公开 analytics track
上传策略为单实体单图：store 主图 1 张，article 封面 1 张
上传限流使用内存 Map，后续可替换 Redis
settings 页面先做只读策略展示，不做可编辑配置
/admin/settings 仅 admin/editor 登录后可访问，但具体敏感信息展示按角色收敛；默认 admin 看完整策略，editor 可看基础策略