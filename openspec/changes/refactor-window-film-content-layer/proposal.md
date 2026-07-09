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
