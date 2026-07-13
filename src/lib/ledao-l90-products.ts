/**
 * 乐道 L90 单车型轻改项目 — 数据层
 *
 * 数据来源 PRD：
 *   docs/PRD/product/LEDAO_L90_TOPIC_PRD_2026-06-24.md
 *
 * 节号映射：
 *   §7.1 21 个海报项目      → ledaoL90UpgradeProjects  (length === 21)
 *   §9   17 个"更多选择"    → ledaoL90MoreChoices       (length === 17)
 *   §8   5 大场景           → ledaoL90Scenarios        (length === 5)
 *   §11  6 步服务流程        → ledaoL90ServiceSteps     (length === 6)
 *   §12  6 条 FAQ           → ledaoL90Faq              (length === 6)
 *
 * 字段值零变更 —— 直接从 PRD §7-§12 抄写。一期允许 imageStatus = "pending-review"
 * (业务后续补图)。
 */

// ---- 类型定义 ----

export type LedaoL90Category =
  | "paint_protection" // 车身保护
  | "film_style" // 玻璃膜
  | "interior_protection" // 座舱保护
  | "chassis_protection" // 底盘防护
  | "exterior_parts" // 外观套件
  | "infotainment" // 智能影音
  | "cabin_comfort" // 座舱舒适
  | "handling" // 底盘/操控
  | "rear_cabin" // 后排/尾箱便利
  | "exterior_style" // 外观升级
  | "outdoor_accessory"; // 车顶/户外

export type LedaoL90ImageStatus =
  | "matched"
  | "product-preview"
  | "pending-review"
  | "missing";

export interface LedaoL90ProductImage {
  readonly publicPath: string | null;
  readonly alt: string;
  readonly width: 1448 | null;
  readonly height: 1086 | null;
  readonly aspectRatio: "4/3" | null;
}

export interface LedaoL90UpgradeProject {
  /** 稳定 slug, 例 "ledao-l90-ppf" / "ledao-l90-aluminum-floor" */
  readonly id: string;
  /** 1-21 (按海报顺序) */
  readonly order: number;
  /** 项目名称 */
  readonly name: string;
  readonly category: LedaoL90Category;
  /** 一句话价值说明 */
  readonly summary: string;
  /** 适合人群 */
  readonly suitableFor: readonly string[];
  /** 注意事项 (可选) */
  readonly caution?: string;
  readonly imageStatus: LedaoL90ImageStatus;
  readonly image: LedaoL90ProductImage;
  readonly sourceArea: "poster_project_matrix";
}

/** "更多选择"轻量结构 —— 无 imageStatus / suitableFor / caution */
export interface LedaoL90MoreChoice {
  readonly id: string;
  readonly name: string;
  readonly category: LedaoL90Category;
}

export interface LedaoL90Scenario {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** 引用的 project id (可来自 projects 或 more choices) */
  readonly projectIds: readonly string[];
}

export interface LedaoL90ServiceStep {
  readonly order: number; // 1-6
  readonly title: string;
  readonly description: string;
}

export interface LedaoL90FaqItem {
  readonly question: string;
  readonly answer: string;
}

const GENERATED_IMAGE_BASE = "/images/products/ledao-l90/generated";

function generatedImage(
  fileName: string,
  displayName: string,
): LedaoL90ProductImage {
  return {
    publicPath: `${GENERATED_IMAGE_BASE}/${fileName}`,
    alt: `乐道 L90 ${displayName} 效果预览图`,
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  };
}

export const LEDAO_L90_HERO_IMAGE: LedaoL90ProductImage = generatedImage(
  "ledao-l90-ppf.webp",
  "主视觉",
);

