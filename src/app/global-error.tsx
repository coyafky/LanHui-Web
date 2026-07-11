"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { brand } from "@/lib/brand";
import { captureClientException } from "@/lib/observability.client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isProduction = process.env.NODE_ENV === "production";

  useEffect(() => {
    captureClientException(error);
  }, [error]);

  return (
    <html lang="zh-CN" className="h-full antialiased dark">
      <body className="flex min-h-full flex-col items-center justify-center bg-zinc-950 text-white">
        <div className="mx-auto max-w-md px-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-orange-500" />
          <h1 className="mt-4 text-xl font-bold text-zinc-100">
            {brand.zh} · 系统错误
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {isProduction
              ? "系统发生严重错误，请稍后重试。"
              : error.message || "发生未知错误"}
          </p>
          {!isProduction && error.digest && (
            <p className="mt-1 font-mono text-xs text-zinc-600">
              Digest: {error.digest}
            </p>
          )}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              重试
            </button>
            <Link
              href="/"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              返回首页
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
