# SPEC: 小米 YU7 单车型专题

> **车型**:小米 YU7
> **品牌**:小米(`xiaomi`)
> **对应 PRD**:[`XIAOMI_YU7_UPGRADE_PRD_2026-06-24.md`](../../../../PRD/product/XIAOMI_YU7_UPGRADE_PRD_2026-06-24.md)(v0.1)
> **页面类型**:单车型轻改升级方案 PRD
> **实现状态**:⚪ **planned** — 仅在 `product-routes.ts` 注册,无 `page.tsx`
> **创建日期**:2026-06-25

---

## 1. 路由

| 字段 | 值 |
|---|---|
| Canonical Route | `/product/xiaomi/yu7` |
| Legacy Alias(已注册) | `/product/xiaomi-yu7` |
| 父路径 | `/product/xiaomi` |
| Legacy Redirect | `next.config.ts` redirects:`/product/xiaomi-yu7` → `/product/xiaomi/yu7` |
| 解析函数 | `getCanonicalFor("/product/xiaomi-yu7")` → `"/product/xiaomi/yu7"` |

> YU7 有 legacy 路径(2026-06-24 旧规划),SU7 没有;此为 SU7 vs YU7 路由治理上的差异点。

---

## 2. 数据模型(`VehicleModelRoute`)

```typescript
{
  type: "vehicle_model",
  brandSlug: "xiaomi",
  modelSlug: "yu7",
  modelName: "小米 YU7",
  parentPath: "/product/xiaomi",
  canonicalPath: "/product/xiaomi/yu7",
  title: "小米 YU7 专属升级方案",
  navLabel: "YU7",
  status: "planned",
  priority: "P0",
  projectCount: 28,        // 9 海报项目 + 19 扩展
  sourcePrd: "docs/PRD/product/XIAOMI_YU7_UPGRADE_PRD_2026-06-24.md",
  legacyPaths: ["/product/xiaomi-yu7"],
} as const
```

**字段约束**:

- `projectCount = 28`:9 个海报核心项目 + 19 个扩展
- `status = "planned"`:页面未独立
- `priority = "P0"`:P0 队列,与 SU7 同
- `sourcePrd`:独立 PRD(vs SU7 共用 series PRD)

---

## 3. 项目分类(按 PRD §1 / §2)

海报核心 9 + 扩展 19 = 28:

| 分类 | 项目数(约) | 主要项目 | 用户群 |
|---|---:|---|---|
| 基础保护 | ~4 | 软包脚垫 / 护板 / 挡泥板 | 新车车主 |
| 外观运动 | ~6 | 运动包围 / 平衡杆 / 碳纤维护板 | 外观运动用户 |
| 座舱氛围 | ~6 | 星空膜 / 星空卷帘 / 香氛系统 | 座舱氛围用户 |
| 电动便利 | ~3 | 电吸门 | 电动便利用户 |
| 其他轻改 | ~9 | (其他) | — |
| **合计** | **28** | — | — |

> **核心卖点**:**碳纤维护板**、**星空膜/卷帘**、**电吸门** — YU7 的差异化项目。

---

## 4. 字段约定

| 字段 | 约定 | 备注 |
|---|---|---|
| 车型名 | `小米 YU7` | — |
| 品牌 slug | `xiaomi` | — |
| 型号 slug | `yu7` | 小写 |
| 页面 title | `小米 YU7 专属升级方案 | 蓝辉轻改 LANHUI` | — |
| H1 | `小米 YU7 专属升级方案` | — |
| 主题色 | `orange-400 #fb923c`(xiaomi) | — |
| 面包屑 | `产品中心 / 小米 / YU7` | — |
| JSON-LD | `CollectionPage` + `ItemList` | 28 个项目 ListItem |

---

## 5. 实施状态

| 维度 | 状态 | 备注 |
|---|---|---|
| 路由注册 | ✅ | `product-routes.ts` MODELS[1] |
| Legacy Redirect | ✅ | `ALL_LEGACY_ALIASES` 已含 |
| 父品牌页 | ✅ | `/product/xiaomi` live |
| 模型子目录 | ⚪ 无 | `src/app/product/xiaomi/yu7/page.tsx` 不存在 |
| 数据源 | ⚪ 无 | `xiaomi-products.ts` 含 YU7 部分,但未独立 |
| 5 组件 | ⚪ 无 | 需新建 `<XiaomiYU7ProductCard>` 等 |
| 图资源 | 🟡 部分 | xiaomi/YU7/ 子目录可能存在 |
| 验证脚本 | ⚪ 无 | 需 `verify-yu7-images.mjs` |

---

## 6. 实施 TODO

1. 创建 `src/lib/xiaomi-yu7-products.ts`(28 个项目)
2. 迁移 / 补图到 `public/images/products/xiaomi/YU7/`
3. 创建 `src/components/xiaomi/yu7/5 组件`
4. 创建 `src/app/product/xiaomi/yu7/page.tsx`
5. 加 `scripts/verify-yu7-images.mjs`
6. 父页加入 YU7 直达链接

---

## 7. 合规边界(摘自 PRD §3.3)

- ❌ 小米官方授权 / 雷军官方背书
- ❌ 原厂配件 / 不影响原厂质保 / 100% 无损安装 / 永久质保 / 全网最低

适配声明(强制)。

---

> 最后更新:2026-06-25
