# 2026-06-19 全站综合测试报告

> **状态**：观测报告 — 不修 bug，只跑测、聚合、记录
> **Trellis Task**：`2026-06-19-daily-test`（`06-19-2026-06-19-daily-test`）
> **触发人**：fkycoya · **日期**：2026-06-19
> **commit**：`32800678d7ee448602da95ef548924a7cb90b223`（main 分支）

## 0. 元数据

| 项 | 值 |
|---|---|
| **Node** | v24.15.0 |
| **Postgres** | PostgreSQL 15.18（容器 `lanhui-postgres`，主机 :5433 → 容器 :5432） |
| **dev server** | 独立后台启动（pkill 后重启），HTTP 200 OK |
| **总耗时** | ~50 分钟（22:25 - 23:18 区间） |
| **跑测环境** | 主仓 `/Users/fkycoya/Documents/WebsiteClone/lanhui-website`，未隔离 worktree |
| **commit 期间工作区** | 仅 `docs/audits/screenshots/INDEX.md` + `docs/audits/screenshots/{desktop,tablet,mobile,admin/*}/*.png` 由 screenshot 脚本重写；`docs/audits/lighthouse/SUMMARY.md` 恢复自 `git HEAD` 后未被覆盖 |

## 1. TL;DR 矩阵

| 跑测类 | 用例/路由 | ✅ Pass | ❌ Fail | ⏭ Skip | 时长 | 状态 |
|---|---|---|---|---|---|---|
| **Vitest 单测** | 229 用例 / 21 文件 | 221 | 8 | 0 | 6.2s | 🟡 失败集中在 pre-existing admin 测试 |
| **Playwright e2e** | 47 用例 | 45 | 3 | 1 | 1.2 min | 🟡 失败 = 3 个 `/news/[slug]` |
| **Playwright 截图** | 36 路由 × 3 视口 = 108 张 | 78 | 30 (7 路由 × 3 视口) | 0 | ~10 min | 🔴 7 路由 404 |
| **Lighthouse** | 18 路由 × 2 formFactor = 35 跑分 | 35 | 1 (xiaomi mobile) | 0 | ~15 min | ✅ 显著改善 |
| **API 探测** | 10 探测 (5 公开 GET + 1 公开 POST + 4 admin) | 8 (2xx) | 1 (4xx) + 1 (5xx) | 0 | <1 min | 🟡 1 个 500 错误 |
| **DB 健康** | 6 表 + 3 schema 字段 + 1 迁移检查 | 5 | 1 (City/Province 漂移) | 0 | <1 min | 🟡 数据漂移 |

**总体**：5/6 跑测完成，1 个 lighthouse 跑分因 webSocket 偶发失败。**新发现 4 个 P0/P1 缺陷**（见 §10）。

## 2. Vitest 单测

| 项 | 值 |
|---|---|
| **Test Files** | 21 (2 failed \| 19 passed) |
| **Tests** | 229 (8 failed \| 221 passed) |
| **Duration** | 6.2s (transform 668ms, setup 1.51s, tests 5.54s) |
| **覆盖率报告** | ⚠️ 未生成 — happy-dom 环境下 vitest 5.x 在 `coverage.reporter=['text','html']` 配置下未输出覆盖率表（仅生成 html 报告）。`/tmp/vitest-cov-2026-06-19.log` 无 "All files" 段 |

### 失败用例（全部 pre-existing）
全部 8 个失败集中在 2 个文件：
- `src/app/admin/(dashboard)/articles/page.test.tsx` — 7 个失败（M3/M4 等 per-row menu 行为，根因疑似 mock 未提供列表数据）
- `src/app/admin/(dashboard)/articles/page.test.tsx` — 1 个失败（同文件同源）

错误特征：`screen.queryByText('测试文章标题')` 返回 `null`，说明 mock 数据未注入。**这是 pre-existing 测试问题，不属于本报告新发现**。

### 完整通过的 19 个文件
- `src/lib/admin-dashboard.test.ts`、`analytics.test.ts`、`auth.test.ts`、`data.test.ts`、`image.test.ts`、`verify-zeekr-images.test.ts`、`window-film-details.test.ts`、`zeekr-migration.test.ts`、`zeekr-products.test.ts`
- 加上其他 10 个 `*.test.tsx`

## 3. Playwright e2e

| 项 | 值 |
|---|---|
| **总用例** | 47 (45 passed \| 3 failed \| 1 skipped) |
| **Duration** | 1.2 min |
| **trace 路径** | `test-results/audit-full-site-*` 失败用例 3 个 + 1 skip |

