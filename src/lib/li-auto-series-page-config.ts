import type { VehiclePageConfig } from "@/components/vehicle-page";
import {
  liAutoSeriesFeaturedProjects,
  liAutoSeriesOptionalProjects,
  liAutoSeriesScenarios,
  liAutoSeriesServiceSteps,
  liAutoSeriesFaq,
  type LiAutoSeriesUpgradeCategory,
} from "./li-auto-series-upgrade-projects";

const CATEGORY_LABELS: Record<LiAutoSeriesUpgradeCategory, string> = {
  paint_protection: "漆面保护",
  film_style: "膜类风格",
  chassis_protection: "底盘防护",
  rear_cabin: "后排座舱",
  electric_convenience: "电动便利",
  infotainment: "信息娱乐",
  exterior_parts: "外观件",
  outdoor_accessory: "户外配件",
  cabin_comfort: "座舱舒适",
  noise_sealing: "隔音密封",
};

const allProjects = [...liAutoSeriesFeaturedProjects, ...liAutoSeriesOptionalProjects];

export const liAutoSeriesPageConfig = {
  theme: "blue" as const,

  hero: {
    badge: "理想系列 · 项目升级方案",
    title: "理想系列项目升级方案｜蓝辉轻改 LANHUI",
    subtitle: "围绕新车保护、隔热防晒、底盘防护、二排舒适和家庭出行场景，为理想车主提供系统化轻改项目参考。",
    description:
      "蓝辉轻改提供理想系列轻改项目参考，覆盖隐形车衣、隔热膜、二排铝地板、底盘护板、电动踏板、小桌板、防虫网、门槛条、钢化膜、内饰镀膜及更多家庭出行升级项目。",
  },

  projects: allProjects.map((p) => ({
    id: p.key,
    name: p.name,
    summary: p.summary,
    suitableFor: [] as string[],
    caution: undefined,
    category: CATEGORY_LABELS[p.category] ?? p.category,
  })),

  scenarios: liAutoSeriesScenarios.map((s) => ({
    id: s.key,
    name: s.name,
    description: s.description,
    projectIds: s.projectKeys as string[],
  })),

  serviceFlow: {
    title: "服务流程",
    steps: liAutoSeriesServiceSteps.map((step) => ({
      order: step.step,
      title: step.title,
      description: step.description,
    })),
  },

  faq: liAutoSeriesFaq.map((item) => ({
    question: item.question,
    answer: item.answer,
  })),
} satisfies VehiclePageConfig;
