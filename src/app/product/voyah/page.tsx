import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getBrandRoute, getModelsByBrand } from "@/lib/product-routes";
import { BrandPlaceholder } from "@/components/product/BrandPlaceholder";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getProductBreadcrumbs, getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";

export const metadata: Metadata = {
  title: "岚图轻改方案｜蓝辉轻改 LANHUI",
  description: "查看岚图热门车型轻改项目，覆盖膜系、防护、舒适与实用配件。",
};

export default async function VoyahBrandPage() {
  const brand = getBrandRoute("voyah");
  if (!brand || brand.type !== "vehicle_brand") notFound();
  const models = getModelsByBrand("voyah").map((m) => ({
    name: m.modelName,
    href: m.canonicalPath,
  }));
  const breadcrumbItems = getProductBreadcrumbs("/product/voyah");
  const breadcrumbSchema = getProductBreadcrumbSchema("/product/voyah");
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-grow">
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
        )}
        <BrandPlaceholder
          title={`${brand.brandName}轻改方案`}
          subtitle={`蓝辉轻改整理${brand.brandName}热门车型的轻改与膜系方案，方案由团队整理中。`}
          status={brand.status}
          accentColor={brand.accentColor}
          models={models}
        />
      </main>
      <Footer />
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
    </>
  );
}
