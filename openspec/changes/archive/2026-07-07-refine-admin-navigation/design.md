## Context

当前 `/admin` 后台使用 `Sidebar` Client Component + `DashboardLayout` Server Component 的布局架构。侧边栏品牌区、导航列表和用户区全部在一个组件内。顶栏在 layout 中独立渲染。本次改动范围限定在这两个文件，不触及路由、auth 或数据层。

## Goals / Non-Goals

**Goals:**
- 导航按功能域分三组（工作台/运营管理/数据与设置），每组有小标题
- 品牌区改为 LH 标识 + 主副标题的精品牌
- 用户区收敛为 avatar + 用户名 + 角色 + 退出图标的 compact chip
- 顶栏去掉用户名，放「查看官网」链接

**Non-Goals:**
- 不引入二级菜单、折叠、dropdown
- 不改变路由结构或 auth 逻辑
- 不修改移动端 hamburger/遮罩行为
- 不新增依赖

## Decisions

1. **导航用静态分组对象替代 flat array**：在现有 `navItems` 处改为 `navGroups` 结构，每组含 `title` 和 `items`，渲染时在组间加 spacing 和 section header。不拆文件（变化范围小，拆文件增加间接层）。

2. **品牌区保持在同一组件内**：只改 markup 和样式，不拆 `AdminBrand` 组件。当前品牌区 ~10 行，拆出组件性价比低。

3. **用户区 compact chip 方案**：圆形 `div` 显示 `userName[0]` 首字母 + 用户名 + 小字角色 + `LogOut` 图标按钮。不做 dropdown/portal，保持简单。`role` 从 session 传入，fallback 为「管理员」。

4. **顶栏「查看官网」用 `<Link href="/" target="_blank">`**：新标签页打开，不干扰后台操作。

## Risks / Trade-offs

- 导航分组后若后续需要加二级菜单需重构 → Acceptable，当前需求明确不要求二级
- 纯 CSS 改动无回归风险 → 手动验证 + build 通过即可
