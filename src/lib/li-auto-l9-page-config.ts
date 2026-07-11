import type { VehiclePageConfig } from "@/components/vehicle-page";
import {
  liAutoL9UpgradeProjects,
  liAutoL9Scenarios,
  liAutoL9ServiceSteps,
  liAutoL9Faq,
  liAutoL9Bundles,
} from "@/lib/li-auto-l9-products";

export const liAutoL9PageConfig: VehiclePageConfig = {
  theme: "blue",
  hero: {
    badge: "PROJECTS",
    title: "理想 L9 · 14 个升级项目",
    subtitle: "理想 L9 轻改升级方案",
    description:
      "理想 L9 全车轻改方案，覆盖新车保护、家庭座舱、外观个性、行车防护与屏幕细节 5 大场景；蓝辉轻改顺德大良店按标准化流程评估与施工。",
  },
  projects: liAutoL9UpgradeProjects.map((p) => ({
    id: p.key,
    name: p.name,
    summary: p.summary,
    suitableFor: [...p.suitableFor],
    ...(p.caution ? { caution: p.caution } : {}),
    category: p.category,
  })),
  scenarios: liAutoL9Scenarios.map((s) => ({
    id: s.key,
    name: s.name,
    description: s.description,
    projectIds: [...s.projectKeys],
  })),
  serviceFlow: {
    title: "服务流程",
    steps: liAutoL9ServiceSteps.map((s) => ({
      order: s.step,
      title: s.title,
      description: s.description,
    })),
  },
  faq: [...liAutoL9Faq],
  bundles: liAutoL9Bundles.map((b) => ({
    id: b.key,
    name: b.name,
    description: b.description,
    items: [...b.projectKeys],
  })),
};
