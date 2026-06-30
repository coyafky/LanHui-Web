/**
 * 问界 M8 专属升级方案 — 单车型专题页数据
 *
 * 数据来源 PRD：
 *   docs/PRD/product/WENJIE_M8_TOPIC_PRD_2026-06-25.md
 *
 * 节号映射：
 *   §7.1 + §7.2 + §7.3 = 30 项目（5 必改 + 15 商务 + 10 小配件）→ wenjieM8UpgradeProjects
 *     分桶导出：wenjieM8MustHaveProjects (5) / wenjieM8BusinessUpgradeProjects (15) / wenjieM8PracticalAccessoryProjects (10)
 *     特殊：§7.2 第 10 项 "电动门" 带 caution 字段 + 暴露单条引用 wenjieM8ElectricDoorProject（PRD §10 P0）
 *   §8  6 场景         → wenjieM8Scenarios       (length === 6)
 *   §9.1/9.2/9.3/9.4 4 组合 → wenjieM8Bundles         (length === 4)
 *   §12 7 步服务流程   → wenjieM8ServiceSteps    (length === 7)
 *   §13 8 条 FAQ       → wenjieM8Faq             (length === 8)
 *
 * 字段值零变更 —— 直接从 PRD §7.1/§7.2/§7.3 表格抄写。展示图统一
 * 使用 generated-preview，后续可逐项替换为 real。
 *
 * 命名差异（Architect §1.3）：
 *   - M8 软包脚垫保留原名 "三防软包脚垫"
 *   - 改色使用 "改色"（不带"膜"）
 *   - 内衬使用 "内衬"（不带"挡泥板"）
 *   - 与 M7 差异：M8 §7.2 第 10 项是 "电动门"（M7 这里是 "智能头枕"）；M8 §8 是 6 场景（无独立"电动便利"场景）
 */

import {
  buildWenjieGeneratedPreviewImage,
  type WenjieModelCategory,
  type WenjiePreviewImage,
  type WenjiePreviewImageStatus,
} from "./wenjie-preview-images";

export type WenjieM8Tier = "must_have" | "business_upgrade" | "practical_accessory";

export type WenjieM8UpgradeCategory =
  | "protection"
  | "cabin_comfort"
  | "business_cabin"
  | "appearance"
  | "outdoor"
  | "electric_convenience"
  | "practical_accessory"
  | "screen_care"
  | "noise_sealing";

export type WenjieM8ImageStatus = WenjiePreviewImageStatus;

export type WenjieM8SourceArea =
  | "poster_must_have"
  | "poster_business_upgrade"
  | "poster_practical_accessory";

export type WenjieM8UpgradeProject = {
  id: string;
  /** 1..30（按 PRD §7 序号） */
  order: number;
  name: string;
  tier: WenjieM8Tier;
  category: WenjieM8UpgradeCategory;
  summary: string;
  suitableFor: readonly string[];
  caution?: string;
  imageStatus: WenjieM8ImageStatus;
  image: WenjiePreviewImage;
  sourceArea: WenjieM8SourceArea;
};

type WenjieM8UpgradeProjectRow = Omit<WenjieM8UpgradeProject, "image">;

function withWenjieM8PreviewImages(
  projects: readonly WenjieM8UpgradeProjectRow[],
): readonly WenjieM8UpgradeProject[] {
  return projects.map((project) => ({
    ...project,
    ...buildWenjieGeneratedPreviewImage(project.id, project.name, "M8"),
  }));
}

