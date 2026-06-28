# PRD-2026-06-29 全站功能与性能测试

> 状态: 规划中
> 关联: `docs/PRD/cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md`（前序审计）、`docs/PRD/cross-cutting/PERFORMANCE_OPTIMIZATION_PRD_2026-06-20.md`
> 触发: Coya 要求对整个网站进行功能测试和性能测试，并编写 Codex 视觉评判提示词
> 方法: Playwright 全路由可达性扫描 + Lighthouse 跑分 + Codex 5 维视觉评分

---

## 0. 元信息

| 项 | 值 |
|---|---|
| 日期 | 2026-06-29 |
| 触发 | 全站功能测试 + 性能测试 + Codex 视觉评判 |
| 范围 | 81 条公开路由 + 13 API 端点 + 12 品牌专题 + 6 服务线 + admin 10 页 |
| 方法 | Playwright 可达性扫描 + Lighthouse 性能 + Codex 视觉评分 |
| 预期耗时 | 截图 10 分钟 + Lighthouse 60 分钟 + Codex 评判 TBD = 约 2-3 小时 |
| 是否阻断 | 否（只报告，不阻塞现有开发流程） |

---

## 1. 背景与目标

### 1.1 背景

自 2026-06-19 全站首次审计以来，新增了大量品牌专题页：

| 批次 | 日期 | 新增品牌 | 新增页面数 |
|---|---|---|---|
| 问界模型页 | 06-22~26 | M6/M7/M8 重写 | 3 |
| 小米全系列+SU7+YU7 | 06-27~28 | su7/yu7 | 3 |
| 极氪 8X/9X | 06-23 | 8x/9x | 2 |
| 理想 ONE/i6/i8/L9/MEGA | 06-27 | one/i6/i8/l9/mega | 5 |
| Tesla | 06-26 | tesla | 1 |
| 小鹏 GX | 06-26 | xpeng/gx | 2 |
| NIO ES8 | 06-27 | nio/es8 | 2 |
| 腾势 D9 | 06-24 | denza/d9 | 2 |
| 岚图梦想家 | 06-25 | voyah/dreamer | 2 |
| 高山 8 | 06-25 | gaoshan/8 | 2 |
| 乐道 L90 | 06-24 | ledao/l90 | 2 |
| 智界 V9 | 06-25 | zhijie/v9 | 2 |

**06-19 审计时只有 26 条路由，现在已扩展到 81 条。** 上次审计的 P0/P1 问题部分已修复，但新增页面未经过系统的功能和性能审查。

### 1.2 目标

1. **功能验证**: 81 条路由全部可达，无 404/500，无 console error
2. **图片审计**: 全品牌 imageStatus 统计 + UI 一致性检查
3. **API 健康**: 13 端点全部正确响应，权限校验到位
4. **性能基线**: 更新全站 Lighthouse 跑分，产出 Top 10 LCP 瓶颈
5. **视觉评判**: 产出 Codex 可用的页面视觉评判提示词模板
6. **合规检查**: 禁止词 + Poster 代码 + a11y + SEO

### 1.3 非目标

- **不修复**任何发现的问题（本 PRD 只定义测试范围和验收标准）
- **不新增**npm 依赖
- **不修改**业务代码
- **不评估**admin 视觉质量（admin 只做功能流程测试）
- **不跑** `npm run lint`（pre-existing 1227+ errors 来自 worktree 误提交）

---

## 2. 测试范围

### 2.1 公开站路由（71 条）

#### 首页与品牌（4）

| 路由 | 渲染 |
|---|---|
| `/` | SSG |
| `/brand` | SSG |
| `/brand/certifications` | SSG |
| `/brand/history` | SSG |

#### 新闻（2 + 3 ISR 展开）

| 路由 | 渲染 |
|---|---|
| `/news` | ISR |
| `/news/[slug]` | ISR + generateStaticParams |

#### 联系（1）

| 路由 | 渲染 |
|---|---|
| `/contact` | SSG |

#### 代理（4 + ~180 ISR 展开）

| 路由 | 渲染 |
|---|---|
| `/agent` | ISR |
| `/agent/[slug]` | ISR |
| `/agent/[slug]/[city]` | ISR |
| `/agent/store/[id]` | ISR |

