import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Phone,
  Clock,
  Building2,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getStoreById, getAllStoreIds } from "@/lib/data";
import { generateLocalBusinessSchema, generateBreadcrumbSchema } from "@/lib/geo";
import { StoreLevelBadge } from "@/components/agent/StoreLevelBadge";

export const revalidate = 86400;

export async function generateStaticParams() {
  const ids = await getAllStoreIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const store = await getStoreById(id);
  if (!store) return { title: "门店详情 | 蓝辉轻改 LANHUI" };
  return {
    title: `${store.name} | 蓝辉轻改 LANHUI`,
    description: `${store.name}位于${store.address}，提供蓝辉轻改轻改装备与汽车膜系服务。`,
  };
}

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await getStoreById(id);
  if (!store) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateLocalBusinessSchema(store)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: "首页", url: "/" },
              { name: "全国门店", url: "/agent" },
              { name: store.provinceLabel, url: `/agent/${store.province}` },
              {
                name: store.cityLabel,
                url: `/agent/${store.province}/${store.city}`,
              },
              { name: store.name, url: `/agent/store/${store.id}` },
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
            <nav
              aria-label="面包屑"
              className="flex items-center text-sm text-zinc-500 mb-8 flex-wrap gap-y-1"
            >
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
                href={`/agent/${store.province}`}
                className="hover:text-white transition-colors"
              >
                {store.provinceLabel}
              </Link>
              <ChevronRight className="w-4 h-4 mx-1.5" />
              <Link
                href={`/agent/${store.province}/${store.city}`}
                className="hover:text-white transition-colors"
              >
                {store.cityLabel}
              </Link>
              <ChevronRight className="w-4 h-4 mx-1.5" />
              <span className="text-zinc-300">{store.name}</span>
            </nav>

            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="bg-zinc-800/90 text-zinc-300 text-xs font-bold px-3 py-1 rounded-md">
                LANHUI
              </span>
              <StoreLevelBadge level={store.level} variant="card" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {store.name}
            </h1>
          </div>
        </section>

        {/* ── 门店信息区：两栏布局 ── */}
        <section className="py-12 md:py-16 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* 左侧：门店主图 */}
              <div>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Building2 className="w-24 h-24 text-zinc-600" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-zinc-800/90 text-zinc-300 text-xs font-bold px-3 py-1 rounded-md backdrop-blur-sm">
                      LANHUI
                    </span>
                  </div>
                </div>
              </div>

              {/* 右侧：门店信息 */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {store.name}
                  </h2>
                  <div className="flex items-center gap-2 mb-4">
                    <StoreLevelBadge level={store.level} variant="inline" />
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    {store.description}
                  </p>
                </div>

                {/* 联系信息卡片 */}
                <div className="bg-zinc-900 rounded-xl p-6 space-y-5 border border-zinc-800">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-500/10 flex-shrink-0">
                      <MapPin className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
                        门店地址
                      </p>
                      <p className="text-zinc-200 leading-relaxed">
                        {store.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-500/10 flex-shrink-0">
                      <Phone className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
                        联系电话
                      </p>
                      <a
                        href={store.phoneTel}
                        className="text-orange-400 hover:text-orange-300 transition-colors font-medium"
                      >
                        {store.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-500/10 flex-shrink-0">
                      <Clock className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
                        营业时间
                      </p>
                      <p className="text-zinc-200">{store.businessHours}</p>
                    </div>
                  </div>
                </div>

                {/* CTA 按钮 */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={store.phoneTel}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-orange-400/30"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    电话咨询
                  </a>
                  <Link
                    href={`/agent/${store.province}/${store.city}`}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-medium transition-colors"
                  >
                    返回{store.cityLabel}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
