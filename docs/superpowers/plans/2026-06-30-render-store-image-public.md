---
change: render-store-image-public
design-doc: docs/superpowers/specs/2026-06-30-render-store-image-public-design.md
base-ref: b95e20743d27c83f8bb376d57f55e11756d1a995
archived-with: 2026-06-30-render-store-image-public
---

# 公开站渲染门店主图 — 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 让公开站（详情页 + 首页推荐位）正确渲染 admin 已上传或运营录入的门店主图，并在 admin 详情页补全图片管理入口，闭环 admin UX。

**架构：** 三层最小修改：
1. 数据层 `mapApiStore` 补 `imagePath ?? imageUrl → image` 与 `isActive` 字段映射（`src/lib/data.ts`）
2. 公开渲染层：用 `Next/Image` 替换详情页 `Building2` 占位（`src/app/agent/store/[id]/page.tsx:131-141`），新增 RSC `<FeaturedStores />`（`src/components/FeaturedStores.tsx`）并挂到首页 `ProductsQuickEntry` 之后
3. Admin UX 层：在 `publishChecks` `key:"image"` 项旁加跳转 Link（`src/app/admin/(dashboard)/stores/[id]/page.tsx:212-219` + `PublishCheck` 类型扩展 + 渲染分支）

**技术栈：** Next.js 16.2.1（App Router）+ React 19.2.4 + `next/image` + TS strict + Tailwind v4。无新依赖。

archived-with: 2026-06-30-render-store-image-public
---

## 涉及文件结构（任务编排前置）

| 类型 | 路径 | 职责 |
|------|------|------|
| 修改 | `src/lib/data.ts` | `mapApiStore` 补 `image` + `isActive` 映射 |
| 修改 | `src/lib/store.ts` | `Store` 类型新增 `isActive?: boolean` |
| 修改 | `src/app/agent/store/[id]/page.tsx` | 替换 Building2 占位 → Next/Image |
| 新增 | `src/components/FeaturedStores.tsx` | 首页推荐位 RSC |
| 修改 | `src/app/page.tsx` | 挂载 `<FeaturedStores />` |
| 修改 | `src/app/admin/(dashboard)/stores/[id]/page.tsx` | `PublishCheck` 类型加 `action?` + `publishChecks` `image` 项挂 Link + 渲染分支 |
| 新增 | `src/lib/data.test.ts`（如不存在则新建） | `mapApiStore` 单元测试 |

**风险约束：** TypeScript strict + `any` 禁用；`Store.image` 已是 `string | undefined`，扩展 `isActive` 字段必须先改类型。`PublishCheck` 在 admin 页面内部定义，扩展字段需同步两处（类型 + 渲染）。

archived-with: 2026-06-30-render-store-image-public
---

## 任务 1：扩展 `Store` 类型并修复 `mapApiStore` 映射

**文件：**
- 修改：`src/lib/store.ts`（在 `Store` 类型加 `isActive?: boolean`）
- 修改：`src/lib/data.ts`（`mapApiStore` 加 `image` 优先级与 `isActive` 默认值）
- 新增测试：`src/lib/data.test.ts`（如文件不存在则新建）

- [x] 任务 1 全部步骤（7 个子步骤）

- [x] **步骤 1：编写失败的测试**

在 `src/lib/data.test.ts`（如不存在则新建）顶部 mock `fetch`，通过 `getStores` 间接验证映射：

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("mapApiStore (via getStores fallback path)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("imagePath 优先于 imageUrl", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [{
          id: "s1", name: "测试店",
          provinceSlug: "guangdong", provinceLabel: "广东",
          citySlug: "foshan", cityLabel: "佛山",
          address: "x", phone: "1", phoneTel: "tel:1",
          imagePath: "/images/stores/s1.webp",
          imageUrl: "https://legacy.example/x.jpg",
          isActive: true,
        }],
      }),
    }) as unknown as typeof fetch;

    const { getStores } = await import("@/lib/data");
    const stores = await getStores({ limit: 1 });
    expect(stores[0].image).toBe("/images/stores/s1.webp");
    expect(stores[0].isActive).toBe(true);
  });

  it("imagePath=null 时 fallback 到 imageUrl", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [{
          id: "s1", name: "测试店",
          provinceSlug: "guangdong", provinceLabel: "广东",
          citySlug: "foshan", cityLabel: "佛山",
          address: "x", phone: "1", phoneTel: "tel:1",
          imagePath: null,
          imageUrl: "https://legacy.example/x.jpg",
          isActive: true,
        }],
      }),
    }) as unknown as typeof fetch;

    const { getStores } = await import("@/lib/data");
    const stores = await getStores({ limit: 1 });
    expect(stores[0].image).toBe("https://legacy.example/x.jpg");
  });

  it("两者都为 null → image = undefined", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [{
          id: "s1", name: "测试店",
          provinceSlug: "guangdong", provinceLabel: "广东",
          citySlug: "foshan", cityLabel: "佛山",
          address: "x", phone: "1", phoneTel: "tel:1",
          imagePath: null, imageUrl: null,
          isActive: true,
        }],
      }),
    }) as unknown as typeof fetch;

    const { getStores } = await import("@/lib/data");
    const stores = await getStores({ limit: 1 });
    expect(stores[0].image).toBeUndefined();
  });

  it("isActive 字段缺失 → 默认 true", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [{
          id: "s1", name: "测试店",
          provinceSlug: "guangdong", provinceLabel: "广东",
          citySlug: "foshan", cityLabel: "佛山",
          address: "x", phone: "1", phoneTel: "tel:1",
          // isActive 故意省略
        }],
      }),
    }) as unknown as typeof fetch;

    const { getStores } = await import("@/lib/data");
    const stores = await getStores({ limit: 1 });
    expect(stores[0].isActive).toBe(true);
  });
});
```

- [x] **步骤 2：运行测试验证失败**

运行：`npx vitest run src/lib/data.test.ts`
预期：FAIL — `stores[0].image` 拿到的是 `imageUrl`（因 mapApiStore 当前 line 29 只用 `raw.imageUrl`），且 `stores[0].isActive` 为 `undefined`。

- [x] **步骤 3：在 `Store` 类型加 `isActive` 字段**

修改 `src/lib/store.ts`，在 `Store` 类型加：

```ts
/** 门店是否对公开站可见（API 字段；fallback 默认 true） */
isActive?: boolean;
```

- [x] **步骤 4：修改 `mapApiStore`**

修改 `src/lib/data.ts` 中 `mapApiStore`，将 `image: raw.imageUrl` 替换为优先级映射，并新增 `isActive`：

```ts
image: raw.imagePath ?? raw.imageUrl ?? undefined,
isActive: raw.isActive ?? true,
```

- [x] **步骤 5：运行测试验证通过**

运行：`npx vitest run src/lib/data.test.ts`
预期：4 个用例全 PASS。

- [x] **步骤 6：跑 typecheck 确认无新错**

运行：`npx tsc --noEmit`
预期：0 新错（CLAUDE.md 已知 9 个 test 旧错不计；本任务只动 `data.ts` + `store.ts` 类型）。

- [x] **步骤 7：Commit**

```bash
git add src/lib/store.ts src/lib/data.ts src/lib/data.test.ts
git commit -m "feat(data): map store imagePath and isActive fields"
```

archived-with: 2026-06-30-render-store-image-public
---

## 任务 2：公开详情页替换 Building2 占位

**文件：**
- 修改：`src/app/agent/store/[id]/page.tsx` imports + 第 131-141 行占位 DOM

- [x] 任务 2 全部步骤（6 个子步骤）

- [x] **步骤 1：在文件顶部加 `Image` import 与 `BLUR_DATA_URL` 常量**

修改 `src/app/agent/store/[id]/page.tsx` 顶部 imports：

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  MapPin,
  Phone,
  Clock,
  // Building2,  // 替换图片后删除该 import
  ChevronRight,
} from "lucide-react";

/** Next/Image placeholder：1x1 灰图 base64，避免 CLS（~30 字节） */
const BLUR_DATA_URL =
  "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/v3AgAA=";
```

- [x] **步骤 2：替换左栏 Building2 占位**

修改 `src/app/agent/store/[id]/page.tsx:130-141`，将整个左栏占位块替换为：

