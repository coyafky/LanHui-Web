# SPEC: 产品页面 PRD → SPEC 映射表

> 用途：统一 `/product` 全部产品页面 PRD 与 SPEC 的对应关系。  
> 当前日期：2026-06-25。后续新增产品 PRD 时，必须同步更新本文。

---

## 1. 映射原则

产品页文档分三层：

| 层级 | 作用 | 示例 |
|---|---|---|
| PRD | 定义要做什么、面向谁、业务边界是什么 | `docs/PRD/product/WENJIE_M8_TOPIC_PRD_2026-06-25.md` |
| SPEC | 定义怎么落地、页面结构、组件契约、验收标准 | `docs/SPEC/public-site/product-topics.md` |
| Status / 执行记录 | 跟踪做到哪、已知问题、测试结果 | `docs/SPEC/INDEX.md` 与测试报告 |

一个 PRD 可以映射到一个 primary SPEC，也可以有 secondary SPEC：

- **primary SPEC**：该 PRD 的主要实现合约。
- **secondary SPEC**：该 PRD 需要遵守的跨页面/组件/路由规范。

通用规则：

- `/product` 入口页 PRD → `product-center.md`
- 车膜服务 PRD → `product-film.md`
- 轻改装备 / P1 项目服务 PRD → `product-accessories.md`
- 品牌专题 / 单车型专题 PRD → `product-topics.md`
- 所有产品页共同遵守 → `components/topic-pattern.md`

---

## 2. 总纲与入口页

| PRD | 页面 / 路由 | Primary SPEC | Secondary SPEC | 状态 |
|---|---|---|---|---|
| [PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md](../../PRD/product/PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md) | `/product` 全部子路由 | [product-center.md](./product-center.md) | [product-topics.md](./product-topics.md), [product-accessories.md](./product-accessories.md), [product-film.md](./product-film.md), [topic-pattern.md](../components/topic-pattern.md) | ✅ 已落地(11 BRANDS + 13 MODELS + 10 SERVICES 注册表) |
| [PRODUCT_INDEX_PRD_2026-06-25.md](../../PRD/product/PRODUCT_INDEX_PRD_2026-06-25.md) | `/product` v2 | [product-center.md](./product-center.md) | [product-topics.md](./product-topics.md), [product-accessories.md](./product-accessories.md), [topic-pattern.md](../components/topic-pattern.md) | ✅ v3 已落地(双入口 + 三大业务地图 + StickyTabBar + FAQ + 推荐组合 + P1 折叠) |
| [PRODUCT_INDEX_PRD_2026-06-20.md](../../PRD/product/PRODUCT_INDEX_PRD_2026-06-20.md) | `/product` v1 | [product-center.md](./product-center.md) | [topic-pattern.md](../components/topic-pattern.md) | 历史基线(已被 v2/v3 替代) |
| [P1_SERVICE_PROJECTS_PRD_2026-06-25.md](../../PRD/product/P1_SERVICE_PROJECTS_PRD_2026-06-25.md) | P1 项目规划 | [product-accessories.md](./product-accessories.md) | [product-center.md](./product-center.md), [topic-pattern.md](../components/topic-pattern.md) | 🔧 部分落地(flooring live;3 P1 planned 占位) |

---

## 3. P0 车膜服务页

| PRD | Canonical Route | Primary SPEC | Secondary SPEC | 状态 |
|---|---|---|---|---|
| [WINDOW_FILM_TOPIC_PRD_2026-06-20.md](../../PRD/product/WINDOW_FILM_TOPIC_PRD_2026-06-20.md) | `/product/window-film`, `/product/window-film/[packageSlug]` | [product-film.md](./product-film.md) | [product-center.md](./product-center.md), [topic-pattern.md](../components/topic-pattern.md) | 已实现 v1 |
| [PPF_PRD_2026-06-20.md](../../PRD/product/PPF_PRD_2026-06-20.md) | `/product/ppf` | [product-film.md](./product-film.md) | [product-center.md](./product-center.md), [topic-pattern.md](../components/topic-pattern.md) | 已实现 v1 |
| [COLOR_FILM_PRD_2026-06-20.md](../../PRD/product/COLOR_FILM_PRD_2026-06-20.md) | `/product/color-film` | [product-film.md](./product-film.md) | [product-center.md](./product-center.md), [topic-pattern.md](../components/topic-pattern.md) | 已实现 v1 |

