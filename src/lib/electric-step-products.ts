export type ElectricStepVariant =
  | "no-light"
  | "single-light"
  | "large-light";

export type ElectricStepImage = {
  id: string;
  filename: string;
  publicPath: string;
  width: 1646 | 750;
  height: 1166 | 547 | 487;
  title: string;
  variant: ElectricStepVariant;
  alt: string;
  note: string;
};

export type ElectricStepValue = {
  title: string;
  description: string;
};

export type ElectricStepFitmentCheck = {
  label: string;
  title: string;
  description: string;
};

export type ElectricStepProcessStep = {
  step: string;
  title: string;
  description: string;
};

export type ElectricStepFitmentTag = {
  name: string;
  weight: "hero" | "strong" | "normal" | "subtle";
  note: string;
};

export const electricStepVariantLabels: Record<ElectricStepVariant, string> = {
  "no-light": "无灯款",
  "single-light": "单流光灯",
  "large-light": "大灯带款",
};

export const electricStepImages: readonly ElectricStepImage[] = [
  {
    id: "electric-step-large-light",
    filename: "biglight.jpg",
    publicPath: "/images/products/Taban/biglight.jpg",
    width: 1646,
    height: 1166,
    title: "电动踏板大灯带款",
    variant: "large-light",
    alt: "蓝辉轻改电动踏板大灯带款展示图",
    note: "灯带视觉更明显，适合重视迎宾氛围的车主到店参考。",
  },
  {
    id: "electric-step-single-light",
    filename: "singlelight.jpg",
    publicPath: "/images/products/Taban/singlelight.jpg",
    width: 750,
    height: 487,
    title: "电动踏板单流光灯款",
    variant: "single-light",
    alt: "蓝辉轻改电动踏板单流光灯款展示图",
    note: "保留灯带识别度，整体表达更克制。",
  },
  {
    id: "electric-step-no-light",
    filename: "nolight.jpg",
    publicPath: "/images/products/Taban/nolight.jpg",
    width: 750,
    height: 547,
    title: "电动踏板无灯款",
    variant: "no-light",
    alt: "蓝辉轻改电动踏板无灯款展示图",
    note: "更偏基础实用，重点关注上下车便利和收起后的原车姿态。",
  },
];

export const electricStepValues: readonly ElectricStepValue[] = [
  {
    title: "上下车更从容",
    description:
      "开门展开后降低上下车高度，适合 SUV、MPV 和高底盘车型的家庭高频使用。",
  },
  {
    title: "收起保留姿态",
    description:
      "收起后尽量贴合车侧线条，减少对原车外观完整度的影响。",
  },
  {
    title: "结构与承重确认",
    description:
      "需要结合车型底盘固定点、侧裙结构和日常乘员使用场景确认方案。",
  },
  {
    title: "电气边界清晰",
    description:
      "门体信号、电源接口、防夹逻辑和灯带方式必须现场确认，不做全车型通用承诺。",
  },
];

export const electricStepFitmentChecks: readonly ElectricStepFitmentCheck[] = [
  {
    label: "MOUNT",
    title: "底盘固定点",
    description: "确认原车安装位、侧裙结构和离地间隙，避免影响通过性。",
  },
  {
    label: "SIGNAL",
    title: "门体信号",
    description: "确认开关门信号读取方式，保证踏板展开和收回逻辑稳定。",
  },
  {
    label: "POWER",
    title: "电气接口",
    description: "确认供电、线束走向、防水和检修边界，避免破坏原车结构。",
  },
  {
    label: "SAFETY",
    title: "防夹与复查",
    description: "交付前检查展开/收回、防夹、异响、灯带和固定点状态。",
  },
];

export const electricStepFitmentTags: readonly ElectricStepFitmentTag[] = [
  { name: "问界 M7", weight: "hero", note: "家庭 SUV 高频上下车" },
  { name: "问界 M8", weight: "hero", note: "大六座家庭场景" },
  { name: "问界 M9", weight: "strong", note: "大型 SUV 便利升级" },
  { name: "理想 L9", weight: "hero", note: "老人小孩上下车" },
  { name: "理想 MEGA", weight: "strong", note: "MPV 后排接待" },
  { name: "理想 ONE", weight: "normal", note: "高底盘家用 SUV" },
  { name: "理想 i8", weight: "normal", note: "家庭出行场景" },
  { name: "高山 8", weight: "hero", note: "MPV 商务/家庭" },
  { name: "腾势 D9", weight: "strong", note: "商务 MPV 高频上下车" },
  { name: "岚图梦想家", weight: "strong", note: "MPV 后排便利" },
  { name: "乐道 L90", weight: "normal", note: "大车身 SUV" },
  { name: "蔚来 ES8", weight: "normal", note: "大六座 SUV" },
  { name: "小鹏 GX", weight: "subtle", note: "到店确认安装位" },
  { name: "极氪 9X", weight: "normal", note: "大型 SUV 方案确认" },
  { name: "极氪 009", weight: "strong", note: "MPV 接待场景" },
  { name: "奔驰 V 级", weight: "subtle", note: "商务接待车型" },
  { name: "传祺 M8", weight: "subtle", note: "MPV 上下车便利" },
  { name: "别克 GL8", weight: "subtle", note: "商务 MPV 常见咨询" },
];

export const electricStepProcess: readonly ElectricStepProcessStep[] = [
  {
    step: "01",
    title: "车型确认",
    description: "确认车型、年款、底盘结构、侧裙高度和家庭成员上下车场景。",
  },
  {
    step: "02",
    title: "款式选择",
    description: "结合是否需要灯带、迎宾氛围和原车观感，选择踏板款式。",
  },
  {
    step: "03",
    title: "安装调试",
    description: "按现场结构安装并调试开门展开、关门收回和灯带响应。",
  },
  {
    step: "04",
    title: "交付复查",
    description: "复查固定点、异响、防夹、离地间隙和后续用车注意事项。",
  },
];
