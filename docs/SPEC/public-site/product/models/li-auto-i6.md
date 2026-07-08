# SPEC: 理想 i6 单车型专题

> **车型**: 理想 i6
> **品牌**: 理想 (`li-auto`)
> **对应 PRD**: [`LI_AUTO_I6_TOPIC_PRD_2026-06-27.md`](../../../../PRD/backlog/product/LI_AUTO_I6_TOPIC_PRD_2026-06-27.md) (v0.1)
> **页面类型**: 单车型轻改升级方案
> **实现状态**: ⬜ 未开始 — 仅 PRD，无代码无资产
> **创建日期**: 2026-07-07

---

## 1. 职责范围

理想 i6 单车型轻改专题页 `/product/li-auto/i6`。展示 20 项热门轻改产品，按 5 场景重组（新车保护/座舱氛围/外观个性/智能屏幕/行车防护）。面向理想 i6 车主，突出城市通勤、年轻家庭和科技座舱。不负责理想 i8/L9/MEGA/ONE 或其他理想车型。

## 1.1 Skill 路由

| Skill | 是否使用 | 用途 |
|---|---|---|
| `next-best-practices` | 是 | RSC page、metadata、JSON-LD、legacy redirect |
| `react-best-practices` | 是 | CC 交互组件（筛选、展开、锚点） |
| `web-design-engineer` | 是 | Hero 视觉、amber 主题、城市科技氛围 |
| `prisma-data-ops` | 否 | 全部为静态数据 |
| faker/MSW | 否 | — |

---

## 2. 路由 / 入口

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/product/li-auto/i6` | page (RSC) | i6 单车型专题页，canonical | ⬜ 未实现 |
| `/product/li-auto-i6` | redirect | Legacy alias → 301 `/product/li-auto/i6` | ⬜ |
| `/product/li-auto` | page (RSC) | 理想品牌总专题 | ⬜ planned |
| `/product` | page (RSC) | 产品中心入口 | ✅ live |

---

## 3. 数据模型

### 3.1 图片规格

```typescript
type Width = 1448;
type Height = 1086;
type AspectRatio = "4/3";
type MaxProjects = 20;
type MinProjects = 20;
```

### 3.2 项目类型

```typescript
type LiAutoI6ImageStatus = "matched" | "pending-review" | "missing";

