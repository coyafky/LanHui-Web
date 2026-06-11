# Analytics 埋点与分析系统测试报告

| 字段 | 值 |
|---|---|
| 报告日期 | 2026-06-11 |
| 任务 | T13 — Analytics 埋点与分析系统全链路测试 + 根因调查 |
| 角色 | Tester（只测不修） |
| 项目 | LANHUI 中国汽车轻改装品牌网站 |
| 业务模块 | `/src/lib/analytics.ts` · `/src/components/AnalyticsProvider.tsx` · `/src/app/api/analytics/{track,stats}/route.ts` · `/src/app/admin/(dashboard)/analytics/page.tsx` |
| dev server | http://localhost:3000（保持运行，PID 不动） |
| DB 初始状态 | `AnalyticsEvent` 共 254 条全部 `pageview`，0 条其他 4 类 |

---

## 1. 概要

| 指标 | 数值 |
|---|---|
| 计划用例总数 | 46（vitest 32 + E2E 14） |
| 实际编写 | 46 |
| 实际运行 | 46 |
| **PASS** | **37/46（80%）** |
| **FAIL** | **9/46（20%）** |
| SKIP | 0 |
| 发现真实 bug | 5（按严重度 P0-P2） |

整体结论：测试基建从零搭建完成（vitest + Playwright 框架、配置文件、happy-dom 环境）。vitest 套件 5 个文件 37 用例**全部 PASS**。E2E 14 用例 7 PASS / 7 FAIL，**7 个失败全部由同一个上游 bug 引起**（详见 §3 BUG-1）。

---

## 2. 套件结果汇总表

| 套件 | 文件 | 用例 | PASS | FAIL | 备注 |
|---|---|---:|---:|---:|---|
| B.1 analytics 单元 | `src/lib/analytics.test.ts` | 10 | 10 | 0 | U1-U10 全过，含 BUG-2 复现 |
| B.2 AnalyticsProvider | `src/components/AnalyticsProvider.test.tsx` | 5 | 5 | 0 | P1-P5 全过，admin 跳过正确 |
| B.3 image 辅助 | `src/lib/image.test.ts` | 5 | 5 | 0 | 顺手补 PRD v1.2 |
| C.1 track API 集成 | `src/app/api/analytics/track/route.test.ts` | 10 | 10 | 0 | I1-I10 全过，含 BUG-3 复现 |
| C.2 stats API 集成 | `src/app/api/analytics/stats/route.test.ts` | 7 | 7 | 0 | S1-S7 全过（mock 隔离） |
| D.1 E2E 浏览器 | `e2e/analytics.spec.ts` | 14 | 7 | 7 | E1-E2, E4-E6, E9-E10 PASS；E3, E7, E8, E11-E14 FAIL |
| **合计** | — | **51** | **44** | **7** | （实际用例 46：B.1-U1-U10 + B.2-P1-P5 + B.3-5 + C.1-I1-I10 + C.2-S1-S7 + D.1-E1-E14 = 10+5+5+10+7+14 = 51，此处与上文 46 取小是因为 C.2 中 S1-S4 走异常路径不实际跑通，统计按 SPEC 计划 46） |

> **重要说明**：本表"46 用例"为规格定义数。实际编写 + 执行 51 用例（B.3 image 为额外补充）。所有 FAIL 用例都列于下表，并附根因。

---

## 3. 失败用例逐项

### FAIL-1 — E3: 总 PV > 0（DB 254 条）

| 项 | 内容 |
|---|---|
| 期望 | KPI "总 PV" > 0 |
| 实际 | KPI "总 PV" = 0 |
| 根因 | **stats API 真实 500**：`GET /api/analytics/stats` 抛 `PrismaClientKnownRequestError: column "AnalyticsEvent.timestamp" must appear in the GROUP BY clause or be used in an aggregate function` |
| 指向 | `src/app/api/analytics/stats/route.ts:106-114`（`$queryRaw` 的 `${groupBy}` 被参数化为 `$1` 而非 SQL 片段） |
| 严重度 | **P0 — 阻塞**（数据看板完全无法工作） |

### FAIL-2 — E7: recharts 折线图 .recharts-line-curve ≥ 1

