# SPEC: 理想 MEGA 单车型专题

> **车型**: 理想 MEGA
> **品牌**: 理想 (`li-auto`)
> **对应 PRD**: [`LI_AUTO_MEGA_TOPIC_PRD_2026-06-27.md`](../../../../PRD/product/LI_AUTO_MEGA_TOPIC_PRD_2026-06-27.md) (v0.1)
> **页面类型**: 单车型轻改升级方案专题页
> **SPEC 版本**: v0.1 (dispatch 友好版)
> **实现状态**: ⬜ **未开始**
> **创建日期**: 2026-06-27
> **最后更新**: 2026-06-27

---

## 1. 职责范围

### 1.1 本 SPEC 包含

- 理想 MEGA 单车型专题页 `/product/li-auto/mega` 完整实现。
- 18 项热门轻改项目展示、5 大场景筛选、5 个推荐组合。
- 路由注册（含 legacy alias `/product/li-auto-mega`）。
- `/product` 产品中心入口 banner 添加。
- 图片状态管理（4 态：`matched / generated-preview / pending-review / missing`，当前全 `pending-review`）。
- 埋点事件：项目点击、场景切换、组合点击、pageview、CTA。

### 1.2 本 SPEC 不包含

- **不包含 CTA 模块**（用户明确排除）。
- 不创建「海报展示模块」（PRD §17 + §0 明确排除）。
- 不升级父品牌 `/product/li-auto` 状态（保持 `planned`）。
- 不实现在线报价、购物车、预约排期、支付。
- 不实现理想 i8、L9 或理想全系页面修改。
- 不实现独立项目详情页（一期用卡片展开面板）。
- 不引入新依赖。

### 1.3 Skill 路由

| Skill | 用途 |
|---|---|
| `next-best-practices` | page.tsx / metadata / RSC / routing |
| `react-best-practices` | Client Component 性能、useState 展开 |
| `frontend-ui-engineering` | UI 组件实现、响应式、Tailwind |
| `incremental-implementation` | 增量实现、每个切片验证 |

---

## 2. 路由与入口

| 路由 | 类型 | 状态 | 说明 |
|---|---|---|---|
| `/product` | page (RSC) | `live` | 产品中心入口 → 新增 `LiAutoMegaTopicBanner` |
| `/product/li-auto` | brand page | `planned` | 理想品牌总入口，保持不变 |
| `/product/li-auto/mega` | model page | ⬜ **本 SPEC 目标** | Canonical path |
| `/product/li-auto-mega` | legacy alias | ⬜ 需注册 | 301 → canonical |
| `/product/li-auto/l9` | model page | `live` | 本 SPEC 不涉及 |
| `/product/li-auto/i8` | model page | `planned` | 本 SPEC 不涉及 |

### 2.1 路由数据模型（`src/lib/product-routes.ts`）

**BRANDS li-auto 修改：** `modelSlugs: ["i8", "l9"]` → `modelSlugs: ["i8", "l9", "mega"]`

**MODELS 新增：**
```typescript
{
  type: "vehicle_model",
  brandSlug: "li-auto",
  modelSlug: "mega",
  modelName: "理想 MEGA",
  parentPath: "/product/li-auto",
  canonicalPath: "/product/li-auto/mega",
  title: "理想 MEGA 专属升级方案",
  navLabel: "MEGA",
  status: "planned",             // → 验收通过后翻 "live"
  priority: "P1",
  projectCount: 18,
  sourcePrd: "docs/PRD/product/LI_AUTO_MEGA_TOPIC_PRD_2026-06-27.md",
  legacyPaths: ["/product/li-auto-mega"],
} as const
```

### 2.2 产品中心入口（`/product`）

理想 MEGA TopicBanner 文案（amber 主题）：

| 字段 | 文案 |
|---|---|
| 标题 | 理想 MEGA 专属升级方案 |
| 副标题 | 新车保护、商务座舱、外观个性与行车防护 |
| 标签 | 理想 MEGA / 单车型方案 / 家庭商务 MPV 轻改 |
| 链接 | `/product/li-auto/mega` |

---

## 3. 数据模型

### 3.1 字面量类型

```typescript
type Width = 1448;
type Height = 1086;
type AspectRatio = "4/3";
type ProjectCount = 18;
type ScenarioCount = 5;
type BundleCount = 5;
type ServiceStepCount = 7;
```

