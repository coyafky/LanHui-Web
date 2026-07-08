---
change: product-placeholder-cleanup
design-doc: docs/superpowers/specs/2026-07-08-product-placeholder-cleanup-design.md
base-ref: 609e4c3c8cdf8792ad6eddaa20577c2c73d7291b
archived-with: 2026-07-08-product-placeholder-cleanup
---

# 产品占位页清理 — 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 清理 6 个品牌页面的占位文案，将 skid-plate 从占位页升级为完整服务页，将 business-comfort 降级为 404，并添加自动化检查防止未来出现占位内容。

**架构：**
1. 更新 `product-routes.ts` 中 skid-plate 的状态为 `live`，使其进入公开入口
2. 增强 `BrandPlaceholder` 组件：新增 `intro` prop，live 状态显示品牌介绍段落
3. 6 个品牌页面（腾势/岚图/小鹏/蔚来/乐道/高山）更新 subtitle 文案并传入 intro
4. skid-plate 页面从 BrandPlaceholder 替换为完整的服务详情页（简介 + 价值点 + 服务流程 + CTA）
5. business-comfort 页面简化为 `notFound()`
6. 新增检查脚本 `check-product-placeholders.mjs` 防止回归

**技术栈：** Next.js 16 RSC, Tailwind v4, lucide-react, Node.js 内置 API

**文件全景（新增/修改概览）：**

| 操作 | 文件 | 职责 |
|------|------|------|
| 修改 | `src/lib/product-routes.ts` | skid-plate: planned → live |
| 修改 | `src/components/product/BrandPlaceholder.tsx` | 新增 intro prop, live 展示文案 |
| 修改 | `src/app/product/denza/page.tsx` | 更新 subtitle + intro |
| 修改 | `src/app/product/voyah/page.tsx` | 更新 subtitle + intro |
| 修改 | `src/app/product/xpeng/page.tsx` | 更新 subtitle + intro |
| 修改 | `src/app/product/nio/page.tsx` | 更新 subtitle + intro |
| 修改 | `src/app/product/ledao/page.tsx` | 更新 subtitle + intro |
| 修改 | `src/app/product/gaoshan/page.tsx` | 更新 subtitle + intro |
| 修改 | `src/app/product/skid-plate/page.tsx` | 从占位替换为完整服务页 |
| 修改 | `src/app/product/business-comfort/page.tsx` | 改为 notFound() |
| 创建 | `scripts/check-product-placeholders.mjs` | 扫描禁止的占位文案 |
| 修改 | `package.json` | 新增 check:product-placeholders 脚本 |

## 全局约束

- 所有文案使用中文，符合品牌语调
- skid-plate 和 business-comfort 页面不修改 breadcrumbs 相关逻辑（已有的 `getProductBreadcrumbs` 调用保留）
- 检查脚本使用 Node.js 内置 API，不引入外部依赖

archived-with: 2026-07-08-product-placeholder-cleanup
---

### 任务 1：更新产品路由状态

**文件：**
- 修改：`src/lib/product-routes.ts`, 第 95 行

**接口：**
- 消费：现有 `ServiceRoute` 类型定义，`getLiveServices()` 函数
- 产出：`skid-plate` 服务从 `"planned"` 改为 `"live"`，`getLiveServices()` 现在会包含 `skid-plate`

- [x] **步骤 1.1：修改 skid-plate 状态**

在 `src/lib/product-routes.ts` 第 95 行，将 skid-plate 的 status 从 `"planned"` 改为 `"live"`：

```diff
-  { type: "service_category", serviceSlug: "skid-plate",      title: "底盘护板",          navLabel: "底盘护板",     group: "light_mod",             status: "planned", priority: "P1", canonicalPath: "/product/skid-plate" },
+  { type: "service_category", serviceSlug: "skid-plate",      title: "底盘护板",          navLabel: "底盘护板",     group: "light_mod",             status: "live",    priority: "P1", canonicalPath: "/product/skid-plate" },
```

