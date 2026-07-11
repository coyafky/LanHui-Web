import type { VehiclePageConfig } from "@/components/vehicle-page";
import { zeekrTopicMeta } from "@/lib/zeekr-products";

export const zeekrSeriesPageConfig = {
  theme: "orange" as const,

  hero: {
    badge: "ZEEKR TOPIC",
    title: zeekrTopicMeta.title,
    subtitle: "覆盖极氪 9X、极氪 8X、极氪 009 共 23 款改装配件",
    description:
      "按车型适配，座舱与尾箱统一升级，防护与便利并重。蓝辉轻改顺德大良店提供到店评估和按标准流程施工服务。",
    heroImage: {
      src: zeekrTopicMeta.previewImage,
      alt: "极氪 9X / 8X / 009 改装款式预览",
    },
    stats: {
      totalProjects: zeekrTopicMeta.totalProducts,
      totalModels: zeekrTopicMeta.totalModels,
    },
  },

  projects: [],

  scenarios: [],

  serviceFlow: {
    title: "到店沟通流程",
    steps: [
      { order: 1, title: "车型确认", description: "确认极氪 9X、8X 或 009 与年款信息。" },
      { order: 2, title: "款式选择", description: "到店对照产品表选择地板尾箱、内饰便利或防护配件。" },
      { order: 3, title: "安装评估", description: "评估原车状态与施工可行性。" },
      { order: 4, title: "施工交付", description: "按规范施工交付，提示用车注意事项。" },
    ],
  },

  faq: [],
} satisfies VehiclePageConfig;
