import Link from "next/link";
import { ChevronRight, Check, Sparkles, Shield, Package, Palette, Droplets } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { serviceGuarantee, type Product } from "@/lib/products";

const SPEC_COLUMN_MAP = [
  { key: "model", label: "型号" },
  { key: "position", label: "安装位置" },
  { key: "vlt", label: "可见光阻隔率" },
  { key: "uvr", label: "紫外线阻隔率" },
  { key: "irr", label: "红外线阻隔率" },
  { key: "tser", label: "总太阳能阻隔率" },
  { key: "thickness", label: "厚度" },
  { key: "warranty", label: "质保" },
] as const;

function StarRating({ rating, max = 7 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`text-sm ${i < rating ? "text-orange-400" : "text-zinc-700"}`}
        >
          ★
        </span>
      ))}
    </span>
  );
}

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
  const serviceSectionBg =
    product.slug === "ppf"
      ? "bg-black border-y border-zinc-900"
      : "bg-zinc-950";

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

        {/* ====== PPF: Protection Scenes ====== */}
        {product.slug === "ppf" && product.protectionScenes && (
          <section className="py-16 bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl border bg-orange-950/40 border-orange-800/50 mb-4">
                  <Shield className="w-6 h-6 text-orange-400" />
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  为什么要贴隐形车衣？
                </h2>
                <p className="text-zinc-400 mt-3">日常行车面临的漆面威胁</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {product.protectionScenes.map((s) => (
                  <div
                    key={s.scene}
                    className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {s.scene}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ====== PPF: Series Parameters Table ====== */}
        {product.slug === "ppf" && product.series && (
          <section className="py-16 bg-black border-y border-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  产品系列参数
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="bg-orange-950/40 text-orange-300">
                      <th className="px-4 py-3 text-left font-semibold border border-zinc-800">系列</th>
                      <th className="px-4 py-3 text-left font-semibold border border-zinc-800">型号</th>
                      <th className="px-4 py-3 text-left font-semibold border border-zinc-800">产地</th>
                      <th className="px-4 py-3 text-left font-semibold border border-zinc-800">材质</th>
                      <th className="px-4 py-3 text-left font-semibold border border-zinc-800">厚度</th>
                      <th className="px-4 py-3 text-left font-semibold border border-zinc-800">涂层</th>
                      <th className="px-4 py-3 text-left font-semibold border border-zinc-800">胶水</th>
                      <th className="px-4 py-3 text-left font-semibold border border-zinc-800">延伸率</th>
                      <th className="px-4 py-3 text-left font-semibold border border-zinc-800">耐候性</th>
                      <th className="px-4 py-3 text-left font-semibold border border-zinc-800">增亮系数</th>
                      <th className="px-4 py-3 text-left font-semibold border border-zinc-800">质保</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.series.map((s) => (
                      <tr key={s.model} className="border-b border-zinc-800">
                        <td className="px-4 py-3 border-x border-zinc-800 text-white font-medium">{s.name}</td>
                        <td className="px-4 py-3 border-x border-zinc-800 text-zinc-300">{s.model}</td>
                        <td className="px-4 py-3 border-x border-zinc-800 text-zinc-300">{s.origin ?? "\u2014"}</td>
                        <td className="px-4 py-3 border-x border-zinc-800 text-zinc-300">{s.material ?? "\u2014"}</td>
                        <td className="px-4 py-3 border-x border-zinc-800 text-zinc-300">{s.thickness ?? "\u2014"}</td>
                        <td className="px-4 py-3 border-x border-zinc-800 text-zinc-300">{s.coating ?? "\u2014"}</td>
                        <td className="px-4 py-3 border-x border-zinc-800 text-zinc-300">{s.glue ?? "\u2014"}</td>
                        <td className="px-4 py-3 border-x border-zinc-800 text-zinc-300">{s.elongation ?? "\u2014"}</td>
                        <td className="px-4 py-3 border-x border-zinc-800 text-zinc-300">{s.weathering ?? "\u2014"}</td>
                        <td className="px-4 py-3 border-x border-zinc-800 text-zinc-300">{s.gloss ?? "\u2014"}</td>
                        <td className="px-4 py-3 border-x border-zinc-800 text-zinc-300">{s.warranty ?? "\u2014"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ====== PPF: Performance Ratings ====== */}
        {product.slug === "ppf" && product.performanceRatings && (
          <section className="py-16 bg-zinc-950">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  性能等级对比
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-orange-950/40 text-orange-300">
                      <th className="px-4 py-3 text-left font-semibold border border-zinc-800">系列</th>
                      <th className="px-4 py-3 text-left font-semibold border border-zinc-800">型号</th>
                      <th className="px-4 py-3 text-center font-semibold border border-zinc-800">耐黄变</th>
                      <th className="px-4 py-3 text-center font-semibold border border-zinc-800">抗划痕</th>
                      <th className="px-4 py-3 text-center font-semibold border border-zinc-800">环保</th>
                      <th className="px-4 py-3 text-center font-semibold border border-zinc-800">耐撞</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.performanceRatings.map((r) => (
                      <tr key={r.model} className="border-b border-zinc-800">
                        <td className="px-4 py-3 border-x border-zinc-800 text-white font-medium">{r.name}</td>
                        <td className="px-4 py-3 border-x border-zinc-800 text-zinc-300">{r.model}</td>
                        <td className="px-4 py-3 border-x border-zinc-800 text-center"><StarRating rating={r.yellowing} /></td>
                        <td className="px-4 py-3 border-x border-zinc-800 text-center"><StarRating rating={r.scratch} /></td>
                        <td className="px-4 py-3 border-x border-zinc-800 text-center"><StarRating rating={r.eco} /></td>
                        <td className="px-4 py-3 border-x border-zinc-800 text-center"><StarRating rating={r.impact} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ====== Window Film: Packages ====== */}
        {product.slug === "window-film" && product.packages && (
          <section className="py-16 bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl border bg-orange-950/40 border-orange-800/50 mb-4">
                  <Package className="w-6 h-6 text-orange-400" />
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  太阳膜套餐推荐
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {product.packages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex flex-col"
                  >
                    <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                    <p className="text-sm text-zinc-400 mb-4">{pkg.audience}</p>
                    <div className="space-y-3 flex-1">
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">前挡</p>
                        <p className="text-sm text-zinc-200 font-medium">{pkg.frontProduct}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{pkg.frontParams}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">侧后挡</p>
                        <p className="text-sm text-zinc-200 font-medium">{pkg.rearProduct}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{pkg.rearParams}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      <span className="inline-block bg-orange-950/40 text-orange-300 text-xs font-semibold px-3 py-1 rounded-full">
                        质保 {pkg.warranty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ====== Window Film: Specs Table ====== */}
        {product.slug === "window-film" && product.specs && (
          <section className="py-16 bg-black border-y border-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  单品参数一览
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="bg-orange-950/40 text-orange-300">
                      {SPEC_COLUMN_MAP.map((col) => (
                        <th key={col.key} className="px-4 py-3 text-left font-semibold border border-zinc-800">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {product.specs.map((spec, i) => (
                      <tr key={spec.model ?? i} className="border-b border-zinc-800">
                        {SPEC_COLUMN_MAP.map((col) => (
                          <td key={col.key} className="px-4 py-3 border-x border-zinc-800 text-zinc-300">
                            {spec[col.key] ?? "\u2014"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ====== Color Film: Series ====== */}
        {product.slug === "color-film" && product.colorSeries && (
          <section className="py-16 bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl border bg-orange-950/40 border-orange-800/50 mb-4">
                  <Palette className="w-6 h-6 text-orange-400" />
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  改色膜系列
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {product.colorSeries.map((cs) => (
                  <div
                    key={cs.name}
                    className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"
                  >
                    <h3 className="text-xl font-bold text-white mb-1">{cs.name}</h3>
                    <p className="text-xs text-zinc-500 mb-3">{cs.englishName}</p>
                    <p className="text-sm text-zinc-300 mb-2">{cs.style}</p>
                    <p className="text-xs text-zinc-400">适合：{cs.audience}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ====== Color Film: Hot Colors ====== */}
        {product.slug === "color-film" && product.hotColors && (
          <section className="py-16 bg-black border-y border-zinc-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl border bg-orange-950/40 border-orange-800/50 mb-4">
                  <Droplets className="w-6 h-6 text-orange-400" />
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  热门颜色推荐
                </h2>
              </div>
              <div className="space-y-8">
                {product.hotColors.map((group) => (
                  <div key={group.category}>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      {group.category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {group.colors.map((color) => (
                        <span
                          key={color}
                          className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm px-3 py-1.5 rounded-full"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ====== Shared Film: Service Guarantee ====== */}
        {(product.slug === "ppf" || product.slug === "window-film" || product.slug === "color-film") && (
          <section className={`py-16 ${serviceSectionBg}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  专车专用施工保障
                </h2>
              </div>
              <div>
                {/* Acceptance standards */}
                <h3 className="text-lg font-semibold text-orange-400 mb-4">
                  验收标准
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-orange-950/40 text-orange-300">
                        <th className="px-4 py-2 text-left font-semibold border border-zinc-800">项目</th>
                        <th className="px-4 py-2 text-left font-semibold border border-zinc-800">标准</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceGuarantee.acceptance.map((a) => (
                        <tr key={a.item} className="border-b border-zinc-800">
                          <td className="px-4 py-2 border-x border-zinc-800 text-zinc-300">{a.item}</td>
                          <td className="px-4 py-2 border-x border-zinc-800 text-zinc-300">{a.standard}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

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

      </main>
      <Footer />
    </>
  );
}
