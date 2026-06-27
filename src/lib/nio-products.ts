/**
 * 蔚来 ES8 专题页静态数据
 *
 * 数据派生自 `public/images/products/nio-es8/generated/manifest.json`（v1, 2026-06-26）
 * 与 [`NIO_ES8_TOPIC_PRD_2026-06-27.md`](../../docs/PRD/product/NIO_ES8_TOPIC_PRD_2026-06-27.md)。
 *
 * 字段值零变更：每个项目的 key / name / publicPath / width / height / aspectRatio
 * / imageStatus / promptSummary 与 manifest 完全对齐；category / summary /
 * suitableFor / caution 由 manifest promptSummary 与 PRD §7.1 派生。
 *
 * 字面量防漂移（参考 ZEEKR v1 / Tesla v1 模式）：
 *   - image 规格 `1448 × 1086, 4/3` 用 TypeScript 字面量类型约束
 *   - 5 个数组长度用 `as const` runtime check + 测试双重保证
 *   - 17 项 = manifest 全部 items（含 00 hero 主视觉，PRD §7.1 表格「序号 00-16」共 17 行）
 *
 * 多车型扩展位（`nioProducts`）预留 ES6 / ET5 / ET7 / ET9 注释占位，
 * 本期仅 ES8，与 PRD §10 决策一致。
 */

export type NioEs8ImageStatus =
  | "matched"
  | "generated-preview"
  | "pending-review"
  | "missing";

export type NioEs8Category =
  | "protection"
  | "film"
  | "appearance"
  | "cabin_protection"
  | "family_cabin"
  | "chassis"
  | "driving_protection"
  | "screen_care"
  | "interior_care";

export type NioEs8UpgradeProject = {
  /** 01-17（hero 为 01，真实升级项目为 02-17） */
  order: number;
  /** 稳定 slug，与 manifest key 完全对齐 */
  key: string;
  /** 中文名（manifest name） */
  name: string;
  category: NioEs8Category;
  /** 1 句话价值说明（基于 manifest promptSummary 提炼） */
  summary: string;
  /** 来自 manifest promptSummary 原文 */
  promptSummary: string;
  /** `/images/products/nio-es8/generated/<key>.png` 字面量模板类型 */
  publicPath: `/images/products/nio-es8/generated/${string}.png`;
  /** 字面量 1448，参考 ZEEKR / Tesla */
  width: 1448;
  /** 字面量 1086 */
  height: 1086;
  /** 字面量 "4/3" */
  aspectRatio: "4/3";
  imageStatus: NioEs8ImageStatus;
  /** 适配场景标签：new_car / family / appearance / driving / interior / cabin_protection */
  suitableFor: readonly string[];
  /** 可选注意事项 */
  caution?: string;
};

export type NioEs8ScenarioKey =
  | "protection"
  | "appearance"
  | "family_cabin"
  | "driving_protection";

export type NioEs8Scenario = {
  key: NioEs8ScenarioKey;
  name: string;
  description: string;
  /** 引用的 NioEs8UpgradeProject.key */
  projectKeys: readonly string[];
};

export type NioEs8Bundle = {
  key: string;
  name: string;
  description: string;
  projectKeys: readonly string[];
};

export type NioEs8ServiceStep = {
  step: number;
  title: string;
  description: string;
};

export type NioEs8FaqItem = {
  question: string;
  answer: string;
};

// ---- 字面量约束（防漂移）----

export const NIO_ES8_PROJECT_COUNT = 17;
export const NIO_ES8_SCENARIO_COUNT = 4;
export const NIO_ES8_BUNDLE_COUNT = 4;
export const NIO_ES8_SERVICE_STEP_COUNT = 7;
export const NIO_ES8_FAQ_COUNT = 9;

// ---- 17 项轻改项目（manifest 全量对齐）----

