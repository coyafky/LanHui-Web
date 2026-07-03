# Implementation Plans

> `docs/plans/` 用于把已批准 PRD/SPEC 拆成 plan -> build -> test 的可执行切片。
>
> 最后更新: 2026-06-26

---

## 使用时机

- PRD 已批准。
- SPEC 已写清前端、API、后端和测试实现边界。
- 准备进入单 Agent 或多 Agent 编码。

---

## 三段式执行模块

### 1. Plan

Plan 负责把需求变成任务图:

- PRD/SPEC 来源。
- 本任务使用的 skill: `next-best-practices` / `react-best-practices` / `web-design-engineer` / `prisma-data-ops` / faker+MSW。
- 任务列表和依赖顺序。
- 每个任务涉及的文件。
- 每个任务对应的验收标准。
- 每个任务的验证命令。
- 回滚方式。

### 2. Build

Build 负责按最小垂直切片实现:

- 一次只实现一个可验证任务。
- 不偏离 PRD/SPEC。
- UI 任务按三视口和状态实现。
- API/后端任务按 auth、Zod、Prisma、统一响应实现。
- 测试数据优先复用 `src/lib/test-utils/fixtures.ts`；API mock 优先补 `src/mocks/handlers.ts`。
- 每个切片完成后跑该切片的最小验证。

### 3. Test

Test 负责证明实现满足 PRD，而不是证明代码“看起来能跑”:

- 建立 AC -> 验证方式矩阵。
- 运行自动化命令。
- 说明哪些测试使用 faker/MSW，哪些测试触达真实 route handler / Prisma mock。
- 测试主轴使用 Vitest、Playwright CLI 和 E2E。
- 实现完成后可在 Claude 中调用 Codex review 插件做独立代码审查。
- 涉及 UI 时做 390 / 768 / 1440 检查。
- 记录 bug、复现步骤和剩余风险。
- 产出到 `docs/test-reports/YYYY-MM-DD/`。

---

## Plan 模板

```markdown
# [Topic] Implementation Plan — YYYY-MM-DD

## 关联文档

- PRD:
- SPEC:

## Skill 路由

| 类型 | 使用 | 原因 |
|---|---|---|
| next-best-practices | yes/no | ... |
| react-best-practices | yes/no | ... |
| web-design-engineer | yes/no | ... |
| prisma-data-ops | yes/no | ... |
| faker/MSW | yes/no | ... |
| Codex review plugin | yes/no | ... |

## 任务列表

| Task | 说明 | 文件 | 依赖 | 验证 |
|---|---|---|---|---|

## Build 顺序

1. ...
2. ...
3. ...

## Test 矩阵

| PRD AC | Test | 命令/浏览器检查 |
|---|---|---|

## 模拟数据策略

- faker fixtures:
- MSW handlers:
- 真实 route handler / Prisma 测试:
- Vitest:
- Playwright CLI:
- E2E:

## Review 策略

- Claude 是否调用 Codex review 插件:
- Review findings 记录位置:

## 风险与回滚

## 审批状态
```

---

## 命名

```text
docs/plans/<topic>-implementation-plan-<YYYY-MM-DD>.md
```
