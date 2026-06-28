/**
 * 极氪 8X 专题页静态数据
 *
 * 派生自 docs/PRD/product/ZEEKR_8X_TOPIC_PRD_2026-06-27.md。
 * 所有 imageStatus 为 "pending-review"（无实际图片）。
 */

export type Zeekr8xImageStatus =
  | "matched"
  | "generated-preview"
  | "pending-review"
  | "missing";

export type Zeekr8xCategory =
  | "protection"
  | "film"
  | "appearance"
  | "family_cabin"
  | "cabin_protection"
  | "cabin_atmosphere"
  | "chassis"
  | "driving_protection"
  | "screen_care"
  | "detail_care";

export type Zeekr8xScenarioKey =
  | "new-car-protection"
  | "appearance-upgrade"
  | "family-cabin"
  | "smart-display"
  | "driving-protection";

export type Zeekr8xUpgradeProject = {
  readonly id: string;
  readonly order: number;
  readonly name: string;
  readonly category: Zeekr8xCategory;
  readonly summary: string;
  readonly suitableFor: readonly string[];
  readonly caution?: string;
  readonly imageStatus: Zeekr8xImageStatus;
};

export type Zeekr8xScenario = {
  readonly id: Zeekr8xScenarioKey;
  readonly name: string;
  readonly description: string;
  readonly projectIds: readonly string[];
};

export type Zeekr8xBundle = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly projectIds: readonly string[];
};

export type Zeekr8xServiceStep = {
  readonly order: number;
  readonly title: string;
  readonly description: string;
};

export type Zeekr8xFaqItem = {
  readonly question: string;
  readonly answer: string;
};

// ---- 字面量约束（防漂移）----

export const ZEEKR_8X_PROJECT_COUNT = 17;
export const ZEEKR_8X_SCENARIO_COUNT = 5;
export const ZEEKR_8X_BUNDLE_COUNT = 5;
export const ZEEKR_8X_SERVICE_STEP_COUNT = 7;
export const ZEEKR_8X_FAQ_COUNT = 7;

export const ZEEKR_8X_CATEGORY_LABELS: Record<Zeekr8xCategory, string> = {
  protection: "漆面保护",
  film: "膜系",
  appearance: "外观个性",
  family_cabin: "家庭座舱",
  cabin_protection: "座舱保护",
  cabin_atmosphere: "座舱氛围",
  chassis: "底盘防护",
  driving_protection: "行车防护",
  screen_care: "屏幕养护",
  detail_care: "细节装饰",
};

// ---- 17 个升级项目 ----

