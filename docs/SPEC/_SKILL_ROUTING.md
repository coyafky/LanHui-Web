# Skill Routing For Coding

> 编码前先选 skill。目标是让 architect / coder / tester 在进入实现前知道该调用哪类能力、读哪些项目约束、用什么测试数据。
>
> 最后更新: 2026-06-26

---

## 1. 推荐 Skill 矩阵

| 任务类型 | 必用/优先 skill | 何时使用 | 输出要求 |
|---|---|---|---|
| 需求翻译 | `prompt-boost` | 用户描述还粗糙、PRD 缺上下文 | 生成可进入 PRD/SPEC 的结构化 prompt |
| 多角色执行 | `dispatch` | 已有 PRD/plan，需要 architect/coder/tester 分工 | agent 分工、验证结果、风险回传 |
| Next.js 页面/路由 | `next-best-practices` | 改 `src/app/**`、metadata、route handlers、RSC/CC 边界 | 写明 Next 16 约束和相关 docs |
| React 性能/组件 | `react-best-practices` | 写或审 React/Next 组件、数据获取、bundle/perf | 检查 waterfall、bundle、rerender、serialization |
| 前端视觉/原型 | `web-design-engineer` | 页面重设计、原型页、复杂 UI 状态、视觉评审 | 设计系统、v0 原型、三视口和状态清单 |
| 后端/API/数据库 | `prisma-data-ops` | 改 `src/app/api/**`、`prisma.*`、事务、分页、raw SQL | auth/Zod/Prisma 7/error shape/transaction 策略 |
| 测试/模拟数据 | 项目内 faker + MSW | 组件、API client、边界状态、无 DB 渲染测试 | fixtures、handlers、AC -> test matrix |
| 代码审查 | Claude 中调用 Codex review 插件 | 实现完成后需要独立审查 | Codex review findings、风险、缺失测试 |

---

## 2. 外部 Skill 搜索结论

已用 `find-skills` 流程检查过外部 skill:

- `npx skills find frontend testing`: 最高结果约 414 installs，未达到项目标准。
- `npx skills find nextjs react performance`: 有 1.1K installs 的第三方 Next/React skill，但本项目已有 `next-best-practices` 和 Vercel `react-best-practices`。
- `npx skills find prisma backend testing`: 结果安装量较低，暂不引入。

结论: 先不安装新 skill。当前更稳的组合是项目内已安装 skill + 本项目测试基础设施。

---

## 3. 编码前检查顺序

1. 先确认 PRD 是否齐全: 背景、目标、非目标、范围、验收、验证命令、风险边界。
2. 再确认 SPEC 是否拆清:
   - Frontend
   - Prototype / `web-design-engineer`
   - API
   - Backend/Data
   - Tests
3. 按本文件矩阵选择 skill。
4. 写计划时声明本任务会用哪些 skill。
5. 实现时按最小垂直切片推进。
6. 实现完成后,Claude 可使用 Codex review 插件做独立代码审查。
7. 测试报告里记录真实命令、faker/MSW 使用情况和浏览器视口。

---

## 4. faker / MSW 使用规则

项目已经安装并启用:

- `@faker-js/faker`
- `msw`
- `vitest`
- `@testing-library/react`
- `@playwright/test`

测试主轴:

- Vitest: 单元测试、组件测试、API route 测试。
- Playwright CLI: 浏览器检查、截图验证、交互复现。
- E2E: 关键用户路径和回归场景。

现有入口:

- `src/lib/test-utils/fixtures.ts`
- `src/mocks/handlers.ts`
- `src/mocks/node.ts`
- `src/mocks/browser.ts`
- `vitest.setup.ts`

### 4.1 faker

用于生成合法但可控的数据:

- 默认生成合法数据。
- 边界失败用 `edgeCases()`。
- 需要可重放时用 `withSeed(seed)`。
- 新增业务实体时，优先在 `src/lib/test-utils/fixtures.ts` 增加 fixture factory，不在测试里手写大段对象。

### 4.2 MSW

用于拦截 API 请求:

- Vitest 里由 `vitest.setup.ts` 全局启动 `server.listen()`。
- handler 默认返回统一 `{ success, data?, error? }`。
- 每个测试后 `resetMockDb()`，避免状态污染。
- 新 API route 或 API client 变更时，优先补 `src/mocks/handlers.ts`，让组件测试可在无 DB 环境运行。

### 4.3 什么时候不用 mock

- 测 Prisma 事务、migration、raw SQL 或 driver adapter 错误形状时，不用 MSW 代替后端测试。
- 测 NextAuth session/role 关键路径时，需要 route-level mock 或 e2e，不只测组件假数据。
- 测构建和 SSG fallback 时，以 `npm run build` 为准。

---

## 5. PRD / SPEC 写法要求

涉及代码实现的 PRD/SPEC 必须写:

- 本任务使用哪些 skill。
- 是否需要 faker fixture。
- 是否需要 MSW handler。
- 哪些测试用真实 route handler，哪些测试用 MSW。
- 是否需要 Playwright 三视口检查。
- 是否需要 design-review。
- 是否需要 Claude 调用 Codex review 插件做独立审查。
