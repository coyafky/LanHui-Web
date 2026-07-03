# SPEC: 膜类服务页 Product Film

> 对应 PRD(三类膜):
> - 汽车窗膜 / 隔热膜:[`WINDOW_FILM_TOPIC_PRD_2026-06-20.md`](../../../PRD/product/WINDOW_FILM_TOPIC_PRD_2026-06-20.md)(v1,含子页 `/[packageSlug]`)
> - 隐形车衣 / PPF:[`PPF_PRD_2026-06-20.md`](../../../PRD/product/PPF_PRD_2026-06-20.md)(v1)
> - 改色膜:[`COLOR_FILM_PRD_2026-06-20.md`](../../../PRD/product/COLOR_FILM_PRD_2026-06-20.md)(v1)
>
> 路由治理:[`PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md`](../../../PRD/product/PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md) §5.1
> 共享数据源:`src/lib/products.ts` → `getProduct(slug)`
> 窗膜子页数据源:`src/lib/window-film-details.ts`(7 个套餐静态数据)
>
> 实现状态:✅ **3 膜类服务页 + 7 套餐子页全部落地;`ProductDetail` 共享渲染器 + `FilmPageHero` / `WindowFilm*` / `Film*` 组件完整**

---

## 1. 职责范围

承接三类车膜服务介绍:

1. **汽车窗膜 / 隔热膜**(`/product/window-film`)— 隔热、防晒、隐私、防爆;含 7 个套餐子页(`/[packageSlug]`)
2. **隐形车衣 / PPF**(`/product/ppf`)— 漆面保护、防剐蹭、防老化
3. **改色膜**(`/product/color-film`)— 外观颜色个性化、可恢复

页面只做内容展示、项目解释、施工流程、套餐对比;**不设置页面私有操作**(电话 / 微信弹窗 / 报价按钮等),需要沟通走首页 / Header / Footer。

下游子页(仅窗膜):

- `/product/window-film/[packageSlug]` × 7 — 套餐详情页,SSG 预生成

---

## 2. 路由

| 路径 | 类型 | 状态 | 说明 |
|---|---|---|---|
| `/product/window-film` | page (RSC) | ✅ v1 落地 | 窗膜总页(6 大痛点 + 7 套餐卡片) |
| `/product/window-film/[packageSlug]` | page (RSC) × 7 | ✅ v1 落地 | 套餐详情子页,SSG 预生成 |
| `/product/ppf` | page (RSC) | ✅ v1 落地 | 隐形车衣详情(共享 ProductDetail) |
| `/product/color-film` | page (RSC) | ✅ v1 落地 | 改色膜详情(共享 ProductDetail) |

### 2.1 路由类型对比(关键技术差异)

| 维度 | 窗膜(特殊) | 车衣 / 改色膜(标准) |
|---|---|---|
| 数据源 | `window-film-details.ts`(7 套餐) + `products.ts` | `products.ts` → `getProduct(slug)` |
| 渲染器 | `<FilmPageHero>` + 多个独立组件 | 共享 `<ProductDetail>`(按 slug 分支) |
| 子页 | ✅ 7 个套餐子页(SSG) | ❌ |
| 业务区块 | 痛点(6)+ 参数解释 + 选导购 + 套餐列表 + 参数表 + 保障 | 共享 Hero + 卖点 + 服务流程 |
| 主题色 | `orange` | `orange` |
| 套餐 | ✅ 7 个静态套餐(`春分 / 谷雨 / 小满 / 芒种 / 白露 / 网红 / 养生`) | ❌ |

### 2.2 窗膜 7 套餐子页(已落地)

| Slug | 套餐名 | 安装位置 | 状态 |
|---|---|---|---|
| `chunfen` | 春分套餐 | 全车 | ✅ |
| `guyu` | 谷雨套餐 | 全车 | ✅ |
| `xiaoman` | 小满套餐 | 全车 | ✅ |
| `mangzhong` | 芒种套餐 | 全车 | ✅ |
| `bailu` | 白露套餐 | 全车 | ✅ |
| `wanghong` | 网红套餐 | 全车 | ✅ |
| `yangsheng` | 养生套餐 | 全车 | ✅ |

