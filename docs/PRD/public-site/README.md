# 公开站 PRD

> 公开面向 C 端用户的页面(车主 / 潜客 / 轻改爱好者)。SSG 优先,ISR 增量,无认证。

## 范围

| 路由 | 子 PRD | 状态 |
|---|---|---|
| `/` | [HOMEPAGE_PHONE_CONVERSION_PRD_2026-06-12.md](./HOMEPAGE_PHONE_CONVERSION_PRD_2026-06-12.md) | 🟡 v0 (待补 v1: 完整首页+Hero) |
| `/brand` `/brand/certifications` `/brand/history` | [LOGO_BRAND_VISUAL_ALIGNMENT_PRD_2026-06-14.md](./LOGO_BRAND_VISUAL_ALIGNMENT_PRD_2026-06-14.md) | 🟡 v0 (待补 v1: 完整品牌页 3 子页) |
| `/contact` | (待建) | ⚪ |
| `/news` `/news/[slug]` | (待建) | ⚪ + ⚠️ P0-7 详情页 404 |
| `/agent` `/agent/[province]` `/agent/[province]/[city]` `/agent/store/[id]` | (待建) | ⚪ + ⚠️ P0-1 动态路由 404 |

## 子 PRD 模板

[../_templates/public-site.md](../_templates/public-site.md) — 含 8 节标准结构

## 命名规范

`<PAGE>_PRD_<YYYY-MM-DD>.md` 例:
- `HOMEPAGE_PRD_2026-06-20.md` (v1 完整版)
- `BRAND_PRD_2026-06-20.md`
- `AGENT_PUBLIC_PRD_2026-06-20.md`

## 核心原则

1. **SSG 优先** — 静态内容走 `generateStaticParams` + ISR
2. **可访问性** — 语义化 HTML + 键盘导航 + ARIA
3. **SEO** — 独立 meta + JSON-LD (Article / Organization / LocalBusiness)
4. **响应式** — mobile-first, 三视口测试
5. **埋点** — 关键 CTA / 转化路径有 `track()` 调用

## 关联

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §4.1 路由总览
- [../../database/SCHEMA.md](../../database/SCHEMA.md) — Store / Article 模型
- [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §P0-1 §P0-7](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) — 当前阻断 bug
