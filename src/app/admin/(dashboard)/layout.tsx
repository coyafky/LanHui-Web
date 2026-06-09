import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";

/**
 * Dashboard 路由组布局
 *
 * - auth 守卫：未登录重定向到 /admin/login
 * - 侧边栏 + 主内容区布局
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={session.user.name ?? "用户"} />

      {/* 主内容区 */}
      <div className="flex flex-1 flex-col">
        {/* 顶栏 */}
        <header className="flex h-16 items-center justify-end border-b border-zinc-800 bg-zinc-950 px-6">
          <span className="text-sm text-zinc-400">
            {session.user.name ?? "用户"}
          </span>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 bg-zinc-950 p-6">{children}</main>
      </div>
    </div>
  );
}
