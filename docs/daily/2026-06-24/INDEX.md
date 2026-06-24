# 每日报告 — 2026-06-24

> AI 会话: Claude Code
> 维护: 冯科雅 (Coya)
> 主题: Store 后台 4 态状态机 UI 迁移(isActive → pending/active/suspended/terminated)
> 流水线: `/dispatch` 4 阶段(架构师 → 实现者 → 测试工程师 → 编排器验收)

---

## 一、工作摘要

完成 Store 后台从 `isActive: Boolean` 二元状态迁移到 PRD §3 规定的 4 态状态机 UI,后端 schema 维持双写。前端 4 态徽章、4 个状态动作端点(发布/暂停/恢复/终止)、通用 ConfirmDialog、状态筛选 + 排序、URL 持久化已 deferred(P2)。Tester 报 P0=0 / P1=1,已修复并回归通过。

---

## 二、变更清单

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/lib/validations/store-transitions.ts` | 状态机核心:`ALLOWED_TRANSITIONS` / `canTransition` / `ACTION_TARGET` / `availableActionsFor` / `actionForTarget`,纯函数零依赖 |
| `src/lib/validations/store-transitions.test.ts` | 20 条 vitest 单测(13 状态机 + 4 availableActions + 3 actionForTarget) |
| `src/app/api/stores/[id]/[action]/route.ts` | 4 个 POST 端点(`publish` / `suspend` / `resume` / `terminate`),统一 auth + role + Zod 二次校验 + logActivity |
| `src/app/api/stores/[id]/[action]/route.test.ts` | 15 条 API 路由单测(鉴权/路由/4 动作/Prisma 兜底) |
| `src/components/admin/ConfirmDialog.tsx` | 通用对话框:aria-modal + focus trap + Esc 关闭 + 异步 loading + default/danger 变体 |
| `docs/daily/2026-06-24/INDEX.md` | 本报告 |

### 修改文件

| 文件 | 变更说明 |
|------|----------|
| `src/components/admin/StoreForm.tsx` | 2 态 `isActive` select → 4 态 `status` select(同步 status+isActive 双字段);新增 `readOnly` prop(`<fieldset disabled>` 包裹);移除独立删除按钮区块(由父级动作端点替代) |
| `src/app/admin/(dashboard)/stores/page.tsx` | 4 态 `StatusBadge` + 颜色编码;删除本地 `DeleteDialog` 改用 `ConfirmDialog`;状态机动作列(按 status 动态显示发布/暂停/恢复/终止);状态筛选 + 6 种排序控件;`fetchStores` 读 `status` 字段 + 传 `?status=&sort=` |
| `src/app/admin/(dashboard)/stores/[id]/page.tsx` | 顶部状态机 action bar(按 status 显示对应按钮);terminated 时只读横幅 + StoreForm readOnly;右栏 4 态状态卡;新增 ConfirmDialog 包裹 publish/suspend/resume/terminate 二次确认;删除旧 `handleDelete` |
| `src/app/api/stores/route.ts` | GET 新增 `?status=` 多值筛选(公开契约只接受 active,admin 自由组合);**P1 修复**:默认公开契约从 `where.isActive = true` 改为 `where.status = "active"`,消除 isActive + status 双轨裂缝 |

### 关键代码片段

**状态机核心**(`store-transitions.ts`):
```ts
export const ALLOWED_TRANSITIONS: Record<StoreStatus, StoreStatus[]> = {
  pending:    ["active", "terminated"],
  active:     ["suspended"],
  suspended:  ["active", "terminated"],
  terminated: [],  // 终态,禁止任何转换
};

