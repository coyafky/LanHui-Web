import type { VehiclePageConfig } from "@/components/vehicle-page";
import {
  zeekr9xUpgradeProjects,
  zeekr9xScenarios,
  zeekr9xServiceSteps,
  zeekr9xFaq,
  ZEEKR_9X_HERO_IMAGE,
  ZEEKR_9X_PROJECT_COUNT,
  ZEEKR_9X_SCENARIO_COUNT,
  type Zeekr9xCategory,
} from "./zeekr-9x-products";

const CATEGORY_LABELS: Record<Zeekr9xCategory, string> = {
  paint_protection: "漆面保护",
  film_style: "膜类风格",
  chassis_protection: "底盘防护",
  cabin_protection: "座舱防护",
  exterior_parts: "外观件",
  infotainment: "信息娱乐",
  handling: "操控",
};

export const zeekr9xPageConfig = {
  theme: "orange" as const,

  hero: {
    badge: "极氪 9X · 轻改方案",
    title: "极氪 9X 轻改升级方案",
    subtitle: "18 项升级项目 · 5 大用车场景",
    description:
      "蓝辉轻改整理极氪 9X 热门轻改产品：车衣、隔热膜、彩绘、双拼改色、360 软包脚垫、铝地板、平衡杆、轮毂、运动包围、刹车卡钳、门槛条、挡泥板、防虫网、钢化膜、底盘护板、硅胶垫套餐、牌照框、内饰镀膜。覆盖新车保护、外观个性、座舱防护、底盘与行车防护、高端质感 5 大用车场景。",
    heroImage: {
      src: ZEEKR_9X_HERO_IMAGE.publicPath ?? "",
      alt: ZEEKR_9X_HERO_IMAGE.alt,
      width: ZEEKR_9X_HERO_IMAGE.width ?? 1448,
      height: ZEEKR_9X_HERO_IMAGE.height ?? 1086,
    },
    stats: {
      totalProjects: ZEEKR_9X_PROJECT_COUNT,
      totalScenarios: ZEEKR_9X_SCENARIO_COUNT,
    },
  },

  projects: zeekr9xUpgradeProjects.map((p) => ({
    id: p.id,
    name: p.name,
    summary: p.summary,
    suitableFor: p.suitableFor as string[],
    caution: p.caution,
    category: CATEGORY_LABELS[p.category] ?? p.category,
    imageStatus: p.imageStatus,
    imagePublicPath: p.image.publicPath,
    imageAlt: p.name,
    imageWidth: p.image.width,
    imageHeight: p.image.height,
  })),

  scenarios: zeekr9xScenarios.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    projectIds: s.projectIds as string[],
  })),

  serviceFlow: {
    title: "服务流程",
    steps: zeekr9xServiceSteps.map((step) => ({
      order: step.order,
      title: step.title,
      description: step.description,
    })),
  },

  faq: zeekr9xFaq.map((item) => ({
    question: item.question,
    answer: item.answer,
  })),
} satisfies VehiclePageConfig;
