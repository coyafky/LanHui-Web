/**
 * 小鹏 GX 单车型轻改项目 — 数据层
 *
 * 数据来源 PRD：
 *   docs/PRD/product/XPENG_GX_TOPIC_PRD_2026-06-25.md
 *   docs/SPEC/public-site/product/models/xpeng-gx.md (v0.2)
 *
 * 节号映射：
 *   §7  15 个海报项目       → xpengGxUpgradeProjects  (length === 15)
 *   §8  6 大场景           → xpengGxScenarios        (length === 6)
 *   §9  3 大组合           → xpengGxBundles          (length === 3)
 *   §12 7 步服务流程        → xpengGxServiceSteps     (length === 7)
 *   §13 8 条 FAQ           → xpengGxFaq              (length === 8)
 *
 * 字段值零变更 —— 直接从 PRD §7-§13 抄写。一期允许 imageStatus = "pending-review"
 * (业务后续补图)，saleStatus 严格按 PRD §7 标注（电动门 = "preorder"）。
 */

export type XpengGxCategory =
  | "protection" // 新车保护
  | "appearance" // 外观个性
  | "electric_convenience" // 电动便利
  | "chassis" // 底盘与行车防护
  | "screen_care" // 屏幕与显示保护
  | "cabin_care"; // 座舱维护

export type XpengGxSaleStatus = "available" | "preorder" | "pending-review";
export type XpengGxImageStatus = "matched" | "pending-review" | "missing";

export interface XpengGxUpgradeProject {
  /** 稳定 slug, 例 "xpeng-gx-ppf" / "xpeng-gx-electric-door" / "xpeng-gx-floor-mats" */
  readonly id: string;
  /** 1-15 (按海报顺序) */
  readonly order: number;
  /** 项目名称 */
  readonly name: string;
  readonly category: XpengGxCategory;
  /** 售卖状态：电动门 = "preorder"，其余 "available" */
  readonly saleStatus: XpengGxSaleStatus;
  /** 一句话价值说明 */
  readonly summary: string;
  /** 适合人群 */
  readonly suitableFor: readonly string[];
  /** 注意事项 (可选, 电动门必填) */
  readonly caution?: string;
  readonly imageStatus: XpengGxImageStatus;
  readonly sourceArea: "poster_project_matrix";
}

export interface XpengGxScenario {
  readonly key: string;
  readonly name: string;
  readonly description: string;
  /** 引用的 project id */
  readonly projectIds: readonly string[];
}

export interface XpengGxBundle {
  readonly key: string;
  readonly name: string;
  readonly value: string;
  readonly projectIds: readonly string[];
}

export interface XpengGxFaqItem {
  readonly question: string;
  readonly answer: string;
}

export interface XpengGxServiceStep {
  readonly step: number; // 1-7
  readonly title: string;
  readonly description: string;
}

// ---- §7 15 个海报项目 (按海报顺序) ----
export const xpengGxUpgradeProjects: readonly XpengGxUpgradeProject[] = [
  {
    id: "xpeng-gx-ppf",
    order: 1,
    name: "车衣",
    category: "protection",
    saleStatus: "available",
    summary: "漆面保护、日常轻微划痕防护、新车质感保持",
    suitableFor: ["新车用户", "关注漆面长期保持的车主"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "xpeng-gx-window-film",
    order: 2,
    name: "隔热膜",
    category: "protection",
    saleStatus: "available",
    summary: "隔热、防晒、隐私和驾乘舒适",
    suitableFor: ["南方用车", "重视车内舒适的车主"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "xpeng-gx-paint-art",
    order: 3,
    name: "彩绘",
    category: "appearance",
    saleStatus: "available",
    summary: "主题化车身视觉表达,提升辨识度",
    suitableFor: ["追求个性化外观的车主"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "xpeng-gx-color-film",
    order: 4,
    name: "改色膜",
    category: "appearance",
    saleStatus: "available",
    summary: "改变车身视觉风格,满足个性化表达",
    suitableFor: ["希望低成本换色的车主"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "xpeng-gx-electric-door",
    order: 5,
    name: "电动门",
    category: "electric_convenience",
    saleStatus: "preorder",
    summary: "电动开闭便利和科技感",
    suitableFor: ["关注科技便利的车主"],
    caution: "项目处于预售或待确认状态,需到店确认排期和适配",
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "xpeng-gx-balance-bar",
    order: 6,
    name: "平衡杆",
    category: "chassis",
    saleStatus: "available",
    summary: "车身支撑和驾驶稳定感,需到店评估",
    suitableFor: ["关注驾驶稳定感的车主"],
    caution: "需到店评估",
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "xpeng-gx-skid-plate",
    order: 7,
    name: "底盘护板",
    category: "chassis",
    saleStatus: "available",
    summary: "保护底部关键区域,适合新车基础防护",
    suitableFor: ["新车用户", "路况复杂用车环境"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "xpeng-gx-floor-mats",
    order: 8,
    name: "360 脚垫",
    category: "cabin_care",
    saleStatus: "available",
    summary: "地毯保护、易清洁、提升座舱完整感",
    suitableFor: ["日常通勤用户", "家中有小孩的车主"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "xpeng-gx-wheel-hub",
    order: 9,
    name: "轮毂",
    category: "appearance",
    saleStatus: "available",
    summary: "改变整车侧面姿态和视觉质感",
    suitableFor: ["追求外观姿态的车主"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "xpeng-gx-door-sill",
    order: 10,
    name: "门槛条",
    category: "cabin_care",
    saleStatus: "available",
    summary: "上下车高频区域防刮、防踩踏磨损",
    suitableFor: ["高频上下车的车主"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "xpeng-gx-bug-screen",
    order: 11,
    name: "防虫网",
    category: "chassis",
    saleStatus: "available",
    summary: "减少虫石杂物进入关键散热/进风区域",
    suitableFor: ["夏季/多虫区域用车"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "xpeng-gx-mudguard",
    order: 12,
    name: "挡泥板",
    category: "chassis",
    saleStatus: "available",
    summary: "减少泥水飞溅和车身侧面污染",
    suitableFor: ["雨季/泥泞路况用车"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "xpeng-gx-tempered-film",
    order: 13,
    name: "钢化膜",
    category: "screen_care",
    saleStatus: "available",
    summary: "中控/娱乐屏幕防刮保护",
    suitableFor: ["关注屏幕长期清晰度的车主"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "xpeng-gx-hud-cover",
    order: 14,
    name: "抬头显示罩",
    category: "screen_care",
    saleStatus: "available",
    summary: "保护 HUD 或抬头显示区域相关部件",
    suitableFor: ["使用抬头显示的车主"],
    caution: "需确认安装位",
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
  {
    id: "xpeng-gx-license-frame",
    order: 15,
    name: "牌照框",
    category: "appearance",
    saleStatus: "available",
    summary: "优化车头/车尾细节,提升视觉完整度",
    suitableFor: ["关注外观细节的车主"],
    imageStatus: "pending-review",
    sourceArea: "poster_project_matrix",
  },
] as const satisfies readonly XpengGxUpgradeProject[];

// ---- §8 6 大场景 ----
export const xpengGxScenarios: readonly XpengGxScenario[] = [
  {
    key: "scenario-new-car-protection",
    name: "新车保护",
    description: "适合刚提车用户,优先解决保护和日常使用问题",
    projectIds: [
      "xpeng-gx-ppf",
      "xpeng-gx-window-film",
      "xpeng-gx-skid-plate",
      "xpeng-gx-floor-mats",
      "xpeng-gx-door-sill",
      "xpeng-gx-tempered-film",
    ],
  },
  {
    key: "scenario-appearance",
    name: "外观个性",
    description: "强化视觉辨识度和车身风格",
    projectIds: [
      "xpeng-gx-paint-art",
      "xpeng-gx-color-film",
      "xpeng-gx-wheel-hub",
      "xpeng-gx-license-frame",
    ],
  },
  {
    key: "scenario-electric-convenience",
    name: "电动便利",
    description: "强调科技便利,必须提示预售和适配确认",
    projectIds: ["xpeng-gx-electric-door"],
  },
  {
    key: "scenario-chassis",
    name: "底盘与行车防护",
    description: "关注底部防护、行车环境和车身侧面清洁",
    projectIds: [
      "xpeng-gx-balance-bar",
      "xpeng-gx-skid-plate",
      "xpeng-gx-bug-screen",
      "xpeng-gx-mudguard",
    ],
  },
  {
    key: "scenario-screen-care",
    name: "屏幕与显示保护",
    description: "保护高频使用屏幕和显示区域",
    projectIds: ["xpeng-gx-tempered-film", "xpeng-gx-hud-cover"],
  },
  {
    key: "scenario-cabin-care",
    name: "座舱维护",
    description: "降低高频使用磨损,保持车内质感",
    projectIds: [
      "xpeng-gx-floor-mats",
      "xpeng-gx-door-sill",
      "xpeng-gx-tempered-film",
    ],
  },
] as const satisfies readonly XpengGxScenario[];

// ---- §9 3 大组合 ----
export const xpengGxBundles: readonly XpengGxBundle[] = [
  {
    key: "bundle-new-car-protection",
    name: "新车基础保护组合",
    value: "保护漆面、提升隔热防晒隐私、保护地毯、加强底部防护、保护屏幕",
    projectIds: [
      "xpeng-gx-ppf",
      "xpeng-gx-window-film",
      "xpeng-gx-floor-mats",
      "xpeng-gx-skid-plate",
      "xpeng-gx-door-sill",
      "xpeng-gx-tempered-film",
    ],
  },
  {
    key: "bundle-appearance",
    name: "外观个性升级组合",
    value: "主题化个性表达、强化侧面姿态、优化外观细节",
    projectIds: [
      "xpeng-gx-paint-art",
      "xpeng-gx-color-film",
      "xpeng-gx-wheel-hub",
      "xpeng-gx-license-frame",
    ],
  },
  {
    key: "bundle-tech-convenience",
    name: "科技便利与屏幕保护组合",
    value: "提升开闭便利和科技感、保护显示区域相关部件",
    projectIds: ["xpeng-gx-electric-door", "xpeng-gx-tempered-film", "xpeng-gx-hud-cover"],
  },
] as const satisfies readonly XpengGxBundle[];

// ---- §12 7 步服务流程 ----
export const xpengGxServiceSteps: readonly XpengGxServiceStep[] = [
  {
    step: 1,
    title: "车型确认",
    description: "确认小鹏 GX 的年份、批次、版本和配置",
  },
  {
    step: 2,
    title: "项目选择",
    description: "根据保护、外观、电动便利、屏幕保护等分类选择项目",
  },
  {
    step: 3,
    title: "到店评估",
    description: "确认安装位、接口、材料、工期和预售/库存状态",
  },
  {
    step: 4,
    title: "方案确认",
    description: "确认项目组合、施工时间和注意事项",
  },
  {
    step: 5,
    title: "施工安装",
    description: "按项目标准施工,并做好车身和内饰保护",
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
] as const satisfies readonly XpengGxServiceStep[];

// ---- §13 8 条 FAQ ----
export const xpengGxFaq: readonly XpengGxFaqItem[] = [
  {
    question: "小鹏 GX 的这些项目是否都能安装?",
    answer: "不同年份、版本和配置可能不同,需到店评估确认。",
  },
  {
    question: "新车最推荐先做什么?",
    answer:
      "车衣、隔热膜、360 脚垫、底盘护板、门槛条、钢化膜(适合刚提车的基础保护组合)。",
  },
  {
    question: "电动门为什么标注预售?",
    answer: "表示项目处于预售或待确认状态,需到店确认排期和适配。",
  },
  {
    question: "外观个性项目有哪些?",
    answer: "彩绘、改色膜、轮毂、牌照框。",
  },
  {
    question: "屏幕保护项目有哪些?",
    answer: "钢化膜、抬头显示罩。",
  },
  {
    question: "可以只做单个项目吗?",
    answer: "可以,页面项目既支持单项了解,也支持组合方案。",
  },
  {
    question: "是否影响原车质保?",
    answer: "不做不影响质保的承诺,具体以车辆情况和项目评估为准。",
  },
  {
    question: "工期多久?",
    answer: "根据项目组合、库存和施工排期确认。",
  },
] as const satisfies readonly XpengGxFaqItem[];

// ---- 6 类别中文名映射 (供 UI 显示) ----
export const XPENG_GX_CATEGORY_LABELS: Readonly<Record<XpengGxCategory, string>> = {
  protection: "新车保护",
  appearance: "外观个性",
  electric_convenience: "电动便利",
  chassis: "底盘与行车防护",
  screen_care: "屏幕与显示保护",
  cabin_care: "座舱维护",
} as const;

// ---- Runtime 断言 (开发期触发, 复制自 SPEC §2.3) ----
function assertXpengGxDataShape(): void {
  if (xpengGxUpgradeProjects.length !== 15) {
    throw new Error(
      `xpengGxUpgradeProjects expected 15 items, got ${xpengGxUpgradeProjects.length}`,
    );
  }
  if (xpengGxScenarios.length !== 6) {
    throw new Error(`xpengGxScenarios expected 6, got ${xpengGxScenarios.length}`);
  }
  if (xpengGxBundles.length !== 3) {
    throw new Error(`xpengGxBundles expected 3, got ${xpengGxBundles.length}`);
  }
  if (xpengGxServiceSteps.length !== 7) {
    throw new Error(
      `xpengGxServiceSteps expected 7, got ${xpengGxServiceSteps.length}`,
    );
  }
  if (xpengGxFaq.length !== 8) {
    throw new Error(`xpengGxFaq expected 8, got ${xpengGxFaq.length}`);
  }

  // key 唯一性
  const allKeys = new Set<string>();
  for (const p of xpengGxUpgradeProjects) {
    if (allKeys.has(p.id)) throw new Error(`Duplicate project id: ${p.id}`);
    allKeys.add(p.id);
  }
  for (const s of xpengGxScenarios) {
    if (allKeys.has(s.key)) {
      throw new Error(`Scenario key conflicts with project id: ${s.key}`);
    }
  }
  for (const b of xpengGxBundles) {
    if (allKeys.has(b.key)) {
      throw new Error(`Bundle key conflicts with project id: ${b.key}`);
    }
  }

  // order 单调递增 1-15
  xpengGxUpgradeProjects.forEach((p, i) => {
    if (p.order !== i + 1) {
      throw new Error(`Project ${i} order expected ${i + 1}, got ${p.order}`);
    }
  });

  // service steps 连续 1-7
  xpengGxServiceSteps.forEach((s, i) => {
    if (s.step !== i + 1) {
      throw new Error(`Service step ${i} expected step ${i + 1}, got ${s.step}`);
    }
  });

  // scenario.projectIds 引用存在的 project id
  for (const s of xpengGxScenarios) {
    for (const pid of s.projectIds) {
      if (!allKeys.has(pid)) {
        throw new Error(`Scenario ${s.key} references missing project id: ${pid}`);
      }
    }
  }

  // bundle.projectIds 引用存在的 project id
  for (const b of xpengGxBundles) {
    for (const pid of b.projectIds) {
      if (!allKeys.has(pid)) {
        throw new Error(`Bundle ${b.key} references missing project id: ${pid}`);
      }
    }
  }

  // 每个 project 至少被一个 scenario 引用
  const referencedIds = new Set<string>();
  for (const s of xpengGxScenarios)
    for (const pid of s.projectIds) referencedIds.add(pid);
  for (const p of xpengGxUpgradeProjects) {
    if (!referencedIds.has(p.id)) {
      throw new Error(`Project ${p.id} not referenced by any scenario`);
    }
  }

  // 6 个类别都有中文标签
  const allCategories: readonly XpengGxCategory[] = [
    "protection",
    "appearance",
    "electric_convenience",
    "chassis",
    "screen_care",
    "cabin_care",
  ];
  for (const c of allCategories) {
    if (!XPENG_GX_CATEGORY_LABELS[c]) {
      throw new Error(`Missing label for category: ${c}`);
    }
  }
}

assertXpengGxDataShape();