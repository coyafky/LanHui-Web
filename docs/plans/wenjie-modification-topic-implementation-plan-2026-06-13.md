# 问界改装专题页 · 实现计划

> 由 PRD 转化为可执行任务清单。每个任务都是最小垂直切片，独立可验证。风格对齐已有的 `docs/plans/xiaomi-topic-implementation-plan-2026-06-13.md`。

## 0. 计划元数据

| 项 | 内容 |
| --- | --- |
| 计划名称 | 问界改装专题页 · 实现计划 |
| 版本 | v1.0（2026-06-13） |
| 日期 | 2026-06-13 |
| PRD 来源 | `docs/PRD/WENJIE_MODIFICATION_TOPIC_PRD_2026-06-13.md` |
| 关联 PRD | 无（本计划不依赖小米 / 首页电话 PRD，可独立交付） |
| 默认分支 | `feature/wenjie-topic`（建议）；多人协作时按 §10 分 worktree |
| 总切片数 | **6**（Phase 0 跳过，同小米计划范式） |
| 调度模式 | Phase 内串行；Phase 3 与 Phase 4 并行（独立 worktree） |

### 0.1 v1.0 关键决策（架构师启动 `/build` 前需人工确认）

| 决策项 | 默认选择 | 影响 |
| --- | --- | --- |
| Phase 0（PhoneCta + Hero）| **跳过**，等首页 PRD 单独 dispatch | 本计划不改 `src/components/Hero.tsx`；问界 CTA 统一使用 `WenjieConsultPlaceholder`（文案"电话咨询即将开放"，disabled，不发埋点）。所有 `wenjie_*_click` 事件名保留在 §8.5.3，待首页 PRD 完成后接入 `PhoneCta` 时启用。 |
| 44 个产品行 ↔ 38 张图 映射 | **不强行绑定**；所有产品行 `imageStatus: "pending"`，显示"图片待补充"占位 | 符合 PRD §7.2「无法匹配图片的产品必须显示'图片待补充'状态,不得误配其他产品图片」+ §15 风险表。`contact-sheet.jpg` 作为效果展示区主视觉。`m7/ m8/ m9/` 子目录**先创建空目录 + .gitkeep** 作为约定占位，不写入代码消费路径。 |
| `og-cover.png` | 本轮不做 | 与小米计划保持一致；`metadata.openGraph.images` 字段省略；OG 仍输出 title/description/type。 |
| 测试号码 | 假号 `tel:00000000000`（约定，但本轮不实际触发） | Phase 6 仅验证降级路径，无埋点 payload 录制需求。 |
| 调度模式 | Phase 内串行 + Phase 3/4 并行 | 与小米计划同构，流水线见 §2。 |

---

## 1. 发现摘要（已完成）

| 项 | 结论 |
| --- | --- |
| `docs/plans/` 目录 | 已存在（已有小米计划） |
| `PhoneCta` 实现 | **未实现**，全项目 grep 无结果 |
| 现有 `src/components/Header.tsx` | "产品中心" 下拉从 `products[]` 自动生成；问界专题不进 Header 下拉（仅 `/product` 内入口即可） |
| 现有 `src/components/Footer.tsx` | 同上，从 `products[]` 渲染；本轮不动 Footer |
| `src/lib/brand.ts` | `phone="联系方式待补充"`、`phoneTel="#contact"`，必走 §8.5.2 降级 |
| shadcn 已装组件 | `badge` `button` `card` `carousel` `table` 全部命中本计划所需 |
| `src/lib/images.ts` | 已有 `ImageAsset` 类型 + `OptimizedImage` 组件。本轮使用 `OptimizedImage`，**禁止裸 `next/image`**。 |
| `src/lib/schema.ts` | 已有 `organizationSchema` `productSchema` 与 `SITE_URL` 常量；可扩展 `wenjieItemListSchema`，复用 `SITE_URL`。 |
| `src/lib/analytics.ts` | 已有 `trackClick`，buffer + sendBeacon 机制可直接复用。 |
| `src/lib/products.ts` | 现有 `Product` 类型与问界数据维度不同；按 PRD §6.5 精神**独立 `WenjieProduct` 类型**，不复用 `Product`，不进 `productGroups`。 |
| Next.js 16 文档 | `node_modules/next/dist/docs/01-app/` 是 App Router 指引，coder 改路由前必读对应章节 |
| 问界图片资产 | `public/images/products/wenjie/` 已存在：`contact-sheet.jpg`（已就位）+ `extracted/wenjie-01..wenjie-38.png`（38 张，`mappingStatus: "unassigned"`）+ `manifest.json`（含 44 个 productRows + 38 个 images + 2 个 failedSignatures）。**全部产品行 imageStatus 为 pending**。 |
| `m7/ m8/ m9/` 子目录 | 当前**不存在**；按 PRD §7.2 创建并加 `.gitkeep`，作为未来映射的占位。 |
| `WenjieTopicBanner` 入口位置 | 按 PRD §5.1 推荐「位于产品中心 Hero 之后、通用产品分组之前」。**不污染** `productGroups`，**不复用** `ProductSummaryCard`。 |
| `WenjieHero` / 卡片 CTA | 同小米计划，统一使用 `WenjieConsultPlaceholder`。 |

