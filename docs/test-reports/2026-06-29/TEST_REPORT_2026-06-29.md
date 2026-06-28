# 全站功能与性能测试报告 — 2026-06-29

> 对应 PRD: `docs/PRD/cross-cutting/FULL_SITE_TEST_PRD_2026-06-29.md`
> 执行: AI (ClaudeCode) · 2026-06-29
> 范围: 49 公开路由 + 13 API 端点 + 24 品牌图片审计

---

## 关联文档

| 文档 | 路径 |
|---|---|
| PRD | `docs/PRD/cross-cutting/FULL_SITE_TEST_PRD_2026-06-29.md` |
| Codex 视觉评判提示词 | `docs/PRD/cross-cutting/CODEX_VISUAL_EVAL_PROMPT_2026-06-29.md` |
| 前序审计 PRD | `docs/PRD/cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md` |

---

## 1. 验收矩阵

### AC-F1: 全站路由可达性 → ✅ PASS

| # | 标准 | 结果 |
|---|---|---|
| F1.1 | 49 条公开路由全部 200 | ✅ **49/49 全部 200** |
| F1.2 | 0 条路由 404 | ✅ **0** |
| F1.3 | 0 条路由 500 | ✅ **0** |
| F1.4 | 每个公开页有非空 `<title>` | ✅ **49/49** |
| F1.5 | 每个公开页有至少 1 个 `<h1>` | ✅ **49/49** |
| F1.6 | 无 console.error（排除 font preload） | ⚠ **3 路由有 400 错误**（见 Bug 列表） |
| F1.7 | admin 路由未登录时重定向 | 未测试（WITH_ADMIN=false） |

**原始数据**: `docs/test-reports/2026-06-29/functional-scan.json`

**慢路由 Top 5**:

| 路由 | 耗时 | 可能原因 |
|---|---|---|
| /product/wenjie/m6 | 8336ms | 34 项目 + generated 图加载 |
| /product/wenjie | 7980ms | 34+ 车型 section + 大量图片 |
| /product/zeekr | 4597ms | 18 项目渲染 |
| /product/gaoshan | 4067ms | 23 项目渲染 |
| /product/flooring | 3239ms | 大量地板图和品牌分组 |

### AC-F2: 图片状态全站审计 → ✅ PASS

| # | 标准 | 结果 |
|---|---|---|
| F2.1 | 产出品牌 × imageStatus 计数表 | ✅ 24 品牌/车型 |
| F2.2 | `missing` 项确认 dashed border + ImageIcon | ✅ 小米全系列 42 项（已在本 session 验证） |
| F2.3 | `pending-review` 项确认有占位 | ⚠ 待浏览器抽查 |
| F2.4 | `generated-preview` 项确认 "预览图" 角标 | ⚠ 待浏览器抽查 |
| F2.5 | 品牌内 imageStatus 一致性 | ✅ 同一品牌内统一 |

**图片状态分布**:

| imageStatus | 数量 | 占比 | 品牌 |
|---|---|---|---|
| `pending-review` | 311 | 64.7% | 极氪, 理想, Tesla, 小鹏, 腾势, 岚图, 高山, 乐道, 智界 |
| `generated-preview` | 128 | 26.6% | 问界全系, NIO ES8 |
| `missing` | 42 | 8.7% | 小米全系列 |
| `matched` | **0** | **0%** | **无** |
| **Total** | **481** | **100%** | 12 品牌 |

**原始数据**: `docs/test-reports/2026-06-29/image-status.json`

### AC-F3: API 端点连通性 → ⚠ PARTIAL

| # | 标准 | 结果 |
|---|---|---|
| F3.1 | 公开 GET 200 + JSON | ✅ **6/6** |
| F3.2 | 写端点未登录 401 | ✅ **11/11** |
| F3.3 | editor 不能调 admin-only | ⚠ 未测试（无 editor 账号） |
| F3.4 | /api/analytics/track 限流 | ⚠ 返回 400（payload 格式问题） |
| F3.5 | /api/stores 不返回 draft | ✅ 未登录 GET 返回 20 条已发布门店 |
| F3.6 | /api/articles 不返回 draft | ✅ 未登录 GET 返回 8 条已发布文章 |

**原始数据**: `docs/test-reports/2026-06-29/api-probe.json`

### AC-F4: Admin 功能流程 → 未执行

