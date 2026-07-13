/**
 * 腾势 D9 单车型轻改项目 — 数据层
 *
 * 数据来源 PRD：
 *   docs/PRD/product/DENZA_D9_TOPIC_PRD_2026-06-24.md
 *
 * 节号映射：
 *   §7.1 23 个海报项目      → denzaD9UpgradeProjects  (length === 23)
 *   §8   5 大场景           → denzaD9Scenarios        (length === 5)
 *   §10  6 步服务流程        → denzaD9ServiceSteps     (length === 6)
 *   §11  6 条 FAQ           → denzaD9Faq              (length === 6)
 *
 * 字段值来自 PRD §7-§11；图片字段使用 public/images/products/denza-d9/generated
 * 下的 4:3 效果图。
 */

// ---- 类型定义 ----

export type DenzaD9Category =
  | "paint_protection" // 车身保护
  | "film_style" // 玻璃膜
  | "rear_cabin" // 后排/MPV 空间
  | "chassis_protection" // 底盘防护
  | "exterior_parts" // 外观套件
  | "infotainment" // 智能影音
  | "cabin_comfort" // 座舱舒适
  | "lighting" // 灯光外观
  | "outdoor_accessory" // 车顶/户外
  | "handling"; // 底盘/操控

export type DenzaD9ImageStatus =
  | "matched"
  | "product-preview"
  | "pending-review"
  | "missing";

export interface DenzaD9ProductImage {
  readonly publicPath: string | null;
  readonly alt: string;
  readonly width: 1448 | null;
  readonly height: 1086 | null;
  readonly aspectRatio: "4/3" | null;
}

export interface DenzaD9UpgradeProject {
  /** 稳定 slug, 例 "denza-d9-ppf" / "denza-d9-aluminum-floor" */
  readonly id: string;
  /** 1-23 (按海报顺序) */
  readonly order: number;
  /** 项目名称 */
  readonly name: string;
  readonly category: DenzaD9Category;
  /** 一句话价值说明 */
  readonly summary: string;
  /** 适合人群 */
  readonly suitableFor: readonly string[];
  /** 注意事项 (可选) */
  readonly caution?: string;
  readonly imageStatus: DenzaD9ImageStatus;
  readonly image: DenzaD9ProductImage;
  readonly sourceArea: "poster_project_matrix";
}

export interface DenzaD9Scenario {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** 引用的 project id */
  readonly projectIds: readonly string[];
}

export interface DenzaD9ServiceStep {
  readonly order: number; // 1-6
  readonly title: string;
  readonly description: string;
}

export interface DenzaD9FaqItem {
  readonly question: string;
  readonly answer: string;
}

const GENERATED_IMAGE_BASE = "/images/products/denza-d9/generated";

function generatedImage(
  fileName: string,
  displayName: string,
): DenzaD9ProductImage {
  return {
    publicPath: `${GENERATED_IMAGE_BASE}/${fileName}`,
    alt: `腾势 D9 ${displayName} 效果预览图`,
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  };
}

export const DENZA_D9_HERO_IMAGE: DenzaD9ProductImage = generatedImage(
  "hero.webp",
  "主视觉",
);

// ---- §7.1 23 个海报项目 (按海报顺序) ----
export const denzaD9UpgradeProjects: readonly DenzaD9UpgradeProject[] = [
  {
    id: "denza-d9-ppf",
    order: 1,
    name: "车衣",
    category: "paint_protection",
    summary: "漆面保护、抗日常划痕、新车保护感",
    suitableFor: ["新车用户", "关注漆面长期保持的车主"],
    imageStatus: "product-preview",
    image: generatedImage("paint-protection-film.webp", "车衣"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-window-film",
    order: 2,
    name: "隔热膜",
    category: "film_style",
    summary: "隔热、防晒、隐私、驾乘舒适",
    suitableFor: ["南方用车", "重视车内舒适的车主"],
    imageStatus: "product-preview",
    image: generatedImage("window-film.webp", "隔热膜"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-paint-art",
    order: 3,
    name: "彩绘",
    category: "exterior_parts",
    summary: "个性化图案表达、车身视觉差异化",
    suitableFor: ["追求个性化外观的车主"],
    imageStatus: "product-preview",
    image: generatedImage("custom-wrap-art.webp", "彩绘"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-duotone-film",
    order: 4,
    name: "双拼改色",
    category: "exterior_parts",
    summary: "双拼视觉、车身层次和商务外观升级",
    suitableFor: ["商务用户", "追求外观质感的车主"],
    imageStatus: "product-preview",
    image: generatedImage("two-tone-wrap.webp", "双拼改色"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-floor-mats",
    order: 5,
    name: "360软包脚垫",
    category: "rear_cabin",
    summary: "地毯保护、易清洁、座舱完整感",
    suitableFor: ["日常通勤用户", "家中有小孩的车主"],
    imageStatus: "product-preview",
    image: generatedImage("soft-floor-mats.webp", "360软包脚垫"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-aluminum-floor",
    order: 6,
    name: "铝地板",
    category: "rear_cabin",
    summary: "易清洁、耐用，提升二排和尾箱区域质感",
    suitableFor: ["MPV 用户", "商务接待场景"],
    imageStatus: "product-preview",
    image: generatedImage("aluminum-flooring.webp", "铝地板"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-balance-bar",
    order: 7,
    name: "平衡杆",
    category: "handling",
    summary: "提升车身支撑和驾驶稳定感,需到店评估",
    suitableFor: ["关注驾驶稳定感的车主"],
    caution: "需到店评估",
    imageStatus: "product-preview",
    image: generatedImage("stabilizer-bar.webp", "平衡杆"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-amxt-bodykit",
    order: 8,
    name: "amxt包围",
    category: "exterior_parts",
    summary: "强化前后包围视觉,提升整车辨识度",
    suitableFor: ["追求运动外观的车主"],
    caution: "需确认版本适配",
    imageStatus: "product-preview",
    image: generatedImage("amxt-body-kit.webp", "amxt包围"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-bskt-bodykit",
    order: 9,
    name: "bskt运动包围",
    category: "exterior_parts",
    summary: "更运动化的外观风格,需确认版本适配",
    suitableFor: ["追求运动外观的车主"],
    caution: "需确认版本适配",
    imageStatus: "product-preview",
    image: generatedImage("bskt-sport-body-kit.webp", "bskt运动包围"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-skid-plate",
    order: 10,
    name: "底盘护板",
    category: "chassis_protection",
    summary: "应对路面剐蹭、碎石和底部防护",
    suitableFor: ["新车用户", "路况复杂用车环境"],
    imageStatus: "product-preview",
    image: generatedImage("underbody-skid-plate.webp", "底盘护板"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-tray-table",
    order: 11,
    name: "小桌板",
    category: "rear_cabin",
    summary: "后排办公、用餐、儿童使用场景",
    suitableFor: ["商务用户", "家庭用户"],
    imageStatus: "product-preview",
    image: generatedImage("folding-table.webp", "小桌板"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-ambient-light",
    order: 12,
    name: "氛围灯",
    category: "cabin_comfort",
    summary: "夜间座舱氛围、商务和家庭乘坐体验",
    suitableFor: ["商务用户", "注重座舱氛围的车主"],
    imageStatus: "product-preview",
    image: generatedImage("ambient-lighting.webp", "氛围灯"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-drl",
    order: 13,
    name: "日行灯",
    category: "lighting",
    summary: "前脸视觉升级和日间辨识度",
    suitableFor: ["关注外观细节的车主"],
    imageStatus: "product-preview",
    image: generatedImage("daytime-running-lights.webp", "日行灯"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-hud",
    order: 14,
    name: "抬头显示",
    category: "infotainment",
    summary: "行车信息显示便利,提升驾驶体验",
    suitableFor: ["关注科技便利的车主"],
    caution: "需确认安装位",
    imageStatus: "product-preview",
    image: generatedImage("head-up-display.webp", "抬头显示"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-ceiling-screen",
    order: 15,
    name: "吸顶电视",
    category: "infotainment",
    summary: "后排影音娱乐,适合家庭和商务场景",
    suitableFor: ["家庭用户", "商务接待场景"],
    imageStatus: "product-preview",
    image: generatedImage("ceiling-screen.webp", "吸顶电视"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-d-pillar-light",
    order: 16,
    name: "D柱灯",
    category: "lighting",
    summary: "车尾/侧后方灯光视觉升级",
    suitableFor: ["关注外观细节的车主"],
    imageStatus: "product-preview",
    image: generatedImage("d-pillar-light.webp", "D柱灯"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-roof-rack",
    order: 17,
    name: "铝合金行李架",
    category: "outdoor_accessory",
    summary: "车顶载物能力和户外出行视觉升级",
    suitableFor: ["户外出行用户"],
    caution: "需确认车型适配",
    imageStatus: "product-preview",
    image: generatedImage("aluminum-roof-rack.webp", "铝合金行李架"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-mudguard",
    order: 18,
    name: "挡泥板",
    category: "chassis_protection",
    summary: "减少泥水飞溅和车身侧面污染",
    suitableFor: ["雨季/泥泞路况用车"],
    imageStatus: "product-preview",
    image: generatedImage("mud-flaps.webp", "挡泥板"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-bug-screen",
    order: 19,
    name: "防虫网",
    category: "chassis_protection",
    summary: "减少虫石杂物进入关键散热/进风区域",
    suitableFor: ["夏季/多虫区域用车"],
    imageStatus: "product-preview",
    image: generatedImage("grille-mesh.webp", "防虫网"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-tempered-film",
    order: 20,
    name: "钢化膜",
    category: "infotainment",
    summary: "中控/娱乐屏幕防刮保护",
    suitableFor: ["关注屏幕长期清晰度的车主"],
    imageStatus: "product-preview",
    image: generatedImage("screen-protector.webp", "钢化膜"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-door-sill",
    order: 21,
    name: "门槛条",
    category: "rear_cabin",
    summary: "上下车高频区域防刮、防踩踏磨损",
    suitableFor: ["高频上下车的车主"],
    imageStatus: "product-preview",
    image: generatedImage("door-sill-plate.webp", "门槛条"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-license-frame",
    order: 22,
    name: "牌照框",
    category: "exterior_parts",
    summary: "车头/车尾细节装饰与牌照区域保护",
    suitableFor: ["关注外观细节的车主"],
    imageStatus: "product-preview",
    image: generatedImage("license-plate-frame.webp", "牌照框"),
    sourceArea: "poster_project_matrix",
  },
  {
    id: "denza-d9-interior-coating",
    order: 23,
    name: "内饰镀膜",
    category: "cabin_comfort",
    summary: "内饰表面防污、易清洁、保持质感",
    suitableFor: ["注重内饰清洁的车主"],
    imageStatus: "product-preview",
    image: generatedImage("interior-coating.webp", "内饰镀膜"),
    sourceArea: "poster_project_matrix",
  },
] as const satisfies readonly DenzaD9UpgradeProject[];

// ---- §8 5 大场景 ----
export const denzaD9Scenarios: readonly DenzaD9Scenario[] = [
  {
    id: "new-car-protection",
    name: "新车保护",
    description: "适合刚提车用户,优先解决保护和日常使用问题",
    projectIds: [
      "denza-d9-ppf",
      "denza-d9-window-film",
      "denza-d9-floor-mats",
      "denza-d9-skid-plate",
      "denza-d9-door-sill",
      "denza-d9-tempered-film",
      "denza-d9-interior-coating",
    ],
  },
  {
    id: "appearance-style",
    name: "外观个性",
    description: "强化视觉辨识度和车身风格",
    projectIds: [
      "denza-d9-paint-art",
      "denza-d9-duotone-film",
      "denza-d9-amxt-bodykit",
      "denza-d9-bskt-bodykit",
      "denza-d9-d-pillar-light",
      "denza-d9-drl",
      "denza-d9-license-frame",
    ],
  },
  {
    id: "cabin-care",
    name: "座舱防护",
    description: "二排、尾箱和商务接待场景下的舒适与易清洁升级",
    projectIds: [
      "denza-d9-aluminum-floor",
      "denza-d9-tray-table",
      "denza-d9-ceiling-screen",
      "denza-d9-ambient-light",
      "denza-d9-floor-mats",
      "denza-d9-door-sill",
    ],
  },
  {
    id: "chassis-driving",
    name: "底盘与行车防护",
    description: "关注底部保护、雨季泥水、进风区域与车身支撑",
    projectIds: [
      "denza-d9-skid-plate",
      "denza-d9-mudguard",
      "denza-d9-bug-screen",
      "denza-d9-balance-bar",
    ],
  },
  {
    id: "premium-quality",
    name: "高端质感",
    description: "面向高端 MPV 出行的座舱质感、影音、科技和户外拓展",
    projectIds: [
      "denza-d9-aluminum-floor",
      "denza-d9-ambient-light",
      "denza-d9-ceiling-screen",
      "denza-d9-hud",
      "denza-d9-roof-rack",
      "denza-d9-interior-coating",
    ],
  },
] as const satisfies readonly DenzaD9Scenario[];

// ---- §10 6 步服务流程 ----
export const denzaD9ServiceSteps: readonly DenzaD9ServiceStep[] = [
  {
    order: 1,
    title: "车型确认",
    description: "确认腾势 D9 的年份、版本和配置差异",
  },
  {
    order: 2,
    title: "项目选择",
    description: "根据新车保护、后排体验、商务接待或外观升级选择项目",
  },
  {
    order: 3,
    title: "到店评估",
    description: "现场确认安装位置、接口、材料和工期",
  },
  {
    order: 4,
    title: "施工安装",
    description: "按项目标准施工,过程保护车辆",
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
] as const satisfies readonly DenzaD9ServiceStep[];

// ---- §11 6 条 FAQ ----
export const denzaD9Faq: readonly DenzaD9FaqItem[] = [
  {
    question: "是否所有腾势 D9 都能安装?",
    answer: "不同年份和配置可能不同,需到店确认。",
  },
  {
    question: "新车最推荐先做哪些项目?",
    answer: "车衣、隔热膜、360软包脚垫、底盘护板、门槛条、内饰保护等。",
  },
  {
    question: "商务/家庭用户最常关注哪些项目?",
    answer: "铝地板、小桌板、吸顶电视、氛围灯、钢化膜、内饰镀膜。",
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
] as const satisfies readonly DenzaD9FaqItem[];

// ---- 10 类别中文名映射 (供 UI 显示) ----
export const DENZA_D9_CATEGORY_LABELS: Readonly<Record<DenzaD9Category, string>> = {
  paint_protection: "车身保护",
  film_style: "玻璃膜",
  rear_cabin: "后排/MPV 空间",
  chassis_protection: "底盘防护",
  exterior_parts: "外观套件",
  infotainment: "智能影音",
  cabin_comfort: "座舱舒适",
  lighting: "灯光外观",
  outdoor_accessory: "车顶/户外",
  handling: "底盘/操控",
} as const;

// ---- Runtime 断言 (开发期触发) ----
function assertDenzaD9DataShape(): void {
  if (denzaD9UpgradeProjects.length !== 23) {
    throw new Error(
      `denzaD9UpgradeProjects expected 23 items, got ${denzaD9UpgradeProjects.length}`,
    );
  }
  if (denzaD9Scenarios.length !== 5) {
    throw new Error(`denzaD9Scenarios expected 5, got ${denzaD9Scenarios.length}`);
  }
  if (denzaD9ServiceSteps.length !== 6) {
    throw new Error(
      `denzaD9ServiceSteps expected 6, got ${denzaD9ServiceSteps.length}`,
    );
  }
  if (denzaD9Faq.length !== 6) {
    throw new Error(`denzaD9Faq expected 6, got ${denzaD9Faq.length}`);
  }

  // id 唯一性 (project ids + scenario ids)
  const allKeys = new Set<string>();
  for (const p of denzaD9UpgradeProjects) {
    if (allKeys.has(p.id)) throw new Error(`Duplicate project id: ${p.id}`);
    allKeys.add(p.id);
  }
  for (const s of denzaD9Scenarios) {
    if (allKeys.has(s.id)) {
      throw new Error(`Scenario id conflicts with project id: ${s.id}`);
    }
    allKeys.add(s.id);
  }

  // order 单调递增 1-23
  denzaD9UpgradeProjects.forEach((p, i) => {
    if (p.order !== i + 1) {
      throw new Error(`Project ${i} order expected ${i + 1}, got ${p.order}`);
    }
  });

  // service steps 连续 1-6
  denzaD9ServiceSteps.forEach((s, i) => {
    if (s.order !== i + 1) {
      throw new Error(
        `Service step ${i} expected order ${i + 1}, got ${s.order}`,
      );
    }
  });

  // scenario.projectIds 引用存在的 project id
  for (const s of denzaD9Scenarios) {
    for (const pid of s.projectIds) {
      if (!allKeys.has(pid)) {
        throw new Error(`Scenario ${s.id} references missing project id: ${pid}`);
      }
    }
  }

  // 每个 project 至少被一个 scenario 引用
  const referencedIds = new Set<string>();
  for (const s of denzaD9Scenarios)
    for (const pid of s.projectIds) referencedIds.add(pid);
  for (const p of denzaD9UpgradeProjects) {
    if (!referencedIds.has(p.id)) {
      throw new Error(`Project ${p.id} not referenced by any scenario`);
    }
  }

  // 10 个类别都有中文标签
  const allCategories: readonly DenzaD9Category[] = [
    "paint_protection",
    "film_style",
    "rear_cabin",
    "chassis_protection",
    "exterior_parts",
    "infotainment",
    "cabin_comfort",
    "lighting",
    "outdoor_accessory",
    "handling",
  ];
  for (const c of allCategories) {
    if (!DENZA_D9_CATEGORY_LABELS[c]) {
      throw new Error(`Missing label for category: ${c}`);
    }
  }
}

assertDenzaD9DataShape();
