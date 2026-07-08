---
change: car-care-service-topic
design-doc: docs/superpowers/specs/2026-07-03-car-care-topic-design.md
base-ref: a98900c07d080f6b840dac32ac4881d6ee050143
archived-with: 2026-07-03-car-care-service-topic
---

# 洗美养护专题页实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [x]`）语法来跟踪进度。

**目标：** 在蓝辉官网新增 `/product/car-care` 洗美养护专题页，包含 Hero、价值主张网格、服务项目卡片、施工流程和 CTA；同时更新首页 CoreServices 组件和产品中心 `/product` 入口。

**架构：** 遵循现有 topic page 模式——静态数据文件 (`src/lib/car-care-products.ts`) 定义类型和数据，4 个展示组件 (`CarCareHero`, `CarCareValueGrid`, `CarCareServiceGrid`, `CarCareServiceFlow`) 存放在 `src/components/product/car-care/` 目录下，RSC 页面 `src/app/product/car-care/page.tsx` 组装。主题色为 emerald。

**技术栈：** Lucide React icons（Droplets, Sparkles, Leaf, Clock, SprayCan 等）、现有 `product-routes.ts` 路由注册模式、`CoreServices.tsx` 扩展模式、Tailwind v4 emerald 色系。

archived-with: 2026-07-03-car-care-service-topic
---

## 文件结构

| 路径 | 操作 | 职责 |
|------|------|------|
| `src/lib/car-care-products.ts` | **新建** | 类型定义（CarCareServiceItem / CarCareValue / CarCareProcessStep）+ 静态数据（values / services / process） |
| `src/lib/car-care-products.test.ts` | **新建** | 类型约束 + 数据完整性 + icon 合法性校验 |
| `src/components/product/car-care/CarCareHero.tsx` | **新建** | Hero：双栏布局、emerald 主题、CTA 按钮、面包屑导航 |
| `src/components/product/car-care/CarCareValueGrid.tsx` | **新建** | 价值主张 2x2 卡片网格，每卡片 icon + 标题 + 描述 |
| `src/components/product/car-care/CarCareServiceGrid.tsx` | **新建** | 服务项目 2 列卡片（洗车 + 内饰），含高亮列表 |
| `src/components/product/car-care/CarCareServiceFlow.tsx` | **新建** | 4 步施工流程（桌面 4 列、移动端堆叠）+ 底部 CTA |
| `src/app/product/car-care/page.tsx` | **新建** | RSC 页面：组装所有组件 + SEO metadata + JSON-LD ItemList |
| `src/lib/product-routes.ts` | **修改** | ServiceGroup 加 `car_care`、SERVICES 数组加新的 service 条目 |
| `src/lib/product-routes.test.ts` | **修改** | 更新 services 数量断言（10 → 11），加 car-care route 查找测试 |
| `src/components/CoreServices.tsx` | **修改** | 加 Droplets 洗美养护卡片、网格从 `lg:grid-cols-3` 改为 `lg:grid-cols-2`、更新 section 描述 |
| `src/app/product/page.tsx` | **修改** | 加 car-care 筛选 + 在 `#service-projects` 区域渲染 CarCareServiceMap 入口 |

archived-with: 2026-07-03-car-care-service-topic
---

### 任务 1：路由注册 + 静态数据层

**说明：** 先在 `product-routes.ts` 注册 `car-care` 路由（这样 TS 类型就可用），再创建 `car-care-products.ts` 静态数据文件，最后为两个文件写测试。

#### 1.1 修改 `product-routes.ts`：ServiceGroup 加 `car_care`

**文件：** `src/lib/product-routes.ts:9`

- [x] **步骤 1：修改 ServiceGroup 类型，新增 `car_care`**

将：
```typescript
export type ServiceGroup = "film" | "light_mod" | "business_comfort" | "practical_accessory";
```
改为：
```typescript
export type ServiceGroup = "film" | "light_mod" | "business_comfort" | "practical_accessory" | "car_care";
```

- [x] **步骤 2：在 SERVICES 数组末尾追加 car-care 条目**

在 `src/lib/product-routes.ts` 的 SERVICES 数组末尾（第 96 行的 `]` 之前），插入：
```typescript
  { type: "service_category", serviceSlug: "car-care",       title: "洗美养护",          navLabel: "洗美养护",     group: "car_care",              status: "live",    priority: "P0", canonicalPath: "/product/car-care" },
```

- [x] **步骤 3：运行 typecheck 确认修改生效**

运行：
```bash
npx tsc --noEmit --pretty 2>&1 | head -40
```
预期：无新增错误。

- [x] **步骤 4：Commit**

```bash
git add src/lib/product-routes.ts
git commit -m "feat: add car_care service group and car-care route to product-routes"
```

#### 1.2 创建 `src/lib/car-care-products.ts`

**文件：** `src/lib/car-care-products.ts`（新建）

- [x] **步骤 1：创建类型定义和数据常量**

```typescript
/**
 * 洗美养护专题静态数据 — TypeScript literal types 防止规格漂移。
 * 对应 Design Doc §Data Model。
 */

export type CarCareServiceItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: readonly string[];
};

export type CarCareValue = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

export type CarCareProcessStep = {
  step: string;
  title: string;
  description: string;
};

// ---------- 4 个价值主张 ----------

export const carCareValues: readonly CarCareValue[] = [
  {
    id: "professional",
    icon: "Droplets",
    title: "专业洗护",
    description:
      "采用中性洗车液配合两桶水洗车法，避免泥沙划伤漆面，车身缝隙、门边等死角也逐一清洁到位。",
  },
  {
    id: "deep-clean",
    icon: "Sparkles",
    title: "深度清洁",
    description:
      "针对座椅缝隙、空调出风口、门槛等死角做蒸汽消毒与臭氧除味，深度清洁内饰空间。",
  },
  {
    id: "eco-friendly",
    icon: "Leaf",
    title: "环保用料",
    description:
      "选用可生物降解洗车液与中性内饰清洁剂，保护车漆和内饰材质，减少对环境和人体的影响。",
  },
  {
    id: "convenient",
    icon: "Clock",
    title: "到店便捷",
    description:
      "顺德大良门店，提前预约到店即洗，施工过程透明可见，支持洗车后存放代取。",
  },
] as const;

// ---------- 2 个服务项目 ----------

export const carCareServices: readonly CarCareServiceItem[] = [
  {
    id: "exterior-wash",
    title: "专业精洗",
    subtitle: "EXTERIOR WASH",
    description:
      "从预洗到擦干，覆盖车身漆面、轮毂、玻璃、发动机舱表面等区域的外表清洁。",
    highlights: [
      "中性洗车液预洗 + 正洗两桶水法",
      "轮毂与刹车粉尘专项清洁",
      "车身缝隙气枪吹水",
      "玻璃油膜去除（选配）",
    ],
  },
  {
    id: "interior-detailing",
    title: "内饰深度清洁",
    subtitle: "INTERIOR DETAILING",
    description:
      "对座舱内部进行系统清洁与养护，覆盖座椅、地毯、仪表台、门板等区域。",
    highlights: [
      "座椅与地毯蒸汽清洁",
      "仪表台 / 门板除尘上光",
      "空调出风口专项清洁",
      "臭氧消毒 + 异味去除",
    ],
  },
] as const;

// ---------- 4 步施工流程 ----------

export const carCareProcess: readonly CarCareProcessStep[] = [
  {
    step: "01",
    title: "预约到店",
    description: "电话或微信提前预约，确认车型、服务项目和到店时间。",
  },
  {
    step: "02",
    title: "车辆检查",
    description: "到店后进行车况检查，确认漆面、内饰、轮毂状态并与客户确认服务范围。",
  },
  {
    step: "03",
    title: "分区施工",
    description: "按车身分区依次进行预洗、正洗、擦干或内饰蒸汽清洁、死角处理。",
  },
  {
    step: "04",
    title: "交付验收",
    description: "施工后逐一检查清洁效果，展示施工成果，确认无误后交付车辆。",
  },
] as const;
```

