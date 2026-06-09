import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { products, productGroups, PRODUCT_ICON_MAP } from "@/lib/products";
import type { Product } from "@/lib/products";

export const metadata: Metadata = {
  title: "产品中心 | 蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改产品中心，覆盖轻改装备（电动踏板、轮毂升级、底盘升级）与汽车膜系（窗膜、改色膜、隐形车衣）共 6 个产品方向。",
};

export default function ProductCenter() {
  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        {/* Hero */}
        <section className="relative bg-zinc-950 text-white overflow-hidden">
          <div className="absolute inset-0 -z-0" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-zinc-950 to-zinc-950" />
            <div className="absolute -top-32 left-1/3 w-96 h-96 rounded-full bg-blue-700/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-orange-500/15 blur-3xl" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
            <p className="text-sm tracking-widest text-orange-400 mb-3">PRODUCTS</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">产品中心</h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              蓝辉轻改当前覆盖 6 个产品方向，分轻改装备与汽车膜系两大组，先了解大类，再到店沟通具体方案。
            </p>
          </div>
        </section>

        {/* Product groups */}
        {productGroups.map((group) => {
          const groupProducts = products.filter((p) => p.group === group.id);
          const isLightMod = group.id === "light-mod";
          return (
            <section
              key={group.id}
              className="py-16 bg-zinc-950 border-t border-zinc-900"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
                  <div>
                    <p
                      className={`text-sm tracking-widest mb-2 ${
                        isLightMod ? "text-blue-400" : "text-orange-400"
                      }`}
                    >
                      {isLightMod ? "LIGHT MOD" : "FILM SERIES"}
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      {group.label}
                    </h2>
                    <p className="text-zinc-400 mt-2">{group.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {groupProducts.map((p) => (
                    <ProductSummaryCard
                      key={p.slug}
                      product={p}
                      accent={isLightMod ? "blue" : "orange"}
                    />
                  ))}
                </div>
              </div>
            </section>
          );
        })}

      </main>
      <Footer />
    </>
  );
}

function ProductSummaryCard({
  product,
  accent,
}: {
  product: Product;
  accent: "blue" | "orange";
}) {
  const Icon = PRODUCT_ICON_MAP[product.slug] ?? Wrench;
  const accentText = accent === "blue" ? "text-blue-400" : "text-orange-400";
  const accentBg = accent === "blue" ? "bg-blue-950/40" : "bg-orange-950/40";
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all"
    >
      <div className={`h-32 ${accentBg} flex items-center justify-center border-b border-zinc-800`}>
        <Icon className={`w-12 h-12 ${accentText}`} />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white">{product.name}</h3>
          <span className={`text-xs ${accentText} tracking-wider`}>
            {product.groupLabel}
          </span>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          {product.tagline}
        </p>
        <span className={`text-sm font-medium inline-flex items-center ${accentText}`}>
          了解详情
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
