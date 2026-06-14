/**
 * 问界改装专题页数据
 *
 * 数据派生自 public/images/products/wenjie/manifest.json（v1, 2026-06-13）。
 * 构建期一次性写入；运行时不读取 .hermes/ 或微信缓存绝对路径。
 *
 * 重要提示：
 *   - 源 manifest 的 productRows 没有图片绑定字段，
 *     manifest.imageMatchingNote 明确："Images were extracted from reconstructed
 *     Excel drawing payloads. Product-level matching still needs manual review
 *     before binding images to product rows."
 *   - 按 PRD §7.3 规则："无法匹配图片的产品必须显示'图片待补充'状态，
 *     不得误配其他产品图片。"
 *   - 因此本轮 44 条数据全部 imageStatus="pending"，publicPath=null。
 *   - 等业务人工核对 contact-sheet.jpg 后，由架构师逐项标记为 "matched"
 *     并填入 publicPath，前端无需改组件即可自动切换为真实图。
 */

export type WenjieVehicleModel = "M7" | "M8" | "M9";

export type WenjieCategory =
  | "电动踏板"
  | "内饰便利"
  | "地板尾箱"
  | "防护配件"
  | "底盘防护"
  | "外观套件"
  | "内饰舒适"
  | "内饰保护"
  | "电气便利"
  | "密封降噪"
  | "灯光配件"
  | "外观配件";

export type WenjieImageStatus = "matched" | "pending";

export type WenjieProduct = {
  id: string;
  vehicleModel: WenjieVehicleModel;
  orderInModel: number;
  /** 源 Excel 物理行号（用于内部追踪、人工核对） */
  sourceRow: number;
  productName: string;
  category: WenjieCategory;
  imageStatus: WenjieImageStatus;
  image: {
    /** matched 时为 /images/products/wenjie/... 路径；pending 时为 null */
    publicPath: string | null;
    alt: string;
  };
};

function buildPendingAlt(
  vehicleModel: WenjieVehicleModel,
  productName: string,
): string {
  return `问界 ${vehicleModel} ${productName} 产品图待补充`;
}

// ---- 44 条产品数据（全 pending）----

