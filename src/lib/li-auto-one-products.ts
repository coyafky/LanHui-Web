/**
 * 理想 ONE 专题页静态数据
 *
 * 数据来源 PRD：
 *   docs/PRD/product/LI_AUTO_ONE_TOPIC_PRD_2026-06-27.md
 *
 * 节号映射：
 *   §7   8 项轻改项目目录   → liAutoOneUpgradeProjects  (length === 8)
 *   §8   5 大用车场景       → liAutoOneScenarios       (length === 5)
 *   §9   4 个推荐组合       → liAutoOneBundles         (length === 4)
 *   §11  7 步服务流程       → liAutoOneServiceSteps    (length === 7)
 *   §11  9 条 FAQ           → liAutoOneFaq             (length === 9)
 *
 * 字面量防漂移（参考 i8 / ES8 模式）
 */

export type LiAutoOneImageStatus =
  | "matched"
  | "generated-preview"
  | "pending-review"
  | "missing";

export type LiAutoOneCategory =
  | "protection"
  | "film"
  | "appearance"
  | "family_cabin"
  | "cabin_comfort"
  | "accessibility"
  | "outdoor";

export type LiAutoOneUpgradeProject = {
  /** 01-08，与海报顺序对齐 */
  order: number;
  /** 稳定 slug */
  key: string;
  /** 中文名 */
  name: string;
  category: LiAutoOneCategory;
  /** 1 句话价值说明 */
  summary: string;
  /** 可选图片路径（pending-review 阶段无图片） */
  publicPath?: `/images/products/li-auto/one/${string}.png`;
  /** 字面量 1448（有图时） */
  width?: 1448;
  /** 字面量 1086（有图时） */
  height?: 1086;
  /** 字面量 "4/3"（有图时） */
  aspectRatio?: "4/3";
  imageStatus: LiAutoOneImageStatus;
  /** 适配场景标签 */
  suitableFor: readonly string[];
  /** 可选项 — 安装注意事项或到店评估提示 */
  caution?: string;
};

export type LiAutoOneScenarioKey =
  | "refresh_protection"
  | "family_cabin"
  | "accessibility"
  | "outdoor"
  | "appearance";

export type LiAutoOneScenario = {
  key: LiAutoOneScenarioKey;
  name: string;
  description: string;
  /** 引用的 LiAutoOneUpgradeProject.key */
  projectKeys: readonly string[];
};

export type LiAutoOneBundle = {
  key: string;
  name: string;
  description: string;
  projectKeys: readonly string[];
};

export type LiAutoOneServiceStep = {
  step: number;
  title: string;
  description: string;
};

export type LiAutoOneFaqItem = {
  question: string;
  answer: string;
};

// ---- 字面量约束（防漂移）----

export const LI_AUTO_ONE_PROJECT_COUNT = 8;
export const LI_AUTO_ONE_SCENARIO_COUNT = 5;
export const LI_AUTO_ONE_BUNDLE_COUNT = 4;
export const LI_AUTO_ONE_SERVICE_STEP_COUNT = 7;
export const LI_AUTO_ONE_FAQ_COUNT = 9;

// ---- 8 项轻改项目（PRD §7，与海报顺序对齐）----

export const liAutoOneUpgradeProjects: readonly LiAutoOneUpgradeProject[] = [
  {
    order: 1,
    key: "paint-protection-film",
    name: "隐形车衣",
    category: "protection",
    summary: "漆面保护、日常划痕防护、老车焕新保持质感",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/one/generated/paint-protection-film.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["refresh_protection", "outdoor", "appearance"],
  },
  {
    order: 2,
    key: "window-film",
    name: "隔热膜",
    category: "film",
    summary: "隔热、防晒、隐私与家庭乘坐舒适",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/one/generated/window-film.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["refresh_protection", "family_cabin"],
  },
  {
    order: 3,
    key: "color-wrap",
    name: "改色膜",
    category: "appearance",
    summary: "车身外观焕新、颜色个性化和视觉辨识度",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/one/generated/color-change-film.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["refresh_protection", "appearance"],
  },
  {
    order: 4,
    key: "rear-table-tray",
    name: "小桌板",
    category: "family_cabin",
    summary: "后排用餐、办公、儿童使用和长途休息",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/one/generated/rear-table-tray.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["family_cabin"],
  },
  {
    order: 5,
    key: "ambient-lighting",
    name: "氛围灯",
    category: "cabin_comfort",
    summary: "夜间座舱氛围与内饰观感升级",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/one/generated/ambient-light.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["family_cabin"],
  },
  {
    order: 6,
    key: "electric-steps",
    name: "电动踏板",
    category: "accessibility",
    summary: "老人、小孩上下车辅助，提升日常用车便利",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/one/generated/electric-side-step.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["accessibility", "outdoor"],
    caution: "需到店确认安装位和电气接口",
  },
  {
    order: 7,
    key: "swivel-seats",
    name: "旋转座椅",
    category: "family_cabin",
    summary: "后排座椅旋转，提升座舱使用便利和空间灵活性",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/one/generated/rotating-seat.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["accessibility", "family_cabin"],
    caution: "需到店确认座椅结构、安全边界和法规要求",
  },
  {
    order: 8,
    key: "roof-platform-ladder",
    name: "车顶平台加爬梯",
    category: "outdoor",
    summary: "露营、自驾装备扩展，车顶固定点与承重依车型确认",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/one/generated/roof-platform-ladder.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["outdoor", "appearance"],
    caution: "需确认固定点、承重和合规边界，不写承重保证",
  },
];

// ---- 5 大用车场景（PRD §8）----

export const liAutoOneScenarios: readonly LiAutoOneScenario[] = [
  {
    key: "refresh_protection",
    name: "老车焕新与基础保护",
    description: "适合存量车主焕新外观、保护漆面、提升隔热隐私",
    projectKeys: [
      "paint-protection-film",
      "window-film",
      "color-wrap",
    ],
  },
  {
    key: "family_cabin",
    name: "家庭座舱舒适",
    description: "面向家庭乘坐、夜间氛围、后排使用和长途舒适",
    projectKeys: [
      "rear-table-tray",
      "ambient-lighting",
      "swivel-seats",
      "window-film",
    ],
  },
  {
    key: "accessibility",
    name: "上下车便利",
    description: "面向老人、小孩和高频家庭用车场景",
    projectKeys: [
      "electric-steps",
      "swivel-seats",
    ],
  },
  {
    key: "outdoor",
    name: "户外自驾拓展",
    description: "面向露营、自驾和户外装备扩展",
    projectKeys: [
      "roof-platform-ladder",
      "electric-steps",
      "paint-protection-film",
    ],
  },
  {
    key: "appearance",
    name: "外观个性",
    description: "强化车身视觉、户外风格和个性表达",
    projectKeys: [
      "color-wrap",
      "paint-protection-film",
      "roof-platform-ladder",
    ],
  },
];

// ---- 4 个推荐组合（PRD §9）----

export const liAutoOneBundles: readonly LiAutoOneBundle[] = [
  {
    key: "refresh-protection",
    name: "老车焕新与基础保护组合",
    description: "适合理想 ONE 存量车主",
    projectKeys: [
      "paint-protection-film",
      "window-film",
      "color-wrap",
    ],
  },
  {
    key: "family-cabin-comfort",
    name: "家庭座舱舒适组合",
    description: "适合家庭乘坐和后排高频使用",
    projectKeys: [
      "rear-table-tray",
      "ambient-lighting",
      "swivel-seats",
      "window-film",
    ],
  },
  {
    key: "accessibility-comfort",
    name: "上下车便利组合",
    description: "适合老人、小孩和高频上下车场景",
    projectKeys: [
      "electric-steps",
      "swivel-seats",
    ],
  },
  {
    key: "outdoor-expedition",
    name: "户外自驾拓展组合",
    description: "适合露营、自驾和装备扩展用户",
    projectKeys: [
      "roof-platform-ladder",
      "electric-steps",
      "paint-protection-film",
    ],
  },
];

// ---- 7 步服务流程（PRD §11）----

export const liAutoOneServiceSteps: readonly LiAutoOneServiceStep[] = [
  {
    step: 1,
    title: "车型确认",
    description: "确认理想 ONE 的年份、批次、版本和配置",
  },
  {
    step: 2,
    title: "项目选择",
    description: "根据老车焕新、座舱舒适、上下车便利或户外拓展选择项目",
  },
  {
    step: 3,
    title: "到店评估",
    description: "确认安装位、接口、材料、工期和风险提示",
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
];

// ---- 9 条 FAQ（PRD §11）----

export const liAutoOneFaq: readonly LiAutoOneFaqItem[] = [
  {
    question: "理想 ONE 的这些项目是否都能安装？",
    answer:
      "不同年份、版本和配置可能不同，需到店评估确认；具体安装可行性以现场车辆情况和施工评估为准。",
  },
  {
    question: "存量理想 ONE 最推荐先做什么？",
    answer: "隐形车衣、隔热膜、改色膜；优先解决漆面保护、隔热隐私和外观焕新。",
  },
  {
    question: "家庭座舱项目有哪些？",
    answer: "小桌板、氛围灯、旋转座椅、隔热膜；适合家庭乘坐、夜间氛围和长途舒适。",
  },
  {
    question: "户外自驾项目有哪些？",
    answer: "车顶平台加爬梯、电动踏板、隐形车衣；适合露营、自驾和装备扩展。",
  },
  {
    question: "旋转座椅是否安全？",
    answer: "旋转座椅涉及座椅结构、安全带、气囊和乘员安全，必须到店评估确认，不做无损或安全承诺。",
  },
  {
    question: "车顶平台加爬梯能否安装？",
    answer: "需确认固定点、承重和法规边界，不写承重保证；具体以车辆结构和到店评估为准。",
  },
  {
    question: "可以只做单个项目吗？",
    answer: "可以，页面项目既支持单项了解，也支持组合方案；具体施工内容以到店评估为准。",
  },
  {
    question: "是否影响原车质保？",
    answer: "不做不影响质保的承诺；具体以车辆情况和项目评估为准，施工前会告知风险与边界。",
  },
  {
    question: "工期多久？",
    answer: "根据项目组合、库存和施工排期确认；不同项目工期差异较大，到店评估后会给出明确工期。",
  },
];

// ---- 字面量 runtime check（防漂移；模块加载即触发）----

if (liAutoOneUpgradeProjects.length !== LI_AUTO_ONE_PROJECT_COUNT) {
  throw new Error(
    `LiAuto ONE project count drift: expected ${LI_AUTO_ONE_PROJECT_COUNT}, got ${liAutoOneUpgradeProjects.length}`,
  );
}
if (liAutoOneScenarios.length !== LI_AUTO_ONE_SCENARIO_COUNT) {
  throw new Error(
    `LiAuto ONE scenario count drift: expected ${LI_AUTO_ONE_SCENARIO_COUNT}, got ${liAutoOneScenarios.length}`,
  );
}
if (liAutoOneBundles.length !== LI_AUTO_ONE_BUNDLE_COUNT) {
  throw new Error(
    `LiAuto ONE bundle count drift: expected ${LI_AUTO_ONE_BUNDLE_COUNT}, got ${liAutoOneBundles.length}`,
  );
}
if (liAutoOneServiceSteps.length !== LI_AUTO_ONE_SERVICE_STEP_COUNT) {
  throw new Error(
    `LiAuto ONE service step count drift: expected ${LI_AUTO_ONE_SERVICE_STEP_COUNT}, got ${liAutoOneServiceSteps.length}`,
  );
}
if (liAutoOneFaq.length !== LI_AUTO_ONE_FAQ_COUNT) {
  throw new Error(
    `LiAuto ONE FAQ count drift: expected ${LI_AUTO_ONE_FAQ_COUNT}, got ${liAutoOneFaq.length}`,
  );
}
