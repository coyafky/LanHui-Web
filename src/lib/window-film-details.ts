/**
 * 汽车窗膜套餐详情文案（PRD §8, §6.2, §6.3）
 *
 * 与 src/lib/products.ts 中 packages 基础数据合并后供详情页与总页使用。
 * 主数据（slug / name / models / audience / frontProduct / frontParams /
 * rearProduct / rearParams / warranty）保持 products.ts 不动，本文件
 * 仅承载 PRD §9 列出的 8 个新字段以及导购与参数解释常量。
 */

import {
  getWindowFilmPackage,
  getAllWindowFilmPackageSlugs,
  type ProductPackage,
} from "@/lib/products";

export type WindowFilmPackageDetails = {
  /** 一句话定位（PRD §7.1 Hero） */
  positioning: string;
  /** 主话术（PRD §8 各小节） */
  headline: string;
  /** 短摘要（用于卡片副标题或面包屑） */
  summary: string;
  /** 场景痛点 3-4 条（PRD §7.2） */
  painPoints: string[];
  /** 套餐作用（PRD §7.3） */
  benefits: { title: string; description: string }[];
  /** 典型用车场景 2-3 个（PRD §7.5） */
  scenarios: { title: string; description: string }[];
  /** 参数解读（PRD §7.4） */
  parameterNotes: {
    position: "front" | "rear";
    product: string;
    params: string;
    userMeaning: string;
  }[];
  /** ChatGPT Image 生成提示词（PRD §13） */
  imagePrompt?: string;
};

