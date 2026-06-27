/**
 * 岚图梦想家单车型轻改项目 — 数据层
 *
 * 数据来源 PRD：
 *   docs/PRD/product/VOYAH_DREAMER_TOPIC_PRD_2026-06-25.md
 *
 * 节号映射：
 *   §7.1 17 个海报项目     → voyahDreamerUpgradeProjects  (length === 17)
 *   §8   5 大场景          → voyahDreamerScenarios        (length === 5)
 *   §12  7 步服务流程      → voyahDreamerServiceSteps     (length === 7)
 *   §13  7 条 FAQ          → voyahDreamerFaq              (length === 7)
 *
 * 字段值零变更 —— 直接从 PRD §7-§13 抄写。一期允许 imageStatus = "pending-review"
 * (业务后续补图)。
 */

// ---- 类型定义 ----

export type VoyahDreamerCategory =
  | "protection"        // 新车保护
  | "appearance"        // 外观个性
  | "chassis"           // 底盘与行车防护
  | "mpv_comfort"       // MPV 后排舒适
  | "interior_care";    // 座舱维护

export type VoyahDreamerImageStatus = "matched" | "pending-review" | "missing";

export interface VoyahDreamerUpgradeProject {
  /** 稳定 slug, 例 "voyah-dreamer-ppf" / "voyah-dreamer-power-step" */
  readonly id: string;
  /** 1-17 (按海报顺序) */
  readonly order: number;
  /** 项目名称 */
  readonly name: string;
  readonly category: VoyahDreamerCategory;
  /** 一句话价值说明 */
  readonly summary: string;
  /** 适合人群 */
  readonly suitableFor: readonly string[];
  /** 注意事项 (可选) */
  readonly caution?: string;
  readonly imageStatus: VoyahDreamerImageStatus;
  readonly sourceArea: "poster_project_matrix";
}

export interface VoyahDreamerScenario {
  readonly key: string;
  readonly name: string;
  readonly description: string;
  /** 引用的 project id */
  readonly projectIds: readonly string[];
}

export interface VoyahDreamerServiceStep {
  readonly step: number; // 1-7
  readonly title: string;
  readonly description: string;
}

export interface VoyahDreamerFaqItem {
  readonly question: string;
  readonly answer: string;
}