// ---- §7.1 必改产品（5 项） ----
const wenjieM8MustHaveProjectRows = [
  {
    id: "m8-window-film",
    order: 1,
    name: "隔热膜",
    tier: "must_have",
    category: "protection",
    summary: "隔热、防晒、隐私和长途驾乘舒适",
    suitableFor: ["隔热防晒", "隐私保护", "长途驾乘"],
    imageStatus: "generated-preview",
    sourceArea: "poster_must_have",
  },
  {
    id: "m8-paint-film",
    order: 2,
    name: "车衣",
    tier: "must_have",
    category: "protection",
    summary: "漆面保护、日常轻微划痕防护、新车质感保持",
    suitableFor: ["新车保护", "日常轻微划痕防护"],
    imageStatus: "generated-preview",
    sourceArea: "poster_must_have",
  },
  {
    id: "m8-three-proof-mat",
    order: 3,
    name: "三防软包脚垫",
    tier: "must_have",
    category: "cabin_comfort",
    summary: "防水、防污、易清洁，适合家庭高频使用",
    suitableFor: ["家庭高频使用", "防水防污"],
    imageStatus: "generated-preview",
    sourceArea: "poster_must_have",
  },
  {
    id: "m8-skid-plate",
    order: 4,
    name: "底盘护板",
    tier: "must_have",
    category: "protection",
    summary: "保护底部关键区域，适合新车基础防护",
    suitableFor: ["新车基础防护", "底部防护"],
    imageStatus: "generated-preview",
    sourceArea: "poster_must_have",
  },
  {
    id: "m8-electric-step",
    order: 5,
    name: "电动踏板",
    tier: "must_have",
    category: "electric_convenience",
    summary: "上下车便利，适合家庭成员和高频出入场景",
    suitableFor: ["家庭高频出入", "老人儿童上下车"],
    imageStatus: "generated-preview",
    sourceArea: "poster_must_have",
  },
] as const satisfies readonly WenjieM8UpgradeProjectRow[];

export const wenjieM8MustHaveProjects = withWenjieM8PreviewImages(
  wenjieM8MustHaveProjectRows,
);

// ---- §7.2 高级商务升级（15 项，含 §10 P0 电动门） ----
const wenjieM8BusinessUpgradeProjectRows = [
  {
    id: "m8-rear-entertainment",
    order: 6,
    name: "后排娱乐电视",
    tier: "business_upgrade",
    category: "business_cabin",
    summary: "提升后排娱乐体验，适合家庭和商务接待",
    suitableFor: ["家庭", "商务接待"],
    imageStatus: "generated-preview",
    sourceArea: "poster_business_upgrade",
  },
  {
    id: "m8-ambient-light",
    order: 7,
    name: "氛围灯",
    tier: "business_upgrade",
    category: "cabin_comfort",
    summary: "提升夜间座舱氛围和科技感",
    suitableFor: ["夜间氛围"],
    imageStatus: "generated-preview",
    sourceArea: "poster_business_upgrade",
  },
  {
    id: "m8-rear-table",
    order: 8,
    name: "小桌板",
    tier: "business_upgrade",
    category: "cabin_comfort",
    summary: "后排办公、用餐、儿童使用场景",
    suitableFor: ["后排办公", "儿童使用"],
    imageStatus: "generated-preview",
    sourceArea: "poster_business_upgrade",
  },
  {
    id: "m8-aluminum-floor",
    order: 9,
    name: "铝地板",
    tier: "business_upgrade",
    category: "cabin_comfort",
    summary: "后排空间保护、易清洁、提升座舱质感",
    suitableFor: ["后排空间", "家庭出行"],
    imageStatus: "generated-preview",
    sourceArea: "poster_business_upgrade",
  },
  {
    id: "m8-electric-door",
    order: 10,
    name: "电动门",
    tier: "business_upgrade",
    category: "electric_convenience",
    summary: "提升开闭便利和商务接待仪式感，需重点确认适配",
    suitableFor: ["商务接待", "高频开闭"],
    caution: "电动门属于高级商务升级，必须确认车型版本、门体结构、安装方式和施工风险，到店评估后再施工。",
    imageStatus: "generated-preview",
    sourceArea: "poster_business_upgrade",
  },
  {
    id: "m8-wheels",
    order: 11,
    name: "轮毂",
    tier: "business_upgrade",
    category: "appearance",
    summary: "改变整车侧面姿态和视觉质感",
    suitableFor: ["外观升级"],
    imageStatus: "generated-preview",
    sourceArea: "poster_business_upgrade",
  },
  {
    id: "m8-sway-bar",
    order: 12,
    name: "平衡杆",
    tier: "business_upgrade",
    category: "protection",
    summary: "车身支撑和驾驶稳定感，需到店评估",
    suitableFor: ["车身支撑"],
    caution: "需到店评估",
    imageStatus: "generated-preview",
    sourceArea: "poster_business_upgrade",
  },
  {
    id: "m8-stream-mirror",
    order: 13,
    name: "流媒体后视镜",
    tier: "business_upgrade",
    category: "cabin_comfort",
    summary: "提升后方视野显示和科技感",
    suitableFor: ["后方视野"],
    imageStatus: "generated-preview",
    sourceArea: "poster_business_upgrade",
  },
  {
    id: "m8-starlight-roof",
    order: 14,
    name: "星空顶",
    tier: "business_upgrade",
    category: "cabin_comfort",
    summary: "强化车内氛围和豪华感",
    suitableFor: ["车内氛围"],
    imageStatus: "generated-preview",
    sourceArea: "poster_business_upgrade",
  },
  {
    id: "m8-starlight-film",
    order: 15,
    name: "星空膜",
    tier: "business_upgrade",
    category: "cabin_comfort",
    summary: "提升天幕/玻璃视觉氛围和个性化表达",
    suitableFor: ["天幕/玻璃氛围"],
    imageStatus: "generated-preview",
    sourceArea: "poster_business_upgrade",
  },
  {
    id: "m8-sport-kit",
    order: 16,
    name: "运动包围",
    tier: "business_upgrade",
    category: "appearance",
    summary: "强化外观运动姿态和视觉完整度",
    suitableFor: ["外观运动"],
    imageStatus: "generated-preview",
    sourceArea: "poster_business_upgrade",
  },
  {
    id: "m8-roof-platform",
    order: 17,
    name: "车顶平台套件",
    tier: "business_upgrade",
    category: "outdoor",
    summary: "拓展车顶载物和户外场景表达，需确认适配",
    suitableFor: ["户外露营"],
    caution: "需确认适配",
    imageStatus: "generated-preview",
    sourceArea: "poster_business_upgrade",
  },
  {
    id: "m8-color-change",
    order: 18,
    name: "改色",
    tier: "business_upgrade",
    category: "appearance",
    summary: "改变车身视觉风格，提升辨识度",
    suitableFor: ["外观个性"],
    imageStatus: "generated-preview",
    sourceArea: "poster_business_upgrade",
  },
  {
    id: "m8-leg-rest",
    order: 19,
    name: "腿托",
    tier: "business_upgrade",
    category: "cabin_comfort",
    summary: "提升长途乘坐舒适",
    suitableFor: ["长途乘坐"],
    imageStatus: "generated-preview",
    sourceArea: "poster_business_upgrade",
  },
  {
    id: "m8-brake-caliper",
    order: 20,
    name: "刹车卡钳",
    tier: "business_upgrade",
    category: "appearance",
    summary: "强化轮毂区域运动视觉，不做制动性能承诺",
    suitableFor: ["轮毂区域视觉"],
    imageStatus: "generated-preview",
    sourceArea: "poster_business_upgrade",
  },
] as const satisfies readonly WenjieM8UpgradeProjectRow[];

