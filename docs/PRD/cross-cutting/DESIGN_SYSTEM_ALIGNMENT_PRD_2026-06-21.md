# DESIGN_SYSTEM_ALIGNMENT_PRD_2026-06-21 — Vercel Geist 设计系统对齐

> 目的:把公开站 + CMS 的视觉/动效/文案对齐到 Vercel Geist 规范,把"在建中"感降到"在运营"感。
> 关联:`docs/PRD/00_MASTER_PRD.md` §5.5 横切主题;`AUDIT_AND_REGRESSION_PRD_2026-06-19.md` §3 P1/P2 一致性观察;Vercel Geist 官方 spec `vercel.com/design`(2026-06-21 内化)。
> 复用 ZEEKR build 模式:每个 P0 任务独立 commit + RED→GREEN→回归 + 视觉对照。

## 0. 元信息

| 项 | 值 |
|---|---|
| 日期 | 2026-06-21 |
| 触发 | Coya 阅读 `vercel.com/design` 规范后,要求对齐蓝辉现有视觉/动效/文案 |
| 范围 | 公开站 21 路由 + CMS 10 路由 + 全局组件 + 文案 |
| 方法 | Geist 规范逐项对账 + Gap Analysis + 实施任务分解(P0/P1/P2) |
| 输出 | 本 PRD + `src/lib/design-tokens.ts` + `globals.css` token 重写 + 14 项任务 |
| 优先级 | P0(影响专业感,1 周内):6 项 · P1(影响一致性,2-4 周内):5 项 · P2(加分,长期):3 项 |
| 维护节奏 | 设计规范变更时同步本 PRD;每季度对账 |

## 1. 背景与目标

蓝辉当前视觉/交互与 Vercel Geist 规范的**对账结果**:

| 维度 | 对齐度 | 主要 gap |
|---|---|---|
| 字体 (Geist Sans + Mono) | ✅ 已用 | 没用 token 体系,直接手设 `text-6xl font-bold tracking-tight` |
| Letter-spacing 节奏 | ❌ | 大标题仍用 `-0.025em`,Geist 72px 应 `-4.32px`(≈ -6%) |
| Color step 编码 | ⚠️ | Tailwind 灰阶当亮度用,没按"hover bg / active bg / border"语义编码 |
| Accent 语义 | ⚠️ | orange 当主强调、blue 当辅助;Geist 是 blue 当主、accent 单色用 |
| Spacing 三档节奏 | ❌ | `py-14/20/24/40` 混用,无 8/16/32-40 节奏感 |
| Motion 时长 | ❌ | 全站 `duration-300`,Geist 默认 0ms,日常 hover 用 150ms |
| 缓动函数 | ❌ | 用默认 `ease`,Geist 用 `cubic-bezier(0.175, 0.885, 0.32, 1.1)` |
| 圆角统一 | ❌ | `rounded-md/lg/xl/2xl/3xl/full` 5 族混用,Geist 要求**同视图一族** |
| 阴影层次 | ❌ | `shadow-lg shadow-orange-500/25` 营销味;`shadow-2xl shadow-black/40` 太重 |
| Focus-visible 环 | ❌ **严重** | 全站无 `focus-visible` 样式,键盘/屏幕阅读器用户失能 |
| 文案 voice | ❌ | `联系我们` / `查看门店` 是裸动词,Geist 要求 verb+noun |
| 占位文处理 | ❌ | `联系方式待补充` / `ICP备案号待备案` 直接暴露给用户 |
| 字体粗细 | ⚠️ | hero 一屏 normal/medium/semibold/bold 4 档,Geist 限 ≤2 档 |

**目标**:
- 短期(本季度):完成 P0 6 项,把"专业感"档位提一档
- 中期(下季度):完成 P1 5 项,把全站视觉一致性收敛到单族
- 长期:沉淀 `src/lib/design-tokens.ts`,作为后续所有新页/组件的唯一设计源

**非目标**(本 PRD 不做):
- ❌ 换字体(Geist 已在用)
- ❌ 切浅色主题(产品形态 = 暗色科技感)
- ❌ 改 Logo / 品牌色板(品牌已沉淀)
- ❌ 后台 `/admin/*` 视觉重做(admin 单独 PRD 管)

## 2. 范围与边界

### 2.1 包含

