# 地板改装专题 PRD (v1)

> 面向 Claude Code 架构师、coder、测试使用的执行规范文档。本版本基于 v0
> (2026-06-13, 已归档为 `.archive`) 重写,核心增量是:
>
> 1. 把"图片规格标准化"从 ZEEKR v1 项目级范本中抽取并落地到地板专题。
> 2. **明确 flooring 是"按品牌分组"的特殊模式,与 wenjie/xiaomi/zeekr 按车型
>    分组不同**,组件结构对应调整 (`FlooringFeatureGrid` / `FlooringStructureGrid`
>    / `FlooringVehicleGroup` / `FlooringGallery`),无 `AnchorNav` / 单款
>    `ProductCard` / `ProductTable` / `ProductGrid`。
> 3. **P1-1 性能优化**:当前 flooring 是公开站性能最差页 (perf 59/61,
>    LCP 6.6s),本 PRD §6 强制含优化方案。

## 1. 文档信息

| 项目 | 内容 |
| --- | --- |
| 产品 | 蓝辉轻改 LANHUI 官网 |
| 需求名称 | 地板改装专题页 |
| 版本 | v1 |
| 日期 | 2026-06-20 |
| 上一版本 | v0 (2026-06-13, 已归档为 `FLOORING_MODIFICATION_CATEGORY_PRD_2026-06-13.md.archive`) |
| 页面范围 | `/product/flooring` (品牌分组专题) + `/product` (TopicBanner 入口) |
| 推荐专题路由 | `/product/flooring` |
| 品牌范围 | 理想、问界、极氪、小鹏 (4 个 active+ready) |
| 颜色范围 | 雪霜白 / 中性灰 / 岩石黑 / 木纹咖 (4 种) |
| 功能组件范围 | 地板主板 / 滑轨区域 / 中门迎宾踏板 / 休息脚踏 / 尾箱地板 (5 项) |
| 已就位图片 | 16 张 (4 品牌 × 4 颜色) |
| **缺图 / 隐藏品牌** | **腾势 (reference-only) + 奔驰 (missing-assets) 不进入页面渲染** |
| 主题色 | `amber` (项目内唯一 amber,与其他 orange/cyan 区分) |
| **本版定位** | **沿用 ZEEKR v1 项目级图片规格范本**:1448×1086 / 4:3 / PNG / ASCII 命名 / 4 层约束。当前 16 张图尺寸混乱 (798×528 / 1075×1052),业务需统一处理后 TS 类型升级为字面量 |
| **P1-1 性能基线** | **当前性能最差专题** (Lighthouse perf 59/61, LCP 6.6s),本 PRD §6.5 强制含优化方案 |
| 核心目标 | 把地板改装从"分类专题"重构为"按品牌车型分组的多色展示专题",同时把性能从 P1-1 提升到 P1 级 (LCP < 3s) |

## 2. 背景

地板改装 (含地板主板、滑轨区域、中门迎宾踏板、休息脚踏、尾箱地板) 是蓝辉
轻改的差异化业务,覆盖 MPV / 新能源家庭车的"地板总成"升级。当前页面以"分类
专题"形式存在,但用户购买决策更关注"我的车型适合哪款",因此本期重构为
"按品牌车型分组 + 多色效果"展示。

### 2.1 项目内图片规格现状 (本版新增背景)

本版调研发现,地板专题的产品图**像素和宽高比均未做统一约束**:

| 专题 | 抽样文件 | 实际像素 | 比例 | 状态 |
| --- | ---: | ---: | ---: | --- |
| 问界 | `wenjie/preview.png` | 1100 × 1552 | 11:15.5 (竖图) | 与产品图比例割裂 |
| 小米 | `xiaomi/su7/su7-01-front-bumper.png` | 2523 × 1661 | 1.52:1 | 比例失控 |
| **地板 (理想)** | `flooring/图片/理想/1.png` ~ `4.png` | **798 × 528** | 1.51:1 | 比例失控 |
| **地板 (问界)** | `flooring/图片/问界/1.png` ~ `4.png` | **1075 × 1052** | 1.02:1 (近正方形) | 比例失控 |
| **地板 (极氪 / 小鹏)** | `flooring/图片/{极氪,小鹏}/1.png` ~ `4.png` | 798 × 528 | 1.51:1 | 比例失控 |
| 极氪 | `zeekr/{9x,8x,009}/*.png` 共 21 张 | **1448 × 1086** | **4:3** | **✅ 完全统一** |

**结论**:地板 16 张图存在两种混乱 (798×528 与 1075×1052),本 PRD 把极氪
21 张已统一规格的图片作为项目级范本,地板专题必须按 1448×1086 / 4:3 落地。

### 2.2 业务模式差异 (flooring vs 其他主题专项)

| 维度 | wenjie / xiaomi / zeekr | flooring |
| --- | --- | --- |
| 分组维度 | 按车型分组 (M7/M8/M9、SU7/YU7、9X/8X/009) | **按品牌分组** (理想/问界/极氪/小鹏) |
| 颜色变体 | 无 | **4 色** (雪霜白/中性灰/岩石黑/木纹咖) |
| 组件数 | 5 (AnchorNav / ProductCard / ProductGrid / ProductTable / TopicBanner) | **4** (FlooringFeatureGrid / FlooringStructureGrid / FlooringVehicleGroup / FlooringGallery) — **无 AnchorNav/单款 ProductCard/ProductTable/ProductGrid** |
| 数据维度 | 款式列表 | **品牌 × 颜色** 二维矩阵 (4×4=16 张图) |
| `imageStatus` 三态 | 必填 (matched / pending-review / missing) | **本期不强制** (品牌 × 颜色由业务保证,缺图时业务下架该变体) |

> **重要**:flooring 属于"按品牌分组的特殊主题专项",组件结构与 wenjie/xiaomi/zeekr
> **不互通**。本期 16 张图全部 `matched` (业务保证),但 TS 类型层 `width/height`
> 使用 `number` 以兼容不同规格;业务整改后切字面量类型。

### 2.3 源文件

本 PRD 基于以下源文件编写:

- `public/images/products/flooring/manifest.json` (v1, 2026-06-13)
- `src/lib/flooring-products.ts` — 4 品牌 × 4 颜色 = 16 张图
- `src/components/product/Flooring*.tsx` — 4 组件

读取结果:

| 项目 | 结果 |
| --- | --- |
| 品牌 | 理想 / 问界 / 极氪 / 小鹏 (4 个 active+ready) |
| 隐藏 | 腾势 (reference-only) + 奔驰 (missing-assets) |
| 颜色变体 | 每品牌 4 色 = 16 张图 |
| 状态分布 | 16 行 `active+ready` (全部渲染) |

## 3. 用户与业务目标

### 3.1 用户角色

| 用户 | 需求 |
| --- | --- |
| MPV 车主 | 想按车型看到地板总成效果,关注家庭出行场景 |
| 新能源车主 | 关注座舱质感和颜色与内饰的协调 |
| 商务接待用户 | 关注地板整体感、尾箱联动、踏板便利 |
| 门店销售/运营 | 统一页面向客户展示地板改装方案 |
| 品牌负责人 | 通过"按品牌车型分组"专题,强化蓝辉轻改在地板改装的专业感 |

### 3.2 业务结果

1. 用户在 `/product` 看到"地板改装专题"入口。
2. 用户进入 `/product/flooring`。
3. 用户按品牌车型 (理想/问界/极氪/小鹏) 查看地板总成方案。
4. 用户通过颜色轮播查看 4 色效果。
5. 如需沟通，由首页或全站 Header/Footer 入口承接，产品页不单独定义。

## 4. 范围定义

### 4.1 本轮必须完成

- 在 `/product` 产品中心增加"地板改装专题"入口 (现有 `<FlooringTopicBanner />`)。
- `/product/flooring` 专题页 (已实现,本期固化 PRD 规格)。
- 展示 4 品牌 (理想/问界/极氪/小鹏) 地板总成方案。
- 16 张色图按品牌 × 颜色矩阵展示。
- 7 个卖点 + 5 个结构组成。
- 颜色轮播组件 (每品牌 4 色)。
- 底部图库 + 服务流程。
- SEO metadata、OpenGraph、JSON-LD `CollectionPage`。
- 不暗示"理想官方""问界官方""极氪官方""小鹏官方"等未经确认的主张。
- **P1-1 性能优化**:LCP 从 6.6s 降到 < 3s (desktop)、< 4s (mobile)。具体方案见 §6.5。

### 4.2 本轮不做

- 不做电商下单。
- 不做在线报价计算器。
- 不做库存状态。
- 不做后台管理录入。
- **不做腾势 / 奔驰渲染** (manifest 标记 reference-only / missing-assets)。
- **不做 anchor nav** (无 AnchorNav 组件)。
- **不做单品 ProductCard** (无 ProductCard 组件,色图轮播已替代)。
- 不做 5 组件模式 (flooring 特殊模式,4 组件即可)。

## 5. 信息架构

### 5.1 产品中心入口

在 `/product` 页面已有 `<FlooringTopicBanner />` (放在最后,与 wenjie/zeekr/xiaomi 并列)。

入口内容:

| 字段 | 文案 |
| --- | --- |
| 标题 | `地板改装专题` |
| 副标题 | `理想 / 问界 / 极氪 / 小鹏 地板总成升级` |
| 统计 | `4 个品牌` `4 种颜色` |
| 入口按钮 | `查看专题` |
| 跳转 | `/product/flooring` |

### 5.2 专题页结构

`/product/flooring` 页面结构:

1. Hero 区:专题名称、车型范围、3 主卖点 (首屏)、代表视觉图 (理想木纹咖)。
2. 7 个卖点区 (含 3 主卖点 + 4 辅助) — `FlooringFeatureGrid`。
3. 5 个结构组成 — `FlooringStructureGrid`。
4. **品牌/车型分组区** (4 品牌):每品牌代表图 + 颜色轮播 + 核心卖点 + 适配提示。
5. 图库区 — `FlooringGallery` (16 张色图聚合)。
6. 服务流程:车型确认 → 款式选择 → 安装评估 → 施工交付。
7. JSON-LD `CollectionPage` + `ItemList`。

## 6. 内容与数据

### 6.1 品牌清单 (4 个 active+ready)

| 品牌 ID | 中文名 | 适配车型 | 隐藏原因 |
| --- | --- | --- | --- |
| `li-auto` | 理想 | 理想 L 系列、理想 MEGA | — |
| `aito` | 问界 | 问界 M7、问界 M8、问界 M9 | — |
| `zeekr` | 极氪 | 极氪 009、极氪 7X | — |
| `xpeng` | 小鹏 | 小鹏 X9、小鹏 G9 | — |

### 6.2 颜色清单 (4 种)

| 颜色 ID | 中文名 | 描述 |
| --- | --- | --- |
| `snow-white` | 雪霜白 | 适合浅色内饰,视觉更明亮干净 |
| `neutral-gray` | 中性灰 | 适合灰色或冷色内饰,整体更克制耐看 |
| `rock-black` | 岩石黑 | 适合深色内饰,视觉更稳重 |
| `wood-brown` | 木纹咖 | 适合棕色、暖色或木纹风格内饰 |

### 6.3 结构组成 (5 项)

| ID | 中文名 | 描述 |
| --- | --- | --- |
| `main-floor-board` | 地板主板 | 后排地板主体视觉件,是颜色和整体质感的核心展示区域 |
| `rail-trim` | 滑轨区域 | 围绕座椅滑轨区域做视觉整合,具体兼容性需按车型和座椅布局确认 |
| `door-sill-step` | 中门迎宾踏板 | 承接上下车区域,强化进出后排的便利性和整体观感 |
| `foot-rest` | 休息脚踏 | 服务后排脚部停放和舒适体验,是否带灯光以具体款式为准 |
| `trunk-floor` | 尾箱地板 | 让后排和尾箱区域形成统一效果,并提升尾箱区域的日常维护便利性 |

### 6.4 卖点清单 (7 条,3 主 + 4 辅)

| ID | 标题 | 是否首屏主卖点 |
| --- | --- | :---: |
| `model-fitment` | 按热门车型适配 | ✅ |
| `color-match` | 多色效果对比 | ✅ |
| `floor-rail-integration` | 地板与滑轨整合 | ✅ |
| `door-step-comfort` | 上下车与脚部体验 |  |
| `trunk-continuity` | 尾箱区域联动 |  |
| `easy-care` | 日常清洁维护 |  |
| `premium-cabin` | 座舱质感提升 |  |

### 6.5 P1-1 性能优化方案 (硬性要求)

> **当前性能基线** (Lighthouse 2026-06-19):
>
> | 维度 | desktop | mobile |
> | --- | ---: | ---: |
> | 性能分 | **59** | **61** |
> | LCP | **6.6s** | **8.0s** |

**优化目标**:

| 维度 | desktop | mobile | 当前 → 目标 |
| --- | ---: | ---: | --- |
| 性能分 | ≥ 90 | ≥ 85 | 59/61 → 90/85 |
| LCP | < 2.5s | < 4s | 6.6s/8.0s → 2.5s/4s |
| CLS | < 0.1 | < 0.1 | 0 → 0 (维持) |
| TBT | < 200ms | < 200ms | 维持 |

**优化手段 (按优先级)**:

1. **图片懒加载 + 响应式 srcset** (优先级 P0):
   - 16 张色图 + 1 张 Hero 预览图 = 17 张图,目前全部 `loading="eager"`,需改为除 Hero 外全部 `loading="lazy"`。
   - Hero 预览图改为 `priority` + `sizes` 响应式。
   - 16 张色图改为 `(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw`。

2. **图片格式优化** (优先级 P0):
   - 16 张色图统一转为 WebP (avg 减少 30% 文件大小)。
   - 业务整改后,Hero 预览图改用 AVIF (进一步减少 50%)。

3. **资源预加载** (优先级 P1):
   - Hero 预览图 (理想木纹咖) 加入 `<link rel="preload">`。
   - 字体 Geist Sans 预加载。

4. **减少阻塞渲染** (优先级 P1):
   - Footer 改为 `loading="lazy"` 渲染。
   - FlooringGallery 改为 IntersectionObserver 触发 (用户滚动到图库区时才渲染)。

5. **打包优化** (优先级 P2):
   - 检查 `lucide-react` tree-shaking 是否生效 (FlooringVehicleGroup 引用多个 lucide 图标)。

6. **CDN 缓存策略** (优先级 P2):
   - `public/images/products/flooring/` 加 `Cache-Control: public, max-age=31536000, immutable`。

**验收**:

- [ ] Lighthouse desktop perf ≥ 90
- [ ] Lighthouse mobile perf ≥ 85
- [ ] LCP desktop < 2.5s
- [ ] LCP mobile < 4s
- [ ] CLS = 0
- [ ] `npm run build` 通过
- [ ] Playwright e2e 性能断言通过

## 7. 卖点提炼

### 7.1 页面主卖点 (首屏 3 条)

| 优先级 | 主卖点 | 页面短文案 |
| ---: | --- | --- |
| 1 | 按热门车型适配 | `以理想、问界、极氪、小鹏等热门车型为页面模板,不使用单一通用图覆盖所有车型。` |
| 2 | 多色效果对比 | `同一车型下用颜色轮播展示雪霜白、中性灰、岩石黑、木纹咖等效果,方便判断与内饰是否协调。` |
| 3 | 地板与滑轨整合 | `围绕后排地板和座椅滑轨区域做整体展示,突出空间整洁和视觉统一。` |

### 7.2 文案克制规则

页面不得使用以下未经确认的表达:

- `理想官方`、`问界官方`、`极氪官方`、`小鹏官方`、`厂家授权`
- `原厂`、`原厂件`、`原厂授权`、`不影响原厂质保`
- `全网最低`、`永久质保`、`无损安装`

## 8. 图片与资产策略 (本版核心章节)

### 8.0 经验教训:为什么本版要固化图片规格

回顾 §2.1 现状盘点,地板专题的产品图**比例/像素均无约束**:

- 4 品牌 16 张图存在两种混乱 (798×528 与 1075×1052)。
- 同一品牌不同颜色图的视觉重量失衡。
- 后续若用 Next/Image 优化 (响应式 `sizes`、自动 srcset),无法稳定生成。
- 命名混乱 (`图片/理想/1.png` 中文子目录 + 数字文件名),部署到 Linux/Vercel 时存在编码风险。

**本版吸取 ZEEKR v1 教训,把图片规格从"软建议"升级为"项目级硬性约束"**:
在物理文件层、数据类型层、构建期校验层、UI 容器层四个层面同时约束。

### 8.1 图片现状盘点

| 项 | 值 |
| --- | --- |
| 已就位文件总数 | 16 (4 品牌 × 4 颜色) |
| 产品行总数 | 16 |
| 缺图产品行 | 0 (全部 `active+ready`) |
| **已就位文件像素混乱** | **798×528 (理想/极氪/小鹏) + 1075×1052 (问界)**,需业务统一处理到 1448×1086 / 4:3 |
| Hero 预览图 | `/images/products/flooring/图片/理想/1.png` (798×528,需整改) |
| 来源目录 (迁移前) | `public/images/products/flooring/图片/{理想,问界,极氪,小鹏}/` (中文子目录) |
| 目标目录 (迁移后) | `public/images/products/flooring/{li-auto,aito,zeekr,xpeng}/` (ASCII slug) |
| 文件命名 | 中文数字 (`1.png` ~ `4.png`) → ASCII slug (`01-wood-brown.png` 等) |
| 状态分布 | 16 行 `matched` (按 manifest `active+ready`) |

### 8.2 物理规格硬性约束 (项目级标准,与 ZEEKR 一致)

| 项 | 规格 | 验证方式 |
| --- | --- | --- |
| 像素 | 1448 × 1086 px (±0) | `sips -g pixelWidth -g pixelHeight` |
| 宽高比 | 4:3 (强制) | width ÷ height = 1.333… |
| 格式 | PNG (透明背景优先) / 退化 JPEG | 文件后缀 |
| 文件大小 | ≤ 3 MB | `ls -l` |
| 命名 | ASCII slug,小写 + 短横线 | regex `^[a-z0-9-]+\.(png\|jpe?g)$` |
| 目录 | `public/images/products/flooring/{li-auto,aito,zeekr,xpeng}/` (ASCII) | 路径前缀匹配 |
| 文件总数 | 16 = 4 品牌 × 4 颜色 | glob 计数 |

> **本规格直接采用 ZEEKR 21 张已就位图片的实际像素 (1448×1086) 作为统一基准
> (参照 [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) §8.2)。**

### 8.3 整改与迁移清单 (16 张,业务后续执行)

#### 8.3.1 理想 (4 张)

| 颜色 | 当前文件 | 当前像素 | 目标文件 (示例) | imageStatus |
| --- | --- | ---: | --- | --- |
| 木纹咖 | `图片/理想/1.png` | 798×528 | `flooring/li-auto/01-wood-brown.png` | `matched` |
| 中性灰 | `图片/理想/2.png` | 798×528 | `flooring/li-auto/02-neutral-gray.png` | `matched` |
| 雪霜白 | `图片/理想/3.png` | 798×528 | `flooring/li-auto/03-snow-white.png` | `matched` |
| 岩石黑 | `图片/理想/4.png` | 798×528 | `flooring/li-auto/04-rock-black.png` | `matched` |

#### 8.3.2 问界 (4 张)

| 颜色 | 当前文件 | 当前像素 | 目标文件 (示例) | imageStatus |
| --- | --- | ---: | --- | --- |
| 木纹咖 | `图片/问界/1.png` | 1075×1052 | `flooring/aito/01-wood-brown.png` | `matched` |
| 雪霜白 | `图片/问界/2.png` | 1075×1052 | `flooring/aito/02-snow-white.png` | `matched` |
| 岩石黑 | `图片/问界/3.png` | 1075×1052 | `flooring/aito/03-rock-black.png` | `matched` |
| 中性灰 | `图片/问界/4.png` | 1075×1052 | `flooring/aito/04-neutral-gray.png` | `matched` |

#### 8.3.3 极氪 (4 张)

| 颜色 | 当前文件 | 当前像素 | 目标文件 (示例) | imageStatus |
| --- | --- | ---: | --- | --- |
| 雪霜白 | `图片/极氪/1.png` | 798×528 | `flooring/zeekr/01-snow-white.png` | `matched` |
| 岩石黑 | `图片/极氪/2.png` | 798×528 | `flooring/zeekr/02-rock-black.png` | `matched` |
| 木纹咖 | `图片/极氪/3.png` | 798×528 | `flooring/zeekr/03-wood-brown.png` | `matched` |
| 中性灰 | `图片/极氪/4.png` | 798×528 | `flooring/zeekr/04-neutral-gray.png` | `matched` |

#### 8.3.4 小鹏 (4 张)

| 颜色 | 当前文件 | 当前像素 | 目标文件 (示例) | imageStatus |
| --- | --- | ---: | --- | --- |
| 岩石黑 | `图片/小鹏/1.png` | 798×528 | `flooring/xpeng/01-rock-black.png` | `matched` |
| 雪霜白 | `图片/小鹏/2.png` | 798×528 | `flooring/xpeng/02-snow-white.png` | `matched` |
| 中性灰 | `图片/小鹏/3.png` | 798×528 | `flooring/xpeng/03-neutral-gray.png` | `matched` |
| 木纹咖 | `图片/小鹏/4.png` | 798×528 | `flooring/xpeng/04-wood-brown.png` | `matched` |

#### 8.3.5 整改与迁移执行要求

- 业务使用 `sips` / `sharp` / ImageMagick 等工具统一处理到 1448×1086 / 4:3。
- 处理后**迁移到新目录** (`flooring/{li-auto,aito,zeekr,xpeng}/`) 并改 ASCII slug。
- 删除原 `public/images/products/flooring/图片/` 中文子目录。
- 整改完成后,逐项更新 `src/lib/flooring-products.ts` 中 `assetPath` 与
  `width/height/aspectRatio` 字段。

### 8.4 前端展示规格 (UI 容器层)

| 位置 | 规格 |
| --- | --- |
| 色图卡片容器 | `<div className="relative aspect-[4/3] bg-zinc-950">` |
| Next/Image `fill` | 必填 |
| Next/Image `sizes` | `(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw` |
| Next/Image `className` | `object-cover` (色图轮播,例外) / `object-contain p-2` (Hero) |
| Next/Image `loading` | 卡片用 `lazy`,Hero 用 `priority` |

> **特别说明**:色图轮播用 `object-cover` 是为了视觉占满,业务整改后此例外保留。

### 8.5 数据层一致性 (类型层)

在 `src/lib/flooring-products.ts` 的 `FlooringColorVariant.assetPath` 字段中
固化规格:

```ts
// 过渡期 (当前):允许 number
export type FlooringColorVariant = {
  id: string;
  colorId: FlooringColorId;
  colorName: string;
  description: string;
  assetPath: string;
  width: number;             // 过渡期允许任意 number
  height: number;
  alt: string;
};

// 目标 (业务整改后):升级为字面量类型
export type FlooringImageWidth = 1448;
export type FlooringImageHeight = 1086;
export type FlooringImageAspectRatio = "4/3";
// assetPath: string;
// width: FlooringImageWidth;
// height: FlooringImageHeight;
// aspectRatio: FlooringImageAspectRatio;
```

### 8.6 CI/构建期校验

> **本期不做** `scripts/verify-flooring-images.mjs`。理由:
>
> - 当前 16 张图尺寸混乱 (798×528 / 1075×1052),CI 校验会立即失败,
>   需要业务整改完成后才能接入。
> - ZEEKR `verify-zeekr-images.mjs` 已建立 4 层校验范本,flooring 后续接入按同样
>   模板实现 (见 §18 第 2 条)。

### 8.7 效果展示规则

- 色图展示实际安装效果,可以标注为"效果展示"。
- 不得生成不存在的 before/after 对比。
- 不得把产品图、安装图、渲染图混称为同一种素材。
- 不得借用 wenjie、xiaomi、zeekr 或其他专题图片填充 flooring 品牌。

## 9. 4 组件清单 (flooring 特殊模式)

> **重要**:flooring **不**采用 wenjie/xiaomi/zeekr 的 5 组件模式,而是按品牌分
> 组的 4 组件结构。**无 AnchorNav / 单款 ProductCard / ProductTable / ProductGrid**。

| 组件 | 路径 | 类型 | 说明 |
| --- | --- | --- | --- |
| `FlooringFeatureGrid` | `src/components/product/FlooringFeatureGrid.tsx` | RSC | 7 个卖点网格 (3 主 + 4 辅) |
| `FlooringStructureGrid` | `src/components/product/FlooringStructureGrid.tsx` | RSC | 5 个结构组成网格 |
| `FlooringVehicleGroup` | `src/components/product/FlooringVehicleGroup.tsx` | RSC | 单品牌车型模块 (代表图 + 颜色轮播 + 卖点 + 适配提示) |
| `FlooringGallery` | `src/components/product/FlooringGallery.tsx` | RSC | 16 张色图聚合图库 |
| `FlooringTopicBanner` | `src/components/product/FlooringTopicBanner.tsx` | RSC | 主题入口 banner (用在 `/product`) |

> TopicBanner 是 5 组件模式共有,flooring 借用以保持 `/product` 入口一致。

### 9.1 锚点导航

> **本期不做**锚点导航。flooring 按品牌分组,每个品牌模块独立展开,无需锚点跳转。
> 用户从 Hero 滚动到品牌分组区即可,移动端汉堡菜单不展开 AnchorNav。

### 9.2 3 态 imageStatus UI

| 状态 | 显示 |
| --- | --- |
| `matched` | 正常色图 + 颜色名 + 描述 |
| `pending-review` | (本期未触发,预留扩展位) |
| `missing` | (本期未触发,业务下架该变体) |

> **当前实际状态**:16 条全部 `matched`,UI 直接显示色图。后续接入 3 态
> 与 ZEEKR 拉齐 (见 §18 第 3 条)。

### 9.3 三视口响应式

| 视口 | 行为 |
| --- | --- |
| Desktop 1440 | 卖点 3 列,结构 5 列,色图轮播 4 张并列,图库 4 列 |
| Tablet 768 | 卖点 2 列,结构 3 列,色图轮播 2 张,图库 3 列 |
| Mobile 390 | 卖点 1 列,结构 2 列,色图轮播 1 张 + 横向滚动,图库 2 列 |

### 9.4 页面私有动作边界


推荐 analytics 事件:

| 事件 | 触发 |
| --- | --- |
| `flooring_topic_view` | 进入专题页 |
| `flooring_brand_section_view` | 品牌模块进入视口 |
| `flooring_color_variant_click` | 点击颜色轮播切换 |

## 10. SEO 与内容合规

### 10.1 Metadata

| 字段 | 内容 |
| --- | --- |
| title | `地板改装专题 | 蓝辉轻改 LANHUI` |
| description | `蓝辉轻改地板改装分类专题,覆盖 MPV / 新能源家庭车的地板总成、尾箱地板、迎宾踏板、休息脚踏等组件,按理想、问界、极氪、小鹏等热门车型分组展示多色效果。` |
| keywords | `地板改装, 地板总成, 尾箱地板, 迎宾踏板, MPV, 新能源车型, 蓝辉轻改, 理想, 问界, 极氪, 小鹏` |
| openGraph.title | 同 title |
| openGraph.description | 同 description |
| openGraph.type | `article` |
| openGraph.images | Hero 预览图 (理想木纹咖) |
| JSON-LD | `CollectionPage` + `ItemList`,含 4 个品牌 `ListItem` |

### 10.2 合规措辞

页面必须避免:

- "理想官方"、"问界官方"、"极氪官方"、"小鹏官方"、"厂家授权"
- "原厂件"、"原厂授权"、"不影响原厂质保"

推荐在服务流程底部加入:

```
服务流程为通用描述;具体到店流程以门店沟通为准。当前展示的 {N} 个组件均为
画册可见的中性描述,不构成材质或官方授权承诺。
```

## 11. shadcn 使用边界

可以优先复用:

- `Card`:品牌车型模块
- `Badge`:颜色标签
- `Carousel`:颜色轮播 (shadcn 已有)
- `Tabs` 或 Tabs-like 组件:品牌切换 (可选)

UI 决策仍以本 PRD、`CLAUDE.md`、`AGENTS.md` 和蓝辉项目视觉规范为准。

## 12. 数据模型

`src/lib/flooring-products.ts`:

```ts
export type FlooringHotBrand =
  | "li-auto" | "aito" | "zeekr" | "xpeng";        // 4 个 active+ready
// "denza" 与 "mercedes-benz" 不进入页面 (reference-only / missing-assets)

export type FlooringColorId =
  | "snow-white" | "neutral-gray" | "rock-black" | "wood-brown";

export type FlooringSellingPointId =
  | "model-fitment" | "color-match" | "floor-rail-integration"
  | "door-step-comfort" | "trunk-continuity" | "easy-care" | "premium-cabin";

export type FlooringFunctionId =
  | "main-floor-board" | "rail-trim" | "door-sill-step"
  | "foot-rest" | "trunk-floor";

// 过渡期 (当前):允许 number
export type FlooringColorVariant = {
  id: string;
  colorId: FlooringColorId;
  colorName: string;
  description: string;
  assetPath: string;
  width: number;             // 过渡期允许任意 number
  height: number;
  alt: string;
};

export type FlooringVehicleGroup = {
  id: string;
  brand: FlooringHotBrand;
  brandName: string;
  models: string[];
  headline: string;
  summary: string;
  productIntro: string;
  fitmentNote: string;
  sellingPointIds: FlooringSellingPointId[];
  functionIds: FlooringFunctionId[];
  colorVariants: FlooringColorVariant[];
};

// 目标 (业务整改后):升级为字面量类型
export type FlooringImageWidth = 1448;
export type FlooringImageHeight = 1086;
export type FlooringImageAspectRatio = "4/3";
```

实现要求:

- 过渡期 `width/height` 用 `number`;业务整改后切字面量类型。
- 渲染规则:**只渲染 active+ready 品牌** (腾势、奔驰不进页面)。
- 页面通过数据 `map` 渲染,不在 JSX 中硬编码 4 个品牌。

