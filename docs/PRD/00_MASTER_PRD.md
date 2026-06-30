# 蓝辉轻改 LANHUI — Master PRD v3

> **版本**: v3.0
> **最后更新**: 2026-06-29
> **适用范围**: 公开品牌站、产品专题体系、门店网络、资讯、`/admin` CMS、API、数据层、测试与审计体系
> **文档定位**: 本文回答“蓝辉官网应该是什么、为谁服务、页面如何表达、工程边界是什么”。页面级实现规格下沉到各子 PRD。

---

## 1. 背景

蓝辉官网已经从早期的 Vibe Coding 页面，演进成一个包含 64 个页面文件、13 个 API route、249 个 TSX 组件、20 个产品数据模块的 Next.js 16 项目。现状的主要问题不是单点功能缺失，而是：

- PRD 文档按日期和功能堆叠，存在路由数量、产品范围、实现状态与当前代码不一致的问题。
- 页面表达从“品牌官网”扩张到“车型专题 + 服务项目 + CMS + 数据分析”，但缺少统一的信息架构和表达标准。
- 部分页面视觉完成度依赖 `pending-review` / `missing` 图片状态，容易呈现半成品感。
- 移动端、桌面端虽然多数可用，但产品中心、车型专题、后台表格等长页面缺少统一的响应式验收口径。
- 技术栈较新：Next.js 16.2.1、React 19.2.4、Prisma 7.8、Tailwind v4，必须持续遵守项目特定约束。

关联审计：

- `docs/daily/2026-06-29/TECHNICAL_AND_EXPRESSION_AUDIT_2026-06-29.md`
- `docs/design-reviews/VISUAL_AUDIT_2026-06-20.md`
- `docs/PRD/cross-cutting/FULL_SITE_TEST_PRD_2026-06-29.md`

---

## 2. 产品定位

### 2.1 一句话

**蓝辉轻改 LANHUI 是面向新能源车主的汽车轻改装与车身膜服务官网，用车型方案、服务项目、真实门店和运营 CMS 支撑“了解方案 → 建立信任 → 咨询到店”的转化闭环。**

### 2.2 核心表达

| 表达层 | 页面必须回答的问题 | 主要承载 |
|---|---|---|
| 品牌可信 | 蓝辉是谁，为什么值得信任 | 首页、品牌页、资质、历史、门店 |
| 车型适配 | 我的车能做什么，哪些项目优先 | 产品中心、品牌页、车型页 |
| 服务价值 | 车衣、窗膜、踏板、轮毂等项目解决什么问题 | 服务线页面、车型项目卡 |
| 到店转化 | 我下一步怎么咨询、去哪家店、需要准备什么 | Header CTA、微信弹窗、门店详情、联系页 |
| 运营可维护 | 内容、门店、文章、分析是否能被后台维护 | `/admin`、API、数据层 |

### 2.3 非目标

- 不把官网做成商城，不做在线支付、库存、订单和物流。
- 不承诺未验证价格、官方合作、授权资质或施工效果。
- 不把所有车型项目都做成独立报价页；
- 不引入新的前端 UI 框架。
- 不绕过现有 API-first + static fallback 数据模式。

---

## 3. 目标用户

| 用户 | 典型问题 | 核心需求 | 页面入口 |
|---|---|---|---|
| 新能源新车车主 | 刚提车，先做什么 | 新车保护、隔热、防护、实用升级优先级 | `/`、`/product`、车型页 |
| 明确车型车主 | 我是问界/小米/极氪/理想车主 | 按车型看可做项目和适配提醒 | `/product/<brand>`、`/product/<brand>/<model>` |
| 明确项目用户 | 我想贴车衣/窗膜/改色膜/装踏板 | 看服务价值、流程、适配边界 | `/product/<service>` |
| 本地潜客 | 附近有没有店，怎么联系 | 门店地址、电话、微信、导航 | `/agent`、`/contact` |
| 蓝辉运营人员 | 要维护门店、文章和数据 | CMS、权限、数据看板、上传 | `/admin` |

---

## 4. 技术栈与工程边界

| 层 | 当前约束 |
|---|---|
| Framework | Next.js 16.2.1 App Router；写代码前优先查 `node_modules/next/dist/docs/` |
| React | React 19.2.4 |
| Language | TypeScript strict；禁止新增 `any`，已有少量 `eslint-disable no-explicit-any` 需逐步清理 |
| Styling | Tailwind v4 + `src/app/globals.css` oklch tokens；移动优先 |
| UI | shadcn/ui + Base UI primitives，不使用 Radix 假设 |
| Data | 静态数据在 `src/lib/*`；DB 通过 `src/lib/prisma.ts` + `src/lib/data.ts` 聚合 |
| Auth | NextAuth v5 beta，Credentials + JWT，角色 `admin` / `editor` |
| Storage | `/api/upload` 当前是本地 WebP 存储，不是 OSS |
| Testing | vitest + happy-dom + Playwright |
| Build | `npm run build` 必须在无 Postgres 时成功 |

已知质量门禁：`npm run typecheck` 当前有 9 个 pre-existing 测试文件错误，不能当作本次业务代码回归。

---

## 5. 信息架构

### 5.1 公开站

