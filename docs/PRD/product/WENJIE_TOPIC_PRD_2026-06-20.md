# 问界改装专题 PRD (v1)

> 面向 Claude Code 架构师、coder、测试使用的执行规范文档。本版本基于 v0
> (2026-06-13, 已归档为 `.archive`) 重写,核心增量是把"图片规格标准化"从
> ZEEKR v1 项目级范本中抽取并落地到问界专题,同时显式拆出 `imageStatus` 三态
> UI 对冲当前 44 条 `pending` 占位 (业务待人工核对图片后逐项标记 `matched`)。

## 1. 文档信息

| 项目 | 内容 |
| --- | --- |
| 产品 | 蓝辉轻改 LANHUI 官网 |
| 需求名称 | 问界改装专题页 |
| 版本 | v1 |
| 日期 | 2026-06-20 |
| 上一版本 | v0 (2026-06-13, 已归档为 `WENJIE_MODIFICATION_TOPIC_PRD_2026-06-13.md.archive`) |
| 页面范围 | 产品中心 `/product` + 新增车型专题页 |
| 推荐专题路由 | `/product/wenjie` |
| 车型范围 | 问界 M7、问界 M8、问界 M9 |
| 产品行数量 | 44 个款式 (M7=6 + M8=22 + M9=16) |
| 已就位图片 | **0 张** (当前 44 条全部 `imageStatus="pending"`,`publicPath=null`) |
| **缺图产品行** | **44 个** (源 manifest `imageMatchingNote` 明确:"Images were extracted from reconstructed Excel drawing payloads. Product-level matching still needs manual review before binding images to product rows." UI 必须显式降级) |
| **本版定位** | **沿用 ZEEKR v1 项目级图片规格范本**:1448×1086 / 4:3 / PNG / ASCII 命名 / 4 层约束。当前 44 条 pending,业务核对后逐项切 `matched`,数据层字段(`width/height/aspectRatio`)已就绪 |
| 核心目标 | 在产品中心增加问界车型改装专题,以统一图片规格 (1448×1086 / 4:3 / ASCII 命名) 展示车型适配产品,并把 3 态 `imageStatus` UI 作为可验收硬性约束固化 |

## 2. 背景

蓝辉轻改正在从汽车膜、车衣、改色膜延展到新能源车型轻改装。问界 (AITO) 用户
群体覆盖 M5/M7/M8/M9 等多款高端 SUV/MPV,关注座舱质感、收纳便利、防护配件、
电动踏板、地板 / 脚垫等细分升级项目。本专题用于把问界车系相关产品集中展示,
让用户按车型快速了解可升级款式。

### 2.1 项目内图片规格现状 (本版新增背景)

本版调研发现,项目内其他专题的产品图在像素和宽高比上**未做统一约束**:

| 专题 | 抽样文件 | 实际像素 | 比例 | 状态 |
| --- | ---: | ---: | ---: | --- |
| **问界** | `wenjie/preview.png` | 1100 × 1552 | 11:15.5 (竖图) | 与产品图比例割裂 |
| 小米 | `xiaomi/su7/su7-01-front-bumper.png` | 2523 × 1661 | 1.52:1 | 比例失控 |
| 小米 | `xiaomi/su7/su7-02-pedals.png` | 781 × 490 | 1.59:1 | 比例失控 |
| 小米 | `xiaomi/su7/su7-03-seat-back-panel.png` | 654 × 691 | 1:1.06 (近正方形) | 比例失控 |
| 小米 | `xiaomi/su7/su7-04-side-skirt.png` | 989 × 660 | 1.50:1 | 比例失控 |
| 小米 | `xiaomi/su7/su7-05-steering-wheel.png` | 800 × 634 | 1.26:1 | 比例失控 |
| 极氪 | `zeekr/{9x,8x,009}/*.png` 共 21 张 | **1448 × 1086** | **4:3** | **✅ 完全统一** |

**结论**:本 PRD 把极氪 21 张已统一规格的图片作为项目级范本,问界专题必须
按 1448×1086 / 4:3 落地。当前 44 条 `pending` 数据业务核对图片后,迁移到
`public/images/products/wenjie/{m7,m8,m9}/`,并按 ZEEKR §8.3 模板改 ASCII
slug 文件名。

### 2.2 源文件

本 PRD 基于以下源文件编写:

`public/images/products/wenjie/manifest.json` (v1, 2026-06-13)

读取结果:

| 项目 | 结果 |
| --- | --- |
| 车型 | M7 (6 行) + M8 (22 行) + M9 (16 行) = 44 行 |
| 图片列 | manifest 标记 `imageMatchingNote`:产品级匹配需人工复核 |
| 位图签名 | manifest 已提取位图,需逐项绑定到产品行 |
| 处理结论 | **当前 44 条全部 `imageStatus="pending"`,`publicPath=null`** |

> 注意:本 PRD 暂按源表命名使用"问界 M7/M8/M9"。实现前业务需确认这些车型
> 名称是否用于官网对外展示,以及是否需要改写为更准确的官方车型命名。

## 3. 用户与业务目标

### 3.1 用户角色

| 用户 | 需求 |
| --- | --- |
| 问界车主 | 想按车型快速看到可做哪些轻改项目,尤其是电动踏板、地板、尾箱、内饰保护等 |
| 高端新能源用户 | 关注座舱质感、收纳便利、防护耐用和安装后是否协调 |
| 潜在改装用户 | 需要通过产品分类和表格判断是否值得进一步了解 |
| 门店销售/运营 | 统一页面向客户展示问界系列产品清单,减少反复发图 |
| 品牌负责人 | 通过热门新能源车型专题,强化蓝辉轻改在车型适配上的专业感 |

### 3.2 业务结果

本轮要建立一个问界车型专题的前台展示闭环:

1. 用户在 `/product` 看到"问界改装专题"入口。
2. 用户进入 `/product/wenjie`。
3. 用户按 M7/M8/M9 查看产品款式。
4. 用户通过卡片和表格理解产品名称、车型、分类、图片状态和卖点。
5. 如需沟通，由首页或全站 Header/Footer 入口承接，产品页不单独定义。

## 4. 范围定义

### 4.1 本轮必须完成

- 在 `/product` 产品中心增加"问界改装专题"入口 (现有 `<WenjieTopicBanner />`)。
- `/product/wenjie` 专题页 (已实现,本期固化 PRD 规格)。
- 展示 M7/M8/M9 三组产品 (44 个款式)。
- `src/lib/wenjie-products.ts` 静态数据 + 字面量类型 `Width/Height/AspectRatio`。
- 5 组件 (`AnchorNav` / `ProductCard` / `ProductGrid` / `ProductTable` / `TopicBanner`)。
- 3 态 `imageStatus: matched | pending-review | missing` UI。
- 页面包含 Hero、车型导航、款式卡片、产品表格、卖点说明、服务流程。
- 支持桌面、平板、移动端。
- SEO metadata、OpenGraph、JSON-LD `ItemList`。
- 不暗示"问界官方授权""华为官方合作""原厂件"等未经确认的主张。
- **图片迁移 (后续业务执行,本 PRD 固化规格)**:44 张图迁移到 `public/images/products/wenjie/{m7,m8,m9}/`,ASCII slug 文件名,1448×1086 / 4:3。

### 4.2 本轮不做

- 不做电商下单。
- 不做在线报价。
- 不做库存状态。
- 不做后台管理录入。
- 不做官方接口对接。
- 不做车型 VIN 自动识别。
- 不做单品详情页。
- **本期不补图**:44 条数据 `imageStatus="pending"`,业务核对图片后逐项切 `matched`。补图路径见 §18 第 1 条。

## 5. 信息架构

### 5.1 产品中心入口

在 `/product` 页面已有 `<WenjieTopicBanner />` (由 `<XiaomiTopicBanner />` 之后
接 `<WenjieTopicBanner />`、`<ZeekrTopicBanner />`、`<FlooringTopicBanner />`)。

入口内容:

| 字段 | 文案 |
| --- | --- |
| 标题 | `问界改装专题` |
| 副标题 | `M7 / M8 / M9 电动踏板、内饰便利、防护配件` |
| 统计 | `44 个款式` `3 个车型` |
| 入口按钮 | `查看专题` |
| 跳转 | `/product/wenjie` |

### 5.2 专题页结构

`/product/wenjie` 页面结构:

1. Hero 区:专题名称、车型范围、核心价值、代表视觉图。
2. 车型导航:M7 / M8 / M9 锚点。
3. 卖点区:座舱便利、收纳整理、防护配件、电动踏板。
4. 车型款式区:按 M7、M8、M9 分组展示卡片网格。
5. 产品表格:完整列出 44 个产品行。
6. 图片状态说明:已匹配 / 待复核 / 待补充。
7. 服务流程:车型确认 → 款式选择 → 安装评估 → 施工交付。
8. 合规说明。

## 6. 内容与数据

### 6.1 产品总览

| 车型 | 数量 | 分类覆盖 |
| ---: | ---: | --- |
| 问界 M7 | 6 | 地板尾箱、内饰便利、电动踏板 |
| 问界 M8 | 22 | 内饰便利、地板尾箱、防护配件、外观套件、底盘防护、内饰舒适、内饰保护、电气便利、密封降噪、电动踏板、外观配件 |
| 问界 M9 | 16 | 内饰便利、地板尾箱、防护配件、灯光配件、底盘防护、内饰舒适、内饰保护、电动踏板 |

### 6.2 M7 产品表 (6 款)

| 序号 | 产品名称 | 建议分类 |
| ---: | --- | --- |
| 1 | 地板+尾箱地板 | 地板尾箱 |
| 2 | 小桌板 (简约款) | 内饰便利 |
| 3 | 小桌板 (功能款) | 内饰便利 |
| 4 | 问界 M7 电动踏板 (一体全铝支架) | 电动踏板 |
| 5 | 问界 M7 单流光灯 (一体全铝支架) | 电动踏板 |
| 6 | 问界 M7 双流光灯面板 (一体全铝支架) | 电动踏板 |

### 6.3 M8 产品表 (22 款)

含小桌板 (简约/功能) 2 款、地板 1 款、尾箱地板 1 款、满天星防虫网、原厂风格
防虫网、冰箱防踢带垃圾桶、磁吸支架、AMXT 全套包围、底盘护板、201 款门槛条+
后护板、车牌架、四轮挡泥板、全车坐垫、座椅防踢垫、尾箱垫全套、中排车载充电器、
硅胶套餐 13 件套、四门密封条、电动踏板 3 款 (单/双流光灯)。

### 6.4 M9 产品表 (16 款)

含小桌板、地板+尾箱地板、88 星满天星防虫网、冰箱防踢带垃圾桶、后备箱后窗 LED
表情灯、电动款小桌板、全车铝镁合金下护板、全套坐垫、后轮内衬挡泥板、四门挡
泥板、硅胶套餐 21/17/9 件套、电动踏板 3 款 (单/双流光灯)。

### 6.5 分类说明

12 类:电动踏板、内饰便利、地板尾箱、防护配件、底盘防护、外观套件、内饰舒适、
内饰保护、电气便利、密封降噪、灯光配件、外观配件。

分类用于前端筛选、标签和用户理解,**不等同于**材质、来源或官方认证承诺。

## 7. 卖点提炼

### 7.1 页面主卖点

| 优先级 | 主卖点 | 页面短文案 |
| ---: | --- | --- |
| 1 | 按车型适配 | `按问界车型查看可升级款式,减少选错配件的成本。` |
| 2 | 座舱与尾箱统一升级 | `覆盖电动踏板、地板尾箱、脚垫、坐垫、储物与防踢保护。` |
| 3 | 防护与便利并重 | `门槛、尾门、底盘、挡泥板、防虫网等配件兼顾日常保护与使用便利。` |

### 7.2 文案克制规则

页面不得使用以下未经确认的表达:

- `华为官方`、`问界官方`、`鸿蒙智行官方`、`厂家授权`
- `原厂`、`原厂件`、`原厂授权`、`不影响原厂质保`

如果业务能提供对应证明,再通过 PRD refine 单独补充。

## 8. 图片与资产策略 (本版核心章节)

### 8.0 经验教训:为什么本版要固化图片规格

回顾 §2.1 现状盘点,项目内问界/小米专题的产品图**比例/像素均无约束**:

- 卡片容器内图片大小不一,长宽比混合,布局跳动。
- 同一专题内不同产品图的视觉重量失衡,影响品牌专业感。
- 后续若用 Next/Image 优化 (响应式 `sizes`、自动 srcset),无法稳定生成。
- 命名混乱,部署到 Linux/Vercel 时存在编码风险。

**本版吸取 ZEEKR v1 教训,把图片规格从"软建议"升级为"项目级硬性约束"**:
在物理文件层、数据类型层、构建期校验层、UI 容器层四个层面同时约束。

### 8.1 图片现状盘点

| 项 | 值 |
| --- | --- |
| 已就位文件总数 | **0** (44 条产品行均 `pending`,待业务核对) |
| 产品行总数 | 44 (M7=6 + M8=22 + M9=16) |
| 缺图产品行 | 44 (全部) |
| Hero 预览图 | 1 张 `public/images/products/wenjie/preview.png` (1100×1552,竖图,**与本版规格不一致**,后续迭代整改) |
| 状态分布 | 0 行 `matched` / 0 行 `pending-review` / **44 行 `pending`** (含 0 `missing`,因 manifest 已有位图) |
| 来源目录 (迁移前) | `public/images/products/wenjie/images/` (含 manifest 提取的位图) |
| 目标目录 (迁移后) | `public/images/products/wenjie/{m7,m8,m9}/` |
| 文件命名 | 中文/混合 → ASCII slug |

> **说明**:源 manifest `imageMatchingNote` 明确"Images were extracted from
> reconstructed Excel drawing payloads. Product-level matching still needs
> manual review before binding images to product rows." 因此本版 44 条全部
> `imageStatus="pending"`,业务核对 contact-sheet.jpg 后由架构师逐项标记
> `matched` 并填入 `publicPath`,前端无需改组件即可自动切换为真实图。

### 8.2 物理规格硬性约束 (项目级标准,与 ZEEKR 一致)

| 项 | 规格 | 验证方式 |
| --- | --- | --- |
| 像素 | 1448 × 1086 px (±0) | `sips -g pixelWidth -g pixelHeight` |
| 宽高比 | 4:3 (强制) | width ÷ height = 1.333… |
| 格式 | PNG (透明背景优先) / 退化 JPEG | 文件后缀 |
| 文件大小 | ≤ 3 MB | `ls -l` |
| 命名 | ASCII slug,小写 + 短横线 | regex `^[a-z0-9-]+\.(png\|jpe?g)$` |
| 目录 | `public/images/products/wenjie/{m7,m8,m9}/` | 路径前缀匹配 |
| 文件总数 | 业务核对后,M7=6 + M8=22 + M9=16 = **44** 张 PNG | glob 计数 |

> **本规格直接采用 ZEEKR 21 张已就位图片的实际像素 (1448×1086) 作为统一基准
> (参照 [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) §8.2)。** 这是因为 21 张图已经天然一致,把它固化为项目级标准比
> 重新选定一个标准成本低、风险小。

### 8.3 迁移清单 (44 条,待业务执行)

> 经实地盘点 (2026-06-13 manifest 提取),源 `public/images/products/wenjie/images/`
> 子目录中 M7/M8/M9 各车型位图需逐项人工核对映射。当前迁移执行延后至业务
> contact-sheet.jpg 核对完成。

| 车型 | 产品行数 | 状态 | 备注 |
| --- | ---: | --- | --- |
| M7 | 6 | 全部 `pending` | 待业务核对 |
| M8 | 22 | 全部 `pending` | 待业务核对 |
| M9 | 16 | 全部 `pending` | 待业务核对 |
| **合计** | **44** | **全部 `pending`** | **`missing` 数 = 0** (因 manifest 已有位图,匹配失败时业务决定是 `pending-review` 还是 `missing`) |

#### 8.3.1 M7 (6 个,全部 pending)

| 序号 | 目标文件 (示例) | 产品 | imageStatus |
| ---: | --- | --- | --- |
| 1 | `wenjie/m7/01-floor-trunk.png` | 地板+尾箱地板 | `pending` |
| 2 | `wenjie/m7/02-table-simple.png` | 小桌板 (简约款) | `pending` |
| 3 | `wenjie/m7/03-table-functional.png` | 小桌板 (功能款) | `pending` |
| 4 | `wenjie/m7/04-epedal-1pc.png` | 电动踏板 (一体全铝支架) | `pending` |
| 5 | `wenjie/m7/05-epedal-single-flow.png` | 单流光灯 (一体全铝支架) | `pending` |
| 6 | `wenjie/m7/06-epedal-dual-flow.png` | 双流光灯面板 (一体全铝支架) | `pending` |

#### 8.3.2 M8 (22 个,全部 pending)

迁移清单略 (按 `wenjie/m8/01-...png` ~ `wenjie/m8/22-...png` 顺序,业务核对后逐项切 `matched`)。

#### 8.3.3 M9 (16 个,全部 pending)

迁移清单略 (按 `wenjie/m9/01-...png` ~ `wenjie/m9/16-...png` 顺序,业务核对后逐项切 `matched`)。

#### 8.3.4 迁移执行要求

- 必须使用 `cp` 或脚本,**不得**引用微信缓存绝对路径。
- 复制完成后,**删除**原 `public/images/products/wenjie/images/` 临时目录。
- 业务核对 contact-sheet.jpg 后,逐项将 `imageStatus` 从 `pending` 改为 `matched`,并填入 `image.publicPath`。

### 8.4 前端展示规格 (UI 容器层)

| 位置 | 规格 |
| --- | --- |
| 卡片图片容器 | `<div className="relative aspect-[4/3] bg-zinc-950">` |
| Next/Image `fill` | 必填 |
| Next/Image `sizes` | `(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw` |
| Next/Image `className` | `object-contain p-2` (卡片) / `object-cover` (Hero 预览图) |
| Next/Image `loading` | 卡片用 `lazy`,Hero 用 `priority` |
| 缺图降级容器 | `aspect-[4/3]` 不变,虚线边框 + lucide `ImageIcon` + "图片待补充" |
| 缺图降级 `aria-label` | `问界 M7 {产品名} 产品图待补充` |

> **禁止**使用 `object-cover` 裁剪产品展示图 (避免关键部位被裁);Hero 预览图例外。
> **禁止**省略 `sizes` 属性 (避免 Next.js 发出 1x/2x 全尺寸 srcset,影响 LCP)。

### 8.5 数据层一致性 (类型层)

在 `src/lib/wenjie-products.ts` 的 `WenjieProduct.image` 字段中固化规格:

```ts
export type WenjieImageWidth = 1448;
export type WenjieImageHeight = 1086;
export type WenjieImageAspectRatio = "4/3";

export type WenjieProductImage = {
  publicPath: string | null;       // matched 必填;pending/missing 时 null
  alt: string;
  width: WenjieImageWidth | null;  // matched 必填
  height: WenjieImageHeight | null;
  aspectRatio: WenjieImageAspectRatio | null;
};
```

> **关键**:用字面量类型而非 `number`,从 TS 编译期杜绝"图片规格漂移"。
> 后续如果产品图需要新规格 (例如 1200×900),必须通过 PRD refine 明确规格,
> 而不是悄悄换值。

### 8.6 CI/构建期校验

> **本期不做** `scripts/verify-wenjie-images.mjs`。理由:
>
> - 当前 44 条全部 `pending`,业务尚未完成图片核对,CI 校验无意义。
> - ZEEKR `verify-zeekr-images.mjs` 已建立 4 层校验范本,问界后续接入按同样
>   模板实现 (见 §18 第 2 条)。

### 8.7 效果展示规则

- 如果图片展示已安装或整车效果,可以标注为"效果展示"。
- 如果图片只是单个产品,标注为"产品展示"。
- 不得生成不存在的 before/after 对比。
- 不得把产品图、安装图、渲染图混称为同一种素材。
- 不得借用小米、极氪、地板或其他品牌图片填充问界产品。

## 9. 5 组件清单 (主题专项核心交付)

| 组件 | 路径 | 类型 | 说明 |
| --- | --- | --- | --- |
| `WenjieAnchorNav` | `src/components/wenjie/WenjieAnchorNav.tsx` | CC | 锚点导航 (顶部 sticky) |
| `WenjieProductCard` | `src/components/wenjie/WenjieProductCard.tsx` | CC | 车型卡片 (3 态 UI) |
| `WenjieProductGrid` | `src/components/wenjie/WenjieProductGrid.tsx` | RSC | 车型网格 |
| `WenjieProductTable` | `src/components/wenjie/WenjieProductTable.tsx` | RSC | 车型表 (参数对比) |
| `WenjieTopicBanner` | `src/components/wenjie/WenjieTopicBanner.tsx` | RSC | 主题入口 banner (用在 `/product`) |

### 9.1 锚点导航

- `<WenjieAnchorNav models={[{ id: "m7", label: "问界 M7（6 款）" }, ...]} />`
- 顶部 sticky,支持点击跳转 (`#m7` / `#m8` / `#m9`)。
- 移动端折叠为下拉 (待评估)。

### 9.2 3 态 imageStatus UI

| 状态 | 显示 |
| --- | --- |
| `pending-review` | 占位 + "图片待复核" 标签 (顶部角标) |
| `missing` | 占位 (虚线 + ImageIcon) + "图片待补充" 文字 |

> **当前实际状态**:44 条全部 `pending` (在源码中表现为 `pending`,语义上
> 与 ZEEKR 的 `pending-review` 等同)。本期 `WenjieProductCard` 实现 2 态
> (`matched` / `pending`);后续接入 3 态 (`matched` / `pending-review` /
> `missing`) 与 ZEEKR 拉齐。

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
| `wenjie_topic_view` | 进入专题页 |
| `wenjie_model_section_click` | 点击 M7/M8/M9 车型锚点 |
| `wenjie_product_card_view` | 产品卡片进入视口,可选 |

## 10. SEO 与内容合规

### 10.1 Metadata

| 字段 | 内容 |
| --- | --- |
| title | `问界改装专题 | M7 / M8 / M9 改装配件 | 蓝辉轻改 LANHUI` |
| description | `蓝辉轻改问界改装专题,展示问界 M7、M8、M9 电动踏板、内饰便利、防护配件、地板尾箱等 44 个款式,按车型查看轻改装方案。` |
| keywords | `问界改装, 问界M7, 问界M8, 问界M9, 电动踏板, 内饰便利, 防护配件, 蓝辉轻改` |
| openGraph.title | 同 title |
| openGraph.description | 同 description |
| openGraph.type | `article` |
| openGraph.images | Hero 预览图 |
| JSON-LD | `ItemList`,含 44 个 `ListItem` |

### 10.2 合规措辞

页面必须避免:

- "问界官方"、"华为官方"、"鸿蒙智行官方"、"厂家授权"
- "原厂件"、"原厂授权"、"不影响原厂质保"

推荐在页面底部加入:

```
本页面展示的问界车型改装款式用于蓝辉轻改服务介绍,品牌与车型名称仅用于说明适配对象。
```

## 11. shadcn 使用边界

可以优先复用:

- `Card`:车型专题入口、产品卡片
- `Badge`:车型与分类标签
- `Table`:产品清单
- `Tabs` 或锚点导航:车型切换

UI 决策仍以本 PRD、`CLAUDE.md`、`AGENTS.md` 和蓝辉项目视觉规范为准。

## 12. 数据模型

`src/lib/wenjie-products.ts`:

```ts
export type WenjieVehicleModel = "M7" | "M8" | "M9";

export type WenjieCategory =
  | "电动踏板" | "内饰便利" | "地板尾箱" | "防护配件"
  | "底盘防护" | "外观套件" | "内饰舒适" | "内饰保护"
  | "电气便利" | "密封降噪" | "灯光配件" | "外观配件";

export type WenjieImageStatus = "matched" | "pending-review" | "missing";

export type WenjieImageWidth = 1448;
export type WenjieImageHeight = 1086;
export type WenjieImageAspectRatio = "4/3";

export interface WenjieProductImage {
  publicPath: string | null;
  alt: string;
  width: WenjieImageWidth | null;
  height: WenjieImageHeight | null;
  aspectRatio: WenjieImageAspectRatio | null;
}

export interface WenjieProduct {
  id: string;                          // wenjie-{modelLower}-{order},例 wenjie-m7-01
  vehicleModel: WenjieVehicleModel;
  orderInModel: number;
  sourceRow: number;                   // 源 Excel 物理行号
  productName: string;
  category: WenjieCategory;
  imageStatus: WenjieImageStatus;
  image: WenjieProductImage;
}

export interface WenjieTopicMeta {
  title: string;
  description: string;
  totalProducts: 44;                   // 字面量类型,禁止漂移
  totalModels: 3;
  previewImage: string;
  ogImage: string;
}
```

实现要求:

- `id` 使用稳定 slug,例 `wenjie-m7-01`。
- `sourceRow` 保留 Excel 物理行号,用于业务追踪。
- `totalProducts / totalModels` 用字面量类型,类型层强制数据完整性。
- 页面通过数据 `map` 渲染,不在 JSX 中硬编码 44 个卡片。

## 13. 架构师执行规范

架构师负责定义页面结构、数据模型、组件边界和资产路径。

必须确认:

- 新专题页最终路由 `/product/wenjie`。
- `/product` 专题入口与小米、极氪、地板专题的并列关系。
- 问界产品静态数据文件位置,`src/lib/wenjie-products.ts`。
- 5 组件结构 (AnchorNav / ProductCard / ProductGrid / ProductTable / TopicBanner)。
- 3 态 `imageStatus` UI (matched / pending-review / missing)。
- **图片迁移执行顺序**:业务核对 contact-sheet.jpg 后,迁移脚本 (§8.3) 必须先于组件 `imageStatus` 状态切换,无迁移动作不得开始 `matched` 切换。
- 车型分组、分类字段和排序规则。
- 缺图产品的 UI 降级方案。
- 复用全站统一入口,不新增专题私有动作体系。

**项目级范本声明**:

> 本 PRD §8 沿用 [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) §8 建立的图片规格 (1448×1086 / 4:3 / PNG / ASCII slug / 4 层约束)。后续其他专题 PRD 也应 cite 本规格。

架构师不得把本轮扩大为后台 CMS、报价系统、在线下单、库存或 3D 改装器。

## 14. Coder 执行规范

Coder 根据架构师方案实现页面,必须遵守:

- 读取 Next.js 16 相关文档后再改 App Router 代码。
- 不在页面中引用微信缓存路径或本机绝对路径。
- 不在 JSX 中复制 44 个产品卡片硬编码,必须通过结构化数据 `map` 渲染。
- 不使用 `any`。
- 图片使用项目现有图片策略和 Next/Image 组件。
- 保持 Tailwind v4 与当前产品页风格一致 (暗色主题、cyan-500/400 主色,与小米/极氪区分)。
- 可复用 shadcn 组件,但 shadcn 只是组件库,不替代 PRD。
- 不破坏现有产品中心、门店页、新闻页、小米专题、极氪专题、地板专题。
- 不引入新 UI 库。
- 不把整个页面变成 Client Component,除非车型 tabs 或埋点确实需要小型客户端组件。
- **所有 wenjie 卡片必须使用与 wenjie 相同的 `aspect-[4/3]` 容器与 `object-contain` 策略,禁止 `object-cover`(Hero 预览图除外)。**
- 完成后运行 `npm run lint`、`npm run typecheck`、`npm run build`。

## 15. 测试执行规范

### 15.1 功能测试

| 用例 | 步骤 | 期望 |
| --- | --- | --- |
| 产品中心入口 | 打开 `/product` | 可看到"问界改装专题"入口并进入 `/product/wenjie` |
| 专题页渲染 | 打开 `/product/wenjie` | Hero、车型导航、M7、M8、M9、产品表格均存在 |
| M7 产品数量 | 查看 M7 区块 | 展示 6 个 M7 款式 |
| M8 产品数量 | 查看 M8 区块 | 展示 22 个 M8 款式 |
| M9 产品数量 | 查看 M9 区块 | 展示 16 个 M9 款式 |
| 产品总数 | 查看卡片或表格 | 共 44 个产品行 (M7 6 + M8 22 + M9 16) |
| **缺图产品降级** | 查看任意 M7/M8/M9 卡片 | 虚线 `aspect-[4/3]` 占位 + `ImageIcon` + "图片待补充" |
| **图片状态标记** | 查看任意 M7/M8/M9 卡片 | 全部为 `pending` 状态 (业务核对后切 `matched`) |
| 合规文案 | 搜索页面文案 | 不出现"问界官方""华为官方""原厂件"等 |

### 15.2 响应式测试

至少验证 390 / 768 / 1440 三个视口:

- Hero 文案不溢出。
- 车型导航可操作。
- 卡片图片比例稳定 (4:3 不变形,缺图时虚线容器比例同样稳定)。
- 长产品名不遮挡图片。
- 表格或移动端卡片完整显示。

### 15.3 回归测试

- `/product` 现有产品方向仍可访问。
- `/product/xiaomi`、`/product/zeekr`、`/product/flooring`、`/product/window-film` 不受影响。
- Header / Footer 正常。
- `npm run lint`、`npm run typecheck`、`npm run build` 全部通过。

## 16. 验收标准

本需求完成必须同时满足:

- `/product` 有问界改装专题入口 (现有 `<WenjieTopicBanner />`)。
- `/product/wenjie` 可访问并具有独立 metadata + JSON-LD。
- 页面展示 M7 6 个、M8 22 个、M9 16 个款式,共 44 个。
- 页面包含车型展示、款式网格、产品表格、卖点说明、图片状态。
- **44 条数据 `imageStatus` 字段已就绪** (matched / pending-review / missing 三态)。
- 44 条产品行数据已写入 `src/lib/wenjie-products.ts`。
- 5 组件 (AnchorNav / ProductCard / ProductGrid / ProductTable / TopicBanner) 全部实现。
- 当前 44 条全部 `pending`,UI 必须显式降级 (虚线 + ImageIcon + "图片待补充")。
- 页面不出现微信缓存路径、`.hermes`、`Downloads` 或其他本机绝对路径。
- 页面不暗示问界 / 华为官方授权。
- 移动端、平板端、桌面端布局正常。
- lint、typecheck、build 全部通过。
- 测试提供至少一张桌面截图和一张移动端截图。
- PR 描述或 commit message 引用本 PRD,标记「问界主题专项 v1」。

