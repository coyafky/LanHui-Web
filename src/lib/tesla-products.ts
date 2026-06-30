/**
 * 特斯拉系列轻改项目 — 一级专题页数据
 *
 * 数据来源 PRD：
 *   docs/PRD/product/TESLA_TOPIC_PRD_2026-06-24.md
 *
 * 节号映射：
 *   §7  10 个主推轻改项目 → teslaFeaturedProjects      (length === 10)
 *   §8  6 场景分类         → teslaScenarios             (length === 6)
 *   §9.1 32 个更多可选项目 → teslaOptionalProjects      (length === 32)
 *   §11 6 步服务流程       → teslaServiceSteps          (length === 6)
 *   §12 5 条 FAQ           → teslaFaq                   (length === 5)
 *
 * 字段值零变更 —— 直接从 PRD 抄写。一期允许 imageStatus = "pending-review"，
 * 后续可逐项替换为 matched 或 missing。
 */

export type TeslaProjectPriority = "featured" | "optional";

export type TeslaProjectCategory =
  | "paint_protection"
  | "film_style"
  | "chassis_protection"
  | "cabin_comfort"
  | "electric_convenience"
  | "infotainment"
  | "exterior_parts"
  | "storage_accessory";

export type TeslaModel = "Model 3" | "Model Y" | "Model S" | "Model X";

export type TeslaImageStatus = "matched" | "generated-preview" | "pending-review" | "missing";

export interface TeslaProject {
  /** 稳定 slug, 例 "tesla-featured-paint-ppf" */
  readonly key: string;
  /** 项目名称 */
  readonly name: string;
  readonly category: TeslaProjectCategory;
  readonly priority: TeslaProjectPriority;
  /** featured: 1..10; optional: 11..42 */
  readonly order: number;
  /** 一句话价值说明 */
  readonly summary: string;
  readonly applicableModels?: readonly TeslaModel[];
  readonly publicPath?: `/images/products/tesla/${string}.png`;
  readonly width?: 1448;
  readonly height?: 1086;
  readonly aspectRatio?: "4/3";
  readonly imageStatus: TeslaImageStatus;
}

export interface TeslaScenario {
  readonly key: string;
  readonly name: string;
  readonly description: string;
  readonly projectKeys: readonly string[];
}

export interface TeslaServiceStep {
  readonly step: number;
  readonly title: string;
  readonly description: string;
}

export interface TeslaFaqItem {
  readonly question: string;
  readonly answer: string;
}

// ---- §7 10 个主推轻改项目 ----
export const teslaFeaturedProjects: readonly TeslaProject[] = [
  {
    key: "tesla-featured-paint-ppf",
    name: "车衣",
    category: "paint_protection",
    priority: "featured",
    order: 1,
    summary: "漆面保护、抗日常划痕、提升新车保护感",
    publicPath: "/images/products/tesla/generated/paint-protection-film.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
  },
  {
    key: "tesla-featured-window-film",
    name: "隔热膜",
    category: "film_style",
    priority: "featured",
    order: 2,
    summary: "隔热、防晒、隐私、驾乘舒适",
    publicPath: "/images/products/tesla/generated/window-film.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
  },
  {
    key: "tesla-featured-color-film",
    name: "改色膜",
    category: "film_style",
    priority: "featured",
    order: 3,
    summary: "个性化颜色、可逆改色、视觉焕新",
    publicPath: "/images/products/tesla/generated/color-change-film.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
  },
  {
    key: "tesla-featured-floor-mat",
    name: "360软包脚垫",
    category: "cabin_comfort",
    priority: "featured",
    order: 4,
    summary: "地毯保护、易清洁、座舱完整感",
    publicPath: "/images/products/tesla/generated/soft-floor-mats.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
  },
  {
    key: "tesla-featured-skid-plate",
    name: "底盘护板",
    category: "chassis_protection",
    priority: "featured",
    order: 5,
    summary: "应对路面剐蹭、碎石和底部防护",
    publicPath: "/images/products/tesla/generated/underbody-skid-plate.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
  },
  {
    key: "tesla-featured-ambient-light",
    name: "氛围灯",
    category: "cabin_comfort",
    priority: "featured",
    order: 6,
    summary: "夜间座舱氛围、个性化体验",
    publicPath: "/images/products/tesla/generated/ambient-light.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
  },
  {
    key: "tesla-featured-ventilated-seat",
    name: "通风座椅",
    category: "cabin_comfort",
    priority: "featured",
    order: 7,
    summary: "夏季乘坐舒适、长途体验提升",
    publicPath: "/images/products/tesla/generated/ventilated-seat.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
  },
  {
    key: "tesla-featured-electric-door-handle",
    name: "电动门把手",
    category: "electric_convenience",
    priority: "featured",
    order: 8,
    summary: "上下车便利、科技感升级",
    publicPath: "/images/products/tesla/generated/electric-door-handle.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
  },
  {
    key: "tesla-featured-electric-front-hood",
    name: "电动前机盖",
    category: "electric_convenience",
    priority: "featured",
    order: 9,
    summary: "前备箱开启更便利",
    publicPath: "/images/products/tesla/generated/electric-frunk.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
  },
  {
    key: "tesla-featured-electric-sunshade",
    name: "电动遮阳帘",
    category: "cabin_comfort",
    priority: "featured",
    order: 10,
    summary: "后排/天幕遮阳、提升乘坐舒适",
    publicPath: "/images/products/tesla/generated/electric-sunshade.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
  },
] as const;

