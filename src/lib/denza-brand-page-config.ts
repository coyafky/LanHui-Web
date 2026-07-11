import type { VehiclePageConfig } from "@/components/vehicle-page";
import {
  denzaD9UpgradeProjects,
  denzaD9Scenarios,
  denzaD9ServiceSteps,
  denzaD9Faq,
  DENZA_D9_CATEGORY_LABELS,
  DENZA_D9_HERO_IMAGE,
} from "./denza-d9-products";

export const denzaBrandPageConfig = {
  theme: "blue" as const,

  hero: {
    badge: "腾势 · 项目升级方案",
    title: "腾势轻改方案｜蓝辉轻改 LANHUI",
    subtitle: "蓝辉轻改为腾势 D9 等车型提供轻改与膜系方案",
    description:
      "腾势是比亚迪旗下高端新能源品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。",
    heroImage: {
      src: DENZA_D9_HERO_IMAGE.publicPath ?? "",
      alt: DENZA_D9_HERO_IMAGE.alt,
      width: DENZA_D9_HERO_IMAGE.width ?? 1448,
      height: DENZA_D9_HERO_IMAGE.height ?? 1086,
    },
  },

  projects: denzaD9UpgradeProjects.map((p) => ({
    id: p.id,
    name: p.name,
    summary: p.summary,
    suitableFor: p.suitableFor as string[],
    caution: p.caution,
    category: DENZA_D9_CATEGORY_LABELS[p.category],
    imageStatus: p.imageStatus,
    imagePublicPath: p.image.publicPath,
    imageAlt: p.name,
    imageWidth: p.image.width,
    imageHeight: p.image.height,
  })),

  scenarios: denzaD9Scenarios.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    projectIds: s.projectIds as string[],
  })),

  serviceFlow: {
    title: "服务流程",
    steps: denzaD9ServiceSteps.map((step) => ({
      order: step.order,
      title: step.title,
      description: step.description,
    })),
  },

  faq: denzaD9Faq.map((item) => ({
    question: item.question,
    answer: item.answer,
  })),
} satisfies VehiclePageConfig;
