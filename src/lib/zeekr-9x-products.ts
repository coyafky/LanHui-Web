/**
 * 极氪 9X 单车型专题页静态数据
 *
 * 18 项升级项目、5 大用车场景、6 步服务流程、6 条 FAQ。
 * PRD: docs/PRD/product/ZEEKR_9X_UPGRADE_PRD_2026-06-24.md
 *
 * 所有 imageStatus 设为 "pending-review"（无真实施工图）。
 * 极氪 9X 无 AI 预览图，不包含 generated-preview 状态。
 *
 * 字面量防漂移模式（对齐 NIO ES8 / ZEEKR v1 / Tesla v1）：
 *   - `as const satisfies` 类型 + runtime count assertion
 *   - 7 个 category 用字面量联合类型约束
 */

export type Zeekr9xCategory =
  | "paint_protection"
  | "film_style"
  | "chassis_protection"
  | "cabin_protection"
  | "exterior_parts"
  | "infotainment"
  | "handling";

export type Zeekr9xImageStatus = "matched" | "pending-review" | "missing";

export interface Zeekr9xUpgradeProject {
  readonly id: string;
  readonly order: number;
  readonly name: string;
  readonly category: Zeekr9xCategory;
  readonly summary: string;
  readonly suitableFor: readonly string[];
  readonly caution?: string;
  readonly imageStatus: Zeekr9xImageStatus;
  readonly sourceArea: "poster_project_matrix";
}

export interface Zeekr9xScenario {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly projectIds: readonly string[];
}

export interface Zeekr9xServiceStep {
  readonly order: number;
  readonly title: string;
  readonly description: string;
}

export interface Zeekr9xFaqItem {
  readonly question: string;
  readonly answer: string;
}

// ---- 字面量约束（防漂移）----

export const ZEEKR_9X_PROJECT_COUNT = 18;
export const ZEEKR_9X_SCENARIO_COUNT = 5;
export const ZEEKR_9X_SERVICE_STEP_COUNT = 6;
export const ZEEKR_9X_FAQ_COUNT = 6;

export const ZEEKR_9X_CATEGORY_LABELS: Record<Zeekr9xCategory, string> = {
  paint_protection: "漆面保护",
  film_style: "膜系",
  chassis_protection: "底盘防护",
  cabin_protection: "座舱保护",
  exterior_parts: "外观件",
  infotainment: "影音屏幕",
  handling: "操控",
};

// ---- 18 项升级项目 ----

export const zeekr9xUpgradeProjects: readonly Zeekr9xUpgradeProject[] = [
  {
    id: "ppf",
    order: 1,
    name: "车衣",
    category: "paint_protection",
    summary: "漆面保护、抗日常划痕、新车保护感",
    suitableFor: ["新车车主", "漆面保护需求"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "window-film",
    order: 2,
    name: "隔热膜",
    category: "film_style",
    summary: "隔热、防晒、隐私、驾乘舒适",
    suitableFor: ["全系车主", "隔热需求"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "paint-graphic",
    order: 3,
    name: "彩绘",
    category: "exterior_parts",
    summary: "个性化图案表达、车身视觉差异化",
    suitableFor: ["外观个性用户"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "duotone-wrap",
    order: 4,
    name: "双拼改色",
    category: "exterior_parts",
    summary: "双拼视觉、车身层次和个性化升级",
    suitableFor: ["外观个性用户"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "aluminum-floor",
    order: 5,
    name: "铝地板",
    category: "cabin_protection",
    summary: "易清洁、耐用、提升座舱与尾箱质感",
    suitableFor: ["家庭用户", "尾箱高频使用"],
    caution: "不同批次地板接口可能存在差异",
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "stabilizer-bar",
    order: 6,
    name: "平衡杆",
    category: "handling",
    summary: "提升车身支撑和驾驶稳定感，需到店评估",
    suitableFor: ["驾驶质感用户"],
    caution: "需到店评估安装位和适配性",
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "floor-mats-360",
    order: 7,
    name: "360软包脚垫",
    category: "cabin_protection",
    summary: "地毯保护、易清洁、座舱完整感",
    suitableFor: ["新车车主", "家庭用户"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "skid-plate",
    order: 8,
    name: "底盘护板",
    category: "chassis_protection",
    summary: "应对路面剐蹭、碎石和底部防护",
    suitableFor: ["新车车主", "复杂路况用户"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "body-kit",
    order: 9,
    name: "运动包围",
    category: "exterior_parts",
    summary: "强化外观运动感和整车辨识度",
    suitableFor: ["外观个性用户"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "brake-calipers",
    order: 10,
    name: "刹车卡钳",
    category: "exterior_parts",
    summary: "强化轮毂区域视觉运动感",
    suitableFor: ["外观个性用户"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "sill-plate",
    order: 11,
    name: "门槛条",
    category: "cabin_protection",
    summary: "上下车高频区域防刮、防踩踏磨损",
    suitableFor: ["家庭用户", "高频上下车"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "wheels",
    order: 12,
    name: "轮毂",
    category: "exterior_parts",
    summary: "视觉升级、运动感强化，需确认尺寸适配",
    suitableFor: ["外观个性用户"],
    caution: "需确认尺寸适配",
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "silicon-mat-kit",
    order: 13,
    name: "硅胶垫套餐",
    category: "cabin_protection",
    summary: "高频储物区和细节区域保护，便于清洁",
    suitableFor: ["家庭用户", "细节保护"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "mud-flap",
    order: 14,
    name: "挡泥板",
    category: "chassis_protection",
    summary: "减少泥水飞溅和车身侧面污染",
    suitableFor: ["复杂路况用户"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "bug-screen",
    order: 15,
    name: "防虫网",
    category: "chassis_protection",
    summary: "减少虫石杂物进入关键散热/进风区域",
    suitableFor: ["长途用户", "高速行驶"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "screen-protector",
    order: 16,
    name: "钢化膜",
    category: "infotainment",
    summary: "中控/娱乐屏幕防刮保护",
    suitableFor: ["全系车主"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "license-frame",
    order: 17,
    name: "牌照框",
    category: "exterior_parts",
    summary: "车头/车尾细节装饰与牌照区域保护",
    suitableFor: ["细节装饰"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "interior-coating",
    order: 18,
    name: "内饰镀膜",
    category: "cabin_protection",
    summary: "内饰表面防污、易清洁、保持质感",
    suitableFor: ["内饰保护需求"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
] as const satisfies readonly Zeekr9xUpgradeProject[];

// ---- 5 大用车场景 ----

export const zeekr9xScenarios: readonly Zeekr9xScenario[] = [
  {
    id: "new-car-protection",
    name: "新车保护",
    description: "刚提车优先解决漆面、玻璃、地毯、底盘和屏幕保护",
    projectIds: [
      "ppf",
      "window-film",
      "floor-mats-360",
      "skid-plate",
      "screen-protector",
      "interior-coating",
    ],
  },
  {
    id: "appearance-style",
    name: "外观个性",
    description: "强化高端 SUV 的视觉辨识度和细节完整感",
    projectIds: [
      "paint-graphic",
      "duotone-wrap",
      "body-kit",
      "brake-calipers",
      "wheels",
      "license-frame",
    ],
  },
  {
    id: "cabin-care",
    name: "座舱防护",
    description: "座舱地板、储物区域和内饰细节保护",
    projectIds: [
      "aluminum-floor",
      "floor-mats-360",
      "silicon-mat-kit",
      "interior-coating",
      "sill-plate",
    ],
  },
  {
    id: "chassis-driving",
    name: "底盘与行车防护",
    description: "关注底盘、前部格栅和户外行车环境",
    projectIds: [
      "skid-plate",
      "stabilizer-bar",
      "mud-flap",
      "bug-screen",
    ],
  },
  {
    id: "premium-quality",
    name: "高端质感",
    description: "铝地板、轮毂和外观部件升级提升整车质感",
    projectIds: [
      "aluminum-floor",
      "wheels",
      "body-kit",
      "interior-coating",
    ],
  },
] as const satisfies readonly Zeekr9xScenario[];

// ---- 6 步服务流程 ----

export const zeekr9xServiceSteps: readonly Zeekr9xServiceStep[] = [
  {
    order: 1,
    title: "车型确认",
    description: "确认极氪 9X 的批次、版本和配置差异",
  },
  {
    order: 2,
    title: "项目选择",
    description: "根据新车保护、外观个性、座舱防护或底盘防护选择项目",
  },
  {
    order: 3,
    title: "到店评估",
    description: "现场确认安装位置、接口、材料和工期",
  },
  {
    order: 4,
    title: "施工安装",
    description: "按项目标准施工，过程保护车辆",
  },
  {
    order: 5,
    title: "验收交付",
    description: "检查外观、功能和安装效果",
  },
  {
    order: 6,
    title: "售后支持",
    description: "提供使用注意事项和后续维护建议",
  },
] as const satisfies readonly Zeekr9xServiceStep[];

// ---- 6 条 FAQ ----

export const zeekr9xFaq: readonly Zeekr9xFaqItem[] = [
  {
    question: "极氪 9X 的这些升级项目是否都能安装？",
    answer:
      "不同批次、版本和配置在尺寸、接口上可能存在差异。页面项目只作为升级方向参考，具体可行性以到店评估确认为准。",
  },
  {
    question: "新车最推荐先做哪些项目？",
    answer:
      "车衣、隔热膜、360 软包脚垫、底盘护板、钢化膜；优先解决漆面、玻璃、地毯、底盘和屏幕保护。",
  },
  {
    question: "可以只做单个项目吗？",
    answer:
      "可以，页面项目既支持单项了解也支持场景组合；具体施工内容以到店评估为准。",
  },
  {
    question: "是否影响原车质保？",
    answer:
      '不做\u201C不影响质保\u201D的承诺；各项目对原车状态的影响不同，施工前会告知风险与边界。',
  },
  {
    question: "铝地板不同批次接口差异是什么意思？",
    answer:
      "极氪 9X 不同生产批次的座椅滑轨和地板接口可能存在细微差异，铝地板需按实际批次确认接口方案，到店评估时会一并确认。",
  },
  {
    question: "图片是实际施工案例吗？",
    answer:
      "当前展示的是项目功能预览示意（pending-review），真实施工效果以到店案例为准。",
  },
] as const satisfies readonly Zeekr9xFaqItem[];

// ---- 字面量 runtime check（模块加载即触发）----

function assertZeekr9xDataShape(): void {
  if (zeekr9xUpgradeProjects.length !== ZEEKR_9X_PROJECT_COUNT) {
    throw new Error(
      `Zeekr 9X project count drift: expected ${ZEEKR_9X_PROJECT_COUNT}, got ${zeekr9xUpgradeProjects.length}`,
    );
  }
  if (zeekr9xScenarios.length !== ZEEKR_9X_SCENARIO_COUNT) {
    throw new Error(
      `Zeekr 9X scenario count drift: expected ${ZEEKR_9X_SCENARIO_COUNT}, got ${zeekr9xScenarios.length}`,
    );
  }
  if (zeekr9xServiceSteps.length !== ZEEKR_9X_SERVICE_STEP_COUNT) {
    throw new Error(
      `Zeekr 9X service step count drift: expected ${ZEEKR_9X_SERVICE_STEP_COUNT}, got ${zeekr9xServiceSteps.length}`,
    );
  }
  if (zeekr9xFaq.length !== ZEEKR_9X_FAQ_COUNT) {
    throw new Error(
      `Zeekr 9X FAQ count drift: expected ${ZEEKR_9X_FAQ_COUNT}, got ${zeekr9xFaq.length}`,
    );
  }
}

assertZeekr9xDataShape();
