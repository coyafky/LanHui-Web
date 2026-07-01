# Comet Design Handoff

- Change: render-store-image-public
- Phase: design
- Mode: compact
- Context hash: f48ea04cbe7b04e53cd00931a72015682bfb4d0e8f399c2f5b836fb05fad3ea9

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/render-store-image-public/proposal.md

- Source: openspec/changes/render-store-image-public/proposal.md
- Lines: 1-34
- SHA256: 4d14117f0541acac57024c4bd5df9c5f3ce60ae3dbc554c14b471de89956bf10

```md
## Why

Admin 后台的门面图上传链路（`/api/upload` + `Store.imagePath` + `/admin/stores/[id]/image`）已完整实现，但公开站 `/agent/store/[id]` 详情页只渲染 `Building2` 占位符，从不显示已上传的主图；同时首页也没有"推荐门店"section 来曝光已上线（`isActive=true`）的门店。访客无法看到任何真实门店门面，转化漏斗在「看到门店」环节断裂。

## What Changes

- 修复数据层映射：`mapApiStore` 增加 `imagePath → image` 映射（与现有 `imageUrl` 兼容，优先 `imagePath`）
- 公开详情页 `/agent/store/[id]` 第 130-142 行：用 `Next/Image` 渲染 `store.image`，无图时降级到 `/images/placeholders/store.webp`
- 新增首页"推荐门店"section：`/` 路由，筛选 `isActive=true` 的前 4 家门店，使用 `Next/Image` + `priority` 加载
- Admin 门店详情页 `/admin/stores/[id]` 增加"管理门店主图"跳转链接（当前图片上传页无入口，admin 需手动改 URL 才能访问）
- SEO 优化：详情页和推荐位图片均加 `alt`、`sizes`、`placeholder="blur"`（blurDataURL 用 base64 1x1 灰图）
- 新增 `<FeaturedStores />` Server Component，置于 `ProductsQuickEntry` 之后

## Capabilities

### New Capabilities

- `store-public-rendering`: 公开站（含详情页、首页推荐位）正确渲染已上传的门店主图，含 Next/Image SEO 优化与无图降级

### Modified Capabilities

（无 spec-level 行为变化 — 仅为实现层修复与新增 section，不修改现有 spec 的 REQUIREMENTS）

## Impact

| 路径 | 改动 |
|------|------|
| `src/lib/data.ts` | `mapApiStore` 加 `imagePath` 字段映射 |
| `src/app/agent/store/[id]/page.tsx` | 替换 `Building2` 占位为 `Next/Image` |
| `src/app/page.tsx` | 新增 `<FeaturedStores />` section |
| `src/app/admin/(dashboard)/stores/[id]/page.tsx` | "门店图片"检查项旁加"管理主图"链接到 `/admin/stores/[id]/image` |
| `src/components/FeaturedStores.tsx` | **新增文件** — 首页推荐位 RSC |
| `public/images/placeholders/store.webp` | 已有 — 无图降级目标 |
| `public/images/stores/*.webp` | 已有路径 — admin 上传目标 |
```

## openspec/changes/render-store-image-public/design.md

- Source: openspec/changes/render-store-image-public/design.md
- Lines: 1-127
- SHA256: 8baeff1427c08e7b4fc2561cd0d4909e345362f4e2fe2efaedeffe2402a49a1c

[TRUNCATED]

```md
## Context

- `Store` schema 已含 `imageUrl` + `imagePath` 双字段（`prisma/schema.prisma:79-80`）
- `/api/upload` API 完整支持 `entity="store"` 的 POST/DELETE，落盘到 `public/images/stores/<id>.webp` 并写 `imagePath`（`src/app/api/upload/route.ts`）
- `/admin/stores/[id]/image` 已实现 uploader 入口（`src/app/admin/(dashboard)/stores/[id]/image/page.tsx`）
- 数据层 `mapApiStore` 仅映射 `raw.imageUrl → image`，**未映射 `imagePath`**（`src/lib/data.ts:29`）
- 公开详情页 `/agent/store/[id]` 第 130-142 行硬编码 `Building2` 占位 + gradient，**不引用 `store.image`**（`src/app/agent/store/[id]/page.tsx`）
- 首页 `/` 没有"推荐门店"section
- Admin 门店详情页 `/admin/stores/[id]` 没有导航到 `/admin/stores/[id]/image` 的链接（`/admin/stores/[id]/image/page.tsx` 已存在但孤立）
- 占位图 `public/images/placeholders/store.webp` 已存在

## Goals / Non-Goals

**Goals:**
- 公开详情页正确显示已上传的门店主图
- 首页新增"推荐门店"section，曝光 `isActive=true` 的门店
- Admin 详情页加"管理门店主图"跳转链接，闭环 admin 上传 UX
- 全程使用 `Next/Image`（项目其他页面已统一采用，含 LCP 优化）
- 无图时降级到 `placeholders/store.webp`，不显示破图
- 数据层映射向后兼容（`imageUrl` 历史数据仍可读）

**Non-Goals:**
- 不改 schema（`imagePath` 字段已存在）
- 不改 admin 上传链路
- 不改多图库/Gallery
- 不改 `/admin/stores` 列表与详情
- 不在 `/agent` 列表、 `/agent/[slug]` 区域页、 `/agent/[slug]/[city]` 城市页展示门店图（本期范围仅详情页 + 首页）

## Decisions

### D1. `mapApiStore` 映射策略 — 优先 `imagePath`，回退 `imageUrl`

```ts
image: raw.imagePath ?? raw.imageUrl ?? undefined,
```

**为什么：** admin 上传链路（`/api/upload` POST 167 行）只写 `imagePath`，新数据走 `imagePath`。`imageUrl` 是早期手工录入字段，保留为 fallback 以兼容历史数据。

**备选：** 仅 `imagePath` — 拒，历史 `imageUrl` 数据会消失

### D2. 详情页用 `Next/Image` + `placeholder="blur"`

```tsx
<Image
  src={store.image ?? "/images/placeholders/store.webp"}
  alt={`${store.name} 门头实景`}
  fill
  sizes="(min-width: 768px) 50vw, 100vw"
  placeholder="blur"
  blurDataURL={BLUR_DATA_URL}
  className="object-cover"
/>
```

**为什么：** 项目其他专题页（`Wenjie`/`Tesla`/`Xiaomi`）已统一使用 `Next/Image + sizes + object-contain`。`placeholder="blur"` 避免 CLS，`sizes` 让浏览器选正确 srcset。

**备选：** `<img>` — 拒，丢失 Next/Image 优化、CLS 控制、懒加载

### D3. `<FeaturedStores />` 为 RSC + 默认导出 4 张

**为什么：**
- RSC：无 client state、零 JS 增量
- 4 张：与首页 `ProductsQuickEntry`（5 列网格）和 `WhyChooseUs`（3 列）的视觉节奏平衡
- 服务端筛选 `isActive=true` —— 草稿/下线门店不出现在公开站
- 数据通过 `getStores({ limit: 4 })` 拉取，API 自动 fallback 到静态数据

**备选：**
- 客户端 fetch — 拒，首页已是 RSC
- 拉到全部再筛 — 拒，浪费数据

### D4. 推荐位图片加 `priority`

```tsx
<Image priority ... />
```

**为什么：** 推荐位在首页首屏，4 张并排是潜在 LCP 元素。`priority` 让 Next 预加载，避免 LCP 延迟。

**备选：** 无 priority — 拒，LCP 退化

```

Full source: openspec/changes/render-store-image-public/design.md

## openspec/changes/render-store-image-public/tasks.md

- Source: openspec/changes/render-store-image-public/tasks.md
- Lines: 1-40
- SHA256: 517277194c7c93e65ac8981c837e3f3e70e99cf6a853d076a8adf7eb78efbaf3

```md
## 1. Data layer

- [ ] 1.1 修改 `src/lib/data.ts` `mapApiStore`：增加 `imagePath ?? imageUrl ?? undefined` 映射到 `image` 字段
- [ ] 1.2 修改 `src/lib/data.ts` `mapApiStore`：增加 `isActive` 字段映射（默认 `true`）
- [ ] 1.3 验证：`npx tsc --noEmit` 通过

## 2. Public store detail page

- [ ] 2.1 修改 `src/app/agent/store/[id]/page.tsx` 第 130-142 行：用 `Next/Image` 替换 `Building2` 占位
- [ ] 2.2 添加 `placeholder="blur"` + `blurDataURL` 常量（1x1 灰图 base64）
- [ ] 2.3 添加 `sizes="(min-width: 768px) 50vw, 100vw"` 和 `fill` 属性
- [ ] 2.4 添加 `alt={\`${store.name} 门头实景\`}`
- [ ] 2.5 添加 `src={store.image ?? "/images/placeholders/store.webp"}` 降级
- [ ] 2.6 验证：`npm run build` 通过

## 3. Homepage featured stores section

- [ ] 3.1 新建 `src/components/FeaturedStores.tsx` (RSC)
- [ ] 3.2 在 `src/app/page.tsx` 导入并渲染 `<FeaturedStores />`（置于 `ProductsQuickEntry` 之后）
- [ ] 3.3 组件内调用 `getStores({ limit: 4 })` 并筛选 `s.isActive !== false`
- [ ] 3.4 实现 4 列响应式网格（mobile 1, sm 2, lg 4）
- [ ] 3.5 每卡：4:3 图片容器 + 门店名 + 城市标签 + 整卡可点击
- [ ] 3.6 图片：Next/Image + `priority` + `sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"` + `placeholder="blur"`
- [ ] 3.7 当 `stores.length === 0` 时不渲染整个 section
- [ ] 3.8 视觉与 `ProductsQuickEntry` 对齐（标题 `tracking-widest text-blue-400`、卡片 `bg-zinc-900 border-zinc-800`）

## 3a. Admin store detail image link

- [ ] 3a.1 修改 `src/app/admin/(dashboard)/stores/[id]/page.tsx` 第 213-218 行 `publishChecks` 中 `key: "image"` 项：增加 Link 跳转到 `/admin/stores/${storeData.id}/image`
- [ ] 3a.2 链接样式：蓝色 inline 链接 + 右侧箭头（与项目其他 inline link 风格一致）
- [ ] 3a.3 已上传状态显示"查看/更新"，未上传显示"上传门店图"

## 4. Verification

- [ ] 4.1 `npx tsc --noEmit` 通过（除已知 9 个旧错误）
- [ ] 4.2 `npm run build` 通过
- [ ] 4.3 浏览器验证：访问 `/agent/store/{id}`，有图与无图门店各 1 家，确认图片显示
- [ ] 4.4 浏览器验证：访问 `/`，确认推荐位 section 在 4 列网格中渲染
- [ ] 4.5 DevTools Network 面板：确认推荐位图片带 `priority` 预加载
- [ ] 4.6 Lighthouse 移动端跑 `/` 与 `/agent/store/{id}`，确认性能无回退（≥ 90 或与基线持平）
```

## openspec/changes/render-store-image-public/specs/store-public-rendering/spec.md

- Source: openspec/changes/render-store-image-public/specs/store-public-rendering/spec.md
- Lines: 1-117
- SHA256: b9029d2074c2119bad48186c8bf4a94657a324608287ebc03693e312c641b1ea

[TRUNCATED]

```md
## Purpose

公开站（含门店详情页、首页推荐位）必须正确渲染 admin 上传或运营录入的门店主图，并以 Next/Image 优化加载性能与 LCP。

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

```

Full source: openspec/changes/render-store-image-public/specs/store-public-rendering/spec.md

