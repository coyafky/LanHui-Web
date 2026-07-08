import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ElectricStepFitmentCloud } from "@/components/product/electric-steps/ElectricStepFitmentCloud";
import { ElectricStepGallery } from "@/components/product/electric-steps/ElectricStepGallery";
import { ElectricStepHero } from "@/components/product/electric-steps/ElectricStepHero";
import { ElectricStepServiceFlow } from "@/components/product/electric-steps/ElectricStepServiceFlow";
import { ElectricStepValueGrid } from "@/components/product/electric-steps/ElectricStepValueGrid";
import { electricStepImages } from "@/lib/electric-step-products";
import { getServiceRoute } from "@/lib/product-routes";
import { getProductBreadcrumbs } from "@/lib/product-breadcrumbs";

export const metadata: Metadata = {
  title: "电动踏板与迎宾灯带方案｜蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改电动踏板图库，展示无灯款、单流光灯款、大灯带款，并围绕底盘固定点、门体信号、电气接口、防夹和离地间隙进行到店确认。",
  openGraph: {
    title: "电动踏板与迎宾灯带方案｜蓝辉轻改 LANHUI",
    description:
      "查看蓝辉轻改电动踏板方案，适合 SUV、MPV、大六座和高底盘车型到店确认。",
    images: [
      {
        url: electricStepImages[0]!.publicPath,
        width: electricStepImages[0]!.width,
        height: electricStepImages[0]!.height,
        alt: electricStepImages[0]!.alt,
      },
    ],
  },
};

export default function ElectricStepsPage() {
  const service = getServiceRoute("electric-steps");
  if (!service || service.type !== "service_category") notFound();
  const breadcrumbItems = getProductBreadcrumbs("/product/electric-steps");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "电动踏板与迎宾灯带方案",
    description: metadata.description,
    url: service.canonicalPath,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: electricStepImages.map((image, index) => ({
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
      <main id="main-content" tabIndex={-1} className="flex-grow">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ElectricStepHero breadcrumbItems={breadcrumbItems} />
        <ElectricStepValueGrid />
        <ElectricStepFitmentCloud />
        <ElectricStepGallery />
        <ElectricStepServiceFlow />
      </main>
      <Footer />
    </>
  );
}
