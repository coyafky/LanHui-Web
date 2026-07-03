export type CarMatCategory =
  | "full-wrap"
  | "trunk"
  | "texture"
  | "detail";

export type CarMatImage = {
  id: string;
  filename: string;
  publicPath: string;
  width: 1086;
  height: 1448;
  aspectRatio: "3/4";
  title: string;
  category: CarMatCategory;
  alt: string;
};

export type CarMatValue = {
  title: string;
  description: string;
};

export type CarMatScenario = {
  label: string;
  title: string;
  description: string;
};

export type CarMatProcessStep = {
  step: string;
  title: string;
  description: string;
};

export const CARMAT_IMAGE_WIDTH = 1086 as const;
export const CARMAT_IMAGE_HEIGHT = 1448 as const;
export const CARMAT_IMAGE_ASPECT_RATIO = "3/4" as const;

const CARMAT_IMAGE_FILENAMES = [
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
  "1-22.png",
  "1-23.png",
  "1-24.png",
  "1-25.png",
  "1-26.png",
  "1-27.png",
  "1-28.png",
  "1-29.png",
] as const;

export const carMatCategoryLabels: Record<CarMatCategory, string> = {
  "full-wrap": "全包覆方案",
  trunk: "尾箱与后排",
  texture: "材质与色感",
  detail: "边角细节",
};

function categoryForOrder(order: number): CarMatCategory {
  if (order <= 8) return "full-wrap";
  if (order <= 15) return "trunk";
  if (order <= 22) return "texture";
  return "detail";
}

export const carMatGalleryImages: readonly CarMatImage[] =
  CARMAT_IMAGE_FILENAMES.map((filename, index) => {
    const order = index + 1;
    const category = categoryForOrder(order);
    const serial = String(order).padStart(2, "0");

    return {
      id: `carmat-${serial}`,
      filename,
      publicPath: `/images/products/carmat/${filename}`,
      width: CARMAT_IMAGE_WIDTH,
      height: CARMAT_IMAGE_HEIGHT,
      aspectRatio: CARMAT_IMAGE_ASPECT_RATIO,
      title: `汽车垫方案 ${serial}`,
      category,
      alt: `蓝辉轻改汽车垫${carMatCategoryLabels[category]}展示图 ${serial}`,
    };
  });

export const carMatValues: readonly CarMatValue[] = [
  {
    title: "车型到店确认",
    description:
      "先确认车型、年款、座椅布局与原车地毯状态，再沟通汽车垫覆盖范围。",
  },
  {
    title: "座舱全包覆",
    description:
      "围绕主副驾、二排、过道、门槛与尾箱区域做整体搭配，减少零散拼接感。",
  },
  {
    title: "易清洁维护",
    description:
      "面向家庭通勤、接送小孩、商务接待等高频场景，优先考虑日常打理便利性。",
  },
  {
    title: "风格统一",
    description:
      "根据内饰颜色、地板质感和使用习惯选择方案，让座舱视觉更完整。",
  },
];

export const carMatScenarios: readonly CarMatScenario[] = [
  {
    label: "NEW CAR",
    title: "新车落地先保护",
    description: "适合刚提车用户，先把脚部高频磨损区域和尾箱区域统一保护。",
  },
  {
    label: "FAMILY",
    title: "家庭通勤更好打理",
    description: "适合接送、露营、带娃等高频用车，减少泥沙和水渍清理压力。",
  },
  {
    label: "BUSINESS",
    title: "商务后排更整洁",
    description: "适合 MPV / 大六座 SUV，强化后排空间的完整度和接待观感。",
  },
];

export const carMatProcess: readonly CarMatProcessStep[] = [
  {
    step: "01",
    title: "车型沟通",
    description: "确认车型、年款、座椅布局、尾箱使用习惯和原车地毯状态。",
  },
  {
    step: "02",
    title: "方案选择",
    description: "结合内饰颜色、覆盖区域和日常使用场景，选择汽车垫方案。",
  },
  {
    step: "03",
    title: "到店安装",
    description: "按现场车型结构施工，重点检查踏板、滑轨、门槛等活动区域。",
  },
  {
    step: "04",
    title: "交付说明",
    description: "交付时说明清洁维护方式，并提醒后续使用中的注意事项。",
  },
];
