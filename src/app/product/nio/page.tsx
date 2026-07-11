import type { Metadata } from "next";
import { VehiclePageRenderer } from "@/components/vehicle-page";
import { nioBrandPageConfig } from "@/lib/nio-brand-page-config";
import { getProductBreadcrumbs, getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";
import { safeJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "蔚来轻改方案｜蓝辉轻改 LANHUI",
  description: "查看蔚来热门车型轻改项目，覆盖膜系、防护、舒适与实用配件。",
};

export default function NioBrandPage() {
  const breadcrumbSchema = getProductBreadcrumbSchema("/product/nio");

  return (
    <>
      <main id="main-content" tabIndex={-1} className="flex-grow">
        <VehiclePageRenderer config={nioBrandPageConfig} />
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