- ✅ **P0 6 项**(影响专业感 + 可访问性 + WCAG 合规)
- ✅ **P1 5 项**(影响品牌一致性 + 节奏感)
- ✅ **P2 3 项**(空状态/Loading/Error 标准化 + 断点对齐 + 长 letter-spacing 体系)
- ✅ 设计 token 文件 `src/lib/design-tokens.ts`(spacing / radius / motion / typography 4 个核心 token)
- ✅ `src/app/globals.css` 主题 token 重写(zinc 100→1000 按 Geist 语义编码)
- ✅ 文案 voice 整改(5 个高频按钮 + 4 类占位文)

### 2.2 不包含

- ❌ 接入 Vercel 实际组件库(shadcn/ui 已用 Base UI,不重复)
- ❌ 字体子集化(Geist 已通过 `@vercel/geist` 自动子集)
- ❌ 后台 admin 视觉重做(独立 PRD)
- ❌ 动效库引入(framer-motion 等,继续用 Tailwind transition)
- ❌ 暗色 → 浅色主题切换(产品形态 = 暗色科技)

## 3. 当前状态 (Status)

### 3.1 数据看板

| 指标 | 当前 (2026-06-21) | 目标 (季度内) |
|---|---|---|
| `:focus-visible` 覆盖率 | 0%(全站无样式) | 100%(所有交互元素) |
| `transition-duration: 150ms` 占比 | < 10%(局部) | ≥ 80%(日常 hover/active) |
| 单视图圆角族数 | 3-5 族混用 | 1 族(`rounded-md`/`lg`/`full`) |
| 文案 verb+noun 合规率 | < 50% | ≥ 90%(高频 5 个按钮全合规) |
| 占位文可见率 | 6+ 处(phone/icp/police/address/businessHours/email) | 0(要么填实,要么隐藏) |
| 设计 token 文件 | ❌ 不存在 | ✅ `src/lib/design-tokens.ts` |
| WCAG AA 对比度合规 | 部分页不合(zinc-500/600 on zinc-950) | 全站 ≥ 4.5:1 |
| 视觉一致性评级(主观) | B+(骨架对,血肉缺) | A(骨架 + 血肉 + 节奏) |

### 3.2 已知问题(已对账)

| ID | 文件 | 问题 | 优先级 | 状态 |
|---|---|---|---|---|
| DS-1 | `src/app/globals.css` | 无 `:focus-visible` 全局环,键盘失能 | P0 | ⚪ |
| DS-2 | `src/components/Header.tsx:109` `Hero.tsx:42` 等 | `transition-all duration-300` 滥用 | P0 | ⚪ |
| DS-3 | `src/components/Header.tsx:193` `Hero.tsx` CTA + `Footer.tsx:31` 等 | `rounded-md/lg/xl/2xl/full` 5 族混用 | P0 | ⚪ |
| DS-4 | `src/components/Hero.tsx:42` `Footer.tsx:31` | `shadow-lg shadow-orange-500/25` 营销味阴影 | P0 | ⚪ |
| DS-5 | `src/components/Header.tsx:289/292/296` `Footer.tsx:54` `Hero.tsx:48` | `联系我们` / `查看门店` / `查看产品中心` 裸动词按钮 | P0 | ⚪ |
| DS-6 | `src/lib/brand.ts:15/17/18/20/21` | `phone/icp/police/address/businessHours` 占位文 | P0 | ⚪ |
| DS-7 | `src/app/globals.css:7-49` | Tailwind theme token 没用 Geist step 编码 | P1 | ⚪ |
| DS-8 | `src/components/Hero.tsx:29` `Footer.tsx:31` 等 | `tracking-tight` (-0.025em) 太松 | P1 | ⚪ |
| DS-9 | `src/lib/` 无 | 无 `design-tokens.ts` 文件 | P1 | ⚪ |
| DS-10 | `src/components/Header.tsx:78` 等 | dropdown 用 `transition-all duration-300` | P1 | ⚪ |
| DS-11 | `src/components/Hero.tsx` `WhyChooseUs.tsx` `CoreServices.tsx` | 卡片用 `rounded-2xl` 不统一 | P1 | ⚪ |
| DS-12 | (缺) | 无 `<EmptyState>` 组件,占位/空数据混处理 | P2 | ⚪ |
| DS-13 | (缺) | Loading 文案无规范 | P2 | ⚪ |
| DS-14 | `tailwind.config` | `lg=1024` 与 Geist `lg=961` 不一致 | P2 | ⚪ |

