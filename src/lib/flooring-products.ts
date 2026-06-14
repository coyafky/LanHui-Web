/**
 * 地板改装分类专题页数据
 *
 * 数据派生自 public/images/products/flooring/manifest.json（v1, 2026-06-13）。
 * 渲染规则（与 manifest.frontendNotes 一致）：
 *   - 只渲染 templateStatus === "active" 且 assetStatus === "ready" 的品牌。
 *   - 腾势（reference-only）与奔驰（missing-assets）不进入页面。
 *   - 不展示价格、不写官方合作/原厂件/厂家授权等未经确认表述。
 */

export type FlooringHotBrand =
  | "li-auto"
  | "aito"
  | "zeekr"
  | "xpeng"
  | "mercedes-benz";

export type FlooringColorId =
  | "snow-white"
  | "neutral-gray"
  | "rock-black"
  | "wood-brown";

export type FlooringSellingPointId =
  | "model-fitment"
  | "color-match"
  | "floor-rail-integration"
  | "door-step-comfort"
  | "trunk-continuity"
  | "easy-care"
  | "premium-cabin";

export type FlooringFunctionId =
  | "main-floor-board"
  | "rail-trim"
  | "door-sill-step"
  | "foot-rest"
  | "trunk-floor";

export type FlooringColorVariant = {
  id: string;
  colorId: FlooringColorId;
  colorName: string;
  description: string;
  assetPath: string;
  width: number;
  height: number;
  alt: string;
};

export type FlooringVehicleGroup = {
  id: string;
  brand: FlooringHotBrand;
  brandName: string;
  models: string[];
  headline: string;
  summary: string;
  productIntro: string;
  fitmentNote: string;
  sellingPointIds: FlooringSellingPointId[];
  functionIds: FlooringFunctionId[];
  colorVariants: FlooringColorVariant[];
};

export type FlooringSellingPoint = {
  id: FlooringSellingPointId;
  title: string;
  description: string;
};

export type FlooringFunctionItem = {
  id: FlooringFunctionId;
  name: string;
  description: string;
};

export type FlooringColorMeta = {
  id: FlooringColorId;
  name: string;
  description: string;
};

// ---- 卖点（7 条）----

export const flooringSellingPoints: FlooringSellingPoint[] = [
  {
    id: "model-fitment",
    title: "按热门车型适配",
    description:
      "以理想、问界、极氪、小鹏等热门车型为页面模板，不使用单一通用图覆盖所有车型。",
  },
  {
    id: "color-match",
    title: "多色效果对比",
    description:
      "同一车型下用颜色轮播展示雪霜白、中性灰、岩石黑、木纹咖等效果，方便判断与内饰是否协调。",
  },
  {
    id: "floor-rail-integration",
    title: "地板与滑轨整合",
    description:
      "围绕后排地板和座椅滑轨区域做整体展示，突出空间整洁和视觉统一。",
  },
  {
    id: "door-step-comfort",
    title: "上下车与脚部体验",
    description:
      "通过中门迎宾踏板、休息脚踏等组件承接上下车和后排脚部使用场景。",
  },
  {
    id: "trunk-continuity",
    title: "尾箱区域联动",
    description:
      "尾箱地板与后排地板形成统一效果，兼顾收纳、清洁和整体观感。",
  },
  {
    id: "easy-care",
    title: "日常清洁维护",
    description:
      "地板表面相对织物地毯更便于日常擦拭维护，适合家庭和商务高频使用场景。",
  },
  {
    id: "premium-cabin",
    title: "座舱质感提升",
    description:
      "通过地板、滑轨、脚踏和尾箱区域的统一呈现，提升后排空间的完整度和精致感。",
  },
];

// 卖点 ID → 描述，用于按 sellingPointIds 反查
export const flooringSellingPointMap: Record<
  FlooringSellingPointId,
  FlooringSellingPoint
> = Object.fromEntries(
  flooringSellingPoints.map((sp) => [sp.id, sp]),
) as Record<FlooringSellingPointId, FlooringSellingPoint>;

