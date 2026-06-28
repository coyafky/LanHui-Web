# 每日报告 — 2026-06-29

> AI 会话: Claude Code (continued from 2026-06-28)
> 维护: 冯科雅 (Coya)
> 主题: 全站功能测试 PRD + Codex 视觉评判提示词 + 测试脚本实现
> 触发: 用户要求对整个网站进行功能测试和性能测试，并编写 Codex 视觉评判提示词

---

## 一、今日目标

1. **全站测试 PRD** — 编写 `FULL_SITE_TEST_PRD_2026-06-29.md`：覆盖功能 (F1-F4) + 性能 (P1-P3) + 专项 (S1-S4)
2. **Codex 视觉评判提示词模板** — 编写 `CODEX_VISUAL_EVAL_PROMPT_2026-06-29.md`：5 维评分标准 + 批量工作流
3. **实现 3 个测试脚本** — 路由可达性扫描 + 图片状态审计 + API 连通性测试
4. **执行测试并产出报告** — 49 路由扫描 + 24 品牌图片审计 + 13 端点 API probe + 合规 grep

---

## 二、今日提交

| Commit | 消息 | 文件数 | 说明 |
|---|---|---|---|
| `27c5dde` | `feat(test)` | 10 | 全站测试 PRD + Codex 评判提示词 + 3 测试脚本 + 测试报告 |

---

## 三、全站测试 PRD

### 关联文档
- `docs/PRD/cross-cutting/FULL_SITE_TEST_PRD_2026-06-29.md`（350 行）
- `docs/PRD/cross-cutting/CODEX_VISUAL_EVAL_PROMPT_2026-06-29.md`（200 行）

### PRD 结构

| 验收组 | 内容 | 项数 |
|---|---|---|
| AC-F1 | 路由可达性 | 7 标准 |
| AC-F2 | 图片状态审计 | 5 标准 |
| AC-F3 | API 端点连通性 | 6 标准 |
| AC-F4 | Admin 功能流程 | 4 标准 |
| AC-P1~P3 | 性能测试 | 9 标准 |
| AC-S1~S4 | 专项 (SEO/a11y/响应式/合规) | 14 标准 |

### Codex 评判系统

- **5 维评分**: Layout & Space / Color & Theme / Typography / Component Quality / Visual Impact（每维 0-20，总分 0-100）
- **品牌主题色映射**: 12 品牌完整配色表
- **反模式库**: 8 项已知扣分项（purple-pink gradient, missing→空白, 对比度不足等）
- **评判范围**: 15 核心页 × 3 视口 + 20 扩展页 × 1 视口 = 65 份评分

---

## 四、测试脚本

### 1. `scripts/test/functional-suite.mjs`
- Playwright headless chromium 逐页访问全部 49 条公开路由
- 记录 HTTP 状态码、title、h1、console errors、耗时
- 输出 `functional-scan.json` + stdout 摘要

### 2. `scripts/test/image-status-audit.mjs`
- 读取 24 个品牌/车型数据文件，正则提取 `imageStatus` 值
- 按品牌汇总 matched/pending-review/generated-preview/missing 计数
- 输出 `image-status.json` + stdout 表格

### 3. `scripts/test/api-probe.mjs`
- 测试全部 13 API 端点：公开 GET 6 + 公开 POST 1 + auth 拦截 11 + auth 访问 4
- NextAuth v5 CSRF + credentials 登录获取 session cookie
- 输出 `api-probe.json` + stdout 摘要

---

## 五、测试执行结果

### 路由可达性 — ✅ 49/49 全部 200

| 指标 | 值 |
|---|---|
| 公开路由 | 49 |
| 成功 200 | 49 (100%) |
| 404/500 | 0 |
| 无 title | 0 |
| 无 h1 | 0 |
| Console errors | 3 路由（均 /api/analytics/track → 400） |
| 平均耗时 | 2386ms |
| 最慢路由 | /product/wenjie/m6 (8336ms) |

### 图片状态审计 — 481 项统计

| imageStatus | 数量 | 占比 |
|---|---|---|
| `pending-review` | 311 | 64.7% |
| `generated-preview` | 128 | 26.6% |
| `missing` | 42 | 8.7% |
| `matched` | **0** | **0%** |

### API probe — 公开端点通过

| 类别 | 结果 |
|---|---|
| 公开 GET | 6/6 OK (200) |
| 公开 POST (/api/analytics/track) | 0/1 (400) |
| Auth 拦截 (未登录) | 11/11 OK (401/403) |
| Auth 访问 (已登录) | 1/4 OK (POST 写操作 500) |

### 合规检查 — 发现 P1 违规

**禁止词**（6 处）:

| 文件 | 违禁词 |
|---|---|
| `CoreServices.tsx` | 官方 |
| `WhyChooseUs.tsx` (3×) | 官方 |
| `P1ServiceCard.tsx` | 原厂 |
| `FilmServiceMap.tsx` | 原厂 |

**Poster 残留**（WenjieModelPosterStub — 3 文件）:

| 文件 | 说明 |
|---|---|
| `src/app/product/wenjie/m6/page.tsx` | import + 渲染 |
| `src/app/product/wenjie/m7/page.tsx` | import + 渲染 |
| `src/app/product/wenjie/m8/page.tsx` | import + 渲染 |

> 注：06-27 只清理了 Series 层 PosterStub，Model 层遗留。

---

## 六、Bug 汇总

| ID | 严重度 | 简述 |
|---|---|---|
| Bug 4 | **P1** | 6 处禁止词违规（官方/原厂） |
| Bug 5 | **P1** | WenjieModelPosterStub 遗留（M6/M7/M8） |
| Bug 1 | P2 | /api/analytics/track → 400 |
| Bug 2 | P2 | POST 空 body → 500（缺 Zod 友好错误） |
| Bug 3 | P2 | 3 路由 console 400 error（Bug 1 客户端表现） |

---

## 七、未执行验证

- `npm run lighthouse:run` — 全站 Lighthouse 跑分（需 ~60min，可后台跑）
- `npm run screenshot:all` — 全站截图（Codex 评判前置）
- Codex 视觉评判 — 需先产出截图
- Admin 流程测试 — `WITH_ADMIN=true node scripts/test/functional-suite.mjs`
- SEO/a11y/响应式专项 — 需 Lighthouse + axe-core + 截图

---

## 八、遗留问题

- 481 个项目 0 matched — 全站无真实施工照片
- 问界页面性能最差（wenjie/m6 8.3s），需排查图片加载策略
- 6 处禁止词 + PosterStub 残留需修复（P1）
- `/api/analytics/track` 埋点管道阻塞（P2，06-19 已知）
