# 产品中心路由架构与 PRD 规范

> 本文用于统一蓝辉轻改官网 `/product` 下的产品项目页、品牌专题页、车型专题页的路由设计与 PRD 写法。  
> 当前日期：2026-06-25。本文是后续重构产品中心、车型专题页、海报驱动车型 PRD 的上位约束。

---

## 1. 文档定位

| 项目 | 内容 |
|---|---|
| 文档名称 | 产品中心路由架构与 PRD 规范 |
| 页面范围 | `/product` 全部子路由 |
| 版本 | v0.1 |
| 状态 | 路由治理草案，待确认后进入实现设计 |
| Owner | 蓝辉轻改 |
| 编写日期 | 2026-06-25 |
| 上位文档 | [../00_MASTER_PRD.md](../00_MASTER_PRD.md) |
| 关联入口 PRD | [PRODUCT_INDEX_PRD_2026-06-25.md](./PRODUCT_INDEX_PRD_2026-06-25.md) |
| 关联 P1 项目服务规划 | [P1_SERVICE_PROJECTS_PRD_2026-06-25.md](./P1_SERVICE_PROJECTS_PRD_2026-06-25.md) |
| 关联车型 PRD | 问界 / 小米 / 理想 / 极氪 / 特斯拉 / 小鹏 / 腾势 / 岚图 / 乐道 / 高山 / 智界等车型专题 PRD |

---

## 2. 核心结论

蓝辉的产品页面不应该只按“产品列表”平铺，也不应该只按“车型海报”堆叠。更合理的结构是：

1. **按项目找**：用户已经知道自己想做什么，例如车衣、窗膜、电动踏板、轮毂、底盘护板、改色膜。
2. **按车型找**：用户先从自己的车出发，例如小米 SU7 / YU7、问界 M6 / M7 / M8、极氪 9X。
3. **项目与车型互相回链**：车型页展示该车型适合做哪些项目；项目页展示这个项目适合哪些热门车型。

所以 `/product` 下需要形成一个二维矩阵：

```text
产品中心 /product
├── 按项目找：车衣、窗膜、改色膜、电动踏板、轮毂、底盘……
└── 按车型找：小米、问界、极氪、理想、特斯拉、小鹏……
    └── 单车型：小米 SU7、小米 YU7、问界 M6、问界 M7、问界 M8……
```

这套结构解决三个问题：

- 用户不会迷路：知道项目的人走项目页，不知道项目的人走车型页。
- SEO 更清晰：项目关键词和车型关键词分开承接。
- 后续海报资产可复用：车型海报只负责车型方案，不承担所有项目知识解释。

### 2.1 页面私有操作取消规则

用户已确认：产品页不再设计页面私有操作。产品页只做内容展示、项目解释、车型/项目路由分流和 SEO 内链。

具体规则：

- 不在 Hero、项目卡片、推荐组合、页面底部单独设计引导按钮。
- 不为每个产品页单独写页面操作文案、弹窗参数或点击验收项。
- 不把小配件缺少独立页面时默认导向页面内私有操作。
- 需要沟通时，由首页或全站 Header/Footer 入口承接，不在产品 PRD 内逐页重复设计。

---

## 3. 页面类型定义

### 3.1 类型一：产品中心入口页

| 字段 | 规范 |
|---|---|
| 页面类型 | Product Index |
| Canonical Route | `/product` |
| 主要任务 | 给用户两个入口：按项目找 / 按车型找 |
| 当前状态 | 已有基础页，但需要升级导航结构 |
| 关联 PRD | [PRODUCT_INDEX_PRD_2026-06-25.md](./PRODUCT_INDEX_PRD_2026-06-25.md) |

入口页不是单纯展示 6 个产品卡片，而应该明确分成：

- 热门车型方案
- 核心服务项目
- 汽车膜系
- 轻改装备
- 商务舒适升级
- 小配件 / 实用防护

### 3.2 类型二：服务项目页

| 字段 | 规范 |
|---|---|
| 页面类型 | Service Category |
| Canonical Route | `/product/{serviceSlug}` |
| 示例 | `/product/ppf`、`/product/window-film`、`/product/electric-steps` |
| 主要任务 | 解释一个项目是什么、适合谁、怎么施工、怎么验收 |
| 用户意图 | “我想贴车衣 / 装电动踏板 / 改轮毂” |