// ---- §7.1 21 个海报项目 (按海报顺序) ----
export const ledaoL90UpgradeProjects: readonly LedaoL90UpgradeProject[] = [
  {
    id: "ledao-l90-ppf",
    order: 1,
    name: "车衣",
    category: "paint_protection",
    summary: "漆面保护、抗日常划痕、新车保护感",
    suitableFor: ["新车用户", "关注漆面长期保持的车主"],
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-ppf.webp", "车衣"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-window-film",
    order: 2,
    name: "隔热膜",
    category: "film_style",
    summary: "隔热、防晒、隐私、驾乘舒适",
    suitableFor: ["南方用车", "重视车内舒适的车主"],
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-window-film.webp", "隔热膜"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-paint-art",
    order: 3,
    name: "彩绘",
    category: "exterior_parts",
    summary: "个性化图案表达、车身视觉差异化",
    suitableFor: ["追求个性化外观的车主"],
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-paint-art.webp", "彩绘"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-duotone-film",
    order: 4,
    name: "双拼改色",
    category: "exterior_parts",
    summary: "双拼视觉、车身层次和个性化升级",
    suitableFor: ["商务用户", "追求外观质感的车主"],
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-duotone-film.webp", "双拼改色"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-floating-roof",
    order: 5,
    name: "悬浮顶",
    category: "exterior_style",
    summary: "车顶视觉分层，强化整车高级感",
    suitableFor: ["追求个性化外观的车主"],
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-floating-roof.webp", "悬浮顶"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-aluminum-floor",
    order: 6,
    name: "铝地板",
    category: "rear_cabin",
    summary: "易清洁、耐用，提升座舱/尾箱质感",
    suitableFor: ["MPV 用户", "家庭用户"],
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-aluminum-floor.webp", "铝地板"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-balance-bar",
    order: 7,
    name: "平衡杆",
    category: "handling",
    summary: "提升车身支撑和驾驶稳定感",
    suitableFor: ["关注驾驶稳定感的车主"],
    caution: "需到店评估",
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-balance-bar.webp", "平衡杆"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-tray-table",
    order: 8,
    name: "小桌板",
    category: "rear_cabin",
    summary: "后排办公、用餐、儿童使用场景",
    suitableFor: ["家庭用户", "商务用户"],
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-tray-table.webp", "小桌板"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-body-kit",
    order: 9,
    name: "运动包围",
    category: "exterior_parts",
    summary: "强化外观运动感和整车辨识度",
    suitableFor: ["追求运动外观的车主"],
    caution: "需确认版本适配",
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-body-kit.webp", "运动包围"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-floor-mats",
    order: 10,
    name: "360脚垫",
    category: "interior_protection",
    summary: "地毯保护、易清洁、座舱完整感",
    suitableFor: ["日常通勤用户", "家中有小孩的车主"],
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-floor-mats.webp", "360脚垫"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-leg-rest",
    order: 11,
    name: "腿托",
    category: "rear_cabin",
    summary: "长途乘坐舒适、后排体验提升",
    suitableFor: ["家庭用户", "长途出行用户"],
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-leg-rest.webp", "腿托"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-trunk-mat",
    order: 12,
    name: "尾箱垫",
    category: "rear_cabin",
    summary: "尾箱防刮、防污、易清洁",
    suitableFor: ["家庭用户", "户外出行用户"],
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-trunk-mat.webp", "尾箱垫"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-hud",
    order: 13,
    name: "抬头显示",
    category: "infotainment",
    summary: "行车信息显示便利，提升驾驶体验",
    suitableFor: ["关注科技便利的车主"],
    caution: "需确认安装位",
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-hud.webp", "抬头显示"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-skid-plate",
    order: 14,
    name: "底盘护板",
    category: "chassis_protection",
    summary: "应对路面剐蹭、碎石和底部防护",
    suitableFor: ["新车用户", "路况复杂用车环境"],
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-skid-plate.webp", "底盘护板"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-wheels",
    order: 15,
    name: "轮毂",
    category: "exterior_style",
    summary: "视觉升级、运动感强化",
    suitableFor: ["追求外观运动感的车主"],
    caution: "需确认尺寸适配",
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-wheels.webp", "轮毂"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-mudguard",
    order: 16,
    name: "挡泥板",
    category: "chassis_protection",
    summary: "减少泥水飞溅和车身侧面污染",
    suitableFor: ["雨季/泥泞路况用车"],
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-mudguard.webp", "挡泥板"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-bug-screen",
    order: 17,
    name: "防虫网",
    category: "chassis_protection",
    summary: "减少虫石杂物进入关键散热/进风区域",
    suitableFor: ["夏季/多虫区域用车"],
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-bug-screen.webp", "防虫网"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-tempered-film",
    order: 18,
    name: "钢化膜",
    category: "infotainment",
    summary: "中控/娱乐屏幕防刮保护",
    suitableFor: ["关注屏幕长期清晰度的车主"],
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-tempered-film.webp", "钢化膜"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-door-sill",
    order: 19,
    name: "门槛条",
    category: "interior_protection",
    summary: "上下车高频区域防刮、防踩踏磨损",
    suitableFor: ["高频上下车的车主"],
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-door-sill.webp", "门槛条"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-brake-calipers",
    order: 20,
    name: "刹车卡钳",
    category: "exterior_style",
    summary: "强化轮毂区域视觉运动感",
    suitableFor: ["追求运动外观的车主"],
    caution: "需确认尺寸适配",
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-brake-calipers.webp", "刹车卡钳"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "ledao-l90-interior-coating",
    order: 21,
    name: "内饰镀膜",
    category: "cabin_comfort",
    summary: "内饰表面防污、易清洁、保持质感",
    suitableFor: ["注重内饰清洁的车主"],
    imageStatus: "product-preview",
    image: generatedImage("ledao-l90-interior-coating.webp", "内饰镀膜"),
    sourceArea: "poster_project_matrix",
  },
] as const satisfies readonly LedaoL90UpgradeProject[];

