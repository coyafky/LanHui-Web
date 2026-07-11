import type { VehiclePageConfig } from "@/components/vehicle-page";
import {
  liAutoI8UpgradeProjects,
  liAutoI8Scenarios,
  liAutoI8ServiceSteps,
  liAutoI8Faq,
  LI_AUTO_I8_PROJECT_COUNT,
  LI_AUTO_I8_SCENARIO_COUNT,
} from "@/lib/li-auto-i8-products";

export const liAutoI8PageConfig: VehiclePageConfig = {
  theme: "blue",
  hero: {
    badge: "LI AUTO I8 UPGRADE",
    title: "理想 i8 专属升级方案",
    subtitle: "理想 i8 轻改升级方案",
    description:
      "20 项热门轻改产品目录，覆盖新车保护、家庭座舱、外观个性、智能屏幕与行车防护 5 大用车场景；蓝辉轻改顺德大良店到店评估、按标准流程施工。",
    stats: {
      totalProjects: LI_AUTO_I8_PROJECT_COUNT,
      totalScenarios: LI_AUTO_I8_SCENARIO_COUNT,
    },
  },
  projects: liAutoI8UpgradeProjects.map((p) => ({
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
  scenarios: liAutoI8Scenarios.map((s) => ({
    id: s.key,
    name: s.name,
    description: s.description,
    projectIds: [...s.projectKeys],
  })),
  serviceFlow: {
    title: "服务流程",
    steps: liAutoI8ServiceSteps.map((s) => ({
      order: s.step,
      title: s.title,
      description: s.description,
    })),
  },
  faq: [...liAutoI8Faq],
};
