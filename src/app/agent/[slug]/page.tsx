import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  MapPin,
  Building2,
  Store as StoreIcon,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  getProvinceBySlug,
  getStores,
  getCities,
  getAllProvinceSlugs,
} from "@/lib/data";
import { generateBreadcrumbSchema } from "@/lib/geo";
import { StoreCard } from "@/components/agent/StoreCard";
import { sortStoresByLevel } from "@/components/agent/sort-stores";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllProvinceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const province = await getProvinceBySlug(slug);
  if (!province) return { title: "门店详情 | 蓝辉轻改 LANHUI" };
  return {
    title: `${province.label}门店 | 蓝辉轻改 LANHUI`,
    description: `蓝辉轻改在 ${province.label} 的门店信息，覆盖 ${province.cityCount} 个城市。`,
  };
}

export default async function ProvincePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const province = await getProvinceBySlug(slug);
  if (!province) notFound();
  const storesInProvince = sortStoresByLevel(
    await getStores({ province: slug }),
  );
  const citiesInProvince = await getCities(slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: "首页", url: "/" },
              { name: "全国门店", url: "/agent" },
              { name: province.label, url: `/agent/${province.slug}` },
            ])
          ),
        }}
      />
      <Header />
      <main className="flex-grow flex flex-col">
        {/* ── 面包屑 + Hero ── */}
        <section className="relative bg-zinc-950 text-white overflow-hidden">
          <div className="absolute inset-0 -z-0" aria-hidden="true">
            <div className="absolute -top-32 right-0 w-[400px] h-[400px] rounded-full bg-orange-600/10 blur-[80px]" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-14">
            <nav className="flex items-center text-sm text-zinc-500 mb-8 flex-wrap gap-y-1">
              <Link
                href="/"
                className="hover:text-white transition-colors"
              >
                首页
              </Link>
              <ChevronRight className="w-4 h-4 mx-1.5" />
              <Link
                href="/agent"
                className="hover:text-white transition-colors"
              >
                全国门店
              </Link>
              <ChevronRight className="w-4 h-4 mx-1.5" />
              <span className="text-zinc-300">{province.label}</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
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
              家门店，覆盖
              <span className="text-orange-400 font-semibold mx-1">
                {province.cityCount}
              </span>
              个城市
            </p>
          </div>
        </section>

        {/* ── 按城市浏览 ── */}
        <section className="py-12 md:py-16 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-500/10">
                <MapPin className="w-5 h-5 text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-white">按城市浏览</h2>
            </div>
            {citiesInProvince.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {citiesInProvince.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/agent/${province.slug}/${c.slug}`}
                    className="group flex items-center justify-between px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-800/80 transition-all duration-200"
                  >
                    <span className="text-base text-white font-medium">
                      {c.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-medium bg-orange-950/40 border border-orange-800/50 text-orange-300 rounded-md">
                        {c.storeCount} 家
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">该省份暂无已开放城市。</p>
            )}
          </div>
        </section>

        {/* ── 省内门店列表 ── */}
        {storesInProvince.length > 0 ? (
          <section className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-500/10">
                    <StoreIcon className="w-5 h-5 text-orange-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">省内门店</h2>
                </div>
                <p className="text-xs text-zinc-500 hidden sm:block">
                  按门店等级排序 · 旗舰优先
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storesInProvince.map((s) => (
                  <StoreCard key={s.id} store={s} />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-16 rounded-2xl border border-zinc-800 bg-zinc-900">
                <Building2 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400">
                  {province.label}暂无已开放门店数据。
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
