# SPEC: 小鹏 GX 单车型专题

> **车型**:小鹏 GX
> **品牌**:小鹏(`xpeng`)
> **对应 PRD**:[`XPENG_GX_TOPIC_PRD_2026-06-25.md`](../../../../PRD/product/XPENG_GX_TOPIC_PRD_2026-06-25.md)(v0.1)
> **页面类型**:单车型轻改升级方案 PRD
> **SPEC 版本**:v0.2 (dispatch 友好版)
> **实现状态**:✅ **live** — 父品牌 planned,但 `/product/xpeng/gx` 单车型页已交付(海报模块 2026-06-26 移除)
> **创建日期**:2026-06-25
> **最后更新**:2026-06-26

---

## 1. 路由

| 字段 | 值 |
|---|---|
| Canonical Route | `/product/xpeng/gx` |
| Legacy Alias(已注册) | `/product/xpeng-gx` |
| 父路径 | `/product/xpeng` (**planned,不在本期范围**) |
| Legacy Redirect | `next.config.ts` redirects:`/product/xpeng-gx` → `/product/xpeng/gx` |
| 解析函数 | `getCanonicalFor("/product/xpeng-gx")` → `"/product/xpeng/gx"` |

> Legacy alias 通过 `MODELS.legacyPaths` 自动生成,已包含在 `ALL_LEGACY_ALIASES` 中。

---

## 2. 数据模型(`VehicleModelRoute`)

```typescript
{
  type: "vehicle_model",
  brandSlug: "xpeng",
  modelSlug: "gx",
  modelName: "小鹏 GX",
  parentPath: "/product/xpeng",
  canonicalPath: "/product/xpeng/gx",
  title: "小鹏 GX 专属升级方案",
  navLabel: "GX",
  status: "planned",             // → 完成后翻 "live"
  priority: "P1",
  projectCount: 22,              // 15 海报驱动 + 7 后续补充
  sourcePrd: "docs/PRD/product/XPENG_GX_TOPIC_PRD_2026-06-25.md",
  legacyPaths: ["/product/xpeng-gx"],
} as const
```

**字段约束**:

- `projectCount = 22`:海报驱动 15 + 后续 7
- `status = "planned"` → 实现完成后翻 `"live"`(与 Tesla 翻转模式一致)
- `priority = "P1"`
- `sourcePrd`:v0.1

### 2.1 项目数据类型(`XpengGxUpgradeProject`)

```typescript
type XpengGxCategory =
  | "protection"             // 新车保护
  | "appearance"             // 外观个性
  | "electric_convenience"   // 电动便利
  | "chassis"                // 底盘与行车防护
  | "screen_care"            // 屏幕与显示保护
  | "cabin_care";            // 座舱维护

type XpengGxSaleStatus = "available" | "preorder" | "pending-review";
type XpengGxImageStatus = "matched" | "pending-review" | "missing";

interface XpengGxUpgradeProject {
  readonly id: string;                            // e.g. "xpeng-gx-ppf"
  readonly order: number;                          // 1-15 (按海报顺序)
  readonly name: string;
  readonly category: XpengGxCategory;
  readonly saleStatus: XpengGxSaleStatus;          // 电动门 = "preorder"
  readonly summary: string;
  readonly suitableFor: readonly string[];         // 适合人群
  readonly caution?: string;                       // 注意事项(可选, 电动门必填)
  readonly imageStatus: XpengGxImageStatus;
  readonly sourceArea: "poster_project_matrix";
}
```

### 2.2 辅助类型

```typescript
interface XpengGxScenario {
  readonly key: string;
  readonly name: string;
  readonly description: string;
  readonly projectIds: readonly string[];          // 6 个场景
}

interface XpengGxBundle {
  readonly key: string;                            // 3 个组合
  readonly name: string;
  readonly value: string;
  readonly projectIds: readonly string[];
}

interface XpengGxFaqItem {
  readonly question: string;
  readonly answer: string;
}

interface XpengGxServiceStep {
  readonly step: number;                           // 1-7
  readonly title: string;
  readonly description: string;
}

export const xpengGxUpgradeProjects: readonly XpengGxUpgradeProject[];   // length === 15
export const xpengGxScenarios: readonly XpengGxScenario[];               // length === 6
export const xpengGxBundles: readonly XpengGxBundle[];                   // length === 3
export const xpengGxServiceSteps: readonly XpengGxServiceStep[];         // length === 7
export const xpengGxFaq: readonly XpengGxFaqItem[];                      // length === 8
export const XPENG_GX_CATEGORY_LABELS: Readonly<Record<XpengGxCategory, string>>;
```

