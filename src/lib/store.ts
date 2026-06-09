/**
 * 蓝辉轻改门店数据
 *
 * Phase 1：只放真实门店数据。
 * 不要编造其他省份、城市或门店，避免“全国 500+ 门店”等虚假信息。
 */

export type Store = {
  id: string;
  name: string;
  province: string; // 拼音 slug，如 guangdong
  provinceLabel: string; // 中文，如 广东省
  city: string; // 拼音 slug，如 foshan-shunde
  cityLabel: string; // 中文，如 佛山/顺德
  district: string; // 区域描述
  address: string;
  phone: string;
  phoneTel: string; // tel: 链接，未确认时使用 #contact
  businessHours: string;
  services: string[];
  description: string;
  highlights: string[];
  lat?: number; // 纬度（地图预留）
  lng?: number; // 经度（地图预留）
  category?: "flagship" | "standard" | "authorized"; // 门店类型
};

export const stores: Store[] = [
  {
    id: "shunde-daliang",
    name: "蓝辉轻改顺德大良店",
    province: "guangdong",
    provinceLabel: "广东省",
    city: "foshan-shunde",
    cityLabel: "佛山 · 顺德",
    district: "顺德大良",
    address: "广东省佛山市顺德区大良（详细地址待补充）",
    phone: "联系方式待补充",
    phoneTel: "#contact",
    businessHours: "营业时间待确认",
    services: [
      "电动踏板升级",
      "轮毂升级咨询",
      "底盘升级咨询",
      "汽车窗膜",
      "改色膜",
      "隐形车衣",
    ],
    description:
      "蓝辉轻改当前唯一的线下服务中心，提供到店沟通、车型确认、方案推荐与施工交付。",
    highlights: [
      "轻改装备到店沟通",
      "汽车膜系施工交付",
      "原厂风格升级建议",
    ],
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
    slug: "foshan-shunde",
    province: "guangdong",
    label: "佛山 · 顺德",
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