export const nioEs8UpgradeProjects: readonly NioEs8UpgradeProject[] = [
  {
    order: 1,
    key: "hero",
    name: "蔚来 ES8 系列主视觉",
    category: "appearance",
    summary: "暗石墨色 ES8 风格大型纯电 SUV 主视觉，山路蓝调高端产品定位。",
    promptSummary:
      "暗石墨色 ES8 风格大型纯电 SUV，山路蓝调高端产品主视觉，无文字无标识。",
    publicPath: "/images/products/nio-es8/generated/hero.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
    suitableFor: ["hero"],
    caution: "车型主视觉，非升级项目；用于 17 项素材库封面",
  },
  {
    order: 2,
    key: "paint-protection-film",
    name: "车衣",
    category: "protection",
    summary: "透明漆面保护膜，覆盖机盖和翼子板，水珠保护效果，延缓漆面老化。",
    promptSummary:
      "ES8 风格车身隐形车衣，透明膜覆盖机盖和翼子板，水珠保护效果。",
    publicPath: "/images/products/nio-es8/generated/paint-protection-film.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
    suitableFor: ["new_car"],
  },
  {
    order: 3,
    key: "window-film",
    name: "隔热膜",
    category: "film",
    summary: "侧窗与前挡隔热膜，降低车内温度并提升防晒与隐私性能。",
    promptSummary:
      "ES8 风格侧窗与前挡隔热膜，蓝色透明膜层展示隔热功能。",
    publicPath: "/images/products/nio-es8/generated/window-film.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
    suitableFor: ["new_car"],
  },
  {
    order: 4,
    key: "graphic-wrap",
    name: "彩绘",
    category: "appearance",
    summary: "车身个性彩绘拉花膜，克制几何线条与浅青色点缀，主题化个性表达。",
    promptSummary:
      "ES8 风格车身个性彩绘/拉花膜，克制几何线条与浅青色点缀。",
    publicPath: "/images/products/nio-es8/generated/graphic-wrap.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
    suitableFor: ["appearance"],
  },
  {
    order: 5,
    key: "two-tone-color-wrap",
    name: "双拼改色",
    category: "appearance",
    summary: "整车双拼改色膜，缎面银上半身与石墨黑下半身，视觉风格分层。",
    promptSummary:
      "ES8 风格双拼改色膜，缎面银上半身与石墨黑下半身。",
    publicPath: "/images/products/nio-es8/generated/two-tone-color-wrap.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
    suitableFor: ["appearance"],
  },
  {
    order: 6,
    key: "floor-mats-360",
    name: "360 脚垫",
    category: "family_cabin",
    summary: "座舱 360 全包围脚垫，黑色绗缝材质，贴合脚窝，减少日常脏污。",
    promptSummary: "ES8 风格座舱 360 全包围脚垫，黑色绗缝材质，贴合脚窝。",
    publicPath: "/images/products/nio-es8/generated/floor-mats-360.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
    suitableFor: ["new_car", "family", "cabin_protection"],
  },
  {
    order: 7,
    key: "aluminum-floor",
    name: "铝地板",
    category: "family_cabin",
    summary: "后舱尾箱铝地板，拉丝金属面板与防滑槽，后排与尾箱易清洁。",
    promptSummary:
      "ES8 风格后舱/尾箱铝地板，拉丝金属面板与防滑槽。",
    publicPath: "/images/products/nio-es8/generated/aluminum-floor.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
    suitableFor: ["family", "interior"],
  },
  {
    order: 8,
    key: "stabilizer-bar",
    name: "平衡杆",
    category: "chassis",
    summary: "车身支撑与稳定杆，绿色黑色杆体安装支架，强化车身姿态。",
    promptSummary:
      "平衡杆与安装支架产品摄影，绿色黑色杆体，背景有大型 SUV 轮廓。",
    publicPath: "/images/products/nio-es8/generated/stabilizer-bar.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
    suitableFor: ["driving"],
    caution: "需到店评估安装位和接口",
  },
  {
    order: 9,
    key: "wheel-rims",
    name: "轮毂",
    category: "appearance",
    summary: "豪华大型 SUV 轮毂升级，黑银多辐轮圈，改变侧面姿态。",
    promptSummary: "豪华大型 SUV 轮毂升级，黑银多辐轮圈产品摄影。",
    publicPath: "/images/products/nio-es8/generated/wheel-rims.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
    suitableFor: ["appearance"],
  },
  {
    order: 10,
    key: "sport-body-kit",
    name: "运动包围",
    category: "appearance",
    summary: "前唇侧裙后下饰件运动包围套装，原厂升级感。",
    promptSummary:
      "ES8 风格运动包围，前唇侧裙后下饰件，原厂升级感。",
    publicPath: "/images/products/nio-es8/generated/sport-body-kit.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
    suitableFor: ["appearance"],
  },
  {
    order: 11,
    key: "rear-table-tray",
    name: "小桌板",
    category: "family_cabin",
    summary: "二排座椅后背折叠小桌板，米色豪华内饰，后排办公用餐儿童使用。",
    promptSummary:
      "ES8 风格二排座椅后背折叠小桌板，米色豪华内饰。",
    publicPath: "/images/products/nio-es8/generated/rear-table-tray.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
    suitableFor: ["family", "interior"],
  },
  {
    order: 12,
    key: "mud-flap",
    name: "挡泥板",
    category: "driving_protection",
    summary: "轮拱后方挡泥板近景，黑色注塑件贴合车身，减少泥水飞溅。",
    promptSummary:
      "ES8 风格轮拱后方挡泥板近景，黑色注塑件贴合车身。",
    publicPath: "/images/products/nio-es8/generated/mud-flap.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
    suitableFor: ["driving"],
  },
  {
    order: 13,
    key: "bug-screen",
    name: "防虫网",
    category: "driving_protection",
    summary: "前杠下格栅防虫网，黑色网面隐藏安装，行车环境防护。",
    promptSummary:
      "ES8 风格前杠下格栅防虫网，黑色网面隐藏安装。",
    publicPath: "/images/products/nio-es8/generated/bug-screen.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
    suitableFor: ["driving"],
  },
  {
    order: 14,
    key: "screen-protector",
    name: "钢化膜",
    category: "screen_care",
    summary: "座舱中控屏钢化膜，透明膜层悬浮展示防刮保护。",
    promptSummary:
      "ES8 风格座舱中控屏钢化膜，透明膜层悬浮展示防刮保护。",
    publicPath: "/images/products/nio-es8/generated/screen-protector.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
    suitableFor: ["new_car", "screen_care"],
  },
  {
    order: 15,
    key: "underbody-skid-plate",
    name: "底盘护板",
    category: "chassis",
    summary: "举升工位下方银色金属底盘护板，加强底部防护。",
    promptSummary:
      "ES8 风格底盘护板，举升工位下方银色金属保护板。",
    publicPath: "/images/products/nio-es8/generated/underbody-skid-plate.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
    suitableFor: ["new_car", "driving"],
  },
  {
    order: 16,
    key: "brake-caliper",
    name: "刹车卡钳",
    category: "appearance",
    summary: "轮毂刹车卡钳升级，红色卡钳与刹车盘细节，强化轮毂区域视觉。",
    promptSummary:
      "ES8 风格轮毂刹车卡钳升级，红色卡钳与刹车盘细节。",
    publicPath: "/images/products/nio-es8/generated/brake-caliper.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
    suitableFor: ["appearance", "driving"],
  },
  {
    order: 17,
    key: "interior-coating",
    name: "内饰镀膜",
    category: "interior_care",
    summary: "内饰皮革与饰板镀膜保护，水珠和柔和保护光泽，皮革与饰板养护。",
    promptSummary:
      "ES8 风格内饰皮革与饰板镀膜保护，水珠和柔和保护光泽。",
    publicPath: "/images/products/nio-es8/generated/interior-coating.png",
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
    imageStatus: "generated-preview",
    suitableFor: ["family", "interior"],
  },
];

// ---- 4 大用车场景（PRD §8）----

export const nioEs8Scenarios: readonly NioEs8Scenario[] = [
  {
    key: "protection",
    name: "新车保护",
    description: "适合刚提车用户，优先解决保护和日常使用问题",
    projectKeys: [
      "paint-protection-film",
      "window-film",
      "floor-mats-360",
      "underbody-skid-plate",
      "screen-protector",
    ],
  },
  {
    key: "appearance",
    name: "外观个性",
    description: "强化视觉辨识度和整车外观细节",
    projectKeys: [
      "graphic-wrap",
      "two-tone-color-wrap",
      "sport-body-kit",
      "wheel-rims",
      "brake-caliper",
    ],
  },
  {
    key: "family_cabin",
    name: "家庭座舱",
    description: "适合家庭出行、后排使用和座舱养护",
    projectKeys: [
      "aluminum-floor",
      "rear-table-tray",
      "floor-mats-360",
      "interior-coating",
    ],
  },
  {
    key: "driving_protection",
    name: "行车与日常防护",
    description: "关注底部防护、行车环境和车身侧面清洁",
    projectKeys: [
      "underbody-skid-plate",
      "stabilizer-bar",
      "mud-flap",
      "bug-screen",
    ],
  },
];

// ---- 4 个推荐组合（PRD §9）----

