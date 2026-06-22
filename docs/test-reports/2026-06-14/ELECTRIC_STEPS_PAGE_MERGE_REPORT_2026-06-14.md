# 电动踏板产品页 Worktree 合并缺失测试报告

| 项目 | 内容 |
| --- | --- |
| 页面 | `/product/electric-steps` |
| 测试日期 | 2026-06-14 |
| 报告目的 | 交给 Claude 修复电动踏板页未合并完整的问题 |
| 当前状态 | 路由可访问，但页面仍停留在通用产品详情模板，电动踏板素材与展示能力未接入 |
| 优先级 | P1 |

## 1. 问题结论

当前 `/product/electric-steps` 不是 404，`curl -I http://localhost:3000/product/electric-steps` 返回 200。

但页面没有呈现已经准备好的电动踏板专题/素材效果，主要问题是：

1. 当前页面文件只是 16 行的 `ProductDetail` 包装器。
2. `ProductDetail` 当前没有消费产品主图、轮播图或图库。
3. `src/lib/products.ts` 中 `productImageMap["electric-steps"]` 仍为空字符串。
4. `public/images/products/` 下已经存在疑似电动踏板素材，但未被页面引用：
   - `/images/products/Taban.png`
   - `/images/products/Taban/biglight.jpg`
   - `/images/products/Taban/nolight.jpg`
   - `/images/products/Taban/singlelight.jpg`
5. 当前登记的多个 worktree 中，`src/app/product/electric-steps/page.tsx` 均是同一套通用 wrapper，未发现可直接整页复制的已完成版本。

因此，本问题不应被理解为“直接从某个 worktree 拷贝 `page.tsx` 即可”。更准确的修复方向是：定位电动踏板已完成工作是否存在于组件、图片注册或资产目录中；若不存在，则基于现有产品详情模板补齐电动踏板页的真实展示能力。

## 2. 当前证据

### 2.1 当前页面文件

文件：`src/app/product/electric-steps/page.tsx`

当前逻辑：

```tsx
const product = getProduct("electric-steps");
if (!product) notFound();
return <ProductDetail product={product} />;
```

说明：

- 页面没有自己的专题结构。
- 没有导入电动踏板专属图片。
- 没有导入 `ProductGalleryCarousel`。
- 没有电动踏板专属规格、场景、安装说明或适配说明。

### 2.2 当前产品数据

文件：`src/lib/products.ts`

已有基础内容：

- 产品名称：电动踏板
- 分组：轻改装备
- 标语：上下车更从容，也更稳
- 适用人群：SUV / MPV / 越野、家庭用户、注重原车观感车主
- 核心价值：迎宾便利、姿态保留、承重稳定、无损安装

缺失内容：

- `productImageMap["electric-steps"]` 为空。
- 没有产品图库字段。
- 没有电动踏板规格字段。
- 没有适配车型/适配场景字段。
- 没有“普通款 / 单流光灯 / 双流光灯”等版本说明。

### 2.3 当前组件能力

文件：`src/components/ProductDetail.tsx`

当前组件可以展示：

- Hero 文案
- 核心价值
- 部分膜类专属区块
- 服务流程
- Header / Footer

当前组件不能展示：

- 产品主图
- 多图轮播
- 电动踏板版本卡片
- 产品规格表
- 安装前后或展开/收起效果

### 2.4 已存在但未接入的组件

文件：`src/components/ProductGalleryCarousel.tsx`

该组件已经支持：

- 多图轮播
- 自动播放
- 上一张 / 下一张
- 圆点切换

但当前 `/product/electric-steps` 未使用该组件。

### 2.5 已存在但未接入的图片资产

当前主工作区存在：

| 文件 | 尺寸 | 推测用途 |
| --- | --- | --- |
| `public/images/products/Taban.png` | 1122 x 1402 | 电动踏板产品主图或卡片图 |
| `public/images/products/Taban/biglight.jpg` | 1646 x 1166 | 双流光灯/整套电动踏板效果 |
| `public/images/products/Taban/nolight.jpg` | 750 x 547 | 无灯款效果 |
| `public/images/products/Taban/singlelight.jpg` | 750 x 487 | 单流光灯款效果 |

注意：

- 这些文件命名大小写不统一，`Taban` 不够语义化。
- 建议归档到 `public/images/products/electric-steps/`，统一使用小写短横线命名。

建议目标结构：

```text
public/images/products/electric-steps/
  hero.jpg
  no-light.jpg
  single-light.jpg
  double-light.jpg
  product.png
  manifest.json
```

## 3. Worktree 排查结论

已检查当前登记 worktree：

```text
/Users/fkycoya/Documents/WebsiteClone/lanhui-website
/Users/fkycoya/Documents/WebsiteClone/lanhui-website-clean-2026-06-13
/Users/fkycoya/Documents/WebsiteClone/lanhui-website-wenjie-banner
/Users/fkycoya/Documents/WebsiteClone/lanhui-website-wenjie-cards
/Users/fkycoya/Documents/WebsiteClone/lanhui-website-wenjie-page
/Users/fkycoya/Documents/WebsiteClone/lanhui-website-xiaomi-topic
/Users/fkycoya/Documents/WebsiteClone/lanhui-website/.claude/worktrees/agent-a3994bc6
/Users/fkycoya/Documents/WebsiteClone/lanhui-website/.claude/worktrees/agent-a8831563
```

发现：

- 已登记 worktree 中的 `src/app/product/electric-steps/page.tsx` 没有明显差异。
- `ProductDetail.tsx` 在当前主工作区与两个 `.claude/worktrees/agent-*` 中也无明显差异。
- 多个 worktree 的 `src/lib/images.ts` 都登记了 `/images/products/electric-steps.png`，但实际主工作区没有该文件。
- 当前主工作区已经有 `Taban` 相关电动踏板图片，这可能是未合并或未重命名的资产成果。

## 4. 用户角度的问题

用户进入 `/product/electric-steps` 时，预期看到的是“电动踏板这个产品到底有什么效果、适合谁、有哪些版本、安装后车辆变成什么样”。

当前页面更像一个文字模板：

- 没有图片，用户无法判断产品真实效果。
- 没有版本差异，用户不知道无灯款、单流光灯、双流光灯的区别。
- 没有规格和安装要点，用户无法建立专业信任。
- 视觉效果弱于小米/问界/极氪专题，不符合“蓝辉轻改是新能源汽车轻改装新品牌”的定位。

## 5. 修复目标

### 5.1 页面定位

电动踏板页应从“通用产品说明页”升级为“轻改产品详情页”。

首版不需要招商模块，不需要表单，不需要单独电话联系方式。

页面应回答：

- 电动踏板解决什么问题？
- 适合哪些车型/人群？
- 有哪些版本？
- 展开/收起/带灯效果如何？
- 安装与交付需要注意什么？
- 蓝辉轻改如何保证施工稳定性？

### 5.2 产品页联系方式边界

沿用最近产品页决策：

- 产品详情页主体不新增私有电话咨询 CTA。
- 不在产品卡片、版本卡片中放 `电话咨询`、`咨询此款`、`电话待补充`。
- 如需转化，应由全站统一 Header/Footer 或企业微信统一入口承接，而不是每个产品页单独创造联系方式。

## 6. 建议页面结构

### 6.1 Hero

内容：

- 标题：电动踏板
- 副标题：开门自动展开，收起贴合车身，让 SUV / MPV 上下车更从容
- 标签：SUV / MPV / 越野适配、自动展开、承重稳定、无损安装
- 右侧或下方展示电动踏板主图/轮播图

图片：

- 首选 `/images/products/electric-steps/hero.jpg`
- 若暂未生成，先用 `biglight.jpg` 作为临时 hero，但需重命名和更新 manifest

### 6.2 版本展示

建议展示 3 个版本：

| 版本 | 图片 | 卖点 |
| --- | --- | --- |
| 无灯款 | `no-light.jpg` | 低调、贴合原车、适合注重简洁的车主 |
| 单流光灯款 | `single-light.jpg` | 迎宾氛围更明显，夜间识别度更好 |
| 双流光灯款 | `double-light.jpg` | 视觉更完整，适合强调科技感和高级感的车型 |

### 6.3 核心卖点

至少保留：

- 开门自动展开：降低上下车高度。
- 关门自动收起：收起后贴合车身侧裙。
- 防滑踏面：雨天、洗车后更稳定。
- 承重结构：金属骨架，适合家庭高频使用。
- 无损安装：优先原车孔位/原车接口，减少破线。
- 安全逻辑：需明确防夹、防误触、防水防尘等能力，若真实参数未确认，则用“需按具体车型方案确认”表述。

### 6.4 适用车型/人群

建议展示：

- 高底盘 SUV
- 家用 MPV
- 越野车
- 家有老人/小孩的车主
- 注重迎宾仪式感和外观整洁的新能源车主

### 6.5 安装交付

建议展示：

1. 车型确认
2. 版本选择
3. 支架/踏板预装
4. 线路与控制模块检查
5. 展开/收起测试
6. 交付与日常使用提醒

不要写未经确认的质保、价格、承重数值。

## 7. 图片规格要求

### 7.1 页面图片规格

| 用途 | 建议尺寸 | 比例 | 要求 |
| --- | --- | --- | --- |
| Hero 主图 | 1600 x 900 或 1920 x 1080 | 16:9 | 车辆侧面/低机位，能看到踏板展开效果 |
| 版本卡片图 | 1200 x 900 | 4:3 | 产品居中，背景干净，便于比较 |
| 结构细节图 | 1200 x 900 | 4:3 | 展示支架、踏面、防滑纹理或灯带 |
| 移动端缩略图 | 800 x 600 | 4:3 | 需保持主体清晰 |

### 7.2 图片内容规范

图片内不得出现：

- 电话号码
- 二维码
- 价格
- 营销大字
- 品牌授权/官方等未经确认的字样
- 其他品牌 Logo 水印

图片应体现：

- 新能源 SUV / MPV 车身侧面
- 电动踏板展开状态
- 踏板与车身侧裙贴合关系
- 夜间灯带效果可以作为一个版本图，但不要全部图片都做夜景

### 7.3 ChatGPT Image 生成提示词

Hero 图：

```text
生成一张汽车电动踏板产品官网 Hero 图，比例 16:9，尺寸 1920x1080。
场景：现代新能源 SUV 停在干净的室内改装工作室，低机位侧面视角，车门打开，电动踏板自动展开。
视觉重点：踏板结构清晰、车身侧裙贴合、金属质感、防滑踏面，整体高级、干净、真实。
风格：商业产品摄影，柔和棚拍光，深色背景，轻微反光地面。
要求：不要文字，不要价格，不要二维码，不要电话号码，不要品牌 Logo，不要“官方/授权”等字样。
```

无灯款：

```text
生成一张汽车电动踏板无灯款产品图，比例 4:3，尺寸 1200x900。
主体：一对黑色铝合金电动踏板和支架组件，产品居中摆放，背景为浅灰或深灰干净棚拍背景。
重点：防滑踏面、支架结构、简洁低调，不显示灯带。
要求：不要文字，不要价格，不要二维码，不要电话号码，不要品牌 Logo。
```

单流光灯款：

```text
生成一张汽车电动踏板单流光灯款产品图，比例 4:3，尺寸 1200x900。
主体：一对黑色铝合金电动踏板，单侧流光灯带微微点亮，展示迎宾氛围。
背景：干净棚拍背景，产品居中，保留安全边距。
要求：不要文字，不要价格，不要二维码，不要电话号码，不要品牌 Logo。
```

双流光灯款：

```text
生成一张汽车电动踏板双流光灯款产品图，比例 4:3，尺寸 1200x900。
主体：一对黑色铝合金电动踏板，双侧流光灯带点亮，科技感但不过曝。
背景：深灰商业摄影背景，产品居中，结构清楚。
要求：不要文字，不要价格，不要二维码，不要电话号码，不要品牌 Logo。
```

## 8. Claude 修复任务清单

### 8.1 修复前确认

1. 运行 `git worktree list --porcelain`，确认是否还有未登记的电动踏板 worktree。
2. 搜索电动踏板相关实现：

```bash
rg -n "electric-steps|电动踏板|Taban|biglight|singlelight|nolight|ProductGalleryCarousel" \
  /Users/fkycoya/Documents/WebsiteClone/lanhui-website* -S
```

3. 若找到更完整实现，只合并与电动踏板页面相关的文件，不要覆盖首页、后台管理、门店、新闻或其他产品专题。

### 8.2 资产整理

建议执行：

1. 新建 `public/images/products/electric-steps/`。
2. 将现有素材复制或移动为语义化命名：
   - `Taban.png` -> `product.png`
   - `Taban/biglight.jpg` -> `double-light.jpg` 或 `hero.jpg`
   - `Taban/nolight.jpg` -> `no-light.jpg`
   - `Taban/singlelight.jpg` -> `single-light.jpg`
3. 新增 `manifest.json`，记录每张图的用途、尺寸、alt。

注意：

- 如果保留旧路径，也要避免页面继续引用大小写混乱的 `Taban`。
- 如果移动文件，要检查是否有其他页面仍在引用旧路径。

### 8.3 数据层补齐

文件：`src/lib/products.ts`

建议增加字段，或采用现有项目更合适的数据结构：

```ts
type ProductGalleryImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type ElectricStepVariant = {
  name: string;
  image: string;
  description: string;
  highlights: string[];
};
```

电动踏板至少补齐：

- `heroImage`
- `gallery`
- `variants`
- `fitmentScenarios`
- `installNotes`

如果架构师认为 `Product` 类型不应继续膨胀，可以单独创建：

```text
src/lib/electric-steps.ts
```

### 8.4 组件层补齐

优先方案：

- 保持 `src/app/product/electric-steps/page.tsx` 为薄页面。
- 新建 `src/components/product/ElectricStepsDetail.tsx` 或扩展 `ProductDetail` 的 light-mod 分支。

建议：

- 如果只有电动踏板需要强展示，建立专属组件更清晰。
- 如果轮毂、底盘也要复用产品主图和版本卡片，则扩展 `ProductDetail` 更合适。

必须满足：

- 产品页主体不出现电话咨询/咨询此款/电话待补充。
- 使用真实图片或明确的缺图占位，不要静默空白。
- 移动端图片、卡片、表格不溢出。
- 桌面端首屏要能看到品牌质感，不只是文字说明。

## 9. 验收标准

| 编号 | 场景 | 预期 |
| --- | --- | --- |
| ES-1 | 打开 `/product/electric-steps` | 页面 200，标题为“电动踏板”，无运行时错误。 |
| ES-2 | 首屏 | 可见电动踏板真实图片或轮播图，不再只是渐变/文字模板。 |
| ES-3 | 版本区 | 可见无灯款、单流光灯款、双流光灯款或等价版本说明。 |
| ES-4 | 卖点区 | 至少展示自动展开、自动收起、防滑、承重、无损安装。 |
| ES-5 | 图片加载 | Network 无 404 图片请求。 |
| ES-6 | 联系方式边界 | 页面主体不出现 `电话咨询`、`咨询此款`、`电话待补充`。 |
| ES-7 | 响应式 | 390px、768px、1440px 宽度下无文字重叠、图片变形、横向滚动。 |
| ES-8 | SEO | metadata 不夸大质保、承重、官方授权、最低价等未确认信息。 |
| ES-9 | 回归 | `/product`、`/product/wheels`、`/product/chassis`、`/product/window-film`、`/product/color-film`、`/product/ppf` 不受影响。 |

## 10. 建议测试命令

```bash
npm run typecheck
npm run lint
npm run build
```

如果本地开发服务器已运行：

```bash
curl -I http://localhost:3000/product/electric-steps
```

建议使用 Playwright 或浏览器人工截图：

- Desktop：1440 x 1000
- Mobile：390 x 844

截图重点：

- 首屏是否有产品图。
- 版本卡片是否正常。
- 图片是否 404。
- 是否误出现电话咨询 CTA。

## 11. 交付要求

Claude 修复后需要给出：

1. 修改文件清单。
2. 是否找到并合并了已有 worktree 成果。
3. 若未找到完整 worktree 成果，说明是基于现有素材补齐实现。
4. 图片资产最终路径。
5. 验证命令结果。
6. 桌面端与移动端截图结论。

## 12. 最小可接受修复

如果时间有限，至少完成：

1. 让 `/product/electric-steps` 首屏展示电动踏板真实图片。
2. 整理并引用 `public/images/products/electric-steps/` 下的 3 张版本图。
3. 增加无灯款、单流光灯、双流光灯版本区。
4. 保证无图片 404。
5. 保证产品页主体无电话咨询 CTA。

完成以上内容后，该页面才算从“通用模板未合并状态”进入“第一版可用产品详情页”。
