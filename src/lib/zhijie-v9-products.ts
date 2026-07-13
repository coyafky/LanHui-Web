/**
 * 智界 V9 单车型轻改项目 — 数据层
 *
 * 数据来源 PRD：
 *   docs/PRD/product/ZHIJIE_V9_TOPIC_PRD_2026-06-25.md
 *
 * 节号映射：
 *   §7  14 个海报项目       → zhijieV9UpgradeProjects  (length === 14)
 *   §8  5 大场景           → zhijieV9Scenarios        (length === 5)
 *   §9  4 大组合           → zhijieV9Bundles          (length === 4)
 *   §12 6 步服务流程        → zhijieV9ServiceSteps     (length === 6)
 *   §13 6 条 FAQ           → zhijieV9Faq              (length === 6)
 */

export type ZhijieV9Category =
  | "protection" // 新车保护
  | "appearance" // 外观个性
  | "cabin_care" // 座舱与后排保护
  | "chassis" // 底盘与行车防护
  | "screen_care" // 屏幕与显示保护
  | "exterior_detail"; // 外观细节

export type ZhijieV9ImageStatus =
  | "matched"
  | "product-preview"
  | "pending-review"
  | "missing";

export interface ZhijieV9ProductImage {
  readonly publicPath: string | null;
  readonly alt: string;
  readonly width: 1448 | null;
  readonly height: 1086 | null;
  readonly aspectRatio: "4/3" | null;
}

export interface ZhijieV9UpgradeProject {
  /** 稳定 slug, 例 "zhijie-v9-ppf" / "zhijie-v9-floor-mats" */
  readonly id: string;
  /** 1-14 (按海报顺序) */
  readonly order: number;
  /** 项目名称 */
  readonly name: string;
  readonly category: ZhijieV9Category;
  /** 一句话价值说明 */
  readonly summary: string;
  /** 适合人群 */
  readonly suitableFor: readonly string[];
  /** 注意事项 (可选) */
  readonly caution?: string;
  readonly imageStatus: ZhijieV9ImageStatus;
  readonly image: ZhijieV9ProductImage;
  readonly sourceArea: "poster_project_matrix";
}

export interface ZhijieV9Scenario {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** 引用的 project id */
  readonly projectIds: readonly string[];
}

export interface ZhijieV9Bundle {
  readonly key: string;
  readonly name: string;
  readonly value: string;
  readonly projectIds: readonly string[];
}

export interface ZhijieV9ServiceStep {
  readonly order: number; // 1-6
  readonly title: string;
  readonly description: string;
}

export interface ZhijieV9FaqItem {
  readonly question: string;
  readonly answer: string;
}

const GENERATED_IMAGE_BASE = "/images/products/zhijie-v9/generated";

function generatedImage(
  fileName: string,
  displayName: string,
): ZhijieV9ProductImage {
  return {
    publicPath: `${GENERATED_IMAGE_BASE}/${fileName}`,
    alt: `智界 V9 ${displayName} 效果预览图`,
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  };
}

export const ZHIJIE_V9_HERO_IMAGE: ZhijieV9ProductImage = generatedImage(
  "zhijie-v9-ppf.webp",
  "主视觉",
);