// ---- §9 17 个"更多选择"(已去重) ----
export const ledaoL90MoreChoices: readonly LedaoL90MoreChoice[] = [
  {
    id: "ledao-l90-hud-opt",
    name: "HUD抬头显示器",
    category: "infotainment",
  },
  {
    id: "ledao-l90-star-film",
    name: "星空膜",
    category: "film_style",
  },
  {
    id: "ledao-l90-door-seal",
    name: "四门隔音",
    category: "cabin_comfort",
  },
  {
    id: "ledao-l90-rear-entertainment",
    name: "后排娱乐电视",
    category: "infotainment",
  },
  {
    id: "ledao-l90-spoiler",
    name: "运动尾翼",
    category: "exterior_parts",
  },
  {
    id: "ledao-l90-hood",
    name: "发动机盖",
    category: "exterior_parts",
  },
  {
    id: "ledao-l90-mudguard-liner",
    name: "挡泥板内衬",
    category: "chassis_protection",
  },
  {
    id: "ledao-l90-ambient-light",
    name: "氛围灯",
    category: "cabin_comfort",
  },
  {
    id: "ledao-l90-rearview-mirror",
    name: "流媒体后视镜",
    category: "infotainment",
  },
  {
    id: "ledao-l90-license-frame",
    name: "牌照框",
    category: "exterior_parts",
  },
  {
    id: "ledao-l90-power-door",
    name: "电动门",
    category: "rear_cabin",
  },
  {
    id: "ledao-l90-door-seal-strip",
    name: "四门密封条",
    category: "cabin_comfort",
  },
  {
    id: "ledao-l90-color-change",
    name: "改色膜",
    category: "exterior_parts",
  },
  {
    id: "ledao-l90-roof-platform",
    name: "车顶平台套件",
    category: "outdoor_accessory",
  },
  {
    id: "ledao-l90-interior-silicone",
    name: "内饰硅胶件",
    category: "interior_protection",
  },
  {
    id: "ledao-l90-star-ceiling",
    name: "星空顶",
    category: "cabin_comfort",
  },
  {
    id: "ledao-l90-rotating-seat",
    name: "旋转座椅",
    category: "rear_cabin",
  },
] as const satisfies readonly LedaoL90MoreChoice[];

