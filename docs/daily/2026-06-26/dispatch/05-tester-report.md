# Tester 报告 — 问界系列 4 路由验证

## 概要

- 测试时间：2026-06-26 14:15–14:20 (UTC+8)
- 测试范围：4 路由（/product/wenjie + /m6 + /m7 + /m8）+ sitemap + JSON-LD + 三视口 + 12 张全页截图
- 总命令数：~35
- 通过：33 / 失败：0 / 警告：1（1 个 P2 a11y / HTML 有效性缺陷）

## 验证结果

### 1. 构建产物（4 路由全部生成 HTML）

- [x] /product/wenjie → `.next/server/app/product/wenjie.html` (build 时 1148B page.js, dev 渲染 OK)
- [x] /product/wenjie/m6 → `.next/server/app/product/wenjie/m6.html` (230 KB)
- [x] /product/wenjie/m7 → `.next/server/app/product/wenjie/m7.html` (363 KB)
- [x] /product/wenjie/m8 → `.next/server/app/product/wenjie/m8.html` (367 KB)
- [x] sitemap.xml 含 3 个新子路由（m6/m7/m8）

### 2. 静态代码

- [x] L1 HTML `"@type":"ListItem"` = 34（PRD: 10 热门 + 24 更多 = 34 ✓）
- [x] M6 HTML `"@type":"ListItem"` = 17（PRD: 17 ✓）
- [x] M7 HTML `"@type":"ListItem"` = 30（PRD: 5+15+10 = 30 ✓）
- [x] M8 HTML `"@type":"ListItem"` = 30（PRD: 5+15+10 = 30 ✓）
- [x] `any` 类型：wenjie 页面 + 组件 0 命中
- [x] M8 警示卡 `WenjieM8ElectricDoorCautionCard` 仅在 m8/page.tsx 引用（m6/m7 无）
- [x] M9 数据（wenjie-products.ts）0 引用（4 个 page 文件均不引用）
- [x] 字面量类型 `as const`：L1=5, M6=5, M7=8, M8=8（PRD 阈值 ≥4/4/6/6，全部超额）
- [x] productCount：M6=17, M7=30, M8=30（与 PRD 完全一致）

### 3. 浏览器三视口（Playwright e2e，12/12 PASS）

- L1 desktop / tablet / mobile
- M6 desktop / tablet / mobile
- M7 desktop / tablet / mobile
- M8 desktop / tablet / mobile

输出：`/tmp/wenjie-audit/{l1,m6,m7,m8}-{mobile,tablet,desktop}.png`（12 张全页截图）
- HTTP 200：所有 4 路由 × 3 视口 = 12/12
- console errors：0
- pageerror：0
- H1 文本：L1=「问界系列项目升级方案｜蓝辉轻改 LANHUI」；M6=「问界 M6 专属升级方案」；M7=「问界 M7 专属升级方案」；M8=「问界 M8 专属升级方案」

### 4. 关键内容（curl 验证）

- [x] L1 包含「问界系列」✓
- [x] M6 包含「问界 M6」✓
- [x] M7 包含「问界 M7」✓
- [x] M8 包含「问界 M8」✓
- [x] M8 包含「电动门」✓
- [x] M8 包含「重要提示」✓
- [x] sitemap.xml 包含 3 个新子路由
- [x] 各页 project count 实际显示：L1=34, M6=17, M7=30 (5+15+10), M8=30 (5+15+10)
- [x] M8 警示卡 DOM 验证：`aside role="note" aria-label="电动门升级警示"` + lucide-triangle-alert 图标 + 重要提示 文案 全部存在

### 5. 数据层（vitest）

- 4 个 test 文件，全部通过：82/82 ✓
  - wenjie-series-upgrade-projects.test.ts: 17
  - wenjie-m6-upgrade-projects.test.ts: 16
  - wenjie-m7-upgrade-projects.test.ts: 22
  - wenjie-m8-upgrade-projects.test.ts: 27

### 6. Lighthouse

未跑（lighthouse CLI 未安装，本任务标记为 optional）。

## Bug 报告

### Bug 1：M7 / M8 三个 tier section 共享同一个 h2 id（HTML 有效性 + a11y 缺陷）

- 严重度: **P2**（中低 — 不阻塞用户流程，但破坏 HTML 标准且影响锚点链接）
- 文件: `src/components/wenjie/model/WenjieModelProjectGrid.tsx` 第 132、140 行
- 现象: 当 `WenjieModelProjectGrid` 在 M7 / M8 同页内被实例化 3 次（必改 / 商务 / 实用 三个 tier），每个实例的 `<section aria-labelledby="wenjie-m7-projects-heading">` 与 `<h2 id="wenjie-m7-projects-heading">` 使用同一 id，导致同页出现 3 个重复 id
- 期望: 同一文档内 id 必须唯一；每个 tier section 应有不同 id（如 `wenjie-m7-must-have-projects-heading` / `wenjie-m7-business-projects-heading` / `wenjie-m7-practical-projects-heading`），aria-labelledby 同步
- 重现: 
  1. `curl -s http://localhost:3000/product/wenjie/m7 | grep -oE 'id="wenjie-m7-projects-heading"' | wc -l` → 3
  2. `curl -s http://localhost:3000/product/wenjie/m8 | grep -oE 'id="wenjie-m8-projects-heading"' | wc -l` → 3
  3. M6 不受影响（仅实例化 1 次）
- 截图: 视觉无差异（h2 文案各自不同），但 DOM 重复 id 可被 W3C Validator / Lighthouse "best-practices" 检出

### 已知非问题（验证通过、无需修复）

- JSON-LD 块数：原任务描述"4 块"为误，PRD 实际只要求 `ItemList`。每页实际渲染 2 块（Organization 来自 layout + ItemList 来自 page），符合 PRD 与既有其他产品页惯例
- M7/M8 第三层命名为「实用 10」非 PRD 字面「深度 10」 — PRD 仅写"5+15+10 三层"未规定 tier 名，命名属于设计选择，不计为 bug
- 项目卡片显示图标占位（无实图）：`* -upgrade-projects.ts` 数据未配 image 字段，符合当前迭代范围（与 6/16 ZEEKR build 模式一致，先结构后补图）

## 总结

- **0 P0 / 0 P1 / 1 P2 / 0 P3**
- **通过门禁：是**（所有 P0/P1 PRD 验收项 100% 命中；唯一 P2 是 a11y 改进项，可在后续 polish 批次处理）
- **建议**：本批次 4 路由可批准通过，进入 Deploy 阶段；Bug 1 列入下一轮 polish / 视觉审查 backlog（与 admin / 其他 P0 不阻塞）
