## 1. Add Product Shared Layout

- [x] 1.1 Create `src/app/product/layout.tsx` — Server Component, wraps `{children}` with `<Header />` + `<Footer />`

## 2. Remove Header/Footer from Product Pages

- [x] 2.1 Remove Header/Footer from `/product/page.tsx` (index)
- [x] 2.2 Remove Header/Footer from service pages: ppf, color-film, chassis, electric-steps, wheels, floor-mats, car-care, business-comfort, skid-plate, flooring
- [x] 2.3 Remove Header/Footer from brand pages: wenjie, xiaomi, zeekr, li-auto, tesla, xpeng, denza, voyah, ledao, gaoshan, zhijie, nio
- [x] 2.4 Remove Header/Footer from model pages: all `[brand]/[model]` routes
- [x] 2.5 Remove Header from window-film and window-film/[packageSlug] pages

## 3. Remove Header/Footer from Shared Components

- [x] 3.1 Remove Header/Footer from `ProductDetail.tsx`
- [x] 3.2 Remove Header from `FilmPageHero.tsx`

## 4. Check Script & Package.json

- [x] 4.1 Create `scripts/check-product-layout.mjs`
- [x] 4.2 Update `package.json`: add `check:product-layout` script, integrate into `check`

## 5. Final Verification

- [x] 5.1 Run `npm run check:product-layout` — must pass
- [x] 5.2 Run `npm run build` — must succeed
- [x] 5.3 Run `npm test` — no regressions (18 pre-existing failures, unchanged)
