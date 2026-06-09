import type { Metadata } from "next";
import Link from "next/link";
import { Search, MapPin, Store as StoreIcon, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { provinces, stores } from "@/lib/store";

export const metadata: Metadata = {
  title: "门店服务 | 蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改当前服务门店为顺德大良店，更多城市门店正在筹备中。",
};

export default function AgentPage() {
  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        {/* Hero */}
        <section className="relative bg-zinc-950 text-white overflow-hidden">
          <div className="absolute inset-0 -z-0" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-zinc-950 to-zinc-950" />
            <div className="absolute -top-32 right-0 w-96 h-96 rounded-full bg-blue-700/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-orange-500/15 blur-3xl" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
            <p className="text-sm tracking-widest text-orange-400 mb-3">STORES</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">门店服务</h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
              蓝辉轻改从顺德大良出发，门店网络正在建设中。
            </p>
          </div>
        </section>

        {/* Search (placeholder) */}
        <section className="bg-black pb-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="输入城市或门店名称搜索..."
                className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                disabled
              />
            </div>
            <p className="text-xs text-zinc-600 mt-2 text-center">
              搜索功能正在筹备中，当前可浏览以下已开放区域。
            </p>
          </div>
        </section>

        {/* Province grid */}
        <section className="py-12 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold text-white mb-8 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-400" />
              按省份浏览
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {provinces.map((p) => (
                <Link
                  key={p.slug}
                  href={`/agent/${p.slug}`}
                  className="flex items-center justify-between px-4 py-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-base text-white font-medium">
                    {p.label}
                  </span>
                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-950/40 border border-blue-800/50 text-blue-300 rounded-md">
                    {p.storeCount} 家
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Active stores */}
        <section className="py-12 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8 gap-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <StoreIcon className="w-5 h-5 text-orange-400" />
                当前已开放门店
              </h2>
              <p className="text-xs text-zinc-500">真实数据 · 持续更新</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((s) => (
                <Link
                  key={s.id}
                  href={`/agent/store/${s.id}`}
                  className="group block bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 p-6 transition-all"
                >
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
                    <span className="px-2 py-0.5 bg-blue-950/40 border border-blue-800/50 text-blue-300 rounded">
                      {s.provinceLabel}
                    </span>
                    <span className="px-2 py-0.5 bg-orange-950/40 border border-orange-800/50 text-orange-300 rounded">
                      {s.cityLabel}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{s.name}</h3>
                  <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                    {s.address}
                  </p>
                  <span className="text-orange-400 text-sm font-medium inline-flex items-center">
                    查看详情
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
            <p className="mt-8 text-sm text-zinc-500 text-center">
              更多城市门店陆续开放中，您可以关注品牌资讯获取最新进展。
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
