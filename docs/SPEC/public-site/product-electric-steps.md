# SPEC: 电动踏板图库升级页

> 功能规格说明书 — 定义 `/product/electric-steps` 的行为边界、数据合约和验收标准。  
> 对应 PRD: `docs/PRD/product/ELECTRIC_STEPS_GALLERY_PAGE_PRD_2026-07-03.md`  
> 实现状态: `⬜ 未开始`

---

## 1. 职责范围

电动踏板页负责展示蓝辉轻改已有电动踏板素材、款式差异、安装确认项和到店服务流程；不负责报价、库存、在线选配、官方授权或全车型可安装承诺。

## 1.1 Skill 路由

| Skill | 是否使用 | 用途 |
|---|---|---|
| `prompt-boost` | 是 | 将同模式需求转为 PRD/SPEC/实现任务 |
| `next-best-practices` | 是 | Next 16 App Router、metadata、RSC 页面 |
| `react-best-practices` | 是 | 静态数据、RSC、图片渲染性能 |
| `prisma-data-ops` | 否 | 不涉及数据库 |
| faker/MSW | 否 | 不涉及 API mock |

## 2. 路由 / 入口

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/product/electric-steps` | page | 电动踏板图库页 | ⬜ |
| `/product` | page | 产品中心 LightModMap 已有入口 | ✅ |

## 3. 数据模型

### 3.1 类型定义

```typescript
export type ElectricStepVariant =
  | "no-light"
  | "single-light"
  | "large-light";

export type ElectricStepImage = {
  id: string;
  filename: string;
  publicPath: string;
  width: 1646 | 750;
  height: 1166 | 547 | 487;
  title: string;
  variant: ElectricStepVariant;
  alt: string;
};
```

### 3.2 数据库表

不适用。

### 3.3 静态数据源

| 文件 | 说明 |
|---|---|
| `src/lib/electric-step-products.ts` | 电动踏板图片、款式、卖点、确认项、流程 |
| `public/images/products/Taban/*.jpg` | 3 张电动踏板图片 |

## 4. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| `ElectricStepsPage` | `src/app/product/electric-steps/page.tsx` | 否 | 页面组合、metadata、JSON-LD |
| `ElectricStepHero` | `src/components/product/electric-steps/ElectricStepHero.tsx` | 否 | 首屏与主视觉图 |
| `ElectricStepValueGrid` | `src/components/product/electric-steps/ElectricStepValueGrid.tsx` | 否 | 卖点和安装确认项 |
| `ElectricStepFitmentCloud` | `src/components/product/electric-steps/ElectricStepFitmentCloud.tsx` | 否 | 常见到店确认车型词云 |
| `ElectricStepGallery` | `src/components/product/electric-steps/ElectricStepGallery.tsx` | 否 | 3 张踏板图库 |
| `ElectricStepServiceFlow` | `src/components/product/electric-steps/ElectricStepServiceFlow.tsx` | 否 | 到店流程 |

## 5. API 合约

不适用。页面无 API 调用。

## 6. 依赖关系

- `src/lib/product-routes.ts` 已注册 `electric-steps` 为 live P0 light_mod 服务。
- `src/components/product/LightModMap.tsx` 已从 `/product` 入口链接到 `/product/electric-steps`。
- `src/app/product/electric-steps/page.tsx` 从通用 `ProductDetail` 切换为电动踏板专属组件。

## 7. 验收条件

- [ ] AC1: `/product/electric-steps` 不再使用 `ProductDetail`。
- [ ] AC2: 页面图库展示 3 张 Taban 图片。
- [ ] AC3: 图片容器固定 `aspect-[4/3]` 且 `object-contain`，不裁切踏板主体。
- [ ] AC4: 页面包含关键确认项: 底盘固定点、门体信号、电气接口、防夹/灯带、离地间隙。
- [ ] AC5: 页面包含 shadcn `Card` + `Badge` 实现的车型词云，表达“常见到店确认车型”。
- [ ] AC6: `/product` 中电动踏板入口继续可进入该页。
- [ ] AC7: 相关 eslint / vitest / build 验证通过。

## 8. 实现拆解

### 8.1 前端实现

- 页面: `src/app/product/electric-steps/page.tsx`
- 组件: `src/components/product/electric-steps/*.tsx`
- 视觉参考: 汽车垫/轮毂页模式 + 现有 shadcn 卡片图库。
- 响应式视口: 390px、768px、1440px。

### 8.2 API 对接

不涉及。

### 8.3 后端/数据实现

- 新增 `src/lib/electric-step-products.ts` 静态数据。
- 不新增 migration、seed 或 route handler。

### 8.4 测试实现

- Unit: `src/lib/electric-step-products.test.ts` 验证图片数量、尺寸、路径存在。
- Build: `npm run build` 验证 SSG。
- Browser: `/product/electric-steps` 和 `/product` 可访问。

## 9. 已知问题

- 图片目录名为 `Taban`，URL 需保持大小写一致。
- 图片只有 3 张且比例不同，应使用 `object-contain` 而不是强裁切。

## 10. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-07-03 | Codex | PRD/SPEC 编写，准备实现 | 进行中 | 代码实现与验证 |

---

> 最后更新: 2026-07-03