export const nioEs8Bundles: readonly NioEs8Bundle[] = [
  {
    key: "new-car-protection",
    name: "新车基础保护组合",
    description: "适合刚提车的蔚来 ES8 车主",
    projectKeys: [
      "paint-protection-film",
      "window-film",
      "floor-mats-360",
      "underbody-skid-plate",
      "screen-protector",
    ],
  },
  {
    key: "appearance-upgrade",
    name: "外观个性升级组合",
    description: "适合追求视觉辨识度的用户",
    projectKeys: [
      "graphic-wrap",
      "two-tone-color-wrap",
      "sport-body-kit",
      "wheel-rims",
      "brake-caliper",
    ],
  },
  {
    key: "family-cabin-upgrade",
    name: "家庭座舱升级组合",
    description: "适合家庭乘坐和后排高频使用",
    projectKeys: [
      "aluminum-floor",
      "rear-table-tray",
      "floor-mats-360",
      "interior-coating",
    ],
  },
  {
    key: "driving-daily-protection",
    name: "行车与日常防护组合",
    description: "适合关注车身清洁和底盘防护的用户",
    projectKeys: [
      "underbody-skid-plate",
      "stabilizer-bar",
      "mud-flap",
      "bug-screen",
    ],
  },
];

// ---- 7 步服务流程（PRD §13）----

export const nioEs8ServiceSteps: readonly NioEs8ServiceStep[] = [
  {
    step: 1,
    title: "车型确认",
    description: "确认蔚来 ES8 的年份、批次、版本和配置",
  },
  {
    step: 2,
    title: "项目选择",
    description: "根据新车保护、外观个性、家庭座舱或行车防护选择项目",
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

// ---- 9 条 FAQ（PRD §14）----

export const nioEs8Faq: readonly NioEs8FaqItem[] = [
  {
    question: "蔚来 ES8 的这些项目是否都能安装？",
    answer:
      "不同年份、版本和配置可能不同，需到店评估确认；具体安装可行性以现场车辆情况和施工评估为准。",
  },
  {
    question: "新车最推荐先做什么？",
    answer: "车衣、隔热膜、360 脚垫、底盘护板、钢化膜；优先解决保护和日常使用问题。",
  },
  {
    question: "外观升级项目有哪些？",
    answer: "彩绘、双拼改色、运动包围、轮毂、刹车卡钳；强化视觉辨识度和整车外观细节。",
  },
  {
    question: "家庭座舱项目有哪些？",
    answer: "铝地板、小桌板、360 脚垫、内饰镀膜；适合家庭出行、后排使用和座舱养护。",
  },
  {
    question: "行车防护项目有哪些？",
    answer: "底盘护板、平衡杆、挡泥板、防虫网；关注底部防护、行车环境和车身侧面清洁。",
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
  {
    question: "图片是真实施工案例吗？",
    answer:
      "当前展示的是 AI 功能预览图（generated-preview），真实施工以到店沟通和现场评估为准。",
  },
];

// ---- 多车型扩展位（PRD §10，本期仅 ES8）----

export const nioProducts = {
  es8: nioEs8UpgradeProjects,
  // es6: [] as const,   // 后续 batch 填充
  // et5: [] as const,
  // et7: [] as const,
  // et9: [] as const,
} as const;

// ---- 字面量 runtime check（防漂移；模块加载即触发）----

if (nioEs8UpgradeProjects.length !== NIO_ES8_PROJECT_COUNT) {
  throw new Error(
    `NIO ES8 project count drift: expected ${NIO_ES8_PROJECT_COUNT}, got ${nioEs8UpgradeProjects.length}`,
  );
}
if (nioEs8Scenarios.length !== NIO_ES8_SCENARIO_COUNT) {
  throw new Error(
    `NIO ES8 scenario count drift: expected ${NIO_ES8_SCENARIO_COUNT}, got ${nioEs8Scenarios.length}`,
  );
}
if (nioEs8Bundles.length !== NIO_ES8_BUNDLE_COUNT) {
  throw new Error(
    `NIO ES8 bundle count drift: expected ${NIO_ES8_BUNDLE_COUNT}, got ${nioEs8Bundles.length}`,
  );
}
if (nioEs8ServiceSteps.length !== NIO_ES8_SERVICE_STEP_COUNT) {
  throw new Error(
    `NIO ES8 service step count drift: expected ${NIO_ES8_SERVICE_STEP_COUNT}, got ${nioEs8ServiceSteps.length}`,
  );
}
if (nioEs8Faq.length !== NIO_ES8_FAQ_COUNT) {
  throw new Error(
    `NIO ES8 FAQ count drift: expected ${NIO_ES8_FAQ_COUNT}, got ${nioEs8Faq.length}`,
  );
}