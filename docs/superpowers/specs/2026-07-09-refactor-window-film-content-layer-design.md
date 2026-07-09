---
comet_change: refactor-window-film-content-layer
role: technical-design
canonical_spec: openspec
---

# 窗口膜痛点文案下沉数据层 — 技术设计

## 背景

窗口膜产品页的 6 个用户痛点文案硬编码在 `src/app/product/window-film/page.tsx` 的 `PAIN_POINTS` 常量中，不符合项目「页面负责结构，数据层负责内容」的维护模式。已有数据层 `src/lib/window-film-details.ts` 承载了 `windowFilmDetails`、`windowFilmGuideItems`、`windowFilmParameterExplanations` 等内容，痛点文案应遵循同一模式。

## 方案：直接迁移 + 内容边界

### 架构

```
数据层: window-film-details.ts  →  导出 WindowFilmPainPoint 类型 + windowFilmPainPoints 数据
组件层: WindowFilmPainPoints.tsx →  从数据层读数据，渲染完整 section
页面层: page.tsx                →  <WindowFilmPainPoints /> 替代内联 PAIN_POINTS
```

### 数据层变更

`src/lib/window-film-details.ts` 新增：

```ts
export type WindowFilmPainPoint = {
  id: string;
  title: string;
  description: string;
};

export const windowFilmPainPoints: WindowFilmPainPoint[] = [
  { id: "heat", title: "热", description: "夏天暴晒后车内升温快..." },
  { id: "uv", title: "晒", description: "强紫外线长期照射..." },
  { id: "glare", title: "眩光", description: "逆光、午后强光容易刺眼..." },
  { id: "privacy", title: "隐私", description: "后排乘坐和车内物品需要遮挡..." },
  { id: "safety", title: "安全", description: "玻璃破裂时碎片飞散风险更高..." },
  { id: "ev", title: "新能源", description: "新能源车型玻璃面积更大..." },
];
```

### 文案优化原则

- 不写绝对化承诺（"完全隔热""100% 防晒""绝不飞溅"）
- 保持官网宣传语气：专业、克制、可信
- 从"痛点感受 + 解决方案价值"结构组织

6 个痛点优化后文案：

| id | title | description |
|----|-------|-------------|
| heat | 热 | 夏天暴晒后车内升温快，前挡与侧后挡组合能降低热量进入，减轻空调负担。 |
| uv | 晒 | 强紫外线长期照射皮肤和内饰，高紫外线阻隔有助于减少晒伤感和内饰老化。 |
| glare | 眩光 | 逆光、午后强光容易刺眼，合理前挡方案兼顾清晰视野和驾驶舒适。 |
| privacy | 隐私 | 后排乘坐和车内物品需要遮挡，侧后挡隐私膜提升私密性和安全感。 |
| safety | 安全 | 玻璃破裂时碎片飞散风险更高，膜层附着能力有助于降低飞溅伤害。 |
| ev | 新能源 | 新能源车型玻璃面积更大、热感更明显，更需要系统化隔热与防晒方案。 |

### 组件设计

`src/components/window-film/WindowFilmPainPoints.tsx`：
- Server Component，命名导出
- 从 `@/lib/window-film-details` 导入 `windowFilmPainPoints`
- 完整保留现有 section 结构：标题 "贴太阳膜，不只是为了隔热" + 副标题 + 3 列网格卡片
- key 使用稳定的 `p.id`（替代原来的 `p.title`）
- 与 `WindowFilmParameterExplainer` 组件模式一致

### 页面精简

`src/app/product/window-film/page.tsx`：
- 删除 `PAIN_POINTS` 常量定义（L24-55）
- 删除内联 `PAIN_POINTS.map()` 渲染（L106-118）
- 新增 import + `<WindowFilmPainPoints />` 替换

### 测试策略

`src/lib/window-film-details.test.ts`：
- `windowFilmPainPoints` 长度为 6
- id 唯一
- title/description 非空
- description 不含绝对化承诺词

### 防回归

`scripts/check-window-film-content-boundary.mjs`：
- `page.tsx` 不含 `PAIN_POINTS` 常量定义
- `windowFilmPainPoints` 存在于 `window-film-details.ts`
- 链入 `package.json` scripts

## 不改

- 窗口膜套餐、参数解释、导购内容的数据结构
- 页面视觉风格（完整保留 section 结构、颜色、间距）
- 不引入新依赖
