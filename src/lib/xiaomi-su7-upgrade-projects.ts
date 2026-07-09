/**
 * 小米 SU7 单车型专题页静态数据
 *
 * 21 项升级项目、5 大用车场景、6 步服务流程、6 条 FAQ。
 * PRD: docs/PRD/product/XIAOMI_TOPIC_PRD_2026-06-20.md
 *      docs/PRD/product/XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md
 *
 * imageStatus 根据实际图片可用性设置（product-preview / matched / missing）。
 * 字面量防漂移模式：as const satisfies + runtime count assertion。
 */

export type XiaomiSu7Category =
  | "paint_protection"
  | "cabin_protection"
  | "chassis_protection"
  | "exterior_parts"
  | "film_style"
  | "cabin_comfort"
  | "electric_convenience"
  | "handling"
  | "infotainment";

export type XiaomiSu7ImageStatus =
  | "matched"
  | "product-preview"
  | "pending-review"
  | "missing";

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

export interface XiaomiSu7HeroImage {
  readonly publicPath: "/images/products/xiaomi/su7/generated/xs-20.png";
  readonly alt: "小米 SU7 专属升级方案主视觉";
  readonly width: 1448;
  readonly height: 1086;
}

// ---- 字面量约束 ----

export const XIAOMI_SU7_PROJECT_COUNT = 21;
export const XIAOMI_SU7_SCENARIO_COUNT = 5;
export const XIAOMI_SU7_SERVICE_STEP_COUNT = 6;
export const XIAOMI_SU7_FAQ_COUNT = 6;

export const XIAOMI_SU7_HERO_IMAGE: XiaomiSu7HeroImage = {
  publicPath: "/images/products/xiaomi/su7/generated/xs-20.png",
  alt: "小米 SU7 专属升级方案主视觉",
  width: 1448,
  height: 1086,
};

// ---- 21 项升级项目 ----

