/**
 * 小米 YU7 单车型专题页静态数据
 *
 * 9 项升级项目、5 大用车场景、6 步服务流程、6 条 FAQ。
 * PRD: docs/PRD/product/XIAOMI_YU7_UPGRADE_PRD_2026-06-24.md
 *
 * 所有 imageStatus 设为 "missing"（无真实施工图）。
 * 字面量防漂移模式：as const satisfies + runtime count assertion。
 */

export type XiaomiYu7Category =
  | "cabin_protection"
  | "chassis_protection"
  | "exterior_parts"
  | "film_style"
  | "cabin_comfort"
  | "electric_convenience"
  | "handling";

export type XiaomiYu7ImageStatus = "matched" | "pending-review" | "missing";

export interface XiaomiYu7UpgradeProject {
  readonly id: string;
  readonly order: number;
  readonly name: string;
  readonly category: XiaomiYu7Category;
  readonly summary: string;
  readonly suitableFor: readonly string[];
  readonly caution?: string;
  readonly imageStatus: XiaomiYu7ImageStatus;
  readonly sourceArea: "poster_project_matrix";
}

export interface XiaomiYu7Scenario {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly projectIds: readonly string[];
}

export interface XiaomiYu7ServiceStep {
  readonly order: number;
  readonly title: string;
  readonly description: string;
}

export interface XiaomiYu7FaqItem {
  readonly question: string;
  readonly answer: string;
}

// ---- 字面量约束 ----

export const XIAOMI_YU7_PROJECT_COUNT = 9;
export const XIAOMI_YU7_SCENARIO_COUNT = 5;
export const XIAOMI_YU7_SERVICE_STEP_COUNT = 6;
export const XIAOMI_YU7_FAQ_COUNT = 6;

// ---- 9 项升级项目 ----

export const xiaomiYu7UpgradeProjects: readonly XiaomiYu7UpgradeProject[] = [
  {
    id: "xy-01", order: 1, name: "软包脚垫", category: "cabin_protection",
    summary: "地毯保护、易清洁、座舱完整感",
    suitableFor: ["刚提车", "家庭用户"],
    imageStatus: "missing", sourceArea: "poster_project_matrix",
  },
  {
    id: "xy-02", order: 2, name: "碳纤维护板", category: "chassis_protection",
    summary: "底部或关键区域保护，强调轻量质感和防护感",
    suitableFor: ["底盘防护", "运动质感"],
    imageStatus: "missing", sourceArea: "poster_project_matrix",
  },
  {
    id: "xy-03", order: 3, name: "平衡杆", category: "handling",
    summary: "提升车身支撑和驾驶稳定感，需到店评估",
    suitableFor: ["操控偏好"],
    caution: "需到店评估安装位和适配性",
    imageStatus: "missing", sourceArea: "poster_project_matrix",
  },
  {
    id: "xy-04", order: 4, name: "运动包围", category: "exterior_parts",
    summary: "强化外观运动感和整车辨识度",
    suitableFor: ["运动风格", "外观升级"],
    imageStatus: "missing", sourceArea: "poster_project_matrix",
  },
  {
    id: "xy-05", order: 5, name: "星空膜", category: "film_style",
    summary: "天幕／玻璃视觉氛围，提升座舱个性",
    suitableFor: ["座舱氛围", "个性偏好"],
    imageStatus: "missing", sourceArea: "poster_project_matrix",
  },
  {
    id: "xy-06", order: 6, name: "星空卷帘", category: "cabin_comfort",
    summary: "天幕遮阳和氛围装饰，提升乘坐舒适",
    suitableFor: ["日晒地区", "座舱舒适"],
    imageStatus: "missing", sourceArea: "poster_project_matrix",
  },
  {
    id: "xy-07", order: 7, name: "香氛系统", category: "cabin_comfort",
    summary: "提升座舱气味体验和精致感",
    suitableFor: ["座舱品质", "舒适偏好"],
    imageStatus: "missing", sourceArea: "poster_project_matrix",
  },
  {
    id: "xy-08", order: 8, name: "电吸门", category: "electric_convenience",
    summary: "关门便利、科技感和豪华感升级",
    suitableFor: ["便利偏好", "豪华感"],
    imageStatus: "missing", sourceArea: "poster_project_matrix",
  },
  {
    id: "xy-09", order: 9, name: "挡泥板", category: "exterior_parts",
    summary: "减少泥水飞溅和车身侧面污染",
    suitableFor: ["日常防护", "雨天用车"],
    imageStatus: "missing", sourceArea: "poster_project_matrix",
  },
] as const satisfies readonly XiaomiYu7UpgradeProject[];

