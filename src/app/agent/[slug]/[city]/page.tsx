import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, ArrowRight, Building2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  getCity,
  getStoresByCity,
  getAllProvinceSlugs,
  getAllCitySlugs,
  provinces,
} from "@/lib/store";

export function generateStaticParams() {
  // 遍历所有省份，生成每个省份下的城市参数
  return getAllProvinceSlugs().flatMap((provinceSlug) =>
    getAllCitySlugs(provinceSlug).map((citySlug) => ({
      slug: provinceSlug,
      city: citySlug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}) {
  const { slug, city } = await params;
  const cityData = getCity(slug, city);
  if (!cityData) return { title: "门店列表 | 蓝辉轻改 LANHUI" };
  return {
    title: `${cityData.label}门店 | 蓝辉轻改 LANHUI`,
    description: `蓝辉轻改在 ${cityData.label} 的门店列表。`,
  };
}

export default async function CityStoresPage({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}) {
  const { slug, city } = await params;
  const cityData = getCity(slug, city);
  if (!cityData) notFound();
  const stores = getStoresByCity(slug, city);

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
              <Link
                href={`/agent/${slug}`}
                className="hover:text-white transition-colors"
              >
                {provinceLabel(slug)}
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-zinc-300">{cityData.label}</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {cityData.label}门店
            </h1>
            <p className="text-base md:text-lg text-zinc-400">
              {cityData.label}共有
              <span className="text-orange-400 font-semibold mx-1">
                {cityData.storeCount}
              </span>
              家蓝辉轻改门店
            </p>
          </div>
        </section>

        <section className="py-8 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {stores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                  <Link
                    key={store.id}
                    href={`/agent/store/${store.id}`}
                    className="group block bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all overflow-hidden"
                  >
                    <div className="h-32 relative bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 flex items-center justify-center border-b border-zinc-800">
                      <Building2 className="w-12 h-12 text-zinc-700 group-hover:text-zinc-600 transition-colors" />
                      <div className="absolute top-3 left-3">
                        <span className="bg-blue-950/80 border border-blue-800/50 text-blue-300 text-xs font-bold px-2 py-1 rounded">
                          LANHUI
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white mb-3">
                        {store.name}
                      </h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2 text-sm text-zinc-400">
                          <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">
                            {store.address}
                          </span>
                        </div>
                      </div>
                      <span className="text-orange-400 text-sm font-medium inline-flex items-center">
                        查看详情
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-zinc-400">该城市暂无已开放门店数据。</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function provinceLabel(slug: string) {
  const provinceData = provinces.find((p) => p.slug === slug);
  return provinceData?.label ?? slug;
}