---

## 2. 任务依赖图

```
Phase 1 (静态数据 + 子目录占位)
    ├── Phase 2 (专题页骨架 + Hero + 锚点 + 服务流程 + 底部 CTA + 合规声明)
    │       ├── Phase 3 (M7 + M8 + M9 卡片网格与表格)
    │       └── Phase 4 (/product 入口横幅)
    └── Phase 5 (扩展 schema.ts + JSON-LD ItemList)
            └── Phase 6 (三视口/降级路径/锚点埋点/lint/typecheck/build 验证)
                    └── Phase 7 (测试报告与交付)
```

`Phase 3` 与 `Phase 4` 完成 `Phase 2` 之后可并行（独立 worktree）。其余按顺序执行。

> **Phase 0 (PhoneCta 抽象) 在本轮跳过**（见 §0.1）。问界 CTA 统一使用 `WenjieConsultPlaceholder`（disabled 状态），待首页电话 PRD 单独 dispatch 完成 `PhoneCta` 后再接入。所有 `wenjie_*_click` 事件名暂留 Phase 7 报告，待 `PhoneCta` 落地后启用真实埋点。

---

## 3. 任务清单

### Phase 0 — 首页 PhoneCta 抽象（硬依赖 · 本轮跳过）

> ⚠️ **本轮跳过**（见 §0.1 v1.0 用户决策）。完整实现由首页电话 PRD 单独 dispatch 执行。下列内容仅作为后续接入 `PhoneCta` 时的设计参考，**本计划不创建 `PhoneCta.tsx`、不修改 `src/components/Hero.tsx`**。

| 子任务 | 文件 | 说明（参考） |
| --- | --- | --- |
| 0.1 | `src/components/PhoneCta.tsx`（新建） | 客户端组件。Props：`source: string`、`phoneType: "brand_main"`、`variant?: "hero" \| "card" \| "table"`、`label?: string`、`className?: string`、`children?: ReactNode`、`eventName?: string`。内部判断 `brand.phoneTel` 是否合法 `tel:` → 渲染 `<a href="tel:...">` 并 `onClick` 调 `trackClick(eventName, metadata)`；不合法 → 渲染 disabled 按钮，文案 `电话咨询即将开放`，不发埋点。**事件名由 props 决定**。 |
| 0.2 | `src/components/Hero.tsx`（修改） | 把 `浏览产品` 降为次 CTA，新增 `PhoneCta` 为主 CTA：`source="hero_primary_cta"`、事件名 `homepage_phone_click`、`aria-label="电话咨询蓝辉轻改"`。 |

**后续接入策略**：首页电话 PRD 完成后，在 `WenjieConsultPlaceholder` 中 `import PhoneCta` 并替换 disabled 节点，按相同 props 传入 `eventName="wenjie_topic_phone_click" \| "wenjie_product_consult_click"`。事件名在 §8.5.3 已经约定，不需要再改。

---

### Phase 1 — 静态数据 + 子目录占位