服务项目页是长期稳定页面，应该优先承接搜索和内容分流。车型页里的项目卡片应该回链到对应服务项目页。

### 3.3 类型三：品牌专题页

| 字段 | 规范 |
|---|---|
| 页面类型 | Vehicle Brand Topic |
| Canonical Route | `/product/{brandSlug}` |
| 示例 | `/product/xiaomi`、`/product/wenjie`、`/product/zeekr` |
| 主要任务 | 聚合某个品牌下的车型方案 |
| 用户意图 | “我是问界车主，看看蓝辉有什么方案” |

品牌专题页不要写成单个车型详情页。它应该承担：

- 品牌车型导航
- 品牌下的车型二级分类
- 品牌共性优势
- 已有车型方案入口
- 热门项目聚合

即使某个品牌当前只有 1 个车型专题，也必须预留品牌页。例如当前只有 `/product/denza/d9`，也要预留 `/product/denza`，避免后续新增车型时重新迁移路由。

### 3.4 类型四：单车型专题页

| 字段 | 规范 |
|---|---|
| 页面类型 | Vehicle Model Topic |
| Canonical Route | `/product/{brandSlug}/{modelSlug}` |
| 示例 | `/product/wenjie/m8`、`/product/xiaomi/yu7`、`/product/li-auto/i8` |
| 主要任务 | 展示某一个车型的完整升级方案 |
| 用户意图 | “我就是这款车，想知道能做哪些项目” |

单车型专题页承接海报里的项目目录，例如：

- 必改产品
- 高级商务升级
- 实用小配件
- 热门推荐
- 更多可选项目

### 3.5 品牌二级车型分类强规则

用户已确认：**每个品牌都必须预留车型二级分类**。也就是说，品牌不是一个普通 banner，而是一个长期内容容器。

```text
/product
└── /product/{brandSlug}
    ├── /product/{brandSlug}/{modelSlug}
    ├── /product/{brandSlug}/{modelSlug}
    └── /product/{brandSlug}/{modelSlug}
```

示例：

```text
/product/wenjie
├── /product/wenjie/m6
├── /product/wenjie/m7
└── /product/wenjie/m8

/product/xiaomi
├── /product/xiaomi/su7
└── /product/xiaomi/yu7
```

这条规则的目的：

- 后续添加新车型时，只需要在对应品牌页下增加车型卡片和新路由。
- 品牌页可以沉淀该品牌的共性项目、口碑案例和车型入口。
- 单车型页只负责该车型方案，不承担品牌总览职责。
- 避免 `/product/wenjie-m8`、`/product/xiaomi-yu7` 这类平铺路由越堆越多。

品牌页内可以按车型类型做视觉分组，例如 SUV / 轿车 / MPV / 商务车 / 纯电 / 增程，但早期 URL 不再额外增加一层车型类型，避免路由过深。也就是说：

| 场景 | 推荐做法 |
|---|---|
| 问界有 M6 / M7 / M8 | `/product/wenjie/m6`、`/product/wenjie/m7`、`/product/wenjie/m8` |
| 小米有 SU7 / YU7 | `/product/xiaomi/su7`、`/product/xiaomi/yu7` |
| 理想后续有 i8 / L 系列 | `/product/li-auto/i8`、`/product/li-auto/l6`、`/product/li-auto/l7` |
| 品牌下车型很多 | 在品牌页做车型分类筛选，不优先做 `/product/{brand}/{type}/{model}` |

---

## 4. 路由命名总规则

### 4.1 Canonical Route 规则

| 类型 | 规则 | 示例 |
|---|---|---|
| 产品中心 | `/product` | `/product` |
| 服务项目 | `/product/{serviceSlug}` | `/product/window-film` |
| 品牌专题 | `/product/{brandSlug}` | `/product/wenjie` |
| 单车型专题 | `/product/{brandSlug}/{modelSlug}` | `/product/wenjie/m8` |
| 套餐详情 | `/product/{serviceSlug}/{packageSlug}` | `/product/window-film/premium` |

品牌页与车型页必须成对规划：只要创建单车型 PRD，就必须明确它的 `Parent Route`。如果 parent 品牌页还没有代码页，也要在 PRD 注册表中标记为 `planned`。

