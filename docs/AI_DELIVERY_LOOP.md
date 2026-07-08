# LANHUI AI Delivery Loop

> 用途: 给 Crowd / Codex / Claude 等 AI 协作者使用的一套稳定交付闭环。  
> 目标: 从一个模糊想法出发，逐步沉淀为 PRD、SPEC、Plan、代码、测试、线上验证和复盘，减少技术栈混乱、需求漂移和半成品页面。
>
> 最后更新: 2026-06-29

---

## 1. 为什么需要这个 loop

当前项目的问题不是“不会写代码”，而是输入经常不稳定：

- 想法是自然语言，细节不完整。
- PRD 多且杂，部分文档已经跟当前代码不一致。
- 页面表达、技术实现、测试口径经常混在一起。
- AI 容易直接开始写代码，导致新页面越做越多，但一致性下降。

所以每次任务都必须经过同一个闭环：先把问题说清楚，再把边界锁住，再写代码，再用测试和页面截图回推 PRD。

---

## 2. 总循环

```text
Idea
  -> Intake
  -> Context Scan
  -> PRD Patch
  -> SPEC Contract
  -> Implementation Plan
  -> Build Slice
  -> Test & Visual Review
  -> Fix Loop
  -> Staging / Online Check
  -> Ship
  -> Retro & Docs Update
  -> Next Idea
```

核心原则:

- 每轮只推进一个明确问题，不把“顺手优化”混进主线。
- 每轮都有文档输入和文档输出。
- 代码必须服务 PRD，测试必须验证 PRD，不验证“作者意图”。
- UI 任务必须有 390px / 768px / 1440px 浏览器证据。
- 如果测试或截图暴露 PRD 不完整，先回到 PRD，而不是继续堆代码。

---

## 3. 阶段定义

### 3.1 Intake — 想法收口

输入:

- 用户的一句话想法、截图、竞品、bug、页面问题或业务目标。

必须产出:

- 问题一句话。
- 影响页面/模块。
- 用户是谁。
- 成功标准初稿。
- 不做什么。

建议使用:

- `/prompt-boost`

退出条件:

- 能回答“这次到底要让谁完成什么动作”。

示例:

```text
想法: 产品中心太乱。
收口: 让新能源车主进入 /product 后，能在 5 秒内选择“按车型找”或“按项目找”，并进入对应页面。
```

### 3.2 Context Scan — 项目上下文扫描

输入:

- Intake 结果。

必须检查:

- `AGENTS.md`
- `docs/PRD/00_MASTER_PRD.md`
- 相关 `docs/PRD/**`
- 相关 `docs/SPEC/**`
- 当前 route / component / data / API 文件
- 近期 `docs/design-reviews/**` 和 `docs/test-reports/**`

必须产出:

- 现有实现事实。
- 已知 pre-existing 问题。
- 相关文件列表。
- 不能碰的边界。

退出条件:

- 明确是“修 PRD”“修 SPEC”“修代码”“修数据”“修测试”中的哪一种或哪几种。

### 3.3 PRD Patch — 需求文档修正

输入:

- Intake + Context Scan。

必须产出:

- 新 PRD，或对现有 PRD 的补丁。
- 背景、目标、非目标、修改范围、验收标准、验证命令、风险边界。

PRD 不写:

- 组件内部实现细节。
- 未确认的价格/官方授权/外部承诺。
- “高级一点”“好看一点”这类不可验收目标。

退出条件:

- 每条验收标准都能被测试、截图或人工检查验证。

### 3.4 SPEC Contract — 实现合约

输入:

- 已批准 PRD。

必须产出:

- 前端结构: 页面、组件、状态、响应式、图片、a11y。
- API 合约: route、method、schema、auth、错误响应。
- 数据合约: 静态数据、Prisma、fallback、seed/migration。
- 测试合约: unit、API、component、e2e、三视口。

退出条件:

- 开发者不需要猜”该改哪些文件、数据从哪里来、怎么验收”。
- SPEC 包含至少 5 条测试用例（覆盖正常路径 + 3 个边界/错误）。
- 另一个 AI agent 仅凭此 SPEC 即可开始编码，不需要回问。

### 3.5 Implementation Plan — 实施计划

输入:

- PRD + SPEC。

必须产出:

- `docs/plans/<topic>-implementation-plan-<YYYY-MM-DD>.md`
- 任务拆分。
- 文件边界。
- 依赖顺序。
- 每个任务的最小验证命令。
- 回滚方式。

退出条件:

- 任务可以按垂直切片执行，每个切片都能独立验证。

### 3.6 Build Slice — 编码切片

输入:

- Implementation Plan。

执行规则:

- **TDD 前置**: SPEC 中的测试用例清单已转化为测试文件骨架，并验证它们全部 FAIL（RED phase），再开始写实现代码。
- 一次只做一个切片。
- 不跨出计划文件范围，除非先更新 plan。
- 不新增依赖，除非 PRD/SPEC 明确允许。
- 不直接在 RSC 中调用 `prisma.*`。
- UI 遵循 Tailwind v4、Base UI、mobile-first。
- 代码改动完成后立即做最小验证。

