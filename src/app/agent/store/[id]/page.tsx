import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Phone,
  Clock,
  Building2,
  ArrowLeft,
  Wrench,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getStore, getAllStoreIds, getStore as _getStore } from "@/lib/store";
import { generateLocalBusinessSchema, generateBreadcrumbSchema } from "@/lib/geo";

export function generateStaticParams() {
  return getAllStoreIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const store = getStore(id);
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
  const store = getStore(id);
  if (!store) notFound();
  // suppress unused warning helper
  void _getStore;

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
              { name: store.cityLabel, url: `/agent/${store.province}/${store.city}` },
              { name: store.name, url: `/agent/store/${store.id}` },
            ])
          ),
        }}
      />
      <Header />
      <main className="flex-grow flex flex-col">
        {/* Hero */}
        <section className="bg-black py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav
              aria-label="面包屑"
              className="mb-3 text-sm text-zinc-500 flex items-center flex-wrap"
            >
              <Link href="/agent" className="hover:text-orange-400 transition-colors">
                门店服务
              </Link>
              <span className="mx-2">/</span>
              <Link
                href={`/agent/${store.province}`}
                className="hover:text-orange-400 transition-colors"
              >
                {store.provinceLabel}
              </Link>
              <span className="mx-2">/</span>
              <Link
                href={`/agent/${store.province}/${store.city}`}
                className="hover:text-orange-400 transition-colors"
              >
                {store.cityLabel}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-zinc-300">{store.name}</span>
            </nav>

            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="bg-blue-950/40 border border-blue-800/50 text-blue-300 text-xs font-bold px-3 py-1 rounded">
                LANHUI
              </span>
              <span className="bg-orange-950/40 border border-orange-800/50 text-orange-300 text-xs font-bold px-3 py-1 rounded">
                服务中心
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              {store.cityLabel} · {store.name}
            </h1>
          </div>
        </section>

        {/* Main */}
        <section className="py-12 bg-zinc-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gallery placeholder */}
            <div className="space-y-4">
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
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`relative aspect-square rounded-lg overflow-hidden bg-zinc-900 border ${
                      i === 0 ? "border-orange-500" : "border-zinc-800"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-zinc-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info card */}
            <div className="space-y-6">
              <p className="text-zinc-300 leading-relaxed">{store.description}</p>

              <dl className="space-y-5">
                <InfoRow icon={MapPin} label="门店地址">
                  {store.address}
                </InfoRow>
                <InfoRow icon={Phone} label="联系电话">
                  {store.phone}
                </InfoRow>
                <InfoRow icon={Clock} label="营业时间">
                  {store.businessHours}
                </InfoRow>
              </dl>

              <div className="pt-6 border-t border-zinc-800 flex flex-col gap-3">
                <a
                  href={store.phoneTel}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-medium transition-colors"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  预约咨询
                </a>
                <Link
                  href={`/agent/${store.province}/${store.city}`}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回{store.cityLabel}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Services + Highlights */}
        <section className="py-12 bg-black border-t border-zinc-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-400" />
                提供的服务
              </h2>
              <ul className="space-y-2 text-zinc-300">
                {store.services.map((svc) => (
                  <li
                    key={svc}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    {svc}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-4">门店特色</h2>
              <ul className="space-y-2 text-zinc-300">
                {store.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 mt-0.5">
        <Icon className="w-5 h-5 text-orange-400" />
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wider text-zinc-500">
          {label}
        </dt>
        <dd className="text-white leading-relaxed mt-1">{children}</dd>
      </div>
    </div>
  );
}
