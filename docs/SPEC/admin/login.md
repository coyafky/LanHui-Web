# SPEC: Admin 登录 Login

> 对应 PRD：`docs/PRD/admin/README.md`
> 实现状态：✅ **完成**

---

## 1. 职责范围

管理后台身份认证。Credentials 登录 → JWT → Session。

## 2. 路由

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/admin/login` | page (Client) | 登录页 | ✅ |

## 3. Layout 层次

```
admin/layout.tsx        → pass-through（仅 {children}）
  └── (dashboard)/layout.tsx  → auth() 守卫 + Sidebar + 顶栏 + 主内容
```

## 4. 认证流程

```
用户输入凭证 → POST /api/auth/[...nextauth] (Credentials)
                     → authorize() 回调校验 username/password
                     → JWT callback 写入 { id, role, email }
                     → Session callback 回传 { user: { id, email, role } }
                     → dashboard layout: auth() 守卫
                     → 未认证 → redirect /admin/login
                     → 角色不足 → redirect /admin (或 403 提示)
```

### 流程细节

1. **登录页** (`/admin/login`)：Client Component，表单含 username + password，调用 `signIn("credentials")`。
2. **authorize 回调**：查询 `prisma.user` 表，bcrypt compare password，返回 `{ id, email, name, role }` 或 `null`。
3. **JWT callback**：将 `token.id` 和 `token.role` 写入 JWT payload。
4. **Session callback**：将 `token` 中的 `id`、`role`、`email` 映射到 `session.user`。
5. **auth() 守卫**：`(dashboard)/layout.tsx` 调用 `auth()`，若返回 `null` 则 `redirect("/admin/login")`；若 role 不足则 `redirect("/admin")`。
6. **登出**：`signOut({ callbackUrl: "/admin/login" })` 清除 session 并跳转登录页。

## 5. 权限角色

### 角色定义

| 角色 | 访问 Admin | 管理门店 | 管理文章 | 管理分析页 | 管理设置 | 管理用户 |
|------|-----------|----------|----------|-----------|---------|---------|
| admin | ✅ 完全访问 | ✅ CRUD | ✅ CRUD | ✅ 查看 | ✅ 配置 | ✅ 管理 |
| editor | ✅ 受限访问 | ❌ 不可见 | ✅ CRUD | ❌ 不可见 | ❌ 不可见 | ❌ 不可见 |

### 角色-页面映射

| 页面路径 | admin | editor |
|----------|-------|--------|
| `/admin/login` | ✅ | ✅ |
| `/admin` (仪表盘) | ✅ | ✅（不含分析面板） |
| `/admin/stores/*` | ✅ | ❌ |
| `/admin/articles/*` | ✅ | ✅ |
| `/admin/analytics` | ✅ | ❌ |
| `/admin/settings` | ✅ | ❌ |

### 权限校验方式

- **服务端 API**：route handler 内 `auth()` → 检查 `session.user.role`，非 admin 拒绝写操作。
- **客户端 UI**：侧边栏根据 `session.user.role` 动态显示/隐藏菜单项。
- **Layout 守卫**：`(dashboard)/layout.tsx` 中 `auth()` 后，可选择性对不同角色展示不同内容。

## 6. JWT Payload 接口

```typescript
// src/types/next-auth.d.ts

// JWT payload（编码在 token 中，每次请求由 next-auth 解密）
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;       // prisma.user.id
    role?: string;     // "admin" | "editor"
  }
}

// Session 对象（客户端通过 useSession() 获取）
declare module "next-auth" {
  interface Session {
    user: {
      id: string;       // prisma.user.id
      email: string;    // prisma.user.email
      name?: string | null;
      role?: string;    // "admin" | "editor"
    };
  }

  interface User {
    role?: string;
  }
}
```

### Token 生命周期

| 属性 | 值 |
|------|----|
| JWT 签名算法 | HS256（默认） |
| Session 策略 | JWT（无 DB session） |
| Token 过期 | NextAuth 默认 30 天 |
| 刷新机制 | 每次请求自动刷新（maxAge 内） |
| Cookie 名 | `next-auth.session-token`（HTTP-only, Secure, SameSite=Lax） |

## 7. 实现参考

类型扩展位于 `src/types/next-auth.d.ts`，扩展 JWT 和 Session 类型以包含 `id` 和 `role`。详见 §6 接口定义。

---

> 最后更新: 2026-06-22

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-10 | Claude Code | NextAuth v5 集成（Credentials + JWT + role 扩展） | 完成 | — |
| 2026-06-15 | Claude Code | JWT stale token 迁移修复 | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | — |
