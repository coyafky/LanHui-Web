import type { VehiclePageConfig } from "@/components/vehicle-page";
import {
  wenjieSeriesFeaturedProjects,
  wenjieSeriesOptionalProjects,
  wenjieSeriesScenarios,
  wenjieSeriesServiceSteps,
  wenjieSeriesFaq,
  type WenjieSeriesUpgradeCategory,
} from "./wenjie-series-upgrade-projects";

const CATEGORY_LABELS: Record<WenjieSeriesUpgradeCategory, string> = {
  paint_protection: "漆面保护",
  film_style: "膜类风格",
  chassis_protection: "底盘防护",
  rear_cabin: "后排座舱",
  electric_convenience: "电动便利",
  infotainment: "信息娱乐",
  exterior_parts: "外观件",
  outdoor_accessory: "户外配件",
  cabin_comfort: "座舱舒适",
  noise_sealing: "隔音密封",
};

const allProjects = [...wenjieSeriesFeaturedProjects, ...wenjieSeriesOptionalProjects];

export const wenjieSeriesPageConfig = {
  theme: "cyan" as const,

  hero: {
    badge: "问界系列 · 项目升级方案",
    title: "问界系列项目升级方案｜蓝辉轻改 LANHUI",
    subtitle: "专业轻改，安全可靠，提升体验，焕新出行",
    description:
      "蓝辉轻改问界系列升级方案，覆盖车衣、隔热膜、二排铝地板、底盘护板、电动踏板、小桌板等 34 个项目，按新车保护、家庭后排、上下车便利、座舱舒适、智能影音、外观升级、露营/户外 7 大场景组合，为问界 M6、M7、M8 提供专属升级方案。",
  },

  projects: allProjects.map((p) => ({
    id: p.key,
    name: p.name,
    summary: p.summary,
    suitableFor: [] as string[],
    caution: undefined,
    category: CATEGORY_LABELS[p.category] ?? p.category,
  })),

  scenarios: wenjieSeriesScenarios.map((s) => ({
    id: s.key,
    name: s.name,
    description: s.description,
    projectIds: s.projectKeys as string[],
  })),

  serviceFlow: {
    title: "服务流程",
    steps: wenjieSeriesServiceSteps.map((step) => ({
      order: step.step,
      title: step.title,
      description: step.description,
    })),
  },

  faq: wenjieSeriesFaq.map((item) => ({
    question: item.question,
    answer: item.answer,
  })),
} satisfies VehiclePageConfig;
