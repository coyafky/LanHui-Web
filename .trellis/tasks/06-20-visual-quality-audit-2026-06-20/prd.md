# 官网视觉质量审计 2026-06-20 — PRD

> **Lightweight task · PRD-only.** 已通过 AskUserQuestion 锁定范围、定位、评分体系、输出位置。无需 `design.md` / `implement.md`。
>
> 实施细节见 §6「实施流程」、验收见 §7、流程规范见 `docs/audits/INDEX.md` §2（可直接复用 06-19 截图脚本）。

---

## 1. 概述

**主题**: 官网视觉质量审计（聚焦 UI/UX 设计评分与改版建议）
**类型**: 横切审计（公开站 + admin 后台）
**优先级**: P1（不进 P0 是因为业务功能可用，仅设计质量优化）
**Owner**: 冯科雅（Coya）
**版本**: v0
**最后更新**: 2026-06-20

### 1.1 目标

1. 对官网 10 个公开站核心页 + 5 个 admin 后台核心页做视觉质量评估。
2. 按 **5 维度 × 0-100 分制** 评分（与 06-19 的 4 维度 × 5 分制升级，定位更精细）。
3. 产出 **P0/P1/P2 问题清单 + 改版建议**（不只是评分，要落地）。
4. 与 2026-06-19 全站审计形成互补：那次是性能/可访问性/SEO + 4 维度 5 分制视觉评估；本次是 5 维度 0-100 分视觉评估 + 改版提案。

### 1.2 与 06-19 审计的关系

| 维度 | 2026-06-19 全站审计 | 2026-06-20 本次视觉审计 |
|---|---|---|
| 范围 | 26 路由 × 3 视口（含 5 不可达 404） | 15 核心页 × 2 视口（desktop+mobile） |
| 截图 | 78 张（含失败） | 30 张（聚焦可达） |
| 评分维度 | 可读性 / 一致性 / 响应式 / a11y-视觉 (4 维 × 5 分制) | **布局 / 视觉 / 色彩 / 排版 / 可访问性** (5 维 × 0-100) |
| Lighthouse | ✅ 21 路由 × 2 formFactor | ❌ 不重复（直接引用 06-19 数据） |
| 输出 | `docs/audits/visual/INDEX.md` (表) | **`docs/design-reviews/VISUAL_AUDIT_2026-06-20.md`**（含改版建议） |
| 改版建议 | ❌ | ✅ **P0/P1/P2 清单 + 提案** |
| 工具链 | Playwright + Lighthouse | ui-ux-pro-max + frontend-design + frontend-ui-engineering + browser-testing-with-devtools |

---

## 2. 范围与边界

### 2.1 页面清单（共 15 页 × 2 视口 = 30 张截图）

**公开站（10 页）**:

| # | 路由 | 主题 | 06-19 评级 |
|---|---|---|---|
| P1 | `/` | 首页（Hero 改版后） | 良好 |
| P2 | `/product` | 产品中心入口 | 合格（LCP 6.5s） |
| P3 | `/product/wenjie` | 问界主题 | 差（图片全 pending） |
| P4 | `/product/xiaomi` | 小米主题 | 良好 |
| P5 | `/product/zeekr` | 极氪主题 | 良好（mobile 大量空白） |
| P6 | `/product/flooring` | 地板改装 | 差（perf 59/61） |
| P7 | `/product/window-film` | 窗膜套餐列表 | 优秀（perf 98/96） |
| P8 | `/agent` | 门店列表 | 合格（perf 64/75） |
| P9 | `/news` | 资讯列表 | 优秀（perf 97/93） |
| P10 | `/brand/about` | 关于我们 | （06-19 未评） |

**Admin 后台（5 页）**:

| # | 路由 | 主题 | 06-19 评级 |
|---|---|---|---|
| A1 | `/admin/login` | 登录 | 良好（缺失败文案） |
| A2 | `/admin` | Dashboard | 优秀 |
| A3 | `/admin/analytics` | 数据分析 | 合格（埋点失衡） |
| A4 | `/admin/stores` | 门店管理 | 需修（数据污染） |
| A5 | `/admin/articles` | 文章管理 | 合格（详情 404） |

### 2.2 视口

| 视口 | 宽度 | 用途 |
|---|---|---|
| Desktop | 1440 × 900 | 主视口，全功能评估 |
| Mobile | 390 × 844 | 响应式 + 移动端体验 |

> 跳过 Tablet（06-19 已有，无新增洞察）

### 2.3 不包含（Out of Scope）