### 2.3 字面量类型约束(窗膜子页)

参照 ZEEKR canonical 模式,防图片规格漂移:

```typescript
type Width = 1448;       // 字面量类型
type Height = 1086;
type AspectRatio = "4/3";
type MinPackages = 3;    // 套餐数 ≥ 3 的硬性约束
```

`MinPackages = 3` 写在 `src/lib/window-film-details.ts`,实际 7 条数据,远高于 3 条硬性下限。

---

## 3. 功能清单

### 3.1 通用产品线(车衣 / 改色膜)— `ProductDetail` 共享渲染器

| # | 功能 | 优先级 | 状态 | 备注 |
|---:|---|---|---|---|
| F1 | Hero:面包屑(产品中心 → 膜类名)+ 组别标签 + H1 + heroDescription | P0 | ✅ | `<ProductDetail>` 内置 |
| F2 | Tagline 横幅:渐变文字 | P0 | ✅ | `<ProductDetail>` 内置 |
| F3 | 核心价值区:4 张卡片 | P0 | ✅ | `<ProductDetail>` 内置 |
| F4 | 服务流程区:4 步 | P0 | ✅ | `<ProductDetail>` 内置 |
| F5 | 三视口响应式(390 / 768 / 1440) | P0 | ✅ | Tailwind 断点 |
| F6 | SEO metadata(`title` + `description`) | P0 | ✅ | `generateMetadata` |
| F7 | 面包屑导航 | P0 | ✅ | `<ProductDetail>` 内置 |

### 3.2 窗膜总页 `/product/window-film`(独立布局)

| # | 功能 | 优先级 | 状态 | 关联组件 |
|---:|---|---|---|---|
| F1 | `<FilmPageHero>` Hero(产品名 + 描述 + 面包屑) | P0 | ✅ | `<FilmPageHero>` |
| F2 | 6 大用户痛点(热 / 晒 / 眩光 / 隐私 / 安全 / 新能源) | P0 | ✅ | page.tsx 内联 6 条 |
| F3 | `<WindowFilmParameterExplainer>` 参数解释(隔热率 / 紫外线阻隔率 / 可见光透过率) | P0 | ✅ | `<WindowFilmParameterExplainer>` |
| F4 | `<WindowFilmGuide>` 选导购(按用户场景引导) | P0 | ✅ | `<WindowFilmGuide>` |
| F5 | 7 个套餐卡片(3 列响应式 grid) | P0 | ✅ | `<WindowFilmPackageCard>` |
| F6 | `<SpecsTable>` 单品参数一览(8 列) | P0 | ✅ | `<SpecsTable>` |
| F7 | `<ServiceGuaranteeSection>` 施工保障 | P0 | ✅ | `<ServiceGuaranteeSection>` |
| F8 | `<WindowFilmScenarioGrid>` 场景网格 | P0 | ✅ | `<WindowFilmScenarioGrid>` |
| F9 | `<Footer>` 共享 | P0 | ✅ | `<Footer>` |
| F10 | SEO metadata + 7 套餐 JSON-LD | P0 | ✅ | `generateMetadata` |
| F11 | 三视口响应式 | P0 | ✅ | Tailwind 断点 |

### 3.3 窗膜套餐子页 `/product/window-film/[packageSlug]` × 7

