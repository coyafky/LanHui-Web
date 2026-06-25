# SPEC: 乐道 L90 单车型专题

> **车型**:乐道 L90
> **品牌**:乐道(`ledao`)
> **对应 PRD**:[`LEDAO_L90_TOPIC_PRD_2026-06-24.md`](../../../../PRD/product/LEDAO_L90_TOPIC_PRD_2026-06-24.md)(v0.1)
> **页面类型**:单车型专题 PRD
> **实现状态**:⚪ **planned** — 父品牌 planned,无 `page.tsx`
> **创建日期**:2026-06-25

---

## 1. 路由

| 字段 | 值 |
|---|---|
| Canonical Route | `/product/ledao/l90` |
| Legacy Alias(已注册) | `/product/ledao-l90` |
| 父路径 | `/product/ledao` |
| Legacy Redirect | `next.config.ts` redirects:`/product/ledao-l90` → `/product/ledao/l90` |
| 解析函数 | `getCanonicalFor("/product/ledao-l90")` → `"/product/ledao/l90"` |

---

## 2. 数据模型(`VehicleModelRoute`)

```typescript
{
  type: "vehicle_model",
  brandSlug: "ledao",
  modelSlug: "l90",
  modelName: "乐道 L90",
  parentPath: "/product/ledao",
  canonicalPath: "/product/ledao/l90",
  title: "乐道 L90 专属升级方案",
  navLabel: "L90",
  status: "planned",
  priority: "P1",
  projectCount: 20,
  sourcePrd: "docs/PRD/product/LEDAO_L90_TOPIC_PRD_2026-06-24.md",
  legacyPaths: ["/product/ledao-l90"],
} as const
```

**字段约束**:

- `projectCount = 20`:海报驱动总数
- `status = "planned"`
- `priority = "P1"`
- `sourcePrd`:v0.1

---

## 3. 项目分类(按 PRD §3.1)

| 分类 | 项目数(约) | 主要项目 | 用户群 |
|---|---:|---|---|
| 基础保护 | ~5 | 车衣 / 隔热膜 / 底盘护板 / 360 脚垫 / 门槛条 | 新车车主 |
| 家庭用户 | ~5 | 铝地板 / 小桌板 / 腿托 / 尾箱垫 / 后排娱乐电视 | 家庭用户 |
| 外观个性 | ~6 | 彩绘 / 双拼改色 / 悬浮顶 / 运动包围 / 轮毂 / 刹车卡钳 | 外观个性用户 |
| 智能影音 | ~3 | HUD 抬头显示器 / 流媒体后视镜 / 钢化膜 | 智能影音用户 |
| 其他 | ~1 | (其他) | — |
| **合计** | **20** | — | — |

> **核心卖点**:乐道 L90 强调 **家庭出行(铝地板 / 小桌板 / 后排娱乐)** + **外观个性(悬浮顶 / 包围)** + **智能影音(HUD / 流媒体)**。

---

## 4. 字段约定

| 字段 | 约定 | 备注 |
|---|---|---|
| 车型名 | `乐道 L90` | — |
| 品牌 slug | `ledao` | — |
| 型号 slug | `l90` | 小写 |
| 页面 title | `乐道 L90 专属升级方案 | 蓝辉轻改 LANHUI` | — |
| H1 | `乐道 L90 专属升级方案` | — |
| 主题色 | `blue-400 #60a5fa`(ledao) | — |
| 面包屑 | `产品中心 / 乐道 / L90` | — |
| JSON-LD | `CollectionPage` + `ItemList` | 20 个项目 ListItem |

---

## 5. 实施状态

| 维度 | 状态 | 备注 |
|---|---|---|
| 路由注册 | ✅ | `product-routes.ts` MODELS[10] |
| Legacy Redirect | ✅ | `ALL_LEGACY_ALIASES` 已含 |
| 父品牌页 | ⚪ planned | `/product/ledao` 不存在 |
| 模型子目录 | ⚪ 无 | `src/app/product/ledao/l90/page.tsx` 不存在 |
| 数据源 | ⚪ 无 | `ledao-products.ts` 不存在 |
| 5 组件 | ⚪ 无 | 需新建 |
| 图资源 | ⚪ 无 | 20 张图待补 |
| 验证脚本 | ⚪ 无 | 需 `verify-l90-images.mjs` |

---

## 6. 实施 TODO

1. 创建 `src/lib/ledao-l90-products.ts`(20 个项目)
2. 迁移 / 补图到 `public/images/products/ledao/L90/`
3. 创建 `src/components/ledao/l90/5 组件`
4. 创建父页 `/product/ledao/page.tsx` + 子页 `/product/ledao/l90/page.tsx`
5. 加 `scripts/verify-l90-images.mjs`
6. 在 `/product` 入口加入 ledao 入口

---

## 7. 合规边界(摘自 PRD §3.3)

- ❌ 乐道官方授权 / 蔚来官方合作
- ❌ 原厂配件 / 不影响原厂质保 / 100% 无损安装 / 永久质保 / 全网最低

适配声明(强制)。

---

> 最后更新:2026-06-25
