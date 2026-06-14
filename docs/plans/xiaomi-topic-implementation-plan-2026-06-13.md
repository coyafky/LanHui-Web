# 小米改装专题页 · 实现计划

> 由 PRD 转化为可执行任务清单。每个任务都是最小垂直切片，独立可验证。

## 0. 计划元数据

| 项 | 内容 |
| --- | --- |
| 计划名称 | 小米改装专题页 · 实现计划 |
| 版本 | v1.1（已审批，2026-06-13 dispatch 启动） |
| 日期 | 2026-06-13 |
| PRD 来源 | `docs/PRD/XIAOMI_MODIFICATION_TOPIC_PRD_2026-06-12.md`（v1.1） |
| 关联 PRD | `docs/PRD/HOMEPAGE_PHONE_CONVERSION_PRD_2026-06-12.md`（首页电话能力，本轮**不在范围内**） |
| 默认分支 | `feature/xiaomi-topic`（建议）；多人协作时按 §10 分 worktree |
| 总切片数 | **6**（原 Phase 0 跳过） |
| 调度模式 | Phase 内串行；Phase 3 与 Phase 4 并行（独立 worktree） |

### 0.1 v1.1 用户决策（dispatch 启动时确认）

| 决策项 | 选择 | 影响 |
| --- | --- | --- |
| Phase 0（PhoneCta + Hero）| **跳过**，等首页 PRD 单独 dispatch | 本计划不改 `src/components/Hero.tsx`；Xiaomi CTA 改为占位组件 `XiaomiConsultPlaceholder`（文案"电话咨询即将开放"，disabled，不发埋点）。所有事件名保留在 §8.5.3，待首页 PRD 完成后接入 PhoneCta 时启用。 |
| og-cover.png | 本轮不做 | `metadata.openGraph.images` 字段省略；OG 仍输出 title/description/type。 |
| 测试号码 | 假号 `tel:00000000000`（约定，但本轮不实际触发）| Phase 6 仅验证降级路径，无埋点 payload 录制需求。 |
| 调度模式 | Phase 内串行 + Phase 3/4 并行 | 流水线见 §2，Phase 3/4 各开独立 worktree。 |

## 1. 发现摘要（已完成）

| 项 | 结论 |
| --- | --- |
| `docs/plans/` 目录 | 不存在，已创建 |
| `PhoneCta` / `homepage_phone_click` 实现 | **未实现**，全项目 grep 无结果 |
| 现有 Hero CTA | 仅 `浏览产品` + `查看门店`（`src/components/Hero.tsx`） |
| `src/lib/brand.ts` | `phone="联系方式待补充"`、`phoneTel="#contact"`，必走 §8.5.2 降级 |
| shadcn 已装组件 | `badge` `button` `card` `carousel` `table` 全部命中本计划所需 |
| `src/lib/schema.ts` | 已有 `organizationSchema` `productSchema`；可扩展 `xiaomiItemListSchema`，复用 `SITE_URL` 常量 |
| `src/lib/analytics.ts` | 已有 `trackClick`，buffer + sendBeacon 机制可直接复用 |
| `src/lib/products.ts` | 现有 `Product` 类型与 Xiaomi 数据维度不同；按 PRD §6.5 独立 `XiaomiProduct` |
| Next.js 16 文档 | `node_modules/next/dist/docs/01-app/` 是 App Router 指引，coder 改路由前必读对应章节 |
| 知识库 18 张 PNG | 已确认全部存在，路径正确 |

## 2. 任务依赖图

```
Phase 1 (静态数据 + 图片资产)
    ├── Phase 2 (专题页骨架 + Hero + 服务流程 + JSON-LD)
    │       ├── Phase 3 (SU7 + YU7 卡片网格与表格)
    │       └── Phase 4 (/product 入口横幅)
    └── Phase 5 (扩展 schema.ts)
            └── Phase 6 (三视口/降级路径/lint/typecheck/build 验证)
                    └── Phase 7 (测试报告与交付)
```

`Phase 3` 与 `Phase 4` 完成 `Phase 2` 之后可并行（独立 worktree）。其余按顺序执行。

> **Phase 0 (PhoneCta 抽象) 在本轮跳过**（见 §0.1）。Xiaomi CTA 统一使用 `XiaomiConsultPlaceholder`（disabled 状态），待首页电话 PRD 单独 dispatch 完成 `PhoneCta` 后再接入。所有 `xiaomi_*_click` 事件名暂留 Phase 7 报告，待 `PhoneCta` 落地后启用真实埋点。

