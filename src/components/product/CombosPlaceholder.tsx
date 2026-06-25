/**
 * CombosPlaceholder — "组合" tab 内容占位
 *
 * Phase 4 会被 RecommendationCombos 替换。当前展示一个简洁的预告,
 * 让移动端 sticky tab 切换有内容、不会空白。
 */

import { Package, Clock } from "lucide-react";

export function CombosPlaceholder() {
  return (
    <section
      id="combos"
      className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <p className="text-xs tracking-widest text-orange-400 mb-2">
            RECOMMENDATION · 热门升级组合
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            围绕用车场景的升级组合
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            以到店沟通为准。常用组合已纳入服务流程,具体方案欢迎到店。
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 md:p-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-950/40 border border-orange-800/40 mb-4">
            <Package className="w-7 h-7 text-orange-300" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            推荐组合即将上线
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto mb-4">
            我们正在准备围绕"上下车·外观·质感·舒适"四大场景的组合方案,持续打磨车主视角的内容。
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            计划随 Phase 4 同步推出
          </div>
        </div>
      </div>
    </section>
  );
}