#### 产品服务线（10）

| 路由 |
|---|
| `/product` |
| `/product/ppf` |
| `/product/color-film` |
| `/product/window-film` |
| `/product/window-film/[packageSlug]` |
| `/product/flooring` |
| `/product/chassis` |
| `/product/electric-steps` |
| `/product/wheels` |
| `/product/skid-plate` |
| `/product/floor-mats` |
| `/product/business-comfort` |

#### 产品品牌专题（35）

| 品牌 | 路由 | 项目数 | imageStatus 状态 |
|---|---|---|---|
| 问界 | `/product/wenjie`, `/m6`, `/m7`, `/m8` | 44+ | pending-review / generated-preview |
| 小米 | `/product/xiaomi`, `/su7`, `/yu7` | 42 | **全部 missing** |
| 极氪 | `/product/zeekr`, `/8x`, `/9x` | 38+ | generated-preview |
| 理想 | `/product/li-auto`, `/one`, `/i6`, `/i8`, `/l9`, `/mega` | 80+ | pending-review / generated-preview |
| Tesla | `/product/tesla` | 42 | generated-preview |
| 小鹏 | `/product/xpeng`, `/gx` | 15 | generated-preview |
| NIO | `/product/nio`, `/es8` | 18 | generated-preview |
| 腾势 | `/product/denza`, `/d9` | ~15 | pending-review |
| 岚图 | `/product/voyah`, `/dreamer` | ~17 | pending-review |
| 高山 | `/product/gaoshan`, `/8` | ~12 | pending-review |
| 乐道 | `/product/ledao`, `/l90` | ~12 | pending-review |
| 智界 | `/product/zhijie`, `/v9` | ~15 | pending-review |

### 2.2 Admin 路由（10 条，功能流程测试）

| 路由 | 测试内容 |
|---|---|
| `/admin/login` | 登录表单、失败提示、CSRF |
| `/admin` | Dashboard 渲染（KPI/图表/Todo 非空壳） |
| `/admin/analytics` | 分析页渲染、埋点数据展示 |
| `/admin/articles` | 文章列表、发布/草稿过滤 |
| `/admin/articles/new` | 新建文章编辑器 |
| `/admin/articles/[id]` | 编辑已有文章 |
| `/admin/stores` | 门店列表、状态过滤 |
| `/admin/stores/new` | 新建门店表单 |
| `/admin/stores/[id]` | 编辑门店 |
| `/admin/stores/[id]/image` | 图片上传页 |

### 2.3 API 端点（13 条）

| 端点 | 公开 GET | 需登录写 | 权限 |
|---|---|---|---|
| `/api/articles` | ✅ GET | POST | editor |
| `/api/articles/[id]` | ✅ GET | PUT/DELETE | editor(写)/admin(删) |
| `/api/articles/categories` | ✅ GET | — | — |
| `/api/stores` | ✅ GET | POST | admin |
| `/api/stores/[id]` | ✅ GET | PUT/DELETE | admin |
| `/api/stores/[id]/[action]` | — | POST | admin |
| `/api/analytics/track` | — | POST | 公开(限流) |
| `/api/analytics/stats` | — | GET | admin |
| `/api/regions` | ✅ GET | — | — |
| `/api/cities` | ✅ GET | — | — |
| `/api/provinces` | ✅ GET | — | — |
| `/api/upload` | — | POST | admin |
| `/api/auth/[...nextauth]` | — | POST | 公开 |

---

## 3. 功能测试规格

### AC-F1: 全站路由可达性

> 81 条路由全部返回 200（admin 未登录应 302→login）

**方法**: Playwright headless chromium，逐页 `page.goto()`

**脚本**: `scripts/test/functional-suite.mjs`

```javascript
// 核心逻辑（ESM）
import { chromium } from 'playwright';
import { collectAllRoutes } from '../audit/lib/collect-routes.mjs';

const browser = await chromium.launch();
const page = await browser.newPage();
const results = [];

for (const route of routes) {
  try {
    const res = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
    const title = await page.title();
    const h1 = await page.$eval('h1', el => el.textContent).catch(() => null);
    const consoleErrors = []; // 从 page.on('console') 收集
    results.push({ route, status: res.status(), title, h1, consoleErrors });
  } catch (err) {
    results.push({ route, status: 'error', error: err.message });
  }
}
```

