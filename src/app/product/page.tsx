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
import { CollapsibleSection } from "@/components/product/CollapsibleSection";
import { MobileProductContent } from "@/components/product/MobileProductContent";
import { P1ServiceCard } from "@/components/product/P1ServiceCard";
import { CombosPlaceholder } from "@/components/product/CombosPlaceholder";

export const metadata: Metadata = {
  title: "产品中心 | 蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改产品中心，按车型找方案，按项目看服务。覆盖汽车膜系（隐形车衣、窗膜、改色膜）、轻改装备（电动踏板、轮毂升级、底盘升级）与问界、小米、极氪等热门新能源车型升级方案。",
};

export default function ProductCenter() {
  const liveBrands = getLiveBrands();
  const liveServices = getLiveServices();

  // P0 三大地图分组
  const filmServices = liveServices.filter(
    (s: ServiceRoute) => s.group === "film"
  );
  const lightModServices = liveServices.filter(
    (s: ServiceRoute) => s.group === "light_mod"
  );

  // P1 服务 — 移动端折叠区显示 (PRD §4.5 maxVisible=4 默认)
  const p1Services = ALL_SERVICES.filter(
    (s: ServiceRoute) => s.priority === "P1"
  );

  // 移动端 sticky tab — 3 段内容切换
  const mobileTabs = [
    { id: "vehicle", label: "按车型", accentColor: "violet" as const },
    { id: "project", label: "按项目", accentColor: "cyan" as const },
    { id: "combo", label: "组合", accentColor: "orange" as const },
  ];

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        {/* Phase 1: ProductHero — 车辆剪影 + 4 材质切片 + 11 品牌矩阵 */}
        <ProductHero
          liveBrands={liveBrands}
          plannedCount={ALL_SERVICES.length}
        />

        {/* Phase 3: 移动端三段切换 / 桌面端平铺 */}
        <MobileProductContent tabs={mobileTabs}>
          {/* Tab 1: 按车型 — violet 主题 11 品牌矩阵 + 3 重点品牌放大 */}
          <section
            id="vehicle-topics"
            className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <VehicleTopicMap brands={liveBrands} />
            </div>
          </section>

          {/* Tab 2: 按项目 — FilmServiceMap + LightModMap + P1 折叠区 */}
          <section
            id="service-projects"
            className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-8">
              <FilmServiceMap services={filmServices} />
              <LightModMap services={lightModServices} />

              {/* P1 折叠区 — amber 主题, 移动端前 3 个默认可见 */}
              {p1Services.length > 0 && (
                <section
                  aria-labelledby="p1-services-title"
                  className="relative overflow-hidden rounded-3xl border border-amber-900/40 bg-zinc-950"
                >
                  <div className="p-6 md:p-8">
                    <div className="mb-6">
                      <p className="text-xs tracking-widest text-amber-400 mb-2">
                        P1 SERVICES · 整理中的服务
                      </p>
                      <h3
                        id="p1-services-title"
                        className="text-xl md:text-2xl font-bold text-white"
                      >
                        更多服务正在整理
                      </h3>
                      <p className="text-zinc-400 mt-2 text-sm md:text-base">
                        部分项目仍在打磨方案细节，欢迎到店沟通具体需求。
                      </p>
                    </div>
                    <CollapsibleSection maxVisible={3}>
                      {p1Services.map((s) => (
                        <P1ServiceCard key={s.serviceSlug} service={s} />
                      ))}
                    </CollapsibleSection>
                  </div>
                </section>
              )}
            </div>
          </section>

          {/* Tab 3: 组合 — Phase 4 替换为 RecommendationCombos */}
          <CombosPlaceholder />
        </MobileProductContent>
      </main>
      <Footer />
    </>
  );
}