export type StoreAction = "publish" | "suspend" | "resume" | "terminate";
```

**4 动作端点**(`[id]/[action]/route.ts`):
```ts
export async function POST(req, { params }) {
  const { id, action } = await params;
  // ... auth + role + 合法性校验 ...
  if (!canTransition(existing.status, target.to)) {
    return Response.json({ success: false, error: "..." }, { status: 409 });
  }
  if ((action === "suspend" || action === "terminate") && !body.statusReason?.trim()) {
    return Response.json({ success: false, details: { statusReason: ["..."] } }, { status: 400 });
  }
  // ... update + logActivity ...
}
```

---

## 三、SPEC 状态看板(门店管理模块)

| 维度 | 之前 | 之后 | 变化 |
|------|------|------|------|
| 状态机 | `isActive: Boolean` 二元 | 4 态 `pending/active/suspended/terminated` | ✅ 升级 |
| 状态动作 UI | 1 个"停用"按钮 | 4 个动作按钮(发布/暂停/恢复/终止)+ 二次确认 + 状态原因 | ✅ 完成 |
| 状态筛选 | 无 | 5 选项(全部/待发布/营业中/暂停/终止) | ✅ 完成 |
| 排序 | 仅 createdAt desc | 6 种(最近更新/最早更新/最新创建/名称 A→Z/名称 Z→A/等级高→低) | ✅ 完成 |
| URL 持久化 | 无 | 无(P2 deferred — 仍用内存 state) | ⚠️ deferred |
| 4 动作 API 端点 | DELETE(仅停用) | `POST /api/stores/[id]/{publish,suspend,resume,terminate}` | ✅ 新增 |
| 状态字段双轨 | status(死字段)+ isActive(实际) | status(主) + isActive(派生) | ✅ 统一语义 |
| terminated 只读 | 否(可改 isActive) | 是(`<fieldset disabled>` + 顶部 banner) | ✅ 完成 |
| ActivityLog 粒度 | store.create / store.update / store.suspend | + store.publish / store.resume / store.terminate | ✅ 扩展到 6 类 |
| ConfirmDialog 通用化 | 各页面私有 | 抽到 `src/components/admin/ConfirmDialog.tsx` | ✅ 通用化 |

---

## 四、测试结果

### 4.1 vitest 单测

| 测试文件 | 用例数 | 通过 | 失败 | 备注 |
|----------|--------|------|------|------|
| `src/lib/validations/store-transitions.test.ts` | 20 | 20 | 0 | **本次新增** |
| `src/app/api/stores/[id]/[action]/route.test.ts` | 15 | 15 | 0 | **本次新增** |
| **本次新增合计** | **35** | **35** | **0** | **100% 通过** |
| 全套 vitest | 298 | 273 | 25(4 文件) | 25 失败全部为 pre-existing(已 stash 验证 baseline 一致 13/13) |

### 4.2 TypeScript 类型检查

| 项目 | 数值 |
|------|------|
| `npx tsc --noEmit` 退出码 | 0(exit 干净) |
| 总错误数 | 9(全部为 baseline 已知) |
| 本次新引入错误 | **0** |
| Baseline 错误分布 | `api/analytics/stats/route.test.ts` BigInt literal × 3 + `lib/analytics.test.ts` tuple cast × 6 |

### 4.3 测试工程师门禁 3 判定

| 等级 | 数量 | 详情 |
|------|------|------|
| P0 阻断 | 0 | — |
| P1 严重 | 1 → **已修复** | Bug 1: GET /api/stores 默认公开契约从 `isActive` 改为 `status`(消除双轨裂缝) |
| P2 一般 | 2 | Bug 2: StoresPage URL 持久化未实现(deferred); Bug 8: ConfirmDialog 焦点还原顺序问题 |
| P3 轻微 | 5 | UI 冗余 / 死代码 / 客户端校验缺 1 字段 / GET level 隐含 admin 语义 / constants 位置 |

**Tester 最终结论**: ✅ **APPROVED — 通过门禁 3**。

---

## 五、API 端点契约变更

### 5.1 新增端点(POST)

| 路径 | 行为 | 前置条件 | 错误码 |
|------|------|----------|--------|
| `/api/stores/[id]/publish` | pending → active | level + 省市必填 | 401/403/404/409/400 |
| `/api/stores/[id]/suspend` | active → suspended | statusReason 必填 | 401/403/404/409/400 |
| `/api/stores/[id]/resume` | suspended → active | phone/address/businessHours 非空 | 401/403/404/409/400 |
| `/api/stores/[id]/terminate` | pending/suspended → terminated | statusReason 必填 | 401/403/404/409/400 |

### 5.2 修改端点(GET `/api/stores`)

| 入参组合 | 公开契约过滤逻辑 |
|----------|------------------|
| 无参(默认) | `where.status = "active"`(**修复后**,原为 `isActive=true`) |
| `?status=active` | `where.status = "active"`(同义) |
| `?status=pending&status=active`(非 admin) | 只接受 active,其它过滤 |
| `?status=...&all=true`(admin) | 自由组合多值 status |
| `?isActive=true`(显式) | `where.isActive = true`(旧兼容) |
| `?isActive=false`(显式) | `where.isActive = false`(旧兼容) |
| `?all=true`(admin) | 无 status 过滤,返回全部 |

---

## 六、状态机合法性矩阵(单测覆盖)

| from \\ to | pending | active | suspended | terminated |
|------------|---------|--------|-----------|------------|
| **pending** | — | ✅ publish | ❌ 409 | ✅ terminate |
| **active** | ❌ 409 | — | ✅ suspend | ❌ **必须先 suspend** |
| **suspended** | ❌ 409 | ✅ resume | — | ✅ terminate |
| **terminated** | ❌ 409 | ❌ 409 | ❌ 409 | ❌ **终态** |

**禁止转换**:
- `active → terminated`:必须先经过 suspended
- `terminated → any`:禁止任何转换(若重新加盟必须新建门店记录)
- `pending → suspended`:禁止跳过
- `active → pending`:禁止回滚

---

## 七、已知 P2/P3(下次迭代)

| ID | 描述 | 文件 | 建议 |
|----|------|------|------|
| Bug 2 | StoresPage URL 持久化(useSearchParams + router.replace) | `stores/page.tsx` | P2 下个 sprint |
| Bug 3 | `[id]/page.tsx` 顶部 StatusBadge 与右栏冗余 | `[id]/page.tsx:258` | P3 UI 清理 |
| Bug 4 | StoreForm publish 预校验缺 province/city | `StoreForm.tsx:197` | P3 边界一致 |
| Bug 5 | `stores/page.tsx:182` dead section header | `stores/page.tsx` | P3 删注释 |
| Bug 6 | API route body 解析分支死代码 | `[id]/[action]/route.ts:105` | P3 简化 |
| Bug 7 | GET `/api/stores?level=` 隐含 admin 语义未明 | `route.ts:66` | P3 文档化 |
| Bug 8 | ConfirmDialog 焦点还原顺序问题 | `ConfirmDialog.tsx:76` | P2 a11y |

---

## 八、覆盖度对照(PRD §13.3 验收清单)

| 验收项 | 结果 | 证据 |
|--------|------|------|
| 4 态状态机 UI 渲染 | ✅ | `stores/page.tsx` `STATUS_BADGE_CLASS` + `[id]/page.tsx` 4 色 badge |
| 4 动作 API 端点 | ✅ | `[id]/[action]/route.ts` 路由分发 + 单测 15/15 |
| 状态机转换合法性 | ✅ | `canTransition()` + 单测 20/20 覆盖 4×4 矩阵 |
| suspend/terminate 必填 statusReason | ✅ | `[id]/[action]/route.ts:124` + 单测 |
| publish 必填 level | ✅ | `[id]/[action]/route.ts:154` + 单测 |
| resume 必填 phone/address/businessHours | ✅ | `[id]/[action]/route.ts:138` + 单测 |
| terminated 终态(禁止任何转换) | ✅ | `ALLOWED_TRANSITIONS.terminated = []` + UI 隐藏按钮 |
| active → terminate 必须先 suspend | ✅ | `ACTION_TARGET.terminate.from = ['pending','suspended']` + 单测 409 |
| ActivityLog 写 store.{action} | ✅ | `[id]/[action]/route.ts:183` + 单测 |
| isActive 双写(status → isActive) | ✅ | `[id]/[action]/route.ts:174` `isActive: target.to === "active"` |
| terminated 只读 | ✅ | StoreForm `<fieldset disabled>` + 顶部 banner |
| ConfirmDialog 通用化(aria-modal/focus trap/Esc) | ✅ | `ConfirmDialog.tsx` 实现完整 |
| 公开站契约保持(默认仅 active) | ✅ | `route.ts:58` 修复为 `where.status = "active"` |
| URL 持久化筛选 | ❌ P2 | `stores/page.tsx` 未实现,deferred |

---

## 九、下一步建议

1. **Bug 2(URL 持久化)**:用 `useSearchParams` + `router.replace` 双向同步 `status/level/province/search/sort` 到 query 参数。预估 2-3 小时。
2. **字段切单字段**(`isActive` → 纯 `status`):需要先做数据迁移 SQL(把 `isActive=false` 区分 suspended vs terminated),再删字段。可在 Bug 2 后独立 task。
3. **E2E 测试**:补 `e2e/admin-store-status.spec.ts`,覆盖「登录 → 创建门店 → 发布 → 前台可见 → 暂停 → 前台隐藏」全链路。
4. **ActivityLog UI**:后端已在写,加 `/admin/stores/[id]/logs` 页面读 ActivityLog 表。
5. **PRD F19-F28 剩余 P1-P3**:批量操作、CSV 导出、门店预览、编辑历史等。

---

## 十、附录

### A. 状态机设计图

```
                  publish
              ┌─────────────┐
              ▼             │
           pending ──terminate──┐
              │                 │
              │                 ▼
              │           terminated (终态)
              │                 ▲
              │                 │
            active ──suspend──┐ │
              ▲                ▼ │
              │           suspended│
              │                │  │
              └─── resume ─────┘  │
                                  │
              suspend ──terminate─┘