## 17. 风险与处理

| 风险 | 处理 |
| --- | --- |
| Excel 图片无法直接读取 | manifest 已提取位图,业务核对 contact-sheet.jpg 后逐项绑定 |
| 产品行 44 个但图片签名数待盘点 | 不按顺序自动绑定图片,必须人工复核产品行与图片映射 |
| 图片嵌入在微信缓存路径的 `.xls` 中 | 复制到 `public`,不得引用源路径 |
| 中文文件名影响部署 | 复制到 `public` 时改为 ASCII slug 文件名 |
| 车型名称可能需业务确认 | 架构师在执行前确认 `问界 M7/M8/M9` 是否为官网对外展示名称 |
| 用户误认为官方授权 | 页面增加适配说明,避免"官方/授权/原厂"等措辞 |
| **图片规格失控 (关键风险)** | 本版建立 4 层约束 (§8.2 物理 / §8.4 UI / §8.5 类型 / §8.6 CI) 对冲。任一层失守均会导致布局跳动或规格漂移 |
| **44 条 pending 长期停留 (本期风险)** | 业务核对 contact-sheet.jpg 后,逐项切换 `matched`;§18 第 1 条作为后续迭代入口 |
| **`/product` 入口顺序变化导致回归** | 在 `<XiaomiTopicBanner />` 之后追加 `<WenjieTopicBanner />`,不动既有顺序 |

## 18. 后续迭代入口

本轮验收通过后,可进入下一轮:

1. **问界 44 条 pending 切 matched (业务侧闭环)**:业务核对 contact-sheet.jpg 后,逐项将 `imageStatus` 从 `pending` 切到 `matched` 并填入 `image.publicPath`;数据层字段 (`width/height/aspectRatio`) 已就绪,前端无需改组件。
2. **新建 `scripts/verify-wenjie-images.mjs`** (参照 [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) §8.6):校验 44 张图全部满足规格 (1448×1086 / 4:3 / PNG / ASCII 命名),链入 `npm run check`。
3. **问界 Hero 预览图整改**:`public/images/products/wenjie/preview.png` 当前 1100×1552 (竖图),整改为 1448×1086 / 4:3 规格。
4. **问界 3 态 UI 接入**:当前 `WenjieProductCard` 实现 2 态 (`matched` / `pending`),后续接入 3 态 (`matched` / `pending-review` / `missing`) 与 ZEEKR 拉齐。
5. **建立 `scripts/verify-topic-images.mjs` 通用校验脚本**:接受目录参数,校验逻辑从 `verify-zeekr-images.mjs` 抽出,供各专题复用。
6. **问界单品详情弹窗或详情页**。
7. **问界安装效果 before/after 实拍图库**。
8. **后台维护问界款式数据**。
9. **问界产品项目兴趣数据看板**。

## 19. 变更记录

| 版本 | 日期 | 主要变更 | 作者 |
| --- | --- | --- | --- |
| v0 | 2026-06-13 | 初版 (44 行产品规划 + manifest 提取) | — |
| v1 | 2026-06-20 | 重写。①§1 范本定位 (沿用 ZEEKR v1);②§2 反例盘点 (问界 1100×1552 竖图);③§6 业务数据 44 条 (M7=6/M8=22/M9=16);④§8 整章重写 (8.0~8.7);⑤§8.1 显式拆出 44 条全部 `pending` 状态;⑥§8.2 规格表沿用 ZEEKR §8.2;⑦§8.3 迁移清单 44 行,业务核对 contact-sheet.jpg 后逐项切 `matched`;⑧§8.4 UI 缺图降级容器;⑨§8.5 类型固化 `width/height/aspectRatio` 字段 (matched 必填、其余 null);⑩§9 5 组件清单 (AnchorNav/ProductCard/ProductGrid/ProductTable/TopicBanner);⑪§9.2 3 态 UI (本期实现 2 态,后续接入 3 态);⑫§12 数据模型恢复 `pending-review` 状态 (共三态);⑬§15 测试加缺图降级用例;⑭§16 验收更新数字;⑮§17 风险加 "44 条 pending 长期停留";⑯§18 后续迭代加 "44 条 pending 切 matched" 与 "Hero 预览图整改" | Claude Code |