# SPEC: 小米 SU7 单车型专题

> **车型**:小米 SU7
> **品牌**:小米(`xiaomi`)
> **对应 PRD**:[`XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md`](../../../../PRD/product/XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md)(v0.1) — 涵盖 SU7 / Ultra 系列
> **页面类型**:单车型轻改升级方案 PRD(系列承接,SU7 暂未独立拆 PRD)
> **实现状态**:⚪ **planned** — 仅在 `product-routes.ts` 注册,无 `page.tsx`
> **创建日期**:2026-06-25

---

## 1. 路由

| 字段 | 值 |
|---|---|
| Canonical Route | `/product/xiaomi/su7` |
| Legacy Alias | ⚠️ **无**(与 YU7 不同)— 不设 legacy |
| 父路径 | `/product/xiaomi` |
| 替代锚点(当前) | `/product/xiaomi#su7-ultra`(系列内承接) |
| Legacy Redirect | 无需 |
| 解析函数 | `getCanonicalFor` 不含此路径 |

> SU7 与 YU7 不同,目前没有从旧 `/product/xiaomi-su7` 迁移的需求;SU7 直接走 canonical 路由。

---

## 2. 数据模型(`VehicleModelRoute`)

```typescript
{
  type: "vehicle_model",
  brandSlug: "xiaomi",
  modelSlug: "su7",
  modelName: "小米 SU7",
  parentPath: "/product/xiaomi",
  canonicalPath: "/product/xiaomi/su7",
  title: "小米 SU7 专属升级方案",
  navLabel: "SU7",
  status: "planned",
  priority: "P0",
  projectCount: 26,        // 21 个 SU7/Ultra 海报项目 + 5 个补充
  sourcePrd: "docs/PRD/product/XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md",
  // legacyPaths: (无)
} as const
```

**字段约束**:

- `projectCount = 26`:21 个系列海报项目 + 5 个 SU7 专属补充
- `status = "planned"`:与 YU7 同状态
- `priority = "P0"`:P0 队列
- `sourcePrd`:系列 PRD(不独立 SU7 PRD)

---

## 3. 项目分类(按 XIAOMI_SERIES_UPGRADE PRD §2.2 / §3)

| 分类 | 项目数(约) | 主要项目 | 用户群 |
|---|---:|---|---|
| 基础保护 | ~4 | 车衣 / 隔热膜 / 360 软包脚垫 / 底盘护板 | 新车车主 |
| Ultra 风格外观 | ~7 | 改色膜 / 电动尾翼 / Ultra 机盖 / Ultra 尾翼 / Ultra 前后包围 / 拉花 / 底盘灯 | SU7 / Ultra 风格用户 |
| 座舱氛围 | ~5 | 氛围灯 / 仪表中置 / 后排电视 / 座椅按摩 / 内饰升级 | 座舱体验用户 |
| 智能便利 | ~3 | HUD 抬头显示 / 流媒体后视镜 / 钢化膜 | 智能便利用户 |
| 其他 | ~7 | (其他轻改项目) | — |
| **合计** | **26** | — | — |

> 注:SU7 主题偏 **Ultra 风格运动化**与 **科技座舱**,与 YU7 偏家用/电动便利的定位不同。

---

## 4. 字段约定

| 字段 | 约定 | 备注 |
|---|---|---|
| 车型名 | `小米 SU7` | 短横线无,空格分隔 |
| 品牌 slug | `xiaomi` | `product-routes.ts` BRANDS[1] |
| 型号 slug | `su7` | 小写 |
| 页面 title | `小米 SU7 专属升级方案 | 蓝辉轻改 LANHUI` | — |
| H1 | `小米 SU7 专属升级方案` | — |
| 主题色 | `orange-400 #fb923c`(xiaomi) | — |
| 面包屑 | `产品中心 / 小米 / SU7` | — |
| JSON-LD | `CollectionPage` + `ItemList` | 26 个项目 ListItem |

---

## 5. 实施状态

| 维度 | 状态 | 备注 |
|---|---|---|
| 路由注册 | ✅ | `product-routes.ts` MODELS[0] |
| Legacy Redirect | ⚠️ 不适用 | 无 legacy |
| 父品牌页 | ✅ | `/product/xiaomi` live |
| 模型子目录 | ⚪ 无 | `src/app/product/xiaomi/su7/page.tsx` 不存在 |
| 数据源 | 🟡 部分 | `xiaomi-products.ts` 含 SU7 数据(非独立) |
| 5 组件 | ⚪ 无 | 需新建 `<XiaomiSU7ProductCard>` 等 |
| 图资源 | 🟡 部分 | xiaomi/SU7/ 子目录可能存在(legacy 兼容) |
| 验证脚本 | ⚪ 无 | 需 `verify-su7-images.mjs` |

---

## 6. 实施 TODO

1. **复用** `xiaomi-products.ts` 中 SU7 数据
2. 拆分为 SU7 独立数据:21 海报项目 + 5 补充 = 26
3. 迁移 / 补图到 `public/images/products/xiaomi/SU7/`
4. 创建 `src/components/xiaomi/su7/5 组件`
5. 创建 `src/app/product/xiaomi/su7/page.tsx`
6. 加 `scripts/verify-su7-images.mjs`
7. 父页 `<XiaomiTopicBanner>` 加 SU7 直达链接

---

## 7. 合规边界(摘自 PRD §3.3)

- ❌ 小米官方授权 / 雷军官方背书
- ❌ 原厂配件 / 官方同款
- ❌ 不影响原厂质保 / 100% 无损安装 / 永久质保 / 全网最低价
- ❌ 性能提升、极速提升等不可验证承诺

适配声明(强制)。

---

> 最后更新:2026-06-25
