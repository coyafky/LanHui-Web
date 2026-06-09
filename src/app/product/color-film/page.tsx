import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { getProduct } from "@/lib/products";

export const metadata: Metadata = {
  title: "改色膜 | 蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改改色膜服务，为车主提供颜色个性化的方案，色系丰富，施工后可恢复原车漆。",
};

export default async function ColorFilmPage() {
  const product = getProduct("color-film");
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
