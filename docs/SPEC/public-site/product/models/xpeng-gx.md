# SPEC: 小鹏 GX 单车型专题

> **车型**:小鹏 GX
> **品牌**:小鹏(`xpeng`)
> **对应 PRD**:[`XPENG_GX_TOPIC_PRD_2026-06-25.md`](../../../../PRD/product/XPENG_GX_TOPIC_PRD_2026-06-25.md)(v0.1)
> **页面类型**:单车型轻改升级方案 PRD
> **实现状态**:⚪ **planned** — 父品牌 planned,无 `page.tsx`
> **创建日期**:2026-06-25

---

## 1. 路由

| 字段 | 值 |
|---|---|
| Canonical Route | `/product/xpeng/gx` |
| Legacy Alias(已注册) | `/product/xpeng-gx` |
| 父路径 | `/product/xpeng` |
| Legacy Redirect | `next.config.ts` redirects:`/product/xpeng-gx` → `/product/xpeng/gx` |
| 解析函数 | `getCanonicalFor("/product/xpeng-gx")` → `"/product/xpeng/gx"` |

---

## 2. 数据模型(`VehicleModelRoute`)

```typescript
{
  type: "vehicle_model",
  brandSlug: "xpeng",
  modelSlug: "gx",
  modelName: "小鹏 GX",
  parentPath: "/product/xpeng",
  canonicalPath: "/product/xpeng/gx",
  title: "小鹏 GX 专属升级方案",
  navLabel: "GX",
  status: "planned",
  priority: "P1",
  projectCount: 22,
  sourcePrd: "docs/PRD/product/XPENG_GX_TOPIC_PRD_2026-06-25.md",
  legacyPaths: ["/product/xpeng-gx"],
} as const
```

**字段约束**:

- `projectCount = 22`:海报驱动 15 + 7 补充
- `status = "planned"`
- `priority = "P1"`
- `sourcePrd`:v0.1

---

## 3. 项目分类(按 PRD §3.1)

| 分类 | 项目数(约) | 主要项目 | 用户群 |
|---|---:|---|---|
| 基础保护 | ~6 | 车衣 / 隔热膜 / 底盘护板 / 360 脚垫 / 钢化膜 / 门槛条 | 新车车主 |
| 科技配置 | ~3 | 电动门 / 抬头显示罩 / 钢化膜 | 科技配置用户 |
| 外观个性 | ~4 | 彩绘 / 改色膜 / 轮毂 / 牌照框 | 外观个性用户 |
| 行车防护 | ~4 | 平衡杆 / 底盘护板 / 防虫网 / 挡泥板 | 行车防护用户 |
| 其他 | ~5 | (其他) | — |
| **合计** | **22** | — | — |

> **核心卖点**:小鹏 GX 强调 **科技配置(电动门 / 抬头显示)** + **行车防护(平衡杆 / 防虫网)** — 与小鹏品牌"科技智能"调性一致。

---

## 4. 字段约定

| 字段 | 约定 | 备注 |
|---|---|---|
| 车型名 | `小鹏 GX` | — |
| 品牌 slug | `xpeng` | — |
| 型号 slug | `gx` | 小写 |
| 页面 title | `小鹏 GX 专属升级方案 | 蓝辉轻改 LANHUI` | — |
| H1 | `小鹏 GX 专属升级方案` | — |
| 主题色 | `emerald-400 #34d399`(xpeng) | — |
| 面包屑 | `产品中心 / 小鹏 / GX` | — |
| JSON-LD | `CollectionPage` + `ItemList` | 22 个项目 ListItem |

---

## 5. 实施状态

| 维度 | 状态 | 备注 |
|---|---|---|
| 路由注册 | ✅ | `product-routes.ts` MODELS[9] |
| Legacy Redirect | ✅ | `ALL_LEGACY_ALIASES` 已含 |
| 父品牌页 | ⚪ planned | `/product/xpeng` 不存在 |
| 模型子目录 | ⚪ 无 | `src/app/product/xpeng/gx/page.tsx` 不存在 |
| 数据源 | ⚪ 无 | `xpeng-products.ts` 不存在(flooring 有 xpeng 但车型无) |
| 5 组件 | ⚪ 无 | 需新建 |
| 图资源 | ⚪ 无 | 22 张图待补 |
| 验证脚本 | ⚪ 无 | 需 `verify-gx-images.mjs` |

---

## 6. 实施 TODO

1. 创建 `src/lib/xpeng-gx-products.ts`(22 个项目)
2. 迁移 / 补图到 `public/images/products/xpeng/GX/`
3. 创建 `src/components/xpeng/gx/5 组件`
4. 创建父页 `/product/xpeng/page.tsx` + 子页 `/product/xpeng/gx/page.tsx`
5. 加 `scripts/verify-gx-images.mjs`
6. 在 `/product` 入口加入 xpeng 入口

---

## 7. 合规边界(摘自 PRD §3.3)

- ❌ 小鹏官方授权 / 原厂配件 / 官方同款
- ❌ 不影响原厂质保 / 100% 无损安装 / 永久质保 / 全网最低
- ❌ 性能提升 / 操控提升 / 制动提升 等不可验证承诺

适配声明(强制)。

---

> 最后更新:2026-06-25