### 4.2 Slug 规则

- 全部使用小写英文、数字、连字符。
- 不使用中文拼音混写。
- 品牌和车型分层，不再新增 `/product/wenjie-m8` 这类平铺新路由。
- 已经写入 PRD 的平铺路由可以作为 legacy alias，但不作为长期 canonical。
- 车型数字可以直接作为 modelSlug，例如高山 8 使用 `/product/gaoshan/8`。
- 车型字母数字组合保持原始识别度，例如 `/product/wenjie/m8`、`/product/ledao/l90`、`/product/zeekr/9x`。

### 4.3 不推荐路由

| 不推荐写法 | 问题 | 推荐写法 |
|---|---|---|
| `/product/wenjie-m8` | 品牌和车型混在一层，后续扩展混乱 | `/product/wenjie/m8` |
| `/product/xiaomi-yu7` | 无法自然承接小米品牌页 | `/product/xiaomi/yu7` |
| `/product/m8` | 品牌不明确，SEO 与导航都弱 | `/product/wenjie/m8` |
| `/product/问界M8` | URL 不稳定，不利于工程和分享 | `/product/wenjie/m8` |
| `/product/wenjie/m8/window-film` | 车型下重复建设项目页，容易产生内容重复 | 车型页项目卡片回链 `/product/window-film` |

---

## 5. 服务项目路由注册表

### 5.1 当前 P0 服务项目页

| 服务项目 | Canonical Route | 当前 PRD | 页面定位 |
|---|---|---|---|
| 电动踏板 | `/product/electric-steps` | [ELECTRIC_STEPS_PRD_2026-06-20.md](./ELECTRIC_STEPS_PRD_2026-06-20.md) | 高底盘 SUV / MPV 上下车便利 |
| 轮毂升级 | `/product/wheels` | [WHEELS_PRD_2026-06-20.md](./WHEELS_PRD_2026-06-20.md) | 外观姿态与轮毂数据匹配 |
| 底盘升级 | `/product/chassis` | [CHASSIS_PRD_2026-06-20.md](./CHASSIS_PRD_2026-06-20.md) | 底盘防护 / 稳定性 / 护板类说明 |
| 汽车窗膜 / 隔热膜 | `/product/window-film` | [WINDOW_FILM_TOPIC_PRD_2026-06-20.md](./WINDOW_FILM_TOPIC_PRD_2026-06-20.md) | 隔热、隐私、防晒、套餐详情 |
| 改色膜 | `/product/color-film` | [COLOR_FILM_PRD_2026-06-20.md](./COLOR_FILM_PRD_2026-06-20.md) | 颜色表达、整车风格升级 |
| 隐形车衣 / 车衣 | `/product/ppf` | [PPF_PRD_2026-06-20.md](./PPF_PRD_2026-06-20.md) | 漆面保护、防刮擦、防老化 |

### 5.2 建议新增 P1 服务项目页

这些项目在多个车型海报中高频出现，但不一定马上都做独立页面。建议先作为车型页项目卡片，等素材和业务成熟后再升级为服务项目页。

| 服务项目 | 建议 Route | 出现频率 | 是否立即独立成页 | 备注 |
|---|---|---:|---|---|
| 360 软包脚垫 / 三防软包脚垫 | `/product/floor-mats` | 高 | 是，P1 | 问界 M6/M7/M8、小米、理想等都出现 |
| 铝地板 / 木地板 | `/product/flooring` | 高 | 已有专题，可重定位 | 当前已有木地板专题，可扩展为地板类 |
| 底盘护板 | `/product/skid-plate` | 高 | 暂不单独，先并入 `/product/chassis` | 后续如内容足够再拆分 |
| 平衡杆 | `/product/balance-bar` | 高 | 暂不单独 | 先作为车型页项目 |
| 小桌板 | `/product/seat-table` | 高 | 暂不单独 | 偏商务舒适升级 |
| 氛围灯 | `/product/ambient-light` | 高 | 暂不单独 | 需要真实施工案例后独立 |
| 后排娱乐电视 | `/product/rear-entertainment` | 中高 | 暂不单独 | 适合 MPV / 大六座 SUV |
| 流媒体后视镜 | `/product/streaming-mirror` | 中高 | 暂不单独 | 可与安全辅助类聚合 |
| 钢化膜 / 中控屏保护 | `/product/screen-protector` | 中高 | 暂不单独 | 小配件，优先放车型页 |
| 门槛条 | `/product/door-sill-plates` | 中高 | 暂不单独 | 小配件，优先放车型页 |
| 防虫网 | `/product/insect-screen` | 中高 | 暂不单独 | 实用配件 |
| 挡泥板 | `/product/mud-flaps` | 中高 | 暂不单独 | 实用配件 |
| 牌照框 | `/product/license-plate-frame` | 中 | 暂不单独 | 小配件，不建议早期独立 SEO 页 |

