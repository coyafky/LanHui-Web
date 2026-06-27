# 产品中心 PRD

> 6 大产品线 + 品牌/车型二级专题。SSG 优先,主题专项用字面量类型防图片规格漂移。

## 路由治理原则

- 产品中心采用“双入口”：**按项目找** + **按车型找**。
- 服务项目使用 `/product/{serviceSlug}`，例如 `/product/window-film`、`/product/electric-steps`。
- 品牌专题使用 `/product/{brandSlug}`，例如 `/product/wenjie`、`/product/xiaomi`。
- 单车型专题统一使用 `/product/{brandSlug}/{modelSlug}`，例如 `/product/wenjie/m8`、`/product/xiaomi/yu7`。
- 已写过的 `/product/wenjie-m8`、`/product/xiaomi-yu7` 等平铺路由仅作为 legacy alias，不再作为长期 canonical。
- 所有产品页只负责内容展示、项目解释和路由分流；不在产品页设计页面私有操作。
- 用户需要沟通时，由首页或全站 Header/Footer 入口承接，产品 PRD 不再为每个页面单独设计按钮、底部区块或点击埋点。
- 上位规范：[PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md](./PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md)。
- 入口页新版内容规范：[PRODUCT_INDEX_PRD_2026-06-25.md](./PRODUCT_INDEX_PRD_2026-06-25.md)。
- P1 项目服务规划：[P1_SERVICE_PROJECTS_PRD_2026-06-25.md](./P1_SERVICE_PROJECTS_PRD_2026-06-25.md)。

## 范围

| 路由 | 子 PRD | 状态 |
|---|---|---|
| `/product` 路由总纲 | [PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md](./PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md) | 🟡 v0.1（按项目找 + 按车型找；品牌/车型二级路由规范） |
| `/product` (入口) | [PRODUCT_INDEX_PRD_2026-06-25.md](./PRODUCT_INDEX_PRD_2026-06-25.md) + [PRODUCT_INDEX_PRD_2026-06-20.md](./PRODUCT_INDEX_PRD_2026-06-20.md) | 🟡 v2 待实现（双入口内容结构）/ 🟢 v1 历史基线 |
| `/product` P1 项目服务规划 | [P1_SERVICE_PROJECTS_PRD_2026-06-25.md](./P1_SERVICE_PROJECTS_PRD_2026-06-25.md) | 🟡 v0.1（独立页 / 聚合页 / 暂缓独立成页项三层策略） |
| `/product/electric-steps` | [ELECTRIC_STEPS_PRD_2026-06-20.md](./ELECTRIC_STEPS_PRD_2026-06-20.md) | 🟢 v1 (236 行) |
| `/product/wheels` | [WHEELS_PRD_2026-06-20.md](./WHEELS_PRD_2026-06-20.md) | 🟢 v1 (232 行) |
| `/product/chassis` | [CHASSIS_PRD_2026-06-20.md](./CHASSIS_PRD_2026-06-20.md) | 🟢 v1 (230 行) |
| `/product/window-film` `/[packageSlug]` | [WINDOW_FILM_TOPIC_PRD_2026-06-20.md](./WINDOW_FILM_TOPIC_PRD_2026-06-20.md) | 🟢 v1 (501 行, 2026-06-20 批 3) |
| `/product/color-film` | [COLOR_FILM_PRD_2026-06-20.md](./COLOR_FILM_PRD_2026-06-20.md) | 🟢 v1 (282 行) |
| `/product/ppf` | [PPF_PRD_2026-06-20.md](./PPF_PRD_2026-06-20.md) | 🟢 v1 (293 行) |
| `/product/wenjie` (问界) | [WENJIE_TOPIC_PRD_2026-06-20.md](./WENJIE_TOPIC_PRD_2026-06-20.md) + [WENJIE_SERIES_UPGRADE_PRD_2026-06-24.md](./WENJIE_SERIES_UPGRADE_PRD_2026-06-24.md) + [WENJIE_M6_TOPIC_PRD_2026-06-25.md](./WENJIE_M6_TOPIC_PRD_2026-06-25.md) + [WENJIE_M7_TOPIC_PRD_2026-06-25.md](./WENJIE_M7_TOPIC_PRD_2026-06-25.md) + [WENJIE_M8_TOPIC_PRD_2026-06-25.md](./WENJIE_M8_TOPIC_PRD_2026-06-25.md) | 🟢 v1 车型产品 / 🟡 v0.1 海报升级方案 / 🟡 v0.1 M6 单车型升级方案 / 🟡 v0.1 M7 单车型升级方案 / 🟡 v0.1 M8 单车型升级方案 |
| `/product/xiaomi` (小米 SU7/YU7) | [XIAOMI_TOPIC_PRD_2026-06-20.md](./XIAOMI_TOPIC_PRD_2026-06-20.md) + [XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md](./XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md) + [XIAOMI_YU7_UPGRADE_PRD_2026-06-24.md](./XIAOMI_YU7_UPGRADE_PRD_2026-06-24.md) | 🟢 v1 系列产品 / 🟡 v0.1 小米系列海报升级方案 / 🟡 v0.1 YU7 海报升级方案 |
| `/product/zeekr` (极氪) | [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) + [ZEEKR_9X_UPGRADE_PRD_2026-06-24.md](./ZEEKR_9X_UPGRADE_PRD_2026-06-24.md) | 🟢 v1 系列产品 / 🟡 v0.1 9X 海报升级方案 |
| `/product/flooring` (木地板) | [FLOORING_TOPIC_PRD_2026-06-20.md](./FLOORING_TOPIC_PRD_2026-06-20.md) | 🟢 v1 (698 行, 2026-06-20 批 3) |
| `/product/tesla` (特斯拉系列) | [TESLA_TOPIC_PRD_2026-06-24.md](./TESLA_TOPIC_PRD_2026-06-24.md) | 🟡 v0.1（基于特斯拉轻改项目海报规划） |
| `/product/li-auto` (理想系列) | [LI_AUTO_TOPIC_PRD_2026-06-24.md](./LI_AUTO_TOPIC_PRD_2026-06-24.md) + [LI_AUTO_I8_TOPIC_PRD_2026-06-24.md](./LI_AUTO_I8_TOPIC_PRD_2026-06-24.md) | 🟡 v0.1 理想系列海报规划 / 🟡 v0.2 i8 单车型升级方案 |
| `/product/ledao/l90` (乐道 L90; legacy `/product/ledao-l90`) | [LEDAO_L90_TOPIC_PRD_2026-06-24.md](./LEDAO_L90_TOPIC_PRD_2026-06-24.md) | 🟡 v0.1（基于乐道 L90 升级方案海报规划） |
| `/product/zeekr/9x` (极氪 9X; legacy `/product/zeekr-9x`) | [ZEEKR_9X_UPGRADE_PRD_2026-06-24.md](./ZEEKR_9X_UPGRADE_PRD_2026-06-24.md) | 🟡 v0.1（基于极氪 9X 升级方案海报规划） |
| `/product/denza/d9` (腾势 D9; legacy `/product/denza-d9`) | [DENZA_D9_TOPIC_PRD_2026-06-24.md](./DENZA_D9_TOPIC_PRD_2026-06-24.md) | 🟡 v0.1（基于腾势 D9 升级方案海报规划） |
| `/product/xiaomi/yu7` (小米 YU7; legacy `/product/xiaomi-yu7`) | [XIAOMI_YU7_UPGRADE_PRD_2026-06-24.md](./XIAOMI_YU7_UPGRADE_PRD_2026-06-24.md) | 🟡 v0.1（基于小米 YU7 轻改方案海报规划） |
| `/product/voyah/dreamer` (岚图梦想家; legacy `/product/voyah-dreamer`) | [VOYAH_DREAMER_TOPIC_PRD_2026-06-25.md](./VOYAH_DREAMER_TOPIC_PRD_2026-06-25.md) | 🟡 v0.1（基于岚图梦想家升级方案海报规划） |
| `/product/wenjie/m8` (问界 M8; legacy `/product/wenjie-m8`) | [WENJIE_M8_TOPIC_PRD_2026-06-25.md](./WENJIE_M8_TOPIC_PRD_2026-06-25.md) | 🟡 v0.1（基于问界 M8 升级方案海报规划） |
| `/product/wenjie/m7` (问界 M7; legacy `/product/wenjie-m7`) | [WENJIE_M7_TOPIC_PRD_2026-06-25.md](./WENJIE_M7_TOPIC_PRD_2026-06-25.md) | 🟡 v0.1（基于问界 M7 升级方案海报规划） |
| `/product/wenjie/m6` (问界 M6; legacy `/product/wenjie-m6`) | [WENJIE_M6_TOPIC_PRD_2026-06-25.md](./WENJIE_M6_TOPIC_PRD_2026-06-25.md) | 🟡 v0.1（基于问界 M6 升级方案海报规划） |
| `/product/xpeng/gx` (小鹏 GX; legacy `/product/xpeng-gx`) | [XPENG_GX_TOPIC_PRD_2026-06-25.md](./XPENG_GX_TOPIC_PRD_2026-06-25.md) | 🟡 v0.1（基于小鹏 GX 升级方案海报规划） |
| `/product/gaoshan/8` (高山8; legacy `/product/gaoshan-8`) | [GAOSHAN_8_TOPIC_PRD_2026-06-25.md](./GAOSHAN_8_TOPIC_PRD_2026-06-25.md) | 🟡 v0.1（基于高山8 升级方案海报规划） |
| `/product/zhijie/v9` (智界 V9; legacy `/product/zhijie-v9`) | [ZHIJIE_V9_TOPIC_PRD_2026-06-25.md](./ZHIJIE_V9_TOPIC_PRD_2026-06-25.md) | 🟡 v0.1（基于智界 V9 升级方案海报规划） |
| `/product/nio/es8` (蔚来 ES8) | [NIO_ES8_TOPIC_PRD_2026-06-27.md](./NIO_ES8_TOPIC_PRD_2026-06-27.md) | 🟡 v0.1 (规划中, 17 项 AI 预览图) |

## 完成度

- **11/11 既有子 PRD v1 已建 (100%)** ✅；新增产品路由总纲、产品入口页 v2、P1 项目服务规划；Tesla / 理想 / 理想 i8 / 问界升级方案 / 问界 M8 / 问界 M7 / 问界 M6 / 乐道 L90 / 极氪 9X / 腾势 D9 / 小米系列 / 小米 YU7 / 岚图梦想家 / 小鹏 GX / 高山8 / 智界 V9 v0.1 规划中
- 1 = ZEEKR canonical 2026-06-16,10 = 2026-06-20 批 2+3 新写，16 = Tesla / 理想 / 理想 i8 / 问界 / 问界 M8 / 问界 M7 / 问界 M6 / 乐道 L90 / 极氪 9X / 腾势 D9 / 小米系列 / 小米 YU7 / 岚图梦想家 / 小鹏 GX / 高山8 / 智界 V9 2026-06-24~25 海报驱动车型专题规划
- 4 个 v0 已归档 (FLOORING / WENJIE / XIAOMI / WINDOW_FILM 历史版本)

## 子 PRD 模板

[../_templates/product.md](../_templates/product.md)

## 主题专项结构(已验证 — 参照 ZEEKR v1)

每个主题专项 (wenjie / xiaomi / zeekr / flooring) 共享结构:

1. `src/lib/<topic>-products.ts` — 静态数据 + **字面量类型**(1448×1086, 4:3)
2. `src/components/<topic>/` — 5 组件: `AnchorNav` / `ProductCard` (3 态 UI) / `ProductGrid` / `ProductTable` / `TopicBanner`
3. `src/app/product/<topic>/page.tsx` — RSC: Hero + 锚点导航 + N 车型 section + 服务流程 + JSON-LD ItemList；不设置页面私有操作
4. `src/app/product/page.tsx` 加 `<XxxTopicBanner />` 入口
5. CI 脚本(如 `scripts/verify-zeekr-images.mjs`)链入 `npm run check`

**主题配色**:
- xiaomi = orange
- wenjie = cyan
- zeekr = orange
- flooring = amber

**图片容器**: `aspect-[4/3] + object-contain + Next/Image sizes`

### 主题专项特例 (WINDOW_FILM)

WINDOW_FILM 不同于上述 4 主题专项:
- 静态数据在 `src/lib/window-film-details.ts` (而非 `<topic>-products.ts`)
- 路由 `/product/window-film/[packageSlug]` 是 **子页**(套餐详情),非主题 anchor
- 不需要 3 态 imageStatus(套餐图片稳定,无 pending-review)
- 字面量类型同 (1448×1086, 4:3) 防规格漂移
- 不需要 CI 验证脚本(图片已固定)

## 6 大产品线(通用模式)

5 个产品页 (electric-steps / wheels / chassis / color-film / ppf) 共享 `<ProductDetail>` 渲染器:
- 数据源:`src/lib/products.ts` 统一聚合(`getProduct(slug)`)
- 模式: Hero + 卖点 + 参数表 + 服务流程
- **不**走主题专项 5 组件模式(无 N 款式列表)
- **不**需要字面量类型 / 3 态 imageStatus / CI 验证脚本
- **不**在产品页内新增私有操作

## ZEEKR v1 是 canonical 示例

完整参考实现 (2026-06-16, merge `346d5ab`):
- 6 子任务,每个独立 commit + RED→GREEN→回归→build
- 21 张图迁移到 ASCII slug 目录
- 3 态 `imageStatus: matched | pending-review | missing`
- 字面量类型防规格漂移
- 详细报告: `docs/test-reports/ZEEKR_BUILD_REPORT_2026-06-16.md`

## 命名规范

`<PRODUCT>_PRD_<YYYY-MM-DD>.md` 例:
- `ELECTRIC_STEPS_PRD_2026-06-20.md`
- `WENJIE_TOPIC_PRD_2026-06-20.md` (规划 v1)
- 旧 v0 文件归档到 `../archive/`

## 归档 (历史 v0)

只读保留:
- [../archive/FLOORING_MODIFICATION_CATEGORY_PRD_2026-06-13.md.archive](../archive/FLOORING_MODIFICATION_CATEGORY_PRD_2026-06-13.md.archive)
- [../archive/WENJIE_MODIFICATION_TOPIC_PRD_2026-06-13.md.archive](../archive/WENJIE_MODIFICATION_TOPIC_PRD_2026-06-13.md.archive)
- [../archive/XIAOMI_MODIFICATION_TOPIC_PRD_2026-06-12.md.archive](../archive/XIAOMI_MODIFICATION_TOPIC_PRD_2026-06-12.md.archive)
- [../archive/WINDOW_FILM_PACKAGE_DETAIL_PRD_2026-06-14.md.archive](../archive/WINDOW_FILM_PACKAGE_DETAIL_PRD_2026-06-14.md.archive)

## 关联

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §4.1 / §5.2
- 产品路由总纲: [PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md](./PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md)
- 产品入口页 v2: [PRODUCT_INDEX_PRD_2026-06-25.md](./PRODUCT_INDEX_PRD_2026-06-25.md)
- P1 项目服务规划: [P1_SERVICE_PROJECTS_PRD_2026-06-25.md](./P1_SERVICE_PROJECTS_PRD_2026-06-25.md)
- Tesla 专题: [TESLA_TOPIC_PRD_2026-06-24.md](./TESLA_TOPIC_PRD_2026-06-24.md)
- 理想专题: [LI_AUTO_TOPIC_PRD_2026-06-24.md](./LI_AUTO_TOPIC_PRD_2026-06-24.md)
- 理想 i8 专题: [LI_AUTO_I8_TOPIC_PRD_2026-06-24.md](./LI_AUTO_I8_TOPIC_PRD_2026-06-24.md)
- 问界升级方案: [WENJIE_SERIES_UPGRADE_PRD_2026-06-24.md](./WENJIE_SERIES_UPGRADE_PRD_2026-06-24.md)
- 问界 M8 专题: [WENJIE_M8_TOPIC_PRD_2026-06-25.md](./WENJIE_M8_TOPIC_PRD_2026-06-25.md)
- 问界 M7 专题: [WENJIE_M7_TOPIC_PRD_2026-06-25.md](./WENJIE_M7_TOPIC_PRD_2026-06-25.md)
- 问界 M6 专题: [WENJIE_M6_TOPIC_PRD_2026-06-25.md](./WENJIE_M6_TOPIC_PRD_2026-06-25.md)
- 乐道 L90 专题: [LEDAO_L90_TOPIC_PRD_2026-06-24.md](./LEDAO_L90_TOPIC_PRD_2026-06-24.md)
- 极氪 9X 专题: [ZEEKR_9X_UPGRADE_PRD_2026-06-24.md](./ZEEKR_9X_UPGRADE_PRD_2026-06-24.md)
- 腾势 D9 专题: [DENZA_D9_TOPIC_PRD_2026-06-24.md](./DENZA_D9_TOPIC_PRD_2026-06-24.md)
- 小米系列升级方案: [XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md](./XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md)
- 小米 YU7 专题: [XIAOMI_YU7_UPGRADE_PRD_2026-06-24.md](./XIAOMI_YU7_UPGRADE_PRD_2026-06-24.md)
- 岚图梦想家专题: [VOYAH_DREAMER_TOPIC_PRD_2026-06-25.md](./VOYAH_DREAMER_TOPIC_PRD_2026-06-25.md)
- 小鹏 GX 专题: [XPENG_GX_TOPIC_PRD_2026-06-25.md](./XPENG_GX_TOPIC_PRD_2026-06-25.md)
- 高山8 专题: [GAOSHAN_8_TOPIC_PRD_2026-06-25.md](./GAOSHAN_8_TOPIC_PRD_2026-06-25.md)
- 智界 V9 专题: [ZHIJIE_V9_TOPIC_PRD_2026-06-25.md](./ZHIJIE_V9_TOPIC_PRD_2026-06-25.md)
- ZEEKR 模板: [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md)
- ZEEKR 旧版 (归档): [../archive/ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-14.md.archive](../archive/ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-14.md.archive)
