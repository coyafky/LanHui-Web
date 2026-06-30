/**
 * 理想 L9 专题页静态数据
 *
 * 数据派生自 `docs/PRD/product/LI_AUTO_TOPIC_PRD_2026-06-24.md` §7-§9。
 *
 * 字段值零变更：与 PRD 完全对齐。
 * 当前全部 pending-review（无实际图片），publicPath / width / height / aspectRatio 均省略。
 *
 * 字面量防漂移（参考 ZEEKR v1 / Tesla v1 / NIO ES8 v1 模式）：
 *   - 14 个项目 / 5 场景 / 4 组合 / 7 步 / 9 FAQ 用 count 常量 + runtime assert 双重保证
 *   - order 单调递增 1-14
 *   - 所有 key 唯一互不冲突
 */

// ---- 字面量类型 ----

export type LiAutoL9ImageStatus =
  | "matched"
  | "generated-preview"
  | "pending-review"
  | "missing";

export type LiAutoL9Category =
  | "protection"
  | "film"
  | "appearance"
  | "family_cabin"
  | "chassis"
  | "driving_protection"
  | "screen_care"
  | "detail_care";

export type LiAutoL9ScenarioKey =
  | "new_car_protection"
  | "family_cabin"
  | "appearance"
  | "driving_protection"
  | "screen_detail";

export type LiAutoL9UpgradeProject = {
  /** 1-14，严格单调递增 */
  order: number;
  /** 稳定 slug */
  key: string;
  /** 中文名 */
  name: string;
  category: LiAutoL9Category;
  /** 1 句话价值说明 */
  summary: string;
  /** 当前全 pending-review，无实际图片 */
  publicPath?: `/images/products/li-auto/l9/${string}.png`;
  /** 字面量 1448（仅当有图片时） */
  width?: 1448;
  /** 字面量 1086 */
  height?: 1086;
  /** 字面量 "4/3" */
  aspectRatio?: "4/3";
  imageStatus: LiAutoL9ImageStatus;
  /** 适配场景 */
  suitableFor: readonly LiAutoL9ScenarioKey[];
  /** 可选注意事项 */
  caution?: string;
};

export type LiAutoL9Scenario = {
  key: LiAutoL9ScenarioKey;
  name: string;
  description: string;
  projectKeys: readonly string[];
};

export type LiAutoL9Bundle = {
  key: string;
  name: string;
  description: string;
  projectKeys: readonly string[];
};

export type LiAutoL9ServiceStep = {
  step: number;
  title: string;
  description: string;
};

export type LiAutoL9FaqItem = {
  question: string;
  answer: string;
};

// ---- 类别中文标签 ----

export const CATEGORY_LABELS: Record<LiAutoL9Category, string> = {
  protection: "新车保护",
  film: "膜系",
  appearance: "外观个性",
  family_cabin: "家庭座舱",
  chassis: "底盘",
  driving_protection: "行车防护",
  screen_care: "屏幕养护",
  detail_care: "细节装饰",
};

// ---- count 常量 ----

export const LI_AUTO_L9_PROJECT_COUNT = 14;
export const LI_AUTO_L9_SCENARIO_COUNT = 5;
export const LI_AUTO_L9_BUNDLE_COUNT = 4;
export const LI_AUTO_L9_SERVICE_STEP_COUNT = 7;
export const LI_AUTO_L9_FAQ_COUNT = 9;

// ---- 14 项升级项目（PRD §7）----

