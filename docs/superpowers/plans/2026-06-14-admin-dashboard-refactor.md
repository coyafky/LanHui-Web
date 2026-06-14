# 设计文档：/admin 仪表盘重构

> 文档编号：ADR-004
> 日期：2026-06-14
> 状态：已批准
> 作者：Architect Agent
> 面向：Orchestrator / Coder Agents

---

## 1. 需求分析

### 1.1 真实意图（重构而非优化）

当前 `/admin` 首页是 4 个数字卡 + inline prisma.count 的「占位仪表盘」。重构目标是把它升级为 **数据驱动的运营视图**，让 admin/editor 角色能在一个屏幕里回答 5 个问题：

1. 我的网站有多少活跃门店和文章？（KPI）
2. 我的内容库存结构是否健康？（状态 × 分类分布）
3. 我的门店覆盖到哪里了？（省份分布）
4. 过去 30 天的访问趋势如何？（折线图）
5. 谁在最近做了什么操作？（操作日志）

**这不是「数字卡美化」，而是引入"运营仪表盘"产品形态**：从"看数字"升级到"看结构、看趋势、看行为"。

### 1.2 影响范围

| 层 | 改动 | 风险等级 |
|---|---|---|
| 数据库 | 新增 `ActivityLog` 模型 + 3 个复合索引 | 中（可回滚迁移） |
| 数据层 | 新增 `src/lib/admin-dashboard.ts`（封装所有查询） | 低（纯函数层） |
| 组件层 | 重写 RSC 页面 + 6 个新组件 | 低（局部重构） |
| API 层 | 4 个写接口接入 ActivityLog 钩子 | 中（副作用路径） |
| 测试层 | 新增 ≥4 个数据层单元测试 | 低（不破坏现有 61 个） |

**严格不触碰**：`Sidebar`、`/admin/layout.tsx`、`/admin/settings`、现有 `src/lib/data.ts`。

### 1.3 风险点（架构师视角）

| # | 风险 | 缓解策略 |
|---|---|---|
| R1 | ActivityLog 写入失败导致主 CRUD 返回 500 | 包在 try/catch，失败仅 console.warn，**绝不**影响业务响应 |
| R2 | 30 天 groupBy 查询在数据量增长后慢 | 复合索引 `(type, timestamp)` + 函数层 try/catch 返回空数组 |
| R3 | CC 趋势图的水合闪烁（hydration mismatch） | 用 `useEffect` 触发 fetch，初始骨架屏由 RSC 提供占位高度 |
| R4 | 6 个数据层函数中任一抛错导致整个仪表盘 500 | Promise.allSettled + 部分失败降级（badges 区域显示空态文案） |
| R5 | Migration 与未提交的 234 个 staged 文件冲突 | Schema 改动**必须**先 commit 当前批次，再起独立 migration |
| R6 | ActivityLog.metadata 为 Json 类型，TS 类型泄漏到 API | 用 zod schema 在写入前 narrow，序列化失败时降级为 `null` |

---

## 2. 架构设计

### 2.1 分层决策

```
┌─────────────────────────────────────────────┐
│  RSC: /admin/page.tsx (orchestrator)        │  ← 仅组合 + 错误边界
├─────────────────────────────────────────────┤
│  RSC 子组件 × 5                             │  ← 每个只接收已 typed 的 props
│  - DashboardKpiCards                        │
│  - DashboardContentHealth                   │
│  - DashboardStoreNetwork                    │
│  - DashboardRecentActivity                  │
│  - DashboardQuickActions                    │
├─────────────────────────────────────────────┤
│  CC: DashboardTrendChart (recharts)         │  ← fetch /api/analytics/stats
├─────────────────────────────────────────────┤
│  数据层: src/lib/admin-dashboard.ts         │  ← 全部 try/catch，函数式
│  - getKpiSnapshot()                         │
│  - getContentHealth()                       │
│  - getStoreNetwork()                        │
│  - getRecentActivity()                      │
│  - getDashboardSummary() (orchestrator)     │
├─────────────────────────────────────────────┤
│  Prisma + PostgreSQL + ActivityLog          │  ← 写操作钩子
└─────────────────────────────────────────────┘
```