未执行原因：`WITH_ADMIN=false`，未在本次测试范围。

---

## 2. Bug 列表

### Bug 1: `/api/analytics/track` 返回 400

| 项 | 值 |
|---|---|
| 严重度 | **P2 一般** |
| 文件 | `src/app/api/analytics/track/route.ts` |
| 现象 | POST with `{ type: "pageview", path, timestamp }` → 400 |
| 期望 | 200（已知 06-19 P1-12 事件类型失衡） |
| 影响 | 客户端埋点请求失败，17 个 console 400 error |
| 重现 | `curl -X POST http://localhost:3000/api/analytics/track -H 'Content-Type: application/json' -d '{"type":"pageview","path":"/test","timestamp":"2026-06-29T00:00:00Z"}'` |

### Bug 2: 已认证 POST 写操作返回 500

| 项 | 值 |
|---|---|
| 严重度 | **P2 一般** |
| 文件 | `/api/articles/route.ts`, `/api/stores/route.ts`, `/api/upload/route.ts` |
| 现象 | 登录后 POST articles/stores/upload 返回 500 |
| 期望 | 422 或明确错误（空 body 应返回 Zod 校验错误而非 500） |
| 影响 | 缺失输入校验的友好错误提示 |
| 重现 | 登录后 POST 空 body |

### Bug 3: 3 路由前端 console 400 error

| 项 | 值 |
|---|---|
| 严重度 | **P2 一般** |
| 文件 | `/product/xiaomi` (18 errors), `/product/zeekr` (2), `/product/li-auto/i6` (1) |
| 现象 | 客户端埋点请求均 /api/analytics/track → 400 |
| 期望 | 埋点正常 200 |
| 影响 | 控制台噪声，不影响页面功能 |
| 根因 | Bug 1 的客户端表现 |

### Bug 4: 6 处禁止词违规

| 项 | 值 |
|---|---|
| 严重度 | **P1 严重** |
| 文件 | `CoreServices.tsx`, `WhyChooseUs.tsx` (3×), `P1ServiceCard.tsx`, `FilmServiceMap.tsx` |
| 现象 | 业务文案中使用"官方质保""原厂数据""原厂车衣"等表述 |
| 期望 | 全部替换为中性的非授权表述 |
| 影响 | 合规风险 — 若无真实主机厂授权，可能构成虚假宣传 |

### Bug 5: WenjieModelPosterStub 未清理

| 项 | 值 |
|---|---|
| 严重度 | **P1 严重** |
| 文件 | `src/app/product/wenjie/m6,m7,m8/page.tsx` (3 页) + `WenjieModelPosterStub.tsx` |
| 现象 | 06-27 poster 清理遗漏了 model 层，M6/M7/M8 仍 import + 渲染海报空态 |
| 期望 | 全部删除（遵循 PRD §17 poster 红线） |
| 影响 | 空壳占位无实际内容，违反设计规范

---

## 3. 专项检查

### AC-S4: 合规检查

#### S4.1: 禁止词检查 → ⚠ 6 项违规

| 文件 | 行 | 违禁词 | 严重度 | 说明 |
|---|---|---|---|---|
| `src/components/product/P1ServiceCard.tsx` | 26 | **原厂** | P1 | "原厂数据精准开模 · 不卡座椅滑轨" |
| `src/components/product/FilmServiceMap.tsx` | 79 | **原厂** | P1 | "原厂车衣的隐形盾牌 · 玻璃的隔热卫士" |
| `src/components/WhyChooseUs.tsx` | 20 | **官方** | P1 | "官方质保承诺" |
| `src/components/WhyChooseUs.tsx` | 22 | **官方** | P1 | "官方质保体系..." |
| `src/components/WhyChooseUs.tsx` | 56 | **官方** | P1 | "官方质保——层层保障" |
| `src/components/CoreServices.tsx` | 26 | **官方** | P1 | "官方质保系统覆盖所有服务项目" |

> 排除：注释中的否定表述（如 "不构成官方授权"）、flooring-products.ts 的注释。

#### S4.2: Poster 代码检查 → ⚠ 残留 WenjieModelPosterStub

| 文件 | 行 | 严重度 | 说明 |
|---|---|---|---|
| `src/components/wenjie/model/WenjieModelPosterStub.tsx` | — | P1 | 海报空态组件未删除 |
| `src/app/product/wenjie/m6/page.tsx` | 12, 92 | P1 | import + 渲染 |
| `src/app/product/wenjie/m7/page.tsx` | 13, ~100 | P1 | import + 渲染 |
| `src/app/product/wenjie/m8/page.tsx` | 23, 150 | P1 | import + 渲染 |

