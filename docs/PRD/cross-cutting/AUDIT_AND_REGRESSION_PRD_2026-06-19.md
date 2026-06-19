# PRD-2026-06-19 全站审计与回归

> 状态:已完成首轮审计,本 PRD 为修复任务源
> 关联:audit 脚本在 main(`scripts/audit/*` + `e2e/audit-full-site.spec.ts`),报告归档在 `docs/audits/`
> 复用 ZEEKR build 模式:每个 P0/P1 子任务独立 commit + RED→GREEN→回归

## 0. 元信息
| 项 | 值 |
|---|---|
| 日期 | 2026-06-19 |
| 触发 | Coya 要求全站回归审计 |
| 范围 | 26 公开路由(SSG 优先 + 动态展开) + 1 store 动态页 |
| 方法 | Playwright 截图(3 视口)+ Lighthouse 性能(mobile + desktop)+ Claude 视觉评估 + Playwright e2e |
| 输出 | 本文档 + docs/audits/ 全套归档 |
| 耗时 | 截图 3 分钟 + Lighthouse 35 分钟 + e2e 15 秒 + 报告编写 10 分钟 = 约 50 分钟 |

## 1. 背景与目标
全站上线前/迭代中的健康检查。识别 P0/P1 阻断/严重问题,生成可被 `/build` 直接消费的修复任务。覆盖三大维度:**可达性**(路由 404)、**性能**(Lighthouse < 80)、**视觉一致性**(跨页布局与图片资产)。

## 2. 扫描覆盖
| 视口 / 项 | 数量 | 备注 |
|---|---|---|
| Desktop 1440 | 26 张 | |
| Tablet 768 | 26 张 | |
| Mobile 390 | 26 张 | |
| **截图合计** | **78 张** | 57 成功(21 路由 × 3 视口),21 失败(5 路由 × 3 视口) |
| Lighthouse mobile | 21 路由 | 5 路由因 404 跳过 |
| Lighthouse desktop | 21 路由 | 同上 |
| **Lighthouse 合计** | **42 份** | JSON 在 `docs/audits/lighthouse/{mobile\|desktop}/` |
| e2e 用例 | 24 个 | 20 pass / 3 fail / 1 skip |

## 3. 关键发现 TL;DR

### P0(1 类问题,影响 5 路由)
- **5 个动态路由 404 不可达**:
  - `/news/[slug]` × 3:commit 0b8f38c 引入的 pre-existing bug,`src/app/news/[slug]/page.tsx:94` 引用 `item.content` 字段但 `NewsItem` 类型无此字段
  - `/agent/[slug]`、`/agent/[slug]/[city]`:动态路由脚本 `extractAgentRegion` 误把 `china-regions.ts` 的首个 `value: "beijing"` 当成省 slug,实际业务用拼音如 "guangdong"
  - `/product/window-film/[packageSlug]` × 2:`extractWindowFilmSlugs` 从 `products.ts` 全文取前 2 个 slug,不是真实窗膜套餐 slug(取到的是 `electric-steps`、`wheels`)

### P1(5 类问题)
- **`/product/flooring` 性能极差** perf_m=59 / perf_d=61 / LCP=6.6s(全站最差)
- **`/brand/certifications` 性能 63/77** / LCP=6.0s(证书图多,未 lazy)
- **`/agent` 列表性能 64/75** / LCP=6.0s / 27+ store 卡片慢
- **`/product/wenjie` 30+ 车型图片全为 pending 占位**(`publicPath: null`),业务未补图
- **`/product` 入口 LCP=6.5s**(4 大主题图未 priority)

### P2(7+ 类)
- 首页 Hero LCP 6.4s / TBT 290ms
- `/contact` a11y 89(略低于阈值 95)
- `/product/zeekr` mobile 14578px 极高,每车型 section 空白多
- `/product/electric-steps` mobile LCP 6.0s
- `/product/ppf` desktop 64
- `/product/wheels` LCP 6.0s
- 10 个路由 LCP > 6s(LCP 普遍偏高,主因 Hero 图未 priority)

