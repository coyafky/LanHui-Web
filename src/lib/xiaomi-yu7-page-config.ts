import type { VehiclePageConfig } from "@/components/vehicle-page";
import {
  xiaomiYu7UpgradeProjects,
  xiaomiYu7Scenarios,
  xiaomiYu7ServiceSteps,
  xiaomiYu7Faq,
} from "./xiaomi-yu7-upgrade-projects";

const CATEGORY_LABELS: Record<string, string> = {
  cabin_protection: "座舱防护",
  chassis_protection: "底盘防护",
  exterior_parts: "外观件",
  film_style: "膜类风格",
  cabin_comfort: "座舱舒适",
  electric_convenience: "电动便利",
  handling: "操控",
};

export const xiaomiYu7PageConfig = {
  theme: "orange" as const,

  hero: {
    badge: "小米 YU7 · 轻改方案",
    title: "小米 YU7 轻改升级方案",
    subtitle: "9 项升级项目 · 5 大用车场景",
    description:
      "蓝辉轻改深度分析小米 YU7 车型特点，覆盖软包脚垫、碳纤维护板、平衡杆、运动包围、星空膜、电吸门等 9 项轻改项目，提供新车保护、外观个性、座舱防护等场景化方案。",
  },

  projects: xiaomiYu7UpgradeProjects.map((p) => ({
    id: p.id,
    name: p.name,
    summary: p.summary,
    suitableFor: p.suitableFor as string[],
    caution: p.caution,
    category: CATEGORY_LABELS[p.category] ?? p.category,
  })),

  scenarios: xiaomiYu7Scenarios.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    projectIds: s.projectIds as string[],
  })),

  serviceFlow: {
    title: "服务流程",
    steps: xiaomiYu7ServiceSteps.map((step) => ({
      order: step.order,
      title: step.title,
      description: step.description,
    })),
  },

  faq: xiaomiYu7Faq.map((item) => ({
    question: item.question,
    answer: item.answer,
  })),
} satisfies VehiclePageConfig;
