import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PhoneCta } from "@/components/cta/PhoneCta";
import { XiaomiAnchorNav } from "@/components/xiaomi/XiaomiAnchorNav";
import { XiaomiProductGrid } from "@/components/xiaomi/XiaomiProductGrid";
import { XiaomiProductTable } from "@/components/xiaomi/XiaomiProductTable";
import {
  xiaomiProducts,
  xiaomiProductsByModel,
  xiaomiTopicMeta,
} from "@/lib/xiaomi-products";

export const metadata: Metadata = {
  title: `${xiaomiTopicMeta.title} | 蓝辉轻改 LANHUI`,
  description:
    "蓝辉轻改小米改装专题，覆盖小米 SU7 与 YU7 外观件、内饰升级等 18 个款式，按车型分组展示图片与产品表。具体适配与安装请到店沟通。",
  keywords:
    "小米改装, 小米SU7, 小米YU7, 外观件, 内饰升级, 前包围, 侧裙, 蓝辉轻改",
  openGraph: {
    title: `${xiaomiTopicMeta.title} | 蓝辉轻改 LANHUI`,
    description:
      "小米 SU7 / YU7 外观件与内饰升级，18 个改装款式按车型分组展示。",
    images: [xiaomiTopicMeta.ogImage],
    type: "article",
  },
};

export default function XiaomiTopicPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "小米改装专题",
    description:
      "蓝辉轻改提供的小米 SU7 / YU7 改装款式列表，覆盖外观件与内饰升级。",
    itemListElement: xiaomiProducts.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: `${p.displayName} 改装件`,
      image: p.image.publicPath,
    })),
  };

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        {/* Hero */}
        <section className="relative bg-zinc-950 text-white overflow-hidden">
          <div className="absolute inset-0 -z-0" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-950/30 via-zinc-950 to-zinc-950" />
            <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-orange-700/20 blur-3xl" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-24 md:pb-16">
            <nav className="flex items-center text-sm text-zinc-500 mb-6">
              <Link
                href="/product"
                className="hover:text-white transition-colors"
              >
                产品中心
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-zinc-300">{xiaomiTopicMeta.title}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <p className="text-sm tracking-widest text-orange-400 mb-3">
                  XIAOMI TOPIC
                </p>
                <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                  {xiaomiTopicMeta.title}
                </h1>
                <p className="text-base md:text-lg text-zinc-400 max-w-xl leading-relaxed mb-6">
                  覆盖小米 SU7 与 YU7 的外观件与内饰升级款式，按车型分组展示图片与产品清单。
                </p>

                <div className="flex flex-wrap items-center gap-2 mb-8">
                  <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                    {xiaomiTopicMeta.totalProducts} 个款式
                  </span>
                  <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                    {xiaomiTopicMeta.totalModels} 个车型
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <PhoneCta
                    source="xiaomi_topic_hero"
                    label="电话咨询"
                    size="lg"
                    metadata={{ section: "hero" }}
                  />
                  <Link
                    href="/product"
                    className="inline-flex items-center px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-sm"
                  >
                    返回产品中心
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
                  <Image
                    src={xiaomiTopicMeta.previewImage}
                    alt="小米 SU7 与 YU7 改装款式预览拼图"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    priority
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-3 text-center">
                  * 款式预览拼图，仅作整体视觉锚点；不代表安装案例。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 锚点导航 */}
        <XiaomiAnchorNav
          models={[
            { id: "su7", label: "小米 SU7（12 款）" },
            { id: "yu7", label: "小米 YU7（6 款）" },
          ]}
        />

        {/* SU7 分组 */}
        <section
          id="su7"
          className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900 scroll-mt-24"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <p className="text-sm tracking-widest text-orange-400 mb-2">
                SU7 · 12 款
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                小米 SU7 改装款式
              </h2>
            </div>
            <XiaomiProductGrid products={xiaomiProductsByModel.SU7} />
            <div className="mt-10">
              <h3 className="text-base font-semibold text-zinc-300 mb-3">
                SU7 款式清单
              </h3>
              <XiaomiProductTable products={xiaomiProductsByModel.SU7} />
            </div>
          </div>
        </section>

        {/* YU7 分组 */}
        <section
          id="yu7"
          className="py-16 md:py-20 bg-black border-y border-zinc-900 scroll-mt-24"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <p className="text-sm tracking-widest text-orange-400 mb-2">
                YU7 · 6 款
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                小米 YU7 改装款式
              </h2>
            </div>
            <XiaomiProductGrid products={xiaomiProductsByModel.YU7} />
            <div className="mt-10">
              <h3 className="text-base font-semibold text-zinc-300 mb-3">
                YU7 款式清单
              </h3>
              <XiaomiProductTable products={xiaomiProductsByModel.YU7} />
            </div>
          </div>
        </section>

        {/* 服务流程 */}
        <section className="py-16 md:py-20 bg-zinc-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-14">
              <p className="text-sm tracking-widest text-orange-400 mb-3">
                SERVICE FLOW
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                到店沟通流程
              </h2>
            </div>

            <ol className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { step: "01", title: "车型确认", desc: "确认小米 SU7 或 YU7 与年款信息。" },
                { step: "02", title: "款式选择", desc: "到店对照产品表与图片选择款式。" },
                { step: "03", title: "安装评估", desc: "评估原车状态与施工可行性。" },
                { step: "04", title: "施工交付", desc: "按规范施工交付，提示用车注意事项。" },
              ].map((s) => (
                <li
                  key={s.step}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
                >
                  <p className="text-2xl font-bold text-orange-400 mb-2">
                    {s.step}
                  </p>
                  <p className="text-sm font-bold text-white mb-1">{s.title}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {s.desc}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 底部 CTA */}
        <section className="py-12 md:py-16 bg-black border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              需要确认自己车型适合哪几款？
            </h2>
            <p className="text-zinc-400 mb-6">
              电话沟通车型、年款与原车状态，给出可执行的款式组合建议。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <PhoneCta
                source="xiaomi_topic_footer"
                label="电话咨询"
                size="lg"
                metadata={{ section: "footer" }}
              />
              <Link
                href="/product"
                className="inline-flex items-center px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-sm"
              >
                返回产品中心
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-6">
              * 本页仅展示产品视觉，不构成官方授权或原厂件承诺；具体适配以门店沟通为准。
            </p>
          </div>
        </section>
      </main>
      <Footer />

      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}