- [x] **步骤 2：Commit**

```bash
git add src/lib/car-care-products.ts
git commit -m "feat: create car-care-products static data file"
```

#### 1.3 创建 `src/lib/car-care-products.test.ts`

**文件：** `src/lib/car-care-products.test.ts`（新建）

- [x] **步骤 1：编写测试**

```typescript
import { describe, expect, it } from "vitest";
import {
  carCareValues,
  carCareServices,
  carCareProcess,
} from "./car-care-products";

describe("car-care-products", () => {
  it("exports exactly 4 value cards", () => {
    expect(carCareValues).toHaveLength(4);
  });

  it("exports exactly 2 services (exterior-wash + interior-detailing)", () => {
    expect(carCareServices).toHaveLength(2);
    expect(carCareServices[0]?.id).toBe("exterior-wash");
    expect(carCareServices[1]?.id).toBe("interior-detailing");
  });

  it("exports exactly 4 process steps", () => {
    expect(carCareProcess).toHaveLength(4);
  });

  it("each value card has required fields", () => {
    for (const v of carCareValues) {
      expect(v.id).toBeTruthy();
      expect(v.icon).toBeTruthy();
      expect(v.title).toBeTruthy();
      expect(v.description).toBeTruthy();
    }
  });

  it("each service has at least 3 highlights", () => {
    for (const s of carCareServices) {
      expect(s.highlights.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("each process step has step, title, and description", () => {
    for (const step of carCareProcess) {
      expect(step.step).toMatch(/^\d{2}$/);
      expect(step.title).toBeTruthy();
      expect(step.description).toBeTruthy();
    }
  });

  it("values use valid Lucide icon names", () => {
    const validIcons = ["Droplets", "Sparkles", "Leaf", "Clock"];
    for (const v of carCareValues) {
      expect(validIcons).toContain(v.icon);
    }
  });
});
```

- [x] **步骤 2：运行测试验证通过**

```bash
npx vitest run src/lib/car-care-products.test.ts
```
预期：所有 7 个测试 PASS。

- [x] **步骤 3：Commit**

```bash
git add src/lib/car-care-products.test.ts
git commit -m "test: add car-care-products unit tests"
```

#### 1.4 更新 `product-routes.test.ts`

**文件：** `src/lib/product-routes.test.ts`

- [x] **步骤 1：更新 services 数量断言**

将第 17-20 行的：
```typescript
  it("contains exactly 10 services (6 P0 live + 2 P1 live + 2 P1 planned)", () => {
    expect(ALL_SERVICES).toHaveLength(10);
    expect(ALL_SERVICES.filter((s) => s.status === "live")).toHaveLength(8);
    expect(ALL_SERVICES.filter((s) => s.status === "planned")).toHaveLength(2);
  });
```
改为：
```typescript
  it("contains exactly 11 services (7 P0 live + 2 P1 live + 2 P1 planned)", () => {
    expect(ALL_SERVICES).toHaveLength(11);
    expect(ALL_SERVICES.filter((s) => s.status === "live")).toHaveLength(9);
    expect(ALL_SERVICES.filter((s) => s.status === "planned")).toHaveLength(2);
  });
```

- [x] **步骤 2：在 `getServiceRoute()` 测试块中追加 car-care 查找测试**

在 `getServiceRoute` 测试块末尾（`expect(getServiceRoute("floor-mats")?.status).toBe("live");` 之后）追加：
```typescript
    expect(getServiceRoute("car-care")?.group).toBe("car_care");
    expect(getServiceRoute("car-care")?.status).toBe("live");
```

- [x] **步骤 3：运行测试验证通过**

```bash
npx vitest run src/lib/product-routes.test.ts
```
预期：全部 PASS（注意 `getLiveBrands` 排序断言也要通过——如果新增 `getLiveBrands` 排序断言涉及品牌总数不变则不受影响）。

- [x] **步骤 4：Commit**

```bash
git add src/lib/product-routes.test.ts
git commit -m "test: update product-routes tests for car-care service"
```