### 5.3 服务项目页拆分原则

一个项目是否值得独立成页，按这四个条件判断：

1. 是否高频出现在 3 个以上车型方案中。
2. 是否能写出独立的施工流程、验收标准和 FAQ。
3. 是否有足够真实图片素材支撑。
4. 是否具备用户搜索意图，而不仅仅是小配件名称。

未满足条件的项目，先作为车型页项目卡片，不急着建独立路由。

---

## 6. 品牌与车型路由注册表

### 6.1 P0 / P1 品牌专题页

| 品牌 | Canonical Route | 当前状态 | 说明 |
|---|---|---|---|
| 小米 | `/product/xiaomi` | 已有代码页 + PRD | 承接 SU7 / YU7 |
| 问界 | `/product/wenjie` | 已有代码页 + PRD | 承接 M6 / M7 / M8 |
| 极氪 | `/product/zeekr` | 已有代码页 + PRD | 承接 9X 及后续车型 |
| 理想 | `/product/li-auto` | 已有 PRD，代码待补 | 承接 i8 及后续车型 |
| 特斯拉 | `/product/tesla` | 已有 PRD，代码待补 | 承接 Model 3 / Model Y / Model X / Model S |
| 小鹏 | `/product/xpeng` | 已有单车型 PRD，品牌页待补 | 承接 GX 及后续车型 |
| 腾势 | `/product/denza` | 已有单车型 PRD，品牌页待补 | 承接 D9 |
| 岚图 | `/product/voyah` | 已有单车型 PRD，品牌页待补 | 承接梦想家 |
| 乐道 | `/product/ledao` | 已有单车型 PRD，品牌页待补 | 承接 L90 |
| 高山 | `/product/gaoshan` | 已有单车型 PRD，品牌页待补 | 承接高山 8 |
| 智界 | `/product/zhijie` | 已有单车型 PRD，品牌页待补 | 承接 V9 |

### 6.2 单车型 Canonical Route

| 车型 | Canonical Route | Legacy Alias | 当前 PRD |
|---|---|---|---|
| 小米 SU7 | `/product/xiaomi/su7` | 暂无 | [XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md](./XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md) |
| 小米 YU7 | `/product/xiaomi/yu7` | `/product/xiaomi-yu7` | [XIAOMI_YU7_UPGRADE_PRD_2026-06-24.md](./XIAOMI_YU7_UPGRADE_PRD_2026-06-24.md) |
| 问界 M6 | `/product/wenjie/m6` | `/product/wenjie-m6` | [WENJIE_M6_TOPIC_PRD_2026-06-25.md](./WENJIE_M6_TOPIC_PRD_2026-06-25.md) |
| 问界 M7 | `/product/wenjie/m7` | `/product/wenjie-m7` | [WENJIE_M7_TOPIC_PRD_2026-06-25.md](./WENJIE_M7_TOPIC_PRD_2026-06-25.md) |
| 问界 M8 | `/product/wenjie/m8` | `/product/wenjie-m8` | [WENJIE_M8_TOPIC_PRD_2026-06-25.md](./WENJIE_M8_TOPIC_PRD_2026-06-25.md) |
| 极氪 9X | `/product/zeekr/9x` | `/product/zeekr-9x` | [ZEEKR_9X_UPGRADE_PRD_2026-06-24.md](./ZEEKR_9X_UPGRADE_PRD_2026-06-24.md) |
| 理想 i8 | `/product/li-auto/i8` | 暂无 | [LI_AUTO_I8_TOPIC_PRD_2026-06-24.md](./LI_AUTO_I8_TOPIC_PRD_2026-06-24.md) |
| 乐道 L90 | `/product/ledao/l90` | `/product/ledao-l90` | [LEDAO_L90_TOPIC_PRD_2026-06-24.md](./LEDAO_L90_TOPIC_PRD_2026-06-24.md) |
| 腾势 D9 | `/product/denza/d9` | `/product/denza-d9` | [DENZA_D9_TOPIC_PRD_2026-06-24.md](./DENZA_D9_TOPIC_PRD_2026-06-24.md) |
| 岚图梦想家 | `/product/voyah/dreamer` | `/product/voyah-dreamer` | [VOYAH_DREAMER_TOPIC_PRD_2026-06-25.md](./VOYAH_DREAMER_TOPIC_PRD_2026-06-25.md) |
| 小鹏 GX | `/product/xpeng/gx` | `/product/xpeng-gx` | [XPENG_GX_TOPIC_PRD_2026-06-25.md](./XPENG_GX_TOPIC_PRD_2026-06-25.md) |
| 高山 8 | `/product/gaoshan/8` | `/product/gaoshan-8` | [GAOSHAN_8_TOPIC_PRD_2026-06-25.md](./GAOSHAN_8_TOPIC_PRD_2026-06-25.md) |
| 智界 V9 | `/product/zhijie/v9` | `/product/zhijie-v9` | [ZHIJIE_V9_TOPIC_PRD_2026-06-25.md](./ZHIJIE_V9_TOPIC_PRD_2026-06-25.md) |

