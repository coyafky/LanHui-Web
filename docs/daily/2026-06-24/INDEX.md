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

> 最后更新: 2026-06-24(同日 续)
> 状态: ✅ Path A + Path B 双完成,7 e2e 全过,DB 已清理,后续 P2 deferred 不阻塞。
