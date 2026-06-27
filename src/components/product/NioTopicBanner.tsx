import Link from "next/link";
import { Car, ChevronRight } from "lucide-react";

/**
 * 蔚来 ES8 轻改方案 — /product 入口卡片
 * 主题色：sky（与 brandSlug accentColor 一致；与 wenjie cyan / tesla red 区分）
 * 状态：planned（仅作入口引导；/product/nio/es8 详情页由后续 batch 落 UI）
 * 内容全部 inline，不依赖 nio-products.ts 数据层
 */
export function NioTopicBanner() {
  return (
    <Link
      href="/product/nio/es8"
      className="group block relative overflow-hidden rounded-2xl border border-sky-900/40 bg-zinc-950 p-5 md:p-6 hover:border-sky-700/60 transition-colors"
    >
      <div className="absolute inset-0 -z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-sky-950/30 via-zinc-950 to-zinc-950" />
      </div>
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-950/40 text-amber-400 border border-amber-900/60">
              整理中
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-sky-950/40 text-sky-400 border border-sky-900/60">
              <Car className="w-3 h-3 mr-1" aria-hidden="true" />
              蔚来 ES8
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
              大型纯电 SUV 轻改
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
            蔚来 ES8 专属升级方案
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            新车保护、彩绘双拼、铝地板与底盘防护
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-sky-400 transition-colors flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}