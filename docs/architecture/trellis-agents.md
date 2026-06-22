# `.trellis/agents/` 体系

> 蓝辉轻改 LANHUI 项目使用的 **Trellis channel runtime agent 体系**。本文档描述每个 agent 的定位、frontmatter、关键能力、流水线编排、worktree 生命周期,以及跟 `/prompt-boost` / `/dispatch` / `/trellis-test` skill 的关系。
>
> **版本**:v1.0(2026-06-20 bootstrap)
> **位置**:`.trellis/agents/*.md`
> **runtime**:`trellis channel spawn --agent <name>`(channel runtime 自动发现)

---

## 1. 当前成员(5 个 agent)

| Agent | Frontmatter `name` | 职责 | File | Status |
|---|---|---|---|---|
| **Architect** | `architect` | 需求分析 + 架构设计(吸收 `/prompt-boost` 7 阶段) | [`.trellis/agents/architect.md`](../../.trellis/agents/architect.md) | 🆕 2026-06-20 |
| **Orchestrator** | `orchestrator` | 流水线编排 + worktree 生命周期(吸收 `/dispatch`) | [`.trellis/agents/orchestrator.md`](../../.trellis/agents/orchestrator.md) | 🆕 2026-06-20 |
| **Implement** | `implement` | 代码实现(基于 spec + 已有模式) | [`.trellis/agents/implement.md`](../../.trellis/agents/implement.md) | ✅ 已有 |
| **Test** | `test` | 测试执行(vitest + Playwright + coverage) | [`.trellis/agents/test.md`](../../.trellis/agents/test.md) | ✅ 2026-06-20 增 |
| **Check** | `check` | 质量审计 + 自修复(lint + typecheck) | [`.trellis/agents/check.md`](../../.trellis/agents/check.md) | ✅ 已有 |

### 1.1 共同的 frontmatter 模板

每个 agent 文件顶部都有相同的 YAML frontmatter,channel runtime 用它来发现和注入:

```yaml
---
name: <agent-name>            # 用于 `trellis channel spawn --agent <name>`
description: |                # 一段话描述 scope + 职责
  <one-paragraph description>
provider: claude               # 当前统一用 Claude provider
labels: [trellis, <name>]     # 通道 runtime 标签
---
```

### 1.2 共同的章节结构

| 章节 | 必有? | 用途 |
|---|---|---|
| `# <Name> Agent (channel runtime)` | ✅ | 标题 |
| Channel runtime 介绍 + 与上层 skill 的关系 | ✅ | 说明此 agent 的入口和上下文 |
| `## Recursion Guard` | ✅ | 防递归 spawn(不调自己 / 不调同级) |
| `## Context` | ✅ | 读取顺序(任务 artifacts → spec → 项目) |
| `## Core Responsibilities` | ✅ | 编号职责列表(3-6 条) |
| `## Forbidden Operations` | ✅ | 不做的事(commit / 改 src/ 等) |
| `## Workflow` | ✅ | 步骤化执行流程 |
| `## Report Format` | ✅ | 汇报模板 |

部分 agent 还会附加:
- `## Pipeline Diagram`(orchestrator)
- `## Worktree Lifecycle`(orchestrator)
- `## Existing Test Pattern`(test)
- `## Mapping to /prompt-boost Phases`(architect)
- `## When NOT to use`(orchestrator)

---

## 2. 流水线全景图

```
[用户需求]
   ↓
[orchestrator]  ← 入口:`trellis channel spawn --agent orchestrator`
   │
   ├──► [architect]   ── 写 prd.md / design.md / implement.md
   │         │              gate: 主 session 确认设计
   │         ▼
   ├──► [implement]   ── 写代码,跑 typecheck + build
   │         │              gate: typecheck + build pass
   │         ▼
   ├──► [test]        ── 写测试,跑 npm test + npm run test:e2e
   │         │              gate: 所有测试 pass
   │         ▼
   └──► [check]       ── 审查 diff,自修复 lint / typecheck
             │              gate: check pass
             ▼
[orchestrator 合并 4 个 worktree → main → 汇报]
```

