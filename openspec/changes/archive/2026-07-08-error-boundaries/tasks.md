# Tasks: Error Boundaries & Loading States

> 遵循 TDD（RED → GREEN → REFACTOR），每个 Task 独立提交。

## Task 1: 共享组件（RED → GREEN）
- [x] **RED**: 编写 `ErrorFallback.test.tsx`、`LoadingSpinner.test.tsx`、`NotFoundContent.test.tsx` 骨架
- [x] **GREEN**: 创建 `src/components/shared/ErrorFallback.tsx` ("use client")
- [x] **GREEN**: 创建 `src/components/shared/LoadingSpinner.tsx`
- [x] **GREEN**: 创建 `src/components/shared/NotFoundContent.tsx`
- [x] 测试通过（12/12） + commit

## Task 2: 根级别 Error/Loading/Not-Found（RED → GREEN）
- [x] **GREEN**: 创建 `src/app/global-error.tsx`
- [x] **GREEN**: 创建 `src/app/error.tsx`
- [x] **GREEN**: 创建 `src/app/loading.tsx`
- [x] **GREEN**: 创建 `src/app/not-found.tsx`
- [x] `npm run build` 通过（519/519）

## Task 3: Admin Error/Loading/Not-Found（RED → GREEN）
- [x] **GREEN**: 创建 `src/app/admin/error.tsx`
- [x] **GREEN**: 创建 `src/app/admin/loading.tsx`
- [x] **GREEN**: 创建 `src/app/admin/not-found.tsx`
- [x] build 通过

## Task 4: Dashboard Error/Loading（RED → GREEN）
- [x] **GREEN**: 创建 `src/app/admin/(dashboard)/error.tsx`
- [x] **GREEN**: 创建 `src/app/admin/(dashboard)/loading.tsx`
- [x] build 通过

## Task 5: 验证与收尾
- [x] `npx tsc --noEmit`（9 pre-existing 除外，零新增）
- [x] `npm run build` 全量通过（519/519 pages）
- [x] 组件测试 12/12 通过
- [x] 浏览器手动验证：触发错误/404/加载态（需 dev server）
- [x] 三视口检查（390/768/1440）（需 dev server）
