## 1. Core Component & Utility

- [x] 1.1 Create `src/components/Breadcrumbs.tsx` — Server Component with `<nav aria-label="面包屑">`, `<ol>/<li>`, `aria-current`, `ChevronRight` separator, dark theme styles, `align` prop, mobile-safe
- [x] 1.2 Create `src/lib/product-breadcrumbs.ts` — `getProductBreadcrumbs(pathname)` using `ALL_BRANDS/ALL_MODELS/ALL_SERVICES` + window-film package lookup + fallback; `getProductBreadcrumbSchema(pathname)` reusing `generateBreadcrumbSchema`

## 2. Unit Tests

- [x] 2.1 Create `src/components/Breadcrumbs.test.tsx` — cover nav label, aria-current, links, separator aria-hidden, align center
- [x] 2.2 Create `src/lib/product-breadcrumbs.test.ts` — cover /product, /product/zeekr, /product/zeekr/9x, /product/window-film, /product/window-film/chunfen, unknown fallback

## 3. Replace Hand-Written Breadcrumbs in Shared Components

- [x] 3.1 Replace breadcrumb in `src/components/ProductDetail.tsx` with `<Breadcrumbs>`
- [x] 3.2 Replace breadcrumb in `src/components/film/FilmPageHero.tsx` with `<Breadcrumbs>`

## 4. Replace Hand-Written Breadcrumbs in Model/Topic Heroes

- [x] 4.1 Replace breadcrumb in `XiaomiSu7Hero.tsx` + `XiaomiYu7Hero.tsx` with `<Breadcrumbs>`
- [x] 4.2 Replace breadcrumb in `Zeekr9xHero.tsx` (add breadcrumbItems prop pattern)
- [x] 4.3 Replace breadcrumb in `DenzaD9TopicHero.tsx`
- [x] 4.4 Replace breadcrumb in `Gaoshan8Hero.tsx`
- [x] 4.5 Replace breadcrumb in `TeslaTopicHero.tsx`
- [x] 4.6 Replace breadcrumb in `VoyahDreamerHero.tsx`
- [x] 4.7 Replace breadcrumb in `LiAutoI6Hero.tsx`
- [x] 4.8 Replace breadcrumb in `XiaomiSeriesHero.tsx` + `ZhijieBrandHero.tsx`

## 5. Add Breadcrumbs to Heroes Currently Missing Them

- [x] 5.1 Add `breadcrumbItems` prop to brand Heroes: `WenjieSeriesHero`, `DenzaBrandHero`, `LiAutoSeriesHero`, `ZeekrBrandHero` (or page-level for zeekr)
- [x] 5.2 Add `breadcrumbItems` prop to model Heroes: `LiAutoL9Hero`, `LiAutoMegaHero`, `LiAutoI8Hero`, `LiAutoOneHero`, `NioEs8Hero`, `XpengGxTopicHero`, `LedaoL90Hero`, `WenjieModelUpgradeHero`, `Zeekr8xHero`
- [x] 5.3 Add `breadcrumbItems` prop to remaining brand Heroes: `VoyahBrandHero`, `LedaoBrandHero`, `GaoshanBrandHero`, `NioBrandHero`, `XpengBrandHero`

## 6. Add Breadcrumbs to Pages Without Heroes

- [x] 6.1 Add breadcrumbs to `/product/page.tsx` (index page)
- [x] 6.2 Add breadcrumbs to service pages: `ppf`, `color-film`, `electric-steps`, `wheels`, `chassis`, `floor-mats`, `car-care`, `business-comfort`, `skid-plate`
- [x] 6.3 Add breadcrumbs to brand pages: `wenjie`, `li-auto`, `tesla`, `xpeng`, `denza`, `voyah`, `ledao`, `gaoshan`, `nio`
- [x] 6.4 Add breadcrumbs to model pages that use page-level Hero: `wenjie/m6`, `wenjie/m7`, `wenjie/m8`, `zeekr/8x`, `zeekr/9x` (if not already via Hero), `li-auto/*`, `xpeng/gx`, `ledao/l90`, `gaoshan/8`, `zhijie/v9`, `nio/es8`
- [x] 6.5 Add breadcrumbs to `window-film/[packageSlug]/page.tsx`

## 7. Check Script & Package.json

- [x] 7.1 Create `scripts/check-product-breadcrumbs.mjs` — scan product pages, check for `<Breadcrumbs` or `getProductBreadcrumbSchema`, exit 1 on missing
- [x] 7.2 Update `package.json`: add `check:breadcrumbs` script, update `check` to include it

## 8. Final Verification

- [x] 8.1 Run `npm run check:breadcrumbs` — must pass (0 missing)
- [x] 8.2 Run `npm test` — all tests pass including new Breadcrumbs + product-breadcrumbs tests
- [x] 8.3 Run `npm run lint` — no new errors
- [x] 8.4 Run `npm run build` — succeeds
