import type { LoadingSpinnerProps } from "@/types/error-boundary";

export function LoadingSpinner({
  message = "加载中...",
  variant = "public",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex min-h-[50vh] items-center justify-center ${
        variant === "admin" ? "bg-zinc-950" : "bg-zinc-950"
      }`}
    >
      <div className="text-center" role="status">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-orange-500" />
        <p className="mt-4 text-sm text-zinc-400">{message}</p>
        <span className="sr-only">{message}</span>
      </div>
    </div>
  );
}
