# 产品 PRD → SPEC 归并报告 — 2026-06-25

> AI 会话: Claude Code
> 维护: 冯科雅 (Coya)
> 主题: 把 30+ 个零散产品 PRD 归并为结构化 SPEC 体系
> 触发: 用户主动要求 "将 docs/PRD/product/ 下 30+ 个产品 PRD 文档,按 PRD-Spec map 归并到 docs/SPEC/public-site/product/ 下的 4 个 SPEC 文件" → 续 "继续更新具体的车型页面的 PRD 文档到 SPEC 中"
> 范围: **纯文档**(docs/SPEC + docs/PRD),不涉及 src/ 代码

---

## 一、为什么做

`docs/PRD/product/` 下积累 30+ 个零散 PRD(2026-06-16 ~ 2026-06-25),但对应 SPEC 只有 1 个粗粒度的 `product-topics.md`。
实现者( coder / AI agent )拿到 PRD 后无法直接开工,需要:
- 反复翻 PRD 才能凑齐路由 / 数据模型 / 组件契约
- 凭经验猜字段含义 → spec drift 风险
- 单车型缺少独立合约 → 13 个车型只有 1 个"产品系列"层级 SPEC

**归并目标**:让每个 PRD 都有**唯一 Primary SPEC** + **明确 Secondary SPEC**,且 single-source-of-truth 化。

---

## 二、本次交付(2 commit + 1 map)

### 2.1 Commit 1: `f7bfe16` — 4 个产品级 SPEC + 映射表

```
docs(spec): consolidate 30+ product PRDs into 4 product-level SPECs + map
 5 files changed, 841 insertions(+), 149 deletions(-)
```

| 文件 | 变更 | 内容覆盖 |
|---|---|---|
| [product-center.md](../../SPEC/public-site/product-center.md) | M +238 | `/product` 入口、3 业务地图、StickyTabBar、FAQ、20 components、ItemList JSON-LD |
| [product-topics.md](../../SPEC/public-site/product-topics.md) | M +222 | 3 品牌 live (wenjie/xiaomi/zeekr) + 8 brand planned + 13 model planned,15 组件,主题色系统 |
| [product-film.md](../../SPEC/public-site/product-film.md) | M +162 | 3 膜类(window-film/ppf/color-film) + 7 套餐子页,11 组件,字面量类型 |
| [product-accessories.md](../../SPEC/public-site/product-accessories.md) | M +204 | 4 live (electric-steps/wheels/chassis/flooring) + 3 P1 planned,6 组件 |
| [product-prd-spec-map.md](../../SPEC/public-site/product-prd-spec-map.md) | A | §1-9 PRD↔SPEC 映射 + 落地总览 |

### 2.2 Commit 2: `6bac06c` — 13 个单车型 SPEC

```
docs(spec): add 13 per-model vehicle SPECs (planned, no page.tsx)
 13 files changed, 1577 insertions(+)
```

路径:`docs/SPEC/public-site/product/models/{brand}-{model}.md`

| 车型 | 优先级 | 项目数 | Legacy Alias | 备注 |
|---|---|---:|---|---|
| 问界 M6 | P0 | 30 | `/product/wenjie-m6` | — |
| 问界 M7 | P0 | 32 | `/product/wenjie-m7` | — |
| 问界 M8 | P0 | 30 | `/product/wenjie-m8` | 🟡 `wenjie-products.ts` 已有 22 旧 M8 数据 |
| 小米 SU7 | P0 | 26 | **无** | ⓢ 由 XIAOMI_SERIES_UPGRADE_PRD 承接 |
| 小米 YU7 | P0 | 28 | `/product/xiaomi-yu7` | — |
| 极氪 9X | P0 | 25 | `/product/zeekr-9x` | — |
| 理想 i8 | P1 | 25 | **无** | 新增品牌,无历史 URL |
| 腾势 D9 | P1 | 22 | `/product/denza-d9` | — |
| 岚图梦想家 | P1 | 20 | `/product/voyah-dreamer` | modelSlug=`dreamer`(英文) |
| 小鹏 GX | P1 | 22 | `/product/xpeng-gx` | — |
| 乐道 L90 | P1 | 20 | `/product/ledao-l90` | — |
| 高山 8 | P1 | 23 | `/product/gaoshan-8` | modelSlug=`8`(纯数字) |
| 智界 V9 | P1 | 22 | `/product/zhijie-v9` | — |
| **合计** | — | **327** | 11/13 有 legacy | — |

### 2.3 单车型 SPEC 模板(7 节统一结构)

每个 SPEC 文件结构一致,便于 AI agent 快速 parse:

```
1. 路由(Canonical + Legacy + Redirect + 解析函数)
2. 数据模型(VehicleModelRoute TypeScript as const)
3. 项目分类(按 PRD §3.1,带 user group 标注)
4. 字段约定(主题色 / title / H1 / breadcrumb / JSON-LD)
5. 实施状态(8 维度矩阵:路由注册/redirect/父品牌/子目录/数据源/5 组件/图资源/verify 脚本)
6. 实施 TODO(6 步:数据源 → 图资源 → 5 组件 → page.tsx → verify 脚本 → 入口链接)
7. 合规边界(摘自 PRD §3.3,强制禁用清单)
```

---

## 三、归并关系图(PRD → SPEC)

```
30+ PRD                                         SPEC
─────────────────────────────────────────────────────────────
PRODUCT_INDEX_PRD_2026-06-25.md ─┐
PRODUCT_ROUTE_ARCHITECTURE_PRD  ─┼─→ product-center.md (Primary)
                                 │
P1_SERVICE_PROJECTS_PRD ─────────┘

WENJIE/XIAOMI/ZEEKR/TESLA/         ┐
LI_AUTO/.../品牌级 PRD (8 个)       ├─→ product-topics.md (Primary)
13 单车型 PRD ───────────────────┘  │    + product/models/*.md (Per-Model)

WINDOW_FILM_TOPIC_PRD ──────────→ product-film.md (Primary)
PPF_PRD / COLOR_FILM_PRD ────────┘

ELECTRIC_STEPS_PRD ─────────────┐
WHEELS_PRD                       ├─→ product-accessories.md (Primary)
CHASSIS_PRD                      │
FLOORING_TOPIC_PRD ─────────────┘

全部 → product-prd-spec-map.md (§1-9 索引)
全部 → topic-pattern.md (Secondary,跨页面组件契约)
```

---

## 四、落地状态总览(2026-06-25 实测)

| SPEC | 文件 | 落地状态 | 实际组件数 | 实际路由数 |
|---|---|---|---:|---:|
| 产品中心入口 | [product-center.md](../../SPEC/public-site/product-center.md) | ✅ v3 全量落地 | 20 组件(9 v3 + 11 utility) | 1(/product) |
| 膜类服务 | [product-film.md](../../SPEC/public-site/product-film.md) | ✅ 3 膜类 + 7 套餐子页全落地 | 11 组件(1 共享 + 10 窗膜/film) | 4(3 膜 + 7 子页) |
| 轻改装备 + 实用配件 | [product-accessories.md](../../SPEC/public-site/product-accessories.md) | 🔧 4 live + 3 P1 planned | 6 组件(1 共享 + 5 flooring) | 4 live + 3 planned(404 until built) |
| 品牌 / 车型专题 | [product-topics.md](../../SPEC/public-site/product-topics.md) | 🔧 3 品牌 live + 8 planned + 13 车型 planned | 15 组件(3 品牌 × 5) | 3 live + 8 brand dir + 13 model dir built-but-empty |
| **13 单车型专题** | [product/models/](../../SPEC/public-site/product/models/) × 13 | ⚪ **全部 planned,无 page.tsx** | 0 组件(待新建) | 13 dir built(空),等 8 个父品牌上线后逐个落地 |

---

## 五、特殊命名 / 路由治理发现

归并过程中暴露的 3 个**未来需统一**的问题点:

### 5.1 modelSlug 命名不一致

| modelSlug | 形态 | 其他车型 |
|---|---|---|
| `dreamer`(岚图梦想家) | 英文单词 | 其他都是 拼音/数字 |
| `8`(高山 8) | 纯数字字符串 | — |
| `m6` / `m7` / `m8` / `l90` / `gx` / `9x` / `v9` / `i8` / `d9` / `su7` / `yu7` | 字母+数字 | 标准 |

**影响**:`next.config.ts` 路由 redirect 配置时,`/product/gaoshan/8` vs `/product/gaoshan-8` 哪个是 canonical 要在 PRD 阶段就明确。

**当前决策**:canonical 用 `/product/{brand}/{model}`(永远带 brand 前缀),legacy 用 `/product/{brand}-{model}`(连字符),解析走 `getCanonicalFor()`。**不需要改**。

### 5.2 无 legacy alias 的 2 个特例

| 车型 | 原因 |
|---|---|
| 小米 SU7 | 之前没有 `/product/xiaomi-su7` URL,canonical 直挂(无 SEO 历史负担) |
| 理想 i8 | i8 是新车型,2026 才发布,无历史 URL |

**验证**:`product-routes.ts` `ALL_LEGACY_ALIASES` 数组确认只含 11 个 alias,不含上述 2 个。

### 5.3 XIAOMI SU7 跨 PRD 边界

SU7 没有独立 PRD,由 [XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md](../../PRD/product/XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md)(覆盖 SU7 + YU7 系列升级)承接业务定义。
2026-06-25 提前建了 [models/xiaomi-su7.md](../../SPEC/public-site/product/models/xiaomi-su7.md) Per-Model SPEC,等 SU7 业务正式拆 PRD 时,只需在 map §6 把 sourcePrd 字段从 `XIAOMI_SERIES_UPGRADE` 改成 `XIAOMI_SU7` 即可。

---

## 六、13 个单车型 SPEC 落地路径(等下次 sprint)

每个 Per-Model SPEC 都已明确列出 6 步 TODO:

```
1. 创建 src/lib/{brand}-{model}-products.ts (X 个项目,字面量类型)
2. 迁移 / 补图到 public/images/products/{brand}/{Model}/ (X 张图,4:3, 1448×1086)
3. 创建 src/components/{brand}/{model}/ 5 组件 (AnchorNav / ProductCard / ProductGrid / ProductTable / TopicBanner)
4. 创建 src/app/product/{brand}/{model}/page.tsx RSC (Hero + 锚点 + X 个车型 section + 服务流程 + CTA + JSON-LD)
5. 加 scripts/verify-{model}-images.mjs CI 脚本
6. 在 src/app/product/page.tsx 加 <XxxTopicBanner /> 入口
```

**实施顺序建议**(P0 先于 P1):

```
Phase A (P0, 等父品牌页落地后立即做):
  问界 M6/M7/M8 + 小米 SU7/YU7 + 极氪 9X

Phase B (P1, 父品牌新上线时同步做):
  理想 i8 / 腾势 D9 / 岚图梦想家 / 小鹏 GX / 乐道 L90 / 高山 8 / 智界 V9
```

**前置依赖**:
- P0 模型:需先建父品牌页(目前只有 wenjie / xiaomi / zeekr live,但 6 P0 模型分属这 3 父品牌 → 父品牌已 OK,**只缺 page.tsx**)
- P1 模型:需先建 5 个新父品牌页(li-auto / denza / voyah / xpeng / ledao / gaoshan / zhijie)

---

## 七、验证 & 后续

### 7.1 本次未做(避免越界)

- ❌ 没创建任何 `src/**` 文件
- ❌ 没运行 `npm run build` / `npm run test`(纯文档变更,无代码)
- ❌ 没改 `product-routes.ts`(registry 已含 13 MODEL,2026-06-25 之前已 commit)
- ❌ 没动图片资源(等具体实现 sprint 启动时按 SPEC 6 步 TODO 走)

### 7.2 下次 sprint 起点

- 优先级最高:**WENJIE_M8**(已有 22 旧产品数据,补全 8 个 + page.tsx 即可发布)
- 优先级次之:**XIAOMI_YU7 / WENJIE_M7**(数据零起点,但需求最热)
- 后续:`ZEKR_9X → XIAOMI_SU7 → WENJIE_M6`(数据 + 父品牌 ready)

### 7.3 索引同步

- ✅ [INDEX.md](./INDEX.md) §6 加引用
- ⏳ 待做:`docs/SPEC/INDEX.md` 顶部加 "13 单车型 SPEC 目录" 区块
- ⏳ 待做:`docs/PRD/product/README.md` 链接到 per-model SPEC 目录

---

## 八、commit 记录

```bash
$ git log --oneline -2
f7bfe16 docs(spec): consolidate 30+ product PRDs into 4 product-level SPECs + map
6bac06c docs(spec): add 13 per-model vehicle SPECs (planned, no page.tsx)
```

---

> 本次完成:4 个产品 SPEC(841 行) + 13 个单车型 SPEC(1577 行) + 1 个映射表(197 行)。
> 状态:✅ 文档归并完成,无代码变更,等下次 sprint 启动实施。
> 维护:冯科雅(Coya) · 2026-06-25
