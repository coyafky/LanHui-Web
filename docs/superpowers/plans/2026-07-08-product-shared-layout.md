---
change: unify-product-header-footer
design-doc: docs/superpowers/specs/2026-07-08-product-shared-layout-design.md
base-ref: ebedeaa90d8859ea774f44ffdf4a3fec6a5e163f
archived-with: 2026-07-08-unify-product-header-footer
---

# Implementation Plan: Unify Product Header/Footer via Shared Layout

## Scope Summary

Create `src/app/product/layout.tsx` as a shared Server Component rendering `<Header />` + `{children}` + `<Footer />`, then remove duplicate Header/Footer from all 44 product page.tsx files and 2 shared components (`ProductDetail.tsx`, `FilmPageHero.tsx`). Add a CI check script to prevent regression.

**Total impact:** 1 new file, ~41 edited files (39 page.tsx + 1 component + 1 check script + package.json). 3 page.tsx (chassis, color-film, ppf) are auto-covered by ProductDetail.tsx edits.

archived-with: 2026-07-08-unify-product-header-footer
---

## Group 1: Create Shared Layout

### Task 1.1 — Create `src/app/product/layout.tsx`

**File:** `src/app/product/layout.tsx`

```tsx
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
```

Server Component — no `"use client"`, no extra wrappers, no `<main>`.

**Verification:** File exists and exports a default component wrapping children with Header/Footer.

archived-with: 2026-07-08-unify-product-header-footer
---

## Group 2: Remove Header/Footer from Product Pages

For each file below:
1. Delete the `import { Header } from "@/components/Header"` line (if present)
2. Delete the `import { Footer } from "@/components/Footer"` line (if present)
3. Delete the `<Header />` JSX line (if present)
4. Delete the `<Footer />` JSX line (if present)
5. If the file's top-level JSX was wrapped in a fragment `<>...</>` only because of Header/Footer, collapse to a single element; otherwise leave the fragment for other sibling elements.

### Task 2.1 — Product Index

- [x] `src/app/product/page.tsx` — Remove Header + Footer import and JSX

### Task 2.2 — Service Pages (10 pages)

- [x] `src/app/product/ppf/page.tsx` — Covered by ProductDetail.tsx (Task 3.1), no direct edit needed
- [x] `src/app/product/color-film/page.tsx` — Covered by ProductDetail.tsx (Task 3.1), no direct edit needed
- [x] `src/app/product/chassis/page.tsx` — Covered by ProductDetail.tsx (Task 3.1), no direct edit needed
- [x] `src/app/product/electric-steps/page.tsx` — Remove Header + Footer
- [x] `src/app/product/floor-mats/page.tsx` — Remove Header + Footer
- [x] `src/app/product/flooring/page.tsx` — Remove Header + Footer
- [x] `src/app/product/skid-plate/page.tsx` — Remove Header + Footer
- [x] `src/app/product/wheels/page.tsx` — Remove Header + Footer
- [x] `src/app/product/business-comfort/page.tsx` — Remove Header + Footer
- [x] `src/app/product/car-care/page.tsx` — Remove Header + Footer

### Task 2.3 — Brand Pages (13 pages)

- [x] `src/app/product/wenjie/page.tsx` — Remove Header + Footer
- [x] `src/app/product/xiaomi/page.tsx` — Remove Header + Footer
- [x] `src/app/product/zeekr/page.tsx` — Remove Header + Footer
- [x] `src/app/product/li-auto/page.tsx` — Remove Header + Footer
- [x] `src/app/product/tesla/page.tsx` — Remove Header + Footer
- [x] `src/app/product/xpeng/page.tsx` — Remove Header + Footer
- [x] `src/app/product/denza/page.tsx` — Remove Header + Footer
- [x] `src/app/product/voyah/page.tsx` — Remove Header + Footer
- [x] `src/app/product/ledao/page.tsx` — Remove Header + Footer
- [x] `src/app/product/gaoshan/page.tsx` — Remove Header + Footer
- [x] `src/app/product/zhijie/page.tsx` — Remove Header + Footer
- [x] `src/app/product/nio/page.tsx` — Remove Header + Footer

### Task 2.4 — Model Pages (18 pages)

- [x] `src/app/product/wenjie/m6/page.tsx` — Remove Header + Footer
- [x] `src/app/product/wenjie/m7/page.tsx` — Remove Header + Footer
- [x] `src/app/product/wenjie/m8/page.tsx` — Remove Header + Footer
- [x] `src/app/product/xiaomi/su7/page.tsx` — Remove Header + Footer
- [x] `src/app/product/xiaomi/yu7/page.tsx` — Remove Header + Footer
- [x] `src/app/product/zeekr/8x/page.tsx` — Remove Header + Footer
- [x] `src/app/product/zeekr/9x/page.tsx` — Remove Header + Footer
- [x] `src/app/product/li-auto/l9/page.tsx` — Remove Header + Footer
- [x] `src/app/product/li-auto/mega/page.tsx` — Remove Header + Footer
- [x] `src/app/product/li-auto/i6/page.tsx` — Remove Header + Footer
- [x] `src/app/product/li-auto/i8/page.tsx` — Remove Header + Footer
- [x] `src/app/product/li-auto/one/page.tsx` — Remove Header + Footer
- [x] `src/app/product/denza/d9/page.tsx` — Remove Header + Footer
- [x] `src/app/product/voyah/dreamer/page.tsx` — Remove Header + Footer
- [x] `src/app/product/ledao/l90/page.tsx` — Remove Header + Footer
- [x] `src/app/product/gaoshan/8/page.tsx` — Remove Header + Footer
- [x] `src/app/product/nio/es8/page.tsx` — Remove Header + Footer
- [x] `src/app/product/xpeng/gx/page.tsx` — Remove Header + Footer
- [x] `src/app/product/zhijie/v9/page.tsx` — Remove Header + Footer