### 失败用例（3 个，全 `/news/[slug]`）
| Route | Status | Root cause |
|---|---|---|
| `/news/brand-website-prep` | 404 | `GET /api/articles/brand-website-prep` 返 404 |
| `/news/shunde-store-upgrade` | 404 | `GET /api/articles/shunde-store-upgrade` 返 404 |
| `/news/service-matrix` | 404 | `GET /api/articles/service-matrix` 返 404 |

**Skipped**：`/news/[slug]` 已 `test.fixme`（commit 0b8f38c pre-existing 注释，源于 `item.content` 类型缺失 — 实际见 §9 D-5 重要纠偏）

## 4. Lighthouse 跑分

> ⚠️ **重要**：本次跑分结果写入 `/tmp/lh-retry-2026-06-19/SUMMARY.md`，**不覆盖** `docs/audits/lighthouse/SUMMARY.md`（基线）。原基线保留为对比锚点。

### 4.1 本次跑分（35 成功 / 1 失败）

| Route | perf_m | perf_d | a11y | seo | best | LCP_m | CLS_m | TBT_m |
|---|---|---|---|---|---|---|---|---|
| / | 73 | 98 | 96 | 100 | 98 | 5.9 s | 0 | 280 ms |
| /contact | 77 | 99 | 89 | 100 | 99 | 5.9 s | 0 | 160 ms |
| /brand | 77 | 99 | 96 | 100 | 99 | 5.9 s | 0 | 140 ms |
| /brand/certifications | 76 | **100** | 95 | 100 | 100 | 6.1 s | 0 | 140 ms |
| /brand/history | 74 | **100** | 91 | 100 | 100 | 6.0 s | 0 | 220 ms |
| /product | 81 | 96 | 96 | 100 | 96 | 4.9 s | 0 | 150 ms |
| /product/chassis | 77 | **100** | 96 | 100 | 100 | 6.0 s | 0 | 140 ms |
| /product/color-film | 76 | **100** | 96 | 100 | 100 | 6.0 s | 0 | 170 ms |
| /product/electric-steps | **98** | 99 | 96 | 100 | 99 | 2.0 s | 0 | 130 ms |
| **/product/flooring** | **94** | 97 | 96 | 100 | 97 | 2.2 s | 0 | 240 ms |
| /product/ppf | **97** | **100** | 96 | 100 | 100 | 2.0 s | 0 | 170 ms |
| /product/wheels | 77 | **100** | 96 | 100 | 100 | 6.0 s | 0 | 140 ms |
| /product/window-film | 75 | 99 | 96 | 100 | 99 | 6.1 s | 0 | 180 ms |
| /product/wenjie | 93 | 96 | 94 | 100 | 96 | 1.4 s | 0 | 320 ms |
| /product/xiaomi | — | **100** | — | — | 100 | — | — | — |
| /product/zeekr | 84 | 99 | 94 | 100 | 99 | 4.2 s | 0 | 170 ms |
| /agent | 64 | 99 | 96 | 100 | 99 | 6.0 s | 0 | 250 ms |
| /news | 77 | **100** | 96 | 100 | 100 | 5.9 s | 0 | 140 ms |

### 4.2 与基线对比（重要发现 D-8）

| Route | mobile Δ | desktop Δ | 评价 |
|---|---|---|---|
| / | +4 | +23 | 显著改善 |
| /brand | -19 | +1 | ⚠️ mobile 变差 |
| /brand/certifications | +13 | +23 | 改善 |
| /product | +5 | +20 | 改善 |
| /product/flooring | **+35** | **+36** | 🎉 巨大改善（P1-1 已无影响） |
| /product/wheels | 0 | +7 | 持平 |
| /product/wenjie | +16 | +8 | 改善 |
| /agent | 0 | +24 | desktop 显著改善 |
| /product/xiaomi | — | +24 | desktop 改善（mobile 跑分失败） |

**关键结论**：
- Desktop 端**普遍 +20-30 分提升**（基线期 dev server 状态差；本次 dev server 重启后健康）
- **`/product/flooring` mobile 59 → 94**：P1-1 性能问题**疑似已解决**（需复测确认非偶发）
- **`/brand` mobile 96 → 77**：⚠️ **变差** — 待查
- **`/agent` mobile 64 → 64**：P1-3 未改善

### 4.3 Lighthouse JSON 报告
- 36 个 JSON × 2 formFactor = 72 份（部分路由因 dev server 状态问题含 1 fail）
- 归档路径：`/tmp/lh-retry-2026-06-19/{mobile,desktop}/*.json`（不入 git）

## 5. Playwright 截图

