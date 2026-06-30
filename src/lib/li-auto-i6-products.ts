/**
 * 理想 i6 专题页静态数据
 *
 * 数据来源 PRD：
 *   docs/PRD/product/LI_AUTO_I6_TOPIC_PRD_2026-06-27.md
 *
 * 节号映射：
 *   §7   20 项热门轻改产品目录  → liAutoI6UpgradeProjects  (length === 20)
 *   §8   5 大用车场景           → liAutoI6Scenarios        (length === 5)
 *   §9   5 个推荐组合           → liAutoI6Bundles          (length === 5)
 *   §11  7 步服务流程           → liAutoI6ServiceSteps     (length === 7)
 *   §11  9 条 FAQ               → liAutoI6Faq              (length === 9)
 *
 * 字面量防漂移（参考 NIO ES8 模式）：
 *   - 图片状态 `pending-review`，暂无 publicPath
 *   - 所有数组长度用 `as const` runtime check + 测试双重保证
 */

export type LiAutoI6ImageStatus =
  | "matched"
  | "generated-preview"
  | "pending-review"
  | "missing";

export type LiAutoI6Category =
  | "protection"
  | "film"
  | "appearance"
  | "cabin_protection"
  | "cabin_atmosphere"
  | "cabin_comfort"
  | "chassis"
  | "driving_protection"
  | "screen_care"
  | "interior_care";

export type LiAutoI6UpgradeProject = {
  /** 01-20，与海报顺序对齐 */
  order: number;
  /** 稳定 slug */
  key: string;
  /** 中文名 */
  name: string;
  category: LiAutoI6Category;
  /** 1 句话价值说明 */
  summary: string;
  /** 可选图片路径（pending-review 阶段无图片） */
  publicPath?: `/images/products/li-auto/i6/${string}.png`;
  /** 字面量 1448（有图时） */
  width?: 1448;
  /** 字面量 1086（有图时） */
  height?: 1086;
  /** 字面量 "4/3"（有图时） */
  aspectRatio?: "4/3";
  imageStatus: LiAutoI6ImageStatus;
  /** 适配场景标签 */
  suitableFor: readonly string[];
  /** 可选项 — 安装注意事项或到店评估提示 */
  caution?: string;
};

export type LiAutoI6ScenarioKey =
  | "protection"
  | "cabin_atmosphere"
  | "appearance"
  | "smart_screen"
  | "driving_protection";

export type LiAutoI6Scenario = {
  key: LiAutoI6ScenarioKey;
  name: string;
  description: string;
  /** 引用的 LiAutoI6UpgradeProject.key */
  projectKeys: readonly string[];
};

export type LiAutoI6Bundle = {
  key: string;
  name: string;
  description: string;
  projectKeys: readonly string[];
};

export type LiAutoI6ServiceStep = {
  step: number;
  title: string;
  description: string;
};

export type LiAutoI6FaqItem = {
  question: string;
  answer: string;
};

// ---- 字面量约束（防漂移）----

export const LI_AUTO_I6_PROJECT_COUNT = 20;
export const LI_AUTO_I6_SCENARIO_COUNT = 5;
export const LI_AUTO_I6_BUNDLE_COUNT = 5;
export const LI_AUTO_I6_SERVICE_STEP_COUNT = 7;
export const LI_AUTO_I6_FAQ_COUNT = 9;

// ---- 20 项轻改项目（PRD §7，与海报顺序对齐）----

