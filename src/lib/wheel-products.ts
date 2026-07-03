export type WheelCategory =
  | "sport"
  | "multi-spoke"
  | "premium"
  | "detail";

export type WheelImage = {
  id: string;
  filename: string;
  publicPath: string;
  width: 1086;
  height: 1448;
  aspectRatio: "3/4";
  title: string;
  category: WheelCategory;
  alt: string;
};

export type WheelValue = {
  title: string;
  description: string;
};

export type WheelFitmentCheck = {
  label: string;
  title: string;
  description: string;
};

export type WheelProcessStep = {
  step: string;
  title: string;
  description: string;
};

export const WHEEL_IMAGE_WIDTH = 1086 as const;
export const WHEEL_IMAGE_HEIGHT = 1448 as const;
export const WHEEL_IMAGE_ASPECT_RATIO = "3/4" as const;

const WHEEL_IMAGE_FILENAMES = [
  "1-1.png",
  "1-2.png",
  "1-3.png",
  "1-4.png",
  "1-5.png",
  "1-6.png",
  "1-7.png",
  "1-8.png",
  "1-9.png",
  "1-10.png",
  "1-11.png",
  "1-12.png",
  "1-13.png",
  "1-14.png",
  "1-15.png",
  "1-16.png",
  "1-17.png",
  "1-18.png",
  "1-19.png",
  "1-20.png",
  "1-21.png",
] as const;

export const wheelCategoryLabels: Record<WheelCategory, string> = {
  sport: "运动风格",
  "multi-spoke": "多辐条视觉",
  premium: "质感升级",
  detail: "细节参考",
};

function categoryForOrder(order: number): WheelCategory {
  if (order <= 6) return "sport";
  if (order <= 12) return "multi-spoke";
  if (order <= 17) return "premium";
  return "detail";
}

export const wheelGalleryImages: readonly WheelImage[] =
  WHEEL_IMAGE_FILENAMES.map((filename, index) => {
    const order = index + 1;
    const category = categoryForOrder(order);
    const serial = String(order).padStart(2, "0");

    return {
      id: `wheel-${serial}`,
      filename,
      publicPath: `/images/products/wheel/${filename}`,
      width: WHEEL_IMAGE_WIDTH,
      height: WHEEL_IMAGE_HEIGHT,
      aspectRatio: WHEEL_IMAGE_ASPECT_RATIO,
      title: `轮毂方案 ${serial}`,
      category,
      alt: `蓝辉轻改轮毂${wheelCategoryLabels[category]}展示图 ${serial}`,
    };
  });

export const wheelValues: readonly WheelValue[] = [
  {
    title: "原车数据匹配",
    description:
      "围绕尺寸、ET、孔距、中心孔、载重等关键数据确认可执行范围。",
  },
  {
    title: "外观姿态升级",
    description:
      "通过轮毂样式、颜色和辐条视觉改变车侧比例，让整车风格更明确。",
  },
  {
    title: "轮胎与刹车空间",
    description:
      "同步考虑轮胎规格、刹车卡钳空间和转向剐蹭风险，避免只看外观。",
  },
  {
    title: "交付复查标准",
    description:
      "安装后关注动平衡、螺丝扭矩、胎压、方向盘抖动和行驶异响。",
  },
];

export const wheelFitmentChecks: readonly WheelFitmentCheck[] = [
  {
    label: "SIZE",
    title: "尺寸与轮胎规格",
    description: "确认轮毂直径、宽度与轮胎规格是否适合原车使用场景。",
  },
  {
    label: "ET / PCD",
    title: "ET、孔距、中心孔",
    description: "确认安装数据与原车匹配，避免干涉、偏磨或固定风险。",
  },
  {
    label: "TPMS",
    title: "胎压传感器与气门嘴",
    description: "确认胎压传感器复用或更换方式，交付后检查胎压显示。",
  },
  {
    label: "BALANCE",
    title: "动平衡与复查",
    description: "安装后按规范做动平衡和扭矩复查，减少高速抖动风险。",
  },
];

export const wheelProcess: readonly WheelProcessStep[] = [
  {
    step: "01",
    title: "确认原车数据",
    description: "记录车型、年款、原厂轮毂尺寸、轮胎规格和刹车空间。",
  },
  {
    step: "02",
    title: "选择视觉方向",
    description: "结合车身颜色、改色方案和日常用途选择轮毂风格。",
  },
  {
    step: "03",
    title: "安装与动平衡",
    description: "按规范安装，完成动平衡、胎压和基础行驶检查。",
  },
  {
    step: "04",
    title: "交付与复查",
    description: "交付时说明磨合期注意事项，并提醒后续扭矩复查。",
  },
];