### 2.2 关键架构决策（ADR）

#### ADR-004.1：RSC-first + 单 CC 边界

**决策**：6 个展示组件中 5 个为 RSC，仅 `DashboardTrendChart` 为 CC。

**理由**：
- 仪表盘 80% 内容是静态数字/列表/网格，SSR 即可渲染，无需 hydration
- recharts 需要 DOM API + 鼠标交互，必须 CC
- 单 CC 边界 = 单水合点，最小化 hydration mismatch 风险
- 与项目「RSC boundary：Server Component that needs client features → auxiliary `*Client.tsx` wrapper」模式一致

#### ADR-004.2：数据层 `Promise.allSettled` 编排

**决策**：`getDashboardSummary()` 并行调用 4 个子函数，**不**用 `Promise.all`。

**理由**：
- 单个数据源失败（如 ActivityLog 表尚未迁移）不能让整个 500
- `allSettled` 返回每个 promise 的状态，RSC 页面根据状态决定是否渲染该区块
- 与约束「数据层函数全部 try/catch，单点失败不让仪表盘 500」一致

#### ADR-004.3：ActivityLog 写入策略 — 同步 try/catch

**决策**：在 POST/PUT/DELETE 成功**之后**同步调用 `logActivity()`，失败仅 console.warn。

**理由**：
- ActivityLog 是审计/可观测性，不是核心业务路径
- 同步比异步队列简单，符合 YAGNI
- 失败可观测（console.warn）但不阻塞业务
- 不引入消息队列/异步 worker（与「不引入新依赖」一致）

#### ADR-004.4：趋势图走 API 而非直接 Prisma

**决策**：`DashboardTrendChart` fetch `/api/analytics/stats`，不直接查 prisma。

**理由**：
- `/api/analytics/stats` 已存在并测试通过，复用 > 重造
- CC 必须经过 HTTP，无法直接 import prisma
- 复用同一聚合逻辑，避免仪表盘与分析页不一致

#### ADR-004.5：复合索引三选三

| 模型 | 索引 | 覆盖查询 |
|---|---|---|
| Article | `(status, publishedAt)` | 内容健康 + 最近发布列表 |
| Store | `(isActive, provinceSlug)` | 活跃门店省份分布 |
| User | `(role, status)` | 编辑团队成员列表（未来） |

**未选**：(entity, entityId) 在 ActivityLog 上的索引——YAGNI。

### 2.3 数据流（写路径）

```
POST /api/articles
    │
    ├─→ zod 校验
    ├─→ prisma.article.create()
    ├─→ logActivity("article.create", { id, title })  ← try/catch
    └─→ return { success: true, data }
```

### 2.4 数据流（读路径）

```
GET /admin
    │
    └─→ RSC page.tsx
            │
            └─→ getDashboardSummary()
                    │
                    ├─→ getKpiSnapshot()         ─┐
                    ├─→ getContentHealth()        │ Promise.allSettled
                    ├─→ getStoreNetwork()         │
                    └─→ getRecentActivity()      ─┘
                            │
                            └─→ prisma.*  + try/catch 兜底

GET /admin (rendered HTML includes DashboardTrendChart skeleton)
    │
    └─→ CC: useEffect → fetch /api/analytics/stats?startDate=&endDate=&groupBy=day
            │
            └─→ recharts LineChart 渲染 30 天数据
```

---

## 3. 数据模型变更

### 3.1 新增模型：`ActivityLog`

```prisma
model ActivityLog {
  id        String   @id @default(cuid())
  actorId   String?
  actor     User?    @relation(fields: [actorId], references: [id], onDelete: SetNull)
  action    String   // "article.create" | "article.update" | "article.delete"
                     // "store.create"   | "store.update"   | "store.delete"
  entity    String   // "article" | "store"
  entityId  String
  metadata  Json?
  createdAt DateTime @default(now())

  @@index([actorId, createdAt])
  @@index([createdAt])
  @@map("activity_logs")
}
```

