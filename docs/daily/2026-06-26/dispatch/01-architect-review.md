# Architect 设计审阅 — 问界系列项目升级方案

> **审阅对象**：`docs/plans/wenjie-series-upgrade-implementation-plan-2026-06-26.md` (v0.1)
> **审阅输入**：4 份 PRD（一级 + M6/M7/M8）+ 项目 CLAUDE.md / AGENTS.md
> **审阅类型**：质量审阅（非重新设计）
> **审阅者**：Architect agent
> **日期**：2026-06-26

---

## 0. 审阅范围与方法

本审阅仅对照 plan 与 PRD 之间的一致性、完整性和可执行性。**不**修改 plan 内容，**不**重新设计架构，**不**评估 PRD 自身内容质量。

---

## 1. PRD 一致性检查

### 1.1 一级 vs 二级 PRD 边界

| 维度 | 一级 PRD (`WENJIE_SERIES_UPGRADE`) | 二级 PRD (M6/M7/M8) | 边界判定 |
|---|---|---|---|
| 路由 | `/product/wenjie` | `/product/wenjie-m6`（建议）→ plan 改为 `/product/wenjie/m6` | plan 决策合理（与 product-routes.ts 既有 schema 一致） |
| 内容定位 | "问界系列" 总入口（10 热门 + 24 更多 + 7 场景） | "M6/M7/M8 单车型"（17/30/30 项目） | 边界清晰，**无内容重叠** |
| 服务流程 | 6 步（车型确认→项目选择→到店评估→施工安装→验收交付→售后支持） | 7 步（多一步"方案确认"）| **需 plan 显式声明此差异** |
| metadata title | "问界轻改项目｜车衣、隔热膜、二排铝地板、底盘护板与电动踏板｜蓝辉轻改" | M6/M7/M8 各自不同 | 一致 |
| Hero 副标题 | "专业轻改，安全可靠，提升体验，焕新出行" | 二级"必改产品 / 高级商务升级 / 实用小配件" | 一级与二级副标题不同，符合分层定位 |
| 海报原图尺寸 | 941 × 1672 | M6=1055×1491 / M7=941×1672 / M8=864×1821 | 一致 |

**结论**：一级 / 二级边界清晰，**唯一需澄清的是服务流程步数差异**（一级 6、二级 7）。

### 1.2 三个二级 PRD（M6/M7/M8）项目对比（关键项目）

| 项目 | M6 §7 | M7 §7 | M8 §7 | 一致性 |
|---|---|---|---|---|
| 项目总数 | 17 | 30（5+15+10） | 30（5+15+10） | ✓ |
| 隔热膜 | 02 | 必改 01 | 必改 01 | ✓ |
| 车衣 | 01 | 必改 02 | 必改 02 | ✓ |
| 软包脚垫 | "360 软包脚垫"（05） | "三防软包脚垫"（必改 03） | "三防软包脚垫"（必改 03） | **跨 PRD 命名不一致** |
| 平衡杆 | 07 | 商务 12 | 商务 12 | ✓ |
| 电动踏板 | 04 | 必改 05 | 必改 05 | ✓ |
| 电动门 | 无 | 无 | 商务 10 | ✓ M8 独有 |
| 星空顶 | 无 | 商务 14 | 商务 14 | ✓ |
| 智能头枕 | 无 | 商务 10 | 无 | **M7 独有** |
| 腿托 | 无 | 商务 19 | 商务 19 | ✓ |
| 轮毂 | 无 | 商务 11 | 商务 11 | ✓ |
| 钢化膜 | 15 | 小配件 23 | 小配件 23 | ✓ |
| 牌照框 | 17 | 小配件 22 | 小配件 22 | ✓ |
| 改色 | 无 | 商务 18 | 商务 18 | M6 不涉及；M7/M8 一致 |
| 改色膜（24 项） | — | — | — | **一级 PRD §9.1 写"改色膜"，M7/M8 §7.2 写"改色"** — 命名差异 |
| 内衬 | 无 | 小配件 29 | 小配件 29 | ✓；一级 PRD §9.1 写"挡泥板内衬" — 命名差异 |

### 1.3 数据冲突清单

