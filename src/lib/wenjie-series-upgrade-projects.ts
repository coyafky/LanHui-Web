/**
 * 问界系列项目升级方案 — 一级专题页数据
 *
 * 数据来源 PRD：
 *   docs/PRD/product/WENJIE_SERIES_UPGRADE_PRD_2026-06-24.md
 *
 * 节号映射：
 *   §7.1 热门推荐 10 项 → wenjieSeriesFeaturedProjects   (length === 10)
 *   §9.1 更多选择 24 项 → wenjieSeriesOptionalProjects    (length === 24)
 *   §8   场景分类 7 项 → wenjieSeriesScenarios           (length === 7)
 *   §12  6 步服务流程  → wenjieSeriesServiceSteps        (length === 6)
 *   §13  6 条 FAQ      → wenjieSeriesFaq                 (length === 6)
 *
 * 字段值零变更 —— 直接从 PRD 抄写。展示图统一使用 generated-preview，
 * 后续可逐项替换为 real。
 *
 * 命名差异（Architect §1.3 已确认）：
 *   - 一级 PRD §9.1 中 "改色膜" 保留原名
 *   - 一级 PRD §9.1 中 "挡泥板内衬" 保留原名
 */

import {
  buildWenjieGeneratedPreviewImage,
  buildWenjieMissingPreviewImage,
  type WenjiePreviewImage,
  type WenjiePreviewImageStatus,
} from "./wenjie-preview-images";

export type WenjieSeriesUpgradePriority = "featured" | "optional";

export type WenjieSeriesUpgradeCategory =
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

export type WenjieSeriesImageStatus = WenjiePreviewImageStatus;

export type WenjieSeriesApplicableModel = "M6" | "M7" | "M8";

export type WenjieSeriesUpgradeProject = {
  /** 稳定 slug，例 "wenjie-series-paint-film" */
  key: string;
  name: string;
  category: WenjieSeriesUpgradeCategory;
  priority: WenjieSeriesUpgradePriority;
  /** featured: 1..10; optional: 11..34 */
  order: number;
  summary: string;
  applicableModels?: readonly WenjieSeriesApplicableModel[];
  imageStatus: WenjieSeriesImageStatus;
  image: WenjiePreviewImage;
};

type WenjieSeriesUpgradeProjectRow = Omit<WenjieSeriesUpgradeProject, "image">;

function withWenjieSeriesPreviewImages(
  projects: readonly WenjieSeriesUpgradeProjectRow[],
): readonly WenjieSeriesUpgradeProject[] {
  return projects.map((project) => {
    if (project.imageStatus === "missing") {
      return {
        ...project,
        ...buildWenjieMissingPreviewImage(project.name),
      };
    }
    return {
      ...project,
      ...buildWenjieGeneratedPreviewImage(project.key, project.name),
    };
  });
}

// ---- §7.1 热门推荐 10 项 ----
const wenjieSeriesFeaturedProjectRows = [
  {
    key: "wenjie-series-paint-film",
    name: "隐形车衣",
    category: "paint_protection",
    priority: "featured",
    order: 1,
    summary: "漆面保护、抗日常划痕、新车保护感",
    imageStatus: "generated-preview",
  },
  {
    key: "wenjie-series-window-film",
    name: "隔热膜",
    category: "film_style",
    priority: "featured",
    order: 2,
    summary: "隔热、防晒、隐私、驾乘舒适",
    imageStatus: "generated-preview",
  },
  {
    key: "wenjie-series-rear-aluminum-floor",
    name: "二排铝地板",
    category: "rear_cabin",
    priority: "featured",
    order: 3,
    summary: "二排空间保护、易清洁、后排质感提升",
    imageStatus: "generated-preview",
  },
  {
    key: "wenjie-series-skid-plate",
    name: "底盘护板",
    category: "chassis_protection",
    priority: "featured",
    order: 4,
    summary: "应对路面剐蹭、碎石和底部防护",
    imageStatus: "generated-preview",
  },
  {
    key: "wenjie-series-electric-step",
    name: "电动踏板",
    category: "electric_convenience",
    priority: "featured",
    order: 5,
    summary: "家庭成员上下车便利，兼顾老人和儿童",
    imageStatus: "generated-preview",
  },
  {
    key: "wenjie-series-rear-table",
    name: "小桌板",
    category: "rear_cabin",
    priority: "featured",
    order: 6,
    summary: "后排办公、用餐、儿童使用场景",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-bug-guard",
    name: "防虫网",
    category: "chassis_protection",
    priority: "featured",
    order: 7,
    summary: "减少虫石杂物进入关键散热/进风区域",
    imageStatus: "generated-preview",
  },
  {
    key: "wenjie-series-door-sill",
    name: "门槛条",
    category: "exterior_parts",
    priority: "featured",
    order: 8,
    summary: "上下车高频区域防刮、防踩踏磨损",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-screen-protector",
    name: "钢化膜",
    category: "infotainment",
    priority: "featured",
    order: 9,
    summary: "中控/娱乐屏幕防刮保护",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-interior-coating",
    name: "内饰镀膜",
    category: "cabin_comfort",
    priority: "featured",
    order: 10,
    summary: "内饰表面防污、易清洁、保持质感",
    imageStatus: "missing",
  },
] as const satisfies readonly WenjieSeriesUpgradeProjectRow[];

