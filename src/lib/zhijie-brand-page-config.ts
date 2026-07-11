import type { VehiclePageConfig } from "@/components/vehicle-page";
import {
  zhijieV9UpgradeProjects,
  zhijieV9Scenarios,
  zhijieV9Bundles,
  zhijieV9ServiceSteps,
  zhijieV9Faq,
  ZHIJIE_V9_CATEGORY_LABELS,
  ZHIJIE_V9_HERO_IMAGE,
} from "./zhijie-v9-products";

export const zhijieBrandPageConfig = {
  theme: "orange" as const,

  hero: {
    badge: "智界 · 项目升级方案",
    title: "智界轻改方案｜蓝辉轻改 LANHUI",
    subtitle: "14 项升级项目 · 5 大用车场景",
    description:
      "蓝辉轻改提供智界 V9 专属升级方案参考，覆盖车衣、隔热膜、彩绘、改色膜、360脚垫、平衡杆、底盘护板、铝地板、门槛条、牌照框、挡泥板、防虫网、钢化膜和抬头显示罩共 14 个项目。",
    heroImage: {
      src: ZHIJIE_V9_HERO_IMAGE.publicPath ?? "",
      alt: ZHIJIE_V9_HERO_IMAGE.alt,
      width: ZHIJIE_V9_HERO_IMAGE.width ?? 1448,
      height: ZHIJIE_V9_HERO_IMAGE.height ?? 1086,
    },
  },

  projects: zhijieV9UpgradeProjects.map((p) => ({
    id: p.id,
    name: p.name,
    summary: p.summary,
    suitableFor: p.suitableFor as string[],
    caution: p.caution,
    category: ZHIJIE_V9_CATEGORY_LABELS[p.category],
    imageStatus: p.imageStatus,
    imagePublicPath: p.image.publicPath,
    imageAlt: p.name,
    imageWidth: p.image.width,
    imageHeight: p.image.height,
  })),

  scenarios: zhijieV9Scenarios.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    projectIds: s.projectIds as string[],
  })),

  serviceFlow: {
    title: "服务流程",
    steps: zhijieV9ServiceSteps.map((step) => ({
      order: step.order,
      title: step.title,
      description: step.description,
    })),
  },

  faq: zhijieV9Faq.map((item) => ({
    question: item.question,
    answer: item.answer,
  })),

  bundles: zhijieV9Bundles.map((b) => ({
    id: b.key,
    name: b.name,
    description: b.value,
    items: b.projectIds as string[],
  })),
} satisfies VehiclePageConfig;