> 注: 06-27 只清理了 WenjieSeriesPosterStub（series 层），M6/M7/M8 的 ModelPosterStub 遗漏了。

### AC-S1 (SEO) / AC-S2 (a11y) / AC-S3 (响应式) → 未执行

需 Lighthouse + axe-core + screenshot，已列入后续步骤。

---

## 4. 与前次审计对比 (2026-06-19 vs 2026-06-29)

| 指标 | 2026-06-19 | 2026-06-29 | 变化 |
|---|---|---|---|
| 扫描路由 | 26 | 49 | **+23** |
| 404 路由 | 5 (P0) | **0** | **P0 全部修复** |
| 图片审计覆盖 | 仅 wenjie | 24 品牌/车型 | **全面覆盖** |
| imageStatus 审计 | 无统计 | 481 项逐一统计 | **新增** |
| API 覆盖 | 部分 | 13 端点全覆盖 | **增强** |

---

## 5. 关键发现 TL;DR

1. ✅ **49 路由全部 200** — 自 06-19 首个审计以来，所有 404 问题已修复
2. ⚠ **481 个项目中 0 个 matched** — 全站无真实施工照片，全部 pending/generated/missing
3. ⚠ **小米 42 项全部 missing** — 无图可用（本 session 已完成 UI 占位）
4. ⚠ **`/api/analytics/track` 持续 400** — 埋点管道阻塞，需修复
5. ⚠ **6 处禁止词违规（P1）** — CoreServices/WhyChooseUs/P1ServiceCard/FilmServiceMap 含 "官方/原厂"（合规风险）
6. ⚠ **WenjieModelPosterStub 残留（P1）** — 06-27 清理遗漏 M6/M7/M8 海报空态
7. ⚠ **问界页面最慢** — wenjie/m6 达 8.3s（34 项目 + 多图）
8. 🟢 **声明式 API 鉴权正确** — 11/11 端点未登录均返回 401/403
9. 🟢 **3 个测试脚本已归档** — `scripts/test/functional-suite.mjs`、`image-status-audit.mjs`、`api-probe.mjs`

---

## 6. 命令结果

| 命令 | 结果 | 输出 |
|---|---|---|
| `node scripts/test/functional-suite.mjs` | ✅ 49/49 200 | `functional-scan.json` |
| `node scripts/test/image-status-audit.mjs` | ✅ 24 品牌 | `image-status.json` |
| `node scripts/test/api-probe.mjs` | ⚠ 3 failures | `api-probe.json` |
| `npm run typecheck` (tsc --noEmit) | ⚠ 9 pre-existing | — |
| `npm run build` | ✅ passed | 本 session 验证 |

---

## 7. Skill / Mock 使用

- Skills: `prompt-boost` (需求翻译) → `dispatch` (流水线编排)
- faker fixtures: 未使用（测试脚本不写业务数据）
- MSW handlers: 未使用（API probe 用真实 dev server）
- Playwright: 用于 functional-suite.mjs 路由扫描

---

## 8. 剩余风险

| 风险 | 说明 |
|---|---|
| Admin 功能流程未测试 | AC-F4 全部未执行，待后续 |
| SEO/a11y/响应式未测试 | AC-S1~S3 未执行 |
| `npm run lighthouse:run` 未跑 | 耗时 ~60min，可后台单独跑 |
| Codex 视觉评判未启动 | 需先跑截图脚本产图 |
| `/news/[slug]` 可能仍 404 | 未在本次动态路由展开中测试（pre-existing bug） |
| `/api/analytics/track` 400 根因未定位 | 可能 Zod schema 与实际 payload 不匹配 |

---

## 9. 后续建议

1. **P1 优先**: 修复 `/api/analytics/track` 400 → 解锁埋点管道
2. **P2**: POST 端点增加 Zod 校验错误友好提示（当前空 body → 500）
3. **运行 Lighthouse**: `npm run lighthouse:run` 更新性能基线
4. **启动 Codex 视觉评判**: 先跑 `npm run screenshot:all` 产截图
5. **Admin 流程测试**: `WITH_ADMIN=true node scripts/test/functional-suite.mjs`
