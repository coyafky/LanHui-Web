# 产品中心 PRD

> 6 大产品线 + 主题专项。SSG 优先,主题专项用字面量类型防图片规格漂移。

## 范围

| 路由 | 子 PRD | 状态 |
|---|---|---|
| `/product` (入口) | [PRODUCT_INDEX_PRD_2026-06-20.md](./PRODUCT_INDEX_PRD_2026-06-20.md) | 🟢 v1 (322 行) |
| `/product/electric-steps` | [ELECTRIC_STEPS_PRD_2026-06-20.md](./ELECTRIC_STEPS_PRD_2026-06-20.md) | 🟢 v1 (236 行) |
| `/product/wheels` | [WHEELS_PRD_2026-06-20.md](./WHEELS_PRD_2026-06-20.md) | 🟢 v1 (232 行) |
| `/product/chassis` | [CHASSIS_PRD_2026-06-20.md](./CHASSIS_PRD_2026-06-20.md) | 🟢 v1 (230 行) |
| `/product/window-film` `/[packageSlug]` | (待补 v1) | ⚪ (v0 已归档) |
| `/product/color-film` | [COLOR_FILM_PRD_2026-06-20.md](./COLOR_FILM_PRD_2026-06-20.md) | 🟢 v1 (282 行) |
| `/product/ppf` | [PPF_PRD_2026-06-20.md](./PPF_PRD_2026-06-20.md) | 🟢 v1 (293 行) |
| `/product/wenjie` (问界) | (待补 v1) | ⚪ (v0 已归档) |
| `/product/xiaomi` (小米 SU7) | (待补 v1) | ⚪ (v0 已归档) |
| `/product/zeekr` (极氪) | [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) | 🟢 v1 (canonical,2026-06-16 合并) |
| `/product/flooring` (木地板) | (待补 v1) | ⚪ (v0 已归档) |

## 完成度

- 6/11 子 PRD v1 已建(其中 1 = ZEEKR canonical 2026-06-16,5 = 2026-06-20 批 2 新写)
- 5/11 待补(window-film / wenjie / xiaomi / flooring 待写,4 个 v0 已归档)

## 子 PRD 模板

[../_templates/product.md](../_templates/product.md)

## 主题专项结构(已验证 — 参照 ZEEKR v1)

每个主题专项 (wenjie / xiaomi / zeekr / flooring) 共享结构:

1. `src/lib/<topic>-products.ts` — 静态数据 + **字面量类型**(1448×1086, 4:3)
2. `src/components/<topic>/` — 5 组件: `AnchorNav` / `ProductCard` (3 态 UI) / `ProductGrid` / `ProductTable` / `TopicBanner`
3. `src/app/product/<topic>/page.tsx` — RSC: Hero + 锚点导航 + N 车型 section + 服务流程 + CTA + JSON-LD ItemList
4. `src/app/product/page.tsx` 加 `<XxxTopicBanner />` 入口
5. CI 脚本(如 `scripts/verify-zeekr-images.mjs`)链入 `npm run check`

**主题配色**:
- xiaomi = orange
- wenjie = cyan
- zeekr = orange
- flooring = amber

**图片容器**: `aspect-[4/3] + object-contain + Next/Image sizes`

## 6 大产品线(通用模式)

5 个产品页 (electric-steps / wheels / chassis / color-film / ppf) 共享 `<ProductDetail>` 渲染器:
- 数据源:`src/lib/products.ts` 统一聚合(`getProduct(slug)`)
- 模式: Hero + 卖点 + 参数表 + 服务流程 + CTA
- **不**走主题专项 5 组件模式(无 N 款式列表)
- **不**需要字面量类型 / 3 态 imageStatus / CI 验证脚本

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
- ZEEKR 模板: [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md)
- ZEEKR 旧版 (归档): [../archive/ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-14.md.archive](../archive/ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-14.md.archive)
