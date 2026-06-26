import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PhoneCta } from "@/components/cta/PhoneCta";
import { WenjieSeriesHero } from "@/components/wenjie/WenjieSeriesHero";
import { WenjieSeriesFeaturedGrid } from "@/components/wenjie/WenjieSeriesFeaturedGrid";
import { WenjieSeriesScenarios } from "@/components/wenjie/WenjieSeriesScenarios";
import { WenjieSeriesMoreChoices } from "@/components/wenjie/WenjieSeriesMoreChoices";
import { WenjieSeriesSubModelsGrid, type WenjieSeriesSubModel } from "@/components/wenjie/WenjieSeriesSubModelsGrid";
import { WenjieSeriesPosterStub } from "@/components/wenjie/WenjieSeriesPosterStub";
import { WenjieSeriesServiceFlow } from "@/components/wenjie/WenjieSeriesServiceFlow";
import { WenjieSeriesFaq } from "@/components/wenjie/WenjieSeriesFaq";
import {
  wenjieSeriesFeaturedProjects,
  wenjieSeriesOptionalProjects,
  wenjieSeriesScenarios,
  wenjieSeriesServiceSteps,
  wenjieSeriesFaq,
  type WenjieSeriesUpgradeProject,
} from "@/lib/wenjie-series-upgrade-projects";
import { wenjieM6UpgradeProjects } from "@/lib/wenjie-m6-upgrade-projects";
import { wenjieM7UpgradeProjects } from "@/lib/wenjie-m7-upgrade-projects";
import { wenjieM8UpgradeProjects } from "@/lib/wenjie-m8-upgrade-projects";
import { getModelRoute } from "@/lib/product-routes";

const PAGE_TITLE = "问界轻改项目｜车衣、隔热膜、二排铝地板、底盘护板与电动踏板｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改问界系列升级方案，覆盖车衣、隔热膜、二排铝地板、底盘护板、电动踏板、小桌板等 34 个项目，按新车保护、家庭后排、上下车便利、座舱舒适、智能影音、外观升级、露营/户外 7 大场景组合，为问界 M6、M7、M8 提供专属升级方案。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "问界改装",
    "问界M6",
    "问界M7",
    "问界M8",
    "电动踏板",
    "车衣",
    "隔热膜",
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

function buildSubModels(): readonly WenjieSeriesSubModel[] {
  const m6 = getModelRoute("wenjie", "m6");
  const m7 = getModelRoute("wenjie", "m7");
  const m8 = getModelRoute("wenjie", "m8");
  if (!m6 || !m7 || !m8) {
    throw new Error("WenjieSeriesPage: missing wenjie M6/M7/M8 route definitions");
  }
  return [
    {
      modelKey: "M6",
      navLabel: m6.navLabel,
      modelName: m6.modelName,
      canonicalPath: m6.canonicalPath,
      projectCount: wenjieM6UpgradeProjects.length,
      hero: "适合家用与城市通勤的 SUV 升级方案，覆盖新车保护、外观个性、电动便利与家庭座舱。",
    },
    {
      modelKey: "M7",
      navLabel: m7.navLabel,
      modelName: m7.modelName,
      canonicalPath: m7.canonicalPath,
      projectCount: wenjieM7UpgradeProjects.length,
      hero: "面向家庭出行场景的 6 座旗舰 SUV 升级方案，关注后排舒适、智能影音与底盘防护。",
    },
    {
      modelKey: "M8",
      navLabel: m8.navLabel,
      modelName: m8.modelName,
      canonicalPath: m8.canonicalPath,
      projectCount: wenjieM8UpgradeProjects.length,
      hero: "面向商务与高端家庭场景的全尺寸 SUV 升级方案，覆盖外观升级、座舱氛围与露营配置。",
    },
  ];
}

const POSTERS = [
  { key: "hero", label: "系列预览主视觉" },
  { key: "scenarios", label: "7 大用车场景视觉" },
  { key: "models", label: "M6 / M7 / M8 三车型对比" },
  { key: "service", label: "6 步到店服务流程" },
] as const;

export default function WenjieSeriesPage() {
  const allProjects: readonly WenjieSeriesUpgradeProject[] = [
    ...wenjieSeriesFeaturedProjects,
    ...wenjieSeriesOptionalProjects,
  ];
  const subModels = buildSubModels();
  const totalProjects = allProjects.length;
  const totalModels = subModels.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "问界系列项目升级方案",
    description:
      "蓝辉轻改问界系列升级方案，覆盖车衣、隔热膜、二排铝地板、底盘护板、电动踏板等 34 个项目，为问界 M6、M7、M8 提供专属升级方案。",
    itemListElement: allProjects.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: `问界系列 ${p.name} 升级项目`,
      url: `/product/wenjie#${p.key}`,
    })),
  };

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        <WenjieSeriesHero
          title="问界系列项目升级方案｜蓝辉轻改 LANHUI"
          subtitle="专业轻改，安全可靠，提升体验，焕新出行"
          totalProjects={totalProjects}
          totalModels={totalModels}
        />

        <WenjieSeriesFeaturedGrid projects={wenjieSeriesFeaturedProjects} />

        <WenjieSeriesScenarios
          scenarios={wenjieSeriesScenarios}
          allProjects={allProjects}
        />

        <WenjieSeriesMoreChoices projects={wenjieSeriesOptionalProjects} />

        <WenjieSeriesSubModelsGrid subModels={subModels} />

        <WenjieSeriesPosterStub posters={POSTERS} />

        <WenjieSeriesServiceFlow steps={wenjieSeriesServiceSteps} />

        <WenjieSeriesFaq items={wenjieSeriesFaq} />

        {/* 底部 CTA + 合规说明 */}
        <section className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              需要为你的问界 M6/M7/M8 选几款升级？
            </h2>
            <p className="text-zinc-400 mb-6">
              到店确认车型、年款与原车状态，给出可执行的项目组合建议。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <PhoneCta
                source="wenjie_series_footer_phone"
                label="电话咨询"
                size="lg"
                metadata={{ section: "footer" }}
              />
              <Link
                href="/product"
                className="inline-flex items-center px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-sm"
              >
                返回产品中心
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-6">
              本页面展示的问界系列升级项目用于蓝辉轻改服务介绍，品牌与车型名称仅用于说明适配对象。
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