import type { VehiclePageConfig } from "@/components/vehicle-page";
import {
  denzaD9UpgradeProjects,
  denzaD9Scenarios,
  denzaD9ServiceSteps,
  denzaD9Faq,
  DENZA_D9_CATEGORY_LABELS,
  DENZA_D9_HERO_IMAGE,
} from "./denza-d9-products";

export const denzaD9PageConfig = {
  theme: "blue" as const,

  hero: {
    badge: "腾势 D9 · 轻改方案",
    title: "腾势 D9 专属升级方案",
    subtitle: "23 项升级项目 · 5 大用车场景",
    description:
      "蓝辉轻改整理腾势 D9 23 项热门轻改产品：车衣、隔热膜、彩绘、双拼改色、360软包脚垫、铝地板、平衡杆、amxt包围、bskt运动包围、底盘护板、小桌板、氛围灯、日行灯、抬头显示、吸顶电视、D柱灯、铝合金行李架、挡泥板、防虫网、钢化膜、门槛条、牌照框和内饰镀膜。覆盖新车保护、外观个性、座舱防护、底盘与行车防护、高端质感 5 大用车场景，到店评估按标准流程施工。",
    heroImage: {
      src: DENZA_D9_HERO_IMAGE.publicPath ?? "",
      alt: DENZA_D9_HERO_IMAGE.alt,
      width: DENZA_D9_HERO_IMAGE.width ?? 1448,
      height: DENZA_D9_HERO_IMAGE.height ?? 1086,
    },
  },

  projects: denzaD9UpgradeProjects.map((p) => ({
    id: p.id,
    name: p.name,
    summary: p.summary,
    suitableFor: p.suitableFor as string[],
    caution: p.caution,
    category: DENZA_D9_CATEGORY_LABELS[p.category],
    imageStatus: p.imageStatus,
    imagePublicPath: p.image.publicPath,
    imageAlt: p.name,
    imageWidth: p.image.width,
    imageHeight: p.image.height,
  })),

  scenarios: denzaD9Scenarios.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    projectIds: s.projectIds as string[],
  })),

  serviceFlow: {
    title: "服务流程",
    steps: denzaD9ServiceSteps.map((step) => ({
      order: step.order,
      title: step.title,
      description: step.description,
    })),
  },

  faq: denzaD9Faq.map((item) => ({
    question: item.question,
    answer: item.answer,
  })),
} satisfies VehiclePageConfig;
