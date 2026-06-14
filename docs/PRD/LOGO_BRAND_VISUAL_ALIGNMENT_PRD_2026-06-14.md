# Logo 与官网品牌视觉适配 PRD

| 项目 | 内容 |
| --- | --- |
| 模块 | 全站品牌识别 / Header / Footer / SEO Logo |
| 页面影响 | 首页、产品页、门店页、品牌页、资讯页、后台登录页 |
| 日期 | 2026-06-14 |
| 目标使用者 | Claude 架构师、Coder、Tester、设计执行人员 |
| 当前版本 | v1.0 |
| 优先级 | P1 |

## 1. 背景

当前官网整体视觉方向是深色、科技感、偏新能源汽车轻改装品牌：

- 深色背景。
- 蓝色/橙色高亮。
- 玻璃质感 Header。
- 大字号品牌 Hero。
- 面向汽车膜、车衣、改色膜、新能源轻改装的中高端官网气质。

但当前 Header Logo 与页面气质不一致。截图中 Logo 表现为一块带灰色矩形背景的横向图片，放在深色导航栏里显得像“贴上去的旧素材”，而不是官网视觉系统的一部分。

本 PRD 目标是解决 Logo 和官网整体品牌视觉不统一的问题，并建立后续 Logo 使用规范。

## 2. 当前问题

### 2.1 视觉问题

| 问题 | 表现 | 影响 |
| --- | --- | --- |
| Logo 自带灰色底 | Header 是黑色/深色，Logo 图片有灰色矩形底 | 像临时贴图，不像品牌系统 |
| Logo 尺寸偏大/偏重 | 导航栏其他元素细腻，Logo 块面太突兀 | 破坏首屏精致感 |
| 色彩不协调 | Logo 里的蓝、黄、灰与页面蓝/橙系统未统一 | 品牌识别和 UI 色彩割裂 |
| 细节过密 | 小尺寸下文字和图形过于拥挤 | 移动端和窄屏识别度下降 |
| 缺少反白/透明底版本 | 深色 Header 只能硬贴灰底图 | 无法适配深色、浅色、后台等不同场景 |

### 2.2 技术问题

当前文件：

```text
src/components/Logo.tsx
public/images/logo/logo.png
```

已确认：

- 实际图片尺寸：`2508 x 627`。
- `Logo.tsx` 写死尺寸：`2172 x 724`。
- 两者比例不一致。

风险：

- 浏览器使用错误 intrinsic ratio 时，Logo 可能被压缩或拉伸。
- Next Image 的尺寸声明与真实资源不一致，会影响布局稳定性和视觉比例。

### 2.3 资产问题

当前只有：

```text
public/images/logo/logo.png
```

缺少：

- 透明底横版 Logo。
- 深色背景反白 Logo。
- 浅色背景彩色 Logo。
- 仅图形标识 Symbol。
- 方形 App/Favicon 版本。
- Footer 适配版本。
- 后台管理适配版本。
- SVG 矢量源文件。

## 3. 用户与品牌目标

### 3.1 用户感知目标

用户打开官网第一眼应感受到：

- 这是一个有品牌感的新汽车轻改装品牌。
- 官网是统一设计过的，不是素材拼接。
- Logo 和导航、按钮、Hero 一体化。
- 品牌可信、专业、适合新能源汽车车主。

### 3.2 品牌目标

Logo 需要支持蓝辉轻改的定位：

```text
汽车膜 + 车衣 + 改色膜 + 新能源汽车轻改装
```

气质关键词：

- 新能源
- 轻改装
- 源头工厂
- 一站式升级
- 专业施工
- 年轻但不廉价
- 科技但不冰冷
- 门店连锁服务潜力

## 4. 目标效果

### 4.1 Header 目标

Header 中的 Logo 应该：

- 使用透明底或反白版本。
- 与深色导航自然融合。
- 不出现灰色底块。
- 视觉高度与导航文字、按钮协调。
- 滚动前后尺寸变化自然。
- 在移动端仍可读。

### 4.2 Footer 目标

Footer 中的 Logo 应该：

- 可使用反白或低亮度版本。
- 不喧宾夺主。
- 与品牌简介、联系方式保持一致视觉权重。

### 4.3 SEO 与分享目标

Logo 资产应支持：

- Schema.org organization logo。
- favicon。
- Apple touch icon。
- Open Graph 分享图中的品牌露出。

本期不要求完整 OG 设计，但 Logo 文件结构要为后续预留。

## 5. 范围

### 5.1 本期包含

- 梳理 Logo 使用规范。
- 准备新 Logo 资产命名和目录结构。
- 替换 Header Logo 使用版本。
- 修正 `Logo.tsx` 图片真实尺寸。
- 支持 Header 深色背景使用透明底/反白版本。
- 支持 Footer 复用。
- 补齐基础 favicon/symbol 规格要求。
- 建立验收标准。

### 5.2 本期不包含

- 不重做完整 VI 手册。
- 不重构全站颜色系统。
- 不重做品牌命名。
- 不修改首页 Hero 文案。
- 不修改导航结构。
- 不要求一次性完成招商物料、门店招牌、画册设计。

## 6. Logo 资产规范

### 6.1 推荐文件结构

```text
public/images/logo/
  lanhui-logo-light.svg
  lanhui-logo-light.png
  lanhui-logo-dark.svg
  lanhui-logo-dark.png
  lanhui-logo-color.svg
  lanhui-logo-color.png
  lanhui-symbol.svg
  lanhui-symbol.png
  favicon.svg
  apple-touch-icon.png
```

### 6.2 命名含义

| 文件 | 用途 | 背景 |
| --- | --- | --- |
| `lanhui-logo-light.svg` | 深色背景横版 Logo | Header / Footer |
| `lanhui-logo-dark.svg` | 浅色背景横版 Logo | 后续浅色页面/文档 |
| `lanhui-logo-color.svg` | 彩色标准版 | 品牌页、物料展示 |
| `lanhui-symbol.svg` | 仅图形标识 | favicon、移动端、社媒头像 |
| `favicon.svg` | 浏览器标签图标 | 浏览器 |
| `apple-touch-icon.png` | iOS 收藏图标 | 180 x 180 |

### 6.3 图片格式要求

优先级：

1. SVG 矢量格式。
2. PNG 透明底兜底。

禁止：

- 使用 JPG 作为 Logo。
- Logo 图片自带灰色/白色矩形底。
- Logo 四周留大量空白。
- 用截图作为 Logo。

### 6.4 规格建议

| 资产 | 建议尺寸 | 说明 |
| --- | --- | --- |
| 横版 SVG | 矢量 | 首选 |
| 横版 PNG | 1600 x 400 或等比例 | 透明底 |
| Symbol PNG | 512 x 512 | 透明底或纯色底 |
| favicon SVG | 1:1 | 简化图形 |
| apple-touch-icon | 180 x 180 | PNG |

## 7. Logo 设计方向

### 7.1 推荐方向

当前官网更适合：

```text
深色科技 + 工业精致 + 新能源轻改装
```

Logo 应避免太传统汽修店风格，也避免过度赛车化。

建议视觉方向：

- 字体更简洁、有速度感，但不要过度倾斜。
- 图形可保留“光、车、电、膜、改装件”的抽象符号。
- 主色建议与官网统一：蓝色 + 橙色作为点睛，而不是蓝黄灰杂糅。
- 横版 Logo 在 Header 小尺寸下应优先保证“蓝辉轻改”可读。

### 7.2 色彩建议

基于当前页面：

| 用途 | 建议颜色 | 说明 |
| --- | --- | --- |
| 深色背景 Logo 主文字 | 白色或近白 | 保证可读性 |
| 英文 LANHUI | 低饱和浅蓝或白色 | 不抢中文主品牌 |
| 高亮点 | 橙色 | 与 CTA 系统一致 |
| 辅助图形 | 蓝色 | 呼应新能源/科技 |

禁止：

- Logo 底色使用中灰矩形。
- Logo 使用和页面无关的大面积黄色。
- Logo 颜色数量过多。

### 7.3 版本策略

至少保留 3 个版本：

1. 横版完整版：`LANHUI + 蓝辉轻改 + 图形`
2. 中文主品牌版：`蓝辉轻改 + 图形`
3. Symbol 版：仅图形，用于 favicon 和移动端窄空间

Header 桌面端优先使用横版完整版。

移动端如果横版过长，可使用：

- Symbol + 蓝辉轻改
- 或纯中文横版

## 8. 页面使用规范

### 8.1 Header

当前 Header 高度：

- 未滚动：`h-20`
- 滚动后：`h-16`

建议 Logo 显示高度：

| 状态 | Logo 高度 |
| --- | --- |
| 未滚动桌面 | 32-36px |
| 滚动后桌面 | 28-32px |
| 移动端 | 28-32px |

当前截图中 Logo 视觉块偏重，应降低高度和去除底块。

### 8.2 Header 背景适配

Header 背景为深色时：

- 使用 `lanhui-logo-light.svg`。
- Logo 不需要额外背景卡片。
- 如可读性不足，只允许使用极轻微的透明描边或阴影，不允许加灰色矩形底。

### 8.3 Footer

Footer 可使用：

- `lanhui-logo-light.svg`
- 或低亮度反白 Logo

Footer Logo 高度建议：

```text
28px - 36px
```

### 8.4 后台管理系统

后台管理侧边栏和登录页可以使用更简洁版本：

- Symbol + 蓝辉轻改
- 或纯文字 Logo

不建议后台复用 Header 横版大 Logo。

## 9. 组件设计建议

### 9.1 Logo 组件 Props

建议升级 `src/components/Logo.tsx`：

```ts
type LogoVariant = "light" | "dark" | "color" | "symbol";
type LogoLockup = "full" | "zh" | "symbol";

type LogoProps = {
  variant?: LogoVariant;
  lockup?: LogoLockup;
  className?: string;
  priority?: boolean;
};
```

### 9.2 使用示例

Header：

```tsx
<Logo variant="light" lockup="full" priority className="h-9 w-auto" />
```

Footer：

```tsx
<Logo variant="light" lockup="full" className="h-8 w-auto opacity-90" />
```

后台：

```tsx
<Logo variant="light" lockup="zh" className="h-7 w-auto" />
```

### 9.3 尺寸修正

如果继续使用当前 `logo.png`，必须先修正：

```ts
const LOGO_WIDTH = 2508;
const LOGO_HEIGHT = 627;
```

但这只是临时修复，不解决灰色底和视觉割裂问题。

## 10. 设计交付要求

设计或生成 Logo 新资产时，需要交付：

1. SVG 源文件。
2. PNG 透明底导出。
3. 深色背景预览。
4. 浅色背景预览。
5. Header 实际尺寸预览。
6. favicon 预览。
7. 移动端 Header 预览。

## 11. AI 生成 Logo 提示词

如果使用 ChatGPT Image 或其他图像工具辅助方向探索，可用以下提示词生成草案。

注意：AI 生成结果仅用于探索，最终 Logo 应由设计师或人工二次整理成 SVG，避免直接使用带瑕疵的位图。

```text
为新能源汽车轻改装品牌“蓝辉轻改 LANHUI”设计一个现代科技感横版 Logo。
品牌业务：汽车膜、隐形车衣、改色膜、轮毂、电动踏板、新能源汽车轻改装。
风格：深色官网适配，专业、年轻、科技、工业精致，不要传统汽修店风格，不要赛车夸张火焰。
构成：左侧简洁图形标识，右侧文字“LANHUI 蓝辉轻改”。
颜色：以白色文字为主，蓝色和橙色作为小面积高亮，适合黑色导航栏。
要求：透明背景，无灰色矩形底，图形简洁，小尺寸可读，适合导出 SVG。
不要：不要照片质感，不要复杂渐变，不要 3D 金属字，不要阴影厚重，不要多余英文标语。
```

Symbol 方向提示词：

```text
为“蓝辉轻改 LANHUI”设计一个简洁 Symbol 图形标识。
关键词：新能源、车身膜、轻改装、光线、速度、精密施工。
风格：几何、简洁、可用于 favicon 和社媒头像。
颜色：蓝色 + 橙色点睛，深色背景可识别。
要求：1:1 构图，透明背景，小尺寸仍清晰，不包含文字。
```

## 12. Claude 执行任务拆分

### 12.1 架构师

- 确定 Logo 资产目录和命名。
- 确定 Header/Footer/后台使用哪个 variant。
- 确认 `Logo` 组件 API。
- 确认 Schema.org、favicon、apple touch icon 的使用路径。
- 不扩大范围重构全站视觉。

### 12.2 Coder

- 新增或替换 Logo 资产。
- 升级 `Logo.tsx` 支持 variant。
- 修正当前 Logo 尺寸不一致问题。
- 替换 Header 使用 `light` 透明底版本。
- 替换 Footer 使用合适版本。
- 检查后台登录页和 Sidebar 是否需要简版 Logo。
- 更新 `src/lib/schema.ts` 中 organization logo 路径。

### 12.3 Tester

- 检查首页 Header 首屏 Logo 不再有灰色底块。
- 检查滚动后 Header Logo 不变形。
- 检查移动端 Header Logo 可读。
- 检查 Footer Logo 不突兀。
- 检查 favicon 正常。
- 检查 Network 中 Logo 图片无 404。
- 检查 Lighthouse 无明显图片尺寸警告。

## 13. 验收标准

| 编号 | 场景 | 预期 |
| --- | --- | --- |
| LOGO-1 | 首页首屏 Header | Logo 不再出现灰色矩形底。 |
| LOGO-2 | 首页首屏 Header | Logo 与深色导航自然融合，视觉高度协调。 |
| LOGO-3 | 滚动 Header | Logo 尺寸缩放自然，不变形、不跳动。 |
| LOGO-4 | 移动端 Header | Logo 清晰可读，不挤压菜单按钮。 |
| LOGO-5 | Footer | Logo 与 Footer 深色背景协调，不突兀。 |
| LOGO-6 | 图片尺寸 | `Logo.tsx` 声明尺寸与真实资源比例一致。 |
| LOGO-7 | 资源加载 | `/images/logo/*` 无 404。 |
| LOGO-8 | SEO | `src/lib/schema.ts` organization logo 指向有效 Logo。 |
| LOGO-9 | favicon | 浏览器标签图标正常显示。 |
| LOGO-10 | 回归 | 导航、CTA、下拉菜单布局不因 Logo 替换错位。 |

## 14. 测试建议

### 14.1 静态检查

```bash
npm run typecheck
npm run lint
npm run build
```

### 14.2 资源检查

```bash
find public/images/logo -maxdepth 1 -type f -print
file public/images/logo/*
```

### 14.3 代码检查

```bash
rg -n "logo.png|lanhui-logo|favicon|Logo" src public
```

### 14.4 浏览器验收

检查页面：

```text
/
/product
/product/window-film
/agent
/brand
/news
/admin/login
```

视口：

```text
390 x 844
768 x 1024
1440 x 1000
```

重点截图：

- 首页首屏未滚动 Header。
- 首页滚动后 Header。
- 移动端菜单关闭状态。
- Footer。
- 后台登录页。

## 15. 风险与注意事项

### 15.1 不要只改 CSS

如果原始 Logo 图片自带灰色底，只靠 CSS 无法真正解决割裂感。必须换透明底/反白版本。

### 15.2 不要让 Logo 变成按钮风格

Header 已经有 CTA 按钮，Logo 不应再加背景卡片、描边按钮或强阴影。

### 15.3 不要过度复杂

Logo 在 Header 中通常只有 28-36px 高。复杂图形、长标语、小字都会影响识别。

### 15.4 不要破坏已有品牌名称

品牌中文名仍为：

```text
蓝辉轻改
```

英文名仍为：

```text
LANHUI
```

除非老板另行确认，本 PRD 不修改品牌命名。

## 16. 最小可接受版本

如果时间有限，第一版至少完成：

1. 提供一张透明底的深色背景适配横版 Logo。
2. 替换 Header 使用该 Logo。
3. 修正 `Logo.tsx` 中图片尺寸。
4. 去除 Header Logo 的灰色底块观感。
5. 保证桌面和移动端 Header 不错位。
6. 更新 schema logo 路径。

完成以上内容后，Logo 至少不再和当前官网首屏产生明显割裂。
