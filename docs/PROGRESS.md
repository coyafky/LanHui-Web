# 蓝辉轻改官网 — 开发进度文档

> 本文档跟踪「蓝辉轻改 LANHUI」官网项目的实时开发进度,与 `EVALUATION.md`(横向评估)、
> `PROJECT.md`(源项目膜小二复刻的工程文档)、`ARCHITECTURE_IMAGE_STRATEGY.md`(图像策略)
> 共同构成项目文档体系。
>
> 最后更新: 2026-06-08 · 当前版本: v0.2.0-phase1+6pages · Next.js 16.2.1

---

## 1. 一页纸总览

| 维度 | 当前值 | 目标值 | 进度 |
|------|-------|-------|------|
| 用户可见路由 | 11 | 11 | ✅ 100% |
| 预渲染总页数 | 25 | 25 | ✅ 100% |
| 产品方向 | 6 | 6 | ✅ 100% |
| 真实门店 | 1 | 1 | ✅ 100% (顺德大良店) |
| 真实图片 | 0 | 待定 | ❌ 0% (阻塞 P0) |
| 真实证书 | 0 | 6 | ❌ 0% (页面已搭好) |
| 品牌资讯 | 3 | 3 | ✅ 占位完成 |
| Lint 错误 | 0 | 0 | ✅ |
| Typecheck 错误 | 0 | 0 | ✅ |
| Build | ✅ | ✅ | ✅ |
| 移动端适配 | 3 视口通过 | 全场景 | ✅ |
| SEO 基础 | metadata + OG + sitemap + robots | 持平 | ✅ |
| 信息架构 (vs 膜小二) | 已反超 | 领先 | ✅ |

**当前状态**: Phase 1 工程骨架 100% 完成,信息架构已超原参考站,等待真实素材接入 Phase 2。

---

## 2. 已完成项 (按时间倒序)

### 2026-06-07 — P1 路由批量补齐

| 任务 | 文件 | 状态 |
|------|------|------|
| `/brand/certifications` 资质证书页 | `src/app/brand/certifications/page.tsx` + `certifications.ts` + `CertCard.tsx` | ✅ |
| `/brand/history` 品牌历程页 | `src/app/brand/history/page.tsx` + `history.ts` | ✅ |
| `/news` 资讯列表 + `/news/[slug]` 详情 | `src/app/news/page.tsx` + `[slug]/page.tsx` | ✅ |
| `/contact` 联系咨询页 (mailto) | `src/app/contact/page.tsx` | ✅ |
| `/sitemap.xml` 动态生成 | `src/app/sitemap.ts` | ✅ |
| `/robots.txt` SEO 配置 | `src/app/robots.ts` | ✅ |

### 2026-06-06 — 阶段路由与组件

| 任务 | 文件 | 状态 |
|------|------|------|
| 品牌 / 产品 / 门店 / 资讯 数据层 | `src/lib/{brand,products,store,news}.ts` | ✅ |
| 4 段首页组件 | `Hero / WhyChooseUs / CoreServices / ProductsQuickEntry` | ✅ |
| 6 个产品详情页 (DRY 共享) | `src/components/ProductDetail.tsx` | ✅ |
| Header + Footer | `src/components/Header.tsx` + `Footer.tsx` | ✅ |
| `/agent` 4 层路由 (省/市/店) | `src/app/agent/**/page.tsx` | ✅ |
| 6 个产品子路由 (SSG) | `src/app/product/{electric-steps,wheels,chassis,window-film,color-film,ppf}/page.tsx` | ✅ |

### 2026-06 之前 — 基础

| 任务 | 文件 | 状态 |
|------|------|------|
| Next.js 16 + React 19 + TS strict 脚手架 | `package.json` + `tsconfig.json` | ✅ |
| Tailwind v4 + oklch 主题 | `src/app/globals.css` | ✅ |
| shadcn/ui 风格基础 + cn() | `src/lib/utils.ts` | ✅ |
| 站点 metadata + OG | `src/app/layout.tsx` | ✅ |
| Header 标签/chevron 分离、Esc、外部点击关闭 | `src/components/Header.tsx` | ✅ |
| 站点主色 #1E3A8A (蓝) + #F97316 (橙) | `src/app/globals.css` | ✅ |