### 3.2 User 模型补丁

```prisma
model User {
  // ... 现有字段
  activities ActivityLog[]
}
```

### 3.3 复合索引（追加）

```prisma
model Article {
  @@index([status, publishedAt])
}

model Store {
  @@index([isActive, provinceSlug])
}

model User {
  @@index([role, status])
}
```

### 3.4 Migration 策略

```bash
npx prisma migrate dev --name add_activity_log_and_indexes
```

**关键约束**：
- 迁移文件必须**在 commit 当前 234 个 staged 文件之后**生成，避免冲突
- 迁移必须**幂等**：可重复执行不报错
- `Json?` 字段在 PostgreSQL 落地为 `JSONB`

---

## 4. 数据层接口契约

文件：`src/lib/admin-dashboard.ts`

### 4.1 类型定义

```typescript
export type DashboardKpi = {
  activeStores: number;
  publishedArticles: number;
  monthlyPageViews: number;
  monthlyReservations: number;
};

export type ContentHealth = {
  byStatus: Array<{ status: ArticleStatus; count: number }>;
  byCategory: Array<{ category: string; count: number }>;
  totalDrafts: number;
  totalPublished: number;
  totalArchived: number;
};

export type StoreNetwork = {
  byProvince: Array<{ provinceSlug: string; provinceLabel: string; count: number }>;
  totalActive: number;
  totalInactive: number;
};

export type RecentActivity = {
  items: Array<{
    id: string;
    action: string;
    entity: string;
    entityId: string;
    actorName: string | null;
    createdAt: Date;
  }>;
};

export type DashboardSummary = {
  kpi: DashboardKpi | null;
  contentHealth: ContentHealth | null;
  storeNetwork: StoreNetwork | null;
  recentActivity: RecentActivity | null;
  fetchedAt: string;
};

export type DashboardFetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; data: T | null };
```

### 4.2 函数签名

```typescript
export async function getKpiSnapshot(): Promise<DashboardFetchResult<DashboardKpi>>;
export async function getContentHealth(): Promise<DashboardFetchResult<ContentHealth>>;
export async function getStoreNetwork(): Promise<DashboardFetchResult<StoreNetwork>>;
export async function getRecentActivity(limit?: number): Promise<DashboardFetchResult<RecentActivity>>;
export async function getDashboardSummary(): Promise<DashboardSummary>;
export async function logActivity(input: {
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}): Promise<void>;
```

### 4.3 错误处理矩阵

| 函数 | 失败模式 | 返回值 | 上层处理 |
|---|---|---|---|
| `getKpiSnapshot` | prisma throw | `{ ok: false, error: msg, data: null }` | KPI 区块显示空态 |
| `getContentHealth` | 空表 | `{ ok: true, data: { byStatus: [], ... } }` | 正常显示 0 |
| `getStoreNetwork` | 索引未生效 | `{ ok: true, data: ... }` (warn) | 正常显示 |
| `getRecentActivity` | ActivityLog 表不存在 | `{ ok: false, error: msg, data: null }` | 区块显示空态 |
| `getDashboardSummary` | 单个失败 | `{ ...其他正常, 该项 null }` | 整体 200，部分空态 |
| `logActivity` | 任意失败 | `void` + console.warn | 不影响业务响应 |

---

## 5. 组件树

```
/admin/page.tsx [RSC]
│
├─ <WelcomeHeader /> [RSC inline]
│
├─ <DashboardKpiCards kpi={...} /> [RSC]
│     └─ <Card> × 4 [shadcn]
│
├─ <DashboardContentHealth data={...} /> [RSC]
│     ├─ <Card> 状态徽章
│     └─ <Card> Top 5 分类
│
├─ <DashboardStoreNetwork data={...} /> [RSC]
│     └─ 横向进度条列表
│
├─ <DashboardTrendChart /> [CC, 'use client']
│     ├─ useState: { data, loading, error }
│     ├─ useEffect → fetch /api/analytics/stats
│     └─ 骨架屏 fallback
│
├─ <DashboardRecentActivity data={...} /> [RSC]
│     └─ <Table> [shadcn] + 时间相对显示
│
└─ <DashboardQuickActions /> [RSC]
      ├─ 新建门店
      ├─ 新建文章
      ├─ 查看分析
      └─ 门店列表
```

