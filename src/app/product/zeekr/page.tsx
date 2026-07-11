import type { Metadata } from "next";
import Link from "next/link";
import { PhoneCta } from "@/components/cta/PhoneCta";
import { ZeekrAnchorNav } from "@/components/zeekr/ZeekrAnchorNav";
import { ZeekrProductTable } from "@/components/zeekr/ZeekrProductTable";
import { ProjectGrid } from "@/components/vehicle-page/ProjectGrid";
import { VehiclePageRenderer } from "@/components/vehicle-page";
import { zeekrSeriesPageConfig } from "@/lib/zeekr-series-page-config";
import {
  zeekrProductsByModel,
  zeekrTopicMeta,
  zeekrProducts,
  type ZeekrModel,
} from "@/lib/zeekr-products";
import { getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";
import { safeJsonLd } from "@/lib/json-ld";

const MODEL_SECTIONS: { key: ZeekrModel; id: string; label: string }[] = [
  { key: "9X", id: "model-9x", label: "极氪 9X（16 款）" },
  { key: "8X", id: "model-8x", label: "极氪 8X（6 款）" },
  { key: "009", id: "model-009", label: "极氪 009（1 款）" },
];


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

        {/* 锚点导航 */}
        <ZeekrAnchorNav models={MODEL_SECTIONS} />

        {/* 按车型分组 */}
        {MODEL_SECTIONS.map((section, i) => {
          const products = zeekrProductsByModel[section.key];
          const isEven = i % 2 === 0;
          return (
            <section
              key={section.id}
              id={section.id}
              className={`py-16 md:py-20 scroll-mt-24 ${isEven ? "bg-zinc-950" : "bg-black"} border-t border-zinc-900`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                  <p className="text-sm tracking-widest text-orange-400 mb-2">{section.label}</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    极氪 {section.key} 改装款式
                  </h2>
                </div>
                <ProjectGrid
                  projects={products.map((p) => ({
                    id: p.id,
                    name: p.name,
                    summary: p.category,
                    suitableFor: [p.model],
                    category: p.category,
                    imageStatus: p.imageStatus,
                    imagePublicPath: p.image.publicPath,
                    imageAlt: p.image.alt,
                    imageWidth: p.image.width,
                    imageHeight: p.image.height,
                  }))}
                  theme="orange"
                />
                <div className="mt-10">
                  <h3 className="text-base font-semibold text-zinc-300 mb-3">{section.key} 款式清单</h3>
                  <ZeekrProductTable products={products} />
                </div>
              </div>
            </section>
          );
        })}

        {/* 底部 CTA + 合规说明 */}
        <section className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              需要确认自己车型适合哪几款？
            </h2>
            <p className="text-zinc-400 mb-6">
              电话沟通车型、年款与原车状态，给出可执行的款式组合建议。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <PhoneCta source="zeekr_topic_phone_click" label="电话咨询" size="lg" metadata={{ section: "footer" }} />
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
      </main>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      {breadcrumbSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }} />
      )}
    </>
  );
}
