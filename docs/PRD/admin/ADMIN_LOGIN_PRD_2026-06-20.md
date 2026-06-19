# ADMIN_LOGIN_PRD_2026-06-20.md

> **页面**: `/admin/login`
> **类型**: 后台 CMS 入口(公开访问,无 auth 守卫)
> **优先级**: P0(后台可用性 0 号任务)
> **Owner**: 冯科雅 (Coya)
> **版本**: v1
> **最后更新**: 2026-06-20

---

## 1. 概述

### 1.1 目标

`/admin/login` 是蓝辉轻改 LANHUI 后台 CMS 唯一公开入口,提供基于 NextAuth v5 (Credentials Provider) + JWT Session 的管理员身份验证。目标:让 admin / editor 在 10 秒内完成登录并跳转至 `/admin`,并在登录失败时给出**明确、可读、可操作**的反馈;同时具备基础的防爆破能力(限流 + 失败计数)。

### 1.2 权限

- **可见角色**: 公开(无需登录)
- **写权限**: N/A(本页面无业务写操作)
- **可访问的角色**: 任何人,但**仅** `status: "active"` 的 User 凭据可通过 `authorize()`

### 1.3 范围

- ✅ 包含:
  - 用户名 / 邮箱 + 密码登录表单
  - NextAuth `signIn("credentials")` 调用
  - 登录失败 / 成功 UX(错误回显 / loading / 跳转)
  - 失败限流(每 IP 5 次/分钟 → 锁定 60s)
  - 登录后跳转 `/admin`(若 query 带 `?callbackUrl`,跳 callback)
  - 已登录用户访问 `/admin/login` 自动跳转 `/admin`
- ❌ 不包含:
  - 「忘记密码」流程(P2-3,生产前改 seed 密码即可,不补前端入口)
  - 「注册」流程(账号由 `scripts/create-admin.ts` 或 `prisma db seed` 创建)
  - 第三方登录(OAuth / SSO)
  - 邮箱 / 手机 OTP 登录

---

## 2. 用户故事

| # | 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|---|
| US-1 | admin | 每天第一次登录 | 输入凭据 → 1s 内跳转 `/admin` 看板 | P0 |
| US-2 | editor | 协助发布文章 | 登录后默认进入 `/admin/articles` | P0 |
| US-3 | admin | 输错密码 | 看到「用户名或密码错误」红字提示,可立即重试 | P0 |
| US-4 | admin | 5 次输错密码 | 第 6 次提交被限流,提示「请求过于频繁,请稍后再试」 | P0 |
| US-5 | 访客 | 浏览器粘贴 `/admin/login?callbackUrl=/admin/articles/new` | 登录成功后跳 `/admin/articles/new` 而非默认 `/admin` | P1 |
| US-6 | 已登录 admin | 直接访问 `/admin/login` | 自动重定向到 `/admin`,不重复登录 | P1 |
| US-7 | admin | 浏览器记住密码 / 自动填充 | `<input autocomplete>` 正常工作,无干扰 | P2 |

---

## 3. 功能清单

| # | 功能 | 优先级 | 状态 | 实现位置 |
|---|---|---|---|---|
| F1 | 登录表单(用户名 / 密码) | P0 | ✅ 已实现 | `src/app/admin/login/page.tsx` |
| F2 | `signIn("credentials")` 调用 | P0 | ✅ | 同上 (`signIn` from `next-auth/react`) |
| F3 | 登录成功跳转 `/admin` | P0 | ✅ | `router.push("/admin")` + `router.refresh()` |
| F4 | 登录失败 inline 错误回显 | P0 | ✅ | 已有红框 `{error && ...}`,文案「用户名或密码错误」 |
| F5 | Loading 状态(按钮 disabled + 文字「登录中...」) | P0 | ✅ | `isLoading` state + `disabled` prop |
| F6 | 失败限流(5/min/IP) | P0 | ⚪ 待补 | 新增 `src/lib/login-rate-limit.ts`(内存 LRU) |
| F7 | `?callbackUrl` 跳转 | P1 | ⚪ 待补 | 解析 query,仅允许 `/admin/*` 前缀 |
| F8 | 已登录访问 → 重定向 `/admin` | P1 | ⚪ 待补 | layout/页面级 `auth()` 守卫 |
| F9 | `<title>` 与 meta 描述 | P1 | ⚪ 待补 | `export const metadata = ...` |
| F10 | 键盘可访问(Tab 顺序 / Enter 提交) | P1 | ✅ | 原生 `<form>` + `<input>` 默认行为 |
| F11 | 移动端 100% 适配 | P0 | ✅ | `px-4 + max-w-md` 三视口验证通过 |

