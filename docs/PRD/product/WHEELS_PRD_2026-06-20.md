# 轮毂升级产品页 PRD (v1)

> 面向 Claude Code 架构师、coder、测试使用的执行规范文档。
> 本版本基于 [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.2 列出的 v0 状态条目升级为 v1。
> 覆盖路由:`/product/wheels`(轮毂升级轻改装备详情页)

---

## 1. 概述

| 项目 | 内容 |
| --- | --- |
| 页面 | `/product/wheels` |
| 类型 | 产品详情(轻改装备方向之一) |
| 优先级 | P0 |
| Owner | 冯科雅 (Coya) |
| 版本 | v1 (2026-06-20) |
| 上一版本 | 无独立 PRD(数据定义在 `src/lib/products.ts` 中的 `slug: "wheels"` 条目,本次首次独立成文) |
| 主题色 | `blue`(轻改装备方向,与电动踏板 / 底盘升级一致) |
| 数据来源 | 静态数据 `src/lib/products.ts` → `getProduct("wheels")` |
| 共享渲染 | `src/components/ProductDetail.tsx`(6 大产品线共用,通过 `product.slug` 分支渲染) |
| 上游 PRD | [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.2 |
| 关联 PRD | [PRODUCT_INDEX_PRD_2026-06-20.md](./PRODUCT_INDEX_PRD_2026-06-20.md) · [ELECTRIC_STEPS_PRD_2026-06-20.md](./ELECTRIC_STEPS_PRD_2026-06-20.md) · [CHASSIS_PRD_2026-06-20.md](./CHASSIS_PRD_2026-06-20.md) |

### 1.1 目标

为希望提升整车颜值、准备换轮胎/做四轮保养、关注行驶质感与刹车散热的车主呈现轮毂升级产品页,与「电动踏板」「底盘升级」共同构成轻改装备三大方向;在共享 `<ProductDetail>` 渲染器下,通过数据契约隔离文案与价值主张。

### 1.2 主题色

`blue`(blue-500 主 / blue-400 强调 / blue-950/40 卡片底)。`ProductDetail` 通过 `product.group === "light-mod"` 自动判断。

### 1.3 范围

- ✅ **包含**: 轮毂升级详情页的元数据、Hero、tagline 横幅、4 个核心价值、4 步服务流程、面包屑;与 `/product` 入口的衔接;三视口响应式与 SEO metadata。
- ❌ **不包含**: 轮毂具体款式列表(当前为「装备分类」层级,无 N 款式数据;若后续按车型/尺寸/品牌扩展,需独立 PRD 走 wenjie/zeekr 5 组件模式);不在本页引入电商下单/在线报价/库存状态/后台管理。

---

## 2. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
| --- | --- | --- | --- |
| 颜值党车主 | 想换轮毂提升整车观感 | 看到「款式多样」+「数据匹配」价值,愿到店沟通 | P0 |
| 换胎 / 四轮保养车主 | 顺便考虑升级轮毂 | 看到「动平衡考虑」+「施工标准」,确认升级不破坏刹车散热 | P0 |
| 行驶质感追求者 | 关注刹车散热与高速稳定性 | 看到「动平衡考虑」+「施工标准」+「数据匹配」,信任方案 | P0 |
| 轻改爱好者 | 想横向对比 6 大产品方向 | 在 `/product` 看到「轮毂升级」入口,跳转详情页 | P1 |
| 潜客 | 升级后磨合期注意事项不明 | 看到服务流程 4 步 + 提示 | P1 |
| SEO/搜索引擎 | 想收录产品详情页 | 看到独立 `<title>` + `<meta description>` | P2 |

---

## 3. 功能清单

| # | 功能 | 优先级 | 状态 |
| --- | --- | --- | --- |
| F1 | Hero:面包屑(产品中心 → 轮毂升级)+ 组别标签(轻改装备)+ H1 + heroDescription | P0 | ✅ |
| F2 | Tagline 横幅:渐变文字「换一套轮毂,换一种风格」 | P0 | ✅ |
| F3 | 核心价值区:4 张卡片(数据匹配 / 款式多样 / 动平衡考虑 / 施工标准) | P0 | ✅ |
| F4 | 服务流程区:4 步流程(到店沟通 → 车型确认 → 方案推荐 → 施工交付) | P0 | ✅ |
| F5 | 三视口响应式(desktop 1440 / tablet 768 / mobile 390) | P0 | ✅ |
| F6 | SEO metadata:`title` + `description` | P0 | ✅ |
| F7 | 面包屑导航(`产品中心` 链接 → `轮毂升级`) | P0 | ✅ |
| F8 | Header / Footer 全站统一 | P0 | ✅ |

> 本页**不包含**的功能:具体轮毂款式 / 尺寸 / 颜色 / 价格 / 库存 / 后台管理。

---

## 4. UI / 交互

### 4.1 视觉规范

- **主色**: `blue-500` / `blue-400` / `blue-950/40`
- **背景**: `bg-zinc-950` (Hero) + `bg-black border-y border-zinc-900` (tagline + 核心价值交替)
- **图片容器**: 本页**当前不渲染产品大图**(`productImageMap["wheels"]` 为空字符串)。若未来补图,统一 `aspect-[4/3] + object-contain + Next/Image sizes`(参照 [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md §8.4](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md))
- **字体**: Geist Sans(全站统一)
- **圆角**: `rounded-2xl` (卡片) / `rounded-xl` (icon 容器)
- **间距**: `py-16` 大区段 / `gap-4 md:gap-6` 网格

### 4.2 组件清单

| 组件 | 路径 | 类型 | 说明 |
| --- | --- | --- | --- |
| `<Header>` | `src/components/Header.tsx` | CC | 全站统一头 |
| `<Footer>` | `src/components/Footer.tsx` | RSC | 全站统一底 |
| `<ProductDetail>` | `src/components/ProductDetail.tsx` | RSC | 6 大产品线共享渲染器 |
| `Sparkles` / `Check` | `lucide-react` | — | 核心价值区 icon |

### 4.3 三视口响应式

| 视口 | 行为 |
| --- | --- |
| Desktop 1440 | 核心价值 4 列 / 服务流程 4 列 / Hero 文字居中 max-w-3xl |
| Tablet 768 | 核心价值 2 列 / 服务流程 2 列 |
| Mobile 390 | 核心价值 1 列 / 服务流程 1 列 / 面包屑可换行 |

### 4.4 交互细节

- **面包屑**:`产品中心` 可点击 → `/product`
- **核心价值卡片**:静态展示
- **服务流程**:以编号 `01-04` 为视觉锚点

---

## 5. 数据模型

### 5.1 静态数据

```
src/lib/products.ts → getProduct("wheels")
```

**数据契约**:

```ts
{
  slug: "wheels",
  name: "轮毂升级",
  group: "light-mod",
  groupLabel: "轻改装备",
  tagline: "换一套轮毂,换一种风格",
  cardDescription: "数据精准匹配,款式多样可选,兼顾视觉与行驶品质。",
  heroDescription: "围绕原车数据与驾驶习惯,提供轮毂样式、尺寸、颜色的合规升级方案,兼顾视觉与行驶品质。",
  audience: [
    "希望提升整车颜值的车主",
    "准备换轮胎/做四轮保养的车主",
    "关注行驶质感与刹车散热的车主",
  ],
  values: [
    { title: "数据匹配", description: "结合原车 ET 值、孔距、中心孔给出可装方案。" },
    { title: "款式多样", description: "提供多款不同风格的轮毂样式可选。" },
    { title: "动平衡考虑", description: "升级方案会同步考虑动平衡与刹车散热空间。" },
    { title: "施工标准", description: "按规范扭矩安装,提示磨合期注意事项。" },
  ],
  process: PROCESS_TEMPLATE,
}
```

### 5.2 字面量类型约束(如适用)

不适用(本页无 N 款式列表,不走主题专项模式)。

### 5.3 3 态 imageStatus(如适用)

不适用。

### 5.4 CI 验证脚本

不适用。

---

## 6. API 接口

| Method | 路径 | 用途 |
| --- | --- | --- |
| — | — | 此页面为**纯静态 SSG**,不调用任何 API |

未来若需要接入后台产品管理,新增 `/api/products/[slug]`(读)+ `/api/products` POST(写 admin),由独立 PRD 定义。

---

## 7. 验收标准 (DoD)

### 7.1 功能

- [ ] `/product/wheels` 可访问,无 404
- [ ] Hero 显示 H1 `轮毂升级` + 副文案「围绕原车数据与驾驶习惯…」
- [ ] Tagline 横幅显示渐变文字「换一套轮毂,换一种风格」
- [ ] 核心价值区展示 4 张卡片(数据匹配 / 款式多样 / 动平衡考虑 / 施工标准)
- [ ] 服务流程区展示 4 步流程
- [ ] 面包屑「产品中心 → 轮毂升级」可点击「产品中心」回退

### 7.2 性能

- [ ] LCP < 3s (desktop) / < 4s (mobile)
- [ ] CLS = 0
- [ ] 无横向滚动(mobile 390)

### 7.3 质量门

- [ ] `npx tsc --noEmit` 通过
- [ ] `npm run build` 通过
- [ ] `npm run lint` 通过
- [ ] Playwright e2e 通过

### 7.4 内容规范

- [ ] 文案不含「原厂 / 官方 / 授权」等未经确认措辞
- [ ] 文案与 `src/lib/products.ts` 中的 `wheels` 数据完全一致
- [ ] 不通过 JSX 硬编码 4 张价值卡片,必须 `product.values.map` 渲染

### 7.5 SEO

- [ ] 独立 `<title>`: `轮毂升级 | 蓝辉轻改 LANHUI`
- [ ] 独立 `<meta description>`: 「蓝辉轻改轮毂升级服务,围绕原车数据提供样式、尺寸、颜色的合规升级方案,兼顾视觉与行驶品质。」
- [ ] `/product` 入口可点击跳转到本页

### 7.6 可访问性

- [ ] 语义化 HTML 正确
- [ ] 颜色对比 ≥ 4.5:1
- [ ] 键盘可达(链接 / 按钮 focus ring)

---

## 8. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
| --- | --- | --- | --- |
| 2026-06-20 | v1 | **首次独立成文**。8 节完整规格;明确共享 `<ProductDetail>` 渲染模式;与电动踏板 / 底盘升级共担轻改装备组视觉 | Coya |
| (历史) | v0(隐式) | 数据在 `src/lib/products.ts` 中定义,无独立 PRD | — |

---

## 附录 A: 与其他产品页 PRD 的关系

- **同组(轻改装备)**:`/product/electric-steps` / `/product/chassis` 共享 `ProductDetail` 渲染器与蓝色主题。
- **膜系方向**:`/product/window-film` / `/product/color-film` / `/product/ppf` 走 `orange` 主题。
- **主题专项**:`/product/zeekr` / `/product/wenjie` / `/product/xiaomi` / `/product/flooring` 走**独立 5 组件模式**,不走 `ProductDetail`,与本页架构分离。

## 附录 B: 相关文档

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.2
- [../../ARCHITECTURE.md](../../ARCHITECTURE.md)
- [../../CLAUDE.md](../../CLAUDE.md) — 数据访问约定
- [./PRODUCT_INDEX_PRD_2026-06-20.md](./PRODUCT_INDEX_PRD_2026-06-20.md) — 产品中心入口
- [./ELECTRIC_STEPS_PRD_2026-06-20.md](./ELECTRIC_STEPS_PRD_2026-06-20.md) — 同组参考实现
- [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §11](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) — 性能基线