| 子任务 | 文件 | 说明 |
| --- | --- | --- |
| 1.1 | `public/images/products/wenjie/m7/.gitkeep`（新建） | 占位空目录，符合 PRD §7.2 推荐路径。**本轮无图片文件**，仅为约定占位。 |
| 1.2 | `public/images/products/wenjie/m8/.gitkeep`（新建） | 同上 |
| 1.3 | `public/images/products/wenjie/m9/.gitkeep`（新建） | 同上 |
| 1.4 | `src/lib/wenjie-types.ts`（新建） | 定义类型：<br/>```ts<br/>export type WenjieModel = "M7" \| "M8" \| "M9";<br/>export type WenjieCategory =<br/>  \| "电动踏板" \| "内饰便利" \| "地板尾箱" \| "防护配件"<br/>  \| "底盘防护" \| "外观套件" \| "内饰舒适" \| "内饰保护"<br/>  \| "电气便利" \| "密封降噪" \| "灯光配件";<br/>export type ImageStatus = "pending" \| "matched";<br/>export type WenjieProduct = {<br/>  id: string;<br/>  vehicleModel: WenjieModel;<br/>  orderInModel: number;<br/>  displayName: string;<br/>  category: WenjieCategory;<br/>  imageStatus: ImageStatus;<br/>};<br/>export const WENJIE_TOTAL = 44;<br/>``` |
| 1.5 | `src/lib/wenjie-products.ts`（新建） | 导出 `wenjieProducts: WenjieProduct[]`，**44 条**严格按 PRD §6.2/§6.3/§6.4 录入，`id` 命名 `m7-01` … `m7-06`、`m8-01` … `m8-22`、`m9-01` … `m9-16`；所有条目 `imageStatus: "pending"`。辅助：`getWenjieProductsByModel(model)`、`WENJIE_CATEGORY_LABEL`、`WENJIE_TOTAL`。**不读 `.hermes` 或本机绝对路径**，纯 TS 常量。 |
| 1.6 | `src/lib/wenjie-products.test.ts`（新建） | 单元测试：<br/>1. `wenjieProducts.length === 44`<br/>2. M7 数量 = 6、M8 数量 = 22、M9 数量 = 16<br/>3. 每个车型内 `orderInModel` 严格 1..N 连续<br/>4. `id` 全局唯一<br/>5. 每条 `displayName` 非空<br/>6. 每条 `category` ∈ `WenjieCategory` |
| 1.7 | 验收 | `ls public/images/products/wenjie/{m7,m8,m9}/.gitkeep` 3 个文件存在；`npm run typecheck` 通过；`npm run test -- --grep "wenjie"` 通过；`node -e "console.log(require('./src/lib/wenjie-products.ts'))"` 不运行（TS 文件），改用 `npx tsx src/lib/wenjie-products.test.ts` 验证。 |

---

### Phase 2 — 专题页骨架

