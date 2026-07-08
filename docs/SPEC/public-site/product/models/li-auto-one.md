# SPEC: 理想 ONE 单车型专题

> **车型**: 理想 ONE
> **品牌**: 理想 (`li-auto`)
> **对应 PRD**: [`LI_AUTO_ONE_TOPIC_PRD_2026-06-27.md`](../../../../PRD/backlog/product/LI_AUTO_ONE_TOPIC_PRD_2026-06-27.md) (v0.1)
> **页面类型**: 单车型轻改升级方案
> **实现状态**: ⬜ 未开始 — 仅 PRD，无代码无资产
> **创建日期**: 2026-07-07

---

## 1. 职责范围

理想 ONE 单车型轻改专题页 `/product/li-auto/one`。展示 8 项轻改项目，按 4 场景重组（老车焕新/家庭座舱/上下车便利/户外拓展）。面向理想 ONE 存量车主。不负责理想 i6/i8/L9/MEGA 或其他理想车型。

## 1.1 Skill 路由

| Skill | 是否使用 | 用途 |
|---|---|---|
| `next-best-practices` | 是 | RSC page、metadata、JSON-LD、legacy redirect |
| `react-best-practices` | 是 | CC 交互组件（筛选、展开、锚点） |
| `web-design-engineer` | 是 | Hero 视觉、amber 主题、户外/家庭氛围 |
| `prisma-data-ops` | 否 | 全部为静态数据 |
| faker/MSW | 否 | — |

---

## 2. 路由 / 入口

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/product/li-auto/one` | page (RSC) | ONE 单车型专题页，canonical | ⬜ 未实现 |
| `/product/li-auto-one` | redirect | Legacy alias → 301 `/product/li-auto/one` | ⬜ |
| `/product/li-auto` | page (RSC) | 理想品牌总专题 | ⬜ planned |
| `/product` | page (RSC) | 产品中心入口 | ✅ live |

---

## 3. 数据模型

### 3.1 图片规格（字面量类型）

```typescript
type Width = 1448;
type Height = 1086;
type AspectRatio = "4/3";
type MaxProjects = 8;
type MinProjects = 8;
```

### 3.2 项目类型

```typescript
type LiAutoOneImageStatus = "matched" | "pending-review" | "missing";

type LiAutoOneUpgradeProject = {
  order: number;                    // 01-08
  key: string;                      // e.g. "swivel-seats"
  name: string;                     // 中文名, e.g. "旋转座椅"
  category:
    | "paint_protection"   // 漆面保护
    | "film_comfort"        // 玻璃膜/舒适
    | "appearance"          // 外观焕新
    | "rear_cabin"          // 后排便利
    | "cabin_ambiance"      // 座舱氛围
    | "entry_convenience"   // 上下车便利
    | "seat_comfort"        // 座舱舒适
    | "outdoor";            // 户外拓展
  summary: string;
  suitableFor: string[];
  caution?: string;
  publicPath: `/images/products/li-auto-one/${string}.png`;
  width: Width;
  height: Height;
  aspectRatio: AspectRatio;
  imageStatus: LiAutoOneImageStatus; // 一期全部 "pending-review"
};
```

### 3.3 8 项项目清单

| 序号 | key | 名称 | 分类 | 图片状态 |
|---:|---|---|---|---|
| 01 | paint-protection-film | 隐形车衣 | paint_protection | pending-review |
| 02 | window-film | 隔热膜 | film_comfort | pending-review |
| 03 | color-wrap | 改色膜 | appearance | pending-review |
| 04 | rear-table-tray | 小桌板 | rear_cabin | pending-review |
| 05 | ambient-lighting | 氛围灯 | cabin_ambiance | pending-review |
| 06 | electric-steps | 电动踏板 | entry_convenience | pending-review |
| 07 | swivel-seats | 旋转座椅 | seat_comfort | pending-review |
| 08 | roof-platform-ladder | 车顶平台加爬梯 | outdoor | pending-review |

### 3.4 4 场景矩阵

| 场景 | 包含项目 | 面向用户 |
|---|---|---|
| 老车焕新与基础保护 | 隐形车衣、隔热膜、改色膜 | 存量车主焕新外观 |
| 家庭座舱舒适 | 小桌板、氛围灯、旋转座椅、隔热膜 | 家庭乘坐/后排/夜间 |
| 上下车便利 | 电动踏板、旋转座椅 | 老人、小孩、家庭用车 |
| 户外自驾拓展 | 车顶平台加爬梯、隐形车衣、电动踏板 | 露营、自驾、装备扩展 |

### 3.5 数据文件

```text
src/lib/li-auto-one-products.ts          ← 8 项静态数据
```

### 3.6 路由注册

```typescript
// MODELS 数组追加:
{
  type: "vehicle_model",
  brandSlug: "li-auto",
  modelSlug: "one",
  modelName: "理想 ONE",
  parentPath: "/product/li-auto",
  canonicalPath: "/product/li-auto/one",
  title: "理想 ONE 专属轻改方案",
  navLabel: "ONE",
  status: "planned",
  priority: "P1",
  projectCount: 8,
  sourcePrd: "docs/PRD/backlog/product/LI_AUTO_ONE_TOPIC_PRD_2026-06-27.md",
  legacyPaths: ["/product/li-auto-one"],
},
```

---

## 4. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| `LiAutoOnePage` | `src/app/product/li-auto/one/page.tsx` | RSC | 页面组合 + metadata + JSON-LD |
| `LiAutoOneHero` | `src/components/li-auto-one/LiAutoOneHero.tsx` | CC | 车型主视觉 + 4 场景锚点 + CTA |
| `LiAutoOneProjectGrid` | `src/components/li-auto-one/LiAutoOneProjectGrid.tsx` | CC | 8 项项目网格（4/2/1 响应式） |
| `LiAutoOneScenarioMatrix` | `src/components/li-auto-one/LiAutoOneScenarioMatrix.tsx` | CC | 4 场景筛选 |
| `LiAutoOneBundleCards` | `src/components/li-auto-one/LiAutoOneBundleCards.tsx` | CC | 4 类推荐组合 |
| `LiAutoOneServiceFlow` | `src/components/li-auto-one/LiAutoOneServiceFlow.tsx` | CC | 7 步施工流程 |
| `LiAutoOneFaq` | `src/components/li-auto-one/LiAutoOneFaq.tsx` | CC | FAQ 手风琴 |

---

## 5. 业务规则

| # | 规则 | 触发条件 | 系统行为 |
|---|------|---------|---------|
| BR1 | 8 项项目完整性 | 页面渲染 | 与 PRD §7 清单一致 |
| BR2 | 4 场景筛选 | 用户选择场景 | 过滤对应项目 |
| BR3 | 默认排序 | 初始加载 | 按序号 01-08 |
| BR4 | 3 态图片 | 项目 imageStatus | 一期全部 `pending-review` |
| BR5 | 合规红线 | 页面渲染 | 不出现：理想官方授权、原厂配件、不影响质保、100%无损、永久质保 |
| BR6 | 无海报模块 | 页面渲染 | 不包含海报素材展示/PosterStub |
| BR7 | 车顶平台安全提示 | 展开车顶平台项目 | 显式声明：需确认固定点、承重和合规边界，不做承重/越野承诺 |
| BR8 | 旋转座椅安全提示 | 展开旋转座椅项目 | 显式声明：需确认座椅结构和安全边界 |
| BR9 | 主题色 amber | 所有组件 | 沿用理想品牌 amber |

---

## 6. 响应式

| 视口 | 要求 |
|------|------|
| 390px | 项目卡单列，场景筛选横向可滚，锚点折叠 |
| 768px | 项目卡 2 列 |
| 1440px | 项目卡 4 列，锚点 sticky |

---

## 7. 测试用例清单

| AC-ID | 场景 | 输入 | 预期 | 类型 |
|-------|------|------|------|------|
| LI-ONE-AC-01 | 页面渲染 | GET /product/li-auto/one | 200，HTML 含 8 项项目 | happy |
| LI-ONE-AC-02 | 场景筛选 | 点击"户外自驾拓展" | 仅显示对应场景项目 | happy |
| LI-ONE-AC-03 | 项目展开 | 点击车顶平台卡片 | 展开面板显示安全提示 | happy |
| LI-ONE-AC-04 | 合规红线 | 全文搜索 | 不出现：官方授权、原厂配件、不影响质保 | edge |
| LI-ONE-AC-05 | 海报模块不存在 | 搜索 poster | 页面不含海报模块 | edge |
| LI-ONE-AC-06 | 390px | 浏览器 390px | 无横向滚动 | edge |
| LI-ONE-AC-07 | 1440px | 浏览器 1440px | 4 列网格 | edge |
| LI-ONE-AC-08 | legacy 301 | GET /product/li-auto-one | 301 → /product/li-auto/one | happy |
| LI-ONE-AC-09 | build | `npm run build` | SSG 预渲染成功 | happy |

---

## 8. 已知问题

- [ ] 全部 8 项无图片资产（`pending-review`），需生成或拍摄
- [ ] 车顶平台、旋转座椅涉及安全合规红线，文案需法务审核
- [ ] 理想 ONE 已停产，页面需注意"存量车型"的语境表达

---

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-27 | Claude Code | PRD v0.1 创建 | 完成 | — |
| 2026-07-07 | Claude Code | 驱动型 SPEC 编写 | 完成 | 图片 + 数据层 + 页面实现 |

---

## 验收追溯

| AC-ID | SPEC § | 测试文件 | 测试用例 | 结果 |
|-------|--------|---------|---------|------|
| LI-ONE-AC-01 | §7 | TBD | "页面渲染" | ⬜ |

---

> 最后更新: 2026-07-07