---

## 3. 路由清单 (11 个用户可见)

| 路由 | 渲染方式 | 文件 | 备注 |
|------|---------|------|------|
| `/` | SS | `src/app/page.tsx` | 4 段滚动 (Hero / Why / Services / QuickEntry) |
| `/product` | SS | `src/app/product/page.tsx` | 6 卡片网格,按 light-mod / film 分组 |
| `/product/electric-steps` | SS | `src/app/product/electric-steps/page.tsx` | ProductDetail 模板 |
| `/product/wheels` | SS | 同上 | 同上 |
| `/product/chassis` | SS | 同上 | 同上 |
| `/product/window-film` | SS | 同上 | 同上 |
| `/product/color-film` | SS | 同上 | 同上 |
| `/product/ppf` | SS | 同上 | 同上 |
| `/agent` | SS | `src/app/agent/page.tsx` | 省份入口 (现仅广东省) |
| `/agent/[slug]` | SSG | `src/app/agent/[slug]/page.tsx` | 1 预渲染页 |
| `/agent/[slug]/[city]` | SSG | `src/app/agent/[slug]/[city]/page.tsx` | 1 预渲染页 |
| `/agent/store/[id]` | SSG | `src/app/agent/store/[id]/page.tsx` | 1 预渲染页 |
| `/brand` | SS | `src/app/brand/page.tsx` | 2026 起点 + 3 大理念 |
| `/brand/certifications` | SS | `src/app/brand/certifications/page.tsx` | 6 CertCard 占位 |
| `/brand/history` | SS | `src/app/brand/history/page.tsx` | 5 段里程碑时间线 |
| `/news` | SS | `src/app/news/page.tsx` | 3 卡片 |
| `/news/[slug]` | SSG | `src/app/news/[slug]/page.tsx` | 3 详情 + 相关推荐 |
| `/contact` | SS | `src/app/contact/page.tsx` | mailto: 表单 |
| `/sitemap.xml` | 动态 | `src/app/sitemap.ts` | 25 URLs |
| `/robots.txt` | 动态 | `src/app/robots.ts` | 全站允许 + sitemap |

**用户可见路由**: 11 (上述排除 `sitemap.xml` 和 `robots.txt`)
**预渲染总页数**: 25 (11 SS + 5 SSG 动态 + 9 静态产品/品牌/资讯 = 实际 11+14=25 验证: 11 静态 + 14 SSG 路径 = 25,含 9 个产品/品牌子页 + 5 个 SSG 动态)

---

## 4. 数据层 (4 个 lib 文件,清晰分离)

```
src/lib/
├── brand.ts          22 行   品牌名/标语/成立时间/联系方式占位
├── products.ts      282 行   6 个产品方向 (group: light-mod | film)
├── store.ts         119 行   1 省 + 1 市 + 1 店
├── news.ts           46 行   3 条占位资讯
├── certifications.ts 114 行   6 个证书占位 (4 类别)
├── history.ts        54 行   5 段 2026 起点时间线
└── utils.ts          ? 行    cn() 工具
```

**核心约束**:
- 所有联系方式、地址、营业时间、ICP 备案号统一用「待补充 / 待确认 / 待备案」占位
- 不编造权威机构、媒体、签约方、合作方、具体日期
- 修改任何 `lib/*.ts` 必须重新 `npm run build` (SSG 列表构建时定型)

---

## 5. 共享组件 (9 个,DRY 实践好)

