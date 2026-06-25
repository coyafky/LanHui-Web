# SPEC: 腾势 D9 单车型专题

> **车型**:腾势 D9
> **品牌**:腾势(`denza`)
> **对应 PRD**:[`DENZA_D9_TOPIC_PRD_2026-06-24.md`](../../../../PRD/product/DENZA_D9_TOPIC_PRD_2026-06-24.md)(v0.1)
> **页面类型**:单车型轻改升级方案 PRD
> **实现状态**:⚪ **planned** — 父品牌 planned,无 `page.tsx`
> **创建日期**:2026-06-25

---

## 1. 路由

| 字段 | 值 |
|---|---|
| Canonical Route | `/product/denza/d9` |
| Legacy Alias(已注册) | `/product/denza-d9` |
| 父路径 | `/product/denza` |
| Legacy Redirect | `next.config.ts` redirects:`/product/denza-d9` → `/product/denza/d9` |
| 解析函数 | `getCanonicalFor("/product/denza-d9")` → `"/product/denza/d9"` |

---

## 2. 数据模型(`VehicleModelRoute`)

```typescript
{
  type: "vehicle_model",
  brandSlug: "denza",
  modelSlug: "d9",
  modelName: "腾势 D9",
  parentPath: "/product/denza",
  canonicalPath: "/product/denza/d9",
  title: "腾势 D9 专属升级方案",
  navLabel: "D9",
  status: "planned",
  priority: "P1",
  projectCount: 22,
  sourcePrd: "docs/PRD/product/DENZA_D9_TOPIC_PRD_2026-06-24.md",
  legacyPaths: ["/product/denza-d9"],
} as const
```

**字段约束**:

- `projectCount = 22`:海报驱动总数
- `status = "planned"`:父品牌 denza 也是 planned
- `priority = "P1"`:MPV 场景优先级
- `sourcePrd`:v0.1

---

## 3. 项目分类(按 PRD §3.1)

| 分类 | 项目数(约) | 主要项目 | 用户群 |
|---|---:|---|---|
| 基础保护 | ~5 | 车衣 / 隔热膜 / 360 软包脚垫 / 底盘护板 / 门槛条 | 新车车主 |
| 商务接待 | ~5 | 铝地板 / 小桌板 / 吸顶电视 / 氛围灯 / 钢化膜 | 商务接待用户 |
| 家庭用户 | ~6 | 脚垫 / 铝地板 / 后排娱乐 / 底盘护板 / 防虫网 / 挡泥板 | 家庭用户 |
| 外观个性 | ~4 | 彩绘 / 双拼改色 / amxt 包围 / bskt 运动包围 / D 柱灯 / 日行灯 | 外观个性用户 |
| 其他 | ~2 | (其他) | — |
| **合计** | **22** | — | — |

> **核心卖点**:腾势 D9 是 **新能源 MPV**,强调 **商务接待(铝地板/吸顶电视/小桌板)** + **家庭出行(后排娱乐/防虫网)** 双场景。

---

## 4. 字段约定

| 字段 | 约定 | 备注 |
|---|---|---|
| 车型名 | `腾势 D9` | — |
| 品牌 slug | `denza` | — |
| 型号 slug | `d9` | 小写 |
| 页面 title | `腾势 D9 专属升级方案 | 蓝辉轻改 LANHUI` | — |
| H1 | `腾势 D9 专属升级方案` | — |
| 主题色 | `pink-400 #f472b6`(denza) | — |
| 面包屑 | `产品中心 / 腾势 / D9` | — |
| JSON-LD | `CollectionPage` + `ItemList` | 22 个项目 ListItem |

---

## 5. 实施状态

| 维度 | 状态 | 备注 |
|---|---|---|
| 路由注册 | ✅ | `product-routes.ts` MODELS[7] |
| Legacy Redirect | ✅ | `ALL_LEGACY_ALIASES` 已含 |
| 父品牌页 | ⚪ planned | `/product/denza` 不存在 |
| 模型子目录 | ⚪ 无 | `src/app/product/denza/d9/page.tsx` 不存在 |
| 数据源 | ⚪ 无 | `denza-products.ts` 不存在 |
| 5 组件 | ⚪ 无 | 需新建 |
| 图资源 | ⚪ 无 | 22 张图待补 |
| 验证脚本 | ⚪ 无 | 需 `verify-d9-images.mjs` |

---

## 6. 实施 TODO

1. 创建 `src/lib/denza-d9-products.ts`(22 个项目)
2. 迁移 / 补图到 `public/images/products/denza/D9/`
3. 创建 `src/components/denza/d9/5 组件`
4. 创建父页 `/product/denza/page.tsx` + 子页 `/product/denza/d9/page.tsx`
5. 加 `scripts/verify-d9-images.mjs`
6. 在 `/product` 入口加入 denza 入口

---

## 7. 合规边界(摘自 PRD §3.3)

- ❌ 腾势官方授权 / 比亚迪官方合作
- ❌ 原厂配件 / 不影响原厂质保 / 100% 无损安装 / 永久质保 / 全网最低

适配声明(强制)。

---

> 最后更新:2026-06-25
