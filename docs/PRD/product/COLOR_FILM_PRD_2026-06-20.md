# 改色膜产品页 PRD (v1)

> 面向 Claude Code 架构师、coder、测试使用的执行规范文档。
> 本版本基于 [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.2 列出的 v0 状态条目升级为 v1。
> 覆盖路由:`/product/color-film`(改色膜汽车膜系详情页)

---

## 1. 概述

| 项目 | 内容 |
| --- | --- |
| 页面 | `/product/color-film` |
| 类型 | 产品详情(汽车膜系方向之一) |
| 优先级 | P0 |
| Owner | 冯科雅 (Coya) |
| 版本 | v1 (2026-06-20) |
| 上一版本 | 无独立 PRD(数据定义在 `src/lib/products.ts` 中的 `slug: "color-film"` 条目,本次首次独立成文) |
| 主题色 | `orange`(汽车膜系方向) |
| 数据来源 | 静态数据 `src/lib/products.ts` → `getProduct("color-film")` |
| 共享渲染 | `src/components/ProductDetail.tsx`(通过 `product.slug === "color-film"` 分支渲染「15 大系列」「6 类热门颜色」「专车专用施工保障」三大专属区) |
| 上游 PRD | [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.2 |
| 关联 PRD | [PRODUCT_INDEX_PRD_2026-06-20.md](./PRODUCT_INDEX_PRD_2026-06-20.md) · [WINDOW_FILM_PACKAGE_DETAIL_PRD_2026-06-14.md (归档)](../archive/WINDOW_FILM_PACKAGE_DETAIL_PRD_2026-06-14.md.archive) · [PPF_PRD_2026-06-20.md](./PPF_PRD_2026-06-20.md) |

### 1.1 目标

为追求个性外观 / 年轻车主 / 新能源车主呈现车身改色膜产品页,展示 15 大色系(亮光/马卡龙/电光/水晶/镭射等)、6 类热门颜色(黑灰/白/粉紫/蓝绿/黄/金属)与「专车专用施工保障」(验收标准),引导到店沟通。

### 1.2 主题色

`orange`(orange-500 主 / orange-400 强调 / orange-950/40 卡片底)。`ProductDetail` 通过 `product.group === "film"` 自动判断。

### 1.3 范围

- ✅ **包含**: 改色膜详情页的元数据、Hero、tagline 横幅、4 个核心价值(色系丰富 / 保护原漆 / 个性表达 / 无需喷漆)、15 大改色系列区、6 类热门颜色区、专车专用施工保障(验收标准)、4 步服务流程、面包屑;与 `/product` 入口的衔接;三视口响应式与 SEO metadata。
- ❌ **不包含**: 单品 SKU 价格表(改色膜按色系聚合,无单品定价展示);若后续按品牌扩展,需独立 PRD 走主题专项模式;不在本页引入汽车喷漆服务、不暗示「原厂漆」替代方案。

---

## 2. 用户故事

| 角色 | 场景 | 期望 | 优先级 |
| --- | --- | --- | --- |
| 年轻 / 女性车主 | 想换浅色 / 马卡龙 / 镭射外观 | 看到 15 大系列 + 6 类热门颜色,能快速选到心仪色系 | P0 |
| 新能源车主 | 想个性化又保留原厂车漆 | 看到「保护原漆」+「无需喷漆」,信任覆膜方案 | P0 |
| 二手车保值车主 | 担心改色影响二手车评估 | 看到「无需喷漆,不影响二手车评估」,放下顾虑 | P0 |
| 改色犹豫期车主 | 担心撕除后是否恢复 | 看到「撕除后可恢复」,愿到店沟通 | P0 |
| 轻改爱好者 | 想横向对比 6 大产品方向 | 在 `/product` 看到「改色膜」入口,跳转详情页 | P1 |
| 潜客 | 改色后养护注意事项不明 | 看到服务流程 4 步 + 施工保障 | P1 |
| SEO/搜索引擎 | 想收录产品详情页 | 看到独立 `<title>` + `<meta description>` | P2 |

---

## 3. 功能清单

| # | 功能 | 优先级 | 状态 |
| --- | --- | --- | --- |
| F1 | Hero:面包屑(产品中心 → 改色膜)+ 组别标签(汽车膜系)+ H1 + heroDescription | P0 | ✅ |
| F2 | Tagline 横幅:渐变文字「换个颜色,换种心情」 | P0 | ✅ |
| F3 | 核心价值区:4 张卡片(色系丰富 / 保护原漆 / 个性表达 / 无需喷漆) | P0 | ✅ |
| F4 | 15 大改色系列区:`colorSeries` 网格(亮光 / 马卡龙 / 电光 / 水晶 / 镭射 / 绸缎冰 / 星空 / 午夜 / 白色幻彩 / 幻彩 / 钻石 / 银河 / 彩虹电镀 / 极光金属 / 亚光电镀) | P0 | ✅ |
| F5 | 6 类热门颜色区:`hotColors` 按色系分组(黑灰色系 / 白色系 / 粉紫色系 / 蓝绿色系 / 黄色系 / 金属质感色) | P0 | ✅ |
| F6 | 专车专用施工保障(验收标准):折痕 / 划痕 / 起泡 / 尘点 / 胶痕 / 包边 | P0 | ✅ |
| F7 | 服务流程区:4 步流程 | P0 | ✅ |
| F8 | 三视口响应式 | P0 | ✅ |
| F9 | SEO metadata | P0 | ✅ |
| F10 | Header / Footer / 全站统一咨询入口 | P0 | ✅ |

---

## 4. UI / 交互

### 4.1 视觉规范

- **主色**: `orange-500` / `orange-400` / `orange-950/40`
- **背景**: `bg-zinc-950` + `bg-black border-y border-zinc-900` 交替
- **图片容器**: 当前 `productImageMap["color-film"] = "/images/products/color-film.png"`(Hero 区域目前未在 `ProductDetail` 中渲染该图;若未来补图,统一 `aspect-[4/3] + object-contain + Next/Image sizes`)
- **字体**: Geist Sans
- **圆角**: `rounded-2xl` / `rounded-xl`
- **间距**: `py-16` / `gap-4 md:gap-6`

### 4.2 组件清单

| 组件 | 路径 | 类型 | 说明 |
| --- | --- | --- | --- |
| `<Header>` | `src/components/Header.tsx` | CC | 全站统一头 |
| `<Footer>` | `src/components/Footer.tsx` | RSC | 全站统一底 |
| `<ProductDetail>` | `src/components/ProductDetail.tsx` | RSC | 6 大产品线共享渲染器;`color-film` 分支渲染 3 个专属区 |
| `Sparkles` / `Check` / `Palette` / `Droplets` | `lucide-react` | — | 核心价值 + 改色系列 + 热门颜色区 icon |

### 4.3 改色系列区(`color-film` 分支)

- **布局**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6`
- **卡片内容**: H3 系列中文名 + 英文名 + 风格描述 + 「适合：」受众标签
- **数量约束**: 数据驱动 `colorSeries`(`MaxItems = 15`,与 `src/lib/products.ts` 实际条数一致)

### 4.4 热门颜色区(`color-film` 分支)

- **布局**: `space-y-8` 纵向,每组 `flex flex-wrap gap-2`
- **色块**: `bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm px-3 py-1.5 rounded-full`
- **数量约束**: 数据驱动 `hotColors`,共 6 组(黑灰色系 / 白色系 / 粉紫色系 / 蓝绿色系 / 黄色系 / 金属质感色)

### 4.5 专车专用施工保障(`color-film` 分支)

- **触发条件**: `product.slug === "color-film"`(同时覆盖 `ppf` / `window-film`)
- **内容**: 验收标准表(折痕 / 划痕 / 起泡 / 尘点 / 胶痕 / 包边)
- **数据来源**: `src/lib/products.ts` 中 `serviceGuarantee.acceptance`

### 4.6 三视口响应式

| 视口 | 行为 |
| --- | --- |
| Desktop 1440 | 改色系列 3 列 / 热门颜色按组换行 / 验收标准表全宽 |
| Tablet 768 | 改色系列 2 列 |
| Mobile 390 | 改色系列 1 列 / 热门颜色色块 1 列换行 / 验收标准表横向滚动 |

### 4.7 交互细节

- **面包屑**:`产品中心` 可点击 → `/product`
- **改色系列卡**:静态展示
- **热门颜色色块**:静态 chip(无点击,仅视觉聚合)
- **CTA**:本页**不**含私有 CTA

---

## 5. 数据模型

### 5.1 静态数据

```
src/lib/products.ts → getProduct("color-film")
```

**数据契约**:

```ts
{
  slug: "color-film",
  name: "改色膜",
  group: "film",
  groupLabel: "汽车膜系",
  tagline: "换个颜色,换种心情",
  cardDescription: "色系丰富可选,不伤原漆,撕除即可恢复。",
  heroDescription: "车身改色膜适合希望改变车辆外观风格、提升视觉个性,同时保留原厂车漆的车主。通过车身覆膜方式,可以在不喷漆的前提下改变车辆颜色。",
  audience: [
    "追求个性外观的车主",
    "年轻车主",
    "新能源车主",
  ],
  values: [
    { title: "色系丰富", description: "提供亮光、马卡龙、电光、水晶、镭射等 15 大系列" },
    { title: "保护原漆", description: "覆膜保护原厂车漆,撕除后可恢复" },
    { title: "个性表达", description: "满足个性化、年轻化、视觉升级需求" },
    { title: "无需喷漆", description: "不动原车漆,不影响二手车评估" },
  ],
  process: PROCESS_TEMPLATE,
  colorSeries: [
    { slug: "glossy", name: "亮光系列", englishName: "Glossy", style: "亮面质感,接近原厂漆面效果,视觉干净直接", audience: "喜欢经典、耐看、接近原车漆质感的车主" },
    { slug: "macaron", name: "马卡龙系列", englishName: "Macaron", style: "色彩柔和,年轻时尚,偏轻奢与潮流风格", audience: "年轻车主、女性车主、新能源车主" },
    { slug: "galaxy", name: "电光系列", englishName: "Galaxy", style: "带有强烈光泽变化,视觉冲击力强", audience: "喜欢高辨识度和运动感的车主" },
    { slug: "crystal", name: "水晶系列", englishName: "Crystal", style: "通透感更强,色彩层次明显", audience: "喜欢高级感和细腻色彩变化的车主" },
    { slug: "prisma", name: "镭射系列", englishName: "Prisma", style: "多角度变色,具有科技感和炫彩效果", audience: "追求个性化、潮流化的车主" },
    { slug: "satin-chrome", name: "绸缎冰系列", englishName: "Satin Chrome", style: "半哑光、金属、丝滑质感", audience: "喜欢高级、克制、轻奢风格的车主" },
    { slug: "starlight", name: "星空系列", englishName: "Starlight", style: "星空闪点效果,视觉更梦幻", audience: "喜欢独特色彩和夜间效果的车主" },
    { slug: "midnight", name: "午夜系列", englishName: "Midnight", style: "深色系、黑色系为主,沉稳运动", audience: "喜欢低调、运动、黑武士风格的车主" },
    { slug: "white-iridescent", name: "白色系列", englishName: "White Iridescent", style: "白色珠光、幻彩、冰感风格", audience: "喜欢干净、简约、高级白色系的车主" },
    { slug: "magic", name: "幻彩系列", englishName: "Magic", style: "色彩变化明显,个性化强", audience: "喜欢高回头率的车主" },
    { slug: "diamond", name: "钻石系列", englishName: "Diamond", style: "带颗粒闪光质感,视觉更精致", audience: "喜欢亮眼、精致、闪粉质感的车主" },
    { slug: "pearl-metal", name: "银河系列", englishName: "Pearl Metal", style: "珠光金属质感,兼具高级和运动", audience: "喜欢金属质感和高级光泽的车主" },
    { slug: "iridescence-chrome", name: "彩虹电镀系列", englishName: "Iridescence Chrome", style: "彩虹变色、电镀质感强", audience: "追求强烈个性和视觉冲击的车主" },
    { slug: "metallic", name: "极光金属系列", englishName: "Metallic", style: "金属色泽明显,适合越野和性能车风格", audience: "喜欢力量感、机械感的车主" },
    { slug: "matt-chrome", name: "亚光电镀系列", englishName: "Matt Chrome", style: "哑光与电镀结合,质感强烈", audience: "喜欢低调但有高级质感的车主" },
  ], // 15 条
  hotColors: [
    { category: "黑灰色系", colors: ["电光金属黑", "磨砂黑", "电光深邃灰", "超哑灰蓝", "液态金属银", "电光钛灰"] },
    { category: "白色系", colors: ["珠光白", "钻石白", "皓面钻石珠白", "水晶纳多灰"] },
    { category: "粉紫色系", colors: ["超美金属冰莓粉", "电光樱花粉", "双色情雾果胭粉", "双色情幻灰樱紫"] },
    { category: "蓝绿色系", colors: ["水晶远阿宝蓝", "电光墨绿", "美幻彩冰川蓝幻绿", "水晶冰川蓝", "水晶迪芙尼", "彩虹祖母绿"] },
    { category: "黄色系", colors: ["珠光荧光黄", "水晶卡其绿"] },
    { category: "金属质感色", colors: ["超亮金属银河蓝", "超亮金属黑", "银河系列", "极光金属系列"] },
  ], // 6 组
  // series / performanceRatings / packages / specs / protectionScenes: undefined
}
```

### 5.2 字面量类型约束(如适用)

本页**不**走 5 组件主题专项模式(改色膜按色系聚合,无 N 个独立款式 + 单图),因此**不需要** `Width = 1448` / `Height = 1086` / `AspectRatio = "4/3"` 字面量约束。

**但** 15 大系列与 6 类热门色是**强契约**,若数据漂移会导致页面结构变化。建议在 `src/lib/products.ts` 顶部加 `type ColorSeriesCount = 15; type HotColorGroupCount = 6;` 作为字面量类型(本版暂不强制,作为后续重构入口)。

### 5.3 3 态 imageStatus(如适用)

不适用。

### 5.4 CI 验证脚本

不适用(无图片规格校验对象)。

---

## 6. API 接口

| Method | 路径 | 用途 |
| --- | --- | --- |
| — | — | 此页面为**纯静态 SSG**,不调用任何 API |

未来若需要新增「色卡查询」「改色预约」等动态能力,由独立 PRD 定义。

---

## 7. 验收标准 (DoD)

### 7.1 功能

- [ ] `/product/color-film` 可访问,无 404
- [ ] Hero 显示 H1 `改色膜` + 副文案「车身改色膜适合希望改变车辆外观风格…」
- [ ] Tagline 横幅显示渐变文字「换个颜色,换种心情」
- [ ] 核心价值区展示 4 张卡片(色系丰富 / 保护原漆 / 个性表达 / 无需喷漆)
- [ ] **改色系列区**展示 15 个系列卡片(亮光 → 亚光电镀)
- [ ] **热门颜色区**展示 6 组分类色块
- [ ] **专车专用施工保障**展示验收标准表(6 项:折痕 / 划痕 / 起泡 / 尘点 / 胶痕 / 包边)
- [ ] 服务流程区展示 4 步流程
- [ ] 面包屑可点击「产品中心」回退

### 7.2 性能

- [ ] LCP < 3s (desktop) / < 4s (mobile)
- [ ] CLS = 0
- [ ] 改色系列 15 卡不出现明显布局跳动

### 7.3 质量门

- [ ] `npx tsc --noEmit` 通过
- [ ] `npm run build` 通过
- [ ] `npm run lint` 通过
- [ ] Playwright e2e 通过

### 7.4 内容规范

- [ ] 文案不含「原厂 / 官方 / 授权 / 喷漆」等未经确认措辞
- [ ] 文案与 `src/lib/products.ts` 中的 `color-film` 数据完全一致
- [ ] 15 个系列、6 组热门颜色全部通过 `map` 渲染,JSX 不硬编码
- [ ] 验收标准 6 项数据驱动自 `serviceGuarantee.acceptance`,不硬编码

### 7.5 SEO

- [ ] 独立 `<title>`: `改色膜 | 蓝辉轻改 LANHUI`
- [ ] 独立 `<meta description>`: 「蓝辉轻改改色膜服务,为车主提供颜色个性化的方案,色系丰富,施工后可恢复原车漆。」
- [ ] `/product` 入口可点击跳转到本页

### 7.6 可访问性

- [ ] 语义化 HTML 正确
- [ ] 验收标准表 header / cell 语义正确(`<thead>` / `<tbody>`)
- [ ] 颜色对比 ≥ 4.5:1

---

## 8. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
| --- | --- | --- | --- |
| 2026-06-20 | v1 | **首次独立成文**。8 节完整规格;明确「15 大系列 + 6 类热门颜色 + 专车专用施工保障」三专属区数据契约;划清与 wenjie/zeekr 主题专项模式的边界 | Coya |
| (历史) | v0(隐式) | 数据在 `src/lib/products.ts` 中定义,无独立 PRD | — |

---

## 附录 A: 与其他产品页 PRD 的关系

- **同方向(膜系)**:`/product/window-film` 共享橙色主题与「专车专用施工保障」,但走「太阳膜套餐 + 单品参数」双区结构(归档于 [WINDOW_FILM_PACKAGE_DETAIL_PRD_2026-06-14.md.archive](../archive/WINDOW_FILM_PACKAGE_DETAIL_PRD_2026-06-14.md.archive));`/product/ppf` 共享橙色主题,走「防护场景 + 系列参数 + 性能等级对比」三区结构(详见 [PPF_PRD_2026-06-20.md](./PPF_PRD_2026-06-20.md))。
- **轻改装备方向**:`/product/electric-steps` / `/product/wheels` / `/product/chassis` 走蓝色主题,无「系列 / 颜色 / 套餐」三区。
- **主题专项**:`/product/zeekr` / `/product/wenjie` / `/product/xiaomi` / `/product/flooring` 走**独立 5 组件模式**。

## 附录 B: 相关文档

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §5.2
- [../../ARCHITECTURE.md](../../ARCHITECTURE.md)
- [../../CLAUDE.md](../../CLAUDE.md) — 数据访问约定
- [./PRODUCT_INDEX_PRD_2026-06-20.md](./PRODUCT_INDEX_PRD_2026-06-20.md) — 产品中心入口
- [./PPF_PRD_2026-06-20.md](./PPF_PRD_2026-06-20.md) — 同方向参考实现
- [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §11](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) — 性能基线
