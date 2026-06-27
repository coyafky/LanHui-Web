import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VoyahDreamerTopicViewTrack } from "@/components/voyah/VoyahDreamerTopicViewTrack";
import { VoyahDreamerHero } from "@/components/voyah/VoyahDreamerHero";
import { VoyahDreamerProjectGrid } from "@/components/voyah/VoyahDreamerProjectGrid";
import { VoyahDreamerScenarioMatrix } from "@/components/voyah/VoyahDreamerScenarioMatrix";
import { VoyahDreamerServiceFlow } from "@/components/voyah/VoyahDreamerServiceFlow";
import { VoyahDreamerFaq } from "@/components/voyah/VoyahDreamerFaq";
import { VoyahDreamerModelFitNote } from "@/components/voyah/VoyahDreamerModelFitNote";
import {
  voyahDreamerUpgradeProjects,
  voyahDreamerScenarios,
  voyahDreamerServiceSteps,
  voyahDreamerFaq,
} from "@/lib/voyah-products";
import { getBrandRoute, getModelRoute } from "@/lib/product-routes";

const PAGE_TITLE = "岚图梦想家轻改升级方案｜车衣隔热膜铝地板包围腿托｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改提供岚图梦想家专属升级方案参考，覆盖车衣、隔热膜、彩绘、双拼改色、360软包脚垫、铝地板、包围、底盘护板、氛围灯、腿托、钢化膜和防虫网等共 17 个项目，按新车保护、外观个性、底盘与行车防护、MPV后排舒适、座舱维护 5 大场景分类。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "岚图梦想家轻改",
    "岚图梦想家改装",
    "岚图梦想家车衣",
    "岚图梦想家隔热膜",
    "岚图梦想家铝地板",
    "岚图梦想家包围",
    "岚图梦想家腿托",
    "蓝辉轻改",
  ],
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [],
    type: "article",
  },
};

export default function VoyahDreamerTopicPage() {
  const brand = getBrandRoute("voyah");
  const model = getModelRoute("voyah", "dreamer");
  if (!brand || brand.type !== "vehicle_brand") notFound();
  if (!model || model.type !== "vehicle_model") notFound();

  const totalProjects = voyahDreamerUpgradeProjects.length;
  const totalScenarios = voyahDreamerScenarios.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/product/voyah/dreamer",
    mainEntity: {
      "@type": "ItemList",
      name: "岚图梦想家升级项目",
      numberOfItems: totalProjects,
      itemListElement: voyahDreamerUpgradeProjects.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: `岚图梦想家 ${p.name} 升级项目`,
        url: `/product/voyah/dreamer#voyah-dreamer-project-${p.id}`,
      })),
    },
  };

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        <VoyahDreamerTopicViewTrack
          topicKey="voyah-dreamer"
          totalProjects={totalProjects}
          totalScenarios={totalScenarios}
        />

        <VoyahDreamerHero
          title="岚图梦想家专属升级方案"
          subtitle="岚图梦想家单车型轻改 · MPV 全场景升级参考"
          totalProjects={totalProjects}
          scenarioCount={totalScenarios}
        />

        <VoyahDreamerProjectGrid projects={voyahDreamerUpgradeProjects} />

        <VoyahDreamerScenarioMatrix
          scenarios={voyahDreamerScenarios}
          allProjects={voyahDreamerUpgradeProjects}
        />

        <VoyahDreamerModelFitNote />

        <VoyahDreamerServiceFlow steps={voyahDreamerServiceSteps} />

        <VoyahDreamerFaq items={voyahDreamerFaq} />

        <section className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              需要为你的岚图梦想家选几款升级？
            </h2>
            <p className="text-zinc-400 mb-6">
              到店确认车型、年款、批次与原车状态，给出可执行的项目组合建议。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/product"
                className="inline-flex items-center px-4 py-2 rounded-md border border-violet-900/60 bg-violet-950/40 text-violet-300 hover:text-violet-200 hover:border-violet-700 text-sm"
              >
                返回产品中心
              </Link>
              <Link
                href="/product/voyah"
                className="inline-flex items-center px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-sm"
              >
                查看岚图品牌页
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-6">
              本页面展示的岚图梦想家升级项目用于蓝辉轻改服务介绍，品牌与车型名称仅用于说明适配对象。具体项目以到店确认和实际施工评估为准。
            </p>
          </div>
        </section>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
