# SPEC: API 认证 Auth

> 实现状态：✅ **完成**

---

## 1. 职责范围

用户认证全流程：登录、会话管理、JWT 签发与校验。

## 2. 路由

| 路径 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth v5 handlers | ✅ |

## 3. 认证方式

- **Provider**: Credentials（用户名+密码）
- **Session 策略**: JWT（无 DB session）
- **Token 迁移**: `migrateStaleToken()` 修复旧 JWT 缺 `id` 字段

## 4. JWT Payload

```typescript
interface JWT {
  id: string;
  role: "admin" | "editor";
  email: string;
  name?: string;
}
```

## 5. 守卫方式

- Admin layout: `auth()` 函数在 `(dashboard)/layout.tsx` 中调用
- API 写操作: route handler 内 `auth()` + `user.role` 校验

---

> 最后更新: 2026-06-22

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-10 | Claude Code | NextAuth v5 API 路由实现 | 完成 | — |
| 2026-06-15 | Claude Code | JWT stale token 迁移修复 | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | — |
