# SPEC: 问界 M7 单车型专题

> **车型**:问界 M7
> **品牌**:问界(`wenjie`)
> **对应 PRD**:[`WENJIE_M7_TOPIC_PRD_2026-06-25.md`](../../../../PRD/product/WENJIE_M7_TOPIC_PRD_2026-06-25.md)(v0.1)
> **页面类型**:单车型轻改升级方案 PRD
> **实现状态**:⚪ **planned** — 仅在 `product-routes.ts` 注册,无 `page.tsx`
> **创建日期**:2026-06-25

---

## 1. 路由

| 字段 | 值 |
|---|---|
| Canonical Route | `/product/wenjie/m7` |
| Legacy Alias(已注册) | `/product/wenjie-m7` |
| 父路径 | `/product/wenjie` |
| 替代锚点(可选) | `/product/wenjie#m7-upgrade` |
| Legacy Redirect | `next.config.ts` redirects 配置:`/product/wenjie-m7` → `/product/wenjie/m7` |
| 解析函数 | `getCanonicalFor("/product/wenjie-m7")` → `"/product/wenjie/m7"` |

---

## 2. 数据模型(`VehicleModelRoute`)

```typescript
{
  type: "vehicle_model",
  brandSlug: "wenjie",
  modelSlug: "m7",
  modelName: "问界 M7",
  parentPath: "/product/wenjie",
  canonicalPath: "/product/wenjie/m7",
  title: "问界 M7 专属升级方案",
  navLabel: "M7",
  status: "planned",
  priority: "P0",
  projectCount: 32,
  sourcePrd: "docs/PRD/product/WENJIE_M7_TOPIC_PRD_2026-06-25.md",
  legacyPaths: ["/product/wenjie-m7"],
} as const
```

**字段约束**:

- `projectCount = 32`:海报驱动三层结构(必改 + 商务 + 小配件)总数
- `status = "planned"`:`/product` 入口页用 `<BrandPlaceholder>` 展示
- `priority = "P0"`:与 M6 / M8 同一队列,按业务优先级排期
- `sourcePrd`:必填,定位源文档

---

## 3. 项目分类(按 PRD §1 / §3.1)

海报天然三层结构(独有):

| 分类 | 项目数(约) | 主要项目 | 用户群 |
|---|---:|---|---|
| 必改产品(基础保护) | ~5 | 隔热膜 / 车衣 / 三防软包脚垫 / 底盘护板 / 电动踏板 | 新车车主 |
| 高级商务升级 | ~10 | 后排娱乐 / 座舱舒适 / 外观运动 / 户外拓展 | 商务 / 户外 |
| 实用小配件 | ~17 | 门槛 / 牌照框 / 屏幕 / 密封 / 隔音 / 内饰小件 | 细节防护 |
| **合计** | **32** | — | — |

> 注:M7 数量最多(32),因为小配件类别最丰富(高频细节)。

---

## 4. 字段约定

| 字段 | 约定 | 备注 |
|---|---|---|
| 车型名 | `问界 M7` | 与全站一致 |
| 品牌 slug | `wenjie` | `product-routes.ts` BRANDS[0] |
| 型号 slug | `m7` | 小写 |
| 页面 title | `问界 M7 专属升级方案 | 蓝辉轻改 LANHUI` | 参照模板 |
| H1 | `问界 M7 专属升级方案` | — |
| 主题色 | `cyan-400 #22d3ee`(wenjie) | — |
| 面包屑 | `产品中心 / 问界 / M7` | — |
| JSON-LD | `CollectionPage` + `ItemList` | 32 个项目 ListItem |

---

## 5. 实施状态

| 维度 | 状态 | 备注 |
|---|---|---|
| 路由注册 | ✅ | `product-routes.ts` MODELS[3] |
| Legacy Redirect | ✅ | `ALL_LEGACY_ALIASES` 已含 |
| 父品牌页 | ✅ | `/product/wenjie` live |
| 模型子目录 | ⚪ 无 | `src/app/product/wenjie/m7/page.tsx` 不存在 |
| 数据源 | ⚪ 无 | `wenjie-products.ts` 含 M7(6 产品)但不含 32 海报项目 |
| 5 组件 | ⚪ 无 | 需新建 `<WenjieM7ProductCard>` 等 |
| 图资源 | ⚪ 无 | 32 张图待补 |
| 验证脚本 | ⚪ 无 | 需 `verify-m7-images.mjs` |

---

## 6. 实施 TODO

1. 创建 `src/lib/wenjie-m7-products.ts`(32 个项目,三层结构)
2. 迁移 32 张图到 `public/images/products/wenjie/M7/`
3. 创建 `src/components/wenjie/m7/5 组件`
4. 创建 `src/app/product/wenjie/m7/page.tsx`
5. 加 `scripts/verify-m7-images.mjs`
6. 在 wenjie 父页加入 M7 入口

---

## 7. 合规边界(摘自 PRD §3.3)

页面不得出现:

- ❌ 问界官方授权 / 华为官方授权 / 鸿蒙智行官方授权
- ❌ 原厂配件 / 官方同款
- ❌ 不影响原厂质保 / 100% 无损安装 / 永久质保

适配声明(强制)。

---

> 最后更新:2026-06-25
