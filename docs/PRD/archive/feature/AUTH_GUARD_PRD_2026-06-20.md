# AUTH_GUARD_PRD_2026-06-20 — NextAuth 认证与权限矩阵 v1

> 横切功能子 PRD — 全站鉴权、角色矩阵、API 守卫、ActivityLog 审计

---

## 0. 元信息

| 项 | 值 |
|---|---|
| 日期 | 2026-06-20 |
| 父 PRD | [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.4 |
| 审计依据 | [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §12.2 B3](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) |
| 数据表 | `User` / `ActivityLog` 见 [../../database/SCHEMA.md §1/§7](../../database/SCHEMA.md) |
| 维护者 | 冯科雅 (Coya) |
| 类型 | 横切功能 (NextAuth 全局 + middleware + API 守卫) |
| 状态 | 🟢 v1 |
| 优先级 | P0 |

---

## 1. 概述

### 1.1 目标

为蓝辉轻改 LANHUI 提供**统一的认证与权限体系**,所有受保护路由(后台 + 写 API)走同一套 `auth() + role check + Zod validate` 三段式守卫。本期(v1)的关键动作是**补齐 B3 任务**:7 个写 API 中 5 个未写 `ActivityLog`,审计链断裂。

### 1.2 适用页面

| 路由 / API | 守卫方式 |
|---|---|
| `/admin/login` | 公开(已登录则跳 `/admin`) |
| `/admin` 及 `/admin/(dashboard)/*`(9 个) | `auth()` + redirect → `/admin/login`(layout) |
| `/api/auth/*` (NextAuth handlers) | 公开(NextAuth 自带) |
| `/api/stores` POST | `auth()` + `role==='admin'` |
| `/api/stores/[id]` PUT / DELETE | `auth()` + `role==='admin'` |
| `/api/articles` POST | `auth()` + `role in ['admin','editor']` |
| `/api/articles/[id]` PUT / DELETE | `auth()` + `role in ['admin','editor']` |
| `/api/upload` POST / DELETE | `auth()` + `role==='admin'` |
| `/api/analytics/stats` GET | `auth()` + `role==='admin'` |
| `/api/analytics/track` POST | 公开(限流 60/min/IP) |
| `/api/{provinces,cities,regions,stores GET,articles GET,articles/categories}` | 公开 |

### 1.3 范围与非目标

**本期(v1)范围**:
- ✅ NextAuth v5 beta + Credentials + JWT(无 DB session)
- ✅ `admin` / `editor` 双角色权限矩阵
- ✅ bcrypt 密码哈希(rounds=10)
- ✅ 路由层守卫(`src/app/admin/(dashboard)/layout.tsx`)
- ✅ API 守卫模式 + Zod 二次校验
- ✅ **B3 修复**:7 写 API 全部接入 `logActivity()`
- ✅ Stale Token 迁移(2026-06-15 JWT_STALE_TOKEN_MIGRATION_FIX)

**本期不在范围**:
- ❌ 多因子认证(TOTP)(v2)
- ❌ OAuth(微信 / GitHub)(v2)
- ❌ 密码找回 / 邮箱验证(v2,内网期间暂缓)

---

## 2. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|
| 未登录用户 | 访问 `/admin` | 重定向 `/admin/login` | P0 |
| 未登录用户 | 调 `POST /api/stores` | 返回 401 `{ error: "未认证" }` | P0 |
| editor | 调 `POST /api/stores` | 返回 403 `{ error: "权限不足" }` | P0 |
| editor | 调 `POST /api/articles` | 成功(有权限) | P0 |
| admin | 创建门店 | 200 + 写 ActivityLog(`store.create`) | P0 |
| admin | 编辑文章 | 200 + 写 ActivityLog(`article.update`) | P0 |
| admin | 上传门店图 | 200 + 写 ActivityLog(`upload.image`) | P1(B3) |
| admin | 删除文章 | 200 + 写 ActivityLog(`article.delete`) | P1(B3) |
| editor | 误访问 `/admin/analytics` | 返回 403 或隐藏侧边栏 | P1 |
| 站长 | 审计操作 | `/admin/audit-logs` 按 actor + 时间过滤 | P1 |

---

## 3. 功能清单

| # | 功能 | 优先级 | 状态 | 说明 |
|---|---|---|---|---|
| F1 | NextAuth Credentials 登录 | P0 | ✅ | `src/lib/auth.ts:9-44` |
| F2 | bcrypt 密码校验 | P0 | ✅ | `auth.ts:30-33` |
| F3 | JWT 注入 `id` + `role` | P0 | ✅ | `auth.ts:46-58` + `auth-callbacks.ts:37-56` |
| F4 | Session 同步 `id` + `role` | P0 | ✅ | `auth-callbacks.ts:58-69` |
| F5 | Stale Token 迁移(无 `id` → DB 查 + patch) | P0 | ✅ | `auth-callbacks.ts:20-35` |
| F6 | 未登录跳转 `/admin/login` | P0 | ✅ | `(dashboard)/layout.tsx:16-20` |
| F7 | 7 写 API `auth()` 守卫 | P0 | ✅ | stores / articles / upload / analytics/stats |
| F8 | 角色校验 `role==='admin'` 或 `'editor'` | P0 | ✅ | 各 route 内联 |
| F9 | Zod 二次校验(StoreCreateSchema 等) | P0 | ✅ | `src/lib/validations/store.ts` |
| F10 | **B3 修复**:`ActivityLog` 写入全 7 API | P0 | 🟡 | 本期新加(5 缺) |
| F11 | 错误回显(登录失败文案) | P1 | 🟡 | 审计 P1-6,本期修复 |
| F12 | 角色升级 / 降级(用户管理) | P1 | ⚪ | v2,需 User 管理页 |
| F13 | 多因子认证 TOTP | P2 | ⚪ | v3 |
| F14 | OAuth 第三方登录 | P2 | ⚪ | v3 |
| F15 | 密码找回 / 重置 | P1 | ⚪ | v2 |

---

## 4. UI / 交互

### 4.1 登录页(`/admin/login`)

- 输入框:用户名 / 邮箱 + 密码
- 错误回显:**P1-6 修复** — 红色 toast `<AlertCircle>` 在 form 顶部 + 抖动动画 200ms
- 失败时不清空用户名(便于复改),清空密码
- 成功后 302 → `/admin`(带 cookie)

### 4.2 后台 layout(`(dashboard)/layout.tsx`)

- 左侧 Sidebar:角色可见菜单过滤
  - admin:全部菜单(含 `/admin/analytics`)
  - editor:隐藏「数据分析」「门店管理」(只读)
- 顶栏:用户名 + 退出按钮(调用 `signOut()`)
- 移动端:Sidebar 折叠成汉堡

### 4.3 守卫失败响应

| 失败 | HTTP | 行为 |
|---|---|---|
| 未认证 | 401 | `{ success: false, error: "未认证" }` |
| 权限不足 | 403 | `{ success: false, error: "权限不足" }` |
| 未认证(浏览器路由) | — | `redirect("/admin/login")` |
| Zod 失败 | 400 | `{ success: false, error: "参数验证失败", details: { field: ["msg"] } }` |

---

## 5. 数据模型

### 5.1 涉及表

```
DB: User                # 详见 ../../database/SCHEMA.md §1
DB: ActivityLog         # 详见 ../../database/SCHEMA.md §7
```

### 5.2 User 角色

| `role` | 描述 | 权限 |
|---|---|---|
| `admin` | 管理员 | 全部(读 + 写 + 数据分析) |
| `editor` | 编辑员 | 文章 CRUD + 门店只读 |
| `suspended` | 停用 | 登录失败(`auth.ts:24` 过滤) |

### 5.3 ActivityLog action 命名规范

`<entity>.<verb>` 蛇形:

| action | 触发 API | entityId |
|---|---|---|
| `store.create` | `POST /api/stores` | store.id |
| `store.update` | `PUT /api/stores/[id]` | store.id |
| `store.delete` | `DELETE /api/stores/[id]` | store.id |
| `article.create` | `POST /api/articles` | article.id |
| `article.update` | `PUT /api/articles/[id]` | article.id |
| `article.delete` | `DELETE /api/articles/[id]` | article.id |
| `upload.image` | `POST /api/upload` | store.id |
| `upload.delete` | `DELETE /api/upload` | store.id |

`metadata` 字段:变更前后差异 / IP / UA

### 5.4 当前 ActivityLog 覆盖现状(B3 任务)

| API | 当前 | 修复目标 |
|---|---|---|
| `POST /api/stores` | ✅ `logActivity` 已写 | — |
| `PUT /api/stores/[id]` | ✅ 已写 | — |
| `DELETE /api/stores/[id]` | ⚪ 缺 | v1 补 |
| `POST /api/articles` | ✅ 已写(例:`article.create`) | — |
| `PUT /api/articles/[id]` | ⚪ 缺 | v1 补 |
| `DELETE /api/articles/[id]` | ⚪ 缺 | v1 补 |
| `POST /api/upload` | ⚪ 缺 | v1 补 |
| `DELETE /api/upload` | ⚪ 缺 | v1 补 |
| **覆盖率** | **2/7 (29%)** | **目标 7/7 (100%)** |

---

## 6. API 守卫模式

### 6.1 标准三段式

```ts
// 标准模板(本期统一抽到 src/lib/api-guard.ts)
import { auth } from '@/lib/auth';
import { ZodSchema } from 'zod';
import { logActivity } from '@/lib/admin-dashboard';

export async function guardAdmin() {
  const session = await auth();
  if (!session) return { ok: false as const, status: 401, error: '未认证' };
  if (session.user.role !== 'admin')
    return { ok: false as const, status: 403, error: '权限不足' };
  return { ok: true as const, session };
}

export async function guardEditor() {
  const session = await auth();
  if (!session) return { ok: false as const, status: 401, error: '未认证' };
  if (!['admin', 'editor'].includes(session.user.role))
    return { ok: false as const, status: 403, error: '权限不足' };
  return { ok: true as const, session };
}

export function validateBody<T>(schema: ZodSchema<T>, body: unknown):
  | { ok: true; data: T }
  | { ok: false; status: 400; error: string; details: object } {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: '参数验证失败',
      details: parsed.error.flatten().fieldErrors,
    };
  }
  return { ok: true, data: parsed.data };
}

export async function logWrite(
  session: { user: { id: string } },
  action: string,
  entity: string,
  entityId: string,
  metadata?: Record<string, unknown>,
) {
  await logActivity({
    actorId: session.user.id,
    action,
    entity,
    entityId,
    metadata: { ...metadata, ip: headers().get('x-forwarded-for') ?? null },
  });
}
```

### 6.2 权限矩阵

| 资源 | GET | POST | PUT | DELETE |
|---|---|---|---|---|
| `/api/stores` | 公开(分页) | admin | — | — |
| `/api/stores/[id]` | 公开 | — | admin | admin |
| `/api/articles` | 公开(过滤 draft) | editor+ | — | — |
| `/api/articles/[id]` | 公开 | — | editor+(自己)/admin(任意) | admin |
| `/api/upload` | — | admin | — | admin |
| `/api/analytics/track` | — | 公开(限流) | — | — |
| `/api/analytics/stats` | admin | — | — | — |
| `/api/{provinces,cities,regions}` | 公开 | — | — | — |

### 6.3 B3 修复实施 plan(代码层)

```ts
// src/app/api/stores/[id]/route.ts:DELETE (改造)
import { guardAdmin, validateBody, logWrite } from '@/lib/api-guard';

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await guardAdmin();
  if (!guard.ok) return Response.json({ success: false, error: guard.error }, { status: guard.status });

  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) return Response.json({ success: false, error: '门店不存在' }, { status: 404 });

  await prisma.store.delete({ where: { id } });
  await logWrite(guard.session, 'store.delete', 'store', id, { name: store.name });
  return Response.json({ success: true });
}
```

类似 pattern 应用到:
- `articles/[id]/route.ts:PUT` → `article.update`
- `articles/[id]/route.ts:DELETE` → `article.delete`
- `upload/route.ts:POST` → `upload.image`
- `upload/route.ts:DELETE` → `upload.delete`

---

## 7. 验收标准 (DoD)

### 7.1 功能

- [x] 正确凭据登录成功
- [x] 错误凭据 401
- [x] 未登录访问 `/admin` 重定向
- [x] admin 角色可访问 `/admin/analytics`
- [x] editor 角色访问 `/admin/analytics` 应被拒绝或隐藏(当前 Sidebar 未过滤,v1 补)
- [ ] F10 **B3 修复**:7 写 API 全写 ActivityLog
- [ ] F11 登录失败文案回显

### 7.2 安全

- [x] bcrypt rounds=10(`package.json` 锁定)
- [x] JWT 签名(`AUTH_SECRET`)
- [x] Stale token 迁移(2026-06-15)
- [ ] CSRF token(NextAuth 自带)
- [ ] Rate limit on login(防爆破,v2)

### 7.3 质量门

- [x] `npx tsc --noEmit` 通过(允许 9 个 pre-existing 错)
- [x] `npm run build` 通过
- [ ] vitest 覆盖:
  - [ ] `guardAdmin()` 未认证 → 401
  - [ ] `guardAdmin()` editor → 403
  - [ ] `validateBody()` Zod 失败 → 400 + details
  - [ ] `logWrite()` 写入 ActivityLog 含 actorId
- [ ] e2e:登录 → 创建门店 → 查 ActivityLog 含 `store.create` 行

### 7.4 审计数据验证

- [ ] 7 个写 API 操作后 5 秒内 `ActivityLog` 表新增对应行
- [ ] `metadata.actorId` 与 `session.user.id` 一致
- [ ] 删除操作 `action=store.delete` / `article.delete` 可被审计筛选

---

## 8. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-20 | v1 | 初版横切 PRD;补 B3 ActivityLog 全覆盖 + 权限矩阵 + 守卫抽象 plan | Coya |
| 2026-06-15 | v0.5 | JWT_STALE_TOKEN_MIGRATION_FIX 修复 cookie 无 `id` 401 阻断 | Coya |
| 2026-06-10 | v0 | 初始 NextAuth v5 + Credentials 接入 | Coya |

---

## 附录 A: 相关文档

- [../00_MASTER_PRD.md §5.4](../00_MASTER_PRD.md) — 横切功能索引
- [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) — 审计源 B3
- [../../database/SCHEMA.md §1/§7](../../database/SCHEMA.md) — `User` / `ActivityLog` 表
- [../../src/lib/auth.ts](../../src/lib/auth.ts) — NextAuth 配置
- [../../src/lib/auth-callbacks.ts](../../src/lib/auth-callbacks.ts) — JWT/Session callbacks
- [../../src/types/next-auth.d.ts](../../src/types/next-auth.d.ts) — 角色类型扩展
- [../../src/app/admin/(dashboard)/layout.tsx](../../src/app/admin/(dashboard)/layout.tsx) — 路由守卫
- [../../src/lib/admin-dashboard.ts](../../src/lib/admin-dashboard.ts) — `logActivity()` 工具
- [../../../ARCHITECTURE.md §认证](../../../ARCHITECTURE.md) — 架构层描述

## 附录 B: 凭据与种子

| 项 | 默认值 | 来源 |
|---|---|---|
| 管理员账号 | `admin@lanhui.com` / `admin` | `prisma/seed.ts:62-75` |
| 默认密码 | `admin123` | 同上(**生产前必须改**) |
| 创建管理员 CLI | `npx tsx scripts/create-admin.ts --username X --email Y --password Z --role admin` | 见 CLAUDE.md Commands 速查 |
| `AUTH_SECRET` | 环境变量(`AUTH_SECRET=...`) | NextAuth 强制要求 |
| bcrypt rounds | 10 | `bcryptjs` 默认 |

## 附录 C: Stale Token 迁移机制

背景:2026-06-14 之前的登录 token 缺少 `id` 字段,导致所有需要 `session.user.id` 的 API 立即返回 401。

修复:`src/lib/auth-callbacks.ts:20-35` — `migrateStaleToken()` 在每次请求的 `jwt` callback 里检查 `token.id`,缺失则按 `email` / `sub` 反查 DB,patch 写入。NextAuth 自动重新签名 cookie,后续请求恢复正常。

验证:`docs/test-reports/JWT_STALE_TOKEN_MIGRATION_FIX_2026-06-15.md`