### 2.3 Runtime 断言(开发期触发)

```typescript
function assertXpengGxDataShape(): void {
  if (xpengGxUpgradeProjects.length !== 15) {
    throw new Error(`xpengGxUpgradeProjects expected 15 items, got ${xpengGxUpgradeProjects.length}`);
  }
  if (xpengGxScenarios.length !== 6) {
    throw new Error(`xpengGxScenarios expected 6, got ${xpengGxScenarios.length}`);
  }
  if (xpengGxBundles.length !== 3) {
    throw new Error(`xpengGxBundles expected 3, got ${xpengGxBundles.length}`);
  }
  if (xpengGxServiceSteps.length !== 7) {
    throw new Error(`xpengGxServiceSteps expected 7, got ${xpengGxServiceSteps.length}`);
  }
  if (xpengGxFaq.length !== 8) {
    throw new Error(`xpengGxFaq expected 8, got ${xpengGxFaq.length}`);
  }

  // key 唯一性
  const allKeys = new Set<string>();
  for (const p of xpengGxUpgradeProjects) {
    if (allKeys.has(p.id)) throw new Error(`Duplicate project id: ${p.id}`);
    allKeys.add(p.id);
  }
  for (const s of xpengGxScenarios) {
    if (allKeys.has(s.key)) throw new Error(`Scenario key conflicts with project id: ${s.key}`);
  }
  for (const b of xpengGxBundles) {
    if (allKeys.has(b.key)) throw new Error(`Bundle key conflicts with project id: ${b.key}`);
  }

  // order 单调递增 1-15
  xpengGxUpgradeProjects.forEach((p, i) => {
    if (p.order !== i + 1) {
      throw new Error(`Project ${i} order expected ${i + 1}, got ${p.order}`);
    }
  });

  // service steps 连续 1-7
  xpengGxServiceSteps.forEach((s, i) => {
    if (s.step !== i + 1) {
      throw new Error(`Service step ${i} expected step ${i + 1}, got ${s.step}`);
    }
  });

  // scenario.projectIds 引用存在的 project id
  for (const s of xpengGxScenarios) {
    for (const pid of s.projectIds) {
      if (!allKeys.has(pid)) {
        throw new Error(`Scenario ${s.key} references missing project id: ${pid}`);
      }
    }
  }

  // bundle.projectIds 引用存在的 project id
  for (const b of xpengGxBundles) {
    for (const pid of b.projectIds) {
      if (!allKeys.has(pid)) {
        throw new Error(`Bundle ${b.key} references missing project id: ${pid}`);
      }
    }
  }

  // 每个 project 至少被一个 scenario 引用
  const referencedIds = new Set<string>();
  for (const s of xpengGxScenarios) for (const pid of s.projectIds) referencedIds.add(pid);
  for (const p of xpengGxUpgradeProjects) {
    if (!referencedIds.has(p.id)) {
      throw new Error(`Project ${p.id} not referenced by any scenario`);
    }
  }

  // 6 个类别都有中文标签
  const allCategories: readonly XpengGxCategory[] = [
    "protection", "appearance", "electric_convenience",
    "chassis", "screen_care", "cabin_care",
  ];
  for (const c of allCategories) {
    if (!XPENG_GX_CATEGORY_LABELS[c]) {
      throw new Error(`Missing label for category: ${c}`);
    }
  }
}
assertXpengGxDataShape();
```

---

## 3. 项目分类(按 PRD §7 + §8)

### 3.1 海报 15 个项目(PRD §7)

| 序号 | 项目 | 分类 | 售卖状态 | 关键描述 |
|---:|---|---|---|---|
| 01 | 车衣 | protection | available | 漆面保护、日常轻微划痕防护、新车质感保持 |
| 02 | 隔热膜 | protection | available | 隔热、防晒、隐私和驾乘舒适 |
| 03 | 彩绘 | appearance | available | 主题化车身视觉表达,提升辨识度 |
| 04 | 改色膜 | appearance | available | 改变车身视觉风格,满足个性化表达 |
| 05 | **电动门** | electric_convenience | **preorder** | 电动开闭便利和科技感;**需标注预售状态** |
| 06 | 平衡杆 | chassis | available | 车身支撑和驾驶稳定感,需到店评估 |
| 07 | 底盘护板 | chassis | available | 保护底部关键区域,适合新车基础防护 |
| 08 | 360 脚垫 | cabin_care | available | 地毯保护、易清洁、提升座舱完整感 |
| 09 | 轮毂 | appearance | available | 改变整车侧面姿态和视觉质感 |
| 10 | 门槛条 | cabin_care | available | 上下车高频区域防刮、防踩踏磨损 |
| 11 | 防虫网 | chassis | available | 减少虫石杂物进入关键散热/进风区域 |
| 12 | 挡泥板 | chassis | available | 减少泥水飞溅和车身侧面污染 |
| 13 | 钢化膜 | screen_care | available | 中控/娱乐屏幕防刮保护 |
| 14 | 抬头显示罩 | screen_care | available | 保护 HUD 或抬头显示区域相关部件,需确认安装位 |
| 15 | 牌照框 | appearance | available | 优化车头/车尾细节,提升视觉完整度 |

### 3.2 6 大场景(PRD §8)

| 场景 | 包含项目 |
|---|---|
| 新车保护 | 车衣 / 隔热膜 / 底盘护板 / 360 脚垫 / 门槛条 / 钢化膜 |
| 外观个性 | 彩绘 / 改色膜 / 轮毂 / 牌照框 |
| 电动便利 | 电动门【预售】 |
| 底盘与行车防护 | 平衡杆 / 底盘护板 / 防虫网 / 挡泥板 |
| 屏幕与显示保护 | 钢化膜 / 抬头显示罩 |
| 座舱维护 | 360 脚垫 / 门槛条 / 钢化膜 |

### 3.3 3 大组合(PRD §9)

| 组合 | 项目 |
|---|---|
| 新车基础保护组合 | 车衣 / 隔热膜 / 360 脚垫 / 底盘护板 / 门槛条 / 钢化膜 |
| 外观个性升级组合 | 彩绘 / 改色膜 / 轮毂 / 牌照框 |
| 科技便利与屏幕保护组合 | 电动门【预售】 / 钢化膜 / 抬头显示罩 |

### 3.4 7 步服务流程(PRD §12)

车型确认 → 项目选择 → 到店评估 → 方案确认 → 施工安装 → 验收交付 → 售后支持

### 3.5 8 FAQ(PRD §13)

覆盖适配边界 / 新车推荐 / 预售说明 / 外观个性 / 屏幕保护 / 单项可选 / 质保边界 / 工期

---

## 4. 字段约定

| 字段 | 约定 | 备注 |
|---|---|---|
| 车型名 | `小鹏 GX` | 中文 + 空格 + 英文/数字 |
| 品牌 slug | `xpeng` | 来自 `product-routes.ts BRANDS[5]` |
| 型号 slug | `gx` | 小写 |
| 页面 title | `小鹏 GX 专属升级方案 \| 蓝辉轻改 LANHUI` | — |
| H1 | `小鹏 GX 专属升级方案` | — |
| 主题色 | `emerald-400 #34d399` (xpeng) | 锚点高亮、CTA 边框 |
| 面包屑 | `产品中心 / 小鹏 / GX` | — |
| JSON-LD | `CollectionPage` + `ItemList` | 22 个项目 ListItem |
| 项目 ID 前缀 | `xpeng-gx-{slug}` | e.g. `xpeng-gx-ppf` / `xpeng-gx-electric-door` |
| 场景 key 前缀 | `scenario-{slug}` | e.g. `scenario-new-car-protection` |
| 组合 key 前缀 | `bundle-{slug}` | e.g. `bundle-new-car-protection` |

---

## 5. 实施状态

