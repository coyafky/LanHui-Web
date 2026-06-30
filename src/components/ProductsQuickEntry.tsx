import Link from "next/link";
import { ArrowRight, ChevronRight, Wrench } from "lucide-react";
import { products, PRODUCT_ICON_MAP } from "@/lib/products";
import type { Product } from "@/lib/products";
import { ALL_BRANDS, ALL_MODELS } from "@/lib/product-routes";
import type { AccentColor } from "@/lib/product-routes";

const ACCENT_TEXT: Record<AccentColor, string> = {
  cyan: "text-cyan-300",
  orange: "text-orange-300",
  amber: "text-amber-300",
  emerald: "text-emerald-300",
  violet: "text-violet-300",
  pink: "text-pink-300",
  blue: "text-blue-300",
  teal: "text-teal-300",
  red: "text-red-300",
  sky: "text-sky-300",
};

const ACCENT_BG_SUBTLE: Record<AccentColor, string> = {
  cyan: "bg-cyan-950/30 border-cyan-800/40 text-cyan-400",
  orange: "bg-orange-950/30 border-orange-800/40 text-orange-400",
  amber: "bg-amber-950/30 border-amber-800/40 text-amber-400",
  emerald: "bg-emerald-950/30 border-emerald-800/40 text-emerald-400",
  violet: "bg-violet-950/30 border-violet-800/40 text-violet-400",
  pink: "bg-pink-950/30 border-pink-800/40 text-pink-400",
  blue: "bg-blue-950/30 border-blue-800/40 text-blue-400",
  teal: "bg-teal-950/30 border-teal-800/40 text-teal-400",
  red: "bg-red-950/30 border-red-800/40 text-red-400",
  sky: "bg-sky-950/30 border-sky-800/40 text-sky-400",
};

const ACCENT_STRIPE: Record<AccentColor, string> = {
  cyan: "from-cyan-500/70 via-cyan-400/40 to-transparent",
  orange: "from-orange-500/70 via-orange-400/40 to-transparent",
  amber: "from-amber-500/70 via-amber-400/40 to-transparent",
  emerald: "from-emerald-500/70 via-emerald-400/40 to-transparent",
  violet: "from-violet-500/70 via-violet-400/40 to-transparent",
  pink: "from-pink-500/70 via-pink-400/40 to-transparent",
  blue: "from-blue-500/70 via-blue-400/40 to-transparent",
  teal: "from-teal-500/70 via-teal-400/40 to-transparent",
  red: "from-red-500/70 via-red-400/40 to-transparent",
  sky: "from-sky-500/70 via-sky-400/40 to-transparent",
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

        {/* 品牌车型入口 */}
        <div className="mt-16 pt-12 border-t border-zinc-800">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
            <div>
              <p className="text-sm tracking-widest text-blue-400 mb-3">BRANDS</p>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">品牌车型</h3>
              <p className="text-zinc-400 max-w-xl">
                按品牌找到你的车型，查看专属升级方案。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {ALL_BRANDS.filter((b) => b.status === "live").map((brand) => {
              const models = ALL_MODELS.filter(
                (m) => m.brandSlug === brand.brandSlug,
              );
              return (
                <div
                  key={brand.brandSlug}
                  className="group bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all overflow-hidden hover:-translate-y-0.5"
                >
                  {/* 顶部品牌色强调条纹 */}
                  <div
                    className={`h-0.5 bg-gradient-to-r ${ACCENT_STRIPE[brand.accentColor]} shrink-0`}
                    aria-hidden
                  />

                  <div className="p-4">
                    {/* 品牌名链接 */}
                    <Link
                      href={brand.canonicalPath}
                      className={`inline-flex items-center gap-1.5 text-sm font-bold hover:underline underline-offset-4 transition-colors ${ACCENT_TEXT[brand.accentColor]}`}
                    >
                      {brand.brandName}
                      <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </Link>

                    {/* 车型标签列表 */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {models.length > 0 ? (
                        models.map((m) => (
                          <Link
                            key={m.modelSlug}
                            href={m.canonicalPath}
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs border transition-colors hover:border-zinc-500 ${ACCENT_BG_SUBTLE[brand.accentColor]}`}
                          >
                            {m.navLabel}
                          </Link>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-600">
                          即将上线
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const Icon = PRODUCT_ICON_MAP[product.slug] ?? Wrench;
  const isLightMod = product.group === "light-mod";
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all overflow-hidden"
    >
      <div
        className={`flex items-center justify-center h-16 ${
          isLightMod
            ? "bg-blue-950/40 border-b border-blue-800/50"
            : "bg-orange-950/40 border-b border-orange-800/50"
        }`}
      >
        <Icon
          className={`w-6 h-6 ${
            isLightMod ? "text-blue-400" : "text-orange-400"
          }`}
        />
      </div>
      <div className="p-6">
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
        <p className="text-orange-400 text-sm font-medium mb-1">{product.tagline}</p>
        <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{product.cardDescription}</p>
        <span className="text-zinc-300 group-hover:text-white text-sm font-medium inline-flex items-center">
          了解详情
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
