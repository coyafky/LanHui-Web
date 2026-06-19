# [ADMIN_FEATURE]_PRD_<YYYY-MM-DD>.md — 后台模板

> 用于 `/admin` 路由组下页面的子 PRD 模板。
>
> **8 节标准结构** + **权限矩阵 / ActivityLog / force-dynamic** 专属

---

## 1. 概述

**页面**: `/admin/<feature>` (例: `/admin/articles` 或 `/admin/analytics`)
**类型**: 后台 CMS (force-dynamic, auth 守卫)
**优先级**: P0 / P1 / P2
**Owner**: 冯科雅
**版本**: v0 / v1
**最后更新**: YYYY-MM-DD

### 1.1 目标

1-2 句话说明此后台页面的目标。

### 1.2 权限

- **可见角色**: `admin` / `editor` / 公开(仅 login)
- **写权限**: `admin` only / `editor+` / none

### 1.3 范围

- ✅ 包含: ...
- ❌ 不包含: ...

---

## 2. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|
| admin | 想看本月数据 | 看到 KPI 卡 (PV / 预约 / 文章数 / 门店数) | P0 |
| editor | 想发布新文章 | 进入文章列表 → 新建 → 富文本编辑 → 发布 | P0 |
| admin | 想清理测试数据 | 批量选择 → 删除 / 下架 | P1 |

---

## 3. 功能清单

| # | 功能 | 优先级 | 状态 |
|---|---|---|---|
| F1 | 列表 + 分页 | P0 | ✅ |
| F2 | 搜索 / 筛选 / 排序 | P0 | ⚪ |
| F3 | 新建 / 编辑 / 删除 | P0 | ⚪ |
| F4 | 状态机(draft/published/archived) | P0 | ⚪ |
| F5 | 批量操作 | P1 | ⚪ |
| F6 | ActivityLog 记录 | P0 | ⚪ |
| F7 | 权限校验(可见+可写) | P0 | ⚪ |

---

## 4. UI / 交互

### 4.1 视觉规范

- **主色**: orange-500 (CTA) / zinc-950 (背景)
- **侧边栏**: 深色(zinc-900)+ 圆角图标
- **KPI 卡**: 4 横排,数字大字 + 标签小字
- **表格**: 行内操作链接 / kebab 菜单

### 4.2 组件清单

| 组件 | 路径 | 类型 | 说明 |
|---|---|---|---|
| `AdminLayout` | `src/app/admin/(dashboard)/layout.tsx` | RSC | 侧边栏 + 顶部 + 内容区 |
| `DataTable` | `src/components/admin/DataTable.tsx` | CC | 通用数据表(分页/筛选) |
| `KpiCard` | `src/components/admin/KpiCard.tsx` | RSC | KPI 卡 |
| `<Feature>Form` | `src/components/admin/<feature>/Form.tsx` | CC | 表单 |

### 4.3 三视口响应式

| 视口 | 行为 |
|---|---|
| Desktop 1440 | 侧边栏固定,内容区 4 列 KPI |
| Tablet 768 | 侧边栏可折叠,KPI 2×2 |
| Mobile 390 | 侧边栏变汉堡菜单,KPI 单列,表格横向滚动 |

### 4.4 可访问性

- 语义化 HTML (`<nav>`/`<main>`/`<table>`)
- 键盘导航 (Tab 顺序)
- 焦点管理(Modal / Dropdown)
- 颜色对比度 ≥ 4.5:1

---

## 5. 数据模型

### 5.1 主表

```
DB: <Table>     # 例: Article / Store / AnalyticsEvent
schema: prisma/schema.prisma
```

### 5.2 ActivityLog 记录

每个写操作 (POST/PUT/DELETE) 必须在事务中追加 ActivityLog:

```ts
await prisma.$transaction([
  prisma.<table>.update({ where: { id }, data }),
  prisma.activityLog.create({
    data: {
      actorId: session.user.id,
      action: "update",
      entity: "<table>",
      entityId: id,
      metadata: { diff, ip: req.ip },
    },
  }),
]);
```

### 5.3 状态机 (Article 示意)

```
draft ──publish──> published ──archive──> archived
  ^                                          │
  └──────────────── restore ─────────────────┘
```

---

## 6. API 接口

| Method | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/<resource>` | 公开 (草稿过滤) | 列表 |
| GET | `/api/<resource>/[id]` | 公开 | 详情 |
| POST | `/api/<resource>` | editor+ | 创建 |
| PUT | `/api/<resource>/[id]` | editor+ (admin only for some) | 更新 |
| DELETE | `/api/<resource>/[id]` | admin | 删除 |

**统一响应格式**:
```ts
{ success: boolean, data?: T, error?: string, details?: any }
```

**写操作必做**:
1. `auth()` 校验 session
2. 角色检查 (admin/editor)
3. Zod 输入校验
4. Prisma 事务 + ActivityLog
5. `revalidatePath('/admin/<route>')`

---

## 7. 验收标准 (DoD)

### 7.1 功能

- [ ] 列表加载 + 分页正确
- [ ] 搜索 / 筛选 / 排序生效
- [ ] CRUD 流程完整(创建→编辑→删除)
- [ ] 状态机正确(draft→published→archived)
- [ ] 批量操作可执行
- [ ] 移动端表格可滚动

### 7.2 权限

- [ ] 未登录访问 → 重定向 `/admin/login`
- [ ] editor 看不到 admin-only 按钮
- [ ] API 写操作被 server-side 二次校验

### 7.3 质量门

- [ ] `npx tsc --noEmit` 通过
- [ ] `npm run build` 通过
- [ ] Playwright e2e(含登录/CRUD)通过
- [ ] 三视口截图 OK

### 7.4 数据卫生

- [ ] 写操作有 ActivityLog
- [ ] 删除前确认 modal
- [ ] 状态切换有审计记录

---

## 8. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| YYYY-MM-DD | v0 | 初稿 | Coya |
| YYYY-MM-DD | v1 | 完整规格 + 权限矩阵 + 状态机 | Coya |

---

## 附录 A: 后台已知 P0/P1 (2026-06-19 审计)

| ID | 问题 |
|---|---|
| P0-6 | 22 条测试门店污染前台 |
| P0-7 | `/news/[slug]` 全部 404 (item.content) |
| P1-7~13 | 数据失衡 + 埋点失效 + 测试残留 |

完整: [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §12](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md)

## 附录 B: 权限矩阵

| 操作 | admin | editor |
|---|---|---|
| 查看 Dashboard | ✅ | ✅ |
| 文章 CRUD | ✅ | ✅ |
| 删除文章 | ✅ | ❌ |
| 门店 CRUD | ✅ | ❌ |
| 数据分析 | ✅ | ❌ |
| 用户管理 | ✅ | ❌ |

## 附录 C: 相关文档

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §4.2 / §5.3
- [../../src/lib/auth.ts](../../src/lib/auth.ts) — NextAuth 配置
- [../../src/types/next-auth.d.ts](../../src/types/next-auth.d.ts) — 角色类型
- [../../database/SCHEMA.md](../../database/SCHEMA.md) — User / Article / Store / ActivityLog