---

## 7. `/product` 入口页改版 PRD 要点

### 7.1 页面目标

当前 `/product` 已经有“热门车型与改装专题 + 6 大产品方向”，但后续需要更明确地表达为双入口：

- **按项目找**：适合目标明确的用户。
- **按车型找**：适合不知道做什么、但知道自己车型的用户。

### 7.2 建议信息架构

```text
/product 产品中心
├── Hero：一句话说明蓝辉做什么
├── 搜索 / 快速筛选：输入车型或项目
├── 按车型找
│   ├── 小米：SU7 / YU7
│   ├── 问界：M6 / M7 / M8
│   ├── 极氪：9X
│   ├── 理想：i8
│   └── 更多品牌：特斯拉 / 小鹏 / 腾势 / 岚图 / 乐道 / 高山 / 智界
├── 按项目找
│   ├── 汽车膜系：车衣 / 窗膜 / 改色膜
│   ├── 轻改装备：电动踏板 / 轮毂 / 底盘
│   ├── 商务舒适：小桌板 / 氛围灯 / 后排娱乐 / 腿托
│   └── 实用配件：脚垫 / 门槛条 / 防虫网 / 挡泥板
├── 热门组合推荐
```

### 7.3 核心交互

| 功能 | 说明 | 优先级 |
|---|---|---|
| 车型搜索 | 输入“小米 / 问界 / M8 / YU7”等关键词，定位车型卡片 | P1 |
| 项目筛选 | 按汽车膜系、轻改装备、商务舒适、实用配件筛选 | P0 |
| 车型卡片 | 品牌 + 车型 + 推荐项目数量 + 进入方案 | P0 |
| 项目卡片 | 项目名称 + 适合车型 + 进入详情 | P0 |

---

## 8. 单车型专题页 PRD 统一模板

后续每个车型 PRD 必须包含以下字段，避免只从海报抄项目名。

### 8.1 基础元信息

```md
| 项目 | 内容 |
|---|---|
| 车型 | 问界 M8 |
| 页面类型 | Vehicle Model Topic |
| Canonical Route | /product/wenjie/m8 |
| Parent Route | /product/wenjie |
| Legacy Alias | /product/wenjie-m8 |
| 来源素材 | 问界 M8 专属升级方案海报 |
| 项目数量 | 30 |
| 项目分组 | 必改产品 / 高级商务升级 / 实用小配件 |
```

### 8.2 必须写清楚的内容

| 模块 | 要写什么 | 验收要求 |
|---|---|---|
| 项目分组 | 按海报分组写完整项目 | 数量必须与海报一致 |
| 推荐组合 | 按用户场景组合，不只是罗列 | 至少 3 个组合 |
| 项目卡片 | 项目名称、适用价值、是否回链服务页 | 每个项目都有状态 |
| 图片状态 | matched / pending-review / missing | 不允许静默缺图 |
| 服务流程 | 到店沟通、车型确认、方案报价、施工验收 | 与总部/门店实际可执行 |
| FAQ | 保修、施工时间、是否需要到店确认 | 不承诺绝对无影响 |
| SEO | title、description、canonical | canonical 使用新路由 |

