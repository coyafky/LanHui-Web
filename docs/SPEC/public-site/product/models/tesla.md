# SPEC: 特斯拉系列车型专题

> **品牌**: 特斯拉 (`tesla`)
> **对应 PRD**: [`TESLA_TOPIC_PRD_2026-06-24.md`](../../../../PRD/backlog/product/TESLA_TOPIC_PRD_2026-06-24.md) (v0.1)
> **页面类型**: 品牌系列专题页（非单车型）
> **实现状态**: ⬜ 未开始 — 仅 PRD，无代码无资产
> **创建日期**: 2026-07-07

---

## 1. 职责范围

特斯拉系列车型专题页 `/product/tesla`。展示 10 个主推轻改项目 + 30+ 可选升级项目，按 6 场景重组。面向 Model 3/Y/S/X 全系车主。不负责单车型专属页面。

## 1.1 Skill 路由

| Skill | 是否使用 | 用途 |
|---|---|---|
| `next-best-practices` | 是 | RSC page、metadata、JSON-LD |
| `react-best-practices` | 是 | CC 交互组件（筛选、展开）、memo |
| `web-design-engineer` | 是 | Hero 视觉、卡片布局、可展开项目列表 |
| `prisma-data-ops` | 否 | 全部为静态数据 |
| faker/MSW | 否 | — |

---

## 2. 路由 / 入口

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/product/tesla` | page (RSC) | 特斯拉系列专题页 | ⬜ 未实现 |
| `/product` | page (RSC) | 产品中心入口，加 Tesla 入口卡片 | ✅ live |

---

## 3. 数据模型

### 3.1 项目类型

```typescript
type TeslaProjectPriority = "featured" | "optional";
type TeslaImageStatus = "matched" | "pending-review" | "missing";

type TeslaProjectCategory =
  | "paint_protection"    // 车身保护
  | "film_style"           // 膜类/外观
  | "chassis_protection"   // 底盘防护
  | "cabin_comfort"        // 座舱舒适
  | "electric_convenience" // 电动便利
  | "infotainment"         // 智能影音
  | "exterior_parts"       // 外观配件
  | "storage_accessory";   // 储物小件

type TeslaProject = {
  key: string;
  name: string;
  category: TeslaProjectCategory;
  priority: TeslaProjectPriority;
  order: number;
  summary: string;
  applicableModels?: string[];    // e.g. ["Model 3", "Model Y"]
  imageStatus: TeslaImageStatus;  // 一期全部 "pending-review"
};
```

### 3.2 10 个主推项目

| 序号 | key | 名称 | 分类 |
|---:|---|---|---|
| 01 | paint-protection-film | 车衣 | paint_protection |
| 02 | window-film | 隔热膜 | film_style |
| 03 | color-wrap | 改色膜 | film_style |
| 04 | floor-mats-360 | 360软包脚垫 | cabin_comfort |
| 05 | underbody-skid-plate | 底盘护板 | chassis_protection |
| 06 | ambient-lighting | 氛围灯 | cabin_comfort |
| 07 | ventilated-seats | 通风座椅 | cabin_comfort |
| 08 | electric-door-handle | 电动门把手 | electric_convenience |
| 09 | electric-frunk | 电动前机盖 | electric_convenience |
| 10 | electric-sunshade | 电动遮阳帘 | cabin_comfort |

### 3.3 6 场景矩阵

| 场景 | 包含项目关键字 |
|---|---|
| 新车保护 | 车衣、隔热膜、360软包脚垫、底盘护板 |
| 外观焕新 | 改色膜、碳纤维尾翼、碳纤纹套件、尾灯、领航灯、轮毂盖 |
| 座舱舒适 | 通风座椅、电动遮阳帘、全包真皮座椅、电动腿托、八向头枕、后排座椅加长 |
| 智能影音 | 一体仪表、MINI智能仪表、后排娱乐屏、音响系统、流媒体后视镜 |
| 电动便利 | 电动门把手、电动前机盖、电动尾门、智能电吸锁/门、智动门 |
| 储物小件 | 车载冰箱、扶手箱、储物盒、过滤网 |

### 3.4 数据文件

```text
src/lib/tesla-products.ts          ← 静态数据（主推 + 可选）
```

### 3.5 路由注册

```typescript
// BRANDS 数组追加:
{
  type: "vehicle_brand",
  brandSlug: "tesla",
  brandName: "特斯拉",
  accentColor: "red",         // Tesla red
  status: "planned",
  priority: "P1",
  canonicalPath: "/product/tesla",
  title: "特斯拉系列轻改项目",
  navLabel: "Tesla",
  modelSlugs: [],
},
```

---

## 4. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| `TeslaPage` | `src/app/product/tesla/page.tsx` | RSC | 页面组合 + metadata + JSON-LD |
| `TeslaHero` | `src/components/tesla/TeslaHero.tsx` | CC | 品牌视觉 + 6 场景锚点 + CTA |
| `TeslaFeaturedGrid` | `src/components/tesla/TeslaFeaturedGrid.tsx` | CC | 10 主推项目卡片网格 |
| `TeslaScenarioMatrix` | `src/components/tesla/TeslaScenarioMatrix.tsx` | CC | 6 场景筛选 |
| `TeslaOptionalList` | `src/components/tesla/TeslaOptionalList.tsx` | CC | 30+ 可选项目分组列表 |
| `TeslaServiceFlow` | `src/components/tesla/TeslaServiceFlow.tsx` | CC | 6 步施工流程 |
| `TeslaFaq` | `src/components/tesla/TeslaFaq.tsx` | CC | FAQ 手风琴 |

---

## 5. 业务规则

| # | 规则 | 触发条件 | 系统行为 |
|---|------|---------|---------|
| BR1 | 主推/可选分区 | 页面渲染 | 10 主推优先展示，30+ 可选分组折叠 |
| BR2 | 6 场景筛选 | 用户选择场景 | 过滤对应项目 |
| BR3 | 可选项目分组 | 渲染可选项目 | 按分类折叠，每组默认展示 4-6 项，剩余可展开 |
| BR4 | 默认排序 | 初始加载 | 主推按序号 01-10，可选按分类字母序 |
| BR5 | 3 态图片渲染 | 项目 imageStatus | 一期全部 `pending-review`，展示占位+审核中标签 |
| BR6 | 合规红线 | 页面渲染 | 不出现：Tesla官方授权、原厂配件、不影响质保、100%无损 |
| BR7 | 无海报模块 | 页面渲染 | 不包含海报素材展示/PosterStub/海报埋点 |
| BR8 | 车型适配说明 | 页面渲染 | 显式声明"不同年份/版本/配置可能不同" |
| BR9 | 主题色 red | 所有组件 | 使用 Tesla 红色系（red-500/600） |

---

## 6. 响应式

| 视口 | 要求 |
|------|------|
| 390px | 项目卡单列，场景筛选横向可滚，可选列表分组折叠 |
| 768px | 主推项目 2 列 |
| 1440px | 主推项目 5 列或 3+3+4 分组，内容 max-w-7xl |

---

## 7. 测试用例清单

| AC-ID | 场景 | 输入 | 预期 | 类型 |
|-------|------|------|------|------|
| TESLA-AC-01 | 页面渲染 | GET /product/tesla | 200，HTML 含 10 主推项目 | happy |
| TESLA-AC-02 | 场景筛选 | 点击"外观焕新" | 仅显示对应场景项目 | happy |
| TESLA-AC-03 | 主推/可选分区 | 页面加载 | 10 主推在上，可选列表在下，视觉区分 | happy |
| TESLA-AC-04 | 可选分组展开 | 点击分组标题 | 展开显示该组全部项目 | happy |
| TESLA-AC-05 | 合规红线 | 全文搜索 | 不出现：Tesla官方授权、原厂配件、不影响质保 | edge |
| TESLA-AC-06 | 海报模块不存在 | 搜索 poster | 页面不含海报模块/埋点 | edge |
| TESLA-AC-07 | 390px | 浏览器 390px | 无横向滚动，项目单列 | edge |
| TESLA-AC-08 | build | `npm run build` | SSG 预渲染成功 | happy |
| TESLA-AC-09 | JSON-LD | 查看 `<head>` | 含 ItemList schema | happy |

---

## 8. 已知问题

- [ ] 全部项目无图片资产（`pending-review`），需生成或拍摄
- [ ] 30+ 可选项目列表过长，需评估是否需要搜索功能
- [ ] Tesla 品牌无单车型拆分（Model 3/Y/S/X 共用一页），后续可能需拆分
- [ ] 无 `accentColor: "red"`，需扩展 `AccentColor` 枚举

---

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-24 | Claude Code | PRD v0.1 创建 | 完成 | — |
| 2026-07-07 | Claude Code | 驱动型 SPEC 编写 | 完成 | 图片 + 数据层 + 页面实现 |

---

## 验收追溯

| AC-ID | SPEC § | 测试文件 | 测试用例 | 结果 |
|-------|--------|---------|---------|------|
| TESLA-AC-01 | §7 | TBD | "页面渲染" | ⬜ |

---

> 最后更新: 2026-07-07