- ❌ Lighthouse 性能跑分（直接引用 06-19 `docs/audits/lighthouse/SUMMARY.md`）
- ❌ SEO / CLS / TBT 等技术指标
- ❌ Playwright e2e 功能测试（直接引用 06-19 `e2e/audit-full-site.spec.ts`）
- ❌ 数据库 / API / 表单逻辑评估
- ❌ 5 个不可达 404 路由（已在 06-19 标记为 P0，本次不重复评）
- ❌ Figma / 高保真改版稿（仅出文字版改版建议，不做视觉稿）

---

## 3. 5 维度评分体系（0-100 分制）

### 3.1 维度定义

| # | 维度 | 权重 | 评估焦点 | 来源 skill |
|---|---|---|---|---|
| D1 | **Layout 布局** | 20 | 视觉层级 / 网格对齐 / 留白节奏 / 信息密度 | ui-ux-pro-max §3 |
| D2 | **Visual 视觉** | 20 | Hero 冲击力 / 图片质量 / 微交互 / 装饰克制 | frontend-design §2 |
| D3 | **Color 色彩** | 20 | 主辅色 / 对比度 / 主题色一致性 / dark mode | frontend-design §4 |
| D4 | **Typography 排版** | 20 | 字阶系统 / 行高段距 / 字距字重 / 中英混排 | ui-ux-pro-max §5 |
| D5 | **Accessibility 可访问性** | 20 | WCAG 对比度 / 焦点 / 语义 / 键盘导航 | frontend-ui-engineering §6 + browser-testing-with-devtools |

### 3.2 4 级分制（每维度内部 4 个子项各 5 分）

| 子项 | 分值 | 评估方法 |
|---|---|---|
| 子项 #1 | 5 | 视觉检查（截图） + DevTools 元素审查 |
| 子项 #2 | 5 | 视觉检查 + 设计语言一致性比对 |
| 子项 #3 | 5 | DevTools 检查（computed style / DOM 树） |
| 子项 #4 | 5 | 视觉检查 + 交互测试（hover / focus / keyboard） |

### 3.3 总分换算

```
维度得分 = Σ 子项得分  (0-20)
总分 = Σ 维度得分      (0-100)
```

### 3.4 评级标准（总分）

| 区间 | 等级 | 含义 | 处置 |
|---|---|---|---|
| 90-100 | A 优秀 | 业界领先 | 无需改版 |
| 80-89 | B 良好 | 合格，小问题 | 优化建议（P2） |
| 70-79 | C 合格 | 需优化 | 改进任务（P1） |
| 60-69 | D 待修 | 影响体验 | 必须修（P1） |
| < 60 | E 不可用 | 严重问题 | 立即修（P0） |

### 3.5 P0/P1/P2 问题分级（针对单个问题）

| 优先级 | 标准 | 例子 |
|---|---|---|
| **P0** | 任一维度 < 50 / 关键路径不可用 / WCAG AA 失败影响核心功能 | 首页 Hero 看不见 / 登录按钮无对比度 |
| **P1** | 任一维度 50-69 / 跨页设计不一致 / WCAG AA 边缘值 | 主色不一致 / 移动端留白断裂 |
| **P2** | 任一维度 70-79 / 优化建议 | 字距可调 / 装饰可精简 |

---

## 4. 工具链与 Skill 协同

### 4.1 Skill 角色分工

| Skill | 角色 | 输出 |
|---|---|---|
| **ui-ux-pro-max** | 评分方法论 + 维度定义 | D1 Layout / D4 Typography 评分细则 |
| **frontend-design** | 设计语言基线（CLAUDE.md dark theme）+ 改版建议 | 设计 token 差异表 + 提案骨架 |
| **frontend-ui-engineering** | UI 实现质量（Tailwind v4 / shadcn Base UI） | 可访问性 / 焦点 / 语义审计 |
| **browser-testing-with-devtools** | 浏览器运行时验证 | DevTools 截图 / computed style / 焦点测试 |

### 4.2 技术依赖（npm packages）

- `playwright` — 已装，复用 `scripts/audit/screenshot-all.mjs`
- `lighthouse` — 不跑（直接引用 06-19）
- `axe-core` — **可选**，若需自动 WCAG 检测；默认人工评审

### 4.3 已有可复用资产

- `scripts/audit/screenshot-all.mjs` — 26 路由截图脚本（可裁剪到 15 页）
- `docs/audits/screenshots/` — 78 张历史截图（可与本次对比增量变化）
- `docs/audits/visual/INDEX.md` — 06-19 评分基线（4 维 × 5 分）
- `docs/audits/lighthouse/SUMMARY.md` — 06-19 性能基线（直接引用）

---

## 5. 输出物（Deliverables）

### 5.1 主报告

