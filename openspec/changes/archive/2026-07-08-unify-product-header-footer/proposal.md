# Proposal: unify-product-header-footer

## 背景

`/product` 下约 44 个页面各自独立包裹 `<Header />` + `<Footer />`，还有部分页面通过 `ProductDetail.tsx`、`FilmPageHero.tsx` 等共享组件间接包裹。`/product/window-film/[packageSlug]` 更是有 Header 无 Footer。

这导致产品页维护不一致、容易漏页脚/重复导航，未来新增产品页继续复制样板代码。

## 目标

为 `/product` 路由段新增共享 `layout.tsx`，统一包裹 Header/Footer，然后移除 44 个页面和共享组件中的重复代码。

## 范围

- 新增 `src/app/product/layout.tsx`
- 修改 44 个 `src/app/product/**/page.tsx` — 移除 Header/Footer import 和 JSX
- 修改 `src/components/ProductDetail.tsx` — 移除 Header/Footer
- 修改 `src/components/film/FilmPageHero.tsx` — 移除 Header
- 新增 `scripts/check-product-layout.mjs` — 防止回归
- 更新 `package.json` — 接入 check 链

## 非目标

- 不修改 `/admin`、`/agent`、`/news`、`/brand`、`/contact` 路由
- 不修改 root layout.tsx
- 不改变页面视觉
- 不引入新依赖
