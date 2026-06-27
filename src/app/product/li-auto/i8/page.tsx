import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LiAutoI8Hero } from "@/components/li-auto/LiAutoI8Hero";
import { LiAutoI8ProjectGrid } from "@/components/li-auto/LiAutoI8ProjectGrid";
import { LiAutoI8Bundles } from "@/components/li-auto/LiAutoI8Bundles";
import { LiAutoI8ServiceFlow } from "@/components/li-auto/LiAutoI8ServiceFlow";
import { LiAutoI8Faq } from "@/components/li-auto/LiAutoI8Faq";
import { LiAutoI8TopicViewTrack } from "@/components/li-auto/LiAutoI8TopicViewTrack";
import {
  liAutoI8UpgradeProjects,
  liAutoI8Scenarios,
  liAutoI8Bundles,
  liAutoI8ServiceSteps,
  liAutoI8Faq,
  LI_AUTO_I8_PROJECT_COUNT,
} from "@/lib/li-auto-i8-products";

const MODEL_KEY = "I8" as const;
const MODEL_NAME = "理想 i8";
const CANONICAL_PATH = "/product/li-auto/i8";

const PAGE_TITLE =
  "理想 i8 轻改升级方案｜车衣隔热膜铝地板流媒体后视镜｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改整理理想 i8 专属升级方案参考，覆盖车衣、隔热膜、彩绘、双拼改色、360 软包脚垫、铝地板、平衡杆、包围、底盘护板、小桌板、香氛系统、轮毂、流媒体后视镜、钢化膜、刹车卡钳、门槛条、防虫网、挡泥板、显示保护罩和内饰镀膜等 20 项项目。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "理想 i8 轻改",
    "理想 i8 改装",
    "理想 i8 车衣",
    "理想 i8 隔热膜",
    "理想 i8 铝地板",
    "理想 i8 流媒体后视镜",
    "理想 i8 底盘护板",
    "理想 i8 内饰镀膜",
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

export default function LiAutoI8Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${MODEL_NAME} 专属升级方案`,
    numberOfItems: liAutoI8UpgradeProjects.length,
    itemListElement: liAutoI8UpgradeProjects.map((p) => ({
      "@type": "ListItem" as const,
      position: p.order,
      name: p.name,
      category: p.category,
      url: `${CANONICAL_PATH}#${p.key}`,
    })),
  };

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col bg-zinc-950">
        <LiAutoI8TopicViewTrack
          topicKey="li-auto-i8"
          brandSlug="li-auto"
          modelSlug="i8"
          projectCount={LI_AUTO_I8_PROJECT_COUNT}
        />

        <LiAutoI8Hero
          totalProjects={liAutoI8UpgradeProjects.length}
          totalScenarios={liAutoI8Scenarios.length}
          totalBundles={liAutoI8Bundles.length}
          canonicalPath={CANONICAL_PATH}
        />

        <LiAutoI8ProjectGrid
          projects={liAutoI8UpgradeProjects}
          scenarios={liAutoI8Scenarios}
          modelKey={MODEL_KEY}
        />

        <LiAutoI8Bundles
          bundles={liAutoI8Bundles}
          allProjects={liAutoI8UpgradeProjects}
          modelKey={MODEL_KEY}
        />

        <LiAutoI8ServiceFlow steps={liAutoI8ServiceSteps} />

        <LiAutoI8Faq items={liAutoI8Faq} />

        <section className="py-16 md:py-20 bg-black border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm tracking-widest text-amber-400 mb-3">
              NEXT STEP
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {`${MODEL_NAME} 升级方案 · 到店评估`}
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mb-8">
              确认车型、配置和项目组合后到店评估，蓝辉轻改团队按标准流程施工。
            </p>
            <Link
              href="/product/li-auto"
              className="inline-flex items-center px-4 py-2.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-amber-700/60 text-sm transition-colors"
            >
              返回理想系列
            </Link>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>
      <Footer />
    </>
  );
}
