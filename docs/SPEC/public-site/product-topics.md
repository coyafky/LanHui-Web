# SPEC: 产品品牌与车型专题 Product Topics

> 对应 PRD：`docs/PRD/product/PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md`、`docs/PRD/product/*_TOPIC_PRD_*.md`、各车型海报驱动 PRD  
> 实现状态：🔧 **部分完成，品牌/车型二级路由待实现**

---

## 1. 职责范围

产品专题页分为两类：

1. **品牌专题页**：`/product/{brandSlug}`，负责聚合一个品牌下的车型方案。
2. **单车型专题页**：`/product/{brandSlug}/{modelSlug}`，负责展示某一台车型的完整轻改项目目录。

品牌页不是普通横幅页，而是后续新增车型的长期容器。单车型页承接海报资产里的项目目录，但网页表达要比海报更清晰：项目分组、适配说明、施工边界、相关服务页内链都要被结构化。

## 2. 设计基线

| 维度 | 规范 |
|---|---|
| 视觉方向 | 车型页可以保留海报的强视觉冲击，但网页结构必须内容优先，避免整页像长海报 |
| 风格 | 新能源科技感、工业精密、克制豪华；深色 Hero + 浅色内容卡片可以并存 |
| 车型识别 | Hero 允许使用车型主图/海报图，但必须避免官方授权、官方合作等误导表达 |
| 项目展示 | 用分组网格、项目卡、项目表格承载，不用单纯堆图片 |
| 操作边界 | 不放置页面私有转化区；只做内容展示、内链跳转和方案解释 |
| 可访问性 | 每个项目卡有文本标题；不能只靠图片识别项目 |
| 响应式 | 移动端优先：Hero、锚点、项目卡单列/双列；桌面端使用 3–4 列矩阵 |

## 3. 路由

### 3.1 品牌专题页

| 路径 | 类型 | 说明 | 状态 |
|---|---|---|---|
| `/product/wenjie` | page (RSC) | 问界品牌专题 | ✅ 已有 v1，待适配 M6/M7/M8 二级入口 |
| `/product/xiaomi` | page (RSC) | 小米品牌专题 | ✅ 已有 v1，待适配 SU7/YU7 二级入口 |
| `/product/zeekr` | page (RSC) | 极氪品牌专题 | ✅ 已有 v1，待适配 9X 二级入口 |
| `/product/li-auto` | page (RSC) | 理想品牌专题 | ⬜ 待实现 |
| `/product/tesla` | page (RSC) | 特斯拉品牌专题 | ⬜ 待实现 |
| `/product/xpeng` | page (RSC) | 小鹏品牌专题 | ⬜ 待实现 |
| `/product/denza` | page (RSC) | 腾势品牌专题 | ⬜ 待实现 |
| `/product/voyah` | page (RSC) | 岚图品牌专题 | ⬜ 待实现 |
| `/product/ledao` | page (RSC) | 乐道品牌专题 | ⬜ 待实现 |
| `/product/gaoshan` | page (RSC) | 高山品牌专题 | ⬜ 待实现 |
| `/product/zhijie` | page (RSC) | 智界品牌专题 | ⬜ 待实现 |

### 3.2 单车型专题页

| 车型 | Canonical Route | Legacy Alias | 当前状态 |
|---|---|---|---|
| 小米 SU7 | `/product/xiaomi/su7` | 暂无 | ⬜ 待拆分 |
| 小米 YU7 | `/product/xiaomi/yu7` | `/product/xiaomi-yu7` | ⬜ 待实现 |
| 问界 M6 | `/product/wenjie/m6` | `/product/wenjie-m6` | ⬜ 待实现 |
| 问界 M7 | `/product/wenjie/m7` | `/product/wenjie-m7` | ⬜ 待实现 |
| 问界 M8 | `/product/wenjie/m8` | `/product/wenjie-m8` | ⬜ 待实现 |
| 极氪 9X | `/product/zeekr/9x` | `/product/zeekr-9x` | ⬜ 待实现 |
| 理想 i8 | `/product/li-auto/i8` | 暂无 | ⬜ 待实现 |
| 乐道 L90 | `/product/ledao/l90` | `/product/ledao-l90` | ⬜ 待实现 |
| 腾势 D9 | `/product/denza/d9` | `/product/denza-d9` | ⬜ 待实现 |
| 岚图梦想家 | `/product/voyah/dreamer` | `/product/voyah-dreamer` | ⬜ 待实现 |
| 小鹏 GX | `/product/xpeng/gx` | `/product/xpeng-gx` | ⬜ 待实现 |
| 高山 8 | `/product/gaoshan/8` | `/product/gaoshan-8` | ⬜ 待实现 |
| 智界 V9 | `/product/zhijie/v9` | `/product/zhijie-v9` | ⬜ 待实现 |

Legacy alias 可以做 redirect，但不进入主导航、入口页和 sitemap。

## 4. 品牌专题页模块

```text
Brand Topic
├── Hero：品牌轻改方案总览
├── Model Switcher：品牌下车型入口
├── Brand Fit：该品牌常见升级场景
├── Project Matrix：按项目分类展示该品牌高频项目
├── Featured Model Cards：重点车型卡片
├── Related Services：回链 P0 服务项目页
└── FAQ / SEO Text：品牌相关轻改说明
```