// ---- §7.1 17 个海报项目 (按海报顺序) ----
export const voyahDreamerUpgradeProjects: readonly VoyahDreamerUpgradeProject[] = [
  {
    id: "voyah-dreamer-ppf",
    order: 1,
    name: "车衣",
    category: "protection",
    summary: "漆面保护、日常轻微划痕防护、新车质感保持",
    suitableFor: ["新车用户", "关注漆面长期保持的车主"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "voyah-dreamer-window-film",
    order: 2,
    name: "隔热膜",
    category: "protection",
    summary: "隔热、防晒、隐私和 MPV 长途乘坐舒适",
    suitableFor: ["南方用车", "MPV 长途用户"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "voyah-dreamer-paint-art",
    order: 3,
    name: "彩绘",
    category: "appearance",
    summary: "主题化车身视觉表达，适合个性化展示",
    suitableFor: ["追求个性化外观的车主"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "voyah-dreamer-duotone-film",
    order: 4,
    name: "双拼改色",
    category: "appearance",
    summary: "强化商务 MPV 的层次感和高级感",
    suitableFor: ["商务用户", "追求外观质感的车主"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "voyah-dreamer-floor-mats",
    order: 5,
    name: "360软包脚垫",
    category: "interior_care",
    summary: "地毯保护、易清洁、提升座舱完整感",
    suitableFor: ["日常通勤用户", "家中有小孩的车主"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "voyah-dreamer-aluminum-floor",
    order: 6,
    name: "铝地板",
    category: "mpv_comfort",
    summary: "后排空间保护、易清洁、提升商务/家庭质感",
    suitableFor: ["MPV 用户", "商务接待场景"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "voyah-dreamer-balance-bar",
    order: 7,
    name: "平衡杆",
    category: "chassis",
    summary: "车身支撑和驾驶稳定感，需到店评估",
    suitableFor: ["关注驾驶稳定感的车主"],
    caution: "需到店评估",
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "voyah-dreamer-amxt-bodykit",
    order: 8,
    name: "AMXT包围",
    category: "appearance",
    summary: "强化车身视觉完整度和个性风格",
    suitableFor: ["追求外观风格的车主"],
    caution: "需确认版本适配",
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "voyah-dreamer-bskt-bodykit",
    order: 9,
    name: "BSKT运动包围",
    category: "appearance",
    summary: "强化运动姿态和车身包围视觉",
    suitableFor: ["追求运动外观的车主"],
    caution: "需确认版本适配",
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "voyah-dreamer-skid-plate",
    order: 10,
    name: "底盘护板",
    category: "chassis",
    summary: "保护底部关键区域，适合新车基础防护",
    suitableFor: ["新车用户", "路况复杂用车环境"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "voyah-dreamer-door-sill",
    order: 11,
    name: "门槛条",
    category: "interior_care",
    summary: "上下车高频区域防刮、防踩踏磨损",
    suitableFor: ["高频上下车的车主"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "voyah-dreamer-ambient-light",
    order: 12,
    name: "氛围灯",
    category: "mpv_comfort",
    summary: "提升夜间座舱氛围和商务接待体验",
    suitableFor: ["商务用户", "注重座舱氛围的车主"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "voyah-dreamer-license-frame",
    order: 13,
    name: "牌照框",
    category: "appearance",
    summary: "优化车头/车尾细节，提升视觉完整度",
    suitableFor: ["关注外观细节的车主"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "voyah-dreamer-mudguard",
    order: 14,
    name: "挡泥板",
    category: "chassis",
    summary: "减少泥水飞溅和车身侧面污染",
    suitableFor: ["雨季/泥泞路况用车"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "voyah-dreamer-leg-rest",
    order: 15,
    name: "腿托",
    category: "mpv_comfort",
    summary: "提升 MPV 后排乘坐舒适和长途体验",
    suitableFor: ["家庭用户", "长途乘坐场景"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "voyah-dreamer-tempered-film",
    order: 16,
    name: "钢化膜",
    category: "interior_care",
    summary: "中控/娱乐屏幕防刮保护",
    suitableFor: ["关注屏幕长期清晰度的车主"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "voyah-dreamer-bug-screen",
    order: 17,
    name: "防虫网",
    category: "chassis",
    summary: "减少虫石杂物进入关键散热/进风区域",
    suitableFor: ["夏季/多虫区域用车"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
] as const satisfies readonly VoyahDreamerUpgradeProject[];

// ---- §8 5 大场景 ----
export const voyahDreamerScenarios: readonly VoyahDreamerScenario[] = [
  {
    key: "scenario-new-car-protection",
    name: "新车保护",
    description: "适合刚提车用户，优先解决保护和日常使用问题",
    projectIds: [
      "voyah-dreamer-ppf",
      "voyah-dreamer-window-film",
      "voyah-dreamer-floor-mats",
      "voyah-dreamer-skid-plate",
      "voyah-dreamer-door-sill",
      "voyah-dreamer-tempered-film",
    ],
  },
  {
    key: "scenario-appearance",
    name: "外观个性",
    description: "强化视觉辨识度、商务气质和个性表达",
    projectIds: [
      "voyah-dreamer-paint-art",
      "voyah-dreamer-duotone-film",
      "voyah-dreamer-amxt-bodykit",
      "voyah-dreamer-bskt-bodykit",
      "voyah-dreamer-license-frame",
    ],
  },
  {
    key: "scenario-chassis-protection",
    name: "底盘与行车防护",
    description: "关注底部防护、行车环境和车身侧面清洁",
    projectIds: [
      "voyah-dreamer-balance-bar",
      "voyah-dreamer-skid-plate",
      "voyah-dreamer-bug-screen",
      "voyah-dreamer-mudguard",
    ],
  },
  {
    key: "scenario-mpv-comfort",
    name: "MPV后排舒适",
    description: "适合家庭、商务接待和长途乘坐",
    projectIds: [
      "voyah-dreamer-aluminum-floor",
      "voyah-dreamer-leg-rest",
      "voyah-dreamer-ambient-light",
      "voyah-dreamer-floor-mats",
    ],
  },
  {
    key: "scenario-cabin-care",
    name: "座舱维护",
    description: "降低高频使用磨损，保持车内质感",
    projectIds: [
      "voyah-dreamer-floor-mats",
      "voyah-dreamer-aluminum-floor",
      "voyah-dreamer-tempered-film",
      "voyah-dreamer-door-sill",
    ],
  },
] as const satisfies readonly VoyahDreamerScenario[];

// ---- §12 7 步服务流程 ----
export const voyahDreamerServiceSteps: readonly VoyahDreamerServiceStep[] = [
  {
    step: 1,
    title: "车型确认",
    description: "确认岚图梦想家的年份、批次、版本和配置",
  },
  {
    step: 2,
    title: "项目选择",
    description: "根据保护、外观、后排舒适、座舱维护等分类选择项目",
  },
  {
    step: 3,
    title: "到店评估",
    description: "确认安装位、接口、材料、工期和风险提示",
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
] as const satisfies readonly VoyahDreamerServiceStep[];

// ---- §13 7 条 FAQ ----
export const voyahDreamerFaq: readonly VoyahDreamerFaqItem[] = [
  {
    question: "岚图梦想家的这些项目是否都能安装？",
    answer: "不同年份、版本和配置可能不同，需到店评估确认。",
  },
  {
    question: "新车最推荐先做什么？",
    answer: "车衣、隔热膜、360软包脚垫、底盘护板、门槛条、钢化膜。",
  },
  {
    question: "MPV后排舒适项目有哪些？",
    answer: "铝地板、腿托、氛围灯、360软包脚垫。",
  },
  {
    question: "外观个性项目有哪些？",
    answer: "彩绘、双拼改色、AMXT包围、BSKT运动包围、牌照框。",
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
] as const satisfies readonly VoyahDreamerFaqItem[];

// ---- 5 类别中文名映射 (供 UI 显示) ----
export const VOYAH_DREAMER_CATEGORY_LABELS: Readonly<Record<VoyahDreamerCategory, string>> = {
  protection: "新车保护",
  appearance: "外观个性",
  chassis: "底盘防护",
  mpv_comfort: "MPV 舒适",
  interior_care: "座舱维护",
} as const;

// ---- Runtime 断言 (开发期触发) ----
function assertVoyahDreamerDataShape(): void {
  if (voyahDreamerUpgradeProjects.length !== 17) {
    throw new Error(
      `voyahDreamerUpgradeProjects expected 17 items, got ${voyahDreamerUpgradeProjects.length}`,
    );
  }
  if (voyahDreamerScenarios.length !== 5) {
    throw new Error(`voyahDreamerScenarios expected 5, got ${voyahDreamerScenarios.length}`);
  }
  if (voyahDreamerServiceSteps.length !== 7) {
    throw new Error(
      `voyahDreamerServiceSteps expected 7, got ${voyahDreamerServiceSteps.length}`,
    );
  }
  if (voyahDreamerFaq.length !== 7) {
    throw new Error(`voyahDreamerFaq expected 7, got ${voyahDreamerFaq.length}`);
  }

  // key 唯一性 (project ids + scenario keys)
  const allKeys = new Set<string>();
  for (const p of voyahDreamerUpgradeProjects) {
    if (allKeys.has(p.id)) throw new Error(`Duplicate project id: ${p.id}`);
    allKeys.add(p.id);
  }
  for (const s of voyahDreamerScenarios) {
    if (allKeys.has(s.key)) {
      throw new Error(`Scenario key conflicts with project id: ${s.key}`);
    }
    allKeys.add(s.key);
  }

  // order 单调递增 1-17
  voyahDreamerUpgradeProjects.forEach((p, i) => {
    if (p.order !== i + 1) {
      throw new Error(`Project ${i} order expected ${i + 1}, got ${p.order}`);
    }
  });

  // service steps 连续 1-7
  voyahDreamerServiceSteps.forEach((s, i) => {
    if (s.step !== i + 1) {
      throw new Error(`Service step ${i} expected step ${i + 1}, got ${s.step}`);
    }
  });

  // scenario.projectIds 引用存在的 project id
  for (const s of voyahDreamerScenarios) {
    for (const pid of s.projectIds) {
      if (!allKeys.has(pid)) {
        throw new Error(`Scenario ${s.key} references missing project id: ${pid}`);
      }
    }
  }

  // 每个 project 至少被一个 scenario 引用
  const referencedIds = new Set<string>();
  for (const s of voyahDreamerScenarios)
    for (const pid of s.projectIds) referencedIds.add(pid);
  for (const p of voyahDreamerUpgradeProjects) {
    if (!referencedIds.has(p.id)) {
      throw new Error(`Project ${p.id} not referenced by any scenario`);
    }
  }

  // 5 个类别都有中文标签
  const allCategories: readonly VoyahDreamerCategory[] = [
    "protection",
    "appearance",
    "chassis",
    "mpv_comfort",
    "interior_care",
  ];
  for (const c of allCategories) {
    if (!VOYAH_DREAMER_CATEGORY_LABELS[c]) {
      throw new Error(`Missing label for category: ${c}`);
    }
  }
}

assertVoyahDreamerDataShape();
