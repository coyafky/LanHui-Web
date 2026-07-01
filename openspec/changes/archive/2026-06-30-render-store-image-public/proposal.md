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
