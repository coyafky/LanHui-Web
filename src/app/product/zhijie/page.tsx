import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowRight } from "lucide-react";
import { getBrandRoute, getModelRoute } from "@/lib/product-routes";
import { ZhijieBrandHero } from "@/components/zhijie/ZhijieBrandHero";
import { ZhijieBrandServiceFlow } from "@/components/zhijie/ZhijieBrandServiceFlow";

const PAGE_TITLE = "智界轻改方案｜蓝辉轻改 LANHUI";
const PAGE_DESCRIPTION =
  "蓝辉轻改提供智界 V9 专属升级方案参考，覆盖车衣、隔热膜、彩绘、改色膜、360脚垫、平衡杆、底盘护板、铝地板、门槛条、牌照框、挡泥板、防虫网、钢化膜和抬头显示罩共 14 个项目。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "智界 V9 轻改",
    "智界 V9 改装",
    "车衣",
    "隔热膜",
    "铝地板",
    "钢化膜",
    "蓝辉轻改",
  ],
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [],
    type: "website",
  },
};

const V9_PROJECTS = [
  "隐形车衣",
  "隔热膜",
  "彩绘",
  "改色膜",
  "360 软包脚垫",
  "平衡杆",
  "底盘护板",
  "铝地板",
  "门槛条",
  "牌照框",
  "挡泥板",
  "防虫网",
  "钢化膜",
  "抬头显示罩",
] as const;

export default function ZhijieBrandPage() {
  const brand = getBrandRoute("zhijie");
  if (!brand || brand.type !== "vehicle_brand") notFound();
  const v9 = getModelRoute("zhijie", "v9");
  if (!v9) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "智界 V9 升级项目",
    description:
      "蓝辉轻改智界 V9 专属升级方案，覆盖车衣、隔热膜、彩绘、改色膜、360 软包脚垫、平衡杆等 14 个项目。",
    itemListElement: V9_PROJECTS.map((name, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: `智界 V9 ${name}`,
    })),
  };

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        <ZhijieBrandHero totalModels={1} totalProjects={14} />

        {/* V9 车型卡 */}
        <section className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 md:mb-10">
              <p className="text-sm tracking-widest text-amber-400 mb-3">
                MODELS
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                车型
              </h2>
              <p className="text-zinc-400 text-sm md:text-base">
                查看智界 V9 专属升级方案
              </p>
            </div>

            <article className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="p-6 md:p-8 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm px-3 py-1 rounded-md bg-amber-950/40 border border-amber-900/60 text-amber-400">
                      {v9.projectCount ?? 14} 个升级项目
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    {v9.modelName} 专属升级方案
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    蓝辉轻改为智界 V9
                    提供从新车保护到座舱与底盘防护的完整升级方向参考，涵盖 14
                    个升级项目，满足新车保护、外观个性、座舱舒适、底盘防护与实用配件等多场景需求。
                  </p>
                  <Link
                    href={v9.canonicalPath}
                    className="inline-flex items-center text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors mt-auto"
                  >
                    进入智界 V9 子页
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                <div
                  className="relative aspect-[4/3] lg:aspect-auto bg-gradient-to-br from-amber-950/30 via-zinc-950 to-zinc-900 min-h-[200px]"
                  aria-hidden
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-6xl font-bold text-amber-900/20">V9</p>
                      <p className="text-xs text-zinc-600 mt-4">
                        功能预览图 · 后续补充
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <ZhijieBrandServiceFlow />

        {/* 底部 CTA + 合规说明 */}
        <section className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              需要为你的智界 V9 选几款升级？
            </h2>
            <p className="text-zinc-400 mb-6">
              到店确认车型、年款与原车状态，给出可执行的项目组合建议。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={v9.canonicalPath}
                className="inline-flex items-center px-5 py-2.5 rounded-md bg-amber-600 text-white hover:bg-amber-500 text-sm font-medium transition-colors"
              >
                查看智界 V9 升级方案
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
              <Link
                href="/product"
                className="inline-flex items-center px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-sm transition-colors"
              >
                返回产品中心
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-6">
              本页面展示的智界升级项目用于蓝辉轻改服务介绍，品牌与车型名称仅用于说明适配对象。
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
