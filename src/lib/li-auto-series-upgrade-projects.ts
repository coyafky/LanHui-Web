/**
 * 理想系列项目升级方案 — 一级专题页数据
 *
 * 数据来源 PRD：
 *   docs/PRD/product/LI_AUTO_TOPIC_PRD_2026-06-24.md
 *
 * 节号映射：
 *   §7   热门推荐 10 项 → liAutoSeriesFeaturedProjects   (length === 10)
 *   §9.1 更多选择 30 项 → liAutoSeriesOptionalProjects    (length === 30)
 *   §8   场景分类 6 项 → liAutoSeriesScenarios           (length === 6)
 *   §11  6 步服务流程   → liAutoSeriesServiceSteps        (length === 6)
 *   §12  6 条 FAQ       → liAutoSeriesFaq                 (length === 6)
 *
 * 字段值零变更 —— 直接从 PRD 抄写。所有图片使用 pending-review，
 * 后续可逐项替换为 matched。
 */

export type LiAutoSeriesUpgradePriority = "featured" | "optional";

export type LiAutoSeriesUpgradeCategory =
  | "paint_protection"
  | "film_style"
  | "chassis_protection"
  | "rear_cabin"
  | "electric_convenience"
  | "infotainment"
  | "exterior_parts"
  | "outdoor_accessory"
  | "cabin_comfort"
  | "noise_sealing";

export type LiAutoSeriesApplicableModel = "i8" | "L9" | "MEGA";

export type LiAutoSeriesImageStatus =
  | "matched"
  | "generated-preview"
  | "pending-review"
  | "missing";

export type LiAutoSeriesUpgradeProject = {
  /** 稳定 slug，例 "li-auto-series-paint-film" */
  key: string;
  name: string;
  category: LiAutoSeriesUpgradeCategory;
  priority: LiAutoSeriesUpgradePriority;
  /** featured: 1..10; optional: 11..40 */
  order: number;
  summary: string;
  applicableModels?: readonly LiAutoSeriesApplicableModel[];
  publicPath?: `/images/products/li-auto/generated/${string}.png`;
  width?: 1448;
  height?: 1086;
  aspectRatio?: "4/3";
  imageStatus: LiAutoSeriesImageStatus;
};

// ---- §7 热门推荐 10 项 ----

export const liAutoSeriesFeaturedProjects: readonly LiAutoSeriesUpgradeProject[] = [
  {
    key: "li-auto-series-paint-film",
    name: "隐形车衣",
    category: "paint_protection",
    priority: "featured",
    order: 1,
    summary: "漆面保护、日常划痕防护、新车保护感",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-paint-protection-film.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-window-film",
    name: "隔热膜",
    category: "film_style",
    priority: "featured",
    order: 2,
    summary: "隔热、防晒、隐私、家庭出行舒适",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-window-film.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-rear-aluminum-floor",
    name: "二排铝地板",
    category: "rear_cabin",
    priority: "featured",
    order: 3,
    summary: "二排空间保护、易清洁、后排质感提升",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-second-row-aluminum-floor.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-skid-plate",
    name: "底盘护板",
    category: "chassis_protection",
    priority: "featured",
    order: 4,
    summary: "应对路面剐蹭、碎石和底部防护",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-skid-plate.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-electric-step",
    name: "电动踏板",
    category: "electric_convenience",
    priority: "featured",
    order: 5,
    summary: "家庭成员上下车便利，兼顾老人和儿童",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-electric-step.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-rear-table",
    name: "小桌板",
    category: "rear_cabin",
    priority: "featured",
    order: 6,
    summary: "后排办公、用餐、儿童使用场景",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-rear-table.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-bug-guard",
    name: "防虫网",
    category: "chassis_protection",
    priority: "featured",
    order: 7,
    summary: "减少虫石杂物进入关键散热/进风区域",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-bug-guard.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-door-sill",
    name: "门槛条",
    category: "exterior_parts",
    priority: "featured",
    order: 8,
    summary: "上下车高频区域防刮、防踩踏磨损",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-door-sill.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-screen-protector",
    name: "钢化膜",
    category: "infotainment",
    priority: "featured",
    order: 9,
    summary: "中控/娱乐屏幕防刮保护",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-screen-protector.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-interior-coating",
    name: "内饰镀膜",
    category: "cabin_comfort",
    priority: "featured",
    order: 10,
    summary: "内饰表面防污、易清洁、保持质感",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-interior-coating.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
] as const;

// ---- §9.1 更多选择 30 项 ----

export const liAutoSeriesOptionalProjects: readonly LiAutoSeriesUpgradeProject[] = [
  {
    key: "li-auto-series-rear-entertainment",
    name: "后排娱乐电视",
    category: "rear_cabin",
    priority: "optional",
    order: 11,
    summary: "后排娱乐",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-rear-entertainment.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-angel-wing-mirror",
    name: "后视镜-天使之翼",
    category: "exterior_parts",
    priority: "optional",
    order: 12,
    summary: "外观/灯光",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-wing-mirror-trim.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-stream-mirror",
    name: "流媒体后视镜",
    category: "infotainment",
    priority: "optional",
    order: 13,
    summary: "智能影音",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-streaming-mirror.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-mud-flap",
    name: "挡泥板",
    category: "exterior_parts",
    priority: "optional",
    order: 14,
    summary: "防护配件",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-mud-flap.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-ambient-light",
    name: "氛围灯",
    category: "cabin_comfort",
    priority: "optional",
    order: 15,
    summary: "座舱氛围",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-ambient-light.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-wheels",
    name: "轮毂",
    category: "exterior_parts",
    priority: "optional",
    order: 16,
    summary: "外观升级",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-wheels.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-fridge",
    name: "冰箱",
    category: "cabin_comfort",
    priority: "optional",
    order: 17,
    summary: "座舱便利",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-fridge.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-mud-flap-liner",
    name: "挡泥板内衬",
    category: "exterior_parts",
    priority: "optional",
    order: 18,
    summary: "防护配件",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-wheel-liner.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-electric-door",
    name: "电动门",
    category: "electric_convenience",
    priority: "optional",
    order: 19,
    summary: "电动便利",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-electric-door.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-sport-kit",
    name: "运动包围",
    category: "exterior_parts",
    priority: "optional",
    order: 20,
    summary: "外观套件",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-sport-kit.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-center-speaker",
    name: "中置喇叭",
    category: "infotainment",
    priority: "optional",
    order: 21,
    summary: "智能影音",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-center-speaker.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-license-frame",
    name: "牌照框",
    category: "exterior_parts",
    priority: "optional",
    order: 22,
    summary: "外观小件",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-license-frame.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-sway-bar",
    name: "平衡杆",
    category: "chassis_protection",
    priority: "optional",
    order: 23,
    summary: "操控/底盘",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-sway-bar.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-blackout-kit",
    name: "黑化套件",
    category: "exterior_parts",
    priority: "optional",
    order: 24,
    summary: "外观套件",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-blackout-kit.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-4d-tweeter",
    name: "4D高音喇叭",
    category: "infotainment",
    priority: "optional",
    order: 25,
    summary: "智能影音",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-4d-tweeter.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-brake-caliper",
    name: "刹车卡钳",
    category: "exterior_parts",
    priority: "optional",
    order: 26,
    summary: "外观/制动视觉",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-brake-caliper.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-full-car-audio",
    name: "全车音响",
    category: "infotainment",
    priority: "optional",
    order: 27,
    summary: "智能影音",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-full-audio.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-color-wrap",
    name: "改色膜",
    category: "film_style",
    priority: "optional",
    order: 28,
    summary: "外观个性",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-color-change-film.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-zero-gravity-seat",
    name: "零重力座椅",
    category: "cabin_comfort",
    priority: "optional",
    order: 29,
    summary: "座椅舒适",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-zero-gravity-seat.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-fragrance-system",
    name: "香氛系统",
    category: "cabin_comfort",
    priority: "optional",
    order: 30,
    summary: "座舱舒适",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-fragrance-system.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-starlight-roof",
    name: "星空顶",
    category: "cabin_comfort",
    priority: "optional",
    order: 31,
    summary: "座舱氛围",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-starlight-roof.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-rotating-seat",
    name: "旋转座椅",
    category: "rear_cabin",
    priority: "optional",
    order: 32,
    summary: "后排舒适",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-swivel-seat.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-door-seal",
    name: "四门密封条",
    category: "noise_sealing",
    priority: "optional",
    order: 33,
    summary: "隔音/密封",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-door-seal.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-leg-rest",
    name: "腿托",
    category: "rear_cabin",
    priority: "optional",
    order: 34,
    summary: "后排舒适",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-leg-rest.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-starlight-film",
    name: "星空膜",
    category: "film_style",
    priority: "optional",
    order: 35,
    summary: "外观/玻璃膜",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-starlight-film.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-door-sound-insulation",
    name: "四门隔音",
    category: "noise_sealing",
    priority: "optional",
    order: 36,
    summary: "隔音升级",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-door-sound-insulation.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-roof-platform",
    name: "车顶平台套件",
    category: "outdoor_accessory",
    priority: "optional",
    order: 37,
    summary: "户外/露营",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-roof-platform.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-soft-close-door",
    name: "电吸门",
    category: "electric_convenience",
    priority: "optional",
    order: 38,
    summary: "电动便利",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-soft-close-door.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-floating-roof",
    name: "悬浮顶",
    category: "exterior_parts",
    priority: "optional",
    order: 39,
    summary: "外观个性",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-floating-roof.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
  {
    key: "li-auto-series-engine-hood",
    name: "发动机盖",
    category: "exterior_parts",
    priority: "optional",
    order: 40,
    summary: "外观件",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/generated/li-auto-engine-hood.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  },
] as const;

// ---- §8 场景分类 6 项 ----

export type LiAutoSeriesScenario = {
  key: string;
  name: string;
  description: string;
  projectKeys: readonly string[];
};

export const liAutoSeriesScenarios: readonly LiAutoSeriesScenario[] = [
  {
    key: "scenario-new-car-protection",
    name: "新车保护",
    description: "适合新车基础防护",
    projectKeys: [
      "li-auto-series-paint-film",
      "li-auto-series-window-film",
      "li-auto-series-skid-plate",
      "li-auto-series-door-sill",
      "li-auto-series-screen-protector",
      "li-auto-series-interior-coating",
      "li-auto-series-sway-bar",
    ],
  },
  {
    key: "scenario-family-rear-cabin",
    name: "家庭后排",
    description: "适合家庭出行、后排乘坐",
    projectKeys: [
      "li-auto-series-rear-aluminum-floor",
      "li-auto-series-rear-table",
      "li-auto-series-rear-entertainment",
      "li-auto-series-zero-gravity-seat",
      "li-auto-series-leg-rest",
      "li-auto-series-rotating-seat",
    ],
  },
  {
    key: "scenario-step-in-convenience",
    name: "上下车便利",
    description: "提升家庭成员上下车便利",
    projectKeys: [
      "li-auto-series-electric-step",
      "li-auto-series-electric-door",
      "li-auto-series-soft-close-door",
      "li-auto-series-door-seal",
    ],
  },
  {
    key: "scenario-cabin-comfort",
    name: "座舱舒适",
    description: "提升座舱氛围与豪华感",
    projectKeys: [
      "li-auto-series-ambient-light",
      "li-auto-series-fragrance-system",
      "li-auto-series-full-car-audio",
      "li-auto-series-4d-tweeter",
      "li-auto-series-fridge",
      "li-auto-series-rear-entertainment",
      "li-auto-series-stream-mirror",
      "li-auto-series-center-speaker",
      "li-auto-series-door-sound-insulation",
    ],
  },
  {
    key: "scenario-exterior-upgrade",
    name: "外观升级",
    description: "强化视觉辨识度和整车姿态",
    projectKeys: [
      "li-auto-series-wheels",
      "li-auto-series-sport-kit",
      "li-auto-series-blackout-kit",
      "li-auto-series-color-wrap",
      "li-auto-series-floating-roof",
      "li-auto-series-starlight-roof",
      "li-auto-series-starlight-film",
      "li-auto-series-angel-wing-mirror",
      "li-auto-series-license-frame",
      "li-auto-series-brake-caliper",
      "li-auto-series-engine-hood",
    ],
  },
  {
    key: "scenario-outdoor-camping",
    name: "露营/户外",
    description: "适合户外、露营和复杂路况",
    projectKeys: [
      "li-auto-series-roof-platform",
      "li-auto-series-bug-guard",
      "li-auto-series-mud-flap",
      "li-auto-series-mud-flap-liner",
      "li-auto-series-skid-plate",
    ],
  },
] as const;

// ---- §11 6 步服务流程 ----

export type LiAutoSeriesServiceStep = {
  step: number;
  title: string;
  description: string;
};

export const liAutoSeriesServiceSteps: readonly LiAutoSeriesServiceStep[] = [
  {
    step: 1,
    title: "车型确认",
    description: "确认理想车型、年份、版本和配置差异",
  },
  {
    step: 2,
    title: "项目选择",
    description: "根据家庭出行、露营、后排舒适或新车保护选择项目",
  },
  {
    step: 3,
    title: "到店评估",
    description: "现场确认安装位置、接口、材料和工期",
  },
  {
    step: 4,
    title: "施工安装",
    description: "按项目标准施工，过程保护车辆",
  },
  {
    step: 5,
    title: "验收交付",
    description: "检查外观、功能和安装效果",
  },
  {
    step: 6,
    title: "售后支持",
    description: "提供使用注意事项和后续维护建议",
  },
] as const;

// ---- §12 6 条 FAQ ----

export type LiAutoSeriesFaqItem = {
  question: string;
  answer: string;
};

export const liAutoSeriesFaq: readonly LiAutoSeriesFaqItem[] = [
  {
    question: "是否所有理想车型都能安装？",
    answer: "不同年份和配置不同，需到店确认",
  },
  {
    question: "新车最推荐先做哪些项目？",
    answer: "隐形车衣、隔热膜、底盘护板、门槛条、内饰保护等",
  },
  {
    question: "家庭用户最常关注哪些项目？",
    answer: "二排铝地板、电动踏板、小桌板、后排娱乐、冰箱和座椅舒适项目",
  },
  {
    question: "可以只做单个项目吗？",
    answer: "可以，页面只是组合参考",
  },
  {
    question: "是否影响原车质保？",
    answer: "不做承诺，以车主车辆情况和项目评估为准",
  },
  {
    question: "工期多久？",
    answer: "根据项目组合和施工排期确认",
  },
] as const;

// ---- count 常量 ----

export const LI_AUTO_SERIES_FEATURED_COUNT = 10;
export const LI_AUTO_SERIES_OPTIONAL_COUNT = 30;
export const LI_AUTO_SERIES_SCENARIO_COUNT = 6;
export const LI_AUTO_SERIES_STEP_COUNT = 6;
export const LI_AUTO_SERIES_FAQ_COUNT = 6;

// ---- Runtime 断言（防漂移）----

export function assertLiAutoSeriesDataShape(): void {
  // 1. 每个数组 length === 对应常量
  if (liAutoSeriesFeaturedProjects.length !== LI_AUTO_SERIES_FEATURED_COUNT) {
    throw new Error(
      `LiAutoSeries featured count drift: expected ${LI_AUTO_SERIES_FEATURED_COUNT}, got ${liAutoSeriesFeaturedProjects.length}`,
    );
  }
  if (liAutoSeriesOptionalProjects.length !== LI_AUTO_SERIES_OPTIONAL_COUNT) {
    throw new Error(
      `LiAutoSeries optional count drift: expected ${LI_AUTO_SERIES_OPTIONAL_COUNT}, got ${liAutoSeriesOptionalProjects.length}`,
    );
  }
  if (liAutoSeriesScenarios.length !== LI_AUTO_SERIES_SCENARIO_COUNT) {
    throw new Error(
      `LiAutoSeries scenario count drift: expected ${LI_AUTO_SERIES_SCENARIO_COUNT}, got ${liAutoSeriesScenarios.length}`,
    );
  }
  if (liAutoSeriesServiceSteps.length !== LI_AUTO_SERIES_STEP_COUNT) {
    throw new Error(
      `LiAutoSeries service step count drift: expected ${LI_AUTO_SERIES_STEP_COUNT}, got ${liAutoSeriesServiceSteps.length}`,
    );
  }
  if (liAutoSeriesFaq.length !== LI_AUTO_SERIES_FAQ_COUNT) {
    throw new Error(
      `LiAutoSeries FAQ count drift: expected ${LI_AUTO_SERIES_FAQ_COUNT}, got ${liAutoSeriesFaq.length}`,
    );
  }

  // 2. featured order 单调递增 1-10
  liAutoSeriesFeaturedProjects.forEach((p, i) => {
    if (p.order !== i + 1) {
      throw new Error(
        `LiAutoSeries featured order drift at index ${i}: expected ${i + 1}, got ${p.order}`,
      );
    }
  });

  // 3. optional order 单调递增 11-40
  liAutoSeriesOptionalProjects.forEach((p, i) => {
    if (p.order !== i + 11) {
      throw new Error(
        `LiAutoSeries optional order drift at index ${i}: expected ${i + 11}, got ${p.order}`,
      );
    }
  });

  // 4. service steps step 连续 1-6
  liAutoSeriesServiceSteps.forEach((s, i) => {
    if (s.step !== i + 1) {
      throw new Error(
        `LiAutoSeries service step order drift at index ${i}: expected ${i + 1}, got ${s.step}`,
      );
    }
  });

  // 5. all project keys 唯一
  const allProjects = [...liAutoSeriesFeaturedProjects, ...liAutoSeriesOptionalProjects];
  const projectKeys = new Set<string>();
  for (const p of allProjects) {
    if (projectKeys.has(p.key)) {
      throw new Error(`LiAutoSeries duplicate project key: ${p.key}`);
    }
    projectKeys.add(p.key);
  }

  // 6. featured priority 全是 "featured"
  for (const p of liAutoSeriesFeaturedProjects) {
    if (p.priority !== "featured") {
      throw new Error(`LiAutoSeries featured project ${p.key} has priority ${p.priority}`);
    }
  }

  // 7. optional priority 全是 "optional"
  for (const p of liAutoSeriesOptionalProjects) {
    if (p.priority !== "optional") {
      throw new Error(`LiAutoSeries optional project ${p.key} has priority ${p.priority}`);
    }
  }

  // 8. scenario keys 唯一
  const scenarioKeys = new Set<string>();
  for (const s of liAutoSeriesScenarios) {
    if (scenarioKeys.has(s.key)) {
      throw new Error(`LiAutoSeries duplicate scenario key: ${s.key}`);
    }
    scenarioKeys.add(s.key);
  }

  // 9. scenario.projectKeys 引用存在的 project key
  for (const s of liAutoSeriesScenarios) {
    for (const pk of s.projectKeys) {
      if (!projectKeys.has(pk)) {
        throw new Error(
          `LiAutoSeries scenario "${s.key}" references unknown project key: ${pk}`,
        );
      }
    }
  }

  // 10. 每个 project 至少被一个 scenario 引用
  const referencedByScenario = new Set<string>();
  for (const s of liAutoSeriesScenarios) {
    for (const pk of s.projectKeys) {
      referencedByScenario.add(pk);
    }
  }
  for (const p of allProjects) {
    if (!referencedByScenario.has(p.key)) {
      throw new Error(
        `LiAutoSeries project "${p.key}" is not referenced by any scenario`,
      );
    }
  }

  // 11. featured 和 optional 的 key 不冲突
  const featuredKeys = new Set(liAutoSeriesFeaturedProjects.map((p) => p.key));
  for (const p of liAutoSeriesOptionalProjects) {
    if (featuredKeys.has(p.key)) {
      throw new Error(`LiAutoSeries project key "${p.key}" appears in both featured and optional`);
    }
  }
}

// 模块加载即触发断言
assertLiAutoSeriesDataShape();