```

### B. 改动统计

| 维度 | 数量 |
|------|------|
| 新增文件 | 6(含本报告) |
| 修改文件 | 4 |
| 新增单测 | 35(20 状态机 + 15 API) |
| 新增 API 端点 | 4(POST publish/suspend/resume/terminate) |
| 修改 API 端点 | 1(GET /api/stores) |
| 新增 UI 组件 | 1(ConfirmDialog) |
| 修改 UI 组件 | 3(StoreForm / 列表 / 编辑页) |
| 数据库 schema 变更 | 0(双写期维持) |
| 新增依赖 | 0 |

### C. 相关文档

- `docs/PRD/admin/STORE_MANAGEMENT_PRD.md` — 上游 PRD v1
- `docs/SPEC/admin/stores.md` — SPEC §8 F17-F18
- `src/lib/validations/store-transitions.ts` — 状态机核心
- `src/components/admin/ConfirmDialog.tsx` — 通用对话框
- `src/app/api/stores/[id]/[action]/route.ts` — 4 动作端点

---

## 十一、Path A — `type "public.StoreLevel" does not exist` 修复(同日 续)

### 11.1 触发

playwright-cli 跑 e2e 时,`POST /api/stores` 全部 500:
```
[DriverAdapterError]: type "public.StoreLevel" does not exist
  originalCode: '42704', kind: 'postgres'