关联旧公开站 PRD：

| PRD | 映射 SPEC | 说明 |
|---|---|---|
| [FILM_PRODUCT_EXPERIENCE_PRD_2026-06-22.md](../../PRD/public-site/FILM_PRODUCT_EXPERIENCE_PRD_2026-06-22.md) | [product-film.md](./product-film.md) | 旧公开站膜类体验规划，作为膜类服务页 v1 背景文档 |

---

## 4. P0 轻改装备服务页

| PRD | Canonical Route | Primary SPEC | Secondary SPEC | 状态 |
|---|---|---|---|---|
| [ELECTRIC_STEPS_PRD_2026-06-20.md](../../PRD/product/ELECTRIC_STEPS_PRD_2026-06-20.md) | `/product/electric-steps` | [product-accessories.md](./product-accessories.md) | [product-center.md](./product-center.md), [topic-pattern.md](../components/topic-pattern.md) | ✅ 已实现 v1(17 行共享 ProductDetail) |
| [WHEELS_PRD_2026-06-20.md](../../PRD/product/WHEELS_PRD_2026-06-20.md) | `/product/wheels` | [product-accessories.md](./product-accessories.md) | [product-center.md](./product-center.md), [topic-pattern.md](../components/topic-pattern.md) | ✅ 已实现 v1(17 行共享 ProductDetail) |
| [CHASSIS_PRD_2026-06-20.md](../../PRD/product/CHASSIS_PRD_2026-06-20.md) | `/product/chassis` | [product-accessories.md](./product-accessories.md) | [product-center.md](./product-center.md), [topic-pattern.md](../components/topic-pattern.md) | ✅ 已实现 v1(17 行共享 ProductDetail) |
| [FLOORING_TOPIC_PRD_2026-06-20.md](../../PRD/product/FLOORING_TOPIC_PRD_2026-06-20.md) | `/product/flooring` | [product-accessories.md](./product-accessories.md) | [product-center.md](./product-center.md), [topic-pattern.md](../components/topic-pattern.md) | ✅ 已实现 v1 专题(223 行自定义布局,4 品牌 × 4 色 = 16 张图,待升级为完整服务项目页) |

关联旧公开站 PRD：

| PRD | 映射 SPEC | 说明 |
|---|---|---|
| [VEHICLE_PROJECT_PAGE_PRD_2026-06-22.md](../../PRD/public-site/VEHICLE_PROJECT_PAGE_PRD_2026-06-22.md) | [product-accessories.md](./product-accessories.md) | 旧配件产品页规划 |
| [LIGHT_MOD_PROJECT_PAGES_PRD_2026-06-22.md](../../PRD/public-site/LIGHT_MOD_PROJECT_PAGES_PRD_2026-06-22.md) | [product-accessories.md](./product-accessories.md) | 轻改项目页规划 |

---

## 5. 品牌专题页

| PRD | Canonical Route | Primary SPEC | Secondary SPEC | 状态 |
|---|---|---|---|---|
| [WENJIE_TOPIC_PRD_2026-06-20.md](../../PRD/product/WENJIE_TOPIC_PRD_2026-06-20.md) | `/product/wenjie` | [product-topics.md](./product-topics.md) | [product-center.md](./product-center.md), [topic-pattern.md](../components/topic-pattern.md) | 已实现 v1，待适配车型二级入口 |
| [WENJIE_SERIES_UPGRADE_PRD_2026-06-24.md](../../PRD/product/WENJIE_SERIES_UPGRADE_PRD_2026-06-24.md) | `/product/wenjie` | [product-topics.md](./product-topics.md) | [topic-pattern.md](../components/topic-pattern.md) | 规划中 |
| [XIAOMI_TOPIC_PRD_2026-06-20.md](../../PRD/product/XIAOMI_TOPIC_PRD_2026-06-20.md) | `/product/xiaomi` | [product-topics.md](./product-topics.md) | [product-center.md](./product-center.md), [topic-pattern.md](../components/topic-pattern.md) | 已实现 v1，待拆 SU7/YU7 |
| [XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md](../../PRD/product/XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md) | `/product/xiaomi` | [product-topics.md](./product-topics.md) | [topic-pattern.md](../components/topic-pattern.md) | 规划中 |
| [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](../../PRD/product/ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) | `/product/zeekr` | [product-topics.md](./product-topics.md) | [topic-pattern.md](../components/topic-pattern.md) | canonical 示例 |
| [TESLA_TOPIC_PRD_2026-06-24.md](../../PRD/product/TESLA_TOPIC_PRD_2026-06-24.md) | `/product/tesla` | [product-topics.md](./product-topics.md) | [product-center.md](./product-center.md), [topic-pattern.md](../components/topic-pattern.md) | 待实现 |
| [LI_AUTO_TOPIC_PRD_2026-06-24.md](../../PRD/product/LI_AUTO_TOPIC_PRD_2026-06-24.md) | `/product/li-auto` | [product-topics.md](./product-topics.md) | [product-center.md](./product-center.md), [topic-pattern.md](../components/topic-pattern.md) | 待实现 |

---

## 6. 单车型专题页

> **2026-06-25 增补**:为 13 个单车型各建立独立 SPEC(`product/models/<brand>-<model>.md`),统一收录 canonical route / data model / 项目分类 / 字段约定 / 实施状态。全部状态为 `planned`(父品牌未上线 / 无 `page.tsx`)。

| PRD | Canonical Route | Legacy Alias | Per-Model SPEC | Primary SPEC | Secondary SPEC | 状态 |
|---|---|---|---|---|---|---|
| [WENJIE_M6_TOPIC_PRD_2026-06-25.md](../../PRD/product/WENJIE_M6_TOPIC_PRD_2026-06-25.md) | `/product/wenjie/m6` | `/product/wenjie-m6` | [models/wenjie-m6.md](./product/models/wenjie-m6.md) | [product-topics.md](./product-topics.md) | [topic-pattern.md](../components/topic-pattern.md) | ⚪ planned (P0, 30 项目) |
| [WENJIE_M7_TOPIC_PRD_2026-06-25.md](../../PRD/product/WENJIE_M7_TOPIC_PRD_2026-06-25.md) | `/product/wenjie/m7` | `/product/wenjie-m7` | [models/wenjie-m7.md](./product/models/wenjie-m7.md) | [product-topics.md](./product-topics.md) | [topic-pattern.md](../components/topic-pattern.md) | ⚪ planned (P0, 32 项目) |
| [WENJIE_M8_TOPIC_PRD_2026-06-25.md](../../PRD/product/WENJIE_M8_TOPIC_PRD_2026-06-25.md) | `/product/wenjie/m8` | `/product/wenjie-m8` | [models/wenjie-m8.md](./product/models/wenjie-m8.md) | [product-topics.md](./product-topics.md) | [topic-pattern.md](../components/topic-pattern.md) | 🟡 部分 (P0, 30 项目;`wenjie-products.ts` 已有 22 M8 旧数据,无 page.tsx) |
| [XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md](../../PRD/product/XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md) ⓢ | `/product/xiaomi/su7` | (暂无) | [models/xiaomi-su7.md](./product/models/xiaomi-su7.md) | [product-topics.md](./product-topics.md) | [topic-pattern.md](../components/topic-pattern.md) | ⚪ planned (P0, 26 项目,无 legacy alias) |
| [XIAOMI_YU7_UPGRADE_PRD_2026-06-24.md](../../PRD/product/XIAOMI_YU7_UPGRADE_PRD_2026-06-24.md) | `/product/xiaomi/yu7` | `/product/xiaomi-yu7` | [models/xiaomi-yu7.md](./product/models/xiaomi-yu7.md) | [product-topics.md](./product-topics.md) | [topic-pattern.md](../components/topic-pattern.md) | ⚪ planned (P0, 28 项目) |
| [ZEEKR_9X_UPGRADE_PRD_2026-06-24.md](../../PRD/product/ZEEKR_9X_UPGRADE_PRD_2026-06-24.md) | `/product/zeekr/9x` | `/product/zeekr-9x` | [models/zeekr-9x.md](./product/models/zeekr-9x.md) | [product-topics.md](./product-topics.md) | [topic-pattern.md](../components/topic-pattern.md) | ⚪ planned (P0, 25 项目) |
| [LI_AUTO_I8_TOPIC_PRD_2026-06-24.md](../../PRD/product/LI_AUTO_I8_TOPIC_PRD_2026-06-24.md) | `/product/li-auto/i8` | (暂无) | [models/li-auto-i8.md](./product/models/li-auto-i8.md) | [product-topics.md](./product-topics.md) | [topic-pattern.md](../components/topic-pattern.md) | ⚪ planned (P1, 25 项目) |
| [DENZA_D9_TOPIC_PRD_2026-06-24.md](../../PRD/product/DENZA_D9_TOPIC_PRD_2026-06-24.md) | `/product/denza/d9` | `/product/denza-d9` | [models/denza-d9.md](./product/models/denza-d9.md) | [product-topics.md](./product-topics.md) | [topic-pattern.md](../components/topic-pattern.md) | ⚪ planned (P1, 22 项目) |
| [VOYAH_DREAMER_TOPIC_PRD_2026-06-25.md](../../PRD/product/VOYAH_DREAMER_TOPIC_PRD_2026-06-25.md) | `/product/voyah/dreamer` | `/product/voyah-dreamer` | [models/voyah-dreamer.md](./product/models/voyah-dreamer.md) | [product-topics.md](./product-topics.md) | [topic-pattern.md](../components/topic-pattern.md) | ⚪ planned (P1, 20 项目,modelSlug=`dreamer`) |
| [XPENG_GX_TOPIC_PRD_2026-06-25.md](../../PRD/product/XPENG_GX_TOPIC_PRD_2026-06-25.md) | `/product/xpeng/gx` | `/product/xpeng-gx` | [models/xpeng-gx.md](./product/models/xpeng-gx.md) | [product-topics.md](./product-topics.md) | [topic-pattern.md](../components/topic-pattern.md) | ⚪ planned (P1, 22 项目) |
| [LEDAO_L90_TOPIC_PRD_2026-06-24.md](../../PRD/product/LEDAO_L90_TOPIC_PRD_2026-06-24.md) | `/product/ledao/l90` | `/product/ledao-l90` | [models/ledao-l90.md](./product/models/ledao-l90.md) | [product-topics.md](./product-topics.md) | [topic-pattern.md](../components/topic-pattern.md) | ⚪ planned (P1, 20 项目) |
| [GAOSHAN_8_TOPIC_PRD_2026-06-25.md](../../PRD/product/GAOSHAN_8_TOPIC_PRD_2026-06-25.md) | `/product/gaoshan/8` | `/product/gaoshan-8` | [models/gaoshan-8.md](./product/models/gaoshan-8.md) | [product-topics.md](./product-topics.md) | [topic-pattern.md](../components/topic-pattern.md) | ⚪ planned (P1, 23 项目,modelSlug=`8`) |
| [ZHIJIE_V9_TOPIC_PRD_2026-06-25.md](../../PRD/product/ZHIJIE_V9_TOPIC_PRD_2026-06-25.md) | `/product/zhijie/v9` | `/product/zhijie-v9` | [models/zhijie-v9.md](./product/models/zhijie-v9.md) | [product-topics.md](./product-topics.md) | [topic-pattern.md](../components/topic-pattern.md) | ⚪ planned (P1, 22 项目) |