export const zeekr8xUpgradeProjects: readonly Zeekr8xUpgradeProject[] = [
  {
    id: "ppf",
    order: 1,
    name: "车衣",
    category: "protection",
    summary: "漆面保护、日常划痕防护、保持车身质感",
    suitableFor: ["new-car-protection"],
    imageStatus: "pending-review",
  },
  {
    id: "window-film",
    order: 2,
    name: "隔热膜",
    category: "film",
    summary: "隔热、防晒、隐私与驾乘舒适",
    suitableFor: ["new-car-protection"],
    imageStatus: "pending-review",
  },
  {
    id: "graphic-wrap",
    order: 3,
    name: "彩绘",
    category: "appearance",
    summary: "主题化车身视觉和个性表达",
    suitableFor: ["appearance-upgrade"],
    imageStatus: "pending-review",
  },
  {
    id: "floating-roof",
    order: 4,
    name: "悬浮顶",
    category: "appearance",
    summary: "强化车顶视觉分层和整车侧面辨识度",
    suitableFor: ["appearance-upgrade"],
    imageStatus: "pending-review",
  },
  {
    id: "floor-mats-360",
    order: 5,
    name: "360软包脚垫",
    category: "cabin_protection",
    summary: "全包围脚垫、易清洁、保护原车地毯",
    suitableFor: ["new-car-protection", "family-cabin"],
    imageStatus: "pending-review",
  },
  {
    id: "aluminum-floor",
    order: 6,
    name: "铝地板",
    category: "family_cabin",
    summary: "后排和尾箱易清洁，提升耐用与质感",
    suitableFor: ["family-cabin"],
    caution: "不同批次地板接口可能存在差异",
    imageStatus: "pending-review",
  },
  {
    id: "stabilizer-bar",
    order: 7,
    name: "平衡杆",
    category: "driving_protection",
    summary: "需到店评估安装位，不做性能承诺",
    suitableFor: ["driving-protection"],
    caution: "需到店评估安装位和适配性",
    imageStatus: "pending-review",
  },
  {
    id: "body-kit",
    order: 8,
    name: "运动包围",
    category: "appearance",
    summary: "强化前后杠、侧裙等区域的视觉完整度",
    suitableFor: ["appearance-upgrade"],
    imageStatus: "pending-review",
  },
  {
    id: "ambient-lighting",
    order: 9,
    name: "氛围灯",
    category: "cabin_atmosphere",
    summary: "夜间座舱氛围与内饰观感升级",
    suitableFor: ["family-cabin"],
    imageStatus: "pending-review",
  },
  {
    id: "skid-plate",
    order: 10,
    name: "底盘护板",
    category: "chassis",
    summary: "加强底部关键区域防护，适合新车基础防护",
    suitableFor: ["new-car-protection", "driving-protection"],
    imageStatus: "pending-review",
  },
  {
    id: "rear-table-tray",
    order: 11,
    name: "小桌板",
    category: "family_cabin",
    summary: "后排办公、用餐、儿童使用和短途休息",
    suitableFor: ["family-cabin"],
    imageStatus: "pending-review",
  },
  {
    id: "mud-flap",
    order: 12,
    name: "挡泥板",
    category: "driving_protection",
    summary: "减少泥水飞溅和车身侧面污染",
    suitableFor: ["driving-protection"],
    imageStatus: "pending-review",
  },
  {
    id: "bug-screen",
    order: 13,
    name: "防虫网",
    category: "driving_protection",
    summary: "减少虫石杂物进入前部格栅或进风区域",
    suitableFor: ["driving-protection"],
    imageStatus: "pending-review",
  },
  {
    id: "head-up-display",
    order: 14,
    name: "抬头显示",
    category: "screen_care",
    summary: "驾驶信息显示和科技感，需确认接口和安装位",
    suitableFor: ["smart-display"],
    caution: "需确认接口、安装位和使用边界",
    imageStatus: "pending-review",
  },
  {
    id: "screen-protector",
    order: 15,
    name: "钢化膜",
    category: "screen_care",
    summary: "中控屏幕防刮保护，降低高频触控磨损",
    suitableFor: ["new-car-protection", "smart-display"],
    imageStatus: "pending-review",
  },
  {
    id: "sill-plate",
    order: 16,
    name: "门槛条",
    category: "detail_care",
    summary: "上下车高频区域防刮、防踩踏磨损",
    suitableFor: ["appearance-upgrade", "family-cabin"],
    imageStatus: "pending-review",
  },
  {
    id: "license-frame",
    order: 17,
    name: "牌照框",
    category: "detail_care",
    summary: "车头车尾细节装饰和牌照区域保护",
    suitableFor: ["appearance-upgrade"],
    imageStatus: "pending-review",
  },
];

// ---- 5 大用车场景 ----

export const zeekr8xScenarios: readonly Zeekr8xScenario[] = [
  {
    id: "new-car-protection",
    name: "新车基础保护",
    description: "刚提车优先解决漆面、玻璃、地毯、底盘和屏幕保护",
    projectIds: ["ppf", "window-film", "floor-mats-360", "skid-plate", "screen-protector"],
  },
  {
    id: "appearance-upgrade",
    name: "外观个性升级",
    description: "强化高端 SUV 的视觉辨识度和细节完整感",
    projectIds: ["graphic-wrap", "floating-roof", "body-kit", "sill-plate", "license-frame"],
  },
  {
    id: "family-cabin",
    name: "家庭座舱与舒适",
    description: "面向家庭乘坐、后排使用、夜间氛围和日常清洁",
    projectIds: ["aluminum-floor", "floor-mats-360", "ambient-lighting", "rear-table-tray"],
  },
  {
    id: "smart-display",
    name: "智能屏幕与显示保护",
    description: "保护高频显示和触控区域，提升智能座舱体验",
    projectIds: ["head-up-display", "screen-protector"],
  },
  {
    id: "driving-protection",
    name: "行车与日常防护",
    description: "关注底部防护、前部格栅、泥水飞溅和行车环境",
    projectIds: ["skid-plate", "stabilizer-bar", "mud-flap", "bug-screen"],
  },
];

// ---- 5 个推荐组合 ----

