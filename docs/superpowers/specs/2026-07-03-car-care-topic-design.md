---
comet_change: car-care-service-topic
role: technical-design
canonical_spec: openspec
archived-with: 2026-07-03-car-care-service-topic
status: final
---

# Car Care Service Topic — Technical Design

## Architecture Overview

```
src/
├── lib/
│   └── car-care-products.ts          # 静态数据 (types + values + services + process)
├── components/product/car-care/
│   ├── CarCareHero.tsx                # 页面 Hero (emerald 主题)
│   ├── CarCareValueGrid.tsx           # 价值主张 2x2 卡片
│   ├── CarCareServiceGrid.tsx         # 服务项目 2 列卡片（洗车 + 内饰）
│   └── CarCareServiceFlow.tsx         # 4 步流程 + CTA
└── app/product/car-care/
    └── page.tsx                       # RSC 页面入口

src/lib/product-routes.ts             # +car_care ServiceGroup + car-care ServiceRoute
src/app/product/page.tsx              # +car-care section 渲染
src/components/CoreServices.tsx       # 改为 2x2 + 新卡片 + 描述调整
```

## Data Model

`src/lib/car-care-products.ts`:

```
CarCareServiceItem { id, title, subtitle, description, highlights[] }
CarCareValue        { icon, title, description }
CarCareProcessStep  { step, title, description }
```

- `carCareValues`: 4 items — 专业洗护 / 深度清洁 / 环保用料 / 到店便捷
- `carCareServices`: 2 items — exterior-wash / interior-detailing
- `carCareProcess`: 4 steps — 预约到店 / 车辆检查 / 分区施工 / 交付验收

## Component Design

All components use emerald theme (emerald-500/400 for accents, emerald-950/900 for backgrounds).

### CarCareHero
- Two-column layout: left text + right (empty or placeholder visual)
- Badge: "CAR CARE — 洗美养护"
- H1: "专业洗美养护"
- Description paragraph explaining exterior + interior services
- Two CTAs: primary (联系预约, emerald) + secondary (查看服务详情)
- Breadcrumb: 产品中心 → 洗美养护

### CarCareValueGrid
- Section heading: "WHY CAR CARE" / "为什么选择蓝辉洗美"
- 2x2 grid (lg:grid-cols-2) of value cards with Lucide icons
- Icons: Droplets, SprayCan, Leaf, Clock
- Each card: icon box (emerald border/bg) + title + description

### CarCareServiceGrid
- Section heading: "SERVICES" / "洗美服务项目"
- 2-column grid (md:grid-cols-2) of service info cards
- Each card: service title + subtitle + description + highlights list
- No images needed (pure info)

### CarCareServiceFlow
- Section heading: "SERVICE FLOW" / "到店施工流程"
- 4-step horizontal cards (grid-cols-4 on desktop, stacked on mobile)
- Step numbers: 01, 02, 03, 04
- Bottom CTA banner: "联系蓝辉轻改" with emerald button → /contact

## Route Registration

Add to `product-routes.ts`:

```typescript
// ServiceGroup union
type ServiceGroup = "film" | "light_mod" | "business_comfort" | "practical_accessory" | "car_care"

// New service entry in SERVICES array
{ type: "service_category", serviceSlug: "car-care", title: "洗美养护",
  navLabel: "洗美养护", group: "car_care", status: "live", priority: "P0",
  canonicalPath: "/product/car-care" }
```

## Homepage Update

`CoreServices.tsx` changes:
- Grid: `lg:grid-cols-3` → `lg:grid-cols-2`
- New card: icon=Droplets, title="洗美养护", description="专业洗车与内饰深度清洁，日常养护到轻改装贴膜全覆盖，一条龙服务更省心", href="/product/car-care", accent="green"
- Section description: "从洗美养护、贴膜服务到轻改装备，蓝辉轻改提供一条龙式升级服务，让每次到店都物超所值"

## Product Center Update

`src/app/product/page.tsx`:
- Add `carCareServices` filter (group === "car_care")
- Render car-care section in `#service-projects` alongside FilmServiceMap/LightModMap/PracticalAccessoryMap
- Single-item section with link card to `/product/car-care`

## SEO

Page metadata: title="洗美养护｜蓝辉轻改 LANHUI", description covering exterior wash + interior detailing. JSON-LD CollectionPage with ItemList of 2 services.

## Testing

| Level | What |
|-------|------|
| Unit | `car-care-products.test.ts` — type constraints, data integrity |
| Unit | `product-routes.test.ts` — car-care route lookup |
| Build | `npm run build` SSG success |
| E2E | Browser: page renders, CoreServices card links correctly, product center entry visible |
