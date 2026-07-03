import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WheelGallery } from "@/components/product/wheel/WheelGallery";
import { WheelHero } from "@/components/product/wheel/WheelHero";
import { WheelServiceFlow } from "@/components/product/wheel/WheelServiceFlow";
import { WheelValueGrid } from "@/components/product/wheel/WheelValueGrid";
import { getServiceRoute } from "@/lib/product-routes";
import { wheelGalleryImages } from "@/lib/wheel-products";

export const metadata: Metadata = {
  title: "轮毂升级与外观姿态方案｜蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改轮毂升级图库，展示多款轮毂视觉方案，并围绕尺寸、ET、孔距、中心孔、载重、胎压传感器和动平衡进行到店确认。",
  openGraph: {
    title: "轮毂升级与外观姿态方案｜蓝辉轻改 LANHUI",
    description:
      "查看蓝辉轻改现有轮毂图库，先判断外观风格，再到店确认原车数据和安装边界。",
    images: [
      {
        url: wheelGalleryImages[0]!.publicPath,
        width: wheelGalleryImages[0]!.width,
        height: wheelGalleryImages[0]!.height,
        alt: wheelGalleryImages[0]!.alt,
      },
    ],
  },
};

export default function WheelsPage() {
  const service = getServiceRoute("wheels");
  if (!service || service.type !== "service_category") notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "轮毂升级与外观姿态方案",
    description: metadata.description,
    url: service.canonicalPath,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: wheelGalleryImages.map((image, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: image.title,
        image: image.publicPath,
      })),
    },
  };

  return (
    <>
      <Header />
      <main className="flex-grow">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <WheelHero />
        <WheelValueGrid />
        <WheelGallery />
        <WheelServiceFlow />
      </main>
      <Footer />
    </>
  );
}