export const windowFilmDetails: Record<string, WindowFilmPackageDetails> = {
  chunfen: {
    positioning:
      "健康环保入门选择，适合日常通勤、家庭用车和第一次贴膜的车主。",
    headline:
      "春分套餐更适合希望「够清晰、够防晒、够隐私」的车主。前挡 K7 保持日常驾驶视线，侧后挡 C15 提升隐私与后排防晒，是一套偏稳妥、易理解的基础组合。",
    summary: "入门友好，前挡清晰，侧后挡兼顾隐私。",
    painPoints: [
      "午后暴晒后车内升温明显。",
      "后排儿童或家人需要更舒适的防晒。",
      "日常通勤想减少强光干扰。",
      "停车时希望车内物品不那么容易被看到。",
    ],
    benefits: [
      {
        title: "前挡负责视线清晰与正面隔热",
        description:
          "K7 环保陶瓷膜保持驾驶视野，同时降低阳光热量直接进入前排。",
      },
      {
        title: "侧后挡负责隐私、防晒和后排舒适",
        description:
          "C15 兼顾后排乘客防晒与车内私密性，避免「前挡清楚但侧后太晒」的割裂体验。",
      },
      {
        title: "前后搭配避免极端取舍",
        description:
          "不追求激进隔热参数，偏向日常使用稳妥、易理解，适合第一次贴膜的车主。",
      },
    ],
    scenarios: [
      {
        title: "午后通勤",
        description:
          "城市上下班高峰，前挡保持清晰，侧后挡减少阳光直晒后排。",
      },
      {
        title: "接送孩子",
        description: "后排儿童座椅需要更舒适的光线和温度，防晒更友好。",
      },
      {
        title: "城市短途",
        description:
          "日常短距离出行，侧重清晰视线与基本隐私，不必追求极限隔热。",
      },
    ],
    parameterNotes: [
      {
        position: "front",
        product: "环保陶瓷膜 K7",
        params: "可见光阻隔率 30%；紫外线阻隔率 99%；红外线阻隔率 94%；总太阳能阻隔率 47%；厚度 2mil",
        userMeaning:
          "前挡保持清晰视野，同时阻隔热量和紫外线，是日常驾驶的稳妥选择。",
      },
      {
        position: "rear",
        product: "环保陶瓷膜 C15",
        params: "可见光阻隔率 85%；紫外线阻隔率 99%；红外线阻隔率 90%；总太阳能阻隔率 49%；厚度 1.5mil",
        userMeaning: "侧后挡更偏隐私和后排舒适，紫外线阻隔高，适合家庭场景。",
      },
    ],
    imagePrompt:
      "新能源 SUV 停在城市道路旁，前挡清晰通透，侧后挡呈现适度深色隐私效果；阳光从侧前方照入但不刺眼；车内光线柔和；视觉重点：防晒、清晰视线、温和隐私；不要文字、不要价格、不要二维码、不要电话、不要品牌 Logo。",
  },

  guyu: {
    positioning:
      "日常通勤加强型，适合想要比入门更强隔热体验的车主。",
    headline:
      "谷雨套餐把前挡金属膜和侧后陶瓷护肤膜组合起来，适合关注防晒、普通隔热和隐私的车主。它不是最激进的高隔热路线，而是偏向日常舒适和稳定体验。",
    summary: "兼顾紫外线、普通隔热和隐私，适合日常通勤。",
    painPoints: [
      "每天通勤较久，前挡和侧后挡都希望更舒适。",
      "经常露天停车，车内升温较快。",
      "需要兼顾前排视线和后排防晒。",
      "希望比入门套餐明显更强的隔热表现。",
    ],
    benefits: [
      {
        title: "前挡金属膜提升隔热",
        description:
          "T7 单层金属膜在前挡上提供比环保陶瓷更强的总太阳能阻隔。",
      },
      {
        title: "侧后陶瓷护肤膜兼顾隐私",
        description:
          "F20 在侧后挡提供更高紫外线阻隔（100%），同时保持后排舒适度。",
      },
      {
        title: "日常通勤加强定位",
        description:
          "面向每天通勤较久、经常露天停车的车主，提供稳定而非激进的隔热提升。",
      },
    ],
    scenarios: [
      {
        title: "上下班高峰",
        description:
          "长时间在车内，前挡金属膜减少热量进入，侧后挡保持后排舒适。",
      },
      {
        title: "夏季露天停车",
        description:
          "回到车内时车内升温相对可控，空调负担降低。",
      },
      {
        title: "周末城市出行",
        description:
          "兼顾城市道路驾驶与户外停留场景，不需要极端参数。",
      },
    ],
    parameterNotes: [
      {
        position: "front",
        product: "单层金属膜 T7",
        params: "可见光阻隔率 30%；紫外线阻隔率 99%；红外线阻隔率 92%；总太阳能阻隔率 53%；厚度 2mil",
        userMeaning:
          "前挡在保持清晰视野的基础上提供比入门更强的总太阳能阻隔，适合长时间通勤。",
      },
      {
        position: "rear",
        product: "陶瓷护肤膜 F20",
        params: "可见光阻隔率 80%；紫外线阻隔率 100%；红外线阻隔率 95%；总太阳能阻隔率 57%；厚度 2mil",
        userMeaning:
          "侧后挡紫外线阻隔达到 100%，对皮肤敏感的家庭用户更友好。",
      },
    ],
    imagePrompt:
      "通勤场景：新能源 SUV 停在露天停车场，前挡有金属膜的高级质感，侧后挡呈现均匀深色；阳光强烈但不刺眼；视觉重点：日常通勤加强隔热、紫外线防护；不要文字、不要价格、不要二维码、不要电话、不要品牌 Logo。",
  },

  xiaoman: {
    positioning:
      "全车隔热与安全防护进阶方案，适合更重视隔热和安全感的车主。",
    headline:
      "小满套餐使用 Z70 前挡搭配 K15 侧后挡，面向对全车隔热、安全防爆和隐私有更高要求的车主。它适合新能源车、家庭车和长时间用车的用户。",
    summary: "前挡 12 层金属膜搭配侧后挡，适合更重视隔热和安全的车主。",
    painPoints: [
      "新能源车玻璃面积大，热量更明显。",
      "夏季用车频率高，希望明显降低车内升温。",
      "对玻璃安全防爆更关注。",
      "家庭多人出行，后排舒适要求高。",
    ],
    benefits: [
      {
        title: "Z70 前挡 12 层金属膜",
        description:
          "提供红外线阻隔 96% 与总太阳能阻隔 56%，同时厚度 3.5mil 提升附着与防爆能力。",
      },
      {
        title: "侧后挡 K15 兼顾隐私",
        description:
          "可见光阻隔 85% 提供明显隐私感，TSER 58% 提供强隔热。",
      },
      {
        title: "新能源车友好",
        description:
          "面向玻璃面积大的新能源车型，系统化隔热方案应对天幕与大面积侧窗。",
      },
    ],
    scenarios: [
      {
        title: "高速长途",
        description:
          "长时间高速行驶，前挡减少正面热量，侧后挡保持后排舒适与隐私。",
      },
      {
        title: "家庭出游",
        description:
          "多人出行场景下，隔热与隐私同时满足。",
      },
      {
        title: "午后强光驾驶",
        description:
          "面对强烈日照，前挡清晰不刺眼，侧后挡提供整体隔热保护。",
      },
    ],
    parameterNotes: [
      {
        position: "front",
        product: "12 层金属膜 Z70",
        params: "可见光阻隔率 28%；紫外线阻隔率 99%；红外线阻隔率 96%；总太阳能阻隔率 56%；厚度 3.5mil",
        userMeaning:
          "前挡提供高红外线阻隔与较厚膜层，兼顾隔热和玻璃附着安全。",
      },
      {
        position: "rear",
        product: "单银金属膜 K15",
        params: "可见光阻隔率 85%；紫外线阻隔率 99%；红外线阻隔率 94%；总太阳能阻隔率 58%；厚度 2mil",
        userMeaning:
          "侧后挡提供明显隐私感，同时维持高水平隔热，适合家庭多人出行。",
      },
    ],
    imagePrompt:
      "新能源 SUV 高速行驶场景，前挡 12 层金属膜质感，侧后挡深色隐私；阳光强烈但车内光线柔和；视觉重点：全车隔热、安全防护、隐私感；不要文字、不要价格、不要二维码、不要电话、不要品牌 Logo。",
  },

  mangzhong: {
    positioning:
      "强综合隔热组合，适合想要前挡和侧后挡都更均衡的车主。",
    headline:
      "芒种套餐采用 Z70 + Z20 组合，更适合重视全车隔热、安全防爆和隐私的用户。侧后挡 Z20 的定位更高，适合后排使用频率高或玻璃面积较大的车型。",
    summary: "Z70 + Z20 组合，适合家庭车和新能源车。",
    painPoints: [
      "后排经常坐人，需要更强隔热。",
      "玻璃面积较大的新能源 SUV/MPV。",
      "想要更完整的全车隔热体验。",
      "对安全防爆与隐私都有较高要求。",
    ],
    benefits: [
      {
        title: "前后挡均为高规格金属膜",
        description:
          "Z70 + Z20 组合，前挡和侧后挡都采用金属膜路线，TSER 56% + 65%。",
      },
      {
        title: "侧后挡 Z20 定位更高",
        description:
          "双银金属膜提供 96% 红外阻隔与 65% TSER，适合后排使用频率高的场景。",
      },
      {
        title: "适合玻璃面积大的车型",
        description:
          "面向新能源 SUV/MPV 大面积玻璃，提供系统化全车隔热。",
      },
    ],
    scenarios: [
      {
        title: "家庭多人出行",
        description:
          "后排乘客需要舒适温度与隐私感，Z20 提供更高规格侧后挡。",
      },
      {
        title: "后排儿童座椅",
        description:
          "儿童座椅在后排时需要更柔和的光线和更强的防晒。",
      },
      {
        title: "夏天长时间露天停车",
        description:
          "回到车内时温度可控，空调负担明显降低。",
      },
    ],
    parameterNotes: [
      {
        position: "front",
        product: "12 层金属膜 Z70",
        params: "可见光阻隔率 28%；紫外线阻隔率 99%；红外线阻隔率 96%；总太阳能阻隔率 56%；厚度 3.5mil",
        userMeaning:
          "前挡提供顶级红外阻隔与较厚膜层，是高隔热组合的前挡核心。",
      },
      {
        position: "rear",
        product: "双银金属膜 Z20",
        params: "可见光阻隔率 75%；紫外线阻隔率 99%；红外线阻隔率 96%；总太阳能阻隔率 65%；厚度 3mil",
        userMeaning:
          "侧后挡定位最高，TSER 65% 是当前参数表中的最高水平，适合后排使用。",
      },
    ],
    imagePrompt:
      "新能源 SUV/MPV 侧后视角，侧后挡呈现明显但不过分的深色隐私效果；后排有儿童座椅痕迹；阳光强烈；视觉重点：全车高隔热、家庭场景；不要文字、不要价格、不要二维码、不要电话、不要品牌 Logo。",
  },

  bailu: {
    positioning:
      "兼顾隔热和视觉变化，适合喜欢科技感与高级感的车主。",
    headline:
      "白露套餐的重点是 Z80 变色陶瓷膜前挡，适合希望前挡有更明显视觉质感，同时仍然关注隔热、防晒和隐私的车主。它更适合追求外观细节和体验感的新能源用户。",
    summary: "前挡 Z80 变色陶瓷膜，适合追求科技感和高级感的车主。",
    painPoints: [
      "喜欢科技感，希望前挡效果更特别。",
      "新能源车主，关注外观细节。",
      "既希望隔热又希望视觉变化。",
      "希望车辆整体质感更高级。",
    ],
    benefits: [
      {
        title: "Z80 变色陶瓷膜前挡",
        description:
          "可见光阻隔率 28-55% 区间变化，提供明显视觉变化与隔热平衡。",
      },
      {
        title: "侧后挡 Z20 强隔热",
        description: "维持高规格侧后挡，确保后排舒适与隐私。",
      },
      {
        title: "新能源车高级感",
        description: "面向追求科技感与高级感的新能源车主，前挡是视觉焦点。",
      },
    ],
    scenarios: [
      {
        title: "城市新能源车",
        description:
          "日常城市使用，前挡视觉变化提升整车质感。",
      },
      {
        title: "商务/家用兼顾",
        description:
          "既满足商务接待的高级感，又兼顾家庭日常的隔热防晒。",
      },
      {
        title: "对车身整体质感有要求",
        description:
          "在意外观细节的车主，前挡效果与整车风格统一。",
      },
    ],
    parameterNotes: [
      {
        position: "front",
        product: "变色陶瓷膜 Z80",
        params: "可见光阻隔率 28-55%；紫外线阻隔率 99%；红外线阻隔率 90%；总太阳能阻隔率 53-62%；厚度 3mil",
        userMeaning:
          "前挡参数随光线变化，提供视觉变化的同时维持中高水平隔热。",
      },
      {
        position: "rear",
        product: "双银金属膜 Z20",
        params: "可见光阻隔率 75%；紫外线阻隔率 99%；红外线阻隔率 96%；总太阳能阻隔率 65%；厚度 3mil",
        userMeaning:
          "侧后挡维持高规格金属膜水平，与前挡搭配平衡整体视觉。",
      },
    ],
    imagePrompt:
      "新能源轿车侧前视角，前挡呈现变色陶瓷膜的高级质感（光线下略有变化）；车身干净现代；视觉重点：科技感、高级感、前挡视觉变化；不要文字、不要价格、不要二维码、不要电话、不要品牌 Logo。",
  },

  wanghong: {
    positioning:
      "高辨识度风格方案，适合喜欢个性化视觉表达的车主。",
    headline:
      "网红套餐主打帝王紫/凤凰红 G7 的颜色识别度，适合希望车辆更有个性、更容易被看见的年轻车主。它不是最低调的选择，而是为喜欢视觉表达的人准备的方案。",
    summary: "帝王紫/凤凰红风格明显，适合个性表达。",
    painPoints: [
      "年轻车主，希望车辆更有个性。",
      "喜欢改色膜/轻改风格的视觉表达。",
      "希望车窗也参与整车风格。",
      "不追求最低调，偏好高辨识度。",
    ],
    benefits: [
      {
        title: "G7 高辨识度颜色",
        description:
          "帝王紫/凤凰红在视觉上识别度高，让车辆更有风格。",
      },
      {
        title: "前后挡统一风格",
        description: "前挡与侧后挡同系列搭配，整车视觉一致。",
      },
      {
        title: "面向个性表达车主",
        description: "适合年轻、喜欢个性化、不追求低调的车主。",
      },
    ],
    scenarios: [
      {
        title: "城市潮流风格",
        description:
          "城市道路上具有辨识度，适合喜欢被看见的年轻车主。",
      },
      {
        title: "拍照展示",
        description: "在社交平台分享时视觉效果更突出。",
      },
      {
        title: "个性化新能源车",
        description:
          "新能源车主希望车辆在外观上更个性，G7 是风格选择。",
      },
    ],
    parameterNotes: [
      {
        position: "front",
        product: "帝王紫/凤凰红 G7",
        params: "可见光阻隔率 28%；紫外线阻隔率 99%；红外线阻隔率 90%；总太阳能阻隔率 56%；厚度 2mil",
        userMeaning:
          "前挡提供颜色识别度，同时维持标准水平的隔热参数。",
      },
      {
        position: "rear",
        product: "同系列搭配",
        params: "可见光阻隔率 28%；紫外线阻隔率 99%；红外线阻隔率 90%；总太阳能阻隔率 56%；厚度 2mil",
        userMeaning:
          "侧后挡与前挡同系列颜色搭配，整车视觉一致。",
      },
    ],
    imagePrompt:
      "新能源 SUV 侧后视角，前挡与侧后挡呈现帝王紫/凤凰红 G7 高辨识度色调；车身干净、风格鲜明；视觉重点：个性表达、颜色识别度；不要文字、不要价格、不要二维码、不要电话、不要品牌 Logo。",
  },

  yangsheng: {
    positioning:
      "健康舒适取向，适合重视车内体验和家庭使用的车主。",
    headline:
      "养生套餐使用 M7 + N20 负离子膜组合，适合关注健康、环保、防晒和隐私的车主。它的表达重点不是夸张性能，而是日常使用中的安心、舒适和家庭友好。",
    summary: "负离子膜组合，适合家庭用户和重视车内体验的车主。",
    painPoints: [
      "家庭用户，对车内环境敏感。",
      "长时间通勤，希望车内体验更舒适。",
      "重视健康环保概念。",
      "接送老人小孩，需要更安心的乘车环境。",
    ],
    benefits: [
      {
        title: "M7 + N20 负离子膜组合",
        description:
          "前挡与侧后挡均为负离子膜路线，关注健康与车内体验。",
      },
      {
        title: "家庭友好定位",
        description:
          "适合接送老人小孩、对车内环境敏感的家庭用户。",
      },
      {
        title: "日常使用安心舒适",
        description:
          "不追求极端参数，强调日常使用中的安心与舒适。",
      },
    ],
    scenarios: [
      {
        title: "接送老人小孩",
        description:
          "家庭接送场景下，更柔和的光线与更舒适的车内温度。",
      },
      {
        title: "长时间城市通勤",
        description: "每天通勤较久的车主，车内体验影响全天舒适度。",
      },
      {
        title: "家庭新能源车",
        description:
          "面向新能源家庭用户，负离子膜与日常使用场景契合。",
      },
    ],
    parameterNotes: [
      {
        position: "front",
        product: "负离子膜 M7",
        params: "可见光阻隔率 28%；紫外线阻隔率 99%；红外线阻隔率 80%；总太阳能阻隔率 49%；厚度 2mil",
        userMeaning:
          "前挡提供标准水平的隔热，定位以健康环保概念为主。",
      },
      {
        position: "rear",
        product: "负离子膜 N20",
        params: "可见光阻隔率 72%；紫外线阻隔率 99%；红外线阻隔率 90%；总太阳能阻隔率 59%；厚度 2mil",
        userMeaning:
          "侧后挡提供较高水平的总太阳能阻隔，同时维持后排舒适。",
      },
    ],
    imagePrompt:
      "新能源家庭 SUV 后排视角，车内光线柔和温暖，后排有家庭用品（不出现人物正脸）；视觉重点：健康舒适、家庭场景、温和车内光线；不要文字、不要价格、不要二维码、不要电话、不要品牌 Logo。",
  },
};

