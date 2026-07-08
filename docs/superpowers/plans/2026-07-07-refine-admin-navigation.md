---
change: refine-admin-navigation
design-doc: docs/superpowers/specs/2026-07-07-refine-admin-navigation-design.md
base-ref: a3bd355fa7175f240da7301557dfadce007c4fee
archived-with: 2026-07-07-refine-admin-navigation
---

# 实施计划：refine-admin-navigation

## 任务 1：侧边栏导航模块化

- 将 `navItems` flat array 改为 `navGroups` 分组结构
- 三组：工作台（仪表盘）/ 运营管理（门店管理、文章管理）/ 数据与设置（数据分析、系统设置）
- 渲染 section header：`text-[11px] tracking-wider text-zinc-600 uppercase`
- 首组不加 `mt-4`
- 验证：`npm run build`

## 任务 2：品牌区精化

- 当前行内品牌文字改为 LH 标识块 + 主副标题布局
- 标识：`h-9 w-9 rounded-xl bg-orange-500/10 border border-orange-500/20`
- 主标题：`text-sm font-semibold text-zinc-100`
- 副标题：`text-xs text-zinc-500`
- 验证：`npm run build`

## 任务 3：用户区收敛 + 查看官网

- 底部用户区块改为 compact chip：圆形首字母头像 + 用户名 + role + 退出图标按钮
- 用户区上方加「查看官网」链接，`border-t border-zinc-800/70` 分隔
- 退出图标按钮：`aria-label="退出登录"`，`text-zinc-600 hover:text-zinc-300`
- 传递 `userRole` prop（来自 `session.user.role`，fallback `"管理员"`）
- 验证：`npm run build`

## 任务 4：顶栏去重

- `layout.tsx` 删除整个 `<header>` 块
- `main` 变为 `flex-1` 直接占据空间
- 传递 `userRole` 给 `Sidebar`
- 验证：`npm run build`

## 任务 5：验证

- `npm run build` 通过
- 手动确认侧边栏视觉效果
