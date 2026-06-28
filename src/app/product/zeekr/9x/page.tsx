import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Zeekr9xHero } from "@/components/zeekr-9x/Zeekr9xHero";
import { Zeekr9xScenarioMatrix } from "@/components/zeekr-9x/Zeekr9xScenarioMatrix";
import { Zeekr9xProjectGrid } from "@/components/zeekr-9x/Zeekr9xProjectGrid";
import { Zeekr9xModelFitNote } from "@/components/zeekr-9x/Zeekr9xModelFitNote";
import { Zeekr9xServiceFlow } from "@/components/zeekr-9x/Zeekr9xServiceFlow";
import { Zeekr9xFaq } from "@/components/zeekr-9x/Zeekr9xFaq";
import { Zeekr9xTopicViewTrack } from "@/components/zeekr-9x/Zeekr9xTopicViewTrack";
import {
  ZEEKR_9X_PROJECT_COUNT,
  zeekr9xFaq,
  zeekr9xScenarios,
  zeekr9xServiceSteps,
  zeekr9xUpgradeProjects,
} from "@/lib/zeekr-9x-products";
import { getBrandRoute, getModelRoute } from "@/lib/product-routes";

const CANONICAL_PATH = "/product/zeekr/9x";

const PAGE_TITLE =
  "极氪 9X 轻改升级方案｜车衣隔热膜彩绘双拼底盘护板｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改整理极氪 9X 18 项热门轻改产品：车衣、隔热膜、彩绘、双拼改色、360 软包脚垫、铝地板、平衡杆、轮毂、运动包围、刹车卡钳、门槛条、挡泥板、防虫网、钢化膜、底盘护板、硅胶垫套餐、牌照框、内饰镀膜。覆盖新车保护、外观个性、座舱防护、底盘与行车防护、高端质感 5 大用车场景，到店评估按标准流程施工。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "极氪 9X 轻改",
    "极氪 9X 改装",
    "极氪 9X 车衣",
    "极氪 9X 隔热膜",
    "极氪 9X 铝地板",
    "极氪 9X 彩绘",
    "极氪 9X 双拼改色",
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

export default function Zeekr9xPage() {
  const brand = getBrandRoute("zeekr");
  const model = getModelRoute("zeekr", "9x");
  if (!brand || brand.type !== "vehicle_brand") notFound();
  if (!model || model.type !== "vehicle_model") notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "极氪 9X 专属升级方案",
    numberOfItems: zeekr9xUpgradeProjects.length,
    itemListElement: zeekr9xUpgradeProjects.map((p) => ({
      "@type": "ListItem" as const,
      position: p.order,
      name: p.name,
      category: p.category,
      url: `${CANONICAL_PATH}#zeekr-9x-project-${p.id}`,
    })),
  };

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col bg-zinc-950">
        <Zeekr9xTopicViewTrack
          topicKey="zeekr-9x"
          brandSlug="zeekr"
          modelSlug="9x"
          projectCount={ZEEKR_9X_PROJECT_COUNT}
        />

        <Zeekr9xHero
          totalProjects={zeekr9xUpgradeProjects.length}
          scenarioCount={zeekr9xScenarios.length}
        />

        {/* 场景矩阵 */}
        <section className="scroll-mt-24" id="scenario-new-car-protection">
          <Zeekr9xScenarioMatrix
            scenarios={zeekr9xScenarios}
            allProjects={zeekr9xUpgradeProjects}
          />
        </section>

        {/* 项目网格 */}
        <Zeekr9xProjectGrid
          projects={zeekr9xUpgradeProjects}
          scenarios={zeekr9xScenarios}
        />

        <Zeekr9xModelFitNote />

        {/* 服务流程 */}
        <Zeekr9xServiceFlow steps={zeekr9xServiceSteps} />

        <Zeekr9xFaq items={zeekr9xFaq} />

        {/* 底部 CTA */}
        <section className="py-16 md:py-20 bg-black border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm tracking-widest text-orange-400 mb-3">
              NEXT STEP
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              极氪 9X 升级方案 · 到店评估
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mb-8">
              确认车型、配置和项目组合后到店评估，蓝辉轻改团队按标准流程施工。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/product"
                className="inline-flex items-center px-4 py-2.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-sm transition-colors"
              >
                返回产品中心
              </Link>
              <Link
                href="/product/zeekr"
                className="inline-flex items-center px-4 py-2.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-orange-700/60 text-sm transition-colors"
              >
                查看极氪系列
              </Link>
            </div>
            <p className="text-xs text-zinc-600 mt-6 leading-relaxed">
              本页面展示的极氪 9X 升级项目用于蓝辉轻改服务介绍，"极氪"与"9X"等商标及车型名称仅用于说明适配对象。
            </p>
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