| 维度 | 状态 | 备注 |
|---|---|---|
| 路由注册 | ✅ | `product-routes.ts` MODELS[9] |
| Legacy Redirect | ✅ | `ALL_LEGACY_ALIASES` 已含 |
| 父品牌页 | ⚪ planned | `/product/xpeng` 不存在(本期**不实现**) |
| 模型子目录 | ⚪ 无 | `src/app/product/xpeng/gx/page.tsx` 不存在 |
| 数据源 | ⚪ 无 | `xpeng-gx-products.ts` 不存在 |
| 8 组件 | ⚪ 无 | 需新建 |
| 图资源 | ⚪ 无 | 15 张项目图待业务补(海报模块 2026-06-26 移除) |
| 验证脚本 | ⚪ 无 | 需 `verify-xpeng-gx-content.mjs` |
| Playwright | ⚪ 无 | 需 `e2e/xpeng-gx.spec.ts` |

---

## 6. 合规边界(摘自 PRD §3.2 + §3.3,**一字不改**)

### 6.1 车型适配边界声明(强制,PRD §3.2)

> 不同年份、批次、版本和配置的小鹏 GX 在尺寸、接口、安装位和结构上可能存在差异。页面项目只作为轻改方向参考,最终以到店确认和施工评估为准。

### 6.2 合规红线 9 项(PRD §3.3,不得命中)

- ❌ 小鹏官方授权
- ❌ 原厂配件
- ❌ 官方同款
- ❌ 不影响原厂质保
- ❌ 100% 无损安装
- ❌ 永久质保
- ❌ 全网最低
- ❌ 性能提升、操控提升、制动提升 等不可验证承诺

### 6.3 预售项目特别处理(电动门)

- `saleStatus: "preorder"` 必须显示"预售"标签
- 项目卡片必须显示"预售待确认"说明
- 需明确"以到店/库存确认结果为准"

---

## 7. 架构决策(已固化,15 项)

| # | 决策 | 决议 | 理由 |
|---|---|---|---|
| 1 | SPEC 文档处理 | **覆盖重写** v0.1 → v0.2 dispatch 友好版 | 用户决策 #1 |
| 2 | 父品牌 `/product/xpeng` | **不实现**(超出 PRD 范围) | 用户决策 #2;`/product/xpeng/gx` 路径可独立访问 |
| 3 | 项目数 15 vs 22 | 15(PRD §7 海报)+ 7 后续待补(可选) | 用户决策 #3;数据层用 `xpengGxUpgradeProjects` (15) + 7 后续待补 |
| 4 | 项目卡片 CTA | **无 PhoneCta**,改为**可点击展开面板** | 用户决策 #4;PRD §7.3 默认 → 展开 suitableFor + caution |
| 5 | 页面级 CTA | 底部保留"返回产品中心"链接(无 PhoneCta) | 用户决策 #5 |
| 6 | 场景卡点击 | 滚动到 `scenario-{key}` 锚点 + `upgrade_project_click` 埋点 | 用户决策 #6 |
| 7 | 组合点击 | 滚动到 ProjectGrid + 高亮组合内项目 + `bundle_click` 埋点 | 用户决策 #7 |
| 8 | 海报资产 | **已删除**(2026-06-26,PRD 设计失误,组件 XpengGxPosterStub + SPEC 章节全部移除) | 用户决策 #8 推翻 |
| 9 | 主题色 | `emerald-500/400/700/900` | 用户决策 #9;与 `product-routes.ts` accentColor 一致 |
| 10 | 组件数量 | **8 件**(含 BundleList 新增,Tesla 没有) | 用户决策 #10 |
| 11 | 埋点 SDK | 复用 `src/lib/analytics.ts` 的 `trackClick`,不扩展 SDK | 用户决策 #11 |
| 12 | 字段顺序 | Hero → ProjectGrid → ScenarioMatrix → BundleList → ModelFitNote → ServiceFlow → Faq → 底部 CTA | 用户决策 #12(2026-06-26 移除 PosterStub) |
| 13 | 复用问界 L2 模式 | 仿 `src/app/product/wenjie/m6/page.tsx` | 用户决策 #13 |
| 14 | Worktree 隔离 | 5 worktree(prep/data/ui/page/final),各 commit 独立分支,orchestrator `--no-ff` merge | 用户决策 #14 |
| 15 | 状态翻转 | 实现完成 + 验收通过后改 `product-routes.ts:54` live | 用户决策 #15 |

---

## 8. 任务列表(按依赖顺序,28 task)

### 阶段 A:基础设施与入口(2 task)

