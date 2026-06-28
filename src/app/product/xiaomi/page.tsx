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
import {
  xiaomiSeriesUpgradeProjects,
  xiaomiSeriesScenarios,
  xiaomiSeriesUltraZone,
  xiaomiSeriesServiceSteps,
  xiaomiSeriesFaq,
} from "@/lib/xiaomi-series-upgrade-projects";
import { XiaomiSeriesScenarioMatrix } from "@/components/xiaomi-series/XiaomiSeriesScenarioMatrix";
import { XiaomiSeriesProjectGrid } from "@/components/xiaomi-series/XiaomiSeriesProjectGrid";
import { XiaomiSeriesUltraZone } from "@/components/xiaomi-series/XiaomiSeriesUltraZone";
import { XiaomiSeriesModelFitNote } from "@/components/xiaomi-series/XiaomiSeriesModelFitNote";
import { XiaomiSeriesServiceFlow } from "@/components/xiaomi-series/XiaomiSeriesServiceFlow";
import { XiaomiSeriesFaq } from "@/components/xiaomi-series/XiaomiSeriesFaq";

export const metadata: Metadata = {
  title: `${xiaomiTopicMeta.title} | 蓝辉轻改 LANHUI`,
  description:
    "蓝辉轻改小米改装专题，覆盖小米 SU7 与 YU7 外观件、内饰升级等款式，以及全系列 21 项升级项目与 Ultra 风格专区，按车型分组展示图片与产品表。具体适配与安装请到店沟通。",
  keywords:
    "小米改装, 小米SU7, 小米YU7, 外观件, 内饰升级, 前包围, 侧裙, Ultra风格, 蓝辉轻改",
  openGraph: {
    title: `${xiaomiTopicMeta.title} | 蓝辉轻改 LANHUI`,
    description:
      "小米 SU7 / YU7 外观件与内饰升级，全系列 21 项升级项目与 Ultra 风格专区。",
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
      "蓝辉轻改提供的小米改装方案，覆盖 SU7 / YU7 外观件与内饰升级，以及全系列 21 项升级项目。",
    itemListElement: [
      ...xiaomiProducts.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: `${p.displayName} 改装件`,
        image: p.image.publicPath,
      })),
      ...xiaomiSeriesUpgradeProjects.map((p, idx) => ({
        "@type": "ListItem",
        position: xiaomiProducts.length + idx + 1,
        name: `${p.name} 升级项目`,
        description: p.summary,
      })),
    ],
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
            { id: "xiaomi-series-scenarios", label: "用车场景" },
            { id: "xiaomi-series-project-grid", label: "升级项目" },
            { id: "xiaomi-series-ultra-zone", label: "Ultra 风格" },
            { id: "xiaomi-series-service-flow", label: "服务流程" },
            { id: "xiaomi-series-faq", label: "常见问题" },
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

        {/* ======== 小米全系列升级方案专区 ======== */}

        {/* 场景矩阵 */}
        <section id="xiaomi-series-scenarios">
          <XiaomiSeriesScenarioMatrix
            scenarios={xiaomiSeriesScenarios}
            allProjects={xiaomiSeriesUpgradeProjects}
          />
        </section>

        {/* 项目网格 */}
        <XiaomiSeriesProjectGrid
          projects={xiaomiSeriesUpgradeProjects}
          scenarios={xiaomiSeriesScenarios}
        />

        {/* Ultra 风格专区 */}
        <section id="xiaomi-series-ultra-zone">
          <XiaomiSeriesUltraZone
            items={xiaomiSeriesUltraZone}
            allProjects={xiaomiSeriesUpgradeProjects}
          />
        </section>

        {/* 车型适配说明 */}
        <XiaomiSeriesModelFitNote />

        {/* 服务流程 — 替换原 4 步流程 */}
        <section id="xiaomi-series-service-flow">
          <XiaomiSeriesServiceFlow steps={xiaomiSeriesServiceSteps} />
        </section>

        {/* FAQ */}
        <section id="xiaomi-series-faq">
          <XiaomiSeriesFaq items={xiaomiSeriesFaq} />
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