**验收标准**:

| # | 标准 | 判定 |
|---|---|---|
| F1.1 | 71 条公开路由全部 200 | `/news/[slug]` 已知 pre-existing bug 除外 |
| F1.2 | 0 条路由 404（不含已知 `/news/[slug]`） | |
| F1.3 | 0 条路由 500 | |
| F1.4 | 每个公开页有非空 `<title>` | |
| F1.5 | 每个公开页有至少 1 个 `<h1>` | |
| F1.6 | 无 console.error（排除 next/font preload 警告） | |
| F1.7 | admin 路由未登录时重定向到 /admin/login | |

### AC-F2: 图片状态全站审计

> 12 品牌专题页的 imageStatus 统计 + UI 一致性

**脚本**: `scripts/test/image-status-audit.mjs`

**统计维度**:

| imageStatus | 含义 | UI 期望 |
|---|---|---|
| `matched` | 真实施工图 | Next/Image 正常渲染 |
| `generated-preview` | AI 预览图 | 图片正常 + "预览图" 角标 |
| `pending-review` | 有图未审核 | pending 占位符（非空白） |
| `missing` | 无图资源 | dashed border + ImageIcon + "图片待补充" |

**验收标准**:

| # | 标准 |
|---|---|
| F2.1 | 产出 12 品牌 × 4 imageStatus 计数表 |
| F2.2 | `missing` 项确认组件统一渲染 dashed border + ImageIcon |
| F2.3 | `pending-review` 项确认组件有 pending 占位（非空白） |
| F2.4 | `generated-preview` 项确认 "预览图" 角标存在 |
| F2.5 | 同一品牌内 imageStatus 不混用（比如 Series 和 SU7 都用 `missing` 时应一致的 UI） |

### AC-F3: API 端点连通性

> 全部 13 端点正确响应，权限校验到位

**脚本**: `scripts/test/api-probe.mjs`（增强已有脚本）

**验收标准**:

| # | 标准 |
|---|---|
| F3.1 | 公开 GET 端点全部 200 + 正确 JSON `{ success, data }` |
| F3.2 | 写端点未登录时 401 |
| F3.3 | `editor` 不能调 admin-only 端点（`/api/stores` POST/PUT/DELETE） |
| F3.4 | `POST /api/analytics/track` 限流 60/min/IP |
| F3.5 | `GET /api/stores` 不返回 draft 门店给未登录用户 |
| F3.6 | `GET /api/articles` 不返回 draft 文章给未登录用户 |

### AC-F4: Admin 功能流程

> 登录后的关键用户路径

复用 `e2e/admin-store-status.spec.ts` 模式。

**验收标准**:

| # | 标准 |
|---|---|
| F4.1 | 登录 → Dashboard 渲染 KPI 卡片/图表/Todo（非空壳） |
| F4.2 | 文章: 新建草稿 → 编辑 → 发布 → 公开站可见 |
| F4.3 | 门店: 新建草稿 → 审核通过 → 公开站可见 → 停用 |
| F4.4 | 设置页: 3 tab 正常切换，表单可保存 |

---

## 4. 性能测试规格

### AC-P1: 全站 Lighthouse 跑分

**方法**: `npm run lighthouse:run`（复用 `scripts/audit/lighthouse-run.mjs`）

**验收标准**:

| # | 标准 |
|---|---|
| P1.1 | 全部 71 条公开路由 mobile + desktop 跑分完成 |
| P1.2 | 产出 `/` 页面各维度得分: Performance, A11y, Best Practices, SEO |
| P1.3 | 产出 `docs/test-reports/2026-06-29/lighthouse-SUMMARY.md` |
| P1.4 | 统计 perf < 80 的路由列表 |
| P1.5 | CLS 维持 0（全站 Next/Image + aspect-ratio 策略） |

**性能基线参考（2026-06-19）**:

| 路由 | perf_m | perf_d | 目标 |
|---|---|---|---|
| /product/flooring | 59 | 61 | P1 修复 |
| /brand/certifications | 63 | 77 | P1 修复 |
| /agent | 64 | 75 | P1 修复 |
| / (root) | 69 | 75 | P2 |
| /product | 76 | 76 | P1 |
| /brand/certifications | 63 | 77 | P1 修复 |