| 冲突项 | 一级 PRD | 二级 PRD | 处理决策 |
|---|---|---|---|
| 软包脚垫命名 | 未列 | M6=360 / M7+M8=三防 | **数据文件按各自 PRD 保留原名** |
| 改色 vs 改色膜 | 改色膜 | M7/M8 写"改色" | 一级数据用"改色膜"，二级数据用"改色" |
| 内衬 vs 挡泥板内衬 | 挡泥板内衬 | M7/M8 写"内衬" | 一级数据用"挡泥板内衬"，二级数据用"内衬" |
| **product-routes.ts projectCount** | — | m6=30 / m7=32 / m8=30 已写 | **实际 PRD 数据 M6=17 / M7=30 / M8=30** → ⚠ A.1 应**显式修这三个字段** |
| 服务流程步数 | 6 步 | 7 步 | ✓ 可接受（一级独立 6、二级独立 7） |

### 1.4 一级 vs 二级边界判定结论

- **内容不重叠**：一级讲"问界系列热门项目池"（10+24），二级讲"M6/M7/M8 单车型完整项目集"（17/30/30）
- **导航关系**：二级是"主题页子分区"，从一级 SubModelsGrid 跳转
- **数据关系**：一级 24 项 = M6/M7/M8 部分项目并集（24 项不是 M7 专属）
- **风险**：一级 24 项中"电动门"等 M8 专属项目点击后跳到 M8 页

---

## 2. Plan 完整性审阅

### 2.1 已覆盖（✓）— 4 份 PRD 全部验收章节 + 工程验收

| 验收点 | plan 任务 | 备注 |
|---|---|---|
| 一级 10 热门 + 24 更多 + 7 场景 + 6 步 + 6 FAQ | A.2 + B.1-B.8 | ✓ |
| M6 17 项 + 6 场景 + 3 组合 + 7 步 + 7 FAQ | A.3 + D.1-D.8 | ✓ |
| M7 30 项（5+15+10） + 7 场景 + 4 组合 + 7 步 + 8 FAQ | A.4 + E.1-E.2 + D.1-D.7 | ✓ |
| M8 30 项 + 6 场景 + 4 组合 + 7 步 + 8 FAQ + 电动门高亮 | A.5 + F.1-F.2 + D.1-D.7 | ✓ |
| 海报空态 | 4 个 PosterStub | ✓ |
| JSON-LD ItemList | G.7 | ✓ |
| TrackClick 埋点 | G.1-G.5 | ✓ |
| AnchorNav 扩展 | G.6 | ✓ |
| OpenGraph | G.8 | ✓ |
| 字面量类型防漂移 | A.2-A.5 + H.1 | ✓ |
| vitest 单测 + Playwright 三视口 + 内容脚本 + 横向溢出 | H.1-H.6 | ✓ |
| `npm run lint / typecheck / build` | I.1-I.3 | ✓ |
| Worktree 合并 + daily + 截图归档 | J.1-J.3 | ✓ |

### 2.2 缺失 / 弱化

| 问题 | 描述 | 建议 |
|---|---|---|
| **❌ 缺失 — product-routes.ts projectCount 同步** | A.1 只说"检查 `getModelRoute`"，**未提到** m6=30 / m7=32 / m8=30 与新 PRD 数据（17/30/30）不一致 | A.1 应**显式修**：wenjie m6: 30→17 / wenjie m7: 32→30 / wenjie m8: 30→30 |
| **❌ 缺失 — OpenGraph 图片字段处理** | G.8 说"`images: []`"，当前 wenjie/page.tsx:27 有 `images: [wenjieTopicMeta.previewImage]` | G.8 应**显式列出**"移除 `wenjieTopicMeta.previewImage` 引用" |
| **❌ 缺失 — sitemap.xml 同步** | 3 个新子路由未提及 sitemap 注册 | 加 task："同步 `src/app/sitemap.ts` 注册 3 个新子路由" |
| **⚠ 弱化 — JSON-LD ItemList 字段完整性** | G.7 未说明 ListItem 应包含 `position, name, url` | 显式：ListItem 至少含 `position, name` |
| **⚠ 弱化 — trackClick metadata 白名单** | §6 风险已提 PII 风险，但 G.1-G.5 未显式约束 | 加：所有 trackClick 调用 metadata 字段必须从白名单 {projectKey, category, priority, modelKey, topicKey, bundleName, assetType, tier} 选 |
| **⚠ 弱化 — TypeScript `any` 验收** | I.2 写"0 新增 error"，未显式 grep `any` 关键字 | H.3 加 `grep -rE ":\s*any\b" src/...wenjie/ src/...wenjie-*.ts` |
| **⚠ 弱化 — H1/H2 标题层级** | plan 未指定每个组件的 H1/H2 标题层级 | H1=Hero 标题，H2=各 section 标题 |
| **⚠ 弱化 — 旧 `wenjie_model_section_click` 埋点断流** | 一级页移除 anchor nav → 旧事件不再触发 | 加 task：显式声明断流；daily J.1 记录 |
| **⚠ 弱化 — `/api/analytics/track` 服务端白名单** | 现有 type 白名单是否包含新事件名 `wenjie_topic_view` 等未验证 | I.1 / I.2 验收时检查 |

