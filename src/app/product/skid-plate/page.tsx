import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceRoute } from "@/lib/product-routes";
import { BrandPlaceholder } from "@/components/product/BrandPlaceholder";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getProductBreadcrumbs, getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";
import { safeJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "底盘护板｜蓝辉轻改 LANHUI",
  description: "蓝辉轻改提供底盘护板安装服务，适合城市与轻度越野用车场景，到店沟通方案。",
};

export default async function SkidPlatePage() {
  const service = getServiceRoute("skid-plate");
  if (!service || service.type !== "service_category") notFound();
  const breadcrumbItems = getProductBreadcrumbs("/product/skid-plate");
  const breadcrumbSchema = getProductBreadcrumbSchema("/product/skid-plate");
  return (
    <>
      <main id="main-content" tabIndex={-1} className="flex-grow">
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
        )}
        <BrandPlaceholder
          title={service.title}
          subtitle={`${service.title}服务由蓝辉轻改提供，方案由团队整理中。`}
          status={service.status}
          accentColor="teal"
          serviceMeta={{ group: service.group, priority: service.priority }}
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
