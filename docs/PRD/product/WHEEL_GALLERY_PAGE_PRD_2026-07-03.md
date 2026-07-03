# WHEEL_GALLERY_PAGE_PRD_2026-07-03 — 轮毂图库升级页

> 页面: `/product/wheels`  
> 类型: 服务项目详情页 / 产品图库页  
> 优先级: P0  
> Owner: 冯科雅  
> 版本: v2  
> 最后更新: 2026-07-03

---

## 1. 背景

`/product/wheels` 当前已是 live 服务页，但仍复用通用 `<ProductDetail>`，页面没有展示 `public/images/products/wheel` 下新增的 21 张轮毂素材。用户希望按照汽车垫页面同样模式处理 wheel 素材：先用 `/prompt-boost` 压实需求，写 PRD/SPEC，再实现页面。

本次升级把 `/product/wheels` 从“通用轻改装备详情页”升级为“轮毂图库 + 升级边界说明页”，重点展示已有轮毂款式视觉，并引导到店确认尺寸、ET、孔距、中心孔、载重、胎压传感器和动平衡等关键参数。

---

## 2. 目标

- 使用 `public/images/products/wheel` 的 21 张 1086×1448 图片展示轮毂款式视觉。
- 保持 `/product/wheels` canonical route，不新增路由。
- 使用 shadcn/ui 的 `Card`、`Badge` 承载图库、卖点和参数确认项。
- 页面保持 RSC 静态渲染，不新增 API、数据库、客户端筛选或新依赖。
- 与产品中心现有 `LightModMap` 入口保持连通。

---

## 3. 非目标

- 不展示价格、库存、品牌授权、现货状态。
- 不承诺性能提升、制动提升、油耗/电耗改善。
- 不猜测具体轮毂品牌、尺寸、PCD、ET 或适配车型。
- 不做在线选配器或复杂筛选。

---

## 4. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|
| 外观个性车主 | 想看轮毂风格 | 看到多张轮毂视觉参考 | P0 |
| 换胎/保养车主 | 顺便考虑换轮毂 | 明白需要确认原车数据和动平衡 | P0 |
| 新能源车主 | 担心适配和安全 | 看到尺寸、孔距、载重、胎压传感器等边界提醒 | P0 |
| 运营人员 | 希望展示现有素材 | 不依赖 CMS 即可上线图库 | P1 |

---

## 5. 功能清单

| # | 功能 | 优先级 | 验收 |
|---|---|---|---|
| F1 | `/product/wheels` 专属页面 | P0 | 不再使用通用 `ProductDetail` |
| F2 | 轮毂 Hero | P0 | 首屏有主图、H1、到店确认口径 |
| F3 | 21 张轮毂图库 | P0 | 全部 wheel 图片展示 |
| F4 | 关键确认项 | P0 | 尺寸、ET、孔距、中心孔、载重、胎压传感器等 |
| F5 | 场景/卖点卡片 | P1 | 使用 shadcn `Card`/`Badge` |
| F6 | SEO / JSON-LD | P1 | metadata + `ItemList` |

---

## 6. UI / 交互

### 6.1 视觉规范

- 主色: sky / blue，用于金属、运动、数据匹配感。
- 背景: `zinc-950` / `black`。
- 图片容器: `aspect-[3/4]`，匹配 1086×1448 素材。
- 卡片: shadcn `Card`，边框 `zinc-800`，hover 仅做轻微边框/图片缩放。
- 标签: shadcn `Badge` 标记风格分类和数量。

### 6.2 响应式

| 视口 | 行为 |
|---|---|
| 390px | 图库 1 列，参数提示单列 |
| 768px | 图库 2 列，确认项 2 列 |
| 1440px | 图库 4 列，Hero 左文右图 |

---

## 7. 数据模型

新增静态数据文件:

```text
src/lib/wheel-products.ts
```

核心类型:

```ts
type WheelImage = {
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

图片清单必须静态声明在模块层，不能运行时读取目录。

---

## 8. React / Next 实现约束

参考 `.claude/commands/react-best-practices.md`:

- `server-hoist-static-io`: 静态数组声明图片清单，不在请求中做 fs I/O。
- `server-serialization`: 页面全部 RSC，避免向 Client Component 传大对象。
- `bundle-barrel-imports`: shadcn 按文件导入；lucide 维持项目现有导入方式。
- `rendering-content-visibility`: 长图库卡片使用 `content-visibility: auto`。

---

## 9. 验收标准

- [ ] `/product/wheels` 正式展示轮毂图库页。
- [ ] 页面展示 21 张 `public/images/products/wheel` 图片。
- [ ] 页面说明到店确认尺寸、ET、孔距、中心孔、载重、胎压传感器等边界。
- [ ] 产品中心原有轮毂入口继续可进入 `/product/wheels`。
- [ ] `npx eslint` 相关文件通过。
- [ ] `npx vitest run src/lib/wheel-products.test.ts` 通过。
- [ ] `npm run build` 通过。

---

## 10. Prompt Boost 输出摘要

### 精确执行提示词

在 Next.js 16 App Router 项目中，将 `/product/wheels` 从通用 `ProductDetail` 页面升级为轮毂专属图库页。新增 `src/lib/wheel-products.ts` 管理 21 张 1086×1448 轮毂素材，页面使用 RSC + Next/Image + shadcn/ui `Card` / `Badge` 展示 Hero、卖点、确认参数、图库和服务流程。保持产品中心现有 `/product/wheels` 入口，遵循 TypeScript strict、Tailwind v4、移动优先、无新增依赖、无价格/授权/性能承诺。

### 默认决策

- 继续使用既有 canonical `/product/wheels`。
- 图片文案使用“轮毂方案/视觉参考/细节展示”，不猜测品牌和尺寸。
- 页面不做筛选交互，避免不必要客户端状态。

---

## 11. 变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-06-20 | v1 | 通用 ProductDetail 版本 |
| 2026-07-03 | v2 | 新增轮毂图库升级页规格 |
