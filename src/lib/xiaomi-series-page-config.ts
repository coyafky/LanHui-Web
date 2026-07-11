import type { VehiclePageConfig } from "@/components/vehicle-page";
import {
  xiaomiSeriesUpgradeProjects,
  xiaomiSeriesScenarios,
  xiaomiSeriesServiceSteps,
  xiaomiSeriesFaq,
  XIAOMI_SERIES_CATEGORY_LABELS,
} from "./xiaomi-series-upgrade-projects";

export const xiaomiSeriesPageConfig = {
  theme: "orange" as const,

  hero: {
    badge: "小米系列 · 项目升级方案",
    title: "小米系列项目升级方案｜蓝辉轻改 LANHUI",
    subtitle: "围绕新车保护、外观个性、座舱质感与 Ultra 风格，整理 SU7 / YU7 可沟通的轻改升级方向。",
    description:
      "蓝辉轻改小米系列升级方案，覆盖车衣、隔热膜、360 软包脚垫、底盘护板、Ultra 机盖、Ultra 方向盘、电动尾翼、运动包围、电吸门等项目，为小米 SU7、YU7 提供专属升级方案。",
  },

  projects: xiaomiSeriesUpgradeProjects.map((p) => ({
    id: p.id,
    name: p.name,
    summary: p.summary,
    suitableFor: p.suitableFor as string[],
    caution: p.caution,
    category: XIAOMI_SERIES_CATEGORY_LABELS[p.category] ?? p.category,
  })),

  scenarios: xiaomiSeriesScenarios.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    projectIds: s.projectIds as string[],
  })),

  serviceFlow: {
    title: "服务流程",
    steps: xiaomiSeriesServiceSteps.map((step) => ({
      order: step.order,
      title: step.title,
      description: step.description,
    })),
  },

  faq: xiaomiSeriesFaq.map((item) => ({
    question: item.question,
    answer: item.answer,
  })),
} satisfies VehiclePageConfig;