| 子任务 | 文件 | 说明 |
| --- | --- | --- |
| 2.1 | `src/app/product/wenjie/page.tsx`（新建） | Server Component。导出 `metadata`（按 PRD §9.1；**本轮省略 `openGraph.images`**，见 §0.1）。页面结构：`<Header />` → `<WenjieHero />` → `<WenjieContactSheet />` → `<WenjieModelNav />` → `<WenjieModelSection model="M7" />` → `<WenjieModelSection model="M8" />` → `<WenjieModelSection model="M9" />` → `<WenjieServiceFlow />` → `<WenjieFooterCta />` → `<WenjieComplianceNote />` → `<Footer />` → JSON-LD `<script>`。 |
| 2.2 | `src/components/wenjie/WenjieHero.tsx`（新建） | Server。H1 `问界改装专题`、副标题、`44 个款式 · 3 个车型`、主 CTA `WenjieConsultPlaceholder source="wenjie_topic_hero"`（文案"电话咨询即将开放"、disabled、不发埋点）、次 CTA `Link href="/product"` 返回产品中心。深色渐变背景，复用 `/product` 与 `/product/xiaomi` Hero 视觉语言。**严格 Server Component，不引 `"use client"`**。 |
| 2.3 | `src/components/wenjie/WenjieContactSheet.tsx`（新建） | Server。展示 `/images/products/wenjie/contact-sheet.jpg`，alt `问界 M7 / M8 / M9 改装款式预览拼图`，固定容器宽高比，`priority`。使用 `OptimizedImage`，在 `src/lib/images.ts` 中**新增** `wenjieImages.contactSheet` 资产条目（`width: 1200`、`height: ?`——读 manifest.json 或读取图片元数据后填，本轮先用 1200×900 占位）。 |
| 2.4 | `src/components/wenjie/WenjieModelNav.tsx`（新建） | **客户端**（仅此组件 `"use client"`）。三个锚点按钮：`M7` `M8` `M9`，`onClick` 调 `trackClick("wenjie_model_section_click", { model, source: "anchor_nav" })`，不阻止默认 hash 跳转，焦点环可见，移动端不 sticky（PRD §8.2）。 |
| 2.5 | `src/components/wenjie/WenjieServiceFlow.tsx`（新建） | Server。4 步：`车型确认 / 款式选择 / 安装评估 / 施工交付`，lucide 图标分别用 `Car / LayoutGrid / ClipboardCheck / Wrench`（与小米 PRD §8.6 同构）。桌面端横向 4 列，移动端 2 列或 1 列。 |
| 2.6 | `src/components/wenjie/WenjieFooterCta.tsx`（新建） | Server。底部 `WenjieConsultPlaceholder source="wenjie_topic_footer"` + `Link href="/product"`。 |
| 2.7 | `src/components/wenjie/WenjieComplianceNote.tsx`（新建） | Server。固定文案（PRD §9.3）：`本页面展示的问界车型改装款式用于蓝辉轻改服务介绍，品牌与车型名称仅用于说明适配对象。` |
| 2.8 | `src/components/wenjie/WenjieConsultPlaceholder.tsx`（新建） | Server。Props：`source: string`、`label?: string`、`className?: string`。渲染一个 disabled 按钮，文案"电话咨询即将开放"，`aria-disabled="true"`、`title="品牌总机电话配置完成后开放电话咨询"`。**不发任何 analytics**（因为没有点击行为）。后续接入 `PhoneCta` 时只需替换内部实现。 |
| 2.9 | 验收 | 打开 `/product/wenjie` 可见 Hero、效果展示区、车型导航、服务流程、底部 CTA、合规声明（卡片网格与表格此时为占位文本，下一 Phase 实现）；CTA 全部显示"电话咨询即将开放"且不可点击；`npm run typecheck` 通过；查看 `<head>` 有完整 metadata（无 `openGraph.images`）；页面源码 `grep "tel:"` 应**零命中**。 |

---

### Phase 3 — M7 / M8 / M9 区块

| 子任务 | 文件 | 说明 |
| --- | --- | --- |
| 3.1 | `src/components/wenjie/WenjieProductCard.tsx`（新建） | Server。Props：`product: WenjieProduct`。展示：图片区域（`OptimizedImage` 4:3 `object-contain` `bg-zinc-900`）——本轮 `imageStatus === "pending"` 时显示「图片待补充」占位（虚线框 + 中文占位文字 + `lucide-image-off` 图标），**不调用 OptimizedImage**；`Badge` 车型、`Badge` 分类、`displayName`、CTA `WenjieConsultPlaceholder source="wenjie_product_card" label="咨询此款"`，`aria-label="咨询 {displayName} 改装方案"`。 |
| 3.2 | `src/components/wenjie/WenjieProductTable.tsx`（新建） | Server。桌面端使用 `@/components/ui/table`，含 `<th scope="col">`。字段：车型、序号、产品名称、分类、图片状态（"图片待补充"）、咨询。移动端 (`< 768px`) 用 `role="list"` + `role="listitem"` 卡片列表，6 个字段保留。"咨询"列也是 `WenjieConsultPlaceholder`。 |
| 3.3 | `src/components/wenjie/WenjieModelSection.tsx`（新建） | Server。Props `model: WenjieModel`。容器 `<section id="m7" \| id="m8" \| id="m9">`，调用 `getWenjieProductsByModel(model)` 渲染 `WenjieProductCard` 网格（桌面 3 列 / 平板 2 列 / 移动 1 列）+ `WenjieProductTable`（桌面端表格 / 移动端卡片列表）。**所有数据通过 `.map()` 渲染，严禁硬编码 44 个产品卡片**（PRD §12 强制）。 |
| 3.4 | 验收 | 数 M7 = 6、M8 = 22、M9 = 16 一致；点击锚点 `#m7/#m8/#m9` 滚动定位正确；卡片 CTA 与表格"咨询"列都是 disabled 状态（因总机未配置）；所有产品行表格"图片状态"列显示"图片待补充"；卡片图片区域显示占位文字+图标，无 OptimizedImage 调用；`grep "OptimizedImage" src/components/wenjie/WenjieProductCard.tsx` 应**零命中**（因本轮 imageStatus 都是 pending）。 |

