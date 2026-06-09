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
import { brand } from "@/lib/brand";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "门店管理", href: "/admin/stores", icon: Store },
  { label: "文章管理", href: "/admin/articles", icon: FileText },
  { label: "数据分析", href: "/admin/analytics", icon: BarChart3 },
  { label: "系统设置", href: "/admin/settings", icon: Settings },
] as const;

interface SidebarProps {
  userName: string;
}

export function Sidebar({ userName }: SidebarProps) {
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
        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-6">
          <Link
            href="/admin"
            className="text-lg font-bold text-zinc-100"
            onClick={() => setMobileOpen(false)}
          >
            {brand.zh}
            <span className="ml-1.5 text-xs font-normal text-zinc-500">
              管理后台
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 text-zinc-400 hover:text-white lg:hidden"
            aria-label="关闭菜单"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 导航 */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
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
        </nav>

        {/* 用户 & 退出 */}
        <div className="border-t border-zinc-800 p-4">
          <div className="mb-3 truncate text-sm text-zinc-400">
            {userName}
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            退出登录
          </button>
        </div>
      </aside>
    </>
  );
}
