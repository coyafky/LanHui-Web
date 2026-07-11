import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrandRoute, getModelRoute } from "@/lib/product-routes";
import { getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";
import {
  XIAOMI_SU7_PROJECT_COUNT,
  XIAOMI_SU7_HERO_IMAGE,
} from "@/lib/xiaomi-su7-upgrade-projects";
import { xiaomiSu7PageConfig } from "@/lib/xiaomi-su7-page-config";
import { XiaomiSu7TopicViewTrack } from "@/components/xiaomi-su7/XiaomiSu7TopicViewTrack";
import { VehiclePageRenderer } from "@/components/vehicle-page";

export const metadata: Metadata = {
  title: "小米 SU7 轻改项目｜车衣隔热膜Ultra机盖方向盘｜蓝辉轻改",
  description:
    "蓝辉轻改提供小米 SU7 专属轻改方案参考，覆盖车衣、隔热膜、改色膜、360软包脚垫、底盘护板、氛围灯、仪表中置、电动尾翼、电动遮阳帘、Ultra机盖、Ultra方向盘、Ultra前后包围等 21 项轻改项目。",
  alternates: {
    canonical: "/product/xiaomi/su7",
  },
  openGraph: {
    title: "小米 SU7 轻改项目｜车衣隔热膜Ultra机盖方向盘｜蓝辉轻改",
    description:
      "蓝辉轻改提供小米 SU7 专属轻改方案参考，覆盖车衣、隔热膜、改色膜、360软包脚垫、底盘护板、氛围灯、仪表中置、电动尾翼、电动遮阳帘、Ultra机盖、Ultra方向盘、Ultra前后包围等 21 项轻改项目。",
    images: [
      {
        url: XIAOMI_SU7_HERO_IMAGE.publicPath,
        width: XIAOMI_SU7_HERO_IMAGE.width,
        height: XIAOMI_SU7_HERO_IMAGE.height,
        alt: XIAOMI_SU7_HERO_IMAGE.alt,
      },
    ],
    type: "article",
  },
};

export default async function XiaomiSu7Page() {
  const brand = getBrandRoute("xiaomi");
  const model = getModelRoute("xiaomi", "su7");
  if (!brand || brand.type !== "vehicle_brand") notFound();
  if (!model || model.type !== "vehicle_model") notFound();

  const breadcrumbSchema = getProductBreadcrumbSchema("/product/xiaomi/su7");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "小米 SU7 轻改项目",
    url: "https://lanhui.com/product/xiaomi/su7",
    numberOfItems: XIAOMI_SU7_PROJECT_COUNT,
    itemListElement: xiaomiSu7PageConfig.projects.map((p, i) => ({
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
      <main id="main-content" tabIndex={-1} className="flex-grow">
        <VehiclePageRenderer config={xiaomiSu7PageConfig} />

        <section className="py-16 md:py-20 bg-black border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm tracking-widest text-orange-400 mb-3">
              NEXT STEP
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              小米 SU7 升级方案 · 到店评估
            </h2>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-8">
              不同批次和配置存在差异，具体适配请到店确认。蓝辉轻改顺德大良店提供到店评估和按标准流程施工服务。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="/product/xiaomi"
                className="inline-flex items-center px-4 py-2 rounded-md border border-orange-900/60 bg-orange-950/30 text-orange-300 hover:text-orange-200 hover:border-orange-700/60 text-sm transition-colors"
              >
                查看小米系列
              </a>
              <a
                href="/product"
                className="inline-flex items-center px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-sm transition-colors"
              >
                返回产品中心
              </a>
            </div>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
    </>
  );
}