品牌页的核心任务是“让用户找到自己的车型”，不承担单车型详情。

## 5. 单车型专题页模块

```text
Vehicle Model Topic
├── Hero：车型名称 + 专属轻改方案一句话
├── Upgrade Overview：项目数量、项目分组、适合场景
├── Must-have Projects：必改/高频项目
├── Advanced Upgrade：高级商务/外观/舒适升级
├── Practical Accessories：实用小配件
├── Project Detail Grid：项目卡片，含适配说明和相关服务页链接
├── Construction Boundary：需要到店确认的边界
├── Related Service Pages：车衣/窗膜/电动踏板等服务页内链
└── FAQ：车型适配、施工、验收常见问题
```

车型页应把海报中的项目目录翻译成网页结构。海报图可以作为视觉素材，但不能替代项目说明。

## 6. 数据模型

```ts
type ProductPageStatus = "live" | "planned" | "legacy";

type VehicleBrandTopic = {
  brandSlug: string;
  brandName: string;
  route: string;
  theme: "cyan" | "orange" | "amber" | "blue" | "neutral";
  status: ProductPageStatus;
  models: VehicleModelTopic[];
};

type VehicleModelTopic = {
  brandSlug: string;
  modelSlug: string;
  modelName: string;
  route: string;
  legacyAlias?: string;
  status: ProductPageStatus;
  heroImage?: ImageSpec;
  projectGroups: VehicleProjectGroup[];
};

type VehicleProjectGroup = {
  slug: string;
  title: string;
  description: string;
  priority: "must_have" | "advanced" | "practical" | "optional";
  projects: VehicleProjectItem[];
};

type VehicleProjectItem = {
  slug: string;
  name: string;
  serviceRoute?: string;
  imageStatus: "matched" | "pending-review" | "missing";
  fitNote: string;
  caution?: string;
};
```

## 7. 标准组件模式

| 组件 | 职责 | Client? |
|---|---|---:|
| BrandTopicHero | 品牌页首屏 | 否 |
| ModelSwitcher | 品牌下车型切换与直达 | 是 |
| VehicleTopicHero | 单车型页首屏 | 否 |
| AnchorNav | 页面内项目分组快速跳转 | 是 |
| ProductCard | 项目卡片，3 态图片与服务页内链 | 是 |
| ProductGrid | 项目卡片网格布局 | 否 |
| ProductTable | 参数/适配/验收表格 | 否 |
| TopicBanner | 产品中心入口横幅 | 否 |

详细组件契约见 `docs/SPEC/components/topic-pattern.md`。

## 8. 图片三态模型

```ts
type ImageStatus = "matched" | "pending-review" | "missing";
```

| 状态 | 显示 | 含义 |
|---|---|---|
| matched | 真实产品图 | 图片已确认可用 |
| pending-review | 业务审核占位 | 图已收集但待确认适配/版权/清晰度 |
| missing | 占位图形 + 文案 | 暂无图片，不能空白塌陷 |

图片容器统一：`aspect-[4/3] + object-contain + Next/Image sizes`。海报长图只可作为额外展示模块，不作为项目卡默认比例。

## 9. SEO 与结构化数据

| 页面类型 | JSON-LD | 要求 |
|---|---|---|
| 品牌专题 | `CollectionPage` + `ItemList` | 列出品牌下车型页 |
| 单车型专题 | `CollectionPage` + `ItemList` | 列出该车型项目 |
| 服务页内链 | `ItemList` item URL | 指向 P0/P1 服务项目页 |

metadata 规则：

- 品牌页 Title：`{品牌名}轻改方案｜蓝辉轻改 LANHUI`
- 车型页 Title：`{车型名}轻改项目｜蓝辉轻改 LANHUI`
- Description 必须包含车型、轻改方案、核心项目，但不写官方合作、授权、最低价等不可控表达。

## 10. 验收条件

- [ ] 品牌页能清晰展示该品牌下的车型入口。
- [ ] 单车型页使用 `/product/{brandSlug}/{modelSlug}` canonical route。
- [ ] legacy alias 不在产品中心主入口展示。
- [ ] 项目卡必须有标题、适配说明、图片状态；图片缺失时布局不塌陷。
- [ ] 每个车型页至少回链 3 个相关服务页或项目说明区。
- [ ] 390px 下无横向滚动；项目卡触控区域不小于 44px。
- [ ] Hero 图片有明确尺寸或 aspect ratio，首屏 LCP 目标 < 3s。
- [ ] 不出现官方授权、原厂同款、绝对无损、不影响质保等高风险表述。

## 11. 已知问题

- 现有 `/product/wenjie`、`/product/xiaomi`、`/product/zeekr` 仍是品牌/系列 v1 页面，尚未拆到品牌 + 车型二级路由。
- 问界 v1 图片大量 pending，需要业务确认素材。
- Flooring 当前更接近服务项目页，后续应从品牌专题模式中移出，归入 `/product/flooring` 服务项目页。

---

> 最后更新: 2026-06-25

## 12. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|---|---|---|---|---|
| 2026-06-13 | Claude Code | 问界/小米专题页初始实现 | 完成 | — |
| 2026-06-16 | Claude Code | ZEEKR 专题页定型 | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | — |
| 2026-06-25 | Codex | 按品牌/车型二级路由与海报驱动车型 PRD 更新 SPEC | 文档完成 | 待实现 |