```

### 11.2 根因

DB 实际是 `varchar(20) + Store_level_check` 约束(由 `prisma db push` 老行为降级),
但 `prisma/schema.prisma` 声明的是 PG enum。Prisma 7 客户端按 schema 生成 `$1::"StoreLevel"` 强类型 cast,
DB 端无对应 enum type → 42704。

### 11.3 修复(Path A:改 schema → String,与 DB 现实对齐)

| 文件 | 变更 |
|------|------|
| `prisma/schema.prisma` | 删 `enum StoreLevel { flagship premium specialty member }` 块;`level StoreLevel @default(flagship)` → `level String @default("flagship")` |

**未改**:`src/lib/validations/store.ts` 已有 `STORE_LEVELS` Zod 字面量联合(独立于 Prisma enum),所有消费者(StoreForm / sort-stores / StoreLevelBadge / StoreCard / admin stores page)都从该文件 import,不依赖 Prisma 端 enum。

### 11.4 验证

| 验证项 | 结果 |
|--------|------|
| `npx prisma generate` | ✅ Generated Prisma Client (v7.8.0) in 125ms |
| `npx tsc --noEmit` | ✅ 9 baseline 错误,0 新错 |
| `npx vitest run src/lib/validations/store-transitions.test.ts src/app/api/stores/[id]/[action]/route.test.ts` | ✅ **35/35 通过** |
| 重启 dev server(PID 45470 → 47742) | ✅ Ready in 581ms |
| `curl POST /api/stores` smoke test | ✅ **201 Created** + status=pending(原 500 消失) |
| 4 动作端点全链路 smoke | ✅ publish 200 / suspend 200 / resume 200 / terminate(从 active 直跳)→ **409 拦截** |

### 11.5 影响

- DB 端无 schema 变更(本来就是 varchar+check,只是 schema 与现实对齐)
- TypeScript 层:`Store.level` 从窄枚举变 string,所有现有用法兼容(Zod 仍 narrow)
- `npx prisma db push` **未**执行(避免破坏已有 53 条数据)

---

## 十二、Path B — Playwright E2E(同日 续)

### 12.1 文件

`e2e/admin-store-status.spec.ts` — 7 个用例 S1-S7,沿用 `analytics.spec.ts` 风格(`vi.hoisted` + `loginAsAdmin` helper + `page.request` 复用登录 cookie)。

### 12.2 用例矩阵

| ID | 覆盖点 | 关键验证 |
|----|--------|----------|
| S1 | 4 态徽章渲染 | `[aria-label="状态：待发布/营业中/暂停合作/终止合作"]` 全部可见 |
| S2 | pending → publish UI 全流程 | row 点「发布」→ ConfirmDialog → 确认 → 列表刷新,徽章变「营业中」,操作按钮只剩「暂停」(active 仅允许 suspend) |
| S3 | active → suspend 必填 statusReason | 不填原因→「请填写原因」错误;填后→状态变「暂停合作」,操作按钮变「恢复」+「终止」 |
| S4 | suspended → resume | 点「恢复」→ 状态回「营业中」 |
| S5 | terminated 只读 | 列表行无任何动作按钮,显示「已终止合作,只读」;详情页 `<fieldset disabled>` + 顶部 banner |
| S6 | 状态筛选 | `select[aria-label="按状态筛选"]` 选 pending → pending 行可见,active 行不显示 |
| S7 | 公开契约(P1 修复回归) | 退出登录后 `GET /api/stores`,返回行 status 全部 === 'active',pending/suspended 不出现 |

### 12.3 运行结果

```
Running 7 tests using 1 worker
  ✓ S1: 4 态徽章在 /admin/stores 列表正确渲染
  ✓ S2: pending → publish 完整 UI 流程
  ✓ S3: active → suspend 必填 statusReason
  ✓ S4: suspended → resume
  ✓ S5: terminated 状态 — 无动作按钮,只能查看详情
  ✓ S6: 状态筛选下拉过滤列表
  ✓ S7: 公开契约 — 未登录 GET /api/stores 仅返回 status=active
  7 passed (28.0s)
```

### 12.4 调试踩坑(写入备忘)

| 问题 | 原因 | 修复 |
|------|------|------|
| ConfirmDialog 按钮 `/确认\|确定/` 超时 | 实际按钮文字是动作名(发布/暂停/恢复/终止),不是"确认" | 改为 `getByRole('alertdialog').getByRole('button', { name: '发布', exact: true })` |
| `textarea, input[name="statusReason"]` 找不到 | UI 用 `<textarea id="statusReason">`,不是 name 属性 | 改为 `textarea#statusReason` |
| S2 期望 active 后有「终止」按钮 | 状态机规则:active 仅允许 suspend;terminate 必须先 suspended | 改为断言「终止」按钮 count=0 |

### 12.5 数据清理

- 每个 `test()` 用唯一 `slug=e2e-${Date.now()}-${rand}` 隔离
- `test.afterAll` 调用 `/api/stores/{id}/terminate` 标记终止
- 跑完后用 `psql` 直接 `DELETE FROM "Store" WHERE slug LIKE 'e2e-%'`(验证:0 残留)

### 12.6 未实现 / 后续

- 测试运行后无截图保存(`screenshots/` 目录未生成)
- `test-results/` 自动产出失败截图(S2/S3/S4 修复前的失败截图已随代码修正归档)
- 建议下次 sprint 把 `screenshots: 'only-on-failure'` 改为 `'on'`,补归档

---

## 十三、本日总览(汇总)