// ---- §7 14 个海报项目 (按海报顺序) ----
export const zhijieV9UpgradeProjects: readonly ZhijieV9UpgradeProject[] = [
  {
    id: "zhijie-v9-ppf",
    order: 1,
    name: "车衣",
    category: "protection",
    summary: "漆面保护、日常轻微划痕防护、新车质感保持",
    suitableFor: ["新车用户", "关注漆面长期保持的车主"],
    imageStatus: "product-preview",
    image: generatedImage("zhijie-v9-ppf.webp", "车衣"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "zhijie-v9-window-film",
    order: 2,
    name: "隔热膜",
    category: "protection",
    summary: "隔热、防晒、隐私和 MPV 长途乘坐舒适",
    suitableFor: ["南方用车", "重视车内舒适的车主"],
    imageStatus: "product-preview",
    image: generatedImage("zhijie-v9-window-film.webp", "隔热膜"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "zhijie-v9-paint-art",
    order: 3,
    name: "彩绘",
    category: "appearance",
    summary: "主题化车身视觉表达,适合个性化展示",
    suitableFor: ["追求个性化外观的车主"],
    imageStatus: "product-preview",
    image: generatedImage("zhijie-v9-paint-art.webp", "彩绘"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "zhijie-v9-color-film",
    order: 4,
    name: "改色膜",
    category: "appearance",
    summary: "改变车身视觉风格,提升整车辨识度",
    suitableFor: ["希望低成本换色的车主"],
    imageStatus: "product-preview",
    image: generatedImage("zhijie-v9-color-film.webp", "改色膜"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "zhijie-v9-floor-mats",
    order: 5,
    name: "360 脚垫",
    category: "cabin_care",
    summary: "地毯保护、易清洁、提升座舱完整感",
    suitableFor: ["日常通勤用户", "家中有小孩的车主"],
    imageStatus: "product-preview",
    image: generatedImage("zhijie-v9-floor-mats.webp", "360 脚垫"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "zhijie-v9-balance-bar",
    order: 6,
    name: "平衡杆",
    category: "chassis",
    summary: "车身支撑和驾驶稳定感,需到店评估",
    suitableFor: ["关注驾驶稳定感的车主"],
    caution: "需到店评估",
    imageStatus: "product-preview",
    image: generatedImage("zhijie-v9-balance-bar.webp", "平衡杆"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "zhijie-v9-skid-plate",
    order: 7,
    name: "底盘护板",
    category: "chassis",
    summary: "保护底部关键区域,适合新车基础防护",
    suitableFor: ["新车用户", "路况复杂用车环境"],
    imageStatus: "product-preview",
    image: generatedImage("zhijie-v9-skid-plate.webp", "底盘护板"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "zhijie-v9-aluminum-floor",
    order: 8,
    name: "铝地板",
    category: "cabin_care",
    summary: "后排空间保护、易清洁、提升商务/家庭质感",
    suitableFor: ["MPV 用户", "商务接待场景"],
    imageStatus: "product-preview",
    image: generatedImage("zhijie-v9-aluminum-floor.webp", "铝地板"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "zhijie-v9-door-sill",
    order: 9,
    name: "门槛条",
    category: "cabin_care",
    summary: "上下车高频区域防刮、防踩踏磨损",
    suitableFor: ["高频上下车的车主"],
    imageStatus: "product-preview",
    image: generatedImage("zhijie-v9-door-sill.webp", "门槛条"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "zhijie-v9-license-frame",
    order: 10,
    name: "牌照框",
    category: "exterior_detail",
    summary: "优化车头/车尾细节,提升视觉完整度",
    suitableFor: ["关注外观细节的车主"],
    imageStatus: "product-preview",
    image: generatedImage("zhijie-v9-license-frame.webp", "牌照框"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "zhijie-v9-mudguard",
    order: 11,
    name: "挡泥板",
    category: "chassis",
    summary: "减少泥水飞溅和车身侧面污染",
    suitableFor: ["雨季/泥泞路况用车"],
    imageStatus: "product-preview",
    image: generatedImage("zhijie-v9-mudguard.webp", "挡泥板"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "zhijie-v9-bug-screen",
    order: 12,
    name: "防虫网",
    category: "chassis",
    summary: "减少虫石杂物进入关键散热/进风区域",
    suitableFor: ["夏季/多虫区域用车"],
    imageStatus: "product-preview",
    image: generatedImage("zhijie-v9-bug-screen.webp", "防虫网"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "zhijie-v9-tempered-film",
    order: 13,
    name: "钢化膜",
    category: "screen_care",
    summary: "中控/娱乐屏幕防刮保护",
    suitableFor: ["关注屏幕长期清晰度的车主"],
    imageStatus: "product-preview",
    image: generatedImage("zhijie-v9-tempered-film.webp", "钢化膜"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "zhijie-v9-hud-cover",
    order: 14,
    name: "抬头显示罩",
    category: "screen_care",
    summary: "保护 HUD 或抬头显示区域相关部件",
    suitableFor: ["使用抬头显示的车主"],
    caution: "需确认安装位",
    imageStatus: "product-preview",
    image: generatedImage("zhijie-v9-hud-cover.webp", "抬头显示罩"),
    sourceArea: "poster_project_matrix",
  },
] as const satisfies readonly ZhijieV9UpgradeProject[];

// ---- §8 5 大场景 ----
export const zhijieV9Scenarios: readonly ZhijieV9Scenario[] = [
  {
    id: "new-car-protection",
    name: "新车保护",
    description: "适合刚提车用户,优先解决保护和日常使用问题",
    projectIds: [
      "zhijie-v9-ppf",
      "zhijie-v9-window-film",
      "zhijie-v9-floor-mats",
      "zhijie-v9-skid-plate",
      "zhijie-v9-tempered-film",
      "zhijie-v9-door-sill",
    ],
  },
  {
    id: "appearance-style",
    name: "外观个性",
    description: "强化视觉辨识度和车身风格",
    projectIds: [
      "zhijie-v9-paint-art",
      "zhijie-v9-color-film",
      "zhijie-v9-license-frame",
    ],
  },
  {
    id: "cabin-care",
    name: "座舱与后排保护",
    description: "适合 MPV 后排、家庭和商务接待场景",
    projectIds: [
      "zhijie-v9-aluminum-floor",
      "zhijie-v9-floor-mats",
      "zhijie-v9-door-sill",
    ],
  },
  {
    id: "chassis-driving",
    name: "底盘与行车防护",
    description: "关注底部防护、行车环境和车身侧面清洁",
    projectIds: [
      "zhijie-v9-balance-bar",
      "zhijie-v9-skid-plate",
      "zhijie-v9-bug-screen",
      "zhijie-v9-mudguard",
    ],
  },
  {
    id: "premium-quality",
    name: "高端质感",
    description: "屏幕显示、外观细节和商务座舱质感补齐",
    projectIds: [
      "zhijie-v9-aluminum-floor",
      "zhijie-v9-tempered-film",
      "zhijie-v9-hud-cover",
      "zhijie-v9-door-sill",
      "zhijie-v9-license-frame",
    ],
  },
] as const satisfies readonly ZhijieV9Scenario[];

// ---- §9 4 大组合 ----
export const zhijieV9Bundles: readonly ZhijieV9Bundle[] = [
  {
    key: "bundle-new-car-protection",
    name: "新车基础保护组合",
    value: "保护漆面、提升隔热防晒隐私、保护地毯、加强底部防护、保护屏幕、保护门槛",
    projectIds: [
      "zhijie-v9-ppf",
      "zhijie-v9-window-film",
      "zhijie-v9-floor-mats",
      "zhijie-v9-skid-plate",
      "zhijie-v9-tempered-film",
      "zhijie-v9-door-sill",
    ],
  },
  {
    key: "bundle-business-cabin",
    name: "商务座舱保护组合",
    value: "后排易清洁提升座舱质感、降低日常脏污、减少磨损、提升舒适隐私",
    projectIds: [
      "zhijie-v9-aluminum-floor",
      "zhijie-v9-floor-mats",
      "zhijie-v9-door-sill",
      "zhijie-v9-window-film",
    ],
  },
  {
    key: "bundle-appearance",
    name: "外观个性升级组合",
    value: "主题化个性表达、改变整车色彩风格、优化外观细节",
    projectIds: [
      "zhijie-v9-paint-art",
      "zhijie-v9-color-film",
      "zhijie-v9-license-frame",
    ],
  },
  {
    key: "bundle-screen-care",
    name: "屏幕与显示保护组合",
    value: "保护中控/娱乐屏幕、保护显示区域相关部件",
    projectIds: ["zhijie-v9-tempered-film", "zhijie-v9-hud-cover"],
  },
] as const satisfies readonly ZhijieV9Bundle[];

// ---- §12 6 步服务流程 ----
export const zhijieV9ServiceSteps: readonly ZhijieV9ServiceStep[] = [
  {
    order: 1,
    title: "车型确认",
    description: "确认智界 V9 的年份、批次、版本和配置",
  },
  {
    order: 2,
    title: "项目选择",
    description: "根据保护、外观、座舱、底盘、屏幕显示等分类选择项目",
  },
  {
    order: 3,
    title: "到店评估",
    description: "确认安装位、接口、材料、工期和风险提示",
  },
  {
    order: 4,
    title: "施工安装",
    description: "按项目标准施工,并做好车身和内饰保护",
  },
  {
    order: 5,
    title: "验收交付",
    description: "检查外观、功能和安装细节",
  },
  {
    order: 6,
    title: "售后支持",
    description: "提供使用注意事项和后续维护建议",
  },
] as const satisfies readonly ZhijieV9ServiceStep[];

// ---- §13 6 条 FAQ ----
export const zhijieV9Faq: readonly ZhijieV9FaqItem[] = [
  {
    question: "智界 V9 的这些项目是否都能安装?",
    answer:
      "不同年份、版本和配置在尺寸、接口和安装位上可能存在差异。页面项目只作为升级方向参考，具体可行性以到店评估确认为准。",
  },
  {
    question: "新车最推荐先做什么?",
    answer:
      "车衣、隔热膜、360 脚垫、底盘护板、钢化膜、门槛条(适合刚提车的基础保护组合)。",
  },
  {
    question: "可以只做单个项目吗?",
    answer:
      "可以，页面项目既支持单项了解也支持场景组合；具体施工内容以到店评估为准。",
  },
  {
    question: "是否影响原车质保?",
    answer:
      "不做“不影响质保”的承诺；各项目对原车状态的影响不同，施工前会告知风险与边界。",
  },
  {
    question: "铝地板和抬头显示罩需要注意什么?",
    answer:
      "智界 V9 不同批次的座舱接口、显示区域和安装位可能存在差异，铝地板和抬头显示罩都需要按实车确认。",
  },
  {
    question: "图片是实际施工案例吗?",
    answer:
      "当前展示的是项目功能预览示意，真实施工效果以到店案例和实际车型确认结果为准。",
  },
] as const satisfies readonly ZhijieV9FaqItem[];

// ---- 6 类别中文名映射 (供 UI 显示) ----
export const ZHIJIE_V9_CATEGORY_LABELS: Readonly<Record<ZhijieV9Category, string>> = {
  protection: "新车保护",
  appearance: "外观个性",
  cabin_care: "座舱与后排保护",
  chassis: "底盘与行车防护",
  screen_care: "屏幕与显示保护",
  exterior_detail: "外观细节",
} as const;

// ---- Runtime 断言 (开发期触发) ----
function assertZhijieV9DataShape(): void {
  if (zhijieV9UpgradeProjects.length !== 14) {
    throw new Error(
      `zhijieV9UpgradeProjects expected 14 items, got ${zhijieV9UpgradeProjects.length}`,
    );
  }
  if (zhijieV9Scenarios.length !== 5) {
    throw new Error(`zhijieV9Scenarios expected 5, got ${zhijieV9Scenarios.length}`);
  }
  if (zhijieV9Bundles.length !== 4) {
    throw new Error(`zhijieV9Bundles expected 4, got ${zhijieV9Bundles.length}`);
  }
  if (zhijieV9ServiceSteps.length !== 6) {
    throw new Error(
      `zhijieV9ServiceSteps expected 6, got ${zhijieV9ServiceSteps.length}`,
    );
  }
  if (zhijieV9Faq.length !== 6) {
    throw new Error(`zhijieV9Faq expected 6, got ${zhijieV9Faq.length}`);
  }

  // key 唯一性
  const allKeys = new Set<string>();
  for (const p of zhijieV9UpgradeProjects) {
    if (allKeys.has(p.id)) throw new Error(`Duplicate project id: ${p.id}`);
    allKeys.add(p.id);
  }
  for (const s of zhijieV9Scenarios) {
    if (allKeys.has(s.id)) {
      throw new Error(`Scenario id conflicts with project id: ${s.id}`);
    }
  }
  for (const b of zhijieV9Bundles) {
    if (allKeys.has(b.key)) {
      throw new Error(`Bundle key conflicts with project id: ${b.key}`);
    }
  }

  // order 单调递增 1-14
  zhijieV9UpgradeProjects.forEach((p, i) => {
    if (p.order !== i + 1) {
      throw new Error(`Project ${i} order expected ${i + 1}, got ${p.order}`);
    }
  });

  // service steps 连续 1-6
  zhijieV9ServiceSteps.forEach((s, i) => {
    if (s.order !== i + 1) {
      throw new Error(
        `Service step ${i} expected order ${i + 1}, got ${s.order}`,
      );
    }
  });

  // scenario.projectIds 引用存在的 project id
  for (const s of zhijieV9Scenarios) {
    for (const pid of s.projectIds) {
      if (!allKeys.has(pid)) {
          throw new Error(`Scenario ${s.id} references missing project id: ${pid}`);
      }
    }
  }

  // bundle.projectIds 引用存在的 project id
  for (const b of zhijieV9Bundles) {
    for (const pid of b.projectIds) {
      if (!allKeys.has(pid)) {
        throw new Error(`Bundle ${b.key} references missing project id: ${pid}`);
      }
    }
  }

  // 每个 project 至少被一个 scenario 引用
  const referencedIds = new Set<string>();
  for (const s of zhijieV9Scenarios)
    for (const pid of s.projectIds) referencedIds.add(pid);
  for (const p of zhijieV9UpgradeProjects) {
    if (!referencedIds.has(p.id)) {
      throw new Error(`Project ${p.id} not referenced by any scenario`);
    }
  }

  // 6 个类别都有中文标签
  const allCategories: readonly ZhijieV9Category[] = [
    "protection",
    "appearance",
    "cabin_care",
    "chassis",
    "screen_care",
    "exterior_detail",
  ];
  for (const c of allCategories) {
    if (!ZHIJIE_V9_CATEGORY_LABELS[c]) {
      throw new Error(`Missing label for category: ${c}`);
    }
  }
}

assertZhijieV9DataShape();