## 4. Geist 规范核心(实施依据)

> 完整 spec 来源 `https://vercel.com/design`(2026-06-21)。以下为本项目实施要用的精简版。

### 4.1 Color step 编码(意图驱动)

| step | 用途 | 本项目 token 映射 |
|---|---|---|
| 100 | default bg / surface | `--zinc-100` |
| 200 | hover bg | `--zinc-200` |
| 300 | active bg | `--zinc-300` |
| 400 | default border | `--zinc-400` |
| 500 | hover border | `--zinc-500` |
| 600 | active border | `--zinc-600` |
| 700 | solid fill (high contrast) | `--zinc-700` |
| 800 | solid fill hover | `--zinc-800` |
| 900 | secondary text / icon | `--zinc-900` |
| 1000 | primary text / icon | `--zinc-950` |

**`gray-alpha-*`** 半透明叠层用、`**gray-*`** 实色用,**两套不互换**。

### 4.2 Accent 语义

| 颜色 | 语义 |
|---|---|
| **blue** | success / link / focus |
| red | error |
| amber | warning |
| green / teal / purple / pink | 数据可视化分类 |

**例外**(本项目适配):
- `orange-400/500` 主 CTA 强调色(汽车行业"动/改/暖"语义 > Geist blue 主导)
- `blue-400/500` 降级为 link / 辅助强调 / focus ring

### 4.3 Spacing 节奏

4px 基准 → `4 / 8 / 12 / 16 / 24 / 32 / 40 / 64 / 96`

**三档节奏**:
- 组内 (inline / icon-to-label): 8px
- 组间 (label-to-value): 16px
- section 间 (margin-top / padding-block): 32-40px

| Token | 值 | 用例 |
|---|---|---|
| `space-1` | 4px | 极小间距(icon 内 padding) |
| `space-2` | 8px | 组内 |
| `space-3` | 12px | 紧凑组间 |
| `space-4` | 16px | 标准组间 |
| `space-6` | 24px | 卡片内 padding(默认) |
| `space-8` | 32px | section 间 |
| `space-10` | 40px | 大 section 间 / page padding |
| `space-16` | 64px | hero 内 padding |
| `space-24` | 96px | hero 大 padding / page-level |

### 4.4 Motion

> "Use motion only when it clarifies a change, never for decoration."
> "A duration of 0ms is often the snappiest and best choice."

**缓动**:`cubic-bezier(0.175, 0.885, 0.32, 1.1)`(到尾有微小反弹)

| 场景 | 时长 |
|---|---|
| 状态变化 (hover/active/border) | **150ms** |
| popover / tooltip | 200ms |
| overlay / modal / drawer | 300ms |

**禁忌**:长循环 / 吸引注意力 / 与内容无关的装饰动画;必须 honor `prefers-reduced-motion`。

### 4.5 Shape — 同视图一族

| 等级 | 圆角 | 用途 |
|---|---|---|
| `radius-sm` | **6px** | 日常控件(button / input / card / 内嵌) |
| `radius-md` | **12px** | menu / dropdown / popover / modal |
| `radius-lg` | **16px** | fullscreen surface |
| `radius-full` | **9999px** | pill / avatar / 圆形 CTA |

**硬规则**:**同一视图只用一种圆角族**(要么全是 sm,要么全是 md)。**严禁** sm + xl + 2xl 混用。

### 4.6 Shadow 三档

| 场景 | shadow 值 |
|---|---|
| Raised card | `0 2px 2px rgba(0, 0, 0, 0.04)` |
| Popover / menu | `0 1px 1px rgba(0, 0, 0, 0.02), 0 4px 8px -4px rgba(0, 0, 0, 0.04), 0 16px 24px -8px rgba(0, 0, 0, 0.06)` |
| Modal / dialog | `0 1px 1px rgba(0, 0, 0, 0.02), 0 8px 16px -4px rgba(0, 0, 0, 0.04), 0 24px 32px -8px rgba(0, 0, 0, 0.06)` |

**暗色主题适配**(本项目):阴影降低强度 + 加 `0 1px 0 rgba(255,255,255,0.04)` 内描边。

**禁忌**:**绝不用** `shadow-{color}-{n}`(品牌色阴影是营销味,层次靠 border + tonal surface)。

### 4.7 Focus Ring(不可省略)

两段式:
```css
*:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--accent-blue);
}
```
**2px 表面色 gap + 2px 蓝环**,任何 button / link / input / select / textarea / [tabindex] 都必须有。

### 4.8 Typography Token

| Token | fontSize | weight | lineHeight | letterSpacing |
|---|---|---|---|---|
| `heading-72` | 72px | 600 | 72px | **-4.32px** |
| `heading-64` | 64px | 600 | 64px | -3.84px |
| `heading-48` | 48px | 600 | 56px | -2.88px |
| `heading-32` | 32px | 600 | 40px | -1.28px |
| `heading-24` | 24px | 600 | 32px | -0.96px |
| `heading-20` | 20px | 600 | 26px | -0.4px |
| `heading-16` | 16px | 600 | 24px | -0.32px |
| `heading-14` | 14px | 600 | 20px | -0.28px |
| `button-16` | 16px | 500 | 20px | 0 |
| `button-14` | 14px | 500 | 20px | 0 |
| `label-20` | 20px | 400 | 32px | 0 |
| `label-16` | 16px | 400 | 20px | 0 |
| `label-14` | 14px | 400 | 20px | 0 |
| `label-13` | 13px | 400 | 16px | 0 |
| `label-12` | 12px | 400 | 16px | 0 |
| `copy-24` | 24px | 400 | 36px | 0 |
| `copy-18` | 18px | 400 | 28px | 0 |
| `copy-16` | 16px | 400 | 24px | 0 |
| `copy-14` | 14px | 400 | 20px | 0 |
| `copy-13` | 13px | 400 | 18px | 0 |

**关键**:**字号越大 letterSpacing 越紧**(从 -4.32 到 -0.28 缩紧)。

### 4.9 Voice & Content

| Do | Don't |
|---|---|
| Title Case for labels / buttons / titles / tabs | "联系我们" (裸动词) |
| Sentence case for body / helper / toasts | "查看门店" (无 noun) |
| Action = **verb + noun** | `Confirm` / `OK` / 裸动词 |
| Error = **what + how-to-fix** | "提交失败"(无修复路径) |
| Toast = 只说事,无句号无 "successfully" | "已成功删除项目。" |
| Empty state = 指向第一个动作 | "暂无数据"(无 CTA) |
| Loading = 现在分词 + ellipsis 字符 `…` | "保存中..."(三点 ASCII) |
| 用 numerals (`3 个项目`) | "三个项目" |
| 用弯引号 `「」` `""` | 直线引号 `""` |
| skip "please" / 营销 superlatives | "轻松享受"、"极致体验" |

---

## 5. 实施规范(开发时怎么用)

### 5.1 新建 `src/lib/design-tokens.ts`

```ts
// src/lib/design-tokens.ts
// 单一设计 token 源。Geist 规范对账。
// 引用方式: import { tokens } from "@/lib/design-tokens";

export const tokens = {
  spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32, 10: 40, 16: 64, 24: 96 },
  radius:  { sm: 6, md: 12, lg: 16, full: 9999 },
  motion:  {
    fast: 150,    // hover/active/border
    base: 200,    // popover/tooltip
    slow: 300,    // overlay/modal
    ease: 'cubic-bezier(0.175, 0.885, 0.32, 1.1)',
  },
  z:       { dropdown: 50, modal: 60, toast: 70 },
} as const;

// Geist step → 本项目 zinc 映射 (语义驱动)
export const colorStep = {
  bg:      'zinc-100', // surface default
  bgHover: 'zinc-200',
  bgActive:'zinc-300',
  border:  'zinc-400',
  borderHover: 'zinc-500',
  borderActive:'zinc-600',
  fill:    'zinc-700', // solid fill high contrast
  fillHover: 'zinc-800',
  textSecondary: 'zinc-900',
  textPrimary:   'zinc-950',
} as const;

// Typography preset (letterSpacing 缩紧规则)
export const type = {
  h1: 'text-6xl font-semibold leading-[1] tracking-[-0.06em]',  // 64/64/-3.84
  h2: 'text-4xl font-semibold leading-tight tracking-[-0.045em]',// 48/56/-2.88
  h3: 'text-2xl font-semibold leading-tight tracking-[-0.02em]', // 32/40/-1.28
  h4: 'text-xl font-semibold leading-snug tracking-[-0.02em]',  // 24/32/-0.96
  body:'text-base font-normal leading-6',                        // 16/24/0
  bodyLg:'text-lg font-normal leading-7',                        // 18/28/0
  label:'text-sm font-medium leading-5',                         // 14/20/0
  caption:'text-xs font-normal leading-4 tracking-wide',          // 12/16/0
} as const;
```

