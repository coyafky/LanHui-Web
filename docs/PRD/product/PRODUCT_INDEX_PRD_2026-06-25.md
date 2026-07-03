# 产品中心入口页 PRD v2

> 本文是 `/product` 产品中心入口页的新版内容 PRD。  
> 重点从“6 大产品卡片 + 主题 banner”升级为“按项目找 + 按车型找”的双入口结构，并与品牌/车型二级路由规范对齐。

---

## 1. 概述

| 项目 | 内容 |
|---|---|
| 页面 | `/product` |
| 页面类型 | Product Index / 产品中心聚合入口 |
| 版本 | v2 |
| 状态 | 待实现 |
| 编写日期 | 2026-06-25 |
| Owner | 蓝辉轻改 |
| 上一版本 | [PRODUCT_INDEX_PRD_2026-06-20.md](./PRODUCT_INDEX_PRD_2026-06-20.md) |
| 上位规范 | [PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md](./PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md) |
| 关联规划 | [P1_SERVICE_PROJECTS_PRD_2026-06-25.md](./P1_SERVICE_PROJECTS_PRD_2026-06-25.md) |

---

## 2. 核心变化

### 2.1 v1 的问题

v1 主要是：

- 先展示热门车型 TopicBanner；
- 再展示 6 个产品方向；
- 用户需要自己理解“车型专题”和“项目服务”的关系。

这在项目少的时候可用，但随着问界 M6/M7/M8、小米 SU7/YU7、极氪 9X、理想 i8 等车型 PRD 增加，入口页会变得混乱。

### 2.2 v2 的目标

v2 必须把用户问题拆成两个入口：

1. **按车型找**：我是什么车？这台车适合做哪些轻改项目？
2. **按项目找**：我想做车衣 / 窗膜 / 电动踏板 / 轮毂，应该怎么看？

页面不再只是“产品列表”，而是一个导购分流页。

---

## 3. 页面目标

| 目标 | 说明 | 优先级 |
|---|---|---|
| 降低用户选择成本 | 用户进来后先判断“按车型找”还是“按项目找” | P0 |
| 规范车型入口 | 车型必须挂在品牌二级分类下，例如 `/product/wenjie/m8` | P0 |
| 强化核心服务项目 | 车衣、窗膜、改色膜、电动踏板、轮毂、底盘作为 P0 服务项目展示 | P0 |
| 预留 P1 项目服务 | 脚垫、地板、氛围灯、小桌板、后排娱乐等先以规划卡片展示 | P1 |
| 支持 SEO | 产品页和车型页形成清晰内链 | P1 |

---

## 4. 用户故事

| 用户 | 场景 | 页面应该怎么回应 | 优先级 |
|---|---|---|---|
| 明确车型车主 | “我是问界 M8，想看看能做什么” | 在“按车型找”中进入 `/product/wenjie/m8` | P0 |
| 明确项目车主 | “我想贴窗膜 / 车衣” | 在“按项目找”中进入 `/product/window-film` 或 `/product/ppf` | P0 |
| 新能源新车车主 | “刚提车，不知道先做什么” | 推荐“新车基础保护组合” | P0 |
| 商务/家庭 MPV 车主 | “想提升后排舒适和质感” | 推荐商务舒适升级组合 | P1 |
| 比较型用户 | “小米 YU7 和问界 M8 项目差别在哪” | 从车型卡片进入各车型方案，而不是在入口页展开所有细节 | P1 |
| 搜索用户 | 搜“问界 M8 改装 / 小米 YU7 轻改” | 入口页提供品牌/车型内链，帮助搜索引擎发现单车型页 | P1 |

---

## 5. 页面信息架构

```text
/product 产品中心
├── Hero：蓝辉轻改做什么
├── 双入口选择：按车型找 / 按项目找
├── 快速搜索：输入车型或项目
├── 按车型找
│   ├── 问界：M6 / M7 / M8
│   ├── 小米：SU7 / YU7
│   ├── 极氪：9X
│   ├── 理想：i8
│   └── 其他品牌：特斯拉 / 小鹏 / 腾势 / 岚图 / 乐道 / 高山 / 智界
├── 按项目找
│   ├── P0 汽车膜系：车衣 / 窗膜 / 改色膜
│   ├── P0 轻改装备：电动踏板 / 轮毂 / 底盘
│   └── P1 项目服务：脚垫 / 地板 / 小桌板 / 氛围灯 / 后排娱乐等
├── 推荐组合
│   ├── 新车基础保护
│   ├── 商务舒适升级
│   └── 外观姿态升级
```

---

## 6. 页面模块详细规格

### 6.1 Hero

| 字段 | 内容 |
|---|---|
| Eyebrow | `PRODUCT CENTER` |
| H1 | `产品中心` |
| 副标题 | `按车型找方案，按项目看服务。蓝辉轻改围绕新能源车主的用车场景，提供汽车膜系、轻改装备与车型专属升级方案。` |

Hero 的语气要克制，不做夸张营销；重点让用户知道“可以按车型，也可以按项目”。

### 6.2 双入口选择区

两个大卡片：

| 入口 | 文案 | 点击行为 |
|---|---|---|
| 按车型找 | `我已经有车型，想看这台车适合做哪些升级` | 滚动到 `#vehicle-topics` |
| 按项目找 | `我已经知道想做什么，想了解项目价值和施工流程` | 滚动到 `#service-projects` |

移动端两个卡片上下排列；桌面端左右两列。

### 6.3 快速搜索 / 快速筛选

P1 功能，允许后续实现为纯前端过滤。

| 输入示例 | 命中结果 |
|---|---|
| `M8` | 问界 M8 |
| `YU7` | 小米 YU7 |
| `车衣` | 隐形车衣 `/product/ppf` |
| `电动踏板` | `/product/electric-steps` |
| `脚垫` | P1 项目服务卡片 |

早期可以先做“热门关键词按钮”，不一定马上做输入框。

### 6.4 按车型找

#### 6.4.1 品牌卡片

每个品牌卡片必须显示：

- 品牌名；
- 已规划车型数量；
- 车型标签；
- 进入品牌页按钮；
- 重点车型直达入口。

#### 6.4.2 品牌与车型列表

| 品牌 | Brand Route | 车型入口 | 状态 |
|---|---|---|---|
| 问界 | `/product/wenjie` | `/product/wenjie/m6`、`/product/wenjie/m7`、`/product/wenjie/m8` | P0 |
| 小米 | `/product/xiaomi` | `/product/xiaomi/su7`、`/product/xiaomi/yu7` | P0 |
| 极氪 | `/product/zeekr` | `/product/zeekr/9x` | P0 |
| 理想 | `/product/li-auto` | `/product/li-auto/i8` | P1 |
| 特斯拉 | `/product/tesla` | Model 3 / Y / S / X 后续拆分 | P1 |
| 小鹏 | `/product/xpeng` | `/product/xpeng/gx` | P1 |
| 腾势 | `/product/denza` | `/product/denza/d9` | P1 |
| 岚图 | `/product/voyah` | `/product/voyah/dreamer` | P1 |
| 乐道 | `/product/ledao` | `/product/ledao/l90` | P1 |
| 高山 | `/product/gaoshan` | `/product/gaoshan/8` | P1 |
| 智界 | `/product/zhijie` | `/product/zhijie/v9` | P1 |

品牌页即使暂未实现，也要在数据里标记 `planned`，前端可以显示“方案整理中”。

### 6.5 按项目找

#### 6.5.1 P0 核心服务项目

| 组别 | 项目 | Route | 页面目的 |
|---|---|---|---|
| 汽车膜系 | 隐形车衣 / 车衣 | `/product/ppf` | 新车漆面保护 |
| 汽车膜系 | 汽车窗膜 / 隔热膜 | `/product/window-film` | 隔热、防晒、隐私 |
| 汽车膜系 | 改色膜 | `/product/color-film` | 外观风格表达 |
| 轻改装备 | 电动踏板 | `/product/electric-steps` | 高底盘车型上下车便利 |
| 轻改装备 | 轮毂升级 | `/product/wheels` | 外观姿态与数据匹配 |
| 轻改装备 | 底盘升级 | `/product/chassis` | 底盘防护、护板、平衡杆相关 |

这些卡片必须可以点击进入独立服务页。

#### 6.5.2 P1 项目服务卡片

P1 项目先不全部做独立页面。入口页可以展示“常见升级项目”，按状态区分：

| 项目 | 建议状态 | 点击行为 |
|---|---|---|
| 360 软包脚垫 / 三防脚垫 | 独立页候选 | 跳转 `/product/floor-mats` 或查看详情 |
| 铝地板 / 木地板 | 已有专题，可升级 | 跳转 `/product/flooring` |
| 小桌板 | 聚合页候选 | 跳转商务舒适升级或查看详情 |
| 氛围灯 | 聚合页候选 | 跳转商务舒适升级或查看详情 |
| 后排娱乐电视 | 聚合页候选 | 跳转商务舒适升级或查看详情 |
| 流媒体后视镜 | 聚合页候选 | 跳转安全/便利升级或查看详情 |
| 钢化膜 / 屏幕保护 | 小配件 | 作为车型页项目 |
| 门槛条 / 牌照框 / 防虫网 / 挡泥板 | 小配件 | 不急着独立建页 |

### 6.6 推荐组合

推荐组合不是套餐报价，而是帮助用户理解“哪些项目经常一起做”。

| 组合 | 适合用户 | 包含项目 | 页面作用 |
|---|---|---|---|
| 新车基础保护 | 刚提新能源车 | 车衣 / 窗膜 / 脚垫 / 底盘护板 | 帮助用户理解新车优先级 |
| 商务舒适升级 | MPV / 大六座 SUV | 小桌板 / 后排娱乐 / 氛围灯 / 腿托 / 地板 | 帮助用户理解后排升级方向 |
| 外观姿态升级 | 想提升外观风格 | 改色膜 / 轮毂 / 运动包围 / 卡钳 | 帮助用户理解外观组合逻辑 |
| 日常实用防护 | 家用通勤 | 门槛条 / 防虫网 / 挡泥板 / 屏幕钢化膜 | 帮助用户理解小配件归类 |

推荐组合只做解释和内容分流，不在组合区设置页面私有操作。


## 7. 数据结构建议

```ts
type ProductIndexTab = "by_vehicle" | "by_service";

type ProductIndexServiceCard = {
  slug: string;
  name: string;
  group: "film" | "light_mod" | "business_comfort" | "practical_accessory";
  priority: "P0" | "P1" | "P2";
  route?: string;
  status: "live" | "planned" | "content_only";
  description: string;
  relatedModels?: string[];
};

type ProductIndexBrandCard = {
  brandSlug: string;
  brandName: string;
  route: string;
  status: "live" | "planned";
  models: {
    modelSlug: string;
    modelName: string;
    route: string;
    status: "live" | "planned";
    projectCount?: number;
  }[];
};
```

---

## 8. 路由与链接规则

| 链接来源 | 链接目标 |
|---|---|
| 品牌卡片 | `/product/{brandSlug}` |
| 车型标签 | `/product/{brandSlug}/{modelSlug}` |
| P0 服务卡片 | `/product/{serviceSlug}` |
| P1 已有服务 | 对应 route，例如 `/product/flooring` |
| P1 未建服务 | 停留在卡片详情或跳转相关内容页 |
| legacy 车型链接 | 未来实现时 redirect 到 canonical |

---

## 9. SEO 规范

| 字段 | 内容 |
|---|---|
| Title | `产品中心｜蓝辉轻改 LANHUI` |
| Description | `蓝辉轻改产品中心，支持按车型查看新能源车轻改方案，也可按车衣、窗膜、改色膜、电动踏板、轮毂等项目了解服务。` |
| H1 | `产品中心` |
| H2 | `按车型找方案`、`按项目看服务`、`热门升级组合` |
| JSON-LD | `CollectionPage` + `ItemList` |

SEO 内链要求：

- `/product` 必须链接到所有 live 品牌页；
- `/product` 必须链接到所有 P0 服务项目页；
- planned 车型可以展示但不进入 sitemap；
- legacy alias 不在 `/product` 入口页展示。

---

## 10. 埋点

| 事件 | 触发 | 字段 |
|---|---|---|
| `product_index_view` | 访问 `/product` | `route` |
| `product_entry_tab_click` | 点击按车型 / 按项目 | `tab` |
| `product_brand_click` | 点击品牌卡片 | `brandSlug`, `status` |
| `product_model_click` | 点击车型标签 | `brandSlug`, `modelSlug`, `status` |
| `product_service_click` | 点击服务项目 | `serviceSlug`, `priority`, `status` |
| `product_combo_click` | 点击推荐组合 | `comboSlug` |

---

## 11. 三棱镜验收

### 11.1 实现什么

| 模块 | 结果 |
|---|---|
| 双入口 | 用户能明确选择按车型找或按项目找 |
| 车型入口 | 车型全部挂到品牌下，不再展示平铺 legacy 路由 |
| 项目入口 | P0 服务项目能进入独立服务页 |
| P1 项目 | 能展示规划状态，不强行建薄页面 |
| 推荐组合 | 从业务场景解释常见升级组合 |

### 11.2 怎么实现

| 阶段 | 内容 |
|---|---|
| Phase 1 | 更新 `/product` 页面数据结构，增加 brandCards 和 serviceCards |
| Phase 3 | 增加 planned 状态 UI，避免未实现页面 404 |
| Phase 4 | 接入埋点事件 |
| Phase 5 | 对接 sitemap/canonical 策略 |

### 11.3 怎么验收

| 验收项 | 标准 |
|---|---|
| 路由规范 | 页面不再主推 `/product/wenjie-m8` 这类平铺路由 |
| 车型归属 | M6/M7/M8 均显示在问界品牌下 |
| 项目归属 | 车衣、窗膜、改色膜、电动踏板、轮毂、底盘均在 P0 项目区 |
| P1 状态 | P1 项目有 live / planned / content_only 标识 |
| 移动端 | 390px 下无横向滚动，双入口卡片清晰 |
| 合规 | 不出现官方授权、最低价、绝对无损、不影响质保等表达 |
| SEO | title / description / H1 / H2 符合规范 |

---

## 12. 暂不做

- 暂不做电商 SKU、库存和价格。
- 暂不在入口页展开所有车型项目详情。
- 暂不让每个 P1 小配件都独立成页。
- 暂不在车型下创建项目子路由，例如 `/product/wenjie/m8/window-film`。
- 暂不承诺所有项目适配所有车型。

---

## 13. 变更记录

| 日期 | 版本 | 说明 |
|---|---|---|
| 2026-06-25 | v2 | 将产品中心入口页升级为“按车型找 + 按项目找”的双入口结构，并引入 P1 项目服务规划状态。 |