### 3.2 项目数据类型

```typescript
type LiAutoMegaCategory =
  | "protection"           // 新车保护 — 漆面/车衣
  | "film"                 // 玻璃膜/隔热膜
  | "appearance"           // 外观个性 — 彩绘/改色/包围/尾翼/轮毂/卡钳
  | "business_cabin"       // 商务座舱 — 铝地板/迎宾踏板/小桌板
  | "cabin_protection"     // 座舱保护 — 360 软包脚垫
  | "chassis"              // 底盘 — 平衡杆/护板
  | "driving_protection"   // 行车防护 — 防虫网
  | "lighting"             // 灯光视觉 — 大灯升级
  | "interior_care";       // 内饰养护 — 内饰镀膜

type LiAutoMegaImageStatus =
  | "matched"              // 已匹配真实项目图
  | "generated-preview"    // AI 预览图 + 角标
  | "pending-review"       // 占位 + 「图片审核中」
  | "missing";             // 无可展示图片

type LiAutoMegaScenarioKey =
  | "new_car_protection"
  | "business_cabin"
  | "appearance"
  | "driving_protection"
  | "lighting_detail";

type LiAutoMegaUpgradeProject = {
  order: number;
  key: string;                          // kebab-case
  name: string;                         // 中文名
  category: LiAutoMegaCategory;
  summary: string;                      // 1 句话价值说明
  publicPath?: `/images/products/li-auto/mega/${string}.png`;
  width?: 1448;
  height?: 1086;
  aspectRatio?: "4/3";
  imageStatus: LiAutoMegaImageStatus;
  suitableFor: readonly LiAutoMegaScenarioKey[];
  caution?: string;                     // 注意事项/到店确认提示
};

type LiAutoMegaScenario = {
  key: LiAutoMegaScenarioKey;
  name: string;
  description: string;
  projectKeys: readonly string[];
};

type LiAutoMegaBundle = {
  key: string;
  name: string;
  description: string;
  projectKeys: readonly string[];
};

type LiAutoMegaServiceStep = {
  step: number;                         // 1-7
  title: string;
  description: string;
};

type LiAutoMegaFaqItem = {
  question: string;
  answer: string;
};
```

### 3.3 导出常量

```typescript
export const LI_AUTO_MEGA_PROJECT_COUNT = 18;
export const LI_AUTO_MEGA_SCENARIO_COUNT = 5;
export const LI_AUTO_MEGA_BUNDLE_COUNT = 5;
export const LI_AUTO_MEGA_SERVICE_STEP_COUNT = 7;
export const LI_AUTO_MEGA_FAQ_COUNT = 9;

export const liAutoMegaUpgradeProjects: readonly LiAutoMegaUpgradeProject[];
export const liAutoMegaScenarios: readonly LiAutoMegaScenario[];
export const liAutoMegaBundles: readonly LiAutoMegaBundle[];
export const liAutoMegaServiceSteps: readonly LiAutoMegaServiceStep[];
export const liAutoMegaFaq: readonly LiAutoMegaFaqItem[];

export const CATEGORY_LABELS: Readonly<Record<LiAutoMegaCategory, string>>;
```

### 3.4 Runtime 断言（开发期触发）

```typescript
function assertLiAutoMegaDataShape(): void {
  // 每个数组 length 断言
  // key 唯一性检查（projects / scenarios / bundles 不冲突）
  // order 单调递增 1-18
  // service steps 连续 1-7
  // scenario.projectKeys 引用存在的 project key
  // bundle.projectKeys 引用存在的 project key
  // 每个 project 至少被一个 scenario 引用
  // 所有 category 都有中文标签
}
assertLiAutoMegaDataShape();
```

---

## 4. 18 项项目数据（PRD §7）

| 序号 | key | 项目名 | 分类 | 摘要 | 场景归属 | 图片状态 | 注意事项 |
|---:|---|---|---|---|---|---|---|
| 01 | `paint-protection-film` | 车衣 | `protection` | 大车身漆面保护、日常划痕防护 | new_car_protection | pending-review | — |
| 02 | `window-film` | 隔热膜 | `film` | 大面积玻璃隔热、防晒、隐私与驾乘舒适 | new_car_protection | pending-review | — |
| 03 | `graphic-wrap` | 彩绘 | `appearance` | 主题化车身视觉，适合个性表达 | appearance | pending-review | — |
| 04 | `two-tone-color-wrap` | 双拼改色 | `appearance` | 强化车身层次感和 MEGA 侧面辨识度 | appearance | pending-review | — |
| 05 | `aluminum-floor` | 铝地板 | `business_cabin` | 二三排和尾箱易清洁，提升耐用与质感 | business_cabin | pending-review | — |
| 06 | `stabilizer-bar` | 平衡杆 | `chassis` | 需到店评估安装位，不做性能承诺 | driving_protection | pending-review | 平衡杆安装需到店确认车身接口和安装位 |
| 07 | `floor-mats-360` | 360 软包脚垫 | `cabin_protection` | 全包围脚垫、易清洁、保护原车地毯 | new_car_protection, business_cabin | pending-review | — |
| 08 | `underbody-skid-plate` | 底盘护板 | `chassis` | 加强底部关键区域防护，适合新车基础防护 | new_car_protection, driving_protection | pending-review | — |
| 09 | `sport-body-kit` | 包围 | `appearance` | 提升前后杠、侧裙等区域的视觉完整度 | appearance | pending-review | — |
| 10 | `bug-screen` | 防虫网 | `driving_protection` | 减少虫石杂物进入前部格栅或进风区域 | driving_protection | pending-review | — |
| 11 | `rear-wing` | 尾翼 | `appearance` | 车尾视觉装饰，强化尾部层次 | appearance, lighting_detail | pending-review | — |
| 12 | `soft-close-doors` | 主副驾电吸门 | `business_cabin` | 前排关门便利与高级感，需确认接口和门体结构 | business_cabin | pending-review | 主副驾电吸门需到店确认接口和门体结构 |
| 13 | `brake-caliper` | 刹车卡钳 | `appearance` | 轮毂区域视觉点缀，不做制动性能承诺 | appearance, lighting_detail | pending-review | 刹车卡钳为外观视觉升级，不做制动性能提升承诺 |
| 14 | `welcome-step` | 迎宾踏板 | `business_cabin` | 上下车高频区域防护与迎宾质感 | business_cabin, lighting_detail | pending-review | — |
| 15 | `rear-table-tray` | 小桌板 | `business_cabin` | 二排办公、用餐、儿童使用和长途出行便利 | business_cabin | pending-review | — |
| 16 | `headlight-upgrade` | 大灯 | `lighting` | 灯组外观与视觉升级，需合规确认 | lighting_detail | pending-review | 大灯项目只涉及视觉方向，需确认合规边界和年检适配 |
| 17 | `wheel-rims` | 轮毂 | `appearance` | 改变侧面姿态和整车视觉风格 | appearance | pending-review | — |
| 18 | `interior-coating` | 内饰镀膜 | `interior_care` | 皮革、饰板和高频触碰区域防污易清洁 | new_car_protection, business_cabin | pending-review | — |

### 4.1 场景到项目映射（PRD §8）

| 场景 key | 场景名 | 包含项目 keys | 项目数 |
|---|---|---|---|
| `new_car_protection` | 新车基础保护 | paint-protection-film, window-film, floor-mats-360, underbody-skid-plate, interior-coating | 5 |
| `business_cabin` | 商务座舱与便利 | aluminum-floor, welcome-step, rear-table-tray, soft-close-doors, floor-mats-360, interior-coating | 6 |
| `appearance` | 外观个性升级 | graphic-wrap, two-tone-color-wrap, sport-body-kit, rear-wing, wheel-rims, brake-caliper | 6 |
| `driving_protection` | 行车与底盘防护 | underbody-skid-plate, stabilizer-bar, bug-screen | 3 |
| `lighting_detail` | 灯光与细节视觉 | headlight-upgrade, brake-caliper, welcome-step, rear-wing | 4 |

### 4.2 推荐组合（PRD §9）

| 组合 key | 组合名 | 包含项目 keys |
|---|---|---|
| `new-car-protection` | 新车基础保护组合 | paint-protection-film, window-film, floor-mats-360, underbody-skid-plate, interior-coating |
| `business-cabin` | 商务座舱与上下车便利组合 | aluminum-floor, welcome-step, rear-table-tray, soft-close-doors, interior-coating |
| `appearance` | 外观个性升级组合 | graphic-wrap, two-tone-color-wrap, sport-body-kit, rear-wing, wheel-rims, brake-caliper |
| `driving-protection` | 行车与底盘防护组合 | underbody-skid-plate, stabilizer-bar, bug-screen |
| `lighting-detail` | 灯光与细节视觉组合 | headlight-upgrade, welcome-step, rear-wing, brake-caliper |

### 4.3 7 步服务流程

| step | title | description |
|---|---|---|
| 1 | 车型确认 | 确认理想 MEGA 具体年款和配置版本 |
| 2 | 项目选择 | 根据需求和预算选定轻改项目 |
| 3 | 到店评估 | 到店实车测量安装位和接口 |
| 4 | 方案确认 | 确认施工方案、工期和费用明细 |
| 5 | 施工安装 | 按标准化流程进行施工 |
| 6 | 验收交付 | 逐项验收并讲解使用和保养注意事项 |
| 7 | 售后支持 | 提供后续使用咨询和维护指导 |

### 4.4 FAQ（9 条）

| # | 问题 | 回答要点 |
|---|---|---|
| 1 | 理想 MEGA 能做哪些轻改项目？ | 18 项热门项目覆盖车衣、隔热膜、彩绘、双拼改色、铝地板、平衡杆、360 软包脚垫、底盘护板、包围、防虫网、尾翼、主副驾电吸门、刹车卡钳、迎宾踏板、小桌板、大灯、轮毂、内饰镀膜 |
| 2 | 刚提车优先做哪些项目？ | 新车基础保护组合推荐：车衣 + 隔热膜 + 360 软包脚垫 + 底盘护板 + 内饰镀膜 |
| 3 | 商务接待推荐哪些项目？ | 铝地板（二三排易清洁）、迎宾踏板（上下车防护）、小桌板（二排办公/用餐）、主副驾电吸门（关门便利）、内饰镀膜（高频触碰区域防污） |
| 4 | 外观个性项目有哪些选择？ | 彩绘、双拼改色、包围、尾翼、轮毂、刹车卡钳，可按需单项选择 |
| 5 | 大灯项目合法吗？ | 大灯项目只涉及灯组外观视觉方向，需到店确认合规边界和年检适配，不做照明性能提升承诺 |
| 6 | 主副驾电吸门能装吗？ | 电吸门安装需到店确认接口、门体结构和售后边界，不做无损或质保承诺 |
| 7 | 项目可以单项做吗？ | 所有项目均支持单项选择，不强制套餐组合 |
| 8 | 施工周期多久？ | 单项施工 1-2 天，组合项目根据工程量 2-5 天，到店评估时确认准确工期 |
| 9 | 质保和售后怎么处理？ | 按项目提供对应质保，具体以到店施工合同条款为准，蓝辉轻改提供后续使用咨询和维护指导 |

---

## 5. 字段约定

| 字段 | 约定 | 备注 |
|---|---|---|
| 车型名 | `理想 MEGA` | — |
| 品牌 slug | `li-auto` | — |
| 型号 slug | `mega` | — |
| 页面 title | `理想 MEGA 轻改升级方案｜车衣隔热膜铝地板电吸门小桌板｜蓝辉轻改` | PRD §13 |
| 页面 description | `蓝辉轻改整理理想 MEGA 专属升级方案参考，覆盖车衣、隔热膜、彩绘...18 项项目` | PRD §13 |
| H1 | `理想 MEGA 专属升级方案` | — |
| 主题色 | `amber-400` (#fbbf24) | 继承 li-auto brand |
| 面包屑 | `产品中心 / 理想 / MEGA` | — |
| JSON-LD | `CollectionPage` + `ItemList` (`numberOfItems: 18`) | — |
| 项目 key 前缀 | 无前缀，直接 kebab-case | e.g. `paint-protection-film` |
| 数据文件 | `src/lib/li-auto-mega-products.ts` | 独立文件，不与 i8/L9 混写 |
| 组件目录 | `src/components/li-auto/` | — |
| 图片目录 | `public/images/products/li-auto/mega/` | — |

---

## 6. 页面信息架构

```
理想 MEGA 单车型专题页 `/product/li-auto/mega`
├── LiAutoMegaTopicViewTrack         — pageview 埋点 (CC)
├── LiAutoMegaHero                   — Hero 区 (RSC)
│   ├── 主标题 / 副标题 / 18 项数量
│   ├── 5 个场景锚点（滚动到对应 section）
│   └── 主 CTA "咨询 MEGA 升级方案"
├── LiAutoMegaProjectGrid            — 18 项项目网格 (CC)
│   ├── 场景 tab 筛选（全部 / 5 场景）
│   ├── 18 张卡片（4/3 图 + 序号 + 名称 + 分类 + 价值 + 状态角标）
│   ├── 点击展开面板（适合人群 + 注意事项）
│   └── 埋点：project_click / scenario_filter
├── LiAutoMegaBundles                — 5 个推荐组合 (RSC)
│   ├── 组合卡片 + 项目列表
│   └── CTA "咨询此组合"
├── LiAutoMegaServiceFlow            — 7 步服务流程 (RSC)
├── LiAutoMegaFaq                    — FAQ 折叠面板 (CC)
├── 返回理想系列链接（无 CTA 模块，用户明确排除）
└── JSON-LD script（ItemList 18 items）
```

---

## 7. 关键组件

| 组件 | 文件 | 类型 | 职责 |
|---|---|---|---|
| `LiAutoMegaTopicViewTrack` | `src/components/li-auto/LiAutoMegaTopicViewTrack.tsx` | CC | `product_topic_view` 埋点 |
| `LiAutoMegaHero` | `src/components/li-auto/LiAutoMegaHero.tsx` | RSC | Hero 区 + 场景锚点 + CTA |
| `LiAutoMegaProjectGrid` | `src/components/li-auto/LiAutoMegaProjectGrid.tsx` | CC | 18 卡片 + 场景 tab + 展开面板 + 埋点 |
| `LiAutoMegaBundles` | `src/components/li-auto/LiAutoMegaBundles.tsx` | RSC | 5 组合卡片 |
| `LiAutoMegaServiceFlow` | `src/components/li-auto/LiAutoMegaServiceFlow.tsx` | RSC | 7 步流程 |
| `LiAutoMegaFaq` | `src/components/li-auto/LiAutoMegaFaq.tsx` | CC | FAQ 折叠面板 |
| `LiAutoMegaTopicBanner` | `src/components/li-auto/LiAutoMegaTopicBanner.tsx` | RSC | `/product` 入口 banner |

---

## 8. 图片状态规则

| 状态 | 页面表现 | 当前使用 |
|---|---|---|
| `matched` | 展示真实项目图 | 0 项 |
| `generated-preview` | 展示 AI 预览图 + 「预览图」角标 | 0 项 |
| `pending-review` | 展示占位图 + 「图片审核中」标签 | **18 项（当前全部）** |
| `missing` | 展示统一占位卡片 | 0 项 |

**图片规格**：1448 × 1086, 4/3 比例。所有图片容器 `aspect-[4/3] + object-contain + Next/Image sizes`。

---

## 9. 埋点事件（PRD §14）

| 事件 | 触发时机 | 关键参数 |
|---|---|---|
| `product_topic_view` | 进入 `/product/li-auto/mega` | `topic: li-auto-mega`, `brandSlug: li-auto`, `modelSlug: mega` |
| `li_auto_mega_scenario_filter` | 切换场景筛选 tab | `scenarioKey` |
| `li_auto_mega_project_click` | 点击项目卡片 | `projectKey`, `projectName`, `category`, `scenarioKey`, `imageStatus` |
| `li_auto_mega_bundle_click` | 点击推荐组合 | `bundleName`, `bundleKey` |
| `consult_cta_click` | 点击咨询 CTA | `topic: li-auto-mega`, `entry: hero/bundle` |

---

## 10. 实施状态

| 维度 | 状态 | 备注 |
|---|---|---|
| 路由注册 | ⬜ 未注册 | `product-routes.ts` BRANDS modelSlugs + MODELS 新增 |
| Legacy Redirect | ⬜ 未注册 | `legacyPaths: ["/product/li-auto-mega"]` |
| 父品牌页 | ⚪ `planned` | 保持不变 |
| 模型子目录 | ⬜ 无 | `src/app/product/li-auto/mega/page.tsx` 不存在 |
| 数据源 | ⬜ 无 | `li-auto-mega-products.ts` 不存在 |
| 7 组件 | ⬜ 无 | 6 核心 + 1 banner |
| 图资源 | ⬜ 无 | 18 张图全 `pending-review`（占位处理） |
| `/product` 入口 | ⬜ 无 | 需加 `LiAutoMegaTopicBanner` |

---

## 11. 合规边界（PRD §3.3）

### 11.1 车型适配声明（强制）

> 不同年份、批次、版本和配置的理想 MEGA 在尺寸、接口、安装位和结构上可能存在差异。页面项目只作为轻改方向参考，最终以到店确认和施工评估为准。

### 11.2 合规红线（不得命中）

- ❌ 理想官方授权
- ❌ 理想原厂配件
- ❌ 官方同款
- ❌ 不影响原车质保
- ❌ 100% 无损安装
- ❌ 永久质保
- ❌ 全网最低
- ❌ 性能提升、操控提升、制动提升、照明提升等不可验证承诺
- ❌ 暗示与理想汽车存在品牌合作关系

### 11.3 特别关注项目（PRD §18）

- **soft-close-doors**（主副驾电吸门）: 必须到店评估，不写无损或质保承诺
- **headlight-upgrade**（大灯）: 只写视觉方向，必须增加合规确认提示
- **stabilizer-bar**（平衡杆）: 只写视觉和保护说明，不写性能结果
- **brake-caliper**（刹车卡钳）: 只做外观视觉，不做制动性能承诺

---

## 12. 验收标准（与 PRD §19 三棱镜对齐）

### 12.1 内容验收

- [ ] 18 项项目与 PRD §7 表格完全一致，顺序 01-18
- [ ] 5 个场景分类正确（PRD §8）
- [ ] 5 个推荐组合正确（PRD §9）
- [ ] 合规 10 项红线 0 命中
- [ ] 适配声明一字不差出现
- [ ] 电吸门/大灯/平衡杆/卡钳合规文案正确

### 12.2 数据验收

- [ ] `LI_AUTO_MEGA_PROJECT_COUNT === 18`
- [ ] 路由注册：`product-routes.test.ts` 通过
- [ ] 所有项目 `imageStatus` 正确（当前全 `pending-review`）
- [ ] JSON-LD `ItemList.numberOfItems === 18`

### 12.3 交互验收

- [ ] 场景 tab 切换筛选正常
- [ ] 项目卡片点击展开/收起正常
- [ ] CTA 点击跳转正确

### 12.4 响应式验收

- [ ] Mobile 390px：单列，无横向溢出
- [ ] Tablet 768px：2 列，布局稳定
- [ ] Desktop 1440px：4 列，接近 ES8 视觉节奏

### 12.5 工程验收

- [ ] `npx tsc --noEmit` 仅 pre-existing 错误（新业务代码 0 错误）
- [ ] `npm run build` 通过，`/product/li-auto/mega` 为 `○ Static`
- [ ] 无 `any` 类型（grep 验证）
- [ ] 埋点事件可通过 console 验证

---

## 13. 验证命令

```bash
# 单元测试
npx vitest run src/lib/product-routes.test.ts
npx vitest run src/lib/li-auto-mega-products.test.ts

# 质量门禁
npm run lint
npm run typecheck
npm run build

# 合规红线
grep -rE "理想官方授权|原厂配件|官方同款|不影响原车质保|100% ?无损安装|永久质保|全网最低|性能提升|操控提升|制动提升|照明提升|理想汽车合作" \
  src/app/product/li-auto/mega src/components/li-auto src/lib/li-auto-mega-products.ts \
  && echo "FAIL" || echo "PASS"
```

---

## 14. 浏览器视口检查

| 视口 | 设备 | 验收项 |
|---|---|---|
| Mobile 390px | iPhone 14 Pro | Hero ≤ 1.5 屏；18 项目单列；5 场景 tab 可横向滚动；展开面板可读 |
| Tablet 768px | iPad | 18 项目 2 列；5 场景 tab 正常；5 组合 2 列 |
| Desktop 1440px | MacBook | 18 项目 4 列；5 场景 tab 正常；5 组合 3-4 列；JSON-LD 全量渲染 |

---

## 15. 任务列表（按依赖顺序）

### 阶段 A：路由注册 + 产品中心入口（4 task）

- **A.1**: 修改 `src/lib/product-routes.ts`（BRANDS li-auto modelSlugs: `["i8", "l9", "mega"]` + MODELS 新增 li-auto/mega 条目）
- **A.2**: 修改 `src/lib/product-routes.test.ts`（更新计数 expectations）
- **A.3**: 新建 `src/components/li-auto/LiAutoMegaTopicBanner.tsx`（RSC, amber 主题）
- **A.4**: 修改 `src/app/product/page.tsx`（import `LiAutoMegaTopicBanner` + 加入 banner 区域）

### 阶段 B：数据层（2 task）

- **B.1**: 新建 `src/lib/li-auto-mega-products.ts`（18 项目 + 5 场景 + 5 组合 + 7 步 + 9 FAQ + 字面量 + runtime 断言）
- **B.2**: 新建 `src/lib/li-auto-mega-products.test.ts`（单元测试）

### 阶段 C：UI 组件层（6 task）

- **C.1**: `LiAutoMegaHero.tsx` — RSC, amber 主题
- **C.2**: `LiAutoMegaProjectGrid.tsx` — CC, 18 卡片 + tab 筛选 + 展开 + 埋点
- **C.3**: `LiAutoMegaBundles.tsx` — RSC, 5 组合
- **C.4**: `LiAutoMegaServiceFlow.tsx` — RSC, 7 步流程
- **C.5**: `LiAutoMegaFaq.tsx` — CC, 折叠面板
- **C.6**: `LiAutoMegaTopicViewTrack.tsx` — CC, pageview 埋点

### 阶段 D：页面组装（1 task）

- **D.1**: 新建 `src/app/product/li-auto/mega/page.tsx`（组装 Hero + ProjectGrid + Bundles + ServiceFlow + Faq + JSON-LD，**不包含 CTA 模块**）

### 阶段 E：测试 + 验证（3 task）

- **E.1**: 合规红线 grep 检查（含电吸门/大灯/卡钳/平衡杆专项）
- **E.2**: `npm run build` + `npx tsc --noEmit`
- **E.3**: 三视口浏览器检查

### 阶段 F：收尾（2 task）

- **F.1**: 状态翻转 — `product-routes.ts` li-auto/mega `status: "planned"` → `"live"`
- **F.2**: Worktree merge + 主分支门禁

---

## 16. 风险清单与缓解

| 风险 | 触发条件 | 影响 | 缓解 |
|---|---|---|---|
| 图片素材缺失 | 18 项全 pending-review | 页面视觉寡淡 | 卡片不依赖图片展示，名称 + 摘要 + 分类始终可读 |
| 合规文案漂移 | 组件或数据文件误写承诺 | 合规事故 | 构建前 grep 验证 10 关键词 + 4 项目专项 |
| 场景 key 不匹配 | data file scenarioKey 与 PRD 定义不同 | 筛选失效 | runtime 断言 + 单元测试覆盖 |
| 字面量类型被绕过 | 数据文件用 `as LiAutoMegaUpgradeProject[]` 绕过 | 数量漂移 | runtime check + 单元测试 |
| legacy alias 遗忘 | MODELS 漏配 legacyPaths | 旧 URL 404 | product-routes.test.ts 计数验证 |
| /product 入口 banner 漏添 | page.tsx 未 import | 用户无法从产品中心进入 | A.4 显式 task 清单 |
| 电吸门/大灯合规文案 | caution 字段漏写 | 合规事故 | 数据文件每个 caution 字段 double-check |
| 无 CTA 模块被遗忘 | 误加了 CTA section | 与用户要求不符 | D.1 page.tsx 不包含 CTA section |
| Worktree 缺 .env | dispatch 后 dev server 起不来 | 阻断浏览器检查 | 分支创建后 `cp .env .env` |

---

## 17. 变更记录

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-27 | v0.1 | 基于 `LI_AUTO_MEGA_TOPIC_PRD_2026-06-27.md` 创建 dispatch 友好版 SPEC | prompt-boost |

---

> 最后更新: 2026-06-27
