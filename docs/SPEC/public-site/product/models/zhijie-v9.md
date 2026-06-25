# SPEC: 智界 V9 单车型专题

> **车型**:智界 V9
> **品牌**:智界(`zhijie`)
> **对应 PRD**:[`ZHIJIE_V9_TOPIC_PRD_2026-06-25.md`](../../../../PRD/product/ZHIJIE_V9_TOPIC_PRD_2026-06-25.md)(v0.1)
> **页面类型**:单车型轻改升级方案 PRD
> **实现状态**:⚪ **planned** — 父品牌 planned,无 `page.tsx`
> **创建日期**:2026-06-25

---

## 1. 路由

| 字段 | 值 |
|---|---|
| Canonical Route | `/product/zhijie/v9` |
| Legacy Alias(已注册) | `/product/zhijie-v9` |
| 父路径 | `/product/zhijie` |
| Legacy Redirect | `next.config.ts` redirects:`/product/zhijie-v9` → `/product/zhijie/v9` |
| 解析函数 | `getCanonicalFor("/product/zhijie-v9")` → `"/product/zhijie/v9"` |

---

## 2. 数据模型(`VehicleModelRoute`)

```typescript
{
  type: "vehicle_model",
  brandSlug: "zhijie",
  modelSlug: "v9",
  modelName: "智界 V9",
  parentPath: "/product/zhijie",
  canonicalPath: "/product/zhijie/v9",
  title: "智界 V9 专属升级方案",
  navLabel: "V9",
  status: "planned",
  priority: "P1",
  projectCount: 22,
  sourcePrd: "docs/PRD/product/ZHIJIE_V9_TOPIC_PRD_2026-06-25.md",
  legacyPaths: ["/product/zhijie-v9"],
} as const
```

**字段约束**:

- `projectCount = 22`:海报驱动总数
- `status = "planned"`
- `priority = "P1"`
- `sourcePrd`:v0.1

---

## 3. 项目分类(按 PRD §3.1)

| 分类 | 项目数(约) | 主要项目 | 用户群 |
|---|---:|---|---|
| 新车保护 | ~4 | 车衣 / 隔热膜 / 360 脚垫 / 底盘护板 | 新车车主 |
| 外观个性 | ~3 | 彩绘 / 改色膜 | 外观个性用户 |
| 座舱 / 门槛 | ~5 | 铝地板 / 360 脚垫 / 门槛条 / 挡泥板 / 防虫网 | 家庭 MPV 用户 |
| 商务接待 | ~5 | 改色膜 / 车衣 / 铝地板 / 门槛条 / 牌照框 | 商务接待用户 |
| 屏幕 / 显示 | ~3 | 钢化膜 / 抬头显示罩 | 屏幕保护用户 |
| 其他 | ~2 | (其他) | — |
| **合计** | **22** | — | — |

> **核心卖点**:智界 V9 项目数较少(22)但结构清晰 — **新车保护 / 外观 / 座舱门槛 / 屏幕显示** 4 大块,强调 **屏幕保护(钢化膜 / HUD 罩)** 这块其他车型没有的明确模块。

---

## 4. 字段约定

| 字段 | 约定 | 备注 |
|---|---|---|
| 车型名 | `智界 V9` | — |
| 品牌 slug | `zhijie` | 拼音 |
| 型号 slug | `v9` | 小写 |
| 页面 title | `智界 V9 专属升级方案 | 蓝辉轻改 LANHUI` | — |
| H1 | `智界 V9 专属升级方案` | — |
| 主题色 | `amber-400 #fbbf24`(zhijie,与 li-auto 同) | — |
| 面包屑 | `产品中心 / 智界 / V9` | — |
| JSON-LD | `CollectionPage` + `ItemList` | 22 个项目 ListItem |

---

## 5. 实施状态

| 维度 | 状态 | 备注 |
|---|---|---|
| 路由注册 | ✅ | `product-routes.ts` MODELS[12] |
| Legacy Redirect | ✅ | `ALL_LEGACY_ALIASES` 已含 |
| 父品牌页 | ⚪ planned | `/product/zhijie` 不存在 |
| 模型子目录 | ⚪ 无 | `src/app/product/zhijie/v9/page.tsx` 不存在 |
| 数据源 | ⚪ 无 | `zhijie-products.ts` 不存在 |
| 5 组件 | ⚪ 无 | 需新建 |
| 图资源 | ⚪ 无 | 22 张图待补 |
| 验证脚本 | ⚪ 无 | 需 `verify-v9-images.mjs` |

---

## 6. 实施 TODO

1. 创建 `src/lib/zhijie-v9-products.ts`(22 个项目)
2. 迁移 / 补图到 `public/images/products/zhijie/V9/`
3. 创建 `src/components/zhijie/v9/5 组件`
4. 创建父页 `/product/zhijie/page.tsx` + 子页 `/product/zhijie/v9/page.tsx`
5. 加 `scripts/verify-v9-images.mjs`
6. 在 `/product` 入口加入 zhijie 入口

---

## 7. 合规边界(摘自 PRD §3.3)

- ❌ 智界官方授权 / 华为官方授权 / 鸿蒙智行官方授权
- ❌ 原厂配件 / 官方同款
- ❌ 不影响原厂质保 / 100% 无损安装 / 永久质保 / 全网最低
- ❌ 性能提升 / 操控提升 / 制动提升 等不可验证承诺

适配声明(强制)。

---

> 最后更新:2026-06-25
