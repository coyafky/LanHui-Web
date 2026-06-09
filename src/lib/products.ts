/**
 * 蓝辉轻改产品数据
 *
 * Phase 1：先放产品骨架（名称、定位、适合人群、核心价值、服务流程），
 * 不写具体型号、价格、质保年限等未经确认的数据。
 */

export type ProductGroup = "light-mod" | "film";

export type Product = {
  slug: string;
  name: string;
  group: ProductGroup;
  groupLabel: string;
  tagline: string;
  heroDescription: string;
  audience: string[];
  values: { title: string; description: string }[];
  process: { step: string; title: string; description: string }[];
  cta: { label: string; href: string };
};

const PROCESS_TEMPLATE = [
  {
    step: "01",
    title: "到店沟通",
    description: "到蓝辉轻改顺德大良店，面对面沟通用车场景与升级需求。",
  },
  {
    step: "02",
    title: "车型确认",
    description: "确认车型、年款与原车状态，给出可执行的升级建议。",
  },
  {
    step: "03",
    title: "方案推荐",
    description: "结合预算与风格偏好，推荐轻改或膜系方案。",
  },
  {
    step: "04",
    title: "施工交付",
    description: "按标准流程施工交付，并提示后续用车与维护建议。",
  },
];

export const products: Product[] = [
  {
    slug: "electric-steps",
    name: "电动踏板",
    group: "light-mod",
    groupLabel: "轻改装备",
    tagline: "上下车更从容，也更稳",
    heroDescription:
      "电动踏板面向家用 SUV / MPV / 越野等高底盘车型，展开后降低上下车高度，收起后保持原车姿态。",
    audience: [
      "家用 SUV / MPV / 越野车主",
      "上下车不便的家庭用户",
      "注重原车观感的车主",
    ],
    values: [
      {
        title: "迎宾便利",
        description: "开门自动展开，降低上下车高度，老人小孩更方便。",
      },
      {
        title: "姿态保留",
        description: "收起后贴合原车侧裙，不破坏原车线条。",
      },
      {
        title: "承重稳定",
        description: "采用金属骨架与防滑踏面，长期使用更稳定。",
      },
      {
        title: "无损安装",
        description: "优先采用原车接口对插方案，不破坏原车线束。",
      },
    ],
    process: PROCESS_TEMPLATE,
    cta: { label: "预约门店咨询", href: "/agent" },
  },
  {
    slug: "wheels",
    name: "轮毂升级",
    group: "light-mod",
    groupLabel: "轻改装备",
    tagline: "轮毂样式与尺寸的合规升级",
    heroDescription:
      "围绕原车数据与驾驶习惯，提供轮毂样式、尺寸、颜色的合规升级方案，兼顾视觉与行驶品质。",
    audience: [
      "希望提升整车颜值的车主",
      "准备换轮胎/做四轮保养的车主",
      "关注行驶质感与刹车散热的车主",
    ],
    values: [
      {
        title: "数据匹配",
        description: "结合原车 ET 值、孔距、中心孔给出可装方案。",
      },
      {
        title: "款式多样",
        description: "提供多款不同风格的轮毂样式可选。",
      },
      {
        title: "动平衡考虑",
        description: "升级方案会同步考虑动平衡与刹车散热空间。",
      },
      {
        title: "施工标准",
        description: "按规范扭矩安装，提示磨合期注意事项。",
      },
    ],
    process: PROCESS_TEMPLATE,
    cta: { label: "预约门店咨询", href: "/agent" },
  },
  {
    slug: "chassis",
    name: "底盘升级",
    group: "light-mod",
    groupLabel: "轻改装备",
    tagline: "提升行驶姿态与稳定性",
    heroDescription:
      "围绕避震、连杆、加强件等底盘部件的轻度升级，让车辆在日常驾驶中更稳、更有质感。",
    audience: [
      "关注行驶质感的车主",
      "偶尔跑山/长途的车主",
      "希望降低车身高度但保留舒适性的车主",
    ],
    values: [
      {
        title: "姿态升级",
        description: "在合理范围内降低车身高度，提升视觉与高速稳定性。",
      },
      {
        title: "支撑增强",
        description: "通过避震与加强件提高过弯支撑。",
      },
      {
        title: "日常可保留",
        description: "升级方向以日常驾驶可接受为前提，不做极端赛事化。",
      },
      {
        title: "规范施工",
        description: "采用规范的四轮定位与扭矩流程完成安装。",
      },
    ],
    process: PROCESS_TEMPLATE,
    cta: { label: "预约门店咨询", href: "/agent" },
  },
  {
    slug: "window-film",
    name: "汽车窗膜",
    group: "film",
    groupLabel: "汽车膜系",
    tagline: "隔热、防晒、保护车内隐私",
    heroDescription:
      "汽车窗膜围绕隔热、紫外线阻隔与隐私保护，提供前挡、侧后挡等不同部位的产品搭配建议。",
    audience: [
      "关注夏季用车舒适度的车主",
      "注重车内皮肤与内饰保护的车主",
      "对隐私有要求的车主",
    ],
    values: [
      {
        title: "隔热",
        description: "降低阳光直射带来的车内温度上升。",
      },
      {
        title: "防晒",
        description: "阻隔紫外线，保护内饰与皮肤。",
      },
      {
        title: "隐私",
        description: "通过深浅搭配提升侧后挡隐私性。",
      },
      {
        title: "清晰视野",
        description: "前挡在隔热的同时保持视野清晰。",
      },
    ],
    process: PROCESS_TEMPLATE,
    cta: { label: "预约门店咨询", href: "/agent" },
  },
  {
    slug: "color-film",
    name: "改色膜",
    group: "film",
    groupLabel: "汽车膜系",
    tagline: "换个颜色，换种心情",
    heroDescription:
      "改色膜为车主提供颜色个性化的方案，色系丰富，施工后可恢复原车漆，是表达审美的轻量方式。",
    audience: [
      "想尝试新颜色的车主",
      "不想动原车漆的车主",
      "短期租赁/置换前的车主",
    ],
    values: [
      {
        title: "颜色丰富",
        description: "提供亮色、暗色、金属、哑光等多种色系。",
      },
      {
        title: "保护原漆",
        description: "贴膜后可在一定程度上保护原车漆。",
      },
      {
        title: "可恢复",
        description: "撕除后恢复原车漆，不影响二手车评估。",
      },
      {
        title: "局部升级",
        description: "可选择全车或局部贴膜，控制预算。",
      },
    ],
    process: PROCESS_TEMPLATE,
    cta: { label: "预约门店咨询", href: "/agent" },
  },
  {
    slug: "ppf",
    name: "隐形车衣",
    group: "film",
    groupLabel: "汽车膜系",
    tagline: "为原车漆提供日常保护",
    heroDescription:
      "隐形车衣以透明膜覆盖原车漆面，应对日常剐蹭、碎石冲击与洗车划痕等使用场景。",
    audience: [
      "新车主",
      "高保值率车型",
      "在意漆面状态的车主",
    ],
    values: [
      {
        title: "物理防护",
        description: "覆盖漆面，应对日常剐蹭、碎石冲击。",
      },
      {
        title: "保持光泽",
        description: "维持原车漆的色泽与亮度。",
      },
      {
        title: "局部可修复",
        description: "局部受损可单独处理，不需要整面更换。",
      },
      {
        title: "易于清洁",
        description: "日常洗车与污渍处理更方便。",
      },
    ],
    process: PROCESS_TEMPLATE,
    cta: { label: "预约门店咨询", href: "/agent" },
  },
];

export const productGroups: { id: ProductGroup; label: string; description: string }[] = [
  {
    id: "light-mod",
    label: "轻改装备",
    description: "围绕姿态、便利、行驶质感的功能性升级。",
  },
  {
    id: "film",
    label: "汽车膜系",
    description: "围绕隔热、隐私、漆面保护与个性化表达。",
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getAllProductSlugs(): string[] {
  return products.map((p) => p.slug);
}

export const productImageMap: Record<string, string> = {
  "electric-steps": "/images/products/electric-steps.png",
  wheels: "/images/products/wheels.png",
  chassis: "/images/products/chassis.png",
  "window-film": "/images/products/window-film.png",
  "color-film": "/images/products/color-film.png",
  ppf: "/images/products/ppf.png",
};