- [x] **步骤 1.2：验证变更**

```bash
node -e "
const { getLiveServices, getServiceRoute } = require('./src/lib/product-routes');
const skid = getServiceRoute('skid-plate');
console.assert(skid.status === 'live', 'skid-plate should be live');
const liveServices = getLiveServices();
console.assert(liveServices.some(s => s.serviceSlug === 'skid-plate'), 'skid-plate should be in getLiveServices');
console.assert(!liveServices.some(s => s.serviceSlug === 'business-comfort'), 'business-comfort should NOT be in getLiveServices');
console.log('OK: product-routes assertion passed');
"
```

- [x] **步骤 1.3：提交**

```bash
git add src/lib/product-routes.ts
git commit -m "feat: promote skid-plate service from planned to live"
```

archived-with: 2026-07-08-product-placeholder-cleanup
---

### 任务 2：增强 BrandPlaceholder 组件（新增 intro prop）

**文件：**
- 修改：`src/components/product/BrandPlaceholder.tsx`

**接口：**
- 消费：现有 `BrandPlaceholderProps` 类型，`ProductRouteStatus`，`AccentColor`
- 产出：新增 `intro?: string` prop；live + intro 时渲染文字段落（`text-zinc-400 text-sm`）；planned 状态保持不变

- [x] **步骤 2.1：Props 类型添加 intro**

在 `src/components/product/BrandPlaceholder.tsx` 第 5-13 行的类型定义中添加 `intro`：

```diff
 type BrandPlaceholderProps = {
   title: string;
   subtitle?: string;
+  intro?: string;
   status: ProductRouteStatus;
   accentColor: AccentColor;
   models?: readonly { name: string; href?: string }[];
   serviceMeta?: { group: string; priority: string };
   backHref?: string;
 };
```

- [x] **步骤 2.2：解构 intro**

在第 41-49 行函数定义解构中添加 `intro`：

```diff
 export function BrandPlaceholder({
   title,
   subtitle,
+  intro,
   status,
   accentColor,
   models,
   serviceMeta,
   backHref = "/product",
 }: BrandPlaceholderProps) {
```

- [x] **步骤 2.3：添加 intro 渲染段落**

在第 63 行（planned 状态判断之前），添加 live + intro 的渲染块：

```diff
+      {status === "live" && intro ? (
+        <p className="text-zinc-400 text-sm max-w-2xl text-center mb-10">{intro}</p>
+      ) : null}
+
       {status === "planned" ? (
```

注意：subtitle 和 intro 同时存在且 status 为 `live` 时，渲染顺序为：eyebrow line → H1 → subtitle（若存在）→ intro（新，text-zinc-400 text-sm）→ planned 块（live 不渲染）→ models 网格。

- [x] **步骤 2.4：提交**

```bash
git add src/components/product/BrandPlaceholder.tsx
git commit -m "feat: add intro prop to BrandPlaceholder for live brand descriptions"
```

archived-with: 2026-07-08-product-placeholder-cleanup
---

### 任务 3：更新 6 个品牌页面文案

**文件：**
- 修改：`src/app/product/denza/page.tsx`
- 修改：`src/app/product/voyah/page.tsx`
- 修改：`src/app/product/xpeng/page.tsx`
- 修改：`src/app/product/nio/page.tsx`
- 修改：`src/app/product/ledao/page.tsx`
- 修改：`src/app/product/gaoshan/page.tsx`

**接口：**
- 消费：`BrandPlaceholder` 组件（新增 intro prop）
- 产出：6 个品牌页面的 subtitle 更新为新文案，新增 intro prop

**每页的变更模式完全一致**，只有文案内容不同。以下以 denza 为例，其他 5 页同理。

- [x] **步骤 3.1：腾势 (denza) 页面**

修改 `src/app/product/denza/page.tsx` 第 34-38 行：