- `docs/design-reviews/VISUAL_AUDIT_2026-06-20.md` — 主报告
  - 元数据 + 方法论
  - 评分汇总表（15 页 × 5 维度 × 2 视口）
  - P0/P1/P2 问题清单（按页 / 按维度两个维度组织）
  - 改版建议（每页 1-3 条）
  - 与 06-19 对比增量表

### 5.2 索引

- `docs/design-reviews/INDEX.md` — 索引页（指向主报告 + 子报告）

### 5.3 截图归档

- `docs/design-reviews/screenshots/desktop/` — 15 张 desktop 截图
- `docs/design-reviews/screenshots/mobile/` — 15 张 mobile 截图
- 文件命名: `{kind}-{slug}-{viewport}.png`（例: `public-home-desktop.png`、`admin-dashboard-mobile.png`）

### 5.4 评分卡（每页 1 份）

- `docs/design-reviews/scoring/{slug}.md` — 15 份
  - 5 维度子项得分
  - 评分理由（每子项 1-2 句）
  - 截图引用
  - 改版建议（具体到 CSS / Tailwind class / 组件）

### 5.5 改版提案汇总

- `docs/design-reviews/PROPOSALS.md` — 改版提案
  - 按 P0/P1/P2 排序
  - 每项含: 所属页面 / 维度 / 当前问题 / 建议改法 / 估时 / 优先级

### 5.6 不输出

- ❌ Figma 视觉稿（仅文字版）
- ❌ 代码 patch / PR（改版建议给后续 `/build` 任务消费）

---

## 6. 实施流程

### 6.1 阶段划分

| Phase | 时长（估） | 任务 |
|---|---|---|
| **P1 准备** | 10 min | 创建 `docs/design-reviews/` 目录 + 复制 06-19 截图脚本裁剪版本 |
| **P2 截图** | 15 min | 启动 dev server → 跑 15 页 × 2 视口截图 → 保存到目标目录 |
| **P3 评分** | 60 min | 用 4 个 skill 协同评 15 页 × 5 维度，每页产出评分卡 |
| **P4 整合** | 30 min | 汇总到主报告 + INDEX + PROPOSALS |
| **P5 自检** | 15 min | 复核评分一致性 + 改版建议可执行性 |

总计: ~2 小时（单人串行）

### 6.2 关键命令

```bash
# 准备目录
mkdir -p docs/design-reviews/{screenshots/{desktop,mobile},scoring}

# 启动 dev server（后台）
npm run dev > /tmp/dev.log 2>&1 &
sleep 10  # 等就绪

# 跑截图（裁剪到 15 页 × 2 视口）
# 复用 scripts/audit/screenshot-all.mjs 的 viewport 配置，限制路由列表
BASE_URL=http://localhost:3000 node scripts/audit/screenshot-15.mjs

# 评分（人工 / AI 协同）
# 读截图 → 用 ui-ux-pro-max + frontend-design 评分 → 写 docs/design-reviews/scoring/*.md

# 整合
# 汇总 → docs/design-reviews/VISUAL_AUDIT_2026-06-20.md
```

### 6.3 复用 06-19 截图脚本的策略

06-19 脚本 `scripts/audit/screenshot-all.mjs` 默认扫所有 26 路由。本次裁剪方案:

1. **复制脚本**: `cp scripts/audit/screenshot-all.mjs scripts/audit/screenshot-15.mjs`
2. **改路由列表**: 删掉 5 个不可达路由 + 不评的次要页（保留 15）
3. **改视口**: 从 `[1440, 768, 390]` 改为 `[1440, 390]`
4. **改输出目录**: `screenshots/` → `docs/design-reviews/screenshots/`

> **不直接修改原脚本**：保留 06-19 完整审计的可重复性。

### 6.4 评分流程（每页）

1. **读 2 张截图**（desktop + mobile）
2. **D1 Layout**: 用 ui-ux-pro-max 评估视觉层级 / 网格 / 留白 / 密度（20 分）
3. **D2 Visual**: 用 frontend-design 评估 Hero / 图片 / 微交互 / 装饰（20 分）
4. **D3 Color**: DevTools 取 computed color → 比对设计 token（CLAUDE.md dark theme = zinc-950/900/800 + orange-500/400 + blue-400）（20 分）
5. **D4 Typography**: DevTools 取 font-family / size / line-height / letter-spacing → 比对字阶（20 分）
6. **D5 A11y**: DevTools 检查 `:focus-visible` 样式 / 语义 HTML / 键盘 Tab 顺序（20 分）
7. **写评分卡**: `docs/design-reviews/scoring/{slug}.md`
8. **发现问题**: P0/P1/P2 各记入 PROPOSALS.md

---

## 7. 验收标准（DoD）