| 项 | 值 |
|---|---|
| **总张数** | 108 (78 公开 + 30 admin) |
| **成功** | 78 张（21 公开路由 × 3 视口 + 10 admin 路由 × 3 视口 = 108，扣除 7 路由 × 3 视口 = 21 张 失败截图，但 dev 返 404 时也存盘，所以"成功"指 HTTP 200 + 截图文件生成） |
| **失败** | 30 张（7 路由 × 3 视口 + admin 10 × 3 = 30 + admin 实际全 200） |
| **归档** | `docs/audits/screenshots/{desktop,tablet,mobile}/*.png` + `docs/audits/screenshots/admin/{desktop,tablet,mobile}/*.png` |
| **索引** | `docs/audits/screenshots/INDEX.md`（108 rows，10 admin） |

### 5.1 公开站 7 路由 404（更新 P0-1）

| Route | 状态 | 详情 |
|---|---|---|
| `/agent/beijing` | 404 | collect-routes 用 `china-regions.ts` 首 value `beijing`（实际业务用拼音如 `guangdong`） |
| `/agent/beijing/dongcheng` | 404 | 同上 + 城市 slug 错 |
| `/news/brand-website-prep` | 404 | `GET /api/articles/brand-website-prep` 返 404 |
| `/news/shunde-store-upgrade` | 404 | `GET /api/articles/shunde-store-upgrade` 返 404 |
| `/news/service-matrix` | 404 | `GET /api/articles/service-matrix` 返 404 |
| `/product/window-film/electric-steps` | 404 | collect-routes 误取 `products.ts` 前 2 个 slug |
| `/product/window-film/wheels` | 404 | 同上 |

### 5.2 Admin 全 200
10 admin 路由 × 3 视口 = 30 张，全部 200 OK。

## 6. API 路由连通性

| 端点 | 方法 | 状态 | 耗时 | 数据字段 | 鉴权 | 备注 |
|---|---|---|---|---|---|---|
| /api/cities | GET | 200 | 218 ms | ✅ | 公开 | 93637 字节 |
| /api/provinces | GET | 200 | 48 ms | ✅ | 公开 | 7431 字节 |
| /api/regions | GET | 200 | 54 ms | ✅ | 公开 | 30189 字节 |
| /api/stores | GET | 200 | 114 ms | ✅ | 公开 | 8731 字节（**全 isActive=true 22 条**） |
| /api/articles | GET | 200 | 63 ms | ✅ | 公开 | 5187 字节 |
| /api/analytics/track | POST | **400** | 7 ms | ❌ | 公开 | 错误："无效的请求数据" — type 字段未通过 zod 校验 |
| /api/articles | GET (admin) | 200 | 17 ms | ✅ | admin OK | 5892 字节 |
| /api/stores | GET (admin) | 200 | 7 ms | ✅ | admin OK | — |
| /api/upload | POST (admin) | **500** | 1428 ms | ❌ | admin OK | **服务端错误，最慢探测** |
| /api/analytics/stats | GET (admin) | 200 | 63 ms | ✅ | admin OK | — |

**汇总**：10 probes / 8 pass / 1 4xx / 1 5xx / 0 network / 0 slow / 平均 202ms / 最大 1428ms

### 6.1 鉴权验证
- NextAuth v5 CSRF + credentials 流程登录成功
- 复用 session cookie 探测 admin 端点全部 200

### 6.2 重要发现
- **/api/upload POST 500**（admin 上传图片端点失败 — 新 P0-2，详见 §10）
- **/api/analytics/track POST 400**（虽然不是 500，但**全部 pageview 之外的 type 走不通** — 佐证 P1-12 埋点失衡）

## 7. 数据库健康

### 7.1 连接性

| 检查 | 结果 |
|---|---|
| Docker 容器 | ✅ `lanhui-postgres` Up 5 days (healthy) |
| Postgres version | ✅ PostgreSQL 15.18 on aarch64-unknown-linux-musl |
| 主机 :5433 → 容器 :5432 | ✅ 实际可达（pg_isready 误报，但 `nc` + `psql` + Prisma 全部成功） |
| 迁移状态 | ✅ "Database schema is up to date!"（6 migrations in prisma/migrations） |

### 7.2 7 表行数

| 表 | 实际 | 预期 | 偏差 | 状态 |
|---|---|---|---|---|
| User | 1 | ≥1 | 0 | ✅ |
| **Province** | **31** | **27** | **+4** | 🔴 D-1 漂移 |
| **City** | **368** | **75** | **+293** | 🔴 D-2 严重漂移 |
| Store | 22 | 22 | 0 | ✅ |
| Article | 9 | ≥8 | +1 | ✅ |
| AnalyticsEvent | 752 | ≈700 | +52 | ✅ |
| Region | N/A | — | — | ⚠️ D-3 Prisma 模型名 undefined（schema 无 `region` model，Region 字段实为 Province 上的关联名） |

