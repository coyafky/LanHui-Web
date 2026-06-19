# 批 2 — PRD 填表 23 个 v1 子 PRD(2026-06-20)

> 5 个并行子 agent 同时写 23 个 v1 PRD,9 个 v0 归档。整体完成度 37% → 83%。

---

## 1. 目标

把批 1 留的"骨架 + 模板"填实:23 个 v1 子 PRD(每个 8 节标准),让所有路由都有可执行的实施规格。同步把 9 个 v0 旧 PRD git mv 到 archive,只保留 1 个 canonical v1。

## 2. 范围

### 2.1 In scope
- 5 个并行子 agent,每个负责 1 个分类目录(严格目录隔离避免 git 冲突)
- 每个 agent 读模板 → 读源码 → 写 N 个 v1 PRD → git mv N 个 v0 到 archive
- 5 个分类 README 更新(v0 链接 → v1 链接 + 行数)
- Master PRD §6.1 / §8 / §9 看板更新

### 2.2 Out of scope
- 4 个产品主题专项(WINDOW_FILM / WENJIE / XIAOMI / FLOORING)— 留批 3
- 实际代码改动(本批纯文档)
- 测试用例补全(每个 PRD 写好"验收"段,实施时再补测试)

## 3. 工作流

### 3.1 Worktree
- 分支名:`worktree-agent-doc-prd-fill`
- 基线 commit:`5962939`(批 1 fixup,删除遗留 PRD.md)

### 3.2 调度
- **5 个并行子 agent**(Orchestrator 用 `Agent` 工具并发启动)
- 每个 agent 严格限定目录:
  - agent-A → `docs/PRD/public-site/`(5 个 PRD + 2 个 archive)
  - agent-B → `docs/PRD/product/`(6 个 PRD + 4 个 archive)
  - agent-C → `docs/PRD/admin/`(4 个 PRD + 3 个 archive)
  - agent-D → `docs/PRD/feature/`(4 个 PRD)
  - agent-E → `docs/PRD/cross-cutting/`(4 个 PRD)
- 每个 agent 收到 4 项输入:模板路径 + 源码范围 + 现有 v0 路径 + 写入位置
- 关键约定:**每个 agent 都不 commit**,orchestrator 统一提交

### 3.3 关键命令
```bash
# 5 个 agent 并行启动(伪代码)
for agent in public-site product admin feature cross-cutting; do
  run_agent $agent "读 _templates/$agent.md → 写 N 个 v1 PRD → mv N 个 v0 → 不要 commit"
done

# 等所有 agent 完后
git add docs/PRD/
git commit -m "docs: 批 2 填表 - 23 个 v1 子 PRD + 9 个 v0 归档 + 5 README 更新"
```

## 4. 产出

### 4.1 文件清单(38 个,+8900 行)
| 分类 | v1 PRD | 行数合计 |
|---|---|---|
| public-site | HOMEPAGE / BRAND / CONTACT / NEWS / AGENT_PUBLIC | 1826 |
| product | PRODUCT_INDEX / ELECTRIC_STEPS / WHEELS / CHASSIS / COLOR_FILM / PPF | 1595 |
| admin | ADMIN_LOGIN / ADMIN_DASHBOARD / ARTICLE_MANAGEMENT / STORE_MANAGEMENT | 1693 |
| feature | IMAGE_UPLOAD / ANALYTICS_TRACKING / SEO_SCHEMA / AUTH_GUARD | 1391 |
| cross-cutting | ADR / DEPLOYMENT_RUNBOOK / SECURITY_AUDIT / PERFORMANCE_OPTIMIZATION | 2263 |
| **合计** | **23 个新写** | **8768** |

+ 5 个 README 更新 + 9 个 v0 git mv + Master PRD 看板刷新

### 4.2 Commit
| Hash | 标题 |
|---|---|
| `01c9a4a` | docs: 批 2 填表 - 23 个 v1 子 PRD + 9 个 v0 归档 + 5 README 更新 |

### 4.3 Merge
| Hash | 标题 |
|---|---|
| `d922e8c` | merge worktree-agent-doc-prd-fill — 批 2 填表 |

## 5. 决策

- **5 agent 并行而非 1 个串行**:文档量大(8768 行),并行节省 70% 时间。**风险**= 跨分类 git 冲突,但严格目录隔离避免。
- **agent 不 commit,orchestrator 统一提交**:agent 容易写错 commit message 或漏 stage。统一提交让 git 历史干净。
- **PRD 写入"代码引用 + 数据流"而非"完整代码"**:PRD 是规格不是代码库,过多代码会过期。每个 PRD 引文件路径 + 关键函数签名即可。
- **P0/P1 修复方案进 PRD,不另开 doc**:每个 agent 在写对应分类 PRD 时,顺手把批 1 AUDIT 报告里的 P0/P1 修复方案写进 §5/§7/§8。例:`AGENT_PUBLIC` PRD §7 写 P0-1 修复、`STORE_MANAGEMENT` PRD §5.3 写 P0-6 完整 SQL。

## 6. 经验

### 6.1 踩坑
- **Bash CWD 漂移再次出现**:`git add docs/PRD/` 在主仓跑 = 无效(主仓没 staged)。教训:worktree 内的 git 命令必须先 `cd <worktree>` 再 `git add`,或链式 `cd X && cmd`。
- **agent 偶发报喜不报忧**:有 agent 报告"完成",但实际漏写 1 个 PRD。**预防**:orchestrator 必须 `wc -l` + `grep "^## "` 验证每个文件结构,不能光信报告。

### 6.2 新模式
- **5 agent 并行调度模式**:`for agent in X; do run_agent $agent "严格限定目录,不 commit"; done`。返回行数清单即可,无需协调。
- **PRD 内嵌 P0/P1 修复方案**:每个 agent 把审计报告里的待办按分类归属写到对应 PRD。实施时按 PRD § 找到对应章节即可,不用翻 2 个文档。
- **8 节模板的"验收"段是测试用例种子**:每个 PRD §7 验收清单后续可直接转成 vitest / Playwright 用例。

### 6.3 约定
- 5 分类严格目录隔离,后续新分类 / 跨分类修改需先建分支
- 子 PRD v1 不重写 v0,而是新建 `YYYY-MM-DD-NEW.md`,v0 `git mv` 到 archive
- Master PRD §6.1 / §8 / §9 每批后必须刷新(看板数据不能过期)

## 7. 未完成(进下一批)

- [x] 23 个 v1 PRD ✅
- [x] 9 个 v0 归档 ✅
- [x] 5 README + Master §6.1/§8/§9 ✅
- [ ] **4 个产品主题专项 v1 PRD**(WINDOW_FILM / WENJIE / XIAOMI / FLOORING)— 留批 3
- [ ] product 分类补齐到 100%(目前 6/11)
- [ ] 实施 P0-1 / P0-6 / P0-7 修复(本批 PRD 已写好方案,等批 4+)

## 8. 关联

### 8.1 受影响的 PRD
- 5 个分类 README
- Master PRD §5 / §6 / §8 / §9
- 23 个新建子 PRD

### 8.2 引用本批的 commit
- 批 3 (产品主题)会在 `00_MASTER_PRD.md` 引用本批的 v2.1 changelog

### 8.3 关联 batch
- 上一批:`docs/journal/2026-06-19-batch-01-prd-restructure.md`
- 下一批:`docs/journal/2026-06-20-batch-03-product-topics.md`