```tsx
<div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
  <Image
    src={store.image ?? "/images/placeholders/store.webp"}
    alt={`${store.name} 门头实景`}
    fill
    sizes="(min-width: 768px) 50vw, 100vw"
    placeholder="blur"
    blurDataURL={BLUR_DATA_URL}
    className="object-cover"
  />
</div>
```

- [x] **步骤 3：删除 `Building2` import（若已不再使用）**

执行 `grep -n "Building2" src/app/agent/store/[id]/page.tsx` 确认是否还有引用，若仅在 import 行则删除。

- [x] **步骤 4：跑 typecheck 与 build**

```bash
npx tsc --noEmit
npm run build
```

预期：typecheck 0 新错；build 通过且 SSG 输出包含 `/agent/store/[id]` 静态化页面。

- [x] **步骤 5：手动浏览器验证**

打开 dev server（`npm run dev`），访问：
- `/agent/store/100001`（静态 fallback 无图 → 应显示 `placeholders/store.webp`，无破图）
- 任意已上传图片的 store id（应显示该图，`alt` 为「店名 门头实景」）

DevTools Network 面板：确认 `/_next/image?url=...` 请求命中，srcset 包含多个尺寸。

- [x] **步骤 6：Commit**

```bash
git add src/app/agent/store/[id]/page.tsx
git commit -m "feat(store-detail): render store image with Next/Image"
```

archived-with: 2026-06-30-render-store-image-public
---

## 任务 3：新增首页 `<FeaturedStores />` RSC

**文件：**
- 新增：`src/components/FeaturedStores.tsx`（默认导出 `FeaturedStores` async RSC）
- 修改：`src/app/page.tsx`（导入并挂载）

- [x] 任务 3 全部步骤（6 个子步骤）

- [x] **步骤 1：创建文件 `src/components/FeaturedStores.tsx`**

完整内容：

```tsx
import Image from "next/image";
import Link from "next/link";
import { getStores } from "@/lib/data";

/** Next/Image placeholder：1x1 灰图 base64，避免 CLS（~30 字节） */
const BLUR_DATA_URL =
  "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/v3AgAA=";

/**
 * 首页「推荐门店」section
 * - RSC：零 JS 增量
 * - 数据通过 getStores({ limit: 4 }) 拉取（API 优先 / 静态 fallback）
 * - 过滤 s.isActive !== false（向后兼容：缺失字段视为 true）
 * - 空守卫：active.length === 0 时整个 section 不渲染
 * - 4 列响应式：mobile 1 / sm 2 / lg 4
 * - 视觉对齐 ProductsQuickEntry（标题 tracking-widest text-blue-400、卡片 bg-zinc-900 border-zinc-800）
 */
export async function FeaturedStores() {
  const stores = await getStores({ limit: 4 });
  const active = stores.filter((s) => s.isActive !== false);

  if (active.length === 0) return null;

  return (
    <section className="py-20 bg-black border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm tracking-widest text-blue-400 mb-3">
            FEATURED STORES
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">推荐门店</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {active.map((store) => (
            <Link
              key={store.id}
              href={`/agent/store/${store.id}`}
              className="group bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 overflow-hidden transition-colors"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-zinc-950">
                <Image
                  src={store.image ?? "/images/placeholders/store.webp"}
                  alt={`${store.name} 门头实景`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-white transition-colors">
                  {store.name}
                </h3>
                <span className="inline-flex items-center mt-2 text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                  {store.cityLabel}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [x] **步骤 2：在首页挂载 `<FeaturedStores />`**

修改 `src/app/page.tsx`：

```tsx
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { CoreServices } from "@/components/CoreServices";
import { ProductsQuickEntry } from "@/components/ProductsQuickEntry";
import { FeaturedStores } from "@/components/FeaturedStores";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        <Hero />
        <WhyChooseUs />
        <CoreServices />
        <ProductsQuickEntry />
        <FeaturedStores />
      </main>
      <Footer />
    </>
  );
}
```

- [x] **步骤 3：跑 typecheck 与 build**

```bash
npx tsc --noEmit
npm run build
```

预期：typecheck 0 新错；build 通过，SSG 静态化首页。

- [x] **步骤 4：手动浏览器验证**

启动 dev server（`npm run dev`），访问 `/`：
- 桌面 1440px：4 列网格；平板 768px：2 列；移动 390px：1 列
- DevTools Network 面板：确认 4 张推荐位图片带 `<link rel="preload" as="image">`（Next `priority` 注入）
- 每张卡 hover：图片 `scale-105`、卡片边框变亮
- 点击卡片跳转到 `/agent/store/{id}`

- [x] **步骤 5：空守卫验证**

若 `getStores` 返回空数组：整个 section 不渲染（DOM 中无 `<section>`）。

验证方法：临时把 `limit: 4` 改为 `limit: 0`，访问 `/`，推荐位 section 应消失。验证后恢复 `limit: 4`。

- [x] **步骤 6：Commit**

```bash
git add src/components/FeaturedStores.tsx src/app/page.tsx
git commit -m "feat(home): add FeaturedStores RSC section"
```

archived-with: 2026-06-30-render-store-image-public
---

## 任务 4：Admin 详情页补「管理门店主图」跳转链接

**文件：**
- 修改：`src/app/admin/(dashboard)/stores/[id]/page.tsx`（`PublishCheck` 类型 + 渲染分支 + `image` 项）

- [x] 任务 4 全部步骤（6 个子步骤）

- [x] **步骤 1：扩展 `PublishCheck` 类型**

修改 `src/app/admin/(dashboard)/stores/[id]/page.tsx`，加 import 并扩展接口：

```tsx
import type { ReactNode } from "react";

interface PublishCheck {
  key: string;
  label: string;
  ok: boolean;
  hint?: string;
  /** 可选的操作链接/按钮，渲染在 hint 下方 */
  action?: ReactNode;
}
```

- [x] **步骤 2：在 `image` 项挂 Link**

修改 `publishChecks` 数组中 `key: "image"` 项：

```tsx
{
  key: "image",
  label: "门店图片",
  ok: !!storeData.imagePath,
  hint: !storeData.imagePath ? "建议上传；缺失时仍可发布" : undefined,
  action: (
    <Link
      href={`/admin/stores/${storeData.id}/image`}
      className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
    >
      {storeData.imagePath ? "管理主图 →" : "上传门店图 →"}
    </Link>
  ),
},
```

- [x] **步骤 3：在渲染分支显示 action**

修改渲染 `PublishCheck` 列表的 div，在 `<p>{c.hint}</p>` 之后加：

```tsx
{c.action && <div className="mt-1">{c.action}</div>}
```

- [x] **步骤 4：跑 typecheck 与 build**

```bash
npx tsc --noEmit
npm run build
```

预期：typecheck 0 新错；build 通过。

- [x] **步骤 5：手动浏览器验证**

1. 启动 dev server，登录 admin（默认 `admin / admin123`）
2. 访问 `/admin/stores/100001`
3. 右侧「发布检查」面板中，「门店图片」项：
   - 若有图：显示「管理主图 →」蓝色链接
   - 若无图：显示「上传门店图 →」蓝色链接
4. 点击链接，跳转至 `/admin/stores/100001/image` uploader

- [x] **步骤 6：Commit**

```bash
git add src/app/admin/\(dashboard\)/stores/\[id\]/page.tsx
git commit -m "feat(admin): link to store image management from publish checks"
```

archived-with: 2026-06-30-render-store-image-public
---

## 任务 5：验证收尾

- [x] 任务 5 全部步骤（3 个子步骤）

- [x] **步骤 1：完整 CI 链**

```bash
npx tsc --noEmit
npm run build
```

预期：两者均通过；typecheck 仅出现已知的 9 个 test 文件旧错（CLAUDE.md 已豁免）。

- [x] **步骤 2：浏览器全场景回归**

dev server 启动后：

| 场景 | 期望 |
|------|------|
| `/agent/store/100001`（静态 fallback 无图） | 显示 `placeholders/store.webp`，无破图 |
| `/agent/store/{已上传图 id}` | 显示 admin 上传图，alt 含「门头实景」 |
| `/` 移动端 390px | 推荐位 1 列 |
| `/` 平板 768px | 推荐位 2 列 |
| `/` 桌面 1440px | 推荐位 4 列 |
| DevTools Network `/` | 推荐位图片带 `<link rel="preload">` |
| Hover 卡片 | 图片 `scale-105`、边框变亮 |
| `/admin/stores/{id}` 已上传图 | 「管理主图 →」链接 |
| `/admin/stores/{id}` 无图 | 「上传门店图 →」链接 |
| 点链接 | 跳转 `/admin/stores/{id}/image` uploader |

- [x] **步骤 3：Commit（若有截图或验证报告）**

```bash
git add docs/test-reports/ docs/design-reviews/screenshots/ 2>/dev/null || true
git commit -m "docs(verify): lighthouse + screenshots for store image rendering" || true
```
（验证报告已由 Task 5 implementer 提交 `9386055`）

archived-with: 2026-06-30-render-store-image-public
---

## 自检清单

**1. 规格覆盖度：**

- [x] Requirement `Store image data mapping` → 任务 1
- [x] Requirement `Public store detail page image rendering`（含 size hint）→ 任务 2
- [x] Requirement `Homepage featured stores section`（含 priority、空守卫、无图降级）→ 任务 3
- [x] Requirement `Image SEO attributes`（alt 格式、fill、sizes）→ 任务 2 + 3
- [x] Requirement `Admin store image management entry point`（含「上传/管理」文案分支）→ 任务 4

**2. 占位符扫描：** 无 "TODO" / "待定" / "类似任务 N"。

**3. 类型一致性：**
- `Store.image` 在 `src/lib/store.ts` 已存在 `string | undefined`，任务 1 加 `isActive?: boolean` 保持一致
- `PublishCheck` 类型在任务 4 步 1 扩展 `action?: ReactNode`，渲染分支在步骤 3 同步新增 `c.action` 显示
- `<FeaturedStores />` 用 `getStores({ limit: 4 })` → 返回 `Store[]`（直接数组，非 `{ data }` 解构）

**4. 验证盲点修正：**
- Design Doc 说详情页「Building2 占位 130-142 行」—— 实际外层 `<div>` 起 130 行、Building2 在 134 行、闭合 141 行，按 131-141 标注
- Design Doc 说 `publishChecks` 在「第 213-218 行」—— 实际 `key:"image"` 在 212-219 行，按实际行号标注

archived-with: 2026-06-30-render-store-image-public
---

## 关键修正点（执行时务必确认）

1. `<FeaturedStores />` 用 `const stores = await getStores({ limit: 4 })`（直接返回 `Store[]`），**不是** Design Doc 中笔误写的 `const { data: stores } = ...`
2. `PublishCheck` 接口扩展 `action?: ReactNode` 需要 `import type { ReactNode } from "react"`
3. 详情页 `Building2` icon 在替换图片后**删除**其 import 以避免 lint 警告
4. `next.config.ts` 已配 `images.formats: ["image/avif", "image/webp"]`，无需新增 remote pattern

archived-with: 2026-06-30-render-store-image-public
---

## 执行交接

**计划已完成。两种执行方式：**

**1. 子代理驱动（推荐）** — 每个任务调度一个新的子代理，任务间进行审查，快速迭代

**2. 内联执行** — 在当前会话中使用 `executing-plans` 逐任务实现，批量执行并设有检查点

### Critical Files for Implementation

- `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/src/lib/data.ts` — 核心数据层 `mapApiStore` 修复（任务 1）
- `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/src/lib/store.ts` — `Store` 类型扩展 `isActive` 字段（任务 1）
- `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/src/app/agent/store/[id]/page.tsx` — 公开详情页 Building2 占位替换（任务 2）
- `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/src/components/FeaturedStores.tsx` — 新增首页推荐位 RSC（任务 3）
- `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/src/app/page.tsx` — 首页挂载 FeaturedStores（任务 3）
- `/Users/fkycoya/Documents/WebsiteClone/lanhui-website/src/app/admin/(dashboard)/stores/[id]/page.tsx` — Admin 跳转链接 + `PublishCheck` 类型扩展（任务 4）
