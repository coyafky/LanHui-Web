import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";

export function CarCareHero({ breadcrumbItems }: { breadcrumbItems?: readonly BreadcrumbItem[] }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950/60 via-zinc-950 to-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-700/50 bg-emerald-950/40 text-emerald-300 text-xs tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              CAR CARE — 洗美养护
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              专业洗美养护
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
              覆盖车身外部精洗与内饰深度清洁两大服务线，从日常通勤到商务接待，为您的爱车提供细致、环保、可追溯的洗美养护体验。
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-all duration-200"
              >
                联系预约
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#services"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-200 font-medium transition-all duration-200"
              >
                查看服务详情
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-full aspect-[4/3] rounded-2xl border border-emerald-900/30 bg-emerald-950/20 flex items-center justify-center">
              <div className="text-center text-zinc-600">
                <div className="text-6xl mb-4 opacity-30">🚗</div>
                <p className="text-sm">洗美养护视觉</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
