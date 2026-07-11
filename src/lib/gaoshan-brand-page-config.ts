import type { VehiclePageConfig } from "@/components/vehicle-page";
import type { Gaoshan8Category } from "./gaoshan-products";
import {
  gaoshan8UpgradeProjects,
  gaoshan8Scenarios,
  gaoshan8ServiceSteps,
  gaoshan8Faq,
  GAOSHAN_8_CATEGORY_LABELS,
  GAOSHAN_8_HERO_IMAGE,
} from "./gaoshan-products";

const CATEGORY_LABELS: Record<Gaoshan8Category, string> = GAOSHAN_8_CATEGORY_LABELS;

export const gaoshanBrandPageConfig = {
  theme: "blue" as const,

  hero: {
    badge: "高山 · 项目升级方案",
    title: "高山轻改方案｜蓝辉轻改 LANHUI",
    subtitle: "蓝辉轻改为高山 8 等车型提供轻改与膜系方案",
    description:
      "高山是魏牌旗下高端 MPV 品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。",
    heroImage: {
      src: GAOSHAN_8_HERO_IMAGE.publicPath ?? "",
      alt: GAOSHAN_8_HERO_IMAGE.alt,
      width: GAOSHAN_8_HERO_IMAGE.width ?? 1448,
      height: GAOSHAN_8_HERO_IMAGE.height ?? 1086,
    },
  },

  projects: gaoshan8UpgradeProjects.map((p) => ({
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

  scenarios: gaoshan8Scenarios.map((s) => ({
    id: s.key,
    name: s.name,
    description: s.description,
    projectIds: s.projectIds as string[],
  })),

  serviceFlow: {
    title: "服务流程",
    steps: gaoshan8ServiceSteps.map((step) => ({
      order: step.step,
      title: step.title,
      description: step.description,
    })),
  },

  faq: gaoshan8Faq.map((item) => ({
    question: item.question,
    answer: item.answer,
  })),
} satisfies VehiclePageConfig;
