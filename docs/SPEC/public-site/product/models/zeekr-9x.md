# SPEC: 极氪 9X 单车型专题

> **车型**:极氪 9X
> **品牌**:极氪(`zeekr`)
> **对应 PRD**:[`ZEEKR_9X_UPGRADE_PRD_2026-06-24.md`](../../../../PRD/product/ZEEKR_9X_UPGRADE_PRD_2026-06-24.md)(v0.1)
> **页面类型**:单车型轻改升级方案 PRD
> **实现状态**:⚪ **planned** — 仅在 `product-routes.ts` 注册,无 `page.tsx`
> **创建日期**:2026-06-25

---

## 1. 路由

| 字段 | 值 |
|---|---|
| Canonical Route | `/product/zeekr/9x` |
| Legacy Alias(已注册) | `/product/zeekr-9x` |
| 父路径 | `/product/zeekr` |
| Legacy Redirect | `next.config.ts` redirects:`/product/zeekr-9x` → `/product/zeekr/9x` |
| 解析函数 | `getCanonicalFor("/product/zeekr-9x")` → `"/product/zeekr/9x"` |

> 9X 是 zeekr 品牌 **唯一已注册的车型**,其他(8X、009)暂未在 MODELS 数组中。

---

## 2. 数据模型(`VehicleModelRoute`)

```typescript
{
  type: "vehicle_model",
  brandSlug: "zeekr",
  modelSlug: "9x",
  modelName: "极氪 9X",
  parentPath: "/product/zeekr",
  canonicalPath: "/product/zeekr/9x",
  title: "极氪 9X 专属升级方案",
  navLabel: "9X",
  status: "planned",
  priority: "P0",
  projectCount: 25,
  sourcePrd: "docs/PRD/product/ZEEKR_9X_UPGRADE_PRD_2026-06-24.md",
  legacyPaths: ["/product/zeekr-9x"],
} as const
```

**字段约束**:

- `projectCount = 25`:海报项目总数
- `status = "planned"`:但 `zeekr` 父品牌已 live
- `priority = "P0"`:P0 队列
- `sourcePrd`:必填

---

## 3. 项目分类(按 PRD §1 / §3)

| 分类 | 项目数(约) | 主要项目 | 用户群 |
|---|---:|---|---|
| 基础保护 | ~6 | 车衣 / 隔热膜 / 底盘护板 / 360 脚垫 / 门槛条 | 新车车主 |
| 高端 SUV 质感 | ~5 | 铝地板 / 硅胶垫套餐 / 内饰镀膜 / 轮毂 / 运动包围 | 高端 SUV 用户 |
| 外观个性 | ~5 | 彩绘 / 双拼改色 / 轮毂 / 刹车卡钳 | 外观个性用户 |
| 家庭 / 长途 | ~6 | 底盘护板 / 挡泥板 / 防虫网 / 360 脚垫 / 座舱保护 | 家庭长途用户 |
| 其他 | ~3 | (其他) | — |
| **合计** | **25** | — | — |

> **核心卖点**:作为 **高端新能源 SUV**,9X 强调 **底盘护板 / 360 脚垫 / 门槛条** 的日常家庭/长途实用,与 wenjie/xiaomi 偏运动/Ultra 风格不同。

---

## 4. 字段约定

| 字段 | 约定 | 备注 |
|---|---|---|
| 车型名 | `极氪 9X` | — |
| 品牌 slug | `zeekr` | `product-routes.ts` BRANDS[2] |
| 型号 slug | `9x` | 小写 |
| 页面 title | `极氪 9X 专属升级方案 | 蓝辉轻改 LANHUI` | — |
| H1 | `极氪 9X 专属升级方案` | — |
| 主题色 | `orange-400 #fb923c`(zeekr) | 与 xiaomi 同色 |
| 面包屑 | `产品中心 / 极氪 / 9X` | — |
| JSON-LD | `CollectionPage` + `ItemList` | 25 个项目 ListItem |

---

## 5. 实施状态

| 维度 | 状态 | 备注 |
|---|---|---|
| 路由注册 | ✅ | `product-routes.ts` MODELS[5] |
| Legacy Redirect | ✅ | `ALL_LEGACY_ALIASES` 已含 |
| 父品牌页 | ✅ | `/product/zeekr` live(ZEEKR canonical 案例) |
| 模型子目录 | ⚪ 无 | `src/app/product/zeekr/9x/page.tsx` 不存在 |
| 数据源 | ⚪ 无 | `zeekr-products.ts` 含 9X 数据但未独立 |
| 5 组件 | ⚪ 无 | 需新建 `<Zeekr9XProductCard>` 等(参照 zeekr canonical) |
| 图资源 | 🟡 部分 | zeekr/9X/ 子目录可能存在(legacy) |
| 验证脚本 | ⚪ 无 | 需 `verify-9x-images.mjs`(参照 `verify-zeekr-images.mjs`) |

---

## 6. 实施 TODO

1. **复用** `zeekr-products.ts` 中 9X 数据
2. 拆分 25 项目为 zeekr 9X 独立数据集
3. 迁移 / 补图到 `public/images/products/zeekr/9X/`
4. 创建 `src/components/zeekr/9x/5 组件`(参照父 zeekr)
5. 创建 `src/app/product/zeekr/9x/page.tsx`
6. 加 `scripts/verify-9x-images.mjs`
7. 父页 `<ZeekrTopicBanner>` 加 9X 直达链接

---

## 7. 合规边界(摘自 PRD §3.3)

- ❌ 极氪官方授权 / ZEEKR 官方合作
- ❌ 原厂配件 / 不影响原厂质保 / 100% 无损安装

适配声明(强制)。

---

> 最后更新:2026-06-25
