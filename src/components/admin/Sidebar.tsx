"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    title: "工作台",
    items: [
      { label: "仪表盘", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "运营管理",
    items: [
      { label: "门店管理", href: "/admin/stores", icon: Store },
      { label: "文章管理", href: "/admin/articles", icon: FileText },
    ],
  },
  {
    title: "数据与设置",
    items: [
      { label: "数据分析", href: "/admin/analytics", icon: BarChart3 },
      { label: "系统设置", href: "/admin/settings", icon: Settings },
    ],
  },
] as const;

interface SidebarProps {
  userName: string;
  userRole?: string;
}

export function Sidebar({ userName, userRole }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  async function handleSignOut() {
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <>
      {/* 移动端汉堡按钮 */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-zinc-800 p-2 text-zinc-400 hover:text-white lg:hidden"
        aria-label="打开菜单"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* 遮罩层 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-zinc-900 transition-transform duration-200 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* 品牌 */}
        <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-5">
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 text-xs font-bold text-orange-400"
          >
            LH
          </Link>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-100">
              蓝辉轻改
            </span>
            <span className="text-xs text-zinc-500">管理后台</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-lg p-1 text-zinc-400 hover:text-white lg:hidden"
            aria-label="关闭菜单"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 导航 */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navGroups.map((group, gi) => (
            <div key={group.title} className={gi > 0 ? "mt-6" : ""}>
              <div className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                {group.title}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-orange-500/10 text-orange-500"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* 查看官网 */}
        <div className="border-t border-zinc-800/70 px-4 py-2.5">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
          >
            查看官网 →
          </Link>
        </div>

        {/* 用户区 */}
        <div className="flex items-center gap-3 border-t border-zinc-800/70 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-400">
            {userName.charAt(0) || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-zinc-300">{userName}</div>
            <div className="text-xs text-zinc-500">
              {userRole ?? "管理员"}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg p-1.5 text-zinc-600 transition-colors hover:text-zinc-300"
            aria-label="退出登录"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
