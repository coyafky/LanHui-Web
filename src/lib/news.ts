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
};

export const newsItems: NewsItem[] = [
  {
    slug: "brand-website-prep",
    title: "蓝辉轻改品牌官网筹备中",
    date: "2026",
    category: "品牌动态",
    summary:
      "蓝辉轻改官方网站正在搭建中，将系统展示轻改装备与汽车膜系服务，以及顺德大良店的服务入口。",
  },
  {
    slug: "shunde-store-upgrade",
    title: "蓝辉轻改顺德大良店服务升级",
    date: "2026",
    category: "门店动态",
    summary:
      "顺德大良店持续完善到店咨询、车型确认与施工交付流程，为车主提供更清晰的升级路径。",
  },
  {
    slug: "service-matrix",
    title: "轻改装备与汽车膜系服务矩阵发布",
    date: "2026",
    category: "产品动态",
    summary:
      "电动踏板、轮毂升级、底盘升级、汽车窗膜、改色膜与隐形车衣六类产品方向正式发布。",
  },
];

export function getAllNewsSlugs(): string[] {
  return newsItems.map((n) => n.slug);
}