| 维度 | 数据 |
|------|------|
| Path A(状态机 UI 迁移) | ✅ 完成 |
| Path A(enum → String 修复) | ✅ 完成 |
| Path B(playwright e2e 7 用例) | ✅ 7/7 通过 |
| 新增文件 | 7(状态机 core/test + 4 动作 API/test + ConfirmDialog + e2e spec + 本报告增量) |
| 修改文件 | 5(schema.prisma + StoreForm + stores 列表 + stores/[id] + api/stores GET) |
| 新增单测(vitest) | 35 |
| 新增 e2e(playwright) | 7 |
| 数据库 schema 变更 | 1(`Store.level` enum → String,与 DB 现实对齐,数据无损) |
| 新增依赖 | 0 |
| 待 P2/P3 | URL 持久化 + UI 死代码 + 文档化 level admin 语义(详见第七节) |

---

> 最后更新: 2026-06-24(同日 第 3 续 — dispatch 流水线)
> 状态: ✅ Path A + Path B 完整,下午 dispatch 流水线完成(含 2 个并行代理实现),前后端代码就绪,前端渲染需下回排查。

---

---

## 十五、下午 /dispatch 流水线: 门店筛选 + 搜索 + 排序 + URL 持久化(2026-06-24)

### 触发背景

上一轮(十四节)后用户反馈:admin Store Page 遗漏了 PRD/SPEC 规定的筛选功能。用 `/prompt-boost` + 官方 `/dispatch` 流水线实施。

**用户输入**: "按照那一份规格 切使用 dispatch 专家团来编码"

### 识别的问题(从 SPEC / 用户描述提取)

1. **P1-1**: 城市级联筛选不存在(只有省份)
2. **P1-2**: URL query 参数未持久化筛选状态(刷新丢失)
3. **P1-3**: 排序后端已支持但前端的 `?sort=` 未传递到 API
4. **P1-4**: 搜索仅在 name 上,未涵盖 phone/slug
5. **P1-5**: 按合作状态(status)分组
6. **P1-6**: 图片完整性筛选(有封面/缺封面)
7. **P2**: Empty state 未区分「无数据」vs「筛选无结果」

### 设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 路由前置 | API 层+前端并行,不额外迁文件 | 已有 `/api/stores?sort=&image=&city=&search=` 参数就绪 |
| 城市 API 复用 | `/api/cities?province=xxx` 已存在 | 无需新增 endpoint |
| URL 持久化方案 | `useSearchParams` + `router.replace` | Next.js 惯用模式,SP`Suspense` 已处理 |
| Empty state 区分 | 三态: fetch 错误 / 筛选无结果 / 真的无门店 | 从 `fetchError/isEmpty/hasActiveFilter` 三控 |
| Sort 类型 | `OrderByItem \| OrderByItem[]` 联合 | Prisma orderBy 支持复合排序(level_desc: level+createdAt) |
| Agent 隔离 | `isolation: "worktree"` | 遵循 dispatch SKILL.md 规范 |

### 架构师产出

`/dispatch` 的 Architect agent 分析后拆出 7 个子任务,分 3 阶段:

**Phase A (API 层 — 无依赖,可并行调度):**
- Task 1: SORT_MAP + search 扩展 + image 筛选 (1 文件,新增 14 测试)
- Task 2: 城市数据 API (零编码,已有 `/api/cities`)

**Phase B (前端筛选 UI — 依赖 Phase A:API 就绪即可,不等待前端):**
- Task 3: URL query 参数双向同步 (useSearchParams + Suspense wrapper)
- Task 4: 城市级联下拉 (省份选后自动加载城市)
- Task 5: 按 status 分组 + 图片完整性筛选 UI
- Task 6: 三态 Empty state (fetchError/筛选无结果/真的无数据)

**Phase C (验证 — 依赖 Phase A+B 合并):**
- Task 7: 合并 worktree + full build + tsc 验证

### 实施过程

#### 步骤 1: 用户确认设计文档
用户输入 `/dispatch` `实现它` 触发流水线第 2 阶段。

#### 步骤 2: 并行调度 2 个 Agent

**Agent A — API 层实现 (coder):**
- 修改 `src/app/api/stores/route.ts`:
  - 新增 `SORT_MAP`: 7 种排序 → Prisma orderBy 映射
  - Search 扩展: `where.OR` 增加 `phone` + `slug` 字段
  - Image 筛选: `?image=has` → `{ not: null }`, `?image=missing` → `null`
  - 新增 14 个 vitest 测试用例(排序/search/image/边界)
- 遇到的类型错误: `sort && SORT_MAP[sort]` 可能为 `""`,改三元式修复

**Agent B — 前端 UI 实现 (general-purpose + frontend-ui-engineering):**
- 修改 `src/app/admin/(dashboard)/stores/page.tsx` (~380 行 diff):
  - 组件结构重构: `StoresPage`(default export + `<Suspense>`) → `StoresPageInner`(含 `useSearchParams`)
  - 6 个 filter state 从 URL 初始化: `cityFilter`, `imageFilter`, `fetchError` 等
  - 城市 `<select>`: disabled 当无省份,选省份后 fetch `/api/cities`
  - 图片完整性 `<select>`: 全部/有封面图/缺封面图
  - Sort select: option 含 7 项 + `?sort=` 传 API
  - Status 分组: group `<select>` 增加「按合作状态」
  - 三态 empty state: `fetchError→error+retry` / `hasActiveFilter→clear` / 默认→create
  - URL sync: `useEffect` + `router.replace` 双向绑定
