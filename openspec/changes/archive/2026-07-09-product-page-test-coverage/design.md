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
