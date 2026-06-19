# 电动踏板产品页 PRD (v1)

> 面向 Claude Code 架构师、coder、测试使用的执行规范文档。
> 本版本基于 [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.2 列出的 v0 状态条目升级为 v1。
> 覆盖路由:`/product/electric-steps`(电动踏板轻改装备详情页)

---

## 1. 概述

| 项目 | 内容 |
| --- | --- |
| 页面 | `/product/electric-steps` |
| 类型 | 产品详情(轻改装备方向之一) |
| 优先级 | P0 |
| Owner | 冯科雅 (Coya) |
| 版本 | v1 (2026-06-20) |
| 上一版本 | 无独立 PRD(数据定义在 `src/lib/products.ts` 中的 `slug: "electric-steps"` 条目,本次首次独立成文) |
| 主题色 | `blue`(轻改装备方向,blue-500/blue-400/blue-950;与膜系 orange 区分) |
| 数据来源 | 静态数据 `src/lib/products.ts` → `getProduct("electric-steps")` |
| 共享渲染 | `src/components/ProductDetail.tsx`(6 大产品线共用,通过 `product.slug` 分支渲染) |
| 上游 PRD | [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.2 |
| 关联 PRD | [PRODUCT_INDEX_PRD_2026-06-20.md](./PRODUCT_INDEX_PRD_2026-06-20.md) · [WHEELS_PRD_2026-06-20.md](./WHEELS_PRD_2026-06-20.md) · [CHASSIS_PRD_2026-06-20.md](./CHASSIS_PRD_2026-06-20.md) |

### 1.1 目标

为家用 SUV / MPV / 越野车主呈现电动踏板轻改装备产品页,统一 6 大产品线详情页的渲染结构(基于共享 `<ProductDetail>`),明确页面在「轻改装备」分组中的位置、数据契约、UI 规范与验收门禁。

### 1.2 主题色

`blue`(blue-500 主 / blue-400 强调 / blue-950/40 卡片底)。`ProductDetail` 通过 `product.group === "light-mod"` 自动判断,无需在本页 PRD 重复定义色板。

### 1.3 范围

- ✅ **包含**: 电动踏板详情页的元数据、Hero、tagline 横幅、4 个核心价值、4 步服务流程、面包屑;与 `/product` 入口的衔接;三视口响应式与 SEO metadata。
- ❌ **不包含**: 车型款式列表(电动踏板当前为「装备分类」层级,无 N 个产品行;若后续按品牌/车型扩展,需独立 PRD 走 wenjie/zeekr 5 组件模式);不在本页引入电商下单/在线报价/库存状态/后台管理。

---

## 2. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
| --- | --- | --- | --- |
| 家用 SUV/MPV 车主 | 想给老人小孩换更方便的上下车方案 | 看到「迎宾便利」价值 + 「无损安装」描述,愿意到店 | P0 |
| 越野车主 | 高底盘车型上下车不便 | 看到「承重稳定」+「姿态保留」,确认不破坏原车观感 | P0 |
| 注重原车观感的车主 | 担心加装件破坏原车线条 | 看到收起贴合原车侧裙,确认无破线束 | P0 |
| 轻改爱好者 | 想横向对比 6 大产品方向 | 在 `/product` 看到「电动踏板」入口,跳转到详情页 | P1 |
| 潜客 | 价格 / 工艺 / 流程不明 | 看到 4 步服务流程 + 到店沟通提示 | P1 |
| SEO/搜索引擎 | 想收录产品详情页 | 看到独立 `<title>` + `<meta description>` | P2 |

---

## 3. 功能清单

| # | 功能 | 优先级 | 状态 |
| --- | --- | --- | --- |
| F1 | Hero:面包屑(产品中心 → 电动踏板)+ 组别标签(轻改装备)+ H1 + heroDescription | P0 | ✅(已实现于 `ProductDetail` 共用) |
| F2 | Tagline 横幅:渐变文字「上下车更从容,也更稳」 | P0 | ✅ |
| F3 | 核心价值区:4 张卡片(迎宾便利 / 姿态保留 / 承重稳定 / 无损安装) | P0 | ✅ |
| F4 | 服务流程区:4 步流程(到店沟通 → 车型确认 → 方案推荐 → 施工交付) | P0 | ✅ |
| F5 | 三视口响应式(desktop 1440 / tablet 768 / mobile 390) | P0 | ✅ |
| F6 | SEO metadata:`title` + `description` | P0 | ✅ |
| F7 | 面包屑导航(`产品中心` 链接 → `电动踏板`) | P0 | ✅ |
| F8 | Header / Footer 全站统一 | P0 | ✅ |
| F9 | 全站统一咨询入口(WeChat modal / 电话) | P1 | ✅(由 `Header` 提供,非本产品页私有) |

> 本页**不包含**的功能(由所属分类共担):N 车型款式列表 / 价格表 / 库存 / 后台管理录入 / 第三方电商下单。

---

## 4. UI / 交互

### 4.1 视觉规范

- **主色**: `blue-500`(强调按钮、渐变文字、图标色)/ `blue-400`(辅助文字与标签)/ `blue-950/40`(卡片背景)
- **背景**: `bg-zinc-950`(Hero)+ `bg-black border-y border-zinc-900`(tagline + 核心价值交替)
- **图片容器**: 本页**当前不渲染产品大图**(无 `productImageMap` 中 `electric-steps` 的有效路径,值为空字符串)。若未来补图,统一 `aspect-[4/3] + object-contain + Next/Image sizes`(参照 [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md §8.4](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md))
- **字体**: Geist Sans(全站统一,无本页私有定制)
- **圆角**: `rounded-2xl`(卡片)/ `rounded-xl`(icon 容器)/ `rounded-lg`(icon 内层)
- **间距**: `py-16` 大区段 / `gap-4 md:gap-6` 网格

### 4.2 组件清单

| 组件 | 路径 | 类型 | 说明 |
| --- | --- | --- | --- |
| `<Header>` | `src/components/Header.tsx` | CC | 全站统一头(导航 + Logo + 咨询入口) |
| `<Footer>` | `src/components/Footer.tsx` | RSC | 全站统一底 |
| `<ProductDetail>` | `src/components/ProductDetail.tsx` | RSC | 6 大产品线共享渲染器,按 `product.slug` 分支 |
| `Sparkles` / `Check` | `lucide-react` | — | 核心价值区 icon |

> **本产品页无独立组件**(共享 `ProductDetail`),所有视觉差异通过 `product` 数据驱动。架构师若后续需要产品大图区,新增 `<ProductHeroImage>` 组件即可,无须拆 `<ProductDetail>`。

### 4.3 三视口响应式

| 视口 | 行为 |
| --- | --- |
| Desktop 1440 | 核心价值 4 列网格 / 服务流程 4 列 / Hero 文字居中 max-w-3xl |
| Tablet 768 | 核心价值 2 列 / 服务流程 2 列 / Hero 标题 text-4xl |
| Mobile 390 | 核心价值 1 列 / 服务流程 1 列 / Hero 标题 text-4xl / 面包屑可换行 |

### 4.4 交互细节

- **面包屑**:`产品中心` 可点击 → `/product`;`电动踏板` 不可点击(当前页)
- **核心价值卡片**:静态展示,无 hover 态(后续若加入 hover 效果,需在 `ProductDetail` 统一改造,本页不单独写)
- **服务流程卡片**:无跳转,以编号 `01-04` 为视觉锚点
- **CTA**:本页**不**含私有 CTA,统一由 `<Header>` 的「联系咨询」按钮触发全站 WeChat modal / 电话(详见 [PRODUCT_INDEX_PRD_2026-06-20.md §4.4](./PRODUCT_INDEX_PRD_2026-06-20.md))

---

## 5. 数据模型

### 5.1 静态数据

```
src/lib/products.ts → getProduct("electric-steps")
```

**数据契约**(`Product` 类型,见 [src/lib/products.ts](../../src/lib/products.ts)):

```ts
{
  slug: "electric-steps",
  name: "电动踏板",
  group: "light-mod",
  groupLabel: "轻改装备",
  tagline: "上下车更从容,也更稳",
  cardDescription: "开门自动展开,收起贴合原车,无损安装不破线束。",
  heroDescription: "电动踏板面向家用 SUV / MPV / 越野等高底盘车型,展开后降低上下车高度,收起后保持原车姿态。",
  audience: [
    "家用 SUV / MPV / 越野车主",
    "上下车不便的家庭用户",
    "注重原车观感的车主",
  ],
  values: [
    { title: "迎宾便利", description: "开门自动展开,降低上下车高度,老人小孩更方便。" },
    { title: "姿态保留", description: "收起后贴合原车侧裙,不破坏原车线条。" },
    { title: "承重稳定", description: "采用金属骨架与防滑踏面,长期使用更稳定。" },
    { title: "无损安装", description: "优先采用原车接口对插方案,不破坏原车线束。" },
  ],
  process: PROCESS_TEMPLATE, // 4 步:到店沟通 / 车型确认 / 方案推荐 / 施工交付
  // series / performanceRatings / packages / specs / colorSeries / hotColors / protectionScenes: undefined
}
```

### 5.2 字面量类型约束(如适用)

本页**不**走 5 组件主题专项模式(无 N 车型款式列表),因此**不需要** `Width = 1448` / `Height = 1086` / `AspectRatio = "4/3"` 字面量约束。详情见 [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md §8.5](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) — 该模式仅适用于主题专项(问界 / 小米 / 极氪 / 地板)。

### 5.3 3 态 imageStatus(如适用)

不适用(同 §5.2)。

### 5.4 CI 验证脚本

不适用(无图片规格校验对象)。

---

## 6. API 接口

| Method | 路径 | 用途 |
| --- | --- | --- |
| — | — | 此页面为**纯静态 SSG**,不调用任何 API |

未来若需要接入后台产品管理,新增 `/api/products/[slug]`(读)+ `/api/products` POST(写 admin),由独立 PRD 定义。本页**禁止**直接调用 `prisma.*`(遵循 [../../CLAUDE.md](../../CLAUDE.md) 数据访问约定)。

---

## 7. 验收标准 (DoD)

### 7.1 功能

- [ ] `/product/electric-steps` 可访问,无 404
- [ ] Hero 显示 H1 `电动踏板` + 副文案「电动踏板面向家用 SUV / MPV / 越野等高底盘车型…」
- [ ] Tagline 横幅显示渐变文字「上下车更从容,也更稳」
- [ ] 核心价值区展示 4 张卡片(迎宾便利 / 姿态保留 / 承重稳定 / 无损安装)
- [ ] 服务流程区展示 4 步流程(到店沟通 → 车型确认 → 方案推荐 → 施工交付)
- [ ] 面包屑「产品中心 → 电动踏板」可点击「产品中心」回退

### 7.2 性能

- [ ] LCP < 3s (desktop) / < 4s (mobile)
- [ ] CLS = 0
- [ ] 无横向滚动(mobile 390)

### 7.3 质量门

- [ ] `npx tsc --noEmit` 通过(允许 9 个 pre-existing 错,见 [../../CLAUDE.md](../../CLAUDE.md))
- [ ] `npm run build` 通过
- [ ] `npm run lint` 通过(本产品页不引入新违规)
- [ ] Playwright e2e:`/product/electric-steps` 加载与三视口截图通过

### 7.4 内容规范

- [ ] 文案不含「原厂 / 官方 / 授权」等未经确认措辞
- [ ] 文案与 `src/lib/products.ts` 中的 `electric-steps` 数据完全一致,无硬编码副本
- [ ] 不通过 JSX 硬编码 4 张价值卡片,必须通过 `product.values.map` 渲染
- [ ] 不通过 JSX 硬编码 4 步流程,必须通过 `product.process.map` 渲染

### 7.5 SEO

- [ ] 独立 `<title>`: `电动踏板 | 蓝辉轻改 LANHUI`
- [ ] 独立 `<meta description>`: 「蓝辉轻改电动踏板服务,面向家用 SUV / MPV / 越野等高底盘车型,提供到店沟通、规范施工与交付。」
- [ ] `/product` 入口可点击跳转到本页

### 7.6 可访问性

- [ ] 语义化 HTML: `<nav>` 面包屑 / `<section>` + 标题层级正确
- [ ] 图标 `aria-hidden` 或语义标签处理
- [ ] 颜色对比 ≥ 4.5:1(zinc-400 on zinc-950 已通过基线)

---

## 8. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
| --- | --- | --- | --- |
| 2026-06-20 | v1 | **首次独立成文**。8 节完整规格;明确共享 `<ProductDetail>` 渲染模式;划清与主题专项(字面量类型 / 3 态 UI / CI 脚本)边界 | Coya |
| (历史) | v0(隐式) | 数据在 `src/lib/products.ts` 中定义,无独立 PRD | — |

---

## 附录 A: 与其他产品页 PRD 的关系

- **同组(轻改装备)**:`/product/wheels` / `/product/chassis` 共享 `ProductDetail` 渲染器与蓝色主题,差异仅在 `Product` 数据。
- **膜系方向**:`/product/window-film` / `/product/color-film` / `/product/ppf` 共享同一渲染器但走 `orange` 主题;`ProductDetail` 内部按 `product.slug` 分支渲染「窗膜套餐」「改色系列 + 热门颜色」「PPF 系列 + 性能对比 + 防护场景」三大专属区。
- **主题专项**:`/product/zeekr` / `/product/wenjie` / `/product/xiaomi` / `/product/flooring` 走**独立 5 组件模式**,不走 `ProductDetail`,与本页架构分离。

## 附录 B: 相关文档

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.2
- [../../ARCHITECTURE.md](../../ARCHITECTURE.md)
- [../../CLAUDE.md](../../CLAUDE.md) — 数据访问约定
- [./PRODUCT_INDEX_PRD_2026-06-20.md](./PRODUCT_INDEX_PRD_2026-06-20.md) — 产品中心入口
- [./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) — 主题专项 canonical 参考
- [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §11](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) — 性能基线
