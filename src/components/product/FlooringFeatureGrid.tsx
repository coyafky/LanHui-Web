import { Sparkles, Droplets, Layers, ArrowRightLeft, Palette, Footprints, Package } from "lucide-react";
import type { ComponentType } from "react";
import {
  flooringSellingPoints,
  type FlooringSellingPointId,
} from "@/lib/flooring-products";

const ICON_MAP: Record<FlooringSellingPointId, ComponentType<{ className?: string }>> = {
  "model-fitment": Footprints,
  "color-match": Palette,
  "floor-rail-integration": Layers,
  "door-step-comfort": ArrowRightLeft,
  "trunk-continuity": Package,
  "easy-care": Droplets,
  "premium-cabin": Sparkles,
};

export function FlooringFeatureGrid() {
  return (
    <section className="py-16 md:py-20 bg-zinc-950 border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-sm tracking-widest text-amber-400 mb-3">
            FLOORING HIGHLIGHTS
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            地板改装能解决什么问题
          </h2>
          <p className="text-zinc-400 mt-3 max-w-2xl mx-auto">
            围绕后排空间、滑轨、脚踏和尾箱区域，用七条核心卖点说明地板总成的整体价值。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {flooringSellingPoints.map((sp) => {
            const Icon = ICON_MAP[sp.id];
            return (
              <div
                key={sp.id}
                className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 hover:border-amber-700/60 transition-colors"
              >
                <div className="w-11 h-11 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  {sp.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {sp.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}