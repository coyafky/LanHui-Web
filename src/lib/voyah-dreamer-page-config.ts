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

export const voyahDreamerPageConfig = {
  theme: "blue" as const,

  hero: {
    badge: "岚图梦想家 · 专属升级方案",
    title: "岚图梦想家专属升级方案",
    subtitle: "岚图梦想家单车型轻改 · MPV 全场景升级参考",
    description:
      "蓝辉轻改针对岚图梦想家提供从新车保护到座舱维护的完整轻改方向，涵盖新车保护、外观个性、底盘与行车防护、MPV 后排舒适和座舱维护五大类别。所有项目以方向参考为主，最终以到店确认和实际施工评估为准。",
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
