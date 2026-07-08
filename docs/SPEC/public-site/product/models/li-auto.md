# SPEC: 理想系列车型专题

> **品牌**: 理想 (`li-auto`)
> **对应 PRD**: [`LI_AUTO_TOPIC_PRD_2026-06-24.md`](../../../../PRD/backlog/product/LI_AUTO_TOPIC_PRD_2026-06-24.md) (v0.1)
> **页面类型**: 品牌系列专题页（非单车型）
> **实现状态**: ⬜ 未开始 — 仅 PRD，无代码无资产
> **创建日期**: 2026-07-07

---

## 1. 职责范围

理想系列车型专题页 `/product/li-auto`。展示 10 个主推轻改项目 + 30 可选升级项目，按 6 场景重组。面向理想 L 系列/i 系列/MEGA/ONE 全系车主。后续作为品牌总入口承接单车型页面（i6/i8/L9/MEGA/ONE）。不负责单车型专属页面内容。

## 1.1 Skill 路由

| Skill | 是否使用 | 用途 |
|---|---|---|
| `next-best-practices` | 是 | RSC page、metadata、JSON-LD |
| `react-best-practices` | 是 | CC 交互组件、memo |
| `web-design-engineer` | 是 | Hero 视觉、amber 主题、家庭出行氛围 |
| `prisma-data-ops` | 否 | 全部为静态数据 |
| faker/MSW | 否 | — |

---

## 2. 路由 / 入口

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/product/li-auto` | page (RSC) | 理想系列专题页 | ⬜ 未实现 |
| `/product/li-auto/i6` | page (RSC) | 理想 i6 单车型 | ⬜ planned |
| `/product/li-auto/i8` | page (RSC) | 理想 i8 单车型 | ⬜ planned |
| `/product/li-auto/l9` | page (RSC) | 理想 L9 单车型 | ⬜ planned |
| `/product/li-auto/mega` | page (RSC) | 理想 MEGA 单车型 | ⬜ planned |
| `/product/li-auto/one` | page (RSC) | 理想 ONE 单车型 | ⬜ planned |
| `/product` | page (RSC) | 产品中心入口 | ✅ live |

---

## 3. 数据模型

### 3.1 项目类型

```typescript
type LiAutoProjectPriority = "featured" | "optional";
type LiAutoImageStatus = "matched" | "pending-review" | "missing";

type LiAutoProjectCategory =
  | "paint_protection"    // 车身保护
  | "film_style"           // 膜类/外观
  | "chassis_protection"   // 底盘防护
  | "rear_cabin"           // 后排/家庭
  | "electric_convenience" // 电动便利
  | "infotainment"         // 智能影音
  | "exterior_parts"       // 外观配件
  | "outdoor_accessory"    // 户外/露营
  | "cabin_comfort";       // 座舱舒适

