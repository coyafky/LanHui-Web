import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrandRoute, getModelsByBrand } from "@/lib/product-routes";
import { BrandPlaceholder } from "@/components/product/BrandPlaceholder";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getProductBreadcrumbs, getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";
import { safeJsonLd } from "@/lib/json-ld";

const PAGE_TITLE = "腾势轻改方案｜蓝辉轻改 LANHUI";
const PAGE_DESCRIPTION =
  "查看腾势热门车型轻改项目，覆盖膜系、防护、舒适与实用配件。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
};

export default function DenzaBrandPage() {
  const brand = getBrandRoute("denza");
  if (!brand || brand.type !== "vehicle_brand") notFound();
  const models = getModelsByBrand("denza").map((m) => ({
    name: m.modelName,
    href: m.canonicalPath,
  }));
  const breadcrumbItems = getProductBreadcrumbs("/product/denza");
  const breadcrumbSchema = getProductBreadcrumbSchema("/product/denza");

  return (
    <>
      <main id="main-content" tabIndex={-1} className="flex-grow">
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
        )}
        <BrandPlaceholder
          title={`${brand.brandName}轻改方案`}
          subtitle="蓝辉轻改为腾势 D9 等车型提供轻改与膜系方案"
          status={brand.status}
          accentColor={brand.accentColor}
          models={models}
          intro="腾势是比亚迪旗下高端新能源品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。"
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
