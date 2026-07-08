import type { Metadata } from "next";
import Link from "next/link";
import { XiaomiSeriesHero } from "@/components/xiaomi-series/XiaomiSeriesHero";
import { XiaomiSeriesFeaturedGrid } from "@/components/xiaomi-series/XiaomiSeriesFeaturedGrid";
import { XiaomiSeriesScenarioMatrix } from "@/components/xiaomi-series/XiaomiSeriesScenarioMatrix";
import {
  XiaomiSeriesSubModelsGrid,
  type XiaomiSeriesSubModel,
} from "@/components/xiaomi-series/XiaomiSeriesSubModelsGrid";
import { XiaomiSeriesServiceFlow } from "@/components/xiaomi-series/XiaomiSeriesServiceFlow";
import { XiaomiSeriesFaq } from "@/components/xiaomi-series/XiaomiSeriesFaq";
import {
  XIAOMI_SERIES_PROJECT_COUNT,
  xiaomiSeriesFaq,
  xiaomiSeriesScenarios,
  xiaomiSeriesServiceSteps,
  xiaomiSeriesUpgradeProjects,
  type XiaomiSeriesUpgradeProject,
} from "@/lib/xiaomi-series-upgrade-projects";
import {
  XIAOMI_SU7_HERO_IMAGE,
  XIAOMI_SU7_PROJECT_COUNT,
} from "@/lib/xiaomi-su7-upgrade-projects";
import {
  XIAOMI_YU7_HERO_IMAGE,
  XIAOMI_YU7_PROJECT_COUNT,
} from "@/lib/xiaomi-yu7-upgrade-projects";
import { getModelRoute } from "@/lib/product-routes";
import { xiaomiTopicMeta } from "@/lib/xiaomi-products";
import { getProductBreadcrumbs, getProductBreadcrumbSchema } from "@/lib/product-breadcrumbs";

const PAGE_TITLE = "小米轻改项目｜车衣、隔热膜、Ultra 风格、运动包围与电吸门｜蓝辉轻改";
const PAGE_DESCRIPTION =
  "蓝辉轻改小米系列升级方案，覆盖车衣、隔热膜、360 软包脚垫、底盘护板、Ultra 机盖、Ultra 方向盘、电动尾翼、运动包围、电吸门等项目，为小米 SU7、YU7 提供专属升级方案。";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "小米改装",
    "小米SU7",
    "小米YU7",
    "Ultra风格",
    "车衣",
    "隔热膜",
    "电动尾翼",
    "运动包围",
    "蓝辉轻改",
  ],
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [xiaomiTopicMeta.ogImage],
    type: "article",
  },
};

function buildSubModels(): readonly XiaomiSeriesSubModel[] {
  const su7 = getModelRoute("xiaomi", "su7");
  const yu7 = getModelRoute("xiaomi", "yu7");
  if (!su7 || !yu7) {
    throw new Error("XiaomiSeriesPage: missing xiaomi SU7/YU7 route definitions");
  }

  return [
    {
      modelKey: "SU7",
      navLabel: su7.navLabel,
      modelName: su7.modelName,
      canonicalPath: su7.canonicalPath,
      projectCount: XIAOMI_SU7_PROJECT_COUNT,
      hero: "面向运动轿跑与日常通勤场景的升级方案，覆盖新车保护、外观个性、驾驶触点与 Ultra 风格。",
      image: XIAOMI_SU7_HERO_IMAGE,
    },
    {
      modelKey: "YU7",
      navLabel: yu7.navLabel,
      modelName: yu7.modelName,
      canonicalPath: yu7.canonicalPath,
      projectCount: XIAOMI_YU7_PROJECT_COUNT,
      hero: "面向家用 SUV 与城市出行场景的升级方案，关注座舱防护、底盘行车、运动包围与电动便利。",
      image: XIAOMI_YU7_HERO_IMAGE,
    },
  ];
}

export default function XiaomiTopicPage() {
  const breadcrumbItems = getProductBreadcrumbs("/product/xiaomi");
  const breadcrumbSchema = getProductBreadcrumbSchema("/product/xiaomi");
  const allProjects: readonly XiaomiSeriesUpgradeProject[] =
    xiaomiSeriesUpgradeProjects;
  const featuredProjects = allProjects.slice(0, 10);
  const subModels = buildSubModels();
  const totalModels = subModels.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "小米系列项目升级方案",
    description:
      "蓝辉轻改小米系列升级方案，覆盖车衣、隔热膜、Ultra 风格、运动包围、电吸门等项目，为小米 SU7、YU7 提供专属升级方案。",
    itemListElement: allProjects.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: `小米系列 ${p.name} 升级项目`,
      url: `/product/xiaomi#${p.id}`,
    })),
  };

  return (
    <>
      <main id="main-content" tabIndex={-1} className="flex-grow flex flex-col">
        <XiaomiSeriesHero
          title="小米系列项目升级方案｜蓝辉轻改 LANHUI"
          subtitle="围绕新车保护、外观个性、座舱质感与 Ultra 风格，整理 SU7 / YU7 可沟通的轻改升级方向。"
          totalProjects={XIAOMI_SERIES_PROJECT_COUNT}
          totalModels={totalModels}
          breadcrumbItems={breadcrumbItems}
        />

        <XiaomiSeriesFeaturedGrid projects={featuredProjects} />

        <XiaomiSeriesScenarioMatrix
          scenarios={xiaomiSeriesScenarios}
          allProjects={allProjects}
        />

        <XiaomiSeriesSubModelsGrid subModels={subModels} />

        <XiaomiSeriesServiceFlow steps={xiaomiSeriesServiceSteps} />

        <XiaomiSeriesFaq items={xiaomiSeriesFaq} />

        <section className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              需要为你的小米 SU7 / YU7 选几款升级？
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
              本页面展示的小米系列升级项目用于蓝辉轻改服务介绍，品牌与车型名称仅用于说明适配对象。
            </p>
          </div>
        </section>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
    </>
  );
}
