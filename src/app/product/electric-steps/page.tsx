import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { getProduct } from "@/lib/products";

export const metadata: Metadata = {
  title: "电动踏板 | 蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改电动踏板服务，面向家用 SUV / MPV / 越野等高底盘车型，提供到店沟通、规范施工与交付。",
};

export default async function ElectricStepsPage() {
  const product = getProduct("electric-steps");
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