export const liAutoL9UpgradeProjects: readonly LiAutoL9UpgradeProject[] = [
  {
    order: 1,
    key: "paint-protection-film",
    name: "隐形车衣",
    category: "protection",
    summary: "漆面保护、日常划痕防护、保持车身质感",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/l9/generated/paint-protection-film.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["new_car_protection"],
  },
  {
    order: 2,
    key: "window-film",
    name: "隔热窗膜",
    category: "film",
    summary: "隔热、防晒、隐私与驾乘舒适",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/l9/generated/window-film.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["new_car_protection"],
  },
  {
    order: 3,
    key: "color-wrap",
    name: "彩绘改色",
    category: "appearance",
    summary: "个性化车身视觉、主题改色与辨识度",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/l9/generated/graphic-color-wrap.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["appearance"],
  },
  {
    order: 4,
    key: "electric-steps",
    name: "电动踏板",
    category: "family_cabin",
    summary: "适合老人、小孩和家庭高频上下车场景",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/l9/generated/electric-side-step.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["family_cabin"],
  },
  {
    order: 5,
    key: "floor-mats-360",
    name: "360 航空脚垫",
    category: "family_cabin",
    summary: "全包围脚垫、易清洁、保护地毯",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/l9/generated/aviation-floor-mats-360.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["new_car_protection", "family_cabin"],
  },
  {
    order: 6,
    key: "aluminum-floor",
    name: "铝合金地板",
    category: "family_cabin",
    summary: "后排和尾箱易清洁，提升耐用与质感",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/l9/generated/aluminum-alloy-floor.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["family_cabin"],
  },
  {
    order: 7,
    key: "stabilizer-bar",
    name: "平衡杆",
    category: "chassis",
    summary: "需到店评估安装位和适配情况",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/l9/generated/stabilizer-bar.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["driving_protection"],
    caution: "平衡杆安装需到店确认车身接口和安装位，到店评估适配性",
  },
  {
    order: 8,
    key: "underbody-skid-plate",
    name: "底盘护板",
    category: "chassis",
    summary: "加强底部关键区域防护，适合新车基础防护",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/l9/generated/underbody-skid-plate.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["new_car_protection", "driving_protection"],
  },
  {
    order: 9,
    key: "sport-wheels",
    name: "运动轮毂",
    category: "appearance",
    summary: "改变侧面姿态和整车视觉风格",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/l9/generated/sport-wheel-rims.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["appearance"],
  },
  {
    order: 10,
    key: "bug-screen",
    name: "防虫网",
    category: "driving_protection",
    summary: "减少虫石杂物进入前部格栅区域",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/l9/generated/bug-screen.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["driving_protection"],
  },
  {
    order: 11,
    key: "screen-protector",
    name: "中控钢化膜",
    category: "screen_care",
    summary: "中控屏幕防刮保护，降低高频触控磨损",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/l9/generated/center-screen-protector.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["new_car_protection", "screen_detail"],
  },
  {
    order: 12,
    key: "hud-cover",
    name: "HUD 显示罩",
    category: "screen_care",
    summary: "保护 HUD 显示相关区域，需确认具体安装位",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/l9/generated/hud-cover.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["family_cabin", "screen_detail"],
    caution: "HUD 显示罩需到店确认具体安装位",
  },
  {
    order: 13,
    key: "license-plate-frame",
    name: "牌照框",
    category: "detail_care",
    summary: "车头车尾细节装饰和牌照区域保护",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/l9/generated/license-plate-frame.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["appearance", "screen_detail"],
  },
  {
    order: 14,
    key: "mud-flap",
    name: "挡泥板",
    category: "driving_protection",
    summary: "减少泥水飞溅和车身侧面污染",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/l9/generated/mud-flap.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["driving_protection"],
  },
];

// ---- 5 大用车场景（PRD §8）----

export const liAutoL9Scenarios: readonly LiAutoL9Scenario[] = [
  {
    key: "new_car_protection",
    name: "新车基础保护",
    description: "刚提车优先解决漆面、玻璃、地毯、底盘和屏幕保护",
    projectKeys: [
      "paint-protection-film",
      "window-film",
      "floor-mats-360",
      "underbody-skid-plate",
      "screen-protector",
    ],
  },
  {
    key: "family_cabin",
    name: "家庭座舱与便利",
    description: "面向老人、小孩、后排高频使用和日常清洁",
    projectKeys: [
      "electric-steps",
      "floor-mats-360",
      "aluminum-floor",
      "hud-cover",
    ],
  },
  {
    key: "appearance",
    name: "外观个性升级",
    description: "强化车身视觉辨识度和细节完整感",
    projectKeys: [
      "color-wrap",
      "sport-wheels",
      "license-plate-frame",
    ],
  },
  {
    key: "driving_protection",
    name: "行车与日常防护",
    description: "关注底部防护、前部格栅、泥水飞溅和行车环境",
    projectKeys: [
      "underbody-skid-plate",
      "stabilizer-bar",
      "bug-screen",
      "mud-flap",
    ],
  },
  {
    key: "screen_detail",
    name: "屏幕与细节保护",
    description: "保护高频触控与高可见细节区域",
    projectKeys: [
      "screen-protector",
      "hud-cover",
      "license-plate-frame",
    ],
  },
];

