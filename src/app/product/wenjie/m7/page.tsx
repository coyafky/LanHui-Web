import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getModelRoute } from "@/lib/product-routes";
import { WenjieModelUpgradeHero } from "@/components/wenjie/model/WenjieModelUpgradeHero";
import { WenjieModelProjectGrid } from "@/components/wenjie/model/WenjieModelProjectGrid";
import { WenjieModelScenarios } from "@/components/wenjie/model/WenjieModelScenarios";
import { WenjieModelBundles } from "@/components/wenjie/model/WenjieModelBundles";
import { WenjieModelServiceFlow } from "@/components/wenjie/model/WenjieModelServiceFlow";
import { WenjieModelFaq } from "@/components/wenjie/model/WenjieModelFaq";
import {
  wenjieM7Bundles,
  wenjieM7Faq,
  wenjieM7MustHaveProjects,
  wenjieM7BusinessUpgradeProjects,
  wenjieM7PracticalAccessoryProjects,
  wenjieM7Scenarios,
  wenjieM7ServiceSteps,
  wenjieM7UpgradeProjects,
} from "@/lib/wenjie-m7-upgrade-projects";

const PAGE_TITLE =
  "问界 M7 专属升级方案｜30 个升级项目（必改、商务、实用）｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改整理问界 M7 30 个升级项目，分必改产品、高级商务升级、实用小配件 3 层，覆盖新车保护、商务接待、家庭座舱 7 大场景。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "问界M7",
    "问界M7改装",
    "车衣",
    "隔热膜",
    "电动踏板",
    "三防软包脚垫",
    "商务升级",
    "蓝辉轻改",
  ],
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [],
    type: "article",
  },
};

export default function WenjieM7Page() {
  const model = getModelRoute("wenjie", "m7");
  if (!model || model.type !== "vehicle_model") notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "问界 M7 专属升级方案",
    description: PAGE_DESCRIPTION,
    itemListElement: wenjieM7UpgradeProjects.map((p) => ({
      "@type": "ListItem",
      position: p.order,
      name: `问界 M7 ${p.name} 升级项目`,
      url: `/product/wenjie/m7#${p.id}`,
    })),
  };

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        <WenjieModelUpgradeHero
          modelKey="M7"
          modelName={model.modelName}
          title="问界 M7 专属升级方案"
          subtitle="围绕新车保护、底盘防护、电动踏板、后排娱乐、家庭座舱与商务接待 7 大场景整理 30 个升级项目。"
          tagline="必改产品 / 高级商务升级 / 实用小配件"
          totalProjects={30}
          canonicalPath={model.canonicalPath}
        />

        <WenjieModelProjectGrid
          projects={wenjieM7MustHaveProjects}
          modelKey="M7"
          titlePrefix="问界 M7 必改"
          tierLabel="必改产品 · 5 项"
        />

        <WenjieModelProjectGrid
          projects={wenjieM7BusinessUpgradeProjects}
          modelKey="M7"
          titlePrefix="问界 M7 商务"
          tierLabel="高级商务升级 · 15 项"
        />

        <WenjieModelProjectGrid
          projects={wenjieM7PracticalAccessoryProjects}
          modelKey="M7"
          titlePrefix="问界 M7 实用"
          tierLabel="实用小配件 · 10 项"
        />

        <WenjieModelScenarios
          scenarios={wenjieM7Scenarios}
          allProjects={wenjieM7UpgradeProjects}
          modelKey="M7"
          modelName={model.modelName}
        />

        <WenjieModelBundles
          bundles={wenjieM7Bundles}
          allProjects={wenjieM7UpgradeProjects}
          modelKey="M7"
          modelName={model.modelName}
        />

        <WenjieModelServiceFlow
          steps={wenjieM7ServiceSteps}
          modelKey="M7"
          modelName={model.modelName}
        />

        <WenjieModelFaq items={wenjieM7Faq} modelKey="M7" modelName={model.modelName} />

        {/* 底部导航 + 合规说明 */}
        <section className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              想为你的问界 M7 选几款升级？
            </h2>
            <p className="text-zinc-400 mb-6">
              按必改、商务和实用小配件三层结构浏览项目，确认适合自己的升级方向。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/product/wenjie"
                className="inline-flex items-center px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-cyan-700/60 text-sm"
              >
                返回问界系列
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-6">
              本页面展示的问界 M7 升级项目用于蓝辉轻改服务介绍，车型名称仅用于说明适配对象。
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
