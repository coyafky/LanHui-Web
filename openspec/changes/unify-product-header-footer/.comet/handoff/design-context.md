# Comet Design Handoff

- Change: unify-product-header-footer
- Phase: design
- Mode: compact
- Context hash: 62861a0aa564bb07ca1685a99608eee6363691e4c114b8cc0d643be32f4716cd

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/unify-product-header-footer/proposal.md

- Source: openspec/changes/unify-product-header-footer/proposal.md
- Lines: 1-27
- SHA256: 7e1101765e458612e7168025eb509a68357b5dd023cbad6ec97d4b1f69544df2

```md
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
```

## openspec/changes/unify-product-header-footer/design.md

- Source: openspec/changes/unify-product-header-footer/design.md
- Lines: 1-26
- SHA256: 3fe85699e836a98f211c3def7d0095feb07164c8727b704a30e7b981bb16452a

```md
# Design: unify-product-header-footer

## 架构决策

### 方案：App Router 嵌套 layout.tsx

```
src/app/layout.tsx          ← root layout (不改)
  └─ src/app/product/layout.tsx  ← NEW: <Header/> + {children} + <Footer/>
        ├─ page.tsx              ← 产品中心首页 (移除 Header/Footer)
        ├─ zeekr/page.tsx        ← 品牌页 (移除 Header/Footer)
        ├─ zeekr/9x/page.tsx     ← 车型页 (移除 Header/Footer)
        └─ ...
```

Next.js App Router 的嵌套 layout 天然支持路由段共享包裹，无需引入额外 wrapper 或 context。

### 共享组件改造

- `ProductDetail.tsx`：移除内部 Header/Footer，保留 `<main>` 和业务内容
- `FilmPageHero.tsx`：移除内部 `<Header />`，组件只返回 Hero section
- `WindowFilmPackageDetail.tsx`：只含 `<main>`，无需改动

### 检查脚本

扫描 `src/app/product/**/page.tsx`，确保没有 import 或渲染 Header/Footer。同时检查共享组件。接入 `npm run check` 链。
```

## openspec/changes/unify-product-header-footer/tasks.md

- Source: openspec/changes/unify-product-header-footer/tasks.md
- Lines: 1-27
- SHA256: 3ca5c129728526597071d7ac414f5649b84714cc271f9490cc53f96a0b523a56

```md
## 1. Add Product Shared Layout

- [ ] 1.1 Create `src/app/product/layout.tsx` — Server Component, wraps `{children}` with `<Header />` + `<Footer />`

## 2. Remove Header/Footer from Product Pages

- [ ] 2.1 Remove Header/Footer from `/product/page.tsx` (index)
- [ ] 2.2 Remove Header/Footer from service pages: ppf, color-film, chassis, electric-steps, wheels, floor-mats, car-care, business-comfort, skid-plate, flooring
- [ ] 2.3 Remove Header/Footer from brand pages: wenjie, xiaomi, zeekr, li-auto, tesla, xpeng, denza, voyah, ledao, gaoshan, zhijie, nio
- [ ] 2.4 Remove Header/Footer from model pages: all `[brand]/[model]` routes
- [ ] 2.5 Remove Header from window-film and window-film/[packageSlug] pages

## 3. Remove Header/Footer from Shared Components

- [ ] 3.1 Remove Header/Footer from `ProductDetail.tsx`
- [ ] 3.2 Remove Header from `FilmPageHero.tsx`

## 4. Check Script & Package.json

- [ ] 4.1 Create `scripts/check-product-layout.mjs`
- [ ] 4.2 Update `package.json`: add `check:product-layout` script, integrate into `check`

## 5. Final Verification

- [ ] 5.1 Run `npm run check:product-layout` — must pass
- [ ] 5.2 Run `npm run build` — must succeed
- [ ] 5.3 Run `npm test` — no regressions
```

