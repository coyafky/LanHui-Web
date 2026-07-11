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

export const gaoshan8PageConfig = {
  theme: "blue" as const,

  hero: {
    badge: "高山 8 · 专属升级方案",
    title: "高山 8 专属升级方案",
    subtitle: "高山 8 单车型轻改 · MPV 全场景升级参考",
    description:
      "蓝辉轻改针对高山 8 提供从新车保护到座舱维护的完整轻改方向，涵盖新车保护、商务外观、外观个性、MPV后排舒适、底盘与行车防护、灯光氛围、智能与屏幕保护和座舱维护八大类别。所有项目以方向参考为主，最终以到店确认和实际施工评估为准。",
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