---

### Phase 4 — `/product` 入口横幅

| 子任务 | 文件 | 说明 |
| --- | --- | --- |
| 4.1 | `src/components/wenjie/WenjieTopicBanner.tsx`（新建） | Server。独立横幅样式（深色渐变 + 橙色 accent，与小米横幅风格保持一致但区分主题色），标题 `问界改装专题`、副标题 `M7 / M8 / M9 电动踏板、内饰便利、防护配件`、`44 个款式 · 3 个车型`、CTA `Link href="/product/wenjie"` 按钮文案 `查看专题`。**不复用** `ProductSummaryCard`、**不进入** `productGroups`。 |
| 4.2 | `src/app/product/page.tsx`（修改） | 在 `Hero` 与 `productGroups.map` 之间插入 `<WenjieTopicBanner />`。**不修改** `productGroups` 或 `products` 数据。如果小米横幅已存在（按 §9 未决项确认），问界横幅放在小米横幅之后；否则直接放在 Hero 之后。 |
| 4.3 | 验收 | `/product` 页面 Hero 下方出现问界横幅；现有 6 个产品方向卡片完全不受影响（视觉、链接、文案均与改前一致）；`grep -c "wenjie" src/app/product/page.tsx` ≥ 1。 |

---

### Phase 5 — JSON-LD `ItemList`

| 子任务 | 文件 | 说明 |
| --- | --- | --- |
| 5.1 | `src/lib/schema.ts`（修改） | 新增 `wenjieItemListSchema(items: Array<{ position: number; name: string; imageUrl: string }>)`，复用现有 `SITE_URL`。结构按 PRD §9.2 但省略 image 字段（因为全部 pending），或保留一个 placeholder image URL（指向 `contact-sheet.jpg`）。 |
| 5.2 | `src/app/product/wenjie/page.tsx`（修改） | 调用 `wenjieItemListSchema`，在页面末尾输出 `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />`。`name` 字段使用 `displayName`。 |
| 5.3 | 验收 | 浏览器查看页面源码，`<script type="application/ld+json">` 存在，`numberOfItems = 44`，44 条 item 存在；通过 Google Rich Results Test 工具校验无致命错（warning 可接受）。 |

---

### Phase 6 — 三视口 + 降级路径 + 锚点埋点 + 构建验证

| 子任务 | 工具 | 说明 |
| --- | --- | --- |
| 6.1 | playwright-cli skill | 三视口截图：390 / 768 / 1440，每视口拍：`/product`（看到问界横幅）、`/product/wenjie`（Hero + 效果展示 + M7/M8/M9 区块 + 服务流程 + 底部 CTA + 合规声明）。截图保存到 `docs/test-reports/wenjie-topic-2026-06-13/`。 |
| 6.2 | playwright-cli | **降级路径验证（本轮唯一埋点路径，因为总机未配置）**：所有 CTA（Hero / 卡片 / 表格 / 底部）均显示"电话咨询即将开放"，`aria-disabled="true"`，Network 中无 `/api/analytics/track` 请求中的 `wenjie_topic_phone_click` 或 `wenjie_product_consult_click`，`tel:` 链接数 = 0。 |
| 6.3 | playwright-cli | **锚点埋点验证（独立事件，不依赖总机）**：点击 `M7` / `M8` / `M9` 锚点 → `wenjie_model_section_click` 事件触发，payload 含 `{ model, source: "anchor_nav" }`。**唯一实际触发的埋点事件**。 |
| 6.4 | shell | `npm run lint && npm run typecheck && npm run build` 全部通过；构建产物中 `/product/wenjie` 路由存在。 |
| 6.5 | shell | `grep -r "\.hermes\|Downloads\|/Users/" src/app/product/wenjie/ src/components/wenjie/ src/lib/wenjie-products.ts src/lib/wenjie-types.ts` 应**零命中**。 |
| 6.6 | shell | `grep -r "tel:" src/app/product/wenjie/ src/components/wenjie/` 应**零命中**（占位组件不输出 `tel:`）。`grep -r "wenjie_product_consult_click\|wenjie_topic_phone_click"` 应**只在占位组件注释与 §8.5.3 文档**中出现，不在任何 `trackClick(...)` 调用中。 |
| 6.7 | shell | `grep -c "imageStatus: \"pending\"" src/lib/wenjie-products.ts` = 44。 |

