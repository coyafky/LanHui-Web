# 蔚来 ES8 专属升级方案 PRD

> **页面范围**：`/product/nio/es8` 蔚来 ES8 单车型专题页；legacy alias `/product/nio-es8`
> **来源素材**：用户提供的蔚来 ES8 产品目录海报 + 17 项 AI 生成预览图（`public/images/products/nio-es8/generated/`）
> **页面类型**：单车型轻改升级方案 PRD，不是蔚来全系通用页
> **上位规范**：[PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md](./PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md) §3.4 / §6
> **关联入口 PRD**：[PRODUCT_INDEX_PRD_2026-06-25.md](./PRODUCT_INDEX_PRD_2026-06-25.md)、[P1_SERVICE_PROJECTS_PRD_2026-06-25.md](./P1_SERVICE_PROJECTS_PRD_2026-06-25.md)
> **版本**：v0.1
> **状态**：规划中，未授权编码
> **创建日期**：2026-06-27
> **最后更新**：2026-06-27
> **Owner**：冯科雅 · AI 部

---

## 0. 重要变更说明（避免重蹈覆辙）

最近 Tesla（commit `d3c8cab`）和小鹏 GX（commit `2c9d698`）的 PRD 都曾包含「海报素材展示」模块，实现为 `PosterStub` 空态组件。复盘结论：**该模块是 PRD 设计失误**——海报图片业务方短期不会补图，长期空态对用户体验无价值。

架构 PRD §17 已明确：「暂不把海报图片直接当作唯一内容，页面正文必须文本化、结构化」。

**因此本 PRD 严格遵守：**
- ❌ 不写「海报素材展示」「完整海报展示」「PosterStub」任何章节
- ❌ 不设计 `poster_expand_click` 埋点事件
- ❌ 不把海报长图作为页面模块
- ✅ 17 项项目以 HTML 文本化、结构化方式作为页面核心内容
- ✅ 图片作为每个项目的卡片背景（4 态 UI），不是页面独立模块

---

## 1. 文档定位

本文针对蔚来 ES8 产品目录海报与 17 项 AI 预览图素材，规划蔚来 ES8 单车型轻改专题页。

本 PRD 是蓝辉「蔚来」品牌下的首个单车型 PRD。蔚来品牌专题页 `/product/nio` 仅注册为 `planned`，不实装 UI，留待后续 batch。数据层 `src/lib/nio-products.ts` 预留 ES6/ET5/ET7/ET9 等扩展位。

页面类型为 **单车型轻改升级方案**，不是蔚来全系通用页。

一句话定位：

> 蔚来 ES8 专题页是蓝辉面向蔚来 ES8 车主的单车型轻改方案页，用于集中展示 17 项 AI 预览图项目（车衣、隔热膜、彩绘、双拼改色、360 脚垫、铝地板、平衡杆、轮毂、运动包围、小桌板、挡泥板、防虫网、钢化膜、底盘护板、刹车卡钳、内饰镀膜），并引导车主确认适配和施工。

---

## 2. 页面目标

### 2.1 用户目标

蔚来 ES8 车主进入页面后，需要快速知道：

1. 我的蔚来 ES8 可以做哪些轻改升级项目？
2. 哪些项目适合新车优先做？
3. 哪些项目偏外观个性、家庭座舱还是日常防护？
4. 哪些项目需要到店确认安装位和版本适配？
5. 如何进一步确认方案和施工？

### 2.2 业务目标

蓝辉通过该页面实现：

1. 把「蔚来 ES8 专属升级方案」转成官网可检索、可分享的内容资产。
2. 把蔚来品牌纳入产品矩阵，覆盖 ES8 这一大型纯电 SUV 主流车型。
3. 给销售提供可直接转发的 ES8 专题链接。
4. 通过项目点击和项目兴趣行为判断 ES8 车主更关注新车保护、外观个性、家庭座舱还是日常防护。

---

## 3. 用户与车型范围

### 3.1 目标用户

