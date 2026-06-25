# SPEC: 高山 8 单车型专题

> **车型**:高山 8
> **品牌**:高山(`gaoshan`)
> **对应 PRD**:[`GAOSHAN_8_TOPIC_PRD_2026-06-25.md`](../../../../PRD/product/GAOSHAN_8_TOPIC_PRD_2026-06-25.md)(v0.1)
> **页面类型**:单车型轻改升级方案 PRD
> **实现状态**:⚪ **planned** — 父品牌 planned,无 `page.tsx`
> **创建日期**:2026-06-25

---

## 1. 路由

| 字段 | 值 |
|---|---|
| Canonical Route | `/product/gaoshan/8` |
| Legacy Alias(已注册) | `/product/gaoshan-8` |
| 父路径 | `/product/gaoshan` |
| Legacy Redirect | `next.config.ts` redirects:`/product/gaoshan-8` → `/product/gaoshan/8` |
| 解析函数 | `getCanonicalFor("/product/gaoshan-8")` → `"/product/gaoshan/8"` |

> modelSlug 是数字 `"8"`(短)— 与其他字母/数字组合不同。

---

## 2. 数据模型(`VehicleModelRoute`)

```typescript
{
  type: "vehicle_model",
  brandSlug: "gaoshan",
  modelSlug: "8",            // 数字字符串
  modelName: "高山 8",
  parentPath: "/product/gaoshan",
  canonicalPath: "/product/gaoshan/8",
  title: "高山 8 专属升级方案",
  navLabel: "8",
  status: "planned",
  priority: "P1",
  projectCount: 23,           // 海报驱动 23 项目
  sourcePrd: "docs/PRD/product/GAOSHAN_8_TOPIC_PRD_2026-06-25.md",
  legacyPaths: ["/product/gaoshan-8"],
} as const
```

**字段约束**:

- `projectCount = 23`:海报驱动项目数(本批最多 P1)
- `status = "planned"`
- `priority = "P1"`
- `modelSlug = "8"`:纯数字,URL 路径 `8` 而非 `高山`

---

## 3. 项目分类(按 PRD §3.1)

| 分类 | 项目数(约) | 主要项目 | 用户群 |
|---|---:|---|---|
| 基础保护 | ~5 | 车衣 / 隔热膜 / 360 软包脚垫 / 铝地板 / 底盘护板 / 内饰镀膜 | 新车车主 |
| 商务接待 | ~5 | 双拼改色 / AMXT 包围 / BSKT 运动包围 / 黑化 81 件套 / 车标灯 | 商务接待用户 |
| 家庭 MPV | ~5 | 铝地板 / 电动踏板 / 中开门 / 香氛系统 / 360 软包脚垫 | 家庭 MPV 用户 |
| 外观个性 | ~4 | 彩绘 / 双拼改色 / 包围 / 黑化套件 / 刹车卡钳 | 外观个性用户 |
| 灯光氛围 | ~4 | 车标灯 / 日行灯 / 氛围相关视觉项目 | 灯光氛围用户 |
| **合计** | **23** | — | — |

> **核心卖点**:高山 8 是 **高端新能源 MPV**,涵盖范围最广(23 项目),强调 **黑化套件 / 81 件套 / 中开门 / 香氛系统** 等 MPV 商务/家庭专属项目。

---

## 4. 字段约定

| 字段 | 约定 | 备注 |
|---|---|---|
| 车型名 | `高山 8` | 空格分隔 |
| 品牌 slug | `gaoshan` | 拼音 |
| 型号 slug | `8` | 数字字符串 |
| 页面 title | `高山 8 专属升级方案 | 蓝辉轻改 LANHUI` | — |
| H1 | `高山 8 专属升级方案` | — |
| 主题色 | `teal-400 #2dd4bf`(gaoshan) | — |
| 面包屑 | `产品中心 / 高山 / 8` | — |
| JSON-LD | `CollectionPage` + `ItemList` | 23 个项目 ListItem |

---

## 5. 实施状态

| 维度 | 状态 | 备注 |
|---|---|---|
| 路由注册 | ✅ | `product-routes.ts` MODELS[11] |
| Legacy Redirect | ✅ | `ALL_LEGACY_ALIASES` 已含 |
| 父品牌页 | ⚪ planned | `/product/gaoshan` 不存在 |
| 模型子目录 | ⚪ 无 | `src/app/product/gaoshan/8/page.tsx` 不存在 |
| 数据源 | ⚪ 无 | `gaoshan-products.ts` 不存在 |
| 5 组件 | ⚪ 无 | 需新建 |
| 图资源 | ⚪ 无 | 23 张图待补 |
| 验证脚本 | ⚪ 无 | 需 `verify-8-images.mjs` |

---

## 6. 实施 TODO

1. 创建 `src/lib/gaoshan-8-products.ts`(23 个项目)
2. 迁移 / 补图到 `public/images/products/gaoshan/8/`
3. 创建 `src/components/gaoshan/8/5 组件`
4. 创建父页 `/product/gaoshan/page.tsx` + 子页 `/product/gaoshan/8/page.tsx`
5. 加 `scripts/verify-8-images.mjs`
6. 在 `/product` 入口加入 gaoshan 入口

---

## 7. 合规边界(摘自 PRD §3.3)

- ❌ 官方授权 / 原厂配件 / 官方同款
- ❌ 不影响原厂质保 / 100% 无损安装 / 永久质保 / 全网最低
- ❌ 性能提升 / 操控提升 / 制动提升 等不可验证承诺
- ❌ 灯光、电动件、外观套件在任何路况下均合法可用的绝对承诺

适配声明(强制)。

---

> 最后更新:2026-06-25
