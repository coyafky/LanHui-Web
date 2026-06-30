import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Gaoshan8TopicViewTrack } from "@/components/gaoshan/Gaoshan8TopicViewTrack";
import { Gaoshan8Hero } from "@/components/gaoshan/Gaoshan8Hero";
import { Gaoshan8ProjectGrid } from "@/components/gaoshan/Gaoshan8ProjectGrid";
import { Gaoshan8ScenarioMatrix } from "@/components/gaoshan/Gaoshan8ScenarioMatrix";
import { Gaoshan8ServiceFlow } from "@/components/gaoshan/Gaoshan8ServiceFlow";
import { Gaoshan8Faq } from "@/components/gaoshan/Gaoshan8Faq";
import { Gaoshan8ModelFitNote } from "@/components/gaoshan/Gaoshan8ModelFitNote";
import {
  gaoshan8UpgradeProjects,
  gaoshan8Scenarios,
  gaoshan8ServiceSteps,
  gaoshan8Faq,
} from "@/lib/gaoshan-products";
import { getBrandRoute, getModelRoute } from "@/lib/product-routes";

const PAGE_TITLE = "高山 8 专属升级方案｜车衣隔热膜铝地板电动踏板｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改提供高山 8 专属升级方案参考，覆盖车衣、隔热膜、彩绘、双拼改色、360软包脚垫、铝地板、平衡杆、AMXT包围、BSKT运动包围、底盘护板、电动踏板、中开门、车标灯、日行灯、抬头显示、香氛系统、挡泥板、防虫网、钢化膜、迎宾踏板、黑化81件套、内饰镀膜共 23 个项目，按新车保护、商务外观、外观个性、MPV后排舒适、底盘与行车防护、智能与屏幕保护、座舱维护 7 大场景分类。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "高山 8 轻改",
    "高山 8 改装",
    "高山 8 车衣",
    "高山 8 隔热膜",
    "高山 8 铝地板",
    "高山 8 电动踏板",
    "蓝辉轻改",
  ],
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [],
    type: "article",
  },
};

export default function Gaoshan8TopicPage() {
  const brand = getBrandRoute("gaoshan");
  const model = getModelRoute("gaoshan", "8");
  if (!brand || brand.type !== "vehicle_brand") notFound();
  if (!model || model.type !== "vehicle_model") notFound();

  const totalProjects = gaoshan8UpgradeProjects.length;
  const totalScenarios = gaoshan8Scenarios.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/product/gaoshan/8",
    mainEntity: {
      "@type": "ItemList",
      name: "高山 8 升级项目",
      numberOfItems: totalProjects,
      itemListElement: gaoshan8UpgradeProjects.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: `高山 8 ${p.name} 升级项目`,
        url: `/product/gaoshan/8#gaoshan-8-project-${p.id}`,
      })),
    },
  };

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        <Gaoshan8TopicViewTrack
          topicKey="gaoshan-8"
          totalProjects={totalProjects}
          totalScenarios={totalScenarios}
        />

        <Gaoshan8Hero
          title="高山 8 专属升级方案"
          subtitle="高山 8 单车型轻改 · MPV 全场景升级参考"
          description="蓝辉轻改针对高山 8 提供从新车保护到座舱维护的完整轻改方向，涵盖新车保护、商务外观、外观个性、MPV后排舒适、底盘与行车防护、灯光氛围、智能与屏幕保护和座舱维护八大类别。所有项目以方向参考为主，最终以到店确认和实际施工评估为准。"
          totalProjects={totalProjects}
          scenarioCount={totalScenarios}
        />

        <Gaoshan8ProjectGrid projects={gaoshan8UpgradeProjects} />

        <Gaoshan8ScenarioMatrix
          scenarios={gaoshan8Scenarios}
          allProjects={gaoshan8UpgradeProjects}
        />

        <Gaoshan8ModelFitNote />

        <Gaoshan8ServiceFlow steps={gaoshan8ServiceSteps} />

        <Gaoshan8Faq items={gaoshan8Faq} />

        <section className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              需要为你的高山 8 选几款升级？
            </h2>
            <p className="text-zinc-400 mb-6">
              到店确认车型、年款、批次与原车状态，给出可执行的项目组合建议。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/product"
                className="inline-flex items-center px-4 py-2 rounded-md border border-teal-900/60 bg-teal-950/40 text-teal-300 hover:text-teal-200 hover:border-teal-700 text-sm"
              >
                返回产品中心
              </Link>
              <Link
                href="/product/gaoshan"
                className="inline-flex items-center px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-sm"
              >
                查看高山品牌页
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-6">
              本页面展示的高山 8 升级项目用于蓝辉轻改服务介绍，品牌与车型名称仅用于说明适配对象。具体项目以到店确认和实际施工评估为准。
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
