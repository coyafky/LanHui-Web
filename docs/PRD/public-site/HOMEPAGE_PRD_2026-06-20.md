# HOMEPAGE_PRD_2026-06-20.md — 首页 `/` 完整规格

> 蓝辉轻改 LANHUI 公开站首页 v1 规格文档。在 v0 `HOMEPAGE_PHONE_CONVERSION_PRD_2026-06-12.md` 之上升级为完整 8 节 PRD,覆盖 Hero、为什么选我们、核心服务、产品入口、Footer 等全部公开模块,统一数据源、降级策略、SEO 与可访问性。

---

## 1. 概述

**页面**: `/`(根路由)
**类型**: 公开站(SSG, RSC)
**优先级**: P0
**Owner**: 冯科雅(Coya)
**版本**: v1
**最后更新**: 2026-06-20

### 1.1 目标

1. 用 5 个区块在首屏内完成"品牌曝光 → 信任建立 → 服务矩阵 → 产品入口 → 转化路径"的完整漏斗。
2. 在 8 秒内让潜客理解"蓝辉轻改是做什么的、为什么值得信任、怎么联系"。
3. 沉淀可被审计脚本验证的统一数据源、品牌总机号、咨询 CTA、埋点事件。

### 1.2 范围

- ✅ 包含: Header(共享) + Hero + WhyChooseUs + CoreServices + ProductsQuickEntry + Footer(共享)
- ✅ 包含: 品牌总机电话咨询转化闭环(沿用 v0 §6-7)
- ✅ 包含: 完整 SEO / a11y / 性能 / 埋点验收
- ❌ 不包含: 产品详情子页(归各产品 PRD)
- ❌ 不包含: 微信小程序 / 商城 / 支付 / 客户案例库(Q4 路线图)

---

## 2. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|
| 车主 / 潜客 | 进站 5 秒想知道这是不是我要找的店 | 看到品牌名、定位、核心服务清单 | P0 |
| 车主 / 潜客 | 想立即联系 | 看到清晰的电话咨询 CTA + 微信咨询入口 | P0 |
| 车主 / 潜客 | 想看产品 | 看到 6 大产品入口卡片 | P0 |
| 轻改爱好者 | 想了解为什么选蓝辉 | 看到差异化卖点(源头工厂、专业施工等) | P0 |
| 远端用户 | 想看本地有没有店 | 看到"查看门店" CTA 跳转 `/agent` | P1 |
| 搜索引擎 | 抓取首页 | 独立 title / description / JSON-LD Organization | P0 |

---

## 3. 功能清单

| # | 功能 | 优先级 | 状态 |
|---|---|---|---|
| F1 | Header 共享(5 入口 + CTA) | P0 | ✅(共享 `Header.tsx`) |
| F2 | Hero 区(品牌名 + slogan + 双 CTA) | P0 | ✅(`Hero.tsx`) |
| F3 | 品牌总机电话咨询主 CTA(`openWeChatModal`) | P0 | ✅(v0 闭环) |
| F4 | 次 CTA → `/product` 产品中心 | P0 | ✅ |
| F5 | WhyChooseUs(差异化卖点 3-4 列) | P0 | ✅ |
| F6 | CoreServices(6 大服务矩阵) | P0 | ✅ |
| F7 | ProductsQuickEntry(6 大产品入口卡片) | P0 | ✅ |
| F8 | Footer 共享(Logo + 链接 + 备案占位) | P0 | ✅ |
| F9 | 滚动 Header 缩放(h-20 → h-16) | P1 | ✅ |
| F10 | 移动端汉堡菜单 | P0 | ✅ |
| F11 | 埋点: `homepage_hero_view` / `homepage_phone_click` | P0 | ✅ |
| F12 | 品牌总机号缺失时降级为"电话咨询即将开放" | P0 | ✅(v0 §5.3) |
| F13 | Hero LCP 优化(首屏图 priority) | P1 | ⚪ 待优化(P2-Hero-LCP) |
| F14 | 首页 OG 图 + JSON-LD Organization + WebSite | P1 | ⚪ 待补 |

---

## 4. UI / 交互

### 4.1 视觉规范

