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
// 关键类型，标注字段说明
interface Xxx {
  /** 字段说明 */
  field: string;
}
```

### 3.2 数据库表（如适用）

| 表名 | 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|------|
| `xxx` | `field` | `TEXT` | NOT NULL | ... |

### 3.3 静态数据源

<!-- 如果是静态数据驱动的模块，说明数据文件位置和结构 -->

## 4. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| `Xxx` | `src/components/...` | 是/否 | ... |

## 5. API 合约（如适用）

### `METHOD /api/xxx`

- **权限**: ...
- **请求体**:
- **响应**: `{ success, data?, error?, details? }`
- **错误码**:
- **限流**: ...

## 6. 依赖关系

<!-- 此模块依赖哪些其他模块，以及哪些模块依赖此模块 -->

## 7. 验收条件

- [ ] AC1: ...
- [ ] AC2: ...

## 8. 实现拆解

> 复杂模块请同时复制 `docs/SPEC/_IMPLEMENTATION_BREAKDOWN_TEMPLATE.md`，在本节只保留摘要和链接。

### 8.1 前端实现

- 页面/组件:
- 原型页/视觉参考:
- `web-design-engineer` 参考点:
- 响应式视口:

### 8.2 API 对接

- Route handler:
- 请求/响应 schema:
- 权限:
- 错误码:

### 8.3 后端/数据实现

- 静态数据:
- Prisma / migration:
- Seed / fallback:

### 8.4 测试实现

- Unit:
- API route:
- Component:
- E2E / browser:

## 9. 已知问题

- [ ] 问题描述（链接到 Issue 或 PRD）

## 10. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| YYYY-MM-DD | Claude Code | 模块初始实现 | 完成 | — |

---

> 最后更新: YYYY-MM-DD
