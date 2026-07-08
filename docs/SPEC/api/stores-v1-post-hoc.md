# SPEC: API 门店 Stores

> 实现状态：✅ **完成**

---

## 1. 职责范围

门店数据的 CRUD API。公开站 GET、Admin 端全操作。

## 2. 路由

| 路径 | 方法 | 权限 | 说明 | 状态 |
|------|------|------|------|------|
| `/api/stores` | GET | 公开 | 门店列表（筛选/search/分页/level 多值） | ✅ |
| `/api/stores` | POST | admin | 创建门店 | ✅ |
| `/api/stores/[id]` | GET | 公开 | 单门店（id 或 slug 查询） | ✅ |
| `/api/stores/[id]` | PUT | admin | 更新门店 | ✅ |
| `/api/stores/[id]` | DELETE | admin | 停用（软删除 → suspended） | ✅ |
| `/api/stores/[id]` | PATCH | admin | 部分更新 | ✅ |

## 3. 核心逻辑

- **GET 列表**: 默认只返回 `active` 门店；`?all=true` 需 admin
- **POST**: Zod 校验 + 省市 DB 权威覆盖（非接受前端 province/city name）+ slug 自动生成
- **PUT**: 状态同步 + 活动日志写入
- **DELETE**: 软删除（suspended），非物理删除
- **PATCH**: 拒绝手动改 slug，`pending_review` 状态自动联动生成 slug

## 4. 响应格式

```typescript
{ success: boolean, data?: T, error?: string, details?: unknown }
```

## 5. 错误处理

- Prisma 7 Driver Adapter 错误形态：`{ code: "P2022", meta: { modelName, driverAdapterError: { cause } } }`
- Zod 校验失败返回 `details` 含字段错误

---

> 最后更新: 2026-06-22

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-10 | Claude Code | 门店 API route handlers 初始实现 | 完成 | — |
| 2026-06-14 | Claude Code | 地区/状态 API 增强 | 完成 | — |
| 2026-06-15 | Claude Code | Prisma 7 DriverAdapter 错误修复 | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | — |
