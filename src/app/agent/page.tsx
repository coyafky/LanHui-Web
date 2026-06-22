import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Store as StoreIcon,
  Building2,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getProvinces, getStores } from "@/lib/data";
import { StoreCard } from "@/components/agent/StoreCard";
import { sortStoresByLevel } from "@/components/agent/sort-stores";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "全国门店网络 | 蓝辉轻改 LANHUI",
  description:
    "寻找离您最近的蓝辉轻改门店，体验专业施工服务。覆盖广东、江苏、浙江等多个省份。",
};

export default async function AgentPage() {
  const provinces = await getProvinces();
  const stores = sortStoresByLevel(await getStores());
  const totalStores = stores.length;
  const totalProvinces = provinces.length;

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        {/* ── Hero Section ── */}
        <section className="relative bg-zinc-950 text-white overflow-hidden">
          <div className="absolute inset-0 -z-0" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-zinc-950 to-zinc-950" />
            <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-orange-600/15 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-700/10 blur-[80px]" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 text-center">
            <p className="text-sm tracking-[0.2em] text-orange-400 mb-4 font-medium">
              STORES
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight">
              全国门店网络
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              寻找离您最近的蓝辉轻改门店，体验专业施工服务
            </p>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-full">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-sm text-zinc-300">
                {totalProvinces} 个省份 · {totalStores} 家门店
              </span>
            </div>
          </div>
        </section>

        {/* ── 按省份浏览 Section ── */}
        <section className="py-16 md:py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-10">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-500/10">
                <MapPin className="w-5 h-5 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">按省份浏览</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {provinces.map((p) => (
                <Link
                  key={p.slug}
                  href={`/agent/${p.slug}`}
                  className="group relative flex items-center justify-between px-6 py-5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-800/80 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                      <MapPin className="w-5 h-5 text-zinc-500 group-hover:text-orange-400 transition-colors" />
                    </div>
                    <span className="text-lg text-white font-semibold">
                      {p.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 text-xs font-medium bg-orange-950/40 border border-orange-800/50 text-orange-300 rounded-md">
                      {p.storeCount} 家门店
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── 已开放门店 Section ── */}
        <section className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-500/10">
                  <StoreIcon className="w-5 h-5 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">已开放门店</h2>
              </div>
              <p className="text-xs text-zinc-500 hidden sm:block">
                按门店等级排序 · 旗舰优先
              </p>
            </div>
            {stores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((s) => (
                  <StoreCard key={s.id} store={s} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 rounded-2xl border border-zinc-800 bg-zinc-900">
                <Building2 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400">暂无已开放门店。</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}