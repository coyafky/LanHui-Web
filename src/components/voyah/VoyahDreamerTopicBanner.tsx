import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * 岚图梦想家单车型专题页 — /product 入口卡片
 * 主题色：violet
 * 无预购标签（Voyah Dreamer 不含预售项目）
 */
export function VoyahDreamerTopicBanner() {
  return (
    <Link
      href="/product/voyah/dreamer"
      className="group block relative overflow-hidden rounded-2xl border border-violet-900/40 bg-zinc-950 p-5 md:p-6 hover:border-violet-700/60 transition-colors"
    >
      <div className="absolute inset-0 -z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-zinc-950 to-zinc-950" />
      </div>
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-violet-950/40 text-violet-400 border border-violet-900/60">
              岚图梦想家 车型专题
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
              单车型轻改方案
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">
            岚图梦想家专属升级方案
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            17 个项目 / 5 大场景 — 新车保护 · 外观个性 · 底盘与行车防护 · MPV 后排舒适 · 座舱维护
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-violet-400 transition-colors flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}
