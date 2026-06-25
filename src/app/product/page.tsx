import type { Metadata } from "next";
import {
  ALL_SERVICES,
  getLiveBrands,
  getLiveServices,
} from "@/lib/product-routes";
import type { ServiceRoute } from "@/lib/product-routes";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductHero } from "@/components/product/ProductHero";
import { FilmServiceMap } from "@/components/product/FilmServiceMap";
import { LightModMap } from "@/components/product/LightModMap";
import { VehicleTopicMap } from "@/components/product/VehicleTopicMap";

export const metadata: Metadata = {
  title: "产品中心 | 蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改产品中心，按车型找方案，按项目看服务。覆盖汽车膜系（隐形车衣、窗膜、改色膜）、轻改装备（电动踏板、轮毂升级、底盘升级）与问界、小米、极氪等热门新能源车型升级方案。",
};

export default function ProductCenter() {
  const liveBrands = getLiveBrands();
  const liveServices = getLiveServices();

  // 按 group 拆分, 严格遵循 PRD §4.3 的 3 主题拆分
  const filmServices = liveServices.filter(
    (s: ServiceRoute) => s.group === "film"
  );
  const lightModServices = liveServices.filter(
    (s: ServiceRoute) => s.group === "light_mod"
  );

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        {/* Phase 1: ProductHero — 车辆剪影 + 4 材质切片 + 11 品牌矩阵 */}
        <ProductHero liveBrands={liveBrands} plannedCount={ALL_SERVICES.length} />

        {/* Phase 2: 按车型找 — violet 主题 11 品牌矩阵 + 3 重点品牌放大 */}
        <section
          id="vehicle-topics"
          className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <VehicleTopicMap brands={liveBrands} />
          </div>
        </section>

        {/* Phase 2: 按项目看 — FilmServiceMap (cyan) + LightModMap (orange) */}
        <section
          id="service-projects"
          className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-8">
            <FilmServiceMap services={filmServices} />
            <LightModMap services={lightModServices} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