### 5.2 `globals.css` 关键补丁

```css
/* Focus ring — 全局不可省略 */
@layer base {
  *:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px var(--background),
      0 0 0 4px var(--ring, oklch(0.488 0.243 264.376));
  }
  /* 暗色主题适配:ring 用 blue-400 (亮一点) */
  .dark *:focus-visible {
    box-shadow:
      0 0 0 2px var(--background),
      0 0 0 4px oklch(0.707 0.165 254.624);
  }
}

/* Motion — 单源缓动 */
:root {
  --ease-geist: cubic-bezier(0.175, 0.885, 0.32, 1.1);
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 5.3 Tailwind 常用 transition 模板(组件层替换)

| 场景 | className 模板 |
|---|---|
| Button hover/active | `transition-colors duration-150 ease-[var(--ease-geist)]` |
| Card hover border | `transition-[border-color,transform] duration-150 ease-[var(--ease-geist)] hover:-translate-y-0.5` |
| Dropdown open | `transition-[opacity,transform] duration-200 ease-[var(--ease-geist)]` |
| Modal/drawer | `transition-transform duration-300 ease-out` |
| Header scroll | `transition-[background-color,height,border-color] duration-150 ease-[var(--ease-geist)]` |

### 5.4 圆角统一规范(组件层替换)

| 组件类型 | 圆角族 | Tailwind |
|---|---|---|
| Button (小) | sm | `rounded-md` |
| Button (大 / Hero CTA) | sm | `rounded-md` |
| Input / Select | sm | `rounded-md` |
| Card (含 hero card) | sm | `rounded-md` |
| Dropdown / Popover | md | `rounded-lg` |
| Modal / Drawer | md | `rounded-lg` |
| Toast | md | `rounded-lg` |
| Fullscreen surface | lg | `rounded-xl` |
| CTA pill / Avatar / 圆形按钮 | full | `rounded-full` |

**硬规则**:**同一视图只用一种圆角族**;发现 `rounded-xl / 2xl / 3xl` 一律改 `rounded-md` 或 `rounded-lg`。

### 5.5 阴影规范(组件层替换)

| 组件类型 | Tailwind className |
|---|---|
| Card (raised) | `shadow-[0_2px_2px_rgba(0,0,0,0.04)]` |
| Dropdown | `shadow-[0_1px_1px_rgba(0,0,0,0.02),0_4px_8px_-4px_rgba(0,0,0,0.04),0_16px_24px_-8px_rgba(0,0,0,0.06)]` |
| Modal | `shadow-[0_1px_1px_rgba(0,0,0,0.02),0_8px_16px_-4px_rgba(0,0,0,0.04),0_24px_32px_-8px_rgba(0,0,0,0.06)]` |
| 暗色 Card 加内描边 | `shadow-[0_2px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.04)]` |

**禁忌**:**禁用** `shadow-{orange|blue}-{n}`(品牌色阴影)。**禁用** `shadow-2xl shadow-black/{n}` 在卡片上(过重)。

### 5.6 文案 voice 模板(文案层整改)

#### 按钮(verb + noun, ≤ 8 字)

| 当前 | 改为 | 原因 |
|---|---|---|
| `联系我们` | `联系蓝辉` 或 `咨询方案` | 加 noun |
| `查看门店` | `查找门店` | verb+noun |
| `查看产品中心` | `浏览产品` 或 `查看全部产品` | verb+noun |
| `添加企业微信咨询车型方案`(13 字) | `咨询车型方案` 或 `预约到店` | 缩到 ≤ 8 字 |
| `加载更多` | ✅ 保留 | verb+noun |
| `了解更多` | `了解详情` 或 `查看详情` | 删"更多"(无明确 noun) |

#### 占位文 / Empty State

| 当前 | 改为 |
|---|---|
| `联系方式待补充` | `暂无联系方式 · 加微信立即咨询` (加 CTA) |
| `ICP备案号待备案` | **整行隐藏** (无数据就不显示) |
| `详细地址待补充` | **隐藏** + 后台填实后再显示 |
| `营业时间待确认` | `营业时间 · 加微信预约` |
| `暂无数据` | `暂无数据 · [立即添加]` |

#### Error 文案 (what + how-to-fix)

```
❌ 提交失败
✅ 提交失败 · 缺少车型信息 · 请补充后重试
```

#### Loading 文案(现在分词 + ellipsis)

```
✅ 保存中… (用 `…` 而非 `...`)
✅ 上传中…
✅ 加载中…
```

### 5.7 受影响文件清单(本批任务)

| 文件 | 改什么 |
|---|---|
| `src/app/globals.css` | 加 `:focus-visible` 全局环 + motion CSS var + reduced-motion |
| `src/lib/design-tokens.ts` | **新建** |
| `src/lib/brand.ts` | 填实占位字段或删除 |
| `src/components/Header.tsx` | duration-300→150/200,圆角统一,过渡缓动 |
| `src/components/Hero.tsx` | CTA 阴影删,圆角,动效,文案 |
| `src/components/Footer.tsx` | 占位文处理,圆角,动效 |
| `src/components/WhyChooseUs.tsx` | 卡片圆角统一 sm |
| `src/components/CoreServices.tsx` | 同上 |
| `src/components/ProductsQuickEntry.tsx` | 同上 |
| `src/app/page.tsx` | (无) |
| `src/app/brand/page.tsx` | CTA / 圆角 / letterSpacing |
| `src/app/product/page.tsx` | 同上 |
| `src/app/contact/page.tsx` | 占位处理 |
| `src/components/shared/WeChatConsultModal.tsx` | Toast 文案 + Loading 字符 |

---

## 6. 验收标准 (DoD)

### 6.1 P0 通过标准(本批必须达成)

- [ ] **DS-1** 全站任一 `button / a / input / select` 经 Tab 键访问,有明显 focus ring
- [ ] **DS-2** Header / Hero / Footer / 全产品卡片的 `transition` 时长 = 150ms(dropdown/modal 200/300ms)
- [ ] **DS-3** 任一视口截图肉眼检查,圆角种类 ≤ 2 族(sm/full 或 md/full)
- [ ] **DS-4** `grep -rE "shadow-(orange|blue|amber|red|green)-" src/` 输出 0 行
- [ ] **DS-5** `Header.tsx / Footer.tsx / Hero.tsx` 5 个高频按钮全 verb+noun
- [ ] **DS-6** `brand.ts` 不再含 `待补充` / `待备案` / `待确认` 字面量(或字段已填实)

### 6.2 P1 通过标准(下季度)

- [ ] `src/lib/design-tokens.ts` 存在并被 ≥ 5 个组件 import
- [ ] `globals.css` zinc 100→1000 全部按 Geist 语义编码
- [ ] heading-64/48 letterSpacing 接近 -0.045em/-0.06em
- [ ] 全站 `duration-300` 仅出现在 modal/drawer/overlay(其他位置 = 150)

### 6.3 P2 通过标准(长期)

- [ ] `<EmptyState>` 组件存在,占位处全部走它
- [ ] Loading 文案全用 `…`(中点省略号字符)
- [ ] Error 文案全 "what + how-to-fix"
- [ ] `lg` 断点生效在 961px(iPad mini 1024 全 lg 样式)

### 6.4 视觉对照

每个 P0 任务完成后,在 `docs/audits/screenshots/2026-06-21-design-alignment/` 存 desktop 1440 / mobile 390 两视口截图,与改前对比。

### 6.5 质量门

- [ ] `npx tsc --noEmit` 通过(允许 9 个 pre-existing 错)
- [ ] `npm run build` 通过
- [ ] `npm run lint` 通过(新增 0 警告)
- [ ] Playwright e2e 通过(11+ 用例)
- [ ] Lighthouse 性能分数不降级(基准 2026-06-19)
- [ ] WCAG AA 对比度扫描通过(axe-core)

---

## 7. 任务清单 (Backlog)

### P0(本批,1 周内,影响专业感 + WCAG)

| ID | 任务 | 文件 | 估时 | 验证 | 状态 |
|---|---|---|---|---|---|
| **DS-1** | 全站加 `:focus-visible` 全局环 + reduced-motion 兜底 | `src/app/globals.css` | 30 min | Tab 键访问任意交互元素 | ⚪ |
| **DS-2** | Header / Hero / Footer 的 transition 全部降到 150ms / 200ms,加 Geist ease | 3 文件 | 1 h | DevTools 看 transition 时长 | ⚪ |
| **DS-3** | 全站圆角收敛:`rounded-xl/2xl/3xl` 全替成 `md/lg/full` | 全 components grep | 2 h | 截图肉眼 + `grep -rE "rounded-(xl\|2xl\|3xl)" src/` = 0 | ⚪ |
| **DS-4** | 删品牌色阴影 `shadow-orange/blue-*`,换 border-based 层次 | Hero / Header / Footer / 卡片 | 1 h | `grep -rE "shadow-(orange\|blue\|amber\|red\|green)-" src/` = 0 | ⚪ |
| **DS-5** | 5 个高频按钮文案改 verb+noun | Header / Footer / Hero / Mobile Menu | 1 h | 5 处全合规 | ⚪ |
| **DS-6** | `brand.ts` 占位文处理:能填就填,不能填就隐藏(不显示在 UI) | `src/lib/brand.ts` + Footer/Contact 消费方 | 1 h | UI 上 0 个 `待补充` 字面量 | ⚪ |

### P1(下批,2-4 周内,影响品牌一致性)

| ID | 任务 | 文件 | 估时 | 验证 | 状态 |
|---|---|---|---|---|---|
| **DS-7** | `src/lib/design-tokens.ts` 新建,含 spacing/radius/motion/type 4 组 | 新文件 | 2 h | ≥ 5 个组件 import | ⚪ |
| **DS-8** | `globals.css` zinc 100→1000 按 Geist 语义编码 | `src/app/globals.css` | 1 h | 设计 token 跑通 | ⚪ |
| **DS-9** | 全 heading letterSpacing 缩紧(72/64/48/32/24 各自按 Geist 表) | Hero / Brand / Product / Footer | 1 h | DevTools 看 letterSpacing | ⚪ |
| **DS-10** | Header / Footer 的 dropdown / mobile drawer 动效降到 200ms | Header.tsx (line 187) | 30 min | DevTools 看 200ms | ⚪ |
| **DS-11** | WhyChooseUs / CoreServices / ProductsQuickEntry / 主题专项 卡片圆角统一 `rounded-md` | 4+ 组件 | 1 h | 截图 | ⚪ |

### P2(加分,长期,影响空状态规范)

| ID | 任务 | 文件 | 估时 | 验证 | 状态 |
|---|---|---|---|---|---|
| **DS-12** | `<EmptyState icon action>` 组件 + 全站占位/空数据走它 | `src/components/shared/EmptyState.tsx` | 2 h | 占位处全合规 | ⚪ |
| **DS-13** | Loading / Error / Toast 文案规范统一(`…` 字符 + what+fix) | 全 components + WeChat modal | 2 h | grep 中点省略号 | ⚪ |
| **DS-14** | `lg` 断点 1024 → 961,iPad mini 1024 走 lg 样式 | `tailwind.config` 或 globals.css | 1 h | 截图 1024 视口 | ⚪ |

**总估时**:P0 ≈ 6.5 h(含回归) · P1 ≈ 5.5 h · P2 ≈ 5 h
**建议节奏**:P0 一次性 commit(单一"design-system-p0"分支);P1 拆 2-3 个 commit;P2 按需。

---

## 8. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-21 | v0 | 初稿,基于 Vercel Geist spec 对账 + 14 项任务分解 | Coya |
| TBD | v1 | P0 6 项全部 commit 完成 + 视觉对照截图 | Coya |

---

## 附录 A: Geist 规范要点回顾

> 来源:`https://vercel.com/design`(2026-06-21 内化)
> 完整 spec 见 Vercel 官方。本附录只列本项目实施需要的精简版。

