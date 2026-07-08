/**
 * 蓝辉轻改品牌资讯
 *
 * Phase 1：只做静态列表占位，日期使用 2026 或"待发布"，
 * 不编造具体发布日期。
 */

export type NewsItem = {
  slug: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  content: string;
};

export const newsItems: NewsItem[] = [
  {
    slug: "brand-website-prep",
    title: "蓝辉轻改品牌官网筹备中",
    date: "2026",
    category: "品牌动态",
    summary:
      "蓝辉轻改官方网站正在搭建中，将系统展示轻改装备与汽车膜系服务，以及顺德大良店的服务入口。",
    content:
      "蓝辉轻改官方网站正在搭建中。新官网将围绕汽车轻改装、汽车膜系服务和顺德大良门店服务能力展开，帮助车主更清晰地了解可选项目、适配车型、服务流程与到店咨询入口。\n\n后续内容将持续补充车型专题、产品方案、施工交付说明和门店动态。",
  },
  {
    slug: "shunde-store-upgrade",
    title: "蓝辉轻改顺德大良店服务升级",
    date: "2026",
    category: "门店动态",
    summary:
      "顺德大良店持续完善到店咨询、车型确认与施工交付流程，为车主提供更清晰的升级路径。",
    content:
      "蓝辉轻改顺德大良店正在持续优化到店服务流程。围绕车主最关心的车型适配、项目确认、施工周期和交付检查，门店将进一步明确沟通节点和服务标准。\n\n车主可在到店前先确认车型和升级方向，到店后由门店结合实车状态给出更具体的方案建议。",
  },
  {
    slug: "service-matrix",
    title: "轻改装备与汽车膜系服务矩阵发布",
    date: "2026",
    category: "产品动态",
    summary:
      "电动踏板、轮毂升级、底盘升级、汽车窗膜、改色膜与隐形车衣六类产品方向正式发布。",
    content:
      "蓝辉轻改已形成覆盖轻改装备与汽车膜系的服务矩阵。当前重点方向包括电动踏板、轮毂升级、底盘升级、汽车窗膜、改色膜与隐形车衣。\n\n不同项目会根据车型结构、使用场景和车主偏好进行适配，具体施工方案以到店沟通和实车确认结果为准。",
  },
];

export function getAllNewsSlugs(): string[] {
  return newsItems.map((n) => n.slug);
}