- **A.1**: 新建 `src/components/xpeng/XpengGxTopicBanner.tsx`(RSC,emerald 主题,inline 内容)
- **A.2**: 修改 `src/app/product/page.tsx` 加 XpengGxTopicBanner 到"整理中车系"折叠区

### 阶段 B:数据层(1 task)

- **B.1**: 新建 `src/lib/xpeng-gx-products.ts`(15 项目 + 6 场景 + 3 组合 + 7 步 + 8 FAQ + 6 类别中文标签 + runtime 断言)
- **B.2**: 新建 `src/lib/xpeng-gx-products.test.ts`(25+ 单元测试)

### 阶段 C:UI 组件层(8 task)

- **C.1**: `XpengGxTopicHero.tsx` (RSC)
- **C.2**: `XpengGxProjectGrid.tsx` (CC,15 卡片,**可点击展开**,无 PhoneCta,runtime 断言 length === 15)
- **C.3**: `XpengGxScenarioMatrix.tsx` (CC,6 场景卡,点击滚动 + 埋点)
- **C.4**: `XpengGxBundleList.tsx` (RSC,3 组合卡,**新增组件**)
- **C.5**: `XpengGxModelFitNote.tsx` (RSC,PRD §3.2 原文)
- **C.6**: `XpengGxServiceFlow.tsx` (RSC,7 步,runtime 断言 length === 7)
- ~~**C.7**: `XpengGxPosterStub.tsx` (RSC,海报 1055×1491 空态,`aspect-[4/5]`)~~ — **2026-06-26 已删除(PRD 设计失误)**
- **C.8**: `XpengGxFaq.tsx` (CC,8 FAQ 折叠,useState 一次展开一项)

### 阶段 D:页面组装 + sitemap(3 task)

- **D.1**: `src/app/product/xpeng/gx/page.tsx`(RSC,单车型页,8 组件 + JSON-LD ItemList 22 项 + Metadata)
- **D.2**: `src/components/xpeng/XpengGxTopicViewTrack.tsx`(CC,触发 `product_topic_view` 埋点)
- **D.3**: 修改 `src/app/sitemap.ts`(+1 行注册 `/product/xpeng/gx`)

### 阶段 E:埋点集成(4 task,跨阶段)

- **E.1**: `product_topic_view` — XpengGxTopicViewTrack
- **E.2**: `upgrade_project_click` — XpengGxProjectGrid(含 preorder 区分)
- **E.3**: `bundle_click` — XpengGxBundleList
- ~~**E.4**: `poster_expand_click` — XpengGxPosterStub~~ — **2026-06-26 已删除**
- 注:`vehicle_upgrade_module_view` 在 ProjectGrid 渲染时一次性触发(useEffect)

### 阶段 F:测试(4 task)

- **F.1**: vitest 单元测试(已含 B.2)
- **F.2**: Playwright 三视口截图(`e2e/xpeng-gx.spec.ts`)
- **F.3**: 内容验收脚本(`scripts/verify-xpeng-gx-content.mjs`)
- **F.4**: 移动端横向溢出检查(390px viewport scrollWidth === clientWidth)

### 阶段 G:质量门禁(3 task)

- **G.1**: `npm run lint` — 0 新增 error
- **G.2**: `npm run typecheck` — 0 新增 error
- **G.3**: `npm run build` — exit 0,`/product/xpeng/gx` 为 `○ Static`

### 阶段 H:收尾(3 task)

- **H.1**: 状态翻转 — `src/lib/product-routes.ts:54` `status: "planned"` → `"live"`
- **H.2**: 交付报告 — `docs/daily/2026-06-26/dispatch/10-xpeng-gx-delivery.md`
- **H.3**: Worktree 合并 — orchestrator `--no-ff` merge × 5 + main 上 `npm install`

---

## 9. Worktree 拆分表(5 worktree)

| Worktree | 分支名 | 任务范围 | 依赖 | 合并顺序 |
|---|---|---|---|---|
| **prep** | `worktree-xpeng-gx-prep` | A.1 + A.2 | 无 | 1 |
| **data** | `worktree-xpeng-gx-data` | B.1 + B.2 | 无(可与 prep 并行) | 2 |
| **ui** | `worktree-xpeng-gx-ui` | C.1-C.8 (8 commits) | data merge 后 | 3 |
| **page** | `worktree-xpeng-gx-page` | D.1 + D.2 + D.3 | ui merge 后 | 4 |
| **final** | `worktree-xpeng-gx-final` | H.1 + F.2 + F.3 + F.4 + G.1-G.3 + H.2 | page merge 后 | 5 |

