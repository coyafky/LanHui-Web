/**
 * 高山 8 单车型轻改项目 — 数据层
 *
 * 数据来源 PRD：
 *   docs/PRD/product/GAOSHAN_8_TOPIC_PRD_2026-06-25.md
 *
 * 节号映射：
 *   §7.1 23 个海报项目       → gaoshan8UpgradeProjects  (length === 23)
 *   §8   7 大场景            → gaoshan8Scenarios         (length === 7)
 *   §12  7 步服务流程         → gaoshan8ServiceSteps      (length === 7)
 *   §13  9 条 FAQ            → gaoshan8Faq               (length === 9)
 *
 * 项目字段来自 PRD §7-§13，图片使用 product-preview 图例（非真实施工图）。
 *
 * 与 Denza D9 / Ledao L90 的关键差异：
 *   - 新增 projectType 字段: standard | lighting | electric | kit
 *   - 8 个类别 (非 10/11)
 *   - 无 MoreChoices / 无 Bundles
 */

// ---- 类型定义 ----

export type Gaoshan8Category =
  | "protection"           // 新车保护
  | "business_appearance"  // 商务外观
  | "appearance"           // 外观个性
  | "mpv_comfort"          // MPV 后排舒适
  | "chassis"              // 底盘与行车防护
  | "lighting"             // 灯光氛围
  | "screen_care"          // 智能与屏幕保护
  | "interior_care";       // 座舱维护

export type Gaoshan8ProjectType = "standard" | "lighting" | "electric" | "kit";
export type Gaoshan8ImageStatus =
  | "matched"
  | "product-preview"
  | "pending-review"
  | "missing";

export interface Gaoshan8ProductImage {
  readonly publicPath: string | null;
  readonly alt: string;
  readonly width: 1448 | null;
  readonly height: 1086 | null;
  readonly aspectRatio: "4/3" | null;
}

export interface Gaoshan8UpgradeProject {
  /** 稳定 slug, 例 "gaoshan-8-ppf" / "gaoshan-8-power-step" */
  readonly id: string;
  /** 1-23 (按海报顺序) */
  readonly order: number;
  /** 项目名称 */
  readonly name: string;
  readonly category: Gaoshan8Category;
  readonly projectType: Gaoshan8ProjectType;
  /** 一句话价值说明 */
  readonly summary: string;
  /** 适合人群 */
  readonly suitableFor: readonly string[];
  /** 注意事项 (可选) */
  readonly caution?: string;
  readonly imageStatus: Gaoshan8ImageStatus;
  readonly image: Gaoshan8ProductImage;
  readonly sourceArea: "poster_project_matrix";
}

export interface Gaoshan8Scenario {
  readonly key: string;
  readonly name: string;
  readonly description: string;
  /** 引用的 project id */
  readonly projectIds: readonly string[];
}

export interface Gaoshan8ServiceStep {
  readonly step: number; // 1-7
  readonly title: string;
  readonly description: string;
}

export interface Gaoshan8FaqItem {
  readonly question: string;
  readonly answer: string;
}

const GENERATED_IMAGE_BASE = "/images/products/gaoshan-8/generated";

function generatedImage(fileName: string, displayName: string): Gaoshan8ProductImage {
  return {
    publicPath: `${GENERATED_IMAGE_BASE}/${fileName}`,
    alt: `高山 8 ${displayName} 效果预览图`,
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  };
}

export const GAOSHAN_8_HERO_IMAGE: Gaoshan8ProductImage = generatedImage(
  "hero.webp",
  "主视觉",
);

