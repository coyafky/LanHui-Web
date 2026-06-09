import Link from "next/link";
import { ChevronRight, Check, Users, Sparkles, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { brand } from "@/lib/brand";
import type { Product } from "@/lib/products";

type ProductDetailProps = {
  product: Product;
};

export function ProductDetail({ product }: ProductDetailProps) {
  const isLightMod = product.group === "light-mod";
  const accentText = isLightMod ? "text-blue-400" : "text-orange-400";
  const accentBg = isLightMod ? "bg-blue-500" : "bg-orange-500";
  const accentGradient = isLightMod
    ? "from-blue-500 to-blue-700"
    : "from-orange-500 to-orange-600";

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        {/* Hero */}
        <section className="relative bg-zinc-950 text-white overflow-hidden">
          <div
            className="absolute inset-0 -z-0"
            aria-hidden
          >
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-950 to-zinc-900" />
            <div
              className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-30 ${accentBg}`}
            />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center text-sm text-zinc-500 mb-6">
              <Link href="/product" className="hover:text-white transition-colors">
                产品中心
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-zinc-300">{product.name}</span>
            </nav>
            <p className={`inline-block text-xs tracking-widest mb-3 ${accentText}`}>
              {product.groupLabel}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              {product.heroDescription}
            </p>
          </div>
        </section>

        {/* Tagline highlight */}
        <section className="py-12 bg-black border-y border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-2xl md:text-3xl font-semibold text-white">
              <span
                className={`bg-gradient-to-r ${accentGradient} bg-clip-text text-transparent`}
              >
                {product.tagline}
              </span>
            </p>
          </div>
        </section>

        {/* Audience */}
        <section className="py-16 bg-zinc-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border ${
                  isLightMod
                    ? "bg-blue-950/40 border-blue-800/50"
                    : "bg-orange-950/40 border-orange-800/50"
                } mb-4`}
              >
                <Users className={`w-6 h-6 ${accentText}`} />
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">适合人群</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {product.audience.map((a) => (
                <div
                  key={a}
                  className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 text-center"
                >
                  <p className="text-zinc-200">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core values */}
        <section className="py-16 bg-black border-y border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border ${
                  isLightMod
                    ? "bg-blue-950/40 border-blue-800/50"
                    : "bg-orange-950/40 border-orange-800/50"
                } mb-4`}
              >
                <Sparkles className={`w-6 h-6 ${accentText}`} />
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">核心价值</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {product.values.map((v) => (
                <div
                  key={v.title}
                  className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"
                >
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4 ${
                      isLightMod ? "bg-blue-950/40" : "bg-orange-950/40"
                    }`}
                  >
                    <Check className={`w-5 h-5 ${accentText}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {v.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service process */}
        <section className="py-16 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white">服务流程</h2>
              <p className="text-zinc-400 mt-3">到店交付，统一规范</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {product.process.map((p) => (
                <div
                  key={p.step}
                  className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"
                >
                  <p
                    className={`text-3xl font-bold ${accentText} mb-3 tracking-wider`}
                  >
                    {p.step}
                  </p>
                  <h3 className="text-lg font-semibold text-white mb-2">{p.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-black border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              预约{brand.currentStore}，了解 {product.name}
            </h2>
            <p className="text-zinc-400 mb-8">
              先到店沟通用车场景与升级需求，再给出适合您车型的方案建议。
            </p>
            <Link
              href={product.cta.href}
              className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-white font-medium bg-gradient-to-r ${accentGradient} shadow-lg transition-colors`}
            >
              <MapPin className="w-5 h-5" />
              {product.cta.label}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
