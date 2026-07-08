## 1. 产品路由状态更新

- [x] 1.1 skid-plate 服务路由 status 从 `planned` 改为 `live`

## 2. BrandPlaceholder 组件更新

- [x] 2.1 `live` 状态增加品牌介绍区域（新增 `intro` prop），去掉 wrench 图标，展示品牌描述文字
- [x] 2.2 `planned` 状态保持"方案整理中"，不增加额外 UI

## 3. 品牌页文案清理（6 个页面）

- [x] 3.1 `src/app/product/denza/page.tsx`：更新 subtitle 文案，传入 `intro` prop
- [x] 3.2 `src/app/product/voyah/page.tsx`：更新 subtitle 文案，传入 `intro` prop
- [x] 3.3 `src/app/product/xpeng/page.tsx`：更新 subtitle 文案，传入 `intro` prop
- [x] 3.4 `src/app/product/nio/page.tsx`：更新 subtitle 文案，传入 `intro` prop
- [x] 3.5 `src/app/product/ledao/page.tsx`：更新 subtitle 文案，传入 `intro` prop
- [x] 3.6 `src/app/product/gaoshan/page.tsx`：更新 subtitle 文案，传入 `intro` prop

## 4. 底盘护板服务页

- [x] 4.1 `src/app/product/skid-plate/page.tsx`：从占位改为正常服务页（H1 + 简介 + 价值点 + 服务流程 + CTA）

## 5. 商务舒适撤离

- [x] 5.1 `src/app/product/business-comfort/page.tsx`：改为 `notFound()`

## 6. 检查脚本

- [x] 6.1 新增 `scripts/check-product-placeholders.mjs`：扫描 7 个页面禁止"方案整理中"/"内容由团队完善中"/planned 状态，检查 business-comfort 不在 getLiveServices() 中
- [x] 6.2 `package.json` 添加 `check:product-placeholders` script，链入 `npm run check`
