import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { Toaster } from "sonner";

/**
 * Dashboard 路由组布局
 *
 * - auth 守卫：未登录重定向到 /admin/login
 * - 侧边栏 + 主内容区布局
 * - 挂载全局 toast 通知系统
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
      <Sidebar
        userName={session.user.name ?? "用户"}
        userRole={session.user.role}
      />

      {/* 主内容区 */}
      <main id="main-content" tabIndex={-1} className="flex-1 bg-zinc-950 p-6">{children}</main>

      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: "#18181b", color: "#e4e4e7", border: "1px solid #27272a" },
        }}
      />
    </div>
  );
}
