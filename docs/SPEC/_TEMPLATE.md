# SPEC: [模块名称]

> 功能规格说明书 — 定义模块的行为边界、数据合约和验收标准。
> 对应 PRD：`[链接到相关 PRD]`
> 实现状态：`[✅ 已完成 / 🔧 部分完成 / ⬜ 未开始 / ❌ 有已知问题]`

---

## 1. 职责范围

<!-- 一句话说明这个模块负责什么，不负责什么 -->

## 1.1 Skill 路由

<!-- 参考 docs/SPEC/_SKILL_ROUTING.md，只列本模块需要的 skill -->

| Skill | 是否使用 | 用途 |
|---|---|---|
| `next-best-practices` | 是/否 | Next 16 页面、路由、RSC、metadata、route handlers |
| `react-best-practices` | 是/否 | React 组件、性能、bundle、rerender |
| `web-design-engineer` | 是/否 | 原型、视觉方向、复杂 UI 状态、设计评审 |
| `prisma-data-ops` | 是/否 | Prisma、API、事务、分页、raw SQL |
| faker/MSW | 是/否 | fixtures、API mock、无 DB 组件测试 |

## 2. 路由 / 入口

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `...` | page / API / component | ... | ✅ / 🔧 / ⬜ |

## 3. 数据模型

### 3.1 类型定义

```typescript
// 关键类型，标注字段说明。AI 可直接复制使用。
interface Xxx {
  /** 字段说明 */
  field: string;
}
```

### 3.2 数据库表（如适用）

| 表名 | 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|------|
| `xxx` | `field` | `TEXT` | NOT NULL | ... |

### 3.3 Zod 校验（API 模块必填）

```typescript
// AI 可直接复制到 route handler 中使用
import { z } from "zod";

const XxxCreateSchema = z.object({
  field: z.string().min(1).max(100),
  // ... 全部字段
});
```

### 3.4 静态数据源

<!-- 如果是静态数据驱动的模块，说明数据文件位置和结构 -->

## 4. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| `Xxx` | `src/components/...` | 是/否 | ... |

## 5. 业务规则

<!-- AI 最常猜错的部分。用"当...时，系统必须..."句式，每条可独立验证。 -->

| # | 规则 | 触发条件 | 系统行为 |
|---|------|---------|---------|
| BR1 | ... | ... | ... |

## 6. 错误处理矩阵

<!-- 全栈 AI 需要知道每个错误码对应的 HTTP 状态和用户消息。 -->

| 错误码/场景 | HTTP | 消息 | details |
|-------------|------|------|---------|
| P2002 (unique) | 409 | "XXX 已存在" | `{ field }` |
| P2003 (FK) | 400 | "关联数据无效" | `{ field }` |
| P2025 (not found) | 404 | "XXX 不存在" | — |
| Zod validation | 400 | "请求数据无效" | `{ fields: { ... } }` |
| Unauthorized | 401 | "请先登录" | — |
| Forbidden | 403 | "无权限" | — |

## 7. 测试用例清单（TDD：实现前写出并看到失败）

<!-- 至少覆盖正常路径 + 3 个边界/错误。AC-ID 格式: <MODULE>-AC-<NN> -->

| AC-ID | 场景 | 输入 | 预期 | 类型 |
|-------|------|------|------|------|
| XXX-AC-01 | 正常路径 | ... | 200/201 + ... | happy |
| XXX-AC-02 | 边界输入 | ... | ... | edge |
| XXX-AC-03 | 错误输入 | ... | 4xx + ... | error |

## 8. API 合约（如适用）

### `METHOD /api/xxx`

- **权限**: ...
- **请求体**:
```json
{ "field": "value" }
```
- **成功响应**:
```json
{ "success": true, "data": { ... } }
```
- **失败响应**:
```json
{ "success": false, "error": "...", "details": { ... } }
```
- **错误码**: 400 / 401 / 403 / 404 / 409 / 500
- **限流**: ...

## 9. 依赖关系

<!-- 此模块依赖哪些其他模块，以及哪些模块依赖此模块 -->

## 10. 验收条件

- [ ] AC1: ...
- [ ] AC2: ...

## 11. 实现拆解

> 复杂模块请同时复制 `docs/SPEC/_IMPLEMENTATION_BREAKDOWN_TEMPLATE.md`，在本节只保留摘要和链接。

### 11.1 前端实现

- 页面/组件:
- 原型页/视觉参考:
- `web-design-engineer` 参考点:
- 响应式视口:

### 11.2 API 对接

- Route handler:
- 请求/响应 schema:
- 权限:
- 错误码:

### 11.3 后端/数据实现

- 静态数据:
- Prisma / migration:
- Seed / fallback:

### 11.4 测试实现

- Unit:
- API route:
- Component:
- E2E / browser:

## 12. 已知问题

- [ ] 问题描述（链接到 Issue 或 PRD）

## 13. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| YYYY-MM-DD | Claude Code | 模块初始实现 | 完成 | — |

---

## 验收追溯

<!-- 实现完成后填写。链接 SPEC 测试用例到实际测试文件。 -->

| AC-ID | SPEC § | 测试文件 | 测试用例 | 结果 |
|-------|--------|---------|---------|------|
| XXX-AC-01 | §7 | `xxx.test.ts` | "should xxx" | ✅ |

---

> 最后更新: 2026-07-07
