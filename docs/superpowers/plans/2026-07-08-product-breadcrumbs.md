---
change: product-breadcrumbs
design-doc: docs/superpowers/specs/2026-07-08-product-breadcrumbs-design.md
base-ref: 0155e31a0845c859fd3a42a1fab96f12539fced6
---

# 产品页面统一面包屑导航 — 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [x]`）语法来跟踪进度。

**目标：** 将现有 28+ 个产品页面的手写面包屑替换为统一 `<Breadcrumbs>` Server Component + `getProductBreadcrumbs()` 工具函数，消除重复代码并统一样式（dark 主题、a11y、响应式）。

**架构：**
1. 新建 `src/components/Breadcrumbs.tsx`（Server Component）和 `src/lib/product-breadcrumbs.ts`（路径解析 + JSON-LD 生成）
2. 每个页面调用 `getProductBreadcrumbs(pathname)` 获取 breadcrumb items，通过可选的 `breadcrumbItems` prop 传入 Hero 组件（或页面直接渲染 Breadcrumbs）
3. Hero 组件内部条件渲染 `<Breadcrumbs>`：传了 prop 就显示，不传就不显示（向后兼容）
4. 验证脚本 `scripts/check-product-breadcrumbs.mjs` 扫描所有产品页面确保覆盖率

**技术栈：** Next.js 16 RSC, Tailwind v4, lucide-react（ChevronRight）

---

### 任务 1：核心组件与工具函数

**文件：**
- 创建：`src/components/Breadcrumbs.tsx`
- 创建：`src/lib/product-breadcrumbs.ts`
- 修改：无

---

#### 步骤 1.1：创建 Breadcrumbs Server Component

创建 `src/components/Breadcrumbs.tsx`：

```tsx
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: readonly BreadcrumbItem[];
  className?: string;
  align?: "left" | "center";
};

export function Breadcrumbs({
  items,
  className,
  align = "left",
}: BreadcrumbsProps) {
  return (
    <nav aria-label="面包屑" className={className}>
      <ol
        className={`flex flex-wrap items-center gap-1 text-sm ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center">
              {i > 0 && (
                <ChevronRight
                  className="w-4 h-4 mx-1 text-zinc-600 shrink-0"
                  aria-hidden
                />
              )}
              {isLast ? (
                <span className="text-zinc-300" aria-current="page">
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-zinc-500">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

- [x] **步骤 1.1：创建 Breadcrumbs.tsx**

---

#### 步骤 1.2：创建 product-breadcrumbs 工具函数

创建 `src/lib/product-breadcrumbs.ts`：

```ts
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import {
  getBrandRoute,
  getModelRoute,
  getServiceRoute,
} from "@/lib/product-routes";
import { getWindowFilmPackage } from "@/lib/products";
import { generateBreadcrumbSchema } from "@/lib/geo";

/**
 * 根据 pathname 解析产品页面的面包屑导航项。
 *
 * 优先级：
 * 1. 精确匹配 /product → [首页, 产品中心]
 * 2. 品牌匹配 /product/{slug} → 追加 brand.title
 * 3. 车型匹配 /product/{brand}/{model} → 追加 brand.title + model.title
 * 4. 服务匹配 /product/{slug} → 追加 service.title
 * 5. window-film 套餐 /product/window-film/{slug} → 追加 汽车窗膜 + package.name
 * 6. Fallback → 末段 title-case 兜底
 */
export function getProductBreadcrumbs(
  pathname: string
): readonly BreadcrumbItem[] {
  const home: BreadcrumbItem = { label: "首页", href: "/" };
  const productCenter: BreadcrumbItem = {
    label: "产品中心",
    href: "/product",
  };

  // 1. 精确匹配 /product
  if (pathname === "/product") {
    return [home, { label: "产品中心" }];
  }

  const parts = pathname.split("/").filter(Boolean);
  // pathname must start with "product"
  if (parts.length < 2 || parts[0] !== "product") {
    return fallbackBreadcrumbs(home, productCenter, pathname);
  }

  const slug = parts[1];

  // 2. 品牌匹配 /product/{slug}（优先于服务匹配）
  const brand = getBrandRoute(slug);
  if (brand && parts.length === 2) {
    return [
      home,
      productCenter,
      { label: brand.brandName, href: brand.canonicalPath },
    ];
  }

  // 3. 车型匹配 /product/{brand}/{model}
  if (brand && parts.length === 3) {
    const modelSlug = parts[2];
    const model = getModelRoute(brand.brandSlug, modelSlug);
    if (model) {
      return [
        home,
        productCenter,
        { label: brand.brandName, href: brand.canonicalPath },
        { label: model.modelName },
      ];
    }
  }

  // 4. 服务匹配 /product/{slug}
  const service = getServiceRoute(slug);
  if (service && parts.length === 2) {
    return [
      home,
      productCenter,
      { label: service.title, href: service.canonicalPath },
    ];
  }

  // 5. window-film 套餐 /product/window-film/{slug}
  if (slug === "window-film" && parts.length === 3) {
    const pkgSlug = parts[2];
    const pkg = getWindowFilmPackage(pkgSlug);
    const windowFilmService = getServiceRoute("window-film");
    if (pkg && windowFilmService) {
      return [
        home,
        productCenter,
        {
          label: windowFilmService.title,
          href: windowFilmService.canonicalPath,
        },
        { label: pkg.name },
      ];
    }
  }

  // 6. Fallback
  return fallbackBreadcrumbs(home, productCenter, pathname);
}

function fallbackBreadcrumbs(
  home: BreadcrumbItem,
  productCenter: BreadcrumbItem,
  pathname: string
): readonly BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  const label = last
    ? last
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : pathname;
  return [home, productCenter, { label }];
}

/**
 * 生成产品页面的 BreadcrumbList JSON-LD。
 * 当 items 少于 2 项时返回 null（不生成）。
 */
export function getProductBreadcrumbSchema(
  pathname: string
): object | null {
  const items = getProductBreadcrumbs(pathname);
  if (items.length < 2) return null;
  return generateBreadcrumbSchema(
    items.map((item) => ({
      name: item.label,
      url: item.href ?? pathname,
    }))
  );
}
```

- [x] **步骤 1.2：创建 product-breadcrumbs.ts**

---

### 任务 2：单元测试

**文件：**
- 创建：`src/components/Breadcrumbs.test.tsx`
- 创建：`src/lib/product-breadcrumbs.test.ts`

---

#### 步骤 2.1：Breadcrumbs 组件测试

创建 `src/components/Breadcrumbs.test.tsx`：

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";

describe("Breadcrumbs", () => {
  const items: readonly BreadcrumbItem[] = [
    { label: "首页", href: "/" },
    { label: "产品中心", href: "/product" },
    { label: "极氪系列", href: "/product/zeekr" },
    { label: "极氪 9X" },
  ];

  it("渲染 nav 且 aria-label 为面包屑", () => {
    render(<Breadcrumbs items={items} />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label", "面包屑");
  });

  it("末项渲染为 span 且 aria-current=page", () => {
    render(<Breadcrumbs items={items} />);
    const lastItem = screen.getByText("极氪 9X");
    expect(lastItem.tagName).toBe("SPAN");
    expect(lastItem).toHaveAttribute("aria-current", "page");
  });

  it("非末项渲染为链接", () => {
    render(<Breadcrumbs items={items} />);
    const link = screen.getByText("极氪系列");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/product/zeekr");
  });

  it("分隔符设置 aria-hidden", () => {
    const { container } = render(<Breadcrumbs items={items} />);
    const separators = container.querySelectorAll('[aria-hidden="true"]');
    // items.length - 1 个分隔符
    expect(separators.length).toBe(items.length - 1);
  });

  it("align center 时 ol 有 justify-center", () => {
    const { container } = render(<Breadcrumbs items={items} align="center" />);
    const ol = container.querySelector("ol");
    expect(ol?.className).toContain("justify-center");
  });

  it("align left 时 ol 无 justify-center", () => {
    const { container } = render(<Breadcrumbs items={items} />);
    const ol = container.querySelector("ol");
    expect(ol?.className).not.toContain("justify-center");
  });
});
```

- [x] **步骤 2.1.1：创建 Breadcrumbs.test.tsx**
- [x] **步骤 2.1.2：运行测试确认失败**

运行：`npx vitest run src/components/Breadcrumbs.test.tsx -t "Breadcrumbs"`（Breadcrumbs 组件未导入等预期失败）

- [x] **步骤 2.1.3：重新运行测试确认通过**

运行：`npx vitest run src/components/Breadcrumbs.test.tsx`

---

#### 步骤 2.2：product-breadcrumbs 工具测试

创建 `src/lib/product-breadcrumbs.test.ts`：

```ts
import { describe, expect, it } from "vitest";
import { getProductBreadcrumbs } from "./product-breadcrumbs";

describe("getProductBreadcrumbs", () => {
  it("/product 返回 [首页, 产品中心]", () => {
    const items = getProductBreadcrumbs("/product");
    expect(items).toHaveLength(2);
    expect(items[0]?.label).toBe("首页");
    expect(items[1]?.label).toBe("产品中心");
    expect(items[1]?.href).toBeUndefined();
  });

  it("/product/zeekr 返回 首页 → 产品中心 → 极氪", () => {
    const items = getProductBreadcrumbs("/product/zeekr");
    expect(items).toHaveLength(3);
    expect(items[2]?.label).toBe("极氪");
    expect(items[2]?.href).toBe("/product/zeekr");
  });

  it("/product/zeekr/9x 返回 首页 → 产品中心 → 极氪 → 极氪 9X", () => {
    const items = getProductBreadcrumbs("/product/zeekr/9x");
    expect(items).toHaveLength(4);
    expect(items[2]?.label).toBe("极氪");
    expect(items[2]?.href).toBe("/product/zeekr");
    expect(items[3]?.label).toBe("极氪 9X");
    expect(items[3]?.href).toBeUndefined();
  });

  it("/product/ppf 返回 首页 → 产品中心 → 隐形车衣", () => {
    const items = getProductBreadcrumbs("/product/ppf");
    expect(items).toHaveLength(3);
    expect(items[2]?.label).toBe("隐形车衣");
  });

  it("/product/window-film/chunfen 返回 首页 → 产品中心 → 汽车窗膜 → 春分", () => {
    const items = getProductBreadcrumbs("/product/window-film/chunfen");
    expect(items).toHaveLength(4);
    expect(items[2]?.label).toBe("汽车窗膜");
    expect(items[2]?.href).toBe("/product/window-film");
    expect(items[3]?.label).toBe("春分");
    expect(items[3]?.href).toBeUndefined();
  });

  it("unknown path 使用 fallback title-case", () => {
    const items = getProductBreadcrumbs("/product/unknown-thing");
    expect(items).toHaveLength(3);
    expect(items[2]?.label).toBe("Unknown Thing");
  });
});
```

- [x] **步骤 2.2.1：创建 product-breadcrumbs.test.ts**
- [x] **步骤 2.2.2：运行测试确认失败**

运行：`npx vitest run src/lib/product-breadcrumbs.test.ts -t "getProductBreadcrumbs"`

- [x] **步骤 2.2.3：重新运行测试确认通过**

运行：`npx vitest run src/lib/product-breadcrumbs.test.ts`

- [x] **步骤 2.2.4：Commit 任务 1+2**

```bash
git add src/components/Breadcrumbs.tsx src/lib/product-breadcrumbs.ts src/components/Breadcrumbs.test.tsx src/lib/product-breadcrumbs.test.ts
git commit -m "feat: add Breadcrumbs component and product-breadcrumbs utility"
```

---

### 任务 3：替换共享组件中的手写面包屑

**文件：**
- 修改：`src/components/ProductDetail.tsx`
- 修改：`src/components/film/FilmPageHero.tsx`
- 修改：`src/app/product/ppf/page.tsx`（示例）
- 修改：`src/app/product/color-film/page.tsx`
- 修改：`src/app/product/electric-steps/page.tsx`
- 修改：`src/app/product/wheels/page.tsx`
- 修改：`src/app/product/chassis/page.tsx`
- 修改：`src/app/product/floor-mats/page.tsx`
- 修改：`src/app/product/business-comfort/page.tsx`
- 修改：`src/app/product/skid-plate/page.tsx`
- 修改：`src/app/product/car-care/page.tsx`
- 修改：`src/app/product/window-film/page.tsx`

---

#### 步骤 3.1：改造 ProductDetail — 添加 breadcrumbItems prop

在 `src/components/ProductDetail.tsx`：

1. 顶部 import 添加：
```tsx
import { Breadcrumbs, type BreadcrumbItem } from "@/components/Breadcrumbs";
```

2. Props 类型添加：
```tsx
type ProductDetailProps = {
  product: Product;
  breadcrumbItems?: readonly BreadcrumbItem[];
};
```

3. 替换第 66-72 行手写面包屑（`<nav>...</nav>` 从 `{/* Breadcrumb */}` 到 `</nav>`）为：
```tsx
{breadcrumbItems && (
  <Breadcrumbs items={breadcrumbItems} className="mb-6 justify-center flex" />
)}
```

4. 组件解构 props 添加 `breadcrumbItems`：
```tsx
export function ProductDetail({ product, breadcrumbItems }: ProductDetailProps) {
```

5. 移除不再需要的 `Link` import（如果 `Link` 仅用于面包屑）。

- [x] **步骤 3.1.1：改造 ProductDetail.tsx**

---

#### 步骤 3.2：改造 FilmPageHero — 添加 breadcrumbItems prop

在 `src/components/film/FilmPageHero.tsx`：

1. 顶部 import 添加：
```tsx
import { Breadcrumbs, type BreadcrumbItem } from "@/components/Breadcrumbs";
```

2. Props 类型添加 `breadcrumbItems`、移除 `breadcrumbLabel`：
```tsx
export function FilmPageHero({
  title,
  description,
  breadcrumbItems,
}: {
  title: string;
  description: string;
  breadcrumbItems?: readonly BreadcrumbItem[];
}) {
```

3. 替换 `<nav>...</nav>` 面包屑（第 27-33 行）为：
```tsx
{breadcrumbItems && (
  <Breadcrumbs items={breadcrumbItems} className="mb-6 justify-center flex" />
)}
```

4. 移除 `Link` import（如仅用于面包屑）。

- [x] **步骤 3.2.1：改造 FilmPageHero.tsx**

---

#### 步骤 3.3：更新服务页面传递 breadcrumbItems

每个服务页面（ppf, color-film, electric-steps, wheels, chassis, floor-mats, business-comfort, skid-plate 使用 ProductDetail；car-care 使用 CarCareHero；window-film 使用 FilmPageHero）需要在页面中计算并传入 breadcrumbItems。

模式（以 `/product/ppf/page.tsx` 为例）：

```tsx
import { getProductBreadcrumbs } from "@/lib/product-breadcrumbs";

export default async function PpfPage() {
  const product = getProduct("ppf");
  if (!product) notFound();
  const breadcrumbItems = getProductBreadcrumbs("/product/ppf");
  return <ProductDetail product={product} breadcrumbItems={breadcrumbItems} />;
}
```

同理，car-care page 向 `CarCareHero` 传入 `breadcrumbItems`：
```tsx
// src/app/product/car-care/page.tsx
const breadcrumbItems = getProductBreadcrumbs("/product/car-care");
// <CarCareHero breadcrumbItems={breadcrumbItems} />
```

window-film page 向 `FilmPageHero` 传入 `breadcrumbItems`：
```tsx
// src/app/product/window-film/page.tsx
const breadcrumbItems = getProductBreadcrumbs("/product/window-film");
// <FilmPageHero breadcrumbItems={breadcrumbItems} title={...} description={...} />
```

注意：`CarCareHero` 和 `FlooringHero` 等也需要添加 `breadcrumbItems` prop（按 3.1/3.2 模式）。

需要修改的页面：
| 页面 | 组件 | pathname |
|------|------|----------|
| `/product/ppf/page.tsx` | ProductDetail | `/product/ppf` |
| `/product/color-film/page.tsx` | ProductDetail | `/product/color-film` |
| `/product/electric-steps/page.tsx` | ProductDetail | `/product/electric-steps` |
| `/product/wheels/page.tsx` | ProductDetail | `/product/wheels` |
| `/product/chassis/page.tsx` | ProductDetail | `/product/chassis` |
| `/product/floor-mats/page.tsx` | ProductDetail | `/product/floor-mats` |
| `/product/business-comfort/page.tsx` | ProductDetail | `/product/business-comfort` |
| `/product/skid-plate/page.tsx` | ProductDetail | `/product/skid-plate` |
| `/product/car-care/page.tsx` | CarCareHero | `/product/car-care` |
| `/product/window-film/page.tsx` | FilmPageHero | `/product/window-film` |
| `/product/flooring/page.tsx` | (need to check) | `/product/flooring` |

- [x] **步骤 3.3.1：更新所有 ProductDetail 服务页面**
- [x] **步骤 3.3.2：更新 car-care 页面（+ 给 CarCareHero 加 breadcrumbItems prop）**
- [x] **步骤 3.3.3：更新 window-film 页面（+ 确认 breadcrumbLabel prop 移除）**
- [x] **步骤 3.3.4：更新 flooring 页面（检查使用的 Hero 组件）**

- [x] **步骤 3.3.5：Commit**

```bash
git add src/components/ProductDetail.tsx src/components/film/FilmPageHero.tsx src/app/product/ppf/page.tsx src/app/product/color-film/page.tsx src/app/product/electric-steps/page.tsx src/app/product/wheels/page.tsx src/app/product/chassis/page.tsx src/app/product/floor-mats/page.tsx src/app/product/business-comfort/page.tsx src/app/product/skid-plate/page.tsx src/app/product/car-care/page.tsx src/app/product/window-film/page.tsx src/components/product/car-care/CarCareHero.tsx
git commit -m "refactor: replace breadcrumbs in shared components (ProductDetail, FilmPageHero, CarCareHero)"
```

---

### 任务 4：替换模型/专题 Hero 中的手写面包屑

每个 Hero 组件的改造模式：
1. 添加 `import { Breadcrumbs, type BreadcrumbItem } from "@/components/Breadcrumbs"`
2. Props 类型添加 `breadcrumbItems?: readonly BreadcrumbItem[]`
3. 替换 `<nav>...</nav>` 手写面包屑为 `{breadcrumbItems && <Breadcrumbs items={breadcrumbItems} className="mb-6" />}`
4. 移除不再需要的 `Link` + `ChevronRight` import（如果仅用于面包屑）

对应页面改造模式：
```tsx
// In page.tsx:
import { getProductBreadcrumbs } from "@/lib/product-breadcrumbs";
const breadcrumbItems = getProductBreadcrumbs("/product/{brand}/{model}");
// Pass to Hero: <HeroComponent breadcrumbItems={breadcrumbItems} ... />
```

**文件（Hero 组件 + 对应页面）：**

| # | Hero 组件 | 对应页面 | pathname |
|---|-----------|----------|----------|
| 4.1 | XiaomiSu7Hero | `/product/xiaomi/su7/page.tsx` | `/product/xiaomi/su7` |
| 4.2 | XiaomiYu7Hero | `/product/xiaomi/yu7/page.tsx` | `/product/xiaomi/yu7` |
| 4.3 | Zeekr9xHero | `/product/zeekr/9x/page.tsx` | `/product/zeekr/9x` |
| 4.4 | DenzaD9TopicHero | `/product/denza/d9/page.tsx` | `/product/denza/d9` |
| 4.5 | Gaoshan8Hero | `/product/gaoshan/8/page.tsx` | `/product/gaoshan/8` |
| 4.6 | TeslaTopicHero | `/product/tesla/page.tsx` | `/product/tesla` |
| 4.7 | VoyahDreamerHero | `/product/voyah/dreamer/page.tsx` | `/product/voyah/dreamer` |
| 4.8 | LiAutoI6Hero | `/product/li-auto/i6/page.tsx` | `/product/li-auto/i6` |
| 4.9 | XiaomiSeriesHero | `/product/xiaomi/page.tsx` | `/product/xiaomi` |
| 4.10 | ZhijieBrandHero | `/product/zhijie/page.tsx` | `/product/zhijie` |
| 4.11 | NioEs8Hero | `/product/nio/es8/page.tsx` | `/product/nio/es8` |
| 4.12 | WenjieSeriesHero | `/product/wenjie/page.tsx` | `/product/wenjie` |
| 4.13 | LiAutoI8Hero | `/product/li-auto/i8/page.tsx` | `/product/li-auto/i8` |
| 4.14 | LiAutoL9Hero | `/product/li-auto/l9/page.tsx` | `/product/li-auto/l9` |
| 4.15 | LiAutoMegaHero | `/product/li-auto/mega/page.tsx` | `/product/li-auto/mega` |
| 4.16 | LiAutoOneHero | `/product/li-auto/one/page.tsx` | `/product/li-auto/one` |
| 4.17 | Zeekr8xHero | `/product/zeekr/8x/page.tsx` | `/product/zeekr/8x` |
| 4.18 | XpengGxTopicHero | `/product/xpeng/gx/page.tsx` | `/product/xpeng/gx` |
| 4.19 | LedaoL90Hero | `/product/ledao/l90/page.tsx` | `/product/ledao/l90` |
| 4.20 | WenjieModelUpgradeHero | `/product/wenjie/{m6,m7,m8}/page.tsx` | `/product/wenjie/{m6,m7,m8}` |
| 4.21 | ZhijieV9TopicHero | `/product/zhijie/v9/page.tsx` | `/product/zhijie/v9` |

- [x] **步骤 4.1-4.21：依次改造每个 Hero 组件和对应页面**
- [x] **步骤 4.22：Commit（建议每 3-5 个 hero 一组 commit，也可一次性 commit）**

Commit 示例（一次性）：
```bash
git add src/components/xiaomi-su7/XiaomiSu7Hero.tsx src/components/xiaomi-yu7/XiaomiYu7Hero.tsx src/components/zeekr-9x/Zeekr9xHero.tsx src/components/denza/DenzaD9TopicHero.tsx src/components/gaoshan/Gaoshan8Hero.tsx src/components/tesla/TeslaTopicHero.tsx src/components/voyah/VoyahDreamerHero.tsx src/components/li-auto/LiAutoI6Hero.tsx src/components/xiaomi-series/XiaomiSeriesHero.tsx src/components/zhijie/ZhijieBrandHero.tsx src/components/nio/NioEs8Hero.tsx src/components/wenjie/WenjieSeriesHero.tsx src/components/li-auto/LiAutoI8Hero.tsx src/components/li-auto/LiAutoL9Hero.tsx src/components/li-auto/LiAutoMegaHero.tsx src/components/li-auto/LiAutoOneHero.tsx src/components/zeekr-8x/Zeekr8xHero.tsx src/components/xpeng/XpengGxTopicHero.tsx src/components/ledao/LedaoL90Hero.tsx src/components/wenjie/model/WenjieModelUpgradeHero.tsx src/components/zhijie/ZhijieV9TopicHero.tsx
git add src/app/product/xiaomi/su7/page.tsx src/app/product/xiaomi/yu7/page.tsx src/app/product/zeekr/9x/page.tsx src/app/product/denza/d9/page.tsx src/app/product/gaoshan/8/page.tsx src/app/product/tesla/page.tsx src/app/product/voyah/dreamer/page.tsx src/app/product/li-auto/i6/page.tsx src/app/product/xiaomi/page.tsx src/app/product/zhijie/page.tsx src/app/product/nio/es8/page.tsx src/app/product/wenjie/page.tsx src/app/product/li-auto/i8/page.tsx src/app/product/li-auto/l9/page.tsx src/app/product/li-auto/mega/page.tsx src/app/product/li-auto/one/page.tsx src/app/product/zeekr/8x/page.tsx src/app/product/xpeng/gx/page.tsx src/app/product/ledao/l90/page.tsx src/app/product/wenjie/m6/page.tsx src/app/product/wenjie/m7/page.tsx src/app/product/wenjie/m8/page.tsx src/app/product/zhijie/v9/page.tsx
git commit -m "refactor: replace hand-written breadcrumbs in all model/topic heroes"
```

---

### 任务 5：为缺少面包屑的 Hero 组件添加支持

这些 Hero 已有手写面包屑，需要按任务 4 的相同模式改造。列出如下：

**品牌 Hero 组件：**
| # | Hero 组件 | 对应页面 | pathname |
|---|-----------|----------|----------|
| 5.1 | DenzaBrandHero | `/product/denza/page.tsx` | `/product/denza` |
| 5.2 | LiAutoSeriesHero | `/product/li-auto/page.tsx` | `/product/li-auto` |
| 5.3 | (其他品牌 Hero) | | |

**模型 Hero 组件：**
| # | Hero 组件 | 对应页面 | pathname |
|---|-----------|----------|----------|
| 5.4 | CarCareHero | `/product/car-care/page.tsx` | `/product/car-care` |
| 5.5 | CarMatHero | `/product/flooring/page.tsx` | `/product/flooring` |
| 5.6 | ElectricStepHero | `/product/electric-steps/page.tsx` | `/product/electric-steps` |
| 5.7 | WheelHero | `/product/wheels/page.tsx` | `/product/wheels` |

注意：`ElectricStepHero` 等产品级 Hero 已在任务 3 中通过 `ProductDetail` 覆盖。只需确认。

- [x] **步骤 5.1-5.7：改造品牌 Hero 和其他 Hero 组件**

- [x] **步骤 5.8：Commit**

```bash
git add src/components/denza/DenzaBrandHero.tsx src/components/li-auto/LiAutoSeriesHero.tsx
git commit -m "refactor: add breadcrumbItems prop to brand heroes"
```

---

### 任务 6：为没有 Hero 的页面添加面包屑

这些页面没有使用统一的 Hero 组件（或 Hero 不含面包屑），需要直接在页面中渲染 `<Breadcrumbs>`。

**文件：**

| # | 页面 | 说明 |
|---|------|------|
| 6.1 | `/product/page.tsx` | 产品中心首页，在 ProductHero 上方渲染 Breadcrumbs |
| 6.2 | `/product/window-film/[packageSlug]/page.tsx` | 窗膜套餐详情页，在内容上方渲染 |
| 6.3 | 品牌页面使用 BrandPlaceholder | wenjie, li-auto, tesla, xpeng, denza, voyah, ledao, gaoshan, nio |

---

#### 步骤 6.1：产品中心首页

修改 `src/app/product/page.tsx`：
```tsx
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getProductBreadcrumbs } from "@/lib/product-breadcrumbs";

export default function ProductCenter() {
  const liveBrands = getLiveBrands();
  const liveServices = getLiveServices();
  const breadcrumbItems = getProductBreadcrumbs("/product");

  return (
    <>
      <Header />
      <main>
        <Breadcrumbs items={breadcrumbItems} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6" />
        <ProductHero ... />
        ...
      </main>
      <Footer />
    </>
  );
}
```

- [x] **步骤 6.1.1：为 /product/page.tsx 添加面包屑**

---

#### 步骤 6.2：窗膜套餐详情页

修改 `src/app/product/window-film/[packageSlug]/page.tsx`：
```tsx
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getProductBreadcrumbs } from "@/lib/product-breadcrumbs";

export default async function WindowFilmPackagePage({ params }: ...) {
  const { packageSlug } = await params;
  const breadcrumbItems = getProductBreadcrumbs(`/product/window-film/${packageSlug}`);
  // 在内容上方渲染 Breadcrumbs
  return (
    <>
      <Header />
      <main>
        <Breadcrumbs items={breadcrumbItems} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6" />
        <WindowFilmPackageDetail ... />
      </main>
      <Footer />
    </>
  );
}
```

- [x] **步骤 6.2.1：为 window-film/[packageSlug]/page.tsx 添加面包屑**

---

#### 步骤 6.3：品牌页面（BrandPlaceholder）

每个使用 BrandPlaceholder 的品牌页面都需要：
1. 顶部 import Breadcrumbs + getProductBreadcrumbs
2. 在 `<Header />` 之后、`<main>` 之前（或 main 内）渲染 Breadcrumbs

模式（以 `/product/denza/page.tsx` 为例）：
```tsx
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getProductBreadcrumbs } from "@/lib/product-breadcrumbs";

export default function DenzaBrandPage() {
  const brand = getBrandRoute("denza");
  if (!brand || brand.type !== "vehicle_brand") notFound();
  const models = getModelsByBrand("denza")...
  const breadcrumbItems = getProductBreadcrumbs("/product/denza");

  return (
    <>
      <Header />
      <Breadcrumbs items={breadcrumbItems} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6" />
      <main id="main-content" tabIndex={-1} className="flex-grow">
        <BrandPlaceholder ... />
      </main>
      <Footer />
    </>
  );
}
```

需要修改的品牌页面：
- `/product/wenjie/page.tsx`
- `/product/li-auto/page.tsx`（LiAutoSeriesHero 已有面包屑，可能已在任务 5 覆盖）
- `/product/tesla/page.tsx`（TeslaTopicHero 已有面包屑）
- `/product/xpeng/page.tsx`
- `/product/denza/page.tsx`
- `/product/voyah/page.tsx`
- `/product/ledao/page.tsx`
- `/product/gaoshan/page.tsx`
- `/product/nio/page.tsx`

注意：有些品牌页面使用了 Hero（如 WenjieSeriesHero、LiAutoSeriesHero、TeslaTopicHero）- 它们已在任务 4/5 中通过 Hero prop 方式覆盖。只有使用 `BrandPlaceholder` 的页面的直接在外部渲染。

- [x] **步骤 6.3.1-6.3.9：为使用 BrandPlaceholder 的品牌页面添加面包屑**

- [x] **步骤 6.4：Commit**

```bash
git add src/app/product/page.tsx src/app/product/window-film/\[packageSlug\]/page.tsx src/app/product/denza/page.tsx src/app/product/nio/page.tsx src/app/product/xpeng/page.tsx src/app/product/voyah/page.tsx src/app/product/ledao/page.tsx src/app/product/gaoshan/page.tsx
git commit -m "feat: add breadcrumbs to pages without heroes"
```

---

### 任务 7：检查脚本与 Package.json

**文件：**
- 创建：`scripts/check-product-breadcrumbs.mjs`
- 修改：`package.json`

---

#### 步骤 7.1：创建检查脚本

创建 `scripts/check-product-breadcrumbs.mjs`：

```mjs
#!/usr/bin/env node
/**
 * 产品页面面包屑覆盖检查脚本
 *
 * 扫描 src/app/product/ 下所有 page.tsx，检查是否包含
 * `<Breadcrumbs` 或 `getProductBreadcrumbSchema`。
 * 任一命中即视为通过。
 *
 * 用法:
 *   npm run check:breadcrumbs
 */

import { readFileSync } from "node:fs";
import { globSync } from "fast-glob";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PAGES_GLOB = "src/app/product/**/page.tsx";

const pages = globSync(PAGES_GLOB, { cwd: ROOT });
const RE_BREADCRUMBS = /<Breadcrumbs|getProductBreadcrumbSchema/;

const missing: string[] = [];

for (const page of pages) {
  const content = readFileSync(resolve(ROOT, page), "utf-8");
  if (!RE_BREADCRUMBS.test(content)) {
    missing.push(page);
    console.error(`MISSING: ${page}`);
  }
}

if (missing.length > 0) {
  console.error(`\n${missing.length} product page(s) missing breadcrumbs.`);
  process.exit(1);
}

console.log(`All ${pages.length} product pages have breadcrumbs.`);
```

注意：脚本依赖 `fast-glob`。检查 `package.json` 中是否已有此依赖。如果没有，替换为 Node.js 内置的 `fs` + 递归 glob：

替代方案（无外部依赖）：
```mjs
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, relative, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PRODUCT_DIR = resolve(ROOT, "src/app/product");

function findPageFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findPageFiles(fullPath));
    } else if (entry.name === "page.tsx") {
      results.push(relative(ROOT, fullPath));
    }
  }
  return results;
}

