import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ZhijieV9TopicViewTrack } from "@/components/zhijie/ZhijieV9TopicViewTrack";
import { ZHIJIE_V9_HERO_IMAGE } from "@/lib/zhijie-v9-products";
import { zhijieV9PageConfig } from "@/lib/zhijie-v9-page-config";
import { getBrandRoute, getModelRoute } from "@/lib/product-routes";
import { getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";
import { VehiclePageRenderer } from "@/components/vehicle-page";
import { safeJsonLd } from "@/lib/json-ld";

const PAGE_TITLE = "智界 V9 专属升级方案｜车衣隔热膜铝地板钢化膜｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改整理智界 V9 14 项热门轻改产品：车衣、隔热膜、彩绘、改色膜、360脚垫、平衡杆、底盘护板、铝地板、门槛条、牌照框、挡泥板、防虫网、钢化膜和抬头显示罩。覆盖新车保护、外观个性、座舱防护、底盘与行车防护、高端质感 5 大用车场景，到店评估按标准流程施工。";

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
    images: ZHIJIE_V9_HERO_IMAGE.publicPath
      ? [
          {
            url: ZHIJIE_V9_HERO_IMAGE.publicPath,
            width: ZHIJIE_V9_HERO_IMAGE.width ?? 1448,
            height: ZHIJIE_V9_HERO_IMAGE.height ?? 1086,
            alt: ZHIJIE_V9_HERO_IMAGE.alt,
          },
        ]
      : [],
    type: "article",
  },
};

export default function ZhijieV9TopicPage() {
  const brand = getBrandRoute("zhijie");
  const model = getModelRoute("zhijie", "v9");
  if (!brand || brand.type !== "vehicle_brand") notFound();
  if (!model || model.type !== "vehicle_model") notFound();

  const totalProjects = zhijieV9PageConfig.projects.length;
  const totalScenarios = zhijieV9PageConfig.scenarios.length;

  const breadcrumbSchema = getProductBreadcrumbSchema("/product/zhijie/v9");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "智界 V9 专属升级方案",
    numberOfItems: totalProjects,
    itemListElement: zhijieV9PageConfig.projects.map((p, i) => ({
      "@type": "ListItem" as const,
      position: i + 1,
      name: p.name,
      category: p.category,
      url: `/product/zhijie/v9#${p.id}`,
    })),
  };

  return (
    <>
      <main id="main-content" tabIndex={-1} className="flex-grow flex flex-col bg-zinc-950">
        <ZhijieV9TopicViewTrack
          topicKey="zhijie-v9"
          totalProjects={totalProjects}
          totalScenarios={totalScenarios}
          totalBundles={zhijieV9PageConfig.bundles?.length ?? 0}
        />

        <VehiclePageRenderer config={zhijieV9PageConfig} />

        <section className="py-16 md:py-20 bg-black border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm tracking-widest text-orange-400 mb-3">
              NEXT STEP
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              智界 V9 升级方案 · 到店评估
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
                href="/product/zhijie"
                className="inline-flex items-center px-4 py-2.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-orange-700/60 text-sm transition-colors"
              >
                查看智界系列
              </Link>
            </div>
            <p className="text-xs text-zinc-600 mt-6 leading-relaxed">
              本页面展示的智界 V9 升级项目用于蓝辉轻改服务介绍，智界与 V9
              等商标及车型名称仅用于说明适配对象。
            </p>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
      </main>
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
        />
      )}
    </>
  );
}