archived-with: 2026-07-03-car-care-service-topic
---

### 任务 2：页面组件

**说明：** 创建 4 个展示组件 + RSC 页面。所有组件使用 emerald 主题色。

#### 2.1 创建 `CarCareHero` 组件

**文件：** `src/components/product/car-care/CarCareHero.tsx`（新建）

- [x] **步骤 1：创建组件目录**

```bash
mkdir -p src/components/product/car-care
```

- [x] **步骤 2：编写 CarCareHero 组件**

```typescript
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

export function CarCareHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950/60 via-zinc-950 to-zinc-950">
      {/* 背景纹理 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        {/* 面包屑 */}
        <nav className="flex items-center gap-1 text-sm text-zinc-400 mb-8">
          <Link href="/product" className="hover:text-white transition-colors">
            产品中心
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-200">洗美养护</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 左侧文本 */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-700/50 bg-emerald-950/40 text-emerald-300 text-xs tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              CAR CARE — 洗美养护
            </div>

            {/* 标题 */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              专业洗美养护
            </h1>

            {/* 描述 */}
            <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
              覆盖车身外部精洗与内饰深度清洁两大服务线，从日常通勤到商务接待，
              为您的爱车提供细致、环保、可追溯的洗美养护体验。
            </p>

            {/* CTA 按钮组 */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-all duration-200"
              >
                联系预约
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#services"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-200 font-medium transition-all duration-200"
              >
                查看服务详情
              </Link>
            </div>
          </div>

          {/* 右侧视觉占位 */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-full aspect-[4/3] rounded-2xl border border-emerald-900/30 bg-emerald-950/20 flex items-center justify-center">
              <div className="text-center text-zinc-600">
                <div className="text-6xl mb-4 opacity-30">🚗</div>
                <p className="text-sm">洗美养护视觉</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [x] **步骤 3：Commit**

```bash
git add src/components/product/car-care/CarCareHero.tsx
git commit -m "feat: create CarCareHero component with emerald theme"
```

#### 2.2 创建 `CarCareValueGrid` 组件

**文件：** `src/components/product/car-care/CarCareValueGrid.tsx`（新建）

- [x] **步骤 1：编写 CarCareValueGrid 组件**

```typescript
import { Droplets, Sparkles, Leaf, Clock } from "lucide-react";
import { carCareValues } from "@/lib/car-care-products";
import type { CarCareValue } from "@/lib/car-care-products";

/** icon 名字到 Lucide 组件的映射 */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Droplets,
  Sparkles,
  Leaf,
  Clock,
};

