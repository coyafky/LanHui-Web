---
comet_change: render-store-image-public
role: technical-design
canonical_spec: openspec
archived-with: 2026-06-30-render-store-image-public
status: final
---

# render-store-image-public — 技术设计

## Context

### 现状
- `Store` schema 已含 `imageUrl` + `imagePath` 双字段（`prisma/schema.prisma:79-80`）
- `/api/upload` API 完整支持 `entity="store"` 的 POST/DELETE，落盘 `public/images/stores/<id>.webp` 并写 `imagePath`（`src/app/api/upload/route.ts`）
- `/admin/stores/[id]/image` 已实现 uploader 入口（`src/app/admin/(dashboard)/stores/[id]/image/page.tsx`）
- **数据层 `mapApiStore` 仅映射 `raw.imageUrl → image`，未映射 `imagePath`**（`src/lib/data.ts:29`）← 本次修复点 1
- **公开详情页 `/agent/store/[id]` 第 130-142 行硬编码 `Building2` 占位 + gradient，不引用 `store.image`**（`src/app/agent/store/[id]/page.tsx`）← 本次修复点 2
- 首页 `/` 没有「推荐门店」section ← 本次新增
- Admin 门店详情页 `/admin/stores/[id]` 没有导航到 `/admin/stores/[id]/image` 的链接 ← 本次新增
- 占位图 `public/images/placeholders/store.webp` 已存在

### Goals / Non-Goals

**Goals:**
- 公开详情页正确显示已上传的门店主图（替代 `Building2` 占位）
- 首页新增「推荐门店」section，曝光 `isActive=true` 的活跃门店
- Admin 详情页加「管理门店主图」跳转链接，闭环 admin UX
- 全程使用 `Next/Image`（项目其他专题页已统一采用）
- 无图时降级到 `placeholders/store.webp`，不显示破图
- 数据层映射向后兼容（`imageUrl` 历史数据仍可读）

**Non-Goals:**
- 不改 schema（`imagePath` 字段已存在）
- 不改 admin 上传链路
- 不改多图库 / Gallery
- 不改 `/admin/stores` 列表与详情结构（仅在 publishChecks 加链接）
- 不在 `/agent` 列表、`/agent/[slug]` 区域页、`/agent/[slug]/[city]` 城市页展示门店图（本期范围仅详情页 + 首页）

archived-with: 2026-06-30-render-store-image-public
status: final
---

## Architecture

### 总体流程图

```
                          ┌──────────────────────────────┐
   Admin Upload  ────────▶│ /api/upload (entity=store)   │
   (POST/DELETE)          │  - sharp → webp q80          │
                          │  - 落盘 public/images/stores/│
                          │  - 写 Store.imagePath        │
                          └──────────────┬───────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────┐
   公开站读图 ◀───────────│ mapApiStore()                │
   (/agent/store/[id])    │  image: imagePath ?? imageUrl│
   (/) FeaturedStores     │  isActive: raw.isActive ??   │
                          │            true              │
                          └──────────────┬───────────────┘
                                         │
                       ┌─────────────────┼─────────────────┐
                       ▼                 ▼                 ▼
              ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
              │ 详情页 Image  │  │ 推荐位 Image │  │ Admin 跳转   │
              │  fill+sizes  │  │ priority     │  │ Link         │
              │  blur        │  │ + blur       │  │ /image       │
              └──────────────┘  └──────────────┘  └──────────────┘
```

### 1. 数据层修复

**位置**：`src/lib/data.ts` `mapApiStore`

```ts
export function mapApiStore(raw: ApiStore): Store {
  return {
    id: raw.id,
    name: raw.name,
    city: raw.city,
    address: raw.address,
    phone: raw.phone,
    image: raw.imagePath ?? raw.imageUrl ?? undefined,
    isActive: raw.isActive ?? true,
    // ...其他字段保持原状
  };
}
```

**兼容性矩阵：**

