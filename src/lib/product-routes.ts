/**
 * 产品中心路由注册表 — PRD §12 数据结构。
 * 所有 /product 下路由的 source of truth：导航、SEO、sitemap、埋点、redirect 都从这里驱动。
 */

export type ProductRouteType = "service_category" | "vehicle_brand" | "vehicle_model";
export type ProductRouteStatus = "live" | "planned";
export type ProductRoutePriority = "P0" | "P1" | "P2";
export type ServiceGroup = "film" | "light_mod" | "business_comfort" | "practical_accessory";
export type AccentColor =
  | "cyan" | "orange" | "amber" | "emerald" | "violet"
  | "pink" | "blue" | "teal" | "red";

export type ProductRoute = {
  type: ProductRouteType;
  canonicalPath: string;
  legacyPaths?: readonly string[];
  title: string;
  navLabel: string;
  status: ProductRouteStatus;
  priority: ProductRoutePriority;
};

export type VehicleBrandRoute = ProductRoute & {
  type: "vehicle_brand";
  brandSlug: string;
  brandName: string;
  accentColor: AccentColor;
  modelSlugs: readonly string[];
};

export type VehicleModelRoute = ProductRoute & {
  type: "vehicle_model";
  brandSlug: string;
  modelSlug: string;
  modelName: string;
  parentPath: string;
  projectCount?: number;
  sourcePrd: string;
};

export type ServiceRoute = ProductRoute & {
  type: "service_category";
  serviceSlug: string;
  group: ServiceGroup;
};

const BRANDS: readonly VehicleBrandRoute[] = [
  { type: "vehicle_brand", brandSlug: "wenjie",  brandName: "问界",  accentColor: "cyan",     status: "live",    priority: "P0", canonicalPath: "/product/wenjie",  title: "问界轻改方案", navLabel: "问界", modelSlugs: ["m6","m7","m8"] },
  { type: "vehicle_brand", brandSlug: "xiaomi",  brandName: "小米",  accentColor: "orange",   status: "live",    priority: "P0", canonicalPath: "/product/xiaomi",  title: "小米轻改方案", navLabel: "小米", modelSlugs: ["su7","yu7"] },
  { type: "vehicle_brand", brandSlug: "zeekr",   brandName: "极氪",  accentColor: "orange",   status: "live",    priority: "P0", canonicalPath: "/product/zeekr",   title: "极氪轻改方案", navLabel: "极氪", modelSlugs: ["9x"] },
  { type: "vehicle_brand", brandSlug: "li-auto", brandName: "理想",  accentColor: "amber",    status: "planned", priority: "P1", canonicalPath: "/product/li-auto", title: "理想轻改方案", navLabel: "理想", modelSlugs: ["i8"] },
  { type: "vehicle_brand", brandSlug: "tesla",   brandName: "特斯拉", accentColor: "red",     status: "planned", priority: "P1", canonicalPath: "/product/tesla",   title: "特斯拉轻改方案", navLabel: "特斯拉", modelSlugs: [] },
  { type: "vehicle_brand", brandSlug: "xpeng",   brandName: "小鹏",  accentColor: "emerald",  status: "planned", priority: "P1", canonicalPath: "/product/xpeng",   title: "小鹏轻改方案", navLabel: "小鹏", modelSlugs: ["gx"] },
  { type: "vehicle_brand", brandSlug: "denza",   brandName: "腾势",  accentColor: "pink",     status: "planned", priority: "P1", canonicalPath: "/product/denza",   title: "腾势轻改方案", navLabel: "腾势", modelSlugs: ["d9"] },
  { type: "vehicle_brand", brandSlug: "voyah",   brandName: "岚图",  accentColor: "violet",   status: "planned", priority: "P1", canonicalPath: "/product/voyah",   title: "岚图轻改方案", navLabel: "岚图", modelSlugs: ["dreamer"] },
  { type: "vehicle_brand", brandSlug: "ledao",   brandName: "乐道",  accentColor: "blue",     status: "planned", priority: "P1", canonicalPath: "/product/ledao",   title: "乐道轻改方案", navLabel: "乐道", modelSlugs: ["l90"] },
  { type: "vehicle_brand", brandSlug: "gaoshan", brandName: "高山",  accentColor: "teal",     status: "planned", priority: "P1", canonicalPath: "/product/gaoshan", title: "高山轻改方案", navLabel: "高山", modelSlugs: ["8"] },
  { type: "vehicle_brand", brandSlug: "zhijie",  brandName: "智界",  accentColor: "amber",    status: "planned", priority: "P1", canonicalPath: "/product/zhijie",  title: "智界轻改方案", navLabel: "智界", modelSlugs: ["v9"] },
] as const;

