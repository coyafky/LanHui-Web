# SPEC: 产品中心 Product Center

> 对应 PRD：`docs/PRD/product/PRODUCT_INDEX_PRD_2026-06-25.md` / `docs/PRD/product/PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md` / `docs/PRD/product/P1_SERVICE_PROJECTS_PRD_2026-06-25.md`  
> 实现状态：🔧 **部分完成，v2 待重构**

---

## 1. 职责范围

`/product` 是蓝辉轻改公开站的产品总入口，不再只是“产品卡片列表”。新版职责是把用户分成两条路径：

- **按车型找**：用户先确定自己的车，例如问界 M8、小米 YU7、理想 i8。
- **按项目找**：用户先确定想做的项目，例如车衣、窗膜、改色膜、电动踏板、轮毂、底盘。

页面只负责内容展示、路由分流、服务解释、SEO 内链和品牌能力表达。具体沟通承接由首页或全站 Header/Footer 处理，不在产品中心内重复放置页面私有转化区。

## 2. 前端设计方向

基于 `frontend-design` 与 `ui-ux-pro-max` 的设计约束，产品中心采用“新能源科技 + 精密工业 + 克制豪华”的视觉方向：

| 维度 | 规范 |
|---|---|
| 视觉气质 | 深蓝/石墨黑基底、金属灰卡片、蓝辉橙作为少量强调色，避免通用紫色渐变和模板感 |
| 信息密度 | 首页式导购，不做长篇详情；每个卡片只回答“适合谁 / 去哪里看” |
| 版式 | 移动端单列优先，桌面端双入口左右分栏 + 品牌/项目矩阵 |
| 动效 | 仅用于卡片 hover、锚点切换、展开收起，150–300ms，必须支持 reduced-motion |
| 图像 | 首屏主视觉允许 priority；下方车型/项目图 lazy load；所有图片预留比例避免 CLS |
| 可访问性 | 链接卡片必须可键盘访问，有可见 focus；图像 alt 说明车型或项目用途 |

## 3. 路由

| 路径 | 类型 | 说明 | 状态 |
|---|---|---|---|
| `/product` | page (RSC) | 产品总入口，双入口分流 | ✅ v1 已有，v2 待重构 |

## 4. 页面信息架构

```text
/product
├── Hero：蓝辉轻改产品中心，一句话解释“按车型找 / 按项目找”
├── 双入口选择：按车型找方案 / 按项目看服务
├── 快速关键词：M8 / YU7 / 车衣 / 窗膜 / 电动踏板 / 轮毂
├── 按车型找
│   ├── 品牌卡片：问界 / 小米 / 极氪 / 理想 / 特斯拉 / 小鹏 / 腾势 / 岚图 / 乐道 / 高山 / 智界
│   └── 车型直达：/product/{brandSlug}/{modelSlug}
├── 按项目找
│   ├── P0 汽车膜系：PPF / 窗膜 / 改色膜
│   ├── P0 轻改装备：电动踏板 / 轮毂 / 底盘
│   └── P1 项目服务：脚垫 / 地板 / 商务舒适升级 / 底盘护板等
├── 热门升级组合：新车保护 / 商务舒适 / 外观姿态 / 日常防护
└── SEO 内链区：品牌页、车型页、核心服务页
```

## 5. 核心模块规格

### 5.1 Hero

| 字段 | 内容 |
|---|---|
| Eyebrow | `PRODUCT CENTER` |
| H1 | `产品中心` |
| 副标题 | `按车型找方案，按项目看服务。蓝辉轻改围绕新能源车主的用车场景，提供汽车膜系、轻改装备与车型专属升级方案。` |
| 首屏视觉 | 可使用品牌级新能源车剪影、门店施工质感图或抽象工业背景，不绑定单一车型 |

Hero 不承担下单引导，只负责解释页面结构和品牌专业感。

### 5.2 双入口选择区

| 入口 | 文案 | 行为 |
|---|---|---|
| 按车型找 | `我已经有车型，想看这台车适合做哪些升级` | 锚点滚动到 `#vehicle-topics` |
| 按项目找 | `我已经知道想做什么，想了解项目价值和施工流程` | 锚点滚动到 `#service-projects` |

交互要求：

- 卡片点击区域不小于 44px 高度；
- hover/active/focus 状态清晰；
- 移动端上下排列，桌面端左右并排；
- 锚点跳转后不遮挡标题。

### 5.3 按车型找

品牌卡片必须显示：

- 品牌名；
- 品牌页 route；
- 已规划车型数量；
- 车型标签；
- live / planned 状态；
- 重点车型直达入口。

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

### 5.4 按项目找

P0 项目卡片必须进入独立服务页：

| 组别 | 项目 | Route | 页面目的 |
|---|---|---|---|
| 汽车膜系 | 隐形车衣 / 车衣 | `/product/ppf` | 新车漆面保护 |
| 汽车膜系 | 汽车窗膜 / 隔热膜 | `/product/window-film` | 隔热、防晒、隐私 |
| 汽车膜系 | 改色膜 | `/product/color-film` | 外观风格表达 |
| 轻改装备 | 电动踏板 | `/product/electric-steps` | 高底盘车型上下车便利 |
| 轻改装备 | 轮毂升级 | `/product/wheels` | 外观姿态与数据匹配 |
| 轻改装备 | 底盘升级 | `/product/chassis` | 底盘防护、护板、平衡杆相关 |

P1 项目卡片展示规划状态：

| 项目 | 建议状态 | 行为 |
|---|---|---|
| 360 软包脚垫 / 三防脚垫 | 独立页候选 | 后续 `/product/floor-mats` |
| 铝地板 / 木地板 | 已有专题，可升级 | `/product/flooring` |
| 底盘护板 | 并入底盘页 | `/product/chassis#skid-plate` |
| 商务舒适升级 | 聚合页候选 | 后续 `/product/business-comfort` |
| 小桌板 / 氛围灯 / 后排娱乐 / 腿托 | 聚合展示 | 归入商务舒适升级 |
| 门槛条 / 牌照框 / 防虫网 / 挡泥板 | 小配件 | 车型页项目卡展示 |

### 5.5 热门升级组合

推荐组合用于解释业务场景，不做固定套餐报价。

| 组合 | 适合用户 | 包含项目 |
|---|---|---|
| 新车基础保护 | 刚提新能源车 | 车衣、窗膜、脚垫、底盘护板 |
| 商务舒适升级 | MPV / 大六座 SUV | 小桌板、后排娱乐、氛围灯、腿托、地板 |
| 外观姿态升级 | 想提升外观风格 | 改色膜、轮毂、运动包围、卡钳 |
| 日常实用防护 | 家用通勤 | 门槛条、防虫网、挡泥板、屏幕保护 |

## 6. 数据结构建议

```ts
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

## 7. 关键组件

| 组件 | 建议路径 | Client? | 职责 |
|---|---|---:|---|
| ProductIndexHero | `src/components/product/ProductIndexHero.tsx` | 否 | 产品中心首屏说明 |
| ProductEntrySwitch | `src/components/product/ProductEntrySwitch.tsx` | 是 | 双入口锚点跳转 |
| BrandModelMatrix | `src/components/product/BrandModelMatrix.tsx` | 否 | 品牌与车型矩阵 |
| ServiceProjectGrid | `src/components/product/ServiceProjectGrid.tsx` | 否 | P0/P1 项目卡片 |
| UpgradeComboGuide | `src/components/product/UpgradeComboGuide.tsx` | 否 | 热门升级组合解释 |
| ProductInternalLinks | `src/components/product/ProductInternalLinks.tsx` | 否 | SEO 内链 |

## 8. SSR/ISR 配置

SSG（静态生成）为主，建议 `revalidate=3600`。入口页数据来自静态配置，后续如接入后台 CMS，也必须保证 build 无数据库时仍可 fallback。

## 9. 埋点

| 事件 | 触发 | 字段 |
|---|---|---|
| `product_index_view` | 访问 `/product` | `route` |
| `product_entry_tab_click` | 点击按车型 / 按项目 | `tab` |
| `product_brand_click` | 点击品牌卡片 | `brandSlug`, `status` |
| `product_model_click` | 点击车型标签 | `brandSlug`, `modelSlug`, `status` |
| `product_service_click` | 点击服务项目 | `serviceSlug`, `priority`, `status` |
| `product_combo_click` | 点击推荐组合 | `comboSlug` |

## 10. 验收条件

- [ ] `/product` 首屏清晰表达“按车型找 / 按项目找”。
- [ ] 所有车型入口都挂在品牌二级分类下，不主推平铺 legacy 路由。
- [ ] P0 服务项目均可进入独立服务页。
- [ ] P1 项目显示 live / planned / content_only 状态，不制造薄页面。
- [ ] 390px 下无横向滚动；卡片点击区域不小于 44px。
- [ ] 首屏 LCP 目标 < 3s；下方图片 lazy load 且预留比例。
- [ ] 键盘可完整访问双入口、品牌卡片和服务卡片。
- [ ] SEO metadata 使用 `CollectionPage` + `ItemList`。

## 11. 已知问题

- [P1-5] 现有 v1 产品中心 LCP 约 6.5s，主题图未统一优化 priority/lazy 策略。
- [P2] 地板 TopicBanner 图片含中文路径，后续应迁移为 ASCII slug 路径。
- v2 数据结构尚未落地，需要把品牌/车型/项目矩阵从页面硬编码中抽出。

---

> 最后更新: 2026-06-25

## 12. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|---|---|---|---|---|
| 2026-06-20 | Claude Code | 产品中心入口页 v1 实现 | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | — |
| 2026-06-25 | Codex | 按新版产品路由 PRD 更新 SPEC：双入口、品牌/车型二级路由、P1 项目服务、前端设计基线 | 文档完成 | 待实现 |
