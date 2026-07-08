# Brainstorm Summary

- Change: refine-admin-navigation
- Date: 2026-07-07

## 确认的技术方案

移除 layout.tsx 顶栏 `<header>`，所有导航/品牌/用户/链接集中在 Sidebar.tsx：
- 品牌区：LH 标识块（h-9 w-9 rounded-xl）+ 主副标题
- 导航：三组分组（工作台/运营管理/数据与设置），section header + 一级 Link
- 查看官网：用户区上方，border-t 分隔，新标签页打开
- 用户区：圆形首字母头像 + 用户名 + role + 退出图标按钮

## 关键取舍与风险

- 移除顶栏后失去顶部视觉锚点 → Acceptable，侧边栏本身提供足够结构
- 不拆新组件，全部在 Sidebar.tsx 内 → 文件行数增加但仍在可控范围

## 测试策略

纯视觉变更，手动验证 + `npm run build` 通过即可

## Spec Patch

无