### AC-P2: LCP 深度排查

**脚本**: `scripts/test/lcp-deep-dive.mjs`

**验收标准**:

| # | 标准 |
|---|---|
| P2.1 | 列出 Top 10 LCP 瓶颈路由 |
| P2.2 | 每个瓶颈标注 LCP 元素（Hero 图/标题/背景） |
| P2.3 | 标注是否已加 `priority` / `fetchPriority="high"` |
| P2.4 | 输出修复建议清单（给 `/build` 消费） |

### AC-P3: 图片策略审计

**脚本**: 嵌入 `lcp-deep-dive.mjs` 或独立脚本

| # | 标准 |
|---|---|
| P3.1 | Next/Image vs `<img>` 使用率统计 |
| P3.2 | `sizes` 属性正确率（mobile-first） |
| P3.3 | WebP 覆盖率 |
| P3.4 | 未优化的 >500KB 大图清单 |

---

## 5. 专项检查

### AC-S1: SEO 检查

| # | 标准 |
|---|---|
| S1.1 | 全站 meta title/description 不重复 |
| S1.2 | 品牌专题页有 JSON-LD ItemList（项目数 > 0 的页面） |
| S1.3 | FAQ 页有 JSON-LD FAQPage schema |
| S1.4 | sitemap.xml 包含所有公开路由 |
| S1.5 | canonical URL 正确 |
| S1.6 | Open Graph + Twitter Card 标签完整 |

### AC-S2: a11y 检查

**方法**: axe-core 自动化扫描

| # | 标准 |
|---|---|
| S2.1 | 15 核心页 axe-core 扫描（排除 pre-existing 问题） |
| S2.2 | 键盘导航: 所有交互元素可 Tab 到达 |
| S2.3 | `:focus-visible` 焦点指示器可见 |
| S2.4 | 图片 alt 文本覆盖率 ≥ 90% |

### AC-S3: 响应式检查

**方法**: 3 视口截图 + 人工对比

| # | 标准 |
|---|---|
| S3.1 | 390/768/1440 三视口无横向滚动 |
| S3.2 | 无内容溢出/截断 |
| S3.3 | 移动端导航可用（hamburger 展开/收起） |

### AC-S4: 合规检查

**方法**: grep 扫描 src/ 目录

| # | 关键词 | 预期命中 |
|---|---|---|
| S4.1 | `官方\|原厂\|100%无损\|4S 店` | 0 |
| S4.2 | `poster_expand_click\|poster_asset_view\|PosterStub` | 0 |

---

## 6. Codex 视觉评判系统

### 6.1 评判范围

**核心页（3 视口评判）**:
- `/` (首页)
- `/product` (产品中心)
- `/product/wenjie`, `/product/wenjie/m8` (问界)
- `/product/xiaomi`, `/product/xiaomi/su7`, `/product/xiaomi/yu7` (小米)
- `/product/zeekr`, `/product/zeekr/9x` (极氪)
- `/product/li-auto`, `/product/li-auto/i6` (理想)
- `/product/tesla` (Tesla)
- `/product/nio/es8` (NIO)
- `/product/xpeng/gx` (小鹏)
- `/product/flooring` (地板)
- `/product/window-film` (窗膜)

**扩展页（仅 desktop）**:
- 其余品牌页、服务线页、品牌/新闻/代理页

### 6.2 5 维评分标准

#### 1. Layout & Space (布局与空间, 0-20)

考察信息密度、留白、视觉层级、网格对齐。

| 分数 | 标准 |
|------|------|
| 17-20 | 信息层级清晰，留白得当，网格对齐一致 |
| 13-16 | 基本合理，少数 section 间距不统一或信息过密 |
| 9-12 | 部分区域杂乱或空白过大，层级混乱 |
| 0-8 | 布局崩溃、错位、内容溢出视口 |

#### 2. Color & Theme (色彩与主题, 0-20)

考察品牌色使用、暗色主题一致性、对比度、撞色问题。

**品牌主题色映射**:

| 品牌 | Tailwind | 色值 |
|------|----------|------|
| 问界 | cyan-400/500 | #22d3ee / #06b6d5 |
| 小米 | orange-400/500 | #fb923c / #f97316 |
| 极氪 | orange-400/500 | 同上（与小米撞色） |
| 理想 | amber-400/500 | #fbbf24 / #f59e0b |
| Tesla | red-500/600 | #ef4444 / #dc2626 |
| NIO | sky-400/500 | #38bdf8 / #0ea5e9 |
| 小鹏 | emerald-400/500 | #34d399 / #10b981 |
| 腾势 | blue-400/500 | #60a5fa / #3b82f6 |
| 岚图 | violet-400/500 | #a78bfa / #8b5cf6 |
| 高山 | teal-400/500 | #2dd4bf / #14b8a6 |
| 乐道 | green-400/500 | #4ade80 / #22c55e |
| 智界 | indigo-400/500 | #818cf8 / #6366f1 |
| 服务线 | blue/orange/amber | 按品类 |

**反模式（扣分项）**:
- purple-pink gradient（cliché）
- 主题色与品牌不匹配
- 文字对比度不足（text-zinc-600 在 bg-zinc-950 上）

#### 3. Typography (排版, 0-20)

考察字号层级、行高、字重、文本可读性。

| 问题 | 扣分 |
|------|------|
| 标题/正文层级不清 | -2~-4 |
| 行高过密(< 1.5)或过疏 | -2 |
| 全大写滥用 | -1 |
| 正文 < 14px 难读 | -2 |
| 中英混排未加空格 | -1 |

#### 4. Component Quality (组件质量, 0-20)

考察卡片/按钮/表格/表单的一致性和精细度。

重点检查:
- 卡片 shadow/border/圆角与设计系统一致
- 按钮 hover/active/focus-visible 状态完整
- 图片容器 `aspect-[4/3]` 统一
- imageStatus 各态 UI 反馈合理（missing → dashed border + ImageIcon，非空白）
- 空态/加载态/错误态有反馈

#### 5. Visual Impact (视觉冲击力, 0-20)

考察整体观感的独特性、品牌辨识度、"stunning" 感。

**反模式（扣分项）**:
- 纯文字堆砌，无视觉层次
- "模板感" — 缺乏品牌特征
- content-free 装饰（纯 CSS silhouette 无实际信息）
- Hero 区过于简单（仅标题+文字）

### 6.3 评分输出格式

```markdown
## 视觉评审 — [页面名称] — [视口]

| 维度 | 得分 | 评级 |
|------|------|------|
| Layout & Space | /20 | |
| Color & Theme | /20 | |
| Typography | /20 | |
| Component Quality | /20 | |
| Visual Impact | /20 | |
| **总分** | **/100** | ** [A-E]** |

评级: A 90-100 / B 80-89 / C 70-79 / D 60-69 / E < 60

### 亮点 (3-5 项)
1. ...

### 问题 (P0/P1/P2)
| 级别 | 问题 | 修复建议 |
|------|------|----------|
| P0 | ... | ... |

### 跨视口一致性
- Desktop ↔ Tablet: [一致/有问题]
- Tablet ↔ Mobile: [一致/有问题]
- 内容隐藏/重排: [合理/有问题]

### 一句话总结
[这个页面给人的整体印象]
```

### 6.4 汇总报告

所有页面评分完成后，汇总到 `docs/design-reviews/VISUAL_AUDIT_2026-06-29.md`：

- 评分分布（A/B/C/D/E 各多少页）
- 平均分 Top 5 / Bottom 5
- P0 问题汇总
- 与前次审计（2026-06-20）对比

---

## 7. 产出文件清单

| 文件 | 类型 | 说明 |
|---|---|---|
| `docs/PRD/cross-cutting/FULL_SITE_TEST_PRD_2026-06-29.md` | PRD | 本文档 |
| `docs/PRD/cross-cutting/CODEX_VISUAL_EVAL_PROMPT_2026-06-29.md` | 工具 | Codex 视觉评判提示词模板（独立文件，可直接复制给 Codex） |
| `docs/test-reports/2026-06-29/TEST_REPORT_2026-06-29.md` | 报告 | 总测试报告（功能+性能+专项） |
| `docs/test-reports/2026-06-29/functional-scan.json` | 数据 | 路由可达性原始数据 |
| `docs/test-reports/2026-06-29/lighthouse-SUMMARY.md` | 报告 | 全站 Lighthouse 跑分汇总 |
| `docs/test-reports/2026-06-29/lcp-analysis.md` | 报告 | LCP 瓶颈 Top 10 + 修复建议 |
| `docs/design-reviews/VISUAL_AUDIT_2026-06-29.md` | 报告 | Codex 视觉评判汇总报告 |
| `scripts/test/functional-suite.mjs` | 脚本 | 全站路由可达性扫描 |
| `scripts/test/image-status-audit.mjs` | 脚本 | 图片状态审计 |
| `scripts/test/lcp-deep-dive.mjs` | 脚本 | LCP 深度分析 |

