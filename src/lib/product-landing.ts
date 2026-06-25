/**
 * Product Landing Data — PRD v3 §5.2 新增数据
 *
 * 包含:
 * - ProductCombo: 4 个推荐组合 (围绕用车场景)
 * - ProductFAQ: 5 个常见问题 (general / service / vehicle / compliance)
 *
 * 静态数据 — 不需要从 DB 加载, 跟 products.ts 一样按关注点分文件
 */

export type ProductComboSlug =
  | "new-car-protection"
  | "business-comfort"
  | "appearance-stance"
  | "daily-protection";

export type ProductCombo = {
  slug: ProductComboSlug;
  title: string;
  description: string;
  iconKey: "shield" | "sofa" | "sparkles" | "wrench";
  includes: readonly string[];
  suitableFor: readonly string[];
};

export type ProductFAQ = {
  question: string;
  answer: string;
  category: "general" | "service" | "vehicle" | "compliance";
};

export const COMBOS: readonly ProductCombo[] = [
  {
    slug: "new-car-protection",
    title: "新车基础保护",
    description:
      "刚提新能源车的优先级：漆面 / 玻璃 / 底盘 / 脚垫 一次到位",
    iconKey: "shield",
    includes: ["ppf", "window-film", "floor-mats", "skid-plate"],
    suitableFor: ["xiaomi", "wenjie", "zeekr"],
  },
  {
    slug: "business-comfort",
    title: "商务舒适升级",
    description: "MPV / 大六座 SUV 后排体验升级",
    iconKey: "sofa",
    includes: ["flooring", "business-comfort"],
    suitableFor: ["voyah", "denza", "gaoshan", "wenjie"],
  },
  {
    slug: "appearance-stance",
    title: "外观姿态升级",
    description: "改色 / 轮毂 / 包围 组合表达",
    iconKey: "sparkles",
    includes: ["color-film", "wheels", "chassis"],
    suitableFor: ["xiaomi", "zeekr", "xpeng"],
  },
  {
    slug: "daily-protection",
    title: "日常实用防护",
    description: "家用通勤常用小配件集合",
    iconKey: "wrench",
    includes: ["floor-mats", "skid-plate"],
    suitableFor: ["li-auto", "tesla", "ledao", "zhijie"],
  },
] as const;

export const FAQS: readonly ProductFAQ[] = [
  {
    question: "项目到店都做吗？需要预约吗？",
    answer: "建议提前到店或线上沟通车型与年款，确认方案后再约施工时间。",
    category: "general",
  },
  {
    question: "施工会影响原车质保吗？",
    answer:
      "具体项目需结合车型年款与原车结构确认；优先选择不破坏原车结构的安装方式。",
    category: "compliance",
  },
  {
    question: "所有车型都能做吗？",
    answer:
      "我们已为问界 / 小米 / 极氪 / 理想等主流新能源车型整理方案；其他车型可到店沟通。",
    category: "vehicle",
  },
  {
    question: "项目组合有套餐价吗？",
    answer: "我们按项目独立报价，组合方案提供整体优惠；具体以到店沟通为准。",
    category: "service",
  },
  {
    question: "施工周期一般多长？",
    answer:
      "不同项目差异较大：贴膜类通常 1-2 天，电动踏板安装约 3-4 小时，轮毂升级 1 天。",
    category: "service",
  },
] as const;
