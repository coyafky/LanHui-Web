import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getBrandRoute, getModelRoute } from "@/lib/product-routes";
import { DenzaBrandHero } from "@/components/denza/DenzaBrandHero";
import { DenzaBrandServiceFlow } from "@/components/denza/DenzaBrandServiceFlow";

const PAGE_TITLE = "腾势轻改方案｜蓝辉轻改 LANHUI";
const PAGE_DESCRIPTION =
  "蓝辉轻改提供腾势 D9 专属升级方案参考，覆盖车衣、隔热膜、彩绘、双拼改色、360软包脚垫、铝地板、平衡杆、amxt包围、bskt运动包围、底盘护板、小桌板、氛围灯、日行灯、抬头显示、吸顶电视、D柱灯、铝合金行李架、挡泥板、防虫网、钢化膜、门槛条、牌照框、内饰镀膜共 23 个项目。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "腾势 D9 轻改",
    "腾势 D9 改装",
    "车衣",
    "隔热膜",
    "铝地板",
    "蓝辉轻改",
  ],
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [],
    type: "website",
  },
};

const DENZA_SERVICE_STEPS: readonly { step: number; title: string; description: string }[] = [
  { step: 1, title: "车型确认", description: "确认腾势 D9 的年份、版本和配置差异" },
  { step: 2, title: "项目选择", description: "根据新车保护、后排体验、商务接待或外观升级选择项目" },
  { step: 3, title: "到店评估", description: "现场确认安装位置、接口、材料和工期" },
  { step: 4, title: "施工安装", description: "按项目标准施工，过程保护车辆" },
  { step: 5, title: "验收交付", description: "检查外观、功能和安装效果" },
  { step: 6, title: "售后支持", description: "提供使用注意事项和后续维护建议" },
] as const;

const TOTAL_MODELS = 1;
const TOTAL_PROJECTS = 23;

export default function DenzaBrandPage() {
  const brand = getBrandRoute("denza");
  if (!brand || brand.type !== "vehicle_brand") notFound();

  const model = getModelRoute("denza", "d9");
  if (!model) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "腾势 D9 专属升级方案",
    description: PAGE_DESCRIPTION,
    itemListElement: Array.from({ length: TOTAL_PROJECTS }, (_, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: `腾势 D9 升级项目 ${idx + 1}`,
      url: model.canonicalPath,
    })),
  };

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        <DenzaBrandHero
          totalModels={TOTAL_MODELS}
          totalProjects={TOTAL_PROJECTS}
        />

        {/* D9 车型卡 */}
        <section className="py-16 md:py-20 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <p className="text-xs tracking-widest text-pink-400 mb-2">
                  AVAILABLE NOW
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  腾势 D9
                </h2>
                <p className="text-zinc-400 mb-4 leading-relaxed">
                  面向商务与家庭 MPV 车主的专属精品升级方案，覆盖新车保护、后排舒适、
                  内饰质感与驾驶辅助体验。
                </p>
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="text-xs px-2 py-1 rounded-md bg-pink-950/40 border border-pink-900/60 text-pink-400">
                    {TOTAL_PROJECTS} 个升级项目
                  </span>
                </div>
                <Link
                  href={model.canonicalPath}
                  className="inline-flex items-center px-4 py-2 rounded-md bg-pink-600 text-white text-sm hover:bg-pink-500 transition-colors"
                >
                  进入腾势 D9 子页
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>

              <div className="relative">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 bg-gradient-to-br from-pink-950/20 via-zinc-900 to-zinc-950">
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    aria-hidden
                  >
                    <div className="text-center">
                      <p className="text-5xl font-bold text-pink-900/20">D9</p>
                      <p className="text-xs text-zinc-600 mt-4">预览图 · 后续补充</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <DenzaBrandServiceFlow steps={DENZA_SERVICE_STEPS} />

        {/* 底部 CTA */}
        <section className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              需要为你的腾势 D9 选几款升级？
            </h2>
            <p className="text-zinc-400 mb-6">
              到店确认车型、年款与原车状态，给出可执行的项目组合建议。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={model.canonicalPath}
                className="inline-flex items-center px-5 py-2.5 rounded-md bg-pink-600 text-white text-sm hover:bg-pink-500 transition-colors"
              >
                腾势 D9 升级方案
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
              <Link
                href="/product"
                className="inline-flex items-center px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-sm"
              >
                返回产品中心
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-6">
              本页面展示的腾势升级项目用于蓝辉轻改服务介绍，品牌与车型名称仅用于说明适配对象。
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
