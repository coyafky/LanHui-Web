# store-public-rendering Specification

## Purpose
TBD - created by archiving change render-store-image-public. Update Purpose after archive.
## Requirements
### Requirement: Store image data mapping

`mapApiStore` MUST map the API store record's `imagePath` field to the public `Store.image` field, falling back to `imageUrl` for backward compatibility with historical data, and finally to `undefined`.

#### Scenario: New upload via admin

- GIVEN a store has `imagePath="/images/stores/abc123.webp"` and `imageUrl=null` in the API response
- WHEN `mapApiStore` processes this record
- THEN the resulting `Store.image` SHALL equal `"/images/stores/abc123.webp"`

#### Scenario: Legacy data fallback

- GIVEN a store has `imagePath=null` and `imageUrl="https://example.com/legacy.jpg"` in the API response
- WHEN `mapApiStore` processes this record
- THEN the resulting `Store.image` SHALL equal `"https://example.com/legacy.jpg"`

#### Scenario: No image

- GIVEN a store has both `imagePath` and `imageUrl` as null
- WHEN `mapApiStore` processes this record
- THEN the resulting `Store.image` SHALL be `undefined`

### Requirement: Public store detail page image rendering

`/agent/store/[id]` MUST render the store's main image using `Next/Image` when `store.image` is set, and MUST fall back to `/images/placeholders/store.webp` when `store.image` is `undefined`. The image MUST occupy the existing 4:3 aspect-ratio container at the left column of the two-column store info section.

#### Scenario: Store with uploaded image

- GIVEN `store.image="/images/stores/abc123.webp"`
- WHEN the public store detail page renders
- THEN a `Next/Image` MUST be displayed in the 4:3 left container
- AND the `src` MUST equal `/images/stores/abc123.webp`
- AND the `alt` MUST be `"<store.name> 门头实景"`
- AND `placeholder="blur"` MUST be set with a `blurDataURL`

#### Scenario: Store without image

- GIVEN `store.image` is `undefined`
- WHEN the public store detail page renders
- THEN the `Next/Image` `src` MUST equal `/images/placeholders/store.webp`
- AND no broken image icon SHALL appear

#### Scenario: Image size hint

- GIVEN any store detail page render
- WHEN the image is rendered
- THEN the `Next/Image` `sizes` prop MUST be set to `"(min-width: 768px) 50vw, 100vw"`
- AND the `fill` prop MUST be used (no explicit `width`/`height`)

### Requirement: Homepage featured stores section

The home page (`/`) MUST display a "推荐门店" section when at least one store with `isActive !== false` exists. The section MUST show up to 4 active stores, each rendered as a clickable card linking to `/agent/store/<store.id>`. Each card MUST display the store's main image, name, and city.

#### Scenario: Active stores available

- GIVEN 5 stores with `isActive=true` exist
- WHEN the home page renders
- THEN the "推荐门店" section MUST be visible
- AND exactly 4 stores MUST be displayed (the first 4 returned by `getStores`)

#### Scenario: No active stores

- GIVEN no stores with `isActive !== false` exist (e.g., all stores are drafts)
- WHEN the home page renders
- THEN the "推荐门店" section MUST NOT be rendered (hidden, no empty header)

#### Scenario: Store without image in featured section

- GIVEN an active store without `imagePath` and without `imageUrl`
- WHEN the featured stores section renders
- THEN that store's card MUST use `/images/placeholders/store.webp` as the image source

#### Scenario: Featured store image priority

- GIVEN the featured stores section is rendered on the home page (above-the-fold area)
- WHEN the images are rendered
- THEN each card's `Next/Image` MUST have `priority` set to enable LCP preloading
- AND `sizes` MUST be set to `"(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"`

### Requirement: Image SEO attributes

All `Next/Image` elements rendering store images on public pages MUST set `alt` attribute describing the store name and the image being a "门头实景" (storefront). `width` and `height` MUST NOT be set when using `fill`; `sizes` MUST be specified to enable responsive srcset.

#### Scenario: alt attribute format

- GIVEN any store image rendered on a public page
- WHEN the `Next/Image` element is generated
- THEN the `alt` prop MUST follow the format `"<store.name> 门头实景"`

### Requirement: Admin store image management entry point

The admin store detail page (`/admin/stores/[id]`) MUST provide a clickable link to the store image management page (`/admin/stores/[id]/image`) within the publish checks panel, near the `门店图片` (store image) check item.

#### Scenario: Admin wants to upload image

- GIVEN an authenticated admin viewing `/admin/stores/<id>`
- WHEN the publish checks panel renders
- THEN a link to `/admin/stores/<id>/image` MUST be visible near the "门店图片" check item
- AND clicking the link MUST navigate to the image management page

#### Scenario: Store has no image

- GIVEN a store with `imagePath = null`
- WHEN the admin store detail page renders
- THEN the image management link MUST show text indicating "upload" (e.g., "上传门店图")

#### Scenario: Store has image

- GIVEN a store with `imagePath != null`
- WHEN the admin store detail page renders
- THEN the image management link MUST show text indicating "view/update" (e.g., "管理主图")

