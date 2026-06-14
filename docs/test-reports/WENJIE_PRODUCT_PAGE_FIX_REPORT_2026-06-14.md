# 问界产品专题页：去联系方式与产品图片规格修复报告

> 目标读者：Claude Code 架构师、Coder、Tester。本文定义 `/product/wenjie` 第二轮修正范围：产品页主体移除联系方式；补齐问界产品图片规格、命名、生成图提示词与验收标准。

## 1. 测试背景

当前问界专题页已实现 `/product/wenjie`，包含 M7 / M8 / M9 三组产品卡片与表格。但页面存在两个问题：

1. 产品专题页主体出现了电话咨询/咨询此款/返回产品中心等联系方式或转化 CTA。
2. 大量产品卡片仍显示 `图片待补充`，且现有提取图片尺寸不统一，需要先定义产品图片规格，再做图片匹配、裁切或生成图补齐。

业务判断：

- 产品页第一版应先承担“产品展示、车型适配、款式理解”的职责。
- 联系方式应主要出现在首页、门店页、联系页或全站统一咨询模块中。
- 产品专题页不应在每个产品卡片中放电话或联系方式，否则页面会像销售落地页，不像品牌产品中心。

## 2. 当前代码证据

| 文件 | 当前问题 |
| --- | --- |
| `src/app/product/wenjie/page.tsx` | Hero 区使用 `PhoneCta`，底部 CTA 再次使用 `PhoneCta`，还有 `返回产品中心`。 |
| `src/components/wenjie/WenjieProductCard.tsx` | 每个产品卡片底部有 `PhoneCta`，文案为 `咨询此款`。 |
| `src/components/wenjie/WenjieProductTable.tsx` | 当前表格没有联系方式列，保留即可。 |
| `src/lib/wenjie-products.ts` | 44 条产品数据全部 `imageStatus="pending"`，`publicPath=null`。 |
| `public/images/products/wenjie/manifest.json` | 已提取 38 张图片，但 product-level matching 仍需人工复核。 |

当前页面可见问题：

- 产品卡片底部出现 `电话待补充`。
- Hero 区出现 `电话咨询`。
- 底部出现“需要确认自己车型适合哪几款？”和 `电话咨询`。
- 产品图片区域大量显示 `图片待补充`。

## 3. 当前素材状态

### 3.1 文件数量

| 目录/文件 | 状态 |
| --- | --- |
| `public/images/products/wenjie/contact-sheet.jpg` | 存在，尺寸 1100 x 1552 |
| `public/images/products/wenjie/preview.png` | 存在，实际为 JPEG 数据，尺寸 1100 x 1552 |
| `public/images/products/wenjie/extracted/*.png` | 38 张 |
| `public/images/products/wenjie/manifest.json` | 存在，记录 44 个产品行、38 张已提取图片 |

### 3.2 已提取图片尺寸分布

当前提取图尺寸不统一，示例：

| 文件 | 尺寸 |
| --- | --- |
| `wenjie-01.png` | 788 x 600 |
| `wenjie-02.png` | 512 x 384 |
| `wenjie-03.png` | 973 x 704 |
| `wenjie-04.png` | 970 x 445 |
| `wenjie-10.png` | 1076 x 659 |
| `wenjie-16.png` | 300 x 650 |
| `wenjie-30.png` | 500 x 249 |
| `wenjie-32.png` | 400 x 550 |
| `wenjie-38.png` | 679 x 640 |

结论：

- 这些图片不能直接作为统一产品卡片资产上线。
- 必须先做产品行匹配，再按统一画布规格裁切/补边/重生成。
- `preview.png` 虽然后缀为 PNG，但文件识别为 JPEG，应在修复中统一文件格式与命名。

## 4. 修复目标

### 4.1 页面交互目标

问界产品页主体只做产品展示，不做联系方式。

必须移除：

- Hero 区 `PhoneCta`。
- Hero 区 `返回产品中心` 按钮，如果它被设计成 CTA 按钮。
- 产品卡片中的 `咨询此款` / `电话待补充`。
- 底部整块电话咨询 CTA。
- `wenjie_topic_phone_click`、`wenjie_product_consult_click` 等专题电话事件。

可以保留：

- 面包屑中的 `产品中心` 返回路径。
- Header / Footer 中全站通用导航。若后续业务要求产品页彻底无任何联系方式，需要另开全站 Header/Footer 范围修复。
- 产品表格、车型导航、服务流程、合规说明。

### 4.2 图片资产目标

为问界 44 个产品行建立统一图片资产规范：

- 每个产品最多绑定 1 张主图。
- 主图必须来自人工确认、裁切后的源图，或由生成图工具按统一规格生成。
- 不得用其他产品图误配。
- 不得用小米、极氪、地板专题或其他品牌图片填充问界产品。
- 缺图产品继续显示“图片待补充”，但不得出现电话/咨询按钮。

## 5. 图片规格标准

### 5.1 产品卡片主图规格

| 项目 | 规格 |
| --- | --- |
| 用途 | 产品卡片主图、产品表格缩略图来源 |
| 画布比例 | 4:3 |
| 推荐尺寸 | 1200 x 900 px |
| 最小可接受尺寸 | 800 x 600 px |
| 文件格式 | WebP 优先；PNG 可接受 |
| 背景 | 纯浅灰或极浅冷灰，建议 `#F4F6F8`；透明背景也可，但前端需提供统一底色 |
| 产品位置 | 居中，最长边占画布 72%-86% |
| 留白 | 四周保留 7%-12% 安全边距 |
| 阴影 | 允许非常轻微自然阴影，不得做强烈电商广告阴影 |
| 文案 | 图片内不得出现文字、价格、电话、二维码、Logo、水印 |
| 品牌 | 不得出现“官方”“原厂”“授权”等暗示性文字 |
| 色彩 | 真实产品色，不要强饱和滤镜 |
| 裁切 | 不得裁掉产品关键结构 |

推荐输出路径：

```text
public/images/products/wenjie/normalized/
├── m7/
│   ├── m7-01-floor-trunk-floor.webp
│   ├── m7-02-table-simple.webp
│   └── ...
├── m8/
│   ├── m8-01-table-simple.webp
│   └── ...
└── m9/
    ├── m9-01-table.webp
    └── ...
```

### 5.2 专题 Hero 图规格

| 项目 | 规格 |
| --- | --- |
| 用途 | 问界专题首屏视觉、产品中心专题入口可选图 |
| 画布比例 | 16:9 |
| 推荐尺寸 | 1600 x 900 px |
| 最小可接受尺寸 | 1200 x 675 px |
| 内容 | 3-6 个代表产品组合，或一张干净的车型专题产品矩阵 |
| 背景 | 深色品牌背景或浅灰产品展示背景均可，但要和页面暗色风格协调 |
| 文案 | 不在图片内写营销文案、电话、价格 |
| 备注 | 不得使用未授权整车图当作官方宣传图 |

### 5.3 Contact Sheet / 内部核对图规格

| 项目 | 规格 |
| --- | --- |
| 用途 | 内部人工核对，不作为正式产品卡主图 |
| 推荐尺寸 | 宽 1600-2200 px，自适应高度 |
| 内容 | 每张提取图编号 + 文件名 + 尺寸 |
| 是否上线 | 不建议作为前台主视觉上线 |

## 6. 数据结构要求

`src/lib/wenjie-products.ts` 应从当前 `pending` 状态逐步升级为可复核的状态。

建议扩展图片字段：

```ts
export type WenjieImageStatus = "matched" | "pending" | "generated" | "missing";

export type WenjieProduct = {
  id: string;
  vehicleModel: "M7" | "M8" | "M9";
  orderInModel: number;
  sourceRow: number;
  productName: string;
  category: WenjieCategory;
  imageStatus: WenjieImageStatus;
  image: {
    publicPath: string | null;
    alt: string;
    source?: "excel-extracted" | "manual-crop" | "generated";
    sourceAsset?: string;
    normalizedSize?: "1200x900";
  };
};
```

状态含义：

| 状态 | 含义 | 是否可上线 |
| --- | --- | --- |
| `matched` | Excel 提取图已人工确认并规范化 | 可以 |
| `generated` | 通过生成图工具按规格生成，已业务确认 | 可以 |
| `pending` | 有候选图但未确认 | 不建议正式上线 |
| `missing` | 暂无可信图片 | 可以显示缺图状态，但不能误配 |

## 7. ChatGPT 图像生成规格

当 Excel 提取图无法匹配或质量不达标时，可以使用 ChatGPT 图像生成能力补图。但必须遵守：

- 只生成“产品展示图”，不要生成“官方安装案例图”。
- 不得生成品牌 Logo、官方授权标识、价格、电话、二维码。
- 不得生成假冒官方宣传海报。
- 不得生成带真实车牌、真实门店、真实人物的画面。
- 生成图需标记为 `imageStatus="generated"`，并在内部 manifest 记录来源。

### 7.1 通用生成提示词模板

```text
生成一张汽车轻改装产品展示图，用于蓝辉轻改官网产品卡片。

产品：{车型} {产品名称}
产品类型：{分类}
画布：4:3，1200x900 px
背景：极浅冷灰 #F4F6F8，干净无纹理
构图：单个产品居中展示，最长边占画布 78%左右，四周保留均匀留白
风格：真实电商产品摄影，柔和棚拍光，轻微自然阴影
要求：不要文字，不要价格，不要二维码，不要电话，不要品牌 Logo，不要“官方/原厂/授权”等字样
限制：不要出现人物，不要出现车牌，不要出现复杂场景，不要把产品安装到整车上
输出：干净产品图，适合放在深色网页卡片中的 4:3 图片区域
```

### 7.2 示例：问界 M7 地板+尾箱地板

```text
生成一张汽车轻改装产品展示图，用于蓝辉轻改官网产品卡片。

产品：问界 M7 地板+尾箱地板套件
产品类型：地板尾箱
画布：4:3，1200x900 px
背景：极浅冷灰 #F4F6F8，干净无纹理
构图：地板主板与尾箱地板套件平铺展示，产品居中，最长边占画布 78%左右，四周保留均匀留白
风格：真实电商产品摄影，柔和棚拍光，轻微自然阴影，材质表现为耐磨皮革/复合地板质感
要求：不要文字，不要价格，不要二维码，不要电话，不要品牌 Logo，不要“官方/原厂/授权”等字样
限制：不要出现人物，不要出现车牌，不要复杂门店背景，不要把产品安装到整车上
输出：干净产品图，适合放在深色网页卡片中的 4:3 图片区域
```

### 7.3 示例：问界 M8 电动踏板

```text
生成一张汽车轻改装产品展示图，用于蓝辉轻改官网产品卡片。

产品：问界 M8 电动踏板（一体全铝支架）
产品类型：电动踏板
画布：4:3，1200x900 px
背景：极浅冷灰 #F4F6F8，干净无纹理
构图：左右两根电动踏板与支架组件并排展示，产品居中，保留 10% 安全边距
风格：真实电商产品摄影，金属铝合金质感清晰，柔和棚拍光，轻微自然阴影
要求：不要文字，不要价格，不要二维码，不要电话，不要品牌 Logo，不要“官方/原厂/授权”等字样
限制：不要出现人物，不要出现车牌，不要展示为官方整车配件海报
输出：干净产品图，适合放在深色网页卡片中的 4:3 图片区域
```

### 7.4 示例：问界 M9 小桌板

```text
生成一张汽车轻改装产品展示图，用于蓝辉轻改官网产品卡片。

产品：问界 M9 小桌板
产品类型：内饰便利
画布：4:3，1200x900 px
背景：极浅冷灰 #F4F6F8，干净无纹理
构图：折叠小桌板产品单独展示，展开状态为主，旁边可放一个轻微角度的折叠状态作为辅助，但不要复杂场景
风格：真实电商产品摄影，黑色/深灰内饰件质感，柔和棚拍光，轻微自然阴影
要求：不要文字，不要价格，不要二维码，不要电话，不要品牌 Logo，不要“官方/原厂/授权”等字样
限制：不要出现人物，不要出现车牌，不要伪造成官方车内实拍
输出：干净产品图，适合放在深色网页卡片中的 4:3 图片区域
```

## 8. 修复要求

### 8.1 页面去联系方式

必须修改：

- `src/app/product/wenjie/page.tsx`
  - 移除 `PhoneCta` import。
  - 移除 Hero CTA 按钮组。
  - 移除底部 CTA 区块，或改为“产品说明/合规说明”区块。
  - metadata description 去掉 `支持到店咨询与安装方案沟通` 等联系方式导向文案。
- `src/components/wenjie/WenjieProductCard.tsx`
  - 移除 `PhoneCta` import。
  - 移除卡片底部 `咨询此款` 按钮。
  - 卡片底部可改为图片状态、分类说明或保持留白，不应出现电话/联系动作。

不得修改：

- 门店页电话能力。
- 联系页。
- 首页咨询能力。
- Header / Footer 全局导航，除非另开全站范围。

### 8.2 图片规范化

必须完成：

- 建立 `public/images/products/wenjie/normalized/` 目录。
- 对已经人工确认的图片输出 1200 x 900 的规范化版本。
- 对无法匹配的产品保持 `missing` 或 `pending`，不得误配。
- 更新 `src/lib/wenjie-products.ts` 中对应产品的 `imageStatus` 和 `image.publicPath`。
- 建议新增或更新 `public/images/products/wenjie/manifest.json`，记录：
  - 产品 id。
  - 车型。
  - 产品名称。
  - 原始候选图。
  - 规范化图路径。
  - 图片来源：`excel-extracted` / `manual-crop` / `generated`。
  - 人工确认状态。

## 9. 建议测试用例

### 9.1 页面联系方式测试

| 用例 | 步骤 | 期望 |
| --- | --- | --- |
| CTA-1 Hero 无电话 | 打开 `/product/wenjie` 首屏 | 不出现 `电话咨询`、`电话待补充`。 |
| CTA-2 卡片无咨询 | 查看 M7/M8/M9 产品卡片 | 不出现 `咨询此款`、`电话待补充`。 |
| CTA-3 底部无联系方式 | 滚动到页面底部 | 不出现底部电话咨询 CTA。 |
| CTA-4 无专题电话埋点 | 搜索代码 | `wenjie_topic_phone_click`、`wenjie_product_consult_click` 不再被页面触发。 |
| CTA-5 保留导航 | 页面仍可通过面包屑返回产品中心 | 面包屑存在，但不作为强 CTA。 |

### 9.2 图片规格测试

| 用例 | 步骤 | 期望 |
| --- | --- | --- |
| IMG-1 规范图尺寸 | 检查 `normalized/` 图片 | 每张为 1200 x 900，或至少 4:3。 |
| IMG-2 无误配 | 对照 manifest 人工核对 | 产品名称与图片内容一致。 |
| IMG-3 缺图状态 | 未匹配产品 | 显示 `图片待补充`，不显示错误图片。 |
| IMG-4 页面布局 | 390 / 768 / 1440 视口检查 | 卡片图片区域稳定，不因图片尺寸不同产生跳动。 |
| IMG-5 文件格式 | 检查图片 MIME | `.webp` 是 WebP，`.png` 是 PNG；避免 `preview.png` 实际为 JPEG 这种错配。 |

### 9.3 回归测试

| 用例 | 步骤 | 期望 |
| --- | --- | --- |
| REG-1 产品数量 | 检查页面数据 | M7 6 款、M8 22 款、M9 16 款，总计 44 款。 |
| REG-2 表格完整 | 查看每组产品表格 | 产品名称、分类、图片状态仍完整。 |
| REG-3 SEO 合规 | 查看页面 metadata | 不再强调电话/咨询，不暗示官方授权。 |
| REG-4 其他页面 | 打开首页、门店页、联系页 | 原有联系方式逻辑不受本轮影响。 |

## 10. 验收标准

修复完成必须同时满足：

- `/product/wenjie` 页面主体不出现 `电话咨询`。
- 产品卡片不出现 `咨询此款`。
- 页面主体不出现 `电话待补充`。
- 页面底部不出现独立联系方式 CTA。
- `src/app/product/wenjie/page.tsx` 不再 import/use `PhoneCta`。
- `src/components/wenjie/WenjieProductCard.tsx` 不再 import/use `PhoneCta`。
- 问界产品主图规格明确为 1200 x 900、4:3。
- 已上线产品图均来自 `public/images/products/wenjie/normalized/` 或明确的规范化路径。
- 未匹配产品继续显示可信缺图状态，不误配图片。
- 生成图来源需在 manifest 中标记为 `generated`。
- 页面在 390px、768px、1440px 下布局正常。
- `npm run lint` 通过。
- `npm run typecheck` 通过。
- `npm run build` 通过。

## 11. 给 Claude Code 的执行顺序

1. 先移除问界专题页主体中的 PhoneCta 和联系方式文案。
2. 再移除产品卡片中的 `咨询此款` 按钮。
3. 调整 metadata、底部说明和卡片布局，保持产品展示页调性。
4. 生成图片规范化 manifest 草案，不急于误配所有图片。
5. 对已确认图片做 1200 x 900 规范化输出。
6. 对缺图产品保留 `missing/pending` 状态。
7. 使用 Playwright 截图验证桌面和移动端。

## 12. 当前复测命令摘录

```bash
rg -n "PhoneCta|电话咨询|咨询此款|电话待补充|wenjie_topic_phone_click|wenjie_product_consult_click" \
  src/app/product/wenjie/page.tsx src/components/wenjie

identify -format '%f %wx%h\n' \
  public/images/products/wenjie/contact-sheet.jpg \
  public/images/products/wenjie/preview.png \
  public/images/products/wenjie/extracted/wenjie-*.png
```
