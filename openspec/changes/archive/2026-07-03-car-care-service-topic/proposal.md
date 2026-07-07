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
