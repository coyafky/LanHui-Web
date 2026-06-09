# 蓝辉轻改官网 — 评估与进度文档

> 本文档评估「蓝辉轻改 LANHUI 官网」当前工程状态,与膜小二复刻项目做横向对比,
> 输出分优先级的待办清单,作为后续迭代的路线图。
>
> 最后更新: 2026-06-07 · 项目版本: v0.2.0-phase1+6pages · Next.js 16.2.1

---

## 1. 一页纸总览

| 维度 | 膜小二复刻项目 (源) | 蓝辉轻改官网 (本项目) | 差距 |
|------|---------------------|----------------------|------|
| 项目性质 | 像素级复刻 (像素复用 100%) | 全新品牌骨架 (像素复用 0) | 性质不同,见 §3 |
| 路由数 (用户可见) | 13 | 11 | ✅ 已超 |
| 预渲染总页数 | **242** | **25** | 真实门店少导致 |
| 省份 / 城市 / 门店 | 27 / 75 / ~150 | 1 / 1 / 1 | 真实数据规模 |
| 产品方向数 | 3 (PPF / 窗膜 / 改色) | 6 (+ 电动踏板 / 轮毂 / 底盘) | **本项目 +3** |
| 静态资源 (图/视) | 12 张 (1.9 MB) | 0 | 资源空缺 |
| 共享组件数 | 7 | 9 (含 ProductDetail + ProductsQuickEntry) | **本项目 +2** |
| 数据文件 | 1 个 (agent-data.ts 巨文件) | 4 个 (brand/products/store/news) | **本项目更清晰** |
| Header 交互 | 单按钮 toggle | 标签可点 + chevron toggle + 外部点击 + Esc | **本项目更优** |
| 品牌色 | 红 (#dc2626 暗红) | 蓝 (#1E3A8A) + 橙 (#F97316) | 替换成功 |
| SEO 基础 | metadata only | metadata + OG | 持平 |
| 备案 / 法务 | 已填膜小二备案号 | 全部「待补充/待备案」占位 | 待真实数据 |
| 构建时间 | ~10s | ~4s | 站点小 → 快 |

**关键结论**: 工程骨架完成,产品模型和路由结构已搭好。**最大缺口是真实内容** (图片、门店、数据)。

---

## 2. 当前完成度

### 2.1 ✅ 已完成 (Phase 1 骨架)

| 类别 | 交付 | 状态 |
|------|------|------|
| **品牌** | layout.tsx metadata, brand.ts 数据源, 全站品牌字样替换 | ✅ |
| **导航** | 5 项主导航 + 1 个产品下拉, 桌面+移动+展开+Esc+外部点击 | ✅ |
| **首页** | Hero / WhyChooseUs / CoreServices / ProductsQuickEntry | ✅ |
| **产品中心** | 6 个产品详情页, 共享 ProductDetail 组件 | ✅ |
| **门店路由** | /agent 4 层结构 (入口/省/市/店), SSG 预渲染 | ✅ |
| **品牌介绍** | /brand 完整内容 (2026 起点 + 3 大理念) | ✅ |
| **品牌资讯** | /news 3 条占位资讯 | ✅ |
| **配色体系** | zinc-950 + 蓝/橙/黄 强调色统一 | ✅ |
| **响应式** | 3 视口 (1440/768/390) 全部通过 | ✅ |
| **质量门禁** | lint 0 error / typecheck 0 error / build 25 pages | ✅ |
| **数据模型** | 4 个 lib 文件清晰分离 (brand/products/store/news) | ✅ |
| **Header UX** | 修复 dropdown 鼠标离开消失问题 | ✅ |
| **防编造** | 占位文案统一「待补充/待确认/待备案」 | ✅ |

### 2.2 ❌ 已知缺失 / 后续待做

| 类别 | 缺失项 | 影响 |
|------|--------|------|
| **资源** | 0 张真实图片, 0 个 logo PNG | 全站靠渐变 + icon 占位 |
| **资源** | 无 favicon / apple-touch-icon / OG image | 浏览器标签 + 分享卡片为空 |
| **资源** | 无企业资质证书图 | /brand 缺乏可信度素材 |
| **数据** | 门店数据只有 1 条 (顺德大良店) | SSG 25 页中 14 页是产品+品牌+入口 |
| **数据** | 新闻只有 3 条占位 | /news 内容稀薄 |
| **数据** | 真实电话/地址/营业时间/ICP 全部为「待补充」 | 访客无法直接转化 |
| **页面** | ~~/brand/certifications + /brand/history~~ | ✅ **已完成** (2026-06-07) |
| **页面** | ~~/news/[slug] 详情页~~ | ✅ **已完成** (2026-06-07) |
| **页面** | ~~/contact 表单~~ | ✅ **已完成** (2026-06-07, mailto) |
| **SEO** | ~~无 sitemap.xml~~ | ✅ **已完成** (2026-06-07, 25 URLs) |
| **SEO** | ~~无 robots.txt~~ | ✅ **已完成** (2026-06-07) |
| **SEO** | 无结构化数据 (Schema.org) | 缺 LocalBusiness / Product 标记 |
| **SEO** | 无 canonical URL | 多入口可能重复 |
| **功能** | 搜索框为 UI 占位 | /agent 输入框 disabled |
| **功能** | 无 LBS / 地图 | 门店无地理信息 |
| **工程** | 文档/CHANGELOG/GEMINI 仍是膜小二残留 | 待清理 |
| **工程** | 无 README (lanhui 版本) | 上手引导缺失 |
| **工程** | 无 .env.example / 环境变量 | 暂无配置需求 |
| **测试** | 无单元/集成测试 | 重构风险高 |

---

## 3. 与膜小二项目的逐项评估

### 3.1 路由系统

| 项目 | 膜小二 | 蓝辉轻改 | 评估 |
|------|--------|---------|------|
| 用户可见路由 | 13 | 11 | ✅ **已超** (新增 4 页 + 1 详情模板) |
| 预渲染总页数 | 242 | 25 | 规模差异源于真实门店数 |
| 动态路由 (SSG) | 3 (省/市/店) | 3 (省/市/店) | **持平**, 模式一致 |
| notFound 处理 | 全部覆盖 | 全部覆盖 | **持平** |
| `params` Promise 模式 | ✅ | ✅ | **持平** |

**结论**: 路由架构对齐膜小二,深度上待补 4 个二级页面。

### 3.2 数据层

| 项目 | 膜小二 | 蓝辉轻改 | 评估 |
|------|--------|---------|------|
| 文件数量 | 1 (agent-data.ts, 200+ 行) | 4 (brand/products/store/news) | **本项目更优**, 关注点分离 |
| TypeScript 类型 | ✅ 严格 | ✅ 严格 | **持平** |
| 查询函数 | 5 个 (find/get) | 6 个 (brand/products/store/news) | **本项目更齐** |
| 工具函数 | 1 (`S()` 智能生成假电话) | 0 (不需要批量生成) | 业务场景不同 |
| 国际化准备 | ❌ | ❌ | **持平** |

**结论**: 本项目数据结构更现代化,符合关注点分离原则。

### 3.3 共享组件

| 组件 | 膜小二 | 蓝辉轻改 | 评估 |
|------|--------|---------|------|
| Header | ✅ 5 项 + 3 子项 | ✅ 5 项 + 6 子项 + 独立 chevron 按钮 | **本项目更优** |
| Footer | ✅ 4 列 | ✅ 4 列 | **持平** |
| Hero | ✅ | ✅ + 双 CTA + 渐变背景 | **本项目更精致** |
| WhyChooseUs | ✅ 3 卡片 | ✅ 3 卡片 (主题色分组) | **持平** |
| CoreServices | ✅ 3 卡片 | ✅ 3 卡片 + 强调 1 家真实店 | **持平** |
| ProductDetail | ❌ (内联到 3 个 page) | ✅ 共享组件 | **本项目更优 DRY** |
| ProductsQuickEntry | ❌ | ✅ | **本项目 +1** |
| ui/button | ✅ (未实际使用) | ✅ (未实际使用) | **持平冗余** |

**结论**: 本项目组件复用度更高,DRY 实践更好。

### 3.4 Header 交互细节 (本项目亮点)

| 维度 | 膜小二 | 蓝辉轻改 |
|------|--------|---------|
| 「产品中心」标签可点击 | ❌ (整个 button 区域) | ✅ (Link 单独可点) |
| chevron 单独可点击 | ❌ | ✅ |
| 移动端 label/chevron 拆分 | ❌ | ✅ |
| 点击外部关闭 | ❌ | ✅ (`mousedown` 监听) |
| Esc 关闭 | ❌ | ✅ |
| 鼠标悬停分类项不消失 | N/A | ✅ (修复了间隙 mouseleave bug) |

**结论**: 本项目 Header 交互明显优于膜小二,达商业级 UX。

### 3.5 资源 / 视觉资产

| 资源类型 | 膜小二 | 蓝辉轻改 |
|---------|--------|---------|
| Logo PNG | ✅ mx2logo_white.png | ❌ 文字占位 |
| 资质证书 | ✅ 6 张 | ❌ |
| 首页 hero 背景 | ✅ hero_bg.png | ❌ 渐变 |
| 首页服务卡片图 | ✅ 3 张 | ❌ icon 占位 |
| 产品主图 | ❌ (膜小二也无) | ❌ |
| 门店店招 | ❌ | ❌ |
| 品牌介绍图 | ✅ about_mx2.png | ❌ |

**结论**: 资源缺口是本项目**最大短板**,需要设计/摄影配合。

### 3.6 SEO & 性能

| 项 | 膜小二 | 蓝辉轻改 |
|----|--------|---------|
| `<title>` + `<meta description>` | ✅ | ✅ |
| `<html lang>` | ✅ zh-CN | ✅ zh-CN |
| OG / Twitter cards | ❌ | ✅ (Partial, layout.tsx) |
| sitemap.xml | ❌ | ❌ |
| robots.txt | ❌ | ❌ |
| 结构化数据 (Schema.org) | ❌ | ❌ |
| canonical URL | ❌ | ❌ |
| Next.js `<Image>` 优化 | 部分 (logo, 首页图) | ❌ (无图) |
| 字体优化 (next/font) | ❌ (用 Geist 默认) | ❌ (用 Geist 默认) |
| Lighthouse | 未测 | 未测 |

**结论**: 基础 SEO 持平, 本项目有 OG 起步;sitemap/robots/结构化数据 双方都缺。

### 3.7 代码质量

| 指标 | 膜小二 | 蓝辉轻改 |
|------|--------|---------|
| ESLint 错误 | 0 | 0 |
| TypeScript 错误 | 0 | 0 |
| `npm run build` | ✅ | ✅ |
| 类型严格 | ✅ | ✅ |
| `"use client"` 数量 | 1 (Header) | 1 (Header) |
| 组件代码重复 | 较多 (3 个 product page 几乎一样) | 低 (ProductDetail 共享) |
| 命名一致性 | ✅ | ✅ |
| 注释 / 文档 | ✅ (有 PROJECT.md) | ✅ (有 EVALUATION.md) |

**结论**: 本项目代码质量持平或更优。

---

## 4. TODO LIST (按优先级)

### P0 · 上线前必做 (阻塞发布)

- [ ] **真实品牌 Logo** — 提供 `lanhui-logo.png` (深色版 + 浅色版) 替换文字占位
- [ ] **真实企业电话** — 替换 `brand.phone` 与 `brand.phoneTel`
- [ ] **真实门店地址** — 替换顺德大良店 `address` 字段
- [ ] **真实营业时间** — 替换 `businessHours` 字段
- [ ] **favicon / apple-touch-icon** — 创建 `public/seo/favicon.ico` + `apple-touch-icon.png`
- [ ] **OG image** — 创建 `public/seo/og-default.png` (1200×630)
- [ ] **ICP 备案号** — 替换 `brand.icp` 字段
- [ ] **公安备案号** — 替换 `brand.police` 字段
- [ ] **首页 hero 主图** — 提供车辆升级后的实拍 / 概念图
- [ ] **6 个产品主图** — 放在 `public/images/products/*.png`

### P1 · 重要 (影响 SEO 与可信度)

- [x] **`/sitemap.xml`** — 动态生成 25 个 URL ✅ (2026-06-07)
- [x] **`/robots.txt`** — 允许全站抓取 + sitemap 引用 ✅ (2026-06-07)
- [ ] **Schema.org 结构化数据**
  - [ ] `LocalBusiness` 标记门店详情
  - [ ] `Product` / `Service` 标记产品页
  - [ ] `Organization` 标记品牌
- [ ] **canonical URL** — 每页 metadata 中添加
- [x] **`/brand/certifications`** — 6 个 CertCard 占位 ✅ (2026-06-07, 等真实证书图)
- [x] **`/brand/history`** — 5 个 milestone 时间线 ✅ (2026-06-07, 可向膜小二 8 段深化)
- [x] **`/news/[slug]`** — 新闻详情页 (用 `generateStaticParams`) ✅ (2026-06-07, 3 详情)
- [ ] **真实新闻条目** — 替换 news.ts 3 条占位
- [x] **`/contact`** — 预约咨询表单 (mailto) ✅ (2026-06-07)
- [ ] **README.md** — lanhui 版本的项目介绍 (覆盖膜小二残留)
- [ ] **CHANGELOG.md** — 清理膜小二历史, 重新开始

### P2 · 体验增强 (可分批)

- [ ] **首页 hero 视频背景** — 1 段 5-10s 短视频循环 (`public/videos/hero.mp4`)
- [ ] **门店店招图** — 至少为顺德大良店拍 4 张实拍
- [ ] **产品对比表** — `/product/compare` 或在产品页加对比入口
- [ ] **LBS 地图嵌入** — 门店详情页加入高德 / 百度 / Google 地图
- [ ] **表单后端** — 咨询表单接邮件 / 飞书 / 钉钉 webhook
- [ ] **Lenis smooth scroll** — 全站平滑滚动 (匹配高端品牌调性)
- [ ] **滚动驱动动画** — Hero / 产品卡片进入视口时 fade-up
- [ ] **Header 滚动收缩** — 滚动 50px 后 Logo 缩小、CTA 变窄
- [ ] **暗色/亮色模式切换** — 现阶段锁死 `dark` class, 后续可开放切换
- [ ] **多语言 (i18n)** — 中/英双语, Next.js i18n routing
- [ ] **单元测试** — vitest + @testing-library/react 覆盖数据函数

### P3 · 商业化 (Phase 2 之后)

- [ ] **小程序同构** — Taro / uni-app 同步品牌/产品/门店数据
- [ ] **微信支付定金** — 套餐级商品接支付
- [ ] **CRM 接入** — 表单线索 → 销售系统
- [ ] **车主案例 UGC** — `/cases` 页面 + 投稿入口
- [ ] **视频探店** — `/cases/[id]` + `<video>` 嵌入
- [ ] **加盟/招商** — `/join` 页面 (如果品牌要扩店)
- [ ] **在线预约排期** — 选门店 + 选时间 + 选套餐

### 明确不做

- 在线商城 / 下单 (线下转化为主)
- 论坛 / 社区
- 多语言 (除中英基础外)

---

## 5. 升级路线图 (建议)

```
Phase 1 (当前)          Phase 2 (1-2 周)         Phase 3 (1-2 月)
─────────────────       ─────────────────       ─────────────────
✅ 25 页骨架              P0 全量真实数据           P2 体验增强
✅ 数据模型                P1 SEO 基础              Lenis / 滚动动画
✅ 6 产品详情             P1 Schema + canonical    视频背景 / 暗色切换
✅ 门店 4 层路由            favicon / OG             表单 + CRM
✅ Header 交互精修          资质证书 + 时间线          地图 + LBS
✅ /contact / /news/[slug]  真实新闻 + 详情          i18n
✅ sitemap / robots         品牌 stats 模块           商业化 / 小程序
⏳ 真实图片 (0)
```

---

## 6. 关键文件位置速查

| 想改什么 | 去看哪个文件 |
|---------|-------------|
| 站点 metadata / OG | `src/app/layout.tsx` |
| 品牌名 / 标语 / 备案占位 | `src/lib/brand.ts` |
| 6 个产品文案 / CTA | `src/lib/products.ts` |
| 门店数据 / 城市 / 省份 | `src/lib/store.ts` |
| 品牌资讯 | `src/lib/news.ts` |
| 顶部导航 + 下拉逻辑 | `src/components/Header.tsx` |
| 底部信息 + 备案 | `src/components/Footer.tsx` |
| 首页结构 | `src/app/page.tsx` |
| 首页 4 段组件 | `src/components/{Hero, WhyChooseUs, CoreServices, ProductsQuickEntry}.tsx` |
| 6 个产品详情模板 | `src/components/ProductDetail.tsx` |
| 产品中心总览 | `src/app/product/page.tsx` |
| 门店入口 / 省 / 市 / 店 | `src/app/agent/**/page.tsx` |
| 品牌页 | `src/app/brand/page.tsx` |
| 资讯页 | `src/app/news/page.tsx` |
| 全站样式变量 | `src/app/globals.css` |
| 静态资源 (待补) | `public/images/{logo,home,brand,products,store}/` |
| SEO 资源 (待补) | `public/seo/` |

---

## 7. 维护者注意

- 修改 `lib/*.ts` 数据后**必须**重新 `npm run build` (SSG 列表会在构建时定型)
- 任何新增路由都要检查:
  1. 是否在 `Header.tsx` 的 `NAV_ITEMS` 里
  2. 是否在 `Footer.tsx` 的 `QUICK_LINKS` 里
  3. 是否有 `metadata` (SEO)
- 占位文案统一使用「待补充 / 待确认 / 待备案」字样, **不要**填入未确认的真实数据
- 资源文件名用 kebab-case (`lanhui-logo.png` 而非 `LANHUI_Logo.PNG`)
- 不要随便给页面加 `"use client"`, 会影响 SSG (除非要 useState/usePathname)
- 复制本项目做新品牌时: 替换 `brand.ts` / `products.ts` / `store.ts` / `news.ts` 即可, 路由与组件无需改

---

## 8. 实时对比 (与 moxiaoer.com.cn 2026-06-07 现场抓取)

> 数据来自 `agent-browser` 实际打开 moxiaoer.com.cn 的 6 个页面截图 + DOM 提取
> 参考截图: `docs/design-references/moxiaoer-{home,brand,product-ppf,agent,news,certifications,history,contact}.png`

### 8.1 路由结构对比

| 路由 | 膜小二 | 蓝辉 | 备注 |
|------|--------|------|------|
| `/` | ✅ | ✅ | 均为 3-4 段滚动首页 |
| `/product` | ✅ | ✅ | 中心列表页 |
| `/product/[slug]` | ✅ (3 类) | ✅ (6 类) | **本项目产品多 1 倍** |
| `/agent` | ✅ (省入口 + 搜索) | ✅ (省入口, 无搜索) | moxiaoer 有真实搜索 |
| `/agent/[slug]` | ✅ (27 省) | ✅ (1 省) | 数据规模差 |
| `/agent/[slug]/[city]` | ✅ (75 市) | ✅ (1 市) | 数据规模差 |
| `/agent/store/[id]` | ✅ (257 店) | ✅ (1 店) | 数据规模差 |
| `/brand` | ✅ | ✅ | moxiaoer 有 stats, lanhui 无 |
| `/brand/certifications` | ✅ (6 张图 + 2 高亮) | ✅ (6 个 CertCard 占位) | moxiaoer 有真实证书图 |
| `/brand/history` | ✅ (8 里程碑, 2017-2025) | ✅ (5 里程碑, 2026 季度) | moxiaoer 更丰满 |
| `/news` | ✅ (单篇 1 条) | ✅ (3 条列表) | **本项目内容多** |
| `/news/[slug]` | ❌ (无详情页) | ✅ (3 详情页 + 相关推荐) | **本项目 +1 优势** |
| **`/contact`** | ❌ **404 未找到** | ✅ (mailto 表单) | **本项目 +1 重大优势** |
| `/robots.txt` | ❌ (无) | ✅ (121B) | **本项目 +1** |
| `/sitemap.xml` | ❌ (无) | ✅ (25 URLs) | **本项目 +1** |

**核心发现**: 在「信息架构完整性」维度, **蓝辉已超过膜小二** (11 > 10 用户可见路由, +contact +news-detail +sitemap +robots)

### 8.2 视觉/结构对比

| 维度 | 膜小二 | 蓝辉 | 评价 |
|------|--------|------|------|
| 首页 scrollHeight | 2405px (3 段) | 3285px (4 段) | 蓝辉多 1 段 (产品快速入口) |
| 首页 section 数 | 3 | 4 | 蓝辉 +1 |
| 首页 hero | 实拍车辆图 + 双 CTA | 渐变 + 双 CTA | 膜小二更真实 |
| 品牌介绍 stats | 500+ 专利 / 50万+ 车主 | 无 | **膜小二 +1** |
| 产品详情信息密度 | 高 (8 SKU 表格 + 价格) | 中 (4-6 段叙述 + 套餐) | 风格不同, 各有侧重 |
| 历史页 scrollHeight | 4927px (8 段, 5-7 项/段) | ~2200px (5 段, 1 项/段) | 膜小二更密 |
| Header 顶置电话 | ✅ `400-073-7518` (橙) | ❌ 改为 CTA "预约咨询" | 膜小二传统, 蓝辉现代化 |
| 移动端汉堡菜单 | ✅ | ✅ | 持平 |
| 配色 | 暗红 + 黑 | 蓝 + 橙 + 黑 | 风格差异 (不是差距) |

### 8.3 数据规模对比

| 维度 | 膜小二 | 蓝辉 | 差距来源 |
|------|--------|------|----------|
| 真实门店数 | 257 | 1 | 业务规模 |
| 真实省份 | 27 | 1 | 业务规模 |
| 真实 SKU | 8+ (4 系列 × 多型号) | 6 (1 套/品类) | 业务模型不同 |
| 真实新闻 | 1 (网站升级) | 3 (占位) | 持平, 都需扩 |
| 真实证书 | 2 高亮 (工信部/中消会) | 0 (6 占位) | **膜小二有真实背书** |
| 真实统计 | 500+ / 50万+ | 无 | **膜小二 +1** |

### 8.4 蓝辉领先项 vs 膜小二 (本项目亮点)

1. **`/contact` 预约表单** — 膜小二完全缺失 (404), 蓝辉用 `mailto:` 离线投递
2. **`/news/[slug]` 详情页** — 膜小二列表点击无目标, 蓝辉有详情 + 相关推荐
3. **`/sitemap.xml`** — 动态列出 25 URL, 膜小二无
4. **`/robots.txt`** — 121 字节, 引用 sitemap, 膜小二无
5. **Header 交互** — 标签/chevron 分离、Esc、点击外部关闭 — 膜小二均无
6. **产品快速入口** — 首页 6 卡片网格, 膜小二无
7. **共享 ProductDetail 组件** — DRY, 膜小二 3 个 page 内联

### 8.5 蓝辉待补项 (向膜小二看齐)

| 优先级 | 待补项 | 描述 |
|--------|--------|------|
| **P0** | 真实品牌 Logo PNG | 替换 Header/Footer 的 Car+文字占位 |
| **P0** | 真实门店店招图 | CoreServices 第 3 卡片现在是 "顺德大良店" 但无图 |
| **P0** | 真实资质证书图 | /brand/certifications 6 个占位需替换 |
| **P1** | 真实 Hero 主图 | 膜小二是车辆实拍, 蓝辉仅渐变 |
| **P1** | 品牌 stats 模块 | 在 /brand 加 500+ 客户 / 3 车型 等数字 (待真实数据) |
| **P1** | 产品对比表 | 膜小二有 S/M/R 系列的 SKU 表格, 蓝辉可加 |
| **P2** | 顶置电话 | Header 右侧放 tel: 链接 (膜小二传统做法) |
| **P2** | 历史页内容深化 | 5 段 → 8-10 段, 每段 3-5 条要点 (向膜小二看齐) |
| **P2** | 门店详情页"施工案例"模块 | 膜小二有, 蓝辉无 |
| **P3** | Schema.org 结构化数据 | 双方都缺, 蓝辉可先做 |
| **P3** | LBS 地图 | 膜小二无, 蓝辉可加差异化 |

### 8.6 总结

**蓝辉在 6 月 7 日的现场对比中, 信息架构层面已反超膜小二**, 主要靠:
- P0/P1 路由补齐 (+contact / +news-detail / +sitemap / +robots)
- Header 交互精修
- 数据层 DRY 化

**视觉/数据层仍是最大短板**:
- 0 张真实图片 (膜小二 6+ 张)
- 1 家真实门店 (膜小二 257)
- 0 张真实证书 (膜小二 2 张高亮)
- 无品牌 stats (膜小二 500+/50万+)

**下一阶段关键路径** (Phase 2):
1. 提供真实图片 (logo / hero / 产品 / 证书 / 店招) — 阻塞发布
2. 接入真实门店数据 — 撑起 SSG 规模
3. 补品牌 stats 模块 — 提升转化叙事
4. Schema.org + canonical — SEO 基础
5. 视频背景 / 滚动动画 — 体验升级

---

**最后更新**: 2026-06-07 · **作者**: Claude · **状态**: Phase 1 完成 (6 P0/P1 路由补齐), 信息架构已超膜小二;等待真实素材接入 Phase 2