## 3. 任务清单

### Phase 0 — 首页 PhoneCta 抽象（硬依赖 · 本轮跳过）

> ⚠️ **本轮跳过**（见 §0.1 v1.1 用户决策）。完整实现由首页电话 PRD 单独 dispatch 执行。下列内容仅作为后续接入 `PhoneCta` 时的设计参考，**本计划不创建 `PhoneCta.tsx`、不修改 `src/components/Hero.tsx`**。

| 子任务 | 文件 | 说明（参考） |
| --- | --- | --- |
| 0.1 | `src/components/PhoneCta.tsx`（新建） | 客户端组件。Props：`source: string`、`phoneType: "brand_main"`、`variant?: "hero" \| "card" \| "table"`、`label?: string`、`className?: string`、`children?: ReactNode`、`eventName?: string`。内部判断 `brand.phoneTel` 是否合法 `tel:` → 渲染 `<a href="tel:...">` 并 `onClick` 调 `trackClick(eventName, metadata)`；不合法 → 渲染 disabled 按钮，文案 `电话咨询即将开放`，不发埋点。**事件名由 props 决定**。 |
| 0.2 | `src/components/Hero.tsx`（修改） | 把 `浏览产品` 降为次 CTA，新增 `PhoneCta` 为主 CTA：`source="hero_primary_cta"`、事件名 `homepage_phone_click`、`aria-label="电话咨询蓝辉轻改"`。 |

**后续接入策略**：首页电话 PRD 完成后，在 `XiaomiConsultPlaceholder` 中 `import PhoneCta` 并替换 disabled 节点，按相同 props 传入 `eventName="xiaomi_topic_phone_click" \| "xiaomi_product_consult_click"`。事件名在 §8.5.3 已经约定，不需要再改。

---

### Phase 1 — 静态数据 + 图片资产

| 子任务 | 文件 | 说明 |
| --- | --- | --- |
| 1.1 | `scripts/copy-xiaomi-images.mjs`（新建，开发期一次性脚本） | 从 `/Users/fkycoya/.hermes/.../xiaomi/Image/` 按 PRD §7.2 ASCII 映射表复制 18 张 PNG + `preview-contact-sheet.png → preview.png` 到 `public/images/products/xiaomi/{su7,yu7}/`。**脚本不进入构建链**，仅手动执行一次后将结果文件提交。 |
| 1.2 | `public/images/products/xiaomi/og-cover.png`（新增） | 由 `preview.png` 派生：手动裁剪到 1200×630 或直接使用 sharp 在脚本中生成；本轮可手动制作，提交进仓库。 |
| 1.3 | `src/lib/xiaomi-products.ts`（新建） | 导出 `XiaomiProduct` 类型 + `xiaomiProducts: XiaomiProduct[]`（18 条）+ 辅助 selector：`getXiaomiProductsByModel("SU7" \| "YU7")`、`XIAOMI_CATEGORY_LABEL: Record<"exterior" \| "interior", string>`。数据按 PRD §6.5 字段裁剪规则。**不读 `.hermes` 路径**，直接硬编码 TS 常量。 |
| 1.4 | 验收 | `ls public/images/products/xiaomi/su7 \| wc -l` = 12；`ls .../yu7 \| wc -l` = 6；`preview.png` 和 `og-cover.png` 存在；`npm run typecheck` 通过 |

---

### Phase 2 — 专题页骨架

