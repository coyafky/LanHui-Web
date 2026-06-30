/**
 * 蓝辉轻改产品数据
 *
 * Phase 1：先放产品骨架（名称、定位、适合人群、核心价值、服务流程），
 * 不写具体型号、价格、质保年限等未经确认的数据。
 */

import {
  Footprints,
  CircleDot,
  Wrench,
  Sun,
  Palette,
  ShieldCheck,
} from "lucide-react";
import type { ComponentType } from "react";

export type ProductGroup = "light-mod" | "film";

export type ProductSeries = {
  slug: string;
  name: string;
  model: string;
  origin?: string;
  material?: string;
  thickness?: string;
  coating?: string;
  glue?: string;
  finish?: string;
  elongation?: string;
  weathering?: string;
  gloss?: string;
  warranty?: string;
};

export type PerformanceRating = {
  name: string;
  model: string;
  yellowing: number;
  scratch: number;
  eco: number;
  impact: number;
};

export type ProductPackage = {
  slug: string;
  name: string;
  models: string;
  audience: string;
  frontProduct: string;
  frontParams: string;
  rearProduct: string;
  rearParams: string;
  warranty: string;
};

export type ColorFilmSeries = {
  slug: string;
  name: string;
  englishName: string;
  style: string;
  audience: string;
};

export type HotColorGroup = {
  category: string;
  colors: string[];
};

export type ServiceGuarantee = {
  construction: { title: string; description: string }[];
  acceptance: { item: string; standard: string }[];
  afterCare: { item: string; description: string }[];
  dailyTips: { scenario: string; advice: string }[];
};

export type Product = {
  slug: string;
  name: string;
  group: ProductGroup;
  groupLabel: string;
  tagline: string;
  cardDescription: string;
  heroDescription: string;
  audience: string[];
  values: { title: string; description: string }[];
  process: { step: string; title: string; description: string }[];
  // 新增可选字段
  series?: ProductSeries[];
  performanceRatings?: PerformanceRating[];
  packages?: ProductPackage[];
  specs?: Record<string, string>[];
  colorSeries?: ColorFilmSeries[];
  hotColors?: HotColorGroup[];
  protectionScenes?: { scene: string; description: string }[];
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
    cardDescription: "开门自动展开，收起贴合原车，无损安装不破线束。",
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
  },
  {
    slug: "wheels",
    name: "轮毂升级",
    group: "light-mod",
    groupLabel: "轻改装备",
    tagline: "换一套轮毂，换一种风格",
    cardDescription: "数据精准匹配，款式多样可选，兼顾视觉与行驶品质。",
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
  },
  {
    slug: "chassis",
    name: "底盘升级",
    group: "light-mod",
    groupLabel: "轻改装备",
    tagline: "更稳的姿态，更好的质感",
    cardDescription: "避震与加强件轻度升级，日常驾驶更舒适有质感。",
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
  },
  {
    slug: "window-film",
    name: "汽车窗膜",
    group: "film",
    groupLabel: "汽车膜系",
    tagline: "隔热防晒，守护清凉与隐私",
    cardDescription: "前挡清晰+侧后隐私，夏季用车更舒适。",
    heroDescription:
      "汽车太阳膜围绕隔热、防晒、防紫外线，提升隐私性与驾乘舒适度，为不同需求车主提供前挡+侧后挡专业搭配方案。",
    audience: ["日常通勤车主", "家庭用车车主", "新能源车主", "注重隔热和隐私的车主"],
    values: [
      {
        title: "高效隔热",
        description: "降低阳光热量进入车内，提升驾乘舒适度",
      },
      {
        title: "安全防爆",
        description: "提升玻璃破裂时的安全防护能力",
      },
      {
        title: "无惧眩光",
        description: "降低强光、逆光带来的驾驶干扰",
      },
      {
        title: "高清视线",
        description: "保持良好驾驶视野",
      },
      {
        title: "阻隔紫外线",
        description: "减少紫外线对皮肤和内饰的伤害",
      },
      {
        title: "保护隐私",
        description: "提升车内私密性",
      },
      {
        title: "环保节能",
        description: "降低空调负担，提高用车舒适度",
      },
    ],
    process: PROCESS_TEMPLATE,
    packages: [
      {
        slug: "chunfen",
        name: "春分套餐",
        models: "K7 + C15",
        audience: "对健康、环保、隔绝紫外线及隐私性要求较高的车主",
        frontProduct: "环保陶瓷膜 K7",
        frontParams: "可见光阻隔率 30%；紫外线阻隔率 99%；红外线阻隔率 94%；总太阳能阻隔率 47%；厚度 2mil",
        rearProduct: "环保陶瓷膜 C15",
        rearParams: "可见光阻隔率 85%；紫外线阻隔率 99%；红外线阻隔率 90%；总太阳能阻隔率 49%；厚度 1.5mil",
        warranty: "5年",
      },
      {
        slug: "guyu",
        name: "谷雨套餐",
        models: "T7 + F20",
        audience: "对紫外线、普通隔热、环保及隐私性要求较高的车主",
        frontProduct: "单层金属膜 T7",
        frontParams: "可见光阻隔率 30%；紫外线阻隔率 99%；红外线阻隔率 92%；总太阳能阻隔率 53%；厚度 2mil",
        rearProduct: "陶瓷护肤膜 F20",
        rearParams: "可见光阻隔率 80%；紫外线阻隔率 100%；红外线阻隔率 95%；总太阳能阻隔率 57%；厚度 2mil",
        warranty: "8年",
      },
      {
        slug: "xiaoman",
        name: "小满套餐",
        models: "Z70 + K15",
        audience: "对全车隔热、安全防爆及隐私性要求较高的车主",
        frontProduct: "12层金属膜 Z70",
        frontParams: "可见光阻隔率 28%；紫外线阻隔率 99%；红外线阻隔率 96%；总太阳能阻隔率 56%；厚度 3.5mil",
        rearProduct: "单银金属膜 K15",
        rearParams: "可见光阻隔率 85%；紫外线阻隔率 99%；红外线阻隔率 94%；总太阳能阻隔率 58%；厚度 2mil",
        warranty: "10年",
      },
      {
        slug: "mangzhong",
        name: "芒种套餐",
        models: "Z70 + Z20",
        audience: "对全车隔热、安全防爆及隐私性要求较高的车主",
        frontProduct: "12层金属膜 Z70",
        frontParams: "可见光阻隔率 28%；紫外线阻隔率 99%；红外线阻隔率 96%；总太阳能阻隔率 56%；厚度 3.5mil",
        rearProduct: "双银金属膜 Z20",
        rearParams: "可见光阻隔率 75%；紫外线阻隔率 99%；红外线阻隔率 96%；总太阳能阻隔率 65%；厚度 3mil",
        warranty: "10年",
      },
      {
        slug: "bailu",
        name: "白露套餐",
        models: "Z80 + Z20",
        audience: "对全车隔热、安全防爆及隐私性要求较高的车主",
        frontProduct: "变色陶瓷膜 Z80",
        frontParams: "可见光阻隔率 28-55%；紫外线阻隔率 99%；红外线阻隔率 90%；总太阳能阻隔率 53-62%；厚度 3mil",
        rearProduct: "双银金属膜 Z20",
        rearParams: "可见光阻隔率 75%；紫外线阻隔率 99%；红外线阻隔率 96%；总太阳能阻隔率 65%；厚度 3mil",
        warranty: "10年",
      },
      {
        slug: "wanghong",
        name: "网红套餐",
        models: "G7",
        audience: "对健康、环保、隔绝紫外线及隐私性要求较高的车主",
        frontProduct: "帝王紫/凤凰红 G7",
        frontParams: "可见光阻隔率 28%；紫外线阻隔率 99%；红外线阻隔率 90%；总太阳能阻隔率 56%；厚度 2mil",
        rearProduct: "同系列搭配",
        rearParams: "可见光阻隔率 28%；紫外线阻隔率 99%；红外线阻隔率 90%；总太阳能阻隔率 56%；厚度 2mil",
        warranty: "7年",
      },
      {
        slug: "yangsheng",
        name: "养生套餐",
        models: "M7 + N20",
        audience: "对健康、环保、隔绝紫外线及隐私性要求较高的车主",
        frontProduct: "负离子膜 M7",
        frontParams: "可见光阻隔率 28%；紫外线阻隔率 99%；红外线阻隔率 80%；总太阳能阻隔率 49%；厚度 2mil",
        rearProduct: "负离子膜 N20",
        rearParams: "可见光阻隔率 72%；紫外线阻隔率 99%；红外线阻隔率 90%；总太阳能阻隔率 59%；厚度 2mil",
        warranty: "10年",
      },
    ],
    specs: [
      { model: "K7", position: "前挡", vlt: "30%", uvr: "99%", irr: "94%", tser: "47%", thickness: "2mil", warranty: "5年" },
      { model: "C15", position: "侧后挡", vlt: "85%", uvr: "99%", irr: "90%", tser: "49%", thickness: "1.5mil", warranty: "5年" },
      { model: "T7", position: "前挡", vlt: "30%", uvr: "99%", irr: "92%", tser: "53%", thickness: "2mil", warranty: "8年" },
      { model: "F20", position: "侧后挡", vlt: "80%", uvr: "100%", irr: "95%", tser: "57%", thickness: "2mil", warranty: "8年" },
      { model: "Z70", position: "前挡", vlt: "28%", uvr: "99%", irr: "96%", tser: "56%", thickness: "3.5mil", warranty: "10年" },
      { model: "K15", position: "侧后挡", vlt: "85%", uvr: "99%", irr: "94%", tser: "58%", thickness: "2mil", warranty: "10年" },
      { model: "Z20", position: "侧后挡", vlt: "75%", uvr: "99%", irr: "96%", tser: "65%", thickness: "3mil", warranty: "10年" },
      { model: "Z80", position: "前挡", vlt: "28-55%", uvr: "99%", irr: "90%", tser: "53-62%", thickness: "3mil", warranty: "10年" },
      { model: "G7", position: "前挡", vlt: "28%", uvr: "99%", irr: "90%", tser: "56%", thickness: "2mil", warranty: "7年" },
      { model: "M7", position: "前挡", vlt: "28%", uvr: "99%", irr: "80%", tser: "49%", thickness: "2mil", warranty: "10年" },
      { model: "N20", position: "侧后挡", vlt: "72%", uvr: "99%", irr: "90%", tser: "59%", thickness: "2mil", warranty: "10年" },
    ],
  },
  {
    slug: "color-film",
    name: "改色膜",
    group: "film",
    groupLabel: "汽车膜系",
    tagline: "换个颜色，换种心情",
    cardDescription: "色系丰富可选，不伤原漆，撕除即可恢复。",
    heroDescription:
      "车身改色膜适合希望改变车辆外观风格、提升视觉个性，同时保留原厂车漆的车主。通过车身覆膜方式，可以在不喷漆的前提下改变车辆颜色。",
    audience: ["追求个性外观的车主", "年轻车主", "新能源车主"],
    values: [
      {
        title: "色系丰富",
        description: "提供亮光、马卡龙、电光、水晶、镭射等 15 大系列",
      },
      {
        title: "保护原漆",
        description: "覆膜保护原厂车漆，撕除后可恢复",
      },
      {
        title: "个性表达",
        description: "满足个性化、年轻化、视觉升级需求",
      },
      {
        title: "无需喷漆",
        description: "不动原车漆，不影响二手车评估",
      },
    ],
    process: PROCESS_TEMPLATE,
    colorSeries: [
      { slug: "glossy", name: "亮光系列", englishName: "Glossy", style: "亮面质感，接近原厂漆面效果，视觉干净直接", audience: "喜欢经典、耐看、接近原车漆质感的车主" },
      { slug: "macaron", name: "马卡龙系列", englishName: "Macaron", style: "色彩柔和，年轻时尚，偏轻奢与潮流风格", audience: "年轻车主、女性车主、新能源车主" },
      { slug: "galaxy", name: "电光系列", englishName: "Galaxy", style: "带有强烈光泽变化，视觉冲击力强", audience: "喜欢高辨识度和运动感的车主" },
      { slug: "crystal", name: "水晶系列", englishName: "Crystal", style: "通透感更强，色彩层次明显", audience: "喜欢高级感和细腻色彩变化的车主" },
      { slug: "prisma", name: "镭射系列", englishName: "Prisma", style: "多角度变色，具有科技感和炫彩效果", audience: "追求个性化、潮流化的车主" },
      { slug: "satin-chrome", name: "绸缎冰系列", englishName: "Satin Chrome", style: "半哑光、金属、丝滑质感", audience: "喜欢高级、克制、轻奢风格的车主" },
      { slug: "starlight", name: "星空系列", englishName: "Starlight", style: "星空闪点效果，视觉更梦幻", audience: "喜欢独特色彩和夜间效果的车主" },
      { slug: "midnight", name: "午夜系列", englishName: "Midnight", style: "深色系、黑色系为主，沉稳运动", audience: "喜欢低调、运动、黑武士风格的车主" },
      { slug: "white-iridescent", name: "白色系列", englishName: "White Iridescent", style: "白色珠光、幻彩、冰感风格", audience: "喜欢干净、简约、高级白色系的车主" },
      { slug: "magic", name: "幻彩系列", englishName: "Magic", style: "色彩变化明显，个性化强", audience: "喜欢高回头率的车主" },
      { slug: "diamond", name: "钻石系列", englishName: "Diamond", style: "带颗粒闪光质感，视觉更精致", audience: "喜欢亮眼、精致、闪粉质感的车主" },
      { slug: "pearl-metal", name: "银河系列", englishName: "Pearl Metal", style: "珠光金属质感，兼具高级和运动", audience: "喜欢金属质感和高级光泽的车主" },
      { slug: "iridescence-chrome", name: "彩虹电镀系列", englishName: "Iridescence Chrome", style: "彩虹变色、电镀质感强", audience: "追求强烈个性和视觉冲击的车主" },
      { slug: "metallic", name: "极光金属系列", englishName: "Metallic", style: "金属色泽明显，适合越野和性能车风格", audience: "喜欢力量感、机械感的车主" },
      { slug: "matt-chrome", name: "亚光电镀系列", englishName: "Matt Chrome", style: "哑光与电镀结合，质感强烈", audience: "喜欢低调但有高级质感的车主" },
    ],
    hotColors: [
      { category: "黑灰色系", colors: ["电光金属黑", "磨砂黑", "电光深邃灰", "超哑灰蓝", "液态金属银", "电光钛灰"] },
      { category: "白色系", colors: ["珠光白", "钻石白", "皓面钻石珠白", "水晶纳多灰"] },
      { category: "粉紫色系", colors: ["超美金属冰莓粉", "电光樱花粉", "双色情雾果胭粉", "双色情幻灰樱紫"] },
      { category: "蓝绿色系", colors: ["水晶远阿宝蓝", "电光墨绿", "美幻彩冰川蓝幻绿", "水晶冰川蓝", "水晶迪芙尼", "彩虹祖母绿"] },
      { category: "黄色系", colors: ["珠光荧光黄", "水晶卡其绿"] },
      { category: "金属质感色", colors: ["超亮金属银河蓝", "超亮金属黑", "银河系列", "极光金属系列"] },
    ],
  },
  {
    slug: "ppf",
    name: "隐形车衣",
    group: "film",
    groupLabel: "汽车膜系",
    tagline: "花少钱，贴对膜",
    cardDescription: "TPU透明膜防刮自修复，剐蹭碎石都不怕。",
    heroDescription:
      "隐形车衣以透明膜覆盖原车漆面，保护原厂车漆免受划痕、剐蹭、酸雨、水垢、鸟粪、树胶等日常伤害，适合新车车主及重视漆面保值的车主。",
    audience: ["新车车主", "高端车型车主", "重视保值率和漆面保护的车主"],
    values: [
      {
        title: "原材料优势",
        description:
          "ARGOTEC 基膜、美国亚什兰胶水、纳米与金属自修复涂层、双交联自洁功能，抗污能力强",
      },
      {
        title: "制造设备",
        description:
          "美国进口流延与涂布设备，与龙膜/XP 同款专业设备；亚洲精选特色委托制造加工上市公司",
      },
      {
        title: "生产工艺",
        description:
          "独创流延成膜核心生产工艺，金属交联自修复涂层，使膜面长期保持高抗污与修复功能",
      },
      {
        title: "技术服务",
        description:
          "系统用户服务保障体系、完善质保信息体系、平台数据安全保障体系、超10万个车型数据库裁膜软件，支持不动刀施工",
      },
    ],
    process: PROCESS_TEMPLATE,
    protectionScenes: [
      { scene: "防止树胶叶痕", description: "减少树胶、落叶残留对车漆的腐蚀" },
      { scene: "防止鸟粪虫尸", description: "降低酸性物质对漆面的伤害" },
      { scene: "防止酸雨水垢", description: "减少雨水、水垢长期停留造成的漆面问题" },
      { scene: "防止风沙粉尘", description: "减少细小颗粒对漆面的摩擦伤害" },
      { scene: "杜绝高速石子", description: "降低高速行驶中石子飞溅造成的漆面破损" },
      { scene: "杜绝车身剐蹭", description: "降低轻微剐蹭对原厂车漆的影响" },
      { scene: "杜绝恶意划车", description: "增强车身表面对划痕的防护能力" },
      { scene: "杜绝车身乱画", description: "便于清洁，减少表面污染残留" },
    ],
    series: [
      { slug: "pixiu", name: "貔貅", model: "YM-60", origin: "CHN", material: "国产军工级 TPU", thickness: "6.5mil", coating: "热固化涂层", glue: "Ashland 亚什兰", finish: "有色亮面", elongation: ">400%", weathering: "Quv 1200H", gloss: "30%", warranty: "3年" },
      { slug: "qinglong", name: "青龙", model: "YM-65", origin: "CHN", material: "国产军工级 TPU", thickness: "7.5mil", coating: "热固化涂层", glue: "Ashland 亚什兰", finish: "有色亮面", elongation: ">400%", weathering: "Quv 1200H", gloss: "40%", warranty: "5年" },
      { slug: "baihu", name: "白虎", model: "YM-70", origin: "GER", material: "德国 TPU 脂肪族", thickness: "7.5mil", coating: "双层 UV 固化涂层", glue: "Ashland® 亚什兰", finish: "有色亮面", elongation: ">450%", weathering: "Quv 1250H", gloss: "45%", warranty: "8年" },
      { slug: "zhuque", name: "朱雀", model: "YM-80", origin: "GER", material: "德国 TPU 脂肪族", thickness: "8.5mil", coating: "双层 UV 固化涂层", glue: "Ashland® 亚什兰", finish: "有色亮面", elongation: ">480%", weathering: "Quv 1300H", gloss: "50%", warranty: "10年" },
      { slug: "xuanwu", name: "玄武", model: "YM-80Y", origin: "GER", material: "德国 TPU 脂肪族", thickness: "8.5mil", coating: "双层 UV 固化涂层", glue: "Ashland® 亚什兰", finish: "有色亮面", elongation: ">480%", weathering: "Quv 1300H", gloss: "无", warranty: "5年" },
      { slug: "qilin", name: "麒麟", model: "YM-10", origin: "GER", material: "德国 TPU 脂肪族", thickness: "10mil", coating: "双层 UV 固化涂层", glue: "Ashland® 亚什兰", finish: "有色亮面", elongation: ">550%", weathering: "Quv 1500H", gloss: "60%", warranty: "12年" },
      { slug: "fenghuang", name: "凤凰", model: "YM-100", origin: "USA", material: "美国路博润 TPU", thickness: "8.5mil", coating: "双交联金属涂层", glue: "Ashland 亚什兰", finish: "有色亮面", elongation: ">500%", weathering: "Quv 1200H", gloss: "65%", warranty: "10年" },
      { slug: "zhulong", name: "烛龙", model: "YM-1000", origin: "USA", material: "美国路博润 TPU", thickness: "10mil", coating: "双交联金属涂层", glue: "Ashland 亚什兰", finish: "有色亮面", elongation: ">550%", weathering: "Quv 1200H", gloss: "65%", warranty: "12年" },
    ],
    performanceRatings: [
      { name: "貔貅", model: "YM-60", yellowing: 3, scratch: 3, eco: 4, impact: 3 },
      { name: "青龙", model: "YM-65", yellowing: 4, scratch: 4, eco: 4, impact: 4 },
      { name: "白虎", model: "YM-70", yellowing: 5, scratch: 5, eco: 4, impact: 4 },
      { name: "朱雀", model: "YM-80", yellowing: 5, scratch: 5, eco: 5, impact: 5 },
      { name: "玄武", model: "YM-80Y", yellowing: 5, scratch: 5, eco: 5, impact: 5 },
      { name: "麒麟", model: "YM-10", yellowing: 5, scratch: 5, eco: 5, impact: 5 },
      { name: "凤凰", model: "YM-100", yellowing: 6, scratch: 6, eco: 6, impact: 6 },
      { name: "烛龙", model: "YM-1000", yellowing: 7, scratch: 7, eco: 7, impact: 7 },
    ],
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
  "electric-steps": "",
  wheels: "",
  chassis: "",
  "window-film": "/images/products/window-film.png",
  "color-film": "/images/products/color-film.png",
  ppf: "/images/products/ppf.png",
};

export const PRODUCT_ICON_MAP: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  "electric-steps": Footprints,
  wheels: CircleDot,
  chassis: Wrench,
  "window-film": Sun,
  "color-film": Palette,
  ppf: ShieldCheck,
};

// 窗膜套餐查询
export function getWindowFilmPackage(slug: string): ProductPackage | undefined {
  const product = getProduct("window-film");
  return product?.packages?.find((p) => p.slug === slug);
}

export function getAllWindowFilmPackageSlugs(): string[] {
  const product = getProduct("window-film");
  return product?.packages?.map((p) => p.slug) ?? [];
}

// PPF 系列查询
export function getPpfSeries(slug: string): ProductSeries | undefined {
  const product = getProduct("ppf");
  return product?.series?.find((s) => s.slug === slug);
}

export function getAllPpfSeriesSlugs(): string[] {
  const product = getProduct("ppf");
  return product?.series?.map((s) => s.slug) ?? [];
}

// 改色膜系列查询
export function getColorFilmSeries(slug: string): ColorFilmSeries | undefined {
  const product = getProduct("color-film");
  return product?.colorSeries?.find((s) => s.slug === slug);
}

export function getAllColorFilmSeriesSlugs(): string[] {
  const product = getProduct("color-film");
  return product?.colorSeries?.map((s) => s.slug) ?? [];
}

