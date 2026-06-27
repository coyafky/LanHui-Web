# SPEC: 理想 L9 单车型专题

> **车型**: 理想 L9
> **品牌**: 理想 (`li-auto`)
> **对应 PRD**: [`LI_AUTO_L9_TOPIC_PRD_2026-06-27.md`](../../../../PRD/product/LI_AUTO_L9_TOPIC_PRD_2026-06-27.md) (v0.1)
> **页面类型**: 单车型轻改升级方案专题页
> **SPEC 版本**: v0.1 (dispatch 友好版)
> **实现状态**: ⬜ **未开始**
> **创建日期**: 2026-06-27
> **最后更新**: 2026-06-27

---

## 1. 职责范围

### 1.1 本 SPEC 包含

- 理想 L9 单车型专题页 `/product/li-auto/l9` 完整实现。
- 14 项热门轻改项目展示、5 大场景筛选、4 个推荐组合。
- 路由注册（含 legacy alias `/product/li-auto-l9`）。
- `/product` 产品中心入口 banner 添加。
- 图片状态管理（4 态：`matched / generated-preview / pending-review / missing`，当前全 `pending-review`）。
- 埋点事件：项目点击、场景切换、组合点击、pageview、CTA。

### 1.2 本 SPEC 不包含

- 不创建「海报展示模块」（PRD §17 + §0 明确排除）。
- 不升级父品牌 `/product/li-auto` 状态（保持 `planned`）。
- 不实现在线报价、购物车、预约排期、支付。
- 不实现理想 i8 或理想全系页面修改。
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
| `/product` | page (RSC) | `live` | 产品中心入口 → 新增 `LiAutoL9TopicBanner` |
| `/product/li-auto` | brand page | `planned` | 理想品牌总入口，保持不变 |
| `/product/li-auto/l9` | model page | ⬜ **本 PRD 目标** | Canonical path |
| `/product/li-auto-l9` | legacy alias | ⬜ 需注册 | 301 → canonical |
| `/product/li-auto/i8` | model page | `planned` | 本 SPEC 不涉及 |

### 2.1 路由数据模型（`src/lib/product-routes.ts`）

**BRANDS li-auto 修改：** `modelSlugs: ["i8"]` → `modelSlugs: ["i8", "l9"]`

**MODELS 新增：**
```typescript
{
  type: "vehicle_model",
  brandSlug: "li-auto",
  modelSlug: "l9",
  modelName: "理想 L9",
  parentPath: "/product/li-auto",
  canonicalPath: "/product/li-auto/l9",
  title: "理想 L9 专属升级方案",
  navLabel: "L9",
  status: "planned",             // → 验收通过后翻 "live"
  priority: "P1",
  projectCount: 14,
  sourcePrd: "docs/PRD/product/LI_AUTO_L9_TOPIC_PRD_2026-06-27.md",
  legacyPaths: ["/product/li-auto-l9"],
} as const
```

### 2.2 产品中心入口（`/product`）

理想 L9 TopicBanner 文案（amber 主题）：

| 字段 | 文案 |
|---|---|
| 标题 | 理想 L9 专属升级方案 |
| 副标题 | 新车保护、家庭座舱、外观个性与行车防护 |
| 标签 | 理想 L9 / 单车型方案 / 家庭大型 SUV 轻改 |
| 链接 | `/product/li-auto/l9` |

---

## 3. 数据模型

### 3.1 字面量类型

```typescript
type Width = 1448;
type Height = 1086;
type AspectRatio = "4/3";
type ProjectCount = 14;
type ScenarioCount = 5;
type BundleCount = 4;
type ServiceStepCount = 7;
```

### 3.2 项目数据类型

