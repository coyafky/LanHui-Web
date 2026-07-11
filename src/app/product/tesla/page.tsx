import type { Metadata } from "next";
import Link from "next/link";
import { TeslaModelFitNote } from "@/components/tesla/TeslaModelFitNote";
import { TeslaTopicViewTrack } from "@/components/tesla/TeslaTopicViewTrack";
import { VehiclePageRenderer } from "@/components/vehicle-page";
import { teslaPageConfig } from "@/lib/tesla-page-config";
import { getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";

const PAGE_TITLE =
  "特斯拉轻改项目｜车衣、隔热膜、座舱舒适、电动便利｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改特斯拉系列升级方案，覆盖车衣、隔热膜、改色膜、底盘护板、电动踏板、座舱舒适与智能影音等 42 个项目，按新车保护、外观焕新、座舱舒适、智能影音、电动便利、储物与小件 6 大场景组合，适用于 Model 3 / Model Y / Model S / Model X。";
export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "特斯拉改装",
    "特斯拉轻改",
    "Model 3",
    "Model Y",
    "Model S",
    "Model X",
    "车衣",
    "隔热膜",
    "底盘护板",
    "蓝辉轻改",
  ],
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [],
    type: "article",
  },
};

export default function TeslaTopicPage() {
  const totalProjects = teslaPageConfig.projects.length;
  const totalScenarios = teslaPageConfig.scenarios.length;
  const breadcrumbSchema = getProductBreadcrumbSchema("/product/tesla");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "特斯拉系列轻改项目升级方案",
    description: PAGE_DESCRIPTION,
    itemListElement: teslaPageConfig.projects.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: `特斯拉 ${p.name} 升级项目`,
      url: `/product/tesla#${p.id}`,
    })),
  };

  return (
    <>
      <main id="main-content" tabIndex={-1} className="flex-grow flex flex-col">
        <TeslaTopicViewTrack
          topicKey="tesla"
          totalProjects={totalProjects}
          totalScenarios={totalScenarios}
        />

        <VehiclePageRenderer config={teslaPageConfig} />

        <TeslaModelFitNote />

        <section className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              需要为你的特斯拉选几款升级？
            </h2>
            <p className="text-zinc-400 mb-6">
              到店确认车型、年款与原车状态，给出可执行的项目组合建议。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/product"
                className="inline-flex items-center px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-sm"
              >
                返回产品中心
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-6">
              本页面展示的特斯拉系列升级项目用于蓝辉轻改服务介绍，品牌与车型名称仅用于说明适配对象。
            </p>
          </div>
        </section>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
    </>
  );
}
