import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getServiceRoute } from "@/lib/product-routes";
import { BrandPlaceholder } from "@/components/product/BrandPlaceholder";

export const metadata: Metadata = {
  title: "商务舒适升级｜蓝辉轻改 LANHUI",
  description: "蓝辉轻改提供商务舒适升级服务，适合商务出行与高端家用车型，到店沟通方案。",
};

export default async function BusinessComfortPage() {
  const service = getServiceRoute("business-comfort");
  if (!service || service.type !== "service_category") notFound();
  return (
    <>
      <Header />
      <main className="flex-grow">
        <BrandPlaceholder
          title={service.title}
          subtitle={`${service.title}服务由蓝辉轻改提供，方案由团队整理中。`}
          status={service.status}
          accentColor="amber"
          serviceMeta={{ group: service.group, priority: service.priority }}
        />
      </main>
      <Footer />
    </>
  );
}
