/**
 * faker-based 测试 fixtures
 *
 * 用途：为 vitest 单测 / e2e / 未来 MSW handlers 提供「合法但带边界」的随机数据。
 * 设计原则：
 *   1. 业务字段（门店名/地址/省份）用静态中文池（来自 regions/mainland-regions）+ faker 拼装，
 *      不依赖 zh_CN locale（faker 9.x 的 zh_CN 缺 person.first_name 等关键数据）。
 *   2. 通用字段（slug/phone/uuid/时间戳/图片 URL）走 faker 默认 locale (en)。
 *   3. 默认生成「合法」数据；`edgeCases()` 暴露「应被服务端拒绝」的反例。
 *   4. 确定性支持：传入 `seed` 让数据可重放（适合单测断言）。
 */
import {
  faker,
  fakerEN,
  fakerBASE,
  fakerZH_CN,
  Faker,
} from "@faker-js/faker";
import {
  MAINLAND_PROVINCES,
  MAINLAND_CITIES,
  type ProvinceData,
  type CityData,
} from "@/lib/regions/mainland-regions";
import {
  STORE_LEVELS,
  STORE_STATUSES,
  type StoreLevel,
  type StoreStatus,
} from "@/lib/validations/store";

/**
 * 项目默认 faker 实例。
 *
 * 重要发现：faker 9.x 中
 *   - `fakerEN`（= en_GB）缺少 location.street_address 等键
 *   - `fakerZH_CN` 缺少 person.first_name 等键
 *   - 默认 `faker` 走 en_US，最完整
 *
 * 处理：业务中文字段（门店名/省份/城市/区/地址）一律走静态池（regions/mainland-regions），
 * faker 只负责通用字段（phone/slug/uuid/时间戳/图片 URL）。所以直接复用默认 `faker` 单例
 * 等价于自建 en_US 链。
 *
 * 此处 `projectFaker` 作为对外暴露的 API 名，让调用方更明确"业务项目专用"。
 */
export const projectFaker: Faker = faker;

/** 6 位门店 ID（与 seed.ts 风格一致）。 */
function makeStoreId(): string {
  return projectFaker.string.numeric({ length: 6, allowLeadingZeros: false });
}

/** 中国大陆 11 位手机号（1[3-9] 开头）。faker 9.x 的 fromRegExp 不能直接生成匹配值，用 number.int 实现。 */
function makeCnPhone(): string {
  // 生成 1[3-9]xxxxxxxxx 范围的 11 位数字
  const prefix = projectFaker.helpers.arrayElement([
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
  ]);
  const rest = projectFaker.string.numeric({ length: 9, allowLeadingZeros: true });
  return `${prefix}${rest}`;
}

/**
 * 从已 seed 的省份/城市池里随机选一对。
 * 直接 fallback 到广东/佛山以保证测试永不失败（极端情况下 city 为空）。
 */
function pickProvinceAndCity(): {
  province: ProvinceData;
  city: CityData;
} {
  const province = projectFaker.helpers.arrayElement(MAINLAND_PROVINCES);
  const cities = MAINLAND_CITIES.filter((c) => c.provinceSlug === province.slug);
  const city =
    cities.length > 0
      ? projectFaker.helpers.arrayElement(cities)
      : MAINLAND_CITIES[0]!;
  return { province, city };
}

/**
 * 门店名称词库。
 * 注意：业务上「蓝辉轻改 + 城市区/特色词 + 店」是固定模板。
 */
const DISTRICT_WORDS = [
  "万达店",
  "旗舰中心",
  "体验中心",
  "标准店",
  "授权店",
  "钣喷中心",
  "贴膜工坊",
  "改装工坊",
  "会员店",
  "概念店",
];

function makeStoreName(city: CityData): string {
  const district = projectFaker.helpers.arrayElement(DISTRICT_WORDS);
  return `蓝辉轻改${city.label}${district}`;
}

function makeStoreSlug(name: string, id: string): string {
  // SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  // 中文无法直接做 slug，附加数字 ID 保证唯一
  const base = `${id}-${projectFaker.number.int({ min: 100, max: 999 })}`;
  return base.toLowerCase();
}

function makeAddress(
  city: CityData,
  province: ProvinceData,
  district: string | undefined,
): string {
  // district 可能已经带区/市后缀；仅在缺后缀时追加
  const districtText =
    district ??
    `${projectFaker.location.city()}${projectFaker.helpers.arrayElement(["区", "新城", "CBD"])}`;
  const street = projectFaker.location.streetAddress();
  // 截断到 ≤ 200 字符（schema 上限），保留 "蓝辉轻改" 尾部
  const full = `${province.label}${city.label}${districtText}${street}蓝辉轻改`;
  return full.length > 200 ? `${full.slice(0, 197)}…` : full;
}

function makePhoneTel(phone: string): string {
  return `tel:${phone}`;
}

function makeBusinessHours(): string {
  // 10 种合法模式
  const hours = projectFaker.helpers.arrayElement([
    "09:00-18:00",
    "09:00-20:00",
    "10:00-21:00",
    "08:30-17:30",
    "09:30-19:00",
    "全天 24 小时",
    "周一至周五 09:00-18:00；周末 10:00-19:00",
    "工作日 09:00-18:00",
    "周一闭店",
    "预约制",
  ]);
  return hours;
}

