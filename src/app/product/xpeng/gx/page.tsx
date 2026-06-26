import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { XpengGxTopicHero } from "@/components/xpeng/XpengGxTopicHero";
import { XpengGxProjectsAndBundles } from "@/components/xpeng/XpengGxProjectsAndBundles";
import { XpengGxScenarioMatrix } from "@/components/xpeng/XpengGxScenarioMatrix";
import { XpengGxModelFitNote } from "@/components/xpeng/XpengGxModelFitNote";
import { XpengGxServiceFlow } from "@/components/xpeng/XpengGxServiceFlow";
import { XpengGxPosterStub } from "@/components/xpeng/XpengGxPosterStub";
import { XpengGxFaq } from "@/components/xpeng/XpengGxFaq";
import { XpengGxTopicViewTrack } from "@/components/xpeng/XpengGxTopicViewTrack";
import {
  xpengGxUpgradeProjects,
  xpengGxScenarios,
  xpengGxBundles,
  xpengGxServiceSteps,
  xpengGxFaq,
} from "@/lib/xpeng-gx-products";

const PAGE_TITLE = "小鹏 GX 专属升级方案｜车衣、改色、轮毂、屏幕保护｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改小鹏 GX 单车型升级方案，覆盖车衣、隔热膜、改色膜、彩绘、轮毂、电动门【预售】、底盘护板、360 脚垫、钢化膜等 15 个项目，按新车保护、外观个性、电动便利、底盘与行车防护、屏幕与显示保护、座舱维护 6 大场景组合。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "小鹏 GX 改装",
    "小鹏 GX 轻改",
    "车衣",
    "隔热膜",
    "改色膜",
    "彩绘",
    "轮毂",
    "电动门",
    "钢化膜",
    "蓝辉轻改",
  ],
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [],
    type: "article",
  },
};

const PREORDER_PROJECT_IDS = ["xpeng-gx-electric-door"] as const;

export default function XpengGxTopicPage() {
  const totalProjects = xpengGxUpgradeProjects.length;
  const totalScenarios = xpengGxScenarios.length;
  const totalBundles = xpengGxBundles.length;
  const preorderCount = xpengGxUpgradeProjects.filter((p) =>
    (PREORDER_PROJECT_IDS as readonly string[]).includes(p.id),
  ).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/product/xpeng/gx",
    mainEntity: {
      "@type": "ItemList",
      name: "小鹏 GX 升级项目",
      numberOfItems: totalProjects,
      itemListElement: xpengGxUpgradeProjects.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: `小鹏 GX ${p.name} 升级项目`,
        url: `/product/xpeng/gx#xpeng-gx-project-${p.id}`,
      })),
    },
  };

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        <XpengGxTopicViewTrack
          topicKey="xpeng-gx"
          totalProjects={totalProjects}
          totalScenarios={totalScenarios}
          totalBundles={totalBundles}
        />

        <XpengGxTopicHero
          title="小鹏 GX 专属升级方案"
          subtitle="小鹏 GX 单车型轻改 · 兼顾原车结构与日常使用"
          totalProjects={totalProjects}
          scenarioCount={totalScenarios}
          bundleCount={totalBundles}
          preorderCount={preorderCount}
        />

        <XpengGxModelFitNote />

        <XpengGxProjectsAndBundles
          projects={xpengGxUpgradeProjects}
          bundles={xpengGxBundles}
        />

        <XpengGxScenarioMatrix
          scenarios={xpengGxScenarios}
          allProjects={xpengGxUpgradeProjects}
        />

        <XpengGxServiceFlow steps={xpengGxServiceSteps} />

        <XpengGxPosterStub />

        <XpengGxFaq items={xpengGxFaq} />

        <section className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              需要为你的小鹏 GX 选几款升级？
            </h2>
            <p className="text-zinc-400 mb-6">
              到店确认车型、年款、批次与原车状态，给出可执行的项目组合建议。电动门项目当前为预售，请到店确认排期和适配。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/product"
                className="inline-flex items-center px-4 py-2 rounded-md border border-emerald-900/60 bg-emerald-950/40 text-emerald-300 hover:text-emerald-200 hover:border-emerald-700 text-sm"
              >
                返回产品中心
              </Link>
              <Link
                href="/product/xpeng"
                className="inline-flex items-center px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-sm"
              >
                查看小鹏品牌页（整理中）
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-6">
              本页面展示的小鹏 GX 升级项目用于蓝辉轻改服务介绍，品牌与车型名称仅用于说明适配对象。具体项目以到店确认和实际施工评估为准。
            </p>
          </div>
        </section>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
