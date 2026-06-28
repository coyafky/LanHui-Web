/**
 * 小米系列轻改升级方案静态数据
 *
 * 21 项升级项目、7 大场景（含 Ultra 风格专区）、7 步服务流程、7 条 FAQ。
 * PRD: docs/PRD/product/XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md
 *
 * 所有 imageStatus 设为 "missing"（无真实施工图）。
 * 字面量防漂移模式：as const satisfies + runtime count assertion。
 */

export type XiaomiSeriesCategory =
  | "protection"
  | "appearance"
  | "ultra_style"
  | "cabin"
  | "comfort"
  | "convenience"
  | "exterior_lights";

export type XiaomiSeriesImageStatus = "matched" | "missing" | "missing";

export interface XiaomiSeriesUpgradeProject {
  readonly id: string;
  readonly order: number;
  readonly name: string;
  readonly category: XiaomiSeriesCategory;
  readonly summary: string;
  readonly suitableFor: readonly string[];
  readonly caution?: string;
  readonly imageStatus: XiaomiSeriesImageStatus;
  readonly sourceArea: "poster_main_list";
}

export interface XiaomiSeriesScenario {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly projectIds: readonly string[];
}

export interface XiaomiSeriesUltraZoneItem {
  readonly projectId: string;
  readonly highlight: string;
}

export interface XiaomiSeriesServiceStep {
  readonly order: number;
  readonly title: string;
  readonly description: string;
}

export interface XiaomiSeriesFaqItem {
  readonly question: string;
  readonly answer: string;
}

export const XIAOMI_SERIES_CATEGORY_LABELS: Record<XiaomiSeriesCategory, string> = {
  protection: "保护",
  appearance: "外观",
  ultra_style: "Ultra 风格",
  cabin: "座舱",
  comfort: "舒适",
  convenience: "便利",
  exterior_lights: "外部灯光",
};

// ---- 字面量约束 ----

export const XIAOMI_SERIES_PROJECT_COUNT = 21;
export const XIAOMI_SERIES_SCENARIO_COUNT = 7;
export const XIAOMI_SERIES_SERVICE_STEP_COUNT = 7;
export const XIAOMI_SERIES_FAQ_COUNT = 7;
export const XIAOMI_SERIES_ULTRA_ZONE_COUNT = 8;

// ---- 21 项升级项目 ----

