# LANHUI Docs Workflow

> `docs/` 是项目需求、规格、计划、验证、研究和每日执行记录的主目录。所有非临时研发结论都应能在这里找到入口。
>
> 最后更新: 2026-07-11

---

## 1. 文档生命周期

标准流转顺序:

```text
需求输入
  -> docs/PRD/
  -> docs/SPEC/  (驱动型：含 Zod schema + 错误矩阵 + 测试用例清单)
  -> 写失败测试 (RED phase — TDD 前置)
  -> docs/plans/
  -> 实现与验证 (GREEN + REFACTOR)
  -> docs/test-reports/
  -> docs/design-reviews/ (涉及页面/UI 时)
  -> docs/daily/YYYY-MM-DD/
```

如果任务来自一个模糊想法、页面截图或临时业务反馈，先使用
[`AI_DELIVERY_LOOP.md`](./AI_DELIVERY_LOOP.md) 的闭环执行:

```text
Idea -> Intake -> Context Scan -> PRD Patch -> SPEC Contract (含测试清单)
     -> RED (写失败测试) -> Plan -> Build Slice (让测试通过) -> Test & Visual Review
     -> Fix Loop -> Ship -> Retro
```

| 阶段 | 目录 | 目的 | 必须回答的问题 |
|---|---|---|---|
| PRD | `docs/PRD/` | 定义要做什么、为什么做、边界在哪里 | 背景、目标、非目标、修改范围、验收标准、验证命令、风险边界 |
| SPEC | `docs/SPEC/` | 定义怎么做、模块合约是什么 | 前端实现、原型参考、API 对接、后端实现、测试实现 |
| Plan | `docs/plans/` | 把 PRD/SPEC 拆成可执行任务 | 任务顺序、依赖关系、文件边界、回滚方式 |
| Test Report | `docs/test-reports/` | 记录验证证据和失败项 | 跑了什么命令、验证了哪些视口/场景、bug 复现 |
| Design Review | `docs/design-reviews/` | 评估页面美观性和功能模块体验 | 视觉层级、交互状态、a11y、响应式、功能可用性 |
| Daily | `docs/daily/YYYY-MM-DD/` | 汇总当天执行日志和索引 | 今天处理了什么、产出在哪、遗留问题是什么 |
| Research | `docs/research/` | 沉淀技术解释和方案研究 | Next.js/Prisma/认证/缓存等知识如何影响本项目 |

---

## 2. PRD 规范

每份 PRD 至少包含:

- 背景: 为什么现在要做，触发问题是什么。
- 目标: 用户、业务或工程结果。
- 非目标: 明确本次不解决什么，避免范围漂移。
- 修改范围: 页面、组件、API、数据模型、脚本、资产。
- 验收标准: 用可勾选、可验证的语句写，不写抽象愿望。
- 验证命令: 至少列出相关 `npm run lint`、`npm run typecheck`、`npm run build`、定向 vitest/e2e。
- 风险边界: 数据迁移、鉴权、SEO、内容声明、图片资产、外部依赖。

PRD 模板位置:

- `docs/PRD/_templates/REQUIRED_SECTIONS.md`
- `docs/PRD/_templates/public-site.md`
- `docs/PRD/_templates/product.md`
- `docs/PRD/_templates/admin.md`
- `docs/PRD/_templates/feature.md`
- `docs/PRD/_templates/cross-cutting.md`

**PRD 分级（2026-07-07）:** "规划中，未授权编码" PRD 已移入 `docs/PRD/backlog/`（34 个）。
进入执行时移回对应目录，并先写出驱动型 SPEC 再编码。参见 `docs/PRD/backlog/README.md`。

---

## 3. SPEC 规范

PRD 批准后进入 SPEC。SPEC 不重复产品愿景，重点写实现合约。

**2026-07-07 升级**: SPEC 从"记录型"升级为"驱动型"（10 节模板）。AI 可直接以 SPEC 为 prompt 开始编码，不需回问。
详见 `docs/SPEC/_TEMPLATE.md`。

驱动型 SPEC 必须覆盖 10 节:
1. 职责范围
2. 路由/入口
3. 数据模型（含 Zod/TS 代码块，AI 可直接复制）
4. 关键组件
5. **业务规则**（"当...时，系统必须..."）← 新增
6. **错误处理矩阵**（错误码→HTTP→消息→details）← 新增
7. **测试用例清单**（至少 5 个，实现前写出并看到失败）← 新增
8. API 合约（含完整请求/响应示例）
9. 验收条件
10. 已知问题 + AI 执行记录 + 验收追溯