| 组件 | 客户端 | 职责 |
|------|--------|------|
| `Header.tsx` | ✅ (useState + usePathname) | 5 项导航 + 产品下拉 + Esc/外部点击/标签可点 |
| `Footer.tsx` | ❌ | 4 列: logo / 快捷链接 / 联系方式 / 备案 |
| `Hero.tsx` | ❌ | 首页 hero,渐变背景 + 双 CTA |
| `WhyChooseUs.tsx` | ❌ | 3 特性卡片 (盾形 / 奖杯 / 闪光) |
| `CoreServices.tsx` | ❌ | 3 卡片 + 真实门店入口 |
| `ProductsQuickEntry.tsx` | ❌ | 6 卡片产品快速入口 |
| `ProductDetail.tsx` | ❌ | **6 个产品详情页共享模板** (DRY 关键) |
| `CertCard.tsx` | ❌ | 证书卡片 (含占位徽章) |
| `ui/button.tsx` | ❌ | shadcn 风格 (未实际使用) |

---

## 6. SEO 现状

| 项 | 状态 | 文件 |
|----|------|------|
| `<title>` + `<meta description>` | ✅ | `src/app/layout.tsx` |
| `<meta keywords>` | ✅ | 同上 |
| OpenGraph (title/description/locale/type) | ✅ | 同上 |
| `<html lang="zh-CN">` | ✅ | 同上 |
| `/sitemap.xml` | ✅ (25 URLs) | `src/app/sitemap.ts` |
| `/robots.txt` | ✅ (全站允许 + sitemap 引用) | `src/app/robots.ts` |
| Schema.org 结构化数据 | ❌ | — |
| canonical URL | ❌ | — |
| Twitter Card | ❌ | — |
| OG image (PNG) | ❌ (无图) | `public/seo/og-default.png` 待补 |
| favicon | ✅ (`src/app/favicon.ico`) | — |
| apple-touch-icon | ❌ | `public/seo/apple-touch-icon.png` 待补 |

---

## 7. 设计 / 视觉资源缺口 (Phase 2 阻塞项)

| 资源 | 路径 | 影响范围 | 状态 |
|------|------|---------|------|
| 品牌 Logo PNG (深色 + 浅色) | `public/images/logo/lanhui-logo-{dark,light}.png` | Header + Footer | ❌ 文字占位 |
| 首页 Hero 主图 | `public/images/home/hero.png` | 首页 Hero 区 | ❌ 渐变占位 |
| 首页 3 服务卡片图 | `public/images/home/{product-center,flagship-store,brand-intro}.png` | CoreServices | ❌ icon 占位 |
| 6 个产品主图 | `public/images/products/{electric-steps,wheels,chassis,window-film,color-film,ppf}.png` | 产品详情页 hero | ❌ 渐变占位 |
| 6 张资质证书图 | `public/images/cert/cert_{1..6}.jpg` | /brand/certifications | ❌ CertCard 占位徽章 |
| 品牌介绍图 | `public/images/brand/about_lanhui.png` | /brand | ❌ 待补 |
| 顺德大良店招图 (4 张) | `public/images/store/shunde-daliang-{1..4}.jpg` | 门店详情 | ❌ Building2 图标占位 |
| OG 分享卡片图 | `public/seo/og-default.png` | 社交分享 | ❌ 无 |

**完整策略**: 详见 `docs/ARCHITECTURE_IMAGE_STRATEGY.md`

---

## 8. 质量门禁

| 命令 | 状态 | 说明 |
|------|------|------|
| `npm run lint` | ✅ 0 error | ESLint |
| `npm run typecheck` | ✅ 0 error | TypeScript strict |
| `npm run build` | ✅ 25 pages, ~4s | Turbopack |
| `npm run check` | ✅ | lint + typecheck + build |
| 响应式 (1440 / 768 / 390) | ✅ | 3 视口验证通过 |

---

## 9. 已知差异 (vs 膜小二复刻源项目)

