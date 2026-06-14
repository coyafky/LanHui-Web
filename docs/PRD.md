# 蓝辉轻改 LANHUI — 产品需求文档（PRD）

> 项目级产品需求文档，覆盖产品定位、目标用户、功能模块、非功能性需求与未来路线图。

**版本**: v1.0
**最后更新**: 2026-06-10
**适用范围**: 蓝辉轻改官方网站 + 后台管理系统

---

## 1. 产品概述

### 1.1 一句话定位
**蓝辉轻改 LANHUI 是面向汽车轻改装与汽车膜服务的品牌官方站，从顺德大良出发，为车主提供一站式轻改升级方案。**

### 1.2 产品愿景
让爱车更有型，也更好用。

### 1.3 目标用户

| 用户类型 | 画像 | 核心需求 |
|----------|------|----------|
| **车主** | 已购车的个人消费者，关注外观、舒适度、个性化 | 一站式咨询、产品对比、门店导航、品牌信任 |
| **轻改爱好者** | 已做过基础改装，了解产品差异 | 产品深度技术参数、施工工艺、案例参考 |
| **潜客** | 处在信息收集阶段，未决定品牌 | 品牌资质、价格范围、服务流程、联系方式 |
| **运营/管理** | 蓝辉内部员工、店主 | 内容发布、门店管理、数据分析 |

### 1.4 业务范围

- **轻改装服务**：电动踏板、轮毂升级、底盘升级
- **汽车膜服务**：汽车窗膜、改色膜、隐形车衣（PPF）
- **门店服务**：顺德大良店（当前唯一实体门店），未来扩展全国

---

## 2. 功能模块清单

### 2.1 前台公开模块（车主/C端）

| # | 模块 | 路由 | 核心功能 | 优先级 |
|---|------|------|----------|--------|
| 1 | 首页 | `/` | 品牌曝光、核心服务入口、产品快速入口 | P0 |
| 2 | 品牌介绍 | `/brand` | 品牌故事、价值主张 | P0 |
| 3 | 资质认证 | `/brand/certifications` | 品牌资质、合作授权、证书展示 | P1 |
| 4 | 发展历程 | `/brand/history` | 品牌时间线 | P1 |
| 5 | 产品中心 | `/product` | 6 大产品线入口 | P0 |
| 6 | 产品详情 | `/product/<slug>` | 单产品深度介绍 + 性能参数 | P0 |
| 7 | 资讯列表 | `/news` | 品牌/门店/产品动态（分页） | P0 |
| 8 | 资讯详情 | `/news/[slug]` | 单篇文章内容 + 关联推荐 | P0 |
| 9 | 门店网络 | `/agent` | 省份选择 | P0 |
| 10 | 城市门店 | `/agent/[slug]` | 城市列表 | P0 |
| 11 | 门店详情 | `/agent/store/[id]` | 单门店信息 + 联系 | P0 |
| 12 | 联系我们 | `/contact` | 联系方式、地址 | P0 |

### 2.2 后台管理模块（B端）

| # | 模块 | 路由 | 核心功能 | 权限要求 |
|---|------|------|----------|----------|
| 1 | 登录 | `/admin/login` | 账号密码登录（JWT） | 公开 |
| 2 | 后台首页 | `/admin` | 数据概览 | admin |
| 3 | 文章管理 | `/admin/articles` | 列表、筛选、分页、批量操作、状态切换 | editor/admin |
| 4 | 新建文章 | `/admin/articles/new` | 富文本编辑、slug 自动生成 | editor/admin |
| 5 | 编辑文章 | `/admin/articles/[id]` | 修改、发布、回退草稿 | editor/admin |
| 6 | 门店管理 | `/admin/stores` | 列表、新增、编辑、删除 | admin |
| 7 | 门店详情 | `/admin/stores/[id]` | 门店信息编辑 | admin |
| 8 | 数据分析 | `/admin/analytics` | 浏览量、来源、转化数据 | admin |

---

## 3. 核心功能详细规格

### 3.1 资讯列表（`/news`）

**目标**：展示品牌、门店、产品相关动态，按时间倒序排列。

**关键需求**：
- 每页 5 条，按 `publishedAt` 倒序
- 超过 1 页显示分页组件（上一页/页码/下一页）
- URL 参数 `?page=N` 控制页码
- 显示总数 "共 N 条资讯"
- Server Component + ISR（revalidate: 3600s）
- SEO 友好（每页可独立抓取）

**验收标准**：
- 文章按时间倒序
- 分页组件正确显示并可点击翻页
- 第一页隐藏「上一页」，最后一页隐藏「下一页」
- 当前页高亮显示

### 3.2 后台文章管理（`/admin/articles`）

