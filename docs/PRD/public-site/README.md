# 公开站 PRD

> 公开面向 C 端用户的页面(车主 / 潜客 / 轻改爱好者)。SSG 优先,ISR 增量,无认证。

## 范围

| 路由 | 子 PRD | 状态 |
|---|---|---|
| `/` | [HOMEPAGE_PRD_2026-06-20.md](./HOMEPAGE_PRD_2026-06-20.md) | 🟢 v1 (285 行) |
| `/brand` `/brand/certifications` `/brand/history` | [BRAND_PRD_2026-06-20.md](./BRAND_PRD_2026-06-20.md) | 🟢 v1 (340 行,3 路由合 1 PRD) |
| `/contact` | [CONTACT_PRD_2026-06-20.md](./CONTACT_PRD_2026-06-20.md) | 🟢 v1 (284 行) |
| `/news` `/news/[slug]` | [NEWS_PRD_2026-06-20.md](./NEWS_PRD_2026-06-20.md) | 🟢 v1 (448 行,含 P0-7 修复方案) |
| `/agent` `/agent/[province]` `/agent/[province]/[city]` `/agent/store/[id]` | [AGENT_PUBLIC_PRD_2026-06-20.md](./AGENT_PUBLIC_PRD_2026-06-20.md) | 🟢 v1 (469 行,4 路由合 1 PRD,含 P0-1 修复) |

## 完成度

**5/5 子 PRD 已建 (100%)**

## 子 PRD 模板

[../_templates/public-site.md](../_templates/public-site.md) — 含 8 节标准结构

## 命名规范

`<PAGE>_PRD_<YYYY-MM-DD>.md` 例:
- `HOMEPAGE_PRD_2026-06-20.md` (v1 完整版)
- `BRAND_PRD_2026-06-20.md`

## 核心原则

1. **SSG 优先** — 静态内容走 `generateStaticParams` + ISR
2. **可访问性** — 语义化 HTML + 键盘导航 + ARIA
3. **SEO** — 独立 meta + JSON-LD (Article / Organization / LocalBusiness)
4. **响应式** — mobile-first, 三视口测试
5. **埋点** — 关键 CTA / 转化路径有 `track()` 调用

## 归档 (历史 v0)

只读保留:
- [../archive/HOMEPAGE_PHONE_CONVERSION_PRD_2026-06-12.md.archive](../archive/HOMEPAGE_PHONE_CONVERSION_PRD_2026-06-12.md.archive) — v0,被 HOMEPAGE v1 替代
- [../archive/LOGO_BRAND_VISUAL_ALIGNMENT_PRD_2026-06-14.md.archive](../archive/LOGO_BRAND_VISUAL_ALIGNMENT_PRD_2026-06-14.md.archive) — v0,内容已吸收到 BRAND v1 §5.4-5.6

## 关联

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §4.1 路由总览
- [../../database/SCHEMA.md](../../database/SCHEMA.md) — Store / Article 模型
- [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §P0-1 §P0-7](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) — 当前阻断 bug
- [../feature/SEO_SCHEMA_PRD_2026-06-20.md](../feature/SEO_SCHEMA_PRD_2026-06-20.md) — SEO 规范
- [../feature/ANALYTICS_TRACKING_PRD_2026-06-20.md](../feature/ANALYTICS_TRACKING_PRD_2026-06-20.md) — 埋点规范