- **背景**: `bg-zinc-950`(纯黑底)+ `from-blue-950/40` 渐变
- **文字**: 主文 `text-white` / `text-zinc-300` / `text-zinc-400`
- **品牌色**: 主橙 `orange-500/400` + 科技蓝 `blue-700/600/500/400`
- **强调**: Hero 中 `from-blue-600 to-blue-700` 主 CTA / `from-orange-500 to-amber-500` 查看门店
- **字体**: Geist Sans(主)、系统默认中文
- **圆角**: 卡片 `rounded-2xl`,按钮 `rounded-lg / rounded-full`,徽标 `rounded-md / rounded-full`
- **阴影**: 主 CTA 加 `shadow-lg shadow-blue-900/30`;门店 CTA 加 `shadow-orange-500/25`

### 4.2 组件清单

| 组件 | 路径 | 类型 | 说明 |
|---|---|---|---|
| `Header` | `src/components/Header.tsx` | CC | 5 入口 + 联系我们 + 查看门店 + 汉堡菜单 |
| `Hero` | `src/components/Hero.tsx` | CC | 首屏,主 CTA → WeChat modal,次 CTA → /product |
| `WhyChooseUs` | `src/components/WhyChooseUs.tsx` | RSC | 差异化卖点区(工厂 / 售后 / 专业 / 适配) |
| `CoreServices` | `src/components/CoreServices.tsx` | RSC | 6 大服务矩阵(轻改 3 + 膜系 3) |
| `ProductsQuickEntry` | `src/components/ProductsQuickEntry.tsx` | RSC | 6 张产品入口卡片(链接到 `/product/<slug>`) |
| `Footer` | `src/components/Footer.tsx` | RSC | Logo + 链接组 + ICP / 公安备案占位 |
| `WeChatConsultModal` | `src/components/shared/WeChatConsultModal.tsx` | CC | 全局 WeChat 弹窗(被 Hero/Header 触发) |

### 4.3 区块级 RSC 边界

| 区块 | 渲染方式 | 触发客户端的 hook |
|---|---|---|
| Header | Client(交互:下拉、汉堡、滚动) | `useState` / `usePathname` / `useEffect` |
| Hero | Client(主 CTA 调用 `openWeChatModal`) | `openWeChatModal()` |
| WhyChooseUs | RSC | — |
| CoreServices | RSC | — |
| ProductsQuickEntry | RSC | — |
| Footer | RSC | — |

> Hero 标了 `'use memo'` 提示,实际 `'use client'`(2026-06-14 改版后)。在 v1 中保留此模式,但需注意:若后续引入 `useState`/`useEffect`,必须保持最小客户端范围。

### 4.4 三视口响应式

| 视口 | 行为 |
|---|---|
| Desktop 1440 | Hero 左文右空(无装饰图,纯渐变 + 模糊光斑);WhyChooseUs 3-4 列;CoreServices 3 列;ProductsQuickEntry 3 列 |
| Tablet 768 | Hero 文本最大宽度 2xl;WhyChooseUs 2 列;CoreServices 2 列;ProductsQuickEntry 2 列 |
| Mobile 390 | Hero 全宽,CTA 堆叠(默认 sm:flex-row);WhyChooseUs / CoreServices / ProductsQuickEntry 全单列;Header 变汉堡菜单 |

### 4.5 关键交互

- **品牌总机电话 CTA**: 点击后 `openWeChatModal()` 弹起 WeChat 二维码 modal(等同 v0 行为);不直接 `tel:` 跳转。**v0 §6.3 要求 tel: 跳转,但当前实现走 WeChat modal**;v1 在此 PRD 确认当前优先级:WeChat modal(因为尚无可公开拨打的品牌总机号)。
- **次 CTA "查看产品中心"**: 跳转 `/product`
- **Header "查看门店"**: 跳转 `/agent/store/shunde-daliang`(硬编码顺德大良店)
- **Header "联系我们"**: 调 `openWeChatModal()`
- **滚动缩放**: Header h-20 → h-16,Logo h-10 → h-8

### 4.6 可访问性

- 语义化 HTML: `<header>` / `<main>` / `<section>` / `<footer>`
- 颜色对比度: `text-white` vs `bg-zinc-950` ≥ 15:1;`text-zinc-300` ≥ 10:1;`text-zinc-400` ≥ 7:1
- 所有图标按钮有 `aria-label`(汉堡、联系我们、查看门店)
- CTA 焦点环 visible(`focus-visible:ring-2`)
- 不依赖颜色单一传达信息(品牌主色仅装饰,主 CTA 文案独立可读)
- 跳过链接 `<a href="#main" class="sr-only focus:not-sr-only">跳到主要内容</a>`(v1 待补,优先级 P1)