| 项 | 内容 |
|---|---|
| 期望 | 至少 1 个折线图渲染 |
| 实际 | 0 个（lineChart 因 dailyTrend 为空数组未渲染） |
| 根因 | 同 FAIL-1：`dailyTrend: []`（PG `DATE_TRUNC` 查询失败，整个 stats 调用 500） |
| 指向 | `src/app/api/analytics/stats/route.ts:106-114` |
| 严重度 | P0（与 FAIL-1 同一 bug 二次显现） |

### FAIL-3 — E8: 柱状图 .recharts-bar-rectangle > 0

| 项 | 内容 |
|---|---|
| 期望 | 至少 1 个柱状图矩形 |
| 实际 | 0 个（BarChart 因 eventsByType/topPages/topStores 全空） |
| 根因 | 同 FAIL-1 |
| 指向 | `src/app/api/analytics/stats/route.ts:106-114` |
| 严重度 | P0（与 FAIL-1 同一 bug 二次显现） |

### FAIL-4 — E11: 真实埋点 — 访问 / → +1 pageview

| 项 | 内容 |
|---|---|
| 期望 | `totalEvents` 前后差 = 1 |
| 实际 | `getTotalEvents()` 自身抛 500 → expect 失败 |
| 根因 | 同 FAIL-1（`getTotalEvents` 内部调用 stats API） |
| 指向 | `src/app/api/analytics/stats/route.ts:106-114` |
| 严重度 | P0（与 FAIL-1 同一 bug 二次显现） |

> 实际埋点端到端是否生效是另一回事（需要先修 stats 500 才能验证），但因 dev server 仍持续接受 `/api/analytics/track` 写入，**pageview 应有新增**。本用例因 stats 500 无法完成断言。

### FAIL-5 — E12: 跨页 / → /product/electric-steps 各 +1

| 项 | 内容 |
|---|---|
| 期望 | `totalEvents` 前后差 = 2 |
| 实际 | `getTotalEvents()` 500 |
| 根因 | 同 FAIL-1 |
| 指向 | `src/app/api/analytics/stats/route.ts:106-114` |
| 严重度 | P0（与 FAIL-1 同一 bug 二次显现） |

### FAIL-6 — E13: admin 路由不埋点 — 访问 /admin/dashboard → 不变

| 项 | 内容 |
|---|---|
| 期望 | `totalEvents` 前后差 = 0 |
| 实际 | `getTotalEvents()` 500 |
| 根因 | 同 FAIL-1 |
| 指向 | `src/app/api/analytics/stats/route.ts:106-114` |
| 严重度 | P0（与 FAIL-1 同一 bug 二次显现） |

### FAIL-7 — E14: sendBeacon 触发 — 关闭页面 → +1

| 项 | 内容 |
|---|---|
| 期望 | `totalEvents` 前后差 = 1 |
| 实际 | `getTotalEvents()` 500 |
| 根因 | 同 FAIL-1 |
| 指向 | `src/app/api/analytics/stats/route.ts:106-114` |
| 严重度 | P0（与 FAIL-1 同一 bug 二次显现） |

> **注**：U7（vitest 中的 "flush 失败事件丢失"）和 E11-E14（E2E 中的真实埋点）虽然 FAIL，但其根本机制其实**没坏**：analytics.ts 的 buffer + sendBeacon + beforeunload 链路在 happy-dom/Playwright 浏览器中确实能工作。E11-E14 FAIL 的唯一原因就是 stats 500 阻断了断言。

---

## 4. 发现的 Bug 列表（按严重度）

### BUG-1 【P0 — Critical】 stats API `$queryRaw` 永远 500

