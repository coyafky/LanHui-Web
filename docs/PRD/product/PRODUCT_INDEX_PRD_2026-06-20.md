# 产品中心入口页 PRD (v1)

> 面向 Claude Code 架构师、coder、测试使用的执行规范文档。
> 覆盖路由:`/product`(产品中心聚合入口页,6 大产品线 + 4 大主题专项)

---

## 1. 概述

| 项目 | 内容 |
| --- | --- |
| 页面 | `/product` |
| 类型 | 产品中心聚合入口页 |
| 优先级 | P0 |
| Owner | 冯科雅 (Coya) |
| 版本 | v1 (2026-06-20) |
| 上一版本 | 无独立 PRD(代码 `src/app/product/page.tsx` 已稳定,本次首次独立成文) |
| 数据来源 | `src/lib/products.ts` → `products` + `productGroups` + `PRODUCT_ICON_MAP`;主题 banner 各自 `<Xxx>TopicBanner />` |
| 上游 PRD | [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.2 |
| 关联 PRD | 6 大产品线 + 4 主题专项子 PRD |

### 1.1 目标

为访客提供产品中心聚合入口页,先展示「热门车型与改装专题」4 大 TopicBanner(小米 / 问界 / 极氪 / 木地板),再分「轻改装备」与「汽车膜系」两大组展示 6 个产品方向卡片,引导进入详情页或到店沟通。

### 1.2 主题色

- **轻改装备组**: `blue`(blue-400 标签 + blue-950/40 卡片底)
- **汽车膜系组**: `orange`(orange-400 标签 + orange-950/40 卡片底)
- **热门车型专题**: 各主题独立色(xiaomi=orange, wenjie=cyan, zeekr=orange, flooring=amber)

### 1.3 范围

- ✅ **包含**: Hero / 热门车型与改装专题区(4 个 TopicBanner)/ 轻改装备组(电动踏板 / 轮毂升级 / 底盘升级)/ 汽车膜系组(汽车窗膜 / 改色膜 / 隐形车衣)/ 卡片布局 / 三视口响应式 / SEO metadata。
- ❌ **不包含**: 单品 SKU 列表 / 价格 / 库存;不在本页引入电商下单 / 后台管理。

---

## 2. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
| --- | --- | --- | --- |
| 车型偏好明确车主 | 已是问界 / 小米 / 极氪车主 | 看到对应 TopicBanner 入口,一键进入专题页 | P0 |
| 装备需求明确车主 | 想换轮毂 / 装电动踏板 / 改底盘 | 在「轻改装备」组看到对应卡片,跳转详情页 | P0 |
| 膜系需求明确车主 | 想贴窗膜 / 改色膜 / 隐形车衣 | 在「汽车膜系」组看到对应卡片,跳转详情页 | P0 |
| 主题浏览型车主 | 想看看蓝辉有哪些方向 | 看到「6 大产品方向 + 4 大主题专题」分层结构 | P1 |
| 潜客 | 不知道从哪个产品方向入手 | 看到 Hero 文案「先了解大类,再到店沟通具体方案」 | P1 |
| SEO/搜索引擎 | 想索引产品中心 | 看到独立 `<title>` + `<meta description>` | P2 |

---

## 3. 功能清单

| # | 功能 | 优先级 | 状态 |
| --- | --- | --- | --- |
| F1 | Hero:背景渐变(blue-950/30 + orange-500/15 blur)/ `PRODUCTS` 标签 / H1 `产品中心` / 副文案 | P0 | ✅ |
| F2 | **热门车型与改装专题区**:4 个 TopicBanner(`<XiaomiTopicBanner />` + `<WenjieTopicBanner />` + `<ZeekrTopicBanner />` + `<FlooringTopicBanner />`) | P0 | ✅ |
| F3 | **轻改装备组**:3 个产品卡片(电动踏板 / 轮毂升级 / 底盘升级),`grid-cols-1 md:grid-cols-2 lg:grid-cols-3` | P0 | ✅ |
| F4 | **汽车膜系组**:3 个产品卡片(汽车窗膜 / 改色膜 / 隐形车衣) | P0 | ✅ |
| F5 | 产品卡片:图标 + 产品名 + 组别 + tagline + 「了解详情 →」链接 | P0 | ✅ |
| F6 | 三视口响应式 | P0 | ✅ |
| F7 | SEO metadata | P0 | ✅ |
| F8 | Header / Footer / 全站统一咨询入口 | P0 | ✅ |
| F9 | 链接到对应产品详情页(`/product/<slug>`) | P0 | ✅ |

---

## 4. UI / 交互

### 4.1 视觉规范

- **页面背景**: `bg-zinc-950`
- **Hero 装饰**: `bg-gradient-to-br from-blue-950/30 via-zinc-950 to-zinc-950` + 2 个 blur-3xl 光晕(blue-700/20 + orange-500/15)
- **组区背景**: `bg-zinc-950 border-t border-zinc-900`
- **标签色**: 轻改装备 `text-blue-400` + `LIGHT MOD` / 膜系 `text-orange-400` + `FILM SERIES`
- **卡片**: `bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all`
- **图标容器**: `h-32 bg-{accent}-950/40 flex items-center justify-center border-b border-zinc-800`
- **字体**: Geist Sans
- **间距**: `py-16` 大区段 / `gap-4 md:gap-6` 卡片网格 / `space-y-4 md:space-y-6` TopicBanner 列表

### 4.2 组件清单

| 组件 | 路径 | 类型 | 说明 |
| --- | --- | --- | --- |
| `<Header>` | `src/components/Header.tsx` | CC | 全站统一头 |
| `<Footer>` | `src/components/Footer.tsx` | RSC | 全站统一底 |
| `<XiaomiTopicBanner>` | `src/components/xiaomi/XiaomiTopicBanner.tsx` | RSC | 小米 SU7 主题入口 |
| `<WenjieTopicBanner>` | `src/components/wenjie/WenjieTopicBanner.tsx` | RSC | 问界主题入口 |
| `<ZeekrTopicBanner>` | `src/components/zeekr/ZeekrTopicBanner.tsx` | RSC | 极氪主题入口 |
| `<FlooringTopicBanner>` | `src/components/product/FlooringTopicBanner.tsx` | RSC | 木地板主题入口 |
| `<ProductSummaryCard>` (本地) | `src/app/product/page.tsx` 内嵌 | RSC | 产品卡片,6 张 |
| `ArrowRight` / `Wrench` | `lucide-react` | — | 卡片链接箭头 + 默认 icon |

### 4.3 4 大 TopicBanner 子区块规格

> 主题专项 canonical 参考: [./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md)

| Banner | 主题色 | 路由 | 适配车型 | 推荐图文 |
| --- | --- | --- | --- | --- |
| `<XiaomiTopicBanner />` | `orange` | `/product/xiaomi` | 小米 SU7 | SU7 内饰便利 + 防护配件 |
| `<WenjieTopicBanner />` | `cyan` | `/product/wenjie` | 问界 M7 / M8 / M9 | M7/M8/M9 主题 |
| `<ZeekrTopicBanner />` | `orange` | `/product/zeekr` | 极氪 9X / 8X / 009 | 23 款式 + 3 车型 |
| `<FlooringTopicBanner />` | `amber` | `/product/flooring` | 木地板 | 木地板升级 |

**TopicBanner 共同字段**:
- 标题(如 `小米 SU7 改装专题`)
- 副标题(车型范围 + 卖点)
- 统计(款式数 / 车型数)
- 入口按钮文案(`查看专题` / `了解更多`)
- 跳转链接(`/product/<topic>`)

**顺序约定**(本版本):`<XiaomiTopicBanner />` → `<WenjieTopicBanner />` → `<ZeekrTopicBanner />` → `<FlooringTopicBanner />`。**禁止**改动既有顺序(避免回归,见 [ZEEKR §17](../../docs/PRD/product/ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md))。

### 4.4 产品卡片规格(`<ProductSummaryCard>` 内嵌)

- **布局**: `<Link href="/product/${product.slug}">` 整卡可点击
- **图标区**: `h-32` + accent 背景 + `PRODUCT_ICON_MAP[product.slug]` 图标(Wrench 为默认 fallback)
- **内容区**: `p-6` + H3 产品名 + 组别 tag + tagline + 「了解详情 →」链接(箭头 hover translate-x-1)
- **数据驱动**: `products.filter(p => p.group === group.id)` 按组过滤;accent 自动判断

### 4.5 三视口响应式

| 视口 | 行为 |
| --- | --- |
| Desktop 1440 | 产品卡片 3 列 / TopicBanner 满宽 / Hero 文字居中 max-w-3xl |
| Tablet 768 | 产品卡片 2 列 / TopicBanner 满宽 |
| Mobile 390 | 产品卡片 1 列 / TopicBanner 满宽 / 文字堆叠 |

### 4.6 交互细节

- **Hero**:静态,无 CTA 按钮(联系入口由 `<Header>` 统一提供)
- **TopicBanner**:整块可点击跳转
- **产品卡片**:整块 `<Link>`,hover 时 `border-zinc-700` + 箭头 `translate-x-1`
- **CTA**:本页**不**含私有 CTA

---

## 5. 数据模型

### 5.1 静态数据

```
src/lib/products.ts → products + productGroups + PRODUCT_ICON_MAP
```

**数据契约**:

```ts
import { Footprints, CircleDot, Wrench, Sun, Palette, ShieldCheck } from "lucide-react";
import type { ComponentType } from "react";

type ProductGroup = "light-mod" | "film";

type Product = {
  slug: string;          // "electric-steps" / "wheels" / "chassis" / "window-film" / "color-film" / "ppf"
  name: string;          // 中文产品名
  group: ProductGroup;
  groupLabel: string;    // "轻改装备" / "汽车膜系"
  tagline: string;
  cardDescription: string;
  heroDescription: string;
  audience: string[];
  values: { title: string; description: string }[];
  process: { step: string; title: string; description: string }[];
  // 系列数据(膜系专属)
  series?: ProductSeries[];
  performanceRatings?: PerformanceRating[];
  packages?: ProductPackage[];
  specs?: Record<string, string>[];
  colorSeries?: ColorFilmSeries[];
  hotColors?: HotColorGroup[];
  protectionScenes?: { scene: string; description: string }[];
};

// 6 条
products: [
  { slug: "electric-steps", ... },
  { slug: "wheels", ... },
  { slug: "chassis", ... },
  { slug: "window-film", ... },
  { slug: "color-film", ... },
  { slug: "ppf", ... },
];

// 2 组
productGroups: [
  { id: "light-mod", label: "轻改装备", description: "围绕姿态、便利、行驶质感的功能性升级。" },
  { id: "film", label: "汽车膜系", description: "围绕隔热、隐私、漆面保护与个性化表达。" },
];

// 6 个映射
PRODUCT_ICON_MAP: {
  "electric-steps": Footprints,
  wheels: CircleDot,
  chassis: Wrench,
  "window-film": Sun,
  "color-film": Palette,
  ppf: ShieldCheck,
};
```

**产品总数约束**:`MinProducts = 6`,`MaxProducts = 6`(字面量类型,防规格漂移)。

### 5.2 TopicBanner 数据契约

每个 `<Xxx>TopicBanner />` 内部数据由对应 `src/lib/<topic>-products.ts` 提供(见 [./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md §12](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) 范例)。Banner 只做入口展示,不展示 N 个款式。

### 5.3 字面量类型约束(如适用)

```ts
type MinProducts = 6;
type MaxProducts = 6;
type GroupCount = 2;          // light-mod + film
type TopicBannerCount = 4;    // xiaomi + wenjie + zeekr + flooring
type LightModCount = 3;       // electric-steps + wheels + chassis
type FilmCount = 3;           // window-film + color-film + ppf
```

### 5.4 3 态 imageStatus(如适用)

本页**不**直接渲染图片(`<ProductSummaryCard>` 用 lucide 图标而非产品图),因此不涉及 imageStatus 字段。若后续在产品卡片加产品图,需引用 ZEEKR 3 态规范。

### 5.5 CI 验证脚本

不适用(本页无产品图)。

---

## 6. API 接口

| Method | 路径 | 用途 |
| --- | --- | --- |
| — | — | 此页面为**纯静态 SSG**,不调用任何 API |

未来若需要接入动态产品管理,由独立 PRD 定义。

---

## 7. 验收标准 (DoD)

### 7.1 功能

- [ ] `/product` 可访问,无 404
- [ ] Hero 显示 `PRODUCTS` 标签 + H1 `产品中心` + 副文案「蓝辉轻改当前覆盖 6 个产品方向…」
- [ ] **热门车型与改装专题区**展示 4 个 TopicBanner,顺序为 xiaomi → wenjie → zeekr → flooring
- [ ] 每个 TopicBanner 跳转链接正确(`/product/xiaomi` / `/product/wenjie` / `/product/zeekr` / `/product/flooring`)
- [ ] **轻改装备组**展示 3 张卡片(电动踏板 / 轮毂升级 / 底盘升级),accent=blue
- [ ] **汽车膜系组**展示 3 张卡片(汽车窗膜 / 改色膜 / 隐形车衣),accent=orange
- [ ] 产品卡片 `tagline` / `了解详情 →` 显示正确
- [ ] 卡片 hover 时箭头 `translate-x-1`
- [ ] 卡片点击跳转到对应 `/product/<slug>` 详情页

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
- [ ] 6 个产品 + 2 个组 + 4 个 TopicBanner 全部数据驱动,JSX 不硬编码
- [ ] 4 个 TopicBanner 顺序**不**改变(避免回归)
- [ ] 卡片 icon 缺失时 fallback `Wrench`(见代码 `const Icon = PRODUCT_ICON_MAP[product.slug] ?? Wrench;`)

### 7.5 SEO

- [ ] 独立 `<title>`: `产品中心 | 蓝辉轻改 LANHUI`
- [ ] 独立 `<meta description>`: 「蓝辉轻改产品中心,覆盖轻改装备(电动踏板、轮毂升级、底盘升级)与汽车膜系(窗膜、改色膜、隐形车衣)共 6 个产品方向。」
- [ ] 4 个 TopicBanner 跳转链接均可被搜索引擎抓取

### 7.6 可访问性

- [ ] 卡片整块 `<Link>`,键盘可达
- [ ] 链接有可见 focus ring
- [ ] 颜色对比 ≥ 4.5:1

---

## 8. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
| --- | --- | --- | --- |
| 2026-06-20 | v1 | **首次独立成文**。8 节完整规格;明确 4 大 TopicBanner 子区块规格表;锁定顺序约定(xiaomi → wenjie → zeekr → flooring);引入字面量类型约束(MinProducts=6, GroupCount=2, TopicBannerCount=4) | Coya |
| (历史) | v0(隐式) | 代码 `src/app/product/page.tsx` 已稳定,无独立 PRD | — |

---

## 附录 A: 关联子 PRD

### A.1 6 大产品线(共享 `<ProductDetail>` 渲染)

- [./ELECTRIC_STEPS_PRD_2026-06-20.md](./ELECTRIC_STEPS_PRD_2026-06-20.md) — `/product/electric-steps`(轻改装备)
- [./WHEELS_PRD_2026-06-20.md](./WHEELS_PRD_2026-06-20.md) — `/product/wheels`(轻改装备)
- [./CHASSIS_PRD_2026-06-20.md](./CHASSIS_PRD_2026-06-20.md) — `/product/chassis`(轻改装备)
- [./COLOR_FILM_PRD_2026-06-20.md](./COLOR_FILM_PRD_2026-06-20.md) — `/product/color-film`(膜系,15 系列 + 6 热门)
- [./PPF_PRD_2026-06-20.md](./PPF_PRD_2026-06-20.md) — `/product/ppf`(膜系,8 系列 + 8 防护场景 + 8 性能等级)
- [../archive/WINDOW_FILM_PACKAGE_DETAIL_PRD_2026-06-14.md.archive](../archive/WINDOW_FILM_PACKAGE_DETAIL_PRD_2026-06-14.md.archive) — `/product/window-film`(膜系,v0 已归档,待 v1 升级)

### A.2 4 大主题专项(独立 5 组件模式)

- [./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) — `/product/zeekr` 🟢 v1(canonical)
- [../archive/WENJIE_MODIFICATION_TOPIC_PRD_2026-06-13.md.archive](../archive/WENJIE_MODIFICATION_TOPIC_PRD_2026-06-13.md.archive) — `/product/wenjie`(v0 归档)
- [../archive/XIAOMI_MODIFICATION_TOPIC_PRD_2026-06-12.md.archive](../archive/XIAOMI_MODIFICATION_TOPIC_PRD_2026-06-12.md.archive) — `/product/xiaomi`(v0 归档)
- [../archive/FLOORING_MODIFICATION_CATEGORY_PRD_2026-06-13.md.archive](../archive/FLOORING_MODIFICATION_CATEGORY_PRD_2026-06-13.md.archive) — `/product/flooring`(v0 归档)

> **待办**: wenjie / xiaomi / flooring 主题专项 v1 升级(参照 ZEEKR §8 规格 + 字面量类型 + 3 态 imageStatus + CI 脚本)。

## 附录 B: 相关文档

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.2
- [../../ARCHITECTURE.md](../../ARCHITECTURE.md)
- [../../CLAUDE.md](../../CLAUDE.md) — 数据访问约定
- [./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) — 主题专项 canonical 参考
- [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §11](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) — 性能基线