type LiAutoI6UpgradeProject = {
  order: number;                    // 01-20
  key: string;
  name: string;
  category:
    | "protection"         // 新车保护
    | "film_comfort"       // 玻璃膜/舒适
    | "appearance"         // 外观个性
    | "cabin_protection"   // 座舱保护
    | "cabin_ambiance"     // 座舱氛围
    | "cabin_convenience"  // 座舱便利
    | "cabin_comfort"      // 座舱舒适
    | "chassis"            // 底盘/行车
    | "driving_protection" // 行车防护
    | "smart_display"      // 智能显示
    | "interior_care";     // 内饰养护
  summary: string;
  suitableFor: string[];
  caution?: string;
  publicPath: `/images/products/li-auto-i6/${string}.png`;
  width: Width;
  height: Height;
  aspectRatio: AspectRatio;
  imageStatus: LiAutoI6ImageStatus; // 一期全部 "pending-review"
};
```

### 3.3 20 项项目清单

| 序号 | key | 名称 | 分类 | 图片状态 |
|---:|---|---|---|---|
| 01 | paint-protection-film | 车衣 | protection | pending-review |
| 02 | window-film | 隔热膜 | film_comfort | pending-review |
| 03 | graphic-wrap | 彩绘 | appearance | pending-review |
| 04 | two-tone-color-wrap | 双拼改色 | appearance | pending-review |
| 05 | floor-mats-360 | 360 软包脚垫 | cabin_protection | pending-review |
| 06 | star-ceiling | 星空顶 | cabin_ambiance | pending-review |
| 07 | stabilizer-bar | 平衡杆 | chassis | pending-review |
| 08 | star-film | 星空膜 | cabin_ambiance | pending-review |
| 09 | underbody-skid-plate | 底盘护板 | chassis | pending-review |
| 10 | rear-table-tray | 小桌板 | cabin_convenience | pending-review |
| 11 | fragrance-system | 香氛系统 | cabin_comfort | pending-review |
| 12 | wheel-rims | 轮毂 | appearance | pending-review |
| 13 | streaming-rearview-mirror | 流媒体后视镜 | smart_display | pending-review |
| 14 | screen-protector | 钢化膜 | smart_display | pending-review |
| 15 | brake-caliper | 刹车卡钳 | appearance | pending-review |
| 16 | welcome-step | 迎宾踏板 | driving_protection | pending-review |
| 17 | bug-screen | 防虫网 | driving_protection | pending-review |
| 18 | mud-flap | 挡泥板 | driving_protection | pending-review |
| 19 | hud-cover | HUD 显示保护罩 | smart_display | pending-review |
| 20 | interior-coating | 内饰镀膜 | interior_care | pending-review |

### 3.4 5 场景矩阵

| 场景 | 包含项目 | 面向用户 |
|---|---|---|
| 新车基础保护 | 车衣、隔热膜、360软包脚垫、底盘护板、钢化膜、内饰镀膜 | 刚提车用户 |
| 座舱氛围与舒适 | 星空顶、星空膜、香氛系统、小桌板、内饰镀膜 | 氛围/家庭用户 |
| 外观个性升级 | 彩绘、双拼改色、轮毂、刹车卡钳 | 个性表达用户 |
| 智能屏幕与显示保护 | 流媒体后视镜、钢化膜、HUD 显示保护罩 | 科技体验用户 |
| 行车与日常防护 | 底盘护板、平衡杆、防虫网、挡泥板、迎宾踏板 | 日常防护用户 |

### 3.5 数据文件

```text
src/lib/li-auto-i6-products.ts          ← 20 项静态数据
```

### 3.6 路由注册

```typescript
// MODELS 数组追加:
{
  type: "vehicle_model",
  brandSlug: "li-auto",
  modelSlug: "i6",
  modelName: "理想 i6",
  parentPath: "/product/li-auto",
  canonicalPath: "/product/li-auto/i6",
  title: "理想 i6 专属升级方案",
  navLabel: "i6",
  status: "planned",
  priority: "P1",
  projectCount: 20,
  sourcePrd: "docs/PRD/backlog/product/LI_AUTO_I6_TOPIC_PRD_2026-06-27.md",
  legacyPaths: ["/product/li-auto-i6"],
},
```

---

## 4. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| `LiAutoI6Page` | `src/app/product/li-auto/i6/page.tsx` | RSC | 页面组合 + metadata + JSON-LD |
| `LiAutoI6Hero` | `src/components/li-auto-i6/LiAutoI6Hero.tsx` | CC | 车型主视觉 + 5 场景锚点 + CTA |
| `LiAutoI6ProjectGrid` | `src/components/li-auto-i6/LiAutoI6ProjectGrid.tsx` | CC | 20 项项目网格（4/2/1 响应式） |
| `LiAutoI6ScenarioMatrix` | `src/components/li-auto-i6/LiAutoI6ScenarioMatrix.tsx` | CC | 5 场景筛选 |
| `LiAutoI6BundleCards` | `src/components/li-auto-i6/LiAutoI6BundleCards.tsx` | CC | 5 类推荐组合 |
| `LiAutoI6ServiceFlow` | `src/components/li-auto-i6/LiAutoI6ServiceFlow.tsx` | CC | 7 步施工流程 |
| `LiAutoI6Faq` | `src/components/li-auto-i6/LiAutoI6Faq.tsx` | CC | FAQ 手风琴 |

---

## 5. 业务规则

| # | 规则 | 触发条件 | 系统行为 |
|---|------|---------|---------|
| BR1 | 20 项完整性 | 页面渲染 | 与 PRD §7 清单完全一致 |
| BR2 | 5 场景筛选 | 用户选择场景 | 过滤对应项目 |
| BR3 | 默认排序 | 初始加载 | 按序号 01-20 |
| BR4 | 3 态图片 | 项目 imageStatus | 一期全部 `pending-review` |
| BR5 | 合规红线 | 页面渲染 | 不出现：理想官方授权、原厂配件、不影响质保、100%无损、性能提升 |
| BR6 | 无海报模块 | 页面渲染 | 不包含海报素材展示/PosterStub |
| BR7 | 平衡杆安全提示 | 展开平衡杆项目 | 显式声明：需到店评估安装位，不做性能承诺 |
| BR8 | 刹车卡钳提示 | 展开刹车卡钳项目 | 显式声明：视觉点缀，不做制动性能承诺 |
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
| LI-I6-AC-01 | 页面渲染 | GET /product/li-auto/i6 | 200，HTML 含 20 项项目 | happy |
| LI-I6-AC-02 | 场景筛选 | 点击"座舱氛围与舒适" | 仅显示星空顶/星空膜/香氛/小桌板/内饰镀膜 | happy |
| LI-I6-AC-03 | 组合高亮 | 点击"新车基础保护组合" | 车衣/隔热膜/360脚垫/底盘护板/钢化膜/内饰镀膜高亮 | happy |
| LI-I6-AC-04 | 安全提示 | 展开平衡杆项目 | 显示"需到店评估安装位，不做性能承诺" | edge |
| LI-I6-AC-05 | 合规红线 | 全文搜索 | 不出现：官方授权、原厂配件、不影响质保 | edge |
| LI-I6-AC-06 | 海报模块不存在 | 搜索 poster | 页面不含海报模块 | edge |
| LI-I6-AC-07 | 390px | 浏览器 390px | 无横向滚动 | edge |
| LI-I6-AC-08 | 1440px | 浏览器 1440px | 4 列网格 | edge |
| LI-I6-AC-09 | legacy 301 | GET /product/li-auto-i6 | 301 → /product/li-auto/i6 | happy |
| LI-I6-AC-10 | build | `npm run build` | SSG 预渲染成功 | happy |
| LI-I6-AC-11 | 项目数校验 | `npx tsc --noEmit` | 20 与 PRD 一致 | happy |

---

## 8. 已知问题

- [ ] 全部 20 项无图片资产（`pending-review`），需生成或拍摄
- [ ] 20 项是该品牌专题中项目数最多的，需关注移动端浏览体验
- [ ] HUD 显示保护罩、流媒体后视镜涉及电气适配，需确认施工能力
- [ ] 理想 i6 为较新车型，需确认门店已有适配经验

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
| LI-I6-AC-01 | §7 | TBD | "页面渲染" | ⬜ |

---

> 最后更新: 2026-07-07