export const wenjieSeriesFeaturedProjects = withWenjieSeriesPreviewImages(
  wenjieSeriesFeaturedProjectRows,
);

// ---- §9.1 更多选择 24 项 ----
const wenjieSeriesOptionalProjectRows = [
  {
    key: "wenjie-series-hud",
    name: "HUD抬头显示器",
    category: "infotainment",
    priority: "optional",
    order: 11,
    summary: "智能影音",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-starlight-film",
    name: "星空膜",
    category: "film_style",
    priority: "optional",
    order: 12,
    summary: "玻璃膜/座舱氛围",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-door-sound-insulation",
    name: "四门隔音",
    category: "noise_sealing",
    priority: "optional",
    order: 13,
    summary: "隔音升级",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-mud-flap",
    name: "挡泥板",
    category: "exterior_parts",
    priority: "optional",
    order: 14,
    summary: "防护配件",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-rear-entertainment",
    name: "后排娱乐电视",
    category: "rear_cabin",
    priority: "optional",
    order: 15,
    summary: "后排娱乐",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-rear-wing",
    name: "运动尾翼",
    category: "exterior_parts",
    priority: "optional",
    order: 16,
    summary: "外观套件",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-engine-hood",
    name: "发动机盖",
    category: "exterior_parts",
    priority: "optional",
    order: 17,
    summary: "外观件",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-mud-flap-liner",
    name: "挡泥板内衬",
    category: "exterior_parts",
    priority: "optional",
    order: 18,
    summary: "防护配件",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-ambient-light",
    name: "氛围灯",
    category: "cabin_comfort",
    priority: "optional",
    order: 19,
    summary: "座舱氛围",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-wheels",
    name: "轮毂",
    category: "exterior_parts",
    priority: "optional",
    order: 20,
    summary: "外观升级",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-stream-mirror",
    name: "流媒体后视镜",
    category: "infotainment",
    priority: "optional",
    order: 21,
    summary: "智能影音",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-license-frame",
    name: "牌照框",
    category: "exterior_parts",
    priority: "optional",
    order: 22,
    summary: "外观小件",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-electric-door",
    name: "电动门",
    category: "electric_convenience",
    priority: "optional",
    order: 23,
    summary: "电动便利",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-sport-kit",
    name: "运动包围",
    category: "exterior_parts",
    priority: "optional",
    order: 24,
    summary: "外观套件",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-door-seal",
    name: "四门密封条",
    category: "noise_sealing",
    priority: "optional",
    order: 25,
    summary: "隔音/密封",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-brake-caliper",
    name: "刹车卡钳",
    category: "exterior_parts",
    priority: "optional",
    order: 26,
    summary: "外观/制动视觉",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-sway-bar",
    name: "平衡杆",
    category: "chassis_protection",
    priority: "optional",
    order: 27,
    summary: "操控/底盘",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-color-film",
    name: "改色膜",
    category: "film_style",
    priority: "optional",
    order: 28,
    summary: "外观个性",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-roof-platform",
    name: "车顶平台套件",
    category: "outdoor_accessory",
    priority: "optional",
    order: 29,
    summary: "户外/露营",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-interior-silicone",
    name: "内饰硅胶件",
    category: "cabin_comfort",
    priority: "optional",
    order: 30,
    summary: "座舱保护",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-starlight-roof",
    name: "星空顶",
    category: "cabin_comfort",
    priority: "optional",
    order: 31,
    summary: "座舱氛围",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-rotating-seat",
    name: "旋转座椅",
    category: "rear_cabin",
    priority: "optional",
    order: 32,
    summary: "后排舒适",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-trunk-mat",
    name: "尾箱垫",
    category: "rear_cabin",
    priority: "optional",
    order: 33,
    summary: "尾箱防护",
    imageStatus: "missing",
  },
  {
    key: "wenjie-series-leg-rest",
    name: "腿托",
    category: "rear_cabin",
    priority: "optional",
    order: 34,
    summary: "后排舒适",
    imageStatus: "missing",
  },
] as const satisfies readonly WenjieSeriesUpgradeProjectRow[];

