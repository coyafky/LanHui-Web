/**
 * 小米 SU7 单车型专题页静态数据
 *
 * 12 项升级项目、5 大用车场景、6 步服务流程、6 条 FAQ。
 * PRD: docs/PRD/product/XIAOMI_TOPIC_PRD_2026-06-20.md
 *      docs/PRD/product/XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md
 *
 * imageStatus 根据实际图片可用性设置（matched / missing）。
 * 字面量防漂移模式：as const satisfies + runtime count assertion。
 */

export type XiaomiSu7Category =
  | "cabin_protection"
  | "chassis_protection"
  | "exterior_parts"
  | "film_style"
  | "cabin_comfort"
  | "electric_convenience"
  | "handling";

export type XiaomiSu7ImageStatus = "matched" | "pending-review" | "missing";

export interface XiaomiSu7UpgradeProject {
  readonly id: string;
  readonly order: number;
  readonly name: string;
  readonly category: XiaomiSu7Category;
  readonly summary: string;
  readonly suitableFor: readonly string[];
  readonly caution?: string;
  readonly publicPath?: `/images/products/xiaomi/su7/${string}.png`;
  readonly width?: number;
  readonly height?: number;
  readonly imageStatus: XiaomiSu7ImageStatus;
  readonly sourceArea: "poster_project_matrix";
}

export interface XiaomiSu7Scenario {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly projectIds: readonly string[];
}

export interface XiaomiSu7ServiceStep {
  readonly order: number;
  readonly title: string;
  readonly description: string;
}

export interface XiaomiSu7FaqItem {
  readonly question: string;
  readonly answer: string;
}

// ---- 字面量约束 ----

export const XIAOMI_SU7_PROJECT_COUNT = 12;
export const XIAOMI_SU7_SCENARIO_COUNT = 5;
export const XIAOMI_SU7_SERVICE_STEP_COUNT = 6;
export const XIAOMI_SU7_FAQ_COUNT = 6;

// ---- 12 项升级项目 ----

export const xiaomiSu7UpgradeProjects: readonly XiaomiSu7UpgradeProject[] = [
  {
    id: "xs7-01", order: 1, name: "前包围", category: "exterior_parts",
    summary: "强化前脸运动感和视觉冲击力",
    suitableFor: ["运动风格", "外观升级"],
    publicPath: "/images/products/xiaomi/su7/su7-01-front-bumper.png",
    width: 2523,
    height: 1661,
    imageStatus: "matched", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs7-02", order: 2, name: "侧裙", category: "exterior_parts",
    summary: "强化车身侧面线条和运动姿态",
    suitableFor: ["运动风格", "外观升级"],
    publicPath: "/images/products/xiaomi/su7/su7-04-side-skirt.png",
    width: 989,
    height: 660,
    imageStatus: "matched", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs7-03", order: 3, name: "机盖", category: "exterior_parts",
    summary: "碳纤或运动风格机盖升级",
    suitableFor: ["运动风格", "轻量化"],
    caution: "需确认车型版本适配",
    publicPath: "/images/products/xiaomi/su7/su7-08-hood.png",
    width: 771,
    height: 540,
    imageStatus: "matched", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs7-04", order: 4, name: "尾翼", category: "exterior_parts",
    summary: "提升尾部运动视觉张力",
    suitableFor: ["运动风格", "尾部视觉"],
    publicPath: "/images/products/xiaomi/su7/su7-10-spoiler.png",
    width: 1081,
    height: 553,
    imageStatus: "matched", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs7-05", order: 5, name: "后视镜壳", category: "exterior_parts",
    summary: "碳纤/亮黑后视镜壳替换",
    suitableFor: ["个性外观", "细节升级"],
    publicPath: "/images/products/xiaomi/su7/su7-07-mirror-cover.png",
    width: 869,
    height: 545,
    imageStatus: "matched", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs7-06", order: 6, name: "刹车油门踏板", category: "cabin_comfort",
    summary: "运动金属踏板，提升脚感和驾驶氛围",
    suitableFor: ["驾驶体验", "内饰质感"],
    publicPath: "/images/products/xiaomi/su7/su7-02-pedals.png",
    width: 781,
    height: 490,
    imageStatus: "matched", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs7-07", order: 7, name: "方向盘", category: "cabin_comfort",
    summary: "碳纤/翻毛皮方向盘升级",
    suitableFor: ["驾驶体验", "运动风格"],
    caution: "需确认与原车功能的兼容性",
    publicPath: "/images/products/xiaomi/su7/su7-05-steering-wheel.png",
    width: 800,
    height: 634,
    imageStatus: "matched", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs7-08", order: 8, name: "座椅背板", category: "cabin_comfort",
    summary: "座椅背板保护和装饰升级",
    suitableFor: ["内饰保护", "座舱质感"],
    publicPath: "/images/products/xiaomi/su7/su7-03-seat-back-panel.png",
    width: 654,
    height: 691,
    imageStatus: "matched", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs7-09", order: 9, name: "迎宾踏板", category: "cabin_protection",
    summary: "门槛保护，提升上下车质感和防刮擦",
    suitableFor: ["刚提车", "家庭用户"],
    publicPath: "/images/products/xiaomi/su7/su7-11-door-sill-plate.png",
    width: 748,
    height: 478,
    imageStatus: "matched", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs7-10", order: 10, name: "中控面板", category: "cabin_comfort",
    summary: "中控区域面板材质升级",
    suitableFor: ["内饰质感", "科技偏好"],
    publicPath: "/images/products/xiaomi/su7/su7-12-center-console-panel.png",
    width: 1191,
    height: 634,
    imageStatus: "matched", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs7-11", order: 11, name: "出风口", category: "cabin_comfort",
    summary: "出风口装饰件替换",
    suitableFor: ["内饰细节", "个性偏好"],
    publicPath: "/images/products/xiaomi/su7/su7-06-air-vent.png",
    width: 580,
    height: 283,
    imageStatus: "matched", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs7-12", order: 12, name: "门饰条", category: "exterior_parts",
    summary: "门边防擦保护和装饰",
    suitableFor: ["日常防护", "外观细节"],
    publicPath: "/images/products/xiaomi/su7/su7-09-door-trim.png",
    width: 896,
    height: 620,
    imageStatus: "matched", sourceArea: "poster_project_matrix",
  },
] as const satisfies readonly XiaomiSu7UpgradeProject[];

