import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { XpengGxTopicHero } from "@/components/xpeng/XpengGxTopicHero";
import { XpengGxScenarioMatrix } from "@/components/xpeng/XpengGxScenarioMatrix";
import { XpengGxProjectGrid } from "@/components/xpeng/XpengGxProjectGrid";
import { XpengGxServiceFlow } from "@/components/xpeng/XpengGxServiceFlow";
import { XpengGxFaq } from "@/components/xpeng/XpengGxFaq";
import { XpengGxTopicViewTrack } from "@/components/xpeng/XpengGxTopicViewTrack";
import {
  XPENG_GX_HERO_IMAGE,
  xpengGxUpgradeProjects,
  xpengGxScenarios,
  xpengGxBundles,
  xpengGxServiceSteps,
  xpengGxFaq,
} from "@/lib/xpeng-gx-products";
import { getBrandRoute, getModelRoute } from "@/lib/product-routes";
import { getProductBreadcrumbs, getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";

const CANONICAL_PATH = "/product/xpeng/gx";

const PAGE_TITLE = "小鹏 GX 专属升级方案｜车衣、改色、轮毂、屏幕保护｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改小鹏 GX 单车型升级方案，覆盖车衣、隔热膜、改色膜、彩绘、轮毂、电动门【预售】、底盘护板、360 脚垫、钢化膜等 15 个项目，按新车保护、外观个性、电动便利、底盘与行车防护、屏幕与显示保护、座舱维护 6 大场景组合。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "小鹏 GX 改装",
    "小鹏 GX 轻改",
    "车衣",
    "隔热膜",
    "改色膜",
    "彩绘",
    "轮毂",
    "电动门",
    "钢化膜",
    "蓝辉轻改",
  ],
  alternates: {
    canonical: CANONICAL_PATH,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: XPENG_GX_HERO_IMAGE.publicPath
      ? [
          {
            url: XPENG_GX_HERO_IMAGE.publicPath,
            width: XPENG_GX_HERO_IMAGE.width ?? 1448,
            height: XPENG_GX_HERO_IMAGE.height ?? 1086,
            alt: XPENG_GX_HERO_IMAGE.alt,
          },
        ]
      : [],
    type: "article",
  },
};

export default function XpengGxTopicPage() {
  const brand = getBrandRoute("xpeng");
  const model = getModelRoute("xpeng", "gx");
  if (!brand || brand.type !== "vehicle_brand") notFound();
  if (!model || model.type !== "vehicle_model") notFound();

  const totalProjects = xpengGxUpgradeProjects.length;
  const totalScenarios = xpengGxScenarios.length;
  const totalBundles = xpengGxBundles.length;

  const breadcrumbItems = getProductBreadcrumbs(CANONICAL_PATH);
  const breadcrumbSchema = getProductBreadcrumbSchema(CANONICAL_PATH);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "小鹏 GX 专属升级方案",
    numberOfItems: totalProjects,
    itemListElement: xpengGxUpgradeProjects.map((p) => ({
      "@type": "ListItem" as const,
      position: p.order,
      name: p.name,
      category: p.category,
      url: `${CANONICAL_PATH}#xpeng-gx-project-${p.id}`,
    })),
  };

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-grow flex flex-col bg-zinc-950">
        <XpengGxTopicViewTrack
          topicKey="xpeng-gx"
          totalProjects={totalProjects}
          totalScenarios={totalScenarios}
          totalBundles={totalBundles}
        />

        <XpengGxTopicHero
          totalProjects={totalProjects}
          scenarioCount={totalScenarios}
          heroImage={XPENG_GX_HERO_IMAGE}
          breadcrumbItems={breadcrumbItems}
        />

        {/* 场景矩阵 */}
        <section className="scroll-mt-24" id="scenario-new-car-protection">
          <XpengGxScenarioMatrix
            scenarios={xpengGxScenarios}
            allProjects={xpengGxUpgradeProjects}
          />
        </section>

        {/* 项目网格 */}
        <XpengGxProjectGrid
          projects={xpengGxUpgradeProjects}
          scenarios={xpengGxScenarios}
        />

        {/* 服务流程 */}
        <XpengGxServiceFlow steps={xpengGxServiceSteps} />

        <XpengGxFaq items={xpengGxFaq} />

        {/* 底部 CTA */}
        <section className="py-16 md:py-20 bg-black border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm tracking-widest text-orange-400 mb-3">
              NEXT STEP
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              小鹏 GX 升级方案 · 到店评估
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
                href="/product/xpeng"
                className="inline-flex items-center px-4 py-2.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-orange-700/60 text-sm transition-colors"
              >
                查看小鹏品牌页（整理中）
              </Link>
            </div>
            <p className="text-xs text-zinc-600 mt-6 leading-relaxed">
              本页面展示的小鹏 GX 升级项目用于蓝辉轻改服务介绍，品牌与车型名称仅用于说明适配对象。具体项目以到店确认和实际施工评估为准。
            </p>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>
      <Footer />
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
    </>
  );
}