// ---- 结构组成（5 项）----

export const flooringFunctions: FlooringFunctionItem[] = [
  {
    id: "main-floor-board",
    name: "地板主板",
    description: "后排地板主体视觉件，是颜色和整体质感的核心展示区域。",
  },
  {
    id: "rail-trim",
    name: "滑轨区域",
    description:
      "围绕座椅滑轨区域做视觉整合，具体兼容性需按车型和座椅布局确认。",
  },
  {
    id: "door-sill-step",
    name: "中门迎宾踏板",
    description: "承接上下车区域，强化进出后排的便利性和整体观感。",
  },
  {
    id: "foot-rest",
    name: "休息脚踏",
    description: "服务后排脚部停放和舒适体验，是否带灯光以具体款式为准。",
  },
  {
    id: "trunk-floor",
    name: "尾箱地板",
    description:
      "让后排和尾箱区域形成统一效果，并提升尾箱区域的日常维护便利性。",
  },
];

export const flooringFunctionMap: Record<FlooringFunctionId, FlooringFunctionItem> =
  Object.fromEntries(
    flooringFunctions.map((f) => [f.id, f]),
  ) as Record<FlooringFunctionId, FlooringFunctionItem>;

// ---- 颜色（4 种）----

export const flooringColors: FlooringColorMeta[] = [
  {
    id: "snow-white",
    name: "雪霜白",
    description: "适合浅色内饰，视觉更明亮干净。",
  },
  {
    id: "neutral-gray",
    name: "中性灰",
    description: "适合灰色或冷色内饰，整体更克制耐看。",
  },
  {
    id: "rock-black",
    name: "岩石黑",
    description: "适合深色内饰，视觉更稳重。",
  },
  {
    id: "wood-brown",
    name: "木纹咖",
    description: "适合棕色、暖色或木纹风格内饰。",
  },
];

// ---- 品牌/车型分组（仅 4 个 active+ready）----

