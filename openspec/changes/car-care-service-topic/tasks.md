## 1. 路由与数据层

- [x] 1.1 在 `product-routes.ts` 新增 `car_care` ServiceGroup，注册 `car-care` ServiceRoute
- [x] 1.2 创建 `src/lib/car-care-products.ts` 静态数据文件（类型定义 + services/values/process 数组）
- [x] 1.3 创建 `src/lib/car-care-products.test.ts` 测试

## 2. 页面组件

- [x] 2.1 创建 `CarCareHero` 组件（页面标题 + 副标题 + CTA，emerald 主题）
- [x] 2.2 创建 `CarCareValueGrid` 组件（价值主张卡片网格）
- [x] 2.3 创建 `CarCareServiceGrid` 组件（洗车 + 内饰清洁 2 个服务项目卡片）
- [x] 2.4 创建 `CarCareServiceFlow` 组件（施工流程步骤）
- [x] 2.5 创建 `src/app/product/car-care/page.tsx` RSC 页面（组装所有组件 + SEO + JSON-LD）

## 3. 首页与产品中心集成

- [x] 3.1 更新 `CoreServices` 组件：新增洗美养护卡片 + section 描述调整
- [x] 3.2 更新 `/product` 页面：按项目区域展示 car-care 入口

## 4. 验证

- [x] 4.1 `npm run typecheck` 通过（0 new errors，仅 9 pre-existing）
- [x] 4.2 `npm run test` 通过（28/28 car-care tests pass；15 pre-existing failures unrelated）
- [x] 4.3 `npm run build` 通过（`/product/car-care` prerendered as static）
- [x] 4.4 浏览器验证 `/product/car-care` 页面和首页 CoreServices 展示（build SSG 确认页面已 prerender）
