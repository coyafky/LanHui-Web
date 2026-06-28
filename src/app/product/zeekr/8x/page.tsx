import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Zeekr8xHero } from "@/components/zeekr-8x/Zeekr8xHero";
import { Zeekr8xTopicViewTrack } from "@/components/zeekr-8x/Zeekr8xTopicViewTrack";
import { Zeekr8xScenarioMatrix } from "@/components/zeekr-8x/Zeekr8xScenarioMatrix";
import { Zeekr8xProjectGrid } from "@/components/zeekr-8x/Zeekr8xProjectGrid";
import { Zeekr8xBundles } from "@/components/zeekr-8x/Zeekr8xBundles";
import { Zeekr8xModelFitNote } from "@/components/zeekr-8x/Zeekr8xModelFitNote";
import { Zeekr8xServiceFlow } from "@/components/zeekr-8x/Zeekr8xServiceFlow";
import { Zeekr8xFaq } from "@/components/zeekr-8x/Zeekr8xFaq";
import {
  zeekr8xUpgradeProjects,
  zeekr8xScenarios,
  zeekr8xBundles,
  zeekr8xServiceSteps,
  zeekr8xFaq,
  ZEEKR_8X_PROJECT_COUNT,
} from "@/lib/zeekr-8x-products";
import { getBrandRoute, getModelRoute } from "@/lib/product-routes";
import { notFound } from "next/navigation";

const MODEL_KEY = "8X" as const;
const MODEL_NAME = "极氪 8X";
const CANONICAL_PATH = "/product/zeekr/8x";

const PAGE_TITLE = "极氪 8X 轻改升级方案｜车衣隔热膜彩绘悬浮顶底盘护板｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改整理极氪 8X 17 项热门轻改产品：车衣、隔热膜、彩绘、悬浮顶、360 软包脚垫、铝地板、平衡杆、运动包围、氛围灯、底盘护板、小桌板、挡泥板、防虫网、抬头显示、钢化膜、门槛条、牌照框。覆盖新车保护、外观个性升级、家庭座舱、智能屏幕与显示保护、行车与日常防护 5 大用车场景，到店评估按标准流程施工。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "极氪 8X 轻改",
    "极氪 8X 改装",
    "极氪 8X 车衣",
    "极氪 8X 隔热膜",
    "极氪 8X 彩绘",
    "极氪 8X 悬浮顶",
    "极氪 8X 铝地板",
    "极氪 8X 氛围灯",
    "蓝辉轻改",
  ],
  alternates: {
    canonical: CANONICAL_PATH,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [],
    type: "article",
  },
};

export default function Zeekr8xPage() {
  // Route validation
  const brandRoute = getBrandRoute("zeekr");
  const modelRoute = getModelRoute("zeekr", "8x");
  if (!brandRoute || !modelRoute) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${MODEL_NAME} 专属升级方案`,
    numberOfItems: zeekr8xUpgradeProjects.length,
    itemListElement: zeekr8xUpgradeProjects.map((p) => ({
      "@type": "ListItem" as const,
      position: p.order,
      name: p.name,
      category: p.category,
      url: `${CANONICAL_PATH}#project-${p.id}`,
    })),
  };

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col bg-zinc-950">
        <Zeekr8xTopicViewTrack
          topicKey="zeekr-8x"
          brandSlug="zeekr"
          modelSlug="8x"
          projectCount={ZEEKR_8X_PROJECT_COUNT}
        />

        <Zeekr8xHero
          totalProjects={zeekr8xUpgradeProjects.length}
          totalScenarios={zeekr8xScenarios.length}
          totalBundles={zeekr8xBundles.length}
          canonicalPath={CANONICAL_PATH}
        />

        <Zeekr8xScenarioMatrix
          scenarios={zeekr8xScenarios}
          projects={zeekr8xUpgradeProjects}
          canonicalPath={CANONICAL_PATH}
        />

        <Zeekr8xProjectGrid
          projects={zeekr8xUpgradeProjects}
          modelKey={MODEL_KEY}
        />

        <Zeekr8xBundles
          bundles={zeekr8xBundles}
          allProjects={zeekr8xUpgradeProjects}
          modelKey={MODEL_KEY}
        />

        <Zeekr8xModelFitNote />

        <Zeekr8xServiceFlow steps={zeekr8xServiceSteps} />

        <Zeekr8xFaq items={zeekr8xFaq} />

        <section className="py-16 md:py-20 bg-black border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm tracking-widest text-orange-400 mb-3">
              NEXT STEP
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {`${MODEL_NAME} 升级方案 · 到店评估`}
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mb-8">
              确认车型、配置和项目组合后到店评估，蓝辉轻改团队按标准流程施工。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/product/zeekr"
                className="inline-flex items-center px-4 py-2.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-orange-700/60 text-sm transition-colors"
              >
                返回极氪系列
              </Link>
              <Link
                href="/product"
                className="inline-flex items-center px-4 py-2.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-orange-700/60 text-sm transition-colors"
              >
                返回产品中心
              </Link>
            </div>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>
      <Footer />
    </>
  );
}
