/**
 * 理想 MEGA 专题页静态数据
 *
 * 数据派生自 `docs/PRD/product/LI_AUTO_MEGA_TOPIC_PRD_2026-06-27.md` §7-§9。
 *
 * 当前全部 pending-review（无实际图片），publicPath / width / height / aspectRatio 均省略。
 *
 * 字面量防漂移：
 *   - 18 个项目 / 5 场景 / 5 组合 / 7 步 / 9 FAQ 用 count 常量 + runtime assert 双重保证
 *   - order 单调递增 1-18
 *   - 所有 key 唯一互不冲突
 */

// ---- 字面量类型 ----

export type LiAutoMegaImageStatus =
  | "matched"
  | "generated-preview"
  | "pending-review"
  | "missing";

export type LiAutoMegaCategory =
  | "protection"
  | "film"
  | "appearance"
  | "business_cabin"
  | "cabin_protection"
  | "chassis"
  | "driving_protection"
  | "lighting"
  | "interior_care";

export type LiAutoMegaScenarioKey =
  | "new_car_protection"
  | "business_cabin"
  | "appearance"
  | "driving_protection"
  | "lighting_detail";

export type LiAutoMegaUpgradeProject = {
  /** 1-18，严格单调递增 */
  order: number;
  /** 稳定 slug */
  key: string;
  /** 中文名 */
  name: string;
  category: LiAutoMegaCategory;
  /** 1 句话价值说明 */
  summary: string;
  /** 当前全 pending-review，无实际图片 */
  publicPath?: `/images/products/li-auto/mega/${string}.png`;
  /** 字面量 1448（仅当有图片时） */
  width?: 1448;
  /** 字面量 1086 */
  height?: 1086;
  /** 字面量 "4/3" */
  aspectRatio?: "4/3";
  imageStatus: LiAutoMegaImageStatus;
  /** 适配场景 */
  suitableFor: readonly LiAutoMegaScenarioKey[];
  /** 可选注意事项 */
  caution?: string;
};

export type LiAutoMegaScenario = {
  key: LiAutoMegaScenarioKey;
  name: string;
  description: string;
  projectKeys: readonly string[];
};

export type LiAutoMegaBundle = {
  key: string;
  name: string;
  description: string;
  projectKeys: readonly string[];
};

export type LiAutoMegaServiceStep = {
  step: number;
  title: string;
  description: string;
};

export type LiAutoMegaFaqItem = {
  question: string;
  answer: string;
};

// ---- 类别中文标签 ----

export const CATEGORY_LABELS: Record<LiAutoMegaCategory, string> = {
  protection: "新车保护",
  film: "膜系",
  appearance: "外观个性",
  business_cabin: "商务座舱",
  cabin_protection: "座舱保护",
  chassis: "底盘",
  driving_protection: "行车防护",
  lighting: "灯光视觉",
  interior_care: "内饰养护",
};

// ---- count 常量 ----

export const LI_AUTO_MEGA_PROJECT_COUNT = 18;
export const LI_AUTO_MEGA_SCENARIO_COUNT = 5;
export const LI_AUTO_MEGA_BUNDLE_COUNT = 5;
export const LI_AUTO_MEGA_SERVICE_STEP_COUNT = 7;
export const LI_AUTO_MEGA_FAQ_COUNT = 9;

// ---- 18 项升级项目 ----

export const liAutoMegaUpgradeProjects: readonly LiAutoMegaUpgradeProject[] = [
  {
    order: 1,
    key: "paint-protection-film",
    name: "车衣",
    category: "protection",
    summary: "大车身漆面保护、日常划痕防护、保持车身质感",
    imageStatus: "pending-review",
    suitableFor: ["new_car_protection"],
  },
  {
    order: 2,
    key: "window-film",
    name: "隔热膜",
    category: "film",
    summary: "大面积玻璃隔热、防晒、隐私与驾乘舒适",
    imageStatus: "pending-review",
    suitableFor: ["new_car_protection"],
  },
  {
    order: 3,
    key: "graphic-wrap",
    name: "彩绘",
    category: "appearance",
    summary: "主题化车身视觉，适合个性表达或门店展示",
    imageStatus: "pending-review",
    suitableFor: ["appearance"],
  },
  {
    order: 4,
    key: "two-tone-color-wrap",
    name: "双拼改色",
    category: "appearance",
    summary: "强化车身层次感和 MEGA 侧面辨识度",
    imageStatus: "pending-review",
    suitableFor: ["appearance"],
  },
  {
    order: 5,
    key: "aluminum-floor",
    name: "铝地板",
    category: "business_cabin",
    summary: "二三排和尾箱易清洁，提升耐用与质感",
    imageStatus: "pending-review",
    suitableFor: ["business_cabin"],
  },
  {
    order: 6,
    key: "stabilizer-bar",
    name: "平衡杆",
    category: "chassis",
    summary: "需到店评估安装位，不做性能承诺",
    imageStatus: "pending-review",
    suitableFor: ["driving_protection"],
    caution: "平衡杆安装需到店确认车身接口和安装位，到店评估适配性",
  },
  {
    order: 7,
    key: "floor-mats-360",
    name: "360 软包脚垫",
    category: "cabin_protection",
    summary: "全包围脚垫、易清洁、保护原车地毯",
    imageStatus: "pending-review",
    suitableFor: ["new_car_protection", "business_cabin"],
  },
  {
    order: 8,
    key: "underbody-skid-plate",
    name: "底盘护板",
    category: "chassis",
    summary: "加强底部关键区域防护，适合新车基础防护",
    imageStatus: "pending-review",
    suitableFor: ["new_car_protection", "driving_protection"],
  },
  {
    order: 9,
    key: "sport-body-kit",
    name: "包围",
    category: "appearance",
    summary: "提升前后杠、侧裙等区域的视觉完整度",
    imageStatus: "pending-review",
    suitableFor: ["appearance"],
  },
  {
    order: 10,
    key: "bug-screen",
    name: "防虫网",
    category: "driving_protection",
    summary: "减少虫石杂物进入前部格栅或进风区域",
    imageStatus: "pending-review",
    suitableFor: ["driving_protection"],
  },
  {
    order: 11,
    key: "rear-wing",
    name: "尾翼",
    category: "appearance",
    summary: "车尾视觉装饰，强化尾部层次",
    imageStatus: "pending-review",
    suitableFor: ["appearance", "lighting_detail"],
  },
  {
    order: 12,
    key: "soft-close-doors",
    name: "主副驾电吸门",
    category: "business_cabin",
    summary: "前排关门便利与高级感，需确认接口和门体结构",
    imageStatus: "pending-review",
    suitableFor: ["business_cabin"],
    caution: "主副驾电吸门需到店确认接口和门体结构，施工前告知风险与边界",
  },
  {
    order: 13,
    key: "brake-caliper",
    name: "刹车卡钳",
    category: "appearance",
    summary: "轮毂区域视觉点缀，不做制动性能承诺",
    imageStatus: "pending-review",
    suitableFor: ["appearance", "lighting_detail"],
    caution: "刹车卡钳为外观视觉升级，不做制动性能提升承诺",
  },
  {
    order: 14,
    key: "welcome-step",
    name: "迎宾踏板",
    category: "business_cabin",
    summary: "上下车高频区域防护与迎宾质感",
    imageStatus: "pending-review",
    suitableFor: ["business_cabin", "lighting_detail"],
  },
  {
    order: 15,
    key: "rear-table-tray",
    name: "小桌板",
    category: "business_cabin",
    summary: "二排办公、用餐、儿童使用和长途出行便利",
    imageStatus: "pending-review",
    suitableFor: ["business_cabin"],
  },
  {
    order: 16,
    key: "headlight-upgrade",
    name: "大灯",
    category: "lighting",
    summary: "灯组外观与视觉升级，需合规确认",
    imageStatus: "pending-review",
    suitableFor: ["lighting_detail"],
    caution: "大灯项目只涉及视觉方向，需确认合规边界和年检适配",
  },
  {
    order: 17,
    key: "wheel-rims",
    name: "轮毂",
    category: "appearance",
    summary: "改变侧面姿态和整车视觉风格",
    imageStatus: "pending-review",
    suitableFor: ["appearance"],
  },
  {
    order: 18,
    key: "interior-coating",
    name: "内饰镀膜",
    category: "interior_care",
    summary: "皮革、饰板和高频触碰区域防污易清洁",
    imageStatus: "pending-review",
    suitableFor: ["new_car_protection", "business_cabin"],
  },
];

// ---- 5 大用车场景 ----

export const liAutoMegaScenarios: readonly LiAutoMegaScenario[] = [
  {
    key: "new_car_protection",
    name: "新车基础保护",
    description: "刚提车优先解决漆面、玻璃、地毯、底盘和座舱保护",
    projectKeys: [
      "paint-protection-film",
      "window-film",
      "floor-mats-360",
      "underbody-skid-plate",
      "interior-coating",
    ],
  },
  {
    key: "business_cabin",
    name: "商务座舱与便利",
    description: "面向商务接待、家庭多人出行和二排高频使用",
    projectKeys: [
      "aluminum-floor",
      "welcome-step",
      "rear-table-tray",
      "soft-close-doors",
      "floor-mats-360",
      "interior-coating",
    ],
  },
  {
    key: "appearance",
    name: "外观个性升级",
    description: "强化 MEGA 大车身的视觉辨识度和细节完整感",
    projectKeys: [
      "graphic-wrap",
      "two-tone-color-wrap",
      "sport-body-kit",
      "rear-wing",
      "wheel-rims",
      "brake-caliper",
    ],
  },
  {
    key: "driving_protection",
    name: "行车与底盘防护",
    description: "关注底部防护、前部格栅和行车环境",
    projectKeys: [
      "underbody-skid-plate",
      "stabilizer-bar",
      "bug-screen",
    ],
  },
  {
    key: "lighting_detail",
    name: "灯光与细节视觉",
    description: "强化高可见区域细节，但不承诺性能结果",
    projectKeys: [
      "headlight-upgrade",
      "brake-caliper",
      "welcome-step",
      "rear-wing",
    ],
  },
];

// ---- 5 个推荐组合 ----

export const liAutoMegaBundles: readonly LiAutoMegaBundle[] = [
  {
    key: "new-car-protection",
    name: "新车基础保护组合",
    description: "刚提车优先做这 5 项",
    projectKeys: [
      "paint-protection-film",
      "window-film",
      "floor-mats-360",
      "underbody-skid-plate",
      "interior-coating",
    ],
  },
  {
    key: "business-cabin",
    name: "商务座舱与上下车便利组合",
    description: "商务接待与家庭出行更舒适",
    projectKeys: [
      "aluminum-floor",
      "welcome-step",
      "rear-table-tray",
      "soft-close-doors",
      "interior-coating",
    ],
  },
  {
    key: "appearance",
    name: "外观个性升级组合",
    description: "MEGA 大车身视觉辨识度提升",
    projectKeys: [
      "graphic-wrap",
      "two-tone-color-wrap",
      "sport-body-kit",
      "rear-wing",
      "wheel-rims",
      "brake-caliper",
    ],
  },
  {
    key: "driving-protection",
    name: "行车与底盘防护组合",
    description: "底部防护与行车环境保障",
    projectKeys: [
      "underbody-skid-plate",
      "stabilizer-bar",
      "bug-screen",
    ],
  },
  {
    key: "lighting-detail",
    name: "灯光与细节视觉组合",
    description: "高可见区域细节质感提升",
    projectKeys: [
      "headlight-upgrade",
      "welcome-step",
      "rear-wing",
      "brake-caliper",
    ],
  },
];

// ---- 7 步服务流程 ----