// ---- §8 5 大场景 ----
export const ledaoL90Scenarios: readonly LedaoL90Scenario[] = [
  {
    id: "new-car-protection",
    name: "新车保护",
    description: "适合刚提车用户,优先解决保护和日常使用问题",
    projectIds: [
      "ledao-l90-ppf",
      "ledao-l90-window-film",
      "ledao-l90-floor-mats",
      "ledao-l90-skid-plate",
      "ledao-l90-door-sill",
      "ledao-l90-tempered-film",
      "ledao-l90-interior-coating",
    ],
  },
  {
    id: "appearance-style",
    name: "外观个性",
    description: "强化视觉辨识度和车身风格",
    projectIds: [
      "ledao-l90-paint-art",
      "ledao-l90-duotone-film",
      "ledao-l90-floating-roof",
      "ledao-l90-body-kit",
      "ledao-l90-wheels",
      "ledao-l90-brake-calipers",
    ],
  },
  {
    id: "cabin-care",
    name: "座舱防护",
    description: "后排空间利用、尾箱防护和家庭出行便利",
    projectIds: [
      "ledao-l90-aluminum-floor",
      "ledao-l90-tray-table",
      "ledao-l90-leg-rest",
      "ledao-l90-trunk-mat",
      "ledao-l90-floor-mats",
    ],
  },
  {
    id: "chassis-driving",
    name: "底盘与行车防护",
    description: "关注底盘、车身支撑和户外行车环境",
    projectIds: [
      "ledao-l90-balance-bar",
      "ledao-l90-skid-plate",
      "ledao-l90-mudguard",
      "ledao-l90-bug-screen",
    ],
  },
  {
    id: "premium-quality",
    name: "高端质感",
    description: "铝地板、轮毂、屏幕与内饰细节提升整车质感",
    projectIds: [
      "ledao-l90-aluminum-floor",
      "ledao-l90-wheels",
      "ledao-l90-body-kit",
      "ledao-l90-hud",
      "ledao-l90-interior-coating",
    ],
  },
] as const satisfies readonly LedaoL90Scenario[];

