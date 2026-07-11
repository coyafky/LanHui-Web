import type { VehiclePageConfig } from "@/components/vehicle-page";
import type { Zeekr8xCategory } from "./zeekr-8x-products";
import {
  zeekr8xUpgradeProjects,
  zeekr8xScenarios,
  zeekr8xServiceSteps,
  zeekr8xFaq,
  ZEEKR_8X_HERO_IMAGE,
  ZEEKR_8X_PROJECT_COUNT,
  ZEEKR_8X_SCENARIO_COUNT,
} from "./zeekr-8x-products";

const CATEGORY_LABELS: Record<Zeekr8xCategory, string> = {
  protection: "漆面保护",
  film: "膜系",
  appearance: "外观个性",
  family_cabin: "家庭座舱",
  cabin_protection: "座舱保护",
  cabin_atmosphere: "座舱氛围",
  chassis: "底盘防护",
  driving_protection: "行车防护",
  screen_care: "屏幕养护",
  detail_care: "细节装饰",
};

export const zeekr8xPageConfig = {
  theme: "orange" as const,

  hero: {
    badge: "极氪 8X · 轻改方案",
    title: "极氪 8X 轻改升级方案",
    subtitle: "17 项升级项目 · 5 大用车场景",
    description:
      "蓝辉轻改整理极氪 8X 17 项热门轻改产品：车衣、隔热膜、彩绘、悬浮顶、360 软包脚垫、铝地板、平衡杆、运动包围、氛围灯、底盘护板、小桌板、挡泥板、防虫网、抬头显示、钢化膜、门槛条、牌照框。覆盖新车保护、外观个性升级、家庭座舱、智能屏幕与显示保护、行车与日常防护 5 大用车场景，到店评估按标准流程施工。",
    heroImage: {
      src: ZEEKR_8X_HERO_IMAGE.publicPath ?? "",
      alt: ZEEKR_8X_HERO_IMAGE.alt,
      width: ZEEKR_8X_HERO_IMAGE.width ?? 1448,
      height: ZEEKR_8X_HERO_IMAGE.height ?? 1086,
    },
    stats: {
      totalProjects: ZEEKR_8X_PROJECT_COUNT,
      totalScenarios: ZEEKR_8X_SCENARIO_COUNT,
    },
  },

  projects: zeekr8xUpgradeProjects.map((p) => ({
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

  scenarios: zeekr8xScenarios.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    projectIds: s.projectIds as string[],
  })),

  serviceFlow: {
    title: "服务流程",
    steps: zeekr8xServiceSteps.map((step) => ({
      order: step.order,
      title: step.title,
      description: step.description,
    })),
  },

  faq: zeekr8xFaq.map((item) => ({
    question: item.question,
    answer: item.answer,
  })),
} satisfies VehiclePageConfig;
