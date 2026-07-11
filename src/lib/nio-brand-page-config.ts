import type { VehiclePageConfig } from "@/components/vehicle-page";
import type { NioEs8Category } from "./nio-products";
import {
  nioEs8UpgradeProjects,
  nioEs8Scenarios,
  nioEs8Bundles,
  nioEs8ServiceSteps,
  nioEs8Faq,
} from "./nio-products";

const CATEGORY_LABELS: Record<NioEs8Category, string> = {
  protection: "漆面保护",
  film: "玻璃膜",
  appearance: "外观个性",
  cabin_protection: "座舱防护",
  family_cabin: "家庭座舱",
  chassis: "底盘",
  driving_protection: "行车防护",
  screen_care: "屏幕保护",
  interior_care: "内饰养护",
};

const heroProject = nioEs8UpgradeProjects.find((p) => p.key === "hero");

export const nioBrandPageConfig = {
  theme: "green" as const,

  hero: {
    badge: "蔚来 · 项目升级方案",
    title: "蔚来轻改方案｜蓝辉轻改 LANHUI",
    subtitle: "蓝辉轻改为蔚来 ES8 等车型提供轻改与膜系方案",
    description:
      "蔚来是高端智能电动汽车品牌。已收录 1 款车型，提供外观、内饰、底盘及膜系轻改服务。",
    heroImage: heroProject
      ? {
          src: heroProject.publicPath,
          alt: heroProject.name,
          width: heroProject.width ?? 1448,
          height: heroProject.height ?? 1086,
        }
      : undefined,
  },

  projects: nioEs8UpgradeProjects
    .filter((p) => p.key !== "hero")
    .map((p) => ({
      id: p.key,
      name: p.name,
      summary: p.summary,
      suitableFor: p.suitableFor as string[],
      caution: p.caution,
      category: CATEGORY_LABELS[p.category] ?? p.category,
      imageStatus: p.imageStatus,
      imagePublicPath: p.publicPath,
      imageAlt: p.name,
      imageWidth: p.width,
      imageHeight: p.height,
    })),

  scenarios: nioEs8Scenarios.map((s) => ({
    id: s.key,
    name: s.name,
    description: s.description,
    projectIds: s.projectKeys as string[],
  })),

  serviceFlow: {
    title: "服务流程",
    steps: nioEs8ServiceSteps.map((step) => ({
      order: step.step,
      title: step.title,
      description: step.description,
    })),
  },

  faq: nioEs8Faq.map((item) => ({
    question: item.question,
    answer: item.answer,
  })),

  bundles: nioEs8Bundles.map((b) => ({
    id: b.key,
    name: b.name,
    description: b.description,
    items: b.projectKeys as string[],
  })),
} satisfies VehiclePageConfig;