| # | 功能 | 优先级 | 状态 | 关联组件 |
|---:|---|---|---|---|
| F1 | `<WindowFilmPackageDetail>` 套餐详情容器 | P0 | ✅ | `<WindowFilmPackageDetail>` |
| F2 | 套餐核心参数(隔热率 / 紫外线阻隔率 / 可见光透过率 / 厚度 / 质保) | P0 | ✅ | `<WindowFilmPackageDetail>` |
| F3 | 适用部位 + 适用场景 | P0 | ✅ | `<WindowFilmPackageDetail>` |
| F4 | JSON-LD `Product` + `Offer` | P0 | ✅ | inline `<script>` |
| F5 | SSG `generateStaticParams` 枚举 7 slug | P0 | ✅ | `generateStaticParams` |
| F6 | 不存在的 slug → `notFound()` | P0 | ✅ | Next.js notFound() |

### 3.4 `/product` 入口回链

- `<FilmServiceMap>` 渲染 `ppf` / `window-film` / `color-film` 3 个 film 类服务
- 主题色:`cyan`(`--cat-film: #22d3ee`)

---

## 4. 数据模型

### 4.1 通用产品线数据(`src/lib/products.ts`)

```typescript
// Product 类型(共享 ProductDetail 渲染器)
type Product = {
  slug: "ppf" | "window-film" | "color-film" | "electric-steps" | "wheels" | "chassis" | "flooring";
  name: string;
  group: "film" | "light_mod" | "practical_accessory";
  groupLabel: string;
  tagline: string;
  cardDescription: string;
  heroDescription: string;
  audience: string[];
  values: { title: string; description: string }[];
  process: { step: string; title: string; desc: string }[];
  // 以下字段窗膜 / 车衣 / 改色膜按需填充
  series?: ProductSeries[];      // 改色膜色系
  hotColors?: string[];          // 改色膜热门色
  protectionScenes?: string[];   // PPF 防护场景
  specs?: ProductSpec[];         // 通用参数
  packages?: ProductPackage[];   // 套餐(仅 window-film 总页用)
  performanceRatings?: { key: string; value: number }[];  // PPF 性能评分
};
```

### 4.2 窗膜套餐数据(`src/lib/window-film-details.ts`)

```typescript
type Width = 1448;
type Height = 1086;
type AspectRatio = "4/3";
type MinPackages = 3;            // 硬性约束,数据 < 3 TS 报错

type WindowFilmPackage = {
  slug: string;              // "chunfen" / "guyu" / ...
  name: string;              // "春分套餐" / "谷雨套餐" / ...
  position: "前挡" | "侧后挡" | "全车" | "天窗";
  highlights: string[];      // ["隔热率 95%", "紫外线阻隔 99%"]
  specs: {
    heatRejection: string;   // 隔热率
    uvRejection: string;     // 紫外线阻隔率
    visibleLightTransmittance: string;  // 可见光透过率
    thickness: string;       // 厚度 mil
    warranty: string;        // 质保时长
    suitableParts: string[]; // 适用部位
  };
  scenario: string;          // 适用场景描述
  previewImage: string;      // Hero 预览图路径
  image: {
    publicPath: string;
    width: Width | null;     // 1448 一旦填入
    height: Height | null;   // 1086 一旦填入
    aspectRatio: AspectRatio | null;  // "4/3" 一旦填入
  };
};
```

**实际 7 个套餐**(从 `src/lib/window-film-details.ts` 提取):

| Slug | 套餐名 | position | highlights |
|---|---|---|---|
| `chunfen` | 春分套餐 | 全车 | 隔热防晒 / 清晰视野 / 通用适配 |
| `guyu` | 谷雨套餐 | 全车 | 隔热防晒 / 隐私增强 / 商务质感 |
| `xiaoman` | 小满套餐 | 全车 | 高隔热 / 防眩光 / 家庭舒适 |
| `mangzhong` | 芒种套餐 | 全车 | 极致隔热 / 强紫外线阻隔 / 长途出行 |
| `bailu` | 白露套餐 | 全车 | 均衡隔热 / 高透光率 / 日常通勤 |
| `wanghong` | 网红套餐 | 全车 | 时尚隐私 / 强防晒 / 颜值表达 |
| `yangsheng` | 养生套餐 | 全车 | 健康紫外线阻隔 / 母婴友好 / 老人关怀 |

