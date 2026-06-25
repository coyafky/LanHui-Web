import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { products, productGroups, PRODUCT_ICON_MAP } from "@/lib/products";
import type { Product } from "@/lib/products";
import { ALL_BRANDS } from "@/lib/product-routes";
import { ProductHero } from "@/components/product/ProductHero";
import { XiaomiTopicBanner } from "@/components/xiaomi/XiaomiTopicBanner";
import { WenjieTopicBanner } from "@/components/wenjie/WenjieTopicBanner";
import { ZeekrTopicBanner } from "@/components/zeekr/ZeekrTopicBanner";
import { FlooringTopicBanner } from "@/components/product/FlooringTopicBanner";

export const metadata: Metadata = {
  title: "产品中心 | 蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改产品中心，按车型找方案，按项目看服务。覆盖汽车膜系（隐形车衣、窗膜、改色膜）、轻改装备（电动踏板、轮毂升级、底盘升级）与问界、小米、极氪等热门新能源车型升级方案。",
};

export default function ProductCenter() {
  const liveBrands = ALL_BRANDS.filter((b) => b.status === "live");
  const plannedCount = ALL_BRANDS.length - liveBrands.length;

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        {/* Phase 1: 新 Hero — 车辆剪影 + 4 材质切片 + 11 品牌矩阵 */}
        <ProductHero liveBrands={liveBrands} plannedCount={plannedCount} />

        {/* 热门车型与改装专题（id 锚点给 Hero 的"按车型找"链接） */}
        <section
          id="vehicle-topics"
          className="py-16 bg-zinc-950 border-t border-zinc-900"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-sm tracking-widest text-blue-400 mb-2">
                VEHICLE TOPICS · 按车型找
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                热门车型与改装专题
              </h2>
              <p className="text-zinc-400 max-w-3xl leading-relaxed">
                按车型聚合常用改装款式，先看车型专题，再到店沟通具体方案。
              </p>
            </div>
            <div className="space-y-4 md:space-y-6">
              <XiaomiTopicBanner />
              <WenjieTopicBanner />
              <ZeekrTopicBanner />
              <FlooringTopicBanner />
            </div>
          </div>
        </section>

        {/* Product groups（id 锚点给 Hero 的"按项目看"链接） */}
        {productGroups.map((group) => {
          const groupProducts = products.filter((p) => p.group === group.id);
          const isLightMod = group.id === "light-mod";
          return (
            <section
              key={group.id}
              id={isLightMod ? undefined : "service-projects"}
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
                      {isLightMod ? "LIGHT MOD · 轻改装" : "FILM SERIES · 车膜系列"}
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
