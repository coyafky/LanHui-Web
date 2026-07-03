import { Droplets, Sparkles, Leaf, Clock } from "lucide-react";
import { carCareValues } from "@/lib/car-care-products";
import type { CarCareValue } from "@/lib/car-care-products";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Droplets,
  Sparkles,
  Leaf,
  Clock,
};

function ValueCard({ icon, title, description }: CarCareValue) {
  const Icon = ICON_MAP[icon];
  return (
    <div className="group bg-zinc-900/60 rounded-2xl border border-zinc-800 hover:border-emerald-800/60 p-6 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center mb-4 group-hover:bg-emerald-900/60 transition-colors">
        {Icon && <Icon className="w-6 h-6 text-emerald-400" />}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

export function CarCareValueGrid() {
  return (
    <section className="py-20 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm tracking-widest text-emerald-400 mb-3">
            WHY CAR CARE
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            为什么选择蓝辉洗美
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            专业设备、环保用料、严格流程，为每台车提供可追溯的洗美养护服务。
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {carCareValues.map((value) => (
            <ValueCard key={value.id} {...value} />
          ))}
        </div>
      </div>
    </section>
  );
}
