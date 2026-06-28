import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * 极氪 8X 专题入口 Banner（RSC）
 * 用于 /product 产品中心首页入口 → /product/zeekr/8x
 * CollapsibleSection 卡片样式，与 Zeekr9xTopicBanner 一致
 */
export function Zeekr8xTopicBanner() {
  return (
    <Link
      href="/product/zeekr/8x"
      className="group block bg-gradient-to-br from-orange-950/20 via-zinc-900 to-zinc-900 border border-orange-900/40 rounded-2xl p-6 sm:p-8 hover:border-orange-700/60 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-800/60">
              live
            </span>
            <span className="text-xs text-zinc-500">极氪系列</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
            极氪 8X 专属升级方案
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            17 项热门轻改产品，5 大用车场景，5 个推荐组合。
            从漆面保护到智能屏幕，从外观个性到家庭座舱。
          </p>
        </div>
        <ArrowRight className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