export const wenjieM8BusinessUpgradeProjects = withWenjieM8PreviewImages(
  wenjieM8BusinessUpgradeProjectRows,
);

// ---- §7.3 实用小配件（10 项） ----
const wenjieM8PracticalAccessoryProjectRows = [
  {
    id: "m8-door-sill",
    order: 21,
    name: "门槛条",
    tier: "practical_accessory",
    category: "protection",
    summary: "上下车高频区域防刮、防踩踏磨损",
    suitableFor: ["上下车高频区域"],
    imageStatus: "generated-preview",
    sourceArea: "poster_practical_accessory",
  },
  {
    id: "m8-license-frame",
    order: 22,
    name: "牌照框",
    tier: "practical_accessory",
    category: "appearance",
    summary: "优化车头/车尾细节，提升视觉完整度",
    suitableFor: ["外观小件"],
    imageStatus: "generated-preview",
    sourceArea: "poster_practical_accessory",
  },
  {
    id: "m8-screen-protector",
    order: 23,
    name: "钢化膜",
    tier: "practical_accessory",
    category: "screen_care",
    summary: "中控/娱乐屏幕防刮保护",
    suitableFor: ["屏幕防刮"],
    imageStatus: "generated-preview",
    sourceArea: "poster_practical_accessory",
  },
  {
    id: "m8-bug-guard",
    order: 24,
    name: "防虫网",
    tier: "practical_accessory",
    category: "practical_accessory",
    summary: "减少虫石杂物进入关键散热/进风区域",
    suitableFor: ["行车防护"],
    imageStatus: "generated-preview",
    sourceArea: "poster_practical_accessory",
  },
  {
    id: "m8-door-seal",
    order: 25,
    name: "四门密封条",
    tier: "practical_accessory",
    category: "noise_sealing",
    summary: "提升门体密封体验，具体效果以安装评估为准",
    suitableFor: ["门体密封"],
    imageStatus: "generated-preview",
    sourceArea: "poster_practical_accessory",
  },
  {
    id: "m8-trunk-mat",
    order: 26,
    name: "尾箱垫",
    tier: "practical_accessory",
    category: "practical_accessory",
    summary: "后备箱区域防污、易清洁",
    suitableFor: ["后备箱防污"],
    imageStatus: "generated-preview",
    sourceArea: "poster_practical_accessory",
  },
  {
    id: "m8-interior-silicone",
    order: 27,
    name: "内饰硅胶件",
    tier: "practical_accessory",
    category: "cabin_comfort",
    summary: "保护高频接触区域，提升收纳和防滑体验",
    suitableFor: ["高频接触区域"],
    imageStatus: "generated-preview",
    sourceArea: "poster_practical_accessory",
  },
  {
    id: "m8-mud-flap",
    order: 28,
    name: "挡泥板",
    tier: "practical_accessory",
    category: "practical_accessory",
    summary: "减少泥水飞溅和车身侧面污染",
    suitableFor: ["车身侧面清洁"],
    imageStatus: "generated-preview",
    sourceArea: "poster_practical_accessory",
  },
  {
    id: "m8-liner",
    order: 29,
    name: "内衬",
    tier: "practical_accessory",
    category: "practical_accessory",
    summary: "轮拱/局部区域防护，需确认安装位置",
    suitableFor: ["轮拱/局部防护"],
    caution: "需确认安装位置",
    imageStatus: "generated-preview",
    sourceArea: "poster_practical_accessory",
  },
  {
    id: "m8-door-sound-insulation",
    order: 30,
    name: "四门隔音",
    tier: "practical_accessory",
    category: "noise_sealing",
    summary: "车门区域隔音处理，具体效果以施工评估为准",
    suitableFor: ["车门隔音"],
    imageStatus: "generated-preview",
    sourceArea: "poster_practical_accessory",
  },
] as const satisfies readonly WenjieM8UpgradeProjectRow[];