| 子任务 | 文件 | 说明 |
| --- | --- | --- |
| 2.1 | `src/app/product/xiaomi/page.tsx`（新建） | Server Component。导出 `metadata`（按 PRD §9.1；**本轮省略 `openGraph.images`**，见 §0.1）。页面结构：`<Header />` → `<XiaomiHero />` → `<XiaomiPreviewShowcase />` → `<XiaomiAnchorNav />` → `<XiaomiModelSection model="SU7" />` → `<XiaomiModelSection model="YU7" />` → `<XiaomiServiceFlow />` → `<XiaomiFooterCta />` → `<Footer />` → JSON-LD `<script>`。 |
| 2.2 | `src/components/xiaomi/XiaomiHero.tsx`（新建） | Server。H1、副标题、`18 个款式` `2 个车型` 计数、主 CTA 用 `XiaomiConsultPlaceholder source="xiaomi_topic_hero"`（文案"电话咨询即将开放"、disabled、不发埋点）、次 CTA `Link href="/product"`。**严格 Server Component，不引 `"use client"`**。 |
| 2.3 | `src/components/xiaomi/XiaomiPreviewShowcase.tsx`（新建） | Server。展示 `preview.png`，alt `小米 SU7 与 YU7 改装款式预览拼图`，固定容器宽高比，`priority`。 |
| 2.4 | `src/components/xiaomi/XiaomiAnchorNav.tsx`（新建） | **客户端**（仅此组件 `"use client"`）。两个锚点按钮：`SU7` `YU7`，`onClick` 调 `trackClick("xiaomi_model_section_click", { model, source: "anchor_nav" })`，不阻止默认 hash 跳转，焦点环可见。 |
| 2.5 | `src/components/xiaomi/XiaomiServiceFlow.tsx`（新建） | Server。4 步：`车型确认 / 款式选择 / 安装评估 / 施工交付`，按 PRD §8.6 配 lucide 图标。 |
| 2.6 | `src/components/xiaomi/XiaomiFooterCta.tsx`（新建） | Server。底部 `XiaomiConsultPlaceholder source="xiaomi_topic_footer"` + `Link href="/product"`。 |
| 2.7 | `src/components/xiaomi/XiaomiConsultPlaceholder.tsx`（新建） | Server。Props：`source: string`、`label?: string`、`className?: string`。渲染一个 disabled 按钮，文案"电话咨询即将开放"，`aria-disabled="true"`、`title="品牌总机电话配置完成后开放电话咨询"`。**不发任何 analytics**（因为没有点击行为）。后续接入 `PhoneCta` 时只需替换内部实现。 |
| 2.8 | 合规声明 | 在底部 CTA 下方加 PRD §9.3 的合规说明段。 |
| 2.9 | 验收 | 打开 `/product/xiaomi` 可见全部区块；CTA 全部显示"电话咨询即将开放"且不可点击；`npm run typecheck` 通过；查看 `<head>` 有完整 metadata（无 `openGraph.images`）+ `tel:` 链接数 = 0。 |

---

### Phase 3 — SU7 / YU7 区块

| 子任务 | 文件 | 说明 |
| --- | --- | --- |
| 3.1 | `src/components/xiaomi/XiaomiProductCard.tsx`（新建） | Server 主体。展示：图片（`next/image` 4:3 `object-contain` `bg-zinc-900`）、`Badge` 车型、`Badge` 分类、展示名称、CTA `XiaomiConsultPlaceholder source="xiaomi_product_card" label="咨询此款"`，`aria-label="咨询 {displayName} 改装方案"`。 |
| 3.2 | `src/components/xiaomi/XiaomiProductTable.tsx`（新建） | Server。桌面端使用 `@/components/ui/table`，含 `<th scope="col">`。字段：序号、产品名称、主分类、展示图（56×42 缩略）、咨询。移动端 (`< 768px`) 用 `role="list"` 卡片列表，5 个字段保留。"咨询"列也是 `XiaomiConsultPlaceholder`。 |
| 3.3 | `src/components/xiaomi/XiaomiModelSection.tsx`（新建） | Server。Props `model: "SU7" \| "YU7"`。容器 `<section id="su7" \| id="yu7">`，调用 `getXiaomiProductsByModel(model)` 渲染 `XiaomiProductCard` 网格（桌面 3 列 / 平板 2 列 / 移动 1 列）+ `XiaomiProductTable`。 |
| 3.4 | 验收 | 数 SU7 = 12、YU7 = 6 一致；点击锚点 `#su7` 滚动定位正确；卡片 CTA 与表格"咨询"列都是 disabled 状态（因总机未配置）。 |

---

### Phase 4 — `/product` 入口横幅

