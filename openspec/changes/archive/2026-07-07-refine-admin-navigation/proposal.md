## Why

当前 `/admin` 管理后台侧边栏底部「系统管理员」「退出登录」区块视觉存在感过强，顶栏右侧又重复显示用户名，破坏深色高级风格的整体美观。需要通过模块化导航分组、精致品牌区和 compact 用户区来提升后台导航体验，使其更克制、更精致。

## What Changes

- 侧边栏导航改为模块化分组（工作台/运营管理/数据与设置），菜单项保持一级 Link
- 品牌区重新设计为 LH 标识块 + 主副标题的精品牌布局
- 底部用户区收敛为 compact chip：圆形首字母头像 + 用户名 + 角色 + 退出小图标按钮
- 顶栏移除重复用户名，替换为「查看官网」低调链接
- 移动端 hamburger/遮罩/关闭行为保持不变

## Capabilities

### New Capabilities
<!-- 纯 UI 视觉优化，无新增 capability -->

### Modified Capabilities
<!-- 不涉及 spec 级别行为变更 -->

## Impact

- `src/components/admin/Sidebar.tsx` — 品牌区、导航分组、用户区重构
- `src/app/admin/(dashboard)/layout.tsx` — 顶栏去重、添加查看官网链接