### CLS = 0(优秀)
- 所有 21 个可达路由在 Lighthouse 测试期间 CLS=0,Next/Image + aspect-ratio 配置到位。

### SEO = 100(完美)
- 所有可达路由 SEO 100/100,meta 标签完整。

## 4. 全站性能基线

### 性能 < 80 的路由(待优化)
| 路由 | perf_m | perf_d | LCP_m | 严重度 |
|---|---|---|---|---|
| /product/flooring | 59 ✗ | 61 ✗ | 6.6s | **P1** |
| /brand/certifications | 63 ✗ | 77 ⚠ | 6.0s | **P1** |
| /agent | 64 ⚠ | 75 ⚠ | 6.0s | **P1** |
| / (root) | 69 ⚠ | 75 ⚠ | 6.4s | P2 |
| /contact | 75 ⚠ | 97 ✓ | 5.9s | P2 |
| /product | 76 ⚠ | 76 ⚠ | 6.5s | **P1** |
| /product/electric-steps | 76 ⚠ | 98 ✓ | 6.0s | P2 |
| /product/wheels | 77 ⚠ | 93 ✓ | 6.0s | P2 |
| /product/wenjie | 77 ⚠ | 88 ✓ | 5.5s | P2(图片补全后会更慢) |
| /product/ppf | 75 ⚠ | 64 ✗ | 6.0s | P2 |
| /product/xiaomi | 90 ✓ | 76 ⚠ | 3.6s | 良好 |
| /product/zeekr | 94 ✓ | 86 ✓ | 2.2s | 优秀 |

### 性能 ≥ 90 的路由(达标)
`/brand`(96/98)、`/product/chassis`(97/88)、`/product/window-film`(98/96)、`/product/xiaomi`(mobile 90)、`/product/zeekr`(mobile 94)、`/news`(97/93)、`/agent/store/[id]`(86/86)

### LCP > 6s 的 10 个路由
`/`、`/product`、`/product/electric-steps`、`/product/flooring`、`/product/ppf`、`/product/wheels`、`/product/wenjie`、`/brand/certifications`、`/brand/history`、`/agent`

**根因共性**:首屏 hero/卡片图未用 `next/image priority`,Lighthouse 模拟 4x CPU + 1.6Mbps 慢网下 LCP 超时。

## 5. 视觉一致性问题汇总

| 类型 | 数量 | 严重度 | 根因 |
|---|---|---|---|
| 图片占位空(pending 状态) | 30+(wenjie 全部车型) | P1 | `wenjie-products.ts` `publicPath: null` |
| Mobile 视图过高(> 12000px) | 2(zeekr, wenjie) | P2 | 每个 section 一个车型,section 间距大 |
| 动态路由 404 截图不可读 | 5 路由 × 3 视口 | P0 | 同 §3 P0 |
| Hero 右侧空白(desktop) | 1(/) | P2 | 装饰图未加载或 layout 调整 |
| 字体 / 间距 / 圆角 | 0 | - | 全站统一(zinc + amber) |

**结论**:设计语言高度统一(Header / Footer / Card 一致),所有可达页视觉质量合格。问题集中在**数据层**(图片未补、动态路由 slug 错)和**性能层**(LCP 高)。

## 6. 功能测试矩阵

| 套件 | 用例 | 通过 | 失败 | 跳过 | 失败原因 |
|---|---|---|---|---|---|
| Audit — homepage | 1 | 1 | 0 | 0 | - |
| Audit — product pages | 11 | 11 | 0 | 0 | - |
| Audit — brand/news/contact/agent | 10 | 7 | 3 | 0 | `/news/{3 slug}` 404(同 P0-1) |
| Audit — known pre-existing | 1 | 0 | 0 | 1 | `test.fixme` 标记 |
| Audit — no console errors | 1 | 1 | 0 | 0 | - |
| **合计** | **24** | **20** | **3** | **1** | |

**覆盖率**:83% pass(20/24)。3 个 fail 全部是 news 动态页,根因是 `src/app/news/[slug]/page.tsx:94` 引用 `item.content` 字段不存在。