| 用户 | 主要关注 |
|---|---|
| 蔚来 ES8 新车车主 | 车衣、隔热膜、360 脚垫、底盘护板、钢化膜 |
| 家庭用户 | 铝地板、小桌板、360 脚垫、内饰镀膜 |
| 外观个性用户 | 彩绘、双拼改色、运动包围、轮毂、刹车卡钳 |
| 行车防护用户 | 底盘护板、平衡杆、挡泥板、防虫网 |
| 门店销售 | 需要一份清晰的 ES8 项目清单，用于客户沟通 |

### 3.2 车型范围

一期页面只面向「蔚来 ES8」单车型，不扩展到 ES6 / EC6 / ET5 / ET7 / ET9。

页面需明确说明：

> 不同年份、批次、版本和配置的蔚来 ES8 在尺寸、接口、安装位和结构上可能存在差异。页面项目只作为轻改方向参考，最终以到店确认和施工评估为准。

### 3.3 合规边界

页面不得出现以下未经证明的表达：

- 蔚来官方授权。
- 蔚来原厂配件。
- 官方同款。
- 不影响原车质保。
- 100% 无损安装。
- 永久质保。
- 全网最低。
- 性能提升、操控提升、制动提升等不可验证承诺。
- 暗示蔚来品牌合作关系（仅作为车型识别）。

---

## 4. 路由与入口

| 页面 | 路由 | 状态 | 说明 |
|---|---|---|---|
| 产品中心入口 | `/product` | 🟢 live | 加 `<NioTopicBanner />` 入口卡片 |
| 蔚来品牌专题页 | `/product/nio` | 🟡 planned | 仅路由注册，不实装 UI |
| 蔚来 ES8 单车型页 | `/product/nio/es8` | 🟡 planned → 本 PRD 目标 | 本 PRD 规划的新单车型路由 |
| 蔚来 ES8 legacy alias | `/product/nio-es8` | 🟡 planned | 平铺历史别名（301 → canonical） |

产品中心入口建议文案：

| 字段 | 文案 |
|---|---|
| 标题 | 蔚来 ES8 专属升级方案 |
| 副标题 | 新车保护、彩绘双拼、铝地板与底盘防护 |
| 标签 | 蔚来 ES8 / 单车型方案 / 大型纯电 SUV 轻改 |

### 4.1 Slug 规则确认

- 品牌 slug：`nio`（小写英文，遵循架构 PRD §4.2）
- 车型 slug：`es8`（小写英文，保留 ES8 数字识别度）
- Canonical：`/product/nio/es8`
- Legacy alias：`/product/nio-es8`（与 wenjie-m8 / xiaomi-yu7 平铺模式一致）
- Parent：`/product/nio`（planned）

---

## 5. 页面信息架构

`/product/nio/es8` 页面建议结构：

```text
蔚来 ES8 单车型专题页
├── 01 Hero：蔚来 ES8 专属升级方案
├── 02 17 项轻改产品目录
├── 03 按场景分类的项目矩阵（4 场景）
├── 04 新车基础保护组合
├── 05 外观个性升级组合
├── 06 家庭座舱升级组合
├── 07 行车与日常防护组合
├── 08 车型适配说明
├── 09 施工服务流程
├── 10 常见问题
```

> **注意：本架构不包含「海报素材展示」模块**。详见 §0 变更说明。

---

## 6. Hero 区

### 6.1 页面文案

| 字段 | 建议内容 |
|---|---|
| 主标题 | 蔚来 ES8 专属升级方案 |
| 副标题 | 17 项热门轻改产品目录 |
| 简介 | 围绕新车保护、玻璃隔热、外观个性、家庭座舱、底盘防护和行车防护，为蔚来 ES8 车主提供系统化轻改项目参考。 |

### 6.2 视觉方向

- Hero 使用 `hero.png`（1448×1086, 4/3，generated-preview 状态）作为车型主视觉。
- Hero **不放置完整海报长图**，海报原图不在页面展示。
- Hero 文案下方接锚点导航（4 场景快捷跳转）。

### 6.3 主题色

- `accentColor="sky"`（`#0ea5e9` = Tailwind v4 `sky-500`；中文「天蓝色」）
- **2026-06-27 用户决策**：由 cyan 改 sky，避免与问界 wenjie 撞色（wenjie = cyan-500 `#22d3ee`，NIO = sky-500 `#0ea5e9`；色相差异明显）
- 实现：扩展 `AccentColor` 枚举加 `sky` 值 + 8 处 `Record<AccentColor, string>` 映射补全（详见实施计划 §0.2 #21 + A.0 任务）
- Hero / Banner / Grid / Bundles / Flow / FAQ 全部用 sky 主题（`border-sky-700/60`、`text-sky-400`、`bg-sky-950/30` 渐变）

---

## 7. 17 项轻改产品目录

页面核心内容是 17 项项目（来自 `public/images/products/nio-es8/generated/manifest.json`），必须完整覆盖。

### 7.1 项目完整清单

| 序号 | key | 项目 | 分类 | 文件 | 状态 |
|---:|---|---|---|---|---|
| 00 | hero | 蔚来 ES8 系列主视觉 | 车型主视觉 | `hero.png` | generated-preview |
| 01 | paint-protection-film | 车衣 | 新车保护 | `paint-protection-film.png` | generated-preview |
| 02 | window-film | 隔热膜 | 玻璃膜/舒适 | `window-film.png` | generated-preview |
| 03 | graphic-wrap | 彩绘 | 外观个性 | `graphic-wrap.png` | generated-preview |
| 04 | two-tone-color-wrap | 双拼改色 | 外观个性 | `two-tone-color-wrap.png` | generated-preview |
| 05 | floor-mats-360 | 360 脚垫 | 座舱保护 | `floor-mats-360.png` | generated-preview |
| 06 | aluminum-floor | 铝地板 | 家庭座舱/易清洁 | `aluminum-floor.png` | generated-preview |
| 07 | stabilizer-bar | 平衡杆 | 底盘/操控 | `stabilizer-bar.png` | generated-preview |
| 08 | wheel-rims | 轮毂 | 外观升级 | `wheel-rims.png` | generated-preview |
| 09 | sport-body-kit | 运动包围 | 外观套件 | `sport-body-kit.png` | generated-preview |
| 10 | rear-table-tray | 小桌板 | 后排便利/家庭 | `rear-table-tray.png` | generated-preview |
| 11 | mud-flap | 挡泥板 | 行车防护 | `mud-flap.png` | generated-preview |
| 12 | bug-screen | 防虫网 | 行车防护 | `bug-screen.png` | generated-preview |
| 13 | screen-protector | 钢化膜 | 屏幕保护 | `screen-protector.png` | generated-preview |
| 14 | underbody-skid-plate | 底盘护板 | 底盘防护 | `underbody-skid-plate.png` | generated-preview |
| 15 | brake-caliper | 刹车卡钳 | 外观视觉 | `brake-caliper.png` | generated-preview |
| 16 | interior-coating | 内饰镀膜 | 内饰养护 | `interior-coating.png` | generated-preview |

### 7.2 项目展示方式

- Desktop：4 列项目网格（17 项 → 4+4+4+4 + 1 hero 跨列）。
- Tablet：2 列项目网格。
- Mobile：单列卡片，保留序号，方便对应。

每张卡片至少包含：

- 项目名称。
- 分类标签。
- 1 句价值说明（来自 manifest promptSummary）。
- 图片（generated-preview 状态）。

### 7.3 项目点击行为

项目卡片点击后，一期采用展开面板，不强制每个项目做独立详情页。

| 状态 | 行为 |
|---|---|
| 默认 | 展示项目名称、分类、简短说明 |
| 展开 | 展示适合人群、注意事项、施工确认提示 |

---

## 8. 按场景分类的项目矩阵

为避免页面只是项目清单，按用户真实决策场景重新组织（4 场景）：

| 场景 | 包含项目 | 页面表达 |
|---|---|---|
| 新车保护 | 车衣、隔热膜、360 脚垫、底盘护板、钢化膜 | 适合刚提车用户，优先解决保护和日常使用问题 |
| 外观个性 | 彩绘、双拼改色、运动包围、轮毂、刹车卡钳 | 强化视觉辨识度和整车外观细节 |
| 家庭座舱 | 铝地板、小桌板、360 脚垫、内饰镀膜 | 适合家庭出行、后排使用和座舱养护 |
| 行车与日常防护 | 底盘护板、平衡杆、挡泥板、防虫网 | 关注底部防护、行车环境和车身侧面清洁 |

---

## 9. 推荐组合方案

### 9.1 新车基础保护组合

适合刚提车的蔚来 ES8 车主：

| 项目 | 价值 |
|---|---|
| 车衣 | 漆面保护 |
| 隔热膜 | 隔热、防晒、隐私 |
| 360 脚垫 | 保护地毯，方便清洁 |
| 底盘护板 | 加强底部防护 |
| 钢化膜 | 保护中控屏幕 |

### 9.2 外观个性升级组合

适合追求视觉辨识度的用户：

| 项目 | 价值 |
|---|---|
| 彩绘 | 主题化个性表达 |
| 双拼改色 | 整车双色风格 |
| 运动包围 | 强化外观运动姿态 |
| 轮毂 | 改变侧面姿态 |
| 刹车卡钳 | 强化轮毂区域视觉 |

### 9.3 家庭座舱升级组合

适合家庭乘坐和后排高频使用：

| 项目 | 价值 |
|---|---|
| 铝地板 | 后排易清洁，提升质感 |
| 小桌板 | 后排办公、用餐和儿童使用 |
| 360 脚垫 | 减少日常脏污 |
| 内饰镀膜 | 皮革与饰板养护 |

### 9.4 行车与日常防护组合

适合关注车身清洁和底盘防护的用户：

| 项目 | 价值 |
|---|---|
| 底盘护板 | 加强底部防护 |
| 平衡杆 | 车身支撑与稳定感（需到店评估） |
| 挡泥板 | 减少泥水飞溅 |
| 防虫网 | 行车防护 |

---

## 10. 与蔚来品牌专题的关系

| 文档 | 作用 |
|---|---|
| 本文档 | 蔚来 ES8 单车型 17 项轻改方案 |
| `/product/nio`（planned） | 蔚来品牌总专题入口（后续 batch） |

实现关系：

1. `/product/nio` 暂不实装 UI，但 `src/lib/product-routes.ts` 注册为 `planned`。
2. `/product/nio/es8` 为本期主目标页面。
3. `/product` 入口加 `<NioTopicBanner />` 指向 `/product/nio/es8`。
4. 数据层 `src/lib/nio-products.ts` 设计为可扩展：
   ```ts
   export const nioProducts = {
     es8: nioEs8UpgradeProjects,
     // es6: [] as const,   // 后续 batch 填充
     // et5: [] as const,
     // et7: [] as const,
     // et9: [] as const,
   } as const;
   ```

---

## 11. 页面模块详细规格

| 模块 | 优先级 | 内容 | 验收重点 |
|---|---|---|---|
| Hero | P0 | 车型主视觉 + 文案 + 4 场景锚点 | hero.png 正确加载，sky 主题一致 |
| 17 项项目目录 | P0 | 17 张项目卡 | 项目完整，顺序与 manifest 一致 |
| 场景分类 | P0 | 4 场景筛选与分组 | 用户能按需求选择 |
| 推荐组合 | P1 | 4 类组合引导 | 组合只是内容引导，不写成强制套餐 |
| 适配说明 | P0 | 年份、批次、版本差异提示 | 避免过度承诺 |
| 服务流程 | P1 | 7 步统一流程 | 建立专业可信感 |
| FAQ | P1 | 适配、工期、单项了解、质保边界 | 解决了解前顾虑 |

### 11.1 图片状态规则（4 态）

| 状态 | 页面表现 | 使用条件 |
|---|---|---|
| `matched` | 展示真实项目图 | 图片已经确认适配该项目（真实施工图） |
| `generated-preview` | 展示 AI 预览图 + 「预览图」角标 | AI 生成的功能示意图（蔚来 ES8 全部 17 项均为此态） |
| `pending-review` | 展示占位 + 「图片审核中」标签 | 有素材但未确认是否最终使用 |
| `missing` | 展示统一占位卡片 | 暂无可用素材 |

### 11.2 筛选与排序规则

| 能力 | 一期要求 |
|---|---|
| 默认排序 | 按 manifest 序号 01-17 |
| 场景筛选 | 支持全部 / 新车保护 / 外观个性 / 家庭座舱 / 行车防护 |
| 推荐组合入口 | 点击组合后高亮组合内项目 |
| 搜索 | 暂不做 |
| 价格排序 | 暂不做 |

### 11.3 移动端要求

- Hero 不超过一屏半。
- 项目卡片单列展示，按钮足够大。
- 场景筛选标签可以横向滚动，但不能遮挡正文。
- 4 场景锚点导航在 mobile 端可折叠为下拉。

---

## 12. 17 项素材图片库说明

> **本节非「海报素材展示」模块**——不展示海报原图，只描述素材库元信息。

### 12.1 素材库信息

| 项 | 内容 |
|---|---|
| 素材根目录 | `public/images/products/nio-es8/generated/` |
| 文件总数 | 20（17 项目图 + 1 hero + 1 contact-sheet + manifest.json） |
| 统一规格 | 1448 × 1086, 4:3 |
| 生成方式 | `built-in image_gen`（AI 预览图，非真实施工图） |
| 生成日期 | 2026-06-26 |
| 参考来源 | 用户提供的蔚来 ES8 产品目录海报 |
| 状态 | 全部 `generated-preview` |

### 12.2 提示词约束

- 4:3 产品卡预览图、真实产品功能展示、不加海报文字、不加价格、不加水印、不声明为真实施工案例。
- 各项目提示词摘要见 `public/images/products/nio-es8/generated/prompts.md`。

### 12.3 页面处理方式

- 17 个项目的图片作为每个项目卡片背景，不集中展示。
- **不展示**完整海报长图、不设计「查看完整海报」入口。
- 项目文字以 HTML 文本方式结构化展示，不只靠图片传达（满足架构 PRD §17）。

---

## 13. 施工服务流程

页面应展示统一服务流程（与全站一致）：

```text
车型确认 → 项目选择 → 到店评估 → 方案确认 → 施工安装 → 验收交付 → 售后支持
```

| 步骤 | 说明 |
|---|---|
| 车型确认 | 确认蔚来 ES8 的年份、批次、版本和配置 |
| 项目选择 | 根据新车保护、外观个性、家庭座舱或行车防护选择项目 |
| 到店评估 | 确认安装位、接口、材料、工期和风险提示 |
| 方案确认 | 确认项目组合、施工时间和注意事项 |
| 施工安装 | 按项目标准施工，并做好车身和内饰保护 |
| 验收交付 | 检查外观、功能和安装细节 |
| 售后支持 | 提供使用注意事项和后续维护建议 |

---

## 14. 常见问题

| 问题 | 回答方向 |
|---|---|
| 蔚来 ES8 的这些项目是否都能安装？ | 不同年份、版本和配置可能不同，需到店评估确认 |
| 新车最推荐先做什么？ | 车衣、隔热膜、360 脚垫、底盘护板、钢化膜 |
| 外观升级项目有哪些？ | 彩绘、双拼改色、运动包围、轮毂、刹车卡钳 |
| 家庭座舱项目有哪些？ | 铝地板、小桌板、360 脚垫、内饰镀膜 |
| 行车防护项目有哪些？ | 底盘护板、平衡杆、挡泥板、防虫网 |
| 可以只做单个项目吗？ | 可以，页面项目既支持单项了解，也支持组合方案 |
| 是否影响原车质保？ | 不做不影响质保的承诺，具体以车辆情况和项目评估为准 |
| 工期多久？ | 根据项目组合、库存和施工排期确认 |
| 图片是真实施工案例吗？ | 当前展示的是 AI 功能预览图，真实施工以到店沟通为准 |

---

## 15. SEO 与元信息

### 15.1 建议 SEO

| 字段 | 建议内容 |
|---|---|
| Title | 蔚来 ES8 轻改升级方案｜车衣隔热膜彩绘双拼底盘护板｜蓝辉轻改 |
| Description | 蓝辉轻改提供蔚来 ES8 专属升级方案参考，覆盖车衣、隔热膜、彩绘、双拼改色、360 脚垫、铝地板、平衡杆、轮毂、运动包围、小桌板、挡泥板、防虫网、钢化膜、底盘护板、刹车卡钳和内饰镀膜等 17 项项目。 |
| H1 | 蔚来 ES8 专属升级方案 |
| H2 | 17 项轻改产品目录 / 新车保护 / 外观个性 / 家庭座舱 / 行车防护 |
| canonical | `/product/nio/es8` |

### 15.2 关键词方向

- 蔚来 ES8 轻改
- 蔚来 ES8 改装
- 蔚来 ES8 车衣
- 蔚来 ES8 隔热膜
- 蔚来 ES8 彩绘
- 蔚来 ES8 双拼改色
- 蔚来 ES8 铝地板
- 蔚来 ES8 软包脚垫
- 蓝辉轻改

关键词只作为内容方向，不做堆砌。

---

## 16. 数据结构建议

### 16.1 字面量类型（防规格漂移，参照 ZEEKR v1）

```ts
type Width = 1448;
type Height = 1086;
type AspectRatio = "4/3";
type MaxProjects = 17;
type MinProjects = 17;
```

### 16.2 项目类型

```ts
type NioEs8ImageStatus = "matched" | "generated-preview" | "pending-review" | "missing";

type NioEs8UpgradeProject = {
  order: number;                    // 01-17
  key: string;                      // manifest key, e.g. "paint-protection-film"
  name: string;                     // 中文名, e.g. "车衣"
  category:
    | "protection"
    | "film"
    | "appearance"
    | "cabin_protection"
    | "family_cabin"
    | "chassis"
    | "driving_protection"
    | "screen_care"
    | "interior_care";
  summary: string;                  // 1 句价值说明
  promptSummary: string;            // 来自 manifest promptSummary
  publicPath: `/images/products/nio-es8/generated/${string}.png`;
  width: Width;
  height: Height;
  aspectRatio: AspectRatio;
  imageStatus: NioEs8ImageStatus;   // ES8 全部 "generated-preview"
  suitableFor: string[];            // 用户场景, e.g. ["new_car", "family"]
  caution?: string;                 // 适配/施工提示
};
```

### 16.3 数据文件

```text
src/lib/nio-products.ts
```

### 16.4 导出结构（预留多车型扩展）

```ts
export const nioEs8UpgradeProjects: readonly NioEs8UpgradeProject[] = [
  // 17 项, 与 manifest 完全对齐
] as const;

export const nioProducts = {
  es8: nioEs8UpgradeProjects,
  // es6: [] as const,   // 后续 batch
  // et5: [] as const,
  // et7: [] as const,
  // et9: [] as const,
} as const;

export const nioEs8ProjectCount = 17;
```

---

## 17. 埋点要求

| 事件 | 触发时机 | 关键参数 |
|---|---|---|
| `product_topic_view` | 进入 `/product/nio/es8` | `topic: nio-es8`, `brandSlug: nio`, `modelSlug: es8` |
| `vehicle_upgrade_module_view` | 看到 ES8 升级模块 | `module: nio-es8-upgrade` |
| `upgrade_scenario_filter` | 切换 4 场景筛选 | `scenario: protection/appearance/family_cabin/driving_protection` |
| `upgrade_project_click` | 点击项目卡片 | `projectKey`, `projectName`, `category`, `scenario` |
| `upgrade_project_expand` | 展开项目说明 | `projectKey`, `imageStatus` |
| `bundle_click` | 点击推荐组合 | `bundleName: new_car_protection/appearance/family_cabin/driving_protection` |

> **不设计 `poster_expand_click` 埋点**（参见 §0 变更说明）。

---

## 18. 测试与验收用例

### 18.1 内容验收

| 用例 | 操作 | 预期 |
|---|---|---|
| 项目完整性检查 | 对照 manifest.json 逐项核对 | 17 项项目 key/name/category 与 manifest 完全一致，无遗漏 |
| 场景分类检查 | 切换 4 场景筛选 | 每个场景内项目符合 §8 场景矩阵 |
| 组合检查 | 点击 4 个推荐组合 | 对应项目被高亮或集中展示 |
| 合规文案检查 | 全文搜索「官方、原厂、不影响质保、100%无损、性能提升」 | 不出现误导性承诺 |
| 海报模块检查 | 搜索「海报、poster」 | 页面不包含「海报素材展示」模块 |

### 18.2 数据验收

| 用例 | 操作 | 预期 |
|---|---|---|
| 字面量类型检查 | `npx tsc --noEmit` | 1448/1086/"4/3" 字面量未漂移 |
| 数量边界检查 | `nioEs8ProjectCount === 17` | TS 类型 `MaxProjects = 17` 与数组长度对齐 |
| 状态枚举检查 | 每个项目 `imageStatus === "generated-preview"` | ES8 全部 17 项为 generated-preview |
| 路由注册检查 | `npx vitest run src/lib/product-routes.test.ts` | NIO brand + nio/es8 model 已注册 |

### 18.3 交互验收

| 用例 | 操作 | 预期 |
|---|---|---|
| 场景锚点 | 点击 Hero 4 场景锚点 | 平滑滚动到对应 section |
| 项目展开 | 点击项目卡片 | 展开说明，二次点击可收起 |
| FAQ 展开 | 点击问题 | 答案展开，二次点击可收起 |
| 组合点击 | 点击推荐组合 | 组合内项目视觉高亮 |

### 18.4 响应式验收

| 视口 | 预期 |
|---|---|
| Mobile 390px | 项目卡单列，4 场景锚点变下拉，无横向滚动 |
| Tablet 768px | 项目卡 2 列，Hero 上下结构，布局稳定 |
| Desktop 1440px | 项目卡 4 列，Hero 横排，锚点导航 sticky |

---

## 19. 三棱镜验收标准

### 19.1 实现什么

- 新增蔚来 ES8 单车型升级方案页面 `/product/nio/es8`。
- 页面完整展示 17 项 AI 预览图项目。
- 页面按 4 场景分类展示项目（新车保护 / 外观个性 / 家庭座舱 / 行车防护）。
- 页面提供 4 类推荐组合。
- 蔚来品牌 `/product/nio` 注册为 planned，不实装 UI。
- 数据层预留 ES6/ET5/ET7/ET9 扩展位。

### 19.2 怎么实现

- 使用静态数据维护 17 项项目，不在组件里散落硬编码。
- 项目卡片支持分类标签、场景标签、展开说明和项目兴趣行为。
- 字面量类型严格约束图片规格（1448×1086, 4:3）。
- imageStatus 新增 `generated-preview` 态，区别于 `matched/pending-review/missing`。
- **不实现任何「海报素材展示」模块**。
- CI 脚本 `scripts/verify-nio-images.mjs` 校验文件存在 + 字面量类型。
- CI 脚本 `scripts/verify-nio-content.mjs` 校验数据 shape + 合规红线 + JSON-LD。

### 19.3 怎么验收

| 验收项 | 标准 |
|---|---|
| 项目完整性 | 17 项项目 key/name/category 与 manifest.json 完全一致 |
| 场景完整 | 4 场景覆盖：新车保护、外观个性、家庭座舱、行车防护 |
| 字面量类型 | 1448×1086 / 4:3 未漂移 |
| 4 态图片 | `generated-preview` 状态正确显示「预览图」角标 |
| 路由注册 | `src/lib/product-routes.ts` 含 NIO brand + nio/es8 model |
| 合规表达 | 无官方授权、原厂、不影响质保、100% 无损、性能提升等承诺 |
| 移动端可读 | 17 项项目在手机端可顺畅浏览，不横向溢出 |
| 埋点可测 | 项目点击、场景筛选、组合点击都能带上项目 key/category/scenario |
| SEO 可读 | 17 项项目以 HTML 文本存在，title/description/H1/H2 完整 |
| 品牌页占位 | `/product/nio` 注册为 planned，UI 不实装 |
| 数据扩展位 | `src/lib/nio-products.ts` 预留 `nioProducts.es6/et5/et7/et9` 注释位 |
| **海报模块** | **页面不包含任何「海报素材展示」章节 / 模块 / 埋点** |

---

## 20. 暂不做范围

一期暂不做：

- 在线报价。
- 项目购物车。
- 用户预约排期系统。
- 支付功能。
- 客户案例详情页。
- 每个项目独立详情页。
- 官方参数对比。
- 「海报素材展示」模块（参见 §0）。
- `/product/nio` 蔚来品牌专题页 UI（仅注册 planned）。
- ES6 / ET5 / ET7 / ET9 等其他蔚来车型 PRD。

---

## 21. 后续迭代

| 版本 | 方向 |
|---|---|
| v0.2 | 补充真实施工案例图（`imageStatus: matched`），替换 AI 预览图 |
| v0.3 | 新增蔚来 ES6 / ET5 / ET7 / ET9 单车型 PRD |
| v0.4 | 实现 `/product/nio` 蔚来品牌专题页（汇总 ES6/ES8/ET5 等车型入口） |
| v0.5 | 增加组合套餐，如新车保护包、外观个性包、家庭座舱包 |
| v0.6 | 接入后台项目管理，支持运营维护项目排序、封面图和上下架 |

---

## 22. 变更记录

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-27 | v0.1 | 基于蔚来 ES8 产品目录海报 + 17 项 AI 预览图素材，新增单车型 PRD；明确**不包含**「海报素材展示」模块（参见 §0 变更说明） | Claude / Coya |

---

## 附录 A：相关文档

| 文档 | 说明 |
|---|---|
| [PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md](./PRODUCT_ROUTE_ARCHITECTURE_PRD_2026-06-25.md) §3.4 / §6 | 单车型路由规范与品牌注册表 |
| [PRODUCT_INDEX_PRD_2026-06-25.md](./PRODUCT_INDEX_PRD_2026-06-25.md) | 产品中心入口页 v2 双入口规范 |
| [PRODUCT_LANDING_VISUAL_PRD_2026-06-25.md](./PRODUCT_LANDING_VISUAL_PRD_2026-06-25.md) | 入口页视觉规范（11 品牌色与三大业务色） |
| [P1_SERVICE_PROJECTS_PRD_2026-06-25.md](./P1_SERVICE_PROJECTS_PRD_2026-06-25.md) | P1 项目服务规划 |
| [WENJIE_M6_TOPIC_PRD_2026-06-25.md](./WENJIE_M6_TOPIC_PRD_2026-06-25.md) | 17 项单车型 PRD 同级参考 |
| [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md](./ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md) | 字面量类型与 3 态 UI canonical 参考 |
| [../../ARCHITECTURE.md](../../ARCHITECTURE.md) | 工程架构 |

## 附录 B：素材库索引

- 根目录：`public/images/products/nio-es8/generated/`
- manifest：`public/images/products/nio-es8/generated/manifest.json`
- prompts：`public/images/products/nio-es8/generated/prompts.md`
- contact-sheet：`public/images/products/nio-es8/generated/contact-sheet.jpg`
- 17 项目图 + 1 hero：`/images/products/nio-es8/generated/{key}.png`

## 附录 C：路由注册表更新预告

`src/lib/product-routes.ts` 将追加（不在本期 PRD 范围，但提示后续 coder 必做）：

```ts
// BRANDS 数组追加:
{
  type: "vehicle_brand",
  brandSlug: "nio",
  brandName: "蔚来",
  accentColor: "sky",
  status: "planned",
  priority: "P1",
  canonicalPath: "/product/nio",
  title: "蔚来轻改方案",
  navLabel: "蔚来",
  modelSlugs: ["es8"],
},

// MODELS 数组追加:
{
  type: "vehicle_model",
  brandSlug: "nio",
  modelSlug: "es8",
  modelName: "蔚来 ES8",
  parentPath: "/product/nio",
  canonicalPath: "/product/nio/es8",
  title: "蔚来 ES8 专属升级方案",
  navLabel: "ES8",
  status: "planned",
  priority: "P1",
  projectCount: 17,
  sourcePrd: "docs/PRD/product/NIO_ES8_TOPIC_PRD_2026-06-27.md",
  legacyPaths: ["/product/nio-es8"],
},
```