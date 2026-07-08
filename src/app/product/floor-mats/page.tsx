import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CarMatGallery } from "@/components/product/carmat/CarMatGallery";
import { CarMatHero } from "@/components/product/carmat/CarMatHero";
import { CarMatServiceFlow } from "@/components/product/carmat/CarMatServiceFlow";
import { CarMatValueGrid } from "@/components/product/carmat/CarMatValueGrid";
import { carMatGalleryImages } from "@/lib/carmat-products";
import { getServiceRoute } from "@/lib/product-routes";
import { getProductBreadcrumbs, getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";

export const metadata: Metadata = {
  title: "汽车垫与 360 软包脚垫｜蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改汽车垫与 360 软包脚垫产品展示，汇集多款座舱、后排、尾箱与细节效果图，具体车型适配以到店沟通为准。",
  openGraph: {
    title: "汽车垫与 360 软包脚垫｜蓝辉轻改 LANHUI",
    description:
      "查看蓝辉轻改现有汽车垫产品图库，围绕新车保护、家庭通勤和商务后排场景提供方案参考。",
    images: [
      {
        url: carMatGalleryImages[0]!.publicPath,
        width: carMatGalleryImages[0]!.width,
        height: carMatGalleryImages[0]!.height,
        alt: carMatGalleryImages[0]!.alt,
      },
    ],
  },
};

export default function FloorMatsPage() {
  const service = getServiceRoute("floor-mats");
  if (!service || service.type !== "service_category") notFound();
  const breadcrumbItems = getProductBreadcrumbs("/product/floor-mats");
  const breadcrumbSchema = getProductBreadcrumbSchema("/product/floor-mats");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "汽车垫与 360 软包脚垫",
    description: metadata.description,
    url: service.canonicalPath,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: carMatGalleryImages.map((image, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: image.title,
        image: image.publicPath,
      })),
    },
  };

  return (
    <>
      <main id="main-content" tabIndex={-1} className="flex-grow">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <CarMatHero breadcrumbItems={breadcrumbItems} />
        <CarMatValueGrid />
        <CarMatGallery />
        <CarMatServiceFlow />
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