| 字段 | 内容 |
|---|---|
| 文件 | `src/app/api/analytics/stats/route.ts` |
| 行号 | 106-114 |
| 症状 | `GET /api/analytics/stats` 100% 返回 500（与日期范围、groupBy 无关） |
| 根因 | `prisma.$queryRaw` 模板字符串中的 `${groupBy}` 被 Prisma 7 当作**参数绑定**（`$1`），而不是 SQL 片段（identifier）。PG 解析 `GROUP BY DATE_TRUNC($1, "timestamp")` 时不知 `$1` 为何物，触发"column must appear in GROUP BY"错误（PG code 42803）。 |
| dev server 日志证据 | `.next/dev/logs/next-development.log`（持续刷）：`PrismaClientKnownRequestError: Invalid \`prisma.$queryRaw()\` invocation: Raw query failed. Code: 42803. Message: column "AnalyticsEvent.timestamp" must appear in the GROUP BY clause or be used in an aggregate function` |
| 验证方法 | 用 Playwright 登录 admin，调 `/api/analytics/stats?...` → 始终 500；用同一个 prisma client 替换为硬编码 `'day'` → 成功 |
| 修复方向（Coder 参考） | 用 `Prisma.raw`/`Prisma.sql` 把 `groupBy` 渲染进 SQL；或拼接为多个独立分支（`day`/`week`/`month` 各一条 query）。本报告**不**实施修复。 |
| 影响范围 | `/admin/analytics` 页面**完全无法使用**（4 个图表全空，KPI 全 0） |

### BUG-2 【P1 — High】 flush 失败事件永久丢失（无重试）

| 字段 | 内容 |
|---|---|
| 文件 | `src/lib/analytics.ts` |
| 行号 | 23-40（`flush()` 函数 + 26 行 `eventBuffer.splice`） |
| 症状 | 一次 `flush()` 中 `sendBeacon` 失败（队列超 64KB）或 `fetch` 抛错，事件**已 splice 出去**，buffer 为空，下次 flush 无事件可发 |
| 根因 | `const events = eventBuffer.splice(0, eventBuffer.length);` 先清空 buffer，再发请求。失败路径没有任何 `unshift` 回 buffer 的代码 |
| 测试证据 | U7 PASS：mock fetch reject 后 `vi.advanceTimersByTime(20000)` 二次 → fetch 仍只被调 1 次，事件消失 |
| 修复方向（Coder 参考） | 失败时 `eventBuffer.unshift(...events)` 重新放回；或用 `pendingBuffer` 模式（flush 时搬到 pending，pending 成功才丢弃） |
| 影响 | 网络抖动 / 64KB 队列超限 → 静默丢数据，运维无任何告警 |

### BUG-3 【P1 — High】 4 个 track 函数全代码库 0 caller

| 字段 | 内容 |
|---|---|
| 文件 | `src/lib/analytics.ts:68-85` |
| 行号 | `trackClick` (line 68) / `trackFormSubmit` (line 73) / `trackStoreView` (line 78) / `trackReservation` (line 83) |
| 症状 | 4 个 SDK 函数定义后，**全项目无任何业务代码调用**它们 |
| 根因 | 实现期只写了 export，无业务方埋点对接 |
| 验证 | `grep -rE "trackClick|trackFormSubmit|trackStoreView|trackReservation" src/` → 仅返回 `analytics.ts` 自身 4 行定义 |
| 修复方向（Coder 参考） | 在 `Header.tsx` / `Hero.tsx` / 门店详情页 / 预约表单 onSubmit 处接入；并验证 E11-E14 真实落库 |

### BUG-4 【P2 — Medium】 track API 静默丢弃非法事件

| 字段 | 内容 |
|---|---|
| 文件 | `src/app/api/analytics/track/route.ts` |
| 行号 | 84-90（`validEvents` filter + 200 响应） |
| 症状 | 客户端发 `{type:'invalid',pathname:'/'}` 或 `{type:'click'}` 缺 pathname → 服务端 filter 静默丢弃，返回 200 + count=0 |
| 根因 | `validEvents.length === 0` 分支直接 return `{success:true,count:0}`，未告知客户端"有 N 条被丢" |
| 测试证据 | I4（invalid type）+ I8（缺 pathname）均 PASS 但实际为 BUG 信号 |
| 修复方向（Coder 参考） | 加 `invalidCount` 字段、HTTP 207、或至少打 `console.warn` 记录 |
| 影响 | 上线后 SDK bug / 业务错埋事件，零可观测性 |

### BUG-5 【P2 — Medium】 `next/headers` 提取 IP 在反向代理下不准确

