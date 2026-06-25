# SPEC: 问界 M6 单车型专题

> **车型**:问界 M6
> **品牌**:问界(`wenjie`)
> **对应 PRD**:[`WENJIE_M6_TOPIC_PRD_2026-06-25.md`](../../../../PRD/product/WENJIE_M6_TOPIC_PRD_2026-06-25.md)(v0.1)
> **页面类型**:单车型轻改升级方案 PRD
> **实现状态**:⚪ **planned** — 仅在 `product-routes.ts` 注册,无 `page.tsx`
> **创建日期**:2026-06-25

---

## 1. 路由

| 字段 | 值 |
|---|---|
| Canonical Route | `/product/wenjie/m6` |
| Legacy Alias(已注册) | `/product/wenjie-m6` |
| 父路径 | `/product/wenjie` |
| 替代锚点(可选) | `/product/wenjie#m6` |
| Legacy Redirect | `next.config.ts` redirects 配置:`/product/wenjie-m6` → `/product/wenjie/m6` |
| 解析函数 | `getCanonicalFor("/product/wenjie-m6")` → `"/product/wenjie/m6"` |

> Legacy alias 通过 `MODELS.legacyPaths` 自动生成,已包含在 `ALL_LEGACY_ALIASES` 中。

---

## 2. 数据模型(`VehicleModelRoute`)

```typescript
{
  type: "vehicle_model",
  brandSlug: "wenjie",
  modelSlug: "m6",
  modelName: "问界 M6",
  parentPath: "/product/wenjie",
  canonicalPath: "/product/wenjie/m6",
  title: "问界 M6 专属升级方案",
  navLabel: "M6",
  status: "planned",
  priority: "P0",
  projectCount: 30,
  sourcePrd: "docs/PRD/product/WENJIE_M6_TOPIC_PRD_2026-06-25.md",
  legacyPaths: ["/product/wenjie-m6"],
} as const
```

**字段约束**:

- `projectCount = 30`:海报驱动原始 17 + 后续 13 待补充
- `status = "planned"`:`getLiveBrands()` 不返回,`/product` 入口页用 `<BrandPlaceholder>` 展示
- `priority = "P0"`:在 PR0 队列里,但落后于 M7/M8(同 wenjie)
- `sourcePrd`:必填,定位源文档(用于归档与回溯)

---

## 3. 项目分类(按 PRD §3.1 / §5)

| 分类 | 项目数 | 主要项目 | 用户群 |
|---|---:|---|---|
| 新车基础保护 | ~5 | 车衣 / 隔热膜 / 360 软包脚垫 / 底盘护板 / 门槛条 | 新车车主 |
| 家庭 / 商务舒适 | ~4 | 铝地板 / 小桌板 / 氛围灯 / 软包脚垫 | 家庭用户 |
| 外观个性 | ~4 | 彩绘 / 运动包围 / 轮廓视觉 / 门槛条 | 外观个性用户 |
| 电动便利 | ~2 | 电动踏板 / 抬头显示 | 电动便利用户 |
| 屏幕 / 防护 | ~2 | 钢化膜 / 底盘护板 | 屏幕保护用户 |
| **合计** | **30** | — | — |

> 注:具体项目待 PRD 详细化后回填,SPEC 仅记录分类与计数。

---

## 4. 字段约定

| 字段 | 约定 | 备注 |
|---|---|---|
| 车型名 | `问界 M6`(中文 + 空格 + 英文/数字) | 与全站车型命名一致 |
| 品牌 slug | `wenjie` | 来自 `product-routes.ts BRANDS[0]` |
| 型号 slug | `m6` | 小写,与车型卡片一致 |
| 页面 title | `问界 M6 专属升级方案 | 蓝辉轻改 LANHUI` | 参照 wenjie/xiaomi 模板 |
| H1 | `问界 M6 专属升级方案` | — |
| 主题色 | `cyan-400 #22d3ee`(wenjie 品牌色) | 锚点高亮、CTA 边框 |
| 面包屑 | `产品中心 / 问界 / M6` | — |
| JSON-LD | `CollectionPage` + `ItemList`(N 个项目 ListItem) | 与品牌页一致 |

---

## 5. 实施状态

| 维度 | 状态 | 备注 |
|---|---|---|
| 路由注册 | ✅ | `product-routes.ts` MODELS[2] |
| Legacy Redirect | ✅ | `ALL_LEGACY_ALIASES` 已含 |
| 父品牌页 | ✅ | `/product/wenjie` live |
| 模型子目录 | ⚪ 无 | `src/app/product/wenjie/m6/page.tsx` 不存在 |
| 数据源 | ⚪ 无 | `wenjie-products.ts` 仅 M7/M8/M9 数据(无 m6) |
| 5 组件 | ⚪ 无 | `<WenjieM6ProductCard>` 等未实现 |
| 图资源 | ⚪ 无 | `public/images/products/wenjie/M6/` 不存在 |
| 验证脚本 | ⚪ 无 | 需 `verify-m6-images.mjs`(参照 zeekr) |

---

## 6. 实施 TODO(P1 起)

1. 创建 `src/lib/wenjie-m6-products.ts` 静态数据(30 个项目)
2. 迁移 30 张图到 `public/images/products/wenjie/M6/`
3. 创建 `src/components/wenjie/m6/{AnchorNav,ProductCard,ProductGrid,ProductTable,M6TopicBanner}.tsx`
4. 创建 `src/app/product/wenjie/m6/page.tsx`
5. 加 `scripts/verify-m6-images.mjs` + 链入 `npm run check`
6. 在 `<WenjieTopicBanner>` 中加入 M6 入口

---

## 7. 合规边界(摘自 PRD §3.3)

页面不得出现:

- ❌ 问界官方授权 / 华为官方授权 / 鸿蒙智行官方授权
- ❌ 原厂配件 / 官方同款
- ❌ 不影响原厂质保 / 100% 无损安装 / 永久质保
- ❌ 任何不可验证的官方合作表述

适配声明(强制):"不同年份、批次、版本和配置的问界 M6 在尺寸、接口、安装位和结构上可能存在差异。页面项目只作为轻改方向参考,最终以到店确认和施工评估为准。"

---

> 最后更新:2026-06-25(从 PRD v0.1 提取,与 `product-routes.ts` MODELS[2] 一致)