### A.1 设计原则(Geist 原文意译)

1. **Minimal and high-contrast**(极简 + 高对比):plenty of whitespace, restrained color, content on near-neutral surfaces
2. **Readability and accessibility first**(可读 + 可访问优先)
3. **Color signals state or hierarchy, not decoration**(颜色表状态,不装饰)
4. **Each color step encodes intent, not just lightness**(step = 意图)
5. **Motion clarifies change, never decorates**(动效澄清变化)
6. **One radius family per view**(同视图一族圆角)

### A.2 关键数字

- Spacing 4px 基准 → 4 / 8 / 12 / 16 / 24 / 32 / 40 / 64 / 96
- Radius: 6 / 12 / 16 / 9999
- Motion: 0 / 150 / 200 / 300 ms,easing `cubic-bezier(0.175, 0.885, 0.32, 1.1)`
- Container max-width: 1200px
- Breakpoints: sm 401 / md 601 / lg 961 / xl 1200 / 2xl 1400

### A.3 Do's & Don'ts

| Do | Don't |
|---|---|
| Gray ranks info (1000 primary / 900 secondary / 700 disabled) | 颜色单独表状态(配 icon/text) |
| Solid accent for state + single most important action per view | `background-200` 当通用 fill |
| WCAG AA 4.5:1 | 混圆角/尖角 或 >2 字重 |
| Focus ring on every interactive | gray-* 与 background-* 互换 |
| Apply typography tokens | 颜色单独表成功/失败 |