说明：

- ⓢ XIAOMI SU7 当前无独立 PRD，由 [XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md](../../PRD/product/XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md) 承接业务定义；2026-06-25 已先行建立 [models/xiaomi-su7.md](./product/models/xiaomi-su7.md) Per-Model SPEC,等 SU7 业务正式拆 PRD 时关联即可。
- 特斯拉 Model 3 / Y / S / X 当前由 [TESLA_TOPIC_PRD_2026-06-24.md](../../PRD/product/TESLA_TOPIC_PRD_2026-06-24.md) 承接,后续单车型拆分后补建 `models/tesla-*.md`。
- modelSlug 特殊命名:`voyah/dreamer`(英文单词)、`gaoshan/8`(纯数字)。其他均为 `字母+数字` 拼音/英文。
- 无 legacy alias 的 2 个特例:`xiaomi-su7`(canonical 直挂)与 `li-auto-i8`(新增品牌,无历史 URL)。

---

## 7. 公开站上位产品 PRD 映射

| PRD | 映射 SPEC | 说明 |
|---|---|---|
| [PRODUCT_PAGE_SYSTEM_PRD_2026-06-22.md](../../PRD/public-site/PRODUCT_PAGE_SYSTEM_PRD_2026-06-22.md) | [product-center.md](./product-center.md) | 旧公开站产品体系规划，已被 2026-06-25 产品路由治理细化 |
| [PRODUCT_INFORMATION_ARCHITECTURE_PRD_2026-06-22.md](../../PRD/public-site/PRODUCT_INFORMATION_ARCHITECTURE_PRD_2026-06-22.md) | [product-center.md](./product-center.md), [product-topics.md](./product-topics.md) | 产品信息架构背景 |
| [BRAND_VEHICLE_PAGES_PRD_2026-06-22.md](../../PRD/public-site/BRAND_VEHICLE_PAGES_PRD_2026-06-22.md) | [product-topics.md](./product-topics.md) | 品牌车型页规划 |
| [FRONTEND_PAGE_SYSTEM_PRD_2026-06-22.md](../../PRD/public-site/FRONTEND_PAGE_SYSTEM_PRD_2026-06-22.md) | [product-center.md](./product-center.md), [topic-pattern.md](../components/topic-pattern.md) | 前端页面体系背景 |

