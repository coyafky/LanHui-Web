import type { VehiclePageConfig } from "@/components/vehicle-page";
import {
  liAutoI6UpgradeProjects,
  liAutoI6Scenarios,
  liAutoI6ServiceSteps,
  liAutoI6Faq,
  LI_AUTO_I6_HERO_IMAGE,
  LI_AUTO_I6_PROJECT_COUNT,
  LI_AUTO_I6_SCENARIO_COUNT,
} from "@/lib/li-auto-i6-products";

export const liAutoI6PageConfig: VehiclePageConfig = {
  theme: "blue",
  hero: {
    badge: "LI AUTO I6 UPGRADE",
    title: "理想 i6 专属升级方案",
    subtitle: "理想 i6 轻改升级方案",
    description:
      "热门轻改产品目录：围绕新车保护、隔热改色、座舱防护、底盘保护、外观个性和高端 SUV 出行场景，20 项升级项目供选择；蓝辉轻改顺德大良店到店评估、按标准流程施工。",
    heroImage: {
      src: LI_AUTO_I6_HERO_IMAGE.publicPath,
      alt: LI_AUTO_I6_HERO_IMAGE.alt,
      width: LI_AUTO_I6_HERO_IMAGE.width,
      height: LI_AUTO_I6_HERO_IMAGE.height,
    },
    stats: {
      totalProjects: LI_AUTO_I6_PROJECT_COUNT,
      totalScenarios: LI_AUTO_I6_SCENARIO_COUNT,
    },
  },
  projects: liAutoI6UpgradeProjects.map((p) => ({
    id: p.key,
    name: p.name,
    summary: p.summary,
    suitableFor: [...p.suitableFor],
    ...(p.caution ? { caution: p.caution } : {}),
    category: p.category,
    imageStatus: p.imageStatus,
    imagePublicPath: p.publicPath ?? null,
    imageAlt: p.name,
    imageWidth: p.width ?? null,
    imageHeight: p.height ?? null,
  })),
  scenarios: liAutoI6Scenarios.map((s) => ({
    id: s.key,
    name: s.name,
    description: s.description,
    projectIds: [...s.projectKeys],
  })),
  serviceFlow: {
    title: "服务流程",
    steps: liAutoI6ServiceSteps.map((s) => ({
      order: s.order,
      title: s.title,
      description: s.description,
    })),
  },
  faq: [...liAutoI6Faq],
};