function ValueCard({ icon, title, description }: CarCareValue) {
  const Icon = ICON_MAP[icon];
  return (
    <div className="group bg-zinc-900/60 rounded-2xl border border-zinc-800 hover:border-emerald-800/60 p-6 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center mb-4 group-hover:bg-emerald-900/60 transition-colors">
        {Icon && <Icon className="w-6 h-6 text-emerald-400" />}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

export function CarCareValueGrid() {
  return (
    <section className="py-20 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题 */}
        <div className="text-center mb-16">
          <p className="text-sm tracking-widest text-emerald-400 mb-3">
            WHY CAR CARE
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            为什么选择蓝辉洗美
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            专业设备、环保用料、严格流程，为每台车提供可追溯的洗美养护服务。
          </p>
        </div>

        {/* 2x2 网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {carCareValues.map((value) => (
            <ValueCard key={value.id} {...value} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [x] **步骤 2：Commit**

```bash
git add src/components/product/car-care/CarCareValueGrid.tsx
git commit -m "feat: create CarCareValueGrid component with 2x2 value cards"
```

#### 2.3 创建 `CarCareServiceGrid` 组件

**文件：** `src/components/product/car-care/CarCareServiceGrid.tsx`（新建）

- [x] **步骤 1：编写 CarCareServiceGrid 组件**

```typescript
import { carCareServices } from "@/lib/car-care-products";
import type { CarCareServiceItem } from "@/lib/car-care-products";
import { Check } from "lucide-react";

function ServiceCard({ title, subtitle, description, highlights }: CarCareServiceItem) {
  return (
    <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800 p-8">
      <p className="text-xs tracking-widest text-emerald-400 mb-2">
        {subtitle}
      </p>
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed mb-6">
        {description}
      </p>
      <ul className="space-y-3">
        {highlights.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-zinc-300">
            <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CarCareServiceGrid() {
  return (
    <section id="services" className="py-20 bg-black border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题 */}
        <div className="text-center mb-16">
          <p className="text-sm tracking-widest text-emerald-400 mb-3">
            SERVICES
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            洗美服务项目
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            从外部精洗到内饰深度清洁，覆盖日常养护与深层护理全场景。
          </p>
        </div>

        {/* 2 列网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {carCareServices.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [x] **步骤 2：Commit**

```bash
git add src/components/product/car-care/CarCareServiceGrid.tsx
git commit -m "feat: create CarCareServiceGrid component with 2 service cards"
```

#### 2.4 创建 `CarCareServiceFlow` 组件

**文件：** `src/components/product/car-care/CarCareServiceFlow.tsx`（新建）

- [x] **步骤 1：编写 CarCareServiceFlow 组件**

```typescript
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { carCareProcess } from "@/lib/car-care-products";

export function CarCareServiceFlow() {
  return (
    <section className="py-20 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题 */}
        <div className="text-center mb-16">
          <p className="text-sm tracking-widest text-emerald-400 mb-3">
            SERVICE FLOW
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            到店施工流程
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            标准化施工流程，每一步可追溯，确保交付质量。
          </p>
        </div>

        {/* 4 步流程 — 桌面 4 列，移动端堆叠 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {carCareProcess.map((step) => (
            <div
              key={step.step}
              className="relative bg-zinc-900/60 rounded-2xl border border-zinc-800 p-6"
            >
              {/* 步骤编号 */}
              <div className="text-4xl font-bold text-emerald-500/20 mb-4 select-none">
                {step.step}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA 横幅 */}
        <div className="text-center bg-gradient-to-r from-emerald-950/40 to-zinc-950 border border-emerald-900/30 rounded-2xl p-10">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
            联系蓝辉轻改
          </h3>
          <p className="text-zinc-400 mb-6 max-w-lg mx-auto">
                预约到店或咨询洗美养护方案，专业顾问一对一服务。
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-all duration-200"
              >
                立即预约
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
    </section>
  );
}
```

- [x] **步骤 2：Commit**

```bash
git add src/components/product/car-care/CarCareServiceFlow.tsx
git commit -m "feat: create CarCareServiceFlow component with 4-step process"
```

#### 2.5 创建 `src/app/product/car-care/page.tsx`

**文件：** `src/app/product/car-care/page.tsx`（新建）

- [x] **步骤 1：创建页面目录**

```bash
mkdir -p src/app/product/car-care
```

- [x] **步骤 2：编写 RSC 页面**

```typescript
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CarCareHero } from "@/components/product/car-care/CarCareHero";
import { CarCareValueGrid } from "@/components/product/car-care/CarCareValueGrid";
import { CarCareServiceGrid } from "@/components/product/car-care/CarCareServiceGrid";
import { CarCareServiceFlow } from "@/components/product/car-care/CarCareServiceFlow";

export const metadata: Metadata = {
  title: "洗美养护｜蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改洗美养护服务，覆盖车身外部精洗与内饰深度清洁两大服务线。中性洗车液、两桶水洗车法、蒸汽消毒、臭氧除味，为您的爱车提供细致、环保、可追溯的洗美养护体验。",
};

