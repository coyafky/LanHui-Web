# SPEC: 极氪 8X 单车型专题

> **车型**: 极氪 8X
> **品牌**: 极氪 (`zeekr`)
> **对应 PRD**: [`ZEEKR_8X_TOPIC_PRD_2026-06-27.md`](../../../../PRD/backlog/product/ZEEKR_8X_TOPIC_PRD_2026-06-27.md) (v0.1)
> **页面类型**: 单车型轻改升级方案
> **实现状态**: ⬜ 未开始 — 仅 PRD，无代码无资产
> **创建日期**: 2026-07-07

---

## 1. 职责范围

极氪 8X 单车型轻改专题页 `/product/zeekr/8x`。展示 17 项热门轻改项目（车衣、隔热膜、彩绘、悬浮顶、360软包脚垫、铝地板、平衡杆、运动包围、氛围灯、底盘护板、小桌板、挡泥板、防虫网、抬头显示、钢化膜、门槛条、牌照框），按 5 场景重组。与现有极氪总专题 `/product/zeekr` 互补。不负责极氪 9X/009 或其他极氪车型。

## 1.1 Skill 路由

| Skill | 是否使用 | 用途 |
|---|---|---|
| `next-best-practices` | 是 | RSC page、metadata、JSON-LD、legacy redirect |
| `react-best-practices` | 是 | CC 交互组件（筛选、展开、锚点）、memo |
| `web-design-engineer` | 是 | Hero 视觉、orange 主题、卡片布局 |
| `prisma-data-ops` | 否 | 全部为静态数据 |
| faker/MSW | 否 | — |

---

## 2. 路由 / 入口

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/product/zeekr/8x` | page (RSC) | 8X 单车型专题页，canonical | ⬜ 未实现 |
| `/product/zeekr-8x` | redirect | Legacy alias → 301 `/product/zeekr/8x` | ⬜ |
| `/product/zeekr` | page (RSC) | 极氪品牌总专题 | ✅ live（旧款式表） |
| `/product` | page (RSC) | 产品中心入口 | ✅ live |

---

## 3. 数据模型

### 3.1 图片规格（字面量类型）

```typescript
type Width = 1448;
type Height = 1086;
type AspectRatio = "4/3";
type MaxProjects = 17;
type MinProjects = 17;
```

### 3.2 项目类型

```typescript
type Zeekr8xImageStatus = "matched" | "pending-review" | "missing";

