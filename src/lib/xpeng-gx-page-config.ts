import type { VehiclePageConfig } from "@/components/vehicle-page";
import {
  xpengGxUpgradeProjects,
  xpengGxScenarios,
  xpengGxServiceSteps,
  xpengGxFaq,
  XPENG_GX_CATEGORY_LABELS,
  XPENG_GX_HERO_IMAGE,
} from "./xpeng-gx-products";

export const xpengGxPageConfig = {
  theme: "orange" as const,

  hero: {
    badge: "小鹏 GX · 轻改方案",
    title: "小鹏 GX 专属升级方案",
    subtitle: "15 项升级项目 · 6 大用车场景",
    description:
      "蓝辉轻改小鹏 GX 单车型升级方案，覆盖车衣、隔热膜、改色膜、彩绘、轮毂、电动门【预售】、底盘护板、360 脚垫、钢化膜等 15 个项目，按新车保护、外观个性、电动便利、底盘与行车防护、屏幕与显示保护、座舱维护 6 大场景组合。",
    heroImage: {
      src: XPENG_GX_HERO_IMAGE.publicPath ?? "",
      alt: XPENG_GX_HERO_IMAGE.alt,
      width: XPENG_GX_HERO_IMAGE.width ?? 1448,
      height: XPENG_GX_HERO_IMAGE.height ?? 1086,
    },
  },

  projects: xpengGxUpgradeProjects.map((p) => ({
    id: p.id,
    name: p.name,
    summary: p.summary,
    suitableFor: p.suitableFor as string[],
    caution: p.caution,
    category: XPENG_GX_CATEGORY_LABELS[p.category],
    imageStatus: p.imageStatus,
    imagePublicPath: p.image.publicPath,
    imageAlt: p.name,
    imageWidth: p.image.width,
    imageHeight: p.image.height,
  })),

  scenarios: xpengGxScenarios.map((s) => ({
    id: s.key,
    name: s.name,
    description: s.description,
    projectIds: s.projectIds as string[],
  })),

  serviceFlow: {
    title: "服务流程",
    steps: xpengGxServiceSteps.map((step) => ({
      order: step.step,
      title: step.title,
      description: step.description,
    })),
  },

  faq: xpengGxFaq.map((item) => ({
    question: item.question,
    answer: item.answer,
  })),
} satisfies VehiclePageConfig;
