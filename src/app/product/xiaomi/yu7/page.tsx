import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getBrandRoute, getModelRoute } from "@/lib/product-routes";
import {
  xiaomiYu7UpgradeProjects,
  xiaomiYu7Scenarios,
  xiaomiYu7ServiceSteps,
  xiaomiYu7Faq,
  XIAOMI_YU7_PROJECT_COUNT,
  XIAOMI_YU7_SCENARIO_COUNT,
} from "@/lib/xiaomi-yu7-upgrade-projects";
import { XiaomiYu7TopicViewTrack } from "@/components/xiaomi-yu7/XiaomiYu7TopicViewTrack";
import { XiaomiYu7Hero } from "@/components/xiaomi-yu7/XiaomiYu7Hero";
import { XiaomiYu7ScenarioMatrix } from "@/components/xiaomi-yu7/XiaomiYu7ScenarioMatrix";
import { XiaomiYu7ProjectGrid } from "@/components/xiaomi-yu7/XiaomiYu7ProjectGrid";
import { XiaomiYu7ModelFitNote } from "@/components/xiaomi-yu7/XiaomiYu7ModelFitNote";
import { XiaomiYu7ServiceFlow } from "@/components/xiaomi-yu7/XiaomiYu7ServiceFlow";
import { XiaomiYu7Faq } from "@/components/xiaomi-yu7/XiaomiYu7Faq";

export const metadata: Metadata = {
  title: "小米 YU7 轻改项目｜软包脚垫、碳纤维护板、运动包围与电吸门｜蓝辉轻改",
  description:
    "蓝辉轻改提供小米 YU7 专属轻改方案参考，覆盖软包脚垫、碳纤维护板、平衡杆、运动包围、星空膜、星空卷帘、香氛系统、电吸门、挡泥板等轻改项目。",
  alternates: {
    canonical: "/product/xiaomi/yu7",
  },
};

export default async function XiaomiYu7Page() {
  const brand = getBrandRoute("xiaomi");
  const model = getModelRoute("xiaomi", "yu7");
  if (!brand || brand.type !== "vehicle_brand") notFound();
  if (!model || model.type !== "vehicle_model") notFound();

  const projects = xiaomiYu7UpgradeProjects;
  const scenarios = xiaomiYu7Scenarios;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "小米 YU7 轻改项目",
    url: "https://lanhui.com/product/xiaomi/yu7",
    numberOfItems: XIAOMI_YU7_PROJECT_COUNT,
    itemListElement: projects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.name,
        description: p.summary,
        category: p.category,
      },
    })),
  };

  return (
    <>
      <XiaomiYu7TopicViewTrack
        topicKey="xiaomi_yu7"
        brandSlug="xiaomi"
        modelSlug="yu7"
        projectCount={XIAOMI_YU7_PROJECT_COUNT}
      />
      <Header />
      <main className="flex-grow">
        {/* Hero */}
        <XiaomiYu7Hero
          totalProjects={XIAOMI_YU7_PROJECT_COUNT}
          totalScenarios={XIAOMI_YU7_SCENARIO_COUNT}
        />

        {/* 用车场景矩阵 */}
        <XiaomiYu7ScenarioMatrix
          scenarios={scenarios}
          projects={projects}
        />

        {/* 项目网格 */}
        <XiaomiYu7ProjectGrid projects={projects} />

        {/* 适配说明 */}
        <XiaomiYu7ModelFitNote />

        {/* 6 步服务流程 */}
        <XiaomiYu7ServiceFlow steps={xiaomiYu7ServiceSteps} />

        {/* FAQ */}
        <XiaomiYu7Faq items={xiaomiYu7Faq} />

        {/* CTA section */}
        <section className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              以上项目仅供参考
            </h2>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-8">
              不同批次和配置存在差异，具体适配请到店确认。蓝辉轻改顺德大良店提供到店评估和按标准流程施工服务。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="/product/xiaomi"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-orange-500/20 border border-orange-500 text-orange-200 hover:bg-orange-500/30 transition-colors text-sm font-semibold"
              >
                查看小米系列
              </a>
              <a
                href="/product"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm font-semibold"
              >
                返回产品中心
              </a>
            </div>
          </div>
        </section>

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>
      <Footer />
    </>
  );
}