const pages = findPageFiles(PRODUCT_DIR);
const RE_BREADCRUMBS = /<Breadcrumbs|getProductBreadcrumbSchema/;
const missing: string[] = [];

for (const page of pages) {
  const content = readFileSync(resolve(ROOT, page), "utf-8");
  if (!RE_BREADCRUMBS.test(content)) {
    missing.push(page);
    console.error(`MISSING: ${page}`);
  }
}

if (missing.length > 0) {
  console.error(`\n${missing.length} product page(s) missing breadcrumbs.`);
  process.exit(1);
}

console.log(`\n✓ All ${pages.length} product pages have breadcrumbs.`);
```

- [x] **步骤 7.1.1：创建 scripts/check-product-breadcrumbs.mjs**

---

#### 步骤 7.2：更新 package.json

```json
"check:breadcrumbs": "node scripts/check-product-breadcrumbs.mjs",
"check": "npm run lint && npm run typecheck && npm run verify:zeekr-images && npm run check:backup && npm run check:breadcrumbs && npm run build",
```

在 `package.json` 的 `scripts` 部分添加 `check:breadcrumbs`，并在 `check` 链中插入 `&& npm run check:breadcrumbs &&`。

- [x] **步骤 7.2.1：添加 check:breadcrumbs 脚本**
- [x] **步骤 7.2.2：在 check 链中插入 check:breadcrumbs**

- [x] **步骤 7.3：Commit**

```bash
git add scripts/check-product-breadcrumbs.mjs package.json
git commit -m "feat: add check:breadcrumbs verification script"
```

---

### 任务 8：最终验证

- [x] **步骤 8.1：运行 `npm run check:breadcrumbs` — 必须通过（0 missing）**
- [x] **步骤 8.2：运行 `npm test` — 所有测试通过（含新建的 Breadcrumbs + product-breadcrumbs 测试）**
- [x] **步骤 8.3：运行 `npm run lint` — 无新错误**
- [x] **步骤 8.4：运行 `npm run build` — 构建成功**

---

## 执行提示

### 修改 Hero 组件的统一模式

每个 Hero 组件的改动都是一致的。以下是一个完整的转换示例（以 `XiaomiSu7Hero.tsx` 为例）：

**Before:**
```tsx
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function XiaomiSu7Hero({ totalProjects, totalScenarios, heroImage }: Props) {
  return (
    <section>
      <div className="...">
        <nav className="flex items-center text-sm text-zinc-500 mb-6" aria-label="面包屑">
          <Link href="/product">产品中心</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href="/product/xiaomi">小米系列</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-zinc-300">小米 SU7</span>
        </nav>
        ...
      </div>
    </section>
  );
}
```

**After:**
```tsx
import { Breadcrumbs, type BreadcrumbItem } from "@/components/Breadcrumbs";

type Props = {
  totalProjects: number;
  totalScenarios: number;
  heroImage: ...;
  breadcrumbItems?: readonly BreadcrumbItem[];
};

export function XiaomiSu7Hero({ totalProjects, totalScenarios, heroImage, breadcrumbItems }: Props) {
  return (
    <section>
      <div className="...">
        {breadcrumbItems && <Breadcrumbs items={breadcrumbItems} className="mb-6" />}
        ...
      </div>
    </section>
  );
}
```

### 检查 `align` 属性

对于目前面包屑居中显示（`justify-center`）的 Hero（如 `ProductDetail`、`FilmPageHero`），传递 `align="center"`：
```tsx
<Breadcrumbs items={breadcrumbItems} className="mb-6" align="center" />
```

### 检查 import 清理

Hero 组件改造后，如果 `Link` 和 `ChevronRight` 仅用于面包屑，可以移除。但如果组件其他地方也用了 `Link` 或 `ChevronRight`，保留那些 import。
