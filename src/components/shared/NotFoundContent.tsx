import Link from "next/link";
import { FileQuestion } from "lucide-react";
import type { NotFoundContentProps } from "@/types/error-boundary";

export function NotFoundContent({ area = "public" }: NotFoundContentProps) {
  if (area === "admin") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-zinc-950">
        <div className="mx-auto max-w-md px-6 text-center">
          <FileQuestion className="mx-auto h-12 w-12 text-orange-500" />
          <h1 className="mt-4 text-6xl font-bold text-zinc-100">404</h1>
          <p className="mt-2 text-sm text-zinc-400">
            页面未找到，请检查链接是否正确。
          </p>
          <div className="mt-6">
            <Link
              href="/admin"
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              返回仪表盘
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-zinc-950">
      <div className="mx-auto max-w-md px-6 text-center">
        <FileQuestion className="mx-auto h-12 w-12 text-orange-500" />
        <h1 className="mt-4 text-6xl font-bold text-zinc-100">404</h1>
        <p className="mt-2 text-sm text-zinc-400">
          您访问的页面不存在或已被移除。
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            返回首页
          </Link>
          <Link
            href="/product"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            产品中心
          </Link>
          <Link
            href="/agent"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            门店网络
          </Link>
        </div>
      </div>
    </div>
  );
}