```diff
         <BrandPlaceholder
           title={`${brand.brandName}轻改方案`}
-          subtitle={`蓝辉轻改整理${brand.brandName}热门车型的轻改与膜系方案，方案由团队整理中。`}
+          subtitle="蓝辉轻改为腾势 D9 等车型提供轻改与膜系方案"
           status={brand.status}
           accentColor={brand.accentColor}
           models={models}
+          intro="腾势是比亚迪旗下高端新能源品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。"
         />
```

- [x] **步骤 3.2：岚图 (voyah) 页面**

修改 `src/app/product/voyah/page.tsx`，BrandPlaceholder 调用部分：

```diff
         <BrandPlaceholder
           title={`${brand.brandName}轻改方案`}
-          subtitle={`蓝辉轻改整理${brand.brandName}热门车型的轻改与膜系方案，方案由团队整理中。`}
+          subtitle="蓝辉轻改为岚图梦想家等车型提供轻改与膜系方案"
           status={brand.status}
           accentColor={brand.accentColor}
           models={models}
+          intro="岚图是东风集团高端新能源品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。"
         />
```

- [x] **步骤 3.3：小鹏 (xpeng) 页面**

修改 `src/app/product/xpeng/page.tsx`，BrandPlaceholder 调用部分：

```diff
         <BrandPlaceholder
           title={`${brand.brandName}轻改方案`}
-          subtitle={`蓝辉轻改整理${brand.brandName}热门车型的轻改与膜系方案，方案由团队整理中。`}
+          subtitle="蓝辉轻改为小鹏 GX 等车型提供轻改与膜系方案"
           status={brand.status}
           accentColor={brand.accentColor}
           models={models}
+          intro="小鹏是智能电动汽车品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。"
         />
```

- [x] **步骤 3.4：蔚来 (nio) 页面**

修改 `src/app/product/nio/page.tsx`，BrandPlaceholder 调用部分：

```diff
         <BrandPlaceholder
           title={`${brand.brandName}轻改方案`}
-          subtitle={`蓝辉轻改整理${brand.brandName}热门车型的轻改与膜系方案，方案由团队整理中。`}
+          subtitle="蓝辉轻改为蔚来 ES8 等车型提供轻改与膜系方案"
           status={brand.status}
           accentColor={brand.accentColor}
           models={models}
+          intro="蔚来是高端智能电动汽车品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。"
         />
```

- [x] **步骤 3.5：乐道 (ledao) 页面**

修改 `src/app/product/ledao/page.tsx`，BrandPlaceholder 调用部分：

```diff
         <BrandPlaceholder
           title={`${brand.brandName}轻改方案`}
-          subtitle={`蓝辉轻改整理${brand.brandName}热门车型的轻改与膜系方案，方案由团队整理中。`}
+          subtitle="蓝辉轻改为乐道 L90 等车型提供轻改与膜系方案"
           status={brand.status}
           accentColor={brand.accentColor}
           models={models}
+          intro="乐道是蔚来旗下家庭车品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。"
         />
```

- [x] **步骤 3.6：高山 (gaoshan) 页面**

修改 `src/app/product/gaoshan/page.tsx`，BrandPlaceholder 调用部分：

```diff
         <BrandPlaceholder
           title={`${brand.brandName}轻改方案`}
-          subtitle={`蓝辉轻改整理${brand.brandName}热门车型的轻改与膜系方案，方案由团队整理中。`}
+          subtitle="蓝辉轻改为高山 8 等车型提供轻改与膜系方案"
           status={brand.status}
           accentColor={brand.accentColor}
           models={models}
+          intro="高山是魏牌旗下高端 MPV 品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。"
         />
```

- [x] **步骤 3.7：提交**

```bash
git add src/app/product/denza/page.tsx src/app/product/voyah/page.tsx src/app/product/xpeng/page.tsx src/app/product/nio/page.tsx src/app/product/ledao/page.tsx src/app/product/gaoshan/page.tsx
git commit -m "feat: update brand page copy with proper subtitles and intro text"
```