---

## 4. UI / 交互

### 4.1 视觉规范

- **背景**: `bg-zinc-950`(全暗色)
- **卡片**: `bg-zinc-900` + `border-zinc-800` + `rounded-2xl` + `shadow-2xl`
- **Logo**: `Logo` 组件(`h-12 w-auto`,居中,品牌识别)
- **标题**: `text-xl font-semibold text-zinc-100` —— 「蓝辉轻改 后台管理」
- **输入框**: `bg-zinc-800` + `border-zinc-700`,focus → `border-orange-500`
- **CTA**: `bg-orange-500` + `hover:bg-orange-600`,文字「登 录」(中间加空格,视觉留白)
- **错误条**: `bg-red-500/10` + `text-red-400` + `rounded-lg`,role="alert"
- **Footer**: `text-xs text-zinc-500`,「蓝辉轻改 LANHUI © 2026」

### 4.2 组件清单

| 组件 | 路径 | 类型 | 说明 |
|---|---|---|---|
| `AdminLoginPage` | `src/app/admin/login/page.tsx` | Client | 当前实现,121 行 |
| `Logo` | `src/components/Logo.tsx` | RSC | 品牌 logo |
| `brand` | `src/lib/brand.ts` | const | 静态品牌文案 |

### 4.3 状态机

```
[未填写] --submit--> [submitting] --success--> [redirect /admin]
                            |
                            |--failure(凭据错)--> [idle + error="用户名或密码错误"]
                            |
                            |--failure(限流)--> [locked + error="请求过于频繁,请稍后再试(60s)"]
```

### 4.4 三视口响应式

| 视口 | 行为 |
|---|---|
| Desktop 1440 | 卡片宽 480px,垂直水平居中,周围留白充足 |
| Tablet 768 | 卡片宽 ~400px,自适应 |
| Mobile 390 | 卡片占满视口宽 - 32px padding,所有控件触摸目标 ≥ 44px |

### 4.5 可访问性

- ✅ 语义化 HTML(`<form>` / `<label htmlFor>` / `<button type="submit">`)
- ✅ `<input>` 带 `id` + `name`(浏览器自动填充可识别)
- ✅ `autoComplete="username"` / `autoComplete="current-password"`(符合 WHATWG 规范)
- ✅ 错误条 `role="alert"`(屏幕阅读器自动播报)
- ✅ 颜色对比度 ≥ 4.5:1(zinc-100 on zinc-900 ≈ 17:1)
- ⚠️ 待补:focus ring 增强(当前 focus 边框变化已可见,但建议加 `focus-visible:ring-2`)

---

## 5. 数据模型

### 5.1 主表

```
DB: User           # 账号唯一表
schema: prisma/schema.prisma
```

