import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { getProduct } from "@/lib/products";

export const metadata: Metadata = {
  title: "汽车窗膜 | 蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改汽车窗膜服务，围绕隔热、紫外线阻隔与隐私保护，提供前挡、侧后挡等不同部位的产品搭配建议。",
};

export default async function WindowFilmPage() {
  const product = getProduct("window-film");
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
