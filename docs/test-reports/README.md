# Test Reports

> `docs/test-reports/` 存放验证证据。它证明实现是否满足 PRD/SPEC，而不是记录“感觉已经完成”。
>
> 最后更新: 2026-06-26

---

## 存放规则

```text
docs/test-reports/YYYY-MM-DD/<TOPIC>_TEST_REPORT_YYYY-MM-DD.md
docs/test-reports/YYYY-MM-DD/<topic>/<screenshots-or-artifacts>
```

---

## 报告必须包含

- 对应 PRD/SPEC/Plan 路径。
- 验收标准逐项 pass/fail。
- 实际运行的命令和结果。
- 本次使用的 skill，以及是否使用 faker/MSW。
- 是否在 Claude 中调用 Codex review 插件，以及 review 结论。
- 浏览器检查视口: 390 / 768 / 1440，涉及 UI 时必须记录。
- Bug 列表: 严重度、文件、复现步骤、期望行为。
- 剩余风险: 包括 pre-existing 问题和本次未覆盖项。

---

## 当前质量门说明

- `npm run lint`: 代码风格 gate。
- `npm run typecheck`: 当前有 9 个 pre-existing test errors，仅限 `src/app/api/analytics/stats/route.test.ts` 和 `src/lib/analytics.test.ts`。
- `npm run build`: 应在无 Postgres 时成功，依赖 `src/lib/data.ts` 静态降级。
- `npm run check`: 当前会停在 pre-existing typecheck errors，不能直接当作完整通过信号。

测试主轴:

- Vitest: 单元测试、组件测试、API route 测试。
- Playwright CLI: 浏览器检查、截图验证、交互复现。
- E2E: 关键用户路径和回归场景。

---

## 最小模板

```markdown
# [Topic] Test Report — YYYY-MM-DD

## 范围

## 关联文档

## 验收矩阵

| AC | 结果 | 证据 |
|---|---|---|

## Skill / Mock 使用

- Skills:
- faker fixtures:
- MSW handlers:
- 真实 route handler / Prisma mock:
- Codex review plugin:

## 命令结果

## 浏览器检查

## Bugs

## 剩余风险
```
