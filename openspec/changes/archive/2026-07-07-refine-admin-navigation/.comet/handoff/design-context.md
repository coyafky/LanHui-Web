# Comet Design Handoff

- Change: refine-admin-navigation
- Phase: design
- Mode: compact
- Context hash: b7f8bee62fafe0cc5ed67d3c4eab2c8067cb67e3d355b21bdba611aece4b1ca8

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/refine-admin-navigation/proposal.md

- Source: openspec/changes/refine-admin-navigation/proposal.md
- Lines: 1-24
- SHA256: 2ca46138c0b54d26a1314ecacf150174a4f8789f90ba716fd7387f4620a1a436

```md
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
```

## openspec/changes/refine-admin-navigation/design.md

- Source: openspec/changes/refine-admin-navigation/design.md
- Lines: 1-32
- SHA256: cef8991c3466949fc27a3536b10aeaf67557f75ef3dfab81d6fe70d8848bc471

```md
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
```

## openspec/changes/refine-admin-navigation/tasks.md

- Source: openspec/changes/refine-admin-navigation/tasks.md
- Lines: 1-19
- SHA256: 690183950e1fecfed1bc65c7810c553bc301a6525396dc4c2a31f6eeac62c8cd

```md
## 1. 侧边栏导航模块化

- [ ] 1.1 将 flat `navItems` 改为 `navGroups` 分组结构（工作台/运营管理/数据与设置），渲染 section header + 菜单项

## 2. 侧边栏品牌区优化

- [ ] 2.1 品牌区改为 LH 标识块 + 主标题「蓝辉轻改」+ 副标题「管理后台」

## 3. 侧边栏用户区收敛

- [ ] 3.1 底部用户区改为 compact chip：圆形首字母头像 + 用户名 + 角色 + 退出图标按钮

## 4. 顶栏去重

- [ ] 4.1 顶栏移除用户名，添加「查看官网」链接（新标签页）

## 5. 验证

- [ ] 5.1 `npm run build` 通过，手动确认侧边栏/顶栏视觉效果
```