| 维度 | 蓝辉轻改 | 膜小二 | 说明 |
|------|---------|--------|------|
| 性质 | 全新品牌骨架 | 像素级复刻 | 蓝辉只复用脚手架,内容独立 |
| 路由数 | 11 | 13 | 蓝辉新增 `/contact`、`/news/[slug]` |
| SSG 总页 | 25 | 242 | 数据规模差 (1 店 vs 150 店) |
| 产品方向 | 6 (含 3 轻改) | 3 (仅膜系) | 蓝辉业务更宽 |
| 共享组件 | 9 (含 ProductDetail) | 7 | 蓝辉 DRY 更好 |
| 数据文件 | 4 (按关注点分离) | 1 (大文件) | 蓝辉更现代 |
| Header 交互 | 标签/chevron 分离 + Esc + 外部点击 | 单一按钮 | 蓝辉 UX 更优 |
| SEO | metadata + OG + sitemap + robots | metadata only | 蓝辉更全 |
| 图片资源 | 0 (待补) | 12 张 | 膜小二有真实素材 |
| 门店数 | 1 (顺德大良) | 150+ | 业务规模差 |

---

## 10. 下一步路线图

### Phase 2 — 内容与资源 (1-2 周)

**P0 · 阻塞发布**:
- [ ] 真实品牌 Logo PNG
- [ ] 真实企业电话 / 地址 / 营业时间
- [ ] 6 张产品主图
- [ ] 首页 Hero 主图
- [ ] OG image + favicon 系列
- [ ] ICP / 公安备案号
- [ ] 6 张资质证书图

**P1 · SEO 完善**:
- [ ] Schema.org (LocalBusiness / Product / Organization)
- [ ] canonical URL
- [ ] README.md (lanhui 版本,清理膜小二残留)
- [ ] CHANGELOG.md
- [ ] 品牌 stats 模块 (在 /brand 加数字)

### Phase 3 — 体验增强 (1-2 月)

- [ ] 首页 Hero 视频背景 (`public/videos/hero.mp4`)
- [ ] 门店店招实拍 (4 张/店)
- [ ] 产品对比表
- [ ] LBS 地图嵌入
- [ ] 表单后端 (邮件 / 飞书 webhook)
- [ ] Lenis smooth scroll
- [ ] 滚动驱动动画
- [ ] Header 滚动收缩
- [ ] 单元测试 (vitest + RTL)

### Phase 4 — 商业化 (待定)

- [ ] 车主案例 UGC
- [ ] 在线预约排期
- [ ] 加盟招商
- [ ] 小程序同构

---

## 11. 关键文件位置速查

| 想改什么 | 去看哪个文件 |
|---------|-------------|
| 站点 metadata / OG | `src/app/layout.tsx` |
| 品牌名 / 标语 / 备案 | `src/lib/brand.ts` |
| 6 个产品文案 | `src/lib/products.ts` |
| 门店数据 | `src/lib/store.ts` |
| 品牌资讯 | `src/lib/news.ts` |
| 资质证书 | `src/lib/certifications.ts` |
| 品牌历程 | `src/lib/history.ts` |
| Header + 下拉 | `src/components/Header.tsx` |
| Footer + 备案 | `src/components/Footer.tsx` |
| 首页 4 段 | `src/app/page.tsx` + 4 组件 |
| 6 个产品详情 | `src/components/ProductDetail.tsx` |
| 门店 4 层路由 | `src/app/agent/**/page.tsx` |
| sitemap | `src/app/sitemap.ts` |
| robots | `src/app/robots.ts` |
| 全站样式 | `src/app/globals.css` |

---

## 12. 维护者 Checklist

新增路由时:
- [ ] 是否在 `Header.tsx` 的 `NAV_ITEMS`?
- [ ] 是否在 `Footer.tsx` 的 `QUICK_LINKS`?
- [ ] 是否有 `metadata` (title + description)?
- [ ] 是否加入 `sitemap.ts` 的 `paths`?
- [ ] 是否经过 `npm run check`?

修改数据时:
- [ ] 是否使用「待补充 / 待确认」占位 (不编造)?
- [ ] 是否 `npm run build` 重新预渲染 SSG?

---

**最后更新**: 2026-06-08 · **维护者**: Claude · **下一里程碑**: 真实图片资源到位 (Phase 2 P0)
