import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { brand } from "@/lib/brand";

export function Hero() {
  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden">
      {/* Background gradient + blue/orange accent shapes */}
      <div
        className="absolute inset-0 z-0"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-zinc-950 to-zinc-950" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-700/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-orange-500/15 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-40">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/50 text-blue-300 text-xs tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            {brand.en} · 汽车轻改装
          </p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
            {brand.zh}
            <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
              让爱车更有型，也更好用
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 mb-10 leading-relaxed">
            专注汽车轻改装与车身膜服务，覆盖电动踏板、轮毂升级、底盘升级、窗膜、改色膜与隐形车衣，为车主提供从外观到功能的一站式升级方案。
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/product"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-900/30 transition-colors"
            >
              浏览产品
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/agent"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-lg text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
            >
              <MapPin className="mr-2 w-5 h-5 text-orange-400" />
              预约{brand.currentStore}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
