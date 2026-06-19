# 底盘升级产品页 PRD (v1)

> 面向 Claude Code 架构师、coder、测试使用的执行规范文档。
> 本版本基于 [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.2 列出的 v0 状态条目升级为 v1。
> 覆盖路由:`/product/chassis`(底盘升级轻改装备详情页)

---

## 1. 概述

| 项目 | 内容 |
| --- | --- |
| 页面 | `/product/chassis` |
| 类型 | 产品详情(轻改装备方向之一) |
| 优先级 | P0 |
| Owner | 冯科雅 (Coya) |
| 版本 | v1 (2026-06-20) |
| 上一版本 | 无独立 PRD(数据定义在 `src/lib/products.ts` 中的 `slug: "chassis"` 条目,本次首次独立成文) |
| 主题色 | `blue`(轻改装备方向) |
| 数据来源 | 静态数据 `src/lib/products.ts` → `getProduct("chassis")` |
| 共享渲染 | `src/components/ProductDetail.tsx`(6 大产品线共用,通过 `product.slug` 分支渲染) |
| 上游 PRD | [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.2 |
| 关联 PRD | [PRODUCT_INDEX_PRD_2026-06-20.md](./PRODUCT_INDEX_PRD_2026-06-20.md) · [ELECTRIC_STEPS_PRD_2026-06-20.md](./ELECTRIC_STEPS_PRD_2026-06-20.md) · [WHEELS_PRD_2026-06-20.md](./WHEELS_PRD_2026-06-20.md) |

### 1.1 目标

为关注行驶质感、偶尔跑山/长途、希望降低车身高度但保留舒适性的车主呈现底盘升级产品页,明确其在「轻改装备」分组中的位置、数据契约、UI 规范与验收门禁;强调「日常驾驶可接受」边界,**不做极端赛事化升级**。

### 1.2 主题色

`blue`(blue-500 主 / blue-400 强调 / blue-950/40 卡片底)。`ProductDetail` 通过 `product.group === "light-mod"` 自动判断。

### 1.3 范围

- ✅ **包含**: 底盘升级详情页的元数据、Hero、tagline 横幅、4 个核心价值(姿态升级 / 支撑增强 / 日常可保留 / 规范施工)、4 步服务流程、面包屑;与 `/product` 入口的衔接;三视口响应式与 SEO metadata。
- ❌ **不包含**: 避震品牌 / 连杆型号 / 加强件 SKU / 调校方案 N 款式列表(当前为「装备分类」层级;若后续按车型扩展,需独立 PRD 走 wenjie/zeekr 5 组件模式);不在本页引入赛车级改装 / 拉力改装 / 越野重度改装方案。

---

## 2. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
| --- | --- | --- | --- |
| 行驶质感党车主 | 想改善过弯支撑与日常驾驶稳定 | 看到「支撑增强」+「姿态升级」,愿到店沟通 | P0 |
| 跑山 / 长途车主 | 关注高速稳定性 | 看到「姿态升级」+「规范施工」,信任方案 | P0 |
| 想降车身但怕损失舒适性的车主 | 担心升级后太颠 | 看到「日常可保留」,确认不极端 | P0 |
| 轻改爱好者 | 想横向对比 6 大产品方向 | 在 `/product` 看到「底盘升级」入口,跳转详情页 | P1 |
| 潜客 | 升级后是否影响质保不明 | 看到服务流程 4 步 + 到店沟通提示 | P1 |
| SEO/搜索引擎 | 想收录产品详情页 | 看到独立 `<title>` + `<meta description>` | P2 |

---

## 3. 功能清单

| # | 功能 | 优先级 | 状态 |
| --- | --- | --- | --- |
| F1 | Hero:面包屑(产品中心 → 底盘升级)+ 组别标签(轻改装备)+ H1 + heroDescription | P0 | ✅ |
| F2 | Tagline 横幅:渐变文字「更稳的姿态,更好的质感」 | P0 | ✅ |
| F3 | 核心价值区:4 张卡片(姿态升级 / 支撑增强 / 日常可保留 / 规范施工) | P0 | ✅ |
| F4 | 服务流程区:4 步流程(到店沟通 → 车型确认 → 方案推荐 → 施工交付) | P0 | ✅ |
| F5 | 三视口响应式(desktop 1440 / tablet 768 / mobile 390) | P0 | ✅ |
| F6 | SEO metadata:`title` + `description` | P0 | ✅ |
| F7 | 面包屑导航 | P0 | ✅ |
| F8 | Header / Footer 全站统一 | P0 | ✅ |
| F9 | 全站统一咨询入口 | P1 | ✅ |

> 本页**不包含**的功能:避震型号 / 连杆 SKU / 调校方案 / 赛车级改装方案。

---

## 4. UI / 交互

### 4.1 视觉规范

- **主色**: `blue-500` / `blue-400` / `blue-950/40`
- **背景**: `bg-zinc-950` + `bg-black border-y border-zinc-900` 交替
- **图片容器**: 本页**当前不渲染产品大图**(`productImageMap["chassis"]` 为空字符串)。若未来补图,统一 `aspect-[4/3] + object-contain + Next/Image sizes`
- **字体**: Geist Sans
- **圆角**: `rounded-2xl` / `rounded-xl`
- **间距**: `py-16` / `gap-4 md:gap-6`

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
- **CTA**:本页**不**含私有 CTA,统一由 `<Header>` 触发全站 WeChat modal

---

## 5. 数据模型

### 5.1 静态数据

```
src/lib/products.ts → getProduct("chassis")
```

**数据契约**:

```ts
{
  slug: "chassis",
  name: "底盘升级",
  group: "light-mod",
  groupLabel: "轻改装备",
  tagline: "更稳的姿态,更好的质感",
  cardDescription: "避震与加强件轻度升级,日常驾驶更舒适有质感。",
  heroDescription: "围绕避震、连杆、加强件等底盘部件的轻度升级,让车辆在日常驾驶中更稳、更有质感。",
  audience: [
    "关注行驶质感的车主",
    "偶尔跑山/长途的车主",
    "希望降低车身高度但保留舒适性的车主",
  ],
  values: [
    { title: "姿态升级", description: "在合理范围内降低车身高度,提升视觉与高速稳定性。" },
    { title: "支撑增强", description: "通过避震与加强件提高过弯支撑。" },
    { title: "日常可保留", description: "升级方向以日常驾驶可接受为前提,不做极端赛事化。" },
    { title: "规范施工", description: "采用规范的四轮定位与扭矩流程完成安装。" },
  ],
  process: PROCESS_TEMPLATE,
}
```

### 5.2 字面量类型约束(如适用)

不适用(本页无 N 款式列表)。

### 5.3 3 态 imageStatus(如适用)

不适用。

### 5.4 CI 验证脚本

不适用。

---

## 6. API 接口

| Method | 路径 | 用途 |
| --- | --- | --- |
| — | — | 此页面为**纯静态 SSG**,不调用任何 API |

---

## 7. 验收标准 (DoD)

### 7.1 功能

- [ ] `/product/chassis` 可访问,无 404
- [ ] Hero 显示 H1 `底盘升级` + 副文案「围绕避震、连杆、加强件等底盘部件的轻度升级…」
- [ ] Tagline 横幅显示渐变文字「更稳的姿态,更好的质感」
- [ ] 核心价值区展示 4 张卡片(姿态升级 / 支撑增强 / 日常可保留 / 规范施工)
- [ ] 服务流程区展示 4 步流程
- [ ] 面包屑可点击「产品中心」回退

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

- [ ] 文案不含「原厂 / 官方 / 授权 / 赛事级 / 拉力级」等未经确认或超出范围的措辞
- [ ] 文案与 `src/lib/products.ts` 中的 `chassis` 数据完全一致
- [ ] 不通过 JSX 硬编码卡片与流程,必须 `map` 渲染

### 7.5 SEO

- [ ] 独立 `<title>`: `底盘升级 | 蓝辉轻改 LANHUI`
- [ ] 独立 `<meta description>`: 「蓝辉轻改底盘升级服务,围绕避震、连杆、加强件等部件的轻度升级,让日常驾驶更稳、更有质感。」
- [ ] `/product` 入口可点击跳转到本页

### 7.6 可访问性

- [ ] 语义化 HTML 正确
- [ ] 颜色对比 ≥ 4.5:1
- [ ] 键盘可达

---

## 8. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
| --- | --- | --- | --- |
| 2026-06-20 | v1 | **首次独立成文**。8 节完整规格;明确「日常驾驶可接受」边界,排除赛车级 / 拉力级改装范围 | Coya |
| (历史) | v0(隐式) | 数据在 `src/lib/products.ts` 中定义,无独立 PRD | — |

---

## 附录 A: 与其他产品页 PRD 的关系

- **同组(轻改装备)**:`/product/electric-steps` / `/product/wheels` 共享 `ProductDetail` 渲染器与蓝色主题。
- **膜系方向**:`/product/window-film` / `/product/color-film` / `/product/ppf` 走 `orange` 主题。
- **主题专项**:`/product/zeekr` / `/product/wenjie` / `/product/xiaomi` / `/product/flooring` 走**独立 5 组件模式**。

## 附录 B: 相关文档

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.2
- [../../ARCHITECTURE.md](../../ARCHITECTURE.md)
- [../../CLAUDE.md](../../CLAUDE.md) — 数据访问约定
- [./PRODUCT_INDEX_PRD_2026-06-20.md](./PRODUCT_INDEX_PRD_2026-06-20.md) — 产品中心入口
- [./ELECTRIC_STEPS_PRD_2026-06-20.md](./ELECTRIC_STEPS_PRD_2026-06-20.md) — 同组参考实现
- [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §11](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) — 性能基线