---

## 5. 数据模型

### 5.1 静态数据

| 数据 | 路径 | 用途 |
|---|---|---|
| 品牌名 / slogan / 城市 | `src/lib/brand.ts` | `brand.zh` / `brand.en` / `brand.slogan` / `brand.city` |
| 6 大产品 | `src/lib/products.ts` | `products[]`,每个含 `slug` / `name` / `description` |
| Footer 链接 / 备案 | `src/lib/brand.ts` 内部或单独 `src/lib/footer.ts` | 占位 |
| WhyChooseUs 文案 | `src/components/WhyChooseUs.tsx` 内联 | 工厂 / 专业 / 售后 / 适配 |
| CoreServices 文案 | `src/components/CoreServices.tsx` 内联 | 6 大服务矩阵 |

### 5.2 动态数据(本页面无动态数据源)

无。本页面全部由静态文件 + props 渲染,无 API 调用。

### 5.3 SSR / ISR 配置

- `src/app/page.tsx` 默认 SSG(`force-static`),`npm run build` 无 DB 也通过
- 不设 `revalidate`(首页为高频访问,SSG 重建由部署触发)

### 5.4 关键品牌数据(沿用 v0)

```ts
// src/lib/brand.ts
export const brand = {
  zh: "蓝辉轻改",
  en: "LANHUI",
  slogan: "让爱车更有型,也好用。",
  foundedYear: 2026,
  currentStore: "顺德大良店",
  city: "广东佛山 · 顺德大良",
  phone: "联系方式待补充",       // 展示值
  phoneTel: "#contact",          // tel: 链接(降级占位)
  icp: "ICP备案号待备案",
  police: "公安备案号待备案",
  address: "广东省佛山市顺德区大良(详细地址待补充)",
  businessHours: "营业时间待确认",
  email: "lanhui@example.com",
  shortDescription: "蓝辉轻改是面向汽车轻改装与汽车膜服务的品牌...",
} as const;
```

> v1 在 `brand.ts` 增加 `brand.mainPhone` / `brand.mainPhoneTel` 字段(语义化命名),新代码统一读这两个字段;`phone` / `phoneTel` 保留作为兼容老调用方(HomePage、ContactPage、Footer)的 deprecated 别名,后续逐步迁移。

---

## 6. API 接口

本页面无 API 调用。下游分析埋点事件如下。

### 6.1 客户端埋点

| 事件 | 触发时机 | 元数据 | 后端 |
|---|---|---|---|
| `homepage_hero_view` | Hero 进入视口(IntersectionObserver 阈值 0.5) | `pathname` | `POST /api/analytics/track` |
| `homepage_phone_click` | 主 CTA 点击 | `target: 'hero_primary_cta'` / `phoneType: 'wechat_modal'` / `pathname` | 同上 |
| `homepage_product_click` | ProductsQuickEntry 卡片点击 | `target: 'product_entry'` / `productSlug` | 同上 |

> 事件类型白名单见 `src/lib/analytics.ts` 与 `/api/analytics/track` 服务端校验。
> 不采集任何 PII(用户手机号 / 车牌 / 姓名)。

### 6.2 下游共享 API(被 Header / Footer / WeChat 弹窗使用)

- `POST /api/analytics/track` — 公开,限流 60/min/IP
- 详见 [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §P1-12](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) 关于点击埋点自动化的 B7 任务

---

## 7. 验收标准(DoD)

### 7.1 功能

- [ ] Hero 首屏在 1440 视口内可见主 CTA(WeChat modal)与次 CTA(查看产品中心)
- [ ] 移动端 390 视口主 CTA 触控高度 ≥ 44px,文字不溢出
- [ ] WeChat modal 点击关闭、ESC 关闭、点遮罩关闭均正常
- [ ] 滚动 Header 缩放自然,Logo 不变形
- [ ] Header 汉堡菜单移动端可正常展开/关闭
- [ ] WhyChooseUs / CoreServices / ProductsQuickEntry 区块在 desktop / tablet / mobile 三视口均完整渲染
- [ ] Footer Logo / 链接 / 备案占位文本正确显示

### 7.2 v0 闭环(电话咨询转化)