退出条件:

- 切片满足对应 AC。
- 没有新增明显 lint/type/runtime 错误。

### 3.7 Test & Visual Review — 测试与视觉审计

输入:

- 已实现切片。

必须执行:

- 相关 unit/API/component/e2e。
- `npm run build`，尤其公开站 SSG 改动。
- UI 改动必须截图 390px / 768px / 1440px。
- 页面表达改动必须做逐帧检查: 用户每一屏是否知道自己在哪里、能做什么、下一步去哪。

必须产出:

- `docs/test-reports/<YYYY-MM-DD>/...`
- 涉及 UI 时补 `docs/design-reviews/...`
- 当天汇总进 `docs/daily/<YYYY-MM-DD>/INDEX.md`

退出条件:

- 通过或明确记录失败项、复现步骤、风险级别。

### 3.8 Fix Loop — 修复循环

触发:

- 测试失败。
- 截图显示布局/表达不达标。
- PRD AC 写得不可验证。
- 线上/预览环境出现和本地不同的问题。

处理顺序:

1. 如果是 PRD 不清楚，回到 PRD Patch。
2. 如果是合约缺失，回到 SPEC Contract。
3. 如果是实现错误，回到 Build Slice。
4. 如果是测试误判，更新 Test Report 并说明原因。

规则:

- 不允许为了让测试过而降低 PRD 标准。
- 不允许静默删除失败测试。
- 不允许把 pre-existing 问题当作本轮回归，但必须记录。

### 3.9 Staging / Online Check — 线上或预览验证

输入:

- 本地测试通过。

必须检查:

- 页面是否 200。
- 核心 CTA 是否可点击。
- 图片是否真实加载。
- API 是否返回统一结构。
- 移动端是否可用。
- 埋点是否没有明显 400/500。

退出条件:

- 线上/预览环境的结果与本地验证一致，或已记录差异。

### 3.10 Ship — 交付

交付内容:

- 改动摘要。
- 影响文件。
- 验证命令和结果。
- 截图/报告位置。
- 已知风险。
- 下一轮建议。

退出条件:

- 接手者可以只看交付说明和文档，就知道做了什么、怎么验证、剩什么。

### 3.11 Retro & Docs Update — 复盘和文档回写

必须回写:

- 如果实现改变了事实，更新 PRD/SPEC。
- 如果发现新技术坑，更新 `AGENTS.md` 或相关 docs。
- 如果新增通用流程，更新 `docs/README.md` 或本文件。
- 如果新增页面/产品，更新索引和路由 source of truth。

退出条件:

- 下一轮 AI 不会因为旧文档再次犯同样错误。

---

## 4. Crowd 使用方式

每个 Crowd 任务卡只允许处于一个阶段。不要把“写 PRD + 改代码 + 上线验证”塞进一张卡。

| 卡片类型 | 输入 | 输出 | 不允许做 |
|---|---|---|---|
| Intake Card | 用户想法/截图 | 问题收口 + 影响范围 | 改代码 |
| PRD Card | Intake + Context Scan | PRD 补丁 | 写实现细节 |
| SPEC Card | 已批准 PRD | 实现合约 | 擅自扩大范围 |
| Plan Card | PRD + SPEC | 任务计划 | 直接编码 |
| Build Card | Plan 的单个切片 | 代码 + 最小验证 | 同时改多个无关模块 |
| Test Card | 已实现切片 | 测试报告 + bug 列表 | 修代码后不记录 |
| Review Card | diff + 报告 | findings | 做大范围重构 |
| Ship Card | 已验证改动 | 交付摘要 | 忽略风险 |

建议 Crowd 看板列:

```text
Inbox
  -> Needs Context
  -> PRD Draft
  -> SPEC Ready
  -> Planned
  -> Building
  -> Testing
  -> Fixing
  -> Ready to Ship
  -> Shipped
  -> Retro Updated
```

---

## 5. 稳定项目的硬规则

### 5.1 Source of Truth

| 事实 | 来源 |
|---|---|
| AI 协作规则 | `AGENTS.md` |
| 产品目标 | `docs/PRD/00_MASTER_PRD.md` |
| 页面级表达 | `docs/PRD/public-site/PAGE_PRD_SYSTEM_2026-06-29.md` |
| 实现合约 | `docs/SPEC/**` |
| 任务计划 | `docs/plans/**` |
| 验证证据 | `docs/test-reports/**`、`docs/design-reviews/**` |
| 当天索引 | `docs/daily/<YYYY-MM-DD>/INDEX.md` |
| 产品路由 | `src/lib/product-routes.ts` |
| 数据 fallback | `src/lib/data.ts` + 静态数据模块 |

### 5.2 Definition of Ready