---

## 8. 新增 PRD 时的同步规则

新增任何产品 PRD 时，必须同步完成：

1. 在 [docs/PRD/product/README.md](../../PRD/product/README.md) 注册 PRD；
2. 在本文添加 PRD → SPEC 映射；
3. 如果是新页面类型，先更新对应 SPEC，再进入实现；
4. 如果是新车型，必须明确 `brandSlug`、`modelSlug`、canonical route 和 legacy alias 策略；
5. 如果是新服务项目，必须明确 P0 / P1 / P2、live / planned / content_only 状态；
6. 如果需要新组件模式，更新 [topic-pattern.md](../components/topic-pattern.md)。

---

> 最后更新: 2026-06-25

---

## 9. SPEC 落地状态总览(2026-06-25 实测)

四个产品 SPEC 当前落地状态:

| SPEC | 文件 | 落地状态 | 实际组件数 | 实际路由数 |
|---|---|---|---:|---:|
| 产品中心入口 | [product-center.md](./product-center.md) | ✅ v3 全量落地 | 20 组件(9 v3 + 11 utility) | 1(/product) |
| 膜类服务 | [product-film.md](./product-film.md) | ✅ 3 膜类 + 7 套餐子页全落地 | 11 组件(1 共享 + 10 窗膜/film) | 4(3 膜 + 7 子页) |
| 轻改装备 + 实用配件 | [product-accessories.md](./product-accessories.md) | 🔧 4 live + 3 P1 planned | 6 组件(1 共享 + 5 flooring) | 4 live + 3 planned(404 until built) |
| 品牌 / 车型专题 | [product-topics.md](./product-topics.md) | 🔧 3 品牌 live + 8 planned + 13 车型 planned | 15 组件(3 品牌 × 5) | 3 live + 8 brand dir + 13 model dir built-but-empty |
| **13 单车型专题** | [product/models/](./product/models/) × 13 | ⚪ **全部 planned,无 page.tsx** | 0 组件(待新建) | 13 dir built(空),等 8 个父品牌上线后逐个落地 |

> 注:已落地 SPEC 状态基于 `git log` + `src/app/product/*/page.tsx` 实际核验(2026-06-25);P1 planned 服务仅在 `product-routes.ts` 注册,无 `page.tsx`。
>
> **13 单车型 SPEC 落地路径**:6 P0(问界 M6/M7/M8 + 小米 SU7/YU7 + 极氪 9X)需要等父品牌页上线后逐个实现;7 P1(理想 i8 / 腾势 D9 / 岚图梦想家 / 小鹏 GX / 乐道 L90 / 高山 8 / 智界 V9)优先级次之。每个 SPEC 已明确列出「实施 TODO」6 步(数据源 → 图资源 → 5 组件 → page.tsx → verify 脚本 → 入口链接)。