**目标**：管理文章全生命周期（草稿 → 已发布 → 已归档 → 草稿）。

**关键需求**：
- 状态过滤（全部/草稿/已发布/已归档）
- 分类过滤
- 搜索（按标题）
- 分页（20 条/页）
- 批量选择 + 批量发布/删除
- 单篇操作菜单根据状态显示不同项：
  - 草稿：编辑、发布、删除
  - 已发布：编辑、回退到草稿（弹窗确认）、删除
  - 已归档：编辑、恢复为草稿、删除

**验收标准**：
- 列表正确显示文章、状态、分类、发布时间
- 下拉菜单根据状态显示对应操作
- 回退到草稿时弹窗确认
- 批量操作可正常执行
- 操作完成后列表自动刷新

### 3.3 门店四级导航

**目标**：支持未来多省份多城市多门店的扩展。

**路由层级**：
```
/agent                          → 省份选择
/agent/[provinceSlug]           → 城市列表
/agent/[provinceSlug]/[citySlug] → 该城市门店列表
/agent/store/[storeId]          → 单门店详情
```

**关键需求**：
- 当前已支持广东/江苏/浙江三个省份
- 每个城市有 storeCount 展示
- 门店详情含地址、电话、营业时间、描述、门店图
- 路线规划（可选）

### 3.4 产品详情

**目标**：单产品深度信息展示 + 性能参数表。

**6 大产品线**：
1. 电动踏板 `/product/electric-steps`
2. 轮毂升级 `/product/wheels`
3. 底盘升级 `/product/chassis`
4. 汽车窗膜 `/product/window-film`
5. 改色膜 `/product/color-film`
6. 隐形车衣（PPF）`/product/ppf`

**关键需求**：
- 顶部 Hero 介绍
- 产品价值主张
- 性能参数表（系列、型号、原产地、材质、厚度等）
- 服务流程说明
- 适配车型推荐
- CTA → 联系我们 / 门店导航

---

## 4. 非功能性需求

### 4.1 性能

| 指标 | 目标 | 当前 |
|------|------|------|
| 首屏 LCP | < 2.5s | 静态预渲染，< 1.5s |
| FID/INP | < 200ms | < 100ms |
| CLS | < 0.1 | < 0.05 |
| 页面体积（首屏） | < 200KB gzipped | 待测 |

### 4.2 SEO

- 所有页面有独立 `<title>` 和 `<meta description>`
- 生成 `sitemap.xml` 和 `robots.txt`
- OG 图：1200×630
- favicon + apple-touch-icon
- Schema.org 结构化数据（Organization、Article、Product）
- canonical URL

### 4.3 可访问性

- 语义化 HTML（`header`/`main`/`section`/`article`/`nav`/`footer`）
- 键盘导航支持（Tab 顺序、Esc 关闭弹窗）
- 颜色对比度 ≥ 4.5:1
- 所有图片有 `alt` 属性
- 表单有 `<label>`

### 4.4 安全

- 密码 bcrypt 哈希（cost = 10）
- JWT session（next-auth）
- 后台路由强制鉴权（middleware 或 layout 拦截）
- API 写入操作必须登录
- 输入验证（Zod）
- SQL 注入防护（Prisma 参数化查询）

### 4.5 部署

- `output: "standalone"` 模式
- Docker 镜像（Node 20 alpine）
- Nginx 反向代理
- 阿里云/腾讯云 ECS
- HTTPS（Let's Encrypt）
- 静态资源 CDN 缓存

### 4.6 浏览器兼容

- Chrome 100+
- Safari 15+
- Firefox 100+
- Edge 100+
- 移动端：iOS Safari 15+, Chrome Android 100+

---

## 5. 数据模型

### 5.1 核心实体

```
User
├── id, email, username, password(hashed), name, role, status

Province
├── id, slug, label, order, cityCount, storeCount

City
├── id, slug, provinceSlug, label, order, storeCount

Store
├── id, slug, name, provinceSlug/citySlug, district, address,
│   phone, phoneTel, businessHours, description, imageUrl, lat, lng

Article
├── id, title, slug(unique), excerpt, content, featuredImage,
│   authorId, status, category, tags[], viewCount, isSticky,
│   publishedAt, createdAt, updatedAt

Analytics
├── id, path, referrer, userAgent, ipHash, sessionId, createdAt
```

### 5.2 关系

- `Article.author` → `User` (many-to-one)
- `Store` → `City` (many-to-one)
- `City` → `Province` (many-to-one)

---

## 6. 技术栈

