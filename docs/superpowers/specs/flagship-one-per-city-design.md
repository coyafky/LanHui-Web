---
comet_change: flagship-one-per-city
role: technical-design
canonical_spec: openspec
status: archived
archived_with: openspec/changes/archive/2026-07-07-flagship-one-per-city
---

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
