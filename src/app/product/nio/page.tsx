import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getBrandRoute, getModelsByBrand } from "@/lib/product-routes";
import { BrandPlaceholder } from "@/components/product/BrandPlaceholder";

export const metadata: Metadata = {
  title: "蔚来轻改方案｜蓝辉轻改 LANHUI",
  description: "查看蔚来热门车型轻改项目，覆盖膜系、防护、舒适与实用配件。",
};

export default async function NioBrandPage() {
  const brand = getBrandRoute("nio");
  if (!brand || brand.type !== "vehicle_brand") notFound();
  const models = getModelsByBrand("nio").map((m) => ({
    name: m.modelName,
    href: m.canonicalPath,
  }));
  return (
    <>
      <Header />
      <main className="flex-grow">
        <BrandPlaceholder
          title={`${brand.brandName}轻改方案`}
          subtitle={`蓝辉轻改整理${brand.brandName}热门车型的轻改与膜系方案，方案由团队整理中。`}
          status={brand.status}
          accentColor={brand.accentColor}
          models={models}
        />
      </main>
      <Footer />
    </>
  );
}
