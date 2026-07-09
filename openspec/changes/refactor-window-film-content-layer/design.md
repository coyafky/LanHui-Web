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