### 4.3 路由注册表(`src/lib/product-routes.ts`)

3 个膜类服务:

| Service Slug | Group | Status | Priority | Route |
|---|---|---|---|---|
| `ppf` | film | live | P0 | `/product/ppf` |
| `window-film` | film | live | P0 | `/product/window-film` |
| `color-film` | film | live | P0 | `/product/color-film` |

### 4.4 SEO 字段

**总页模板**:

| 字段 | 模板 |
|---|---|
| `<title>` | `{项目名} | 蓝辉轻改 LANHUI` |
| `<meta description>` | `蓝辉轻改{项目名}服务,围绕{核心价值}展开。` |
| H1 | `{项目名}` |
| H2 | `核心价值` / `服务流程` |
| Canonical | `/product/{slug}` |

**窗膜总页**(特殊):

| 字段 | 实际值 |
|---|---|
| `<title>` | `汽车窗膜套餐推荐 | 蓝辉轻改 LANHUI` |
| `<meta description>` | `蓝辉轻改汽车窗膜套餐覆盖春分、谷雨、小满、芒种、白露、网红、养生等组合...` |
| H1 | `汽车窗膜` |
| H2 | `用户痛点` / `参数解释` / `选择导购` / `套餐列表` / `单品参数一览` |
| Canonical | `/product/window-film` |

**窗膜套餐子页**:

| 字段 | 模板 |
|---|---|
| `<title>` | `<套餐名> | 汽车窗膜套餐 | 蓝辉轻改 LANHUI` |
| `<meta description>` | `<套餐名>:隔热率 X%、紫外线阻隔 Y%、适用部位 ...。蓝辉轻改窗膜服务介绍,到店沟通具体适配。` |
| `<meta keywords>` | `汽车窗膜, 隔热膜, 防爆膜, 隐私膜, <套餐名>, 蓝辉轻改` |
| `openGraph.type` | `article` |
| JSON-LD | `Product` + `Offer` |
| Canonical | `/product/window-film/{slug}` |

---

## 5. 关键组件

### 5.1 已实现组件清单(2026-06-25 实测)

#### 5.1.1 通用产品线(`/product/ppf` / `/product/color-film`)

| 组件 | 路径 | Client? | 职责 |
|---|---|---:|---|
| `<ProductDetail>` | `src/components/ProductDetail.tsx` | RSC | 6 大产品线共享渲染器(22K) |

`ProductDetail` 内部按 `product.slug` 分支渲染:

- `ppf` → 系列 + 性能对比(`<StarRating>`) + 防护场景
- `color-film` → 系列 + 热门颜色
- `window-film` → 通用产品线 + 7 套餐入口(实际由 `/product/window-film` 独立 page.tsx 接管)

#### 5.1.2 窗膜总页(`/product/window-film`)

| 组件 | 路径 | Client? | 职责 |
|---|---|---:|---|
| `<FilmPageHero>` | `src/components/film/FilmPageHero.tsx` | RSC | Hero(产品名 + 描述 + 面包屑) |
| `<SpecsTable>` | `src/components/film/SpecsTable.tsx` | RSC | 单品参数一览(8 列) |
| `<ServiceGuaranteeSection>` | `src/components/film/ServiceGuaranteeSection.tsx` | RSC | 施工保障 |
| `<ServiceProcessSection>` | `src/components/film/ServiceProcessSection.tsx` | RSC | 4 步施工流程(预留) |
| `<StarRating>` | `src/components/film/StarRating.tsx` | RSC | 性能评分(PPF 用) |
| `<WindowFilmGuide>` | `src/components/window-film/WindowFilmGuide.tsx` | RSC | 选导购(按用户场景引导) |
| `<WindowFilmParameterExplainer>` | `src/components/window-film/WindowFilmParameterExplainer.tsx` | RSC | 参数解释 |
| `<WindowFilmPackageCard>` | `src/components/window-film/WindowFilmPackageCard.tsx` | RSC | 套餐卡片(3 列 grid) |
| `<WindowFilmScenarioGrid>` | `src/components/window-film/WindowFilmScenarioGrid.tsx` | RSC | 场景网格 |

