# SPEC: 首页 Homepage

> 对应 PRD：`docs/PRD/public-site/HOMEPAGE_PRD.md`
> 实现状态：🔧 **部分完成**

---

## 1. 职责范围

网站入口页面。负责品牌第一印象、核心价值传达、产品快速入口、CTA 转化（微信咨询引导）。

## 2. 路由

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/` | page (RSC) | 首页 Home | ✅ |

## 3. 功能清单

| ID | 功能 | 状态 | 说明 |
|----|------|------|------|
| F1 | Hero 主视觉区 | ✅ | 渐变背景 + 微信弹窗 CTA |
| F2 | 为什么选我们 | ✅ | 3 特性卡片：专业工艺、优质材料、官方质保 |
| F3 | 核心服务 | ✅ | 3 可点击卡片：轻改方案、车身膜、品质质保 |
| F4 | 产品快速入口 | ✅ | 6 产品分类网格入口 |
| F5 | Header | ✅ | 粘性导航、滚动收缩、移动端滑面板 |
| F6 | Footer | ✅ | 品牌列+导航+产品+联系+ICP |
| F7 | 微信咨询弹窗 | ✅ | 全屏叠加，emitter 驱动 |
| F8 | 电话降级策略 | ✅ | 门店电话→品牌总机→400 |
| F9 | 车型专题入口 | ⚪ | 待补（问界/小米/极氪等车型卡片） |
| F10 | 真实门店卡片展示 | ⚪ | 动态读取门店数据并展示 |
| F11 | 最新文章展示 | ⚪ | 从 CMS 读取最新文章列表 |
| F12 | 服务流程说明区 | ⚪ | 到店沟通→车型确认→方案推荐→施工交付 |
| F13 | 服务流程与售后承诺 | ⚪ | 施工标准化流程与质保承诺 |

## 4. SSR/ISR 配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 渲染策略 | SSG 优先 | 构建时生成静态 HTML |
| ISR revalidate | 3600 | 每小时触发一次重新验证 |
| `force-dynamic` | 否 | 首页不走动态渲染 |
| 数据获取 | 构建时读取静态数据 | 来自 `src/lib/brand.ts` 和 `src/lib/products.ts` |

## 5. JSON-LD

首页输出结构化数据，在 `<head>` 中注入 `<script type="application/ld+json">`：

- **Schema 类型**: `Organization`
- **必填字段**: `name`, `url`, `logo`, `description`
- **可选字段**: `address`, `contactPoint`, `sameAs`
- **数据源**: `src/lib/brand.ts`
- **实现方式**: RSC 中直接输出 JSON-LD script tag

## 6. 页面结构（从上到下）

| Section | 组件 | Client/RSC | 说明 |
|---------|------|-----------|------|
| 全局导航 | `<Header />` | Client | 粘性，滚动收缩，移动端滑面板 |
| 主视觉 | `<Hero />` | Client | 渐变背景，微信弹窗 CTA |
| 为什么选我们 | `<WhyChooseUs />` | RSC | 3 特性卡片：专业工艺、优质材料、官方质保 |
| 核心服务 | `<CoreServices />` | Client | 3 可点击卡片：轻改方案、车身膜、品质质保 |
| 产品快速入口 | `<ProductsQuickEntry />` | Client | 6 产品分类网格入口 |
| 页脚 | `<Footer />` | Client | 品牌列+导航+产品+联系+ICP |
| 微信弹窗 | `<WeChatConsultModal />` | Client | 全屏叠加，emitter 驱动，挂载在 layout.tsx |

> 电话降级策略：`<Hero />` 中的咨询电话按优先级降级——优先显示门店电话，门店电话不可用时回退品牌总机，均不可用时显示 400 占位。

## 7. 关键数据

- 品牌信息：`src/lib/brand.ts`
- 产品分类：`src/lib/products.ts`（6 categories）

## 8. 电话降级策略

首页涉及电话展示的位置（Hero CTA、Footer 联系方式）按以下优先级降级：

| 优先级 | 来源 | 示例 | 说明 |
|--------|------|------|------|
| P0 | 门店电话 | `brand.ts > phone` | 从品牌配置读取门店电话；待门店数据库启用后改从 DB 读取 |
| P1 | 品牌总机 | `brand.ts > phone`（硬编码回退） | 门店电话无数据时展示品牌总机 |
| P2 | 400 占位 | `"400-xxx-xxxx"` | 均不可用时展示 400 占位，提示"咨询请点击微信" |

现状：当前 `brand.ts` 中 `phone` 为占位值 `"联系方式待补充"`，所有电话展示位实际均处于 P2 降级状态。

## 9. 性能基线

| 指标 | 目标值 | 说明 |
|------|--------|------|
| LCP | < 2.5s (desktop) | 最大内容渲染时间 |
| CLS | = 0 | 累计布局偏移 |
| FCP | < 1.5s | 首次内容渲染 |
| TBT | < 200ms | 总阻塞时间 |
| 图片优化 | WebP + 声明宽高比 | 所有 <Image /> 组件设 `aspect-[4/3]` 或显式宽高 |

## 10. 验收条件

- [ ] F1-F8 所有功能正常渲染
- [ ] Hero CTA 打开微信弹窗
- [ ] 产品入口链接指向正确产品页
- [ ] 移动端响应式适配（320px / 768px / 1024px / 1440px）
- [ ] LCP desktop < 2.5s
- [ ] CLS = 0
- [ ] JSON-LD Organization schema 在首页 HTML 中可验证
- [ ] SSR/ISR 配置生效：构建产物为静态 HTML，revalidate 写入响应头
- [ ] 电话显示按降级策略正确回退

## 11. 已知问题

- [ ] **P1-5** LCP 6.5s：产品入口大图（`/product` 的 4 大主题图）未设 `priority`，导致首页 LCP 超标。修复：在 ProductsQuickEntry 中为主题入口图添加 `priority` 属性或 `fetchPriority="high"`。
- [ ] **P1** `brand.ts` 中 `phone` 为占位值，电话降级实际处于 P2 状态。修复：待门店数据库启用后从 DB 读取真实门店电话。

---

> 最后更新: 2026-06-22

## 12. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-14 | Claude Code | Hero 重写（渐变背景 + 微信 CTA） | 完成 | — |
| 2026-06-20 | Claude Code | Hero/WhyChooseUs/CoreServices/ProductsQuickEntry 实现 | 完成 | — |
| 2026-06-22 | Claude Code | Canonical PRD 合并 + SPEC 文档创建 | 完成 | — |
