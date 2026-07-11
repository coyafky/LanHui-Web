"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { ErrorFallbackProps } from "@/types/error-boundary";
import { captureClientException } from "@/lib/observability.client";

export function ErrorFallback({
  error,
  reset,
  variant = "public",
}: ErrorFallbackProps) {
  const isProduction = process.env.NODE_ENV === "production";

  useEffect(() => {
    captureClientException(error);
  }, [error]);

  return (
    <div
      role="alert"
      className={`flex min-h-[50vh] items-center justify-center ${
        variant === "admin" ? "bg-zinc-950" : "bg-zinc-950"
      }`}
    >
      <div className="mx-auto max-w-md px-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-orange-500" />
        <h2 className="mt-4 text-xl font-bold text-zinc-100">页面出错了</h2>
        <p className="mt-2 text-sm text-zinc-400">
          {isProduction
            ? "页面加载时发生错误，请稍后重试。"
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
    </div>
  );
}