```
User {
  id           String   @id @default(cuid())
  username     String   @unique
  email        String   @unique
  password     String   // bcrypt hash (cost=10)
  name         String?
  role         String   // 'admin' | 'editor'
  status       String   // 'active' | 'inactive' (default 'active')
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### 5.2 NextAuth 配置

**文件**: `src/lib/auth.ts`

```ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: credentials.username as string },
              { email: credentials.username as string },
            ],
            status: "active",
          },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: { jwt, session },
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
});
```

### 5.3 登录限流

**文件**: `src/lib/login-rate-limit.ts` (新建)

```ts
// 内存 LRU + 滑动窗口
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const LIMIT = 5;          // 5 次
const WINDOW = 60_000;    // 1 分钟
const LOCKOUT = 60_000;   // 锁定 60s

export function checkLoginRate(ip: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW });
    return { ok: true };
  }
  if (b.count >= LIMIT) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count++;
  return { ok: true };
}
```

### 5.4 ActivityLog 记录

登录成功 → **可选**记录 `ActivityLog { action: "login", entity: "User", entityId: session.user.id, metadata: { ip, userAgent } }` 用于审计。

登录失败 → **不**记录 ActivityLog(避免被滥用刷库)。

---

## 6. API 接口

| Method | 路径 | 权限 | 说明 |
|---|---|---|---|
| POST | `/api/auth/signin/credentials` | 公开 | NextAuth Credentials Provider 自动处理 |
| POST | `/api/auth/csrf` | 公开 | NextAuth CSRF token(自动) |
| POST | `/api/auth/signout` | 已登录 | 登出 |
| GET  | `/api/auth/session` | 公开 | 返回当前 session(供 client 轮询) |

**统一响应**: NextAuth 自有格式,**不**遵循项目 `{ success, data?, error? }` 契约(因为 NextAuth handler 内部链路固定)。

**写操作必做**(本页面无显式 API 写操作):

1. `auth()` 校验(由 NextAuth 自动处理)
2. Zod 输入校验(由 NextAuth Credentials provider 处理)
3. Prisma 事务 + ActivityLog(成功时记录 login)
4. `revalidatePath('/admin')`(成功跳转后由 client 触发)

### 6.1 错误码契约

| HTTP Code | 场景 | 前端处理 |
|---|---|---|
| 200 | 登录成功 | `router.push("/admin")` + `router.refresh()` |
| 401 | Credentials 错 | `setError("用户名或密码错误")`(不区分用户名/密码错,防枚举) |
| 429 | 限流 | `setError(\`请求过于频繁,请 ${retryAfter}s 后再试\`)` |
| 500 | 数据库 / bcrypt 异常 | `setError("登录失败,请稍后重试")` |

---

## 7. 验收标准 (DoD)

### 7.1 功能

- [ ] 输入合法凭据 → 1.5s 内跳转 `/admin`
- [ ] 输入错误密码 → 页面停留,红条提示「用户名或密码错误」
- [ ] 输入空用户名 → 浏览器原生 `required` 校验阻止提交
- [ ] 输入空密码 → 浏览器原生 `required` 校验阻止提交
- [ ] 提交期间按钮 disabled + 文字「登录中...」,防止重复提交
- [ ] 登录成功后 `router.refresh()` 触发 layout 重新读 session
- [ ] 退出后访问 `/admin` → 重定向 `/admin/login?callbackUrl=/admin`

### 7.2 权限

- [ ] 未登录访问 `/admin` → 重定向 `/admin/login?callbackUrl=%2Fadmin`
- [ ] `status: "inactive"` 的账号 → 拒绝登录(等同密码错,不透露状态)
- [ ] 登录失败限流:同一 IP 第 6 次失败 → 返回 429 + 错误文案
- [ ] `?callbackUrl` 跳转:**仅**接受以 `/admin/` 开头的路径,拒绝外站 URL(open redirect 防护)
- [ ] 已登录访问 `/admin/login` → 重定向 `/admin`

### 7.3 质量门

- [ ] `npx tsc --noEmit` 通过(允许 9 个 pre-existing 错)
- [ ] `npm run build` 通过
- [ ] `npm run lint` 无新增 error
- [ ] Playwright e2e `login flow with good creds redirects to /admin` 通过
- [ ] Playwright e2e `login flow with bad creds stays on /admin/login + shows error` 通过
- [ ] Playwright e2e `unauthenticated /admin → redirects to /admin/login` 通过
- [ ] Playwright e2e `rate limit kicks in after 5 failed attempts in 60s` 通过(本轮新增)
- [ ] 三视口截图 OK(1440 / 768 / 390)

### 7.4 数据卫生

- [ ] 密码 **bcrypt 哈希**, cost ≥ 10(seed admin 默认 `admin123`,生产前改)
- [ ] session JWT **httpOnly + sameSite=lax**(NextAuth 默认)
- [ ] 登录成功 ActivityLog 记录 actor + IP(可选,本轮必做)
- [ ] 错误回显 **不**透露「用户存在但密码错」 vs 「用户不存在」(统一文案)
- [ ] CSRF token 由 NextAuth 自动注入(无需手写)

### 7.5 安全

- [ ] **Open Redirect 防护**:`callbackUrl` 仅允许 `/admin/` 前缀
- [ ] **Timing Attack 防护**:`authorize()` 在用户不存在时仍调 `bcrypt.compare(dummyHash, password)`(本轮 v2)
- [ ] **Brute Force 防护**:每 IP 5/min 限流(本轮必做)
- [ ] **HTTPS only**(生产):`NEXTAUTH_URL=https://lanhui.com`,cookie secure
- [ ] **Session 过期**:JWT 默认 30 天,可缩短至 7 天(本轮 v2)

---

## 8. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-10 | v0 | 初版实现(`src/app/admin/login/page.tsx` 121 行) | Coya |
| 2026-06-19 | v0.5 | 审计发现 P1-6(错误密码无回显)、P2-3(无忘记密码) | Coya |
| 2026-06-20 | v1 | 完整规格化:含限流 / callbackUrl / ActivityLog / Open Redirect 防护 / DoD 清单 | Coya |

---

## 附录 A: 已知 P0 / P1 关联(2026-06-19 审计)

| ID | 问题 | 修复方向 |
|---|---|---|
| P1-6 | 登录失败无错误文案回显 | F4 ✅(实际 `error` state 已接 inline 红条,但需更详细 `role="alert"` + 文案细化) |
| P2-3 | 缺少「忘记密码」入口 | 不补(后台定位,seed 改密码即可) |
| P1-6-b | 5 次失败无锁定 | F6 本轮必做 |

完整: [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §12](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md)

---

## 附录 B: 权限矩阵

| 操作 | admin | editor | 未登录 |
|---|---|---|---|
| 访问 `/admin/login` | ✅ (但自动跳转 `/admin`) | ✅ (自动跳 `/admin`) | ✅ |
| `POST /api/auth/signin/credentials` 成功 | ✅ → 进入 `/admin` | ✅ → 进入 `/admin` | ✅ |
| 访问 `/admin` 其他页 | ✅ | ✅ | ❌ → 重定向 `/admin/login` |
| 删除文章 | ✅ | ❌ | ❌ |
| 门店管理 | ✅ | ❌ | ❌ |
| 数据分析 | ✅ | ❌ | ❌ |
| 用户管理 | ✅ | ❌ | ❌ |

详见 [../../../src/types/next-auth.d.ts](../../../src/types/next-auth.d.ts)

---

## 附录 C: 相关文档

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §4.2 / §5.3
- [../../../src/lib/auth.ts](../../../src/lib/auth.ts) — NextAuth 配置
- [../../../src/lib/auth-callbacks.ts](../../../src/lib/auth-callbacks.ts) — jwt / session callback
- [../../../src/types/next-auth.d.ts](../../../src/types/next-auth.d.ts) — 角色类型扩展
- [../../database/SCHEMA.md](../../database/SCHEMA.md) — User / ActivityLog 表
- [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) §12.2 P1-6
- [../_templates/admin.md](../_templates/admin.md) — 后台模板