| `raw.imagePath` | `raw.imageUrl` | `mapApiStore.image` |
|-----------------|----------------|---------------------|
| `/images/...`   | `null`         | `/images/...` ✓     |
| `null`          | `https://...`  | `https://...` ✓     |
| `null`          | `null`         | `undefined` → placeholder |
| 都存在          | —              | `/images/...`（imagePath 优先）|

### 2. 公开详情页渲染

**位置**：`src/app/agent/store/[id]/page.tsx` 第 130-142 行

**修改前（占位）**：
```tsx
<div className="aspect-[4/3] bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
  <Building2 className="h-16 w-16 text-zinc-600" />
</div>
```

**修改后（Next/Image）**：
```tsx
const BLUR_DATA_URL = "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/v3AgAA=";

<div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-zinc-900">
  <Image
    src={store.image ?? "/images/placeholders/store.webp"}
    alt={`${store.name} 门头实景`}
    fill
    sizes="(min-width: 768px) 50vw, 100vw"
    placeholder="blur"
    blurDataURL={BLUR_DATA_URL}
    className="object-cover"
  />
</div>
```

**Next/Image 优化要点**：
- `fill` + `sizes` 让浏览器自动选 srcset
- `placeholder="blur"` + `blurDataURL` 避免 CLS（layout shift）
- `object-cover` 保持 4:3 容器比例下图片填满
- `alt` 包含门店名 + 「门头实景」语义

### 3. 首页「推荐门店」RSC

**新增文件**：`src/components/FeaturedStores.tsx`

```tsx
import Image from "next/image";
import Link from "next/link";
import { getStores } from "@/lib/data";

const BLUR_DATA_URL = "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/v3AgAA=";

export async function FeaturedStores() {
  const { data: stores } = await getStores({ limit: 4 });
  const active = stores.filter((s) => s.isActive !== false);

  if (active.length === 0) return null;

  return (
    <section className="...">
      <div className="text-center mb-12">
        <p className="text-blue-400 tracking-widest text-sm mb-2">FEATURED STORES</p>
        <h2 className="text-2xl md:text-3xl font-bold">推荐门店</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {active.map((store) => (
          <Link
            key={store.id}
            href={`/agent/store/${store.id}`}
            className="group bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 overflow-hidden transition-colors"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-950">
              <Image
                src={store.image ?? "/images/placeholders/store.webp"}
                alt={`${store.name} 门头实景`}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-white transition-colors">
                {store.name}
              </h3>
              <span className="inline-flex items-center mt-2 text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                {store.city}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

**关键设计点**：
- **RSC（无 "use client"）**：零 JS 增量，纯服务端渲染
- **`priority`**：4 张图均在首屏上方，LCP 元素必须预加载
- **`hover:scale-105`**：图片 hover 微缩放增强交互感（与 ProductsQuickEntry 一致）
- **空守卫**：`active.length === 0` 时整个 section 不渲染（不显示空标题）
- **响应式**：移动 1 列 / sm 2 列 / lg 4 列
- **视觉对齐**：标题 `tracking-widest text-blue-400`、卡片 `bg-zinc-900 border-zinc-800`，与 `ProductsQuickEntry` 完全对齐

### 4. Admin 跳转链接

**位置**：`src/app/admin/(dashboard)/stores/[id]/page.tsx` 第 213-218 行 `publishChecks`

```tsx
{
  key: "image",
  label: "门店图片",
  pass: Boolean(storeData.imagePath),
  action: (
    <Link
      href={`/admin/stores/${storeData.id}/image`}
      className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
    >
      {storeData.imagePath ? "管理主图 →" : "上传门店图 →"}
    </Link>
  ),
}
```

**为什么放在 publishChecks**：
- 当前 `publishChecks` 已含 `key: "image"` 检查项（该处 admin 视线聚焦检查清单状态）
- 在「门店图片」未通过/已通过的提示旁提供跳转，**视觉关联最强**
- 不引入新菜单项，不破坏侧边栏结构

archived-with: 2026-06-30-render-store-image-public
status: final
---

## Components / Modules

### 新增
| 路径 | 类型 | 职责 |
|------|------|------|
| `src/components/FeaturedStores.tsx` | RSC | 首页推荐门店 section |

### 修改
| 路径 | 改动类型 |
|------|----------|
| `src/lib/data.ts` | `mapApiStore` 加 `image` + `isActive` 字段映射 |
| `src/app/agent/store/[id]/page.tsx` | 替换 `Building2` 占位为 `Next/Image` |
| `src/app/page.tsx` | 在 `ProductsQuickEntry` 后挂载 `<FeaturedStores />` |
| `src/app/admin/(dashboard)/stores/[id]/page.tsx` | `publishChecks` `image` 项加跳转链接 |

### 不变
- `prisma/schema.prisma`（`imageUrl` + `imagePath` 已存在）
- `/api/upload/route.ts`（admin 上传链路完整）
- `/admin/stores/[id]/image/page.tsx`（uploader 入口已存在，本次仅补入口链接）
- `/lib/store.ts` 静态 fallback（保持原状，mapApiStore 自动处理）

archived-with: 2026-06-30-render-store-image-public
status: final
---

## Data Flow

### 写路径（已存在，本次不动）
```
admin 上传图片 → POST /api/upload (entity=store)
  → sharp webp q80 → public/images/stores/<id>.webp
  → UPDATE Store SET imagePath = "/images/stores/<id>.webp"
