# Comet Design Handoff

- Change: refactor-window-film-content-layer
- Phase: design
- Mode: compact
- Context hash: 1eee39de1542cbea26700a2d692ebac39117b2d9705f806b2239ff44f82f3d30

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/refactor-window-film-content-layer/proposal.md

- Source: openspec/changes/refactor-window-film-content-layer/proposal.md
- Lines: 1-30
- SHA256: 936347fd5286c7873d7a82ab463a3a401bda95a75d1b7b937f3d3549fe131e91

```md
## Why

窗口膜产品页的 6 个用户痛点文案硬编码在 `src/app/product/window-film/page.tsx` 的 `PAIN_POINTS` 常量中，每次修改营销文案都需要改动页面文件。这不符合项目「页面负责结构，数据层负责内容」的维护模式（已有 `windowFilmDetails`、`windowFilmGuideItems`、`windowFilmParameterExplanations` 均在 `src/lib/window-film-details.ts` 中定义，页面只负责组合渲染）。

## What Changes

- 在 `src/lib/window-film-details.ts` 中新增 `WindowFilmPainPoint` 类型和 `windowFilmPainPoints` 数据
- 新建 `src/components/window-film/WindowFilmPainPoints.tsx` 组件，从数据层读取痛点文案并渲染
- 从 `src/app/product/window-film/page.tsx` 中删除 `PAIN_POINTS` 常量及其内联渲染逻辑，替换为 `<WindowFilmPainPoints />`
- 新增 `src/lib/window-film-details.test.ts` 测试文件，验证痛点数据结构
- 新增 `scripts/check-window-film-content-boundary.mjs` 检查脚本，防止文案硬编码回页面
- 在 `package.json` 新增 `check:window-film-content` 脚本
- 优化 6 个痛点文案表达，使其更适合官网宣传

## Capabilities

### New Capabilities
- `window-film-content-boundary`: 窗口膜内容边界 — 痛点文案从页面下沉到数据层，建立防回归检查

### Modified Capabilities
（无 — 不改变已有 spec 的验收场景）

## Impact

- `src/lib/window-film-details.ts` — 新增类型和数据导出
- `src/components/window-film/WindowFilmPainPoints.tsx` — 新建组件
- `src/app/product/window-film/page.tsx` — 删除 PAIN_POINTS，替换为组件
- `src/lib/window-film-details.test.ts` — 新建测试
- `scripts/check-window-film-content-boundary.mjs` — 新建检查脚本
- `package.json` — 新增 scripts
```

## openspec/changes/refactor-window-film-content-layer/design.md

- Source: openspec/changes/refactor-window-film-content-layer/design.md
- Lines: 1-56
- SHA256: a19840e115e68f4766cb86e9f9b4673500cd36292a3596006f5174caa939f2e7

```md
## 方案

将窗口膜 6 个痛点文案从 `page.tsx` 内联常量迁移到数据层 `src/lib/window-film-details.ts`，新建独立组件渲染，并建立防回归检查。

### 数据层

在 `src/lib/window-film-details.ts` 中新增：

```ts
export type WindowFilmPainPoint = {
  id: string;
  title: string;
  description: string;
};

export const windowFilmPainPoints: WindowFilmPainPoint[] = [...];
```

6 个痛点保持原有方向（热/晒/眩光/隐私/安全/新能源），优化文案使其更适合官网宣传，避免绝对化承诺。

### 组件层

新建 `src/components/window-film/WindowFilmPainPoints.tsx`：
- Server Component
- 从 `@/lib/window-film-details` 导入 `windowFilmPainPoints`
- 保持现有视觉风格（标题、网格、卡片、颜色、间距）
- 命名导出：`export function WindowFilmPainPoints()`

### 页面层

`src/app/product/window-film/page.tsx`：
- 删除 `PAIN_POINTS` 常量
- 删除内联 `PAIN_POINTS.map()` 渲染
- 导入并渲染 `<WindowFilmPainPoints />`
- 不修改套餐、参数解释、导购等无关模块

### 测试

`src/lib/window-film-details.test.ts`：
- `windowFilmPainPoints` 长度为 6
- 每个 item 有稳定 `id`，不重复
- `title` 和 `description` 非空
- `description` 不包含绝对化承诺词

### 防回归检查

`scripts/check-window-film-content-boundary.mjs`：
- `page.tsx` 不包含 `PAIN_POINTS`
- `page.tsx` 不直接硬编码 6 个痛点文案
- `windowFilmPainPoints` 存在于 `window-film-details.ts`

## 不改

- 窗口膜套餐、参数解释、导购内容的数据结构
- 页面视觉风格
- 不引入新依赖
```

## openspec/changes/refactor-window-film-content-layer/tasks.md

- Source: openspec/changes/refactor-window-film-content-layer/tasks.md
- Lines: 1-9
- SHA256: eeb7f86062cf71df70ad5d8114c3911bdf37e6809d4cec3b5076395d82361fa7

```md
## 任务清单

- [ ] 1. 在 `src/lib/window-film-details.ts` 中新增 `WindowFilmPainPoint` 类型和 `windowFilmPainPoints` 数据（优化 6 个痛点文案）
- [ ] 2. 新建 `src/components/window-film/WindowFilmPainPoints.tsx` 组件
- [ ] 3. 修改 `src/app/product/window-film/page.tsx`：删除 `PAIN_POINTS`，替换为 `<WindowFilmPainPoints />`
- [ ] 4. 新建 `src/lib/window-film-details.test.ts` 测试文件
- [ ] 5. 新建 `scripts/check-window-film-content-boundary.mjs` 检查脚本
- [ ] 6. 在 `package.json` 新增 `check:window-film-content` 脚本
- [ ] 7. 运行 `npm run lint`、`npm run typecheck`、`npm run build` 验证
```

