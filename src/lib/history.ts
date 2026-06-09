/**
 * 蓝辉轻改 品牌历程
 *
 * Phase 1：2026 起点的时间线。
 * 不要捏造具体日期、签约方、媒体等未经证实的细节。
 */

export type Milestone = {
  year: string;
  month?: string;
  title: string;
  description: string;
  highlight?: boolean; // 标记关键里程碑
};

export const milestones: Milestone[] = [
  {
    year: "2026",
    month: "Q1",
    title: "品牌成立",
    description:
      "蓝辉轻改（LANHUI）品牌于 2026 年第一季度成立，定位汽车轻改装与汽车膜系服务。",
    highlight: true,
  },
  {
    year: "2026",
    month: "Q1",
    title: "顺德大良店筹建",
    description:
      "选址顺德大良，启动线下服务中心筹建，明确以「到店沟通 → 车型确认 → 方案推荐 → 施工交付」为主线。",
  },
  {
    year: "2026",
    month: "Q2",
    title: "官网与产品矩阵发布",
    description:
      "品牌官网筹备上线，发布 6 个产品方向：电动踏板、轮毂升级、底盘升级、汽车窗膜、改色膜、隐形车衣。",
    highlight: true,
  },
  {
    year: "2026",
    month: "Q2",
    title: "顺德大良店正式开放",
    description:
      "顺德大良店正式对外开放，承接轻改装备到店沟通与汽车膜系施工交付。",
  },
  {
    year: "未来",
    title: "更多门店 · 持续建设中",
    description:
      "门店网络持续完善中，更多城市的线下服务中心将分阶段开放，敬请关注品牌资讯。",
  },
];
