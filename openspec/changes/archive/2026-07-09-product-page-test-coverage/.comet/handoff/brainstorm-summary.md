# Brainstorm Summary

- Change: product-page-test-coverage
- Date: 2026-07-09

## 确认的技术方案

**Mock 策略**: 自动 stub 所有 `@/components/**` 导入（返回 `<div data-testid="component-name" />`），保留 next/link 的 `<a>` 语义，mock next/image 为 `<img>`，mock next/navigation 的 notFound 为 vi.fn()。数据 libs（product-routes, products, brand libs）正常执行。

**测试组织**: 按页面类型拆分为 4 个 smoke test 文件 + 1 个路由测试 + 1 个 CI 脚本：
- `product-pages-services.smoke.test.tsx` — 10 live 服务页
- `product-pages-brands.smoke.test.tsx` — 12 live 品牌页
- `product-pages-models.smoke.test.tsx` — 16 live 车型页
- `product-pages-index.smoke.test.tsx` — 首页 + window-film 动态路由
- `product-routes.test.ts` — 路由注册表与文件系统一致性
- `check-product-page-tests.mjs` — CI 防回归

**共享层**: `src/test/product-page-test-utils.tsx` 提供 `setupProductPageMocks()` + `renderProductPage()` helper

**car-care 重构**: 改用共享 test-utils，消除 `let Page: any`，保留核心 4 个测试用例

## 关键取舍与风险

- **自动 stub 牺牲了组件级渲染验证** → 但 smoke test 的目的是"页面能否加载"，不是"组件是否正常"。组件级验证由各组件独立测试覆盖
- **所有页面共用同一 mock 策略** → 如果某个页面依赖未被 mock 的模块（如直接调用 prisma），会在首次运行时暴露，届时按需补充 mock
- **planned 页面排除** → 硬编码排除列表（m6/m7/m8/business-comfort/skid-plate），从 product-routes.ts 的 status 字段验证

## 测试策略

- **Smoke test**: table-driven，每个 live 页面验证 render 不崩溃 + h1/标题存在
- **路由测试**: canonicalPath → page.tsx 文件系统映射验证
- **CI 防回归**: 扫描 page.tsx ↔ smoke manifest 交叉验证

## Spec Patch

无
