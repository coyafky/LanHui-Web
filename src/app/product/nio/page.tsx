import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrandRoute, getModelsByBrand } from "@/lib/product-routes";
import { BrandPlaceholder } from "@/components/product/BrandPlaceholder";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getProductBreadcrumbs, getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";
import { safeJsonLd } from "@/lib/json-ld";

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
  const breadcrumbItems = getProductBreadcrumbs("/product/nio");
  const breadcrumbSchema = getProductBreadcrumbSchema("/product/nio");
  return (
    <>
      <main id="main-content" tabIndex={-1} className="flex-grow">
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
        )}
        <BrandPlaceholder
          title={`${brand.brandName}轻改方案`}
          subtitle="蓝辉轻改为蔚来 ES8 等车型提供轻改与膜系方案"
          status={brand.status}
          accentColor={brand.accentColor}
          models={models}
          intro="蔚来是高端智能电动汽车品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。"
        />
      </main>
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
        />
      )}
    </>
  );
}
