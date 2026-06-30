import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LedaoL90TopicViewTrack } from "@/components/ledao/LedaoL90TopicViewTrack";
import { LedaoL90Hero } from "@/components/ledao/LedaoL90Hero";
import { LedaoL90ProjectGrid } from "@/components/ledao/LedaoL90ProjectGrid";
import { LedaoL90ScenarioMatrix } from "@/components/ledao/LedaoL90ScenarioMatrix";
import { LedaoL90MoreChoices } from "@/components/ledao/LedaoL90MoreChoices";
import { LedaoL90ServiceFlow } from "@/components/ledao/LedaoL90ServiceFlow";
import { LedaoL90Faq } from "@/components/ledao/LedaoL90Faq";
import { LedaoL90ModelFitNote } from "@/components/ledao/LedaoL90ModelFitNote";
import {
  ledaoL90UpgradeProjects,
  ledaoL90MoreChoices,
  ledaoL90Scenarios,
  ledaoL90ServiceSteps,
  ledaoL90Faq,
} from "@/lib/ledao-l90-products";
import { getBrandRoute, getModelRoute } from "@/lib/product-routes";

const PAGE_TITLE = "乐道 L90 轻改项目｜车衣、隔热膜、铝地板、底盘护板与电动踏板｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改提供乐道 L90 专属升级方案参考，覆盖车衣、隔热膜、彩绘、双拼改色、悬浮顶、铝地板、平衡杆、小桌板、运动包围、360脚垫、底盘护板、轮毂、门槛条、钢化膜等热门轻改项目。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "乐道 L90 轻改",
    "乐道 L90 改装",
    "乐道 L90 车衣",
    "乐道 L90 隔热膜",
    "乐道 L90 铝地板",
    "乐道 L90 底盘护板",
    "蓝辉轻改",
  ],
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [],
    type: "article",
  },
};

export default function LedaoL90TopicPage() {
  const brand = getBrandRoute("ledao");
  const model = getModelRoute("ledao", "l90");
  if (!brand || brand.type !== "vehicle_brand") notFound();
  if (!model || model.type !== "vehicle_model") notFound();

  const totalProjects = ledaoL90UpgradeProjects.length;
  const totalMoreChoices = ledaoL90MoreChoices.length;
  const totalScenarios = ledaoL90Scenarios.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/product/ledao/l90",
    mainEntity: {
      "@type": "ItemList",
      name: "乐道 L90 升级项目",
      numberOfItems: totalProjects,
      itemListElement: ledaoL90UpgradeProjects.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: `乐道 L90 ${p.name} 升级项目`,
        url: `/product/ledao/l90#ledao-l90-project-${p.id}`,
      })),
    },
  };

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        <LedaoL90TopicViewTrack
          topicKey="ledao-l90"
          totalProjects={totalProjects}
          totalScenarios={totalScenarios}
        />

        <LedaoL90Hero
          title="乐道 L90 专属升级方案"
          subtitle="热门轻改产品目录"
          description="围绕新车保护、隔热改色、座舱便利、底盘防护、外观个性和家庭出行场景，为乐道 L90 车主提供系统化轻改项目参考。"
          totalProjects={totalProjects}
          totalMoreChoices={totalMoreChoices}
          scenarioCount={totalScenarios}
        />

        <LedaoL90ProjectGrid projects={ledaoL90UpgradeProjects} />

        <LedaoL90ScenarioMatrix
          scenarios={ledaoL90Scenarios}
          allProjects={ledaoL90UpgradeProjects}
          allMoreChoices={ledaoL90MoreChoices}
        />

        <LedaoL90MoreChoices items={ledaoL90MoreChoices} />

        <LedaoL90ModelFitNote />

        <LedaoL90ServiceFlow steps={ledaoL90ServiceSteps} />

        <LedaoL90Faq items={ledaoL90Faq} />

        <section className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              需要为你的乐道 L90 选几款升级？
            </h2>
            <p className="text-zinc-400 mb-6">
              到店确认车型、年款、批次与原车状态，给出可执行的项目组合建议。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/product"
                className="inline-flex items-center px-4 py-2 rounded-md border border-blue-900/60 bg-blue-950/40 text-blue-300 hover:text-blue-200 hover:border-blue-700 text-sm"
              >
                返回产品中心
              </Link>
              <Link
                href="/product/ledao"
                className="inline-flex items-center px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-sm"
              >
                查看乐道品牌页
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-6">
              本页面展示的乐道 L90 升级项目用于蓝辉轻改服务介绍，品牌与车型名称仅用于说明适配对象。具体项目以到店确认和实际施工评估为准。
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
