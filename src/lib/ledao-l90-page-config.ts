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

export const ledaoL90PageConfig = {
  theme: "orange" as const,

  hero: {
    badge: "乐道 L90 · 轻改方案",
    title: "乐道 L90 轻改升级方案",
    subtitle: "21 项升级项目 · 5 大用车场景",
    description:
      "蓝辉轻改整理乐道 L90 21 项热门轻改产品：车衣、隔热膜、彩绘、双拼改色、悬浮顶、铝地板、平衡杆、小桌板、运动包围、360脚垫、底盘护板、轮毂、门槛条、钢化膜等。覆盖新车保护、外观个性、座舱防护、底盘与行车防护、高端质感 5 大用车场景，到店评估按标准流程施工。",
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