### 8.3 项目卡片统一字段

```ts
type VehicleProject = {
  slug: string;
  name: string;
  tier: "must_have" | "business_upgrade" | "practical_accessory" | "popular" | "optional";
  category:
    | "film"
    | "exterior"
    | "interior"
    | "comfort"
    | "chassis"
    | "wheel"
    | "lighting"
    | "accessory";
  sourceLabel: string;
  serviceRoute?: string;      // 例如 /product/window-film
  imageStatus: "matched" | "pending-review" | "missing";
  priority: "P0" | "P1" | "P2";
};
```

---

## 9. 服务项目页 PRD 统一模板

服务项目页必须回答“这个项目为什么值得做”，不是只放参数。

### 9.1 基础元信息

```md
| 项目 | 内容 |
|---|---|
| 项目名称 | 电动踏板 |
| 页面类型 | Service Category |
| Canonical Route | /product/electric-steps |
| 上级入口 | /product |
| 关联车型 | 问界 M7 / M8、小米 YU7、理想 L 系列、高山 8 等 |
```

### 9.2 必须写清楚的内容

| 模块 | 要写什么 | 验收要求 |
|---|---|---|
| 项目定位 | 解决什么问题 | 一句话能说清价值 |
| 适合人群 | 哪类车主适合 | 不泛泛而谈 |
| 适配车型 | 哪些车型常见 | 可从车型专题回链 |
| 施工边界 | 哪些情况要到店确认 | 不承诺所有车型通用 |
| 验收标准 | 施工后怎么判断合格 | 可执行、可拍照确认 |
| 保养建议 | 后续怎么维护 | 不写绝对化承诺 |
| FAQ | 用户常问问题 | 至少 5 个 |

---

## 10. 内容回链规则

### 10.1 从车型页到项目页

车型页项目卡片按以下规则回链：

| 车型页项目 | 如果已有服务页 | 点击行为 |
|---|---|---|
| 隔热膜 / 窗膜 | `/product/window-film` | 跳转服务项目页 |
| 改色膜 / 改色 | `/product/color-film` | 跳转服务项目页 |
| 车衣 | `/product/ppf` | 跳转服务项目页 |
| 电动踏板 | `/product/electric-steps` | 跳转服务项目页 |
| 轮毂 | `/product/wheels` | 跳转服务项目页 |
| 底盘护板 / 平衡杆 | `/product/chassis` | 跳转服务项目页或页面锚点 |

### 10.2 从项目页到车型页

项目页应展示“常见适配车型”：

- 电动踏板：问界 M7 / M8、高山 8、理想 L 系列、岚图梦想家等。
- 轮毂：小米 SU7 / YU7、问界 M6、极氪 9X、小鹏 GX 等。
- 窗膜：几乎所有车型，但可突出新能源热门车型。
- 改色膜：小米 SU7 / YU7、问界 M6 / M7、极氪 9X 等。
- 车衣：新车交付、热门新能源车、高价值车型。

项目页展示车型时，只显示有 PRD 或素材支撑的车型，不空喊“全车型适配”。

---

## 11. SEO 与合规边界

### 11.1 SEO 规则

| 页面类型 | Title 模板 | Description 模板 |
|---|---|---|
| 产品中心 | `产品中心｜蓝辉轻改 LANHUI` | `蓝辉轻改产品中心，覆盖汽车膜系、轻改装备与热门新能源车型升级方案。` |
| 服务项目页 | `{项目名}｜蓝辉轻改` | `蓝辉轻改提供{项目名}服务，适合{典型车型/场景}，支持到店沟通方案。` |
| 品牌专题页 | `{品牌名}轻改方案｜蓝辉轻改` | `查看{品牌名}热门车型轻改项目，覆盖膜系、防护、舒适与实用配件。` |
| 单车型专题页 | `{车型名}专属升级方案｜蓝辉轻改` | `蓝辉轻改整理{车型名}常见升级项目，包含必改产品、舒适升级与实用配件。` |

### 11.2 Canonical 与 Redirect