#### 5.1.3 窗膜套餐子页(`/product/window-film/[packageSlug]` × 7)

| 组件 | 路径 | Client? | 职责 |
|---|---|---:|---|
| `<WindowFilmPackageDetail>` | `src/components/window-film/WindowFilmPackageDetail.tsx` | RSC | 套餐详情容器(参数表 + 场景 + JSON-LD) |

### 5.2 视觉规范

| Token | 值 | 用途 |
|---|---|---|
| 背景 | `bg-zinc-950` / `bg-black` | 页面 / 卡片 |
| 文字主色 | `text-white` / `text-zinc-300` | 标题 / 正文 |
| 强调色 | `orange-400/500` | CTA / 高亮(膜类统一主题) |
| 套餐卡片 | `rounded-2xl`,`bg-zinc-900/60 border border-white/5` | 卡片容器 |
| 面包屑 | `text-zinc-500` → `text-zinc-300` 渐变 | 导航 |
| Hero 渐变 | `from-zinc-950 via-zinc-950 to-zinc-900` | 页面背景 |
| 字体 | Geist Sans + 系统中文 | 全站 |

### 5.3 图片规范

- 套餐 Hero 图:`aspect-[4/3] + object-contain + Next/Image sizes`
- 单品参数表:无图,纯文本表格
- 字面量类型保证:`Width = 1448` / `Height = 1086` / `AspectRatio = "4/3"`(参照 ZEEKR canonical)

---

## 6. 数据流与渲染策略

### 6.1 静态数据

| 数据 | 来源 | 消费方 |
|---|---|---|
| 通用产品数据 | `src/lib/products.ts` → `getProduct(slug)` | `<ProductDetail>`(ppf / color-film) |
| 窗膜 7 套餐 | `src/lib/window-film-details.ts` | `<WindowFilmPackageCard>` × 7、`<WindowFilmPackageDetail>` × 7 |
| 6 大痛点 | `src/app/product/window-film/page.tsx` 内联 | 总页痛点区 |
| 8 列参数表头 | `src/app/product/window-film/page.tsx` 内联 | `<SpecsTable>` |
| Route Registry | `src/lib/product-routes.ts` | 入口 `<FilmServiceMap>` |

### 6.2 渲染策略

**通用产品线**(ppf / color-film):

- **RSC 优先**:page.tsx 仅 16-18 行,直接 `getProduct(slug)` + `<ProductDetail>` 渲染
- **SSG**:无 dynamic params,build 时静态生成
- **数据层 fallback**:`getProduct(slug)` 找不到时 `notFound()`

**窗膜总页**:

- **RSC**:`page.tsx` 168 行,聚合 6 痛点 + 8 列表头 + 7 套餐卡片
- **`getAllWindowFilmPackageSlugsWithDetails()`** 枚举所有套餐 slug
- **数据校验**:`window-film` 找不到时直接 `throw new Error`(配置错误)

**窗膜套餐子页**:

- **RSC + SSG**:`generateStaticParams` 枚举 7 个 slug,build 时生成 7 个 HTML
- **动态路由**:slug 不在 7 个套餐中 → `notFound()` → 404
- **JSON-LD**:`Product` + `Offer`(套餐维度,非单膜)

### 6.3 内容回链

| 来源 | 链接目标 |
|---|---|
| 车型页项目卡(隔热膜 / 车衣 / 改色膜) | `/product/window-film` / `/product/ppf` / `/product/color-film` |
| 窗膜总页套餐卡片 | `/product/window-film/{slug}` |
| 窗膜套餐子页 → 车型页 | 套餐子页底部加"常见适配车型"区块(待实现) |