---

## 附录 B: 本批涉及文件清单

| 文件 | 改什么 | 任务 |
|---|---|---|
| `src/app/globals.css` | 加 focus-visible + motion var + reduced-motion | DS-1, DS-7 |
| `src/lib/design-tokens.ts` | **新建** | DS-7 |
| `src/lib/brand.ts` | 占位字段处理 | DS-6 |
| `src/components/Header.tsx` | 圆角 / 动效 / 文案 | DS-2/3/5/10 |
| `src/components/Hero.tsx` | 圆角 / 阴影 / 动效 / 文案 | DS-2/3/4/5 |
| `src/components/Footer.tsx` | 圆角 / 占位文 / 文案 | DS-2/3/5/6 |
| `src/components/WhyChooseUs.tsx` | 圆角 | DS-11 |
| `src/components/CoreServices.tsx` | 圆角 | DS-11 |
| `src/components/ProductsQuickEntry.tsx` | 圆角 | DS-11 |
| `src/components/shared/WeChatConsultModal.tsx` | Toast/Loading 文案 | DS-13 |
| `src/app/brand/page.tsx` | letterSpacing / 圆角 | DS-9/11 |
| `src/app/product/page.tsx` | letterSpacing / 圆角 | DS-9/11 |
| `src/app/contact/page.tsx` | 占位文 | DS-6 |
| `tailwind.config` (或 globals.css) | `lg` 断点 | DS-14 |
| `src/components/shared/EmptyState.tsx` | **新建** | DS-12 |