export default function CarCarePage() {
  // JSON-LD: CollectionPage + ItemList
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "洗美养护｜蓝辉轻改 LANHUI",
    description:
      "蓝辉轻改洗美养护服务，覆盖车身外部精洗与内饰深度清洁。",
    url: "/product/car-care",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "专业精洗",
          description: "从预洗到擦干，覆盖车身漆面、轮毂、玻璃等区域的外表清洁。",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "内饰深度清洁",
          description: "对座舱内部进行系统清洁与养护，覆盖座椅、地毯、仪表台、门板等区域。",
        },
      ],
    },
  };

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <CarCareHero />
        <CarCareValueGrid />
        <CarCareServiceGrid />
        <CarCareServiceFlow />
      </main>
      <Footer />
    </>
  );
}
```

- [x] **步骤 3：运行 typecheck 确认无类型错误**

```bash
npx tsc --noEmit --pretty 2>&1 | head -40
```
预期：无新增错误。

- [x] **步骤 4：Commit**

```bash
git add src/app/product/car-care/page.tsx
git commit -m "feat: create car-care RSC page with components and JSON-LD"
```

archived-with: 2026-07-03-car-care-service-topic
---

### 任务 3：首页与产品中心集成

#### 3.1 更新 `CoreServices` 组件

**文件：** `src/components/CoreServices.tsx`

- [x] **步骤 1：在 import 中追加 Droplets 和 Boxes**

将：
```typescript
import { ArrowRight, Boxes, Layers, ShieldCheck } from "lucide-react";
```
改为：
```typescript
import { ArrowRight, Boxes, Droplets, Layers, ShieldCheck } from "lucide-react";
```

- [x] **步骤 2：在 SERVICES 数组第 2 项（Layers 车身膜）之后插入洗美养护卡片**

将 3 项的 SERVICES 数组：
```typescript
const SERVICES = [
  { icon: Boxes, title: "轻改方案库", description: "...", href: "/product", accent: "blue" },
  { icon: Layers, title: "车身膜专业服务", description: "...", href: "/product/window-film", accent: "orange" },
  { icon: ShieldCheck, title: "品质与质保", description: "...", href: "/brand", accent: "yellow" },
];
```
改为 4 项（在 Layers 之后插入）：
```typescript
const SERVICES = [
  { icon: Boxes, title: "轻改方案库", description: "电动踏板、轮毂升级、底盘装甲，6大产品线覆盖外观个性化到功能实用性的全场景需求。", href: "/product", accent: "blue" },
  { icon: Layers, title: "车身膜专业服务", description: "隐形车衣、改色膜、隐私窗膜，采用进口TPU基材，专业无尘施工，防刮耐磨自修复。", href: "/product/window-film", accent: "orange" },
  { icon: Droplets, title: "洗美养护", description: "专业洗车与内饰深度清洁，日常养护到轻改装贴膜全覆盖，一条龙服务更省心。", href: "/product/car-care", accent: "green" },
  { icon: ShieldCheck, title: "品质与质保", description: "专业技师持证上岗，施工全程记录，品牌质保体系覆盖所有服务项目，售后无忧。", href: "/brand", accent: "yellow" },
];
```

- [x] **步骤 3：更新 ACCENT_MAP 追加 green**

```typescript
const ACCENT_MAP: Record<string, string> = {
  blue: "from-blue-500/30 to-blue-700/10 border-blue-800/40 text-blue-300",
  orange: "from-orange-500/30 to-orange-700/10 border-orange-800/40 text-orange-300",
  green: "from-emerald-500/30 to-emerald-700/10 border-emerald-800/40 text-emerald-300",
  yellow: "from-yellow-500/30 to-yellow-700/10 border-yellow-800/40 text-yellow-300",
};
```

- [x] **步骤 4：网格从 `lg:grid-cols-3` 改为 `lg:grid-cols-2`**

将第 52 行：
```html
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
```
改为：
```html
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
```

- [x] **步骤 5：更新 section 描述**

将第 47 行：
```html
<p className="text-lg text-zinc-400">
  从轻改方案到车身膜专业服务，再到品质质保，蓝辉轻改为每次升级保驾护航。
</p>
```
改为：
```html
<p className="text-lg text-zinc-400">
  从洗美养护、贴膜服务到轻改装备，蓝辉轻改提供一条龙式升级服务，让每次到店都物超所值。