| 页面族 | 路由 | 产品职责 |
|---|---|---|
| 首页 | `/` | 首屏说清品牌、服务、车型/项目入口、咨询路径 |
| 品牌 | `/brand` `/brand/certifications` `/brand/history` | 品牌可信、资质、发展历程 |
| 产品中心 | `/product` | 按车型找 + 按项目找 + 推荐组合 |
| 服务线 | `/product/ppf` `/window-film` `/color-film` `/electric-steps` `/wheels` `/chassis` `/flooring` 等 | 解释单一服务项目价值和施工边界 |
| 品牌专题 | `/product/wenjie` `/xiaomi` `/zeekr` `/li-auto` 等 | 车型族导购入口 |
| 车型页 | `/product/<brand>/<model>` | 单车型项目清单、场景、FAQ、咨询 CTA |
| 门店 | `/agent` `/agent/[slug]` `/agent/[slug]/[city]` `/agent/store/[id]` | 门店查找、详情、导航 |
| 资讯 | `/news` `/news/[slug]` | 品牌动态、知识内容、SEO 长尾 |
| 联系 | `/contact` | 汇总联系方式和到店路径 |

### 5.2 后台 CMS

| 页面族 | 路由 | 权限 |
|---|---|---|
| 登录 | `/admin/login` | 公开 |
| Dashboard | `/admin` | admin / editor |
| Analytics | `/admin/analytics` | admin |
| Articles | `/admin/articles` `/new` `/[id]` | editor+ |
| Stores | `/admin/stores` `/new` `/[id]` `/[id]/image` | admin |

### 5.3 API

所有 API 响应必须统一为 `{ success, data?, error?, details? }`。写接口必须执行 `auth()`、角色校验和 Zod 校验。

---

## 6. 页面表达原则

### 6.1 文案

- 首屏 H1 必须是品牌、页面对象或明确服务类别，避免空泛口号。
- 每个页面必须在首屏说明“用户能在这里完成什么判断”。
- 车型页不能只堆项目名；至少回答“适合谁、解决什么、施工注意什么、下一步怎么咨询”。
- 不使用假 400 电话、未验证价格、未确认官方合作、占位微信号。

### 6.2 视觉

- 公共基调：深色、克制、专业，避免模板化渐变和无信息装饰。
- 产品/车型页必须有实际视觉资产或明确的缺图状态，不能出现空白大块。
- 图片容器统一 4:3 或稳定比例，避免移动端布局跳动。
- 主题色必须服务识别，不应让多品牌页面只靠换标题区分。

### 6.3 响应式

| 视口 | 要求 |
|---|---|
| 390px mobile | 无横向滚动；CTA 可触达；长列表有折叠/分段/锚点；表格必须可扫读 |
| 768px tablet | 双列/单列切换不重叠；导航与 CTA 不拥挤 |
| 1440px desktop | 信息层级清晰；首屏有明确下一步；内容宽度不失控 |

---

## 7. 修改范围

| 类型 | 范围 |
|---|---|
| 页面 | `src/app/**/page.tsx`，尤其公开站、产品中心、车型页、admin |
| 组件 | `src/components/**`，尤其 Header、Footer、产品专题组件、admin 表格 |
| 数据 | `src/lib/product-routes.ts`、`src/lib/*products.ts`、`src/lib/data.ts` |
| API | `src/app/api/**/route.ts` |
| 资产 | `public/images/**` |
| 文档 | `docs/PRD/**`、`docs/design-reviews/**`、`docs/daily/**` |

---

## 8. 验收标准

- [ ] Master PRD 中的路由、页面族、技术栈与当前代码一致。
- [ ] 每个核心页面族都有页面级 PRD 或页面级 PRD 总览条目。
- [ ] 公开站核心页面在 390px、768px、1440px 无明显文本重叠、横向滚动和空白失控。
- [ ] 产品中心能清楚区分“按车型找”和“按项目找”。
- [ ] 车型页 `pending-review` / `missing` 图片状态有明确 UI 解释，不呈现空白半成品。
- [ ] `/admin` 页面继续 `force-dynamic` + `auth()` 保护。
- [ ] `npm run build` 在无 Postgres 环境成功。
- [ ] 新增或改动 API 保持统一响应结构。

---

## 9. 验证命令

```bash
npm run lint
npm run typecheck
npm run build
npm test
npm run test:e2e
```

UI 改版必须额外执行：

- 390px mobile 浏览器检查
- 768px tablet 浏览器检查
- 1440px desktop 浏览器检查
- 关键页面截图归档到 `docs/daily/<YYYY-MM-DD>/` 或 `docs/design-reviews/`

---

## 10. 风险边界

| 风险 | 约束 |
|---|---|
| 内容真实性 | 不写未验证价格、授权、资质、施工承诺 |
| 图片资产 | 缺图必须可解释；不使用本地绝对路径；比例稳定 |
| Build | 不能让 SSG 依赖本地 Postgres |
| Auth | admin 写操作必须校验角色 |
| Prisma | Prisma 7 adapter 错误形态不同于旧版，测试需按当前结构断言 |
| 响应式 | 产品长页和后台表格是主要风险点 |
| 文档漂移 | 新增产品/页面必须同步 `src/lib/product-routes.ts` 与对应 PRD |

---

## 11. 子 PRD 地图

| 类型 | Canonical 文档 |
|---|---|
| 页面级 PRD 总览 | `docs/PRD/public-site/PAGE_PRD_SYSTEM_2026-06-29.md` |
| 产品入口 | `docs/PRD/product/PRODUCT_INDEX_PRD_2026-06-25.md` |
| 产品路由架构 | `docs/PRD/product/PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md` |
| 全站测试 | `docs/PRD/cross-cutting/FULL_SITE_TEST_PRD_2026-06-29.md` |
| 视觉评判提示词 | `docs/PRD/cross-cutting/CODEX_VISUAL_EVAL_PROMPT_2026-06-29.md` |
| Admin | `docs/PRD/admin/README.md` |

---

## 12. 变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-06-19 | v2 | 索引 + 看板式 Master PRD |
| 2026-06-29 | v3 | 按当前代码和审计结果重写，补充表达性、响应式、页面级 PRD 约束 |