// ---- §7.1 23 个海报项目 (按海报顺序) ----
export const gaoshan8UpgradeProjects: readonly Gaoshan8UpgradeProject[] = [
  {
    id: "gaoshan-8-ppf",
    order: 1,
    name: "车衣",
    category: "protection",
    projectType: "standard",
    summary: "漆面保护、日常轻微划痕防护、新车质感保持",
    suitableFor: ["新车用户", "关注漆面长期保持的车主"],
    imageStatus: "product-preview",
    image: generatedImage("paint-protection-film.webp", "车衣"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-window-film",
    order: 2,
    name: "隔热膜",
    category: "protection",
    projectType: "standard",
    summary: "隔热、防晒、隐私和 MPV 长途乘坐舒适",
    suitableFor: ["南方用车", "MPV 长途用户"],
    imageStatus: "product-preview",
    image: generatedImage("window-film.webp", "隔热膜"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-paint-art",
    order: 3,
    name: "彩绘",
    category: "appearance",
    projectType: "standard",
    summary: "主题化车身视觉表达，适合个性化展示",
    suitableFor: ["追求个性化外观的车主"],
    imageStatus: "product-preview",
    image: generatedImage("custom-wrap-art.webp", "彩绘"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-duotone-film",
    order: 4,
    name: "双拼改色",
    category: "business_appearance",
    projectType: "standard",
    summary: "强化商务 MPV 层次感和高级感",
    suitableFor: ["商务用户", "追求外观质感的车主"],
    imageStatus: "product-preview",
    image: generatedImage("two-tone-wrap.webp", "双拼改色"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-floor-mats",
    order: 5,
    name: "360软包脚垫",
    category: "interior_care",
    projectType: "standard",
    summary: "地毯保护、易清洁、提升座舱完整感",
    suitableFor: ["日常通勤用户", "家中有小孩的车主"],
    imageStatus: "product-preview",
    image: generatedImage("soft-floor-mats.webp", "360软包脚垫"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-aluminum-floor",
    order: 6,
    name: "铝地板",
    category: "mpv_comfort",
    projectType: "standard",
    summary: "后排空间保护、易清洁、提升商务/家庭质感",
    suitableFor: ["MPV 用户", "商务接待场景"],
    imageStatus: "product-preview",
    image: generatedImage("aluminum-flooring.webp", "铝地板"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-balance-bar",
    order: 7,
    name: "平衡杆",
    category: "chassis",
    projectType: "standard",
    summary: "车身支撑和驾驶稳定感，需到店评估",
    suitableFor: ["关注驾驶稳定感的车主"],
    caution: "需到店评估",
    imageStatus: "product-preview",
    image: generatedImage("stabilizer-bar.webp", "平衡杆"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-amxt-bodykit",
    order: 8,
    name: "AMXT包围",
    category: "business_appearance",
    projectType: "kit",
    summary: "强化车身视觉完整度和商务外观气场",
    suitableFor: ["追求商务外观的车主"],
    caution: "需确认版本适配",
    imageStatus: "product-preview",
    image: generatedImage("amxt-body-kit.webp", "AMXT包围"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-bskt-bodykit",
    order: 9,
    name: "BSKT运动包围",
    category: "business_appearance",
    projectType: "kit",
    summary: "强化运动姿态和车身包围视觉",
    suitableFor: ["追求运动外观的车主"],
    caution: "需确认版本适配",
    imageStatus: "product-preview",
    image: generatedImage("bskt-sport-body-kit.webp", "BSKT运动包围"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-power-step",
    order: 10,
    name: "电动踏板",
    category: "mpv_comfort",
    projectType: "electric",
    summary: "上下车便利，适合家庭成员和高频出入场景",
    suitableFor: ["家庭用户", "商务接待场景"],
    caution: "需确认底盘结构和踏板形式",
    imageStatus: "product-preview",
    image: generatedImage("power-step.webp", "电动踏板"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-brake-calipers",
    order: 11,
    name: "刹车卡钳",
    category: "appearance",
    projectType: "standard",
    summary: "强化轮毂区域运动视觉",
    suitableFor: ["追求运动外观的车主"],
    caution: "只表达视觉升级，不承诺制动性能提升",
    imageStatus: "product-preview",
    image: generatedImage("brake-calipers.webp", "刹车卡钳"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-badge-light",
    order: 12,
    name: "车标灯",
    category: "lighting",
    projectType: "lighting",
    summary: "增强车头/车标区域辨识度",
    suitableFor: ["关注外观细节的车主"],
    caution: "需关注合法合规使用场景",
    imageStatus: "product-preview",
    image: generatedImage("badge-light.webp", "车标灯"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-drl",
    order: 13,
    name: "日行灯",
    category: "lighting",
    projectType: "lighting",
    summary: "提升日间视觉识别和外观科技感",
    suitableFor: ["关注外观科技感的车主"],
    caution: "需确认合法合规",
    imageStatus: "product-preview",
    image: generatedImage("daytime-running-lights.webp", "日行灯"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-hud",
    order: 14,
    name: "抬头显示",
    category: "screen_care",
    projectType: "standard",
    summary: "提升驾驶信息可视化和科技感",
    suitableFor: ["关注科技便利的车主"],
    caution: "需确认安装适配",
    imageStatus: "product-preview",
    image: generatedImage("head-up-display.webp", "抬头显示"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-skid-plate",
    order: 15,
    name: "底盘护板",
    category: "chassis",
    projectType: "standard",
    summary: "保护底部关键区域，适合新车基础防护",
    suitableFor: ["新车用户", "路况复杂用车环境"],
    imageStatus: "product-preview",
    image: generatedImage("underbody-skid-plate.webp", "底盘护板"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-sliding-door",
    order: 16,
    name: "中开门",
    category: "mpv_comfort",
    projectType: "electric",
    summary: "提升侧门使用便利和商务接待体验",
    suitableFor: ["商务接待用户", "家庭用户"],
    caution: "需重点确认车型版本、门体结构和安装位适配",
    imageStatus: "product-preview",
    image: generatedImage("sliding-door.webp", "中开门"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-fragrance",
    order: 17,
    name: "香氛系统",
    category: "mpv_comfort",
    projectType: "standard",
    summary: "提升座舱气味体验和精致感",
    suitableFor: ["商务用户", "注重座舱体验的车主"],
    imageStatus: "product-preview",
    image: generatedImage("fragrance-system.webp", "香氛系统"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-mudguard",
    order: 18,
    name: "挡泥板",
    category: "chassis",
    projectType: "standard",
    summary: "减少泥水飞溅和车身侧面污染",
    suitableFor: ["雨季/泥泞路况用车"],
    imageStatus: "product-preview",
    image: generatedImage("mud-flaps.webp", "挡泥板"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-bug-screen",
    order: 19,
    name: "防虫网",
    category: "chassis",
    projectType: "standard",
    summary: "减少虫石杂物进入关键散热/进风区域",
    suitableFor: ["夏季/多虫区域用车"],
    imageStatus: "product-preview",
    image: generatedImage("grille-mesh.webp", "防虫网"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-tempered-film",
    order: 20,
    name: "钢化膜",
    category: "screen_care",
    projectType: "standard",
    summary: "中控/娱乐屏幕防刮保护",
    suitableFor: ["关注屏幕长期清晰度的车主"],
    imageStatus: "product-preview",
    image: generatedImage("screen-protector.webp", "钢化膜"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-step-plate",
    order: 21,
    name: "铝合金迎宾踏板",
    category: "mpv_comfort",
    projectType: "standard",
    summary: "提升上下车区域质感，并减少踩踏磨损",
    suitableFor: ["高频上下车的车主"],
    imageStatus: "product-preview",
    image: generatedImage("aluminum-step-plate.webp", "铝合金迎宾踏板"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-black-kit",
    order: 22,
    name: "黑化81件套",
    category: "business_appearance",
    projectType: "kit",
    summary: "统一车身细节黑化风格，强化商务运动视觉",
    suitableFor: ["追求黑化风格的车主"],
    caution: "以实际套件清单和可施工项目为准",
    imageStatus: "product-preview",
    image: generatedImage("blackout-kit.webp", "黑化81件套"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "gaoshan-8-interior-coating",
    order: 23,
    name: "内饰镀膜",
    category: "interior_care",
    projectType: "standard",
    summary: "内饰表面防污、易清洁、保持质感",
    suitableFor: ["注重内饰清洁的车主"],
    imageStatus: "product-preview",
    image: generatedImage("interior-coating.webp", "内饰镀膜"),
    sourceArea: "poster_project_matrix",
  },
] as const satisfies readonly Gaoshan8UpgradeProject[];

// ---- §8 7 大场景 ----
export const gaoshan8Scenarios: readonly Gaoshan8Scenario[] = [
  {
    key: "scenario-new-car-protection",
    name: "新车保护",
    description: "适合刚提车用户,优先解决保护和日常使用问题",
    projectIds: [
      "gaoshan-8-ppf",
      "gaoshan-8-window-film",
      "gaoshan-8-floor-mats",
      "gaoshan-8-skid-plate",
      "gaoshan-8-tempered-film",
      "gaoshan-8-interior-coating",
    ],
  },
  {
    key: "scenario-business-appearance",
    name: "商务外观",
    description: "强化 MPV 商务气场和外观完整度",
    projectIds: [
      "gaoshan-8-duotone-film",
      "gaoshan-8-amxt-bodykit",
      "gaoshan-8-bskt-bodykit",
      "gaoshan-8-black-kit",
      "gaoshan-8-step-plate",
    ],
  },
  {
    key: "scenario-appearance",
    name: "外观个性",
    description: "强化视觉辨识度和个性表达",
    projectIds: [
      "gaoshan-8-paint-art",
      "gaoshan-8-brake-calipers",
      "gaoshan-8-badge-light",
      "gaoshan-8-drl",
    ],
  },
  {
    key: "scenario-mpv-comfort",
    name: "MPV后排舒适",
    description: "适合家庭、商务接待和高频上下车场景",
    projectIds: [
      "gaoshan-8-aluminum-floor",
      "gaoshan-8-power-step",
      "gaoshan-8-sliding-door",
      "gaoshan-8-fragrance",
      "gaoshan-8-floor-mats",
    ],
  },
  {
    key: "scenario-chassis-protection",
    name: "底盘与行车防护",
    description: "关注底部防护、行车环境和车身侧面清洁",
    projectIds: [
      "gaoshan-8-balance-bar",
      "gaoshan-8-skid-plate",
      "gaoshan-8-bug-screen",
      "gaoshan-8-mudguard",
    ],
  },
  {
    key: "scenario-screen-care",
    name: "智能与屏幕保护",
    description: "保护高频使用屏幕，提升科技体验",
    projectIds: [
      "gaoshan-8-hud",
      "gaoshan-8-tempered-film",
    ],
  },
  {
    key: "scenario-interior-care",
    name: "座舱维护",
    description: "降低高频使用磨损，保持车内质感",
    projectIds: [
      "gaoshan-8-floor-mats",
      "gaoshan-8-aluminum-floor",
      "gaoshan-8-interior-coating",
      "gaoshan-8-step-plate",
    ],
  },
] as const satisfies readonly Gaoshan8Scenario[];

// ---- §12 7 步服务流程 ----
export const gaoshan8ServiceSteps: readonly Gaoshan8ServiceStep[] = [
  {
    step: 1,
    title: "车型确认",
    description: "确认高山8 的年份、批次、版本和配置",
  },
  {
    step: 2,
    title: "项目选择",
    description: "根据保护、商务外观、灯光、电动便利、后排舒适等分类选择项目",
  },
  {
    step: 3,
    title: "到店评估",
    description: "确认安装位、接口、材料、工期和灯光/电动件注意事项",
  },
  {
    step: 4,
    title: "方案确认",
    description: "确认项目组合、施工时间和注意事项",
  },
  {
    step: 5,
    title: "施工安装",
    description: "按项目标准施工，并做好车身和内饰保护",
  },
  {
    step: 6,
    title: "验收交付",
    description: "检查外观、功能和安装细节",
  },
  {
    step: 7,
    title: "售后支持",
    description: "提供使用注意事项和后续维护建议",
  },
] as const satisfies readonly Gaoshan8ServiceStep[];

// ---- §13 9 条 FAQ ----
export const gaoshan8Faq: readonly Gaoshan8FaqItem[] = [
  {
    question: "高山8 的这些项目是否都能安装？",
    answer: "不同年份、版本和配置可能不同，需到店评估确认。",
  },
  {
    question: "新车最推荐先做什么？",
    answer: "车衣、隔热膜、360软包脚垫、底盘护板、钢化膜、内饰镀膜。",
  },
  {
    question: "商务外观项目有哪些？",
    answer: "双拼改色、AMXT包围、BSKT运动包围、黑化81件套、迎宾踏板。",
  },
  {
    question: "灯光类项目有什么注意？",
    answer: "车标灯、日行灯等项目需关注合法合规使用场景。",
  },
  {
    question: "中开门和电动踏板都能安装吗？",
    answer: "需根据车型版本、结构和安装位到店确认。",
  },
  {
    question: "黑化81件套是否固定包含81个部件？",
    answer: "页面只作为海报项目表达，实际套件清单以到店确认和库存为准。",
  },
  {
    question: "可以只做单个项目吗？",
    answer: "可以，页面项目既支持单项了解，也支持组合方案。",
  },
  {
    question: "是否影响原车质保？",
    answer: "不做不影响质保的承诺，具体以车辆情况和项目评估为准。",
  },
  {
    question: "工期多久？",
    answer: "根据项目组合、库存和施工排期确认。",
  },
] as const satisfies readonly Gaoshan8FaqItem[];

// ---- 8 类别中文名映射 (供 UI 显示) ----
export const GAOSHAN_8_CATEGORY_LABELS: Readonly<Record<Gaoshan8Category, string>> = {
  protection: "新车保护",
  business_appearance: "商务外观",
  appearance: "外观个性",
  mpv_comfort: "MPV 舒适",
  chassis: "底盘防护",
  lighting: "灯光氛围",
  screen_care: "屏幕保护",
  interior_care: "座舱维护",
} as const;

// ---- 项目类型中文名映射 (供 UI 显示) ----
export const GAOSHAN_8_PROJECT_TYPE_LABELS: Readonly<Record<Gaoshan8ProjectType, string | null>> = {
  standard: null,
  lighting: "灯光类",
  electric: "电动件",
  kit: "套件类",
} as const;

// ---- Runtime 断言 (开发期触发) ----
function assertGaoshan8DataShape(): void {
  if (gaoshan8UpgradeProjects.length !== 23) {
    throw new Error(
      `gaoshan8UpgradeProjects expected 23 items, got ${gaoshan8UpgradeProjects.length}`,
    );
  }
  if (gaoshan8Scenarios.length !== 7) {
    throw new Error(`gaoshan8Scenarios expected 7, got ${gaoshan8Scenarios.length}`);
  }
  if (gaoshan8ServiceSteps.length !== 7) {
    throw new Error(
      `gaoshan8ServiceSteps expected 7, got ${gaoshan8ServiceSteps.length}`,
    );
  }
  if (gaoshan8Faq.length !== 9) {
    throw new Error(`gaoshan8Faq expected 9, got ${gaoshan8Faq.length}`);
  }

  // key 唯一性 (project ids + scenario keys)
  const allKeys = new Set<string>();
  for (const p of gaoshan8UpgradeProjects) {
    if (allKeys.has(p.id)) throw new Error(`Duplicate project id: ${p.id}`);
    if (p.imageStatus !== "product-preview") {
      throw new Error(`Project ${p.id} expected product-preview image status`);
    }
    if (!p.image.publicPath?.startsWith("/images/products/gaoshan-8/generated/")) {
      throw new Error(`Project ${p.id} missing generated image path`);
    }
    if (p.image.width !== 1448 || p.image.height !== 1086) {
      throw new Error(`Project ${p.id} image spec drift`);
    }
    allKeys.add(p.id);
  }
  for (const s of gaoshan8Scenarios) {
    if (allKeys.has(s.key)) {
      throw new Error(`Scenario key conflicts with project id: ${s.key}`);
    }
    allKeys.add(s.key);
  }

  // order 单调递增 1-23
  gaoshan8UpgradeProjects.forEach((p, i) => {
    if (p.order !== i + 1) {
      throw new Error(`Project ${i} order expected ${i + 1}, got ${p.order}`);
    }
  });

  // service steps 连续 1-7
  gaoshan8ServiceSteps.forEach((s, i) => {
    if (s.step !== i + 1) {
      throw new Error(`Service step ${i} expected step ${i + 1}, got ${s.step}`);
    }
  });

  // scenario.projectIds 引用存在的 project id
  for (const s of gaoshan8Scenarios) {
    for (const pid of s.projectIds) {
      if (!allKeys.has(pid)) {
        throw new Error(`Scenario ${s.key} references missing project id: ${pid}`);
      }
    }
  }

  // 每个 project 至少被一个 scenario 引用
  const referencedIds = new Set<string>();
  for (const s of gaoshan8Scenarios)
    for (const pid of s.projectIds) referencedIds.add(pid);
  for (const p of gaoshan8UpgradeProjects) {
    if (!referencedIds.has(p.id)) {
      throw new Error(`Project ${p.id} not referenced by any scenario`);
    }
  }

  // 8 个类别都有中文标签
  const allCategories: readonly Gaoshan8Category[] = [
    "protection",
    "business_appearance",
    "appearance",
    "mpv_comfort",
    "chassis",
    "lighting",
    "screen_care",
    "interior_care",
  ];
  for (const c of allCategories) {
    if (!GAOSHAN_8_CATEGORY_LABELS[c]) {
      throw new Error(`Missing label for category: ${c}`);
    }
  }
}

assertGaoshan8DataShape();