// ---- 4 个推荐组合（PRD §9）----

export const liAutoL9Bundles: readonly LiAutoL9Bundle[] = [
  {
    key: "new-car-protection",
    name: "新车基础保护组合",
    description: "刚提车优先做这 5 项",
    projectKeys: [
      "paint-protection-film",
      "window-film",
      "floor-mats-360",
      "underbody-skid-plate",
      "screen-protector",
    ],
  },
  {
    key: "family-cabin",
    name: "家庭座舱与上下车便利组合",
    description: "老人小孩上下车更方便，座舱易清洁",
    projectKeys: [
      "electric-steps",
      "floor-mats-360",
      "aluminum-floor",
      "hud-cover",
    ],
  },
  {
    key: "appearance",
    name: "外观个性升级组合",
    description: "车身视觉辨识度提升",
    projectKeys: [
      "color-wrap",
      "sport-wheels",
      "license-plate-frame",
    ],
  },
  {
    key: "driving-protection",
    name: "行车与日常防护组合",
    description: "底部防护与行车环境保障",
    projectKeys: [
      "underbody-skid-plate",
      "stabilizer-bar",
      "bug-screen",
      "mud-flap",
    ],
  },
];

// ---- 7 步服务流程 ----

export const liAutoL9ServiceSteps: readonly LiAutoL9ServiceStep[] = [
  {
    step: 1,
    title: "车型确认",
    description: "确认理想 L9 的年份、批次、版本和配置",
  },
  {
    step: 2,
    title: "项目选择",
    description: "根据新车保护、家庭座舱、外观个性或行车防护场景选择项目",
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

export const liAutoL9Faq: readonly LiAutoL9FaqItem[] = [
  {
    question: "理想 L9 的这些升级项目是否都能安装？",
    answer:
      "不同年份、版本和配置可能不同，需到店评估确认；具体安装可行性以现场车辆情况和施工评估为准。",
  },
  {
    question: "新车最推荐先做什么？",
    answer:
      "隐形车衣、隔热窗膜、360 航空脚垫、底盘护板、中控钢化膜；优先解决漆面、玻璃、地毯、底盘和屏幕保护。",
  },
  {
    question: "家庭座舱项目有哪些？",
    answer:
      "电动踏板、360 航空脚垫、铝合金地板、HUD 显示罩；面向老人小孩上下车便利和座舱清洁。",
  },
  {
    question: "外观升级项目有哪些？",
    answer: "彩绘改色、运动轮毂、牌照框；强化车身视觉辨识度和细节完整感。",
  },
  {
    question: "行车防护项目有哪些？",
    answer:
      "底盘护板、平衡杆、防虫网、挡泥板；关注底部防护、前部格栅和车身侧面清洁。",
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
  {
    question: "图片是真实施工案例吗？",
    answer:
      "当前暂无实际施工图片，待后续补充；真实施工以到店沟通和现场评估为准。",
  },
];

// ---- Runtime 断言（防漂移）----

export function assertLiAutoL9DataShape(): void {
  // 1. 每个数组 length === 对应常量
  if (liAutoL9UpgradeProjects.length !== LI_AUTO_L9_PROJECT_COUNT) {
    throw new Error(
      `LiAutoL9 project count drift: expected ${LI_AUTO_L9_PROJECT_COUNT}, got ${liAutoL9UpgradeProjects.length}`,
    );
  }
  if (liAutoL9Scenarios.length !== LI_AUTO_L9_SCENARIO_COUNT) {
    throw new Error(
      `LiAutoL9 scenario count drift: expected ${LI_AUTO_L9_SCENARIO_COUNT}, got ${liAutoL9Scenarios.length}`,
    );
  }
  if (liAutoL9Bundles.length !== LI_AUTO_L9_BUNDLE_COUNT) {
    throw new Error(
      `LiAutoL9 bundle count drift: expected ${LI_AUTO_L9_BUNDLE_COUNT}, got ${liAutoL9Bundles.length}`,
    );
  }
  if (liAutoL9ServiceSteps.length !== LI_AUTO_L9_SERVICE_STEP_COUNT) {
    throw new Error(
      `LiAutoL9 service step count drift: expected ${LI_AUTO_L9_SERVICE_STEP_COUNT}, got ${liAutoL9ServiceSteps.length}`,
    );
  }
  if (liAutoL9Faq.length !== LI_AUTO_L9_FAQ_COUNT) {
    throw new Error(
      `LiAutoL9 FAQ count drift: expected ${LI_AUTO_L9_FAQ_COUNT}, got ${liAutoL9Faq.length}`,
    );
  }

  // 2. order 单调递增 1-14
  liAutoL9UpgradeProjects.forEach((p, i) => {
    if (p.order !== i + 1) {
      throw new Error(
        `LiAutoL9 project order drift at index ${i}: expected ${i + 1}, got ${p.order}`,
      );
    }
  });

  // 3. service steps step 连续 1-7
  liAutoL9ServiceSteps.forEach((s, i) => {
    if (s.step !== i + 1) {
      throw new Error(
        `LiAutoL9 service step order drift at index ${i}: expected ${i + 1}, got ${s.step}`,
      );
    }
  });

  // 4. project keys 唯一
  const projectKeys = new Set<string>();
  for (const p of liAutoL9UpgradeProjects) {
    if (projectKeys.has(p.key)) {
      throw new Error(`LiAutoL9 duplicate project key: ${p.key}`);
    }
    projectKeys.add(p.key);
  }

  // 5. scenario keys 唯一
  const scenarioKeys = new Set<string>();
  for (const s of liAutoL9Scenarios) {
    if (scenarioKeys.has(s.key)) {
      throw new Error(`LiAutoL9 duplicate scenario key: ${s.key}`);
    }
    scenarioKeys.add(s.key);
  }

  // 6. bundle keys 惟一
  const bundleKeys = new Set<string>();
  for (const b of liAutoL9Bundles) {
    if (bundleKeys.has(b.key)) {
      throw new Error(`LiAutoL9 duplicate bundle key: ${b.key}`);
    }
    bundleKeys.add(b.key);
  }

  // 7. FAQ keys 不冲突（使用 question 作为标识）
  const faqQuestions = new Set<string>();
  for (const f of liAutoL9Faq) {
    if (faqQuestions.has(f.question)) {
      throw new Error(`LiAutoL9 duplicate FAQ question: ${f.question}`);
    }
    faqQuestions.add(f.question);
  }

  // 8. scenario.projectKeys 引用存在的 project key
  for (const s of liAutoL9Scenarios) {
    for (const pk of s.projectKeys) {
      if (!projectKeys.has(pk)) {
        throw new Error(
          `LiAutoL9 scenario "${s.key}" references unknown project key: ${pk}`,
        );
      }
    }
  }

  // 9. bundle.projectKeys 引用存在的 project key
  for (const b of liAutoL9Bundles) {
    for (const pk of b.projectKeys) {
      if (!projectKeys.has(pk)) {
        throw new Error(
          `LiAutoL9 bundle "${b.key}" references unknown project key: ${pk}`,
        );
      }
    }
  }

  // 10. 每个 project 至少被一个 scenario 引用
  const referencedByScenario = new Set<string>();
  for (const s of liAutoL9Scenarios) {
    for (const pk of s.projectKeys) {
      referencedByScenario.add(pk);
    }
  }
  for (const p of liAutoL9UpgradeProjects) {
    if (!referencedByScenario.has(p.key)) {
      throw new Error(
        `LiAutoL9 project "${p.key}" is not referenced by any scenario`,
      );
    }
  }

  // 11. 所有 category 都有中文标签
  const allCategories = new Set(
    liAutoL9UpgradeProjects.map((p) => p.category),
  );
  for (const cat of allCategories) {
    if (!CATEGORY_LABELS[cat as LiAutoL9Category]) {
      throw new Error(`LiAutoL9 missing category label for: ${cat}`);
    }
  }
}

// 模块加载即触发断言
assertLiAutoL9DataShape();