// ---- 5 大场景 ----

export const xiaomiSu7Scenarios: readonly XiaomiSu7Scenario[] = [
  {
    id: "appearance-sport", name: "外观运动",
    description: "前包围、侧裙、机盖、尾翼等外观运动化升级",
    projectIds: ["xs7-01", "xs7-02", "xs7-03", "xs7-04"],
  },
  {
    id: "exterior-detail", name: "外观细节",
    description: "后视镜壳、门饰条等细节装饰",
    projectIds: ["xs7-05", "xs7-12"],
  },
  {
    id: "cabin-quality", name: "内饰质感",
    description: "方向盘、中控面板、出风口、座椅背板等质感升级",
    projectIds: ["xs7-07", "xs7-08", "xs7-10", "xs7-11"],
  },
  {
    id: "driving-experience", name: "驾驶升级",
    description: "刹车油门踏板、方向盘等驾驶交互升级",
    projectIds: ["xs7-06", "xs7-07"],
  },
  {
    id: "new-car-protection", name: "新车保护",
    description: "迎宾踏板、门饰条等基础保护项目",
    projectIds: ["xs7-09", "xs7-12"],
  },
] as const satisfies readonly XiaomiSu7Scenario[];

// ---- 6 步服务流程（无"方案确认"）----

export const xiaomiSu7ServiceSteps: readonly XiaomiSu7ServiceStep[] = [
  {
    order: 1, title: "车型确认",
    description: "确认小米 SU7 的批次、版本和配置差异",
  },
  {
    order: 2, title: "项目选择",
    description: "根据外观运动、内饰质感、驾驶升级或新车保护选择项目",
  },
  {
    order: 3, title: "到店评估",
    description: "现场确认安装位置、接口、材料和工期",
  },
  {
    order: 4, title: "施工安装",
    description: "按项目标准施工，过程保护车辆",
  },
  {
    order: 5, title: "验收交付",
    description: "检查外观、功能和安装效果",
  },
  {
    order: 6, title: "售后支持",
    description: "提供使用注意事项和后续维护建议",
  },
] as const satisfies readonly XiaomiSu7ServiceStep[];

// ---- 6 条 FAQ ----

export const xiaomiSu7Faq: readonly XiaomiSu7FaqItem[] = [
  {
    question: "是否所有小米 SU7 都能安装？",
    answer: "不同批次和配置可能不同，需到店确认。",
  },
  {
    question: "新车最推荐先做哪些项目？",
    answer: "迎宾踏板、门饰条等基础保护项目。",
  },
  {
    question: "外观运动项目有哪些？",
    answer: "前包围、侧裙、机盖、尾翼等。",
  },
  {
    question: "可以只做单个项目吗？",
    answer: "可以，页面只是组合参考。",
  },
  {
    question: "是否影响原车质保？",
    answer: "不做承诺，以车主车辆情况和项目评估为准。",
  },
  {
    question: "工期多久？",
    answer: "根据项目组合和施工排期确认。",
  },
] as const satisfies readonly XiaomiSu7FaqItem[];

// ---- Runtime 断言 ----

(() => {
  const errors: string[] = [];

  if (xiaomiSu7UpgradeProjects.length !== XIAOMI_SU7_PROJECT_COUNT) {
    errors.push(`projects: expected ${XIAOMI_SU7_PROJECT_COUNT}, got ${xiaomiSu7UpgradeProjects.length}`);
  }
  if (xiaomiSu7Scenarios.length !== XIAOMI_SU7_SCENARIO_COUNT) {
    errors.push(`scenarios: expected ${XIAOMI_SU7_SCENARIO_COUNT}, got ${xiaomiSu7Scenarios.length}`);
  }
  if (xiaomiSu7ServiceSteps.length !== XIAOMI_SU7_SERVICE_STEP_COUNT) {
    errors.push(`serviceSteps: expected ${XIAOMI_SU7_SERVICE_STEP_COUNT}, got ${xiaomiSu7ServiceSteps.length}`);
  }
  if (xiaomiSu7Faq.length !== XIAOMI_SU7_FAQ_COUNT) {
    errors.push(`faq: expected ${XIAOMI_SU7_FAQ_COUNT}, got ${xiaomiSu7Faq.length}`);
  }

  // order 单调性
  const orders = xiaomiSu7UpgradeProjects.map((p) => p.order);
  for (let i = 1; i < orders.length; i++) {
    if (orders[i] <= orders[i - 1]) {
      errors.push(`project order not monotonic at index ${i}: ${orders[i]}`);
    }
  }

  // key 唯一性
  const keys = xiaomiSu7UpgradeProjects.map((p) => p.id);
  if (new Set(keys).size !== keys.length) {
    errors.push("project ids are not unique");
  }

  // scenario projectIds 引用完整性
  const validKeys = new Set(keys);
  for (const s of xiaomiSu7Scenarios) {
    for (const pid of s.projectIds) {
      if (!validKeys.has(pid)) {
        errors.push(`scenario "${s.id}" references unknown project "${pid}"`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`XiaomiSu7 data integrity errors:\n${errors.join("\n")}`);
  }
})();
