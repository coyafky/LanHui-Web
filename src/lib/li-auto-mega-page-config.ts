import type { VehiclePageConfig } from "@/components/vehicle-page";
import {
  liAutoMegaUpgradeProjects,
  liAutoMegaScenarios,
  liAutoMegaServiceSteps,
  liAutoMegaFaq,
  liAutoMegaBundles,
  LI_AUTO_MEGA_PROJECT_COUNT,
  LI_AUTO_MEGA_SCENARIO_COUNT,
} from "@/lib/li-auto-mega-products";

export const liAutoMegaPageConfig: VehiclePageConfig = {
  theme: "blue",
  hero: {
    badge: "PROJECTS",
    title: "理想 MEGA 专属升级方案",
    subtitle: "理想 MEGA 轻改升级方案",
    description:
      "理想 MEGA 全车轻改方案，覆盖基础保护、商务座舱、外观个性、行车防护与灯光视觉 5 大场景；蓝辉轻改顺德大良店按标准化流程评估与施工。",
    stats: {
      totalProjects: LI_AUTO_MEGA_PROJECT_COUNT,
      totalScenarios: LI_AUTO_MEGA_SCENARIO_COUNT,
    },
  },
  projects: liAutoMegaUpgradeProjects.map((p) => ({
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
  scenarios: liAutoMegaScenarios.map((s) => ({
    id: s.key,
    name: s.name,
    description: s.description,
    projectIds: [...s.projectKeys],
  })),
  serviceFlow: {
    title: "服务流程",
    steps: liAutoMegaServiceSteps.map((s) => ({
      order: s.step,
      title: s.title,
      description: s.description,
    })),
  },
  faq: [...liAutoMegaFaq],
  bundles: liAutoMegaBundles.map((b) => ({
    id: b.key,
    name: b.name,
    description: b.description,
    items: [...b.projectKeys],
  })),
};
