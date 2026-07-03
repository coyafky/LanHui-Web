# SPEC: 轮毂图库升级页

> 功能规格说明书 — 定义 `/product/wheels` 的行为边界、数据合约和验收标准。  
> 对应 PRD: `docs/PRD/product/WHEEL_GALLERY_PAGE_PRD_2026-07-03.md`  
> 实现状态: `⬜ 未开始`

---

## 1. 职责范围

轮毂页负责展示蓝辉轻改已有轮毂素材、外观升级场景、关键参数确认项和到店服务流程；不负责报价、库存、在线选配、品牌授权或性能承诺。

## 1.1 Skill 路由

| Skill | 是否使用 | 用途 |
|---|---|---|
| `prompt-boost` | 是 | 将同模式需求转为 PRD/SPEC/实现任务 |
| `next-best-practices` | 是 | Next 16 App Router、metadata、RSC 页面 |
| `react-best-practices` | 是 | 静态数据、RSC、长图库渲染性能 |
| `prisma-data-ops` | 否 | 不涉及数据库 |
| faker/MSW | 否 | 不涉及 API mock |

## 2. 路由 / 入口

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/product/wheels` | page | 轮毂升级图库页 | ⬜ |
| `/product` | page | 产品中心 LightModMap 已有入口 | ✅ |

## 3. 数据模型

### 3.1 类型定义

```typescript
export type WheelCategory =
  | "sport"
  | "multi-spoke"
  | "premium"
  | "detail";

export type WheelImage = {
  id: string;
  filename: string;
  publicPath: string;
  width: 1086;
  height: 1448;
  aspectRatio: "3/4";
  title: string;
  category: WheelCategory;
  alt: string;
};
```

### 3.2 数据库表

不适用。

### 3.3 静态数据源

| 文件 | 说明 |
|---|---|
| `src/lib/wheel-products.ts` | 轮毂图片、分类、卖点、确认项、流程 |
| `public/images/products/wheel/*.png` | 21 张轮毂图片，1086×1448 |

## 4. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| `WheelsPage` | `src/app/product/wheels/page.tsx` | 否 | 页面组合、metadata、JSON-LD |
| `WheelHero` | `src/components/product/wheel/WheelHero.tsx` | 否 | 首屏与主视觉图 |
| `WheelValueGrid` | `src/components/product/wheel/WheelValueGrid.tsx` | 否 | 卖点和确认项 |
| `WheelGallery` | `src/components/product/wheel/WheelGallery.tsx` | 否 | 21 张轮毂图库 |
| `WheelServiceFlow` | `src/components/product/wheel/WheelServiceFlow.tsx` | 否 | 到店流程 |

## 5. API 合约

不适用。页面无 API 调用。

## 6. 依赖关系

- `src/lib/product-routes.ts` 已注册 `wheels` 为 live P0 light_mod 服务。
- `src/components/product/LightModMap.tsx` 已从 `/product` 入口链接到 `/product/wheels`。
- `src/app/product/wheels/page.tsx` 从通用 `ProductDetail` 切换为轮毂专属组件。

## 7. 验收条件

- [ ] AC1: `/product/wheels` 不再使用 `ProductDetail`。
- [ ] AC2: 页面图库展示 21 张轮毂图片。
- [ ] AC3: 图片容器固定 `aspect-[3/4]`。
- [ ] AC4: 页面包含关键确认项: 尺寸、ET、孔距、中心孔、载重、胎压传感器、动平衡。
- [ ] AC5: `/product` 中轮毂升级入口继续可进入该页。
- [ ] AC6: 相关 eslint / vitest / build 验证通过。

## 8. 实现拆解

### 8.1 前端实现

- 页面: `src/app/product/wheels/page.tsx`
- 组件: `src/components/product/wheel/*.tsx`
- 视觉参考: 汽车垫页模式 + 现有 `FlooringGallery` shadcn 卡片图库。
- 响应式视口: 390px、768px、1440px。

### 8.2 API 对接

不涉及。

### 8.3 后端/数据实现

- 新增 `src/lib/wheel-products.ts` 静态数据。
- 不新增 migration、seed 或 route handler。

### 8.4 测试实现

- Unit: `src/lib/wheel-products.test.ts` 验证图片数量、尺寸、路径存在。
- Build: `npm run build` 验证 SSG。
- Browser: `/product/wheels` 和 `/product` 可访问。

## 9. 已知问题

- 轮毂图片当前只有编号文件名，不能可靠标注品牌、尺寸和适配车型。

## 10. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-07-03 | Codex | PRD/SPEC 编写，准备实现 | 进行中 | 代码实现与验证 |

---

> 最后更新: 2026-07-03
