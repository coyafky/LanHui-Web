## Why

整个 `src/app/` 下没有任何 error.tsx、loading.tsx、global-error.tsx、not-found.tsx 文件。54 个 page.tsx 路由段全部缺少错误边界和加载状态。任何 RSC 渲染错误或数据获取失败都会导致白屏或 Next.js 默认错误页，用户看到的是系统级错误而非品牌化降级 UI。

这是 P0-2 级问题：生产环境错误 UX = 零。

## What Changes

- 在根布局同级创建 `global-error.tsx`（捕获根布局致命错误）
- 在关键路由段创建 `error.tsx`（admin/product/agent/brand/news）
- 在关键路由段创建 `loading.tsx`（admin dashboard + 动态页面）
- 在根级别创建 `not-found.tsx`（品牌化 404 页面）
- 创建共享错误/加载组件库 `src/components/shared/` 避免重复
- 所有 UI 与现有 dark theme（zinc-950 + orange-500）一致

## Capabilities

### New Capabilities

- `error-boundaries`: 全局错误边界系统，包含 global-error、segment error、loading、not-found 四类组件，统一品牌 UI 和交互模式。

### Modified Capabilities

无——纯增量，不影响现有页面逻辑。

## Impact

| 层面 | 影响 |
|------|------|
| 根布局 | 新增 `src/app/global-error.tsx` |
| 路由段 | 新增 `src/app/**/error.tsx` × 5-7, `loading.tsx` × 3-5 |
| 组件 | 新建 `src/components/shared/ErrorFallback.tsx`, `LoadingSpinner.tsx`, `NotFoundContent.tsx` |
| 404 | 新增 `src/app/not-found.tsx` |
| 测试 | 新增对应测试文件 |
| 现有页面 | 零改动——error/loading/not-found 由 Next.js 自动注入 |
