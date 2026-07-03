# CARMAT_PAGE_PRD_2026-07-03 — 汽车垫产品页

> 页面: `/product/floor-mats`  
> 类型: 服务项目详情页 / 产品图库页  
> 优先级: P1 → live  
> Owner: 冯科雅  
> 版本: v1  
> 最后更新: 2026-07-03

---

## 1. 背景

`public/images/products/carmat` 已有 29 张汽车垫产品图，当前 `/product/floor-mats` 仍是 `BrandPlaceholder` 占位页，`src/lib/product-routes.ts` 中该服务状态也是 `planned`。这会让“360 软包脚垫 / 汽车垫”在产品中心仍被表达为整理中，无法展示现有素材规模。

本次需求通过 `/prompt-boost` 方式转译为可执行目标：将 `/product/floor-mats` 升级为可公开访问的汽车垫展示页，重点展示“我们有很多汽车垫款式/效果图”，并使用项目现有 shadcn/ui 组件与 React/Next 最佳实践。

---

## 2. 目标

- 将 `/product/floor-mats` 从占位页升级为正式汽车垫产品展示页。
- 使用 `public/images/products/carmat` 的 29 张 1086×1448 图片，形成稳定比例的图库。
- 在产品中心增加实用配件入口，让用户能从 `/product` 进入汽车垫页。
- 使用 shadcn/ui 的 `Card`、`Badge` 等组件承载图片卡、标签和信息块。
- 保持纯静态、RSC 优先，不增加 API、数据库或复杂客户端状态。

---

## 3. 非目标

- 不做在线报价、购物车、库存、下单或支付。
- 不承诺具体车型适配、价格、质保年限或官方授权信息。
- 不为每张图做未经确认的车型/材质命名；图片文案使用“方案/效果/细节”等稳妥表达。
- 不引入新的 UI 框架或图片依赖。

---

## 4. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|
| 新车车主 | 想先了解脚垫/汽车垫效果 | 看到大量款式图和适用场景 | P0 |
| 家庭用车车主 | 关注易清洁和全包覆 | 看到卖点、场景、到店沟通提示 | P0 |
| 商务/MPV 车主 | 关注座舱整洁和后排质感 | 看到图片矩阵与方案分类 | P1 |
| 运营人员 | 希望先展示已有素材 | 不依赖 CMS，也不需要补齐所有参数 | P1 |

---

## 5. 功能清单

| # | 功能 | 优先级 | 验收 |
|---|---|---|---|
| F1 | `/product/floor-mats` 正式页面 | P0 | 不再显示占位组件 |
| F2 | 汽车垫 Hero | P0 | 首屏说明“汽车垫 / 360 软包脚垫”与到店沟通 |
| F3 | 29 张素材图库 | P0 | 所有 `1-1.png` 到 `1-29.png` 均展示 |
| F4 | 场景与卖点卡片 | P1 | 使用 shadcn `Card`/`Badge` 展示 |
| F5 | 产品中心入口 | P0 | `/product` 实用配件区域可进入 `/product/floor-mats` |
| F6 | SEO / JSON-LD | P1 | metadata + `ItemList` JSON-LD |

---

## 6. UI / 交互

### 6.1 视觉规范

- 主色: amber / orange，贴合实用配件和内饰质感。
- 背景: `zinc-950` / `black` 深色系统。
- 图片容器: `aspect-[3/4]`，匹配素材 1086×1448，避免裁切失控。
- 卡片: shadcn `Card`，边框保持 `zinc-800`，图片上方或底部使用 `Badge` 标记分类。
- CTA: 只引导到 `/contact` 或返回 `/product`，不做私有表单。

### 6.2 响应式

| 视口 | 行为 |
|---|---|
| 390px | 图库 1 列，文本不溢出，CTA 可点击 |
| 768px | 图库 2-3 列，场景卡双列 |
| 1440px | 图库 4 列，Hero 左文右图 |

---

## 7. 数据模型

新增静态数据文件:

```text
src/lib/carmat-products.ts
```

核心类型:

```ts
type CarMatImage = {
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

数据要求:

- 图片路径必须全部指向 `/images/products/carmat/*.png`。
- 图片尺寸使用字面量类型 `1086` / `1448` 防止规格漂移。
- 不从运行时读取文件系统；图片清单在模块层静态声明。

---

## 8. React / Next 实现约束

参考 `.claude/commands/react-best-practices.md`，本次采用以下规则:

- `server-hoist-static-io`: 图片清单是模块级静态数组，不在请求时读取目录。
- `server-serialization`: 页面保持 RSC，不向客户端组件传递大对象。
- `bundle-barrel-imports`: 继续依赖 Next 对 `lucide-react` 的导入优化，不新增重型依赖；shadcn 组件按文件导入。
- `rendering-content-visibility`: 长图库卡片使用 `content-visibility: auto` 延后离屏渲染。

---

## 9. 验收标准

- [ ] `/product/floor-mats` 显示正式汽车垫页面。
- [ ] 页面展示 29 张 `public/images/products/carmat` 图片。
- [ ] 产品中心 `/product` 有实用配件入口，包含汽车地板和 360 软包脚垫。
- [ ] `src/lib/product-routes.ts` 中 `floor-mats` 为 `live`。
- [ ] `npx eslint` 相关文件通过。
- [ ] `npx vitest run src/lib/carmat-products.test.ts src/lib/product-routes.test.ts` 通过。
- [ ] `npm run typecheck` 除既有 analytics 测试错误外，不新增业务代码错误。

---

## 10. Prompt Boost 输出摘要

### 精确执行提示词

在 Next.js 16 App Router 项目中，把 `/product/floor-mats` 从占位页升级为汽车垫产品展示页。新增 `src/lib/carmat-products.ts` 管理 29 张 1086×1448 图片，页面使用 RSC + Next/Image + shadcn/ui `Card` / `Badge` 展示 Hero、卖点、场景、图库和服务流程。同步 `src/lib/product-routes.ts` 将 `floor-mats` 改为 live，并在产品中心增加实用配件服务地图，让用户从 `/product` 能进入汽车垫页面。遵循 TypeScript strict、Tailwind v4、移动优先、无新增依赖、无未验证价格/授权承诺。

### 默认决策

- 路由使用既有 canonical `/product/floor-mats`，不新增 `/product/carmat`。
- 图片文案采用稳妥的“汽车垫方案/细节/效果图”，不猜测具体车型。
- 页面不做筛选交互，避免不必要客户端状态。

---

## 11. 变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-07-03 | v1 | 初稿，定义汽车垫展示页与产品中心入口 |
