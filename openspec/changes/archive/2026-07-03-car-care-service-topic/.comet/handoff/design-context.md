# Comet Design Handoff

- Change: car-care-service-topic
- Phase: design
- Mode: compact
- Context hash: c79aece1f58f0ee84d4619fc986871357fa5006564fc6b9f0b6efc24c1122538

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/car-care-service-topic/proposal.md

- Source: openspec/changes/car-care-service-topic/proposal.md
- Lines: 1-33
- SHA256: 124c5433f5c7933e99cc661ac29babf6f8446766c82d1808ae8b721dc2bd6c40

```md
## Why

蓝辉轻改目前产品线覆盖贴膜（隐形车衣、窗膜、改色膜）、轻改装备（电动踏板、轮毂、底盘）和实用配件（地板、脚垫），但缺**洗美养护**类目。用户到店后除了改装和贴膜，也有洗车和内饰清洁的刚需。新增洗美项目既能丰富「洗美 + 贴膜 + 轻改装一条龙」的品牌认知，也为首页提供更完整的服务入口。

## What Changes

- 新增 `/product/car-care` 洗美项目页面（标准版：Hero + 价值主张 + 服务网格 + 流程 + CTA）
- 在 `product-routes.ts` 注册 `car-care` 为新的 service_category（新 ServiceGroup `car_care`）
- 创建 `src/lib/car-care-products.ts` 静态数据文件（洗车 + 内饰清洁）
- 创建 `src/components/product/car-care/` 组件目录
- 首页 `CoreServices` 新增「洗美养护」卡片，section 描述体现「一条龙」服务
- 产品中心 `/product` 在按项目区域展示洗美项目入口

## Capabilities

### New Capabilities

- `car-care-page`: 洗美项目专题页，展示洗车和内饰清洁两项服务，包含价值主张、服务项目、施工流程、CTA 引导。路由 `/product/car-care`。

### Modified Capabilities

<!-- 本次不涉及已有 capability 的规格级变更 -->

## Impact

| 层面 | 影响 |
|------|------|
| 路由注册 | `src/lib/product-routes.ts`：新增 ServiceGroup `car_care`、新增 `car-care` ServiceRoute |
| 数据层 | 新建 `src/lib/car-care-products.ts`（静态数据，洗车 + 内饰清洁） |
| 组件 | 新建 `src/components/product/car-care/`（4 组件：Hero、ValueGrid、ServiceGrid、ServiceFlow） |
| 页面 | 新建 `src/app/product/car-care/page.tsx` |
| 首页 | `src/components/CoreServices.tsx`：新增洗美卡片 + 描述文案调整 |
| 产品中心 | `src/app/product/page.tsx`：按项目区域展示 car-care 入口 |
```

## openspec/changes/car-care-service-topic/design.md

- Source: openspec/changes/car-care-service-topic/design.md
- Lines: 1-66
- SHA256: 892ead8acf5d76dddf728b92c0700ee688ad178ff4af7b3d0906f48b6440737a

```md
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
```

## openspec/changes/car-care-service-topic/tasks.md

- Source: openspec/changes/car-care-service-topic/tasks.md
- Lines: 1-25
- SHA256: aff89379e47dd64e1edb067d61b2d3ef69eb85b24bbd36f1c671f326d89a0174

```md
## 1. 路由与数据层

- [ ] 1.1 在 `product-routes.ts` 新增 `car_care` ServiceGroup，注册 `car-care` ServiceRoute
- [ ] 1.2 创建 `src/lib/car-care-products.ts` 静态数据文件（类型定义 + services/values/process 数组）
- [ ] 1.3 创建 `src/lib/car-care-products.test.ts` 测试

## 2. 页面组件

- [ ] 2.1 创建 `CarCareHero` 组件（页面标题 + 副标题 + CTA，emerald 主题）
- [ ] 2.2 创建 `CarCareValueGrid` 组件（价值主张卡片网格）
- [ ] 2.3 创建 `CarCareServiceGrid` 组件（洗车 + 内饰清洁 2 个服务项目卡片）
- [ ] 2.4 创建 `CarCareServiceFlow` 组件（施工流程步骤）
- [ ] 2.5 创建 `src/app/product/car-care/page.tsx` RSC 页面（组装所有组件 + SEO + JSON-LD）

## 3. 首页与产品中心集成

- [ ] 3.1 更新 `CoreServices` 组件：新增洗美养护卡片 + section 描述调整
- [ ] 3.2 更新 `/product` 页面：按项目区域展示 car-care 入口

## 4. 验证

- [ ] 4.1 `npm run typecheck` 通过
- [ ] 4.2 `npm run test` 通过（含 car-care-products.test.ts）
- [ ] 4.3 `npm run build` 通过
- [ ] 4.4 浏览器验证 `/product/car-care` 页面和首页 CoreServices 展示
```

## openspec/changes/car-care-service-topic/specs/car-care-page/spec.md

- Source: openspec/changes/car-care-service-topic/specs/car-care-page/spec.md
- Lines: 1-33
- SHA256: b979f675aa7e8d1b01877e5b6be7722d5c1a554fd5f4d2746917b81f2b4c39c6

```md
## ADDED Requirements

### Requirement: 洗美项目专题页

系统 SHALL 在 `/product/car-care` 提供洗美项目专题页，包含洗车和内饰清洁两项服务。

#### Scenario: 用户访问洗美项目页

- **WHEN** 用户访问 `/product/car-care`
- **THEN** 页面展示 Hero 标题「洗美养护」、价值主张网格、洗车和内饰清洁两个服务项目卡片、施工流程步骤、底部 CTA 引导

#### Scenario: SEO 结构化数据

- **WHEN** 页面渲染
- **THEN** 包含完整的 metadata（title/description）、OpenGraph 图片、JSON-LD CollectionPage 结构化数据

### Requirement: 洗美项目路由注册

系统 SHALL 将 `car-care` 注册为 `service_category` 类型路由，归属新 ServiceGroup `car_care`。

#### Scenario: 产品中心展示洗美入口

- **WHEN** 用户访问 `/product` 产品中心
- **THEN** 在按项目区域可见洗美养护入口，点击跳转到 `/product/car-care`

### Requirement: 首页洗美入口

系统 SHALL 在首页 CoreServices 区域展示洗美养护卡片，并在区域描述中体「洗美 + 贴膜 + 轻改装一条龙」的服务覆盖。

#### Scenario: 首页展示洗美卡片

- **WHEN** 用户访问首页
- **THEN** CoreServices 区域可见「洗美养护」卡片，描述包含一条龙服务表述，点击跳转到 `/product/car-care`
```

