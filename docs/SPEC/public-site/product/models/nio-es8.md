# SPEC: 蔚来 ES8 单车型专题

> **车型**: 蔚来 ES8
> **品牌**: 蔚来 (`nio`)
> **对应 PRD**: [`NIO_ES8_TOPIC_PRD_2026-06-27.md`](../../../../PRD/product/NIO_ES8_TOPIC_PRD_2026-06-27.md) (v0.1)
> **页面类型**: 单车型轻改升级方案
> **实现状态**: 🔧 部分完成 — 数据层 + 图片资产已就位，页面未实现
> **创建日期**: 2026-07-07

---

## 1. 职责范围

蔚来 ES8 单车型轻改专题页 `/product/nio/es8`。展示 17 项 AI 预览图项目，按 4 场景重组，引导车主确认适配与施工。不负责蔚来品牌总专题 `/product/nio`（仅注册 planned，不实装 UI）。不负责其他蔚来车型（ES6/ET5/ET7/ET9 预留扩展位）。

## 1.1 Skill 路由

| Skill | 是否使用 | 用途 |
|---|---|---|
| `next-best-practices` | 是 | RSC page、metadata、JSON-LD ItemList、generateStaticParams |
| `react-best-practices` | 是 | CC 交互组件（锚点、筛选、展开）、memo/useMemo |
| `web-design-engineer` | 是 | Hero 视觉、4 场景矩阵布局、sky 主题色 |
| `prisma-data-ops` | 否 | 全部为静态数据 |
| faker/MSW | 否 | — |

---

## 2. 路由 / 入口

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/product/nio/es8` | page (RSC) | ES8 单车型专题页，canonical | ⬜ 未实现 |
| `/product/nio-es8` | redirect | Legacy alias → 301 `/product/nio/es8` | ⬜ |
| `/product/nio` | page (RSC) | 蔚来品牌总专题 | ⬜ planned（仅路由注册，不实装 UI） |
| `/product` | page (RSC) | 产品中心入口，加 `<NioTopicBanner />` | 🔧 |

---

## 3. 数据模型

### 3.1 图片规格（字面量类型，防漂移）

```typescript
type Width = 1448;
type Height = 1086;
type AspectRatio = "4/3";
type MaxProjects = 17;
type MinProjects = 17;
```

### 3.2 项目类型

```typescript
type NioEs8ImageStatus = "matched" | "generated-preview" | "pending-review" | "missing";

type NioEs8UpgradeProject = {
  order: number;                    // 01-17
  key: string;                      // manifest key, e.g. "paint-protection-film"
  name: string;                     // 中文名, e.g. "车衣"
  category:
    | "protection"        // 新车保护
    | "film"              // 玻璃膜/舒适
    | "appearance"        // 外观个性
    | "cabin_protection"  // 座舱保护
    | "family_cabin"      // 家庭座舱
    | "chassis"           // 底盘
    | "driving_protection"// 行车防护
    | "screen_care"       // 屏幕保护
    | "interior_care";    // 内饰养护
  summary: string;                  // 1 句价值说明
  promptSummary: string;            // 来自 manifest promptSummary
  publicPath: `/images/products/nio-es8/generated/${string}.png`;
  width: Width;
  height: Height;
  aspectRatio: AspectRatio;
  imageStatus: NioEs8ImageStatus;   // ES8 全部 "generated-preview"
  suitableFor: string[];            // 用户场景, e.g. ["new_car", "family"]
  caution?: string;                 // 适配/施工提示
};
```

### 3.3 数据文件结构

```text
src/lib/nio-products.ts          ← 17 项静态数据 + 字面量类型
public/images/products/nio-es8/generated/  ← 20 文件（17 项目 + 1 hero + contact-sheet + manifest.json）
```

### 3.4 导出结构

```typescript
export const nioEs8UpgradeProjects: readonly NioEs8UpgradeProject[] = [
  // 17 项，与 manifest.json 完全对齐
] as const;

export const nioProducts = {
  es8: nioEs8UpgradeProjects,
  // es6: [] as const,   // 后续 batch
  // et5: [] as const,
  // et7: [] as const,
  // et9: [] as const,
} as const;

export const nioEs8ProjectCount = 17;
```

### 3.5 路由注册

```typescript
// src/lib/product-routes.ts BRANDS 数组追加:
{
  type: "vehicle_brand",
  brandSlug: "nio",
  brandName: "蔚来",
  accentColor: "sky",         // #0ea5e9，避免与 wenjie cyan 撞色
  status: "planned",
  priority: "P1",
  canonicalPath: "/product/nio",
  title: "蔚来轻改方案",
  navLabel: "蔚来",
  modelSlugs: ["es8"],
},

