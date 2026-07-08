# Product Breadcrumb JSON-LD Implementation Report

**Date:** 2026-07-08
**Branch:** `feature/20260708/product-breadcrumbs`
**Script:** `scripts/check-product-breadcrumbs.mjs`

## Summary

Added BreadcrumbList JSON-LD structured data to all 43 product pages (zeekr/page.tsx was already done as the canonical reference).

## Changes

### Pattern applied to each page

```tsx
import { getProductBreadcrumbs, getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";

// In component body:
const breadcrumbSchema = getProductBreadcrumbSchema("/product/<path>");

// In JSX, after Footer (or after existing JSON-LD):
{breadcrumbSchema && (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
  />
)}
```

### Pages modified (43 total)

| Pattern | Count | Pages |
|---------|-------|-------|
| Footer-last (render after `<Footer />`) | ~30 | Most service pages & model detail pages |
| JSON-LD after Footer (render after existing script) | ~8 | Brand pages (li-auto, tesla, wenjie, xiaomi, gaoshan/8, ledao/l90, voyah/dreamer, zhijie) |
| Already had import + call (flooring) | 1 | flooring/page.tsx (just needed render block) |
| No main/Footer directly | 1 | window-film/[packageSlug]/page.tsx |

### New file

- `scripts/check-product-breadcrumbs.mjs` — automated verification script

### Modified files

- `package.json` — added `check:breadcrumbs` script, chained into `npm run check`

## Verification

| Check | Result |
|-------|--------|
| `node scripts/check-product-breadcrumbs.mjs` | 43/43 passed |
| `npx tsc --noEmit` | Only pre-existing errors (no new errors) |
| `npx vitest run src/lib/product-breadcrumbs.test.ts` | 9/9 passed |
| `npx vitest run src/components/Breadcrumbs.test.tsx` | 12/12 passed |

## Architecture

- `getProductBreadcrumbSchema(pathname)` delegates to `getProductBreadcrumbs()`, wraps the result in `generateBreadcrumbSchema()` from `@/lib/geo`
- Only renders when `breadcrumbSchema` is non-null (e.g., `/product` has only 1 item "首页", so it returns null)
- JSON-LD is placed after `<Footer />` or after existing product `ItemList` JSON-LD, before the closing fragment

## Residual Risk

- None. All 43 pages verified, typecheck shows no new errors, existing tests pass.
