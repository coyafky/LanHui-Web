# 子任务 1 — DB 迁移 (Store.level + slug 可空)

## 完成时间
2026-06-22T11:50:00+08:00

## 产出

| 文件 | 操作 | 说明 |
|---|---|---|
| prisma/schema.prisma | 修改 | +level StoreLevel 枚举 + slug 改 String? + 索引 + enum |
| prisma/migrations/20260622040000_add_store_status_lifecycle/migration.sql | 新增+commit | 前置 status lifecycle 迁移(原 untracked,纳入 commit) |
| prisma/migrations/20260622090000_add_store_level_slug/migration.sql | 新增 | level + slug nullable + CHECK + 索引 |

## Commit

`ceedbc6` — feat(db): add Store.level enum + slug optional

## 验证结果

- `npx prisma format`: ✓ (字段对齐重整)
- `npx prisma generate`: ✓ (v7.8.0)
- `\d "Store"` 字段确认: ✓
  - `level | character varying(20) | not null | 'flagship'`
  - `slug | text | nullable`
  - `Store_level_check` CHECK 约束 ✓
  - `Store_level_idx` + `Store_level_status_idx` 索引 ✓
  - `status/statusReason/statusChangedAt/statusChangedBy` 也已加上(来自 prior migration)
- `npx prisma migrate status`: ✓ **"Database schema is up to date!"**
- 数据完整性: 22 行 Store,全部 level=flagship + status=active(prior migration UPDATE 把 isActive=true 的 22 行转 status=active)
- `_prisma_migrations` 8 行: 6 原 + 1 prior status_lifecycle + 1 new level_slug

## 偏离 spec / 发现

### 偏差 1: prior migration 文件未 commit 进 main(spec 假设已存在)

spec 写「`prisma/migrations/20260622040000_add_store_status_lifecycle/` 已存在… schema.prisma 已反映这些字段」。
实际:
- prior migration 文件存在于 worktree 但 `git ls-tree HEAD` 显示 main 上不存在
- main HEAD 的 `schema.prisma` 里 Store 模型无 `status/statusReason/statusChangedAt/statusChangedBy` 字段
- DB Store 表当前缺这些列(spec 默认它们已被 apply)

**修正**: 在 apply 新 migration 之前,先用 prior migration 的 SQL 把 status/statusReason/statusChangedAt/statusChangedBy 4 列 + 2 索引补到 DB,然后 apply 新 migration。commit 时把 prior migration 文件也纳入(否则下一次 worktree 会漂移)。

### 偏差 2: spec commit 命令字面只 add `schema.prisma + 20260622090000_*`

按 spec 字面执行会让 prior migration 永不进 main → 下次 merge 时漂移。
**修正**: 三个 prisma 文件一并 commit(prior migration + 新 migration + schema)。commit message 标注「Include prior status_lifecycle migration that was untracked」。

### 偏差 3: 现有 worktree 内其他 src/ 修改(spec 未涉及)

`git status` 显示 10 个 modified 文件(含 `src/app/admin/(dashboard)/stores/*`、`src/app/api/stores/*`、`src/components/admin/StoreForm.tsx`、`src/lib/validations/store.ts` 等)。这些是后续子任务 2/3/4 的范围,**本任务 scope 纪律不 commit**。

## 下一步

子任务 2 可以开始(共享校验已能引用新枚举类型 + slug 改 nullable 后,Zod schema 可省略 slug 必填)。