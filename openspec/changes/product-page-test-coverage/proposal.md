## Why

当前产品页测试覆盖严重不均衡：44 个 `page.tsx` 文件仅 `car-care` 有页面级测试。缺少体系化的 smoke test 意味着产品页空白、路由漂移、核心结构缺失等问题无法在 CI 阶段发现，只能靠人工抽查或上线后用户反馈。本次变更建立一套低维护、可扩展的测试体系，以 `product-routes.ts` 为数据源驱动测试清单，让「产品页必须有测试」成为可验证的 CI 规则。

## What Changes

- 新增 `src/test/product-page-test-utils.tsx`：共享 mock 和 render helper，消除重复样板代码
- 新增 4 个按类型拆分的集中 smoke test 文件，覆盖全部 39 个 live 产品页：
  - `product-pages-services.smoke.test.tsx` — 10 个 live 服务页
  - `product-pages-brands.smoke.test.tsx` — 12 个 live 品牌页
  - `product-pages-models.smoke.test.tsx` — 16 个 live 车型页
  - `product-pages-index.smoke.test.tsx` — 首页 + window-film 动态路由
- 新增 `src/lib/product-routes.test.ts`：路由注册表与实际 `page.tsx` 文件一致性检查
- 新增 `scripts/check-product-page-tests.mjs`：CI 防回归脚本，检查所有 live 页面有测试覆盖
- 修复 `src/app/product/car-care/page.test.tsx`：消除 `let Page: any` 类型问题，改用 test utils
- `package.json`：新增 `check:product-page-tests` 脚本，链入 `npm run check`

## Capabilities

### New Capabilities

- `product-page-test-coverage`: 产品页测试覆盖体系 — smoke test + 路由一致性检查 + CI 防回归

### Modified Capabilities

<!-- None — this is a new test infrastructure; no existing spec-level behavior changes -->

## Impact

- 新增文件：`src/test/product-page-test-utils.tsx`、4 个 smoke test、`src/lib/product-routes.test.ts`、`scripts/check-product-page-tests.mjs`
- 修改文件：`src/app/product/car-care/page.test.tsx`、`package.json`
- 不涉及：业务代码、API routes、admin 页面、其他公开路由
- 无新依赖引入
