import { Box, MoveHorizontal, Footprints, Lightbulb, Package } from "lucide-react";
import { flooringFunctions } from "@/lib/flooring-products";

const ICON_MAP = {
  "main-floor-board": Box,
  "rail-trim": MoveHorizontal,
  "door-sill-step": Footprints,
  "foot-rest": Lightbulb,
  "trunk-floor": Package,
} as const;

export function FlooringStructureGrid() {
  return (
    <section className="py-16 md:py-20 bg-black border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-sm tracking-widest text-amber-400 mb-3">
            STRUCTURE
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            地板总成的 5 个组成部分
          </h2>
          <p className="text-zinc-400 mt-3 max-w-2xl mx-auto">
            地板改装通常由多个组件共同呈现，本页只展示画册可见的组件名称与中性说明。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {flooringFunctions.map((f) => {
            const Icon = ICON_MAP[f.id];
            return (
              <div
                key={f.id}
                className="bg-zinc-900/60 rounded-2xl border border-zinc-800 p-5 text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-400 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{f.name}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}