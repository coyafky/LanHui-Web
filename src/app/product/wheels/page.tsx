import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { getProduct } from "@/lib/products";

export const metadata: Metadata = {
  title: "轮毂升级 | 蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改轮毂升级服务，围绕原车数据提供样式、尺寸、颜色的合规升级方案，兼顾视觉与行驶品质。",
};

export default async function WheelsPage() {
  const product = getProduct("wheels");
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
