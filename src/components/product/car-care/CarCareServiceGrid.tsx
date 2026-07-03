import { carCareServices } from "@/lib/car-care-products";
import type { CarCareServiceItem } from "@/lib/car-care-products";
import { Check } from "lucide-react";

function ServiceCard({
  title,
  subtitle,
  description,
  highlights,
}: CarCareServiceItem) {
  return (
    <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800 p-8">
      <p className="text-xs tracking-widest text-emerald-400 mb-2">
        {subtitle}
      </p>
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed mb-6">
        {description}
      </p>
      <ul className="space-y-3">
        {highlights.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 text-sm text-zinc-300"
          >
            <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CarCareServiceGrid() {
  return (
    <section id="services" className="py-20 bg-black border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm tracking-widest text-emerald-400 mb-3">
            SERVICES
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            洗美服务项目
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            从外部精洗到内饰深度清洁，覆盖日常养护与深层护理全场景。
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {carCareServices.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}