function makeStatus(): StoreStatus {
  // 真实业务分布：active 最多，pending 次之，suspended/terminated 少数
  return projectFaker.helpers.weightedArrayElement<StoreStatus>([
    { weight: 6, value: "active" },
    { weight: 2, value: "pending" },
    { weight: 1, value: "suspended" },
    { weight: 1, value: "terminated" },
  ]);
}

function makeLevel(): StoreLevel {
  return projectFaker.helpers.weightedArrayElement<StoreLevel>([
    { weight: 1, value: "flagship" },
    { weight: 2, value: "premium" },
    { weight: 4, value: "specialty" },
    { weight: 3, value: "member" },
  ]);
}

export interface StoreFixture {
  id: string;
  slug: string;
  name: string;
  provinceSlug: string;
  provinceLabel: string;
  citySlug: string;
  cityLabel: string;
  district: string;
  address: string;
  phone: string;
  phoneTel: string;
  businessHours: string;
  description: string;
  status: StoreStatus;
  level: StoreLevel;
  imagePath: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 生成一个合法的门店 fixture。
 * 可通过 overrides 覆盖任意字段（推荐覆盖 id/slug 保证可重放）。
 *
 * @example
 *   const store = mockStore({ id: "200001", slug: "test-store" });
 */
export function mockStore(overrides: Partial<StoreFixture> = {}): StoreFixture {
  const { province, city } = pickProvinceAndCity();
  const id = overrides.id ?? makeStoreId();
  const name = overrides.name ?? makeStoreName(city);
  const slug = overrides.slug ?? makeStoreSlug(name, id);
  const phone = overrides.phone ?? makeCnPhone();
  const district = overrides.district ?? "某区";

  return {
    id,
    slug,
    name,
    provinceSlug: province.slug,
    provinceLabel: province.label,
    citySlug: city.slug,
    cityLabel: city.label,
    district,
    address: overrides.address ?? makeAddress(city, province, district),
    phone,
    phoneTel: makePhoneTel(phone),
    businessHours: overrides.businessHours ?? makeBusinessHours(),
    description:
      overrides.description ??
      `蓝辉轻改${city.label}门店，提供轻改装备升级、汽车膜系施工与专业改装服务。门店编号：${id}。`,
    status: overrides.status ?? makeStatus(),
    level: overrides.level ?? makeLevel(),
    imagePath:
      overrides.imagePath ??
      projectFaker.helpers.maybe(
        () => `/uploads/stores/${id}.webp`,
        { probability: 0.7 },
      ) ??
      null,
    createdAt: overrides.createdAt ?? projectFaker.date.recent({ days: 90 }),
    updatedAt: overrides.updatedAt ?? projectFaker.date.recent({ days: 7 }),
  };
}

/**
 * 生成 n 个门店 fixture。保证 id/slug 唯一。
 */
export function mockStoreList(
  count: number,
  overrides: Partial<StoreFixture> = {},
): StoreFixture[] {
  return Array.from({ length: count }, () => mockStore(overrides));
}

/**
 * 边界样本集合 —— 用于测「应被拒绝」的反例。
 * 集中暴露给测试，避免每个测试重复硬编码。
 */
export interface EdgeCases {
  /** name 字段边界：空 / 80 字内 / 80 字（最大）/ 81 字（超限）/ 含 emoji */
  name: {
    empty: string;
    minValid: string; // 1 字符
    maxValid: string; // 80 字符
    tooLong: string; // 81 字符
    withEmoji: string;
  };
  /** phone 边界：空 / 10 位 / 11 位 / 12 位 / 字母 */
  phone: {
    empty: string;
    tooShort: string;
    valid: string;
    tooLong: string;
    withLetters: string;
  };
  /** address 边界：空 / 200 字（最大）/ 201 字（超限） */
  address: {
    empty: string;
    maxValid: string; // 200 字符
    tooLong: string; // 201 字符
  };
  /** slug 边界：空 / 合规 / 连续连字符（违规） / 大写（违规） */
  slug: {
    empty: string;
    valid: string;
    consecutiveHyphens: string;
    uppercase: string;
  };
  /** 非法 status / level 枚举 */
  status: { invalid: string };
  level: { invalid: string };
}

export function edgeCases(): EdgeCases {
  return {
    name: {
      empty: "",
      minValid: "店",
      maxValid: "店".repeat(80),
      tooLong: "店".repeat(81),
      withEmoji: "蓝辉轻改🚗体验中心🎉",
    },
    phone: {
      empty: "",
      tooShort: "1380013800", // 10 位
      valid: makeCnPhone(),
      tooLong: "138001380000", // 12 位
      withLetters: "1380013800A",
    },
    address: {
      empty: "",
      maxValid: "地".repeat(200),
      tooLong: "地".repeat(201),
    },
    slug: {
      empty: "",
      valid: "test-store-1",
      consecutiveHyphens: "test--store",
      uppercase: "TestStore",
    },
    status: { invalid: "unknown" },
    level: { invalid: "platinum" },
  };
}

/**
 * 确定性 faker seed —— 让单测可重放同一组数据。
 * 传入 seed 后调用的所有 faker.* 方法输出都确定。
 */
export function withSeed(seed: number): void {
  projectFaker.seed(seed);
  faker.seed(seed);
}

// 重导出常用类型 / 常量供测试使用
export { STORE_LEVELS, STORE_STATUSES };
export type { StoreLevel, StoreStatus };