### 2.3 依赖顺序问题

| 任务 | 依赖问题 | 影响 |
|---|---|---|
| **B.5 SubModelsGrid** | 标依赖 A.3/A.4/A.5，实际只依赖各 model projectCount | 弱依赖；B.5 可与 B.1-B.4 并行 |
| **C.1 重写 wenjie/page.tsx** | 标依赖 B.1-B.8，但还需要 A.1 才能让 SSG 找子页 | 应**显式**列入 A.1 依赖 |
| **D.8 / E.2 / F.2** | 标依赖 D.1-D.7，但 D.1-D.7 互相无依赖 | 3 个 Coder 可完全并行 |
| **G.7 JSON-LD** | 未列入 D.8 / E.2 / F.2 依赖 | **应在 4 个 page 任务内显式执行** |
| **G.6 AnchorNav** | 标无依赖 | 见 §3.4 风险 |

### 2.4 验证命令完整性

| 验证项 | plan 包含 | 评估 |
|---|---|---|
| vitest 单元测试 / typecheck / build / lint | ✓ H.1 + I.1-I.3 | 完整 |
| Playwright 三视口 | ✓ H.2 | 完整（12 张截图） |
| 合规红线 grep | ✓ §3 命令 | 完整 |
| TrackClick 端到端 | ✓ H.5 | 完整 |
| 横向溢出检查 | ✓ H.6 | 完整 |
| 海报空态 grep | ✓ H.4 | 完整 |
| `any` 类型 grep | ✗ 缺失 | **建议加** |
| JSON-LD 验证 | ✗ 缺失 | **建议加** |
| sitemap 注册验证 | ✗ 缺失 | **建议加** |

---

## 3. 风险识别

### 3.1 数据迁移风险（旧 `wenjie-products.ts` 44 个数据）

| 风险 | 等级 | 触发条件 | 预防 |
|---|---|---|---|
| 旧数据被意外引用 | 中 | C.1 重写时漏删 `import { wenjieProducts, wenjieProductsByModel }` | H.3 验收脚本 `grep` 应 0 命中（一级页） |
| M9 旧 16 条无去向 | 低 | 用户后续查 | 保留 `wenjie-products.ts` 不删；J.1 daily 显式记录"保留不渲染" |

### 3.2 SEO 风险

| 风险 | 等级 | 触发条件 | 预防 |
|---|---|---|---|
| title 关键词变化 | 中 | "问界改装专题 M7/M8/M9 配件" → "问界轻改项目｜车衣..." 关键词集合变化 | 保留 "M7/M8/M9" 子串到新 title + GA 流量监控一周 |
| JSON-LD 结构变化 | 高 | `ItemList.itemListElement` 从 44 个产品款式 → 34 个（10+24）项目 | 旧 `name=问界改装专题`；新 `name=问界系列项目升级方案` — 两个独立 ItemList |
| OpenGraph images 字段 | 中 | `images: [wenjieTopicMeta.previewImage]` 移除后 OG 分享无图 | G.8 显式注释"待海报资产到位" |
| sitemap.xml 同步 | 中 | 3 个新子路由未注册 | **加 task** |

### 3.3 埋点兼容性风险

