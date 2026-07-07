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
