# SPEC Implementation Breakdown Template

> 用于 PRD 批准后的实现规格拆解。目标是让 architect / coder / tester 不需要猜测前端、API、后端和测试边界。
>
> 对应 PRD: `docs/PRD/...`
> 对应计划: `docs/plans/...`
> 最后更新: YYYY-MM-DD

---

## 1. 模块目标

- 模块/页面:
- 用户目标:
- 工程目标:
- 非目标:

---

## 1.1 Skill 路由

> 参考 `docs/SPEC/_SKILL_ROUTING.md`。只勾选本任务真正需要的 skill。

- [ ] `prompt-boost` — 需求仍需项目化翻译。
- [ ] `next-best-practices` — 改 `src/app/**`、metadata、route handler、RSC/CC 边界。
- [ ] `react-best-practices` — 改 React 组件、数据获取、性能、bundle、rerender。
- [ ] `web-design-engineer` — 做页面原型、视觉方向、复杂 UI 状态或视觉评审。
- [ ] `prisma-data-ops` — 改 API、Prisma、migration、事务、分页、raw SQL。
- [ ] faker/MSW — 需要模拟数据、API mock、组件无 DB 测试。

---

## 2. 前端实现规格

### 2.1 页面/组件结构

| 层级 | 文件 | 类型 | 职责 |
|---|---|---|---|
| Page | `src/app/.../page.tsx` | RSC/CC | ... |
| Component | `src/components/...` | RSC/CC | ... |
| Data | `src/lib/...` | TS | ... |

### 2.2 原型与视觉参考

- 原型页/截图:
- 参考角色: `web-design-engineer` 可用于视觉方向、交互状态、响应式检查。
- 不可越界: 原型和视觉建议不能覆盖 PRD 的业务范围、内容真实性和验收标准。

### 2.3 UI 状态

| 状态 | 触发条件 | UI 表现 | 验证方式 |
|---|---|---|---|
| loading | ... | ... | ... |
| empty | ... | ... | ... |
| error | ... | ... | ... |
| success | ... | ... | ... |

### 2.4 响应式与可访问性

- Mobile 390:
- Tablet 768:
- Desktop 1440:
- Keyboard:
- Screen reader / aria:
- 图片尺寸与 `sizes`:

---

## 3. API 对接规格

| Method | Route | 权限 | 请求 schema | 响应 schema | 错误码 |
|---|---|---|---|---|---|
| GET/POST/PATCH/DELETE | `/api/...` | admin/editor/public | Zod schema | `{ success, data?, error?, details? }` | 400/401/403/404/409/500 |

### 3.1 API 约束

- 写接口必须 `auth()` + role check + Zod validation。
- 响应保持 `{ success, data?, error?, details? }`。
- Prisma 7 driver adapter 错误读取 `meta.driverAdapterError.cause`。
- 不在 RSC 中直接写 `prisma.*`；写入通过 API route。

---

## 4. 后端/数据实现规格

### 4.1 数据来源

| 来源 | 文件/表 | 说明 |
|---|---|---|
| Static | `src/lib/...` | ... |
| DB | `prisma/schema.prisma` | ... |
| Asset | `public/...` | ... |

### 4.2 Prisma / Migration

- 是否需要 migration:
- 是否需要 seed:
- 是否影响 build without Postgres:
- 回滚策略:

---

## 5. 测试实现规格

### 5.0 TDD RED 阶段（编码前必须完成）

进入 Build Slice 前，必须先把 SPEC §7 的测试用例清单转化为测试文件骨架，并验证它们全部 FAIL。

| AC-ID | 测试文件 | 测试用例名 | RED 验证 |
|-------|---------|-----------|---------|
| XXX-AC-01 | `xxx.test.ts` | "should create → 201" | ❌ FAIL |
| XXX-AC-02 | `xxx.test.ts` | "missing name → 400" | ❌ FAIL |

- [ ] 所有测试骨架已创建
- [ ] `npx vitest run <test-file>` 确认全部 FAIL（RED phase）
- [ ] mock/prisma/auth stub 已就位（参考现有 route.test.ts 模式：`vi.hoisted` + `vi.mock('@/lib/prisma')` + `vi.resetModules` + 动态 `await import('./route')`）

### 5.1 测试类型覆盖

| 类型 | 文件 | 覆盖内容 |
|---|---|---|
| Unit | `src/lib/*.test.ts` | ... |
| API route | `src/app/api/**/route.test.ts` | auth / validation / success / error shape |
| Component | `src/components/**/*.test.tsx` | ... |
| Fixture | `src/lib/test-utils/fixtures.ts` | faker 合法数据、边界数据、seed 可重放 |
| Mock API | `src/mocks/handlers.ts` | MSW 拦截 API client / 组件请求 |
| E2E | `e2e/*.spec.ts` | critical user path |
| Browser | screenshots / Playwright | 390 / 768 / 1440 |

### 5.1 faker / MSW 策略

- 是否新增 fixture factory:
- 是否新增 `edgeCases()`:
- 是否需要 `withSeed(seed)` 固定数据:
- 是否新增 MSW handler:
- 哪些场景用 MSW:
- 哪些场景必须测真实 route handler / Prisma:

### 5.2 验证命令

```bash
npm run lint
npm run typecheck
npm run build
npm run test
npm run test:e2e
```

如只改局部模块，补充定向命令:

```bash
npx vitest run <test-file>
npx playwright test <spec-file>
```

---

## 6. 验收映射

| PRD AC | SPEC 实现点 | 测试/验证 |
|---|---|---|
| AC1 | ... | ... |
| AC2 | ... | ... |

---

## 7. 风险与边界

- 数据风险:
- UI 风险:
- 性能风险:
- SEO/内容声明风险:
- 依赖/环境风险:
- 已知不处理项:
