# 产品中心 PRD

> 6 大产品线 + 主题专项。SSG 优先,主题专项用字面量类型防图片规格漂移。

## 范围

| 路由 | 子 PRD | 状态 |
|---|---|---|
| `/product` (入口) | (待建) | ⚪ |
| `/product/electric-steps` | (待建) | ⚪ |
| `/product/wheels` | (待建) | ⚪ |
| `/product/chassis` | (待建) | ⚪ |
| `/product/window-film` `/[packageSlug]` | [WINDOW_FILM_PACKAGE_DETAIL_PRD_2026-06-14.md](./WINDOW_FILM_PACKAGE_DETAIL_PRD_2026-06-14.md) | 🟡 v0 (待补 v1) |
| `/product/color-film` | (待建) | ⚪ |
| `/product/ppf` | (待建) | ⚪ |
| `/product/wenjie` (问界) | [WENJIE_MODIFICATION_TOPIC_PRD_2026-06-13.md](./WENJIE_MODIFICATION_TOPIC_PRD_2026-06-13.md) | 🟡 v0 (待补 v1) |
| `/product/xiaomi` (小米 SU7) | [XIAOMI_MODIFICATION_TOPIC_PRD_2026-06-12.md](./XIAOMI_MODIFICATION_TOPIC_PRD_2026-06-12.md) | 🟡 v0 (待补 v1) |
| `/product/zeekr` (极氪) | [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) | 🟢 v1 (参照模板) |
| `/product/flooring` (木地板) | [FLOORING_MODIFICATION_CATEGORY_PRD_2026-06-13.md](./FLOORING_MODIFICATION_CATEGORY_PRD_2026-06-13.md) | 🟡 v0 (待补 v1) |

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
- `WENJIE_TOPIC_PRD_2026-06-20.md` (v1 完整版,替代 2026-06-13 v0)
- 旧 v0 文件归档到 `../archive/`

## 关联

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §4.1 / §5.2
- ZEEKR 模板: [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md)
- ZEEKR 旧版 (归档): [../archive/ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-14.md.archive](../archive/ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-14.md.archive)
