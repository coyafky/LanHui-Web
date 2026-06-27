import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LiAutoL9Hero } from "@/components/li-auto/LiAutoL9Hero";
import { LiAutoL9ProjectGrid } from "@/components/li-auto/LiAutoL9ProjectGrid";
import { LiAutoL9Bundles } from "@/components/li-auto/LiAutoL9Bundles";
import { LiAutoL9ServiceFlow } from "@/components/li-auto/LiAutoL9ServiceFlow";
import { LiAutoL9Faq } from "@/components/li-auto/LiAutoL9Faq";
import { LiAutoL9TopicViewTrack } from "@/components/li-auto/LiAutoL9TopicViewTrack";
import {
  liAutoL9UpgradeProjects,
  liAutoL9Scenarios,
  liAutoL9Bundles,
  liAutoL9ServiceSteps,
  liAutoL9Faq,
  LI_AUTO_L9_PROJECT_COUNT,
} from "@/lib/li-auto-l9-products";

const MODEL_KEY = "L9" as const;
const MODEL_NAME = "理想 L9";
const CANONICAL_PATH = "/product/li-auto/l9";

const PAGE_TITLE =
  "理想 L9 轻改升级方案｜车衣隔热膜电动踏板航空脚垫｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改整理理想 L9 专属升级方案参考，覆盖隐形车衣、隔热窗膜、彩绘改色、电动踏板、360 航空脚垫、铝合金地板、平衡杆、底盘护板、运动轮毂、防虫网、中控钢化膜、HUD 显示罩、牌照框和挡泥板等 14 项项目。新车保护、家庭座舱、外观个性、行车防护与屏幕细节 5 大场景，到店评估、按标准流程施工。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "理想 L9 轻改",
    "理想 L9 改装",
    "理想 L9 车衣",
    "理想 L9 隔热膜",
    "理想 L9 电动踏板",
    "理想 L9 航空脚垫",
    "理想 L9 底盘护板",
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

export default function LiAutoL9Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${MODEL_NAME} 专属升级方案`,
    numberOfItems: liAutoL9UpgradeProjects.length,
    itemListElement: liAutoL9UpgradeProjects.map((p) => ({
      "@type": "ListItem" as const,
      position: p.order,
      name: p.name,
      category: p.category,
      url: `${CANONICAL_PATH}#project-${p.key}`,
    })),
  };

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col bg-zinc-950">
        <LiAutoL9TopicViewTrack
          topicKey="li-auto-l9"
          brandSlug="li-auto"
          modelSlug="l9"
          projectCount={LI_AUTO_L9_PROJECT_COUNT}
        />

        <LiAutoL9Hero
          totalProjects={liAutoL9UpgradeProjects.length}
          totalScenarios={liAutoL9Scenarios.length}
          totalBundles={liAutoL9Bundles.length}
          canonicalPath={CANONICAL_PATH}
        />

        <section id="li-auto-l9-projects">
          <LiAutoL9ProjectGrid
            projects={liAutoL9UpgradeProjects}
            scenarios={liAutoL9Scenarios}
            modelKey={MODEL_KEY}
          />
        </section>

        <LiAutoL9Bundles
          bundles={liAutoL9Bundles}
          allProjects={liAutoL9UpgradeProjects}
          modelKey={MODEL_KEY}
        />

        <LiAutoL9ServiceFlow steps={liAutoL9ServiceSteps} />

        <LiAutoL9Faq items={liAutoL9Faq} />

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
