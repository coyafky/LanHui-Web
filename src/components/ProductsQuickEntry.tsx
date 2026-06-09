import Link from "next/link";
import { ArrowRight, Footprints, CircleDot, Wrench, Sun, Palette, ShieldCheck } from "lucide-react";
import { products } from "@/lib/products";
import type { Product } from "@/lib/products";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "electric-steps": Footprints,
  wheels: CircleDot,
  chassis: Wrench,
  "window-film": Sun,
  "color-film": Palette,
  ppf: ShieldCheck,
};

export function ProductsQuickEntry() {
  return (
    <section className="py-20 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <p className="text-sm tracking-widest text-orange-400 mb-3">PRODUCTS</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">产品快速入口</h2>
            <p className="text-zinc-400 max-w-xl">
              蓝辉轻改当前覆盖 6 个产品方向，先了解大类，再到店沟通具体方案。
            </p>
          </div>
          <Link
            href="/product"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
          >
            查看全部产品
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const Icon = ICON_MAP[product.slug] ?? Wrench;
  const isLightMod = product.group === "light-mod";
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <span
          className={`inline-flex items-center justify-center w-11 h-11 rounded-lg border ${
            isLightMod
              ? "bg-blue-950/40 border-blue-800/50 text-blue-400"
              : "bg-orange-950/40 border-orange-800/50 text-orange-400"
          }`}
        >
          <Icon className="w-6 h-6" />
        </span>
        <span
          className={`text-xs tracking-wider ${
            isLightMod ? "text-blue-400" : "text-orange-400"
          }`}
        >
          {product.groupLabel}
        </span>
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
      <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{product.tagline}</p>
      <span className="text-zinc-300 group-hover:text-white text-sm font-medium inline-flex items-center">
        了解详情
        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </span>
    </Link>
  );
}