export const serviceGuarantee: ServiceGuarantee = {
  construction: [
    { title: "车型数据库", description: "构建全面车型数据库，支持不同车型精准适配" },
    { title: "电脑裁膜", description: "采用专车专用电脑裁膜工艺" },
    { title: "免裁刀施工", description: "全程免裁刀，降低手工裁切对车辆造成损伤的风险" },
    { title: "免拆卸操作", description: "尽量减少拆卸，保护原车部件" },
    { title: "施工目标", description: "从源头规避手工裁切与部件拆卸可能造成的车辆损伤，守护原车品质" },
  ],
  acceptance: [
    { item: "折痕", standard: "不允许出现" },
    { item: "划痕", standard: "不允许出现" },
    { item: "起泡", standard: "不允许出现" },
    { item: "尘点", standard: "单个面少于 6 个尘点，且以边缘为标准" },
    { item: "胶痕", standard: "平面不能出现；曲面边角处不大于 3mm" },
    { item: "包边", standard: "包边处拒绝漏边、漏角" },
  ],
  afterCare: [
    { item: "三天内不要高速行驶", description: "装贴后 3 天内，时速建议控制在 60 码以内" },
    { item: "雷达异常及时回店", description: "如果雷达报警或异响，可回店处理雷达孔位置膜面" },
    { item: "改色膜三天回店复检", description: "改色膜施工后 3 天建议回店复检" },
    { item: "三天内不能洗车", description: "改色膜施工后 3 天内不建议洗车" },
  ],
  dailyTips: [
    { scenario: "鸟粪/胶水/树脂/泡沫", advice: "酸碱性强的物质不要长时间停留在膜面，应及时清理" },
    { scenario: "空调滴水/地下车库滴水", advice: "避免长期停放在含重金属滴水位置下方" },
    { scenario: "油烟排风扇附近", advice: "避免停放在油烟排风扇旁，防止油渍附着膜面" },
    { scenario: "婚车吸盘", advice: "已贴车衣车辆不建议将吸盘直接吸附在膜面" },
    { scenario: "易褪色物品", advice: "不要长时间放置在膜面，避免染色" },
    { scenario: "膜面护理", advice: "建议定期进行膜面护理，保持膜面光亮如新" },
  ],
};
