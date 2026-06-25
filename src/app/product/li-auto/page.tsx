import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getBrandRoute, getModelsByBrand } from "@/lib/product-routes";
import { BrandPlaceholder } from "@/components/product/BrandPlaceholder";

export const metadata: Metadata = {
  title: "理想轻改方案｜蓝辉轻改 LANHUI",
  description: "查看理想热门车型轻改项目，覆盖膜系、防护、舒适与实用配件。",
};

export default async function LiAutoBrandPage() {
  const brand = getBrandRoute("li-auto");
  if (!brand || brand.type !== "vehicle_brand") notFound();
  const models = getModelsByBrand("li-auto").map((m) => ({
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
