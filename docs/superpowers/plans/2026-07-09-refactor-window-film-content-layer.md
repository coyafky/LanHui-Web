---
change: refactor-window-film-content-layer
design-doc: docs/superpowers/specs/2026-07-09-refactor-window-film-content-layer-design.md
base-ref: fec0fa1d6b3ee234e8cf53c207bcf9e86a78a324
---

# 窗口膜痛点文案下沉数据层 — 实施计划

## 任务列表

### 任务 1：数据层新增类型和数据
- **文件**：`src/lib/window-film-details.ts`
- **操作**：在文件末尾新增 `WindowFilmPainPoint` 类型和 `windowFilmPainPoints` 数组（6 项，优化后文案）
- **验证**：`npx tsc --noEmit` 无新增错误

### 任务 2：新建 WindowFilmPainPoints 组件
- **文件**：`src/components/window-film/WindowFilmPainPoints.tsx`（新建）
- **操作**：Server Component，从 `@/lib/window-film-details` 导入 `windowFilmPainPoints`，渲染现有痛点 section 的完整 JSX 结构
- **验证**：`npx tsc --noEmit` 无新增错误

### 任务 3：精简 page.tsx
- **文件**：`src/app/product/window-film/page.tsx`
- **操作**：删除 `PAIN_POINTS` 常量（L24-55），删除内联 map 渲染（L106-118），新增 import + `<WindowFilmPainPoints />`
- **验证**：`npx tsc --noEmit` 无新增错误

### 任务 4：新建测试文件
- **文件**：`src/lib/window-film-details.test.ts`（新建）
- **操作**：测试 `windowFilmPainPoints` 长度、id 唯一、非空、无绝对化承诺词
- **验证**：`npx vitest run src/lib/window-film-details.test.ts` 全部通过

### 任务 5：新建防回归检查脚本
- **文件**：`scripts/check-window-film-content-boundary.mjs`（新建）
- **操作**：检查 page.tsx 不含 `PAIN_POINTS`，window-film-details.ts 含 `windowFilmPainPoints`
- **验证**：`node scripts/check-window-film-content-boundary.mjs` 退出码 0

### 任务 6：更新 package.json
- **文件**：`package.json`
- **操作**：新增 `"check:window-film-content"` 脚本
- **验证**：`npm run check:window-film-content` 通过

### 任务 7：全量质量门禁
- **操作**：运行 `npm run lint`、`npm run typecheck`、`npm run build`
- **验证**：lint 无新增错误，typecheck 无新增错误，build 通过
