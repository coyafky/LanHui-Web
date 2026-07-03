# SPEC: 汽车垫产品页

> 功能规格说明书 — 定义 `/product/floor-mats` 的行为边界、数据合约和验收标准。  
> 对应 PRD: `docs/PRD/product/CARMAT_PAGE_PRD_2026-07-03.md`  
> 实现状态: `⬜ 未开始`

---

## 1. 职责范围

汽车垫产品页负责展示蓝辉轻改已有汽车垫/360 软包脚垫产品素材、基础卖点、适用场景和到店沟通路径；不负责报价、下单、车型适配承诺或 CMS 维护。

## 1.1 Skill 路由

| Skill | 是否使用 | 用途 |
|---|---|---|
| `prompt-boost` | 是 | 将用户自然语言需求转译为 PRD/SPEC/实现任务 |
| `next-best-practices` | 是 | Next 16 App Router、metadata、RSC 页面 |
| `react-best-practices` | 是 | RSC 优先、静态数据、长图库渲染性能 |
| `prisma-data-ops` | 否 | 不涉及数据库 |
| faker/MSW | 否 | 不涉及 API mock |

## 2. 路由 / 入口

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/product/floor-mats` | page | 汽车垫正式展示页 | ⬜ |
| `/product` | page | 产品中心实用配件入口 | ⬜ |

## 3. 数据模型

### 3.1 类型定义

```typescript
export type CarMatCategory =
  | "full-wrap"
  | "trunk"
  | "texture"
  | "detail";

export type CarMatImage = {
  id: string;
  filename: string;
  publicPath: string;
  width: 1086;
  height: 1448;
  aspectRatio: "3/4";
  title: string;
  category: CarMatCategory;
  alt: string;
};
```

### 3.2 数据库表

不适用。页面使用静态数据，不访问 Prisma 或 API。

### 3.3 静态数据源

| 文件 | 说明 |
|---|---|
| `src/lib/carmat-products.ts` | 汽车垫图片、分类、卖点、流程 |
| `public/images/products/carmat/*.png` | 29 张产品图片，1086×1448 |

## 4. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| `FloorMatsPage` | `src/app/product/floor-mats/page.tsx` | 否 | 页面组合、metadata、JSON-LD |
| `CarMatHero` | `src/components/product/carmat/CarMatHero.tsx` | 否 | 首屏和主视觉图 |
| `CarMatValueGrid` | `src/components/product/carmat/CarMatValueGrid.tsx` | 否 | 卖点卡片 |
| `CarMatGallery` | `src/components/product/carmat/CarMatGallery.tsx` | 否 | 29 张图片图库 |
| `CarMatServiceFlow` | `src/components/product/carmat/CarMatServiceFlow.tsx` | 否 | 到店服务流程 |
| `PracticalAccessoryMap` | `src/components/product/PracticalAccessoryMap.tsx` | 否 | 产品中心实用配件入口 |

## 5. API 合约

不适用。页面无 API 调用。

## 6. 依赖关系

- `src/lib/product-routes.ts` 将 `floor-mats` 状态改为 `live`。
- `src/app/product/page.tsx` 从 `getLiveServices()` 中取 `practical_accessory` 分组并渲染 `PracticalAccessoryMap`。
- `src/lib/product-routes.test.ts` 更新 live/planned 服务数量断言。

## 7. 验收条件

- [ ] AC1: `/product/floor-mats` 不再显示 `BrandPlaceholder`。
- [ ] AC2: 页面图库展示 29 张汽车垫图片。
- [ ] AC3: 图片容器固定 `aspect-[3/4]`，移动端无横向滚动。
- [ ] AC4: `/product` 中实用配件入口包含 `/product/floor-mats`。
- [ ] AC5: `floor-mats` 在路由注册中为 `live`。
- [ ] AC6: 相关 eslint / vitest 验证通过。

## 8. 实现拆解

### 8.1 前端实现

- 页面: `src/app/product/floor-mats/page.tsx`
- 组件: `src/components/product/carmat/*.tsx`
- 视觉参考: 现有 `FlooringGallery` 使用 shadcn `Card`/`Badge` 的方式。
- 响应式视口: 390px、768px、1440px。

### 8.2 API 对接

不涉及。

### 8.3 后端/数据实现

- 新增 `src/lib/carmat-products.ts` 静态数据。
- 不新增 migration、seed 或 API。

### 8.4 测试实现

- Unit: `src/lib/carmat-products.test.ts` 验证图片数量、尺寸、路径存在。
- Existing: `src/lib/product-routes.test.ts` 更新 live/planned 服务数量。
- Manual/browser: 检查 `/product/floor-mats` 和 `/product`。

## 9. 已知问题

- 汽车垫图片当前只有编号文件名，无法可靠标注具体车型；页面必须避免猜测车型。

## 10. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-07-03 | Codex | PRD/SPEC 编写，准备实现 | 进行中 | 代码实现与验证 |

---

> 最后更新: 2026-07-03