const MODELS: readonly VehicleModelRoute[] = [
  { type: "vehicle_model", brandSlug: "xiaomi", modelSlug: "su7",  modelName: "小米 SU7",  parentPath: "/product/xiaomi",  canonicalPath: "/product/xiaomi/su7",  title: "小米 SU7 专属升级方案",  navLabel: "SU7",  status: "planned", priority: "P0", projectCount: 26, sourcePrd: "docs/PRD/product/XIAOMI_SERIES_UPGRADE_PRD_2026-06-24.md" },
  { type: "vehicle_model", brandSlug: "xiaomi", modelSlug: "yu7",  modelName: "小米 YU7",  parentPath: "/product/xiaomi",  canonicalPath: "/product/xiaomi/yu7",  title: "小米 YU7 专属升级方案",  navLabel: "YU7",  status: "planned", priority: "P0", projectCount: 28, sourcePrd: "docs/PRD/product/XIAOMI_YU7_UPGRADE_PRD_2026-06-24.md", legacyPaths: ["/product/xiaomi-yu7"] },
  { type: "vehicle_model", brandSlug: "wenjie", modelSlug: "m6",   modelName: "问界 M6",   parentPath: "/product/wenjie",  canonicalPath: "/product/wenjie/m6",   title: "问界 M6 专属升级方案",   navLabel: "M6",   status: "planned", priority: "P0", projectCount: 17, sourcePrd: "docs/PRD/product/WENJIE_M6_TOPIC_PRD_2026-06-25.md", legacyPaths: ["/product/wenjie-m6"] },
  { type: "vehicle_model", brandSlug: "wenjie", modelSlug: "m7",   modelName: "问界 M7",   parentPath: "/product/wenjie",  canonicalPath: "/product/wenjie/m7",   title: "问界 M7 专属升级方案",   navLabel: "M7",   status: "planned", priority: "P0", projectCount: 30, sourcePrd: "docs/PRD/product/WENJIE_M7_TOPIC_PRD_2026-06-25.md", legacyPaths: ["/product/wenjie-m7"] },
  { type: "vehicle_model", brandSlug: "wenjie", modelSlug: "m8",   modelName: "问界 M8",   parentPath: "/product/wenjie",  canonicalPath: "/product/wenjie/m8",   title: "问界 M8 专属升级方案",   navLabel: "M8",   status: "planned", priority: "P0", projectCount: 30, sourcePrd: "docs/PRD/product/WENJIE_M8_TOPIC_PRD_2026-06-25.md", legacyPaths: ["/product/wenjie-m8"] },
  { type: "vehicle_model", brandSlug: "zeekr",  modelSlug: "9x",   modelName: "极氪 9X",   parentPath: "/product/zeekr",   canonicalPath: "/product/zeekr/9x",    title: "极氪 9X 专属升级方案",   navLabel: "9X",   status: "planned", priority: "P0", projectCount: 25, sourcePrd: "docs/PRD/product/ZEEKR_9X_UPGRADE_PRD_2026-06-24.md", legacyPaths: ["/product/zeekr-9x"] },
  { type: "vehicle_model", brandSlug: "li-auto", modelSlug: "i8",  modelName: "理想 i8",   parentPath: "/product/li-auto", canonicalPath: "/product/li-auto/i8",   title: "理想 i8 专属升级方案",   navLabel: "i8",   status: "planned", priority: "P1", projectCount: 25, sourcePrd: "docs/PRD/product/LI_AUTO_I8_TOPIC_PRD_2026-06-24.md" },
  { type: "vehicle_model", brandSlug: "denza",  modelSlug: "d9",   modelName: "腾势 D9",   parentPath: "/product/denza",   canonicalPath: "/product/denza/d9",    title: "腾势 D9 专属升级方案",   navLabel: "D9",   status: "planned", priority: "P1", projectCount: 22, sourcePrd: "docs/PRD/product/DENZA_D9_TOPIC_PRD_2026-06-24.md", legacyPaths: ["/product/denza-d9"] },
  { type: "vehicle_model", brandSlug: "voyah",  modelSlug: "dreamer", modelName: "岚图梦想家", parentPath: "/product/voyah", canonicalPath: "/product/voyah/dreamer", title: "岚图梦想家专属升级方案", navLabel: "梦想家", status: "planned", priority: "P1", projectCount: 20, sourcePrd: "docs/PRD/product/VOYAH_DREAMER_TOPIC_PRD_2026-06-25.md", legacyPaths: ["/product/voyah-dreamer"] },
  { type: "vehicle_model", brandSlug: "xpeng",  modelSlug: "gx",   modelName: "小鹏 GX",   parentPath: "/product/xpeng",   canonicalPath: "/product/xpeng/gx",    title: "小鹏 GX 专属升级方案",   navLabel: "GX",   status: "planned", priority: "P1", projectCount: 22, sourcePrd: "docs/PRD/product/XPENG_GX_TOPIC_PRD_2026-06-25.md", legacyPaths: ["/product/xpeng-gx"] },
  { type: "vehicle_model", brandSlug: "ledao",  modelSlug: "l90",  modelName: "乐道 L90",  parentPath: "/product/ledao",   canonicalPath: "/product/ledao/l90",   title: "乐道 L90 专属升级方案",  navLabel: "L90",  status: "planned", priority: "P1", projectCount: 20, sourcePrd: "docs/PRD/product/LEDAO_L90_TOPIC_PRD_2026-06-24.md", legacyPaths: ["/product/ledao-l90"] },
  { type: "vehicle_model", brandSlug: "gaoshan", modelSlug: "8",   modelName: "高山 8",    parentPath: "/product/gaoshan", canonicalPath: "/product/gaoshan/8",    title: "高山 8 专属升级方案",    navLabel: "8",    status: "planned", priority: "P1", projectCount: 18, sourcePrd: "docs/PRD/product/GAOSHAN_8_TOPIC_PRD_2026-06-25.md", legacyPaths: ["/product/gaoshan-8"] },
  { type: "vehicle_model", brandSlug: "zhijie", modelSlug: "v9",   modelName: "智界 V9",   parentPath: "/product/zhijie",  canonicalPath: "/product/zhijie/v9",   title: "智界 V9 专属升级方案",   navLabel: "V9",   status: "planned", priority: "P1", projectCount: 22, sourcePrd: "docs/PRD/product/ZHIJIE_V9_TOPIC_PRD_2026-06-25.md", legacyPaths: ["/product/zhijie-v9"] },
] as const;