## 13. 架构师执行规范

架构师负责定义页面结构、数据模型、组件边界和资产路径。

必须确认:

- 新专题页最终路由 `/product/flooring`。
- `/product` 专题入口与 wenjie、xiaomi、zeekr 专题的并列关系。
- 地板产品静态数据文件位置,`src/lib/flooring-products.ts`。
- **4 组件结构** (FlooringFeatureGrid / FlooringStructureGrid / FlooringVehicleGroup / FlooringGallery),**不**采用 5 组件模式。
- **P1-1 性能优化**:从 perf 59/61 → 90/85,LCP 6.6s → < 3s。具体方案见 §6.5。
- **图片整改执行顺序**:业务统一处理 16 张图到 1448×1086 / 4:3 后,逐项更新数据层字段为字面量类型值。
- 品牌分组、颜色变体、卖点字段、适配提示规则。
- 复用全站统一入口,不新增专题私有动作体系。

**项目级范本声明**:

> 本 PRD §8 沿用 [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) §8 建立的图片规格 (1448×1086 / 4:3 / PNG / ASCII slug / 4 层约束)。后续其他专题 PRD 也应 cite 本规格。

架构师不得把本轮扩大为后台 CMS、报价系统、在线下单、库存或 3D 改装器。

## 14. Coder 执行规范

Coder 根据架构师方案实现页面,必须遵守:

- 读取 Next.js 16 相关文档后再改 App Router 代码。
- 不在页面中引用微信缓存路径或本机绝对路径。
- 不在 JSX 中复制 4 个品牌模块硬编码,必须通过结构化数据 `map` 渲染。
- 不使用 `any`。
- 图片使用项目现有图片策略和 Next/Image 组件。
- 保持 Tailwind v4 与当前产品页风格一致 (暗色主题、amber-500/400 主色,与 wenjie/xiaomi/zeekr 区分,**项目内唯一 amber 主题**)。
- 可复用 shadcn 组件,但 shadcn 只是组件库,不替代 PRD。
- 不破坏现有产品中心、门店页、新闻页、其他专题。
- 不引入新 UI 库。
- **优先实施 §6.5 P1-1 性能优化方案**,LCP 6.6s → < 3s。
- 完成后运行 `npm run lint`、`npm run typecheck`、`npm run build`。

## 15. 测试执行规范

### 15.1 功能测试

| 用例 | 步骤 | 期望 |
| --- | --- | --- |
| 产品中心入口 | 打开 `/product` | 可看到"地板改装专题"入口并进入 `/product/flooring` |
| 专题页渲染 | 打开 `/product/flooring` | Hero + 7 卖点 + 5 结构 + 4 品牌 + 16 色图 + 服务流程 |
| 4 品牌展示 | 查看品牌分组区 | 理想、问界、极氪、小鹏 4 个模块,每模块代表图 + 颜色轮播 |
| 颜色轮播 | 点击任意品牌轮播 | 切换到对应色图,alt 文本正确 |
| 16 色图渲染 | 查看图库 | 共 16 张色图 (4 品牌 × 4 色) |
| **腾势/奔驰隐藏** | 检查页面 | 不出现腾势、奔驰模块 (manifest 标记 reference-only / missing-assets) |
| 合规文案 | 搜索页面文案 | 不出现"理想官方""问界官方""原厂件"等 |

### 15.2 响应式测试

至少验证 390 / 768 / 1440 三个视口:

- Hero 文案不溢出。
- 卖点网格 3 → 2 → 1 列变化正常。
- 色图轮播 4 → 2 → 1 张变化正常 (移动端横向滚动)。
- 图库 4 → 3 → 2 列变化正常。

### 15.3 性能测试 (P1-1 硬性要求)

| 用例 | 步骤 | 期望 |
| --- | --- | --- |
| Lighthouse desktop | Chrome DevTools Lighthouse | perf ≥ 90,LCP < 2.5s,CLS < 0.1 |
| Lighthouse mobile | Chrome DevTools Lighthouse (mobile preset) | perf ≥ 85,LCP < 4s,CLS < 0.1 |
| Playwright e2e | `npx playwright test e2e/flooring-performance.spec.ts` | LCP < 3s,CLS = 0 |
| WebPageTest | `https://www.webpagetest.org` (可选) | LCP < 2.5s (desktop) / < 4s (mobile) |

### 15.4 回归测试

- `/product` 现有产品方向仍可访问。
- `/product/wenjie`、`/product/xiaomi`、`/product/zeekr`、`/product/window-film` 不受影响。
- Header / Footer 正常。
- `npm run lint`、`npm run typecheck`、`npm run build` 全部通过。

## 16. 验收标准

本需求完成必须同时满足:

- `/product` 有地板改装专题入口 (现有 `<FlooringTopicBanner />`)。
- `/product/flooring` 可访问并具有独立 metadata + JSON-LD。
- 页面展示 4 品牌 (理想/问界/极氪/小鹏) × 4 颜色 = 16 张色图。
- 腾势、奔驰不进入页面 (manifest 标记隐藏)。
- 7 卖点 + 5 结构 + 4 品牌模块 + 16 色图 + 服务流程 全部展示。
- **P1-1 性能优化**:Lighthouse desktop perf ≥ 90,LCP < 2.5s;mobile perf ≥ 85,LCP < 4s。
- 页面不出现微信缓存路径、`.hermes`、`Downloads` 或其他本机绝对路径。
- 页面不暗示理想 / 问界 / 极氪 / 小鹏官方授权。
- 移动端、平板端、桌面端布局正常。
- lint、typecheck、build 全部通过。
- 测试提供至少一张桌面截图和一张移动端截图。
- PR 描述或 commit message 引用本 PRD,标记「地板改装专题 v1」+「P1-1 性能优化」。

## 17. 风险与处理

| 风险 | 处理 |
| --- | --- |
| **P1-1 性能未达标** (LCP 6.6s 长期停留) | §6.5 强制含优化方案 (懒加载 + WebP + 资源预加载 + 减少阻塞);§15.3 性能测试用例;§16 验收硬性 |
| 16 张图物理尺寸混乱 (798×528 / 1075×1052) | 本期过渡期允许 `number` 类型;业务整改后切字面量类型。§18 第 1 条作为后续整改入口 |
| 中文子目录 `图片/理想/1.png` 部署风险 | 业务整改时迁移到 ASCII 目录 + 改 slug |
| 用户误认为官方授权 | 页面增加适配说明,避免"官方/授权/原厂"等措辞 |
| 品牌车型错配 (理想图用作问界) | 业务整改时按 §8.3 清单逐项核对 |
| **图片规格失控 (关键风险)** | 本版建立 4 层约束 (§8.2 物理 / §8.4 UI / §8.5 类型 / §8.6 CI) 对冲 |
| **`/product` 入口顺序变化导致回归** | 保持现有顺序 (flooring 在最后),不动既有顺序 |

## 18. 后续迭代入口

本轮验收通过后,可进入下一轮:

1. **16 张图统一处理 + 迁移到 ASCII 目录**:业务使用 `sips` / `sharp` 工具统一处理 16 张色图到 1448×1086 / 4:3;迁移到 `public/images/products/flooring/{li-auto,aito,zeekr,xpeng}/`,删除 `图片/` 中文子目录;更新 `src/lib/flooring-products.ts` 中 `assetPath` 与 `width/height/aspectRatio` 字段。
2. **新建 `scripts/verify-flooring-images.mjs`** (参照 [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) §8.6):校验 16 张图全部满足规格,链入 `npm run check`。
3. **flooring 3 态 UI 接入**:当前 `FlooringVehicleGroup` 只实现 `matched`,后续接入 3 态 (`matched` / `pending-review` / `missing`) 与 ZEEKR 拉齐。
4. **Hero 预览图整改**:`/images/products/flooring/图片/理想/1.png` 当前 798×528,整改为 1448×1086 / 4:3 规格 + AVIF 格式。
5. **建立 `scripts/verify-topic-images.mjs` 通用校验脚本**:接受目录参数,校验逻辑从 `verify-zeekr-images.mjs` 抽出,供各专题复用。
6. **腾势 / 奔驰模板上线**:业务补图后,腾势 (reference-only → active) 与奔驰 (missing-assets → active) 可加入页面渲染。
7. **地板单品详情弹窗或详情页**。
8. **地板安装效果 before/after 实拍图库**。
9. **后台维护地板品牌/颜色数据**。
10. **地板产品项目兴趣数据看板**。
11. **按颜色筛选 (雪霜白 / 中性灰 / 岩石黑 / 木纹咖)**。
12. **与极氪 009 地板尾箱作为交叉推荐内容**。

## 19. 变更记录

| 版本 | 日期 | 主要变更 | 作者 |
| --- | --- | --- | --- |
| v0 | 2026-06-13 | 初版 (4 品牌 + 4 颜色 + 16 张图) | — |
| v1 | 2026-06-20 | 重写。①§1 范本定位 (沿用 ZEEKR v1);②§2 反例盘点 (798×528 + 1075×1052 两种混乱);③§2.2 业务模式差异表 (flooring 按品牌分组 vs wenjie/xiaomi/zeekr 按车型分组);④§5 4 组件结构 (无 AnchorNav/单款 ProductCard/ProductTable/ProductGrid);⑤§6.5 P1-1 性能优化方案 (硬性要求,LCP 6.6s → < 3s,perf 59/61 → 90/85);⑥§8 整章重写 (8.0~8.7);⑦§8.1 显式拆出 16 张图全部 `matched` 但尺寸混乱 + 中文子目录;⑧§8.2 规格表沿用 ZEEKR §8.2;⑨§8.3 整改与迁移清单 16 行 (4 品牌 × 4 颜色);⑩§8.4 UI 容器规格;⑪§8.5 类型固化 (过渡期允许 `number`);⑫§9 4 组件清单 + 锚点导航说明 (本期不做);⑬§12 数据模型升级路径;⑭§15 测试加 P1-1 性能用例;⑮§16 验收硬性 P1-1;⑯§17 风险加 "P1-1 性能未达标";⑰§18 后续迭代加 "16 张图统一处理 + 中文子目录迁移" 与 "腾势/奔驰模板上线" | Claude Code |