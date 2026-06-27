import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LiAutoI6Hero } from "@/components/li-auto/LiAutoI6Hero";
import { LiAutoI6ProjectGrid } from "@/components/li-auto/LiAutoI6ProjectGrid";
import { LiAutoI6Bundles } from "@/components/li-auto/LiAutoI6Bundles";
import { LiAutoI6ServiceFlow } from "@/components/li-auto/LiAutoI6ServiceFlow";
import { LiAutoI6Faq } from "@/components/li-auto/LiAutoI6Faq";
import { LiAutoI6TopicViewTrack } from "@/components/li-auto/LiAutoI6TopicViewTrack";
import {
  liAutoI6UpgradeProjects,
  liAutoI6Scenarios,
  liAutoI6Bundles,
  liAutoI6ServiceSteps,
  liAutoI6Faq,
  LI_AUTO_I6_PROJECT_COUNT,
} from "@/lib/li-auto-i6-products";

const MODEL_KEY = "i6" as const;
const MODEL_NAME = "理想 i6";
const CANONICAL_PATH = "/product/li-auto/i6";

const PAGE_TITLE = "理想 i6 轻改升级方案｜车衣隔热膜星空顶流媒体后视镜｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改整理理想 i6 专属升级方案参考，覆盖车衣、隔热膜、彩绘、双拼改色、360 软包脚垫、星空顶、平衡杆、星空膜、底盘护板、小桌板、香氛系统、轮毂、流媒体后视镜、钢化膜、刹车卡钳、迎宾踏板、防虫网、挡泥板、HUD 显示保护罩和内饰镀膜等 20 项项目。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "理想 i6 轻改", "理想 i6 改装", "理想 i6 车衣",
    "理想 i6 隔热膜", "理想 i6 星空顶", "理想 i6 流媒体后视镜",
    "理想 i6 底盘护板", "理想 i6 内饰镀膜", "蓝辉轻改",
  ],
  alternates: { canonical: CANONICAL_PATH },
  openGraph: { title: PAGE_TITLE, description: PAGE_DESCRIPTION, images: [], type: "article" },
};

export default function LiAutoI6Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${MODEL_NAME} 专属轻改方案`,
    numberOfItems: liAutoI6UpgradeProjects.length,
    itemListElement: liAutoI6UpgradeProjects.map((p) => ({
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
        <LiAutoI6TopicViewTrack
          topicKey="li-auto-i6"
          brandSlug="li-auto"
          modelSlug="i6"
          projectCount={LI_AUTO_I6_PROJECT_COUNT}
        />

        <LiAutoI6Hero
          totalProjects={liAutoI6UpgradeProjects.length}
          totalScenarios={liAutoI6Scenarios.length}
          totalBundles={liAutoI6Bundles.length}
        />

        <LiAutoI6ProjectGrid
          projects={liAutoI6UpgradeProjects}
          scenarios={liAutoI6Scenarios}
          modelKey={MODEL_KEY}
        />

        <LiAutoI6Bundles
          bundles={liAutoI6Bundles}
          allProjects={liAutoI6UpgradeProjects}
          modelKey={MODEL_KEY}
        />

        <LiAutoI6ServiceFlow steps={liAutoI6ServiceSteps} />
        <LiAutoI6Faq items={liAutoI6Faq} />

        {/* 底部 CTA */}
        <section className="py-16 md:py-20 bg-black border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm tracking-widest text-amber-400 mb-3">NEXT STEP</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{`${MODEL_NAME} 升级方案 · 到店评估`}</h2>
            <p className="text-zinc-400 text-sm md:text-base mb-8">确认车型、配置和项目组合后到店评估，蓝辉轻改团队按标准流程施工。</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/product/li-auto"
                className="inline-flex items-center px-4 py-2.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-amber-700/60 text-sm transition-colors"
              >
                返回理想系列
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-6">
              不同年份、批次、版本和配置的理想 i6 在尺寸、接口、安装位和结构上可能存在差异。
              页面项目只作为轻改方向参考，最终以到店确认和施工评估为准。
            </p>
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </main>
      <Footer />
    </>
  );
}
