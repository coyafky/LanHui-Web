import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrandRoute, getModelsByBrand } from "@/lib/product-routes";
import { BrandPlaceholder } from "@/components/product/BrandPlaceholder";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getProductBreadcrumbs, getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";

export const metadata: Metadata = {
  title: "乐道轻改方案｜蓝辉轻改 LANHUI",
  description: "查看乐道热门车型轻改项目，覆盖膜系、防护、舒适与实用配件。",
};

export default async function LedaoBrandPage() {
  const brand = getBrandRoute("ledao");
  if (!brand || brand.type !== "vehicle_brand") notFound();
  const models = getModelsByBrand("ledao").map((m) => ({
    name: m.modelName,
    href: m.canonicalPath,
  }));
  const breadcrumbItems = getProductBreadcrumbs("/product/ledao");
  const breadcrumbSchema = getProductBreadcrumbSchema("/product/ledao");
  return (
    <>
      <main id="main-content" tabIndex={-1} className="flex-grow">
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
        )}
        <BrandPlaceholder
          title={`${brand.brandName}轻改方案`}
          subtitle="蓝辉轻改为乐道 L90 等车型提供轻改与膜系方案"
          status={brand.status}
          accentColor={brand.accentColor}
          models={models}
          intro="乐道是蔚来旗下家庭车品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。"
        />
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