已升级 SPEC: `api/stores.md`, `api/articles.md`, `admin/stores.md`, `public-site/home.md`。
旧版归档为 `<name>-v1-post-hoc.md`。

- Skills: 按任务类型声明 `next-best-practices`、`react-best-practices`、`web-design-engineer`、`prisma-data-ops`、faker/MSW 等使用边界。
- Frontend: 页面结构、组件拆分、状态、响应式、图片/资产、可访问性。
- Prototype: 如需视觉探索，先产出原型页或截图说明；`web-design-engineer` 作为视觉/交互参考角色，不替代 PRD。
- API: route handler、HTTP 方法、请求/响应 schema、权限、错误码、限流。
- Backend/Data: Prisma 模型、静态数据、数据访问边界、迁移和 seed。
- Tests: faker fixtures、MSW handlers、unit/integration/e2e/browser checks 的覆盖点。**实现前必须先写出失败测试（RED phase）。**
- Review: 在 Claude 工作流中可调用 Codex review 插件做独立代码审查，审查结果应回填到计划、测试报告或 daily。

通用模板:

- `docs/SPEC/_TEMPLATE.md`
- `docs/SPEC/_IMPLEMENTATION_BREAKDOWN_TEMPLATE.md`
- `docs/SPEC/_SKILL_ROUTING.md`

---

## 4. 目录职责

| 目录 | 内容边界 |
|---|---|
| `docs/ARCHITECTURE.md` | 当前系统架构和操作链路，不放单次任务日志 |
| `docs/PRD/` | 产品需求和验收边界 |
| `docs/SPEC/` | 模块合约、实现说明、PRD 到代码的桥 |
| `docs/plans/` | 已批准 PRD/SPEC 的 plan -> build -> test 执行计划 |
| `docs/design-reviews/` | 页面视觉、交互、美观性、功能体验评估 |
| `docs/test-reports/` | 自动化/手工/浏览器验证报告与截图证据 |
| `docs/daily/` | 每日索引、会话总结、当天产出清单 |
| `docs/research/` | 技术研究、概念解释、外部或 qoder 内容摘取后的本项目化总结 |
| `docs/database/` | 数据库说明、迁移设计、数据运维材料 |
| `docs/deployment/` | 生产部署架构、内容发布、回滚和迁移操作；静态方案入口见 [`static-nextjs/`](./deployment/static-nextjs/README.md) |
| `docs/AI_DELIVERY_LOOP.md` | Crowd / Codex / Claude 从想法到 PRD、代码、测试、交付和复盘的循环 |

---

## 5. 命名规则

| 类型 | 命名 |
|---|---|
| PRD | `docs/PRD/<area>/<TOPIC>_PRD_<YYYY-MM-DD>.md` |
| SPEC | `docs/SPEC/<area>/<topic>.md` |
| Plan | `docs/plans/<topic>-implementation-plan-<YYYY-MM-DD>.md` |
| Test report | `docs/test-reports/<YYYY-MM-DD>/<TOPIC>_TEST_REPORT_<YYYY-MM-DD>.md` |
| Design review | `docs/design-reviews/<TOPIC>_DESIGN_REVIEW_<YYYY-MM-DD>.md` 或 `scoring/<route>.md` |
| Daily | `docs/daily/<YYYY-MM-DD>/INDEX.md` |
| Research | `docs/research/<TOPIC>_RESEARCH_<YYYY-MM-DD>.md` |

---

## 6. 执行要求

- 新功能不要直接从代码开始；先确认是否已有 PRD 和 SPEC。
- 页面/UI 任务必须在 SPEC 中写清楚前端实现与三视口验证。
- API/后端任务必须在 SPEC 中写清楚请求/响应、鉴权、Zod、Prisma 错误形状和测试用例。
- 编码前按 `docs/SPEC/_SKILL_ROUTING.md` 选择 skill；新增 API client/组件测试时优先补 faker fixture 和 MSW handler。
- 测试主轴是 Vitest、Playwright CLI 和 E2E；涉及 UI 时必须保留浏览器验证证据。
- 每次实现后，测试报告记录真实命令结果；已知 `npm run typecheck` 的 pre-existing test errors 不作为业务代码回归。
- 当天所有重要产出都要进入 `docs/daily/YYYY-MM-DD/INDEX.md`，不要只散落在根目录或聊天里。
- 研究报告可以摘取 `.qoder/repowiki/` 内容，但必须改写成本项目语境，并标明来源和适用范围。