| 子任务 | 文件 | 说明 |
| --- | --- | --- |
| 4.1 | `src/components/xiaomi/XiaomiTopicBanner.tsx`（新建） | Server。独立横幅样式（深色渐变 + 小米款式缩略），标题、副标题、`18 个款式 · 2 个车型`、CTA `Link href="/product/xiaomi"`。**不复用** `ProductSummaryCard`、**不进入** `productGroups`。 |
| 4.2 | `src/app/product/page.tsx`（修改） | 在 `Hero` 与 `productGroups.map` 之间插入 `<XiaomiTopicBanner />`。**不修改** `productGroups` 或 `products` 数据。 |
| 4.3 | 验收 | `/product` 页面 Hero 下方出现横幅；现有 6 个产品方向卡片完全不受影响（视觉、链接、文案均与改前一致）。 |

---

### Phase 5 — JSON-LD `ItemList`

| 子任务 | 文件 | 说明 |
| --- | --- | --- |
| 5.1 | `src/lib/schema.ts`（修改） | 新增 `xiaomiItemListSchema(items: Array<{ position: number; name: string; imageUrl: string }>)`，复用现有 `SITE_URL`。结构按 PRD §9.2。 |
| 5.2 | `src/app/product/xiaomi/page.tsx`（修改） | 调用 `xiaomiItemListSchema`，在页面末尾输出 `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />`。`imageUrl` 拼接 `${SITE_URL}/images/products/xiaomi/...`。 |
| 5.3 | 验收 | 浏览器查看页面源码，`<script type="application/ld+json">` 存在，`numberOfItems = 18`，18 条 item 的 image URL 都是绝对 URL；通过 Google Rich Results Test 工具校验无错。 |

---

### Phase 6 — 三视口 + 降级路径 + 构建验证

| 子任务 | 工具 | 说明 |
| --- | --- | --- |
| 6.1 | playwright-cli skill | 三视口截图：390 / 768 / 1440，每视口拍：`/product`（看到横幅）、`/product/xiaomi`（Hero + SU7 + YU7 + 服务流程 + 底部 CTA）。截图保存到 `docs/test-reports/xiaomi-topic-2026-06-13/`。 |
| 6.2 | playwright-cli | **降级路径验证（本轮唯一埋点路径，因为总机未配置）**：三处 CTA（Hero / 卡片 / 表格 / 底部）均显示"电话咨询即将开放"，`aria-disabled="true"`，Network 中无 `/api/analytics/track` 请求，`tel:` 链接数 = 0。 |
| 6.3 | playwright-cli | **锚点埋点验证（独立事件，不依赖总机）**：点击 `SU7` / `YU7` 锚点 → `xiaomi_model_section_click` 事件触发，payload 含 `{ model, source: "anchor_nav" }`。**唯一实际触发的埋点事件**。 |
| 6.4 | shell | `npm run lint && npm run typecheck && npm run build` 全部通过；构建产物中 `/product/xiaomi` 路由存在。 |
| 6.5 | shell | `grep -r "\.hermes\|Downloads\|/Users/" .next/` 应无业务路径命中（仅允许 Next.js 内部缓存元数据中性命中）。 |
| 6.6 | shell | `grep -r "tel:" src/app/product/xiaomi/` 应**零命中**（占位组件不输出 `tel:`）。`grep -r "xiaomi_product_consult_click\|xiaomi_topic_phone_click"` 应**只在占位组件注释与 §8.5.3 文档**中出现，不在任何 `trackClick(...)` 调用中。 |

---

### Phase 7 — 测试报告 + 交付

| 子任务 | 输出 |
| --- | --- |
| 7.1 | `docs/test-reports/xiaomi-topic-2026-06-13/TEST_REPORT.md`：列 §12.1-12.4 全部用例的通过/失败、截图引用、埋点 payload 截图 |
| 7.2 | 在 PR 描述里列出本计划完成的 PRD §13 全部验收项 |
| 7.3 | 列出 PRD §15 已识别的 refine 入口（不实现，作为下一轮素材） |

## 4. 文件变更总览

### 新建（17 个）