export const zeekr8xBundles: readonly Zeekr8xBundle[] = [
  {
    id: "new-car-bundle",
    name: "新车基础保护组合",
    description: "适合刚提车的极氪 8X 车主",
    projectIds: ["ppf", "window-film", "floor-mats-360", "skid-plate", "screen-protector"],
  },
  {
    id: "appearance-bundle",
    name: "外观个性升级组合",
    description: "适合追求视觉辨识度的用户",
    projectIds: ["graphic-wrap", "floating-roof", "body-kit", "sill-plate", "license-frame"],
  },
  {
    id: "family-bundle",
    name: "家庭座舱与舒适组合",
    description: "适合家庭乘坐、后排高频使用和日常清洁",
    projectIds: ["aluminum-floor", "floor-mats-360", "ambient-lighting", "rear-table-tray"],
  },
  {
    id: "smart-bundle",
    name: "智能屏幕与显示保护组合",
    description: "适合关注智能座舱和屏幕细节的用户",
    projectIds: ["head-up-display", "screen-protector"],
  },
  {
    id: "driving-bundle",
    name: "行车与日常防护组合",
    description: "适合关注日常防护和车身清洁的用户",
    projectIds: ["skid-plate", "stabilizer-bar", "mud-flap", "bug-screen"],
  },
];

// ---- 7 步服务流程 ----

export const zeekr8xServiceSteps: readonly Zeekr8xServiceStep[] = [
  {
    order: 1,
    title: "车型确认",
    description: "确认极氪 8X 的批次、版本和配置差异",
  },
  {
    order: 2,
    title: "项目选择",
    description: "根据新车保护、外观个性、家庭座舱、智能屏幕或行车防护选择项目",
  },
  {
    order: 3,
    title: "方案确认",
    description: "结合选定的项目和原车状态确认施工方案",
  },
  {
    order: 4,
    title: "到店评估",
    description: "现场确认安装位置、接口、材料和工期",
  },
  {
    order: 5,
    title: "施工安装",
    description: "按项目标准施工，过程保护车辆",
  },
  {
    order: 6,
    title: "验收交付",
    description: "检查外观、功能和安装效果",
  },
  {
    order: 7,
    title: "售后支持",
    description: "提供使用注意事项和后续维护建议",
  },
];

// ---- 7 条 FAQ ----

export const zeekr8xFaq: readonly Zeekr8xFaqItem[] = [
  {
    question: "极氪 8X 的这些项目是否都能安装？",
    answer:
      "不同年份、版本和配置可能有所差异，具体安装可行性需到店以实际车辆情况和施工评估为准。",
  },
  {
    question: "新车最推荐先做什么？",
    answer:
      "车衣、隔热膜、360 软包脚垫、底盘护板、钢化膜；优先解决新车保护和日常使用问题。",
  },
  {
    question: "外观升级项目有哪些？",
    answer:
      "彩绘、悬浮顶、运动包围、门槛条、牌照框；强化高端 SUV 的视觉辨识度和细节完整感。",
  },
  {
    question: "悬浮顶是否会脱落或影响年检？",
    answer:
      "悬浮顶膜层施工在车顶钣金面，不涉及车身结构；年检影响因地区而异，施工前会告知相关注意事项。",
  },
  {
    question: "抬头显示（HUD）值得装吗？",
    answer:
      "取决于您的驾驶习惯和对科技感的偏好；需到店确认接口、安装位和使用边界。",
  },
  {
    question: "可以只做单个项目吗？",
    answer:
      "可以，页面项目既支持单项了解也支持组合方案；具体施工内容以到店评估为准。",
  },
  {
    question: "工期多久？",
    answer:
      "根据项目组合、库存和施工排期确定；不同项目工期差异较大，到店评估后会给出明确工期。",
  },
];

// ---- 字面量 runtime check（模块加载即触发）----

if (zeekr8xUpgradeProjects.length !== ZEEKR_8X_PROJECT_COUNT) {
  throw new Error(
    `ZEEKR 8X project count drift: expected ${ZEEKR_8X_PROJECT_COUNT}, got ${zeekr8xUpgradeProjects.length}`,
  );
}
if (zeekr8xScenarios.length !== ZEEKR_8X_SCENARIO_COUNT) {
  throw new Error(
    `ZEEKR 8X scenario count drift: expected ${ZEEKR_8X_SCENARIO_COUNT}, got ${zeekr8xScenarios.length}`,
  );
}
if (zeekr8xBundles.length !== ZEEKR_8X_BUNDLE_COUNT) {
  throw new Error(
    `ZEEKR 8X bundle count drift: expected ${ZEEKR_8X_BUNDLE_COUNT}, got ${zeekr8xBundles.length}`,
  );
}
if (zeekr8xServiceSteps.length !== ZEEKR_8X_SERVICE_STEP_COUNT) {
  throw new Error(
    `ZEEKR 8X service step count drift: expected ${ZEEKR_8X_SERVICE_STEP_COUNT}, got ${zeekr8xServiceSteps.length}`,
  );
}
if (zeekr8xFaq.length !== ZEEKR_8X_FAQ_COUNT) {
  throw new Error(
    `ZEEKR 8X FAQ count drift: expected ${ZEEKR_8X_FAQ_COUNT}, got ${zeekr8xFaq.length}`,
  );
}
