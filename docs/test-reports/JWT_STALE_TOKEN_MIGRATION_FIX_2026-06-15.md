# Tester 报告 — JWT_STALE_TOKEN_MIGRATION

| 项目 | 内容 |
| --- | --- |
| 报告日期 | 2026-06-15 |
| 阶段 | Coder (commit `ae23bd9`) → Merge (`a47e2a4`) → 验证 |
| 范围 | 用户报告 `POST /api/articles 401` 根因修复 |
| 验证 | tsc 0 新错误 + vitest 145/145 + build 成功 |

---

## 1. 根因

`src/lib/auth-callbacks.ts` 的 `jwtCallback` 修复后只在首次登录时把 `user.id` 写入 token。用户当前的 session JWT cookie 是在 `1619cf1` 合并**之前**签发的旧 token，只有 `role`、无 `id`。新守卫 `route.ts:106-111` 正确识别并返回 401（28ms 是纯内存检查，无 DB 命中）。

**这是 token 迁移问题，不是代码 bug**。

## 2. 修复方案

`src/lib/auth-callbacks.ts:20-35` 新增 `migrateStaleToken` 辅助函数。当 `jwtCallback` 收到来自 cookie 的 token（`user` 为 `undefined`）且 `token.id` 缺失时，按 `token.email` 或 `token.sub` 查 DB 补全 `id`/`role`：

- **email 含 `@` 走 `where: { email }`**
- **否则走 `where: { id }`（sub 是 user id）**
- **DB 找不到 → 静默放行，让下游 401 守卫触发**
- **已有 `id` → 跳过 DB 查询（避免无谓开销）**

一次性：补完后 NextAuth 重签 token，后续请求都带 `id`，不再走此分支。

## 3. 验证门禁

| 门禁 | 结果 | 证据 |
| --- | --- | --- |
| `npx tsc --noEmit` | ✅ 12 预存错误，0 新错误 | 预存错误在 `analytics/stats/route.test.ts` + `analytics.test.ts` + `stores/[id]/route.ts`，与本任务文件无交集 |
| `npx vitest run` | ✅ 15 files / 145 tests passed | 141 baseline + 4 new = 145（worktree 14/136 是因无未跟踪的 `window-film-details.test.ts`） |
| `npm run build` | ✅ 成功 | Next 16.2.1，465/465 静态页生成 |

## 4. 新增测试（4 个，全在 `src/lib/auth.test.ts`）

| # | 测试 | 描述 |
| --- | --- | --- |
| 1 | migrates stale token lacking id by looking up user by email | 主路径：旧 token 缺 id + 有 email → DB 查 email → 补全 id/role |
| 2 | does not query DB when token already has id | 防过度查询：新 token 已有 id → 跳过 DB |
| 3 | silently passes through when DB lookup returns null | 边界：用户已删除 → 不抛错，让 401 守卫处理 |
| 4 | falls back to sub lookup when email is absent | 降级：token 没 email → 用 sub 当 id 查 |

`auth.test.ts` 总数：5 原有 + 4 新增 = 9，全通过。

## 5. 改动文件

```
commit ae23bd9 — fix(auth): auto-migrate stale JWT tokens missing user.id
commit a47e2a4 — merge

src/lib/auth-callbacks.ts   M  +36 行
src/lib/auth.test.ts        M  +76 行
```

2 个文件，+111/-1。

## 6. 行为契约

| 场景 | 旧行为（合并 ae23bd9 前） | 新行为（合并后） |
| --- | --- | --- |
| 旧 token（无 id）首次请求 | 401 `登录状态异常` | 201（自动补 id，DB 查 1 次） |
| 旧 token 后续请求 | 401 持续触发 | 200/201（token 已有 id，无 DB 查） |
| 新登录（fix 之后） | 201（token 有 id） | 201（无变化） |
| 用户已删除 | 401 `登录状态异常` | 401 `登录状态异常`（DB 找不到，守卫触发） |
| Token 无 email 也无 sub | 401 `登录状态异常` | 401 `登录状态异常`（无 lookup key，静默放行） |

## 7. Bug 报告

| 严重度 | 数量 |
| --- | --- |
| P0 阻断 | 0 |
| P1 严重 | 0 |
| P2 一般 | 0 |
| P3 轻微 | 0 |

## 8. 签字

**门禁 3：通过。** 0 P0/P1/P2/P3，145/145 测试通过，build 成功。

**用户操作**：无需操作。下次请求 `/api/articles` 时会自动迁移旧 token，1 次额外 DB 查（5-15ms）后无感。

---

## 9. 后续建议

| 优先级 | 工单 | 描述 |
| --- | --- | --- |
| P3 | `next-auth.d.ts` `JWT.id` 改为必填 | 等所有旧 token 过期后（约 30 天 NEXTAUTH_SECRET 周期），可收紧类型；现在保留 optional 是为了兼容过渡期 |
| P3 | 监控 stale token 数量 | 在 `migrateStaleToken` 加 metric/log，统计被迁移的 token 数；过 30 天后该指标应归零 |
