import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * 智界 V9 单车型专题页 — /product 入口卡片
 * SPEC §4：标题「智界 V9 专属升级方案」+ 副标题 + 标签 + 跳转 /product/zhijie/v9
 * 主题色：amber
 * 无预购标签（zhijie V9 不含预售项目）
 *
 * **不**依赖 src/lib/zhijie-v9-products.ts 数据层 —— 文案固化在组件内，
 * 数据层就绪后再考虑是否接入（SPEC §10 风险 8）。
 */
export function ZhijieV9TopicBanner() {
  return (
    <Link
      href="/product/zhijie/v9"
      className="group block relative overflow-hidden rounded-2xl border border-amber-900/40 bg-zinc-950 p-5 md:p-6 hover:border-amber-700/60 transition-colors"
    >
      <div className="absolute inset-0 -z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-zinc-950 to-zinc-950" />
      </div>
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-950/40 text-amber-400 border border-amber-900/60">
              智界 V9 车型专题
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
              单车型轻改方案
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
            智界 V9 专属升级方案
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            14 个项目 / 6 大场景 / 4 大推荐组合 — 新车保护 · 外观个性 · 座舱保护 · 底盘防护 · 屏幕保护 · 外观细节
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-amber-400 transition-colors flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}