// MODELS 数组追加:
{
  type: "vehicle_model",
  brandSlug: "nio",
  modelSlug: "es8",
  modelName: "蔚来 ES8",
  parentPath: "/product/nio",
  canonicalPath: "/product/nio/es8",
  title: "蔚来 ES8 专属升级方案",
  navLabel: "ES8",
  status: "planned",
  priority: "P1",
  projectCount: 17,
  sourcePrd: "docs/PRD/product/NIO_ES8_TOPIC_PRD_2026-06-27.md",
  legacyPaths: ["/product/nio-es8"],
},
```

---

## 4. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| `NioEs8Page` | `src/app/product/nio/es8/page.tsx` | RSC | 页面组合，metadata + JSON-LD |
| `NioEs8Hero` | `src/components/nio-es8/NioEs8Hero.tsx` | CC | 车型主视觉 + 4 场景锚点 + CTA |
| `NioEs8ProjectGrid` | `src/components/nio-es8/NioEs8ProjectGrid.tsx` | CC | 17 项项目网格（4/2/1 列响应式） |
| `NioEs8ScenarioMatrix` | `src/components/nio-es8/NioEs8ScenarioMatrix.tsx` | CC | 4 场景筛选 + 项目重组 |
| `NioEs8BundleCards` | `src/components/nio-es8/NioEs8BundleCards.tsx` | CC | 4 类推荐组合卡片 |
| `NioEs8ServiceFlow` | `src/components/nio-es8/NioEs8ServiceFlow.tsx` | CC | 7 步统一施工流程 |
| `NioEs8Faq` | `src/components/nio-es8/NioEs8Faq.tsx` | CC | 9 条 FAQ 手风琴 |
| `NioTopicBanner` | `src/components/nio/NioTopicBanner.tsx` | CC | 产品中心入口卡片 |

**页面组合：**
```tsx
// src/app/product/nio/es8/page.tsx
export default function NioEs8Page() {
  return (
    <>
      <NioEs8Hero />
      <NioEs8ProjectGrid projects={nioEs8UpgradeProjects} />
      <NioEs8ScenarioMatrix projects={nioEs8UpgradeProjects} />
      <NioEs8BundleCards />
      <NioEs8ServiceFlow />
      <NioEs8Faq />
    </>
  );
}
```

---

## 5. 业务规则

| # | 规则 | 触发条件 | 系统行为 |
|---|------|---------|---------|
| BR1 | 17 项项目完整性 | 页面渲染 | 项目 key/name/category 与 manifest.json 完全一致 |
| BR2 | 4 态图片渲染 | 项目 imageStatus | `matched`=真实图, `generated-preview`=AI 预览图+角标, `pending-review`=占位+审核中标签, `missing`=统一占位 |
| BR3 | 场景筛选 | 用户选择场景 | 4 场景过滤：新车保护/外观个性/家庭座舱/行车防护 |
| BR4 | 默认排序 | 初始加载 | 按 manifest 序号 01-17 |
| BR5 | 组合高亮 | 点击推荐组合 | 对应项目高亮展示 |
| BR6 | 合规红线 | 页面渲染 | 不出现：官方授权、原厂配件、不影响质保、100%无损、永久质保、全网最低、性能提升 |
| BR7 | 无海报模块 | 页面渲染 | 不包含"海报素材展示"章节/PosterStub/海报埋点 |
| BR8 | 主题色 sky | 所有组件 | 使用 sky-500 (#0ea5e9)，区别于 wenjie cyan-500 |
| BR9 | Hero 图片不优先 | Hero 渲染 | `generated-preview` 不使用 `priority` loading |
| BR10 | 适配说明 | 页面渲染 | 显式声明"不同年份/批次/版本可能不同，以到店确认为准" |

---

## 6. UI 状态

| 状态 | 触发条件 | UI 表现 |
|------|---------|---------|
| loading | 页面首次渲染 | Next.js SSR → 直接交付完整 HTML，无客户端 loading |
| error | 组件渲染异常 | `error.tsx` 边界捕获，显示错误 + 重试 |
| 展开项目 | 点击项目卡片 | 展开面板：名称/分类/适合人群/注意事项/到店确认提示 |
| 场景切换 | 点击场景筛选标签 | 项目网格过滤，标签高亮 |
| 组合高亮 | 点击推荐组合卡 | 关联项目视觉高亮，其他项目降低透明度 |

---

## 7. 响应式

| 视口 | 要求 |
|------|------|
| 390px | 项目卡单列，场景筛选横向可滚动，4 场景锚点折叠为下拉，无横向滚动 |
| 768px | 项目卡 2 列，Hero 上下结构，布局稳定 |
| 1440px | 项目卡 4 列，Hero 横排布局，锚点导航 sticky，内容 max-w-7xl 居中 |

---

## 8. 图片规格

| 位置 | 图片类型 | 规格 | 状态 |
|------|---------|------|------|
| Hero 主视觉 | hero.png | 1448×1086, 4:3, WebP | generated-preview |
| 17 项目卡片 | `{key}.png` | 1448×1086, 4:3, WebP | 全部 generated-preview |
| 容器 | — | `aspect-[4/3] + object-contain + Next/Image sizes` | — |

---

## 9. 测试用例清单

| AC-ID | 场景 | 输入 | 预期 | 类型 |
|-------|------|------|------|------|
| NIO-AC-01 | 页面 SSR 渲染 | GET /product/nio/es8 | 200，HTML 含 17 项项目名称 | happy |
| NIO-AC-02 | 场景筛选 | 点击"外观个性" | 仅显示彩绘/双拼改色/运动包围/轮毂/刹车卡钳 | happy |
| NIO-AC-03 | 组合高亮 | 点击"新车基础保护组合" | 车衣/隔热膜/360脚垫/底盘护板/钢化膜高亮 | happy |
| NIO-AC-04 | 项目展开 | 点击项目卡片 | 展开面板显示适合人群/注意事项 | happy |
| NIO-AC-05 | 合规红线 | 全文搜索 | 不出现：官方授权、原厂配件、不影响质保、100%无损 | edge |
| NIO-AC-06 | 海报模块不存在 | 搜索 poster/海报 | 页面不含"海报素材展示"模块/埋点 | edge |
| NIO-AC-07 | 390px 无横向滚动 | 浏览器 390px | 项目卡单列，无 overflow-x | edge |
| NIO-AC-08 | 768px 2 列 | 浏览器 768px | 项目网格 2 列 | edge |
| NIO-AC-09 | 1440px 4 列 | 浏览器 1440px | 项目网格 4 列 | edge |
| NIO-AC-10 | 字面量类型 | `npx tsc --noEmit` | 1448/1086/"4/3" 类型未漂移 | happy |
| NIO-AC-11 | generated-preview 角标 | 检查所有项目卡片 | 每个卡片显示"预览图"角标 | happy |
| NIO-AC-12 | JSON-LD ItemList | 查看 `<head>` | 含 17 项 ItemList schema | happy |
| NIO-AC-13 | legacy 301 | GET /product/nio-es8 | 301 → /product/nio/es8 | happy |
| NIO-AC-14 | 品牌页占位 | GET /product/nio | 仅路由注册，不实装 UI（或 404） | edge |
| NIO-AC-15 | build 不依赖 DB | `npm run build` | 成功，SSG 预渲染 | happy |

---

## 10. 已知问题

- [ ] 全部 17 项为 AI 预览图（`generated-preview`），无真实施工案例图
- [ ] `/product/nio` 品牌总专题仅注册 planned，未实装
- [ ] hero.png 也是 AI 生成图，非门店实拍
- [ ] 暂无对应 CI verify 脚本（参照 `scripts/verify-zeekr-images.mjs`）
- [ ] AccentColor 枚举需扩展 `sky` 值 + 8 处 Record 映射补全

---

## 11. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-26 | Claude Code | 17 项 AI 预览图生成 | 完成 | — |
| 2026-06-27 | Claude Code | PRD v0.1 创建 | 完成 | — |
| 2026-07-07 | Claude Code | 驱动型 SPEC 编写 | 完成 | 页面实现 + CI 脚本 |

---

## 验收追溯

| AC-ID | SPEC § | 测试文件 | 测试用例 | 结果 |
|-------|--------|---------|---------|------|
| NIO-AC-01 | §9 | TBD | "页面 SSR 渲染" | ⬜ |
| NIO-AC-10 | §9 | TBD | "字面量类型校验" | ⬜ |

---

> 最后更新: 2026-07-07
> 数据层参考: `src/lib/nio-products.ts`（待创建）
> 资产位置: `public/images/products/nio-es8/generated/`
