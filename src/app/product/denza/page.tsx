import type { Metadata } from "next";
import { VehiclePageRenderer } from "@/components/vehicle-page";
import { denzaBrandPageConfig } from "@/lib/denza-brand-page-config";
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
  const breadcrumbSchema = getProductBreadcrumbSchema("/product/denza");

  return (
    <>
      <main id="main-content" tabIndex={-1} className="flex-grow">
        <VehiclePageRenderer config={denzaBrandPageConfig} />
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
