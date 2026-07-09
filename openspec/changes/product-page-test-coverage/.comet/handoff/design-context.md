# Comet Design Handoff

- Change: product-page-test-coverage
- Phase: design
- Mode: compact
- Context hash: e63431b4ec4ab395188e21b27c875dec4696e6908e22129b76d6a76514050466

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/product-page-test-coverage/proposal.md

- Source: openspec/changes/product-page-test-coverage/proposal.md
- Lines: 1-33
- SHA256: b584f083cdb28c9f23cf16829b0b6969e83a26112874248576b0489df50e3fea

```md
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
```

## openspec/changes/product-page-test-coverage/design.md

- Source: openspec/changes/product-page-test-coverage/design.md
- Lines: 1-70
- SHA256: 28bab509135400e382f49a33303809477f04e32c303a935e092b8701af177400

```md
## Context

当前 `src/app/product/` 下有 44 个 `page.tsx`，仅 `car-care/page.test.tsx` 有测试。项目使用 vitest + @testing-library/react + happy-dom，已有成熟的测试模式（`vi.mock` + `render` + `screen`）。`product-routes.ts` 是产品路由的 source of truth，包含 `getLiveBrands()`、`getLiveServices()`、`ALL_MODELS` 等导出。

## Goals / Non-Goals

**Goals:**
- 39 个 live 产品页各至少有 table-driven smoke test
- `product-routes.ts` 与实际 `page.tsx` 文件系统一致
- CI 脚本能检测新增产品页是否遗漏测试
- car-care 测试的 `let Page: any` 修复为精确类型
- TypeScript strict，无新增 `any`

**Non-Goals:**
- 不做整页 snapshot
- 不给 40+ 页面复制粘贴独立测试文件
- 不测试 Tailwind class 细节
- 不强制 planned/hidden 页面（wenjie m6/m7/m8、business-comfort、skid-plate）通过测试
- 不引入新测试依赖
- 不修改业务代码

## Decisions

### 1. 测试组织：按类型拆分为 4 个集中 smoke test 文件

**选择**：`product-pages-services|brands|models|index.smoke.test.tsx` 各司其职

**Why over 单个文件**：拆分后每个文件职责清晰，CI 失败时快速定位故障类型；单个 39 页大文件在 vitest 中难以独立过滤

**Why over 每页一个 test 文件**：避免 40+ 文件的手工维护负担；每一页的测试逻辑完全统一，table-driven 天然适合集中管理

### 2. 测试清单来源：`product-routes.ts` 导出 → manifest 常量

**选择**：smoke test 文件和 CI 脚本都从 `getLiveBrands()` / `getLiveServices()` / `ALL_MODELS.filter(m => m.status === "live")` 派生清单，不独立维护路径列表

**Why**：`product-routes.ts` 已是 source of truth，新增品牌/车型/服务时必须在这里注册。测试自动跟踪注册表，无需手动同步两份清单

### 3. Mock 策略：共享 test utils + 最小化 mock

**选择**：`src/test/product-page-test-utils.tsx` 集中 mock `Header`/`Footer`/`next/image`，各 smoke test 按需补充页面级组件 mock

**Why over 每文件独立 mock**：避免 4 个 smoke test 文件中重复 mock 声明。页面未 mock 的子组件会实际渲染（含异步数据），可能导致测试不稳定 — 因此 smoke test 只断言页面级结构（render 不崩溃、h1 存在），不深入子组件细节

### 4. car-care 测试修复：改为从 test utils 导入 mock + 精确类型

**选择**：car-care 改用共享 mock 并修复 `let Page: any` → `typeof import("./page")["default"]` 或直接 `Awaited<ReturnType<typeof import("./page")>>`

**Why**：减少重复 mock 代码，消除项目中的 `any` 使用

### 5. CI 脚本策略：扫描 page.tsx → 交叉验证 smoke manifest

**选择**：`check-product-page-tests.mjs` 用 `git ls-files "src/app/product/**/page.tsx"` 扫描所有页面，排除 planned 路径和动态路由段，然后检查每个 live 页面是否在 smoke test 的 manifest 常量中有对应条目

**Why over grep-based 检查**：grep 只能验证"有测试文件"但不能验证"测试文件是否覆盖了该路由"。manifest 交叉验证更精确

### 6. 路由一致性测试：`product-routes.test.ts`

**选择**：测试 `ALL_BRANDS`/`ALL_MODELS`/`ALL_SERVICES` 中 live 状态条目的 `canonicalPath` 是否对应真实 `page.tsx` 文件

**Why**：防止注册表中新增路由但忘记创建页面文件（或反之）

## Risks / Trade-offs

- **[Risk] Brand/Model 页面使用大量专有组件（如 `XiaomiBrandHero`），smoke test 需要 mock 大量子组件** → Mitigation：测试只断言 render 不崩溃 + 关键文案存在，不挂载完整子组件树；特例页面可单独补充独立 test
- **[Risk] window-film 动态路由 `[packageSlug]` 的 `generateStaticParams` 依赖运行时数据** → Mitigation：独立测试文件 mock `generateStaticParams` 返回值，用已知 slug 测试 render
- **[Risk] 新增产品页未更新 test manifest 会导致 CI 误报** → Mitigation：CI 脚本失败时输出清晰的错误信息，指出哪个页面缺少测试覆盖 + 应添加到哪个 manifest

## Open Questions

- window-film `[packageSlug]` 的 `generateStaticParams` 具体返回哪些 slug → build 阶段读代码确认
```

