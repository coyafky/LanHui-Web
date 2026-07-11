import type { VehiclePageConfig } from "@/components/vehicle-page";
import type { VoyahDreamerCategory } from "./voyah-products";
import {
  voyahDreamerUpgradeProjects,
  voyahDreamerScenarios,
  voyahDreamerServiceSteps,
  voyahDreamerFaq,
  VOYAH_DREAMER_CATEGORY_LABELS,
  VOYAH_DREAMER_HERO_IMAGE,
} from "./voyah-products";

const CATEGORY_LABELS: Record<VoyahDreamerCategory, string> = VOYAH_DREAMER_CATEGORY_LABELS;

export const voyahBrandPageConfig = {
  theme: "blue" as const,

  hero: {
    badge: "岚图 · 项目升级方案",
    title: "岚图轻改方案｜蓝辉轻改 LANHUI",
    subtitle: "蓝辉轻改为岚图梦想家等车型提供轻改与膜系方案",
    description:
      "岚图是东风集团高端新能源品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。",
    heroImage: {
      src: VOYAH_DREAMER_HERO_IMAGE.publicPath ?? "",
      alt: VOYAH_DREAMER_HERO_IMAGE.alt,
      width: VOYAH_DREAMER_HERO_IMAGE.width ?? 1448,
      height: VOYAH_DREAMER_HERO_IMAGE.height ?? 1086,
    },
  },

  projects: voyahDreamerUpgradeProjects.map((p) => ({
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

  scenarios: voyahDreamerScenarios.map((s) => ({
    id: s.key,
    name: s.name,
    description: s.description,
    projectIds: s.projectIds as string[],
  })),

  serviceFlow: {
    title: "服务流程",
    steps: voyahDreamerServiceSteps.map((step) => ({
      order: step.step,
      title: step.title,
      description: step.description,
    })),
  },

  faq: voyahDreamerFaq.map((item) => ({
    question: item.question,
    answer: item.answer,
  })),
} satisfies VehiclePageConfig;