### 7.1 产出物完整性

- [ ] `docs/design-reviews/VISUAL_AUDIT_2026-06-20.md` 存在，含评分汇总表 + 问题清单 + 改版建议
- [ ] `docs/design-reviews/INDEX.md` 索引存在
- [ ] 15 张 desktop 截图 + 15 张 mobile 截图 = **30 张 PNG** 全部存在
- [ ] 15 份评分卡 `docs/design-reviews/scoring/*.md` 全部存在
- [ ] `docs/design-reviews/PROPOSALS.md` 含 P0/P1/P2 至少各 1 条

### 7.2 评分质量

- [ ] 每页 5 维度评分理由 ≥ 50 字
- [ ] 每条 P0/P1/P2 改版建议含：所属页 / 维度 / 当前问题 / 建议改法 / 估时
- [ ] 评分与 06-19 评级不矛盾（同一页评级变化需在主报告中说明理由）

### 7.3 可执行性

- [ ] 改版建议可被后续 `/build` 任务直接消费（无需再读截图）
- [ ] 主报告可独立阅读（不依赖 06-19）

### 7.4 流程合规

- [ ] 报告头部标注数据采集时间 + 评分方法 + 工具链
- [ ] 与 06-19 审计的差异在主报告 §「与 06-19 对比」明确列出
- [ ] 不修改 06-19 既有资产（screenshots / INDEX.md / SUMMARY.md）

---

## 8. 风险与缓解

| 风险 | 缓解 |
|---|---|
| 评分主观性（不同评分者结果不同） | 4 个 skill 协同 + 明确子项分制 + 评分卡含具体理由 |
| 截图脚本 bug（5 个不可达路由仍被截图） | 裁剪脚本只列 15 个可达路由 |
| DevTools 检查遗漏（computed style 不准确） | 同时读 DOM 树 + 源文件（双验证） |
| 评分耗时超预期（15 页 × 5 维度 = 75 项） | 分阶段交付：先 P0 紧急页（wenjie / flooring / agent）+ admin 全部，再补剩余 |
| 与 06-19 评级冲突 | 主报告「与 06-19 对比」章节逐条说明 |

---

## 9. 任务清单（Backlog）

| ID | 任务 | 估时 | 状态 |
|---|---|---|---|
| T1 | 准备目录 + 裁剪截图脚本 | 10 min | ⚪ |
| T2 | 启动 dev server + 跑 30 张截图 | 15 min | ⚪ |
| T3 | 评公开站 10 页 × 5 维度 + 写评分卡 | 40 min | ⚪ |
| T4 | 评 admin 5 页 × 5 维度 + 写评分卡 | 20 min | ⚪ |
| T5 | 汇总主报告 + INDEX + PROPOSALS | 30 min | ⚪ |
| T6 | 自检 + 提交 | 15 min | ⚪ |

总计: ~2.2 小时

---

## 10. 变更记录（CHANGELOG）

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-20 | v0 | 初稿（基于 AskUserQuestion 锁定范围 / 维度 / 输出位置） | Coya |

---

## 附录 A: 设计基线（CLAUDE.md dark theme）

```
背景:   zinc-950 / zinc-900 / zinc-800
强调:   orange-500 / orange-400
辅助:   blue-400
主题色: xiaomi=orange · wenjie=cyan · zeekr=orange · flooring=amber
字号:   Tailwind 默认（text-sm / base / lg / xl / 2xl / 3xl / 4xl）
行高:   Tailwind leading-tight / normal / relaxed
字距:   默认 tracking-normal
字体:   系统字体栈（无外部字体）
```

任何偏离上表的「设计 token」应在评分卡中标记。

## 附录 B: 与 06-19 审计的对应关系

| 06-19 维度 | 本次维度 | 差异 |
|---|---|---|
| 可读性 | Typography（D4）+ Layout（D1） | 拆分为排版和布局，更细 |
| 视觉一致性 | Color（D3）+ Visual（D2） | 拆分为色彩和视觉元素 |
| 响应式健壮性 | Layout（D1）+ Visual（D2） | 拆分为布局合理性和移动端视觉 |
| 可访问性-视觉层 | Accessibility（D5） | 保持独立维度，分值扩大 |

---

## 附录 C: Skill 调用顺序（执行时参考）

```
1. ui-ux-pro-max       → 加载 D1 Layout / D4 Typography 评估框架
2. frontend-design     → 加载 CLAUDE.md 设计 token + dark theme 规范
3. browser-testing-with-devtools → DevTools 验证 computed style / 焦点
4. frontend-ui-engineering → a11y / 语义 / 键盘导航审计
```

> Skill 调用非强制，可视任务复杂度灵活组合。