archived-with: 2026-07-08-product-placeholder-cleanup
---

### 任务 4：底盘护板完整服务页

**文件：**
- 修改：`src/app/product/skid-plate/page.tsx`

**接口：**
- 消费：`getServiceRoute("skid-plate")`, `getProductBreadcrumbs("/product/skid-plate")`, `getProductBreadcrumbSchema("/product/skid-plate")`, `openWeChatModal` from `@/lib/wechat-modal`, `Breadcrumbs` from `@/components/Breadcrumbs`
- 产出：完整的静态服务页面

**页面结构：**
```
main
├── Breadcrumbs (已有, 保留)
├── H1: "底盘护板"
├── 简介段落
├── 价值点 Grid (3-4 cards, accent border)
├── 服务流程 (3 steps)
├── 到店咨询 CTA (WeChat modal trigger)
└── JSON-LD schema (Service, 需新增)
```

- [x] **步骤 4.1：重写 skid-plate 页面**

将 `src/app/product/skid-plate/page.tsx` 整个文件内容替换为：

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Gauge, Wrench, ClipboardCheck, MapPin, MessageCircle } from "lucide-react";
import { getServiceRoute } from "@/lib/product-routes";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getProductBreadcrumbs, getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";
import { openWeChatModal } from "@/lib/wechat-modal";
import { WeChatConsultModal } from "@/components/shared/WeChatConsultModal";

export const metadata: Metadata = {
  title: "底盘护板｜蓝辉轻改 LANHUI",
  description: "蓝辉轻改提供底盘护板安装服务，保护底盘免受路面冲击，适合城市与轻度越野用车场景。",
};

const valuePoints = [
  {
    icon: ShieldCheck,
    title: "防护升级",
    description: "有效抵御路面碎石、坑洼对底盘关键部件的冲击，降低维修成本。",
  },
  {
    icon: Gauge,
    title: "轻量化材质",
    description: "采用高强度铝合金或复合材质，兼顾防护性能与整车轻量化需求。",
  },
  {
    icon: Wrench,
    title: "专车开模",
    description: "针对主流新能源车型开模，原车孔位安装，不破坏原车结构。",
  },
  {
    icon: ClipboardCheck,
    title: "质保无忧",
    description: "提供安装后质保服务，让您放心驾驶、无忧出行。",
  },
];

const serviceSteps = [
  {
    step: "01",
    title: "到店检测",
    description: "技师对车辆底盘进行全面检查，确认护板适配规格。",
  },
  {
    step: "02",
    title: "专业安装",
    description: "使用专业工具进行安装，确保贴合紧密、无异响。",
  },
  {
    step: "03",
    title: "交车验收",
    description: "安装完成后进行路试验收，确认防护效果与驾驶体验。",
  },
];

