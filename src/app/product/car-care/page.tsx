import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CarCareHero } from "@/components/product/car-care/CarCareHero";
import { getProductBreadcrumbs } from "@/lib/product-breadcrumbs";
import { CarCareValueGrid } from "@/components/product/car-care/CarCareValueGrid";
import { CarCareServiceGrid } from "@/components/product/car-care/CarCareServiceGrid";
import { CarCareServiceFlow } from "@/components/product/car-care/CarCareServiceFlow";

export const metadata: Metadata = {
  title: "洗美养护｜蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改洗美养护服务，覆盖车身外部精洗与内饰深度清洁两大服务线。中性洗车液、两桶水洗车法、蒸汽消毒、臭氧除味，为您的爱车提供细致、环保、可追溯的洗美养护体验。",
};

export default function CarCarePage() {
  const breadcrumbItems = getProductBreadcrumbs("/product/car-care");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "洗美养护｜蓝辉轻改 LANHUI",
    description: "蓝辉轻改洗美养护服务，覆盖车身外部精洗与内饰深度清洁。",
    url: "/product/car-care",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "专业精洗",
          description:
            "从预洗到擦干，覆盖车身漆面、轮毂、玻璃等区域的外表清洁。",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "内饰深度清洁",
          description:
            "对座舱内部进行系统清洁与养护，覆盖座椅、地毯、仪表台、门板等区域。",
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-grow flex flex-col">
        <CarCareHero breadcrumbItems={breadcrumbItems} />
        <CarCareValueGrid />
        <CarCareServiceGrid />
        <CarCareServiceFlow />
      </main>
      <Footer />
    </>
  );
}
