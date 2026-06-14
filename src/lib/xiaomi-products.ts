/**
 * 小米改装专题页数据
 *
 * 数据派生自 public/images/products/xiaomi/manifest.json（v1, 2026-06-12）。
 * 构建期一次性写入；运行时不读取 .hermes/ 绝对路径。
 *
 * 字段裁剪（按 PRD §6.5）：
 *   保留：id / vehicleModel / productName / displayName / orderInModel /
 *         category / image.publicPath / image.width / image.height / image.alt
 *   丢弃：source_file / source_sheet / source_row / image.absolute_path /
 *         image.relative_path / image.sha256 / knowledge_type / notes
 */

export type XiaomiCategory = "exterior" | "interior";

export type XiaomiVehicleModel = "SU7" | "YU7";

export type XiaomiProduct = {
  id: string;
  vehicleModel: XiaomiVehicleModel;
  productName: string;
  displayName: string;
  orderInModel: number;
  category: XiaomiCategory;
  image: {
    publicPath: string;
    width: number;
    height: number;
    alt: string;
  };
};

// alt 模板："{车型} {产品名称} 改装件产品展示图"
function buildAlt(vehicleModel: XiaomiVehicleModel, productName: string): string {
  return `小米 ${vehicleModel} ${productName} 改装件产品展示图`;
}

// ---- 18 条产品数据 ----