```
docs/plans/xiaomi-topic-implementation-plan-2026-06-13.md   # 本文件
scripts/copy-xiaomi-images.mjs                              # 一次性图片复制（不进入构建链）
public/images/products/xiaomi/su7/*.png                     # 12 张
public/images/products/xiaomi/yu7/*.png                     # 6 张
public/images/products/xiaomi/preview.png                   # 1 张
src/lib/xiaomi-products.ts                                  # 静态数据
src/app/product/xiaomi/page.tsx                             # 专题页
src/components/xiaomi/XiaomiHero.tsx
src/components/xiaomi/XiaomiPreviewShowcase.tsx
src/components/xiaomi/XiaomiAnchorNav.tsx
src/components/xiaomi/XiaomiServiceFlow.tsx
src/components/xiaomi/XiaomiFooterCta.tsx
src/components/xiaomi/XiaomiConsultPlaceholder.tsx          # 占位 CTA（本轮 disabled，等 PhoneCta）
src/components/xiaomi/XiaomiProductCard.tsx
src/components/xiaomi/XiaomiProductTable.tsx
src/components/xiaomi/XiaomiModelSection.tsx
src/components/xiaomi/XiaomiTopicBanner.tsx
docs/test-reports/xiaomi-topic-2026-06-13/                  # 测试报告 + 截图
```

> ❌ **本轮不创建** `src/components/PhoneCta.tsx`（归属首页 PRD）
> ❌ **本轮不创建** `public/images/products/xiaomi/og-cover.png`（§0.1 决策省略）

### 修改（2 个）

```
src/app/product/page.tsx         # 在 Hero 与 productGroups.map 之间插入 XiaomiTopicBanner
src/lib/schema.ts                # 新增 xiaomiItemListSchema
```

### 严禁动（保护清单）

```
src/lib/products.ts              # 不加车型字段
src/lib/brand.ts                 # 本轮不动；首页 PRD 完成前不允许写真号码
src/components/Hero.tsx          # 本轮不动；首页 PRD 完成后才接 PhoneCta
src/app/product/electric-steps/  # 与其他 5 个产品方向
src/app/page.tsx                 # 不重构首页结构
src/app/api/                     # 不新增 analytics 路由
```

## 5. 验证命令

```bash
# 每个 Phase 完成后
npm run lint
npm run typecheck
npm run build

# Phase 6 浏览器验证（启动 dev server）
npm run dev
# 然后用 playwright-cli skill 跑三视口截图
```

## 6. 浏览器视口检查清单

| 视口 | 路径 | 检查项 |
| --- | --- | --- |
| 390px | `/product` | 横幅完整，CTA 不溢出 |
| 390px | `/product/xiaomi` | Hero 不挤压、网格 1 列、表格降级为卡片列表 |
| 768px | `/product/xiaomi` | 网格 2 列、表格正常 |
| 1440px | `/product/xiaomi` | 网格 3 列、Hero 文案居左留白合理 |

## 7. 复用与新增组件清单

| 类别 | 复用 | 新增 |
| --- | --- | --- |
| shadcn UI | `badge` `button` `card` `table` | 无 |
| 项目组件 | `Header` `Footer` | `PhoneCta` `XiaomiTopicBanner` 及 `src/components/xiaomi/` 全部 7 个 |
| 数据/工具 | `brand` `trackClick` `SITE_URL` | `xiaomi-products.ts`、`xiaomiItemListSchema` |
| Next.js | `next/image` `next/link` `Metadata` | 无 |

**不引入任何新 npm 依赖**。

## 8. 风险与回滚

| 风险 | 缓解 | 回滚方案 |
| --- | --- | --- |
| Phase 0 改 Hero 影响首页布局 | 仅添加 PhoneCta、降级次 CTA，不重构 | `git revert` Phase 0 提交，Hero 完全回原 |
| 18 张大图导致 LCP 退化 | 卡片图 `loading="lazy"`，仅 `preview.png` 用 `priority`；后续 Lighthouse 复测 | 切换 `priority` 为 lazy，或裁剪 `preview.png` 尺寸 |
| 卡片 CTA 与 Hero 事件名混淆 | 通过 `PhoneCta` 的 `eventName` props 由调用方传入，避免组件内硬编码 | grep `xiaomi_product_consult_click` 确认仅出现在卡片处 |
| Coder 误把整个专题页 Client 化 | 严格只让 `XiaomiAnchorNav`、`XiaomiConsultButton`、`PhoneCta` 加 `"use client"` | Review 阶段抓 `"use client"` 数量 ≤ 3 |
| 中文文件名误入仓库 | 复制脚本严格按 §7.2 映射表；PR review grep 文件名是否含 CJK 字符 | 删除并重新复制 |
| `brand.phone` 测试时改了真号没回滚 | Phase 6.2 完成后**立即**执行 `git diff src/lib/brand.ts` 确认零变更 | `git checkout src/lib/brand.ts` |
| JSON-LD URL 拼接错（http vs https / 相对 vs 绝对） | 在 `schema.ts` 中统一用 `SITE_URL` 常量，写单元测试验证 | 修正常量后重跑 build |