### 6.4 视觉与可访问性

- 触控区:套餐卡片 ≥ 44px
- 焦点:键盘 Tab 可访问
- 动画:150–300ms,支持 `prefers-reduced-motion`
- 配色对比:`zinc-400 on zinc-950 ≥ 4.5:1`

### 6.5 埋点(待全量)

| 事件 | 触发 | 字段 | 状态 |
|---|---|---|---|
| `service_page_view` | 访问 `/product/window-film` | `serviceSlug`, `route` | ⚪ 待挂载 |
| `service_page_view` | 访问 `/product/ppf` / `/product/color-film` | 同上 | ⚪ 待挂载 |
| `window_film_package_click` | 点击套餐卡片 | `packageSlug` | ⚪ 待挂载 |

---

## 7. 性能基线

| 路由 | 当前 Lighthouse mobile perf | 目标 | 审计编号 |
|---|---:|---:|---|
| `/product/ppf` | 🟢 ≥ 90 | ≥ 80 | — |
| `/product/color-film` | 🟢 ≥ 90 | ≥ 80 | — |
| `/product/window-film` | 🟢 ≥ 90 | ≥ 80 | — |
| `/product/window-film/[packageSlug]` × 7 | 🟢 ≥ 90 | ≥ 80 | — |

> 通用产品线 + 套餐子页都是纯 SSG,无 dynamic data,LCP 表现稳定。

---

## 8. 验收标准(DoD)

### 8.1 通用产品线(车衣 / 改色膜)

- [ ] `/product/ppf` / `/product/color-film` 200 可达,无 console error
- [ ] Hero 显示 H1 + 副文案(从 `getProduct(slug).heroDescription`)
- [ ] Tagline 横幅显示渐变文字
- [ ] 核心价值区 4 张卡片(从 `product.values.map`)
- [ ] 服务流程 4 步(从 `product.process.map`)
- [ ] 面包屑「产品中心 → {项目名}」可点击
- [ ] 文案不含"原厂 / 官方 / 授权 / 100% 无损 / 永久质保"等表述
- [ ] LCP < 2.5s (desktop) / < 4s (mobile),CLS = 0
- [ ] `npx tsc --noEmit` 通过(允许 9 个 pre-existing 错)
- [ ] `npm run build` 通过

### 8.2 窗膜总页

- [ ] `/product/window-film` 200 可达
- [ ] `<FilmPageHero>` 显示产品名 + 描述 + 面包屑
- [ ] 6 大痛点(热 / 晒 / 眩光 / 隐私 / 安全 / 新能源)展示
- [ ] `<WindowFilmParameterExplainer>` 解释隔热率 / 紫外线阻隔率 / 可见光透过率
- [ ] `<WindowFilmGuide>` 选导购引导
- [ ] 7 个套餐卡片全部渲染(3 列响应式 grid)
- [ ] 套餐卡片可点击进入 `/product/window-film/{slug}`
- [ ] `<SpecsTable>` 单品参数一览(8 列)
- [ ] `<ServiceGuaranteeSection>` 施工保障
- [ ] SEO:独立 title / description / canonical
- [ ] LCP / CLS 满足基线

### 8.3 窗膜套餐子页 × 7

- [ ] 7 个 slug 都能 200 可达
- [ ] `<WindowFilmPackageDetail>` 显示套餐参数(隔热率 / 紫外线阻隔率 / 厚度 / 质保)
- [ ] 适用部位 + 适用场景描述
- [ ] JSON-LD `Product` + `Offer`
- [ ] 不存在的 slug → 404
- [ ] SSG 预生成(build 阶段)
- [ ] 三视口响应式
- [ ] LCP / CLS 满足基线

### 8.4 通用

