import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getBrandRoute, getModelRoute } from "@/lib/product-routes";
import {
  xiaomiSu7UpgradeProjects,
  xiaomiSu7Scenarios,
  xiaomiSu7ServiceSteps,
  xiaomiSu7Faq,
  XIAOMI_SU7_PROJECT_COUNT,
  XIAOMI_SU7_SCENARIO_COUNT,
} from "@/lib/xiaomi-su7-upgrade-projects";
import { XiaomiSu7TopicViewTrack } from "@/components/xiaomi-su7/XiaomiSu7TopicViewTrack";
import { XiaomiSu7Hero } from "@/components/xiaomi-su7/XiaomiSu7Hero";
import { XiaomiSu7ScenarioMatrix } from "@/components/xiaomi-su7/XiaomiSu7ScenarioMatrix";
import { XiaomiSu7ProjectGrid } from "@/components/xiaomi-su7/XiaomiSu7ProjectGrid";
import { XiaomiSu7ModelFitNote } from "@/components/xiaomi-su7/XiaomiSu7ModelFitNote";
import { XiaomiSu7ServiceFlow } from "@/components/xiaomi-su7/XiaomiSu7ServiceFlow";
import { XiaomiSu7Faq } from "@/components/xiaomi-su7/XiaomiSu7Faq";

export const metadata: Metadata = {
  title: "小米 SU7 轻改项目｜前包围、侧裙、方向盘与中控面板｜蓝辉轻改",
  description:
    "蓝辉轻改提供小米 SU7 专属轻改方案参考，覆盖前包围、侧裙、机盖、尾翼、后视镜壳、方向盘、中控面板、迎宾踏板等 12 项轻改项目。",
  alternates: {
    canonical: "/product/xiaomi/su7",
  },
};

export default async function XiaomiSu7Page() {
  const brand = getBrandRoute("xiaomi");
  const model = getModelRoute("xiaomi", "su7");
  if (!brand || brand.type !== "vehicle_brand") notFound();
  if (!model || model.type !== "vehicle_model") notFound();

  const projects = xiaomiSu7UpgradeProjects;
  const scenarios = xiaomiSu7Scenarios;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "小米 SU7 轻改项目",
    url: "https://lanhui.com/product/xiaomi/su7",
    numberOfItems: XIAOMI_SU7_PROJECT_COUNT,
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
      <XiaomiSu7TopicViewTrack
        topicKey="xiaomi_su7"
        brandSlug="xiaomi"
        modelSlug="su7"
        projectCount={XIAOMI_SU7_PROJECT_COUNT}
      />
      <Header />
      <main className="flex-grow">
        {/* Hero */}
        <XiaomiSu7Hero
          totalProjects={XIAOMI_SU7_PROJECT_COUNT}
          totalScenarios={XIAOMI_SU7_SCENARIO_COUNT}
        />

        {/* 用车场景矩阵 */}
        <XiaomiSu7ScenarioMatrix
          scenarios={scenarios}
          projects={projects}
        />

        {/* 项目网格 */}
        <XiaomiSu7ProjectGrid projects={projects} />

        {/* 适配说明 */}
        <XiaomiSu7ModelFitNote />

        {/* 6 步服务流程 */}
        <XiaomiSu7ServiceFlow steps={xiaomiSu7ServiceSteps} />

        {/* FAQ */}
        <XiaomiSu7Faq items={xiaomiSu7Faq} />

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
