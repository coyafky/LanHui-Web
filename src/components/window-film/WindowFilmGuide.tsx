import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { windowFilmGuideItems } from "@/lib/window-film-details";

/**
 * PRD §6.3 — "按你的用车需求选套餐"导购模块
 *
 * 7 张卡片网格，每张卡片：用户需求 → 推荐套餐 → 详情链接
 * 桌面 2 列 / 平板 2 列 / 移动 1 列
 */
export function WindowFilmGuide() {
  return (
    <section className="py-16 bg-zinc-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs tracking-widest mb-3 text-orange-400 uppercase">
            选择导购
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            按你的用车需求选套餐
          </h2>
          <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
            从真实用车场景出发，先看自己关心什么，再选最贴近的那一档。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {windowFilmGuideItems.map((item) => (
            <Link
              key={item.packageSlug}
              href={`/product/window-film/${item.packageSlug}`}
              className="group block rounded-xl bg-zinc-900/60 border border-white/5 p-5 sm:p-6 hover:border-orange-500/40 hover:bg-zinc-900 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
                    {item.need}
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {item.packageName}
                  </p>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                    {item.recommendation}
                  </p>
                </div>
                <span
                  className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 transition-colors"
                  aria-hidden
                >
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
