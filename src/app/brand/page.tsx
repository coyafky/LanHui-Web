import type { Metadata } from "next";
import {
  Wrench,
  MapPin,
  Sparkles,
  Car,
  Calendar,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "品牌介绍 | 蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改成立于 2026 年，从顺德大良出发，专注汽车轻改装与膜类服务，提供兼顾颜值、功能与保护的升级方案。",
};

const VALUES = [
  {
    icon: Sparkles,
    title: "轻量升级",
    description: "在不动原车结构与日常使用习惯的前提下，给车辆带来更清晰的功能与颜值提升。",
  },
  {
    icon: Wrench,
    title: "实用优先",
    description: "升级方案围绕用车场景展开，不为噱头买单，注重长期使用体验。",
  },
  {
    icon: Car,
    title: "审美表达",
    description: "尊重原车风格，给车主提供差异化的轻改与膜系表达空间。",
  },
];

export default function BrandPage() {
  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        {/* Hero */}
        <section className="relative bg-zinc-950 text-white overflow-hidden">
          <div className="absolute inset-0 -z-0" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-zinc-950 to-zinc-950" />
            <div className="absolute -top-32 left-1/3 w-96 h-96 rounded-full bg-blue-700/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-orange-500/15 blur-3xl" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
            <p className="text-sm tracking-widest text-orange-400 mb-3">ABOUT</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">品牌介绍</h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
              {brand.zh} {brand.en} · {brand.foundedYear} 年成立
            </p>
          </div>
        </section>

        {/* About */}
        <section className="py-20 bg-zinc-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-sm text-blue-400 font-medium uppercase tracking-widest mb-3">
                About {brand.en}
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold text-white">
                关于蓝辉轻改
              </h3>
            </div>
            <div className="space-y-6 text-zinc-300 leading-relaxed text-base md:text-lg">
              <p>
                蓝辉轻改（{brand.en}）是一家面向汽车轻改装与汽车膜服务的品牌，于
                <span className="text-orange-400 font-semibold mx-1">
                  {brand.foundedYear} 年
                </span>
                成立，从
                <span className="text-blue-400 font-semibold mx-1">
                  顺德大良
                </span>
                出发。
              </p>
              <p>
                我们的目标很简单：为车主提供兼顾颜值、功能与漆面保护的升级方案。无论是电动踏板、轮毂升级、底盘升级这样的轻改装备，还是汽车窗膜、改色膜、隐形车衣这样的汽车膜系服务，蓝辉轻改都希望让流程更清晰、交付更稳妥。
              </p>
              <p>
                当前阶段，我们以
                <span className="text-blue-400 font-semibold mx-1">
                  {brand.currentStore}
                </span>
                为线下服务中心，强调到店沟通、车型确认、规范施工与交付。更多城市门店正在筹备中。
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-black border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">品牌理念</h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                我们相信&ldquo;轻量、实用、有审美&rdquo;的升级方式更适合大多数车主。
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {VALUES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all"
                >
                  <div className="w-14 h-14 bg-blue-950/40 border border-blue-800/50 text-blue-400 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 起点 */}
        <section className="py-20 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">发展起点</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-orange-400" />
                  <span className="text-orange-400 text-sm tracking-widest">
                    {brand.foundedYear}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">品牌成立</h3>
                <p className="text-zinc-400 leading-relaxed">
                  蓝辉轻改于 {brand.foundedYear} 年正式成立，从汽车轻改装与汽车膜服务切入。
                </p>
              </div>
              <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-blue-400" />
                  <span className="text-blue-400 text-sm tracking-widest">
                    SHUNDE
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">顺德大良店启航</h3>
                <p className="text-zinc-400 leading-relaxed">
                  {brand.currentStore} 是当前唯一的线下服务中心，提供到店沟通、施工交付与售后跟进。
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