```typescript
type LiAutoL9Category =
  | "protection"           // 新车保护 — 漆面/隐形车衣
  | "film"                 // 玻璃膜/隔热膜
  | "appearance"           // 外观个性 — 彩绘改色/轮毂/牌照框
  | "family_cabin"         // 家庭座舱 — 电动踏板/脚垫/铝地板
  | "chassis"              // 底盘 — 平衡杆/护板
  | "driving_protection"   // 行车防护 — 防虫网/挡泥板
  | "screen_care"          // 屏幕保护 — 中控钢化膜/HUD 罩
  | "detail_care";         // 细节装饰 — 牌照框

type LiAutoL9ImageStatus =
  | "matched"              // 已匹配真实项目图
  | "generated-preview"    // AI 预览图 + 角标
  | "pending-review"       // 占位 + 「图片审核中」
  | "missing";             // 无可展示图片

type LiAutoL9ScenarioKey =
  | "new_car_protection"
  | "family_cabin"
  | "appearance"
  | "driving_protection"
  | "screen_detail";

type LiAutoL9UpgradeProject = {
  order: number;
  key: string;                          // kebab-case，e.g. "paint-protection-film"
  name: string;                         // 中文名
  category: LiAutoL9Category;
  summary: string;                      // 1 句话价值说明
  publicPath?: `/images/products/li-auto/l9/${string}.png`;
  width?: 1448;
  height?: 1086;
  aspectRatio?: "4/3";
  imageStatus: LiAutoL9ImageStatus;
  suitableFor: readonly LiAutoL9ScenarioKey[];
  caution?: string;                     // 注意事项/到店确认提示
};

type LiAutoL9Scenario = {
  key: LiAutoL9ScenarioKey;
  name: string;
  description: string;
  projectKeys: readonly string[];       // 引用的 project.key
};

type LiAutoL9Bundle = {
  key: string;
  name: string;
  description: string;
  projectKeys: readonly string[];
};

type LiAutoL9ServiceStep = {
  step: number;                         // 1-7
  title: string;
  description: string;
};

type LiAutoL9FaqItem = {
  question: string;
  answer: string;
};
```

### 3.3 导出常量

```typescript
export const LI_AUTO_L9_PROJECT_COUNT = 14;
export const LI_AUTO_L9_SCENARIO_COUNT = 5;
export const LI_AUTO_L9_BUNDLE_COUNT = 4;
export const LI_AUTO_L9_SERVICE_STEP_COUNT = 7;
export const LI_AUTO_L9_FAQ_COUNT = 9;

export const liAutoL9UpgradeProjects: readonly LiAutoL9UpgradeProject[];
export const liAutoL9Scenarios: readonly LiAutoL9Scenario[];
export const liAutoL9Bundles: readonly LiAutoL9Bundle[];
export const liAutoL9ServiceSteps: readonly LiAutoL9ServiceStep[];
export const liAutoL9Faq: readonly LiAutoL9FaqItem[];

export const LI_AUTO_L9_CATEGORY_LABELS: Readonly<Record<LiAutoL9Category, string>>;
```

### 3.4 Runtime 断言（开发期触发）

```typescript
function assertLiAutoL9DataShape(): void {
  // 每个数组 length 断言
  // key 唯一性检查（projects / scenarios / bundles 不冲突）
  // order 单调递增 1-14
  // service steps 连续 1-7
  // scenario.projectKeys 引用存在的 project key
  // bundle.projectKeys 引用存在的 project key
  // 每个 project 至少被一个 scenario 引用
  // 所有 category 都有中文标签
}
assertLiAutoL9DataShape();
```

---

## 4. 14 项项目数据（PRD §7）

| 序号 | key | 项目名 | 分类 | 摘要 | 场景归属 | 图片状态 |
|---:|---|---|---|---|---|---|
| 01 | `paint-protection-film` | 隐形车衣 | `protection` | 漆面保护、日常划痕防护、保持车身质感 | new_car_protection | pending-review |
| 02 | `window-film` | 隔热窗膜 | `film` | 隔热、防晒、隐私与驾乘舒适 | new_car_protection | pending-review |
| 03 | `color-wrap` | 彩绘改色 | `appearance` | 个性化车身视觉、主题改色与辨识度 | appearance | pending-review |
| 04 | `electric-steps` | 电动踏板 | `family_cabin` | 适合老人、小孩和家庭高频上下车场景 | family_cabin | pending-review |
| 05 | `floor-mats-360` | 360 航空脚垫 | `family_cabin` | 全包围脚垫、易清洁、保护地毯 | new_car_protection, family_cabin | pending-review |
| 06 | `aluminum-floor` | 铝合金地板 | `family_cabin` | 后排和尾箱易清洁，提升耐用与质感 | family_cabin | pending-review |
| 07 | `stabilizer-bar` | 平衡杆 | `chassis` | 需到店评估安装位，不做性能承诺 | driving_protection | pending-review |
| 08 | `underbody-skid-plate` | 底盘护板 | `chassis` | 加强底部关键区域防护，适合新车基础防护 | new_car_protection, driving_protection | pending-review |
| 09 | `sport-wheels` | 运动轮毂 | `appearance` | 改变侧面姿态和整车视觉风格 | appearance | pending-review |
| 10 | `bug-screen` | 防虫网 | `driving_protection` | 减少虫石杂物进入前部格栅区域 | driving_protection | pending-review |
| 11 | `screen-protector` | 中控钢化膜 | `screen_care` | 中控屏幕防刮保护，降低高频触控磨损 | new_car_protection, screen_detail | pending-review |
| 12 | `hud-cover` | HUD 显示罩 | `screen_care` | 保护 HUD 显示相关区域，需确认具体安装位 | family_cabin, screen_detail | pending-review |
| 13 | `license-plate-frame` | 牌照框 | `detail_care` | 车头车尾细节装饰和牌照区域保护 | appearance, screen_detail | pending-review |
| 14 | `mud-flap` | 挡泥板 | `driving_protection` | 减少泥水飞溅和车身侧面污染 | driving_protection | pending-review |

### 4.1 场景到项目映射（PRD §8）

| 场景 key | 场景名 | 包含项目 keys | 项目数 |
|---|---|---|---|
| `new_car_protection` | 新车基础保护 | paint-protection-film, window-film, floor-mats-360, underbody-skid-plate, screen-protector | 5 |
| `family_cabin` | 家庭座舱与便利 | electric-steps, floor-mats-360, aluminum-floor, hud-cover | 4 |
| `appearance` | 外观个性升级 | color-wrap, sport-wheels, license-plate-frame | 3 |
| `driving_protection` | 行车与日常防护 | underbody-skid-plate, stabilizer-bar, bug-screen, mud-flap | 4 |
| `screen_detail` | 屏幕与细节保护 | screen-protector, hud-cover, license-plate-frame | 3 |

### 4.2 推荐组合（PRD §9）

| 组合 key | 组合名 | 包含项目 keys |
|---|---|---|
| `new-car-protection` | 新车基础保护组合 | paint-protection-film, window-film, floor-mats-360, underbody-skid-plate, screen-protector |
| `family-cabin` | 家庭座舱与上下车便利组合 | electric-steps, floor-mats-360, aluminum-floor, hud-cover |
| `appearance` | 外观个性升级组合 | color-wrap, sport-wheels, license-plate-frame |
| `driving-protection` | 行车与日常防护组合 | underbody-skid-plate, stabilizer-bar, bug-screen, mud-flap |

### 4.3 7 步服务流程

| step | title | description |
|---|---|---|
| 1 | 车型确认 | 确认理想 L9 具体年款和配置版本 |
| 2 | 项目选择 | 根据需求和预算选定轻改项目 |
| 3 | 到店评估 | 到店实车测量安装位和接口 |
| 4 | 方案确认 | 确认施工方案、工期和费用明细 |
| 5 | 施工安装 | 按标准化流程进行施工 |
| 6 | 验收交付 | 逐项验收并讲解使用和保养注意事项 |
| 7 | 售后支持 | 提供后续使用咨询和维护指导 |

### 4.4 FAQ（9 条）

| # | 问题 | 回答要点 |
|---|---|---|
| 1 | 理想 L9 能做哪些轻改项目？ | 14 项热门项目覆盖车衣、隔热膜、彩绘、电动踏板、脚垫、铝地板、平衡杆、底盘护板、轮毂、防虫网、钢化膜、HUD 罩、牌照框、挡泥板 |
| 2 | 刚提车优先做哪些项目？ | 新车基础保护组合推荐：隐形车衣 + 隔热窗膜 + 360 航空脚垫 + 底盘护板 + 中控钢化膜 |
| 3 | 家庭用车推荐哪些项目？ | 电动踏板（方便老人小孩上下车）、360 航空脚垫（易清洁）、铝合金地板（后排尾箱耐用）、HUD 显示罩 |
| 4 | 彩绘改色能保留原厂漆吗？ | 彩绘改色在车漆表面施工，后期可撕除还原，但不能承诺 100% 不留痕迹，建议到店评估 |
| 5 | 平衡杆和底盘护板有什么作用？ | 平衡杆和底盘护板分别对应车身支撑和底部防护，安装位需到店确认，不做性能提升承诺 |
| 6 | 中控钢化膜和 HUD 罩有必要吗？ | 中控屏幕高频触控易留划痕，钢化膜提供基础保护；HUD 罩保护显示区域，需确认安装位 |
| 7 | 项目可以单项做吗？ | 所有项目均支持单项选择，不强制套餐组合 |
| 8 | 施工周期多久？ | 单项施工 1-2 天，组合项目根据工程量 2-5 天，到店评估时确认准确工期 |
| 9 | 质保和售后怎么处理？ | 按项目提供对应质保，具体以到店施工合同条款为准，蓝辉轻改提供后续使用咨询和维护指导 |

---

## 5. 字段约定

| 字段 | 约定 | 备注 |
|---|---|---|
| 车型名 | `理想 L9` | — |
| 品牌 slug | `li-auto` | — |
| 型号 slug | `l9` | — |
| 页面 title | `理想 L9 轻改升级方案｜车衣隔热膜电动踏板航空脚垫｜蓝辉轻改` | PRD §13 |
| 页面 description | `蓝辉轻改整理理想 L9 专属升级方案参考，覆盖...14 项项目` | PRD §13 |
| H1 | `理想 L9 专属升级方案` | — |
| 主题色 | `amber-400` (#fbbf24) | 继承 li-auto brand |
| 面包屑 | `产品中心 / 理想 / L9` | — |
| JSON-LD | `CollectionPage` + `ItemList` (`numberOfItems: 14`) | — |
| 项目 key 前缀 | 无前缀，直接 kebab-case | e.g. `paint-protection-film` |
| 数据文件 | `src/lib/li-auto-l9-products.ts` | 独立文件，不与 i8 混写 |
| 组件目录 | `src/components/li-auto/` | — |
| 图片目录 | `public/images/products/li-auto/l9/` | — |

---

## 6. 页面信息架构

```
理想 L9 单车型专题页 `/product/li-auto/l9`
├── LiAutoL9TopicViewTrack         — pageview 埋点 (CC)
├── LiAutoL9Hero                   — Hero 区 (RSC)
│   ├── 主标题 / 副标题 / 14 项数量
│   ├── 5 个场景锚点（滚动到对应 section）
│   └── 主 CTA "咨询 L9 升级方案"
├── LiAutoL9ProjectGrid            — 14 项项目网格 (CC)
│   ├── 场景 tab 筛选（全部 / 5 场景）
│   ├── 14 张卡片（4/3 图 + 序号 + 名称 + 分类 + 价值 + 状态角标）
│   ├── 点击展开面板（适合人群 + 注意事项）
│   └── 埋点：project_click / scenario_filter
├── LiAutoL9Bundles                — 4 个推荐组合 (RSC)
│   ├── 组合卡片 + 项目列表
│   └── CTA "咨询此组合"
├── LiAutoL9ServiceFlow            — 7 步服务流程 (RSC)
├── LiAutoL9Faq                    — FAQ 折叠面板 (CC)
├── CTA 区（到店评估 + 返回产品中心）
└── JSON-LD script（ItemList 14 items）
```

---

## 7. 关键组件

| 组件 | 文件 | 类型 | 职责 |
|---|---|---|---|
| `LiAutoL9TopicViewTrack` | `src/components/li-auto/LiAutoL9TopicViewTrack.tsx` | CC | `product_topic_view` 埋点 |
| `LiAutoL9Hero` | `src/components/li-auto/LiAutoL9Hero.tsx` | RSC | Hero 区 + 场景锚点 + CTA |
| `LiAutoL9ProjectGrid` | `src/components/li-auto/LiAutoL9ProjectGrid.tsx` | CC | 14 卡片 + 场景 tab + 展开面板 + 埋点 |
| `LiAutoL9Bundles` | `src/components/li-auto/LiAutoL9Bundles.tsx` | RSC | 4 组合卡片 |
| `LiAutoL9ServiceFlow` | `src/components/li-auto/LiAutoL9ServiceFlow.tsx` | RSC | 7 步流程 |
| `LiAutoL9Faq` | `src/components/li-auto/LiAutoL9Faq.tsx` | CC | FAQ 折叠面板 |
| `LiAutoL9TopicBanner` | `src/components/li-auto/LiAutoL9TopicBanner.tsx` | RSC | `/product` 入口 banner |

---

## 8. 图片状态规则

| 状态 | 页面表现 | 当前使用 |
|---|---|---|
| `matched` | 展示真实项目图 | 0 项 |
| `generated-preview` | 展示 AI 预览图 + 「预览图」角标 | 0 项 |
| `pending-review` | 展示占位图 + 「图片审核中」标签 | **14 项（当前全部）** |
| `missing` | 展示统一占位卡片 | 0 项 |

**图片规格**：1448 × 1086, 4/3 比例。所有图片容器 `aspect-[4/3] + object-contain + Next/Image sizes`。

---

## 9. 埋点事件（PRD §14）

| 事件 | 触发时机 | 关键参数 |
|---|---|---|
| `product_topic_view` | 进入 `/product/li-auto/l9` | `topic: li-auto-l9`, `brandSlug: li-auto`, `modelSlug: l9` |
| `li_auto_l9_scenario_filter` | 切换场景筛选 tab | `scenarioKey` |
| `li_auto_l9_project_click` | 点击项目卡片 | `projectKey`, `projectName`, `category`, `scenarioKey`, `imageStatus` |
| `li_auto_l9_bundle_click` | 点击推荐组合 | `bundleName`, `bundleKey` |
| `consult_cta_click` | 点击咨询 CTA | `topic: li-auto-l9`, `entry: hero/bundle` |

---

## 10. 实施状态

| 维度 | 状态 | 备注 |
|---|---|---|
| 路由注册 | ⬜ 未注册 | `product-routes.ts` BRANDS modelSlugs + MODELS 新增 |
| Legacy Redirect | ⬜ 未注册 | `legacyPaths: ["/product/li-auto-l9"]` |
| 父品牌页 | ⚪ `planned` | 保持不变 |
| 模型子目录 | ⬜ 无 | `src/app/product/li-auto/l9/page.tsx` 不存在 |
| 数据源 | ⬜ 无 | `li-auto-l9-products.ts` 不存在 |
| 7 组件 | ⬜ 无 | 6 核心 + 1 banner |
| 图资源 | ⬜ 无 | 14 张图全 `pending-review`（占位处理） |
| 验证脚本 | ⬜ 无 | 需 `verify-li-auto-l9-images.mjs` |
| `/product` 入口 | ⬜ 无 | 需加 `LiAutoL9TopicBanner` |

---

## 11. 合规边界（PRD §3.3）

### 11.1 车型适配声明（强制）

> 不同年份、批次、版本和配置的理想 L9 在尺寸、接口、安装位和结构上可能存在差异。页面项目只作为轻改方向参考，最终以到店确认和施工评估为准。

### 11.2 合规红线（不得命中）

- ❌ 理想官方授权
- ❌ 理想原厂配件
- ❌ 官方同款
- ❌ 不影响原车质保
- ❌ 100% 无损安装
- ❌ 永久质保
- ❌ 全网最低
- ❌ 性能提升、操控提升、制动提升等不可验证承诺
- ❌ 暗示与理想汽车存在品牌合作关系

---

## 12. 验收标准（与 PRD §19 三棱镜对齐）

### 12.1 内容验收

- [ ] 14 项项目与 PRD §7 表格完全一致，顺序 01-14
- [ ] 5 个场景分类正确（PRD §8）
- [ ] 4 个推荐组合正确（PRD §9）
- [ ] 合规 9 项红线 0 命中
- [ ] 适配声明一字不差出现

### 12.2 数据验收

- [ ] `LI_AUTO_L9_PROJECT_COUNT === 14`
- [ ] 路由注册：`product-routes.test.ts` 通过
- [ ] 所有项目 `imageStatus` 正确（当前全 `pending-review`）
- [ ] JSON-LD `ItemList.numberOfItems === 14`

### 12.3 交互验收

- [ ] 场景 tab 切换筛选正常
- [ ] 项目卡片点击展开/收起正常
- [ ] CTA 点击跳转正确

### 12.4 响应式验收

- [ ] Mobile 390px：单列，无横向溢出
- [ ] Tablet 768px：2 列，布局稳定
- [ ] Desktop 1440px：4 列，接近 ES8 视觉节奏

### 12.5 工程验收

- [ ] `npx tsc --noEmit` 仅 pre-existing 错误
- [ ] `npm run build` 通过，`/product/li-auto/l9` 为 `○ Static`
- [ ] 无 `any` 类型（grep 验证）
- [ ] 埋点事件可通过 console 验证

---

## 13. 验证命令

```bash
# 单元测试
npx vitest run src/lib/product-routes.test.ts
npx vitest run src/lib/li-auto-l9-products.test.ts

# 质量门禁
npm run lint
npm run typecheck
npm run build

# 合规红线
grep -rE "理想官方授权|原厂配件|官方同款|不影响原车质保|100% ?无损安装|永久质保|全网最低|性能提升|操控提升|制动提升|理想汽车合作" \
  src/app/product/li-auto src/components/li-auto src/lib/li-auto-l9-products.ts \
  && echo "FAIL" || echo "PASS"
```

---

## 14. 浏览器视口检查

| 视口 | 设备 | 验收项 |
|---|---|---|
| Mobile 390px | iPhone 14 Pro | Hero ≤ 1.5 屏；14 项目单列；5 场景 tab 可横向滚动；展开面板可读；底部 CTA 可见 |
| Tablet 768px | iPad | 14 项目 2 列；5 场景 tab 正常；4 组合 2 列 |
| Desktop 1440px | MacBook | 14 项目 4 列；5 场景 tab 正常；4 组合 4 列；JSON-LD 全量渲染 |

---

## 15. 任务列表（按依赖顺序）

### 阶段 A：路由注册 + 产品中心入口（2 task）

- **A.1**: 修改 `src/lib/product-routes.ts`（BRANDS li-auto modelSlugs + MODELS 新增 l9）
- **A.2**: 修改 `src/lib/product-routes.test.ts`（更新计数 expectations）
- **A.3**: 新建 `src/components/li-auto/LiAutoL9TopicBanner.tsx`（RSC, amber 主题）
- **A.4**: 修改 `src/app/product/page.tsx`（import + 加入 banner）

### 阶段 B：数据层（2 task）

- **B.1**: 新建 `src/lib/li-auto-l9-products.ts`（14 项目 + 5 场景 + 4 组合 + 7 步 + 9 FAQ + 字面量 + runtime 断言）
- **B.2**: 新建 `src/lib/li-auto-l9-products.test.ts`（单元测试）

### 阶段 C：UI 组件层（6 task）

- **C.1**: `LiAutoL9Hero.tsx` — RSC, amber 主题
- **C.2**: `LiAutoL9ProjectGrid.tsx` — CC, 14 卡片 + tab 筛选 + 展开 + 埋点
- **C.3**: `LiAutoL9Bundles.tsx` — RSC, 4 组合
- **C.4**: `LiAutoL9ServiceFlow.tsx` — RSC, 7 步流程
- **C.5**: `LiAutoL9Faq.tsx` — CC, 折叠面板
- **C.6**: `LiAutoL9TopicViewTrack.tsx` — CC, pageview 埋点

### 阶段 D：页面组装（1 task）

- **D.1**: 新建 `src/app/product/li-auto/l9/page.tsx`（组装 + Metadata + JSON-LD）

### 阶段 E：测试 + 验证（3 task）

- **E.1**: 合规红线 grep 检查
- **E.2**: `npm run build` + `npx tsc --noEmit`
- **E.3**: 三视口浏览器检查

### 阶段 F：收尾（2 task）

- **F.1**: 状态翻转 — `product-routes.ts` li-auto/l9 `status: "planned"` → `"live"`
- **F.2**: Worktree merge + 主分支门禁

---

## 16. 风险清单与缓解

| 风险 | 触发条件 | 影响 | 缓解 |
|---|---|---|---|
| 图片素材缺失 | 14 项全 pending-review | 页面视觉寡淡 | 卡片不依赖图片展示，名称 + 摘要 + 分类始终可读 |
| 合规文案漂移 | 组件或数据文件误写承诺 | 合规事故 | 构建前 grep 验证 9 关键词 |
| 场景 key 不匹配 | data file scenarioKey 与 PRD 定义不同 | 筛选失效 | runtime 断言 + 单元测试覆盖 |
| 字面量类型被绕过 | 数据文件用 `as LiAutoL9UpgradeProject[]` 绕过 | 数量漂移 | runtime check + 单元测试 |
| legacy alias 遗忘 | MODELS 漏配 legacyPaths | 旧 URL 404 | product-routes.test.ts 计数验证 |
| /product 入口 banner 漏添 | page.tsx 未 import | 用户无法从产品中心进入 | A.4 显式 task 清单 |
| Worktree 缺 .env | dispatch 后 dev server 起不来 | 阻断浏览器检查 | 分支创建后 `cp .env .env` |

---

## 17. 变更记录

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-27 | v0.1 | 基于 `LI_AUTO_L9_TOPIC_PRD_2026-06-27.md` 创建 dispatch 友好版 SPEC | prompt-boost |

---

> 最后更新: 2026-06-27