- [ ] 主 CTA 文案明确表达"添加企业微信"或"电话咨询"动作(当前为"添加企业微信咨询车型方案")
- [ ] `phone` / `phoneTel` 字段从 `src/lib/brand.ts` 读取,Hero 中无硬编码
- [ ] `brand.phone` 为占位"联系方式待补充"时,主 CTA 走 WeChat modal,**不展示假号码**
- [ ] 品牌总机号补齐后,Hero 优先展示主 CTA 拨打按钮(在 v1.1 改造)

### 7.3 性能

- [ ] Lighthouse desktop perf ≥ 90 / mobile perf ≥ 80(当前 mobile 69 需优化,见 P2-Hero-LCP)
- [ ] LCP < 2.5s(desktop)/ < 4s(mobile)
- [ ] CLS < 0.1(当前 = 0)
- [ ] TBT < 200ms(当前 ~290ms,待优化)
- [ ] Hero 首屏图加 `next/image priority`(P2-Hero-LCP)
- [ ] 字体使用 `next/font` + `font-display: swap`

### 7.4 质量门

- [ ] `npx tsc --noEmit` 通过(允许 9 个 pre-existing 错)
- [ ] `npm run build` 通过
- [ ] `npm run lint` 通过(过滤掉 `.claude/worktrees/*` 和 `.claude/plugins/*` 误命中)
- [ ] Playwright e2e:`/` 在 3 视口下截图 + h1 + title 校验通过
- [ ] 关键路径 e2e:点 Hero CTA → WeChat modal 弹起;点 modal 关闭 → 复原

### 7.5 SEO

- [ ] `<title>` = `蓝辉轻改 LANHUI · 汽车轻改装一站式升级`(≤ 60 字符)
- [ ] `<meta name="description">` 描述品牌定位 + 6 大服务(≤ 160 字符)
- [ ] canonical URL = `https://lanhui.com/`
- [ ] JSON-LD Organization(品牌名 / logo / 联系方式 / 社交链接)
- [ ] JSON-LD WebSite(含 `SearchAction`,即便无搜索框也提供占位)
- [ ] OG 图 1200×630(`public/og/home.png` 待补)
- [ ] `src/lib/schema.ts` 中 `organization.logo` 指向 `public/images/logo/lanhui-logo-light.png`

### 7.6 可访问性

- [ ] 语义化 HTML 通过
- [ ] 颜色对比度 ≥ 4.5:1(Lighthouse a11y ≥ 95)
- [ ] 键盘 Tab 顺序:Logo → 5 主导航 → 联系我们 → 查看门店 → 汉堡(移动) → Hero CTA → 区块内容 → Footer
- [ ] 焦点环 visible
- [ ] 屏幕阅读器朗读品牌名 + slogan + CTA 完整意图
- [ ] 跳过链接"跳到主要内容"(v1 待补)

### 7.7 回归

- [ ] `/product` 入口仍可访问
- [ ] `/agent` 入口仍可访问
- [ ] Header / Footer 不错位
- [ ] WeChat modal 全站唯一实例(被多组件触发不冲突)
- [ ] 移动端汉堡菜单点链接后自动关闭

---

## 8. 变更记录(CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-12 | v0 | 初稿:首页电话咨询转化闭环(15 节,12 改造点) | Coya |
| 2026-06-20 | v1 | 升级为完整 8 节规格,合并 WhyChooseUs / CoreServices / ProductsQuickEntry,统一 brand 数据源,新增埋点 / a11y / SEO / DoD;v0 文档 archive | Coya |

---

## 附录 A: 相关文档

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §4.1 路由总览
- [../../ARCHITECTURE.md](../../ARCHITECTURE.md) — 公开站 + CMS 架构
- [../../database/SCHEMA.md](../../database/SCHEMA.md) — Store / Article 模型
- [../archive/HOMEPAGE_PHONE_CONVERSION_PRD_2026-06-12.md.archive](../archive/HOMEPAGE_PHONE_CONVERSION_PRD_2026-06-12.md.archive) — v0 历史
- [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) §P2-Hero-LCP §P1-12
- [../feature/ANALYTICS_TRACKING_PRD_2026-06-20.md](../feature/ANALYTICS_TRACKING_PRD_2026-06-20.md) — 埋点系统
- [../feature/SEO_SCHEMA_PRD_2026-06-20.md](../feature/SEO_SCHEMA_PRD_2026-06-20.md) — SEO / JSON-LD

## 附录 B: 截图占位

实施完成后归档至 `docs/audits/screenshots/{desktop,tablet,mobile}/home.png`。
