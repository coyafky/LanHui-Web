/**
 * 后台门店管理的可选省/市数据
 *
 * 来源：业务侧维护的"全国主要省市 + 热门城市"列表。
 * 注意：与数据库 Province/City 表独立。后台 RegionSelector 用本文件作为选项，
 * 创建门店时 API 会用本文件预校验（确保用户只能选这里列出的省/市）。
 *
 * 范围（2026-06-14 v1）：
 * - 23 个传统省份（含台湾）
 * - 3 个自治区（内蒙古、广西、宁夏）
 * - 共 26 个省级单位
 * - 每省 1-3 个热门城市（省会为主 + 1-2 经济强市）
 * - 共约 30 个城市
 */

export interface CityItem {
  slug: string;
  label: string;
  /** 是否为省会 */
  isCapital?: boolean;
}

export interface RegionItem {
  slug: string;
  label: string;
  cities: CityItem[];
}

export const STORE_REGIONS: RegionItem[] = [
  {
    slug: "hebei",
    label: "河北省",
    cities: [
      { slug: "shijiazhuang", label: "石家庄市", isCapital: true },
      { slug: "tangshan", label: "唐山市" },
    ],
  },
  {
    slug: "shanxi",
    label: "山西省",
    cities: [
      { slug: "taiyuan", label: "太原市", isCapital: true },
      { slug: "datong", label: "大同市" },
    ],
  },
  {
    slug: "liaoning",
    label: "辽宁省",
    cities: [
      { slug: "shenyang", label: "沈阳市", isCapital: true },
      { slug: "dalian", label: "大连市" },
    ],
  },
  {
    slug: "jilin",
    label: "吉林省",
    cities: [{ slug: "changchun", label: "长春市", isCapital: true }],
  },
  {
    slug: "heilongjiang",
    label: "黑龙江省",
    cities: [
      { slug: "haerbin", label: "哈尔滨市", isCapital: true },
      { slug: "daqing", label: "大庆市" },
    ],
  },
  {
    slug: "jiangsu",
    label: "江苏省",
    cities: [
      { slug: "nanjing", label: "南京市", isCapital: true },
      { slug: "suzhou", label: "苏州市" },
      { slug: "wuxi", label: "无锡市" },
    ],
  },
  {
    slug: "zhejiang",
    label: "浙江省",
    cities: [
      { slug: "hangzhou", label: "杭州市", isCapital: true },
      { slug: "ningbo", label: "宁波市" },
    ],
  },
  {
    slug: "anhui",
    label: "安徽省",
    cities: [
      { slug: "hefei", label: "合肥市", isCapital: true },
      { slug: "wuhu", label: "芜湖市" },
    ],
  },
  {
    slug: "fujian",
    label: "福建省",
    cities: [
      { slug: "fuzhou", label: "福州市", isCapital: true },
      { slug: "xiamen", label: "厦门市" },
    ],
  },
  {
    slug: "jiangxi",
    label: "江西省",
    cities: [{ slug: "nanchang", label: "南昌市", isCapital: true }],
  },
  {
    slug: "shandong",
    label: "山东省",
    cities: [
      { slug: "jinan", label: "济南市", isCapital: true },
      { slug: "qingdao", label: "青岛市" },
    ],
  },
  {
    slug: "henan",
    label: "河南省",
    cities: [
      { slug: "zhengzhou", label: "郑州市", isCapital: true },
      { slug: "luoyang", label: "洛阳市" },
    ],
  },
  {
    slug: "hubei",
    label: "湖北省",
    cities: [{ slug: "wuhan", label: "武汉市", isCapital: true }],
  },
  {
    slug: "hunan",
    label: "湖南省",
    cities: [{ slug: "changsha", label: "长沙市", isCapital: true }],
  },
  {
    slug: "guangdong",
    label: "广东省",
    cities: [
      { slug: "guangzhou", label: "广州市", isCapital: true },
      { slug: "shenzhen", label: "深圳市" },
      { slug: "foshan", label: "佛山市" },
      { slug: "dongguan", label: "东莞市" },
    ],
  },
  {
    slug: "hainan",
    label: "海南省",
    cities: [{ slug: "haikou", label: "海口市", isCapital: true }],
  },
  {
    slug: "sichuan",
    label: "四川省",
    cities: [{ slug: "chengdu", label: "成都市", isCapital: true }],
  },
  {
    slug: "guizhou",
    label: "贵州省",
    cities: [{ slug: "guiyang", label: "贵阳市", isCapital: true }],
  },
  {
    slug: "yunnan",
    label: "云南省",
    cities: [{ slug: "kunming", label: "昆明市", isCapital: true }],
  },
  {
    slug: "shaanxi",
    label: "陕西省",
    cities: [{ slug: "xian", label: "西安市", isCapital: true }],
  },
  {
    slug: "gansu",
    label: "甘肃省",
    cities: [{ slug: "lanzhou", label: "兰州市", isCapital: true }],
  },
  {
    slug: "qinghai",
    label: "青海省",
    cities: [{ slug: "xining", label: "西宁市", isCapital: true }],
  },
  {
    slug: "taiwan",
    label: "台湾省",
    cities: [{ slug: "taibei", label: "台北市", isCapital: true }],
  },
  // 3 自治区
  {
    slug: "neimenggu",
    label: "内蒙古自治区",
    cities: [{ slug: "huhehaote", label: "呼和浩特市", isCapital: true }],
  },
  {
    slug: "guangxi",
    label: "广西壮族自治区",
    cities: [
      { slug: "nanning", label: "南宁市", isCapital: true },
      { slug: "guilin", label: "桂林市" },
    ],
  },
  {
    slug: "ningxia",
    label: "宁夏回族自治区",
    cities: [{ slug: "yinchuan", label: "银川市", isCapital: true }],
  },
];

/** 工具函数：根据 provinceSlug 找该省 */
export function findRegion(provinceSlug: string): RegionItem | undefined {
  return STORE_REGIONS.find((r) => r.slug === provinceSlug);
}

/** 工具函数：根据 (provinceSlug, citySlug) 找城市，并校验是否属于该省 */
export function findCity(
  provinceSlug: string,
  citySlug: string,
): { city: CityItem; region: RegionItem } | null {
  const region = findRegion(provinceSlug);
  if (!region) return null;
  const city = region.cities.find((c) => c.slug === citySlug);
  if (!city) return null;
  return { city, region };
}