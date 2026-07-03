import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { carCareProcess } from "@/lib/car-care-products";

export function CarCareServiceFlow() {
  return (
    <section className="py-20 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm tracking-widest text-emerald-400 mb-3">
            SERVICE FLOW
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            到店施工流程
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            标准化施工流程，每一步可追溯，确保交付质量。
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {carCareProcess.map((step) => (
            <div
              key={step.step}
              className="relative bg-zinc-900/60 rounded-2xl border border-zinc-800 p-6"
            >
              <div className="text-4xl font-bold text-emerald-500/20 mb-4 select-none">
                {step.step}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center bg-gradient-to-r from-emerald-950/40 to-zinc-950 border border-emerald-900/30 rounded-2xl p-10">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
            联系蓝辉轻改
          </h3>
          <p className="text-zinc-400 mb-6 max-w-lg mx-auto">
            预约到店或咨询洗美养护方案，专业顾问一对一服务。
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-all duration-200"
          >
            立即预约
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
