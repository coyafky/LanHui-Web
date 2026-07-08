# Brainstorm Summary

- Change: product-placeholder-cleanup
- Date: 2026-07-08

## 确认的技术方案

- BrandPlaceholder live 状态：新增 `intro?: string` prop，紧凑型段落渲染（方案 A）
- 底盘护板：单文件简化服务页，H1 + 简介 + 价值点 + 服务流程 + CTA（方案 A）
- 商务舒适：保持 planned + notFound()
- 不扩展 ProductRouteStatus 类型
- 检查脚本：静态文本扫描，链入 npm run check

## 关键取舍与风险

- 6 品牌共享 BrandPlaceholder，后续可独立升级
- 底盘护板暂无完整数据，使用克制描述
- 测试策略：构建验证 + 检查脚本 + 手动浏览器验证

## 测试策略

- npm run build 通过
- check-product-placeholders.mjs 自验证
- 手动浏览器验证 7 页面无"方案整理中"

## Spec Patch

无
