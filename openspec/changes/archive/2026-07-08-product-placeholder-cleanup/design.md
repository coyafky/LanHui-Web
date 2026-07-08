## Context

当前产品路由注册表 `src/lib/product-routes.ts` 中，6 个品牌路由（denza/voyah/xpeng/nio/ledao/gaoshan）status 已为 `live`，但页面仍使用含占位文案的 subtitle 和 `BrandPlaceholder` 组件。`skid-plate` 服务 status 为 `planned`，`business-comfort` status 为 `planned`。

`BrandPlaceholder` 组件在 `status === "live"` 时不显示"方案整理中"，但缺少品牌介绍内容区域，仅展示标题+subtitle+车型卡片网格。

## Goals / Non-Goals

**Goals:**
- 6 个品牌页正常展示（标题 + 品牌介绍 + 车型卡片）
- 底盘护板从占位改为正常服务页
- 商务舒适从公开入口隐藏（页面返回 404）
- 新增检查脚本防止占位页面回归

**Non-Goals:**
- 不创建新的品牌专属 Hero/TopicBanner 组件
- 不虚构价格、授权、质保承诺
- 不影响已有车型专题页路由和内容
- 不删除商务舒适文件
- 不新增 `hidden` 状态类型（保持 ProductRouteStatus = "live" | "planned"）

## Decisions

### Decision 1: BrandPlaceholder 增加 `live` 状态品牌介绍

**选择**：在 `BrandPlaceholder` 中为 `status === "live"` 增加 `intro` prop，接受品牌介绍文字。去掉 wrench 图标，改为简短品牌说明。

**理由**：不需要为每个品牌创建独立组件，复用现有组件结构，通过 props 区分内容。

### Decision 2: 商务舒适保持 `planned` + `notFound()`

**选择**：不扩展 `ProductRouteStatus` 类型。页面用 `notFound()` 返回 404。`getLiveServices()` 已天然排除 planned 状态。

**理由**：类型系统保持简洁。后续恢复时只需改页面代码和 status。

### Decision 3: 检查脚本放在 `scripts/` 目录

**选择**：`scripts/check-product-placeholders.mjs`，链入 `npm run check`。

**理由**：与现有 `scripts/verify-zeekr-images.mjs` 等脚本位置一致。

## Risks / Trade-offs

- **品牌页暂无完整数据** → 使用克制的品牌介绍文案，不虚构细节。后续可通过独立 change 逐个丰富。
- **底盘护板页暂无完整服务数据** → 使用通用服务页结构，标注为"服务说明"而非"整理中"
- **商务舒适文件保留但不展示** → 文件可能积累技术债务，但用户明确要求保留