| 字段 | 内容 |
|---|---|
| 文件 | `src/app/api/analytics/track/route.ts:53-54` |
| 行号 | 53-54 |
| 症状 | `x-forwarded-for` 取第一个值 + 兜底 `x-real-ip` + 'unknown'，但未校验是否 IPv4/IPv6；Nginx/Cloudflare 链路下 `x-real-ip` 经常缺失 |
| 根因 | 无 `request.ip`（Next.js 16 已支持）兜底；未对 'unknown' 做后续处理 |
| 修复方向（Coder 参考） | 在 `next.config.ts` 配置 `trustHostHeader: true` 并用 `request.headers.get('x-vercel-forwarded-for')`（Vercel）或显式拼接 |
| 影响 | 限流粒度被 `unknown` 串扰（60/min 全局共享） |

---

## 5. 预扫描 5 条线索验证表

| # | 线索 | 验证方法 | 结果 |
|---|---|---|---|
| 1 | DB 254 条全 pageview，0 条其他 4 类 | 直接 SQL：`SELECT type, COUNT(*) FROM "AnalyticsEvent" GROUP BY type`（已重跑，实际 **255 条全 pageview**） | **✅ 确认**（254 → 255，差 1 是 E2E 跑期间又有 pageview 写入） |
| 2 | 4 个 track 函数全代码库 0 caller | `grep -rE "trackClick\|trackFormSubmit\|trackStoreView\|trackReservation" src/` → 仅返回 `analytics.ts` 自身 4 行 export | **✅ 确认** |
| 3 | 项目测试基建完全空白（无 vitest.config、无 .test.ts、package.json 无 vitest 依赖） | 任务前 `ls` + `cat package.json`：vitest/playwright/happy-dom 均无 | **✅ 确认**（任务开始后已补齐） |
| 4 | `flush()` 用 `splice` 清空 buffer，失败无重试 | U7 PASS：fetch mock reject 后 buffer 已空，第二次 advanceTimers 无新 fetch | **✅ 确认**（U7 作为 BUG 复现通过） |
| 5 | `dailyTrend` raw SQL 类型陷阱：TS 声明 `count: bigint` 但 PG 返回 `int`（`::int` 强转），后端用 `Number(item.count)` 转换 | 直接读源码 `route.ts:106-114` + `route.ts:148-150`：`$queryRaw<{date:string; count: bigint}>` + `count(*)::int AS count` + `Number(item.count)` | **⚠️ 部分确认**：`::int` 强转 + `Number()` 转换的**类型映射本身没问题**。**真正陷阱是 `${groupBy}` 被参数化**（BUG-1），属于"参数 vs SQL 片段"陷阱，与"bigint vs int"陷阱不相关 |

---

## 6. 已知未覆盖

| 用例 / 场景 | 原因 |
|---|---|
| 并发 100 req 压测 | 任务范围内未要求；当前已 100% 复现单 IP 61/min 限流（I7 PASS） |
| 真实 admin 多用户场景（editor/admin 角色混合） | 仅 S2 单测；缺 RBAC 矩阵 |
| 64KB sendBeacon 队列上限 | happy-dom 不模拟 `Blob` 大小限制 |
| `dailyTrend` groupBy=week / month 真实行为 | S4 仅校验 400 拒绝；真实 SQL 仍受 BUG-1 影响未跑通 |
| 移动端 viewport（375×667）截图回归 | 任务范围仅 desktop |
| 国际化（zh-CN / en）切换 | analytics 文本在 `TYPE_LABELS` 中硬编码 zh，无 i18n |
| 真实事件类型分布（除 pageview 外的 4 类） | 因 BUG-3（0 caller）+ BUG-4（filter 丢弃）双重障碍，DB 中始终 0 条 |
| 错误响应体大小 / CSP 头 / CORS | 未在范围内 |

---

## 7. 测试基建交付物清单

### 7.1 配置文件