</p>
```

- [x] **步骤 6：运行 typecheck 确认通过**

```bash
npx tsc --noEmit --pretty 2>&1 | head -40
```
预期：无新增错误。

- [x] **步骤 7：Commit**

```bash
git add src/components/CoreServices.tsx
git commit -m "feat: add car-care card to CoreServices, update grid layout and description"
```

#### 3.2 更新 `/product` 页面

**文件：** `src/app/product/page.tsx`

- [x] **步骤 1：在 import 区域追加 carCare 相关模块**

现有 imports 末尾追加：
```typescript
import { CarCareServiceMap } from "@/components/product/CarCareServiceMap";
```

- [x] **步骤 2：在 `practicalAccessoryServices` 筛选之后追加 `carCareServices` 筛选**

在第 38 行（`practicalAccessoryServices` 的 filter 之后）追加：
```typescript
  const carCareServices = liveServices.filter(
    (s: ServiceRoute) => s.group === "car_care"
  );
```

- [x] **步骤 3：在 `#service-projects` section 中插入 CarCareServiceMap**

在 `<PracticalAccessoryMap services={practicalAccessoryServices} />` 之后、`P1 折叠区` 之前插入：
```typescript
              {carCareServices.length > 0 && (
                <CarCareServiceMap services={carCareServices} />
              )}
```

- [x] **步骤 4：运行 typecheck 确认通过**

```bash
npx tsc --noEmit --pretty 2>&1 | head -40
```
预期：`CarCareServiceMap` 尚未创建，typecheck 会报错——这是因为该组件将在下一步创建。

- [x] **步骤 5：创建 `CarCareServiceMap` 组件**

**文件：** `src/components/product/CarCareServiceMap.tsx`（新建）

```typescript
import Link from "next/link";
import { ArrowRight, Droplets } from "lucide-react";
import type { ServiceRoute } from "@/lib/product-routes";

type Props = {
  services: readonly ServiceRoute[];
};

export function CarCareServiceMap({ services }: Props) {
  if (services.length === 0) return null;

  const service = services[0]!;

  return (
    <section className="rounded-2xl border border-emerald-900/30 bg-gradient-to-br from-emerald-950/20 to-zinc-950 overflow-hidden">
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* 图标 */}
        <div className="w-14 h-14 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center shrink-0">
          <Droplets className="w-7 h-7 text-emerald-400" />
        </div>

        {/* 文本 */}
        <div className="flex-1 min-w-0">
          <p className="text-xs tracking-widest text-emerald-400 mb-1">
            CAR CARE
          </p>
          <h3 className="text-xl md:text-2xl font-bold text-white">
            {service.title}
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            专业洗车与内饰深度清洁，日常养护到轻改装贴膜全覆盖，一条龙服务更省心。
          </p>
        </div>

        {/* 链接 */}
        <Link
          href={service.canonicalPath}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all duration-200 shrink-0"
        >
          查看详情
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
```

- [x] **步骤 6：运行 typecheck 确认通过**

```bash
npx tsc --noEmit --pretty 2>&1 | head -40
```
预期：无新增错误（CarCareServiceMap 已就位）。

- [x] **步骤 7：运行测试验证**

```bash
npx vitest run
```
预期：所有测试 PASS，包括 product-routes 和 car-care-products 测试。

- [x] **步骤 8：Commit**

```bash
git add src/app/product/page.tsx src/components/product/CarCareServiceMap.tsx
git commit -m "feat: integrate car-care service map into product center page"
```

archived-with: 2026-07-03-car-care-service-topic
---

### 任务 4：验证

- [x] **步骤 1：运行 `npm run typecheck`**

```bash
npm run typecheck
```
预期：仅存在的 9 个 pre-existing 错误，无新增错误。

- [x] **步骤 2：运行 `npm run test`**

```bash
npm run test
```
预期：所有测试通过，包括新加的 car-care-products.test.ts 和 product-routes.test.ts 断言更新。

- [x] **步骤 3：运行 `npm run build`**

```bash
npm run build
```
预期：SSG 构建成功，无新增错误。

