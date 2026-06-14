'use client';
'use memo';

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { brand } from "@/lib/brand";
import { openWeChatModal } from "@/lib/wechat-modal";

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
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight text-white">
            {brand.zh}
          </h1>
          <p className="text-xl md:text-2xl font-bold text-white mb-3 mt-2">
            源头工厂制造能力,新能源车主一站式升级服务
          </p>
          <p className="text-lg md:text-xl text-zinc-300 mb-10 leading-relaxed">
            依托 800 亩制造厂区与轻改产品供应链,蓝辉轻改围绕汽车膜、轮毂、电动踏板、地板总成、改装件等产品,为新能源车主提供车型适配、产品推荐与到店施工服务。
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => openWeChatModal()}
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-900/30 transition-colors"
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              添加企业微信咨询车型方案
            </button>
            <Link
              href="/product"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-lg text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
            >
              查看产品中心
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