| 风险 | 等级 | 触发条件 | 预防 |
|---|---|---|---|
| 旧 `wenjie_page` 埋点断流 | 高 | 新页 4 个路由的 `topicKey` 字段完整性 | G.1 显式 4 页面 RSC 顶部 `trackClick("wenjie_topic_view", { topicKey })` |
| 旧 `wenjie_model_section_click` 埋点断流 | 高 | 旧事件在新页面不再触发 | 显式声明断流是预期；daily J.1 记录 |
| trackClick metadata PII | 中 | coder 自由发挥可能塞入 `user_input` | 显式白名单约束 |

### 3.4 AnchorNav 兼容性风险

| 风险 | 等级 | 触发条件 | 预防 |
|---|---|---|---|
| G.6 扩展破坏旧调用 | 高 | `models: AnchorItem[]` → `navItems: Array<AnchorItem & { group? }>` — 旧 wenjie/page.tsx 调用 `models` 传值，新组件不识别 → 静默 0 个锚点 | G.6 必须**保留向后兼容** |
| 一级页不再用 AnchorNav | 中 | C.1 "删除旧锚点 M7/M8/M9" 后，AnchorNav 在新一级页**无调用** | 显式说明：AnchorNav 是为未来 G.6 准备；或**跳过 G.6**（标记 P3） |

### 3.5 Worktree 合并冲突风险（5 个并行 worktree）

| worktree | 涉及文件 | 与其他 worktree 重叠 | 冲突风险 |
|---|---|---|---|
| **Architect** (A.1-A.5 + G.6) | `src/lib/product-routes.ts` + 4 个新数据文件 + `WenjieAnchorNav.tsx` | G.6 与 Coder 1 共用 | 高 |
| **Coder 1 (一级)** | `src/app/product/wenjie/page.tsx` + 8 个新组件 | `WenjieAnchorNav.tsx` 由 architect 改 | 低 |
| **Coder 2 (M6)** | `src/app/product/wenjie/m6/page.tsx` + 7 个共用组件 | D.1-D.7 共用组件**与 Coder 3/4 同步改** | **极高** |
| **Coder 3 (M7)** | `src/app/product/wenjie/m7/page.tsx` + WenjieModelTierSection | D.1-D.7 共用组件 | 同上 |
| **Coder 4 (M8)** | `src/app/product/wenjie/m8/page.tsx` + ElectricDoorCautionCard | D.1-D.7 共用组件 | 同上 |

**关键冲突点**：
- **D.1-D.7 共用组件**（WenjieModelUpgradeHero / ProjectGrid / Scenarios / Bundles / ServiceFlow / Faq / PosterStub）— 3 个 Coder 都会引用 + 可能调整 prop 接口
- **G.6 AnchorNav 扩展** — Architect 改完，Coder 1 可能用

**建议调整**：
1. **拆分 D.1-D.7 共用组件到 Architect 独占 worktree**（独立 commit），3 个 Coder 只写各自 page.tsx
2. **拆分 G.6 AnchorNav 扩展到 Architect 独占**
3. **共享类型定义 `WenjieModelPageProps`** 由 Architect 在 A.1 后产出

### 3.6 其他风险

| 风险 | 等级 | 触发条件 | 预防 |
|---|---|---|---|
| Worktree 缺 .env | 高 | worktree 创建后未 `cp .env` | plan §6 已显式预防；orchestrator J.2 合并后**第一次 npm install** 必带 |
| macOS APFS 大小写不敏感 | 中 | 新建文件 PascalCase 命名相似 | 全用 PascalCase + 不重名 |
| 字体/颜色漂移 | 中 | 一级 vs 二级 cyan-500/400 不一致 | 全用 `cyan-500/400` |
| shadcn 组件误用 | 中 | coder 偷懒用 shadcn 通用组件 | H.3 验收脚本显式 grep |

---

## 4. 实现优先级建议

### 4.1 P0（必须先做 — 阻塞型）

| 任务 | 理由 | 阻塞谁 |
|---|---|---|
| **A.1 修 product-routes.ts projectCount** | 不修则后续 Coder 数据加载错位 | A.2-A.5 单测 |
| **A.2 / A.3 / A.4 / A.5 数据文件** | 组件依赖 | B.1-B.8 / D.1-D.7 / E.1 / F.1 |
| **D.1-D.7 共用组件**（建议拆给 Architect 独占）| 3 个二级页全部依赖 | Coder 2/3/4 全部 page 任务 |
| **F.1 ElectricDoorCautionCard** | M8 唯一独立组件 | F.2 |
| **J.2 Worktree 合并** | 必须在所有 worktree commit 后 | 所有 Coder |

