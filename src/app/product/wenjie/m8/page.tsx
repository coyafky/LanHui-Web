import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getBrandRoute, getModelRoute } from "@/lib/product-routes";
import {
  wenjieM8MustHaveProjects,
  wenjieM8BusinessUpgradeProjects,
  wenjieM8PracticalAccessoryProjects,
  wenjieM8UpgradeProjects,
  wenjieM8ElectricDoorProject,
  wenjieM8Scenarios,
  wenjieM8Bundles,
  wenjieM8ServiceSteps,
  wenjieM8Faq,
} from "@/lib/wenjie-m8-upgrade-projects";
import { WenjieModelUpgradeHero } from "@/components/wenjie/model/WenjieModelUpgradeHero";
import { WenjieModelProjectGrid } from "@/components/wenjie/model/WenjieModelProjectGrid";
import { WenjieM8ElectricDoorCautionCard } from "@/components/wenjie/model/WenjieM8ElectricDoorCautionCard";
import { WenjieModelScenarios } from "@/components/wenjie/model/WenjieModelScenarios";
import { WenjieModelBundles } from "@/components/wenjie/model/WenjieModelBundles";
import { WenjieModelServiceFlow } from "@/components/wenjie/model/WenjieModelServiceFlow";
import { WenjieModelFaq } from "@/components/wenjie/model/WenjieModelFaq";

const MODEL_KEY = "M8" as const;
const MODEL_NAME = "问界 M8";
const CANONICAL_PATH = "/product/wenjie/m8";

export const metadata: Metadata = {
  title:
    "问界 M8 专属升级方案｜30 个升级项目（必改、商务、实用）｜蓝辉轻改",
  description:
    "蓝辉轻改整理问界 M8 30 个升级项目，分必改产品、高级商务升级、实用小配件 3 层，含电动门升级重要提示，覆盖 6 大场景。",
  keywords: [
    "问界M8",
    "问界M8改装",
    "车衣",
    "隔热膜",
    "电动踏板",
    "电动门",
    "三防软包脚垫",
    "商务升级",
    "蓝辉轻改",
  ],
  openGraph: {
    title:
      "问界 M8 专属升级方案｜30 个升级项目（必改、商务、实用）｜蓝辉轻改",
    description:
      "蓝辉轻改整理问界 M8 30 个升级项目，分必改产品、高级商务升级、实用小配件 3 层，含电动门升级重要提示，覆盖 6 大场景。",
    images: [],
  },
};

export default async function WenjieM8Page() {
  const model = getModelRoute("wenjie", "m8");
  const brand = getBrandRoute("wenjie");
  if (!model || model.type !== "vehicle_model") notFound();
  if (!brand || brand.type !== "vehicle_brand") notFound();

  const itemListElements = wenjieM8UpgradeProjects.map((p) => ({
    "@type": "ListItem" as const,
    position: p.order,
    name: `${MODEL_NAME} ${p.name} 升级项目`,
    url: `${CANONICAL_PATH}#${p.id}`,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${MODEL_NAME} 专属升级方案`,
    itemListElement: itemListElements,
  };

  return (
    <>
      <Header />
      <main className="flex-grow bg-zinc-950">
        <WenjieModelUpgradeHero
          modelKey={MODEL_KEY}
          modelName={MODEL_NAME}
          title={`${MODEL_NAME} 专属升级方案`}
          subtitle="围绕新车保护、底盘防护、电动踏板、电动门、后排娱乐、家庭座舱与商务接待 6 大场景整理 30 个升级项目。"
          tagline="必改产品 / 高级商务升级 / 实用小配件"
          totalProjects={wenjieM8UpgradeProjects.length}
          canonicalPath={CANONICAL_PATH}
        />

        <WenjieModelProjectGrid
          projects={wenjieM8MustHaveProjects}
          modelKey={MODEL_KEY}
          titlePrefix={`${MODEL_NAME} 必改`}
          tierLabel={`必改产品 · ${wenjieM8MustHaveProjects.length} 项`}
        />

        <WenjieModelProjectGrid
          projects={wenjieM8BusinessUpgradeProjects}
          modelKey={MODEL_KEY}
          titlePrefix={`${MODEL_NAME} 商务`}
          tierLabel={`高级商务升级 · ${wenjieM8BusinessUpgradeProjects.length} 项`}
        />

        <WenjieModelProjectGrid
          projects={wenjieM8PracticalAccessoryProjects}
          modelKey={MODEL_KEY}
          titlePrefix={`${MODEL_NAME} 实用`}
          tierLabel={`实用小配件 · ${wenjieM8PracticalAccessoryProjects.length} 项`}
        />

        <section
          className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900"
          aria-labelledby="wenjie-m8-electric-door-caution-heading"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              id="wenjie-m8-electric-door-caution-heading"
              className="text-2xl md:text-3xl font-bold text-white mb-2"
            >
              电动门升级 · 安装前请确认
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mb-6">
              {`${MODEL_NAME} 商务升级中电动门项目属结构件改动，安装前请确认适配性和施工风险。`}
            </p>
            <WenjieM8ElectricDoorCautionCard project={wenjieM8ElectricDoorProject} />
          </div>
        </section>

        <WenjieModelScenarios
          scenarios={wenjieM8Scenarios}
          allProjects={wenjieM8UpgradeProjects}
          modelKey={MODEL_KEY}
          modelName={MODEL_NAME}
        />

        <WenjieModelBundles
          bundles={wenjieM8Bundles}
          allProjects={wenjieM8UpgradeProjects}
          modelKey={MODEL_KEY}
          modelName={MODEL_NAME}
        />

        <WenjieModelServiceFlow
          steps={wenjieM8ServiceSteps}
          modelKey={MODEL_KEY}
          modelName={MODEL_NAME}
        />

        <WenjieModelFaq
          items={wenjieM8Faq}
          modelKey={MODEL_KEY}
          modelName={MODEL_NAME}
        />

        <section className="py-16 md:py-20 bg-black border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm tracking-widest text-cyan-400 mb-3">
              NEXT STEP
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {`${MODEL_NAME} 升级方案 · 项目总览`}
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mb-8">
              结合车型、配置和项目组合查看升级方向，重点关注电动门等结构件适配说明。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/product/wenjie"
                className="inline-flex items-center px-4 py-2.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-cyan-700/60 text-sm transition-colors"
              >
                返回问界系列
              </Link>
            </div>
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
