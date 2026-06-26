import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PhoneCta } from "@/components/cta/PhoneCta";
import { WenjieModelUpgradeHero } from "@/components/wenjie/model/WenjieModelUpgradeHero";
import { WenjieModelProjectGrid } from "@/components/wenjie/model/WenjieModelProjectGrid";
import { WenjieModelScenarios } from "@/components/wenjie/model/WenjieModelScenarios";
import { WenjieModelBundles } from "@/components/wenjie/model/WenjieModelBundles";
import { WenjieModelServiceFlow } from "@/components/wenjie/model/WenjieModelServiceFlow";
import { WenjieModelFaq } from "@/components/wenjie/model/WenjieModelFaq";
import { WenjieModelPosterStub } from "@/components/wenjie/model/WenjieModelPosterStub";
import { getModelRoute } from "@/lib/product-routes";
import {
  wenjieM6UpgradeProjects,
  wenjieM6Scenarios,
  wenjieM6Bundles,
  wenjieM6ServiceSteps,
  wenjieM6Faq,
} from "@/lib/wenjie-m6-upgrade-projects";

const PAGE_TITLE =
  "问界 M6 专属升级方案｜车衣、隔热膜、电动踏板与底盘护板｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改整理问界 M6 17 个升级项目，涵盖新车保护、底盘防护、电动踏板、家庭座舱与智能显示 6 大场景。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "问界M6",
    "问界M6改装",
    "车衣",
    "隔热膜",
    "电动踏板",
    "底盘护板",
    "蓝辉轻改",
  ],
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [],
    type: "article",
  },
};

export default function WenjieM6Page() {
  const model = getModelRoute("wenjie", "m6");
  if (!model || model.type !== "vehicle_model") notFound();

  const itemListElements = wenjieM6UpgradeProjects.map((p, idx) => ({
    "@type": "ListItem" as const,
    position: idx + 1,
    name: `问界 M6 ${p.name} 升级项目`,
    url: `/product/wenjie/m6#${p.id}`,
  }));

  return (
    <>
      <Header />
      <main className="flex-grow">
        <WenjieModelUpgradeHero
          modelKey="M6"
          modelName="问界 M6"
          title="问界 M6 专属升级方案"
          subtitle="围绕新车保护、玻璃隔热、外观个性、电动踏板、底盘防护、家庭座舱和智能显示 7 大场景整理升级项目。"
          tagline="新车保护 / 外观个性 / 电动便利 / 家庭座舱"
          totalProjects={17}
          canonicalPath="/product/wenjie/m6"
        />

        <WenjieModelProjectGrid
          projects={wenjieM6UpgradeProjects}
          modelKey="M6"
          titlePrefix="问界 M6 升级"
        />

        <WenjieModelScenarios
          scenarios={wenjieM6Scenarios}
          allProjects={wenjieM6UpgradeProjects}
          modelKey="M6"
          modelName="问界 M6"
        />

        <WenjieModelBundles
          bundles={wenjieM6Bundles}
          allProjects={wenjieM6UpgradeProjects}
          modelKey="M6"
          modelName="问界 M6"
        />

        <WenjieModelPosterStub
          modelKey="M6"
          modelName="问界 M6"
          posters={[
            { key: "hero", label: "M6 系列海报 · 主形象" },
            { key: "features", label: "M6 升级项目矩阵" },
            { key: "bundles", label: "M6 套餐组合" },
            { key: "service", label: "M6 服务流程" },
          ]}
        />

        <WenjieModelServiceFlow
          steps={wenjieM6ServiceSteps}
          modelKey="M6"
          modelName="问界 M6"
        />

        <WenjieModelFaq items={wenjieM6Faq} modelKey="M6" modelName="问界 M6" />

        <section
          className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900"
          aria-labelledby="wenjie-m6-bottom-cta"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2
              id="wenjie-m6-bottom-cta"
              className="text-2xl md:text-3xl font-bold text-white mb-4"
            >
              想为问界 M6 选择合适的升级组合？
            </h2>
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed mb-8">
              电话咨询，到店评估后给出 M6 专属方案；也可返回问界系列查看 M7 / M8 项目。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <PhoneCta
                source="wenjie_m6_bottom_phone"
                label="电话咨询"
                size="lg"
                metadata={{ modelKey: "M6", section: "bottom" }}
              />
              <Link
                href="/product/wenjie"
                className="inline-flex items-center px-4 py-2.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-cyan-700/60 text-sm transition-colors"
              >
                返回问界系列
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "问界 M6 专属升级方案",
            itemListElement: itemListElements,
          }),
        }}
      />
    </>
  );
}