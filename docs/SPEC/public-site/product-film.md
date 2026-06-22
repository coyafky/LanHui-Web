# SPEC: 膜类产品 Product Film

> 对应 PRD：`docs/PRD/public-site/FILM_PRODUCT_EXPERIENCE_PRD_2026-06-22.md` / `docs/PRD/product/WINDOW_FILM_PACKAGE_DETAIL_PRD_2026-06-14.md`
> 实现状态：✅ **完成**

---

## 1. 职责范围

窗膜（含套餐详情）、隐形车衣（PPF）、改色膜三类膜产品页面。

## 2. 路由

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/product/window-film` | page (RSC) | 窗膜总页，7 套餐卡片 | ✅ |
| `/product/window-film/[packageSlug]` | page (RSC, generateStaticParams) | 套餐详情页 | ✅ |
| `/product/ppf` | page (RSC) | 隐形车衣 | ✅ |
| `/product/color-film` | page (RSC) | 改色膜 | ✅ |

## 3. 数据模型

### 3.1 窗膜套餐

基础数据在 `src/lib/products.ts`（`ProductPackage`），详情文案在 `src/lib/window-film-details.ts`（`WindowFilmPackageDetails`），通过 `getWindowFilmPackageWithDetails()` 合并。

7 套餐：春分 / 谷雨 / 小满 / 芒种 / 白露 / 网红 / 养生。

### 3.2 PPF/改色膜

通过 `ProductDetail` 组件按 slug 条件分支渲染。数据在 `products.ts` 的 `PpfSeries`、`ColorFilmSeries`。

## 4. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| ProductDetail | `src/components/ProductDetail.tsx` | 否 | PPF/改色膜/配件 共用详情布局 |
| FilmPageHero | `src/components/film/FilmPageHero.tsx` | 否 | 产品页主视觉+面包屑 |
| SpecsTable | `src/components/film/SpecsTable.tsx` | 否 | 通用规格表格 |
| StarRating | `src/components/film/StarRating.tsx` | 否 | 星级评分（max=7） |
| ServiceProcessSection | `src/components/film/ServiceProcessSection.tsx` | 否 | 服务流程 step 列表 |
| WindowFilmPackageCard | `src/components/window-film/WindowFilmPackageCard.tsx` | 否 | 套餐卡片+质保徽章 |
| WindowFilmPackageDetail | `src/components/window-film/WindowFilmPackageDetail.tsx` | 否 | 套餐详情完整布局 |

## 5. SSR/ISR 配置

SSG（静态生成）为主；套餐详情页 `generateStaticParams` 枚举 7 套餐。

## 6. 性能基线

| 页面 | 目标 LCP | 说明 |
|------|----------|------|
| `/product/window-film` | < 2s | 图片少，体积小 |
| `/product/window-film/[slug]` | < 2s | 套餐详情 |
| `/product/ppf` | < 2s | 内容轻量 |
| `/product/color-film` | < 2s | 内容轻量 |

## 7. 已知问题

- 无关键已知问题

---

> 最后更新: 2026-06-22

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-14 | Claude Code | 窗膜套餐详情页 WINDOW_FILM_PACKAGE_DETAIL 实现 | 完成 | — |
| 2026-06-20 | Claude Code | 窗膜/PPF/改色膜完整实现 | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | — |
