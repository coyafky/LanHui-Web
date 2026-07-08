# Comet Design Handoff

- Change: product-placeholder-cleanup
- Phase: design
- Mode: compact
- Context hash: 3ec5a61da4d31f0a6da8cc594cc9a49c24d37c41a0dec43ad023c9f284be5e77

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/product-placeholder-cleanup/proposal.md

- Source: openspec/changes/product-placeholder-cleanup/proposal.md
- Lines: 1-31
- SHA256: 937bdfb365a543811ea0ef9fce188957af85478495396f471ae52d4190189346

```md
## Why

8 个产品品牌/服务页面当前显示"方案整理中"占位状态。产品决策已明确：6 个品牌页（腾势/岚图/小鹏/蔚来/乐道/高山）和底盘护板服务页应正常展示，商务舒适升级应从前台撤离。这既影响用户体验，也让页面显得不完整。

## What Changes

- 将 `skid-plate` 服务路由状态从 `planned` 改为 `live`
- 更新 `BrandPlaceholder` 组件：`live` 状态增加品牌介绍文字区域，`planned` 状态保持"方案整理中"
- 更新 6 个品牌页 subtitle 文案，去掉"方案由团队整理中"占位语
- 新增底盘护板正常服务页（H1 + 简介 + 价值点 + 服务流程 + CTA）
- 商务舒适页面改为 `notFound()`，不删除文件，等待后续升级
- 新增 `scripts/check-product-placeholders.mjs` 检查脚本，防止占位页回归

## Capabilities

### New Capabilities

无新增 capability。本次变更为现有页面的状态/文案修改。

### Modified Capabilities

无修改现有 capability。不涉及 spec 级别的行为变更。

## Impact

- `src/lib/product-routes.ts`：skid-plate status planned → live
- `src/components/product/BrandPlaceholder.tsx`：live 状态增加品牌介绍
- `src/app/product/{denza,voyah,xpeng,nio,ledao,gaoshan}/page.tsx`：文案清理
- `src/app/product/skid-plate/page.tsx`：从占位改为正常服务页
- `src/app/product/business-comfort/page.tsx`：改为 `notFound()`
- `scripts/check-product-placeholders.mjs`：新增检查脚本 + package.json
```

## openspec/changes/product-placeholder-cleanup/design.md

- Source: openspec/changes/product-placeholder-cleanup/design.md
- Lines: 1-46
- SHA256: 3b480034501f36074131ae2de6f6f813b4d58f504b35bddaa1a844500b0a603f

```md
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
```

## openspec/changes/product-placeholder-cleanup/tasks.md

- Source: openspec/changes/product-placeholder-cleanup/tasks.md
- Lines: 1-30
- SHA256: 184601310152eeaa71ae4da964d6c90ecaa0ce4fb3d8e1f82231993e62a47d28

```md
## 1. 产品路由状态更新

- [ ] 1.1 skid-plate 服务路由 status 从 `planned` 改为 `live`

## 2. BrandPlaceholder 组件更新

- [ ] 2.1 `live` 状态增加品牌介绍区域（新增 `intro` prop），去掉 wrench 图标，展示品牌描述文字
- [ ] 2.2 `planned` 状态保持"方案整理中"，不增加额外 UI

## 3. 品牌页文案清理（6 个页面）

- [ ] 3.1 `src/app/product/denza/page.tsx`：更新 subtitle 文案，传入 `intro` prop
- [ ] 3.2 `src/app/product/voyah/page.tsx`：更新 subtitle 文案，传入 `intro` prop
- [ ] 3.3 `src/app/product/xpeng/page.tsx`：更新 subtitle 文案，传入 `intro` prop
- [ ] 3.4 `src/app/product/nio/page.tsx`：更新 subtitle 文案，传入 `intro` prop
- [ ] 3.5 `src/app/product/ledao/page.tsx`：更新 subtitle 文案，传入 `intro` prop
- [ ] 3.6 `src/app/product/gaoshan/page.tsx`：更新 subtitle 文案，传入 `intro` prop

## 4. 底盘护板服务页

- [ ] 4.1 `src/app/product/skid-plate/page.tsx`：从占位改为正常服务页（H1 + 简介 + 价值点 + 服务流程 + CTA）

## 5. 商务舒适撤离

- [ ] 5.1 `src/app/product/business-comfort/page.tsx`：改为 `notFound()`

## 6. 检查脚本

- [ ] 6.1 新增 `scripts/check-product-placeholders.mjs`：扫描 7 个页面禁止"方案整理中"/"内容由团队完善中"/planned 状态，检查 business-comfort 不在 getLiveServices() 中
- [ ] 6.2 `package.json` 添加 `check:product-placeholders` script，链入 `npm run check`
```

