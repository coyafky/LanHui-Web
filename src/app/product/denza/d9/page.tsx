import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DenzaD9TopicViewTrack } from "@/components/denza/DenzaD9TopicViewTrack";
import { DenzaD9TopicHero } from "@/components/denza/DenzaD9TopicHero";
import { DenzaD9ProjectGrid } from "@/components/denza/DenzaD9ProjectGrid";
import { DenzaD9ScenarioMatrix } from "@/components/denza/DenzaD9ScenarioMatrix";
import { DenzaD9ServiceFlow } from "@/components/denza/DenzaD9ServiceFlow";
import { DenzaD9Faq } from "@/components/denza/DenzaD9Faq";
import {
  denzaD9UpgradeProjects,
  denzaD9Scenarios,
  denzaD9ServiceSteps,
  denzaD9Faq,
} from "@/lib/denza-d9-products";
import { getBrandRoute, getModelRoute } from "@/lib/product-routes";

const PAGE_TITLE = "腾势 D9 专属升级方案｜车衣隔热膜铝地板小桌板｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改提供腾势 D9 专属升级方案参考，覆盖车衣、隔热膜、彩绘、双拼改色、360软包脚垫、铝地板、平衡杆、amxt包围、bskt运动包围、底盘护板、小桌板、氛围灯、日行灯、抬头显示、吸顶电视、D柱灯、铝合金行李架、挡泥板、防虫网、钢化膜、门槛条、牌照框和内饰镀膜共 23 个项目，按新车保护、MPV 后排体验、商务座舱、外观个性、车顶与户外、行车防护、智能驾驶/影音、操控/底盘 8 大场景分类。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "腾势 D9 轻改",
    "腾势 D9 改装",
    "腾势 D9 车衣",
    "腾势 D9 隔热膜",
    "腾势 D9 铝地板",
    "腾势 D9 小桌板",
    "腾势 D9 吸顶电视",
    "蓝辉轻改",
  ],
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [],
    type: "article",
  },
};

export default function DenzaD9TopicPage() {
  const brand = getBrandRoute("denza");
  const model = getModelRoute("denza", "d9");
  if (!brand || brand.type !== "vehicle_brand") notFound();
  if (!model || model.type !== "vehicle_model") notFound();

  const totalProjects = denzaD9UpgradeProjects.length;
  const totalScenarios = denzaD9Scenarios.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/product/denza/d9",
    mainEntity: {
      "@type": "ItemList",
      name: "腾势 D9 升级项目",
      numberOfItems: totalProjects,
      itemListElement: denzaD9UpgradeProjects.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: `腾势 D9 ${p.name} 升级项目`,
        url: `/product/denza/d9#denza-d9-project-${p.id}`,
      })),
    },
  };

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        <DenzaD9TopicViewTrack
          topicKey="denza-d9"
          totalProjects={totalProjects}
          totalScenarios={totalScenarios}
        />

        <DenzaD9TopicHero
          title="腾势 D9 专属升级方案"
          subtitle="腾势 D9 单车型轻改 · MPV 全场景升级参考"
          totalProjects={totalProjects}
          scenarioCount={totalScenarios}
        />

        <DenzaD9ProjectGrid projects={denzaD9UpgradeProjects} />

        <DenzaD9ScenarioMatrix
          scenarios={denzaD9Scenarios}
          allProjects={denzaD9UpgradeProjects}
        />

        <DenzaD9ServiceFlow steps={denzaD9ServiceSteps} />

        <DenzaD9Faq items={denzaD9Faq} />

        <section className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              需要为你的腾势 D9 选几款升级？
            </h2>
            <p className="text-zinc-400 mb-6">
              到店确认车型、年款、批次与原车状态，给出可执行的项目组合建议。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/product"
                className="inline-flex items-center px-4 py-2 rounded-md border border-pink-900/60 bg-pink-950/40 text-pink-300 hover:text-pink-200 hover:border-pink-700 text-sm"
              >
                返回产品中心
              </Link>
              <Link
                href="/product/denza"
                className="inline-flex items-center px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-sm"
              >
                查看腾势品牌页
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-6">
              本页面展示的腾势 D9 升级项目用于蓝辉轻改服务介绍，品牌与车型名称仅用于说明适配对象。具体项目以到店确认和实际施工评估为准。
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