const SERVICES: readonly ServiceRoute[] = [
  { type: "service_category", serviceSlug: "ppf",             title: "隐形车衣",          navLabel: "隐形车衣",     group: "film",                  status: "live",    priority: "P0", canonicalPath: "/product/ppf" },
  { type: "service_category", serviceSlug: "window-film",     title: "汽车窗膜",          navLabel: "汽车窗膜",     group: "film",                  status: "live",    priority: "P0", canonicalPath: "/product/window-film" },
  { type: "service_category", serviceSlug: "color-film",      title: "改色膜",            navLabel: "改色膜",       group: "film",                  status: "live",    priority: "P0", canonicalPath: "/product/color-film" },
  { type: "service_category", serviceSlug: "electric-steps",  title: "电动踏板",          navLabel: "电动踏板",     group: "light_mod",             status: "live",    priority: "P0", canonicalPath: "/product/electric-steps" },
  { type: "service_category", serviceSlug: "wheels",          title: "轮毂升级",          navLabel: "轮毂升级",     group: "light_mod",             status: "live",    priority: "P0", canonicalPath: "/product/wheels" },
  { type: "service_category", serviceSlug: "chassis",         title: "底盘升级",          navLabel: "底盘升级",     group: "light_mod",             status: "live",    priority: "P0", canonicalPath: "/product/chassis" },
  { type: "service_category", serviceSlug: "flooring",        title: "汽车地板",          navLabel: "汽车地板",     group: "practical_accessory",   status: "live",    priority: "P1", canonicalPath: "/product/flooring" },
  { type: "service_category", serviceSlug: "floor-mats",      title: "360 软包脚垫",      navLabel: "360 软包脚垫", group: "practical_accessory",   status: "planned", priority: "P1", canonicalPath: "/product/floor-mats" },
  { type: "service_category", serviceSlug: "business-comfort", title: "商务舒适升级",     navLabel: "商务舒适升级", group: "business_comfort",      status: "planned", priority: "P1", canonicalPath: "/product/business-comfort" },
  { type: "service_category", serviceSlug: "skid-plate",      title: "底盘护板",          navLabel: "底盘护板",     group: "light_mod",             status: "planned", priority: "P1", canonicalPath: "/product/skid-plate" },
] as const;

export const ALL_BRANDS: readonly VehicleBrandRoute[] = BRANDS;
export const ALL_MODELS: readonly VehicleModelRoute[] = MODELS;
export const ALL_SERVICES: readonly ServiceRoute[] = SERVICES;

export const ALL_LEGACY_ALIASES: readonly { from: string; to: string }[] = MODELS
  .flatMap((m) => (m.legacyPaths ?? []).map((from) => ({ from, to: m.canonicalPath })));

export function getBrandRoute(brandSlug: string): VehicleBrandRoute | undefined {
  return BRANDS.find((b) => b.brandSlug === brandSlug);
}

export function getModelRoute(brandSlug: string, modelSlug: string): VehicleModelRoute | undefined {
  return MODELS.find((m) => m.brandSlug === brandSlug && m.modelSlug === modelSlug);
}

export function getServiceRoute(serviceSlug: string): ServiceRoute | undefined {
  return SERVICES.find((s) => s.serviceSlug === serviceSlug);
}

export function getCanonicalFor(path: string): string | undefined {
  const alias = ALL_LEGACY_ALIASES.find((a) => a.from === path);
  return alias?.to;
}

export function getModelsByBrand(brandSlug: string): readonly VehicleModelRoute[] {
  return MODELS.filter((m) => m.brandSlug === brandSlug);
}

export function getLiveBrands(): readonly VehicleBrandRoute[] {
  return BRANDS.filter((b) => b.status === "live");
}

export function getLiveServices(): readonly ServiceRoute[] {
  return SERVICES.filter((s) => s.status === "live");
}