**调用频率:** 5 个 agent 中,`implement` / `check` / `test` 是真正干活的,`architect` 和 `orchestrator` 是"调度层"。日常小修改可能只调 `implement` 或 `check`,`architect` 和 `orchestrator` 用于较大改动。

---

## 3. Worktree 生命周期(orchestrator 内置)

每个阶段都在独立 worktree 中执行,避免污染主分支:

| Step | Command | CWD |
|---|---|---|
| **CREATE** | `git worktree add .claude/worktrees/agent-<uuid> -b worktree-agent-<phase>-<topic> main` | main repo |
| **DISPATCH** | `trellis channel spawn <ch> --agent <phase> --cwd <worktree-path> --jsonl <task-path>/<phase>.jsonl --timeout 30m` | main repo |
| **VERIFY** | `cd <worktree-path> && npx tsc --noEmit && npm run build` | worktree |
| **MERGE** | `git checkout main && git merge --no-ff worktree-agent-<phase>-<topic> -m "merge: <phase> for <topic>"` | main repo |
| **CLEANUP** | `git worktree remove .claude/worktrees/agent-<uuid>` | main repo |

**关键设计:**

1. **UUID** 来自 spawn message 的 hash,每个 phase 唯一
2. **`<topic>`** 是 task slug(如 `trellis-agent-system-bootstrap`)
3. **Branch 命名**:`worktree-agent-<phase>-<topic>`(`phase` ∈ `architect` / `implement` / `test` / `check`)
4. **Merge 策略**:统一 `--no-ff`,保留阶段可追溯性
5. **Push 不自动化**:`orchestrator` 完成后由主 session / 用户决定是否 push

---

## 4. 跟 `/prompt-boost` / `/dispatch` 的关系

### 4.1 `/prompt-boost` skill ↔ `architect` agent

| 维度 | `/prompt-boost` skill | `architect` channel agent |
|---|---|---|
| **入口** | 用户 `/prompt-boost` 命令 | `trellis channel spawn --agent architect` |
| **用户入口 skill** | `.claude/skills/prompt-boost/SKILL.md` | `.claude/skills/trellis-architect/SKILL.md` |
| **产出** | 单个精确 Prompt(Markdown) | PRD + Design + Implement 三件套 |
| **调用者** | 用户(主 session) | orchestrator 或主 session |
| **工作环境** | Claude Code 交互 | channel worker(headless) |
| **7 阶段项目扫描** | ✅ | ✅(吸收) |
| **意图分类 + 消歧** | ✅ | ✅(吸收) |
| **交互式提问** | ✅ | ❌(orchestrator 替用户决策) |

**双向引用:**
- `prompt-boost` SKILL 末尾有 "Trellis 集成" 节,指向 architect agent
- architect agent 在 Context 节引用 `prompt-boost` SKILL,避免重复 7 阶段扫描逻辑

### 4.2 `/dispatch` skill ↔ `orchestrator` agent

| 维度 | `/dispatch` skill | `orchestrator` channel agent |
|---|---|---|
| **入口** | 用户 `/dispatch` 命令 | `trellis channel spawn --agent orchestrator` |
| **用户入口 skill** | `.claude/skills/dispatch/SKILL.md` | `.claude/skills/trellis-orchestrator/SKILL.md` |
| **流水线 4 阶段** | ✅(Architect / Coder / Tester / Deployer) | ✅(architect / implement / test / check) |
| **Worktree 隔离** | 部分(用户主动) | ✅(内置 CREATE / DISPATCH / VERIFY / MERGE / CLEANUP) |
| **质量门禁** | ✅ | ✅(同) |
| **上下文内联** | ✅ | ✅(同) |
| **失败回退表** | ✅ | ✅(简化版) |
| **Worker 模型** | Claude subagent(`architect/coder/tester/deployer`) | Trellis channel worker(`architect/implement/test/check`) |
| **适用场景** | 交互式快速原型 | 长时非交互流水线 + worktree 隔离 |