export const flooringVehicleGroups: FlooringVehicleGroup[] = [
  {
    id: "li-auto",
    brand: "li-auto",
    brandName: "理想",
    models: ["理想 L 系列", "理想 MEGA"],
    headline: "家庭出行场景下的地板总成升级",
    summary:
      "面向家庭高频乘坐、后排储物和尾箱使用场景，强调地板、滑轨、脚踏和尾箱区域的统一呈现。",
    productIntro:
      "理想车型用户通常关注家庭出行、儿童乘坐、露营收纳和后排清洁维护。地板总成专题应突出空间整洁、颜色适配和尾箱联动，让用户先理解整体效果，再判断自己的车型是否适合升级。",
    fitmentNote: "具体车型、年份、座椅布局和安装方案需要业务/门店二次确认。",
    sellingPointIds: [
      "model-fitment",
      "color-match",
      "floor-rail-integration",
      "trunk-continuity",
      "easy-care",
    ],
    functionIds: [
      "main-floor-board",
      "rail-trim",
      "door-sill-step",
      "foot-rest",
      "trunk-floor",
    ],
    colorVariants: [
      {
        id: "li-auto-wood-brown",
        colorId: "wood-brown",
        colorName: "木纹咖",
        description: "适合棕色、暖色或木纹风格内饰。",
        assetPath: "/images/products/flooring/图片/理想/1.png",
        width: 798,
        height: 528,
        alt: "理想地板总成木纹咖产品图",
      },
      {
        id: "li-auto-neutral-gray",
        colorId: "neutral-gray",
        colorName: "中性灰",
        description: "适合灰色或冷色内饰，整体更克制耐看。",
        assetPath: "/images/products/flooring/图片/理想/2.png",
        width: 798,
        height: 528,
        alt: "理想地板总成中性灰产品图",
      },
      {
        id: "li-auto-snow-white",
        colorId: "snow-white",
        colorName: "雪霜白",
        description: "适合浅色内饰，视觉更明亮干净。",
        assetPath: "/images/products/flooring/图片/理想/3.png",
        width: 798,
        height: 528,
        alt: "理想地板总成雪霜白产品图",
      },
      {
        id: "li-auto-rock-black",
        colorId: "rock-black",
        colorName: "岩石黑",
        description: "适合深色内饰，视觉更稳重。",
        assetPath: "/images/products/flooring/图片/理想/4.png",
        width: 798,
        height: 528,
        alt: "理想地板总成岩石黑产品图",
      },
    ],
  },
  {
    id: "aito",
    brand: "aito",
    brandName: "问界",
    models: ["问界 M7", "问界 M8", "问界 M9"],
    headline: "新能源家庭与商务兼顾的地板总成方案",
    summary:
      "围绕问界车型的后排质感、尾箱联动和多色内饰适配展开，适合展示新能源车主对座舱整体感的升级需求。",
    productIntro:
      "问界车型兼具家庭出行和商务接待属性。地板总成内容应强调后排空间整合、脚踏便利、尾箱地板联动，以及不同内饰颜色下的视觉统一。",
    fitmentNote: "具体车型、年份、座椅布局和安装方案需要业务/门店二次确认。",
    sellingPointIds: [
      "model-fitment",
      "color-match",
      "floor-rail-integration",
      "trunk-continuity",
      "easy-care",
    ],
    functionIds: [
      "main-floor-board",
      "rail-trim",
      "door-sill-step",
      "foot-rest",
      "trunk-floor",
    ],
    colorVariants: [
      {
        id: "aito-wood-brown",
        colorId: "wood-brown",
        colorName: "木纹咖",
        description: "适合棕色、暖色或木纹风格内饰。",
        assetPath: "/images/products/flooring/图片/问界/1.png",
        width: 1075,
        height: 1052,
        alt: "问界地板总成木纹咖产品图",
      },
      {
        id: "aito-snow-white",
        colorId: "snow-white",
        colorName: "雪霜白",
        description: "适合浅色内饰，视觉更明亮干净。",
        assetPath: "/images/products/flooring/图片/问界/2.png",
        width: 1075,
        height: 1052,
        alt: "问界地板总成雪霜白产品图",
      },
      {
        id: "aito-rock-black",
        colorId: "rock-black",
        colorName: "岩石黑",
        description: "适合深色内饰，视觉更稳重。",
        assetPath: "/images/products/flooring/图片/问界/3.png",
        width: 1075,
        height: 1052,
        alt: "问界地板总成岩石黑产品图",
      },
      {
        id: "aito-neutral-gray",
        colorId: "neutral-gray",
        colorName: "中性灰",
        description: "适合灰色或冷色内饰，整体更克制耐看。",
        assetPath: "/images/products/flooring/图片/问界/4.png",
        width: 1075,
        height: 1052,
        alt: "问界地板总成中性灰产品图",
      },
    ],
  },
  {
    id: "zeekr",
    brand: "zeekr",
    brandName: "极氪",
    models: ["极氪 009", "极氪 7X"],
    headline: "高端新能源座舱的地板总成展示",
    summary:
      "强调高端新能源车型的座舱质感、后排整洁度和深浅内饰配色选择。",
    productIntro:
      "极氪车型的页面表达应更偏高端、克制和科技感。地板总成卖点聚焦座舱整体感、滑轨区域整合、脚踏与尾箱地板的一致性。",
    fitmentNote: "具体车型、年份、座椅布局和安装方案需要业务/门店二次确认。",
    sellingPointIds: [
      "model-fitment",
      "color-match",
      "floor-rail-integration",
      "trunk-continuity",
      "easy-care",
    ],
    functionIds: [
      "main-floor-board",
      "rail-trim",
      "door-sill-step",
      "foot-rest",
      "trunk-floor",
    ],
    colorVariants: [
      {
        id: "zeekr-snow-white",
        colorId: "snow-white",
        colorName: "雪霜白",
        description: "适合浅色内饰，视觉更明亮干净。",
        assetPath: "/images/products/flooring/图片/极氪/1.png",
        width: 798,
        height: 528,
        alt: "极氪地板总成雪霜白产品图",
      },
      {
        id: "zeekr-rock-black",
        colorId: "rock-black",
        colorName: "岩石黑",
        description: "适合深色内饰，视觉更稳重。",
        assetPath: "/images/products/flooring/图片/极氪/2.png",
        width: 798,
        height: 528,
        alt: "极氪地板总成岩石黑产品图",
      },
      {
        id: "zeekr-wood-brown",
        colorId: "wood-brown",
        colorName: "木纹咖",
        description: "适合棕色、暖色或木纹风格内饰。",
        assetPath: "/images/products/flooring/图片/极氪/3.png",
        width: 798,
        height: 528,
        alt: "极氪地板总成木纹咖产品图",
      },
      {
        id: "zeekr-neutral-gray",
        colorId: "neutral-gray",
        colorName: "中性灰",
        description: "适合灰色或冷色内饰，整体更克制耐看。",
        assetPath: "/images/products/flooring/图片/极氪/4.png",
        width: 798,
        height: 528,
        alt: "极氪地板总成中性灰产品图",
      },
    ],
  },
  {
    id: "xpeng",
    brand: "xpeng",
    brandName: "小鹏",
    models: ["小鹏 X9", "小鹏 G9"],
    headline: "科技家庭座舱的地板与后排空间整合",
    summary:
      "适合表现家庭科技座舱、后排通行空间、脚踏和滑轨区域的整合效果。",
    productIntro:
      "小鹏车型用户对智能座舱和家庭空间感知强。页面应突出地板总成让后排区域更整洁，颜色变体帮助用户快速判断与内饰的匹配度。",
    fitmentNote: "具体车型、年份、座椅布局和安装方案需要业务/门店二次确认。",
    sellingPointIds: [
      "model-fitment",
      "color-match",
      "floor-rail-integration",
      "trunk-continuity",
      "easy-care",
    ],
    functionIds: [
      "main-floor-board",
      "rail-trim",
      "door-sill-step",
      "foot-rest",
      "trunk-floor",
    ],
    colorVariants: [
      {
        id: "xpeng-rock-black",
        colorId: "rock-black",
        colorName: "岩石黑",
        description: "适合深色内饰，视觉更稳重。",
        assetPath: "/images/products/flooring/图片/小鹏/1.png",
        width: 798,
        height: 528,
        alt: "小鹏地板总成岩石黑产品图",
      },
      {
        id: "xpeng-snow-white",
        colorId: "snow-white",
        colorName: "雪霜白",
        description: "适合浅色内饰，视觉更明亮干净。",
        assetPath: "/images/products/flooring/图片/小鹏/2.png",
        width: 798,
        height: 528,
        alt: "小鹏地板总成雪霜白产品图",
      },
      {
        id: "xpeng-neutral-gray",
        colorId: "neutral-gray",
        colorName: "中性灰",
        description: "适合灰色或冷色内饰，整体更克制耐看。",
        assetPath: "/images/products/flooring/图片/小鹏/3.png",
        width: 798,
        height: 528,
        alt: "小鹏地板总成中性灰产品图",
      },
      {
        id: "xpeng-wood-brown",
        colorId: "wood-brown",
        colorName: "木纹咖",
        description: "适合棕色、暖色或木纹风格内饰。",
        assetPath: "/images/products/flooring/图片/小鹏/4.png",
        width: 798,
        height: 528,
        alt: "小鹏地板总成木纹咖产品图",
      },
    ],
  },
];

// 仅在页面渲染中对外暴露的 helper
export function getFlooringVehicleGroupById(
  id: string,
): FlooringVehicleGroup | undefined {
  return flooringVehicleGroups.find((g) => g.id === id);
}

// 汇总：所有品牌的所有颜色图（图库）
export const flooringGalleryItems: FlooringColorVariant[] =
  flooringVehicleGroups.flatMap((group) =>
    group.colorVariants.map((variant) => ({
      ...variant,
      // 保留原 id，避免与原 group 重复
    })),
  );