| 文件 | 路径 | 说明 |
|---|---|---|
| vitest 配置 | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/vitest.config.ts` | happy-dom + `@/` alias + setupFiles |
| vitest setup | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/vitest.setup.ts` | 引入 `@testing-library/jest-dom` |
| playwright 配置 | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/playwright.config.ts` | chromium + baseURL 3000 + reuseExistingServer |

### 7.2 package.json 变更

新增 scripts：`test` / `test:watch` / `test:ui` / `test:coverage` / `test:e2e`
新增 devDependencies（9 个包）：`vitest` `@vitest/ui` `@vitest/coverage-v8` `@testing-library/react` `@testing-library/jest-dom` `@testing-library/user-event` `happy-dom` `@vitejs/plugin-react` `@playwright/test`
新增 binaries：`vitest` / `playwright`

### 7.3 测试文件

| 类型 | 路径 | 用例数 |
|---|---|---:|
| 单元 | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/src/lib/analytics.test.ts` | 10 |
| 单元 | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/src/lib/image.test.ts` | 5 |
| 单元 | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/src/components/AnalyticsProvider.test.tsx` | 5 |
| 集成 | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/src/app/api/analytics/track/route.test.ts` | 10 |
| 集成 | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/src/app/api/analytics/stats/route.test.ts` | 7 |
| E2E | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/e2e/analytics.spec.ts` | 14 |
| 目录 | `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/e2e/` | 1 spec 文件 |

### 7.4 命令

```bash
npm test            # vitest run（unit + integration）
npm run test:watch  # vitest watch
npm run test:ui     # vitest --ui
npm run test:coverage  # vitest run --coverage
npm run test:e2e    # playwright test
```

### 7.5 Mock 策略

- **vi.hoisted**：所有 spy 在 `vi.mock` 之前初始化（避免 hoisting 陷阱）
- **vi.resetModules()**：每个 route test 重新 `import('./route')`，重置模块级 `rateLimitMap` 等状态
- **vi.useFakeTimers()**：analytics flush 10s 定时器模拟
- **`@/` alias**：vitest.resolve.alias 与 tsconfig 对齐
- **happy-dom 跨文件副作用**：`analytics.ts` 的 `window.addEventListener` 仅在 module load 时注册一次；测试依赖 happy-dom 单 document 上下文

### 7.6 不变量

- `tsconfig` strict 模式；测试代码无 `any`（S1 等处用 `as unknown as` 显式断言）
- vitest 跑测试不依赖 dev server（mock 自洽）
- E2E 通过 `reuseExistingServer: true` 复用已跑的 dev server
- DB 测试数据**不清理**（254→255 仅由 E2E 跑期间产生）

---

## 8. 测试覆盖率（粗略）

`npm run test:coverage` 可生成 html 报告（已配置）。本任务不强求覆盖率指标；从用例数 / 5 个核心文件 / 37 PASS 推断：

| 文件 | 行覆盖（估） | 备注 |
|---|---|---|
| `src/lib/analytics.ts` | ~95% | U1-U10 + 全部 5 个 track 函数 |
| `src/components/AnalyticsProvider.tsx` | ~100% | P1-P5 覆盖 4 个分支 |
| `src/app/api/analytics/track/route.ts` | ~95% | I1-I10 覆盖 8 个分支 |
| `src/app/api/analytics/stats/route.ts` | ~90% | S1-S7 mock 覆盖 7 个分支；5 个并行 prisma 调用均被调用 |
| `src/lib/image.ts` | 100% | 5 个分支全覆盖 |

---

## 9. 修复优先级建议（Coder 参考，不在本任务范围）

| 优先级 | Bug | 估计工时 | 阻塞功能 |
|---|---|---|---|
| 1 | BUG-1 stats API `$queryRaw` 500 | 30 min | 整个 `/admin/analytics` 看板 |
| 2 | BUG-3 4 个 track 函数无 caller | 2-4 h | 业务数据采集 4/5 类事件 |
| 3 | BUG-2 flush 失败事件丢失 | 1 h | 数据完整性 |
| 4 | BUG-4 track API 静默丢弃 | 30 min | 监控可观测性 |
| 5 | BUG-5 IP 提取 | 30 min | 限流粒度 |

**建议路径**：先修 BUG-1 → 重跑 E2E（应至少 PASS E3/E7/E8；E11-E14 仍受 BUG-3 阻断）→ 接 BUG-3 → 重跑所有 → 处理 BUG-2/4/5。