export const wenjieM8PracticalAccessoryProjects = withWenjieM8PreviewImages(
  wenjieM8PracticalAccessoryProjectRows,
);

// ---- 合并 30 项（按 PRD §7 序号） ----
export const wenjieM8UpgradeProjects = [
  ...wenjieM8MustHaveProjects,
  ...wenjieM8BusinessUpgradeProjects,
  ...wenjieM8PracticalAccessoryProjects,
] as const satisfies readonly WenjieM8UpgradeProject[];

// ---- §10 P0 电动门单条引用 ----
export const wenjieM8ElectricDoorProject: WenjieM8UpgradeProject =
  wenjieM8BusinessUpgradeProjects[4];

// ---- §8 6 个场景 ----
export type WenjieM8Scenario = {
  key: string;
  name: string;
  description: string;
  projectIds: readonly string[];
};

export const wenjieM8Scenarios: readonly WenjieM8Scenario[] = [
  {
    key: "m8-scenario-new-car-protection",
    name: "新车基础保护",
    description: "适合刚提车用户，优先解决保护和日常使用问题",
    projectIds: [
      "m8-window-film",
      "m8-paint-film",
      "m8-three-proof-mat",
      "m8-skid-plate",
      "m8-screen-protector",
      "m8-door-sill",
    ],
  },
  {
    key: "m8-scenario-business-cabin",
    name: "商务座舱氛围",
    description: "强化商务接待和座舱高级感",
    projectIds: [
      "m8-rear-entertainment",
      "m8-ambient-light",
      "m8-rear-table",
      "m8-aluminum-floor",
      "m8-starlight-roof",
      "m8-starlight-film",
    ],
  },
  {
    key: "m8-scenario-electric-and-rear-comfort",
    name: "电动便利与后排舒适",
    description: "适合家庭、商务和高频上下车场景",
    projectIds: [
      "m8-electric-step",
      "m8-electric-door",
      "m8-leg-rest",
      "m8-rear-table",
      "m8-rear-entertainment",
    ],
  },
  {
    key: "m8-scenario-exterior-sport",
    name: "外观运动升级",
    description: "强化视觉辨识度和运动姿态",
    projectIds: [
      "m8-wheels",
      "m8-sport-kit",
      "m8-color-change",
      "m8-brake-caliper",
      "m8-license-frame",
    ],
  },
  {
    key: "m8-scenario-outdoor",
    name: "户外拓展",
    description: "适合露营、户外和复杂路况前的防护准备",
    projectIds: ["m8-roof-platform", "m8-skid-plate", "m8-bug-guard", "m8-mud-flap"],
  },
  {
    key: "m8-scenario-practical-detail",
    name: "实用细节防护",
    description: "降低高频使用磨损，补齐日常细节",
    projectIds: [
      "m8-door-sill",
      "m8-trunk-mat",
      "m8-interior-silicone",
      "m8-liner",
      "m8-door-seal",
      "m8-door-sound-insulation",
    ],
  },
] as const;