- [x] **步骤 4：浏览器验证**

启动 dev server:
```bash
npm run dev
```

验证以下 3 个路由：
1. **`/product/car-care`** — 页面渲染完整，Hero / ValueGrid / ServiceGrid / ServiceFlow 各 section 均展示，emerald 主题正确
2. **首页** — CoreServices 展示 4 个卡片（含洗美养护），网格为 md:grid-cols-2
3. **`/product`** — 项目区域展示 CarCareServiceMap 入口卡片

archived-with: 2026-07-03-car-care-service-topic
---

## 自检清单

### 1. 规格覆盖度
| Design Doc 需求 | 对应任务 | 覆盖情况 |
|----------------|----------|----------|
| 数据模型 (CarCareServiceItem / CarCareValue / CarCareProcessStep) | 1.2 | OK |
| carCareValues 4 项 | 1.2 + 测试 1.3 | OK |
| carCareServices 2 项 | 1.2 + 测试 1.3 | OK |
| carCareProcess 4 步 | 1.2 + 测试 1.3 | OK |
| CarCareHero (双栏 + badge + CTA + 面包屑) | 2.1 | OK |
| CarCareValueGrid (2x2 网格, Lucide icons) | 2.2 | OK |
| CarCareServiceGrid (2 列卡片, 高亮列表) | 2.3 | OK |
| CarCareServiceFlow (4 步 + 底部 CTA) | 2.4 | OK |
| Route registration (ServiceGroup + SERVICES) | 1.1 | OK |
| CoreServices 更新 (新卡片 + 2x2 + 描述) | 3.1 | OK |
| Product 中心集成 (carCareServices 筛选 + CarCareServiceMap) | 3.2 | OK |
| SEO (title + description + JSON-LD) | 2.5 | OK |
| 测试 (unit + route lookup) | 1.3 + 1.4 | OK |

### 2. 占位符扫描
- 无 "TODO"、"待定"、"后续实现" 等占位符
- 所有步骤含完整代码和命令
- 类型名一致（CarCareServiceItem / CarCareValue / CarCareProcessStep 在所有文件中一致）
- icon 名 "Droplets" / "Sparkles" / "Leaf" / "Clock" 在 data 文件和组件中一致

### 3. 类型一致性
- `carCareValues[].icon` 定义为 `string`，ICON_MAP 用 `Record<string, ...>` 映射 → 类型安全
- `CarCareServiceMap` 组件 props 为 `{ services: readonly ServiceRoute[] }`，与 `FilmServiceMap` / `LightModMap` 模式一致
- `CarCarePage` 使用 `export default function CarCarePage()`（RSC 约定）
- JSON-LD 结构字段名与 schema.org ItemList 规范一致

archived-with: 2026-07-03-car-care-service-topic
---

## 总结

计划覆盖了以下文件的创建与修改：

**新建 7 个文件：**
- `src/lib/car-care-products.ts`
- `src/lib/car-care-products.test.ts`
- `src/components/product/car-care/CarCareHero.tsx`
- `src/components/product/car-care/CarCareValueGrid.tsx`
- `src/components/product/car-care/CarCareServiceGrid.tsx`
- `src/components/product/car-care/CarCareServiceFlow.tsx`
- `src/app/product/car-care/page.tsx`
- `src/components/product/CarCareServiceMap.tsx`

**修改 4 个文件：**
- `src/lib/product-routes.ts`
- `src/lib/product-routes.test.ts`
- `src/components/CoreServices.tsx`
- `src/app/product/page.tsx`

**验证步骤：** typecheck → test → build → 浏览器验证。

archived-with: 2026-07-03-car-care-service-topic
---

**计划已完成并保存到 `docs/superpowers/plans/2026-07-03-car-care-topic.md`。两种执行方式：**

**1. 子代理驱动（推荐）** - 每个任务调度一个新的子代理，任务间进行审查，快速迭代

**2. 内联执行** - 在当前会话中使用 executing-plans 执行任务，批量执行并设有检查点

**选哪种方式？**
