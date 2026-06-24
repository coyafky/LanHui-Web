import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { FilmPageHero } from "@/components/film/FilmPageHero";
import { SpecsTable } from "@/components/film/SpecsTable";
import { ServiceGuaranteeSection } from "@/components/film/ServiceGuaranteeSection";
import { WindowFilmGuide } from "@/components/window-film/WindowFilmGuide";
import { WindowFilmParameterExplainer } from "@/components/window-film/WindowFilmParameterExplainer";
import { WindowFilmPackageCard } from "@/components/window-film/WindowFilmPackageCard";
import { getProduct } from "@/lib/products";
import {
  getAllWindowFilmPackageSlugsWithDetails,
  getWindowFilmPackageWithDetails,
  windowFilmDetails,
} from "@/lib/window-film-details";

// PRD §14.1 总页 metadata
export const metadata: Metadata = {
  title: "汽车窗膜套餐推荐 | 蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改汽车窗膜套餐覆盖春分、谷雨、小满、芒种、白露、网红、养生等组合，围绕隔热、防晒、隐私、清晰视线与玻璃安全，为不同用车场景提供前挡与侧后挡搭配建议。",
};

/** PRD §6.1 用户痛点（硬编码 6 条，便于编辑） */
const PAIN_POINTS: { title: string; description: string }[] = [
  {
    title: "热",
    description:
      "夏天上车像进烤箱。前挡和侧后挡组合可以降低阳光热量进入车内，减轻空调负担。",
  },
  {
    title: "晒",
    description:
      "皮肤和内饰长期暴晒。高紫外线阻隔有助于减少皮肤和内饰被阳光长期伤害。",
  },
  {
    title: "眩光",
    description:
      "逆光、午后开车刺眼。合理前挡透光率可以兼顾清晰视野和强光舒适度。",
  },
  {
    title: "隐私",
    description:
      "后排和车内物品容易被看到。侧后挡搭配隐私膜，提升车内私密性。",
  },
  {
    title: "安全",
    description:
      "玻璃破裂飞溅。膜层可提升玻璃破裂时的附着能力，降低碎片风险。",
  },
  {
    title: "新能源",
    description:
      "玻璃面积大，热量更明显。新能源车型前挡和天幕面积大，更需要系统化隔热方案。",
  },
];

const SPECS_COLUMNS = [
  { key: "model", label: "型号" },
  { key: "position", label: "安装位置" },
  { key: "vlt", label: "可见光阻隔率" },
  { key: "uvr", label: "紫外线阻隔率" },
  { key: "irr", label: "红外线阻隔率" },
  { key: "tser", label: "总太阳能阻隔率" },
  { key: "thickness", label: "厚度" },
  { key: "warranty", label: "质保" },
];

export default function WindowFilmPage() {
  const product = getProduct("window-film");
  if (!product) {
    // 总页必须有 window-film 数据，否则视为配置错误
    throw new Error("window-film product not found in products.ts");
  }

  // 合并 7 个套餐的基础数据与详情数据
  const packages = getAllWindowFilmPackageSlugsWithDetails()
    .map((slug) => getWindowFilmPackageWithDetails(slug))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <>
      <FilmPageHero
        title={product.name}
        description={product.heroDescription}
        breadcrumbLabel={product.name}
      />

      <main className="flex-grow flex flex-col bg-zinc-950">
        {/* ====== 痛点说明（PRD §6.1） ====== */}
        <section className="py-16 bg-zinc-950 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-xs tracking-widest mb-3 text-orange-400 uppercase">
                用户痛点
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                贴太阳膜，不只是为了隔热
              </h2>
              <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
                从真实用车场景出发，先看自己关心哪一项，再选对应的套餐搭配。
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {PAIN_POINTS.map((p) => (
                <div
                  key={p.title}
                  className="rounded-xl bg-zinc-900/60 border border-white/5 p-5 sm:p-6"
                >
                  <p className="text-lg font-semibold text-white">{p.title}</p>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== 参数解释（PRD §6.2） ====== */}
        <WindowFilmParameterExplainer />

        {/* ====== 选择导购（PRD §6.3） ====== */}
        <WindowFilmGuide />

        {/* ====== 套餐卡片列表（PRD §6.4） ====== */}
        <section className="py-16 bg-zinc-950 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-xs tracking-widest mb-3 text-orange-400 uppercase">
                套餐列表
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                7 个套餐，哪个更适合你？
              </h2>
              <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
                每张卡片都可以进入对应套餐的详情页，查看完整参数、适用场景与施工说明。
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {packages.map((pkg) => (
                <WindowFilmPackageCard
                  key={pkg.slug}
                  pkg={pkg}
                  details={windowFilmDetails[pkg.slug]}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ====== 单品参数表（PRD §11 布局） ====== */}
        {product.specs && product.specs.length > 0 && (
          <SpecsTable
            title="单品参数一览"
            columns={[...SPECS_COLUMNS]}
            data={product.specs}
          />
        )}

        {/* ====== 施工保障（PRD §11 布局） ====== */}
        <ServiceGuaranteeSection />
      </main>

      <Footer />
    </>
  );
}
