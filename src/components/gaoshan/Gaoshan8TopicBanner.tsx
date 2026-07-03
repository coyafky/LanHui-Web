import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * 高山 8 单车型专题页 — /product 入口卡片
 * 主题色：teal
 * 无预购标签（Gaoshan 8 不含预售项目）
 */
export function Gaoshan8TopicBanner() {
  return (
    <Link
      href="/product/gaoshan/8"
      className="group block relative overflow-hidden rounded-2xl border border-teal-900/40 bg-zinc-950 p-5 md:p-6 hover:border-teal-700/60 transition-colors"
    >
      <div className="absolute inset-0 -z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950/20 via-zinc-950 to-zinc-950" />
      </div>
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-teal-950/40 text-teal-400 border border-teal-900/60">
              高山 8 车型专题
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
              单车型轻改方案
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">
            高山 8 专属升级方案
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            23 个项目 / 7 大场景 — 新车保护 · 商务外观 · 外观个性 · MPV 后排舒适 · 底盘与行车防护 · 智能与屏幕保护 · 座舱维护
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-teal-400 transition-colors flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}
