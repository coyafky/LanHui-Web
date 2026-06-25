# SPEC: 理想 i8 单车型专题

> **车型**:理想 i8
> **品牌**:理想(`li-auto`)
> **对应 PRD**:[`LI_AUTO_I8_TOPIC_PRD_2026-06-24.md`](../../../../PRD/product/LI_AUTO_I8_TOPIC_PRD_2026-06-24.md)(v0.2)
> **页面类型**:单车型轻改升级方案 PRD
> **实现状态**:⚪ **planned** — 父品牌 planned,无 `page.tsx`
> **创建日期**:2026-06-25

---

## 1. 路由

| 字段 | 值 |
|---|---|
| Canonical Route | `/product/li-auto/i8` |
| Legacy Alias | ⚠️ **无**(暂未注册 legacy) |
| 父路径 | `/product/li-auto` |
| 替代锚点(可选) | `/product/li-auto#i8` |
| Legacy Redirect | 无需 |
| 解析函数 | `getCanonicalFor` 不含 |

> 与 wenjie-m6 同模式:无 legacy alias,因为没历史旧路径。

---

## 2. 数据模型(`VehicleModelRoute`)

```typescript
{
  type: "vehicle_model",
  brandSlug: "li-auto",
  modelSlug: "i8",
  modelName: "理想 i8",
  parentPath: "/product/li-auto",
  canonicalPath: "/product/li-auto/i8",
  title: "理想 i8 专属升级方案",
  navLabel: "i8",
  status: "planned",
  priority: "P1",        // li-auto 整体 P1
  projectCount: 25,
  sourcePrd: "docs/PRD/product/LI_AUTO_I8_TOPIC_PRD_2026-06-24.md",
  // legacyPaths: (无)
} as const
```

**字段约束**:

- `projectCount = 25`:海报驱动 20 + 5 补充
- `status = "planned"`:父品牌 li-auto 也是 planned(2026-06-25 注册)
- `priority = "P1"`:低于 P0 车型(wenjie/xiaomi/zeekr)
- `sourcePrd`:v0.2(比其他 planned 模型版本高)

---

## 3. 项目分类(按 PRD §3.1)

| 分类 | 项目数(约) | 主要项目 | 用户群 |
|---|---:|---|---|
| 基础保护 | ~6 | 车衣 / 隔热膜 / 360 软包脚垫 / 底盘护板 / 门槛条 / 内饰镀膜 | 新车车主 |
| 家庭舒适 | ~5 | 铝地板 / 小桌板 / 香氛系统 / 座舱保护 / 后排便利 | 家庭用户 |
| 外观个性 | ~5 | 彩绘 / 双拼改色 / 包围 / 轮毂 / 刹车卡钳 | 外观个性用户 |
| 科技 / 屏幕 | ~4 | 钢化膜 / 显示保护罩 / 流媒体后视镜 | 科技用户 |
| 其他 | ~5 | (其他) | — |
| **合计** | **25** | — | — |

> **核心卖点**:理想 i8 突出 **家庭出行 / 后排便利 / 香氛系统** — 理想品牌调性。

---

## 4. 字段约定

| 字段 | 约定 | 备注 |
|---|---|---|
| 车型名 | `理想 i8` | — |
| 品牌 slug | `li-auto` | 短横线(非 underscore) |
| 型号 slug | `i8` | 小写 |
| 页面 title | `理想 i8 专属升级方案 | 蓝辉轻改 LANHUI` | — |
| H1 | `理想 i8 专属升级方案` | — |
| 主题色 | `amber-400 #fbbf24`(li-auto) | — |
| 面包屑 | `产品中心 / 理想 / i8` | — |
| JSON-LD | `CollectionPage` + `ItemList` | 25 个项目 ListItem |

---

## 5. 实施状态

| 维度 | 状态 | 备注 |
|---|---|---|
| 路由注册 | ✅ | `product-routes.ts` MODELS[6] |
| Legacy Redirect | ⚠️ 不适用 | 无 legacy |
| 父品牌页 | ⚪ planned | `/product/li-auto` 不存在 |
| 模型子目录 | ⚪ 无 | `src/app/product/li-auto/i8/page.tsx` 不存在 |
| 数据源 | ⚪ 无 | `li-auto-products.ts` 不存在 |
| 5 组件 | ⚪ 无 | 需新建 |
| 图资源 | ⚪ 无 | 25 张图待补 |
| 验证脚本 | ⚪ 无 | 需 `verify-i8-images.mjs` |

---

## 6. 实施 TODO

1. 创建 `src/lib/li-auto-i8-products.ts`(25 个项目)
2. 迁移 / 补图到 `public/images/products/li-auto/i8/`
3. 创建 `src/components/li-auto/i8/5 组件`
4. 创建父页 `/product/li-auto/page.tsx` + 子页 `/product/li-auto/i8/page.tsx`
5. 加 `scripts/verify-i8-images.mjs`
6. 在 `/product` 入口 `<VehicleTopicMap>` 加入 li-auto 入口

---

## 7. 合规边界(摘自 PRD §3.3)

- ❌ 理想官方授权 / 原厂配件 / 官方同款
- ❌ 不影响原厂质保 / 100% 无损安装 / 永久质保 / 全网最低
- ❌ 性能提升 / 制动提升 等不可验证承诺

适配声明(强制)。

---

> 最后更新:2026-06-25