---

### Phase 7 — 测试报告 + 交付

| 子任务 | 输出 |
| --- | --- |
| 7.1 | `docs/test-reports/wenjie-topic-2026-06-13/TEST_REPORT.md`：列 PRD §13.1-13.3 全部用例的通过/失败、截图引用、锚点埋点 payload 截图 |
| 7.2 | 在 PR 描述里列出本计划完成的 PRD §14 全部验收项 |
| 7.3 | 列出 PRD §16 已识别的 refine 入口（不实现，作为下一轮素材） |

---

## 4. 文件变更总览

### 新建（14 个 + 3 个 .gitkeep）

```
docs/plans/wenjie-modification-topic-implementation-plan-2026-06-13.md   # 本文件
public/images/products/wenjie/m7/.gitkeep                                  # 占位目录
public/images/products/wenjie/m8/.gitkeep                                  # 占位目录
public/images/products/wenjie/m9/.gitkeep                                  # 占位目录
src/lib/wenjie-types.ts                                                    # 类型定义
src/lib/wenjie-products.ts                                                 # 44 行静态数据
src/lib/wenjie-products.test.ts                                            # 单元测试
src/app/product/wenjie/page.tsx                                            # 专题页
src/components/wenjie/WenjieHero.tsx
src/components/wenjie/WenjieContactSheet.tsx
src/components/wenjie/WenjieModelNav.tsx
src/components/wenjie/WenjieServiceFlow.tsx
src/components/wenjie/WenjieFooterCta.tsx
src/components/wenjie/WenjieComplianceNote.tsx
src/components/wenjie/WenjieConsultPlaceholder.tsx                         # 占位 CTA（本轮 disabled，等 PhoneCta）
src/components/wenjie/WenjieProductCard.tsx
src/components/wenjie/WenjieProductTable.tsx
src/components/wenjie/WenjieModelSection.tsx
src/components/wenjie/WenjieTopicBanner.tsx
docs/test-reports/wenjie-topic-2026-06-13/                                  # 测试报告 + 截图
```

> ❌ **本轮不创建** `src/components/PhoneCta.tsx`（归属首页 PRD）
> ❌ **本轮不创建** `public/images/products/wenjie/m{7,8,9}/*.png`（按 §0.1 决策，不强行映射图片）
> ❌ **本轮不创建** `public/images/products/wenjie/og-cover.png`（§0.1 决策省略）

### 修改（2 个）

```
src/app/product/page.tsx         # 在 Hero 与 productGroups.map 之间插入 WenjieTopicBanner
src/lib/schema.ts                # 新增 wenjieItemListSchema
src/lib/images.ts                # 新增 wenjieImages.contactSheet 资产条目
```

### 严禁动（保护清单）

```
src/lib/products.ts              # 不加车型字段；问界专题不进 productGroups
src/lib/brand.ts                 # 本轮不动；首页 PRD 完成前不允许写真号码
src/components/Hero.tsx          # 本轮不动；首页 PRD 完成后才接 PhoneCta
src/app/product/electric-steps/  # 与其他 5 个产品方向
src/app/page.tsx                 # 不重构首页结构
src/app/api/                     # 不新增 analytics 路由
src/lib/analytics.ts             # 不动，复用现有 trackClick
```

---

## 5. 验证命令

```bash
# 每个 Phase 完成后
npm run lint
npm run typecheck
npm run build

# Phase 1 单元测试
npx tsx src/lib/wenjie-products.test.ts   # 或项目配置的 test runner（检查 package.json）

# Phase 6 浏览器验证（启动 dev server）
npm run dev
# 然后用 playwright-cli skill 跑三视口截图
```