export const xiaomiSu7UpgradeProjects: readonly XiaomiSu7UpgradeProject[] = [
  {
    id: "xs-01", order: 1, name: "车衣", category: "paint_protection",
    summary: "透明 PPF 覆盖车身高频区域，保护原厂漆面质感",
    suitableFor: ["新车保护", "漆面防护"],
    publicPath: "/images/products/xiaomi/su7/generated/xs-01.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-02", order: 2, name: "隔热膜", category: "film_style",
    summary: "前挡与侧窗隔热、防晒、隐私和驾乘舒适升级",
    suitableFor: ["新车保护", "夏季用车"],
    publicPath: "/images/products/xiaomi/su7/generated/xs-02.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-03", order: 3, name: "改色膜", category: "film_style",
    summary: "改变车身视觉风格，保留原车漆并提升辨识度",
    suitableFor: ["外观个性", "改色风格"],
    publicPath: "/images/products/xiaomi/su7/generated/xs-03.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-04", order: 4, name: "360 软包脚垫", category: "cabin_protection",
    summary: "覆盖驾驶区、后排地板和门槛区域，提升易清洁能力",
    suitableFor: ["新车保护", "座舱防护"],
    publicPath: "/images/products/xiaomi/su7/generated/xs-04.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-05", order: 5, name: "底盘护板", category: "chassis_protection",
    summary: "前底盘关键区域防护，降低日常路况剐蹭风险",
    suitableFor: ["新车保护", "底盘防护"],
    publicPath: "/images/products/xiaomi/su7/generated/xs-05.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-06", order: 6, name: "氛围灯", category: "cabin_comfort",
    summary: "仪表台、门板和中控区域光带，提升夜间座舱氛围",
    suitableFor: ["座舱防护", "高端质感"],
    publicPath: "/images/products/xiaomi/su7/generated/xs-06.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-07", order: 7, name: "仪表中置", category: "infotainment",
    summary: "居中仪表模块提升驾驶信息读取与科技感",
    suitableFor: ["座舱防护", "驾驶触点"],
    caution: "需确认原车屏幕、安装位和线束适配",
    publicPath: "/images/products/xiaomi/su7/generated/xs-07.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-08", order: 8, name: "底盘灯", category: "exterior_parts",
    summary: "侧裙与前唇下方克制光带，强化夜间外观辨识度",
    suitableFor: ["外观个性", "夜间氛围"],
    publicPath: "/images/products/xiaomi/su7/generated/xs-08.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-09", order: 9, name: "电动尾翼", category: "electric_convenience",
    summary: "尾部升起式尾翼结构，提升运动视觉和功能仪式感",
    suitableFor: ["外观个性", "高端质感"],
    caution: "涉及电气与安装位，需到店确认适配",
    publicPath: "/images/products/xiaomi/su7/generated/xs-09.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-10", order: 10, name: "电动遮阳帘", category: "electric_convenience",
    summary: "座舱顶部与后窗区域遮阳，提升后排舒适性",
    suitableFor: ["座舱防护", "舒适升级"],
    publicPath: "/images/products/xiaomi/su7/generated/xs-10.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-11", order: 11, name: "电动前机盖", category: "electric_convenience",
    summary: "前舱电动撑杆与开启结构，提升日常使用便利性",
    suitableFor: ["外观个性", "电动便利"],
    caution: "需确认前舱结构和电气接口适配",
    publicPath: "/images/products/xiaomi/su7/generated/xs-11.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-12", order: 12, name: "Ultra 机盖", category: "exterior_parts",
    summary: "Ultra 风格机盖开孔与雕塑线条，强化前脸运动感",
    suitableFor: ["外观个性", "Ultra 风格"],
    caution: "需确认车型版本适配",
    publicPath: "/images/products/xiaomi/su7/generated/xs-12.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-13", order: 13, name: "Ultra 方向盘", category: "handling",
    summary: "平底运动方向盘、黄色中线与碳纤纹理，强化驾驶触点",
    suitableFor: ["驾驶触点", "Ultra 风格"],
    caution: "需确认与原车功能和安全气囊兼容性",
    publicPath: "/images/products/xiaomi/su7/generated/xs-13.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-14", order: 14, name: "Ultra 电子声浪", category: "infotainment",
    summary: "抽象声浪交互与座舱运动氛围升级",
    suitableFor: ["驾驶触点", "Ultra 风格"],
    caution: "涉及电气适配，需到店评估",
    publicPath: "/images/products/xiaomi/su7/generated/xs-14.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-15", order: 15, name: "后排电视", category: "infotainment",
    summary: "前排座椅背部娱乐屏，提升后排乘坐体验",
    suitableFor: ["座舱防护", "舒适升级"],
    publicPath: "/images/products/xiaomi/su7/generated/xs-15.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-16", order: 16, name: "Ultra 尾翼", category: "exterior_parts",
    summary: "固定式黑色运动尾翼和支架结构，强化尾部姿态",
    suitableFor: ["外观个性", "Ultra 风格"],
    publicPath: "/images/products/xiaomi/su7/generated/xs-16.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-17", order: 17, name: "Ultra 碳纤内饰", category: "cabin_comfort",
    summary: "仪表台、中控和门板碳纤纹理饰板，提升座舱质感",
    suitableFor: ["高端质感", "座舱防护"],
    publicPath: "/images/products/xiaomi/su7/generated/xs-17.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-18", order: 18, name: "Ultra 拉花", category: "film_style",
    summary: "车身侧面与机盖运动条纹，提升 Ultra 风格辨识度",
    suitableFor: ["外观个性", "Ultra 风格"],
    publicPath: "/images/products/xiaomi/su7/generated/xs-18.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-19", order: 19, name: "座椅按摩", category: "cabin_comfort",
    summary: "运动座椅按摩分区与控制光效，提升长途舒适性",
    suitableFor: ["座舱防护", "舒适升级"],
    publicPath: "/images/products/xiaomi/su7/generated/xs-19.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-20", order: 20, name: "Ultra 前后包围", category: "exterior_parts",
    summary: "前唇、后扩散器和空气动力套件，强化整车运动姿态",
    suitableFor: ["外观个性", "Ultra 风格"],
    publicPath: "/images/products/xiaomi/su7/generated/xs-20.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
  {
    id: "xs-21", order: 21, name: "Ultra 内饰升级", category: "cabin_comfort",
    summary: "运动方向盘、碳纤饰板、氛围灯与黄色缝线的综合座舱升级",
    suitableFor: ["高端质感", "座舱防护"],
    publicPath: "/images/products/xiaomi/su7/generated/xs-21.png",
    width: 1448,
    height: 1086,
    imageStatus: "product-preview", sourceArea: "poster_project_matrix",
  },
] as const satisfies readonly XiaomiSu7UpgradeProject[];

// ---- 5 大场景 ----

export const xiaomiSu7Scenarios: readonly XiaomiSu7Scenario[] = [
  {
    id: "new-car-protection", name: "新车保护",
    description: "车衣、隔热膜、软包脚垫和底盘护板等基础保护项目",
    projectIds: ["xs-01", "xs-02", "xs-04", "xs-05"],
  },
  {
    id: "appearance-style", name: "外观个性",
    description: "改色膜、底盘灯、电动尾翼、Ultra 外观件和拉花等运动化升级",
    projectIds: ["xs-03", "xs-08", "xs-09", "xs-11", "xs-12", "xs-16", "xs-18", "xs-20"],
  },
  {
    id: "cabin-care", name: "座舱防护",
    description: "氛围灯、仪表中置、电动遮阳帘、后排电视和座椅按摩等座舱升级",
    projectIds: ["xs-04", "xs-06", "xs-07", "xs-10", "xs-15", "xs-17", "xs-19", "xs-21"],
  },
  {
    id: "chassis-driving", name: "底盘与行车防护",
    description: "底盘护板、底盘灯、Ultra 方向盘和电子声浪等行车体验升级",
    projectIds: ["xs-05", "xs-08", "xs-13", "xs-14"],
  },
  {
    id: "premium-quality", name: "高端质感",
    description: "Ultra 外观、碳纤内饰、运动方向盘和舒适座舱的综合质感升级",
    projectIds: ["xs-12", "xs-13", "xs-16", "xs-17", "xs-19", "xs-20", "xs-21"],
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
    answer: "车衣、隔热膜、360 软包脚垫、底盘护板等基础保护项目。",
  },
  {
    question: "外观个性项目有哪些？",
    answer: "改色膜、底盘灯、电动尾翼、Ultra 机盖、Ultra 尾翼、Ultra 前后包围等。",
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