// ---- 5 大场景 ----

export const xiaomiYu7Scenarios: readonly XiaomiYu7Scenario[] = [
  {
    id: "new-car-protection", name: "新车保护",
    description: "软包脚垫、碳纤维护板、挡泥板等基础保护",
    projectIds: ["xy-01", "xy-02", "xy-09"],
  },
  {
    id: "appearance-sport", name: "外观运动",
    description: "运动包围、平衡杆等运动化升级",
    projectIds: ["xy-03", "xy-04"],
  },
  {
    id: "chassis-driving", name: "底盘与行车",
    description: "碳纤维护板、平衡杆、挡泥板等行车防护",
    projectIds: ["xy-02", "xy-03", "xy-09"],
  },
  {
    id: "cabin-ambiance", name: "座舱氛围",
    description: "星空膜、星空卷帘、香氛系统等氛围升级",
    projectIds: ["xy-05", "xy-06", "xy-07"],
  },
  {
    id: "electric-convenience", name: "电动便利",
    description: "电吸门等便利项目",
    projectIds: ["xy-08"],
  },
] as const satisfies readonly XiaomiYu7Scenario[];

// ---- 6 步服务流程（无"方案确认"）----

export const xiaomiYu7ServiceSteps: readonly XiaomiYu7ServiceStep[] = [
  {
    order: 1, title: "车型确认",
    description: "确认小米 YU7 的批次、版本和配置差异",
  },
  {
    order: 2, title: "项目选择",
    description: "根据新车保护、外观运动、座舱氛围或电动便利选择项目",
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
] as const satisfies readonly XiaomiYu7ServiceStep[];

// ---- 6 条 FAQ ----

export const xiaomiYu7Faq: readonly XiaomiYu7FaqItem[] = [
  {
    question: "是否所有小米 YU7 都能安装？",
    answer: "不同批次和配置可能不同，需到店确认。",
  },
  {
    question: "新车最推荐先做哪些项目？",
    answer: "软包脚垫、碳纤维护板、挡泥板等基础保护项目。",
  },
  {
    question: "座舱氛围项目有哪些？",
    answer: "星空膜、星空卷帘、香氛系统。",
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
] as const satisfies readonly XiaomiYu7FaqItem[];

// ---- Runtime 断言 ----

(() => {
  const errors: string[] = [];

  if (xiaomiYu7UpgradeProjects.length !== XIAOMI_YU7_PROJECT_COUNT) {
    errors.push(`projects: expected ${XIAOMI_YU7_PROJECT_COUNT}, got ${xiaomiYu7UpgradeProjects.length}`);
  }
  if (xiaomiYu7Scenarios.length !== XIAOMI_YU7_SCENARIO_COUNT) {
    errors.push(`scenarios: expected ${XIAOMI_YU7_SCENARIO_COUNT}, got ${xiaomiYu7Scenarios.length}`);
  }
  if (xiaomiYu7ServiceSteps.length !== XIAOMI_YU7_SERVICE_STEP_COUNT) {
    errors.push(`serviceSteps: expected ${XIAOMI_YU7_SERVICE_STEP_COUNT}, got ${xiaomiYu7ServiceSteps.length}`);
  }
  if (xiaomiYu7Faq.length !== XIAOMI_YU7_FAQ_COUNT) {
    errors.push(`faq: expected ${XIAOMI_YU7_FAQ_COUNT}, got ${xiaomiYu7Faq.length}`);
  }

  // order 单调性
  const orders = xiaomiYu7UpgradeProjects.map((p) => p.order);
  for (let i = 1; i < orders.length; i++) {
    if (orders[i] <= orders[i - 1]) {
      errors.push(`project order not monotonic at index ${i}: ${orders[i]}`);
    }
  }

  // key 唯一性
  const keys = xiaomiYu7UpgradeProjects.map((p) => p.id);
  if (new Set(keys).size !== keys.length) {
    errors.push("project ids are not unique");
  }

  // scenario projectIds 引用完整性
  const validKeys = new Set(keys);
  for (const s of xiaomiYu7Scenarios) {
    for (const pid of s.projectIds) {
      if (!validKeys.has(pid)) {
        errors.push(`scenario "${s.id}" references unknown project "${pid}"`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`XiaomiYu7 data integrity errors:\n${errors.join("\n")}`);
  }
})();
