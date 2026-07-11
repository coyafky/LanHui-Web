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

export const nioEs8PageConfig = {
  theme: "green" as const,

  hero: {
    badge: "蔚来 ES8 · 轻改方案",
    title: "蔚来 ES8 轻改升级方案",
    subtitle: "17 项升级项目 · 4 大用车场景",
    description:
      "蓝辉轻改整理蔚来 ES8 17 项热门轻改产品：车衣、隔热膜、彩绘、双拼改色、360 脚垫、铝地板、平衡杆、轮毂、运动包围、小桌板、挡泥板、防虫网、钢化膜、底盘护板、刹车卡钳、内饰镀膜。覆盖新车保护、外观个性、家庭座舱、行车与日常防护 4 大用车场景，到店评估、按标准流程施工。",
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