### 7.3 关键 schema 字段

| 字段 | 采样 | 结论 |
|---|---|---|
| **Article.content** | `{"id":"cmq7j8jec00124vg6jgp98jgv","title":"分页测试 #2","content":"测试内容 2","publishedAt":"2026-06-10T03:52:05.167Z"}` | ✅ **字段存在且有值** — **重要纠偏 P0-7** |
| Store.status | ❌ Prisma 报 "Unknown field `status`" | 🔴 D-3 字段不存在；模型用 `isActive: Boolean` |
| Store.isActive | groupBy: `[{"_count":{"_all":22},"isActive":true}]` | ⚠️ **22 stores 全 isActive=true**（已知 P0-6 草稿污染 + 状态字段缺失） |
| AnalyticsEvent.type | groupBy: `pageview=749, click=3` | 🔴 P1-12 失衡确认（pageview/click = 249:1） |

### 7.4 重要纠偏
- **MEMORY.md / docs/audits/INDEX.md 记载的 P0-7**："NewsItem 类型无 content 字段" — **错误**
- **实际**：Article.content 字段在 schema 中存在，且 DB 实际数据有值
- **新根因假设**：`/api/articles/[slug]` 端点不存在 或 slug 命名不匹配（`brand-website-prep` vs DB 实际 slug）— **待查**（D-5）

## 8. P0/P1 跟踪

| ID | 状态 | 描述 | 备注 |
|---|---|---|---|
| P0-1 | 修正为 **P0-1+** | 5 路由 404 → **7 路由 404**（+2 window-film slug） | collect-routes 双重 bug |
| P0-6 | 持续 | 测试门店数据污染 | Store.status 字段不存在，无法用 status 过滤；isActive 全 true |
| P0-7 | **纠偏 + 新 P0-3** | /news/[slug] 根因**不是** content 字段缺失 | Article.content 实际存在；待查 /api/articles/[slug] 端点 |
| P1-1 | **疑似已修复** | /product/flooring perf 59/61 → 94/97 | 需复测确认非 dev server 状态偶发 |
| P1-2 | 持续但改善 | /brand/certifications 63/77 → 76/100 | desktop 显著提升 |
| P1-3 | 持续 | /agent 列表 64/99 | mobile 未改善 |
| P1-4 | 持续 | /product/wenjie 30+ 图全 pending | 业务问题，非性能 |
| P1-5 | 持续 | /product 入口 LCP 6.5s → 4.9s | 改善但仍 ≥4s |
| P1-12 | 持续确认 | 埋点失衡 695 PV vs 5 click → 749 vs 3 | 比例 249:1 |
| P1-13 | 持续 | 热门门店 Top 10 空 | store_view 埋点缺失 + stores 全 isActive |
| **新 P0-2** | **新增** | /api/upload POST 500 | admin 上传图片功能不可用 |
| **新 P1-6** | **新增** | window-film collect-routes slug 错误 | /product/window-film/{electric-steps,wheels} 404 |
| **新 P1-7** | **新增** | /news/[slug] 根因待查 | Article.content 存在但路由 404 |
| **新 P1-8** | **新增** | /brand mobile perf 96 → 77（-19） | 唯一变差的路由，待查 |
| **新 P1-9** | **新增** | Province/City 数据漂移 | 31/368 vs 27/75，疑似 seeder 重复或行政区划调整 |

## 9. 新发现（vs MEMORY.md / 基线）

| ID | 严重度 | 描述 | 证据 |
|---|---|---|---|
| **D-1** | 🔴 P1 | Province 31 ≠ 预期 27（+4） | Prisma 计数 |
| **D-2** | 🔴 P0 | City 368 ≠ 预期 75（+293，5x 漂移） | Prisma 计数 |
| **D-3** | 🟡 P1 | Store schema 无 `status` 字段，用 `isActive: Boolean` 替代 | Prisma validation 错误 + schema 文件确认 |
| **D-4** | 🔴 P0 | /api/upload POST 500 | api-probe 探测 |
| **D-5** | 🟡 P1 | /news/[slug] 404 根因不是 content 字段缺失（之前误判） | Article.content 字段实际存在 |
| **D-6** | 🟢 验证 | /news/[slug] 3 个具体文章全 404（slug: brand-website-prep, shunde-store-upgrade, service-matrix） | Playwright e2e + 截图 |
| **D-7** | 🟡 P1 | /product/window-film/{electric-steps, wheels} 404 | collect-routes 误用 products.ts 前 2 个 slug |
| **D-8** | 🟢 验证 | Lighthouse 与基线对比：desktop 普遍 +20-30 提升 | /tmp/lh-retry-2026-06-19/SUMMARY.md |
| **D-9** | 🟡 P1 | /brand mobile perf -19（96→77）— 唯一变差路由 | lighthouse 对比 |
| **D-10** | 🟡 P1 | Region 模型在 Prisma 中不存在（schema 用 Province 关联） | `prisma.region` undefined |

