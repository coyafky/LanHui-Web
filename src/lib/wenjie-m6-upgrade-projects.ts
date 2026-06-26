/**
 * 问界 M6 专属升级方案 — 单车型专题页数据
 *
 * 数据来源 PRD：
 *   docs/PRD/product/WENJIE_M6_TOPIC_PRD_2026-06-25.md
 *
 * 节号映射：
 *   §7  17 个项目      → wenjieM6UpgradeProjects  (length === 17, 单层级无 tier)
 *   §8  6 个场景       → wenjieM6Scenarios       (length === 6)
 *   §9.1/9.2/9.3 3 组合 → wenjieM6Bundles         (length === 3)
 *   §13 7 步服务流程   → wenjieM6ServiceSteps    (length === 7)
 *   §14 7 条 FAQ       → wenjieM6Faq             (length === 7)
 *
 * 字段值零变更 —— 直接从 PRD §7 表格抄写。一期 imageStatus 全部为 "pending-review"。
 *
 * 命名差异（Architect §1.3）：
 *   - M6 软包脚垫保留原名 "360 软包脚垫"
 */

export type WenjieM6UpgradeCategory =
  | "protection"
  | "appearance"
  | "electric_convenience"
  | "chassis"
  | "family_cabin"
  | "screen_care";

export type WenjieM6ImageStatus = "matched" | "pending-review" | "missing";

export type WenjieM6SourceArea = "poster_project_matrix";

export type WenjieM6UpgradeProject = {
  id: string;
  /** 1..17 */
  order: number;
  name: string;
  category: WenjieM6UpgradeCategory;
  summary: string;
  suitableFor: readonly string[];
  caution?: string;
  imageStatus: WenjieM6ImageStatus;
  sourceArea: WenjieM6SourceArea;
};