export const liAutoI6UpgradeProjects: readonly LiAutoI6UpgradeProject[] = [
  {
    order: 1,
    key: "paint-protection-film",
    name: "车衣",
    category: "protection",
    summary: "漆面保护、日常划痕防护、保持车身质感",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-paint-protection-film.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["protection"],
  },
  {
    order: 2,
    key: "window-film",
    name: "隔热膜",
    category: "film",
    summary: "隔热、防晒、隐私与驾乘舒适",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-window-film.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["protection"],
  },
  {
    order: 3,
    key: "graphic-wrap",
    name: "彩绘",
    category: "appearance",
    summary: "个性化车身视觉，适合主题表达",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-color-graphic.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["appearance"],
  },
  {
    order: 4,
    key: "two-tone-color-wrap",
    name: "双拼改色",
    category: "appearance",
    summary: "强化车身层次感和侧面辨识度",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-two-tone-color.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["appearance"],
  },
  {
    order: 5,
    key: "floor-mats-360",
    name: "360 软包脚垫",
    category: "cabin_protection",
    summary: "全包围脚垫、易清洁、保护原车地毯",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-floor-mat-360.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["protection", "cabin_atmosphere"],
  },
  {
    order: 6,
    key: "star-ceiling",
    name: "星空顶",
    category: "cabin_atmosphere",
    summary: "车顶星空氛围，提升夜间座舱体验",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-starlight-roof.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["cabin_atmosphere"],
  },
  {
    order: 7,
    key: "stabilizer-bar",
    name: "平衡杆",
    category: "chassis",
    summary: "需到店评估安装位，不做性能承诺",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-sway-bar.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["driving_protection"],
    caution: "需到店评估安装位和接口适配性",
  },
  {
    order: 8,
    key: "star-film",
    name: "星空膜",
    category: "cabin_atmosphere",
    summary: "车内氛围光影和星空视觉效果",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-starlight-film.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["cabin_atmosphere"],
  },
  {
    order: 9,
    key: "underbody-skid-plate",
    name: "底盘护板",
    category: "chassis",
    summary: "加强底部关键区域防护，适合新车基础防护",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-skid-plate.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["protection", "driving_protection"],
  },
  {
    order: 10,
    key: "rear-table-tray",
    name: "小桌板",
    category: "cabin_comfort",
    summary: "后排办公、用餐、儿童使用和短途休息",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-rear-table.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["cabin_atmosphere"],
  },
  {
    order: 11,
    key: "fragrance-system",
    name: "香氛系统",
    category: "cabin_comfort",
    summary: "提升座舱气味体验和精致感",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-fragrance-system.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["cabin_atmosphere"],
  },
  {
    order: 12,
    key: "wheel-rims",
    name: "轮毂",
    category: "appearance",
    summary: "改变侧面姿态和整车视觉风格",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-wheels.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["appearance"],
  },
  {
    order: 13,
    key: "streaming-rearview-mirror",
    name: "流媒体后视镜",
    category: "screen_care",
    summary: "后方视野显示和科技感，需确认电气适配",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-streaming-mirror.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["smart_screen"],
    caution: "涉及电气适配，需到店确认接口和安装可行性",
  },
  {
    order: 14,
    key: "screen-protector",
    name: "钢化膜",
    category: "screen_care",
    summary: "中控屏幕防刮保护，降低高频触控磨损",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-screen-protector.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["protection", "smart_screen"],
  },
  {
    order: 15,
    key: "brake-caliper",
    name: "刹车卡钳",
    category: "appearance",
    summary: "轮毂区域视觉点缀，不做制动性能承诺",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-brake-caliper.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["appearance"],
    caution: "仅作为视觉升级，不做制动性能承诺",
  },
  {
    order: 16,
    key: "welcome-step",
    name: "迎宾踏板",
    category: "cabin_protection",
    summary: "上下车高频区域防护与迎宾质感",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-door-sill.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["driving_protection"],
  },
  {
    order: 17,
    key: "bug-screen",
    name: "防虫网",
    category: "driving_protection",
    summary: "减少虫石杂物进入前部格栅或进风区域",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-bug-guard.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["driving_protection"],
  },
  {
    order: 18,
    key: "mud-flap",
    name: "挡泥板",
    category: "driving_protection",
    summary: "减少泥水飞溅和车身侧面污染",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-mud-flap.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["driving_protection"],
  },
  {
    order: 19,
    key: "hud-cover",
    name: "HUD 显示保护罩",
    category: "screen_care",
    summary: "保护 HUD 显示相关区域，需确认具体安装位",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-hud-protector.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["smart_screen"],
    caution: "需确认 HUD 或显示区域的具体安装位和适配性",
  },
  {
    order: 20,
    key: "interior-coating",
    name: "内饰镀膜",
    category: "interior_care",
    summary: "皮革、饰板和高频触碰区域防污易清洁",
    imageStatus: "generated-preview",
    publicPath: "/images/products/li-auto/i6/generated/i6-interior-coating.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    suitableFor: ["protection", "cabin_atmosphere"],
  },
];

