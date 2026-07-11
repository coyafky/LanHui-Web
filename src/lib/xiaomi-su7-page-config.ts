import type { VehiclePageConfig } from "@/components/vehicle-page";
import type { XiaomiSu7Category } from "./xiaomi-su7-upgrade-projects";
import {
  xiaomiSu7UpgradeProjects,
  xiaomiSu7Scenarios,
  xiaomiSu7ServiceSteps,
  xiaomiSu7Faq,
  XIAOMI_SU7_PROJECT_COUNT,
  XIAOMI_SU7_SCENARIO_COUNT,
  XIAOMI_SU7_HERO_IMAGE,
} from "./xiaomi-su7-upgrade-projects";

const CATEGORY_LABELS: Record<XiaomiSu7Category, string> = {
  paint_protection: "漆面保护",
  cabin_protection: "座舱防护",
  chassis_protection: "底盘防护",
  exterior_parts: "外观件",
  film_style: "膜类风格",
  cabin_comfort: "座舱舒适",
  electric_convenience: "电动便利",
  handling: "操控",
  infotainment: "信息娱乐",
};

export const xiaomiSu7PageConfig = {
  theme: "orange" as const,

  hero: {
    badge: "小米 SU7 · 轻改方案",
    title: "小米 SU7 轻改升级方案",
    subtitle: "21 项升级项目 · 5 大用车场景",
    description:
      "蓝辉轻改提供小米 SU7 专属轻改方案参考，覆盖车衣、隔热膜、改色膜、360软包脚垫、底盘护板、氛围灯、仪表中置、电动尾翼、电动遮阳帘、Ultra机盖、Ultra方向盘、Ultra前后包围等 21 项轻改项目。",
    heroImage: {
      src: XIAOMI_SU7_HERO_IMAGE.publicPath,
      alt: XIAOMI_SU7_HERO_IMAGE.alt,
      width: XIAOMI_SU7_HERO_IMAGE.width,
      height: XIAOMI_SU7_HERO_IMAGE.height,
    },
    stats: {
      totalProjects: XIAOMI_SU7_PROJECT_COUNT,
      totalScenarios: XIAOMI_SU7_SCENARIO_COUNT,
    },
  },

  projects: xiaomiSu7UpgradeProjects.map((p) => ({
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

  scenarios: xiaomiSu7Scenarios.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    projectIds: s.projectIds as string[],
  })),

  serviceFlow: {
    title: "服务流程",
    steps: xiaomiSu7ServiceSteps.map((step) => ({
      order: step.order,
      title: step.title,
      description: step.description,
    })),
  },

  faq: xiaomiSu7Faq.map((item) => ({
    question: item.question,
    answer: item.answer,
  })),
} satisfies VehiclePageConfig;