**双向引用:**
- `dispatch` SKILL 头部有 "Trellis 等价物" 节,指向 orchestrator agent
- orchestrator agent 在 Workflow 节镜像 dispatch 的 4 阶段流水线

---

## 5. 各 agent 速查

### 5.1 architect

**什么时候用:**
- 收到新需求,需要先写 PRD 再实现
- 大改动涉及多文件 / 多模块 / 多路由
- 团队成员需要 review 设计文档

**什么时候不用:**
- 一行 trivial 修复(直接改 + spawn check)
- 已有 PRD 想直接进入实现(直接 spawn implement)
- 单文件小手术(直接改)

**入口:**
```bash
trellis channel spawn <ch> --agent architect \
  --provider claude --cwd <task-path> \
  --jsonl <task-path>/check.jsonl --timeout 30m \
  --message "<raw requirement>"
```

### 5.2 orchestrator

**什么时候用:**
- 较大改动涉及多阶段(architect → implement → test → check)
- 需要 worktree 隔离(避免污染主分支)
- 一键跑完整流水线

**什么时候不用:**
- 单 agent 任务(直接 spawn 对应 agent)
- 一行 fix(主 session 直接改)
- 用户明确说 "跳过 orchestrator"

**入口:**
```bash
trellis channel spawn <ch> --agent orchestrator \
  --provider claude --cwd <task-path> \
  --message "实现 X 功能"  # orchestrator 自己解析意图
```

### 5.3 implement

**什么时候用:**
- 已有 PRD / Design / Implement 三件套,需要写代码
- 主 session 完成设计后,转入实现

**入口:**
```bash
trellis channel spawn <ch> --agent implement \
  --provider claude --cwd <worktree-path> \
  --jsonl <task-path>/implement.jsonl
```

### 5.4 test

**什么时候用:**
- implement 完成后,需要补测试
- 跑全量 vitest / Playwright / coverage

**入口:**
```bash
trellis channel spawn <ch> --agent test \
  --provider claude --cwd <worktree-path> \
  --jsonl <task-path>/test.jsonl
```

### 5.5 check

**什么时候用:**
- test 通过后,review 最终 diff
- 自修复 lint / typecheck 错误

**入口:**
```bash
trellis channel spawn <ch> --agent check \
  --provider claude --cwd <worktree-path> \
  --jsonl <task-path>/check.jsonl
```

---

## 6. 新增 agent 的流程(将来加 research / deploy)

如果未来要补 `research.md` / `deploy.md`,遵循以下模式:

1. **沿用 frontmatter**:复制任一现有 agent 的 YAML 头,改 `name` / `description` / `labels`
2. **沿用章节结构**:Recursion Guard / Context / Core Responsibilities / Forbidden Operations / Workflow / Report Format
3. **描述吸收 /prompt-boost 或 /dispatch 的对应功能**(如果适用)
4. **更新 orchestrator.md** 的流水线,加新阶段
5. **更新本文档** 第 1 节成员表 + 第 2 节流水线图
6. **Smoke test**:`trellis channel run --agent <new-name>`,验证 runtime 接受

**为什么不需要注册:** channel runtime 用 `load .trellis/agents/<name>.md` 文件系统发现,实测验证(2026-06-20)。`.trellis/.template-hashes.json` 是 upgrade 完整性快照,不是 registry。

---

## 7. 版本历史

| 版本 | 日期 | 变更 |
|---|---|---|
| **v1.0** | 2026-06-20 | bootstrap:新建 architect + orchestrator,小补 implement / check / test,加 2 个用户入口 skill,更新 prompt-boost + dispatch SKILL,本文档 |

**未来可能:**
- v1.1:加 `research.md`(库文档调研 / 最佳实践搜索)
- v1.2:加 `deploy.md`(构建 / 部署 / 回滚)
- v2.0:orchestrator 支持 checkpoint / rollback 状态机(处理跨阶段回滚)
- v2.1:orchestrator 支持多 orchestrator 并行(独立任务并行流水线)