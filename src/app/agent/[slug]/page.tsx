import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  getProvince,
  getAllProvinceSlugs,
  getStoresByProvince,
  cities,
} from "@/lib/store";

export function generateStaticParams() {
  return getAllProvinceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const province = getProvince(slug);
  if (!province) return { title: "门店详情 | 蓝辉轻改 LANHUI" };
  return {
    title: `${province.label}门店 | 蓝辉轻改 LANHUI`,
    description: `蓝辉轻改在 ${province.label} 的门店信息。`,
  };
}

export default async function ProvincePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const province = getProvince(slug);
  if (!province) notFound();
  const stores = getStoresByProvince(slug);

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        <section className="bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
            <nav className="flex items-center text-sm text-zinc-500 mb-6 flex-wrap">
              <Link href="/agent" className="hover:text-white transition-colors">
                门店服务
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-zinc-300">{province.label}</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {province.label}门店
            </h1>
            <p className="text-base md:text-lg text-zinc-400">
              当前在
              <span className="text-orange-400 font-semibold mx-1">
                {province.label}
              </span>
              已开放
              <span className="text-orange-400 font-semibold mx-1">
                {province.storeCount}
              </span>
              家蓝辉轻改门店。
            </p>
          </div>
        </section>

        <section className="py-12 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold text-white mb-8 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-400" />
              按城市浏览
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {cities.filter((c) => c.province === slug).length > 0 ? (
                cities
                  .filter((c) => c.province === slug)
                  .map((c) => (
                    <Link
                      key={c.slug}
                      href={`/agent/${province.slug}/${c.slug}`}
                      className="flex items-center justify-between px-4 py-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 hover:bg-zinc-800 transition-colors"
                    >
                      <span className="text-base text-white font-medium">
                        {c.label}
                      </span>
                      <span className="ml-2 px-2 py-0.5 text-xs bg-blue-950/40 border border-blue-800/50 text-blue-300 rounded-md">
                        {c.storeCount} 家
                      </span>
                    </Link>
                  ))
              ) : (
                <p className="text-zinc-500 text-sm">该省份暂无已开放城市。</p>
              )}
            </div>
          </div>
        </section>

        {stores.length > 0 && (
          <section className="py-12 bg-black border-t border-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl font-semibold text-white mb-8">省内门店</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((s) => (
                  <Link
                    key={s.id}
                    href={`/agent/store/${s.id}`}
                    className="group block bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 p-6 transition-all"
                  >
                    <h3 className="text-lg font-bold text-white mb-2">
                      {s.name}
                    </h3>
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
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
