---
comet_change: product-page-test-coverage
role: technical-design
canonical_spec: openspec
archived-with: 2026-07-09-product-page-test-coverage
status: final
---

# Product Page Test Coverage — Technical Design

## Architecture Overview

```
product-routes.ts (source of truth)
        │
        ├──→ smoke test manifest ──→ 4 *.smoke.test.tsx ──→ vitest
        │         │
        │         └──→ CI 交叉验证 ←── git ls-files page.tsx
        │
        └──→ product-routes.test.ts (路由一致性)

src/test/product-page-test-utils.tsx (共享层)
  ├── setupProductPageMocks()    → auto-stub @/components/**
  └── renderProductPage()        → dynamic import + render
```

## Mock Strategy: Auto-Stub Components

**决策**: 使用 `vi.mock()` 自动 stub 所有 `@/components/**` 导入，返回无状态 `<div>` stub 组件。

**理由**:
- 39 个页面使用 100+ 不同组件，逐个 mock 不可维护
- Smoke test 目的是"页面能否加载并渲染结构"，不是"组件是否正常"
- 组件级验证由各组件独立测试覆盖
- 数据层（`@/lib/*.ts`）保持未 mock，确保路由逻辑和数据解析正常执行

**Mock 清单**:
| 模块 | 处理方式 |
|------|---------|
| `@/components/**` | stub `<div data-testid="component-name" />` |
| `next/link` | 替换为 `<a>` 保留 href 语义 |
| `next/image` | 替换为 `<img>` |
| `next/navigation` | `notFound` → `vi.fn()` |
| `@/lib/*` | 不 mock（正常执行） |

## File Organization

### New Files

| File | Purpose |
|------|---------|
| `src/test/product-page-test-utils.tsx` | Shared mocks + render helper |
| `src/app/product/product-pages-services.smoke.test.tsx` | 10 live service pages |
| `src/app/product/product-pages-brands.smoke.test.tsx` | 12 live brand pages |
| `src/app/product/product-pages-models.smoke.test.tsx` | 16 live model pages |
| `src/app/product/product-pages-index.smoke.test.tsx` | Index + window-film dynamic |
| `src/lib/product-routes.test.ts` | Route registry consistency checks |
| `scripts/check-product-page-tests.mjs` | CI anti-regression guard |

### Modified Files

| File | Change |
|------|--------|
| `src/app/product/car-care/page.test.tsx` | Use shared test-utils; remove `let Page: any` |
| `package.json` | Add `check:product-page-tests` script; chain into `check` |

## Smoke Test Design

### Service Pages (10 pages)

**Source manifest**: `getLiveServices()` from `product-routes.ts`
**Assertions per page**:
1. Dynamic import + render does not throw
2. Page has at least one `<h1>` or service title text
3. `<main>` element exists

### Brand Pages (12 pages)

**Source manifest**: `getLiveBrands()` from `product-routes.ts`
**Assertions per page**:
1. Dynamic import + render does not throw
2. Page content includes brand name (`brandName` from route)
3. Page has a content area (not empty `<main>`)

### Model Pages (16 pages)

**Source manifest**: `ALL_MODELS.filter(m => m.status === "live")`
**Assertions per page**:
1. Dynamic import + render does not throw
2. Page content includes model name (`modelName` from route)
3. Page has a content area

### Index Page + Dynamic Route

**`/product`**: Render + h1 exists + at least one brand/service entry
**`window-film/[packageSlug]`**: `generateStaticParams()` returns 7 slugs; render with "chunfen" does not throw; invalid slug → `notFound`

## Route Consistency Tests

`src/lib/product-routes.test.ts`:

1. Live brand `canonicalPath` → `src/app/product/<brand>/page.tsx` exists
2. Live model `canonicalPath` → `src/app/product/<brand>/<model>/page.tsx` exists
3. Live service `canonicalPath` → `src/app/product/<service>/page.tsx` exists
4. No duplicate `canonicalPath` values across all routes
5. No `legacyPath` conflicts with any `canonicalPath`
6. Planned pages are excluded from live coverage manifest

## CI Anti-Regression Script

`scripts/check-product-page-tests.mjs`:

1. Scan all `src/app/product/**/page.tsx` via `git ls-files`
2. Exclude planned paths: `wenjie/m6`, `wenjie/m7`, `wenjie/m8`, `business-comfort`, `skid-plate`
3. For each page, verify it has a test entry in one of the 4 smoke test manifests
4. If any live page lacks coverage → exit 1 with path details
5. Verify the planned exclusion list matches `product-routes.ts` status field

## Car-Care Test Refactoring

| Before | After |
|--------|-------|
| 4 per-component `vi.mock()` calls | `setupProductPageMocks()` from shared utils |
| `let Page: any` | `Awaited<ReturnType<typeof import("./page")>>` |
| 6 test cases testing specific mock components | 4 core cases: render, JSON-LD, sections count, header/footer presence |

## Risks & Mitigations

- **[Risk] Auto-stub hides component import errors** → Mitigation: route consistency test verifies page.tsx files exist; component import errors caught at build time
- **[Risk] Some pages use direct data fetching (prisma)** → Mitigation: test will fail on first run; add targeted mock in the smoke test file for that specific page
- **[Risk] Planned page list drifts from product-routes.ts** → Mitigation: CI script cross-validates exclusion list against `ALL_SERVICES`/`ALL_MODELS` status field
