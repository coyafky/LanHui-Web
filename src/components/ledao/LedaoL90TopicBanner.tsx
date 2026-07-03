import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * 乐道 L90 单车型专题页 — /product 入口卡片
 * 主题色：blue
 */
export function LedaoL90TopicBanner() {
  return (
    <Link
      href="/product/ledao/l90"
      className="group block relative overflow-hidden rounded-2xl border border-blue-900/40 bg-zinc-950 p-5 md:p-6 hover:border-blue-700/60 transition-colors"
    >
      <div className="absolute inset-0 -z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-zinc-950 to-zinc-950" />
      </div>
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-950/40 text-blue-400 border border-blue-900/60">
              乐道 L90 车型专题
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
              单车型轻改方案
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
            乐道 L90 专属升级方案
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            21 个重点项目 / 17 个更多选择 / 7 大场景 — 车衣、隔热膜、铝地板、底盘护板、电动踏板与家庭出行升级
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}