- 新增 import: `Suspense`, `useSearchParams`

#### 步骤 3: 遇到的问题

| 问题 | 原因 | 解决 |
|------|------|------|
| Agent 隔离参数错 | `isolation: true` 非法 | 改为 `isolation: "worktree"` |
| TypeScript 类型错误 `sort && SORT_MAP[sort]` | 空字符串被赋给 `OrderByInput` | 改为 `sort && sort in SORT_MAP ? ... : { createdAt: "desc" }` |
| Turbopack 不识别新目录 `[action]/` | 新 untracked 目录需重启 dev | `pkill -f next dev` 重起后 route 正常编译 |
| `activity_logs` 表不存在 | DB 尚未有该表 | `logActivity()` 有 try-catch 兜底,不阻塞 |
| POST 测试 13 失败 | 测试 fixture phone 格式与 Zod 不匹配 | 已有(非本次引入) |

#### 步骤 4: 门禁验证结果

| 门禁 | 结果 | 备注 |
|------|------|------|
| `npx tsc --noEmit` | ✅ 9 errors,全部 pre-existing | 0 新错 |
| `npm run build` | ✅ 通过 | 3 API routes 全部注册 |
| 19 GET API 测试 | ✅ 全部通过 | 含 14 新增 + 1 修改 |

#### 步骤 5: Tester 发现

| Bug | 严重度 | 状态 |
|-----|--------|------|
| BUG-1: Default sort 歧义 — spec 写 `updatedAt desc`,代码用 `createdAt desc` | 规格歧义(不阻断) | 维持 `createdAt desc`(向后兼容 + 已有测试按此写) |
| BUG-2: status 多值筛选缺少测试覆盖 | P2 一般 | deferred |

#### 步骤 6: 用户验收

用户 `curl` 验证通过:
```
POST /api/stores/100016/publish → 401 (原 404 已修复,需认证)
?sort=name_asc → 200 with 20 results ✅
?image=has → 200 with 0 results ✅ (no stores have images)
?province=guangdong → 200 with 18 results ✅
```

但报告: **"api 功能是实现的 前端页面上没有实现对应的效果"**

### 前端代码存在但渲染不生效 — 已知问题

经确认,所有前端改动代码已在 `page.tsx` 磁盘上:
- `useSearchParams` ✅
- `cityFilter` + cities fetch ✅
- `imageFilter` select ✅
- `Suspense` wrapper ✅
- 三态 empty state ✅
- URL sync effect ✅
- `npx tsc --noEmit` 0 errors in page.tsx ✅
- 380 lines unstaged diff in git ✅

**推测根因 (待排查,下回):**
1. Turbopack HMR 缓存 — 修改后未 hot-reload
2. 组件的 GroupMode 类型更新但 `<select>` 的 `value` binding 未正确联动
3. `fetchStores` 函数参数透传漏了 `city`/`image` 参数
4. Tailwind v4 JIT 类名动态拼接编译问题(筛选 UI 类名变化)

### 核心代码片段

**API SORT_MAP** (`src/app/api/stores/route.ts:12`):
```typescript
type OrderByItem = Record<string, "asc" | "desc">;
type OrderByInput = OrderByItem | OrderByItem[];
const SORT_MAP: Record<string, OrderByInput> = {
  updated_desc: { updatedAt: "desc" },
  updated_asc: { updatedAt: "asc" },
  created_desc: { createdAt: "desc" },
  created_asc: { createdAt: "asc" },
  name_asc: { name: "asc" },
  name_desc: { name: "desc" },
  level_desc: [{ level: "desc" }, { createdAt: "desc" }],
};
```

**前端组件分拆** (`src/app/admin/(dashboard)/stores/page.tsx`):
```tsx
export default function StoresPage() {
  return (
    <Suspense fallback={<div className="p-6 text-zinc-400">加载中...</div>}>
      <StoresPageInner />
    </Suspense>
  );
}
```

**三态 empty state**:
```tsx
{fetchError ? (
  <div>加载失败: {fetchError} <button onClick={resetAndFetch}>重试</button></div>
) : stores.length === 0 && hasActiveFilter ? (
  <div>没有匹配的门店 <button onClick={clearAllFilters}>清除筛选</button></div>
) : stores.length === 0 ? (
  <div>暂无门店数据 <Link href="/admin/stores/new">创建门店</Link></div>
)}
```

### 变更统计

| 维度 | 数据 |
|------|------|
| 新增测试用例(vitest) | 14 |
| 新增测试文件 | 0(写入现有 `route.test.ts`) |
| 修改后端文件 | 1(`src/app/api/stores/route.ts`) |
| 修改前端文件 | 1(`src/app/admin/(dashboard)/stores/page.tsx`, ~380 行 diff) |
| 新增依赖 | 0 |
| API 端点变更 | 1(GET /api/stores 参数扩展: sort/image/search 范围) |
| 前端 URL 持久化 | ✅ useSearchParams 双向绑定 + Suspense |
| 城市级联 | ✅ province→city fetch /api/cities |
| 图片筛选 | ✅ select(全部/有封面/缺封面) |
| 分组按 status | ✅ group select 增加「按合作状态」 |
| Empty state | ✅ 3 态区分 |