// ---- 5 大用车场景（PRD §8）----

export const liAutoI6Scenarios: readonly LiAutoI6Scenario[] = [
  {
    key: "protection",
    name: "新车基础保护",
    description: "适合刚提车用户，优先解决漆面、玻璃、地毯、底盘、屏幕和座舱保护",
    projectKeys: [
      "paint-protection-film",
      "window-film",
      "floor-mats-360",
      "underbody-skid-plate",
      "screen-protector",
      "interior-coating",
    ],
  },
  {
    key: "cabin_atmosphere",
    name: "座舱氛围与舒适",
    description: "面向夜间氛围、家庭乘坐、后排使用和座舱精致感",
    projectKeys: [
      "star-ceiling",
      "star-film",
      "fragrance-system",
      "rear-table-tray",
      "interior-coating",
    ],
  },
  {
    key: "appearance",
    name: "外观个性升级",
    description: "强化 i6 城市 SUV 的视觉辨识度和个性表达",
    projectKeys: [
      "graphic-wrap",
      "two-tone-color-wrap",
      "wheel-rims",
      "brake-caliper",
    ],
  },
  {
    key: "smart_screen",
    name: "智能屏幕与显示保护",
    description: "保护高频显示和触控区域，提升智能座舱体验",
    projectKeys: [
      "streaming-rearview-mirror",
      "screen-protector",
      "hud-cover",
    ],
  },
  {
    key: "driving_protection",
    name: "行车与日常防护",
    description: "关注底部防护、前部格栅、泥水飞溅和上下车区域",
    projectKeys: [
      "underbody-skid-plate",
      "stabilizer-bar",
      "bug-screen",
      "mud-flap",
      "welcome-step",
    ],
  },
];

// ---- 5 个推荐组合（PRD §9）----

export const liAutoI6Bundles: readonly LiAutoI6Bundle[] = [
  {
    key: "new-car-protection",
    name: "新车基础保护组合",
    description: "适合刚提车的理想 i6 车主",
    projectKeys: [
      "paint-protection-film",
      "window-film",
      "floor-mats-360",
      "underbody-skid-plate",
      "screen-protector",
      "interior-coating",
    ],
  },
  {
    key: "cabin-atmosphere-comfort",
    name: "座舱氛围与舒适组合",
    description: "适合关注车内氛围和家庭使用的用户",
    projectKeys: [
      "star-ceiling",
      "star-film",
      "fragrance-system",
      "rear-table-tray",
      "interior-coating",
    ],
  },
  {
    key: "appearance-upgrade",
    name: "外观个性升级组合",
    description: "适合追求视觉辨识度的用户",
    projectKeys: [
      "graphic-wrap",
      "two-tone-color-wrap",
      "wheel-rims",
      "brake-caliper",
    ],
  },
  {
    key: "smart-screen-protection",
    name: "智能屏幕与显示保护组合",
    description: "适合关注智能座舱和屏幕细节的用户",
    projectKeys: [
      "streaming-rearview-mirror",
      "screen-protector",
      "hud-cover",
    ],
  },
  {
    key: "driving-daily-protection",
    name: "行车与日常防护组合",
    description: "适合关注日常防护和车身清洁的用户",
    projectKeys: [
      "underbody-skid-plate",
      "stabilizer-bar",
      "bug-screen",
      "mud-flap",
      "welcome-step",
    ],
  },
];

