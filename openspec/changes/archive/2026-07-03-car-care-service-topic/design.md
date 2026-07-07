## Context

蓝辉轻改现有产品中心覆盖膜系（film）、轻改装备（light_mod）、实用配件（practical_accessory）、商务舒适（business_comfort）四大 ServiceGroup，但缺洗美养护类目。本次新增 `car_care` 组，参照 `electric-steps`/`wheels` 标准模式实现。

**约束**：
- 静态数据驱动，无需 DB
- Next.js App Router + RSC 优先
- Tailwind v4 + shadcn/ui Base UI
- 图片统一走 `public/images/products/car-care/`

## Goals / Non-Goals

**Goals:**
- `/product/car-care` 标准版专题页（Hero + ValueGrid + ServiceGrid + ServiceFlow + CTA）
- `product-routes.ts` 注册为新 service_category，组别 `car_care`
- 首页 CoreServices 新增「洗美养护」卡片
- 产品中心按项目区域展示 car-care 入口
- 页面含完整 SEO（metadata、JSON-LD、OpenGraph）

**Non-Goals:**
- 不做 DB/API 后端
- 不做 Admin 后台管理
- 不含发动机舱清洗、漆面美容（镀晶/打蜡）
- 不改 Hero 文案

## Decisions

### D1: 新建 ServiceGroup `car_care`

**选择**：新建独立 `car_care` 组，不合并到现有组。

**原因**：洗美养护语义上不属于 light_mod（改装件）也不属于 practical_accessory（配件），强行归入会造成 `/product` 页按组过滤时认知混乱。

**影响**：
- `product-routes.ts` 新增 `"car_care"` 到 `ServiceGroup` 联合类型
- 产品中心 `page.tsx` 需新增 car-care 过滤逻辑并渲染

### D2: 页面组件树参照 electric-steps 模式

```
src/app/product/car-care/page.tsx (RSC)
├── CarCareHero           — 页面标题 + 副标题 + CTA
├── CarCareValueGrid       — 价值主张卡片
├── CarCareServiceGrid     — 服务项目卡片（洗车 + 内饰清洁）
└── CarCareServiceFlow     — 施工流程
```

### D3: 静态数据文件 `src/lib/car-care-products.ts`

参照 `wheel-products.ts` 模式：字面量类型约束 + services/values/process 数组。

### D4: 首页 — CoreServices 加卡片 + 描述调整

1. SERVICES 数组新增洗美养护卡片
2. Section 描述体现「一条龙」覆盖

### D5: 主题配色 — `green`（emerald），AccentColor 已有无需新增

### D6: 产品中心入口

在 `/product` 页面按项目区域新增 car-care section。

## Risks / Trade-offs

- [低] 图片资源可能不全 → 初始可用占位状态，后续补图
- [低] ServiceGroup 联合类型扩展 → TS strict 兜底，编译期检查遗漏
