/**
 * RecommendationCombos — 4 个推荐组合
 *
 * PRD v3 §4.4.2 Tab 3 内容 / §5.2 COMBOS 数据
 * 4 个组合围绕用车场景:
 *  1. 新车基础保护 (shield / cyan)
 *  2. 商务舒适升级 (sofa / emerald)
 *  3. 外观姿态升级 (sparkles / pink)
 *  4. 日常实用防护 (wrench / amber)
 *
 * 设计: 2x2 网格, 每张卡片左 icon + 右侧 title/desc/includes/suitableFor
 * 替换 Phase 3 的 CombosPlaceholder
 */

import { Shield, Sofa, Sparkles, Wrench } from "lucide-react";
import { COMBOS, type ProductCombo } from "@/lib/product-landing";
import { getServiceRoute, getBrandRoute } from "@/lib/product-routes";

const ICON_MAP = {
  shield: Shield,
  sofa: Sofa,
  sparkles: Sparkles,
  wrench: Wrench,
} as const;

const ACCENT_MAP = {
  "new-car-protection": {
    bg: "bg-cyan-950/30",
    border: "border-cyan-800/40",
    text: "text-cyan-300",
    icon: "text-cyan-400",
  },
  "business-comfort": {
    bg: "bg-emerald-950/30",
    border: "border-emerald-800/40",
    text: "text-emerald-300",
    icon: "text-emerald-400",
  },
  "appearance-stance": {
    bg: "bg-pink-950/30",
    border: "border-pink-800/40",
    text: "text-pink-300",
    icon: "text-pink-400",
  },
  "daily-protection": {
    bg: "bg-amber-950/30",
    border: "border-amber-800/40",
    text: "text-amber-300",
    icon: "text-amber-400",
  },
} as const;

export function RecommendationCombos() {
  return (
    <section
      id="combos"
      className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <p className="text-xs tracking-widest text-orange-400 mb-2">
            RECOMMENDATION · 热门升级组合
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            围绕用车场景的升级组合
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            以到店沟通为准。常用组合已纳入服务流程,具体方案欢迎到店。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {COMBOS.map((combo) => (
            <ComboCard key={combo.slug} combo={combo} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ComboCard({ combo }: { combo: ProductCombo }) {
  const Icon = ICON_MAP[combo.iconKey];
  const accent = ACCENT_MAP[combo.slug];

  return (
    <div
      className={`relative block rounded-2xl border ${accent.border} ${accent.bg} p-5 md:p-6 hover:scale-[1.01] transition-transform`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-zinc-900/60 border ${accent.border} flex items-center justify-center`}
        >
          <Icon
            className={`w-6 h-6 md:w-7 md:h-7 ${accent.icon}`}
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`text-lg md:text-xl font-bold ${accent.text}`}>
            {combo.title}
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed mt-1">
            {combo.description}
          </p>
        </div>
      </div>

      {/* 包含项目 + 适用车型 */}
      <div className="mt-4 pt-4 border-t border-zinc-800/60 space-y-3 text-sm">
        <div>
          <p className="text-[10px] tracking-widest text-zinc-500 mb-1.5 uppercase">
            包含项目
          </p>
          <div className="flex flex-wrap gap-1.5">
            {combo.includes.map((slug) => {
              const service = getServiceRoute(slug);
              if (!service) return null;
              return (
                <a
                  key={slug}
                  href={service.canonicalPath}
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs ${accent.text} bg-zinc-900/60 border ${accent.border} hover:bg-zinc-900 transition-colors`}
                >
                  {service.title}
                </a>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-[10px] tracking-widest text-zinc-500 mb-1.5 uppercase">
            适用车型
          </p>
          <div className="flex flex-wrap gap-1.5">
            {combo.suitableFor.map((slug) => {
              const brand = getBrandRoute(slug);
              if (!brand) return null;
              return (
                <a
                  key={slug}
                  href={brand.canonicalPath}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs text-zinc-300 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  {brand.brandName}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