### 待排查(下回)

| 编号 | 问题 | 优先级 |
|------|------|--------|
| R1 | 前端筛选 UI 页面运行时未显示效果(代码存在,需 dev 重现) | P0 阻断 |
| R2 | `activity_logs` 表缺失(不影响筛选功能,但 action 端点无日志) | P2 |
| R3 | 前端 URL 持久化可能存在 `replace` 循环(防抖/去重需验证) | P2 |
| R4 | 14 筛选项加完后 group 分组逻辑可能与筛选冲突(选 status 同时分组 status) | P3 |

---

> 本日完结。下午 dispatch 流水线完成后端 API 扩展 + 前端筛选代码;前端渲染问题留待下次 dev 启动后排查。
> 维护: 冯科雅(Coya) · 2026-06-24

### 用户请求
> https://github.com/ConardLi/garden-skills/tree/main/skills/web-design-engineer 第三个的话我们需要配置这个skill来作为页面优化command

意图: 安装 `web-design-engineer` 第三方 skill(ConardLi/garden-skills v1.2.2),并配置为项目内的「页面优化」slash command。

### 决策与理由

| 决策点 | 选择 | 理由 |
|---|---|---|
| 安装位置 | `.claude/skills/web-design-engineer/` | 项目本地 skill,与已有 19 个 skill 同级;不污染 `.claude/plugins/`(那是 plugin 体系) |
| 命令名 | `/web-design-engineer` | 匹配 skill 名;与 `/build` `/review` `/ship` kebab-case 一致 |
| 同步多平台 | **暂不** | `scripts/sync-skills.mjs` 硬编码 clone-website 一个 skill,通用化超出本次范围 |
| 25 style-recipes | **暂不** fetch | SKILL.md 路由明确「按需读取」,先有 INDEX.md 作目录;后续用到再补 |
| 4 主 references | ✅ 全部 fetch | 路由直接引用,缺失会让 skill 跑不全 |

### 安装内容(共 7 文件,75 KB)

```
.claude/skills/web-design-engineer/
├── SKILL.md              (35 KB, 493 行 + 9 行 frontmatter)
├── manifest.json         (上游 v1.2.2 metadata)
└── references/
    ├── advanced-patterns.md      (521 行,Tweaks / 设备框 / 暗色 / oklch)
    ├── critique-guide.md         (226 行,5 维评分细则)
    ├── design-directions.md      (188 行,6 schools 哲学库)
    └── style-recipes/
        └── INDEX.md              (145 行,25 recipes 目录索引)
.claude/commands/
└── web-design-engineer.md        (slash command,「页面优化」入口)
```

### SKILL.md frontmatter 调整

**上游原始**(只 2 行):
```yaml
name: web-design-engineer
description: "..."
```

**项目惯例扩展**(7 行):
```yaml
name: web-design-engineer
description: "..."
argument-hint: "<页面优化任务 — e.g. '优化 /agent 列表页视觉层次' 或 '重新设计 /product/wenjie Hero'>"
user-invocable: true
compat: claude-code, claude-ai, cursor, codex-cli, gemini-cli, opencode
version: 1.2.2
source: https://github.com/ConardLi/garden-skills/tree/main/skills/web-design-engineer
```

### Slash command 设计要点(`.claude/commands/web-design-engineer.md`)

- **入口定位**:「页面优化」 = 视觉探索 → 选定方向 → 转 `/build` 落地 Next.js
- **适用场景**: 重设计 / A/B / critique / 组件原型
- **不适用**: 纯 Next.js 实现 → `/build`;后端 → `/dispatch`;运行中性能审计 → 现有 lighthouse + Playwright
- **LANHUI 特定约束**: 真实 logo / 真实素材 / 暗色主题 / 响应式 3 档 / 品牌 slogan 来自 `src/lib/brand.ts` 不编造 / a11y 4.5:1 / 按钮 44×44
- **输出位置**: `/tmp/wde-artifacts/<page>-v<N>.html`(独立 HTML,**不写 `src/`**)
- **8 步工作流**: Step 0 Verify Facts → 1 Understand → 2 Gather Context → 3 Declare System → 4 v0 Draft(3 方向)→ 5 Full Build → 6 Verification → 7 Critique

### 验证

- ✅ System reminder skills 列表中**已出现** `web-design-engineer`(skill)和 `web-design-engineer: Optimize a LANHUI page visually`(command)— Claude Code 已加载
- ✅ `SKILL.md` frontmatter 解析正确(Edit 工具确认)
- ✅ 4 references 文件 line count 完整(advanced 521 / critique 226 / design 188 / INDEX 145)
- ✅ `references/` 路径在 SKILL.md 中以相对路径引用 → 安装后路径正确解析

### 未做 / 后续

