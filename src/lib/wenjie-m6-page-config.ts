import type { VehiclePageConfig } from "@/components/vehicle-page";
import {
  wenjieM6UpgradeProjects,
  wenjieM6Scenarios,
  wenjieM6ServiceSteps,
  wenjieM6Faq,
  wenjieM6Bundles,
  type WenjieM6UpgradeCategory,
} from "./wenjie-m6-upgrade-projects";

const CATEGORY_LABELS: Record<WenjieM6UpgradeCategory, string> = {
  protection: "新车保护",
  appearance: "外观个性",
  electric_convenience: "电动便利",
  chassis: "底盘防护",
  family_cabin: "家庭座舱",
  screen_care: "屏幕保护",
};

const projectNameById = new Map(
  wenjieM6UpgradeProjects.map((p) => [p.id, p.name]),
);

export const wenjieM6PageConfig = {
  theme: "cyan" as const,

  hero: {
    badge: "问界 M6 · 专属升级方案",
    title: "问界 M6 专属升级方案",
    subtitle: "17 个升级项目 · 6 大用车场景",
    description:
      "热门轻改产品目录：围绕新车保护、隔热改色、电动便利、底盘防护、家庭座舱和屏幕内饰维护等日常用车场景，17 项升级项目供选择；蓝辉轻改顺德大良店到店评估、按标准流程施工。",
  },

  projects: wenjieM6UpgradeProjects.map((p) => ({
    id: p.id,
    name: p.name,
    summary: p.summary,
    suitableFor: p.suitableFor as string[],
    caution: p.caution,
    category: CATEGORY_LABELS[p.category] ?? p.category,
    imageStatus: p.imageStatus === "real" ? "matched" : p.imageStatus,
    imagePublicPath: p.image.publicPath,
    imageAlt: p.name,
    imageWidth: p.image.width,
    imageHeight: p.image.height,
  })),

  scenarios: wenjieM6Scenarios.map((s) => ({
    id: s.key,
    name: s.name,
    description: s.description,
    projectIds: s.projectIds as string[],
  })),

  serviceFlow: {
    title: "服务流程",
    steps: wenjieM6ServiceSteps.map((step) => ({
      order: step.step,
      title: step.title,
      description: step.description,
    })),
  },

  faq: wenjieM6Faq.map((item) => ({
    question: item.question,
    answer: item.answer,
  })),

  bundles: wenjieM6Bundles.map((b) => ({
    id: b.key,
    name: b.name,
    description: b.description,
    items: b.projectIds.map((id) => projectNameById.get(id) ?? id),
  })),
} satisfies VehiclePageConfig;
