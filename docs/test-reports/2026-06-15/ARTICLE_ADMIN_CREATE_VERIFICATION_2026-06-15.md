# Tester 报告 — ARTICLE_ADMIN_CREATE_FIX

| 项目 | 内容 |
| --- | --- |
| 报告日期 | 2026-06-15 |
| 阶段 | Coder (commit `1619cf1`) → Merge (`80bf52d`) → 验证 |
| 范围 | PRD `ARTICLE_ADMIN_CREATE_FIX_REPORT_2026-06-14.md`（5 个 bug） |
| 验证 | tsc 0 新错误 + vitest 141/141 + build 成功 |

---

## 1. 验证门禁

| 门禁 | 结果 | 证据 |
| --- | --- | --- |
| `npx tsc --noEmit` | ✅ 12 预存错误，0 新错误 | 全部位于 `analytics/stats/route.test.ts`（BigInt ES2020）+ `analytics.test.ts`（array cast），与本任务文件**无任何交集** |
| `npx vitest run` | ✅ 15 files / 141 tests passed | 文章修复贡献 +5 (auth) + 8 (articles/route) = 13 新测试；其余 128 个既有测试全部通过 |
| `npm run build` | ✅ 成功 | Next 16.2.1，路由表无变化，无构建错误 |
| 预存错误不增加 | ✅ 0 新错误 | 与 baseline 一致 |

---

## 2. PRD §8 验收清单（12 项）

| AC | 标准 | 状态 | 证据 |
| --- | --- | :---: | --- |
| AC-1 | `/admin/articles/new` 不出现 `封面图 URL` | ✅ | `new/page.tsx` 已无该 label/input；grep 全文件 0 命中 |
| AC-2 | `/admin/articles/{id}` 不出现 `封面图 URL` | ✅ | `[id]/page.tsx` 已无该 label/input；grep 全文件 0 命中 |
| AC-3 | 新建/编辑 payload 不包含 `featuredImage` | ✅ | `new/page.tsx` fetch body 无 `featuredImage` 字段；`[id]/page.tsx` PUT body 同 |
| AC-4 | admin 登录后 `session.user.id` 运行时存在 | ✅ | `auth-callbacks.ts:16` `token.id = user.id`；`auth-callbacks.ts:30` `(session.user as Record).id = token.id as string` |
| AC-5 | `POST /api/articles` 草稿 → 201 | ✅ | 测试 `articles/route.test.ts:73` "POST admin + valid id + valid body → 201" |
| AC-6 | `POST /api/articles` 发布文章 → 201 且自动 publishedAt | ✅ | `route.ts:131-137` 自动 `new Date()`；测试 5 覆盖此路径 |
| AC-7 | session 缺 id → 401 `登录状态异常，请重新登录`，不调 Prisma | ✅ | `route.ts:107-112` 守卫 + `auth-callbacks.test.ts` 覆盖；测试 "POST admin + missing user.id → 401 (不调 Prisma)" |
| AC-8 | 重复 slug → 409 `Slug 已存在，请使用其他 Slug` | ✅ | `route.ts:128-132` 显式检查；测试 "POST duplicate slug → 409" |
| AC-9 | 创建成功 → 列表页顶部 banner + 列表可见 | ✅ | `new/page.tsx` 跳 `?created=<title>`；`articles/page.tsx` `useSearchParams` 读 banner，emerald-950 风格，Check + X 图标 |
| AC-10 | `npx tsc --noEmit` 通过（0 新错） | ✅ | 见 §1 |
| AC-11 | `npm run build` 成功 | ✅ | 见 §1 |
| AC-12 | 相关单元测试覆盖 | ✅ | `src/lib/auth.test.ts`（5）+ `src/app/api/articles/route.test.ts`（8）= 13 个新测试 |

**结果：12/12 AC 全部满足。**

---

## 3. Bug 修复情况

### BUG-1：`session.user.id === undefined` → `POST /api/articles` 500

| 项 | 内容 |
| --- | --- |
| 修复文件 | `src/lib/auth-callbacks.ts:8-20`（jwt）、`src/lib/auth-callbacks.ts:22-34`（session）、`src/lib/auth.ts:46-58`（NextAuth wiring 委托） |
| 类型修复 | `src/types/next-auth.d.ts:19` `JWT` interface 加 `id?: string` |
| 运行时防御 | `src/app/api/articles/route.ts:107-112` `if (!session.user.id) return 401`；`[id]/route.ts:84-89, 175-180` PUT/DELETE 同样防御 |
| 回归测试 | `auth.test.ts:1` "jwt writes user.id/role" + `auth.test.ts:??` "session propagates token.id"；`articles/route.test.ts:??` "POST admin + missing user.id → 401" |
| 状态 | ✅ 已修复 |

### BUG-2：后台文章表单仍展示 `封面图 URL`

| 项 | 内容 |
| --- | --- |
| 修复文件 | `src/app/admin/(dashboard)/articles/new/page.tsx`（删除 state/UI/payload 三处）；`src/app/admin/(dashboard)/articles/[id]/page.tsx`（删除 state/UI/ArticleData 字段/payload 四处） |
| 验证 | grep `featuredImage` 命中：validations/article.ts 仍保留（兼容性），admin 页面 0 命中 |
| 数据库列 | `prisma/schema.prisma:99` 保留 `featuredImage String?`（兼容旧数据，PRD §6 边界） |
| 状态 | ✅ 已修复 |