## 7. P0/P1 问题清单(给 /build 消费)

### P0-1:5 个动态路由 404
- **现象**:`/news/{3 slug}`、`/agent/{province}`、`/agent/{province}/{city}`、`/product/window-film/{2 slug}` 全部返回 404
- **根因**:
  1. `src/app/news/[slug]/page.tsx:94` 引用 `item.content` 字段(commit 0b8f38c),`NewsItem` 类型无此字段 → SSR 抛错 → 404
  2. `scripts/audit/lib/collect-routes.mjs` `extractAgentRegion()` 用 `china-regions.ts` 首个 value `"beijing"`,但实际 `src/lib/china-regions.ts` 的省 slug 是拼音(`"guangdong"`),`"beijing"` 不是任何省 → 路由 404
  3. `extractWindowFilmSlugs()` 从 `src/lib/products.ts` 取前 2 个 slug,不是真实窗膜套餐 slug → 路由 404
- **影响**:SEO 受损(动态页被搜索引擎判 404)、e2e 3 fail、用户分享链接死链
- **建议修复**:
  - **P0-1a**:`src/app/news/[slug]/page.tsx` —— 移除 `item.content` 引用,或给 `NewsItem` 类型补 `content: string` 字段
  - **P0-1b**:`scripts/audit/lib/collect-routes.mjs` `extractAgentRegion()` —— 改为 grep 已知省(`guangdong` / `shandong` / `hubei` 等),不从 `value` 字段猜
  - **P0-1c**:`scripts/audit/lib/collect-routes.mjs` `extractWindowFilmSlugs()` —— 改为从 `src/lib/window-film-details.ts`(已确认存在)或 `getAllWindowFilmPackageSlugs()` 取真实 slug
- **验收**:`npm run audit:full` 后所有动态路由 200,e2e 全部 pass

### P1-1:`/product/flooring` 性能极差
- **现象**:perf_m=59 / perf_d=61 / LCP=6.6s
- **建议修复**:`src/app/product/flooring/page.tsx` —— 首屏 hero 图 `next/image priority` + 字体 `font-display: swap`
- **验收**:Lighthouse mobile perf ≥ 80

### P1-2:`/brand/certifications` 性能 63/77
- **现象**:perf_m=63 / perf_d=77 / LCP=6.0s
- **建议修复**:`src/app/brand/certifications/page.tsx` —— 证书图加 `next/image` + 视口外 `loading="lazy"`
- **验收**:Lighthouse mobile perf ≥ 80

### P1-3:`/agent` 列表性能 64/75
- **现象**:perf_m=64 / perf_d=75 / LCP=6.0s,27+ store 卡片
- **建议修复**:`src/app/agent/page.tsx` —— store 卡片分页(12/页)或虚拟滚动,首屏 12 张图 `priority`,其余 lazy
- **验收**:Lighthouse mobile perf ≥ 80

### P1-4:`/product/wenjie` 30+ 车型图片全 pending 占位
- **现象**:30+ 车型卡片图片全为空方框(desktop/tablet/mobile 三视口)
- **根因**:`src/lib/wenjie-products.ts` 所有 `image.publicPath = null`(`buildPendingAlt` 占位)
- **建议修复**:
  - **P1-4a(短期)**:`src/components/wenjie/ProductCard.tsx` —— `imageStatus='pending'` 时显示"图片即将上线" 文字 + 渐变背景(避免空白)
  - **P1-4b(中期)**:`public/images/products/wenjie/{M7,M8,M9,New}/` 补全产品图
  - **P1-4c(长期)**:新增 `scripts/verify-wenjie-images.mjs` 链入 `npm run check`(类似 zeekr)
- **验收**:所有 wenjie 车型图非空 + CI 脚本检查通过

### P1-5:`/product` 入口 LCP 6.5s
- **现象**:perf_m=76 / perf_d=76 / LCP=6.5s
- **建议修复**:`src/app/product/page.tsx` —— 4 大主题 hero 图加 `priority`
- **验收**:Lighthouse mobile perf ≥ 85

