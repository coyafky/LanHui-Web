import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  MapPin,
  ArrowRight,
  Building2,
  Phone,
  Clock,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  getCityBySlug,
  getStores,
  getAllProvinceSlugs,
  getAllCitySlugs,
  getProvinces,
} from "@/lib/data";
import { generateBreadcrumbSchema } from "@/lib/geo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const provinceSlugs = await getAllProvinceSlugs();
  const params = [];
  for (const provinceSlug of provinceSlugs) {
    const citySlugs = await getAllCitySlugs(provinceSlug);
    for (const citySlug of citySlugs) {
      params.push({ slug: provinceSlug, city: citySlug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}) {
  const { slug, city } = await params;
  const cityData = await getCityBySlug(slug, city);
  if (!cityData) return { title: "门店列表 | 蓝辉轻改 LANHUI" };
  return {
    title: `${cityData.label}门店 | 蓝辉轻改 LANHUI`,
    description: `蓝辉轻改在 ${cityData.label} 的门店列表，共 ${cityData.storeCount} 家门店。`,
  };
}

async function provinceLabel(slug: string) {
  const provinces = await getProvinces();
  const provinceData = provinces.find((p) => p.slug === slug);
  return provinceData?.label ?? slug;
}

export default async function CityStoresPage({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}) {
  const { slug, city } = await params;
  const cityData = await getCityBySlug(slug, city);
  if (!cityData) notFound();
  const storesInCity = await getStores({ province: slug, city });
  const provinceName = await provinceLabel(slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: "首页", url: "/" },
              { name: "全国门店", url: "/agent" },
              { name: provinceName, url: `/agent/${slug}` },
              { name: cityData.label, url: `/agent/${slug}/${city}` },
            ])
          ),
        }}
      />
      <Header />
      <main className="flex-grow flex flex-col">
        {/* ── 面包屑 + Hero ── */}
        <section className="relative bg-zinc-950 text-white overflow-hidden">
          <div className="absolute inset-0 -z-0" aria-hidden="true">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-orange-600/10 blur-[80px]" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-14">
            <nav className="flex items-center text-sm text-zinc-500 mb-8 flex-wrap gap-y-1">
              <Link href="/" className="hover:text-white transition-colors">
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
              <Link
                href={`/agent/${slug}`}
                className="hover:text-white transition-colors"
              >
                {provinceName}
              </Link>
              <ChevronRight className="w-4 h-4 mx-1.5" />
              <span className="text-zinc-300">{cityData.label}</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
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

        {/* ── 门店卡片列表 ── */}
        <section className="py-12 md:py-16 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {storesInCity.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storesInCity.map((store) => (
                  <Link
                    key={store.id}
                    href={`/agent/store/${store.id}`}
                    className="group block bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-zinc-700 group-hover:text-zinc-600 transition-colors" />
                      <div className="absolute top-3 left-3">
                        <span className="bg-zinc-800/90 text-zinc-300 text-xs font-bold px-2.5 py-1 rounded-md backdrop-blur-sm">
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
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Phone className="w-4 h-4 text-orange-400 flex-shrink-0" />
                          <span>{store.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Clock className="w-4 h-4 text-orange-400 flex-shrink-0" />
                          <span>{store.businessHours}</span>
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
              <div className="text-center py-20">
                <Building2 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
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
