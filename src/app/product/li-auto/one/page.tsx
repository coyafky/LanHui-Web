import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LiAutoOneHero } from "@/components/li-auto/LiAutoOneHero";
import { LiAutoOneProjectGrid } from "@/components/li-auto/LiAutoOneProjectGrid";
import { LiAutoOneBundles } from "@/components/li-auto/LiAutoOneBundles";
import { LiAutoOneServiceFlow } from "@/components/li-auto/LiAutoOneServiceFlow";
import { LiAutoOneFaq } from "@/components/li-auto/LiAutoOneFaq";
import { LiAutoOneTopicViewTrack } from "@/components/li-auto/LiAutoOneTopicViewTrack";
import {
  liAutoOneUpgradeProjects,
  liAutoOneScenarios,
  liAutoOneBundles,
  liAutoOneServiceSteps,
  liAutoOneFaq,
  LI_AUTO_ONE_PROJECT_COUNT,
} from "@/lib/li-auto-one-products";

const MODEL_KEY = "ONE" as const;
const MODEL_NAME = "理想 ONE";
const CANONICAL_PATH = "/product/li-auto/one";

const PAGE_TITLE = "理想 ONE 轻改升级方案｜隐形车衣隔热膜电动踏板车顶平台｜蓝辉轻改";
const PAGE_DESCRIPTION = "蓝辉轻改整理理想 ONE 专属轻改方案参考，覆盖隐形车衣、隔热膜、改色膜、小桌板、氛围灯、电动踏板、旋转座椅和车顶平台加爬梯等 8 项项目。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "理想 ONE 轻改", "理想 ONE 改装", "理想 ONE 车衣",
    "理想 ONE 隔热膜", "理想 ONE 改色膜", "理想 ONE 小桌板",
    "理想 ONE 电动踏板", "理想 ONE 车顶平台", "蓝辉轻改",
  ],
  alternates: { canonical: CANONICAL_PATH },
  openGraph: { title: PAGE_TITLE, description: PAGE_DESCRIPTION, images: [], type: "article" },
};

export default function LiAutoOnePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${MODEL_NAME} 专属轻改方案`,
    numberOfItems: liAutoOneUpgradeProjects.length,
    itemListElement: liAutoOneUpgradeProjects.map((p) => ({
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
        <LiAutoOneTopicViewTrack
          topicKey="li-auto-one"
          brandSlug="li-auto"
          modelSlug="one"
          projectCount={LI_AUTO_ONE_PROJECT_COUNT}
        />

        <LiAutoOneHero
          totalProjects={liAutoOneUpgradeProjects.length}
          totalScenarios={liAutoOneScenarios.length}
          totalBundles={liAutoOneBundles.length}
          canonicalPath={CANONICAL_PATH}
        />

        <LiAutoOneProjectGrid
          projects={liAutoOneUpgradeProjects}
          scenarios={liAutoOneScenarios}
          modelKey={MODEL_KEY}
        />

        <LiAutoOneBundles
          bundles={liAutoOneBundles}
          allProjects={liAutoOneUpgradeProjects}
          modelKey={MODEL_KEY}
        />

        <LiAutoOneServiceFlow steps={liAutoOneServiceSteps} />
        <LiAutoOneFaq items={liAutoOneFaq} />

        <section className="py-16 md:py-20 bg-black border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm tracking-widest text-amber-400 mb-3">NEXT STEP</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{`${MODEL_NAME} 升级方案 · 到店评估`}</h2>
            <p className="text-zinc-400 text-sm md:text-base mb-8">确认车型、配置和项目组合后到店评估，蓝辉轻改团队按标准流程施工。</p>
            <Link href="/product/li-auto" className="inline-flex items-center px-4 py-2.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-amber-700/60 text-sm transition-colors">
              返回理想系列
            </Link>
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </main>
      <Footer />
    </>
  );
}