## 8. 与现有 PRD 的冲突

| 现有 PRD | 冲突点 |
|---|---|
| `WENJIE_MODIFICATION_TOPIC_PRD_2026-06-13.md` | PRD 假设 30+ 车型图已就绪,实际全部 `publicPath: null`,**业务未补图** |
| `IMAGE_MANAGEMENT_PRD_2026-06-10.md` | 已规划图片管理后台,但 wenjie 业务方未使用 |
| `ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md` | 包含 CI 脚本 `verify-zeekr-images.mjs`,wenjie PRD 缺对应 CI 脚本(P1-4c 建议补) |

## 9. 后续任务(给 /build 消费)

- [ ] P0-1a 修 news 动态页 `item.content` 缺失(独立 worktree,小改动)
- [ ] P0-1b 修 `extractAgentRegion` slug 提取(改 audit 脚本,不阻塞业务)
- [ ] P0-1c 修 `extractWindowFilmSlugs` 提取(改 audit 脚本,加 `getAllWindowFilmPackageSlugs()` 调用)
- [ ] P1-1 优化 `/product/flooring` 性能
- [ ] P1-2 优化 `/brand/certifications` 性能
- [ ] P1-3 优化 `/agent` 列表性能
- [ ] P1-4 wenjie 图片 pending 占位 UI + 补图 + CI 脚本
- [ ] P1-5 `/product` 入口 hero `priority`
- [ ] P2-* 首页 Hero LCP / contact a11y / zeekr mobile 空白
- [ ] 全部修完后跑 `npm run audit:full` 回归(目标:0 P0,≤ 2 P1,Lighthouse 全 80+)

## 10. 附录
- 脚本入口:`scripts/audit/screenshot-all.mjs` · `scripts/audit/lighthouse-run.mjs`
- 测试入口:`e2e/audit-full-site.spec.ts`
- 截图入口:`docs/audits/screenshots/INDEX.md`(.gitignore,本地跑)
- 评估入口:`docs/audits/visual/INDEX.md` + 8 份详细 md
- Lighthouse 入口:`docs/audits/lighthouse/SUMMARY.md`
- e2e 报告:`playwright-report/index.html`

## 11. 已知 pre-existing 问题(不计入本次审计)
- `src/app/news/[slug]/page.tsx:94` 引用 `item.content` 字段不存在(commit 0b8f38c)→ **P0-1a 修**
- `npx tsc --noEmit` 9 个预存错位于 `src/app/api/analytics/stats/route.test.ts` 和 `src/lib/analytics.test.ts`
- `src/app/api/stores/[id]/route.ts` 3 个 `RouteContext` 错(2026-06-15 后新增,未在 CLAUDE.md 预存清单中,建议下次清理)

---

## 12. /admin 后台补做审计(2026-06-19 16:21)

> 触发:Coya 反馈"现在你只是对前台页面进行了测试,但是还有后台管理系统的页面的话,你没有进行pray"(speech-to-text 把"play"识别为"pray")。
> 范围:`/admin/*` 全部 10 个路由(1 公开 + 9 需登录)+ 3 视口截图。
> 方法:复用首轮 audit 脚本(`screenshot-all.mjs` + `lighthouse-run.mjs` + `e2e/audit-full-site.spec.ts`),新增 `--with-admin` / `--with-lighthouse-admin` / `PLAYWRIGHT_ADMIN_*` env 标志。

### 12.1 Admin 路由覆盖