### 4.2 P1（紧随 P0）

| 任务 | 理由 |
|---|---|
| **B.1-B.8 一级 8 组件** | 一级页依赖 |
| **C.1 重写一级页** | 入口页 |
| **D.8 / E.2 / F.2 重写 3 个二级页** | 子页面 |
| **G.1-G.5 埋点** | 与页面并行 / 紧后 |
| **H.1 vitest 单测** | 数据稳定后立即跑 |
| **I.1-I.3 门禁** | 必跑 |

### 4.3 P2（可后置）

H.2-H.6 测试 + J.1-J.3 收尾。

### 4.4 推荐执行顺序

```
Step 1 (Architect 独占 worktree):
  A.1 → A.2 → A.3 → A.4 → A.5 → D.1-D.7 共用组件 → F.1
  提交后 merge 到 main

Step 2 (Coder 1 一级, worktree-A):
  B.1 → B.2 → B.3 → B.4 → B.5(合并 G.3) → B.6 → B.7 → B.8 → C.1(合并 G.1+G.7)

Step 3 (Coder 2 M6, worktree-B):
  D.8 (合并 G.1+G.7)

Step 4 (Coder 3 M7, worktree-C):
  E.1 → E.2 (合并 G.1+G.7)

Step 5 (Coder 4 M8, worktree-D):
  F.2 (合并 G.1+G.7) + sitemap.xml 同步

Step 6 (Orchestrator merge, main):
  cp .env → npm install → H.1 vitest → I.1 lint → I.2 typecheck → I.3 build
  H.2 三视口 → H.3 内容 → H.4 海报 → H.5 埋点 E2E → H.6 横向
  → J.1 daily → J.2 merge 4 worktree → J.3 归档
```

---

## 5. 任务路由决策

按 dispatch SKILL.md「阶段 2: 任务路由决策」规则：

| Task ID | 任务 | subagent_type | 启动 skill | 理由 |
|---|---|---|---|---|
| **A.1** | 修 product-routes.ts + 补 model 路由 | `coder` | `prisma-data-ops`（动 schema 时） | 数据 / 类型 / 路由表 |
| **A.2-A.5** | 4 个数据文件 | `coder` | `test-driven-development` | 纯数据 + 字面量类型 + 单测 |
| **B.1-B.8** | 一级 8 组件 | `webdesign-engineer` | `frontend-ui-engineering` | UI 组件 / 视觉 |
| **C.1** | 重写 wenjie/page.tsx | `webdesign-engineer` | `frontend-ui-engineering` | 页面级信息架构 / metadata |
| **D.1-D.7** | 二级 7 共用组件 | **Architect 独占** | `frontend-ui-engineering` | 避免 3 Coder 抢占 |
| **D.8** | 重写 m6/page.tsx | `webdesign-engineer` | `frontend-ui-engineering` | 页面级 |
| **E.1** | WenjieModelTierSection | `webdesign-engineer` | `frontend-ui-engineering` | 三层结构 |
| **E.2** | 重写 m7/page.tsx | `webdesign-engineer` | `frontend-ui-engineering` | 页面级 |
| **F.1** | ElectricDoorCautionCard | **Architect 独占** | `frontend-ui-engineering` | M8 唯一独立组件 |
| **F.2** | 重写 m8/page.tsx | `webdesign-engineer` | `frontend-ui-engineering` | 页面级 |
| **G.1-G.5** | 埋点 | `coder` | `incremental-implementation` | trackClick / metadata |
| **G.6** | AnchorNav 扩展 | `coder` | `incremental-implementation` | props 扩展 |
| **G.7** | JSON-LD ItemList | `webdesign-engineer` | `frontend-ui-engineering` | schema.org 结构化数据 |
| **G.8** | OpenGraph | `coder` | `incremental-implementation` | metadata 配置 |
| **G.9** | 埋点一致性审计 | `coder` | `incremental-implementation` | grep 验证 |
| **H.1-H.6** | 测试 | `coder` 或 `tester` | `test-driven-development` | 单元 + e2e |
| **I.1-I.3** | 门禁 | `coder` | `code-review-and-quality` | 门禁 |
| **J.1-J.3** | 收尾 | `coder` + orchestrator | 无 | 文档 + 合并 + 归档 |