export const liAutoMegaServiceSteps: readonly LiAutoMegaServiceStep[] = [
  {
    step: 1,
    title: "车型确认",
    description: "确认理想 MEGA 的年份、批次、版本和配置",
  },
  {
    step: 2,
    title: "项目选择",
    description: "根据新车保护、商务座舱、外观个性或行车防护场景选择项目",
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
];

// ---- 9 条 FAQ ----

export const liAutoMegaFaq: readonly LiAutoMegaFaqItem[] = [
  {
    question: "理想 MEGA 的这些升级项目是否都能安装？",
    answer:
      "不同年份、版本和配置可能不同，需到店评估确认；具体安装可行性以现场车辆情况和施工评估为准。",
  },
  {
    question: "新车最推荐先做什么？",
    answer:
      "车衣、隔热膜、360 软包脚垫、底盘护板、内饰镀膜；优先解决漆面、玻璃、地毯、底盘和座舱保护。",
  },
  {
    question: "商务座舱项目有哪些？",
    answer:
      "铝地板、迎宾踏板、小桌板、主副驾电吸门、360 软包脚垫、内饰镀膜；面向商务接待和二排高频使用。",
  },
  {
    question: "外观升级项目有哪些？",
    answer: "彩绘、双拼改色、包围、尾翼、轮毂、刹车卡钳；强化 MEGA 大车身视觉辨识度。",
  },
  {
    question: "大灯升级合规吗？",
    answer:
      "只涉及灯组外观视觉方向，需到店确认合规边界和年检适配，不做照明性能提升承诺。",
  },
  {
    question: "电吸门是否无损安装？",
    answer:
      "需到店确认接口、门体结构和售后边界，不做无损或质保承诺。",
  },
  {
    question: "可以只做单个项目吗？",
    answer:
      "可以，页面项目既支持单项了解，也支持组合方案；具体施工内容以到店评估为准。",
  },
  {
    question: "是否影响原车质保？",
    answer:
      "不做不影响质保的承诺；具体以车辆情况和项目评估为准，施工前会告知风险与边界。",
  },
  {
    question: "工期多久？",
    answer:
      "根据项目组合、库存和施工排期确认；不同项目工期差异较大，到店评估后会给出明确工期。",
  },
];

// ---- Runtime 断言（防漂移）----

export function assertLiAutoMegaDataShape(): void {
  // 1. 每个数组 length === 对应常量
  if (liAutoMegaUpgradeProjects.length !== LI_AUTO_MEGA_PROJECT_COUNT) {
    throw new Error(
      `LiAutoMega project count drift: expected ${LI_AUTO_MEGA_PROJECT_COUNT}, got ${liAutoMegaUpgradeProjects.length}`,
    );
  }
  if (liAutoMegaScenarios.length !== LI_AUTO_MEGA_SCENARIO_COUNT) {
    throw new Error(
      `LiAutoMega scenario count drift: expected ${LI_AUTO_MEGA_SCENARIO_COUNT}, got ${liAutoMegaScenarios.length}`,
    );
  }
  if (liAutoMegaBundles.length !== LI_AUTO_MEGA_BUNDLE_COUNT) {
    throw new Error(
      `LiAutoMega bundle count drift: expected ${LI_AUTO_MEGA_BUNDLE_COUNT}, got ${liAutoMegaBundles.length}`,
    );
  }
  if (liAutoMegaServiceSteps.length !== LI_AUTO_MEGA_SERVICE_STEP_COUNT) {
    throw new Error(
      `LiAutoMega service step count drift: expected ${LI_AUTO_MEGA_SERVICE_STEP_COUNT}, got ${liAutoMegaServiceSteps.length}`,
    );
  }
  if (liAutoMegaFaq.length !== LI_AUTO_MEGA_FAQ_COUNT) {
    throw new Error(
      `LiAutoMega FAQ count drift: expected ${LI_AUTO_MEGA_FAQ_COUNT}, got ${liAutoMegaFaq.length}`,
    );
  }

  // 2. order 单调递增 1-18
  liAutoMegaUpgradeProjects.forEach((p, i) => {
    if (p.order !== i + 1) {
      throw new Error(
        `LiAutoMega project order drift at index ${i}: expected ${i + 1}, got ${p.order}`,
      );
    }
  });

  // 3. service steps step 连续 1-7
  liAutoMegaServiceSteps.forEach((s, i) => {
    if (s.step !== i + 1) {
      throw new Error(
        `LiAutoMega service step order drift at index ${i}: expected ${i + 1}, got ${s.step}`,
      );
    }
  });

  // 4. project keys 唯一
  const projectKeys = new Set<string>();
  for (const p of liAutoMegaUpgradeProjects) {
    if (projectKeys.has(p.key)) {
      throw new Error(`LiAutoMega duplicate project key: ${p.key}`);
    }
    projectKeys.add(p.key);
  }

  // 5. scenario keys 唯一
  const scenarioKeys = new Set<string>();
  for (const s of liAutoMegaScenarios) {
    if (scenarioKeys.has(s.key)) {
      throw new Error(`LiAutoMega duplicate scenario key: ${s.key}`);
    }
    scenarioKeys.add(s.key);
  }

  // 6. bundle keys 唯一
  const bundleKeys = new Set<string>();
  for (const b of liAutoMegaBundles) {
    if (bundleKeys.has(b.key)) {
      throw new Error(`LiAutoMega duplicate bundle key: ${b.key}`);
    }
    bundleKeys.add(b.key);
  }

  // 7. FAQ questions 唯一
  const faqQuestions = new Set<string>();
  for (const f of liAutoMegaFaq) {
    if (faqQuestions.has(f.question)) {
      throw new Error(`LiAutoMega duplicate FAQ question: ${f.question}`);
    }
    faqQuestions.add(f.question);
  }

  // 8. scenario.projectKeys 引用存在的 project key
  for (const s of liAutoMegaScenarios) {
    for (const pk of s.projectKeys) {
      if (!projectKeys.has(pk)) {
        throw new Error(
          `LiAutoMega scenario "${s.key}" references unknown project key: ${pk}`,
        );
      }
    }
  }

  // 9. bundle.projectKeys 引用存在的 project key
  for (const b of liAutoMegaBundles) {
    for (const pk of b.projectKeys) {
      if (!projectKeys.has(pk)) {
        throw new Error(
          `LiAutoMega bundle "${b.key}" references unknown project key: ${pk}`,
        );
      }
    }
  }

  // 10. 每个 project 至少被一个 scenario 引用
  const referencedByScenario = new Set<string>();
  for (const s of liAutoMegaScenarios) {
    for (const pk of s.projectKeys) {
      referencedByScenario.add(pk);
    }
  }
  for (const p of liAutoMegaUpgradeProjects) {
    if (!referencedByScenario.has(p.key)) {
      throw new Error(
        `LiAutoMega project "${p.key}" is not referenced by any scenario`,
      );
    }
  }

  // 11. 所有 category 都有中文标签
  const allCategories = new Set(
    liAutoMegaUpgradeProjects.map((p) => p.category),
  );
  for (const cat of allCategories) {
    if (!CATEGORY_LABELS[cat as LiAutoMegaCategory]) {
      throw new Error(`LiAutoMega missing category label for: ${cat}`);
    }
  }
}

// 模块加载即触发断言
assertLiAutoMegaDataShape();
