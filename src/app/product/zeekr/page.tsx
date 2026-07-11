import type { Metadata } from "next";
import Link from "next/link";
import { VehiclePageRenderer } from "@/components/vehicle-page";
import { zeekrSeriesPageConfig } from "@/lib/zeekr-series-page-config";
import { zeekrTopicMeta, zeekrProducts } from "@/lib/zeekr-products";
import { getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";
import { safeJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: `${zeekrTopicMeta.title} | 9X / 8X / 009 改装配件 | 蓝辉轻改 LANHUI`,
  description: zeekrTopicMeta.description,
  keywords: "极氪改装, 极氪9X, 极氪8X, 极氪009, 地板尾箱, 内饰便利, 防护配件, 蓝辉轻改",
  openGraph: {
    title: `${zeekrTopicMeta.title} | 9X / 8X / 009 改装配件 | 蓝辉轻改 LANHUI`,
    description: zeekrTopicMeta.description,
    images: [zeekrTopicMeta.previewImage],
    type: "article",
  },
};

export default function ZeekrTopicPage() {
  const breadcrumbSchema = getProductBreadcrumbSchema("/product/zeekr");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "极氪改装专题",
    description: zeekrTopicMeta.description,
    itemListElement: zeekrProducts.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: `极氪 ${p.model} ${p.name} 改装款式`,
    })),
  };

  return (
    <>
      <main id="main-content" tabIndex={-1} className="flex-grow flex flex-col">
        <VehiclePageRenderer config={zeekrSeriesPageConfig} />

        <section className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              需要确认自己车型适合哪几款？
            </h2>
            <p className="text-zinc-400 mb-6">
              电话沟通车型、年款与原车状态，给出可执行的款式组合建议。
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
              本页面展示的极氪车型改装款式用于蓝辉轻改服务介绍，品牌与车型名称仅用于说明适配对象。
            </p>
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      </main>
      {breadcrumbSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }} />
      )}
    </>
  );
}
