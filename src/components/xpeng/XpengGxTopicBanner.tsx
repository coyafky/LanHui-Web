import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * 小鹏 GX 单车型专题页 — /product 入口卡片
 * SPEC §4：标题「小鹏 GX 专属升级方案」+ 副标题 + 标签 + 跳转 /product/xpeng/gx
 * 主题色：emerald（与 brandSlug accentColor 一致）
 * 标签：整理中 · 即将上线 · 含 1 项预售（电动门）
 *
 * **不**依赖 src/lib/xpeng-gx-products.ts 数据层 —— 文案固化在组件内，
 * 数据层就绪后再考虑是否接入（SPEC §10 风险 8）。
 */
export function XpengGxTopicBanner() {
  return (
    <Link
      href="/product/xpeng/gx"
      className="group block relative overflow-hidden rounded-2xl border border-emerald-900/40 bg-zinc-950 p-5 md:p-6 hover:border-emerald-700/60 transition-colors"
    >
      <div className="absolute inset-0 -z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-zinc-950 to-zinc-950" />
      </div>
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-900/60">
              整理中 · 即将上线
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
              小鹏 GX 车型专题
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
              单车型轻改方案
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-950/40 text-amber-400 border border-amber-900/60">
              含 1 项预售 · 电动门
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
            小鹏 GX 专属升级方案
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            15 个项目 / 6 大场景 / 3 大推荐组合 — 新车保护 · 外观个性 · 电动便利 · 底盘防护 · 屏幕保护 · 座舱维护
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 transition-colors flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}