// ---- §9.1/9.2/9.3/9.4 4 个推荐组合 ----
export type WenjieM8Bundle = {
  key: string;
  name: string;
  description: string;
  projectIds: readonly string[];
};

export const wenjieM8Bundles: readonly WenjieM8Bundle[] = [
  {
    key: "m8-bundle-must-have",
    name: "新车必改组合",
    description: "适合刚提车的问界 M8 车主",
    projectIds: [
      "m8-window-film",
      "m8-paint-film",
      "m8-three-proof-mat",
      "m8-skid-plate",
      "m8-electric-step",
    ],
  },
  {
    key: "m8-bundle-business-cabin",
    name: "商务座舱升级组合",
    description: "适合家庭和商务接待场景",
    projectIds: [
      "m8-rear-entertainment",
      "m8-ambient-light",
      "m8-rear-table",
      "m8-aluminum-floor",
      "m8-starlight-roof",
      "m8-starlight-film",
    ],
  },
  {
    key: "m8-bundle-electric-and-rear",
    name: "电动便利与后排舒适组合",
    description: "适合家庭、商务和高频上下车场景",
    projectIds: ["m8-electric-step", "m8-electric-door", "m8-leg-rest", "m8-rear-table"],
  },
  {
    key: "m8-bundle-practical-accessory",
    name: "实用小配件组合",
    description: "适合想低成本补齐日常细节的用户",
    projectIds: [
      "m8-door-sill",
      "m8-screen-protector",
      "m8-bug-guard",
      "m8-trunk-mat",
      "m8-mud-flap",
      "m8-interior-silicone",
    ],
  },
] as const;

// ---- §12 7 步服务流程 ----
export type WenjieM8ServiceStep = {
  step: number;
  title: string;
  description: string;
};

export const wenjieM8ServiceSteps: readonly WenjieM8ServiceStep[] = [
  {
    step: 1,
    title: "车型确认",
    description: "确认问界 M8 的年份、批次、版本和配置",
  },
  {
    step: 2,
    title: "项目选择",
    description: "根据必改、商务、小配件或使用场景选择项目",
  },
  {
    step: 3,
    title: "到店评估",
    description: "确认安装位、接口、材料、工期和风险提示，尤其是电动门等结构件",
  },
  {
    step: 4,
    title: "方案确认",
    description: "确认项目组合、施工时间和注意事项",
  },
  {
    step: 5,
    title: "施工安装",
    description: "按项目标准施工，并做好车身和内饰保护",
  },
  {
    step: 6,
    title: "验收交付",
    description: "检查外观、功能和安装细节",
  },
  {
    step: 7,
    title: "售后支持",
    description: "提供使用注意事项和后续维护建议",
  },
] as const;

// ---- §13 8 条 FAQ ----
export type WenjieM8FaqItem = {
  question: string;
  answer: string;
};

export const wenjieM8Faq: readonly WenjieM8FaqItem[] = [
  {
    question: "问界 M8 的这些项目是否都能安装？",
    answer: "不同年份、版本和配置可能不同，需到店评估确认",
  },
  {
    question: "为什么分成必改产品、高级商务升级、实用小配件？",
    answer: "方便用户先做基础保护，再按预算和场景选择进阶项目",
  },
  {
    question: "新车最推荐先做什么？",
    answer: "隔热膜、车衣、三防软包脚垫、底盘护板、电动踏板",
  },
  {
    question: "电动门有什么注意？",
    answer: "需要重点确认车型版本、门体结构、安装方式和施工风险",
  },
  {
    question: "商务座舱项目有哪些？",
    answer: "后排娱乐电视、氛围灯、小桌板、铝地板、星空顶、星空膜等",
  },
  {
    question: "实用小配件可以单独做吗？",
    answer: "可以，门槛条、钢化膜、尾箱垫、挡泥板等都适合单项了解",
  },
  {
    question: "是否影响原车质保？",
    answer: "不做不影响质保的承诺，具体以车辆情况和项目评估为准",
  },
  {
    question: "工期多久？",
    answer: "根据项目组合、库存和施工排期确认",
  },
] as const;
