---
comet_change: refine-admin-navigation
role: technical-design
canonical_spec: openspec
archived-with: 2026-07-07-refine-admin-navigation
status: final
---

# 管理后台导航体验优化

## 架构

```
layout.tsx (RSC)
├── Sidebar.tsx (CC)         ← 品牌 + 导航分组 + 查看官网 + 用户区
│   ├── 品牌区 (LH标识块)
│   ├── 导航分组 (3组)
│   ├── 查看官网链接
│   └── 用户 Chip
└── <main>                   ← 页面内容（移除header后直接占据剩余空间）
```

## 当前数据流

```
auth() → session.user.name → Sidebar userName prop
auth() → session.user.name → layout.tsx header (本次移除)
```

新增数据传递：

```
auth() → session.user.role → Sidebar userRole prop (fallback "管理员")
```

## 组件职责

### Sidebar (`src/components/admin/Sidebar.tsx`)

Props 扩展：

```ts
interface SidebarProps {
  userName: string;
  userRole?: string;  // 新增
}
```

内部结构（从上到下）：

1. **品牌区** — LH 标识 + 蓝辉轻改 + 管理后台，h-16
2. **导航** — 三组 navGroups，每组含 section title + items
3. **spacer** — flex-1 推底
4. **查看官网** — Link href="/" target="_blank"，border-t 分隔
5. **用户区** — avatar + 用户名 + role + LogOut 按钮，border-t 分隔

### DashboardLayout (`src/app/admin/(dashboard)/layout.tsx`)

改动：删除 `<header>` 整块，`<main>` 直接从 `flex-1` 占据剩余空间。

## 视觉规范

| 区域 | 关键样式 |
|------|---------|
| 品牌标识 | `h-9 w-9 rounded-xl bg-orange-500/10 border border-orange-500/20` |
| 品牌主标题 | `text-sm font-semibold text-zinc-100` |
| 品牌副标题 | `text-xs text-zinc-500` |
| 导航 section title | `text-[11px] tracking-wider text-zinc-600` |
| 导航 item active | `bg-orange-500/10 text-orange-500` |
| 导航 item idle | `text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200` |
| 用户 avatar | `h-8 w-8 rounded-full bg-zinc-800` |
| 退出按钮 | `text-zinc-600 hover:text-zinc-300` |
| 查看官网 | `text-xs text-zinc-500 hover:text-zinc-300` |
| 分隔线 | `border-t border-zinc-800` / `border-zinc-800/70` |

## 移动端

现有 hamburger/遮罩/点击关闭逻辑完全不变。分组结构和 compact 用户区在移动端自动适配（flex-col 侧边栏内正常排列）。
