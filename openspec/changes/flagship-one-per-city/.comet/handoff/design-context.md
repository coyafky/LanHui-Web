# Comet Design Handoff

- Change: flagship-one-per-city
- Phase: design
- Mode: compact
- Context hash: f60066ea8a3c0ec22cabf39b324030be38dde994156e62c2911aa0043e65612a

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/flagship-one-per-city/proposal.md

- Source: openspec/changes/flagship-one-per-city/proposal.md
- Lines: 1-22
- SHA256: 54b42d96d322229b9157f895d4d2cf9c3cd3a3b75502752475febeecb410868a

```md
# Proposal: 每个城市最多 1 个星辉旗舰店

## Why

当前门店系统无旗舰店唯一性约束，同一城市可存在多个 `level === "flagship"` 门店。业务要求每个 `provinceSlug + citySlug` 最多 1 个非终止状态旗舰店。

## What Changes

1. 新增 `src/lib/stores/flagship-constraint.ts` — 可复用校验函数
2. API 层：POST/PUT/PATCH/publish 四入口接入旗舰店唯一性校验
3. 数据库层：PostgreSQL partial unique index 兜底
4. 后台 UI：等级字段提示 + 409 错误展示
5. 数据清理：seed.ts 修改保证每城市最多 1 flagship + faker store 遵守约束
6. 测试：覆盖 8 个旗舰店约束场景

## Scope

- Store CRUD API（创建/更新/发布）
- Store 后台表单
- 数据库迁移
- 种子数据
- API 测试
```

## openspec/changes/flagship-one-per-city/design.md

- Source: openspec/changes/flagship-one-per-city/design.md
- Lines: 1-50
- SHA256: 106cc922272dcb12f10b2aaea0130596eab648b30dbfea01f5daa8a2797b1e7c

```md
# Design: 每个城市最多 1 个星辉旗舰店

## 架构分层

```
数据库层 (partial unique index)
    ↓ 兜底
API 校验层 (flagship-constraint.ts)
    ↓ 主要防线
后台 UI 层 (表单提示 + 错误展示)
```

## 1. 可复用校验函数

位置：`src/lib/stores/flagship-constraint.ts` (server-only, 可 import prisma)

```ts
export async function checkFlagshipPerCity(params: {
  provinceSlug: string;
  citySlug: string;
  level: string;
  excludeStoreId?: string;
}): Promise<{ ok: true } | { ok: false; conflict: { id: string; name: string } }>
```

## 2. API 层接入点

| 端点 | 时机 | 排除自身 |
|------|------|----------|
| POST /api/stores | 创建前 | - |
| PUT /api/stores/[id] | 更新前 | existing.id |
| PATCH /api/stores/[id] | 更新前 | existing.id |
| POST /api/stores/[id]/publish | 发布前 | existing.id |

冲突返回：HTTP 409, `{ success: false, error: "该城市已存在星辉旗舰店", details: { level: ["每个城市最多只能设置一个星辉旗舰店"] } }`

## 3. 数据库层

```sql
CREATE UNIQUE INDEX IF NOT EXISTS store_one_flagship_per_city_idx
ON "Store" ("provinceSlug", "citySlug")
WHERE "level" = 'flagship' AND "status" <> 'terminated';
```

Prisma P2002 错误捕获需要兼容 Pg driver adapter 结构，映射到 409 友好错误。

## 4. UI 层

- 等级字段旁加提示："星辉旗舰店：每个城市最多 1 家"
- API 返回 409 时在表单显示后端错误信息
```

## openspec/changes/flagship-one-per-city/tasks.md

- Source: openspec/changes/flagship-one-per-city/tasks.md
- Lines: 1-8
- SHA256: a4ad8b03e8420a9389fe9f84ed5bd0c3b551090eadc2983c048281e69a97092b

```md
- [ ] Task 1: 清理 DB 数据 + 修改 seed.ts 保证每城市最多 1 flagship
- [ ] Task 2: 新增 `src/lib/stores/flagship-constraint.ts` 可复用校验函数
- [ ] Task 3: API 层接入 — POST/PUT/PATCH/publish 四入口
- [ ] Task 4: 数据库层 partial unique index 迁移
- [ ] Task 5: 后台 UI 等级提示 + 409 错误展示
- [ ] Task 6: P2002 唯一约束错误友好处理
- [ ] Task 7: 测试 — 8 个旗舰店约束场景
- [ ] Task 8: `npm run build` + `npm test` 验证
```