**合并顺序**:prep → data → ui → page → final;`--no-ff` merge。

> 注:合并后立即 `npm install`(worktree 独立 node_modules 经验,见 MEMORY.md 2026-06-19)。

---

## 10. 风险清单与缓解

| 风险 | 触发条件 | 影响 | 缓解 |
|---|---|---|---|
| ~~**海报长图 mobile 横滚**~~ | ~~D.1 误引用真实图片~~ | ~~移动端整页可横滚~~ | ~~**2026-06-26 风险已消除(PosterStub 已删除)**~~ |
| **车型适配边界声明文案漂移** | C.5 重写文案时丢失关键词 | 失去 PRD §3.2 红线保护 | F.3 验证 PRD §3.2 原文一字不差出现 |
| **合规红线命中** | 组件误写"小鹏官方授权"等 | 合规事故 | F.3 grep 9 关键词;命中即 fail |
| **电动门预售状态漏标** | C.2 漏传 saleStatus | 误把预售当现货 | F.3 断言 `xpeng-gx-electric-door` saleStatus === "preorder" |
| **字面量类型被绕过** | 数据文件用 `as XpengGxUpgradeProject[]` 绕过 length 检查 | 数量漂移 | F.1 单元测试覆盖每个数组 + 数据文件 runtime check |
| **跨 worktree 类型导入** | ui 在 data 合 main 前 import `xpeng-gx-products` | 类型 not found | 合并顺序:data → ui → page |
| **`product-routes.ts:54` 翻 status 太早** | H.1 在 page 未完成时翻转 | 入口链 404 | H.1 放在 final 阶段,**所有验收通过后**翻转 |
| **XpengGxTopicBanner 误用数据层** | 后期把文案挪到 `xpeng-gx-products.ts` | 触发 Banner 改动 | A.1 显式注释「**不**依赖数据层」;F.3 验证 Banner HTML 不含 15 项目名 |
| **Worktree 缺 .env / node_modules** | dispatch 后 dev server 起不来 | 阻断 F.2 | `cp .env .env` + `npm install` |
| **组合高亮未实现** | C.4 只展示组合卡片,无实际高亮逻辑 | 用户决策 #7 失效 | F.3 验证 ProjectGrid 接 bundleKey prop 后高亮 |
| **JSON-LD 数量不对** | D.1 写错 itemListElement | SEO 受影响 | F.3 断言 `itemListElement.length === 22`(15+7 后续) |

---

## 11. 验收标准(与 PRD §19 三棱镜对齐)

### 11.1 实现什么(PRD §19.1)

- [ ] 新增小鹏 GX 单车型升级方案页面 `/product/xpeng/gx`
- [ ] 页面完整展示 15 个项目(SPEC §3.1)
- [ ] 页面明确标注"电动门【预售】"状态
- [ ] 页面按 6 场景分类展示项目
- [ ] 页面提供 3 大推荐组合(新车保护 / 外观个性 / 科技便利)
- [ ] 7 步服务流程 + 8 FAQ + 边界声明(海报模块 2026-06-26 已移除)

### 11.2 怎么实现(PRD §19.2)

- [ ] 静态数据维护 15 个项目(`xpeng-gx-products.ts`)
- [ ] 项目卡片支持分类标签、售卖状态、展开说明(suitableFor + caution)
- [ ] ~~海报作为素材模块展示~~ — **2026-06-26 已移除,保留为正文 HTML 文本**
- [ ] 图片允许 `pending-review` 状态(`imageStatus: "pending-review"` 默认)

### 11.3 怎么验收(PRD §19.3)

- [ ] 15 个项目名称与 SPEC §3.1 一致,无遗漏、无错字
- [ ] 电动门显示预售状态,不能当作现货项目
- [ ] 6 场景完整覆盖
- [ ] 合规 9 红线 0 命中
- [ ] 移动端可读(15 个项目在手机端可顺畅浏览,不横向溢出)
- [ ] 6 类埋点可测(项目点击 + 项目兴趣点击带上项目名称、分类、售卖状态)
- [ ] SEO 可读(主要项目以 HTML 文本存在)

