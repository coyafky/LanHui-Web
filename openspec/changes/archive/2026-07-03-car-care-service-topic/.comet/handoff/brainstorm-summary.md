# Brainstorm Summary

- Change: car-care-service-topic
- Date: 2026-07-03

## 确认的技术方案

1. **数据模型**: `src/lib/car-care-products.ts` 纯静态数据，类型定义 + carCareValues(4条) + carCareServices(2项: 外部精洗/内饰清洁) + carCareProcess(4步)
2. **组件树**: CarCareHero → CarCareValueGrid(2x2) → CarCareServiceGrid(2列纯信息卡片) → CarCareServiceFlow(4步+CTA)，参照 electric-steps 模式
3. **产品中心**: 新增 car-care section，与 FilmServiceMap/LightModMap/PracticalAccessoryMap 并列
4. **首页**: CoreServices 改为 2x2 布局，新增「洗美养护」卡片(green/Droplets)，section 描述改为「从洗美养护、贴膜服务到轻改装备，蓝辉轻改提供一条龙式升级服务，让每次到店都物超所值」
5. **路由**: 新建 ServiceGroup `car_care`，注册 `car-care` ServiceRoute (live/P0)
6. **主题色**: emerald (AccentColor 已有，无需新增)
7. **无图片依赖**: 纯信息卡片，不需要图片资源

## 关键取舍与风险

- 选择纯信息卡片而非图片 gallery — 降低初始交付门槛，后续可随时加图
- ServiceGroup 新增 `car_care` — 产品中心需加过滤逻辑，TS strict 兜底

## 测试策略

- `car-care-products.ts` 单元测试：类型验证 + 数据完整性
- `product-routes.test.ts` 扩展：验证 car-care route 注册
- 浏览器验证：`/product/car-care` 页面 + 首页 CoreServices + 产品中心入口

## Spec Patch

无 — 现有 spec 已覆盖所有需求，无需回写。