/** PRD §6.3 选择导购 */
export const windowFilmGuideItems: {
  need: string;
  packageSlug: string;
  packageName: string;
  recommendation: string;
}[] = [
  {
    need: "健康环保、防紫外线、隐私入门",
    packageSlug: "chunfen",
    packageName: "春分套餐",
    recommendation: "入门友好，前挡清晰，侧后挡兼顾隐私。",
  },
  {
    need: "想要比入门更强的综合隔热",
    packageSlug: "guyu",
    packageName: "谷雨套餐",
    recommendation: "兼顾紫外线、普通隔热和隐私，适合日常通勤。",
  },
  {
    need: "想要全车隔热和安全防护",
    packageSlug: "xiaoman",
    packageName: "小满套餐",
    recommendation:
      "前挡 12 层金属膜搭配侧后挡，适合对隔热和安全更重视的车主。",
  },
  {
    need: "更强调侧后挡隔热和隐私",
    packageSlug: "mangzhong",
    packageName: "芒种套餐",
    recommendation: "Z70 + Z20 组合，适合家庭车和新能源车。",
  },
  {
    need: "想要前挡变色效果",
    packageSlug: "bailu",
    packageName: "白露套餐",
    recommendation: "前挡 Z80 有视觉变化，适合追求科技感和高级感的车主。",
  },
  {
    need: "喜欢高辨识度颜色",
    packageSlug: "wanghong",
    packageName: "网红套餐",
    recommendation: "帝王紫/凤凰红风格明显，适合个性表达。",
  },
  {
    need: "强调健康、环保、舒适",
    packageSlug: "yangsheng",
    packageName: "养生套餐",
    recommendation:
      "负离子膜组合，适合家庭用户和重视车内体验的车主。",
  },
];

