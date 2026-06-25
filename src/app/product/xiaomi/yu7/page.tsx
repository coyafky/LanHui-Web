import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getBrandRoute, getModelRoute } from "@/lib/product-routes";
import { BrandPlaceholder } from "@/components/product/BrandPlaceholder";

export const metadata: Metadata = {
  title: "小米 YU7 专属升级方案｜蓝辉轻改 LANHUI",
  description: "蓝辉轻改整理小米 YU7 常见升级项目，包含必改产品、舒适升级与实用配件。",
};

export default async function XiaomiYu7Page() {
  const brand = getBrandRoute("xiaomi");
  const model = getModelRoute("xiaomi", "yu7");
  if (!brand || brand.type !== "vehicle_brand") notFound();
  if (!model || model.type !== "vehicle_model") notFound();
  return (
    <>
      <Header />
      <main className="flex-grow">
        <BrandPlaceholder
          title={model.modelName}
          subtitle={`蓝辉轻改整理${model.modelName}常见升级项目，方案由团队整理中。`}
          status={model.status}
          accentColor={brand.accentColor}
        />
      </main>
      <Footer />
    </>
  );
}
