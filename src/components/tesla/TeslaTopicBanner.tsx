import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * 特斯拉系列轻改项目 — /product 入口卡片
 * PRD §4：标题「特斯拉系列轻改项目」+ 副标题 + 标签 + 跳转 /product/tesla
 * 主题色：red（与 brandSlug accentColor 一致）
 */
export function TeslaTopicBanner() {
  return (
    <Link
      href="/product/tesla"
      className="group block relative overflow-hidden rounded-2xl border border-red-900/40 bg-zinc-950 p-5 md:p-6 hover:border-red-700/60 transition-colors"
    >
      <div className="absolute inset-0 -z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-zinc-950 to-zinc-950" />
      </div>
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-950/40 text-red-400 border border-red-900/60">
              整理中 · 即将上线
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
              Tesla 车型专题
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
              新能源轻改方案
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
            特斯拉系列轻改项目
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            车衣、隔热膜、改色膜、座舱舒适与电动便利升级
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-red-400 transition-colors flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}