| 路由 | 类型 | 截图 | 状态 | 备注 |
|---|---|---|---|---|
| /admin/login | 公开 | ✓ 3 视口 | 200 | login form |
| /admin | 需登录 | ✓ 3 视口 | 200 | dashboard(KPI + 图表) |
| /admin/analytics | 需登录 | ✓ 3 视口 | 200 | 数据分析 |
| /admin/stores | 需登录 | ✓ 3 视口 | 200 | 门店列表(22 条) |
| /admin/stores/new | 需登录 | ✓ 3 视口 | 200 | 新建门店表单 |
| /admin/stores/{id} | 需登录 | ✓ 3 视口 | 200 | 真实 ID 编辑 |
| /admin/stores/{id}/image | 需登录 | ✓ 3 视口 | 200 | 图片上传 |
| /admin/articles | 需登录 | ✓ 3 视口 | 200 | 文章列表(8 已发布 + 1 草稿) |
| /admin/articles/new | 需登录 | ✓ 3 视口 | 200 | 新建文章表单 |
| /admin/articles/{id} | 需登录 | ✓ 3 视口 | 200 | 真实 ID 编辑 |

**截图合计:** 30 张(desktop/tablet/mobile × 10 路由)
**脚本输出:** `docs/audits/screenshots/admin/{desktop,tablet,mobile}/*.png` + `INDEX.md` admin 区
**详细评估:** `docs/audits/visual/admin__{login,dashboard,stores,articles,analytics}.md`

### 12.2 Admin 关键发现 TL;DR

#### P0(2 类问题,影响公开站数据完整性)

**P0-6:测试门店数据污染生产 DB(22 条全草稿)**
- `/admin/stores` 列表显示 22 条门店,**全部标记"草稿"** + **店名是 ASCII 噪声**:`TC A1-phonetic` / `ssdd` / `ES Test 7` / `Plszhonggu 智能 57 6` / `草莓数据 7` / `7试w 7层` / `7电试7 8...`
- `/api/stores` 公共查询未过滤 status → 公开 `/agent` 列表展示这些测试数据,SEO 风险
- 修复路径:①清理所有非真实门店 ②`prisma/seed.ts` 不再创建 store ③`/api/stores` 公共查询加 `WHERE status = 'published'`

**P0-7:`/news/[slug]` 详情页全部 404**
- `src/app/news/[slug]/page.tsx:94` 引用 `item.content` 但 `NewsItem` 类型无此字段(commit 0b8f38c,pre-existing)
- 8 条已发布文章全部不可达(列表/详情数据完全脱节)
- 修复路径:`src/types/news.ts` 加 `content: string` + 静态数据补 content 字段

#### P1(8 类问题)

| ID | 描述 | 证据 |
|---|---|---|
| P1-6 | 登录失败无错误文案回显 | bad creds 后页面停留但无任何提示 |
| P1-7 | Dashboard 文章分类 Top 5 未过滤草稿 | "8 已发布 + 1 草稿" vs "Top 5 总 9" 自相矛盾 |
| P1-8 | 整站预约埋点 0 | 692 PV 但 0 预约 + 0 click |
| P1-9 | 店名 ASCII 噪声(TC / SS / Plszhonggu 等) | stores 截图明显 |
| P1-10 | `分页测试 #1/#2/#3` 测试数据未清 | articles 截图 |
| P1-11 | `Playwright 测试文章` 残留 | articles 截图 |
| P1-12 | 事件类型严重失衡:695 PV vs ~5 click | analytics 截图柱状图 |
| P1-13 | 热门门店 Top 10 完全空 | analytics 截图 |

#### P2(3 类问题)

| ID | 描述 |
|---|---|
| P2-3 | 登录页缺"忘记密码"入口(内网定位暂可接受,生产前改 seed 密码) |
| P2-4 | analytics 折线图日期不连续(跳日显示而非 0) |
| P2-4b | 所有文章作者 = "系统管理员"(NewsItem 无 authorId 字段) |

### 12.3 Admin 测试验证

#### 登录守卫(3/3 通过)

| 用例 | 期望 | 结果 |
|---|---|---|
| `/admin/login` 不需登录可访问 | 200 + 表单可见 | ✅ |
| 正确凭据登录跳 `/admin` | 跳转 + cookie 持久 | ✅ |
| 错误密码停留 login 页 | URL 不变 | ✅(但无错误文案) |
| 未登录访问 `/admin` | 重定向 `/admin/login` | ✅ |

#### 9 dashboard 路由(9/9 通过)