export const wenjieSeriesOptionalProjects = withWenjieSeriesPreviewImages(
  wenjieSeriesOptionalProjectRows,
);

// ---- §8 场景分类 7 项 ----
export type WenjieSeriesScenario = {
  key: string;
  name: string;
  description: string;
  projectKeys: readonly string[];
};

export const wenjieSeriesScenarios: readonly WenjieSeriesScenario[] = [
  {
    key: "scenario-new-car-protection",
    name: "新车保护",
    description: "适合新车基础防护",
    projectKeys: [
      "wenjie-series-paint-film",
      "wenjie-series-window-film",
      "wenjie-series-skid-plate",
      "wenjie-series-door-sill",
      "wenjie-series-screen-protector",
      "wenjie-series-interior-coating",
    ],
  },
  {
    key: "scenario-family-rear-cabin",
    name: "家庭后排",
    description: "适合家庭出行、后排乘坐",
    projectKeys: [
      "wenjie-series-rear-aluminum-floor",
      "wenjie-series-rear-table",
      "wenjie-series-rear-entertainment",
      "wenjie-series-rotating-seat",
      "wenjie-series-leg-rest",
    ],
  },
  {
    key: "scenario-step-in-convenience",
    name: "上下车便利",
    description: "提升家庭成员上下车便利",
    projectKeys: [
      "wenjie-series-electric-step",
      "wenjie-series-electric-door",
      "wenjie-series-door-seal",
    ],
  },
  {
    key: "scenario-cabin-comfort",
    name: "座舱舒适",
    description: "提升座舱氛围与豪华感",
    projectKeys: [
      "wenjie-series-ambient-light",
      "wenjie-series-starlight-roof",
      "wenjie-series-starlight-film",
      "wenjie-series-door-sound-insulation",
      "wenjie-series-trunk-mat",
    ],
  },
  {
    key: "scenario-infotainment",
    name: "智能影音",
    description: "驾驶信息可视化和后排娱乐",
    projectKeys: [
      "wenjie-series-hud",
      "wenjie-series-rear-entertainment",
      "wenjie-series-stream-mirror",
    ],
  },
  {
    key: "scenario-exterior-upgrade",
    name: "外观升级",
    description: "强化视觉辨识度和整车姿态",
    projectKeys: [
      "wenjie-series-rear-wing",
      "wenjie-series-wheels",
      "wenjie-series-sport-kit",
      "wenjie-series-color-film",
      "wenjie-series-engine-hood",
      "wenjie-series-roof-platform",
    ],
  },
  {
    key: "scenario-outdoor-camping",
    name: "露营/户外",
    description: "适合户外、露营和复杂路况",
    projectKeys: [
      "wenjie-series-roof-platform",
      "wenjie-series-bug-guard",
      "wenjie-series-mud-flap",
      "wenjie-series-mud-flap-liner",
      "wenjie-series-trunk-mat",
    ],
  },
] as const;

// ---- §12 6 步服务流程 ----
export type WenjieSeriesServiceStep = {
  step: number;
  title: string;
  description: string;
};

export const wenjieSeriesServiceSteps: readonly WenjieSeriesServiceStep[] = [
  {
    step: 1,
    title: "车型确认",
    description: "确认问界车型、年份、版本和配置差异",
  },
  {
    step: 2,
    title: "项目选择",
    description: "根据家庭出行、后排舒适、户外场景或新车保护选择项目",
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

// ---- §13 6 条 FAQ ----
export type WenjieSeriesFaqItem = {
  question: string;
  answer: string;
};

export const wenjieSeriesFaq: readonly WenjieSeriesFaqItem[] = [
  {
    question: "是否所有问界车型都能安装？",
    answer: "不同年份和配置不同，需到店确认",
  },
  {
    question: "新车最推荐先做哪些项目？",
    answer: "隐形车衣、隔热膜、底盘护板、门槛条、内饰保护等",
  },
  {
    question: "家庭用户最常关注哪些项目？",
    answer: "二排铝地板、电动踏板、小桌板、后排娱乐、座舱舒适项目",
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
