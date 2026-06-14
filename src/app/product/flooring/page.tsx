import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FlooringFeatureGrid } from "@/components/product/FlooringFeatureGrid";
import { FlooringStructureGrid } from "@/components/product/FlooringStructureGrid";
import { FlooringVehicleGroup } from "@/components/product/FlooringVehicleGroup";
import { FlooringGallery } from "@/components/product/FlooringGallery";
import {
  flooringVehicleGroups,
  flooringSellingPoints,
  flooringFunctions,
  type FlooringColorVariant,
} from "@/lib/flooring-products";

const HERO_IMAGE: FlooringColorVariant = {
  id: "hero",
  colorId: "wood-brown",
  colorName: "木纹咖",
  description: "",
  assetPath: "/images/products/flooring/图片/理想/1.png",
  width: 798,
  height: 528,
  alt: "地板改装专题 hero 图：理想车型木纹咖地板总成",
};

const PRIMARY_HIGHLIGHTS = flooringSellingPoints.slice(0, 3);

export const metadata: Metadata = {
  title: "地板改装专题 | 蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改地板改装分类专题，覆盖 MPV / 新能源家庭车的地板总成、尾箱地板、迎宾踏板、休息脚踏等组件，按理想、问界、极氪、小鹏等热门车型分组展示多色效果。",
  keywords:
    "地板改装, 地板总成, 尾箱地板, 迎宾踏板, MPV, 新能源车型, 蓝辉轻改, 理想, 问界, 极氪, 小鹏",
  openGraph: {
    title: "地板改装专题 | 蓝辉轻改 LANHUI",
    description:
      "按热门车型查看 MPV / 新能源地板总成、尾箱地板与迎宾踏板升级方案。",
    images: [HERO_IMAGE.assetPath],
    type: "article",
  },
};

export default function FlooringTopicPage() {
  // 只在页面渲染时构造 JSON-LD，不引入额外 fetch / IO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "地板改装专题",
    description:
      "按品牌车型组织地板改装产品图，覆盖地板主板、滑轨、脚踏、尾箱地板等组件。",
    isPartOf: {
      "@type": "WebSite",
      name: "蓝辉轻改 LANHUI",
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: flooringVehicleGroups.map((group, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: `${group.brandName}地板总成`,
        description: group.headline,
      })),
    },
  };

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        {/* Hero */}
        <section className="relative bg-zinc-950 text-white overflow-hidden">
          <div className="absolute inset-0 -z-0" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-950/30 via-zinc-950 to-zinc-950" />
            <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-amber-700/20 blur-3xl" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-24 md:pb-16">
            <nav className="flex items-center text-sm text-zinc-500 mb-6">
              <Link
                href="/product"
                className="hover:text-white transition-colors"
              >
                产品中心
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-zinc-300">地板改装专题</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <p className="text-sm tracking-widest text-amber-400 mb-3">
                  FLOORING TOPIC
                </p>
                <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                  地板改装专题
                </h1>
                <p className="text-base md:text-lg text-zinc-400 max-w-xl leading-relaxed mb-8">
                  围绕地板主板、滑轨、脚踏和尾箱区域，按品牌车型分组展示多色效果与场景适配。
                </p>

                {/* 首屏 3 主卖点 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PRIMARY_HIGHLIGHTS.map((sp) => (
                    <div
                      key={sp.id}
                      className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4"
                    >
                      <p className="text-sm font-bold text-white mb-1">
                        {sp.title}
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {sp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
                  <Image
                    src={HERO_IMAGE.assetPath}
                    alt={HERO_IMAGE.alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    priority
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-3 text-center">
                  代表图：理想车型木纹咖地板总成
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7 个卖点（含 6 辅助） */}
        <FlooringFeatureGrid />

        {/* 5 个结构组成 */}
        <FlooringStructureGrid />

        {/* 品牌/车型分组 */}
        <section className="py-16 md:py-20 bg-black border-y border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-14">
              <p className="text-sm tracking-widest text-amber-400 mb-3">
                BRAND & MODEL
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                按品牌车型查看地板总成
              </h2>
              <p className="text-zinc-400 mt-3 max-w-2xl mx-auto">
                每个品牌模块包含代表图、颜色轮播、核心卖点和适配提示；同一车型下用轮播展示不同颜色。
              </p>
            </div>

            <div className="space-y-10 md:space-y-14">
              {flooringVehicleGroups.map((group) => (
                <FlooringVehicleGroup key={group.id} group={group} />
              ))}
            </div>
          </div>
        </section>

        {/* 图库 */}
        <FlooringGallery />

        {/* 服务流程 */}
        <section className="py-16 md:py-20 bg-zinc-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-14">
              <p className="text-sm tracking-widest text-amber-400 mb-3">
                SERVICE FLOW
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                到店沟通流程
              </h2>
            </div>

            <ol className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { step: "01", title: "车型确认", desc: "确认车型、年份与原车状态。" },
                { step: "02", title: "款式选择", desc: "在店内按品牌车型对比颜色与组件。" },
                { step: "03", title: "安装评估", desc: "评估座椅布局与施工可行性。" },
                { step: "04", title: "施工交付", desc: "按规范流程施工交付，提示用车注意事项。" },
              ].map((s) => (
                <li
                  key={s.step}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
                >
                  <p className="text-2xl font-bold text-amber-400 mb-2">
                    {s.step}
                  </p>
                  <p className="text-sm font-bold text-white mb-1">{s.title}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {s.desc}
                  </p>
                </li>
              ))}
            </ol>

            <p className="text-xs text-zinc-500 text-center mt-8">
              * 服务流程为通用描述；具体到店流程以门店沟通为准。
              {flooringFunctions.length > 0 &&
                " 当前展示的 " + flooringFunctions.length + " 个组件均为画册可见的中性描述，不构成材质或官方授权承诺。"}
            </p>
          </div>
        </section>
      </main>
      <Footer />

      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}