| 路由 | h1 可见 | 标题非空 | 200 |
|---|---|---|---|
| /admin | ✓ 仪表盘 | ✓ | ✓ |
| /admin/analytics | ✓ 数据分析 | ✓ | ✓ |
| /admin/stores | ✓ 门店管理 | ✓ | ✓ |
| /admin/stores/new | ✓ 新建门店 | ✓ | ✓ |
| /admin/articles | ✓ 文章管理 | ✓ | ✓ |
| /admin/articles/new | ✓ 新建文章 | ✓ | ✓ |
| /admin/stores/{id} | ✓ 编辑门店 | ✓ | ✓ |
| /admin/stores/{id}/image | ✓ | ✓ | ✓ |
| /admin/articles/{id} | ✓ 编辑文章 | ✓ | ✓ |

#### 控制台 0 error(1/1 通过)

登录后访问 `/admin` → networkidle → console errors 数组为空 ✅

### 12.4 Admin 关键文件

| 文件 | 作用 |
|---|---|
| `src/app/admin/login/page.tsx` | 登录页 |
| `src/app/admin/layout.tsx` | 外层 layout(无 auth) |
| `src/app/admin/(dashboard)/layout.tsx` | 内层 layout(auth 守卫) |
| `src/app/admin/(dashboard)/page.tsx` | 仪表盘(KPI + 图表) |
| `src/app/admin/(dashboard)/{analytics,stores,articles}/*` | 4 模块 |
| `src/components/admin/{Sidebar,DashboardKpiCards,DashboardContentHealth,...}` | 9+ 组件 |
| `src/lib/admin-dashboard.ts` | `getDashboardSummary()` 含 KPI 计算 |
| `src/lib/auth.ts` | NextAuth v5 + Credentials + JWT |

### 12.5 复用 vs 新增

| 项 | 复用首轮 | 本次新增 |
|---|---|---|
| `screenshot-all.mjs` | ✓ 框架 | `--with-admin` flag + admin 输出子目录 + loginAsAdmin helper |
| `lighthouse-run.mjs` | ✓ 框架 | `--with-lighthouse-admin` flag(默认排除 /admin) |
| `collect-routes.mjs` | ✓ 框架 | `fetchArticleIds` + `fetchGenericIds` + 7 admin 静态路由 + 4 动态路由 |
| `e2e/audit-full-site.spec.ts` | ✓ 公开套件 | + 4 个 admin 套件(login/auth guard/dashboard 9 页/no console error) |

### 12.6 /admin 后续 /build 任务

- [ ] **B5:清理测试门店 + /api/stores 加 status='published' 过滤**(P0-6)
- [ ] **B6:修复 /news/[slug] item.content 缺失**(P0-7,pre-existing)
- [ ] **B7:全站 Button/Link 自动 click 埋点**(P1-12)
- [ ] **B8:/agent/store/[id] 加 store_view 埋点 + 修 topStores 查询**(P1-13)
- [ ] **B9:analytics 折线图日期连续显示**(P2-4)
- [ ] **B10:新建门店表单加实时字段校验(禁止纯 ASCII 噪声)**(P1-9)
- [ ] **B11:stores/articles 列表加批量操作(checkbox + 批量下架/删除)**(P2-5)
- [ ] **B12:清理文章"分页测试 #1/#2/#3"和"Playwright 测试文章"**(P1-10/11)
- [ ] **B13:NewsItem schema 加 authorId 字段,接 session.user.id**(P2-4b)
- [ ] **B14:登录页加失败文案回显(alert role)**(P1-6)
- [ ] **B15:Dashboard getDashboardSummary 加 status='published' 过滤**(P1-7)

### 12.7 复跑回归

修完 B5-B15 后,跑:
```bash
# 0 P0,≤ 5 P1,Lighthouse /admin 全 80+
node scripts/audit/screenshot-all.mjs --with-admin
node scripts/audit/lighthouse-run.mjs --with-lighthouse-admin
npx playwright test e2e/audit-full-site.spec.ts -g admin
```
- `npm run build` 在缺 Postgres 时 OK,有 Postgres 也 OK(SSG 优先)