- [ ] 不在产品页内设置页面私有操作(电话 / 微信弹窗 / 报价)
- [ ] 数据校验:`MinPackages = 3` 字面量类型生效,数据 < 3 时 TS 编译报错
- [ ] 字面量类型(1448/1086/"4/3")在 TS 编译期生效
- [ ] 通用模式与 5 组件主题专题模式不混用

---

## 9. 已知问题

| ID | 等级 | 问题 | 状态 |
|---|---|---|---|
| P2 | P2 | 套餐子页"常见适配车型"区块未实现,缺乏回链 | 计划中 |
| P2 | P2 | 套餐子页价格信息缺失(待业务确认) | 计划中 |
| P2 | P2 | `<ServiceProcessSection>` 在 `src/components/film/` 已就位但 window-film 总页未使用 | 待整合 |
| P2 | P2 | 埋点 3 类事件全未挂载 | 待实现 |
| P2 | P2 | 字面量类型 `Width/Height/AspectRatio` 在 `window-film-details.ts` 已就位,业务补图后必须填入 | 等业务 |
| P2 | P2 | `<StarRating>` 在 `src/components/film/` 中已就位,只用于 PPF 性能对比;其他膜类未用 | 等扩展 |

---

## 10. 当前实现差距

### 10.1 已完成 ✅

- [x] Phase 0:文档治理(本 SPEC + product-routes.ts)
- [x] Phase 1:3 膜类服务页 + 7 套餐子页 SSG 落地
- [x] Phase 2:`ProductDetail` 共享渲染器(车衣 / 改色膜)
- [x] Phase 3:`<FilmPageHero>` + `<SpecsTable>` + `<ServiceGuaranteeSection>` + 4 个 `<WindowFilm*>` 组件
- [x] Phase 4:套餐 7 个 slug 静态数据 + 字面量类型约束
- [x] Phase 5:JSON-LD `Product` + `Offer`(套餐子页)
- [x] Phase 6:SEO metadata(3 总页 + 7 子页)

### 10.2 待办

- [ ] 套餐子页加"常见适配车型"回链(回 `<product-topics.md>` 品牌 / 车型页)
- [ ] `<ServiceProcessSection>` 整合进 window-film 总页
- [ ] 3 类 `service_page_view` 埋点全量挂载
- [ ] 业务补图后逐项填 `image.width/height/aspectRatio`(1448/1086/"4/3")
- [ ] 价格信息补全(待业务)

---

## 11. 关联 SPEC

- [`product-center.md`](./product-center.md)— `/product` 入口页(`<FilmServiceMap>` 承接)
- [`product-topics.md`](./product-topics.md)— 品牌 / 车型专题页(项目回链)
- [`product-accessories.md`](./product-accessories.md)— 轻改装备服务页(共享 ProductDetail 模式)
- [`components/topic-pattern.md`](../../components/topic-pattern.md)— 通用产品线与主题专项两条技术路线
- [`product-prd-spec-map.md`](./product-prd-spec-map.md)— 全部产品 PRD ↔ SPEC 映射表

---

> 最后更新:2026-06-25
> 维护:每次新增膜类服务 / 套餐时同步更新本 SPEC 与 `src/lib/window-film-details.ts`

## 12. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|---|---|---|---|---|
| 2026-06-14 | Claude Code | WINDOW_FILM / PPF / COLOR_FILM v0(归档) | 完成 | — |
| 2026-06-20 | Claude Code | 3 膜类 v1(独立 PRD,共享 ProductDetail 模式) | 完成 | — |
| 2026-06-20 | Claude Code | 窗膜 7 套餐子页 + 5 组件(WindowFilmGuide / PackageCard / PackageDetail / ParameterExplainer / ScenarioGrid) | 完成 | 适配车型回链 |
| 2026-06-22 | Claude Code | SPEC 文档创建(brand.md / product-topics.md) | 完成 | — |
| 2026-06-25 | Claude Code | 整合 3 膜类 PRD + 7 套餐子页 + 字面量类型约束落地为本 SPEC | 完成 | 业务补图 + 价格 |