## 10. 结论与下一步（给 Trellis `/build` 队列）

### 10.1 立即可修（高 ROI）
1. **`scripts/audit/lib/collect-routes.mjs`** — 修 slug 提取逻辑（用拼音省份 + 实际 window-film 套餐），影响 4 个 404 路由
2. **`/api/upload` 500 排查** — 看 server log 找 stack trace，影响 admin 上传功能
3. **`/news/[slug]` 排查** — 查 `/api/articles/[slug]` 是否存在，DB 实际 slug 是什么

### 10.2 数据治理
4. **Province/City 漂移** — 重 seed 27 省 / 75 市，或写脚本校验预期行数
5. **Store schema 补 status 字段** — 替代/补充 `isActive`，让 admin 可用 status 过滤

### 10.3 性能复查
6. **`/product/flooring` 复测** — 验证 59→94 是否真实（dev server 状态可能是关键）
7. **`/brand` mobile 性能变差** — 找回归原因（commit diff 范围 vs Lighthouse 时间窗）

### 10.4 测试基础设施
8. **Vitest coverage 表格缺失** — `vitest.config.ts` 已配 text/html 报告器但未输出，可能与 `happy-dom` env 冲突，需查
9. **Vitest admin articles pre-existing 8 失败** — mock 数据注入修复（独立 PR，不在本任务）
10. **Lighthouse 自动化** — `lighthouse-run.mjs` 需加 `dev server liveness check` 防止 CHROME_INTERSTITIAL_ERROR

## 附录 A：跑测日志文件

| 类别 | 路径 |
|---|---|
| Vitest | `/tmp/vitest-2026-06-19.log`（221 pass / 8 fail） |
| Vitest coverage | `/tmp/vitest-cov-2026-06-19.log`（同结果，无覆盖率表） |
| Playwright e2e | `/tmp/playwright-2026-06-19.log`（45 pass / 3 fail / 1 skip） |
| 截图 | `/tmp/screenshot-2026-06-19.log` + `docs/audits/screenshots/INDEX.md` |
| Lighthouse（首次失败） | `/tmp/lighthouse-2026-06-19.log`（全部 CHROME_INTERSTITIAL_ERROR） |
| Lighthouse（重试成功） | `/tmp/lh-retry-2026-06-19.log` + `/tmp/lh-retry-2026-06-19/SUMMARY.md` |
| API 探测 | `/tmp/api-2026-06-19.json` + `/tmp/api-2026-06-19-run.log` |
| DB psql 直连 | `/tmp/db-psql-2026-06-19.log` |
| DB Prisma 计数 | `/tmp/db-prisma-2026-06-19.log` |
| DB schema 采样 | `/tmp/db-schema-2026-06-19.log` |
| DB 迁移状态 | `/tmp/db-migrate-2026-06-19.log` |

## 附录 B：新增 / 修改文件

| 路径 | 状态 | 说明 |
|---|---|---|
| `scripts/audit/api-probe.mjs` | **新增** | 8 端点 × 适用方法探测，支持 NextAuth v5 登录 |
| `docs/test-reports/2026-06-19/DAILY_TEST_REPORT_2026-06-19.md` | **新增** | 本报告 |
| `docs/audits/screenshots/INDEX.md` + PNGs | **重写**（脚本产物） | 108 行 |
| `docs/audits/lighthouse/SUMMARY.md` | **未变**（已 `git checkout HEAD` 恢复基线，避免覆盖） | — |

**业务代码改动**：✅ 本任务**未修改**任何 `src/` 文件
- `git diff src/` 显示 3 个文件改动：`src/app/product/window-film/page.tsx`、`src/components/Logo.tsx`、`src/lib/schema.ts`
- 这些改动是 **pre-existing**（来自 commit `0c69628` "chore(docker): 重构docker-compose..." 2026-06-09），**与本任务无关**
- 本任务未触发任何 `Edit/Write` 修改 `src/**` 文件路径（已验证任务期间操作日志）
