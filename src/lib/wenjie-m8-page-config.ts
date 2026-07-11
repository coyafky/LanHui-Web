import type { VehiclePageConfig } from "@/components/vehicle-page";
import {
  wenjieM8UpgradeProjects,
  wenjieM8Scenarios,
  wenjieM8ServiceSteps,
  wenjieM8Faq,
  wenjieM8Bundles,
  type WenjieM8UpgradeCategory,
} from "./wenjie-m8-upgrade-projects";

const CATEGORY_LABELS: Record<WenjieM8UpgradeCategory, string> = {
  protection: "新车保护",
  cabin_comfort: "座舱舒适",
  business_cabin: "商务座舱",
  appearance: "外观升级",
  outdoor: "户外拓展",
  electric_convenience: "电动便利",
  practical_accessory: "实用配件",
  screen_care: "屏幕保护",
  noise_sealing: "隔音密封",
};

const projectNameById = new Map(
  wenjieM8UpgradeProjects.map((p) => [p.id, p.name]),
);

export const wenjieM8PageConfig = {
  theme: "cyan" as const,

  hero: {
    badge: "问界 M8 · 专属升级方案",
    title: "问界 M8 专属升级方案",
    subtitle: "30 个升级项目 · 6 大用车场景",
    description:
      "围绕新车保护、底盘防护、电动踏板、电动门、后排娱乐、家庭座舱与商务接待 6 大场景整理 30 个升级项目。",
  },

  projects: wenjieM8UpgradeProjects.map((p) => ({
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

  scenarios: wenjieM8Scenarios.map((s) => ({
    id: s.key,
    name: s.name,
    description: s.description,
    projectIds: s.projectIds as string[],
  })),

  serviceFlow: {
    title: "服务流程",
    steps: wenjieM8ServiceSteps.map((step) => ({
      order: step.step,
      title: step.title,
      description: step.description,
    })),
  },

  faq: wenjieM8Faq.map((item) => ({
    question: item.question,
    answer: item.answer,
  })),

  bundles: wenjieM8Bundles.map((b) => ({
    id: b.key,
    name: b.name,
    description: b.description,
    items: b.projectIds.map((id) => projectNameById.get(id) ?? id),
  })),
} satisfies VehiclePageConfig;
