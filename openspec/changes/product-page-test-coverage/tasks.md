## 1. 共享测试工具

- [x] 1.1 创建 `src/test/product-page-test-utils.tsx`：集中 mock Header/Footer/next-image/notFound，导出 `renderProductPage` helper

## 2. 修复 car-care 现有测试

- [x] 2.1 重写 `src/app/product/car-care/page.test.tsx`：消除 `let Page: any`，改用 test utils 的共享 mock，保持原有 6 个测试用例通过

## 3. 服务页集中 Smoke Test

- [x] 3.1 新增 `src/app/product/product-pages-services.smoke.test.tsx`：从 `getLiveServices()` 派生清单，覆盖 9 个 live 服务页，每页验证 render + navLabel

## 4. 品牌页集中 Smoke Test

- [x] 4.1 新增 `src/app/product/product-pages-brands.smoke.test.tsx`：从 `getLiveBrands()` 派生清单，覆盖 12 个 live 品牌页，每页验证 render + 品牌名

## 5. 车型页集中 Smoke Test

- [x] 5.1 新增 `src/app/product/product-pages-models.smoke.test.tsx`：从 `ALL_MODELS.filter(live)` 派生清单，覆盖 16 个 live 车型页，每页验证 render + 车型名

## 6. 首页与动态路由 Smoke Test

- [x] 6.1 新增 `src/app/product/product-pages-index.smoke.test.tsx`：覆盖 `/product` 首页 + `window-film/[packageSlug]` 动态路由

## 7. 路由注册表一致性测试

- [x] 7.1 新增 `src/lib/product-routes.test.ts`：验证 live brand/model/service 的 `canonicalPath` 都有对应 `page.tsx`，canonicalPath 不重复，legacyPaths 不冲突

## 8. CI 防回归脚本

- [x] 8.1 新增 `scripts/check-product-page-tests.mjs`：扫描 `src/app/product/**/page.tsx`，排除 planned，检查每个 live 页面在 smoke test manifest 中有覆盖
- [x] 8.2 修改 `package.json`：新增 `check:product-page-tests` script 并链入 `npm run check`

## 9. 综合验证

- [x] 9.1 运行 `npm test` 确保全部测试通过 (1137/1146, 9 pre-existing)
- [x] 9.2 运行 `npm run typecheck` 确认无新增类型错误 (business code clean)
- [x] 9.3 运行 `npm run build` 确认构建通过 (522 pages)
- [x] 9.4 运行 `npm run check:product-page-tests` 确认防回归通过 (38/6/0)
