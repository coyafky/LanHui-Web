# SPEC: 问界 M8 单车型专题

> **车型**:问界 M8
> **品牌**:问界(`wenjie`)
> **对应 PRD**:[`WENJIE_M8_TOPIC_PRD_2026-06-25.md`](../../../../PRD/product/WENJIE_M8_TOPIC_PRD_2026-06-25.md)(v0.1)
> **页面类型**:单车型轻改升级方案 PRD
> **实现状态**:⚪ **planned** — 仅在 `product-routes.ts` 注册,无 `page.tsx`
> **注意**:`wenjie-products.ts` 中 M8 已有 **22 条产品数据**(legacy 兼容),但未升级为单车型专题页
> **创建日期**:2026-06-25

---

## 1. 路由

| 字段 | 值 |
|---|---|
| Canonical Route | `/product/wenjie/m8` |
| Legacy Alias(已注册) | `/product/wenjie-m8` |
| 父路径 | `/product/wenjie` |
| 替代锚点(可选) | `/product/wenjie#m8-upgrade` |
| Legacy Redirect | `next.config.ts` redirects:`/product/wenjie-m8` → `/product/wenjie/m8` |
| 解析函数 | `getCanonicalFor("/product/wenjie-m8")` → `"/product/wenjie/m8"` |

> M8 是 wenjie 三个车型中**唯一已有部分数据**的(22 条产品款式),但页面未独立。

---

## 2. 数据模型(`VehicleModelRoute`)

```typescript
{
  type: "vehicle_model",
  brandSlug: "wenjie",
  modelSlug: "m8",
  modelName: "问界 M8",
  parentPath: "/product/wenjie",
  canonicalPath: "/product/wenjie/m8",
  title: "问界 M8 专属升级方案",
  navLabel: "M8",
  status: "planned",
  priority: "P0",
  projectCount: 30,        // 海报驱动三层结构(5 + 10 + 15)
  sourcePrd: "docs/PRD/product/WENJIE_M8_TOPIC_PRD_2026-06-25.md",
  legacyPaths: ["/product/wenjie-m8"],
} as const
```

**字段约束**:

- `projectCount = 30`:海报三层结构(必改 5 + 商务 10 + 小配件 15)
- `status = "planned"`:页面未独立
- `priority = "P0"`:与 M6/M7 同队列
- **关键差异**:`wenjie-products.ts` 已有 M8 的 22 条产品款式数据 → 可复用,但当前并入 `/product/wenjie` 总页,未独立展示

---

## 3. 项目分类(按 PRD §1 / §3.1)

| 分类 | 项目数(约) | 主要项目 | 用户群 |
|---|---:|---|---|
| 必改产品(基础保护) | 5 | 隔热膜 / 车衣 / 三防软包脚垫 / 底盘护板 / 电动踏板 | 新车车主 |
| 高级商务升级 | 10 | 后排娱乐 / 氛围灯 / 小桌板 / 铝地板 / 电动门 / 轮毂 / 平衡杆 / 流媒体后视镜 / 星空顶 / 星空膜 / 运动包围 / 车顶平台套件 / 改色 / 腿托 / 刹车卡钳 | 商务 / 家庭 |
| 实用小配件 | 15 | 门槛条 / 牌照框 / 钢化膜 / 防虫网 / 四门密封条 / 尾箱垫 / 内饰硅胶件 / 挡泥板 / 内衬 / 四门隔音 / 等 | 细节防护 |
| **合计** | **30** | — | — |

> **重点**:商务升级含 **电动门 / 后排娱乐 / 铝地板 / 星空顶/膜** — M8 的差异化卖点。

---

## 4. 字段约定

| 字段 | 约定 | 备注 |
|---|---|---|
| 车型名 | `问界 M8` | — |
| 品牌 slug | `wenjie` | — |
| 型号 slug | `m8` | — |
| 页面 title | `问界 M8 专属升级方案 | 蓝辉轻改 LANHUI` | — |
| H1 | `问界 M8 专属升级方案` | — |
| 主题色 | `cyan-400 #22d3ee`(wenjie) | — |
| 面包屑 | `产品中心 / 问界 / M8` | — |
| JSON-LD | `CollectionPage` + `ItemList` | 30 个项目 ListItem |

---

## 5. 实施状态

| 维度 | 状态 | 备注 |
|---|---|---|
| 路由注册 | ✅ | `product-routes.ts` MODELS[4] |
| Legacy Redirect | ✅ | `ALL_LEGACY_ALIASES` 已含 |
| 父品牌页 | ✅ | `/product/wenjie` live |
| 模型子目录 | ⚪ 无 | `src/app/product/wenjie/m8/page.tsx` 不存在 |
| 数据源 | 🟡 部分 | `wenjie-products.ts` 含 22 条 M8 产品,但未拆分为 M8 专题 |
| 5 组件 | ⚪ 无 | 需新建 `<WenjieM8ProductCard>` 等(独立版) |
| 图资源 | 🟡 部分 | wenjie/M8/ 子目录可能存在(legacy 兼容) |
| 验证脚本 | ⚪ 无 | 需 `verify-m8-images.mjs` |

---

## 6. 实施 TODO

1. **复用** `wenjie-products.ts` 中 M8 的 22 条产品数据
2. 拆分 22 → 30:补 8 个小配件(海报第 3 层)
3. 迁移 / 补图到 `public/images/products/wenjie/M8/`(30 张)
4. 创建 `src/components/wenjie/m8/5 组件`
5. 创建 `src/app/product/wenjie/m8/page.tsx`
6. 加 `scripts/verify-m8-images.mjs`
7. 父页 `<WenjieTopicBanner>` 加 M8 直达链接

---

## 7. 合规边界(摘自 PRD §3.3)

- ❌ 问界 / 华为 / 鸿蒙智行 官方授权
- ❌ 原厂配件 / 官方同款
- ❌ 不影响原厂质保 / 100% 无损安装 / 永久质保

适配声明(强制)。

---

> 最后更新:2026-06-25
