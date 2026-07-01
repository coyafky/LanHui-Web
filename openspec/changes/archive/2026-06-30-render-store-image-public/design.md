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

### D5. 视觉规范：与现有首页组件对齐

- 标题模式：`p.text-blue-400 tracking-widest` + `h3.text-2xl md:text-3xl`
- 卡片背景：`bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700`
- 图片容器：`aspect-[4/3]` 与 detail 页保持比例一致
- 整卡可点击 → 跳转到 `/agent/store/{id}`

**为什么：** 复用 `ProductsQuickEntry` / `BrandMatrixMap` 等现有首页组件的视觉系统

### D6. Admin 详情页跳转链接 — 在 `门店图片` 检查项旁

```tsx
<Link href={`/admin/stores/${storeId}/image`}
  className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300">
  管理主图 →
</Link>
```

**为什么：** 当前 `publishChecks` 已含 `key: "image"` 检查项（`/admin/stores/[id]/page.tsx:213-218`），在那里加链接视觉关联最强 — admin 看到"门店图片"未上传/已上传的提示后可直接点链接去操作

**备选：** 单独加一行 button — 拒，重复信息；Sidebar 加菜单项 — 越界（不在最小修范围）

## Risks / Trade-offs

- **R1: 首页新增 section 增加首屏渲染负担** → 只增加 4 张图的字节量（约 200-400KB webp），但 LCP 仍受 `priority` 保护；不引入第三方脚本
- **R2: `Store` 表当前可能为空或全 `pending` 状态** → 推荐位为空时整个 section 不渲染（用 `stores.length > 0` 守卫）
- **R3: `getStores` 当前不返回 `isActive` 字段** → `mapApiStore` 需补 `isActive` 字段；前端用 `s.isActive !== false` 兼容（默认 true）
- **R4: blurDataURL 是固定 base64** → 4 张图共用同一灰图占位，体验 OK 但非完美；用 1x1 灰图（~30 字节）足够
- **R5: 公开站 ISR revalidate 与 admin 上传** → admin 上传后，公开站有 1 小时 revalidate 延迟（`getStores` revalidate: 3600），管理员可通过 Cloudflare 手动 purge；本期接受此延迟

## Migration Plan

无破坏性变更，纯增量：
1. 数据层修复（`mapApiStore`）— 全公开站立即可见现有 `imagePath` 数据
2. 详情页图片渲染 — 立即生效
3. 推荐位 section — 立即渲染（如有 `isActive=true` 门店）
4. Admin 跳转链接 — 立即生效
5. 无 DB 迁移、无环境变量变更、无需重启服务

**回滚：** 单个 PR revert 即可，不影响 schema 与 API

## Open Questions

- (已确认) 推荐位数量：4 张
- (已确认) 不在 `/agent` 列表/区域/城市页展示门店图
- (无) 是否需要为 `Store` 加 `displayOrder` 字段供运营手动排序？— 不在范围
- (无) 推荐位是否需要按"距离最近"地理位置排序？— 不在范围
