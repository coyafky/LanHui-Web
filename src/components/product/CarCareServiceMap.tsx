import Link from "next/link";
import { ArrowRight, Droplets } from "lucide-react";
import type { ServiceRoute } from "@/lib/product-routes";

type Props = { services: readonly ServiceRoute[] };

export function CarCareServiceMap({ services }: Props) {
  if (services.length === 0) return null;
  const service = services[0]!;
  return (
    <section className="rounded-2xl border border-emerald-900/30 bg-gradient-to-br from-emerald-950/20 to-zinc-950 overflow-hidden">
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-14 h-14 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center shrink-0">
          <Droplets className="w-7 h-7 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs tracking-widest text-emerald-400 mb-1">CAR CARE</p>
          <h3 className="text-xl md:text-2xl font-bold text-white">{service.title}</h3>
          <p className="text-sm text-zinc-400 mt-1">
            专业洗车与内饰深度清洁，日常养护到轻改装贴膜全覆盖，一条龙服务更省心。
          </p>
        </div>
        <Link href={service.canonicalPath} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all duration-200 shrink-0">
          查看详情<ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