进入编码前必须满足:

- [ ] 有 PRD 或明确 PRD patch。
- [ ] 有 SPEC 或实现合约。
- [ ] 有 plan。
- [ ] 验收标准可验证。
- [ ] 文件范围明确。
- [ ] 已知 pre-existing 问题已记录。
- [ ] UI 任务已有三视口验收要求。
- [ ] SPEC 中已列出测试用例清单（至少覆盖正常路径 + 3 个边界）。
- [ ] 已创建测试文件骨架并验证它们失败（RED phase）。

### 5.3 Definition of Done

交付前必须满足:

- [ ] 对应 AC 已验证。
- [ ] 相关自动化命令已运行或说明不能运行的原因。
- [ ] UI 已检查 390px / 768px / 1440px。
- [ ] 文档已回写。
- [ ] 没有新增未解释的测试数据、占位文案、假联系方式。
- [ ] 交付说明包含风险和下一步。

---

## 6. 任务大小控制

不稳定项目最怕一次改太多。每轮任务建议限制:

| 类型 | 单轮最大范围 |
|---|---|
| 文档 | 1 个 Master/系统文档，或 1-3 个页面 PRD |
| UI | 1 个页面族，最多 3 个核心组件 |
| API | 1 个资源域，如 stores 或 articles |
| 数据 | 1 个数据模块或 1 个 migration |
| 测试 | 1 个测试面，如 route 可达性或图片状态 |

如果需求超过这个范围，先拆成多个 loop。

---

## 7. 常用 Prompt 模板

### 7.1 Intake Prompt

```text
请按 LANHUI AI Delivery Loop 的 Intake 阶段处理这个想法:

[粘贴想法/截图/问题]

输出:
1. 问题一句话
2. 用户是谁
3. 影响页面/模块
4. 成功标准初稿
5. 非目标
6. 下一步建议进入 PRD / SPEC / Build / Test 哪一阶段
```

### 7.2 PRD Patch Prompt

```text
请基于 AGENTS.md、docs/PRD/00_MASTER_PRD.md 和相关现有 PRD，
把下面想法整理成 PRD patch。

要求覆盖:
- 背景
- 目标
- 非目标
- 修改范围
- 验收标准
- 验证命令
- 风险边界

想法:
[粘贴]
```

### 7.3 Build Slice Prompt

```text
请只执行这个 plan 中的 Task X。

约束:
- 不改无关文件
- 不扩大范围
- 完成后运行最小验证
- 如果发现 PRD/SPEC 不清楚，先停下来回写文档，不要猜

Plan:
[粘贴 plan 链接和 task]
```

### 7.4 Test Prompt

```text
请按 PRD 验收标准测试这个改动，不按实现者意图测试。

输出:
- AC -> 验证方式矩阵
- 命令结果
- 三视口截图/浏览器检查
- bug 列表
- 是否可交付
```

### 7.5 SPEC Contract Prompt

```text
请基于以下 PRD，写出可执行的 SPEC 合约。

要求覆盖 10 节：
1. 职责范围
2. 路由/入口
3. 数据模型（含 Zod/TS 代码块，AI 可直接复制使用）
4. 关键组件（如为前端模块）
5. 业务规则（用"当...时，系统必须..."句式）
6. 错误处理矩阵（错误码 → HTTP → 消息 → details）
7. 测试用例清单（至少 5 个：正常路径 + 3 个边界/错误 + 1 个鉴权，
   格式：AC-ID | 场景 | 输入 | 预期 | 类型）
8. API 合约（含完整请求/响应示例，成功和失败各至少 2 个）
9. 验收条件
10. 已知限制

PRD:
[粘贴]

输出标准：另一个 AI agent 应该能仅凭这份 SPEC 开始编码，不需要回问。
```

---

## 8. 本项目推荐默认 loop

对当前蓝辉项目，默认采用较保守的 2 层循环:

### 外循环: 文档收敛

```text
Idea -> PRD Patch -> SPEC Patch -> Plan
```

用于修复需求混乱、页面表达混乱、技术栈说明冲突。

### 内循环: 小切片交付

```text
Build Slice -> Test -> Fix -> Review -> Ship
```

用于具体代码实现。

只有当外循环稳定后，才进入内循环。否则 AI 会在不稳定需求上快速制造更多不一致。

---

## 9. 立刻适用的下一步

当前项目建议从 3 个 loop 开始:

1. **公开数据清洁 loop**  
   修 `/agent` 和 `/news` 测试内容污染，恢复基础可信度。

2. **产品中心表达 loop**  
   把 `/product` 首屏收敛为“按车型找 / 按项目找”，移动端后置 planned 内容。

3. **车型页缺图与优先级 loop**  
   修 `/product/zeekr` mobile 无 heading 和缺图大块，给车型页加入“首选 3 项”决策层。

每个 loop 都必须单独 PRD/SPEC/Plan/Build/Test，不合并成一个大改版。