export const xiaomiSeriesUpgradeProjects: readonly XiaomiSeriesUpgradeProject[] = [
  {
    id: "xs-01", order: 1, name: "车衣", category: "protection",
    summary: "漆面保护、抗轻微剐蹭、保持车漆质感",
    suitableFor: ["刚提车", "日常通勤", "保护优先"],
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-02", order: 2, name: "隔热膜", category: "protection",
    summary: "隔热、防晒、提升驾乘舒适性",
    suitableFor: ["刚提车", "炎热地区", "隐私需求"],
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-03", order: 3, name: "改色膜", category: "appearance",
    summary: "改变车身视觉风格，满足个性化表达",
    suitableFor: ["个性用户", "换色需求"],
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-04", order: 4, name: "360 软包脚垫", category: "protection",
    summary: "地毯保护、易清洁、提升座舱完整感",
    suitableFor: ["刚提车", "家庭用户", "清洁优先"],
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-05", order: 5, name: "底盘护板", category: "protection",
    summary: "保护底盘关键区域，适合新车基础防护",
    suitableFor: ["刚提车", "路况复杂", "长途"],
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-06", order: 6, name: "氛围灯", category: "cabin",
    summary: "提升夜间座舱氛围和科技感",
    suitableFor: ["夜间用车", "座舱氛围"],
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-07", order: 7, name: "仪表中置", category: "cabin",
    summary: "强化驾驶视线信息展示和座舱科技感",
    suitableFor: ["科技偏好", "座舱升级"],
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-08", order: 8, name: "底盘灯", category: "exterior_lights",
    summary: "增强夜间视觉辨识度，需注意合法合规使用场景",
    suitableFor: ["夜间展示", "个性外观"],
    caution: "需关注合法合规使用场景，具体以当地规定为准",
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-09", order: 9, name: "电动尾翼", category: "appearance",
    summary: "强化运动姿态和视觉张力",
    suitableFor: ["运动用户", "视觉升级"],
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-10", order: 10, name: "电动遮阳帘", category: "comfort",
    summary: "改善日晒体验，提高乘坐舒适性",
    suitableFor: ["日晒地区", "后排乘客", "家庭用户"],
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-11", order: 11, name: "电动前机盖", category: "convenience",
    summary: "提升前舱开启便利和仪式感",
    suitableFor: ["便利偏好", "科技体验"],
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-12", order: 12, name: "Ultra 机盖", category: "ultra_style",
    summary: "强化前脸运动视觉，需确认车型适配",
    suitableFor: ["运动风格", "视觉升级"],
    caution: "需确认车型版本适配",
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-13", order: 13, name: "Ultra 方向盘", category: "ultra_style",
    summary: "提升驾驶区运动感和握持质感",
    suitableFor: ["驾驶体验", "运动风格"],
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-14", order: 14, name: "Ultra 电子声浪", category: "ultra_style",
    summary: "提升驾驶氛围，不做性能提升承诺",
    suitableFor: ["驾驶氛围", "运动风格"],
    caution: "不做性能提升承诺，具体以到店评估为准",
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-15", order: 15, name: "后排电视", category: "comfort",
    summary: "增强后排娱乐体验，适合家庭／商务使用",
    suitableFor: ["家庭用户", "商务出行", "长途"],
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-16", order: 16, name: "Ultra 尾翼", category: "ultra_style",
    summary: "运动化尾部视觉升级",
    suitableFor: ["运动风格", "尾部视觉"],
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-17", order: 17, name: "Ultra 碳纤内饰", category: "ultra_style",
    summary: "提升座舱运动感和材质视觉",
    suitableFor: ["内饰质感", "运动风格"],
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-18", order: 18, name: "Ultra 拉花", category: "ultra_style",
    summary: "强化车身辨识度和主题风格",
    suitableFor: ["个性外观", "主题风格"],
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-19", order: 19, name: "座椅按摩", category: "comfort",
    summary: "提升长途乘坐舒适体验",
    suitableFor: ["长途驾驶", "舒适偏好"],
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-20", order: 20, name: "Ultra 前后包围", category: "ultra_style",
    summary: "强化整车运动姿态和套件完整性",
    suitableFor: ["运动风格", "整车套件"],
    caution: "需确认车型版本适配",
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
  {
    id: "xs-21", order: 21, name: "Ultra 内饰升级", category: "ultra_style",
    summary: "统一内饰主题，提升座舱个性化表达",
    suitableFor: ["内饰主题", "个性风格"],
    imageStatus: "missing", sourceArea: "poster_main_list",
  },
] as const satisfies readonly XiaomiSeriesUpgradeProject[];

// ---- 7 大场景 ----

export const xiaomiSeriesScenarios: readonly XiaomiSeriesScenario[] = [
  {
    id: "protection", name: "新车保护",
    description: "适合刚提车用户，优先解决漆面、玻璃、地毯和底盘保护",
    projectIds: ["xs-01", "xs-02", "xs-04", "xs-05"],
  },
  {
    id: "appearance-personality", name: "外观个性",
    description: "让车辆更有辨识度，但要提醒合规使用",
    projectIds: ["xs-03", "xs-08", "xs-18"],
  },
  {
    id: "appearance-sport", name: "外观运动化",
    description: "适合追求运动风格和视觉张力的用户",
    projectIds: ["xs-09", "xs-12", "xs-16", "xs-20"],
  },
  {
    id: "cabin-ambiance", name: "座舱氛围",
    description: "强化驾驶区和座舱科技感",
    projectIds: ["xs-06", "xs-07", "xs-17", "xs-21"],
  },
  {
    id: "comfort-entertainment", name: "舒适娱乐",
    description: "适合家庭、长途和后排乘坐需求",
    projectIds: ["xs-10", "xs-15", "xs-19"],
  },
  {
    id: "convenience", name: "智能便利",
    description: "提升日常使用便利和仪式感",
    projectIds: ["xs-11"],
  },
  {
    id: "ultra-style", name: "Ultra 风格",
    description: "如果你希望小米车型更接近运动化、性能化的视觉表达",
    projectIds: ["xs-12", "xs-13", "xs-14", "xs-16", "xs-17", "xs-18", "xs-20", "xs-21"],
  },
] as const satisfies readonly XiaomiSeriesScenario[];

// ---- Ultra 专区 ----

export const xiaomiSeriesUltraZone: readonly XiaomiSeriesUltraZoneItem[] = [
  { projectId: "xs-12", highlight: "前脸运动视觉升级" },
  { projectId: "xs-13", highlight: "驾驶区运动感" },
  { projectId: "xs-14", highlight: "驾驶氛围升级" },
  { projectId: "xs-16", highlight: "尾部运动化视觉" },
  { projectId: "xs-17", highlight: "座舱材质视觉升级" },
  { projectId: "xs-18", highlight: "车身主题辨识度" },
  { projectId: "xs-20", highlight: "整车运动套件完整度" },
  { projectId: "xs-21", highlight: "座舱主题统一" },
] as const satisfies readonly XiaomiSeriesUltraZoneItem[];

// ---- 7 步服务流程 ----

export const xiaomiSeriesServiceSteps: readonly XiaomiSeriesServiceStep[] = [
  {
    order: 1, title: "车型确认",
    description: "确认小米车型、版本、年份和配置差异",
  },
  {
    order: 2, title: "项目选择",
    description: "根据保护、外观、座舱、Ultra 风格等分类选择项目",
  },
  {
    order: 3, title: "到店评估",
    description: "确认安装位、接口、材料、工期和风险提示",
  },
  {
    order: 4, title: "方案确认",
    description: "对项目组合、价格范围和施工时间进行确认",
  },
  {
    order: 5, title: "施工安装",
    description: "按项目标准施工，并做好车身和内饰保护",
  },
  {
    order: 6, title: "验收交付",
    description: "检查外观效果、功能状态和安装细节",
  },
  {
    order: 7, title: "售后支持",
    description: "提供使用注意事项和后续维护建议",
  },
] as const satisfies readonly XiaomiSeriesServiceStep[];

// ---- 7 条 FAQ ----

export const xiaomiSeriesFaq: readonly XiaomiSeriesFaqItem[] = [
  {
    question: "小米系列项目是否都适合我的车？",
    answer: "不同车型和版本可能不同，需到店评估确认。",
  },
  {
    question: "新车最推荐先做什么？",
    answer: "车衣、隔热膜、360 软包脚垫、底盘护板。",
  },
  {
    question: "Ultra 风格项目会让车变成官方 Ultra 吗？",
    answer: "不会，页面只表达外观／内饰风格升级，不做官方版本承诺。",
  },
  {
    question: "可以只做单个项目吗？",
    answer: "可以，页面清单既支持单项了解，也支持组合方案。",
  },
  {
    question: "灯光和声浪类项目有什么注意？",
    answer: "需关注合法合规使用场景，具体以当地规定和到店建议为准。",
  },
  {
    question: "工期多久？",
    answer: "根据项目组合、库存和施工排期确认。",
  },
  {
    question: "是否影响质保？",
    answer: "不做不影响质保的承诺，具体以车辆情况和项目评估为准。",
  },
] as const satisfies readonly XiaomiSeriesFaqItem[];

// ---- Runtime 断言 ----

(() => {
  const errors: string[] = [];

  if (xiaomiSeriesUpgradeProjects.length !== XIAOMI_SERIES_PROJECT_COUNT) {
    errors.push(`projects: expected ${XIAOMI_SERIES_PROJECT_COUNT}, got ${xiaomiSeriesUpgradeProjects.length}`);
  }
  if (xiaomiSeriesScenarios.length !== XIAOMI_SERIES_SCENARIO_COUNT) {
    errors.push(`scenarios: expected ${XIAOMI_SERIES_SCENARIO_COUNT}, got ${xiaomiSeriesScenarios.length}`);
  }
  if (xiaomiSeriesServiceSteps.length !== XIAOMI_SERIES_SERVICE_STEP_COUNT) {
    errors.push(`serviceSteps: expected ${XIAOMI_SERIES_SERVICE_STEP_COUNT}, got ${xiaomiSeriesServiceSteps.length}`);
  }
  if (xiaomiSeriesFaq.length !== XIAOMI_SERIES_FAQ_COUNT) {
    errors.push(`faq: expected ${XIAOMI_SERIES_FAQ_COUNT}, got ${xiaomiSeriesFaq.length}`);
  }
  if (xiaomiSeriesUltraZone.length !== XIAOMI_SERIES_ULTRA_ZONE_COUNT) {
    errors.push(`ultraZone: expected ${XIAOMI_SERIES_ULTRA_ZONE_COUNT}, got ${xiaomiSeriesUltraZone.length}`);
  }

  // order 单调性
  const orders = xiaomiSeriesUpgradeProjects.map((p) => p.order);
  for (let i = 1; i < orders.length; i++) {
    if (orders[i] <= orders[i - 1]) {
      errors.push(`project order not monotonic at index ${i}: ${orders[i]}`);
    }
  }

  // key 唯一性
  const keys = xiaomiSeriesUpgradeProjects.map((p) => p.id);
  if (new Set(keys).size !== keys.length) {
    errors.push("project ids are not unique");
  }

  // scenario projectIds 引用完整性
  const validKeys = new Set(keys);
  for (const s of xiaomiSeriesScenarios) {
    for (const pid of s.projectIds) {
      if (!validKeys.has(pid)) {
        errors.push(`scenario "${s.id}" references unknown project "${pid}"`);
      }
    }
  }

  // Ultra zone projectIds 引用完整性
  for (const u of xiaomiSeriesUltraZone) {
    if (!validKeys.has(u.projectId)) {
      errors.push(`ultra zone references unknown project "${u.projectId}"`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`XiaomiSeries data integrity errors:\n${errors.join("\n")}`);
  }
})();
