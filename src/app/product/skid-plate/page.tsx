import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getServiceRoute } from "@/lib/product-routes";
import { BrandPlaceholder } from "@/components/product/BrandPlaceholder";

export const metadata: Metadata = {
  title: "底盘护板｜蓝辉轻改 LANHUI",
  description: "蓝辉轻改提供底盘护板安装服务，适合城市与轻度越野用车场景，到店沟通方案。",
};

export default async function SkidPlatePage() {
  const service = getServiceRoute("skid-plate");
  if (!service || service.type !== "service_category") notFound();
  return (
    <>
      <Header />
      <main className="flex-grow">
        <BrandPlaceholder
          title={service.title}
          subtitle={`${service.title}服务由蓝辉轻改提供，方案由团队整理中。`}
          status={service.status}
          accentColor="teal"
          serviceMeta={{ group: service.group, priority: service.priority }}
        />
      </main>
      <Footer />
    </>
  );
}
