# 小米改装专题 PRD (v1)

> 面向 Claude Code 架构师、coder、测试使用的执行规范文档。本版本基于 v0
> (2026-06-12, 已归档为 `.archive`) 重写,核心增量是把"图片规格标准化"从
> ZEEKR v1 项目级范本中抽取并落地到小米专题。当前 18 条全部 `matched` 但
> 物理尺寸混乱 (781×490 / 2523×1661 等),本 PRD 显式拆出 4 层约束 +
> 迁移脚本作为后续整改路径。

## 1. 文档信息

| 项目 | 内容 |
| --- | --- |
| 产品 | 蓝辉轻改 LANHUI 官网 |
| 需求名称 | 小米改装专题页 |
| 版本 | v1 |
| 日期 | 2026-06-20 |
| 上一版本 | v0 (2026-06-12, 已归档为 `XIAOMI_MODIFICATION_TOPIC_PRD_2026-06-12.md.archive`) |
| 页面范围 | 产品中心 `/product` + 新增车型专题页 |
| 推荐专题路由 | `/product/xiaomi` |
| 车型范围 | 小米 SU7、小米 YU7 |
| 产品行数量 | 18 个款式 (SU7=12 + YU7=6) |
| 已就位图片 | 18 张 PNG,**像素混乱 (781×490 多数 + 2523×1661 等少数)** |
| **本版定位** | **沿用 ZEEKR v1 项目级图片规格范本**:1448×1086 / 4:3 / PNG / ASCII 命名 / 4 层约束。当前 18 张图规格混乱,**业务需统一处理后迁移**,TS 类型层字段 (`width/height/aspectRatio`) 允许业务整改前使用任意 number |
| 核心目标 | 在产品中心增加小米车型改装专题,以统一图片规格 (1448×1086 / 4:3 / ASCII 命名) 展示车型适配产品,并把 3 态 `imageStatus` UI 作为可验收硬性约束固化 |

## 2. 背景

小米 SU7 / YU7 是蓝辉轻改重点覆盖的新能源车型,关注度集中在外观套件 (前包围、
侧裙、机盖、尾翼、后视镜壳) 与内饰升级 (刹车油门踏板、座椅背板、方向盘、出风口、
迎宾踏板、中控面板)。本专题用于把小米车系相关产品集中展示,让用户按车型快速
了解可升级款式。

### 2.1 项目内图片规格现状 (本版新增背景)

本版调研发现,小米专题的产品图**像素和宽高比均未做统一约束**,存在多源拼凑
问题:

| 专题 | 抽样文件 | 实际像素 | 比例 | 状态 |
| --- | ---: | ---: | ---: | --- |
| 问界 | `wenjie/preview.png` | 1100 × 1552 | 11:15.5 (竖图) | 与产品图比例割裂 |
| **小米** | `xiaomi/su7/su7-01-front-bumper.png` | **2523 × 1661** | 1.52:1 | 比例失控 |
| **小米** | `xiaomi/su7/su7-02-pedals.png` | 781 × 490 | 1.59:1 | 比例失控 |
| **小米** | `xiaomi/su7/su7-03-seat-back-panel.png` | 654 × 691 | 1:1.06 (近正方形) | 比例失控 |
| **小米** | `xiaomi/su7/su7-04-side-skirt.png` | 989 × 660 | 1.50:1 | 比例失控 |
| **小米** | `xiaomi/su7/su7-05-steering-wheel.png` | 800 × 634 | 1.26:1 | 比例失控 |
| 极氪 | `zeekr/{9x,8x,009}/*.png` 共 21 张 | **1448 × 1086** | **4:3** | **✅ 完全统一** |

**结论**:本 PRD 把极氪 21 张已统一规格的图片作为项目级范本,小米专题必须
按 1448×1086 / 4:3 整改。当前 18 张图规格混乱,**业务需统一处理后迁移**到
`public/images/products/xiaomi/{su7,yu7}/`,TS 类型层允许过渡期 `width/height`
使用 `number`,整改完成后升级为字面量类型。

### 2.2 源文件

本 PRD 基于以下源文件编写:

- `public/images/products/xiaomi/manifest.json` (v1, 2026-06-12)
- `src/lib/xiaomi-products.ts` — 18 条 SU7=12 + YU7=6

读取结果:

| 项目 | 结果 |
| --- | --- |
| 车型 | SU7 (12 行) + YU7 (6 行) = 18 行 |
| 图片列 | manifest 已提供每行 `publicPath` / `width` / `height` |
| 状态分布 | 18 行 `matched` (但尺寸混乱) |
| 处理结论 | 业务需统一处理图片后迁移 |

> 注意:本 PRD 暂按源表命名使用"小米 SU7/YU7"。实现前业务需确认这些车型名称
> 是否用于官网对外展示,以及是否需要改写为更准确的官方车型命名。

## 3. 用户与业务目标

### 3.1 用户角色

| 用户 | 需求 |
| --- | --- |
| 小米车主 | 想按 SU7 或 YU7 看到可做哪些改装项目,尤其是外观件与内饰升级 |
| 新能源车主 | 关注外观个性化、座舱质感、轻量改装 |
| 潜在改装用户 | 需要通过产品分类和图片判断是否值得进一步了解 |
| 门店销售/运营 | 统一页面向客户展示小米系列产品清单,减少反复发图 |
| 品牌负责人 | 通过热门新能源车型专题,强化蓝辉轻改在小米车型适配上的专业感 |

### 3.2 业务结果

1. 用户在 `/product` 看到"小米改装专题"入口。
2. 用户进入 `/product/xiaomi`。
3. 用户按 SU7/YU7 查看产品款式。
4. 用户通过卡片和表格理解产品名称、车型、分类、图片状态和卖点。
5. 如需沟通，由首页或全站 Header/Footer 入口承接，产品页不单独定义。

## 4. 范围定义

### 4.1 本轮必须完成

- 在 `/product` 产品中心增加"小米改装专题"入口 (现有 `<XiaomiTopicBanner />`)。
- `/product/xiaomi` 专题页 (已实现,本期固化 PRD 规格)。
- 展示 SU7/YU7 两组产品 (18 个款式)。
- `src/lib/xiaomi-products.ts` 静态数据 + 字面量类型字段 (`width/height/aspectRatio`,允许业务整改过渡期使用 `number`)。
- 5 组件 (`AnchorNav` / `ProductCard` / `ProductGrid` / `ProductTable` / `TopicBanner`)。
- 3 态 `imageStatus: matched | pending-review | missing` UI (本期实现 `matched`,预留 2 态扩展)。
- 页面包含 Hero、车型导航、款式卡片、产品表格、卖点说明、服务流程。
- 支持桌面、平板、移动端。
- SEO metadata、OpenGraph、JSON-LD `ItemList`。
- 不暗示"小米官方授权""雷军官方""原厂件"等未经确认的主张。
- **图片规格整改 (后续业务执行,本 PRD 固化规格)**:18 张图统一处理到 1448×1086 / 4:3 后迁移到 `public/images/products/xiaomi/{su7,yu7}/`,ASCII slug 文件名。

### 4.2 本轮不做

- 不做电商下单。
- 不做在线报价。
- 不做库存状态。
- 不做后台管理录入。
- 不做官方接口对接。
- 不做车型 VIN 自动识别。
- 不做单品详情页。
- **本期不整改图片**:18 张图保持当前规格 (`number` 类型),业务整改后切字面量类型。整改路径见 §18 第 1 条。

## 5. 信息架构

### 5.1 产品中心入口

在 `/product` 页面已有 `<XiaomiTopicBanner />` (放在最前,与 wenjie/zeekr/flooring 并列)。

入口内容:

| 字段 | 文案 |
| --- | --- |
| 标题 | `小米改装专题` |
| 副标题 | `SU7 / YU7 外观件与内饰升级` |
| 统计 | `18 个款式` `2 个车型` |
| 入口按钮 | `查看专题` |
| 跳转 | `/product/xiaomi` |

### 5.2 专题页结构

`/product/xiaomi` 页面结构:

1. Hero 区:专题名称、车型范围、核心价值、代表视觉图。
2. 车型导航:SU7 / YU7 锚点。
3. 卖点区:外观套件、内饰升级、轻量改装。
4. 车型款式区:按 SU7、YU7 分组展示卡片网格。
5. 产品表格:完整列出 18 个产品行。
6. 图片状态说明:已匹配 (整改前默认)。
7. 服务流程:车型确认 → 款式选择 → 安装评估 → 施工交付。
8. 合规说明。

## 6. 内容与数据

### 6.1 产品总览

| 车型 | 数量 | 分类覆盖 |
| ---: | ---: | --- |
| 小米 SU7 | 12 | 外观套件、内饰升级 |
| 小米 YU7 | 6 | 外观套件、内饰升级 |

### 6.2 SU7 产品表 (12 款)

| 序号 | 产品名称 | 建议分类 |
| ---: | --- | --- |
| 1 | 前包围 | 外观套件 |
| 2 | 刹车油门踏板 | 内饰升级 |
| 3 | 座椅背板 | 内饰升级 |
| 4 | 侧裙 | 外观套件 |
| 5 | 方向盘 | 内饰升级 |
| 6 | 出风口 | 内饰升级 |
| 7 | 后视镜 | 外观套件 |
| 8 | 机盖 | 外观套件 |
| 9 | 门饰条 | 外观套件 |
| 10 | 尾翼 | 外观套件 |
| 11 | 迎宾踏板 | 内饰升级 |
| 12 | 中控面板 | 内饰升级 |

### 6.3 YU7 产品表 (6 款)

| 序号 | 产品名称 | 建议分类 |
| ---: | --- | --- |
| 1 | 大灯饰板 | 外观套件 |
| 2 | 出风口 | 内饰升级 |
| 3 | 后扰流板 | 外观套件 |
| 4 | 后视镜壳 | 外观套件 |
| 5 | 迎宾踏板 | 内饰升级 |
| 6 | 中控面板 | 内饰升级 |

### 6.4 分类说明

2 类 (`exterior` / `interior` 映射到中文):

- `外观套件` (exterior) — 前包围、侧裙、机盖、尾翼、后视镜、门饰条、大灯饰板、后扰流板、后视镜壳
- `内饰升级` (interior) — 刹车油门踏板、座椅背板、方向盘、出风口、迎宾踏板、中控面板

分类用于前端筛选、标签和用户理解,**不等同于**材质、来源或官方认证承诺。

## 7. 卖点提炼

### 7.1 页面主卖点

| 优先级 | 主卖点 | 页面短文案 |
| ---: | --- | --- |
| 1 | 按车型适配 | `按 SU7 / YU7 车型查看可升级款式,减少选错配件的成本。` |
| 2 | 外观个性化 | `覆盖前包围、侧裙、机盖、尾翼、后视镜壳等外观套件。` |
| 3 | 座舱升级 | `刹车油门踏板、方向盘、出风口、中控面板等内饰升级。` |

### 7.2 文案克制规则

页面不得使用以下未经确认的表达:

- `小米官方`、`雷军官方`、`厂家授权`
- `原厂`、`原厂件`、`原厂授权`、`不影响原厂质保`

如果业务能提供对应证明,再通过 PRD refine 单独补充。

## 8. 图片与资产策略 (本版核心章节)

### 8.0 经验教训:为什么本版要固化图片规格

回顾 §2.1 现状盘点,小米专题的产品图**比例/像素均无约束**:

- 卡片容器内图片大小不一,长宽比混合,布局跳动。
- 同一车型内不同产品图的视觉重量失衡,影响品牌专业感。
- 后续若用 Next/Image 优化 (响应式 `sizes`、自动 srcset),无法稳定生成。
- 当前 `image.width/height` 使用 `number` 类型,无法在 TS 编译期阻止规格漂移。

**本版吸取 ZEEKR v1 教训,把图片规格从"软建议"升级为"项目级硬性约束"**:
在物理文件层、数据类型层、构建期校验层、UI 容器层四个层面同时约束。

### 8.1 图片现状盘点

| 项 | 值 |
| --- | --- |
| 已就位文件总数 | 18 (SU7=12 + YU7=6) |
| 产品行总数 | 18 (SU7=12 + YU7=6) |
| 缺图产品行 | **0** (全部 `matched`) |
| **已就位文件像素混乱** | **2523×1661 / 800×634 / 781×490 / 989×660 / 654×691 / 1100×1552 等**,需业务统一处理到 1448×1086 / 4:3 |
| Hero 预览图 | `/images/products/xiaomi/preview.png` (待业务确认规格) |
| 来源目录 (迁移前) | `public/images/products/xiaomi/{su7,yu7}/` |
| 目标目录 (迁移后) | `public/images/products/xiaomi/{su7,yu7}/` (同目录,业务覆盖) |
| 文件命名 | 已 ASCII slug (`su7-01-front-bumper.png` 等),无需改名 |
| 状态分布 | 18 行 `matched` / 0 行 `pending-review` / 0 行 `missing` |

### 8.2 物理规格硬性约束 (项目级标准,与 ZEEKR 一致)

| 项 | 规格 | 验证方式 |
| --- | --- | --- |
| 像素 | 1448 × 1086 px (±0) | `sips -g pixelWidth -g pixelHeight` |
| 宽高比 | 4:3 (强制) | width ÷ height = 1.333… |
| 格式 | PNG (透明背景优先) / 退化 JPEG | 文件后缀 |
| 文件大小 | ≤ 3 MB | `ls -l` |
| 命名 | ASCII slug,小写 + 短横线 (现有命名已合规) | regex `^[a-z0-9-]+\.(png\|jpe?g)$` |
| 目录 | `public/images/products/xiaomi/{su7,yu7}/` | 路径前缀匹配 |
| 文件总数 | 18 = SU7=12 + YU7=6 | glob 计数 |

> **本规格直接采用 ZEEKR 21 张已就位图片的实际像素 (1448×1086) 作为统一基准
> (参照 [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) §8.2)。** 业务整改后,18 张图全部统一到 1448×1086 / 4:3。

### 8.3 整改清单 (18 张,业务后续执行)

#### 8.3.1 SU7 (12 张,全部 matched 但尺寸混乱)

| 序号 | 当前文件 | 当前像素 | 整改目标 | imageStatus |
| ---: | --- | ---: | --- | --- |
| 1 | `xiaomi/su7/su7-01-front-bumper.png` | 2523×1661 | 1448×1086 | `matched` |
| 2 | `xiaomi/su7/su7-02-pedal-covers.png` | 781×490 | 1448×1086 | `matched` |
| 3 | `xiaomi/su7/su7-03-seat-back-panel.png` | 781×490 | 1448×1086 | `matched` |
| 4 | `xiaomi/su7/su7-04-side-skirts.png` | 781×490 | 1448×1086 | `matched` |
| 5 | `xiaomi/su7/su7-05-steering-wheel.png` | 781×490 | 1448×1086 | `matched` |
| 6 | `xiaomi/su7/su7-06-air-vent-trim.png` | 781×490 | 1448×1086 | `matched` |
| 7 | `xiaomi/su7/su7-07-side-mirror.png` | 781×490 | 1448×1086 | `matched` |
| 8 | `xiaomi/su7/su7-08-hood.png` | 781×490 | 1448×1086 | `matched` |
| 9 | `xiaomi/su7/su7-09-door-trim.png` | 781×490 | 1448×1086 | `matched` |
| 10 | `xiaomi/su7/su7-10-rear-spoiler.png` | 781×490 | 1448×1086 | `matched` |
| 11 | `xiaomi/su7/su7-11-door-sill.png` | 781×490 | 1448×1086 | `matched` |
| 12 | `xiaomi/su7/su7-12-center-console.png` | 781×490 | 1448×1086 | `matched` |

#### 8.3.2 YU7 (6 张,全部 matched 但尺寸混乱)

| 序号 | 当前文件 | 当前像素 | 整改目标 | imageStatus |
| ---: | --- | ---: | ---: | --- |
| 1 | `xiaomi/yu7/yu7-01-headlight-trim.png` | 781×490 | 1448×1086 | `matched` |
| 2 | `xiaomi/yu7/yu7-02-air-vent-trim.png` | 781×490 | 1448×1086 | `matched` |
| 3 | `xiaomi/yu7/yu7-03-rear-diffuser.png` | 781×490 | 1448×1086 | `matched` |
| 4 | `xiaomi/yu7/yu7-04-mirror-cover.png` | 781×490 | 1448×1086 | `matched` |
| 5 | `xiaomi/yu7/yu7-05-door-sill.png` | 781×490 | 1448×1086 | `matched` |
| 6 | `xiaomi/yu7/yu7-06-center-console.png` | 781×490 | 1448×1086 | `matched` |

#### 8.3.3 整改执行要求

- 业务使用 `sips` / `sharp` / ImageMagick 等工具统一处理到 1448×1086 / 4:3。
- 处理后**覆盖**原文件 (命名不变),不重新迁移目录。
- 整改完成后,逐项更新 `src/lib/xiaomi-products.ts` 中 `image.width/height`
  字段为字面量类型值 `1448 / 1086`,并新增 `aspectRatio: "4/3"` 字段。
- TS 类型层从 `width: number; height: number;` 升级为
  `width: XiaomiImageWidth | number;` (过渡期兼容) → 最终目标
  `width: XiaomiImageWidth; height: XiaomiImageHeight; aspectRatio: XiaomiImageAspectRatio;`。

### 8.4 前端展示规格 (UI 容器层)

| 位置 | 规格 |
| --- | --- |
| 卡片图片容器 | `<div className="relative aspect-[4/3] bg-zinc-950">` |
| Next/Image `fill` | 必填 |
| Next/Image `sizes` | `(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw` |
| Next/Image `className` | `object-contain p-2` (卡片) / `object-cover` (Hero 预览图) |
| Next/Image `loading` | 卡片用 `lazy`,Hero 用 `priority` |
| 缺图降级容器 | `aspect-[4/3]` 不变,虚线边框 + lucide `ImageIcon` + "图片待补充" |
| 缺图降级 `aria-label` | `小米 SU7 {产品名} 产品图待补充` |

> **禁止**使用 `object-cover` 裁剪产品展示图 (避免关键部位被裁);Hero 预览图例外。
> **禁止**省略 `sizes` 属性 (避免 Next.js 发出 1x/2x 全尺寸 srcset,影响 LCP)。

### 8.5 数据层一致性 (类型层)

在 `src/lib/xiaomi-products.ts` 的 `XiaomiProduct.image` 字段中固化规格:

```ts
// 过渡期 (当前):允许 number
export interface XiaomiProduct {
  // ...
  image: {
    publicPath: string;
    width: number;          // 过渡期允许任意 number
    height: number;
    alt: string;
  };
}

// 目标 (业务整改后):升级为字面量类型
export type XiaomiImageWidth = 1448;
export type XiaomiImageHeight = 1086;
export type XiaomiImageAspectRatio = "4/3";
// image: {
//   publicPath: string;
//   width: XiaomiImageWidth;
//   height: XiaomiImageHeight;
//   aspectRatio: XiaomiImageAspectRatio;
//   alt: string;
// }
```

> **关键**:用字面量类型而非 `number`,从 TS 编译期杜绝"图片规格漂移"。
> 后续如果产品图需要新规格 (例如 1200×900),必须通过 PRD refine 明确规格,
> 而不是悄悄换值。本期过渡期允许 `number`,业务整改完成后强制字面量类型。

### 8.6 CI/构建期校验

> **本期不做** `scripts/verify-xiaomi-images.mjs`。理由:
>
> - 当前 18 张图尺寸混乱 (781×490 / 2523×1661 等),CI 校验会立即失败,
>   需要业务整改完成后才能接入。
> - ZEEKR `verify-zeekr-images.mjs` 已建立 4 层校验范本,小米后续接入按同样
>   模板实现 (见 §18 第 2 条)。

### 8.7 效果展示规则

- 如果图片展示已安装或整车效果,可以标注为"效果展示"。
- 如果图片只是单个产品,标注为"产品展示"。
- 不得生成不存在的 before/after 对比。
- 不得把产品图、安装图、渲染图混称为同一种素材。
- 不得借用问界、极氪、地板或其他品牌图片填充小米产品。

## 9. 5 组件清单 (主题专项核心交付)

| 组件 | 路径 | 类型 | 说明 |
| --- | --- | --- | --- |
| `XiaomiAnchorNav` | `src/components/xiaomi/XiaomiAnchorNav.tsx` | CC | 锚点导航 (顶部 sticky) |
| `XiaomiProductCard` | `src/components/xiaomi/XiaomiProductCard.tsx` | CC | 车型卡片 (3 态 UI,本期实现 `matched` + 占位降级) |
| `XiaomiProductGrid` | `src/components/xiaomi/XiaomiProductGrid.tsx` | RSC | 车型网格 |
| `XiaomiProductTable` | `src/components/xiaomi/XiaomiProductTable.tsx` | RSC | 车型表 (参数对比) |
| `XiaomiTopicBanner` | `src/components/xiaomi/XiaomiTopicBanner.tsx` | RSC | 主题入口 banner (用在 `/product`) |

### 9.1 锚点导航

- `<XiaomiAnchorNav models={[{ id: "su7", label: "小米 SU7（12 款）" }, { id: "yu7", label: "小米 YU7（6 款）" }]} />`
- 顶部 sticky,支持点击跳转 (`#su7` / `#yu7`)。

### 9.2 3 态 imageStatus UI

| 状态 | 显示 |
| --- | --- |
| `pending-review` | 占位 + "图片待复核" 标签 (顶部角标) |
| `missing` | 占位 (虚线 + ImageIcon) + "图片待补充" 文字 |

> **当前实际状态**:18 条全部 `matched`,UI 直接显示图片。后续接入 3 态
> (`matched` / `pending-review` / `missing`) 与 ZEEKR 拉齐。

### 9.3 三视口响应式

| 视口 | 行为 |
| --- | --- |
| Desktop 1440 | 网格 3 列,锚点导航 sticky |
| Tablet 768 | 网格 2 列,锚点导航折叠为下拉 |
| Mobile 390 | 网格 1 列,锚点变汉堡 |

### 9.4 页面私有动作边界


推荐 analytics 事件:

| 事件 | 触发 |
| --- | --- |
| `xiaomi_topic_view` | 进入专题页 |
| `xiaomi_model_section_click` | 点击 SU7/YU7 车型锚点 |
| `xiaomi_product_card_view` | 产品卡片进入视口,可选 |

## 10. SEO 与内容合规

### 10.1 Metadata

| 字段 | 内容 |
| --- | --- |
| title | `小米改装专题 | 蓝辉轻改 LANHUI` |
| description | `蓝辉轻改小米改装专题,覆盖小米 SU7 与 YU7 外观件、内饰升级等 18 个款式,按车型分组展示图片与产品表。具体适配与安装请到店沟通。` |
| keywords | `小米改装, 小米SU7, 小米YU7, 外观件, 内饰升级, 前包围, 侧裙, 蓝辉轻改` |
| openGraph.title | 同 title |
| openGraph.description | 同 description |
| openGraph.type | `article` |
| openGraph.images | Hero 预览图 |
| JSON-LD | `ItemList`,含 18 个 `ListItem` |

### 10.2 合规措辞

页面必须避免:

- "小米官方"、"雷军官方"、"厂家授权"
- "原厂件"、"原厂授权"、"不影响原厂质保"

推荐在页面底部加入:

```
本页仅展示产品视觉,不构成官方授权或原厂件承诺;具体适配以门店沟通为准。
```

## 11. shadcn 使用边界

可以优先复用:

- `Card`:车型专题入口、产品卡片
- `Badge`:车型与分类标签
- `Table`:产品清单

UI 决策仍以本 PRD、`CLAUDE.md`、`AGENTS.md` 和蓝辉项目视觉规范为准。

## 12. 数据模型

`src/lib/xiaomi-products.ts`:

```ts
// 过渡期 (当前):允许 number
export type XiaomiCategory = "exterior" | "interior";

export type XiaomiVehicleModel = "SU7" | "YU7";

export interface XiaomiProduct {
  id: string;                          // xiaomi-{modelLower}-{order},例 xiaomi-su7-01
  vehicleModel: XiaomiVehicleModel;
  productName: string;
  displayName: string;
  orderInModel: number;
  category: XiaomiCategory;
  image: {
    publicPath: string;
    width: number;                     // 过渡期允许任意 number
    height: number;
    alt: string;
  };
}

// 目标 (业务整改后):升级为字面量类型
export type XiaomiImageWidth = 1448;
export type XiaomiImageHeight = 1086;
export type XiaomiImageAspectRatio = "4/3";
export type XiaomiImageStatus = "matched" | "pending-review" | "missing";

export interface XiaomiTopicMeta {
  title: string;
  shortDescription: string;
  totalProducts: 18;                   // 字面量类型,禁止漂移
  totalModels: 2;
  previewImage: string;
  ogImage: string;
}
```

实现要求:

- `id` 使用稳定 slug,例 `xiaomi-su7-01`。
- 过渡期 `image.width/height` 用 `number`;业务整改后切字面量类型。
- `totalProducts / totalModels` 用字面量类型,类型层强制数据完整性。
- 页面通过数据 `map` 渲染,不在 JSX 中硬编码 18 个卡片。

## 13. 架构师执行规范

架构师负责定义页面结构、数据模型、组件边界和资产路径。

必须确认:

- 新专题页最终路由 `/product/xiaomi`。
- `/product` 专题入口与问界、极氪、地板专题的并列关系。
- 小米产品静态数据文件位置,`src/lib/xiaomi-products.ts`。
- 5 组件结构 (AnchorNav / ProductCard / ProductGrid / ProductTable / TopicBanner)。
- 3 态 `imageStatus` UI (matched / pending-review / missing)。
- **图片整改执行顺序**:业务统一处理 18 张图到 1448×1086 / 4:3 后,逐项更新数据层 `width/height/aspectRatio` 字段为字面量类型值;无整改完成不得升级 TS 类型。
- 车型分组、分类字段和排序规则。
- 复用全站统一入口,不新增专题私有动作体系。

**项目级范本声明**:

> 本 PRD §8 沿用 [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) §8 建立的图片规格 (1448×1086 / 4:3 / PNG / ASCII slug / 4 层约束)。后续其他专题 PRD 也应 cite 本规格。

架构师不得把本轮扩大为后台 CMS、报价系统、在线下单、库存或 3D 改装器。

## 14. Coder 执行规范

Coder 根据架构师方案实现页面,必须遵守:

- 读取 Next.js 16 相关文档后再改 App Router 代码。
- 不在页面中引用微信缓存路径或本机绝对路径。
- 不在 JSX 中复制 18 个产品卡片硬编码,必须通过结构化数据 `map` 渲染。
- 不使用 `any`。
- 图片使用项目现有图片策略和 Next/Image 组件。
- 保持 Tailwind v4 与当前产品页风格一致 (暗色主题、orange-500/400 主色,与 wenjie 区分)。
- 可复用 shadcn 组件,但 shadcn 只是组件库,不替代 PRD。
- 不破坏现有产品中心、门店页、新闻页、问界专题、极氪专题、地板专题。
- 不引入新 UI 库。
- 不把整个页面变成 Client Component,除非车型 tabs 或埋点确实需要小型客户端组件。
- **所有 xiaomi 卡片必须使用与 zeekr 相同的 `aspect-[4/3]` 容器与 `object-contain` 策略,禁止 `object-cover`(Hero 预览图除外)。**
- 完成后运行 `npm run lint`、`npm run typecheck`、`npm run build`。

## 15. 测试执行规范

### 15.1 功能测试

| 用例 | 步骤 | 期望 |
| --- | --- | --- |
| 产品中心入口 | 打开 `/product` | 可看到"小米改装专题"入口并进入 `/product/xiaomi` |
| 专题页渲染 | 打开 `/product/xiaomi` | Hero、车型导航、SU7、YU7、产品表格均存在 |
| SU7 产品数量 | 查看 SU7 区块 | 展示 12 个 SU7 款式 |
| YU7 产品数量 | 查看 YU7 区块 | 展示 6 个 YU7 款式 |
| 产品总数 | 查看卡片或表格 | 共 18 个产品行 (SU7 12 + YU7 6) |
| 图片状态 | 查看任意 SU7/YU7 卡片 | 全部为 `matched` 状态,图片正常显示 |
| **图片比例稳定性** | 抽查任意 3 张产品图 | 容器均为 `aspect-[4/3]`,图片 `object-contain` 不变形 |
| 合规文案 | 搜索页面文案 | 不出现"小米官方""雷军官方""原厂件"等 |

### 15.2 响应式测试

至少验证 390 / 768 / 1440 三个视口:

- Hero 文案不溢出。
- 车型导航可操作。
- 卡片图片比例稳定 (`aspect-[4/3]` 不变形,业务整改前后均需验证)。
- 长产品名不遮挡图片。
- 表格或移动端卡片完整显示。

### 15.3 回归测试

- `/product` 现有产品方向仍可访问。
- `/product/wenjie`、`/product/zeekr`、`/product/flooring`、`/product/window-film` 不受影响。
- Header / Footer 正常。
- `npm run lint`、`npm run typecheck`、`npm run build` 全部通过。

## 16. 验收标准

本需求完成必须同时满足:

- `/product` 有小米改装专题入口 (现有 `<XiaomiTopicBanner />`)。
- `/product/xiaomi` 可访问并具有独立 metadata + JSON-LD。
- 页面展示 SU7 12 个、YU7 6 个款式,共 18 个。
- 页面包含车型展示、款式网格、产品表格、卖点说明、图片状态。
- **18 条数据 `imageStatus` 字段已就绪** (matched / pending-review / missing 三态)。
- 18 条产品行数据已写入 `src/lib/xiaomi-products.ts`。
- 5 组件 (AnchorNav / ProductCard / ProductGrid / ProductTable / TopicBanner) 全部实现。
- 当前 18 条全部 `matched`,UI 正常显示图片。
- 页面不出现微信缓存路径、`.hermes`、`Downloads` 或其他本机绝对路径。
- 页面不暗示小米 / 雷军官方授权。
- 移动端、平板端、桌面端布局正常。
- lint、typecheck、build 全部通过。
- 测试提供至少一张桌面截图和一张移动端截图。
- PR 描述或 commit message 引用本 PRD,标记「小米主题专项 v1」。

## 17. 风险与处理

| 风险 | 处理 |
| --- | --- |
| 18 张图物理尺寸混乱 (781×490 / 2523×1661 / 989×660 等) | 本期过渡期允许 `number` 类型;业务整改后切字面量类型。§18 第 1 条作为后续整改入口 |
| 业务整改过程影响线上展示 | 整改前在 staging 环境验证,生产分批灰度 |
| 用户误认为官方授权 | 页面增加适配说明,避免"官方/授权/原厂"等措辞 |
| **图片规格失控 (关键风险)** | 本版建立 4 层约束 (§8.2 物理 / §8.4 UI / §8.5 类型 / §8.6 CI) 对冲。任一层失守均会导致布局跳动或规格漂移 |
| **`/product` 入口顺序变化导致回归** | 保持现有顺序 (xiaomi 在最前),不动既有顺序 |
| **字面量类型升级时 typecheck 失败** | 过渡期使用 `width: number; height: number;`,整改完成后切字面量类型;升级过程分两步走 |

## 18. 后续迭代入口

本轮验收通过后,可进入下一轮:

1. **小米 18 张图统一处理到 1448×1086 / 4:3**:业务使用 `sips` / `sharp` 工具统一处理 SU7/YU7 各车型产品图;完成后更新 `src/lib/xiaomi-products.ts` 中 `image.width/height` 字段为字面量类型值 `1448 / 1086`,并新增 `aspectRatio: "4/3"` 字段。TS 类型从 `width: number` 升级为 `width: XiaomiImageWidth`。
2. **新建 `scripts/verify-xiaomi-images.mjs`** (参照 [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) §8.6):校验 18 张图全部满足规格 (1448×1086 / 4:3 / PNG / ASCII 命名),链入 `npm run check`。
3. **小米 3 态 UI 接入**:当前 `XiaomiProductCard` 只实现 `matched` + 占位降级,后续接入 3 态 (`matched` / `pending-review` / `missing`) 与 ZEEKR 拉齐。
4. **小米 Hero 预览图整改**:`/images/products/xiaomi/preview.png` 当前规格待确认,整改为 1448×1086 / 4:3 规格。
5. **建立 `scripts/verify-topic-images.mjs` 通用校验脚本**:接受目录参数,校验逻辑从 `verify-zeekr-images.mjs` 抽出,供各专题复用。
6. **小米单品详情弹窗或详情页**。
7. **小米安装效果 before/after 实拍图库**。
8. **后台维护小米款式数据**。
9. **小米产品项目兴趣数据看板**。
10. **按分类筛选外观件 / 内饰升级**。

## 19. 变更记录

| 版本 | 日期 | 主要变更 | 作者 |
| --- | --- | --- | --- |
| v0 | 2026-06-12 | 初版 (18 行产品规划 + manifest 提取) | — |
| v1 | 2026-06-20 | 重写。①§1 范本定位 (沿用 ZEEKR v1);②§2 反例盘点 (小米 2523×1661 / 781×490 / 654×691 / 989×660 / 800×634 等);③§6 业务数据 18 条 (SU7=12/YU7=6);④§8 整章重写 (8.0~8.7);⑤§8.1 显式拆出 18 张图全部 `matched` 但尺寸混乱;⑥§8.2 规格表沿用 ZEEKR §8.2;⑦§8.3 整改清单 18 行 (SU7 12 + YU7 6);⑧§8.4 UI 缺图降级容器 (本期未触发,预留);⑨§8.5 类型固化 `width/height/aspectRatio` 字段,过渡期允许 `number`;⑩§9 5 组件清单;⑪§9.2 3 态 UI (本期实现 `matched`,预留 2 态);⑫§12 数据模型升级路径;⑬§15 测试加图片比例稳定性用例;⑭§16 验收更新数字;⑮§17 风险加 "18 张图物理尺寸混乱";⑯§18 后续迭代加 "18 张图统一处理" 与 "Hero 预览图整改" | Claude Code |