---

## 6. 子任务列表

### Task 1: Schema 升级 + Migration `[foundation, sequential]`

**验收**：
- [ ] `npx prisma validate` 通过
- [ ] `npx prisma migrate dev` 生成 SQL 无报错
- [ ] `npx prisma generate` 成功
- [ ] 生成的 SQL 文件包含全部 3 个索引 + 1 个新表

### Task 2: 数据层类型 + logActivity + 测试

**验收**：
- [ ] 测试文件 ≥4 个 case
- [ ] `npx vitest run src/lib/admin-dashboard.test.ts` 全绿

### Task 3: 4 个数据查询函数实现

**验收**：
- [ ] 4 个函数全部实现且通过测试
- [ ] 测试覆盖：空表、正常、失败三态

### Task 4: getDashboardSummary 编排函数

**验收**：
- [ ] 函数返回结构与 RSC 页面 props 对齐
- [ ] 集成测试通过

### Task 5: RSC 页面重写

**验收**：
- [ ] dev server 验证 6 个区块渲染
- [ ] KPI 数字与 prisma.count 一致

### Task 6-10: 5 个 RSC 组件

**验收**：
- [ ] 每个组件 props 类型正确
- [ ] data 为 null 时显示空态
- [ ] 暗色主题一致

### Task 11: DashboardTrendChart CC 组件

**验收**：
- [ ] fetch 成功渲染 30 个数据点
- [ ] 失败显示重试按钮
- [ ] hydration mismatch 警告 0

### Task 12: API 写 ActivityLog 钩子

**验收**：
- [ ] 6 个写操作路径全部接入
- [ ] logActivity 失败不影响主响应

### Task 13: 回归验证

**验收**：
- [ ] `npx tsc --noEmit` 通过
- [ ] `npm run build` 通过
- [ ] `npx vitest run` 全绿
- [ ] dev server 验证 `/admin` 200

---

## 7. 依赖图与并行性

```
Task 1 → Task 2 → Task 3 → Task 4
                          ├─────────┐
                          ▼         ▼
                       Task 5    Task 12
                          │         │
                ┌────┬────┼────┐    │
                ▼    ▼    ▼    ▼    ▼
              T6   T7   T8   T9  T10  T11
              (KPI)(健康)(网络)(活动)(快捷)(chart)
                │    │    │    │    │
                └────┴────┴────┴────┘
                          ▼
                       Task 13
```

**并行机会**：Task 6/7/8/9/10 完全独立。

---

## 8. 验收标准（终态）

- [ ] `/admin` 渲染 6 个区块
- [ ] 4 个 KPI 数字与 `prisma.count` 一致
- [ ] 趋势图渲染 30 天日 PV
- [ ] ActivityLog 在 CRUD 后立即可见
- [ ] 迁移可回滚
- [ ] 数据层测试 ≥4 个 case
- [ ] `npx tsc --noEmit` 通过
- [ ] `npm run build` 通过
- [ ] `npx vitest run` 全绿
- [ ] dev server 验证 `/admin` 200

---

## 9. 显式 Not Doing

- ❌ 不实现 `/admin/settings`（保持 404）
- ❌ 不修改 `Sidebar.tsx`、`layout.tsx`、`src/lib/data.ts`
- ❌ 不引入新依赖
- ❌ 不实现 ActivityLog 反查 / 编辑 / 删除
- ❌ 不做趋势图周/月切换
- ❌ 不做 KPI vs 上月对比
- ❌ 不做快捷入口可配置化
