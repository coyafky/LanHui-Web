/**
 * 蓝辉轻改门店数据
 *
 * Mock 数据：用于门店模块重构的视觉展示，后续替换为真实数据。
 * id 字段与数据库 prisma/seed.ts 中的自定义6位数字 ID 保持一致。
 */

export type Store = {
  id: string;
  name: string;
  province: string; // 拼音 slug，如 guangdong
  provinceLabel: string; // 中文，如 广东省
  city: string; // 拼音 slug，如 foshan
  cityLabel: string; // 中文，如 佛山/顺德
  district: string; // 区域描述
  address: string;
  phone: string;
  phoneTel: string; // tel: 链接
  businessHours: string;
  description: string;
  image?: string; // 图片路径预留
};

export const stores: Store[] = [
  // ── 广东省 ──
  {
    id: "100001",
    name: "蓝辉轻改顺德大良店",
    province: "guangdong",
    provinceLabel: "广东省",
    city: "foshan",
    cityLabel: "佛山市",
    district: "顺德区大良",
    address: "广东省佛山市顺德区大良街道南国中路88号蓝辉轻改体验中心",
    phone: "0757-2288 1001",
    phoneTel: "tel:075722881001",
    businessHours: "09:00-18:00",
    description:
      "蓝辉轻改旗舰服务中心，位于顺德大良核心商圈，提供全品类轻改装备与汽车膜系施工服务，配备独立施工工位与客户休息区。",
  },
  {
    id: "100002",
    name: "蓝辉轻改顺德容桂店",
    province: "guangdong",
    provinceLabel: "广东省",
    city: "foshan",
    cityLabel: "佛山市",
    district: "顺德区容桂",
    address: "广东省佛山市顺德区容桂街道容奇大道中66号",
    phone: "0757-2288 1002",
    phoneTel: "tel:075722881002",
    businessHours: "09:00-18:00",
    description:
      "蓝辉轻改顺德容桂标准店，服务容桂及周边区域车主，提供轻改装备升级与膜系施工。",
  },
  {
    id: "100003",
    name: "蓝辉轻改佛山南海店",
    province: "guangdong",
    provinceLabel: "广东省",
    city: "foshan",
    cityLabel: "佛山市",
    district: "南海区",
    address: "广东省佛山市南海区桂城街道灯湖东路6号万达广场1楼",
    phone: "0757-8628 6601",
    phoneTel: "tel:075786286601",
    businessHours: "09:00-18:00",
    description:
      "蓝辉轻改佛山南海标准店，位于南海桂城核心商圈，服务南海及周边区域车主，提供轻改装备升级与膜系施工。",
  },
  {
    id: "100007",
    name: "蓝辉轻改佛山禅城店",
    province: "guangdong",
    provinceLabel: "广东省",
    city: "foshan",
    cityLabel: "佛山市",
    district: "禅城区",
    address: "广东省佛山市禅城区祖庙路33号百花广场1楼",
    phone: "0757-8328 3301",
    phoneTel: "tel:075783283301",
    businessHours: "09:00-18:00",
    description:
      "蓝辉轻改佛山禅城标准店，位于禅城核心商圈，服务佛山主城区车主，提供轻改升级与膜系施工服务。",
  },
  // ── 江苏省 ──
  {
    id: "100004",
    name: "蓝辉轻改南京江宁店",
    province: "jiangsu",
    provinceLabel: "江苏省",
    city: "nanjing",
    cityLabel: "南京市",
    district: "江宁区",
    address: "江苏省南京市江宁区东山街道双龙大道1568号金轮新都汇1楼",
    phone: "025-5818 8801",
    phoneTel: "tel:02558188801",
    businessHours: "09:00-18:00",
    description:
      "蓝辉轻改南京江宁标准店，覆盖江宁及南京南部区域，提供轻改升级与膜系施工服务。",
  },
  {
    id: "100005",
    name: "蓝辉轻改苏州园区店",
    province: "jiangsu",
    provinceLabel: "江苏省",
    city: "suzhou",
    cityLabel: "苏州市",
    district: "工业园区",
    address: "江苏省苏州市工业园区星湖街218号苏州中心商场B1层",
    phone: "0512-6288 5501",
    phoneTel: "tel:051262885501",
    businessHours: "09:00-18:00",
    description:
      "蓝辉轻改苏州园区授权店，服务园区及周边高端社区车主，提供轻改升级方案。",
  },
  // ── 浙江省 ──
  {
    id: "100006",
    name: "蓝辉轻改杭州萧山店",
    province: "zhejiang",
    provinceLabel: "浙江省",
    city: "hangzhou",
    cityLabel: "杭州市",
    district: "萧山区",
    address: "浙江省杭州市萧山区市心北路168号旺角城新天地1楼",
    phone: "0571-8833 7701",
    phoneTel: "tel:057188337701",
    businessHours: "09:00-18:00",
    description:
      "蓝辉轻改杭州萧山标准店，覆盖萧山区及杭州南部新城车主，提供全品类轻改装备与膜系施工。",
  },
];

export type Province = {
  slug: string;
  label: string;
  cityCount: number;
  storeCount: number;
};

export const provinces: Province[] = [
  {
    slug: "guangdong",
    label: "广东省",
    cityCount: 1,
    storeCount: 4,
  },
  {
    slug: "jiangsu",
    label: "江苏省",
    cityCount: 2,
    storeCount: 2,
  },
  {
    slug: "zhejiang",
    label: "浙江省",
    cityCount: 1,
    storeCount: 1,
  },
];

export type City = {
  slug: string;
  province: string;
  label: string;
  storeCount: number;
};

export const cities: City[] = [
  {
    slug: "foshan",
    province: "guangdong",
    label: "佛山市",
    storeCount: 4,
  },
  {
    slug: "nanjing",
    province: "jiangsu",
    label: "南京市",
    storeCount: 1,
  },
  {
    slug: "suzhou",
    province: "jiangsu",
    label: "苏州市",
    storeCount: 1,
  },
  {
    slug: "hangzhou",
    province: "zhejiang",
    label: "杭州市",
    storeCount: 1,
  },
];

export function getStore(id: string): Store | undefined {
  return stores.find((s) => s.id === id);
}

export function getProvince(slug: string): Province | undefined {
  return provinces.find((p) => p.slug === slug);
}

export function getCity(province: string, city: string): City | undefined {
  return cities.find((c) => c.province === province && c.slug === city);
}

export function getStoresByCity(province: string, city: string): Store[] {
  return stores.filter((s) => s.province === province && s.city === city);
}

export function getStoresByProvince(province: string): Store[] {
  return stores.filter((s) => s.province === province);
}

export function getAllStoreIds(): string[] {
  return stores.map((s) => s.id);
}

export function getAllProvinceSlugs(): string[] {
  return provinces.map((p) => p.slug);
}

export function getAllCitySlugs(province: string): string[] {
  return cities.filter((c) => c.province === province).map((c) => c.slug);
}
