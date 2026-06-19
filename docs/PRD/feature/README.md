# 跨切面功能 PRD

> 横跨多个页面/路由的功能模块,非独立路由。

## 范围

| 功能 | 子 PRD | 状态 |
|---|---|---|
| **图片上传** (全站) | [IMAGE_UPLOAD_PRD_2026-06-20.md](./IMAGE_UPLOAD_PRD_2026-06-20.md) | 🟢 v1 (283 行) |
| **埋点系统** (analytics) | [ANALYTICS_TRACKING_PRD_2026-06-20.md](./ANALYTICS_TRACKING_PRD_2026-06-20.md) | 🟢 v1 (380 行,含 P1-12/13 修复) |
| **SEO** (sitemap / OG / JSON-LD) | [SEO_SCHEMA_PRD_2026-06-20.md](./SEO_SCHEMA_PRD_2026-06-20.md) | 🟢 v1 (374 行) |
| **认证守卫** (NextAuth 权限矩阵) | [AUTH_GUARD_PRD_2026-06-20.md](./AUTH_GUARD_PRD_2026-06-20.md) | 🟢 v1 (354 行) |

## 完成度

**4/4 子 PRD 已建 (100%)**

## 子 PRD 模板

[../_templates/feature.md](../_templates/feature.md)

## 核心原则

1. **横切独立** — 一个功能可被多个页面/路由使用
2. **配置化** — 通过 props / context 注入,避免硬编码
3. **可观测** — 关键调用有日志/埋点
4. **降级** — 失败时不能阻塞主流程

## 已知问题 → 修复方案

| 功能 | 问题 | 修复 PRD 章节 |
|---|---|---|
| 埋点 | click / store_view / booking 三类事件几乎为零 (P1-12, P1-13) | ANALYTICS_TRACKING §5(Button/Link 自动包装 + store_view 注入) |
| SEO | /news/[slug] 缺 meta description (因为 404, P0-7) | SEO_SCHEMA §5(generateMetadata 源码) |
| 认证 | 7 个写 API 仅 2 个写 ActivityLog (B3) | AUTH_GUARD §5(logWrite 抽象) |
| 图片 | `ali-oss` 已安装但未启用 (用本地存储) | IMAGE_UPLOAD §3.2 + §4(本地 → OSS 迁移路径) |

## 命名规范

`<FEATURE>_PRD_<YYYY-MM-DD>.md` 例:
- `IMAGE_UPLOAD_PRD_2026-06-20.md`
- `ANALYTICS_TRACKING_PRD_2026-06-20.md`
- `SEO_SCHEMA_PRD_2026-06-20.md`
- `AUTH_GUARD_PRD_2026-06-20.md`

## 关联

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.4
- [../../src/lib/analytics.ts](../../src/lib/analytics.ts) — 客户端埋点
- [../../src/components/AnalyticsProvider.tsx](../../src/components/AnalyticsProvider.tsx) — 自动 pageview
- [../../src/lib/auth.ts](../../src/lib/auth.ts) — NextAuth 配置
- [../../src/lib/image.ts](../../src/lib/image.ts) — 图片处理
