# ELECTRIC_STEPS_GALLERY_PAGE_PRD_2026-07-03 — 电动踏板图库升级页

> 页面: `/product/electric-steps`  
> 类型: 服务项目详情页 / 产品图库页  
> 优先级: P0  
> Owner: 冯科雅  
> 版本: v2  
> 最后更新: 2026-07-03

---

## 1. 背景

`/product/electric-steps` 当前已是 live 服务页，但仍复用通用 `<ProductDetail>`，页面没有展示 `public/images/products/Taban` 下的电动踏板素材。用户要求按照汽车垫、轮毂同样模式处理电动踏板页：先通过 `/prompt-boost` 思路补 PRD/SPEC，再执行代码实现。

`Taban` 目录包含 3 张图片：无灯款、单流光灯款、大灯带款。图片尺寸不统一，因此页面应使用稳定的横向图片容器和 `object-contain`，避免裁切掉踏板主体。

---

## 2. 目标

- 使用 `public/images/products/Taban` 的 3 张图片展示电动踏板款式差异。
- 保持 `/product/electric-steps` canonical route，不新增路由。
- 使用 shadcn/ui 的 `Card`、`Badge` 承载款式卡、卖点和安装确认项。
- 页面保持 RSC 静态渲染，不新增 API、数据库、客户端筛选或新依赖。
- 与产品中心现有 `LightModMap` 入口保持连通。

---

## 3. 非目标

- 不展示价格、库存、官方授权或原厂承诺。
- 不承诺所有车型可安装；底盘结构、安装位和电气接口必须到店确认。
- 不做在线选配器、下单或复杂交互。
- 不把“电动踏板盖”等配件误写成踏板总成。

---

## 4. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|
| 高底盘 SUV 车主 | 家人上下车不方便 | 了解电动踏板能降低上下车高度 | P0 |
| MPV / 大六座用户 | 高频接待和家庭出行 | 看到不同灯带款式和使用边界 | P0 |
| 注重原车观感用户 | 担心破坏车身线条 | 了解收起贴合、安装位和线束确认 | P0 |
| 运营人员 | 希望展示已有素材 | 不依赖 CMS 即可上线 3 款图库 | P1 |

---

## 5. 功能清单

| # | 功能 | 优先级 | 验收 |
|---|---|---|---|
| F1 | `/product/electric-steps` 专属页面 | P0 | 不再使用通用 `ProductDetail` |
| F2 | 电动踏板 Hero | P0 | 首屏有主图、H1、到店确认口径 |
| F3 | 3 张款式图库 | P0 | 展示 `biglight`、`singlelight`、`nolight` |
| F4 | 安装确认项 | P0 | 底盘固定点、门体信号、电气接口、防夹/灯带、离地间隙 |
| F5 | 常见车型词云 | P0 | 使用 shadcn `Card`/`Badge` 表达可到店确认的多车型覆盖 |
| F6 | 场景/卖点卡片 | P1 | 使用 shadcn `Card`/`Badge` |
| F7 | SEO / JSON-LD | P1 | metadata + `ItemList` |

---

## 6. UI / 交互

### 6.1 视觉规范

- 主色: orange / amber，体现机械装备和迎宾灯带。
- 背景: `zinc-950` / `black`。
- 图片容器: `aspect-[4/3]`，图片使用 `object-contain`，适配 1646×1166、750×547、750×487 三种比例。
- 卡片: shadcn `Card`，边框 `zinc-800`，灯带款用 `Badge` 标记。
- 车型词云: shadcn `Card` 容器 + `Badge` 标签，使用不同字号/边框强度表达车型热度；标题必须写“常见到店确认车型”，避免写成“全部可装”。
- CTA: 只引导到 `/contact` 或锚点图库，不做私有表单。

### 6.2 响应式

| 视口 | 行为 |
|---|---|
| 390px | 款式图 1 列，安装确认项单列 |
| 768px | 款式图 2 列，确认项 2 列 |
| 1440px | Hero 左文右图，图库 3 列 |

---

## 7. 数据模型

新增静态数据文件:

```text
src/lib/electric-step-products.ts
```

核心类型:

```ts
type ElectricStepImage = {
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

图片清单必须静态声明在模块层，不能运行时读取目录。

---

## 8. React / Next 实现约束

参考 `.claude/commands/react-best-practices.md`:

- `server-hoist-static-io`: 静态数组声明图片清单，不在请求中做 fs I/O。
- `server-serialization`: 页面全部 RSC，避免向 Client Component 传大对象。
- `bundle-barrel-imports`: shadcn 按文件导入；lucide 维持项目现有导入方式。
- `rendering-content-visibility`: 图库卡片使用 `content-visibility: auto`。

---

## 9. 验收标准

- [ ] `/product/electric-steps` 正式展示电动踏板图库页。
- [ ] 页面展示 3 张 `public/images/products/Taban` 图片。
- [ ] 页面说明底盘固定点、门体信号、电气接口、防夹/灯带和离地间隙需到店确认。
- [ ] 页面展示 shadcn `Card` + `Badge` 实现的车型词云，表达“常见到店确认车型”。
- [ ] 产品中心原有电动踏板入口继续可进入 `/product/electric-steps`。
- [ ] `npx eslint` 相关文件通过。
- [ ] `npx vitest run src/lib/electric-step-products.test.ts` 通过。
- [ ] `npm run build` 通过。

---

## 10. Prompt Boost 输出摘要

### 精确执行提示词

在 Next.js 16 App Router 项目中，将 `/product/electric-steps` 从通用 `ProductDetail` 页面升级为电动踏板专属图库页。新增 `src/lib/electric-step-products.ts` 管理 `public/images/products/Taban` 的 3 张踏板素材，页面使用 RSC + Next/Image + shadcn/ui `Card` / `Badge` 展示 Hero、卖点、安装确认项、常见车型词云、款式图库和服务流程。保持产品中心现有 `/product/electric-steps` 入口，遵循 TypeScript strict、Tailwind v4、移动优先、无新增依赖、无价格/授权/全车型可装承诺。

### 默认决策

- 继续使用既有 canonical `/product/electric-steps`。
- 图片文案使用“无灯款 / 单流光灯 / 大灯带款”这类从文件名可推断的款式表达。
- 页面不做筛选交互，避免不必要客户端状态。

---

## 11. 变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-06-20 | v1 | 通用 ProductDetail 版本 |
| 2026-07-03 | v2 | 新增电动踏板图库升级页规格 |
