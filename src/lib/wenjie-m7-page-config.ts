import type { VehiclePageConfig } from "@/components/vehicle-page";
import {
  wenjieM7UpgradeProjects,
  wenjieM7Scenarios,
  wenjieM7ServiceSteps,
  wenjieM7Faq,
  wenjieM7Bundles,
  type WenjieM7UpgradeCategory,
} from "./wenjie-m7-upgrade-projects";

const CATEGORY_LABELS: Record<WenjieM7UpgradeCategory, string> = {
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
  wenjieM7UpgradeProjects.map((p) => [p.id, p.name]),
);

export const wenjieM7PageConfig = {
  theme: "cyan" as const,

  hero: {
    badge: "问界 M7 · 专属升级方案",
    title: "问界 M7 专属升级方案",
    subtitle: "30 个升级项目 · 7 大用车场景",
    description:
      "围绕新车保护、底盘防护、电动踏板、后排娱乐、家庭座舱与商务接待 7 大场景整理 30 个升级项目。",
  },

  projects: wenjieM7UpgradeProjects.map((p) => ({
    id: p.id,
    name: p.name,
    summary: p.summary,
    suitableFor: p.suitableFor as string[],
    caution: p.caution,
    category: CATEGORY_LABELS[p.category] ?? p.category,
  })),

  scenarios: wenjieM7Scenarios.map((s) => ({
    id: s.key,
    name: s.name,
    description: s.description,
    projectIds: s.projectIds as string[],
  })),

  serviceFlow: {
    title: "服务流程",
    steps: wenjieM7ServiceSteps.map((step) => ({
      order: step.step,
      title: step.title,
      description: step.description,
    })),
  },

  faq: wenjieM7Faq.map((item) => ({
    question: item.question,
    answer: item.answer,
  })),

  bundles: wenjieM7Bundles.map((b) => ({
    id: b.key,
    name: b.name,
    description: b.description,
    items: b.projectIds.map((id) => projectNameById.get(id) ?? id),
  })),
} satisfies VehiclePageConfig;