```

### 读路径（本次修复）
```
公开站访问 → getStores({ limit: 4 })  [API 优先 / 静态 fallback]
  → API: GET /api/stores → [{ id, name, city, imagePath, ... }, ...]
  → mapApiStore(raw) → Store { image: imagePath ?? imageUrl, isActive }
  → <FeaturedStores /> 渲染 4 张卡片
  → /agent/store/[id] 渲染详情图
```

### ISR 与缓存
- `getStores` revalidate = 3600s（1 小时）
- admin 上传后最多 1 小时延迟（已有约束，本期接受）
- Cloudflare 缓存可通过手动 purge 立即刷新（如有需要）

archived-with: 2026-06-30-render-store-image-public
status: final
---

## Error Handling

### 数据层
- `raw.imagePath` 与 `raw.imageUrl` 都为 null → `store.image = undefined` → 渲染 placeholder（无破图）
- `raw.isActive` 字段缺失 → `isActive = true`（向后兼容，不误下架历史草稿）

### 渲染层
- `<Image>` 的 `src` 无效 → Next/Image 自动 fallback 到默认错误图（极少触发）
- `BLUR_DATA_URL` 任意合法 base64 即可，无需精确匹配实际图

### 推荐位
- `getStores` 失败 → fallback 到 `src/lib/store.ts` 静态数据
- 静态数据中无 `isActive` 字段 → 视为 `true`（前端过滤 `!== false`）

### Admin 链接
- `storeData.imagePath` 缺失 → 显示「上传门店图 →」文案
- `storeData.imagePath` 存在 → 显示「管理主图 →」文案

archived-with: 2026-06-30-render-store-image-public
status: final
---

## Testing Strategy

### 自动化（CI 链）

| 命令 | 期望 |
|------|------|
| `npx tsc --noEmit` | 0 新错（已知 9 个 test 文件旧错不计） |
| `npm run build` | 构建通过；SSG 包含 `/agent/store/[id]` 与首页推荐位 |

### 单元测试（vitest）

**`src/lib/data.ts` `mapApiStore` 测试**：
```ts
describe("mapApiStore", () => {
  it("imagePath 优先", () => {
    const raw = { id: "1", name: "x", city: "y", imagePath: "/p.webp", imageUrl: "https://..." };
    expect(mapApiStore(raw).image).toBe("/p.webp");
  });
  it("imageUrl 兜底", () => {
    const raw = { id: "1", name: "x", city: "y", imagePath: null, imageUrl: "https://x.jpg" };
    expect(mapApiStore(raw).image).toBe("https://x.jpg");
  });
  it("都为空 → undefined", () => {
    const raw = { id: "1", name: "x", city: "y", imagePath: null, imageUrl: null };
    expect(mapApiStore(raw).image).toBeUndefined();
  });
  it("isActive 默认为 true", () => {
    const raw = { id: "1", name: "x", city: "y" };
    expect(mapApiStore(raw).isActive).toBe(true);
  });
});
```

**`<FeaturedStores />` 行为测试**（如引入）：
```ts
describe("FeaturedStores", () => {
  it("stores.length === 0 不渲染", () => { ... });
  it("渲染最多 4 张", () => { ... });
  it("过滤 isActive === false", () => { ... });
});
```

### 浏览器验证（手动）

| 场景 | 期望 |
|------|------|
| `/agent/store/{有图门店 id}` | 显示已上传图，4:3 容器，Next/Image `priority` |
| `/agent/store/{无图门店 id}` | 显示 `placeholders/store.webp`，无破图 |
| `/` 移动端 390px | 推荐位 1 列网格 |
| `/` 平板 768px | 推荐位 2 列网格 |
| `/` 桌面 1440px | 推荐位 4 列网格 |
| DevTools Network（`/`）| 推荐位图片带 `<link rel="preload">` |
| `/admin/stores/{id}`（已登录） | `publishChecks` 显示「管理主图 →」链接 |
| 点击「管理主图 →」 | 跳转 `/admin/stores/{id}/image` uploader |

### 视觉验证
- 推荐位卡片 hover：图片 `scale-105`、边框变亮
- 标题 `tracking-widest text-blue-400`、卡片 `bg-zinc-900 border-zinc-800`，与 `ProductsQuickEntry` 视觉一致

archived-with: 2026-06-30-render-store-image-public
status: final
---

## Risks & Trade-offs

| ID | 风险 | 等级 | 缓解 |
|----|------|------|------|
| R1 | 首页 4 张 priority 图可能拖累 LCP | 低 | webp q80 + Next/Image srcset，单图 < 100KB |
| R2 | `Store` 表当前可能全 `isActive=false` | 中 | 守卫 `active.length === 0` 不渲染整个 section |
| R3 | `getStores` 当前不返回 `isActive` | 中 | `mapApiStore` 补字段，前端 `!== false` 默认 true |
| R4 | `blurDataURL` 是固定 base64（4 张图共用）| 低 | 1x1 灰图（~30 字节），CLS 控制足够 |
| R5 | ISR revalidate=3600s，admin 上传有延迟 | 低 | 已知约束；Cloudflare purge 可手动 |
| R6 | 历史 `imageUrl` 数据可能缺失（早期手工录入）| 低 | 映射优先级 `imagePath ?? imageUrl` 兼容 |
| R7 | `Next/Image` 域名白名单（next.config）| 低 | `/images/stores/*.webp` 与 `/images/placeholders/*.webp` 已在 `public/` 下，无需新增 remote pattern |

archived-with: 2026-06-30-render-store-image-public
status: final
---

## Migration Plan

无破坏性变更，纯增量：

1. **数据层修复**（`mapApiStore`）— 全公开站立即可见现有 `imagePath` 数据
2. **详情页图片渲染** — 立即生效，替代 `Building2` 占位
3. **推荐位 section** — 立即渲染（如有 `isActive=true` 门店）
4. **Admin 跳转链接** — 立即生效
5. 无 DB 迁移、无环境变量变更、无需重启服务

**回滚策略**：单个 PR revert 即可，不影响 schema 与 API；静态 fallback 仍可工作。

archived-with: 2026-06-30-render-store-image-public
status: final
---

## Open Questions
- (无) 已在 brainstorming 阶段澄清：卡片内容深度 = 图+名字+城市；section 标题 = 推荐门店；无副标题。
- (无) 是否需要为 `Store` 加 `displayOrder` 字段供运营手动排序？— 不在范围。
- (无) 推荐位是否需要按"距离最近"地理位置排序？— 不在范围。

archived-with: 2026-06-30-render-store-image-public
status: final
---

## Spec Patch

无 — 当前 `openspec/changes/render-store-image-public/specs/store-public-rendering/spec.md` 已覆盖全部验收场景；brainstorming 阶段的 Q1（卡片内容深度）已被现有 spec Scenario "Store without image in featured section" 兼容。