## 9. 未决项（需在 `/build` 启动前确认）

| # | 问题 | 推荐默认 |
| --- | --- | --- |
| 1 | 是否拆出独立的首页电话 plan？ | **推荐拆**。本计划 Phase 0 仅做"最小可用"，首页 PRD 还有自己的完整测试与文案要求，应单独走 `/test` `/review` |
| 2 | `og-cover.png` 是手动制作还是脚本生成？ | 手动，避免引入 sharp 依赖 |
| 3 | 是否在 `/product` 之外再开 `/xiaomi` 顶级路由？ | 不。坚守 PRD `/product/xiaomi` |
| 4 | Phase 6.2 用什么号码做测试？ | 用 `tel:00000000000` 等明显假号，仅本地内存修改不提交 |
| 5 | 是否更新 `MEMORY.md` 沉淀 Xiaomi 专题模式？ | 建议在 Phase 7 完成后由我更新一条经验：项目内多车型专题的 PhoneCta 复用范式 |

## 10. 多 Agent 协作分工（`/dispatch` 已启用 · v1.1）

| 角色 | 负责 Phase | 分支 | 备注 |
| --- | --- | --- | --- |
| Architect (我) | 本计划 + 协调 + 收尾 | `feature/xiaomi-topic` 主分支 | 不写业务代码 |
| Coder A | Phase 1（图片 + 静态数据）| `feature/xiaomi-topic-data` | **唯一阻塞**：Phase 2 开工前必须合并 |
| Coder B | Phase 2、Phase 5（页面骨架 + schema）| `feature/xiaomi-topic-page` | 依赖 Coder A |
| Coder C | Phase 3（SU7/YU7 卡片 + 表格）| `feature/xiaomi-topic-cards` | 依赖 Coder B；与 Coder D 并行 |
| Coder D | Phase 4（/product 入口横幅）| `feature/xiaomi-topic-banner` | 依赖 Coder B；与 Coder C 并行 |
| Tester | Phase 6、Phase 7 | `feature/xiaomi-topic-test`（无代码改动，仅截图与报告） | 在 Coder A/B/C/D 合并后启动 |
| Orchestrator (你 + 我) | 合并冲突解决、最终质量门禁 | 主分支 | 4 个 Coder worktree 完成后逐个合并 |

**Phase 3 / Phase 4 并行约定**：Coder C 与 Coder D 各自打开独立 worktree，互不阻塞；各自完成后由 Orchestrator 合并到 `feature/xiaomi-topic`，解决可能出现在 `src/app/product/page.tsx` 与 `src/app/product/xiaomi/page.tsx` 的冲突。

**Phase 0 跳过**：Coder A/B/C/D 都**不创建** `PhoneCta.tsx`、**不修改** `src/components/Hero.tsx`。

## 11. 审批检查点

✅ **v1.1 已审批**（2026-06-13 dispatch 启动时确认，见 §0.1）。下列 v1.0 待办项已闭环：

- ✅ §9 未决项 1：首页电话 PRD 单独 dispatch（**不在本计划内**）
- ✅ §9 未决项 2：og-cover 本轮不做（`openGraph.images` 字段省略）
- ✅ §9 未决项 4：测试号码策略已确认（`tel:00000000000` 假号约定，本轮不实际触发）
- ✅ §10 多 agent 分工：已启用 `/dispatch`，调度模式"Phase 内串行 + Phase 3/4 并行"
- ✅ Phase 0 跳过：CTA 统一使用 `XiaomiConsultPlaceholder`，事件名保留待 `PhoneCta` 落地

---

## 12. 下一步

直接进入 Phase 1：

1. 创建分支 `feature/xiaomi-topic-data` worktree。
2. Coder A 执行：复制 18 张图片 + `preview.png` 到 `public/images/products/xiaomi/`；写 `scripts/copy-xiaomi-images.mjs`；建 `src/lib/xiaomi-products.ts`。
3. 完成 → 合并到 `feature/xiaomi-topic` 主分支 → 启动 Phase 2。

> 进入 Phase 1 不需要再次审批；如 Phase 1 完成后遇到 §9 未决项 5（是否沉淀 MEMORY），会再确认一次。
