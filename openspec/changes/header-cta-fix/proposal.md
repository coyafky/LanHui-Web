# Proposal: Header "查看门店" CTA 404 Fix

## Why

Header 组件中 desktop 和 mobile 的"查看门店"CTA 按钮硬编码 `/agent/store/shunde-daliang`，该路由不存在。Store ID 为数字（100001-100007），slug 路由从未实现。

## What

将两处 CTA 的 `href` 从 `/agent/store/shunde-daliang` 改为 `/agent`（门店列表页）。

## Impact

- 修改文件：1 个（`src/components/Header.tsx`）
- 改动行数：2 行
- 无新增文件
- 无 API 变更
- 无类型变更