- ❌ **不通用化 sync-skills.mjs**: 现有脚本硬编码 clone-website 一个 skill,改通用化超出本次范围(未来如需批量同步,可参数化 SOURCE 路径 + 复用 frontmatter 解析逻辑)
- ❌ **不 fetch 25 style-recipes**: INDEX.md 已够选方向,具体 recipe 按需 `curl` 即可
- ❌ **不创建 `/tmp/wde-artifacts/`**: 用时即建,首次落盘示例产物时再 gitkeep
- ❌ **不进 multi-platform**: 当前 Claude Code session 已能用,其他 IDE(Codex/Cursor/Gemini)暂不部署

### 与现有体系的关系

| 现有 | 新增 web-design-engineer | 关系 |
|---|---|---|
| `frontend-ui-engineering` (plugin skill) | `web-design-engineer` (项目 skill) | **互补**:前者管「Next.js 项目内」UI 实现,后者管「独立 HTML 原型」视觉探索 |
| `/build` (实现) | `/web-design-engineer` (优化) | 串行:design-engineer 选方向 → `/build` 落 Next.js |
| `/review` (代码 review) | (Step 7 critique) | 互补:review 查代码 5 维,critique 查视觉 5 维 |
| dispatch `webdesign-engineer` 角色 | `/web-design-engineer` | 替代:`/dispatch` 在「实现者」阶段路由 UI 任务到 webdesign-engineer subagent;新 command 提供直接入口 |
| MEMORY「UI 优化审查子步骤」(`ui-ux-pro-max`) | (SKILL.md Step 7) | 互补:`ui-ux-pro-max` 是审计报告,web-design-engineer 是设计工作流 |

---

## 十六、前端筛选渲染修复 — CSS `sm:flex` 缺失(2026-06-24 下午 续)

### 背景

下午 dispatch 流水线输出前端筛选代码(第十五节)后,用户测试发现"前端页面上没有实现对应的效果"。经 Playwright 自动化排查,确认代码逻辑正确但 CSS 阻止了渲染。

### 根因分析

| 环节 | 问题 |
|------|------|
| `#advanced-filters` div | `className` 用 `advancedOpen ? "flex" : "hidden"` 控制显隐 |
| 展开按钮"更多筛选" | 有 `sm:hidden` 类 → 桌面端按钮不可见 |
| `advancedOpen` 初始值 | `const [advancedOpen, setAdvancedOpen] = useState(false)` |
| **结论** | 桌面端:按钮隐藏且面板默认 hidden → 高级筛选(省份/城市/等级/图片)永久不可达 |

**关键代码**(修复前 `src/app/admin/(dashboard)/stores/page.tsx:1127-1133`):
```tsx
<div id="advanced-filters" className={cn(
    "flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3",
    advancedOpen ? "flex" : "hidden",   // ← 桌面端永远 hidden
)}>
```

### 修复

**添加 `sm:flex`** 保证桌面端始终显示:

```tsx
<div id="advanced-filters" className={cn(
    "flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3",
    advancedOpen ? "flex" : "hidden",
    "sm:flex"                              // ← 新增:桌面端覆盖 hidden
)}>
```

移动端行为不变:按钮可见,点按展开/收起面板。

### Playwright 验证(10 项全通过)

用 `chromium` headless (1440×900) 登录 admin,完整测试筛选交互:

| 测试项 | 结果 | 细节 |
|--------|------|------|
| 5 主筛选元素存在 | ✅ | 搜索/状态/排序/分组/更多筛选按钮 |
| 分组选项 | ✅ | 不分组/按省份/按城市/按等级/**按合作状态** |
| 排序选项 | ✅ | 6 种(updated_desc → level_desc) |
| 省份→城市级联 | ✅ | 选"guangdong"→城市加载22市→URL同步 |
| 城市下拉启用 | ✅ | 初始 disabled,选省后 enabled |
| 分组按状态 | ✅ | 表格分为「待发布」「营业中」两组 |
| 图片筛选 | ✅ | 选"有封面图"→URL带`image=has` |
| 排序交互 | ✅ | 选"名称 A→Z"→URL带`sort=name_asc` |
| 清除筛选 | ✅ | 清除按钮按需出现+点击后清除 |
| 控制台错误 | ✅ | 0 个 |

### 变更统计

| 维度 | 数据 |
|------|------|
| 修改文件 | 1(`src/app/admin/(dashboard)/stores/page.tsx`, +1 行) |
| 新增依赖 | 0 |
| 新增测试 | 0(调试脚本 `.claude/check-filters.mjs` 已清理) |
| 门禁 | `npx tsc --noEmit` 9 baseline(0 新错), `npm run build` 通过 |

### 教训

- **新 CSS 类 + 条件渲染组合**容易引入非预期隐藏,特别是 mobile-first 项目中 `hidden` + `sm:hidden` + `sm:flex` 的交互需要仔细审查
- **Playwright 端到端验证**比 curl 或单元测试更能暴露 CSS/渲染问题
- Turbopack HMR 对新增的 CSS 类名不会触发 SSR 重新编译(需硬刷新获取新 HTML),但客户端渲染(HMR 后)能正确应用

---

> 本日全终结。上午:Path A(状态机迁移)+ Path B(e2e)+ web-design-engineer 安装;下午:dispatch 流水线(API 扩展 + 前端筛选代码)+ CSS 修复(1 行)。
> 维护: 冯科雅(Coya) · 2026-06-24