export const xiaomiProducts: XiaomiProduct[] = [
  // SU7 — 12 款
  {
    id: "xiaomi-su7-001",
    vehicleModel: "SU7",
    productName: "前包围",
    displayName: "SU7 前包围",
    orderInModel: 1,
    category: "exterior",
    image: {
      publicPath: "/images/products/xiaomi/su7/su7-01-front-bumper.png",
      width: 2523,
      height: 1661,
      alt: buildAlt("SU7", "前包围"),
    },
  },
  {
    id: "xiaomi-su7-002",
    vehicleModel: "SU7",
    productName: "刹车油门踏板",
    displayName: "SU7 刹车油门踏板",
    orderInModel: 2,
    category: "interior",
    image: {
      publicPath: "/images/products/xiaomi/su7/su7-02-pedal-covers.png",
      width: 781,
      height: 490,
      alt: buildAlt("SU7", "刹车油门踏板"),
    },
  },
  {
    id: "xiaomi-su7-003",
    vehicleModel: "SU7",
    productName: "座椅背板",
    displayName: "SU7 座椅背板",
    orderInModel: 3,
    category: "interior",
    image: {
      publicPath: "/images/products/xiaomi/su7/su7-03-seat-back-panel.png",
      width: 781,
      height: 490,
      alt: buildAlt("SU7", "座椅背板"),
    },
  },
  {
    id: "xiaomi-su7-004",
    vehicleModel: "SU7",
    productName: "侧裙",
    displayName: "SU7 侧裙",
    orderInModel: 4,
    category: "exterior",
    image: {
      publicPath: "/images/products/xiaomi/su7/su7-04-side-skirts.png",
      width: 781,
      height: 490,
      alt: buildAlt("SU7", "侧裙"),
    },
  },
  {
    id: "xiaomi-su7-005",
    vehicleModel: "SU7",
    productName: "方向盘",
    displayName: "SU7 方向盘",
    orderInModel: 5,
    category: "interior",
    image: {
      publicPath: "/images/products/xiaomi/su7/su7-05-steering-wheel.png",
      width: 781,
      height: 490,
      alt: buildAlt("SU7", "方向盘"),
    },
  },
  {
    id: "xiaomi-su7-006",
    vehicleModel: "SU7",
    productName: "出风口",
    displayName: "SU7 出风口",
    orderInModel: 6,
    category: "interior",
    image: {
      publicPath: "/images/products/xiaomi/su7/su7-06-air-vent-trim.png",
      width: 781,
      height: 490,
      alt: buildAlt("SU7", "出风口"),
    },
  },
  {
    id: "xiaomi-su7-007",
    vehicleModel: "SU7",
    productName: "后视镜",
    displayName: "SU7 后视镜",
    orderInModel: 7,
    category: "exterior",
    image: {
      publicPath: "/images/products/xiaomi/su7/su7-07-side-mirror.png",
      width: 781,
      height: 490,
      alt: buildAlt("SU7", "后视镜"),
    },
  },
  {
    id: "xiaomi-su7-008",
    vehicleModel: "SU7",
    productName: "机盖",
    displayName: "SU7 机盖",
    orderInModel: 8,
    category: "exterior",
    image: {
      publicPath: "/images/products/xiaomi/su7/su7-08-hood.png",
      width: 781,
      height: 490,
      alt: buildAlt("SU7", "机盖"),
    },
  },
  {
    id: "xiaomi-su7-009",
    vehicleModel: "SU7",
    productName: "门饰条",
    displayName: "SU7 门饰条",
    orderInModel: 9,
    category: "exterior",
    image: {
      publicPath: "/images/products/xiaomi/su7/su7-09-door-trim.png",
      width: 781,
      height: 490,
      alt: buildAlt("SU7", "门饰条"),
    },
  },
  {
    id: "xiaomi-su7-010",
    vehicleModel: "SU7",
    productName: "尾翼",
    displayName: "SU7 尾翼",
    orderInModel: 10,
    category: "exterior",
    image: {
      publicPath: "/images/products/xiaomi/su7/su7-10-rear-spoiler.png",
      width: 781,
      height: 490,
      alt: buildAlt("SU7", "尾翼"),
    },
  },
  {
    id: "xiaomi-su7-011",
    vehicleModel: "SU7",
    productName: "迎宾踏板",
    displayName: "SU7 迎宾踏板",
    orderInModel: 11,
    category: "interior",
    image: {
      publicPath: "/images/products/xiaomi/su7/su7-11-door-sill.png",
      width: 781,
      height: 490,
      alt: buildAlt("SU7", "迎宾踏板"),
    },
  },
  {
    id: "xiaomi-su7-012",
    vehicleModel: "SU7",
    productName: "中控面板",
    displayName: "SU7 中控面板",
    orderInModel: 12,
    category: "interior",
    image: {
      publicPath: "/images/products/xiaomi/su7/su7-12-center-console.png",
      width: 781,
      height: 490,
      alt: buildAlt("SU7", "中控面板"),
    },
  },

  // YU7 — 6 款
  {
    id: "xiaomi-yu7-001",
    vehicleModel: "YU7",
    productName: "大灯饰板",
    displayName: "YU7 大灯饰板",
    orderInModel: 1,
    category: "exterior",
    image: {
      publicPath: "/images/products/xiaomi/yu7/yu7-01-headlight-trim.png",
      width: 781,
      height: 490,
      alt: buildAlt("YU7", "大灯饰板"),
    },
  },
  {
    id: "xiaomi-yu7-002",
    vehicleModel: "YU7",
    productName: "出风口",
    displayName: "YU7 出风口",
    orderInModel: 2,
    category: "interior",
    image: {
      publicPath: "/images/products/xiaomi/yu7/yu7-02-air-vent-trim.png",
      width: 781,
      height: 490,
      alt: buildAlt("YU7", "出风口"),
    },
  },
  {
    id: "xiaomi-yu7-003",
    vehicleModel: "YU7",
    productName: "后扰流板",
    displayName: "YU7 后扰流板",
    orderInModel: 3,
    category: "exterior",
    image: {
      publicPath: "/images/products/xiaomi/yu7/yu7-03-rear-diffuser.png",
      width: 781,
      height: 490,
      alt: buildAlt("YU7", "后扰流板"),
    },
  },
  {
    id: "xiaomi-yu7-004",
    vehicleModel: "YU7",
    productName: "后视镜壳",
    displayName: "YU7 后视镜壳",
    orderInModel: 4,
    category: "exterior",
    image: {
      publicPath: "/images/products/xiaomi/yu7/yu7-04-mirror-cover.png",
      width: 781,
      height: 490,
      alt: buildAlt("YU7", "后视镜壳"),
    },
  },
  {
    id: "xiaomi-yu7-005",
    vehicleModel: "YU7",
    productName: "迎宾踏板",
    displayName: "YU7 迎宾踏板",
    orderInModel: 5,
    category: "interior",
    image: {
      publicPath: "/images/products/xiaomi/yu7/yu7-05-door-sill.png",
      width: 781,
      height: 490,
      alt: buildAlt("YU7", "迎宾踏板"),
    },
  },
  {
    id: "xiaomi-yu7-006",
    vehicleModel: "YU7",
    productName: "中控面板",
    displayName: "YU7 中控面板",
    orderInModel: 6,
    category: "interior",
    image: {
      publicPath: "/images/products/xiaomi/yu7/yu7-06-center-console.png",
      width: 781,
      height: 490,
      alt: buildAlt("YU7", "中控面板"),
    },
  },
];

// ---- 按车型分组（按 orderInModel 升序）----

export const xiaomiProductsByModel: Record<XiaomiVehicleModel, XiaomiProduct[]> =
  {
    SU7: xiaomiProducts
      .filter((p) => p.vehicleModel === "SU7")
      .sort((a, b) => a.orderInModel - b.orderInModel),
    YU7: xiaomiProducts
      .filter((p) => p.vehicleModel === "YU7")
      .sort((a, b) => a.orderInModel - b.orderInModel),
  };

// ---- 主分类映射（按 PRD §6.4，v1.1 已移除碳纤维分类）----

export const xiaomiCategoryLabel: Record<XiaomiCategory, string> = {
  exterior: "外观套件",
  interior: "内饰升级",
};

export const xiaomiVehicleLabel: Record<XiaomiVehicleModel, string> = {
  SU7: "SU7",
  YU7: "YU7",
};

// ---- 页面元数据常量 ----

export const xiaomiTopicMeta = {
  title: "小米改装专题",
  shortDescription: "SU7 / YU7 外观件与内饰升级",
  totalProducts: xiaomiProducts.length,
  totalModels: 2,
  previewImage: "/images/products/xiaomi/preview.png",
  ogImage: "/images/products/xiaomi/og-cover.png",
} as const;