export const wenjieProducts: WenjieProduct[] = [
  // M7 — 6 款（按 PRD §6.2）
  {
    id: "wenjie-m7-001",
    vehicleModel: "M7",
    orderInModel: 1,
    sourceRow: 5,
    productName: "地板+尾箱地板",
    category: "地板尾箱",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M7", "地板+尾箱地板") },
  },
  {
    id: "wenjie-m7-002",
    vehicleModel: "M7",
    orderInModel: 2,
    sourceRow: 6,
    productName: "小桌板（简约款）",
    category: "内饰便利",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M7", "小桌板（简约款）") },
  },
  {
    id: "wenjie-m7-003",
    vehicleModel: "M7",
    orderInModel: 3,
    sourceRow: 7,
    productName: "小桌板（功能款）",
    category: "内饰便利",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M7", "小桌板（功能款）") },
  },
  {
    id: "wenjie-m7-004",
    vehicleModel: "M7",
    orderInModel: 4,
    sourceRow: 8,
    productName: "问界M7电动踏板（一体全铝支架）",
    category: "电动踏板",
    imageStatus: "pending",
    image: {
      publicPath: null,
      alt: buildPendingAlt("M7", "电动踏板（一体全铝支架）"),
    },
  },
  {
    id: "wenjie-m7-005",
    vehicleModel: "M7",
    orderInModel: 5,
    sourceRow: 9,
    productName: "问界M7单流光灯（一体全铝支架）",
    category: "电动踏板",
    imageStatus: "pending",
    image: {
      publicPath: null,
      alt: buildPendingAlt("M7", "单流光灯（一体全铝支架）"),
    },
  },
  {
    id: "wenjie-m7-006",
    vehicleModel: "M7",
    orderInModel: 6,
    sourceRow: 10,
    productName: "问界M7双流光灯面板（一体全铝支架）",
    category: "电动踏板",
    imageStatus: "pending",
    image: {
      publicPath: null,
      alt: buildPendingAlt("M7", "双流光灯面板（一体全铝支架）"),
    },
  },

  // M8 — 22 款（按 PRD §6.3）
  {
    id: "wenjie-m8-001",
    vehicleModel: "M8",
    orderInModel: 1,
    sourceRow: 12,
    productName: "小桌板（简约款）",
    category: "内饰便利",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M8", "小桌板（简约款）") },
  },
  {
    id: "wenjie-m8-002",
    vehicleModel: "M8",
    orderInModel: 2,
    sourceRow: 13,
    productName: "小桌板（功能款）",
    category: "内饰便利",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M8", "小桌板（功能款）") },
  },
  {
    id: "wenjie-m8-003",
    vehicleModel: "M8",
    orderInModel: 3,
    sourceRow: 14,
    productName: "地板",
    category: "地板尾箱",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M8", "地板") },
  },
  {
    id: "wenjie-m8-004",
    vehicleModel: "M8",
    orderInModel: 4,
    sourceRow: 15,
    productName: "尾箱地板",
    category: "地板尾箱",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M8", "尾箱地板") },
  },
  {
    id: "wenjie-m8-005",
    vehicleModel: "M8",
    orderInModel: 5,
    sourceRow: 16,
    productName: "满天星防虫网（三段式）",
    category: "防护配件",
    imageStatus: "pending",
    image: {
      publicPath: null,
      alt: buildPendingAlt("M8", "满天星防虫网（三段式）"),
    },
  },
  {
    id: "wenjie-m8-006",
    vehicleModel: "M8",
    orderInModel: 6,
    sourceRow: 17,
    productName: "原厂风格防虫网",
    category: "防护配件",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M8", "原厂风格防虫网") },
  },
  {
    id: "wenjie-m8-007",
    vehicleModel: "M8",
    orderInModel: 7,
    sourceRow: 18,
    productName: "冰箱防踢带垃圾桶（隐藏式）",
    category: "内饰便利",
    imageStatus: "pending",
    image: {
      publicPath: null,
      alt: buildPendingAlt("M8", "冰箱防踢带垃圾桶（隐藏式）"),
    },
  },
  {
    id: "wenjie-m8-008",
    vehicleModel: "M8",
    orderInModel: 8,
    sourceRow: 19,
    productName: "磁吸支架",
    category: "内饰便利",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M8", "磁吸支架") },
  },
  {
    id: "wenjie-m8-009",
    vehicleModel: "M8",
    orderInModel: 9,
    sourceRow: 20,
    productName: "AMXT全套包围[前+后+侧裙]",
    category: "外观套件",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M8", "AMXT全套包围") },
  },
  {
    id: "wenjie-m8-010",
    vehicleModel: "M8",
    orderInModel: 10,
    sourceRow: 21,
    productName: "底盘护板",
    category: "底盘防护",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M8", "底盘护板") },
  },
  {
    id: "wenjie-m8-011",
    vehicleModel: "M8",
    orderInModel: 11,
    sourceRow: 22,
    productName: "201款门槛条+后护板",
    category: "防护配件",
    imageStatus: "pending",
    image: {
      publicPath: null,
      alt: buildPendingAlt("M8", "201款门槛条+后护板"),
    },
  },
  {
    id: "wenjie-m8-012",
    vehicleModel: "M8",
    orderInModel: 12,
    sourceRow: 23,
    productName: "车牌架",
    category: "外观配件",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M8", "车牌架") },
  },
  {
    id: "wenjie-m8-013",
    vehicleModel: "M8",
    orderInModel: 13,
    sourceRow: 24,
    productName: "四轮挡泥板",
    category: "防护配件",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M8", "四轮挡泥板") },
  },
  {
    id: "wenjie-m8-014",
    vehicleModel: "M8",
    orderInModel: 14,
    sourceRow: 25,
    productName: "全车坐垫",
    category: "内饰舒适",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M8", "全车坐垫") },
  },
  {
    id: "wenjie-m8-015",
    vehicleModel: "M8",
    orderInModel: 15,
    sourceRow: 26,
    productName: "座椅防踢垫",
    category: "防护配件",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M8", "座椅防踢垫") },
  },
  {
    id: "wenjie-m8-016",
    vehicleModel: "M8",
    orderInModel: 16,
    sourceRow: 27,
    productName: "尾箱垫全套",
    category: "地板尾箱",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M8", "尾箱垫全套") },
  },
  {
    id: "wenjie-m8-017",
    vehicleModel: "M8",
    orderInModel: 17,
    sourceRow: 28,
    productName: "中排车载充电器",
    category: "电气便利",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M8", "中排车载充电器") },
  },
  {
    id: "wenjie-m8-018",
    vehicleModel: "M8",
    orderInModel: 18,
    sourceRow: 29,
    productName: "硅胶套餐（13件套）",
    category: "内饰保护",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M8", "硅胶套餐（13件套）") },
  },
  {
    id: "wenjie-m8-019",
    vehicleModel: "M8",
    orderInModel: 19,
    sourceRow: 30,
    productName: "四门密封条",
    category: "密封降噪",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M8", "四门密封条") },
  },
  {
    id: "wenjie-m8-020",
    vehicleModel: "M8",
    orderInModel: 20,
    sourceRow: 31,
    productName: "问界M8电动踏板（一体全铝支架）",
    category: "电动踏板",
    imageStatus: "pending",
    image: {
      publicPath: null,
      alt: buildPendingAlt("M8", "电动踏板（一体全铝支架）"),
    },
  },
  {
    id: "wenjie-m8-021",
    vehicleModel: "M8",
    orderInModel: 21,
    sourceRow: 32,
    productName: "问界M8单流光灯电动踏板（一体全铝支架）",
    category: "电动踏板",
    imageStatus: "pending",
    image: {
      publicPath: null,
      alt: buildPendingAlt("M8", "单流光灯电动踏板（一体全铝支架）"),
    },
  },
  {
    id: "wenjie-m8-022",
    vehicleModel: "M8",
    orderInModel: 22,
    sourceRow: 33,
    productName: "问界M8双流光灯电动踏板（一体全铝支架）",
    category: "电动踏板",
    imageStatus: "pending",
    image: {
      publicPath: null,
      alt: buildPendingAlt("M8", "双流光灯电动踏板（一体全铝支架）"),
    },
  },

  // M9 — 16 款（按 PRD §6.4）
  {
    id: "wenjie-m9-001",
    vehicleModel: "M9",
    orderInModel: 1,
    sourceRow: 35,
    productName: "小桌板",
    category: "内饰便利",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M9", "小桌板") },
  },
  {
    id: "wenjie-m9-002",
    vehicleModel: "M9",
    orderInModel: 2,
    sourceRow: 36,
    productName: "地板+尾箱地板",
    category: "地板尾箱",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M9", "地板+尾箱地板") },
  },
  {
    id: "wenjie-m9-003",
    vehicleModel: "M9",
    orderInModel: 3,
    sourceRow: 37,
    productName: "88星满天星防虫网（三段式）",
    category: "防护配件",
    imageStatus: "pending",
    image: {
      publicPath: null,
      alt: buildPendingAlt("M9", "88星满天星防虫网（三段式）"),
    },
  },
  {
    id: "wenjie-m9-004",
    vehicleModel: "M9",
    orderInModel: 4,
    sourceRow: 38,
    productName: "冰箱防踢带垃圾桶",
    category: "内饰便利",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M9", "冰箱防踢带垃圾桶") },
  },
  {
    id: "wenjie-m9-005",
    vehicleModel: "M9",
    orderInModel: 5,
    sourceRow: 39,
    productName: "后备箱后窗1ed表情灯",
    category: "灯光配件",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M9", "后备箱后窗LED表情灯") },
  },
  {
    id: "wenjie-m9-006",
    vehicleModel: "M9",
    orderInModel: 6,
    sourceRow: 40,
    productName: "电动款小桌板",
    category: "内饰便利",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M9", "电动款小桌板") },
  },
  {
    id: "wenjie-m9-007",
    vehicleModel: "M9",
    orderInModel: 7,
    sourceRow: 41,
    productName: "全车铝镁合金下护板",
    category: "底盘防护",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M9", "全车铝镁合金下护板") },
  },
  {
    id: "wenjie-m9-008",
    vehicleModel: "M9",
    orderInModel: 8,
    sourceRow: 42,
    productName: "全套坐垫",
    category: "内饰舒适",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M9", "全套坐垫") },
  },
  {
    id: "wenjie-m9-009",
    vehicleModel: "M9",
    orderInModel: 9,
    sourceRow: 43,
    productName: "后轮内衬挡泥板",
    category: "防护配件",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M9", "后轮内衬挡泥板") },
  },
  {
    id: "wenjie-m9-010",
    vehicleModel: "M9",
    orderInModel: 10,
    sourceRow: 44,
    productName: "四门挡泥板",
    category: "防护配件",
    imageStatus: "pending",
    image: { publicPath: null, alt: buildPendingAlt("M9", "四门挡泥板") },
  },
  {
    id: "wenjie-m9-011",
    vehicleModel: "M9",
    orderInModel: 11,
    sourceRow: 45,
    productName: "全套硅胶垫子套餐21件套",
    category: "内饰保护",
    imageStatus: "pending",
    image: {
      publicPath: null,
      alt: buildPendingAlt("M9", "全套硅胶垫子套餐21件套"),
    },
  },
  {
    id: "wenjie-m9-012",
    vehicleModel: "M9",
    orderInModel: 12,
    sourceRow: 46,
    productName: "全套硅胶垫子套餐17件套",
    category: "内饰保护",
    imageStatus: "pending",
    image: {
      publicPath: null,
      alt: buildPendingAlt("M9", "全套硅胶垫子套餐17件套"),
    },
  },
  {
    id: "wenjie-m9-013",
    vehicleModel: "M9",
    orderInModel: 13,
    sourceRow: 47,
    productName: "全套硅胶垫子套餐9件套",
    category: "内饰保护",
    imageStatus: "pending",
    image: {
      publicPath: null,
      alt: buildPendingAlt("M9", "全套硅胶垫子套餐9件套"),
    },
  },
  {
    id: "wenjie-m9-014",
    vehicleModel: "M9",
    orderInModel: 14,
    sourceRow: 48,
    productName: "问界M9电动踏板（一体全铝支架）",
    category: "电动踏板",
    imageStatus: "pending",
    image: {
      publicPath: null,
      alt: buildPendingAlt("M9", "电动踏板（一体全铝支架）"),
    },
  },
  {
    id: "wenjie-m9-015",
    vehicleModel: "M9",
    orderInModel: 15,
    sourceRow: 49,
    productName: "问界M9单流光灯电动踏板（一体全铝支架）",
    category: "电动踏板",
    imageStatus: "pending",
    image: {
      publicPath: null,
      alt: buildPendingAlt("M9", "单流光灯电动踏板（一体全铝支架）"),
    },
  },
  {
    id: "wenjie-m9-016",
    vehicleModel: "M9",
    orderInModel: 16,
    sourceRow: 50,
    productName: "问界M9双流光灯面板电动踏板（一体全铝支架）",
    category: "电动踏板",
    imageStatus: "pending",
    image: {
      publicPath: null,
      alt: buildPendingAlt("M9", "双流光灯面板电动踏板（一体全铝支架）"),
    },
  },
];

// ---- 按车型分组（按 orderInModel 升序）----

export const wenjieProductsByModel: Record<
  WenjieVehicleModel,
  WenjieProduct[]
> = {
  M7: wenjieProducts
    .filter((p) => p.vehicleModel === "M7")
    .sort((a, b) => a.orderInModel - b.orderInModel),
  M8: wenjieProducts
    .filter((p) => p.vehicleModel === "M8")
    .sort((a, b) => a.orderInModel - b.orderInModel),
  M9: wenjieProducts
    .filter((p) => p.vehicleModel === "M9")
    .sort((a, b) => a.orderInModel - b.orderInModel),
};

// ---- 车型与分类映射 ----

export const wenjieVehicleLabel: Record<WenjieVehicleModel, string> = {
  M7: "M7",
  M8: "M8",
  M9: "M9",
};

// ---- 页面元数据 ----

export const wenjieTopicMeta = {
  title: "问界改装专题",
  shortDescription: "M7 / M8 / M9 电动踏板、内饰便利、防护配件",
  totalProducts: wenjieProducts.length,
  totalModels: 3,
  previewImage: "/images/products/wenjie/preview.png",
} as const;