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
