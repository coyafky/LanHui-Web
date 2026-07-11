import type { VehiclePageConfig } from "@/components/vehicle-page";
import {
  xiaomiYu7UpgradeProjects,
  xiaomiYu7Scenarios,
  xiaomiYu7ServiceSteps,
  xiaomiYu7Faq,
  XIAOMI_YU7_PROJECT_COUNT,
  XIAOMI_YU7_SCENARIO_COUNT,
  XIAOMI_YU7_HERO_IMAGE,
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

  breadcrumbs: [
    { label: "首页", href: "/" },
    { label: "产品中心", href: "/product" },
    { label: "小米系列", href: "/product/xiaomi" },
    { label: "小米 YU7" },
  ],

  hero: {
    badge: "小米 YU7 · 轻改方案",
    title: "小米 YU7 轻改升级方案",
    subtitle: "9 项升级项目 · 5 大用车场景",
    description:
      "蓝辉轻改深度分析小米 YU7 车型特点，覆盖软包脚垫、碳纤维护板、平衡杆、运动包围、星空膜、电吸门等 9 项轻改项目。",
    heroImage: {
      src: XIAOMI_YU7_HERO_IMAGE.publicPath,
      alt: XIAOMI_YU7_HERO_IMAGE.alt,
      width: XIAOMI_YU7_HERO_IMAGE.width,
      height: XIAOMI_YU7_HERO_IMAGE.height,
    },
    stats: {
      totalProjects: XIAOMI_YU7_PROJECT_COUNT,
      totalScenarios: XIAOMI_YU7_SCENARIO_COUNT,
    },
  },

  projects: xiaomiYu7UpgradeProjects.map((p) => ({
    id: p.id,
    name: p.name,
    summary: p.summary,
    suitableFor: p.suitableFor as string[],
    caution: p.caution,
    category: CATEGORY_LABELS[p.category] ?? p.category,
    imageStatus: p.imageStatus,
    imagePublicPath: p.publicPath ?? null,
    imageAlt: p.name,
    imageWidth: p.width ?? null,
    imageHeight: p.height ?? null,
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