**路由分布**：
- **webdesign-engineer**：B + C + D.8 + E + F.2 = **19 个 task**
- **coder**：A + G + H + I + J.1 + J.3 = **22 个 task**
- **Architect 独占**：D.1-D.7 + F.1 = **8 个 task**

---

## 6. Architect 建议（5 条关键修订）

### 建议 1：拆分 D.1-D.7 共用组件到 Architect 独占 worktree（高优先级）

**风险**：D.1-D.7 共用组件（M6/M7/M8 都会用）由 3 个独立 Coder 同步实现 → 极高合并冲突风险
**建议**：D.1-D.7 共用组件 + F.1 + G.6 全部由 **Architect 独占 worktree** 在 Step 1 完成；3 个 Coder 只写各自 page.tsx

### 建议 2：A.1 必须显式修 product-routes.ts projectCount 字段（高优先级）

**当前 plan 缺陷**：A.1 只说"检查 `getModelRoute`"，**未提到** m6=30 / m7=32 / m8=30 与新 PRD 数据（17/30/30）不一致
**建议**：A.1 任务**显式**包含三处修改：
- wenjie m6: projectCount 30 → 17
- wenjie m7: projectCount 32 → 30
- wenjie m8: projectCount 30 → 30（确认即可）

### 建议 3：plan §2.4 加 sitemap.xml 同步 task（中优先级）

**当前 plan 缺失**：4 个新路由需同步注册到 `src/app/sitemap.ts`
**建议**：在 G 阶段或 J 阶段加 task："同步 `src/app/sitemap.ts` 注册 3 个新子路由" — 否则 SEO 收录会漏

### 建议 4：G.6 AnchorNav 扩展应跳过或显式记录（中优先级）

**当前 plan 决策矛盾**：G.6 "扩展 props 兼容旧调用"，但 plan §0.3 提到"一级页面不再使用 anchor nav"
**建议**：
- 选项 A：跳过 G.6（标记 P3，**等未来有需求再做**）
- 选项 B：保留 G.6 但任务描述**显式说明**：当前调用方为零，是为未来扩展做准备

### 建议 5：H.3 verify-wenjie-content.mjs 应加 `any` 关键字 grep（中优先级）

**当前 plan 缺失**：H.3 只 grep 合规红线，**未 grep `any` 关键字**
**建议**：H.3 加一行：
```bash
grep -rE ":\s*any\b" src/app/product/wenjie/ src/components/wenjie/ src/lib/wenjie-*.ts && echo "FAIL: any detected" || echo "PASS: no any"
```

---

## 7. 门禁 1 决议

- [x] **通过（带 5 条修订）** — 计划质量总体合格，建议在进入 `/build` 前应用 §6 建议 1-5

**Orchestrator 采纳决议**：
- ✅ 建议 1：D.1-D.7 + F.1 + G.6 由 Architect 独占（已在 coder agent prompt 中体现）
- ✅ 建议 2：A.1 修 productCount 三处（已在 coder agent prompt 中显式列出）
- ✅ 建议 3：sitemap 同步 task 整合到 F.2（M8 页面最后一次合并时同步）
- ✅ 建议 4：跳过 G.6（P3 标记，未来按需）
- ✅ 建议 5：H.3 加 `any` grep

---

## 8. 审阅总结

**整体判定**：plan 质量**合格**，4 份 PRD 与 45 个 task 的覆盖度达 **95%**；存在 **5 处修订建议**（§6）。

**门禁 1 决议**：通过带 5 条修订。

**关键瓶颈**：
1. D.1-D.7 共用组件的 worktree 归属（建议 Architect 独占）
2. product-routes.ts projectCount 字段（必须修）
3. G.6 AnchorNav 扩展的去留（建议跳过）

---

## 9. 变更记录

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-26 | v0.1 | Architect 设计审阅 — 4 份 PRD + 45 task plan 的一致性 / 完整性 / 风险 / 优先级 / 路由决策 | Architect agent |