---

## 8. 执行步骤

### Step 1: 环境准备
```bash
mkdir -p scripts/test docs/test-reports/2026-06-29
# 确认 dev server 运行在 :3000
lsof -i :3000 || npm run dev &
```

### Step 2: 功能测试
```bash
node scripts/test/functional-suite.mjs
node scripts/test/image-status-audit.mjs
node scripts/test/api-probe.mjs
```

### Step 3: 性能测试
```bash
npm run lighthouse:run
node scripts/test/lcp-deep-dive.mjs
```

### Step 4: 专项检查
```bash
# a11y
npx playwright test e2e/audit-full-site.spec.ts

# 合规 grep
grep -rE '官方|原厂|100%无损|4S店' src/ --include='*.tsx' --include='*.ts'
grep -rE 'poster_expand_click|poster_asset_view|PosterStub' src/ --include='*.tsx' --include='*.ts'

# 响应式截图
npm run screenshot:all
```

### Step 5: Codex 视觉评判
1. 收集截图到 `docs/design-reviews/screenshots/2026-06-29/`
2. 将 `docs/PRD/cross-cutting/CODEX_VISUAL_EVAL_PROMPT_2026-06-29.md` 的提示词逐页填入截图路径
3. 发给 Codex 评判
4. 汇总评分到 `docs/design-reviews/VISUAL_AUDIT_2026-06-29.md`

---

## 9. 约束条件

- 复用已有 `scripts/audit/` 脚本体系（`collect-routes.mjs`、`screenshot-all.mjs`、`lighthouse-run.mjs`）
- 不引入新 npm 依赖
- 测试脚本存 `scripts/test/`（新建目录），不污染 `scripts/audit/`
- 报告按 `docs/test-reports/2026-06-29/` 归档
- TypeScript strict，禁止 `any`
- 脚本为 ESM（`.mjs`）
- 复用已有 MSW handlers 做 API mock（如需要）

---

## 10. 风险边界

| 风险 | 缓解 |
|---|---|
| 构建产物 `/news/[slug]` 404（pre-existing） | 已在 AC-F1.1 排除，不作为新 bug |
| `npm run lint` 1227+ pre-existing errors | 本次不跑 lint |
| `npx tsc --noEmit` 9 pre-existing errors | 已知，不影响业务代码 |
| Lighthouse 耗时 ~60 分钟 | 可在后台跑 |
| Codex 评判结果主观性 | 5 维度结构化评分 + 反模式检查减少主观偏差 |
| 部分 ISR 路由（/agent/[slug]/[city]）需展开 | 复用 `collect-routes.mjs` 自动展开 |
| Admin 功能测试需登录态 | Playwright 自动登录 admin/admin123 |

---

## 11. 关联文档

- [AUDIT_AND_REGRESSION_PRD_2026-06-19.md](./AUDIT_AND_REGRESSION_PRD_2026-06-19.md) — 前序审计 PRD
- [PERFORMANCE_OPTIMIZATION_PRD_2026-06-20.md](./PERFORMANCE_OPTIMIZATION_PRD_2026-06-20.md) — 性能优化 PRD
- [DESIGN_SYSTEM_ALIGNMENT_PRD_2026-06-21.md](./DESIGN_SYSTEM_ALIGNMENT_PRD_2026-06-21.md) — 设计系统对齐 PRD
- [../../design-reviews/VISUAL_AUDIT_2026-06-20.md](../../design-reviews/VISUAL_AUDIT_2026-06-20.md) — 前序视觉审计报告
- [../../test-reports/README.md](../../test-reports/README.md) — 测试报告规范
