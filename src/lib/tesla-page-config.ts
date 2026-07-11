import type { VehiclePageConfig } from "@/components/vehicle-page";
import type { TeslaProjectCategory } from "./tesla-products";
import {
  teslaFeaturedProjects,
  teslaOptionalProjects,
  teslaScenarios,
  teslaServiceSteps,
  teslaFaq,
} from "./tesla-products";

const CATEGORY_LABELS: Record<TeslaProjectCategory, string> = {
  paint_protection: "漆面保护",
  film_style: "膜类风格",
  chassis_protection: "底盘防护",
  cabin_comfort: "座舱舒适",
  electric_convenience: "电动便利",
  infotainment: "信息娱乐",
  exterior_parts: "外观件",
  storage_accessory: "储物与小件",
};

export const teslaPageConfig = {
  theme: "red" as const,

  hero: {
    badge: "特斯拉 · 轻改方案",
    title: "特斯拉系列轻改项目",
    subtitle: "42 项升级项目 · 6 大用车场景",
    description:
      "蓝辉轻改特斯拉系列升级方案，覆盖车衣、隔热膜、改色膜、底盘护板、电动踏板、座舱舒适与智能影音等 42 个项目，按新车保护、外观焕新、座舱舒适、智能影音、电动便利、储物与小件 6 大场景组合，适用于 Model 3 / Model Y / Model S / Model X。",
  },

  projects: [...teslaFeaturedProjects, ...teslaOptionalProjects].map((p) => ({
    id: p.key,
    name: p.name,
    summary: p.summary,
    suitableFor: [] as string[],
    caution: undefined,
    category: CATEGORY_LABELS[p.category] ?? p.category,
  })),

  scenarios: teslaScenarios.map((s) => ({
    id: s.key,
    name: s.name,
    description: s.description,
    projectIds: s.projectKeys as string[],
  })),

  serviceFlow: {
    title: "服务流程",
    steps: teslaServiceSteps.map((step) => ({
      order: step.step,
      title: step.title,
      description: step.description,
    })),
  },

  faq: teslaFaq.map((item) => ({
    question: item.question,
    answer: item.answer,
  })),
} satisfies VehiclePageConfig;