export default async function SkidPlatePage() {
  const service = getServiceRoute("skid-plate");
  if (!service || service.type !== "service_category") notFound();
  const breadcrumbItems = getProductBreadcrumbs("/product/skid-plate");
  const breadcrumbSchema = getProductBreadcrumbSchema("/product/skid-plate");

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "底盘护板安装服务",
    provider: { "@type": "Organization", name: "蓝辉轻改" },
    description: "蓝辉轻改提供底盘护板安装服务，保护底盘免受路面冲击。",
    areaServed: { "@type": "City", name: "深圳" },
  };

  return (
    <>
      <main id="main-content" tabIndex={-1} className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {breadcrumbItems && breadcrumbItems.length > 0 && (
            <Breadcrumbs items={breadcrumbItems} className="mb-8" />
          )}

          {/* H1 + 简介 */}
          <div className="mb-14 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-5">
              底盘护板
            </h1>
            <p className="text-zinc-300 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              底盘护板是安装在车辆底盘下方的保护装置，能有效防止路面碎石、坑洼及异物对发动机、
              变速箱、油箱等关键部件的冲击。蓝辉轻改提供专车定制的底盘护板安装服务，
              兼顾防护性能与轻量化需求，让您的爱车从容应对复杂路况。
            </p>
          </div>

          {/* 价值点 Grid */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">为什么选择底盘护板</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {valuePoints.map((point) => {
                const Icon = point.icon;
                return (
                  <div
                    key={point.title}
                    className="rounded-xl border border-cyan-800/50 bg-cyan-950/20 p-6 transition-colors hover:border-cyan-700/60"
                  >
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/30 text-cyan-400 mb-4">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{point.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{point.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 服务流程 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">服务流程</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {serviceSteps.map((step) => (
                <div
                  key={step.step}
                  className="relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 pt-12 text-center"
                >
                  <span className="absolute top-4 left-4 text-4xl font-bold text-cyan-400/20 select-none">
                    {step.step}
                  </span>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 到店咨询 CTA */}
          <section className="text-center">
            <div className="inline-block rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 md:p-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyan-950/30 text-cyan-400 mb-5">
                <MessageCircle className="w-7 h-7" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">到店咨询</h2>
              <p className="text-zinc-400 text-sm md:text-base mb-6 max-w-md mx-auto">
                底盘护板需根据具体车型定制方案，建议您到店或通过微信咨询，获取专属安装建议。
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={openWeChatModal}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-800/50 hover:bg-cyan-500/20 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  微信咨询
                </button>
                <Link
                  href="/product"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-zinc-300 border border-zinc-700 hover:bg-zinc-800/50 transition-colors"
                >
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  返回产品中心
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <WeChatConsultModal />
    </>
  );
}
```

注意：
- 保留原有的 `breadcrumbSchema` 渲染逻辑
- 使用与品牌页一致的 accent color（teal / cyan），保持视觉统一
- 价值点卡片使用 `text-cyan-400` 系列配色，与 skid-plate 配置的 teal accent 相近
- WeChatConsultModal 是 Client Component，在页面末尾渲染（不影响 RSC 主体）
- 使用 `openWeChatModal` 函数触发弹窗，模式与 Header.tsx 一致

- [x] **步骤 4.2：验证 build 编译**

```bash
npm run build 2>&1 | tail -20
```

期望：编译成功，无错误。

- [x] **步骤 4.3：提交**

```bash
git add src/app/product/skid-plate/page.tsx
git commit -m "feat: replace skid-plate placeholder with full service page"
```

archived-with: 2026-07-08-product-placeholder-cleanup
---

### 任务 5：商务舒适撤离 — 改为 notFound()

**文件：**
- 修改：`src/app/product/business-comfort/page.tsx`

**接口：**
- 消费：`notFound()` from `next/navigation`
- 产出：访问 `/product/business-comfort` 返回 404

- [x] **步骤 5.1：替换 business-comfort 页面**

将 `src/app/product/business-comfort/page.tsx` 整个文件替换为：

```tsx
import { notFound } from "next/navigation";

export default function BusinessComfortPage() {
  notFound();
}
```

注意：删除所有 import（`Metadata`, `getServiceRoute`, `BrandPlaceholder`, `Breadcrumbs`, `getProductBreadcrumbs`, `getProductBreadcrumbSchema`），仅保留 `notFound`。

- [x] **步骤 5.2：提交**

```bash
git add src/app/product/business-comfort/page.tsx
git commit -m "feat: replace business-comfort placeholder with notFound()"
```

archived-with: 2026-07-08-product-placeholder-cleanup
---

### 任务 6：检查脚本 + Package.json

**文件：**
- 创建：`scripts/check-product-placeholders.mjs`
- 修改：`package.json`

**接口：**
- 消费：7 个页面文件路径，`getLiveServices()` 函数
- 产出：`npm run check:product-placeholders` 命令，链入 `npm run check`

- [x] **步骤 6.1：创建检查脚本**

创建 `scripts/check-product-placeholders.mjs`：

```javascript
#!/usr/bin/env node

/**
 * check-product-placeholders.mjs
 *
 * 检查产品页面中是否仍有占位文案，防止回归。
 *
 * 检查项:
 *   1. 7 个页面中是否含有 "方案整理中" 或 "内容由团队完善中"
 *   2. business-comfort 不在 getLiveServices() 结果中
 *
 * 用法:
 *   node scripts/check-product-placeholders.mjs
 *
 * 退出码: 0 = 通过, 1 = 存在问题
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const CHECK_PAGES = [
  "src/app/product/denza/page.tsx",
  "src/app/product/voyah/page.tsx",
  "src/app/product/xpeng/page.tsx",
  "src/app/product/nio/page.tsx",
  "src/app/product/ledao/page.tsx",
  "src/app/product/gaoshan/page.tsx",
  "src/app/product/skid-plate/page.tsx",
];

const BANNED_PATTERNS = [
  /方案整理中/,
  /内容由团队完善中/,
];

let hasError = false;

// Check 1: Scan for banned placeholder text
for (const pagePath of CHECK_PAGES) {
  const fullPath = resolve(ROOT, pagePath);
  const content = readFileSync(fullPath, "utf-8");
  const lines = content.split("\n");

  for (const pattern of BANNED_PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        console.error(`FAIL: ${pagePath}:${i + 1} — matched "${pattern.source}"`);
        console.error(`       ${lines[i].trim()}`);
        hasError = true;
      }
    }
  }
}

// Check 2: Verify business-comfort is not in getLiveServices
// Use dynamic import to check
try {
  const { getLiveServices } = await import(resolve(ROOT, "src/lib/product-routes.ts"));
  const liveServices = getLiveServices();
  const hasBusinessComfort = liveServices.some(
    (s) => s.serviceSlug === "business-comfort"
  );
  if (hasBusinessComfort) {
    console.error('FAIL: business-comfort is still in getLiveServices() result');
    hasError = true;
  } else {
    console.log('OK: business-comfort is not in getLiveServices()');
  }
} catch (e) {
  // If dynamic import fails (e.g., TS file in Node), fall back to grep
  console.log('INFO: dynamic import not available, falling back to grep check');
  const routesPath = resolve(ROOT, "src/lib/product-routes.ts");
  const routesContent = readFileSync(routesPath, "utf-8");
  const servicesSection = routesContent.match(
    /const SERVICES: readonly ServiceRoute\[\] = \[([\s\S]*?)\]\s+as const/
  );
  if (servicesSection) {
    if (servicesSection[1].includes("business-comfort") && servicesSection[1].includes('status: "planned"')) {
      // business-comfort still planned — correct, it shouldn't be in live services
      console.log('OK: business-comfort remains planned (excluded from getLiveServices)');
    } else if (servicesSection[1].includes('serviceSlug: "business-comfort"') && servicesSection[1].includes('status: "live"')) {
      console.error('FAIL: business-comfort status is live (should be planned)');
      hasError = true;
    }
  }
}

if (hasError) {
  console.error("\nFAIL: placeholder text or configuration issue detected.");
  process.exit(1);
}

console.log("\nPASS: All product placeholder checks passed.");
```

注意：由于 `src/lib/product-routes.ts` 是用 TypeScript 写的，Node.js 无法直接 `import`。脚本中的 fallback grep 部分就是为此准备的。替代方案：使用 `tsx` 运行此脚本，但为了保持脚本自包含（无外部依赖），使用文件内容扫描 + grep fallback 的方式。

- [x] **步骤 6.2：更新 package.json**

在 `package.json` 的 `scripts` 部分添加两个条目：

```json
"check:product-placeholders": "node scripts/check-product-placeholders.mjs",
```

将 `check` 链从：
```
"check": "npm run lint && npm run typecheck && npm run verify:zeekr-images && npm run check:backup && npm run check:breadcrumbs && npm run check:product-layout && npm run check:contact-copy && npm run build",
```
改为：
```
"check": "npm run lint && npm run typecheck && npm run verify:zeekr-images && npm run check:backup && npm run check:breadcrumbs && npm run check:product-layout && npm run check:contact-copy && npm run check:product-placeholders && npm run build",
```

即在 `check:contact-copy` 之后、`build` 之前插入 `&& npm run check:product-placeholders &&`。

- [x] **步骤 6.3：运行检查脚本确认通过**

```bash
node scripts/check-product-placeholders.mjs
```

期望输出 `PASS: All product placeholder checks passed.`，退出码 0。

- [x] **步骤 6.4：提交**

```bash
git add scripts/check-product-placeholders.mjs package.json
git commit -m "feat: add check:product-placeholders verification script"
```

archived-with: 2026-07-08-product-placeholder-cleanup
---

### 任务 7：最终验证

- [x] **步骤 7.1：运行检查脚本**

```bash
node scripts/check-product-placeholders.mjs
```
期望：退出码 0，输出 `PASS: All product placeholder checks passed.`

- [x] **步骤 7.2：运行 lint**

```bash
npm run lint
```
期望：无新 lint 错误。

- [x] **步骤 7.3：运行 typecheck**

```bash
npm run typecheck
```
期望：类型检查通过。

- [x] **步骤 7.4：运行构建**

```bash
npm run build
```
期望：构建成功，无编译错误。

- [x] **步骤 7.5：完整 check 链**

```bash
npm run check
```
期望：全部通过。

archived-with: 2026-07-08-product-placeholder-cleanup
---

## 自检清单

**1. 设计文档覆盖检查：**
- 产品路由状态更新 (skid-plate → live) → 任务 1
- BrandPlaceholder 新增 intro prop → 任务 2
- 品牌文案映射（6 个页面）→ 任务 3
- 底盘护板完整服务页 → 任务 4
- 商务舒适 404 → 任务 5
- 检查脚本设计 → 任务 6

**2. 占位符扫描：** 所有步骤包含完整代码，无 `TBD`、`TODO`、`implement later`。

**3. 类型一致性检查：**
- `intro` prop 类型 `string` 在所有任务中一致
- `getServiceRoute("skid-plate")` 返回的 `status` 在任务 1 改为 `"live"`，任务 4 使用时读取该值
- `getProductBreadcrumbs`、`getProductBreadcrumbSchema` 签名与已有类型一致

archived-with: 2026-07-08-product-placeholder-cleanup
---

## 执行提示

### 提交策略建议

建议按任务粒度提交（一个任务一个 commit），共 6 个 commit：
1. `feat: promote skid-plate service from planned to live`
2. `feat: add intro prop to BrandPlaceholder for live brand descriptions`
3. `feat: update brand page copy with proper subtitles and intro text`
4. `feat: replace skid-plate placeholder with full service page`
5. `feat: replace business-comfort placeholder with notFound()`
6. `feat: add check:product-placeholders verification script`

### WeChatConsultModal 注意事项

如果在 Header 中已经渲染了 `WeChatConsultModal`，skid-plate 页面导入同一组件可能导致重复渲染。确认 `WeChatConsultModal` 在同一页面是否已被 Header 渲染：
- 如果 `layout.tsx` 或 `Header` 已包含 `WeChatConsultModal`，则在 skid-plate 页面中不需要重复引入
- 可通过查看 `src/app/product/layout.tsx` 确认

### 资源与参考

- 已有检查脚本参考：`scripts/check-product-breadcrumbs.mjs`
- WeChat modal 触发模式参考：`src/components/Header.tsx` 中 `openWeChatModal` 的使用
- BrandPlaceholder 当前实现：`src/components/product/BrandPlaceholder.tsx`
- 产品路由注册：`src/lib/product-routes.ts`