---

## 6. 浏览器视口检查清单

| 视口 | 路径 | 检查项 |
| --- | --- | --- |
| 390px | `/product` | 问界横幅完整，CTA 不溢出，与小米横幅并列/堆叠合理 |
| 390px | `/product/wenjie` | Hero 不挤压、网格 1 列、表格降级为卡片列表（6 个字段齐全）、锚点条不挡住主内容 |
| 768px | `/product/wenjie` | 网格 2 列、表格正常 |
| 1440px | `/product/wenjie` | 网格 3 列（按 PRD §8.3 推荐 3 或 4 列，本轮 3 列）、Hero 文案居左留白合理 |

每个视口额外检查（PRD §13.2）：
- Hero 文案不溢出
- 车型导航可操作
- 卡片图片区域显示"图片待补充"占位（虚线框 + 图标），不抖动
- 产品名称不遮挡图片
- 表格或移动端卡片完整显示
- CTA 可点击区域不小于 44px 高

---

## 7. 复用与新增组件清单

| 类别 | 复用 | 新增 |
| --- | --- | --- |
| shadcn UI | `badge` `button` `card` `table` | 无 |
| 项目组件 | `Header` `Footer` `OptimizedImage` | `WenjieTopicBanner` 及 `src/components/wenjie/` 全部 11 个 |
| 数据/工具 | `brand` `trackClick` `SITE_URL` `ImageAsset` `cn` | `wenjie-types.ts`、`wenjie-products.ts`、`wenjie-products.test.ts`、`wenjieItemListSchema`、`wenjieImages.contactSheet` |
| Next.js | `next/link` `Metadata` | 无 |

**不引入任何新 npm 依赖**。

---

## 8. 风险与回滚

| 风险 | 缓解 | 回滚方案 |
| --- | --- | --- |
| Phase 0 改 Hero 影响首页布局 | 仅添加 PhoneCta、降级次 CTA，不重构 | `git revert` Phase 0 提交，Hero 完全回原 |
| 38 张图与 44 行未映射被强行配对 | §0.1 决策**全部 pending** + `contact-sheet.jpg` 作为效果展示区主视觉 | 后续品牌方提供可信映射后更新 `imageStatus` 与 `imageAsset` |
| 车型分组映射错位（M7 错配 M8 图） | 代码层**不消费** `extracted/*.png`；所有卡片渲染"图片待补充"占位 | 删除占位目录，回归纯静态 |
| 锚点埋点被埋到 Server Component | 仅 `WenjieModelNav` 加 `"use client"`；其余严格 Server | Review 阶段抓 `"use client"` 数量 = 1（专题页内）+ 0（页面外） |
| 中文文件名误入仓库 | 本轮**不创建**任何新图片文件 | 后续创建图片时强制 ASCII slug |
| `brand.phone` 测试时改了真号没回滚 | Phase 6.2 完成后**立即**执行 `git diff src/lib/brand.ts` 确认零变更 | `git checkout src/lib/brand.ts` |
| JSON-LD URL 拼接错（http vs https / 相对 vs 绝对） | 在 `schema.ts` 中统一用 `SITE_URL` 常量 | 修正常量后重跑 build |
| 44 个产品行硬编码违反 PRD §12 | `WenjieProductCard` 与 `WenjieProductTable` 都通过 `wenjieProducts.map()` 渲染 | grep 卡片文件中的硬编码产品名 |
| WenjieTopicBanner 与未来小米横幅冲突 | 在 `/product` 中按插入顺序并列；后续如有更多车型专题，按 PR 顺序叠加 | 调整 `src/app/product/page.tsx` 中插入位置 |

---

## 9. 未决项（需在 `/build` 启动前确认）

