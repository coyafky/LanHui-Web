# 每日报告 — 2026-06-26

> AI 会话: Codex Desktop
> 维护: 冯科雅 (Coya)
> 主题: `docs/` 文档体系规范化
> 触发: 用户要求梳理当前 Codex coding 方式，并规范 PRD/SPEC/plan/build/test/daily/research/design-review 的文档流转。

---

## 一、今日目标

1. 理清当前项目文件夹和文档架构。
2. 明确 `docs/` 下各目录职责。
3. 规范 PRD 之后的 SPEC 内容: 前端实现、原型参考、API 对接、后端实现、测试实现。
4. 明确测试报告、执行日志 daily、研究报告、design-review 的边界。

---

## 二、今日新增/更新文档

| 文档 | 目的 |
|---|---|
| `docs/README.md` | `docs/` 总入口，定义文档生命周期和目录职责 |
| `docs/SPEC/_IMPLEMENTATION_BREAKDOWN_TEMPLATE.md` | PRD 批准后的实现规格拆解模板 |
| `docs/PRD/_templates/REQUIRED_SECTIONS.md` | PRD 必填章节清单 |
| `docs/plans/README.md` | plan -> build -> test 三段式执行规范 |
| `docs/research/README.md` | 技术研究和 qoder 内容摘取规则 |
| `docs/test-reports/README.md` | 测试报告结构和质量门说明 |
| `docs/daily/README.md` | 每日执行日志规范 |
| `docs/daily/2026-06-26/INDEX.md` | 今日执行索引 |
| `docs/SPEC/_SKILL_ROUTING.md` | 编码前 skill 路由、faker/MSW 使用规则 |

---

## 三、今日清理目录

为保持 `docs/` 简洁,已保留主流程目录:

- `docs/PRD/`
- `docs/SPEC/`
- `docs/plans/`
- `docs/test-reports/`
- `docs/daily/`
- `docs/research/`
- `docs/design-reviews/`
- `docs/database/`

已移除旁支目录:

- `docs/architecture/`
- `docs/audits/`
- `docs/design-references/`
- `docs/designs/`
- `docs/diagrams/`
- `docs/journal/`
- `docs/superpowers/`

---

## 四、关键结论

- 标准流转应为: PRD -> SPEC -> Plan -> Build/Test -> Test Report -> Design Review(涉及 UI) -> Daily。
- PRD 必须补齐背景、目标、非目标、修改范围、验收标准、验证命令和风险边界。
- SPEC 是实现合约，不是第二份 PRD；它要明确前端、原型、API、后端和测试怎么落地。
- `design-review` 专注页面美观性、交互状态、响应式和功能体验评估。
- `research` 专注技术解释和项目化知识沉淀，可摘取 `.qoder/repowiki/`，但必须改写、校验并标注来源。
- `daily` 是当天产物索引和执行日志，不承载完整规格正文。
- 使用 `find-skills` 检索后,暂不引入低安装量外部 backend/testing skill；项目内优先采用 `next-best-practices`、`react-best-practices`、`web-design-engineer`、`prisma-data-ops` 加 faker/MSW。
- faker/MSW 已是项目基础设施: `src/lib/test-utils/fixtures.ts`、`src/mocks/handlers.ts`、`vitest.setup.ts`。
- Claude 工作流中可使用 Codex review 插件做独立代码审查；测试主轴为 Vitest、Playwright CLI 和 E2E。

---

## 五、当前发现

- 仓库已有 `docs/SPEC/INDEX.md` 和 `docs/SPEC/_TEMPLATE.md`，SPEC 体系已经存在，但缺少“实现拆解模板”。
- `docs/daily/` 已有 2026-06-23 至 2026-06-25 的记录，今天新增 2026-06-26。
- `docs/research/` 当前只有 `MOXIAOER_TECH_ANALYSIS.md`，技术研究目录需要入口规则。
- `docs/design-reviews/` 已有视觉评审索引和评分卡，适合作为 UI/功能体验评估目录。
- 根目录有若干截图和误生成文件，后续应迁移到 `docs/test-reports/` 或 `docs/daily/YYYY-MM-DD/artifacts/`。
- AGENTS 提到 `.trellis/`，但当前仓库根目录未发现 `.trellis/`；后续如果要恢复 Trellis 流程，需要先补配置或修正文档。

---

## 六、未执行验证

本次只调整 Markdown 文档和目录索引，未运行:

- `npm run lint`
- `npm run typecheck`
- `npm run build`

原因: 没有改动业务代码、测试代码或构建配置。

---

## 七、下一步建议

1. 回填现有高优先级 PRD 的缺失字段，尤其是验收标准和验证命令。
2. 将根目录散落截图迁移到对应 daily/test 目录。
3. 决定是否恢复 `.trellis/`，或从 AGENTS 中移除不准确的 Trellis 配置描述。