// ---- §11 6 步服务流程 ----
export const ledaoL90ServiceSteps: readonly LedaoL90ServiceStep[] = [
  {
    order: 1,
    title: "车型确认",
    description: "确认乐道 L90 的批次、版本和配置差异",
  },
  {
    order: 2,
    title: "项目选择",
    description: "根据新车保护、外观个性、家庭后排或行车防护选择项目",
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
] as const satisfies readonly LedaoL90ServiceStep[];

// ---- §12 6 条 FAQ ----
export const ledaoL90Faq: readonly LedaoL90FaqItem[] = [
  {
    question: "是否所有乐道 L90 都能安装?",
    answer: "不同批次和配置可能不同,需到店确认。",
  },
  {
    question: "新车最推荐先做哪些项目?",
    answer: "车衣、隔热膜、360脚垫、底盘护板、门槛条、内饰保护等。",
  },
  {
    question: "家庭用户最常关注哪些项目?",
    answer: "铝地板、小桌板、腿托、尾箱垫和后排娱乐电视。",
  },
  {
    question: "可以只做单个项目吗?",
    answer: "可以,页面只是组合参考。",
  },
  {
    question: "是否影响原车质保?",
    answer: "不做承诺,以车主车辆情况和项目评估为准。",
  },
  {
    question: "工期多久?",
    answer: "根据项目组合和施工排期确认。",
  },
] as const satisfies readonly LedaoL90FaqItem[];

// ---- 11 类别中文名映射 (供 UI 显示) ----
export const LEDAO_L90_CATEGORY_LABELS: Readonly<Record<LedaoL90Category, string>> = {
  paint_protection: "车身保护",
  film_style: "玻璃膜",
  interior_protection: "座舱保护",
  chassis_protection: "底盘防护",
  exterior_parts: "外观套件",
  infotainment: "智能影音",
  cabin_comfort: "座舱舒适",
  handling: "底盘/操控",
  rear_cabin: "后排/尾箱便利",
  exterior_style: "外观升级",
  outdoor_accessory: "车顶/户外",
} as const;

// ---- Runtime 断言 (开发期触发) ----
function assertLedaoL90DataShape(): void {
  if (ledaoL90UpgradeProjects.length !== 21) {
    throw new Error(
      `ledaoL90UpgradeProjects expected 21 items, got ${ledaoL90UpgradeProjects.length}`,
    );
  }
  if (ledaoL90MoreChoices.length !== 17) {
    throw new Error(
      `ledaoL90MoreChoices expected 17 items, got ${ledaoL90MoreChoices.length}`,
    );
  }
  if (ledaoL90Scenarios.length !== 5) {
    throw new Error(`ledaoL90Scenarios expected 5, got ${ledaoL90Scenarios.length}`);
  }
  if (ledaoL90ServiceSteps.length !== 6) {
    throw new Error(
      `ledaoL90ServiceSteps expected 6, got ${ledaoL90ServiceSteps.length}`,
    );
  }
  if (ledaoL90Faq.length !== 6) {
    throw new Error(`ledaoL90Faq expected 6, got ${ledaoL90Faq.length}`);
  }

  // key 唯一性 (project ids + more choice ids + scenario ids)
  const allKeys = new Set<string>();
  for (const p of ledaoL90UpgradeProjects) {
    if (allKeys.has(p.id)) throw new Error(`Duplicate project id: ${p.id}`);
    allKeys.add(p.id);
  }
  for (const c of ledaoL90MoreChoices) {
    if (allKeys.has(c.id)) throw new Error(`Duplicate more choice id: ${c.id}`);
    allKeys.add(c.id);
  }
  for (const s of ledaoL90Scenarios) {
    if (allKeys.has(s.id)) {
      throw new Error(`Scenario id conflicts with existing id: ${s.id}`);
    }
    allKeys.add(s.id);
  }

  // order 单调递增 1-21
  ledaoL90UpgradeProjects.forEach((p, i) => {
    if (p.order !== i + 1) {
      throw new Error(`Project ${i} order expected ${i + 1}, got ${p.order}`);
    }
  });

  // service steps 连续 1-6
  ledaoL90ServiceSteps.forEach((s, i) => {
    if (s.order !== i + 1) {
      throw new Error(
        `Service step ${i} expected order ${i + 1}, got ${s.order}`,
      );
    }
  });

  // 收集所有有效 ID (project + more choice)
  const validIds = new Set<string>();
  for (const p of ledaoL90UpgradeProjects) validIds.add(p.id);
  for (const c of ledaoL90MoreChoices) validIds.add(c.id);

  // scenario.projectIds 引用存在的 id (projects + more choices)
  for (const s of ledaoL90Scenarios) {
    for (const pid of s.projectIds) {
      if (!validIds.has(pid)) {
        throw new Error(`Scenario ${s.id} references missing id: ${pid}`);
      }
    }
  }

  // 每个 main project 至少被一个 scenario 引用
  const referencedIds = new Set<string>();
  for (const s of ledaoL90Scenarios)
    for (const pid of s.projectIds) referencedIds.add(pid);
  for (const p of ledaoL90UpgradeProjects) {
    if (!referencedIds.has(p.id)) {
      throw new Error(`Project ${p.id} not referenced by any scenario`);
    }
  }

  // 11 个类别都有中文标签
  const allCategories: readonly LedaoL90Category[] = [
    "paint_protection",
    "film_style",
    "interior_protection",
    "chassis_protection",
    "exterior_parts",
    "infotainment",
    "cabin_comfort",
    "handling",
    "rear_cabin",
    "exterior_style",
    "outdoor_accessory",
  ];
  for (const c of allCategories) {
    if (!LEDAO_L90_CATEGORY_LABELS[c]) {
      throw new Error(`Missing label for category: ${c}`);
    }
  }
}

assertLedaoL90DataShape();