// ---- §9.1 32 个更多可选项目 ----
export const teslaOptionalProjects: readonly TeslaProject[] = [
  {
    key: "tesla-optional-integrated-dashboard",
    name: "Model X/S 同款一体仪表",
    category: "infotainment",
    priority: "optional",
    order: 11,
    summary: "Model S/X 同款仪表视觉与信息布局",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-s-style-steering",
    name: "Model S/X 同款方向盘",
    category: "cabin_comfort",
    priority: "optional",
    order: 12,
    summary: "Model S/X 同款方向盘握感与造型",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-sound-system",
    name: "音响系统 / B2 中置音响",
    category: "infotainment",
    priority: "optional",
    order: 13,
    summary: "音响系统升级、B2 中置音响",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-aluminum-skid-plate",
    name: "铝合金前/后护板",
    category: "chassis_protection",
    priority: "optional",
    order: 14,
    summary: "底盘防护升级",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-d-steering",
    name: "D形运动方向盘",
    category: "cabin_comfort",
    priority: "optional",
    order: 15,
    summary: "运动风格方向盘",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-screen-rotate-mount",
    name: "屏幕旋转支架",
    category: "infotainment",
    priority: "optional",
    order: 16,
    summary: "中控屏幕旋转支架",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-yoke-steering",
    name: "YOKE方向盘",
    category: "cabin_comfort",
    priority: "optional",
    order: 17,
    summary: "YOKE 造型方向盘",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-carbon-rear-wing",
    name: "真碳纤维尾翼",
    category: "exterior_parts",
    priority: "optional",
    order: 18,
    summary: "外观套件",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-smart-suction-lock",
    name: "智能电吸锁",
    category: "electric_convenience",
    priority: "optional",
    order: 19,
    summary: "电动便利",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-car-fridge",
    name: "车载冰箱",
    category: "storage_accessory",
    priority: "optional",
    order: 20,
    summary: "储物便利",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-armrest-box",
    name: "车载扶手箱",
    category: "storage_accessory",
    priority: "optional",
    order: 21,
    summary: "储物便利",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-stream-mirror",
    name: "流媒体后视镜",
    category: "infotainment",
    priority: "optional",
    order: 22,
    summary: "智能影音",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-tail-light",
    name: "尾灯",
    category: "exterior_parts",
    priority: "optional",
    order: 23,
    summary: "外观灯光",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-smart-power-door",
    name: "智动门",
    category: "electric_convenience",
    priority: "optional",
    order: 24,
    summary: "电动便利",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-rear-table",
    name: "后排小桌板",
    category: "storage_accessory",
    priority: "optional",
    order: 25,
    summary: "后排便利",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-electric-tailgate",
    name: "电动尾门",
    category: "electric_convenience",
    priority: "optional",
    order: 26,
    summary: "电动便利",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-carbon-kit",
    name: "碳纤纹套件",
    category: "exterior_parts",
    priority: "optional",
    order: 27,
    summary: "外观套件",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-pilot-light",
    name: "领航灯",
    category: "exterior_parts",
    priority: "optional",
    order: 28,
    summary: "外观灯光",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-carbon-interior",
    name: "真碳纤维内饰",
    category: "cabin_comfort",
    priority: "optional",
    order: 29,
    summary: "座舱升级",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-mini-dashboard",
    name: "MINI智能仪表",
    category: "infotainment",
    priority: "optional",
    order: 30,
    summary: "智能影音",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-smart-dashboard",
    name: "智能仪表",
    category: "infotainment",
    priority: "optional",
    order: 31,
    summary: "智能影音",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-rear-entertainment",
    name: "后排娱乐屏",
    category: "infotainment",
    priority: "optional",
    order: 32,
    summary: "后排娱乐",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-leather-seat",
    name: "全包真皮座椅",
    category: "cabin_comfort",
    priority: "optional",
    order: 33,
    summary: "座椅升级",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-electric-leg-rest",
    name: "电动腿托",
    category: "cabin_comfort",
    priority: "optional",
    order: 34,
    summary: "后排舒适",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-rear-seat-extend",
    name: "后排座椅加长",
    category: "cabin_comfort",
    priority: "optional",
    order: 35,
    summary: "后排舒适",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-smart-suction-door",
    name: "智能电吸门",
    category: "electric_convenience",
    priority: "optional",
    order: 36,
    summary: "电动便利",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-eight-way-headrest",
    name: "八向头枕",
    category: "cabin_comfort",
    priority: "optional",
    order: 37,
    summary: "座椅舒适",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-wheel-hub-cap",
    name: "轮毂盖",
    category: "exterior_parts",
    priority: "optional",
    order: 38,
    summary: "外观配件",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-storage-box",
    name: "储物盒系列",
    category: "storage_accessory",
    priority: "optional",
    order: 39,
    summary: "储物便利",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-protective-mat",
    name: "防护垫系列",
    category: "storage_accessory",
    priority: "optional",
    order: 40,
    summary: "防护配件",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-suede-protection",
    name: "绒面防护系列",
    category: "storage_accessory",
    priority: "optional",
    order: 41,
    summary: "防护配件",
    imageStatus: "pending-review",
  },
  {
    key: "tesla-optional-filter-mesh",
    name: "过滤网系列",
    category: "storage_accessory",
    priority: "optional",
    order: 42,
    summary: "防护/养护",
    imageStatus: "pending-review",
  },
] as const;

// ---- §8 6 场景分类 ----
export const teslaScenarios: readonly TeslaScenario[] = [
  {
    key: "scenario-new-car-protection",
    name: "新车保护",
    description: "适合新车基础防护与原车状态保留",
    projectKeys: [
      "tesla-featured-paint-ppf",
      "tesla-featured-window-film",
      "tesla-featured-floor-mat",
      "tesla-featured-skid-plate",
    ],
  },
  {
    key: "scenario-exterior-refresh",
    name: "外观焕新",
    description: "强化视觉辨识度与个性化外观表达",
    projectKeys: [
      "tesla-featured-color-film",
      "tesla-optional-carbon-rear-wing",
      "tesla-optional-carbon-kit",
      "tesla-optional-tail-light",
      "tesla-optional-pilot-light",
      "tesla-optional-wheel-hub-cap",
    ],
  },
  {
    key: "scenario-cabin-comfort",
    name: "座舱舒适",
    description: "提升座舱乘坐舒适与豪华感",
    projectKeys: [
      "tesla-featured-ventilated-seat",
      "tesla-featured-electric-sunshade",
      "tesla-featured-ambient-light",
      "tesla-optional-leather-seat",
      "tesla-optional-electric-leg-rest",
      "tesla-optional-eight-way-headrest",
      "tesla-optional-rear-seat-extend",
    ],
  },
  {
    key: "scenario-infotainment",
    name: "智能影音",
    description: "驾驶信息可视化与后排娱乐",
    projectKeys: [
      "tesla-optional-integrated-dashboard",
      "tesla-optional-mini-dashboard",
      "tesla-optional-smart-dashboard",
      "tesla-optional-rear-entertainment",
      "tesla-optional-sound-system",
      "tesla-optional-stream-mirror",
    ],
  },
  {
    key: "scenario-electric-convenience",
    name: "电动便利",
    description: "电动化与智能开合带来的日常便利",
    projectKeys: [
      "tesla-featured-electric-door-handle",
      "tesla-featured-electric-front-hood",
      "tesla-optional-electric-tailgate",
      "tesla-optional-smart-suction-lock",
      "tesla-optional-smart-suction-door",
      "tesla-optional-smart-power-door",
    ],
  },
  {
    key: "scenario-storage-accessory",
    name: "储物与小件",
    description: "车内储物组织与小型配件升级",
    projectKeys: [
      "tesla-optional-car-fridge",
      "tesla-optional-armrest-box",
      "tesla-optional-storage-box",
      "tesla-optional-filter-mesh",
    ],
  },
] as const;