- 新页面必须声明 canonical route。
- 平铺旧路由只作为 legacy alias。
- 实现阶段应使用 301 redirect 或等价的永久跳转。
- sitemap 只收录 canonical route，不重复收录 legacy alias。

### 11.3 合规边界

所有产品页都不能出现以下表述：

- “官方授权”“原厂认证”，除非有书面证明。
- “不影响质保”“100% 无损”，除非针对具体项目、具体车型、具体安装方式可证明。
- “永久质保”“全网最低价”“绝对安全”。
- “提升性能”“增强制动性能”等未经测试验证的性能承诺。
- 借用车企商标时必须作为车型识别，不暗示品牌合作关系。

推荐表达：

- “到店确认车型与年款后给出方案”
- “优先选择不破坏原车结构的安装方式”
- “具体施工方式以实车检查为准”
- “适配情况需结合车型配置确认”

---

## 12. 数据结构建议

实现阶段建议新增一个路由注册表，避免 PRD、组件、SEO、sitemap 各写一套。

```ts
type ProductRouteType =
  | "product_index"
  | "service_category"
  | "vehicle_brand"
  | "vehicle_model"
  | "package_detail";

type ProductRoute = {
  type: ProductRouteType;
  canonicalPath: string;
  legacyPaths?: string[];
  title: string;
  navLabel: string;
  parentPath?: string;
  status: "live" | "planned" | "archived";
  priority: "P0" | "P1" | "P2";
};

type VehicleBrandRoute = ProductRoute & {
  type: "vehicle_brand";
  brandSlug: string;
  brandName: string;
  modelSlugs: string[];
};

type VehicleModelRoute = ProductRoute & {
  type: "vehicle_model";
  brandSlug: string;
  modelSlug: string;
  modelName: string;
  projectCount?: number;
  sourcePrd: string;
};
```

---

## 13. 埋点规范

### 13.1 路由级事件

| 事件 | 触发 | 字段 |
|---|---|---|
| `product_index_view` | 访问 `/product` | `route`, `entrySource` |
| `service_page_view` | 访问服务项目页 | `serviceSlug`, `route` |
| `brand_topic_view` | 访问品牌页 | `brandSlug`, `route` |
| `vehicle_model_topic_view` | 访问车型页 | `brandSlug`, `modelSlug`, `route` |

### 13.2 点击事件

| 事件 | 触发 | 字段 |
|---|---|---|
| `product_nav_tab_click` | 点击“按项目找 / 按车型找” | `tab` |
| `service_card_click` | 点击服务项目卡片 | `serviceSlug`, `fromRoute` |
| `brand_card_click` | 点击品牌卡片 | `brandSlug`, `fromRoute` |
| `vehicle_model_card_click` | 点击车型卡片 | `brandSlug`, `modelSlug`, `fromRoute` |
| `vehicle_project_click` | 点击车型页项目 | `brandSlug`, `modelSlug`, `projectSlug`, `tier`, `serviceRoute` |

---

## 14. 三棱镜：实现什么 / 怎么实现 / 怎么验收

### 14.1 实现什么

| 模块 | 要实现的结果 |
|---|---|
| 路由分层 | `/product/{service}`、`/product/{brand}`、`/product/{brand}/{model}` 三层清晰 |
| 入口页 | `/product` 提供“按项目找 / 按车型找”的双入口 |
| 车型页 | 每个车型按海报项目分组展示，并回链服务项目页 |
| 服务页 | 每个核心项目说明价值、适配、施工、验收、FAQ |
| README | 产品 PRD 索引标明 canonical route 与 legacy alias |
| 合规 | 所有页面避免官方授权、绝对质保、绝对无损等风险表达 |

### 14.2 怎么实现

| 阶段 | 工作内容 | 产物 |
|---|---|---|
| Phase 0：文档治理 | 新建本路由总纲；更新 README；标记 legacy alias | 本文 + README |
| Phase 1：入口页 PRD 升级 | 重写 `/product` 入口页 PRD，从 6 产品 + 主题 banner 升级为双入口 | `PRODUCT_INDEX_PRD_2026-06-25.md` 或 v2 |
| Phase 2：车型 PRD 迁移 | 将已有平铺车型 PRD 的 route 字段更新为 nested canonical | 各车型 PRD v0.2 |
| Phase 3：代码路由 | 新增 nested model route；保留 legacy redirect | Next.js 路由实现 |
| Phase 4：数据统一 | 建 route registry，驱动导航、sitemap、SEO 和埋点 | route registry + 测试 |
| Phase 5：验收 | 检查路由、链接、SEO、埋点、移动端 | 测试报告 |

### 14.3 怎么验收

| 验收项 | 标准 |
|---|---|
| 路由唯一性 | 每个页面只有 1 个 canonical route |
| 品牌归属 | 每个车型页必须有 parent brand route |
| Legacy 兼容 | 已写过的 `/product/wenjie-m8` 等旧路由不 404，跳转到新 route |
| README 一致 | README 路由表与本路由总纲一致 |
| 服务回链 | 车型页里的 P0 项目能回链到服务项目页 |
| 小配件策略 | 小配件不强行建页，先做卡片或暂缓独立成页，避免路由膨胀 |
| SEO | sitemap 只收录 canonical，不重复收录 legacy |
| 移动端 | `/product` 双入口在 390px 下可读、可点击 |
| 合规 | 不出现官方授权、绝对无损、绝对不影响质保等风险表述 |

---

## 15. 当前决策记录

| 日期 | 决策 | 理由 |
|---|---|---|
| 2026-06-25 | 产品页面采用“按项目找 + 按车型找”双入口 | 同时承接明确项目需求和明确车型需求 |
| 2026-06-25 | 单车型 canonical 改为 `/product/{brand}/{model}` | 避免 `/product/wenjie-m8` 这类平铺路由继续膨胀 |
| 2026-06-25 | 每个品牌都必须预留车型二级分类 | 方便同一品牌后续继续添加车型内容 |
| 2026-06-25 | 已有平铺车型路由作为 legacy alias | 保留已写 PRD 和未来外链兼容性 |
| 2026-06-25 | 高频小配件暂不全部独立成页 | 避免内容薄、路由多、维护成本高 |
| 2026-06-25 | 服务项目页优先建设 6 个 P0 项目 | 与现有代码和业务高频项目一致 |

---

## 16. 后续待办

### 16.1 文档侧

- [x] 新建 [PRODUCT_INDEX_PRD_2026-06-25.md](./PRODUCT_INDEX_PRD_2026-06-25.md)，将 `/product` 入口页升级为双入口 v2。
- [x] 新建 [P1_SERVICE_PROJECTS_PRD_2026-06-25.md](./P1_SERVICE_PROJECTS_PRD_2026-06-25.md)，规划 P1 项目服务页面策略。
- [ ] 将问界 M6 / M7 / M8 PRD 的 route 字段改为 `/product/wenjie/m6|m7|m8`。
- [ ] 将小米 YU7 PRD 的 route 字段改为 `/product/xiaomi/yu7`。
- [ ] 将极氪 9X、乐道 L90、腾势 D9、岚图梦想家、小鹏 GX、高山 8、智界 V9 PRD 的 route 字段统一迁移。
- [ ] 给所有单车型 PRD 补充 `Parent Route`、`Legacy Alias`、`serviceRoute` 字段。
- [ ] 单独补一份 `PRODUCT_ROUTE_REGISTRY_DESIGN_2026-06-25.md`，用于实现阶段。

### 16.2 实现侧

- [ ] 新增 `/product/{brand}/{model}` 路由实现。
- [ ] 保留旧平铺路由 redirect。
- [ ] `/product` 增加“按项目找 / 按车型找”导航结构。
- [ ] 建立 route registry，统一驱动导航、SEO、sitemap 与埋点。
- [ ] 为 route registry 增加单元测试，避免 slug 漂移。

---

## 17. 暂不做

- 暂不为每个小配件都创建独立页面。
- 暂不做电商下单、库存、价格体系。
- 暂不在车型页下创建项目子路由，例如 `/product/wenjie/m8/window-film`。
- 暂不承诺全部车型适配，所有适配都以到店确认车型和年款为准。
- 暂不把海报图片直接当作唯一内容，页面正文必须文本化、结构化。

---

## 18. 变更记录

| 日期 | 版本 | 说明 |
|---|---|---|
| 2026-06-25 | v0.1 | 新建产品中心路由架构与 PRD 规范，确定“按项目找 + 按车型找”双入口和 nested 车型路由方案。 |