type Zeekr8xUpgradeProject = {
  order: number;                    // 01-17
  key: string;                      // e.g. "floating-roof-wrap"
  name: string;                     // 中文名, e.g. "悬浮顶"
  category:
    | "protection"         // 新车保护
    | "film"               // 玻璃膜/舒适
    | "appearance"         // 外观个性
    | "cabin_protection"   // 座舱保护
    | "family_cabin"       // 家庭座舱
    | "chassis"            // 底盘/行车
    | "driving_protection" // 行车防护
    | "smart_display"      // 智能显示
    | "detail_decoration"; // 细节装饰
  summary: string;
  suitableFor: string[];
  caution?: string;
  publicPath: `/images/products/zeekr-8x/${string}.png`;
  width: Width;
  height: Height;
  aspectRatio: AspectRatio;
  imageStatus: Zeekr8xImageStatus;
};
```

### 3.3 17 项项目清单

| 序号 | key | 名称 | 分类 | 图片状态 |
|---:|---|---|---|---|
| 01 | paint-protection-film | 车衣 | protection | pending-review |
| 02 | window-film | 隔热膜 | film | pending-review |
| 03 | graphic-wrap | 彩绘 | appearance | pending-review |
| 04 | floating-roof-wrap | 悬浮顶 | appearance | pending-review |
| 05 | floor-mats-360 | 360 软包脚垫 | cabin_protection | pending-review |
| 06 | aluminum-floor | 铝地板 | family_cabin | pending-review |
| 07 | stabilizer-bar | 平衡杆 | chassis | pending-review |
| 08 | sport-body-kit | 运动包围 | appearance | pending-review |
| 09 | ambient-lighting | 氛围灯 | family_cabin | pending-review |
| 10 | underbody-skid-plate | 底盘护板 | chassis | pending-review |
| 11 | rear-table-tray | 小桌板 | family_cabin | pending-review |
| 12 | mud-flap | 挡泥板 | driving_protection | pending-review |
| 13 | bug-screen | 防虫网 | driving_protection | pending-review |
| 14 | head-up-display | 抬头显示 | smart_display | pending-review |
| 15 | screen-protector | 钢化膜 | smart_display | pending-review |
| 16 | sill-plate | 门槛条 | detail_decoration | pending-review |
| 17 | license-plate-frame | 牌照框 | detail_decoration | pending-review |

### 3.4 数据文件

```text
src/lib/zeekr-8x-products.ts          ← 17 项静态数据
```

### 3.5 路由注册

```typescript
// MODELS 数组追加:
{
  type: "vehicle_model",
  brandSlug: "zeekr",
  modelSlug: "8x",
  modelName: "极氪 8X",
  parentPath: "/product/zeekr",
  canonicalPath: "/product/zeekr/8x",
  title: "极氪 8X 专属升级方案",
  navLabel: "8X",
  status: "planned",
  priority: "P1",
  projectCount: 17,
  sourcePrd: "docs/PRD/backlog/product/ZEEKR_8X_TOPIC_PRD_2026-06-27.md",
  legacyPaths: ["/product/zeekr-8x"],
},
```

---

## 4. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| `Zeekr8xPage` | `src/app/product/zeekr/8x/page.tsx` | RSC | 页面组合 + metadata + JSON-LD |
| `Zeekr8xHero` | `src/components/zeekr-8x/Zeekr8xHero.tsx` | CC | 车型主视觉 + 5 场景锚点 + CTA |
| `Zeekr8xProjectGrid` | `src/components/zeekr-8x/Zeekr8xProjectGrid.tsx` | CC | 17 项项目网格（4/2/1 响应式） |
| `Zeekr8xScenarioMatrix` | `src/components/zeekr-8x/Zeekr8xScenarioMatrix.tsx` | CC | 5 场景筛选 + 项目重组 |
| `Zeekr8xBundleCards` | `src/components/zeekr-8x/Zeekr8xBundleCards.tsx` | CC | 5 类推荐组合卡片 |
| `Zeekr8xServiceFlow` | `src/components/zeekr-8x/Zeekr8xServiceFlow.tsx` | CC | 7 步统一施工流程 |
| `Zeekr8xFaq` | `src/components/zeekr-8x/Zeekr8xFaq.tsx` | CC | FAQ 手风琴 |

---

## 5. 业务规则

| # | 规则 | 触发条件 | 系统行为 |
|---|------|---------|---------|
| BR1 | 17 项项目完整性 | 页面渲染 | 项目 key/name/category 与 PRD §7 清单完全一致 |
| BR2 | 5 场景筛选 | 用户选择场景 | 新车基础保护/外观个性升级/家庭座舱与舒适/智能屏幕与显示保护/行车与日常防护 |
| BR3 | 默认排序 | 初始加载 | 按 PRD 序号 01-17 |
| BR4 | 3 态图片渲染 | 项目 imageStatus | `matched`=真实图, `pending-review`=占位+审核中, `missing`=统一占位 |
| BR5 | 组合推荐 | 点击推荐组合 | 关联项目视觉高亮 |
| BR6 | 合规红线 | 页面渲染 | 不出现：极氪官方授权、ZEEKR官方合作、原厂配件、不影响质保、100%无损 |
| BR7 | 无海报模块 | 页面渲染 | 不包含"海报素材展示"章节/PosterStub |
| BR8 | 主题色 orange | 所有组件 | 沿用极氪品牌 orange（与 zeekr 总专题一致） |
| BR9 | 适配说明 | 页面渲染 | 显式声明"不同年份/批次/版本可能不同，以到店确认为准" |

---

## 6. 响应式

| 视口 | 要求 |
|------|------|
| 390px | 项目卡单列，场景筛选横向可滚动，锚点折叠为下拉 |
| 768px | 项目卡 2 列，Hero 上下结构 |
| 1440px | 项目卡 4 列，Hero 横排，锚点 sticky |

---

## 7. 测试用例清单

| AC-ID | 场景 | 输入 | 预期 | 类型 |
|-------|------|------|------|------|
| ZEEKR8X-AC-01 | 页面 SSR 渲染 | GET /product/zeekr/8x | 200，HTML 含 17 项项目名称 | happy |
| ZEEKR8X-AC-02 | 场景筛选 | 点击"外观个性升级" | 仅显示彩绘/悬浮顶/运动包围/门槛条/牌照框 | happy |
| ZEEKR8X-AC-03 | 组合高亮 | 点击"新车基础保护组合" | 车衣/隔热膜/360脚垫/底盘护板/钢化膜高亮 | happy |
| ZEEKR8X-AC-04 | 项目展开 | 点击项目卡片 | 展开面板显示适合人群/注意事项 | happy |
| ZEEKR8X-AC-05 | 合规红线 | 全文搜索 | 不出现：极氪官方授权、原厂配件、不影响质保 | edge |
| ZEEKR8X-AC-06 | 海报模块不存在 | 搜索 poster/海报 | 页面不含海报模块/埋点 | edge |
| ZEEKR8X-AC-07 | 390px 无横向滚动 | 浏览器 390px | 项目卡单列，无 overflow-x | edge |
| ZEEKR8X-AC-08 | 1440px 4 列 | 浏览器 1440px | 项目网格 4 列 | edge |
| ZEEKR8X-AC-09 | legacy 301 | GET /product/zeekr-8x | 301 → /product/zeekr/8x | happy |
| ZEEKR8X-AC-10 | 与极氪总专题共存 | GET /product/zeekr + GET /product/zeekr/8x | 两页独立渲染，不冲突 | edge |
| ZEEKR8X-AC-11 | build 不依赖 DB | `npm run build` | 成功，SSG 预渲染 | happy |

---

## 8. 已知问题

- [ ] 全部 17 项无图片资产（`pending-review`），需生成或拍摄
- [ ] 无 AI 预览图，无法复用 NIO ES8 的 `generated-preview` 4 态
- [ ] Zeekr 8X 旧款式表（总专题中）仅 6 款，新 SPEC 扩为 17 项，需决定是替换还是共存
- [ ] 需新增 `AccentColor` 酒红辅助色或复用现有 orange

---

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-27 | Claude Code | PRD v0.1 创建 | 完成 | — |
| 2026-07-07 | Claude Code | 驱动型 SPEC 编写 | 完成 | 图片生成 + 数据层 + 页面实现 |

---

## 验收追溯

| AC-ID | SPEC § | 测试文件 | 测试用例 | 结果 |
|-------|--------|---------|---------|------|
| ZEEKR8X-AC-01 | §7 | TBD | "页面 SSR 渲染" | ⬜ |

---

> 最后更新: 2026-07-07
