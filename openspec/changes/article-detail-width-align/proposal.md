# Proposal: 文章详情页内容宽度对齐 Header

## 动机

`/news/[slug]` 文章详情页使用 `max-w-4xl` 容器宽度，但 Header 和 News 列表页等全站其他页面使用 `max-w-7xl`。导致文章详情页内容明显窄于导航栏，视觉不协调。

## 目标

统一文章详情页 Hero/Body/Related 三个区块的外层容器为 `max-w-7xl`，与 Header 左边缘对齐。同时在正文卡片内部保持 `max-w-4xl` 约束文字行宽，确保可读性。

## 范围

- 仅修改 `src/app/news/[slug]/page.tsx`
- 不改动其他页面、组件或全局样式
