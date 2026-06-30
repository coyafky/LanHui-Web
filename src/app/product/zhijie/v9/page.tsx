import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ZhijieV9TopicHero } from "@/components/zhijie/ZhijieV9TopicHero";
import { ZhijieV9ProjectsAndBundles } from "@/components/zhijie/ZhijieV9ProjectsAndBundles";
import { ZhijieV9ScenarioMatrix } from "@/components/zhijie/ZhijieV9ScenarioMatrix";
import { ZhijieV9ModelFitNote } from "@/components/zhijie/ZhijieV9ModelFitNote";
import { ZhijieV9ServiceFlow } from "@/components/zhijie/ZhijieV9ServiceFlow";
import { ZhijieV9Faq } from "@/components/zhijie/ZhijieV9Faq";
import { ZhijieV9TopicViewTrack } from "@/components/zhijie/ZhijieV9TopicViewTrack";
import {
  zhijieV9UpgradeProjects,
  zhijieV9Scenarios,
  zhijieV9Bundles,
  zhijieV9ServiceSteps,
  zhijieV9Faq,
} from "@/lib/zhijie-v9-products";
import { getBrandRoute, getModelRoute } from "@/lib/product-routes";

const PAGE_TITLE = "智界 V9 专属升级方案｜车衣隔热膜铝地板钢化膜｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改提供智界 V9 专属升级方案参考，覆盖车衣、隔热膜、彩绘、改色膜、360脚垫、平衡杆、底盘护板、铝地板、门槛条、牌照框、挡泥板、防虫网、钢化膜和抬头显示罩共 14 个项目，按新车保护、外观个性、座舱保护、底盘防护、屏幕保护、外观细节 6 大场景分类。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "智界 V9 轻改",
    "智界 V9 改装",
    "智界 V9 车衣",
    "智界 V9 隔热膜",
    "智界 V9 铝地板",
    "智界 V9 钢化膜",
    "智界 V9 抬头显示罩",
    "蓝辉轻改",
  ],
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [],
    type: "article",
  },
};

export default function ZhijieV9TopicPage() {
  const brand = getBrandRoute("zhijie");
  const model = getModelRoute("zhijie", "v9");
  if (!brand || brand.type !== "vehicle_brand") notFound();
  if (!model || model.type !== "vehicle_model") notFound();

  const totalProjects = zhijieV9UpgradeProjects.length;
  const totalScenarios = zhijieV9Scenarios.length;
  const totalBundles = zhijieV9Bundles.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/product/zhijie/v9",
    mainEntity: {
      "@type": "ItemList",
      name: "智界 V9 升级项目",
      numberOfItems: totalProjects,
      itemListElement: zhijieV9UpgradeProjects.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: `智界 V9 ${p.name} 升级项目`,
        url: `/product/zhijie/v9#zhijie-v9-project-${p.id}`,
      })),
    },
  };

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        <ZhijieV9TopicViewTrack
          topicKey="zhijie-v9"
          totalProjects={totalProjects}
          totalScenarios={totalScenarios}
          totalBundles={totalBundles}
        />

        <ZhijieV9TopicHero
          title="智界 V9 专属升级方案"
          subtitle="智界 V9 单车型轻改 · 兼顾原车结构与商务出行"
          totalProjects={totalProjects}
          scenarioCount={totalScenarios}
          bundleCount={totalBundles}
        />

        <ZhijieV9ModelFitNote />

        <ZhijieV9ProjectsAndBundles
          projects={zhijieV9UpgradeProjects}
          bundles={zhijieV9Bundles}
        />

        <ZhijieV9ScenarioMatrix
          scenarios={zhijieV9Scenarios}
          allProjects={zhijieV9UpgradeProjects}
        />

        <ZhijieV9ServiceFlow steps={zhijieV9ServiceSteps} />

        <ZhijieV9Faq items={zhijieV9Faq} />

        <section className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              需要为你的智界 V9 选几款升级？
            </h2>
            <p className="text-zinc-400 mb-6">
              到店确认车型、年款、批次与原车状态，给出可执行的项目组合建议。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/product"
                className="inline-flex items-center px-4 py-2 rounded-md border border-amber-900/60 bg-amber-950/40 text-amber-300 hover:text-amber-200 hover:border-amber-700 text-sm"
              >
                返回产品中心
              </Link>
              <Link
                href="/product/zhijie"
                className="inline-flex items-center px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-sm"
              >
                查看智界品牌页
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-6">
              本页面展示的智界 V9 升级项目用于蓝辉轻改服务介绍，品牌与车型名称仅用于说明适配对象。具体项目以到店确认和实际施工评估为准。
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
