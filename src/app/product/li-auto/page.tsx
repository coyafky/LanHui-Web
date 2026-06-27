import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LiAutoSeriesHero } from "@/components/li-auto/LiAutoSeriesHero";
import { LiAutoSeriesFeaturedGrid } from "@/components/li-auto/LiAutoSeriesFeaturedGrid";
import { LiAutoSeriesScenarios } from "@/components/li-auto/LiAutoSeriesScenarios";
import { LiAutoSeriesMoreChoices } from "@/components/li-auto/LiAutoSeriesMoreChoices";
import { LiAutoSeriesSubModelsGrid, type LiAutoSeriesSubModel } from "@/components/li-auto/LiAutoSeriesSubModelsGrid";
import { LiAutoSeriesServiceFlow } from "@/components/li-auto/LiAutoSeriesServiceFlow";
import { LiAutoSeriesFaq } from "@/components/li-auto/LiAutoSeriesFaq";
import {
  liAutoSeriesFeaturedProjects,
  liAutoSeriesOptionalProjects,
  liAutoSeriesScenarios,
  liAutoSeriesServiceSteps,
  liAutoSeriesFaq,
  type LiAutoSeriesUpgradeProject,
} from "@/lib/li-auto-series-upgrade-projects";
import { getModelRoute } from "@/lib/product-routes";

const PAGE_TITLE = "理想轻改项目｜理想车衣、隔热膜、二排铝地板、底盘护板与后排舒适升级｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改提供理想系列轻改项目参考，覆盖隐形车衣、隔热膜、二排铝地板、底盘护板、电动踏板、小桌板、防虫网、门槛条、钢化膜、内饰镀膜及更多家庭出行升级项目。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "理想改装",
    "理想L9",
    "理想MEGA",
    "理想i8",
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

function buildSubModels(): readonly LiAutoSeriesSubModel[] {
  const one = getModelRoute("li-auto", "one");
  const i8 = getModelRoute("li-auto", "i8");
  const l9 = getModelRoute("li-auto", "l9");
  const mega = getModelRoute("li-auto", "mega");
  if (!one || !i8 || !l9 || !mega) {
    throw new Error("LiAutoSeriesPage: missing li-auto ONE/i8/L9/MEGA route definitions");
  }
  return [
    {
      modelKey: "one",
      navLabel: one.navLabel,
      modelName: one.modelName,
      canonicalPath: one.canonicalPath,
      projectCount: one.projectCount ?? 0,
      hero: "面向存量家庭 SUV 车主的轻改方案，覆盖漆面保护、座舱舒适与户外拓展。",
      isPlanned: false,
    },
    {
      modelKey: "i8",
      navLabel: i8.navLabel,
      modelName: i8.modelName,
      canonicalPath: i8.canonicalPath,
      projectCount: i8.projectCount ?? 0,
      hero: "面向家庭新能源 SUV 的专属升级方案，覆盖新车保护、家庭座舱与智能显示。",
      isPlanned: false,
    },
    {
      modelKey: "L9",
      navLabel: l9.navLabel,
      modelName: l9.modelName,
      canonicalPath: l9.canonicalPath,
      projectCount: l9.projectCount ?? 0,
      hero: "面向家庭出行场景的全尺寸 SUV 升级方案，关注后排舒适与底盘防护。",
      isPlanned: false,
    },
    {
      modelKey: "MEGA",
      navLabel: mega.navLabel,
      modelName: mega.modelName,
      canonicalPath: mega.canonicalPath,
      projectCount: mega.projectCount ?? 0,
      hero: "面向高端家庭与商务场景的大型 MPV 升级方案，覆盖座舱舒适与外观升级。",
      isPlanned: false,
    },
  ];
}

export default function LiAutoSeriesPage() {
  const allProjects: readonly LiAutoSeriesUpgradeProject[] = [
    ...liAutoSeriesFeaturedProjects,
    ...liAutoSeriesOptionalProjects,
  ];
  const subModels = buildSubModels();
  const totalProjects = allProjects.length;
  const totalModels = subModels.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "理想系列项目升级方案",
    description:
      "蓝辉轻改理想系列升级方案，覆盖隐形车衣、隔热膜、二排铝地板、底盘护板、电动踏板等 40 个项目。",
    itemListElement: allProjects.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: `理想系列 ${p.name} 升级项目`,
      url: `/product/li-auto#${p.key}`,
    })),
  };

  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        <LiAutoSeriesHero
          title="理想系列项目升级方案｜蓝辉轻改 LANHUI"
          subtitle="围绕新车保护、隔热防晒、底盘防护、二排舒适和家庭出行场景，为理想车主提供系统化轻改项目参考。"
          totalProjects={totalProjects}
          totalModels={totalModels}
        />

        <LiAutoSeriesFeaturedGrid projects={liAutoSeriesFeaturedProjects} />

        <LiAutoSeriesScenarios
          scenarios={liAutoSeriesScenarios}
          allProjects={allProjects}
        />

        <LiAutoSeriesMoreChoices projects={liAutoSeriesOptionalProjects} />

        <LiAutoSeriesSubModelsGrid subModels={subModels} />

        <LiAutoSeriesServiceFlow steps={liAutoSeriesServiceSteps} />

        <LiAutoSeriesFaq items={liAutoSeriesFaq} />

        {/* 底部 CTA + 合规说明 */}
        <section className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              需要为你的理想 i8/L9/MEGA 选几款升级？
            </h2>
            <p className="text-zinc-400 mb-6">
              到店确认车型、年款与原车状态，给出可执行的项目组合建议。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/product"
                className="inline-flex items-center px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 text-sm"
              >
                返回产品中心
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-6">
              本页面展示的理想系列升级项目用于蓝辉轻改服务介绍，品牌与车型名称仅用于说明适配对象。
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
