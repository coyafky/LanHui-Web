import type { VehiclePageConfig } from "@/components/vehicle-page";
import type { LedaoL90Category } from "./ledao-l90-products";
import {
  ledaoL90UpgradeProjects,
  ledaoL90Scenarios,
  ledaoL90ServiceSteps,
  ledaoL90Faq,
  LEDAO_L90_CATEGORY_LABELS,
  LEDAO_L90_HERO_IMAGE,
} from "./ledao-l90-products";

const CATEGORY_LABELS: Record<LedaoL90Category, string> = LEDAO_L90_CATEGORY_LABELS;

export const ledaoBrandPageConfig = {
  theme: "orange" as const,

  hero: {
    badge: "乐道 · 项目升级方案",
    title: "乐道轻改方案｜蓝辉轻改 LANHUI",
    subtitle: "蓝辉轻改为乐道 L90 等车型提供轻改与膜系方案",
    description:
      "乐道是蔚来旗下家庭车品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。",
    heroImage: {
      src: LEDAO_L90_HERO_IMAGE.publicPath ?? "",
      alt: LEDAO_L90_HERO_IMAGE.alt,
      width: LEDAO_L90_HERO_IMAGE.width ?? 1448,
      height: LEDAO_L90_HERO_IMAGE.height ?? 1086,
    },
  },

  projects: ledaoL90UpgradeProjects.map((p) => ({
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

  scenarios: ledaoL90Scenarios.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    projectIds: s.projectIds as string[],
  })),

  serviceFlow: {
    title: "服务流程",
    steps: ledaoL90ServiceSteps.map((step) => ({
      order: step.order,
      title: step.title,
      description: step.description,
    })),
  },

  faq: ledaoL90Faq.map((item) => ({
    question: item.question,
    answer: item.answer,
  })),
} satisfies VehiclePageConfig;