type LiAutoProject = {
  key: string;
  name: string;
  category: LiAutoProjectCategory;
  priority: LiAutoProjectPriority;
  order: number;
  summary: string;
  applicableModels?: string[];    // e.g. ["L9", "MEGA"]
  imageStatus: LiAutoImageStatus; // 一期全部 "pending-review"
};
```

### 3.2 10 个主推项目

| 序号 | key | 名称 | 分类 |
|---:|---|---|---|
| 01 | paint-protection-film | 隐形车衣 | paint_protection |
| 02 | window-film | 隔热膜 | film_style |
| 03 | aluminum-floor-second-row | 二排铝地板 | rear_cabin |
| 04 | underbody-skid-plate | 底盘护板 | chassis_protection |
| 05 | electric-steps | 电动踏板 | electric_convenience |
| 06 | rear-table-tray | 小桌板 | rear_cabin |
| 07 | bug-screen | 防虫网 | outdoor_accessory |
| 08 | sill-plate | 门槛条 | exterior_parts |
| 09 | screen-protector | 钢化膜 | cabin_comfort |
| 10 | interior-coating | 内饰镀膜 | cabin_comfort |

### 3.3 6 场景矩阵

| 场景 | 关键项目 |
|---|---|
| 新车保护 | 隐形车衣、隔热膜、底盘护板、门槛条、钢化膜、内饰镀膜 |
| 家庭后排 | 二排铝地板、小桌板、后排娱乐电视、零重力座椅、腿托、旋转座椅 |
| 上下车便利 | 电动踏板、电动门、电吸门、四门密封条 |
| 座舱舒适 | 氛围灯、香氛系统、全车音响、4D高音喇叭、冰箱 |
| 外观升级 | 轮毂、运动包围、黑化套件、改色膜、悬浮顶、星空顶/膜 |
| 露营户外 | 车顶平台套件、防虫网、挡泥板、挡泥板内衬、底盘护板 |

### 3.4 数据文件

```text
src/lib/li-auto-products.ts          ← 静态数据（主推 + 可选）
```

### 3.5 路由注册

```typescript
// BRANDS 数组追加:
{
  type: "vehicle_brand",
  brandSlug: "li-auto",
  brandName: "理想",
  accentColor: "amber",
  status: "planned",
  priority: "P1",
  canonicalPath: "/product/li-auto",
  title: "理想系列轻改项目",
  navLabel: "理想",
  modelSlugs: ["i6", "i8", "l9", "mega", "one"],
},
```

---

## 4. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| `LiAutoPage` | `src/app/product/li-auto/page.tsx` | RSC | 页面组合 + metadata + JSON-LD |
| `LiAutoHero` | `src/components/li-auto/LiAutoHero.tsx` | CC | 品牌视觉 + 6 场景锚点 + CTA |
| `LiAutoFeaturedGrid` | `src/components/li-auto/LiAutoFeaturedGrid.tsx` | CC | 10 主推项目卡片网格 |
| `LiAutoScenarioMatrix` | `src/components/li-auto/LiAutoScenarioMatrix.tsx` | CC | 6 场景筛选 |
| `LiAutoOptionalList` | `src/components/li-auto/LiAutoOptionalList.tsx` | CC | 30 可选项目分组折叠列表 |
| `LiAutoModelLinks` | `src/components/li-auto/LiAutoModelLinks.tsx` | CC | 车型入口卡片（i6/i8/L9/MEGA/ONE） |
| `LiAutoServiceFlow` | `src/components/li-auto/LiAutoServiceFlow.tsx` | CC | 6 步施工流程 |
| `LiAutoFaq` | `src/components/li-auto/LiAutoFaq.tsx` | CC | FAQ 手风琴 |

---

## 5. 业务规则

| # | 规则 | 触发条件 | 系统行为 |
|---|------|---------|---------|
| BR1 | 主推/可选分区 | 页面渲染 | 10 主推优先展示，30 可选分组折叠 |
| BR2 | 6 场景筛选 | 用户选择场景 | 过滤对应项目 |
| BR3 | 可选分组折叠 | 渲染可选项目 | 每组默认展示 4-6 项，剩余可展开 |
| BR4 | 默认排序 | 初始加载 | 主推按序号 01-10，可选按分类 |
| BR5 | 3 态图片 | 项目 imageStatus | 一期全部 `pending-review` |
| BR6 | 车型入口 | 渲染 | 页面底部展示单车型入口链接（i6/i8/L9/MEGA/ONE） |
| BR7 | 合规红线 | 页面渲染 | 不出现：理想官方授权、原厂配件、不影响质保、100%无损 |
| BR8 | 无海报模块 | 页面渲染 | 不包含海报素材展示/PosterStub |
| BR9 | 主题色 amber | 所有组件 | 沿用理想品牌 amber |

---

## 6. 响应式

| 视口 | 要求 |
|------|------|
| 390px | 主推单列，场景筛选横向可滚，可选分组折叠 |
| 768px | 主推 2 列 |
| 1440px | 主推 5 列或分组布局，内容 max-w-7xl |

---

## 7. 测试用例清单

| AC-ID | 场景 | 输入 | 预期 | 类型 |
|-------|------|------|------|------|
| LI-AUTO-AC-01 | 页面渲染 | GET /product/li-auto | 200，HTML 含 10 主推项目 | happy |
| LI-AUTO-AC-02 | 场景筛选 | 点击"家庭后排" | 仅显示家庭后排相关项目 | happy |
| LI-AUTO-AC-03 | 车型入口 | 页面底部 | 展示 i6/i8/L9/MEGA/ONE 入口链接 | happy |
| LI-AUTO-AC-04 | 可选分组展开 | 点击分组标题 | 展开显示该组全部项目 | happy |
| LI-AUTO-AC-05 | 合规红线 | 全文搜索 | 不出现：理想官方授权、原厂配件、不影响质保 | edge |
| LI-AUTO-AC-06 | 海报模块不存在 | 搜索 poster | 页面不含海报模块/埋点 | edge |
| LI-AUTO-AC-07 | 390px | 浏览器 390px | 无横向滚动 | edge |
| LI-AUTO-AC-08 | build | `npm run build` | SSG 预渲染成功 | happy |

---

## 8. 已知问题

- [ ] 全部项目无图片资产（`pending-review`），需生成或拍摄
- [ ] 30 可选项目列表过长，需评估搜索功能
- [ ] 品牌总专题 + 5+ 单车型页面的路由层级较深（`/product/li-auto/one`），需确保 breadcrumb 正确
- [ ] 理想单车型 SPEC 中 ONE=amber, i6=amber — 需统一品牌色，单车型不另设色

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
| LI-AUTO-AC-01 | §7 | TBD | "页面渲染" | ⬜ |

---

> 最后更新: 2026-07-07