### Task 2.5 — Window Film Pages (2 pages)

- [x] `src/app/product/window-film/page.tsx` — Remove only Footer (Header is handled by FilmPageHero, covered in Task 3.2)
- [x] `src/app/product/window-film/[packageSlug]/page.tsx` — Remove only Header (no Footer in this file)

### Verification for Group 2

Run after all edits:
```bash
# Verify no product page.tsx still imports Header or Footer
! grep -r "import { Header } from" src/app/product/ --include="page.tsx"
! grep -r "import { Footer } from" src/app/product/ --include="page.tsx"
```

Both grep commands must return zero matches.

archived-with: 2026-07-08-unify-product-header-footer
---

## Group 3: Remove Header/Footer from Shared Components

### Task 3.1 — `ProductDetail.tsx`

**File:** `src/components/ProductDetail.tsx`

- Delete line 2: `import { Header } from "@/components/Header";`
- Delete line 3: `import { Footer } from "@/components/Footer";`
- Delete `<Header />` JSX at line 52
- Delete `<Footer />` JSX at line 460
- If the outer fragment `<>...</>` now contains only one top-level element, collapse it (remove fragment).

**Verification:** `grep -n "Header\|Footer" src/components/ProductDetail.tsx` returns only business content (no imports, no JSX).

### Task 3.2 — `FilmPageHero.tsx`

**File:** `src/components/film/FilmPageHero.tsx`

- Delete line 1: `import { Header } from "@/components/Header";`
- Delete `<Header />` JSX inside the fragment
- If fragment now has only one child (Breadcrumbs), collapse to single element.

**Verification:** `grep -n "Header" src/components/film/FilmPageHero.tsx` returns zero matches.

### Verification for Group 3

```bash
# Neither shared component should reference Header/Footer
! grep -l "Header\|Footer" src/components/ProductDetail.tsx src/components/film/FilmPageHero.tsx
```

archived-with: 2026-07-08-unify-product-header-footer
---

## Group 4: Check Script & Package.json

### Task 4.1 — Create `scripts/check-product-layout.mjs`

Model after `scripts/check-product-breadcrumbs.mjs`. Scan rules:

1. `src/app/product/layout.tsx` exists and contains `<Header />` and `<Footer />`
2. All `src/app/product/**/page.tsx` files: no `import { Header } from` or `import { Footer } from`
3. `src/components/ProductDetail.tsx`: no `import { Header }` or `import { Footer }`
4. `src/components/film/FilmPageHero.tsx`: no `import { Header }`

Exit 1 on any violation. Print pass/fail per file.

### Task 4.2 — Update `package.json`

Add to `scripts` section:
```json
"check:product-layout": "node scripts/check-product-layout.mjs",
```

Chain into the `check` script (before `build`, after existing checks):
```json
"check": "npm run lint && npm run typecheck && npm run verify:zeekr-images && npm run check:backup && npm run check:breadcrumbs && npm run check:product-layout && npm run build",
```

### Verification for Group 4

```bash
npm run check:product-layout    # must exit 0 with all checks passing
```

archived-with: 2026-07-08-unify-product-header-footer
---

## Group 5: Final Verification

### Task 5.1 — Run layout check script

```bash
node scripts/check-product-layout.mjs
```
Expected: all checks pass, exit 0.

### Task 5.2 — Build verification

```bash
npm run build
```
Expected: build succeeds (SSG, no DB required). No errors related to missing Header/Footer imports.

### Task 5.3 — Test suite

```bash
npm test
```
Expected: all tests pass, no regressions.

### Task 5.4 — Manual smoke test (optional, recommended)

Start dev server and visit:
- `/product` — Header visible at top, content in middle, Footer at bottom
- `/product/xiaomi` — same structure
- `/product/ppf` — same structure (via ProductDetail)
- `/product/window-film` — same structure (via FilmPageHero)

Check no duplicate Header or Footer appears on any page.

archived-with: 2026-07-08-unify-product-header-footer
---

## Rollback

If any verification step fails:

1. `git checkout -- src/app/product/layout.tsx` (if created)
2. `git checkout -- src/app/product/ scripts/check-product-layout.mjs src/components/` (revert all edits)
3. `git checkout -- package.json` (revert script additions)

## Risk Notes

- **Low risk:** All 44 pages use `<Header />` and `<Footer />` with zero props — pure slot components with no configuration variance. Migration is purely mechanical: move the slot up to the layout.
- **Fragment collapse:** Some pages may have `<>...</>` fragments that only exist because of Header/Footer siblings. After removal, the fragment should be collapsed to avoid unnecessary DOM nesting. The plan lists this as a note for each edit but not a hard failure if missed (fragments are harmless).
- **Build risk:** Next.js may warn about layout.tsx being a Server Component that imports client components — this is standard Next.js behavior (Header/Footer are client components imported into a Server layout). No issues expected.