/** PRD §6.2 参数解释
 * 注意：当前数据字段名为"可见光阻隔率"，与行业通用 VLT 透过率含义不同，
 * 解释文案按 PRD §6.2 要求避免扩写为"透过率"，统一为"当前资料口径下的可见光指标"。
 */
export const windowFilmParameterExplanations: {
  code: string;
  fullName: string;
  userMeaning: string;
}[] = [
  {
    code: "可见光阻隔率",
    fullName: "当前资料口径下的可见光指标",
    userMeaning:
      "影响视觉明暗和隐私感，前挡应优先保证清晰视线。行业常见的可见光透过率 VLT 含义与此不同，以品牌资料口径为准。",
  },
  {
    code: "UVR",
    fullName: "紫外线阻隔率",
    userMeaning: "关系到防晒、内饰老化、皮肤舒适度。",
  },
  {
    code: "IRR",
    fullName: "红外线阻隔率",
    userMeaning: "关系到体感热量，红外线越高通常越抗晒热。",
  },
  {
    code: "TSER",
    fullName: "总太阳能阻隔率",
    userMeaning: "综合隔热指标，更接近整体隔热表现。",
  },
  {
    code: "厚度",
    fullName: "膜层厚度",
    userMeaning:
      "影响施工手感、安全附着和产品定位，不应单独作为唯一判断标准。",
  },
];

/** 合并套餐基础数据与详情文案。
 * 找不到基础数据或详情数据时返回 undefined。
 */
export type WindowFilmPackageFull = ProductPackage & WindowFilmPackageDetails;

export function getWindowFilmPackageWithDetails(
  slug: string,
): WindowFilmPackageFull | undefined {
  const base = getWindowFilmPackage(slug);
  const details = windowFilmDetails[slug];
  if (!base || !details) return undefined;
  return { ...base, ...details };
}

/** 返回所有同时拥有基础数据与详情文案的 slug。
 * 用于 generateStaticParams 与导购模块。
 */
export function getAllWindowFilmPackageSlugsWithDetails(): string[] {
  const baseSlugs = getAllWindowFilmPackageSlugs();
  return baseSlugs.filter((slug) => slug in windowFilmDetails);
}