## openspec/changes/product-page-test-coverage/tasks.md

- Source: openspec/changes/product-page-test-coverage/tasks.md
- Lines: 1-39
- SHA256: 9318e593c293e40b2fb826b2e9f94e5caf0a49957ff44505eb74dc39bece59c0

```md
## 1. 共享测试工具

- [ ] 1.1 创建 `src/test/product-page-test-utils.tsx`：集中 mock Header/Footer/next-image/notFound，导出 `renderProductPage` helper

## 2. 修复 car-care 现有测试

- [ ] 2.1 重写 `src/app/product/car-care/page.test.tsx`：消除 `let Page: any`，改用 test utils 的共享 mock，保持原有 6 个测试用例通过

## 3. 服务页集中 Smoke Test

- [ ] 3.1 新增 `src/app/product/product-pages-services.smoke.test.tsx`：从 `getLiveServices()` 派生清单，覆盖 10 个 live 服务页，每页验证 render + h1 + navLabel

## 4. 品牌页集中 Smoke Test

- [ ] 4.1 新增 `src/app/product/product-pages-brands.smoke.test.tsx`：从 `getLiveBrands()` 派生清单，覆盖 12 个 live 品牌页，每页验证 render + 品牌名

## 5. 车型页集中 Smoke Test

- [ ] 5.1 新增 `src/app/product/product-pages-models.smoke.test.tsx`：从 `ALL_MODELS.filter(live)` 派生清单，覆盖 16 个 live 车型页，每页验证 render + 车型名

## 6. 首页与动态路由 Smoke Test

- [ ] 6.1 新增 `src/app/product/product-pages-index.smoke.test.tsx`：覆盖 `/product` 首页 + `window-film/[packageSlug]` 动态路由

## 7. 路由注册表一致性测试

- [ ] 7.1 新增 `src/lib/product-routes.test.ts`：验证 live brand/model/service 的 `canonicalPath` 都有对应 `page.tsx`，canonicalPath 不重复，legacyPaths 不冲突

## 8. CI 防回归脚本

- [ ] 8.1 新增 `scripts/check-product-page-tests.mjs`：扫描 `src/app/product/**/page.tsx`，排除 planned，检查每个 live 页面在 smoke test manifest 中有覆盖
- [ ] 8.2 修改 `package.json`：新增 `check:product-page-tests` script 并链入 `npm run check`

## 9. 综合验证

- [ ] 9.1 运行 `npm test` 确保全部测试通过
- [ ] 9.2 运行 `npm run typecheck` 确认无新增类型错误
- [ ] 9.3 运行 `npm run build` 确认构建通过
- [ ] 9.4 运行 `npm run check:product-page-tests` 确认防回归通过
```

## openspec/changes/product-page-test-coverage/specs/product-page-test-coverage/spec.md

- Source: openspec/changes/product-page-test-coverage/specs/product-page-test-coverage/spec.md
- Lines: 1-45
- SHA256: 7f3210ef30c41a867edbeafd03d51559af1c1f50d4a1835127e50e703c92eb20

```md
# product-page-test-coverage Spec

## ADDED Requirements

### REQ-TEST-COVERAGE-01: Product Page Smoke Tests

All live product pages MUST have at least one smoke test that verifies the page renders without crashing.

**Acceptance:**
- 12 live brand pages each have a smoke test entry
- 16 live model pages each have a smoke test entry
- 10 live service pages each have a smoke test entry
- `/product` index page has a smoke test entry
- `window-film/[packageSlug]` dynamic route has a smoke test

### REQ-TEST-COVERAGE-02: Route Registry Consistency

The route registry (`product-routes.ts`) MUST be consistent with actual page files on disk.

**Acceptance:**
- Every live brand canonicalPath has a corresponding `page.tsx`
- Every live model canonicalPath has a corresponding `page.tsx`
- Every live service canonicalPath has a corresponding `page.tsx`
- No duplicate canonicalPath values exist
- No legacyPath conflicts with canonicalPath
- Planned pages are excluded from live coverage requirements

### REQ-TEST-COVERAGE-03: CI Anti-Regression

A CI check script MUST detect when a new live product page is added without corresponding test coverage.

**Acceptance:**
- `check:product-page-tests` script scans all `src/app/product/**/page.tsx`
- Excludes planned/hidden pages
- Fails (exit 1) when a live page has no test coverage entry
- Passes (exit 0) when all live pages are covered

### REQ-TEST-COVERAGE-04: Car-Care Test Hygiene

The existing `car-care/page.test.tsx` MUST be updated to use typed imports (no `any`) and shared test utilities.

**Acceptance:**
- `let Page: any` is replaced with a precise type
- Test still passes with same assertions
- Uses `src/test/product-page-test-utils.tsx` for shared mocks
```