### 11.4 工程验收(扩展)

- [ ] `npx tsc --noEmit` 仅 pre-existing 错误(基线 9 + 4 window-film/stores = 13)
- [ ] `npx vitest run src/lib/xpeng-gx-products.test.ts` ≥ 25 tests pass
- [ ] `npm run build` exit 0,`/product/xpeng/gx` 为 `○ Static`
- [ ] `grep -rE ":\s*any\b" src/app/product/xpeng src/components/xpeng src/lib/xpeng-gx-products.ts` 0 命中
- [ ] JSON-LD ItemList count = 22
- [ ] `src/lib/product-routes.ts:54` status: live
- [ ] sitemap 注册 `/product/xpeng/gx`(monthly, priority 0.7)
- [ ] Playwright 三视口截图通过(390 / 768 / 1440)

---

## 12. 验证命令

```bash
# 阶段 B 单元测试
npx vitest run src/lib/xpeng-gx-products.test.ts

# 阶段 G 质量门禁
npm run lint 2>&1 | tee /tmp/lint.log | grep -E "src/app/product/xpeng|src/components/xpeng|src/lib/xpeng-gx-products|src/components/xpeng/XpengGxTopicBanner|src/app/product/page.tsx"
npm run typecheck
npm run build

# 阶段 F 内容验收
node scripts/verify-xpeng-gx-content.mjs

# 阶段 F 三视口截图
npm run dev &
sleep 30
BASE_URL=http://localhost:3000 npx playwright test e2e/xpeng-gx.spec.ts

# 合规红线全站检索
grep -rE "小鹏官方授权|原厂配件|官方同款|不影响原厂质保|100% ?无损安装|100%无损安装|永久质保|全网最低|性能提升|操控提升|制动提升" \
  src/app/product/xpeng src/components/xpeng src/lib/xpeng-gx-products.ts src/components/xpeng/XpengGxTopicBanner.tsx \
  && echo "FAIL: 合规红线触发" || echo "PASS: 合规红线全清"
```

---

## 13. 浏览器视口检查(PRD §18.3)

| 视口 | 设备 | 验收项 |
|---|---|---|
| **Mobile 390px** | iPhone 14 Pro | Hero ≤ 1.5 屏;15 项目单列;项目展开面板可滚动;6 场景单列;3 组合单列;8 FAQ 折叠;"预售"标签清晰 |
| **Tablet 768px** | iPad | 15 项目 2-3 列;6 场景 2-3 列;3 组合 3 列;7 步 3-4 列 |
| **Desktop 1440px** | MacBook | 15 项目 5 列;6 场景 3 列;3 组合 3 列;7 步 4 列;JSON-LD 全渲染 |

---

## 14. 复用与新增组件清单

### 14.1 复用(不动)

| 组件 | 路径 | 用途 |
|---|---|---|
| `Header` / `Footer` | `src/components/{Header,Footer}.tsx` | 全站壳 |
| `Badge` | `src/components/ui/badge.tsx` | 分类标签、售卖状态 |
| `CollapsibleSection` | `src/components/product/CollapsibleSection.tsx` | /product 折叠区 |
| `VehicleTopicMap` | `src/components/product/VehicleTopicMap.tsx` | /product 主入口渲染(不动) |
| `trackClick` | `src/lib/analytics.ts` | 埋点 |
| `getBrandRoute` / `getModelRoute` | `src/lib/product-routes.ts` | 路由元数据查询 |
| `lucide-react` 图标 | `ImageIcon` / `Car` / `ArrowRight` / `ChevronDown` / `AlertTriangle` | UI 图标 |

### 14.2 新增(按依赖顺序)

