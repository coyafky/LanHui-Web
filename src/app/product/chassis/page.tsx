import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { getProduct } from "@/lib/products";

export const metadata: Metadata = {
  title: "底盘升级 | 蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改底盘升级服务，围绕避震、连杆、加强件等部件的轻度升级，让日常驾驶更稳、更有质感。",
};

export default async function ChassisPage() {
  const product = getProduct("chassis");
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
