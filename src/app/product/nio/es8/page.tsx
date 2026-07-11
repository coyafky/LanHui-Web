import type { Metadata } from "next";
import Link from "next/link";
import { NioEs8TopicViewTrack } from "@/components/nio/NioEs8TopicViewTrack";
import { getProductBreadcrumbs, getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";
import { nioEs8PageConfig } from "@/lib/nio-es8-page-config";
import { VehiclePageRenderer } from "@/components/vehicle-page";

const MODEL_NAME = "蔚来 ES8";
const CANONICAL_PATH = "/product/nio/es8";

const PAGE_TITLE =
  "蔚来 ES8 轻改升级方案｜车衣隔热膜彩绘双拼底盘护板｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改整理蔚来 ES8 17 项热门轻改产品：车衣、隔热膜、彩绘、双拼改色、360 脚垫、铝地板、平衡杆、轮毂、运动包围、小桌板、挡泥板、防虫网、钢化膜、底盘护板、刹车卡钳、内饰镀膜。覆盖新车保护、外观个性、家庭座舱、行车与日常防护 4 大用车场景，到店评估、按标准流程施工。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "蔚来 ES8 轻改",
    "蔚来 ES8 改装",
    "蔚来 ES8 车衣",
    "蔚来 ES8 隔热膜",
    "蔚来 ES8 彩绘",
    "蔚来 ES8 双拼改色",
    "蔚来 ES8 铝地板",
    "蔚来 ES8 软包脚垫",
    "蓝辉轻改",
  ],
  alternates: {
    canonical: CANONICAL_PATH,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [],
    type: "article",
  },
};

export default function NioEs8Page() {
  const breadcrumbItems = getProductBreadcrumbs(CANONICAL_PATH);
  const breadcrumbSchema = getProductBreadcrumbSchema(CANONICAL_PATH);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${MODEL_NAME} 专属升级方案`,
    numberOfItems: nioEs8PageConfig.projects.length,
    itemListElement: nioEs8PageConfig.projects.map((p, i) => ({
      "@type": "ListItem" as const,
      position: i + 1,
      name: p.name,
      category: p.category,
      url: `${CANONICAL_PATH}#${p.id}`,
    })),
  };

  return (
    <>
      <main id="main-content" tabIndex={-1} className="flex-grow flex flex-col bg-zinc-950">
        <NioEs8TopicViewTrack
          topicKey="nio-es8"
          brandSlug="nio"
          modelSlug="es8"
          projectCount={nioEs8PageConfig.projects.length}
        />

        <VehiclePageRenderer config={nioEs8PageConfig} />

        <section className="py-16 md:py-20 bg-black border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm tracking-widest text-sky-400 mb-3">
              NEXT STEP
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {`${MODEL_NAME} 升级方案 · 到店评估`}
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mb-8">
              确认车型、配置和项目组合后到店评估，蓝辉轻改团队按标准流程施工。
            </p>
            <Link
              href="/product/nio"
              className="inline-flex items-center px-4 py-2.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-sky-700/60 text-sm transition-colors"
            >
              返回蔚来系列
            </Link>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
    </>
  );
}