// ---- 7 步服务流程（PRD §11）----

export const liAutoI6ServiceSteps: readonly LiAutoI6ServiceStep[] = [
  {
    step: 1,
    title: "车型确认",
    description: "确认理想 i6 的年份、批次、版本和配置",
  },
  {
    step: 2,
    title: "项目选择",
    description: "根据新车保护、座舱氛围、外观个性、智能屏幕或行车防护选择项目",
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

// ---- 9 条 FAQ（PRD §11）----

export const liAutoI6Faq: readonly LiAutoI6FaqItem[] = [
  {
    question: "理想 i6 的这些项目是否都能安装？",
    answer:
      "不同年份、版本和配置可能不同，需到店评估确认；具体安装可行性以现场车辆情况和施工评估为准。",
  },
  {
    question: "新车最推荐先做什么？",
    answer: "车衣、隔热膜、360 软包脚垫、底盘护板、钢化膜、内饰镀膜；优先解决保护和日常使用问题。",
  },
  {
    question: "座舱氛围项目有哪些？",
    answer: "星空顶、星空膜、香氛系统、小桌板、内饰镀膜；面向夜间氛围、家庭乘坐、后排使用和座舱精致感。",
  },
  {
    question: "外观个性项目有哪些？",
    answer: "彩绘、双拼改色、轮毂、刹车卡钳；强化 i6 城市 SUV 的视觉辨识度和个性表达。",
  },
  {
    question: "智能屏幕项目有哪些？",
    answer: "流媒体后视镜、钢化膜、HUD 显示保护罩；保护高频显示和触控区域，提升智能座舱体验。",
  },
  {
    question: "行车防护项目有哪些？",
    answer: "底盘护板、平衡杆、防虫网、挡泥板、迎宾踏板；关注底部防护、前部格栅和上下车区域。",
  },
  {
    question: "可以只做单个项目吗？",
    answer: "可以，页面项目既支持单项了解，也支持组合方案；具体施工内容以到店评估为准。",
  },
  {
    question: "是否影响原车质保？",
    answer: "不做不影响质保的承诺；具体以车辆情况和项目评估为准，施工前会告知风险与边界。",
  },
  {
    question: "工期多久？",
    answer: "根据项目组合、库存和施工排期确认；不同项目工期差异较大，到店评估后会给出明确工期。",
  },
];

// ---- 字面量 runtime check（防漂移；模块加载即触发）----

if (liAutoI6UpgradeProjects.length !== LI_AUTO_I6_PROJECT_COUNT) {
  throw new Error(
    `LiAuto I6 project count drift: expected ${LI_AUTO_I6_PROJECT_COUNT}, got ${liAutoI6UpgradeProjects.length}`,
  );
}
if (liAutoI6Scenarios.length !== LI_AUTO_I6_SCENARIO_COUNT) {
  throw new Error(
    `LiAuto I6 scenario count drift: expected ${LI_AUTO_I6_SCENARIO_COUNT}, got ${liAutoI6Scenarios.length}`,
  );
}
if (liAutoI6Bundles.length !== LI_AUTO_I6_BUNDLE_COUNT) {
  throw new Error(
    `LiAuto I6 bundle count drift: expected ${LI_AUTO_I6_BUNDLE_COUNT}, got ${liAutoI6Bundles.length}`,
  );
}
if (liAutoI6ServiceSteps.length !== LI_AUTO_I6_SERVICE_STEP_COUNT) {
  throw new Error(
    `LiAuto I6 service step count drift: expected ${LI_AUTO_I6_SERVICE_STEP_COUNT}, got ${liAutoI6ServiceSteps.length}`,
  );
}
if (liAutoI6Faq.length !== LI_AUTO_I6_FAQ_COUNT) {
  throw new Error(
    `LiAuto I6 FAQ count drift: expected ${LI_AUTO_I6_FAQ_COUNT}, got ${liAutoI6Faq.length}`,
  );
}