| # | 组件 | 类型 | 复用度 |
|---|---|---|---|
| 1 | `XpengGxTopicBanner` | RSC | /product 入口 |
| 2 | `XpengGxTopicHero` | RSC | /product/xpeng/gx 用 |
| 3 | `XpengGxProjectGrid` | Client(展开 + 埋点) | /product/xpeng/gx 用 |
| 4 | `XpengGxScenarioMatrix` | Client(点击滚动 + 埋点) | /product/xpeng/gx 用 |
| 5 | `XpengGxBundleList` | RSC | /product/xpeng/gx 用(**Tesla 没有**) |
| 6 | `XpengGxModelFitNote` | RSC | /product/xpeng/gx 用 |
| 7 | `XpengGxServiceFlow` | RSC | /product/xpeng/gx 用 |
| ~~8 | `XpengGxPosterStub` | RSC | /product/xpeng/gx 用~~ | **2026-06-26 已删除** |
| 8 | `XpengGxFaq` | Client(折叠) | /product/xpeng/gx 用 |
| 9 | `XpengGxTopicViewTrack` | Client(pageview 埋点) | /product/xpeng/gx 用 |

**总计**:9 个新组件(5 RSC + 4 Client;PosterStub 2026-06-26 移除)。

---

## 15. 团队分工(dispatch 推荐)

| Agent | 任务范围 | worktree 分支 |
|---|---|---|
| **Coder** | A.1-A.2 入口(WT-prep) | `worktree-xpeng-gx-prep` |
| **Coder** | B.1-B.2 数据层(WT-data) | `worktree-xpeng-gx-data` |
| **Webdesign RSC** | C.1 + C.4-C.7 | `worktree-xpeng-gx-ui` (part 1) |
| **Webdesign Client** | C.2 + C.3 + C.8 | `worktree-xpeng-gx-ui` (part 2) |
| **Webdesign Page** | D.1-D.3 + E.1-E.4 | `worktree-xpeng-gx-page` |
| **Coder 收尾 + Tester** | F.2-F.4 + G.1-G.3 + H.1 + H.2 | `worktree-xpeng-gx-final` |
| **Orchestrator** | merge + 主分支门禁 + push | 主分支 |

**依赖顺序**:Coder prep (✅) → Coder data → Webdesign UI × 2 → Webdesign Page → Tester → Orchestrator。

---

## 16. 与 Tesla 模式复用度对比

| 维度 | Tesla (2026-06-26) | Xpeng GX (2026-06-26) |
|---|---|---|
| 级别 | L1 单级 | **L2 单车型** |
| 项目数 | 42 (10+32) | **15** (按 SPEC §3.1) |
| 组件数 | 9 (8 + TopicBanner) | **10** (8 + TopicBanner + BundleList) |
| Worktree 数 | 5 | 5 (相同) |
| 步骤数 | 6 | **7** |
| FAQ 数 | 5 | **8** |
| 主题色 | red | **emerald** |
| 项目状态 | imageStatus 3 态 | **saleStatus 3 态 + imageStatus 3 态** |
| 预售项目 | 无 | **1 项(电动门)** |
| 推荐组合 | 无 | **3 个** |
| 埋点事件 | 4 类 | **5 类** (poster_expand_click 2026-06-26 移除) |
| 父品牌页 | 无 | 有(planned,不实现) |

✅ Xpeng GX 复用 Tesla 90% 代码模式,仅:
- 改为 L2 单车型(父 planned)
- 取消 PhoneCta,改可点击展开
- 增加 BundleList 组件(Tesla 没有)
- 增加 saleStatus 字段
- 增加 1 项预售(电动门)

---

## 17. 变更记录

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-25 | v0.1 | 基于 `XPENG_GX_TOPIC_PRD_2026-06-25.md`(v0.1)生成首版 SPEC(3679 字节,6 章节,占位状态) | architect agent |
| 2026-06-26 | v0.2 | **覆盖重写为 dispatch 友好版**(12 章节,新增 7-16 章节);融合 15 项用户决策;新增 runtime 断言 + worktree 拆分 + 风险清单 + 验收标准 + 视口检查 + 组件清单 + 团队分工 | prompt-boost + architect |
| 2026-06-26 | v0.2.1 | **移除海报展示模块**:`XpengGxPosterStub.tsx`(56 行 RSC)删除 + `page.tsx` import/JSX 移除;同步 SPEC §4/§5/§7/§8/§11/§13/§14/§16 章节标注"2026-06-26 已删除";用户决策 #8 推翻;**根因 = PRD 海报设计失误**。`sourceArea: "poster_project_matrix"` 字段保留(数据来源追溯标签,非 UI 引用)。详见 `docs/daily/2026-06-26/dispatch/11-xpeng-gx-poster-removed.md` | coder agent |
