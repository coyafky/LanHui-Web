# SPEC: 岚图梦想家 单车型专题

> **车型**:岚图梦想家
> **品牌**:岚图(`voyah`)
> **对应 PRD**:[`VOYAH_DREAMER_TOPIC_PRD_2026-06-25.md`](../../../../PRD/product/VOYAH_DREAMER_TOPIC_PRD_2026-06-25.md)(v0.1)
> **页面类型**:单车型轻改升级方案 PRD
> **实现状态**:⚪ **planned** — 父品牌 planned,无 `page.tsx`
> **创建日期**:2026-06-25

---

## 1. 路由

| 字段 | 值 |
|---|---|
| Canonical Route | `/product/voyah/dreamer` |
| Legacy Alias(已注册) | `/product/voyah-dreamer` |
| 父路径 | `/product/voyah` |
| Legacy Redirect | `next.config.ts` redirects:`/product/voyah-dreamer` → `/product/voyah/dreamer` |
| 解析函数 | `getCanonicalFor("/product/voyah-dreamer")` → `"/product/voyah/dreamer"` |

> 唯一 modelSlug 是 `dreamer` 而非拼音/数字 — 与 D9 / GX / L90 / V9 不同。

---

## 2. 数据模型(`VehicleModelRoute`)

```typescript
{
  type: "vehicle_model",
  brandSlug: "voyah",
  modelSlug: "dreamer",   // 英文单词,非数字/拼音
  modelName: "岚图梦想家",
  parentPath: "/product/voyah",
  canonicalPath: "/product/voyah/dreamer",
  title: "岚图梦想家专属升级方案",
  navLabel: "梦想家",
  status: "planned",
  priority: "P1",
  projectCount: 20,
  sourcePrd: "docs/PRD/product/VOYAH_DREAMER_TOPIC_PRD_2026-06-25.md",
  legacyPaths: ["/product/voyah-dreamer"],
} as const
```

**字段约束**:

- `projectCount = 20`:海报项目总数
- `status = "planned"`
- `priority = "P1"`
- `navLabel = "梦想家"`:中文(非 "Dreamer"),与车型名一致

---

## 3. 项目分类(按 PRD §3.1)

| 分类 | 项目数(约) | 主要项目 | 用户群 |
|---|---:|---|---|
| 基础保护 | ~6 | 车衣 / 隔热膜 / 360 软包脚垫 / 底盘护板 / 门槛条 / 内饰镀膜 | 新车车主 |
| 家庭 MPV | ~5 | 铝地板 / 腿托 / 氛围灯 / 软包脚垫 / 座舱清洁 | 家庭 MPV 用户 |
| 商务接待 | ~3 | 双拼改色 / 包围 / 氛围灯 / 牌照框 / 内饰质感 | 商务接待用户 |
| 外观个性 | ~4 | 彩绘 / 双拼改色 / AMXT 包围 / BSKT 运动包围 | 外观个性用户 |
| 其他 | ~2 | (其他) | — |
| **合计** | **20** | — | — |

> **核心卖点**:岚图梦想家是 **高端新能源 MPV**,强调 **家庭舒适 / 商务接待 / 后排便利**(与 denza D9 类似,但更偏家庭)。

---

## 4. 字段约定

| 字段 | 约定 | 备注 |
|---|---|---|
| 车型名 | `岚图梦想家` | 4 字中文 |
| 品牌 slug | `voyah` | — |
| 型号 slug | `dreamer` | 英文单词 |
| 页面 title | `岚图梦想家专属升级方案 | 蓝辉轻改 LANHUI` | — |
| H1 | `岚图梦想家专属升级方案` | — |
| 主题色 | `violet-400 #c084fc`(voyah) | — |
| 面包屑 | `产品中心 / 岚图 / 梦想家` | — |
| JSON-LD | `CollectionPage` + `ItemList` | 20 个项目 ListItem |

---

## 5. 实施状态

| 维度 | 状态 | 备注 |
|---|---|---|
| 路由注册 | ✅ | `product-routes.ts` MODELS[8] |
| Legacy Redirect | ✅ | `ALL_LEGACY_ALIASES` 已含 |
| 父品牌页 | ⚪ planned | `/product/voyah` 不存在 |
| 模型子目录 | ⚪ 无 | `src/app/product/voyah/dreamer/page.tsx` 不存在 |
| 数据源 | ⚪ 无 | `voyah-products.ts` 不存在 |
| 5 组件 | ⚪ 无 | 需新建 |
| 图资源 | ⚪ 无 | 20 张图待补 |
| 验证脚本 | ⚪ 无 | 需 `verify-dreamer-images.mjs` |

---

## 6. 实施 TODO

1. 创建 `src/lib/voyah-dreamer-products.ts`(20 个项目)
2. 迁移 / 补图到 `public/images/products/voyah/Dreamer/`
3. 创建 `src/components/voyah/dreamer/5 组件`
4. 创建父页 `/product/voyah/page.tsx` + 子页 `/product/voyah/dreamer/page.tsx`
5. 加 `scripts/verify-dreamer-images.mjs`
6. 在 `/product` 入口加入 voyah 入口

---

## 7. 合规边界(摘自 PRD §3.3)

- ❌ 岚图官方授权 / 原厂配件 / 官方同款
- ❌ 不影响原厂质保 / 100% 无损安装 / 永久质保 / 全网最低
- ❌ 性能提升 / 操控提升 / 制动提升 等不可验证承诺

适配声明(强制)。

---

> 最后更新:2026-06-25