| 层级 | 选型 | 版本 |
|------|------|------|
| 框架 | Next.js | 16.2.1 (App Router) |
| 运行时 | React | 19.x |
| 语言 | TypeScript | strict |
| 样式 | Tailwind CSS | v4 |
| UI 库 | shadcn/ui (Radix) | latest |
| 图标 | Lucide React | latest |
| ORM | Prisma | 7.8 |
| 数据库 | PostgreSQL | 16 |
| Auth | next-auth | v5 (beta, JWT) |
| 验证 | Zod | v4 |
| 内容渲染 | react-markdown | latest |
| 部署 | Docker standalone | Node 20 alpine |

---

## 7. 目录结构

```
src/
├── app/                          # Next.js 路由
│   ├── (frontend routes)
│   ├── admin/(dashboard)/        # 后台（路由组）
│   ├── api/                      # API 路由
│   │   ├── articles/
│   │   ├── stores/
│   │   ├── auth/
│   │   └── analytics/
│   ├── layout.tsx
│   └── page.tsx                  # 首页
├── components/                   # 共享组件
│   ├── ui/                       # shadcn 原子组件
│   ├── Header.tsx / Footer.tsx
│   ├── Hero.tsx
│   ├── ArticleEditor.tsx
│   └── ...
├── lib/                          # 数据层 + 工具
│   ├── prisma.ts
│   ├── auth.ts
│   ├── data.ts                   # 前台数据获取
│   ├── news.ts / store.ts / products.ts / brand.ts
│   ├── validations/
│   └── utils.ts
├── types/                        # 类型定义
└── hooks/                        # 自定义 hooks
prisma/
├── schema.prisma
└── seed.ts
public/
├── images/                       # 静态图片
├── videos/
└── seo/
docs/                             # 项目文档（本目录）
```

---

## 8. 路线图

### 8.1 已完成 (Phase 1)

- [x] Next.js 16 工程脚手架
- [x] shadcn/ui + Tailwind v4 集成
- [x] 12 个前台页面（首页/品牌/产品/新闻/门店/联系）
- [x] 后台管理系统（登录/文章/门店/分析）
- [x] Prisma + PostgreSQL 数据库
- [x] next-auth v5 认证
- [x] 文章增删改查 + 状态机
- [x] 门店增删改查
- [x] 资讯列表分页
- [x] SEO 基础（sitemap、robots、metadata）
- [x] Docker 部署配置

### 8.2 短期 (Phase 2 — 1-2 个月)

- [ ] 真实图片资产采集（10+ 张 P0）
- [ ] 图片处理方案（local public ）
- [ ] 后台权限分级（admin/editor/viewer）
- [ ] 搜索功能（全文搜索文章）
- [ ] 表单提交（联系页 → 邮件）
- [ ] 分析仪表板（PV/UV/来源）

### 8.3 中期 (Phase 3 — 3-6 个月)

- [ ] OSS/COS + CDN 接入
- [ ] 案例展示（改装前后对比）
- [ ] 客户评价系统
- [ ] 在线预约服务
- [ ] 微信小程序
- [ ] 抖音/小红书内容对接

### 8.4 长期 (Phase 4 — 6+ 个月)

- [ ] 加盟商管理后台
- [ ] 库存管理
- [ ] 工单系统
- [ ] 财务对账
- [ ] 营销自动化

---

## 9. 风险与约束

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 真实图片缺失 | 首页/产品页视觉效果差 | P0 图片优先采集 |
| 单一门店限制 | 业务规模无法快速扩展 | 数据库设计已支持多门店 |
| 备案/合规 | 国内上线必须 ICP 备案 | 准备备案材料 |
| 内容真实性 | PRD/文案需保持真实，不编造 | 建立内容审核流程 |

---

## 10. 成功指标

### 10.1 业务指标（上线 3 个月）

- 月活访问（MAU）：≥ 1,000
- 平均停留时长：≥ 90s
- 资讯页跳出率：≤ 60%
- 联系页提交数：≥ 20/月

### 10.2 技术指标

- Lighthouse Performance：≥ 90
- Lighthouse SEO：≥ 95
- Lighthouse Accessibility：≥ 95
- 0 P0/P1 Bug
- 构建时间：≤ 15s

---

## 11. 关联文档

- `docs/PROJECT.md` — 项目整体说明
- `docs/ARCHITECTURE.md` — 架构详细文档
- `docs/ARCHITECTURE_IMAGE_STRATEGY.md` — 图片方案
- `docs/PROGRESS.md` — 进度跟踪
- `docs/CMS_OPERATIONS.md` — 后台操作手册
- `docs/TEST_PLAN.md` — 测试计划
- `docs/TEST_REPORT_*.md` — 各页面测试报告
- `docs/CODE_REVIEW_2026-06-09.md` — 代码审查