// ---- §7 17 个项目 ----
export const wenjieM6UpgradeProjects = [
  {
    id: "m6-paint-film",
    order: 1,
    name: "车衣",
    category: "protection",
    summary: "漆面保护、日常轻微划痕防护、新车质感保持",
    suitableFor: ["新车保护", "日常轻微划痕防护"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "m6-window-film",
    order: 2,
    name: "隔热膜",
    category: "protection",
    summary: "隔热、防晒、隐私和驾乘舒适",
    suitableFor: ["隔热防晒", "隐私保护", "长途驾乘"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "m6-color-paint",
    order: 3,
    name: "彩绘",
    category: "appearance",
    summary: "主题化车身视觉表达，提升辨识度",
    suitableFor: ["外观个性表达"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "m6-electric-step",
    order: 4,
    name: "电动踏板",
    category: "electric_convenience",
    summary: "上下车便利，适合家庭成员和高频出入场景",
    suitableFor: ["家庭高频出入", "老人儿童上下车"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "m6-floor-mat-360",
    order: 5,
    name: "360 软包脚垫",
    category: "family_cabin",
    summary: "地毯保护、易清洁、提升座舱完整感",
    suitableFor: ["地毯保护", "易清洁"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "m6-aluminum-floor",
    order: 6,
    name: "铝地板",
    category: "family_cabin",
    summary: "后排空间保护、易清洁、提升车内质感",
    suitableFor: ["后排空间", "家庭出行"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "m6-sway-bar",
    order: 7,
    name: "平衡杆",
    category: "chassis",
    summary: "车身支撑和驾驶稳定感，需到店评估",
    suitableFor: ["车身支撑"],
    caution: "需到店评估",
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "m6-sport-kit",
    order: 8,
    name: "运动包围",
    category: "appearance",
    summary: "强化整车运动姿态和视觉完整度",
    suitableFor: ["外观运动"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "m6-ambient-light",
    order: 9,
    name: "氛围灯",
    category: "family_cabin",
    summary: "提升夜间座舱氛围和科技感",
    suitableFor: ["夜间氛围"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "m6-skid-plate",
    order: 10,
    name: "底盘护板",
    category: "protection",
    summary: "保护底部关键区域，适合新车基础防护",
    suitableFor: ["新车基础防护", "底部防护"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "m6-rear-table",
    order: 11,
    name: "小桌板",
    category: "family_cabin",
    summary: "后排办公、用餐、儿童使用场景",
    suitableFor: ["后排办公", "儿童使用"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "m6-mud-flap",
    order: 12,
    name: "挡泥板",
    category: "chassis",
    summary: "减少泥水飞溅和车身侧面污染",
    suitableFor: ["车身侧面清洁"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "m6-bug-guard",
    order: 13,
    name: "防虫网",
    category: "chassis",
    summary: "减少虫石杂物进入关键散热/进风区域",
    suitableFor: ["行车防护"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "m6-hud",
    order: 14,
    name: "抬头显示",
    category: "electric_convenience",
    summary: "提升驾驶信息可视化和科技感，需确认安装适配",
    suitableFor: ["驾驶信息可视化"],
    caution: "需确认安装适配",
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "m6-screen-protector",
    order: 15,
    name: "钢化膜",
    category: "screen_care",
    summary: "中控/娱乐屏幕防刮保护",
    suitableFor: ["屏幕防刮"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "m6-door-sill",
    order: 16,
    name: "门槛条",
    category: "protection",
    summary: "上下车高频区域防刮、防踩踏磨损",
    suitableFor: ["上下车高频区域"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "m6-license-frame",
    order: 17,
    name: "牌照框",
    category: "appearance",
    summary: "优化车头/车尾细节，提升视觉完整度",
    suitableFor: ["外观小件"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
] as const satisfies readonly WenjieM6UpgradeProject[];

// ---- §8 6 个场景 ----
export type WenjieM6Scenario = {
  key: string;
  name: string;
  description: string;
  projectIds: readonly string[];
};

export const wenjieM6Scenarios: readonly WenjieM6Scenario[] = [
  {
    key: "m6-scenario-new-car-protection",
    name: "新车保护",
    description: "适合刚提车用户，优先解决保护和日常使用问题",
    projectIds: [
      "m6-paint-film",
      "m6-window-film",
      "m6-floor-mat-360",
      "m6-skid-plate",
      "m6-door-sill",
      "m6-screen-protector",
    ],
  },
  {
    key: "m6-scenario-exterior-personality",
    name: "外观个性",
    description: "强化视觉辨识度和整车外观细节",
    projectIds: ["m6-color-paint", "m6-sport-kit", "m6-license-frame", "m6-door-sill"],
  },
  {
    key: "m6-scenario-electric-convenience",
    name: "电动便利",
    description: "提升日常使用便利和驾驶科技感",
    projectIds: ["m6-electric-step", "m6-hud"],
  },
  {
    key: "m6-scenario-chassis-driving",
    name: "底盘与行车防护",
    description: "关注底部防护、行车环境和车身侧面清洁",
    projectIds: ["m6-sway-bar", "m6-skid-plate", "m6-bug-guard", "m6-mud-flap"],
  },
  {
    key: "m6-scenario-family-cabin",
    name: "家庭座舱",
    description: "适合家庭出行、后排使用和座舱舒适",
    projectIds: ["m6-aluminum-floor", "m6-rear-table", "m6-ambient-light", "m6-floor-mat-360"],
  },
  {
    key: "m6-scenario-screen-interior-care",
    name: "屏幕与内饰维护",
    description: "降低高频使用磨损，保持车内质感",
    projectIds: ["m6-screen-protector", "m6-door-sill", "m6-floor-mat-360", "m6-aluminum-floor"],
  },
] as const;

// ---- §9.1/9.2/9.3 3 个推荐组合 ----
export type WenjieM6Bundle = {
  key: string;
  name: string;
  description: string;
  projectIds: readonly string[];
};

export const wenjieM6Bundles: readonly WenjieM6Bundle[] = [
  {
    key: "m6-bundle-new-car-basics",
    name: "新车基础保护组合",
    description: "适合刚提车的问界 M6 车主",
    projectIds: [
      "m6-paint-film",
      "m6-window-film",
      "m6-floor-mat-360",
      "m6-skid-plate",
      "m6-door-sill",
      "m6-screen-protector",
    ],
  },
  {
    key: "m6-bundle-family-comfort",
    name: "家庭舒适与座舱便利组合",
    description: "适合家庭乘坐和后排高频使用",
    projectIds: [
      "m6-aluminum-floor",
      "m6-rear-table",
      "m6-ambient-light",
      "m6-electric-step",
      "m6-floor-mat-360",
    ],
  },
  {
    key: "m6-bundle-exterior-sport",
    name: "外观运动升级组合",
    description: "适合追求视觉辨识度和运动姿态的用户",
    projectIds: ["m6-color-paint", "m6-sport-kit", "m6-license-frame", "m6-door-sill"],
  },
] as const;

// ---- §13 7 步服务流程 ----
export type WenjieM6ServiceStep = {
  step: number;
  title: string;
  description: string;
};

export const wenjieM6ServiceSteps: readonly WenjieM6ServiceStep[] = [
  {
    step: 1,
    title: "车型确认",
    description: "确认问界 M6 的年份、批次、版本和配置",
  },
  {
    step: 2,
    title: "项目选择",
    description: "根据保护、外观、电动便利、家庭座舱等分类选择项目",
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
] as const;

// ---- §14 7 条 FAQ ----
export type WenjieM6FaqItem = {
  question: string;
  answer: string;
};

export const wenjieM6Faq: readonly WenjieM6FaqItem[] = [
  {
    question: "问界 M6 的这些项目是否都能安装？",
    answer: "不同年份、版本和配置可能不同，需到店评估确认",
  },
  {
    question: "新车最推荐先做什么？",
    answer: "车衣、隔热膜、360 软包脚垫、底盘护板、门槛条、钢化膜",
  },
  {
    question: "家庭座舱项目有哪些？",
    answer: "铝地板、小桌板、氛围灯、软包脚垫、电动踏板",
  },
  {
    question: "外观升级项目有哪些？",
    answer: "彩绘、运动包围、牌照框、门槛条",
  },
  {
    question: "可以只做单个项目吗？",
    answer: "可以，页面项目既支持单项了解，也支持组合方案",
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