# Stage 2c-2f 完成 — M6/M7/M8 page + 埋点/JSON-LD 审计

**时间**：2026-06-26 14:10
**main HEAD**：`0eae77a`（合并 M8 + sitemap 后）

## M6/M7/M8 page（任务 6/1/8）

| page | 行数 | 关键特性 |
|---|---|---|
| `src/app/product/wenjie/m6/page.tsx` | 157 | 17 项目 + 6 场景 + 3 套餐 + 7 步 + 7 FAQ + JSON-LD × 17 + Metadata |
| `src/app/product/wenjie/m7/page.tsx` | 176 | 5+15+10 三层 grid（tierLabel 区分） + 7 场景 + 4 套餐 + 7 步 + 8 FAQ + JSON-LD × 30 + Metadata |
| `src/app/product/wenjie/m8/page.tsx` | 205 | 5+15+10 三层 + **F.1 电动门警示卡** + 6 场景 + 4 套餐 + 7 步 + 8 FAQ + JSON-LD × 30 + Metadata |
| `src/app/sitemap.ts` | 173 | + 3 个新子路由 (`/product/wenjie/m6/m7/m8`, monthly, priority 0.7) |

## 埋点 + JSON-LD 审计（G 阶段）

| 任务 | 状态 | 说明 |
|---|---|---|
| G.1 page top trackClick | ✅ 隐式 | `AnalyticsProvider` 自动 pageview（跳过 /admin） |
| G.2 bundle consult | ✅ | `WenjieModelBundles` 渲染时 PhoneCta `source={\`wenjie_${modelKey}_bundle_consult\`}` |
| G.3 scenario sub-model jump | ✅ | `WenjieSeriesSubModelsGrid` 渲染 `Link href={canonicalPath}` |
| G.4 pageview | ✅ | AnalyticsProvider 自动 `trackPageView(pathname)` |
| G.5 metadata 一致性 | ✅ PASS | grep 全 metadata 字段都在白名单 `{projectKey, category, priority, modelKey, tier, bundleName, section}` |
| G.6 AnchorNav 扩展 | ⏭️ SKIP | Architect §6 建议 4：标 P3，未来按需 |
| G.7 JSON-LD | ✅ | 4 page 各自 ItemList（10+24 / 17 / 30 / 30） |
| G.8 OpenGraph | ✅ | 4 page metadata 含 `images: []`（海报空态） |
| G.9 埋点 audit | ✅ | grep 已确认无 PII 字段 |

## 累计 main 门禁

- ✅ 0 `any` 关键字（grep）
- ✅ 0 新 tsc 错误（9 pre-existing）
- ✅ 82/82 wenjie 数据 vitest pass
- ✅ `npm run build` 通过（4 路由全为 ○ Static，509 页生成）

## 后续

启动 Stage 4 — Tester agent 验证 PRD 验收标准 + 浏览器三视口截图。