---

## 附录 C: 相关文档

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.5 横切主题
- [./AUDIT_AND_REGRESSION_PRD_2026-06-19.md](./AUDIT_AND_REGRESSION_PRD_2026-06-19.md) §3 P1/P2 一致性观察
- [./PERFORMANCE_OPTIMIZATION_PRD_2026-06-20.md](./PERFORMANCE_OPTIMIZATION_PRD_2026-06-20.md) — 性能 token 关联
- [./SECURITY_AUDIT_PRD_2026-06-20.md](./SECURITY_AUDIT_PRD_2026-06-20.md) — 焦点环属可访问性 = WCAG AA 必备
- [../../CLAUDE.md](../../CLAUDE.md) — AI 工作流约定
- [../../docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) — 架构总图
- [../../AGENTS.md](../../../../AGENTS.md) — 项目 agent 约定
- **外部参考**:[Vercel Geist Design](https://vercel.com/design)(2026-06-21 内化)

---

## 附录 D: 截图占位

实施完成后,在以下路径存视觉对照截图:

```
docs/audits/screenshots/2026-06-21-design-alignment/
├── before/
│   ├── desktop-1440/home.png
│   ├── desktop-1440/brand.png
│   ├── desktop-1440/footer.png
│   ├── mobile-390/home.png
│   └── mobile-390/menu.png
└── after/
    ├── desktop-1440/home.png
    ├── desktop-1440/brand.png
    ├── desktop-1440/footer.png
    ├── mobile-390/home.png
    └── mobile-390/menu.png
```

每个 P0 任务的 before/after 在 commit message 里 link 对比。