| # | 问题 | 推荐默认 |
| --- | --- | --- |
| 1 | 是否拆出独立的首页电话 plan？ | **推荐拆**。本计划所有 CTA 都是占位，首页 PRD 还有自己的完整测试与文案要求，应单独走 `/test` `/review`。 |
| 2 | 44 行 ↔ 38 图 是否在 Phase 1 做"按 sourceIndex 顺序轮询"弱映射？ | **不**。保留 `pending` 状态，避免误导用户；品牌方提供可信映射后走 §16 后续迭代。 |
| 3 | `/product` 横幅顺序：问界在前还是小米在前？ | 按 PRD 时间顺序（问界 PRD 在小米之后），问界**放小米之后**。若小米横幅尚未实现，问界直接放在 Hero 之后。 |
| 4 | Phase 6.2 用什么号码做测试？ | 用 `tel:00000000000` 等明显假号，仅本地内存修改不提交。 |
| 5 | 是否更新 `MEMORY.md` 沉淀 Wenjie 专题模式？ | 建议在 Phase 7 完成后由我更新一条经验：项目内多车型专题的「图片未映射降级 + 占位 CTA」复用范式。 |
| 6 | `WenjieProductCard` 4:3 比例在 `imageStatus: "pending"` 时如何占位？ | 固定 `aspect-[4/3]` 容器 + 虚线边框 + `lucide-image-off` 图标 + 中文"图片待补充"。 |

---

## 10. 多 Agent 协作分工（`/dispatch` 已启用）

| 角色 | 负责 Phase | 分支 | 备注 |
| --- | --- | --- | --- |
| Architect (我) | 本计划 + 协调 + 收尾 | `feature/wenjie-topic` 主分支 | 不写业务代码 |
| Coder A | Phase 1（图片占位 + 静态数据 + 单元测试）| `feature/wenjie-topic-data` | **唯一阻塞**：Phase 2 开工前必须合并 |
| Coder B | Phase 2、Phase 5（页面骨架 + schema + images.ts）| `feature/wenjie-topic-page` | 依赖 Coder A |
| Coder C | Phase 3（M7/M8/M9 卡片 + 表格）| `feature/wenjie-topic-cards` | 依赖 Coder B；与 Coder D 并行 |
| Coder D | Phase 4（/product 入口横幅）| `feature/wenjie-topic-banner` | 依赖 Coder B；与 Coder C 并行 |
| Tester | Phase 6、Phase 7 | `feature/wenjie-topic-test`（无代码改动，仅截图与报告） | 在 Coder A/B/C/D 合并后启动 |
| Orchestrator (你 + 我) | 合并冲突解决、最终质量门禁 | 主分支 | 4 个 Coder worktree 完成后逐个合并 |

**Phase 3 / Phase 4 并行约定**：Coder C 与 Coder D 各自打开独立 worktree，互不阻塞；各自完成后由 Orchestrator 合并到 `feature/wenjie-topic`，解决可能出现在 `src/app/product/page.tsx` 与 `src/app/product/wenjie/page.tsx` 的冲突。

**Phase 0 跳过**：Coder A/B/C/D 都**不创建** `PhoneCta.tsx`、**不修改** `src/components/Hero.tsx`。

---

## 11. 审批检查点

✅ **v1.0 待审批**。下列为本计划启动 `/build` 前需确认：

- [ ] §0.1 关键决策确认（尤其"图片未映射 → 全部 pending + 缺图占位"）
- [ ] §9 未决项 1：首页电话 PRD 是否单独 dispatch
- [ ] §9 未决项 3：`/product` 横幅顺序
- [ ] §9 未决项 5：MEMORY 沉淀时机

> 进入 Phase 1 不需要再次审批；如 Phase 1 完成后遇到 §9 未决项，会再确认一次。

---

## 12. 下一步

直接进入 Phase 1：

1. 创建分支 `feature/wenjie-topic-data` worktree。
2. Coder A 执行：
   - 创建 `public/images/products/wenjie/{m7,m8,m9}/.gitkeep` 三个占位文件。
   - 写 `src/lib/wenjie-types.ts`、`src/lib/wenjie-products.ts`（44 行）。
   - 写 `src/lib/wenjie-products.test.ts`，运行通过。
3. 完成 → 合并到 `feature/wenjie-topic` 主分支 → 启动 Phase 2。

> ⚠️ **重要提醒**：问界专题数据为静态常量，**严禁**在 Coder A 任务中读取 `/Users/fkycoya/Library/Containers/com.tencent.xinWeChat/.../问界产品款式.xls` 或任何 `.hermes` / `Downloads` / 本机绝对路径。所有产品行通过 PRD §6.2/§6.3/§6.4 直接录入。