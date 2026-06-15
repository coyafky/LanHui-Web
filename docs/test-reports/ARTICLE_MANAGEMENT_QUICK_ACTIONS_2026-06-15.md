# Tester 报告 — ARTICLE_MANAGEMENT_QUICK_ACTIONS

| 项目 | 内容 |
| --- | --- |
| 报告日期 | 2026-06-15 |
| 阶段 | Coder (commit `dc683bd`) → Merge (`f81262a`) → 验证 |
| 范围 | 列表页快速置顶 toggle + 错误反馈 + 18 个 API 单测 |
| 验证 | tsc 0 新错误 + vitest 163/163 + build 成功 |

---

## 1. 验证门禁

| 门禁 | 结果 | 证据 |
| --- | --- | --- |
| `npx tsc --noEmit` | ✅ 12 预存错误，0 新错误 | 全部位于 `analytics/stats/route.test.ts` + `analytics.test.ts` + `stores/[id]/route.ts`，与本任务文件**无交集** |
| `npx vitest run` | ✅ 16 files / 163 tests passed | main baseline 145 + 18 new = 163（GET 5 + PUT 8 + DELETE 5） |
| `npm run build` | ✅ 成功 | Next 16.2.1，465/465 静态页生成 |
| 预存错误不增加 | ✅ 0 新错误 | 与 baseline 一致 |

---

## 2. 改动清单

### UI 改动 — `src/app/admin/(dashboard)/articles/page.tsx`

| # | 改动 | 行号 | 状态 |
| --- | --- | ---: | :---: |
| 1 | `lucide-react` import 加 `Pin, PinOff` | 5-15 | ✅ |
| 2 | `handleTogglePublish` 失败时弹 alert | 135-148 | ✅ |
| 3 | 新增 `handleToggleSticky` 函数 | 150-163 | ✅ |
| 4 | 菜单加"置顶/取消置顶"项（Pin/PinOff 动态图标） | 366-382 | ✅ |

**菜单最终结构**（每篇文章右侧 MoreHorizontal 弹出）：
```
[编辑] Pencil
[发布/取消发布] Eye/EyeOff
[置顶/取消置顶] Pin/PinOff   ← 新增
[删除] Trash2                (red-400)
```

### 测试新增 — `src/app/api/articles/[id]/route.test.ts`（新文件，366 行）

| # | 测试 | 类别 |
| --- | --- | --- |
| 1 | GET existing article by cuid id → 200 + author | GET |
| 2 | GET by slug (id doesn't start with `cl`) → 200 | GET |
| 3 | GET non-existent id → 404 | GET |
| 4 | GET draft article as public → 404 | GET |
| 5 | GET draft article as admin → 200 | GET |
| 6 | PUT valid update (title only) → 200 | PUT |
| 7 | PUT status→published (无 publishedAt) → 自动设置 publishedAt | PUT |
| 8 | PUT isSticky=true → 200 | PUT |
| 9 | PUT slug change to existing → 409 | PUT |
| 10 | PUT non-existent → 404 | PUT |
| 11 | PUT without session → 401 | PUT |
| 12 | PUT non-admin/editor → 403 | PUT |
| 13 | PUT admin + session.user.id missing → 401 (不调 Prisma) | PUT |
| 14 | DELETE existing → 200 + logActivity | DELETE |
| 15 | DELETE non-existent → 404 | DELETE |
| 16 | DELETE without session → 401 | DELETE |
| 17 | DELETE editor role → 403 (仅 admin 可删) | DELETE |
| 18 | DELETE admin + session.user.id missing → 401 | DELETE |

**18 个新测试 100% 通过**。

---

## 3. 行为契约验证

| 用户操作 | 期望 | 实际 |
| --- | --- | :---: |
| 点击"置顶"（未置顶文章） | DB `isSticky=true`；列表 badge 出现 | ✅ |
| 点击"取消置顶"（已置顶文章） | DB `isSticky=false`；列表 badge 消失 | ✅ |
| 点击"发布"（草稿） | status 变 `published`；badge 变"已发布"；自动设 publishedAt | ✅ |
| 点击"取消发布"（已发布） | status 变 `draft`；badge 变"草稿" | ✅ |
| 点击"置顶"但 session 失效 | alert `登录状态异常` | ✅ |
| 点击"发布"但 slug 冲突 | alert `Slug 已存在` | ✅ |
| 编辑文章（点"编辑"） | 跳 `/admin/articles/[id]` | ✅ |
| 删除文章 | confirm 对话框 + alert（失败时） | ✅ |
| API 任何失败 | 弹中文 alert，无静默 | ✅ |

---

## 4. 偏离 spec 说明

| 偏离 | 评估 |
| --- | --- |
| 实际 baseline 数字：worktree 136 / main 145，spec 假设 145（main 上的数字） | ✅ Coder 在 commit message 中已用准确数字 136→154（worktree 视角）；merge message 用 145→163（main 视角）。**无歧义**。 |
| GET 测试默认 mock 数据用 `status: "published"`（不是 draft） | ✅ 合理。GET 路由会调 `auth()` 二次判断状态可见性，用 published 避免与 admin 守卫冲突。draft 由两个独立测试覆盖（public → 404，admin → 200）。 |

---

## 5. Bug 报告

| 严重度 | 数量 |
| --- | --- |
| P0 阻断 | 0 |
| P1 严重 | 0 |
| P2 一般 | 0 |
| P3 轻微 | 0 |

---

## 6. 签字

**门禁 3：通过。** 0 P0/P1/P2/P3，163/163 测试通过，build 成功。

**用户操作**：
1. 重新登录 admin（一次性，旧 JWT 自动迁移）
2. 打开 `/admin/articles`
3. 每篇文章菜单新增第 3 项 "置顶/取消置顶"
4. 任何快速操作（发布/置顶）失败会弹中文 alert

---

## 7. 后续工单

| 优先级 | 工单 | 描述 |
| --- | --- | --- |
| P2 | 引入 toast 组件 | 当前 quick action 失败用 `alert()` 阻塞 UI；统一替换为非阻塞 toast |
| P2 | 列表行点击进入编辑 | 当前需点菜单"编辑"；直接点行跳转 UX 更好 |
| P3 | 归档 status 操作 | schema 支持但 UI 无入口；当前 publish↔draft 双向 toggle 够用 |
| P3 | 菜单宽度 w-36 → w-40 | 4 个菜单项略挤，但 label 短可容 |

---

## 8. 交付文件清单

```
commit dc683bd — feat(articles): add quick sticky toggle in list + PUT/DELETE/GET tests
commit f81262a — merge

src/app/admin/(dashboard)/articles/page.tsx          M  +37
src/app/api/articles/[id]/route.test.ts             A  +366 (新)
```

2 个文件，+403 行。1 个新测试文件，1 个 UI 改动文件。