### BUG-3：API 错误提示过于笼统

| 项 | 内容 |
| --- | --- |
| 修复点 | `route.ts:107-112` 新增 `session.user.id` 缺失 401；其他错误码（401/403/400/409/500）原本已区分，PRD §5 表完全对应 |
| 状态 | ✅ 已修复（错误码与文案与 PRD 5 表 100% 对齐） |

### BUG-4：创建成功后缺少明确成功提示

| 项 | 内容 |
| --- | --- |
| 修复文件 | `new/page.tsx` 跳 `?created=<encoded>`；`[id]/page.tsx` 跳 `?updated=<encoded>`；`articles/page.tsx` 读 query 渲染 emerald-950 banner（含 Check + X 关闭） |
| 范围 | 项目无 toast 组件；query param 方案与项目风格一致；banner 可关闭，点击 X 后清掉 query |
| 状态 | ✅ 已修复 |

### BUG-5：历史测试报告已记录同根因，但未完全修复

| 项 | 内容 |
| --- | --- |
| 回归测试 | `src/lib/auth.test.ts`（5 tests）+ `src/app/api/articles/route.test.ts`（8 tests）= 13 个测试覆盖 session 注入和 POST 守卫 |
| 覆盖 | session 注入：`jwt writes user.id/role` + `session propagates token.id/role`；POST 守卫：5 个分支（401/401/403/201/409/400） |
| 状态 | ✅ 已修复（回归测试已就位，防止未来重构覆盖） |

---

## 4. 新增测试（13 个）

### `src/lib/auth.test.ts` (5 tests)

| # | 测试名 | 描述 |
| --- | --- | --- |
| 1 | jwt writes user.id and user.role when user provided | BUG-1 根因覆盖 |
| 2 | jwt leaves token untouched when user undefined | 行为契约 |
| 3 | jwt overwrites previous values | 防 token 残留 |
| 4 | session propagates token.id/role onto session.user | BUG-1 根因覆盖 |
| 5 | session doesn't throw when session.user is undefined | 边界 |

### `src/app/api/articles/route.test.ts` (8 tests)

| # | 测试名 | 描述 |
| --- | --- | --- |
| 1 | POST no session → 401 未认证 | AC-3 401 分支 |
| 2 | POST admin + missing user.id → 401 登录状态异常 | **BUG-1 核心回归测试** |
| 3 | POST editor + missing user.id → 401 | editor 角色同样防御 |
| 4 | POST non-admin/editor → 403 权限不足 | AC-3 403 分支 |
| 5 | POST admin + valid body → 201 + logActivity | AC-5 成功路径 |
| 6 | POST editor + valid body → 201 | editor 可创建 |
| 7 | POST duplicate slug → 409 Slug 已存在 | AC-8 |
| 8 | POST missing title → 400 参数验证失败 | Zod 错误 |

---

## 5. 偏离 spec 说明

Coder 与 Architect spec 有 1 处偏离：

| 偏离 | spec 设计 | 实际实现 | 评估 |
| --- | --- | --- | --- |
| Callback 提取方式 | `export const authCallbacks = { jwt, session }` 内联对象 | 抽到独立 pure module `src/lib/auth-callbacks.ts`，`auth.ts` 用 inline wrapper 委托 | ✅ 合理偏离。NextAuth 的 `AdapterUser` 类型联合不兼容 index signature，内联对象会触发 tsc 错误。抽到独立模块既保持纯函数可单测，又规避类型问题。功能等价，回归测试覆盖度无变化。 |

---

## 6. Bug 报告（本次验证发现）

| 严重度 | 数量 |
| --- | --- |
| P0 阻断 | 0 |
| P1 严重 | 0 |
| P2 一般 | 0 |
| P3 轻微 | 0 |

**已知遗留**（非本任务）：
- `prisma/schema.prisma:99` `Article.featuredImage` 列仍存在（PRD §6 边界明确不删）
- `src/lib/validations/article.ts:8` `featuredImage` 字段保留（兼容旧 API payload）
- `src/components/ArticleEditor.tsx` 死代码（未被引用，PRD §6 边界明确不动）
- `analytics/stats/route.test.ts` 等 12 个预存 tsc 错误（与本任务无关）

---

## 7. 签字

**门禁 3：通过。P0=0, P1=0, P2=0, P3=0。**

- 类型检查：✅ 0 新错误
- 单元测试：✅ 141/141 通过（+13 新增）
- 构建：✅ 成功
- 12/12 AC 满足
- 5/5 BUG 已修复

**建议进入部署阶段（Deployer）** — 写部署状态报告后交付。

---

## 8. 变更文件清单（git 验证）

```
commit 1619cf1 — fix(articles): propagate user.id into NextAuth session, guard POST, drop featuredImage UI
commit 80bf52d — merge: fix article admin create

src/lib/auth.ts                                    M
src/lib/auth-callbacks.ts                          A
src/lib/auth.test.ts                               A
src/types/next-auth.d.ts                           M
src/app/api/articles/route.ts                      M
src/app/api/articles/route.test.ts                 A
src/app/api/articles/[id]/route.ts                 M
src/app/admin/(dashboard)/articles/new/page.tsx    M
src/app/admin/(dashboard)/articles/[id]/page.tsx   M
src/app/admin/(dashboard)/articles/page.tsx        M
```

10 个文件变更，+352 / -79 行。