// ---- §11 6 步服务流程 ----
export const teslaServiceSteps: readonly TeslaServiceStep[] = [
  {
    step: 1,
    title: "车型确认",
    description: "确认 Model、年份、版本和配置差异",
  },
  {
    step: 2,
    title: "项目选择",
    description: "根据用车场景选择保护、舒适或电动便利项目",
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

// ---- §12 5 条 FAQ ----
export const teslaFaq: readonly TeslaFaqItem[] = [
  {
    question: "是否所有 Tesla 车型都能安装？",
    answer: "不同年份和配置不同，需到店确认",
  },
  {
    question: "新车最推荐先做哪些项目？",
    answer: "车衣、隔热膜、脚垫、底盘护板等基础保护项目",
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

// ---- 类别中文名映射 (供 UI 显示) ----
export const TESLA_CATEGORY_LABELS: Readonly<Record<TeslaProjectCategory, string>> = {
  paint_protection: "车身保护",
  film_style: "玻璃/改色膜",
  chassis_protection: "底盘防护",
  cabin_comfort: "座舱舒适",
  electric_convenience: "电动便利",
  infotainment: "智能影音",
  exterior_parts: "外观件",
  storage_accessory: "储物与小件",
} as const;

// ---- Runtime 断言 (开发期触发) ----
function assertTeslaDataShape(): void {
  if (teslaFeaturedProjects.length !== 10) {
    throw new Error(
      `teslaFeaturedProjects expected 10 items, got ${teslaFeaturedProjects.length}`,
    );
  }
  if (teslaOptionalProjects.length !== 32) {
    throw new Error(
      `teslaOptionalProjects expected 32 items, got ${teslaOptionalProjects.length}`,
    );
  }
  if (teslaScenarios.length !== 6) {
    throw new Error(`teslaScenarios expected 6, got ${teslaScenarios.length}`);
  }
  if (teslaServiceSteps.length !== 6) {
    throw new Error(`teslaServiceSteps expected 6, got ${teslaServiceSteps.length}`);
  }
  if (teslaFaq.length !== 5) {
    throw new Error(`teslaFaq expected 5, got ${teslaFaq.length}`);
  }

  // key 唯一性
  const allKeys = new Set<string>();
  for (const p of [...teslaFeaturedProjects, ...teslaOptionalProjects]) {
    if (allKeys.has(p.key)) {
      throw new Error(`Duplicate project key: ${p.key}`);
    }
    allKeys.add(p.key);
  }
  for (const s of teslaScenarios) {
    if (allKeys.has(s.key)) {
      throw new Error(`Scenario key conflicts with project key: ${s.key}`);
    }
  }

  // order 单调递增 (featured 1-10, optional 11-42)
  for (let i = 0; i < teslaFeaturedProjects.length; i++) {
    if (teslaFeaturedProjects[i].order !== i + 1) {
      throw new Error(
        `Featured project ${i} order expected ${i + 1}, got ${teslaFeaturedProjects[i].order}`,
      );
    }
  }
  for (let i = 0; i < teslaOptionalProjects.length; i++) {
    if (teslaOptionalProjects[i].order !== i + 11) {
      throw new Error(
        `Optional project ${i} order expected ${i + 11}, got ${teslaOptionalProjects[i].order}`,
      );
    }
  }

  // scenario.projectKeys 引用存在的 project key
  for (const s of teslaScenarios) {
    for (const pk of s.projectKeys) {
      if (!allKeys.has(pk)) {
        throw new Error(`Scenario ${s.key} references missing project key: ${pk}`);
      }
    }
  }

  // 类别中文名映射完整性
  const allCategories: readonly TeslaProjectCategory[] = [
    "paint_protection",
    "film_style",
    "chassis_protection",
    "cabin_comfort",
    "electric_convenience",
    "infotainment",
    "exterior_parts",
    "storage_accessory",
  ];
  for (const c of allCategories) {
    if (!TESLA_CATEGORY_LABELS[c]) {
      throw new Error(`Missing label for category: ${c}`);
    }
  }
}

assertTeslaDataShape();
