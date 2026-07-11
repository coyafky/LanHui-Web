import type { VehiclePageConfig } from "@/components/vehicle-page";
import {
  xpengGxUpgradeProjects,
  xpengGxScenarios,
  xpengGxBundles,
  xpengGxServiceSteps,
  xpengGxFaq,
  XPENG_GX_CATEGORY_LABELS,
  XPENG_GX_HERO_IMAGE,
} from "./xpeng-gx-products";

export const xpengBrandPageConfig = {
  theme: "orange" as const,

  hero: {
    badge: "小鹏 · 项目升级方案",
    title: "小鹏轻改方案｜蓝辉轻改 LANHUI",
    subtitle: "蓝辉轻改为小鹏 GX 等车型提供轻改与膜系方案",
    description:
      "小鹏是智能电动汽车品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。",
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

  bundles: xpengGxBundles.map((b) => ({
    id: b.key,
    name: b.name,
    description: b.value,
    items: b.projectIds as string[],
  })),
} satisfies VehiclePageConfig;
