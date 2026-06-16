/**
 * ZEEKR 改装专题页数据
 *
 * 数据派生自 PRD v2.0 §6 (产品表) + §8.3 (迁移清单)。
 *
 * 关键约束(PRD §8.5/§12):
 * - ZeekrImageWidth / Height / AspectRatio 用字面量类型,TS 编译期禁止图片规格漂移。
 * - matched 产品的 image 字段全部必填,missing/pending-review 全部 null。
 * - 23 个产品行(9X 16 + 8X 6 + 009 1),totalProducts/totalModels 也是字面量。
 * - 不引用微信缓存路径,所有 publicPath 以 /images/products/zeekr/ 开头。
 *
 * name vs rawName (§6.5 清洗规则):
 * - name: 前端展示的清洗后名称(去掉多余空格)
 * - rawName: 源 Excel / 源文件名(保留供业务核对)
 */

// ---- 类型字面量 ----

export type ZeekrModel = "9X" | "8X" | "009";

export type ZeekrProductCategory =
  | "地板尾箱"
  | "尾箱防护"
  | "尾箱收纳"
  | "内饰便利"
  | "内饰舒适"
  | "内饰保护"
  | "内饰升级"
  | "门槛防护"
  | "尾门防护"
  | "车身防护"
  | "防护配件"
  | "挡泥板/内衬"
  | "地板脚垫"
  | "底盘防护"
  | "电动踏板配件";

export type ZeekrImageStatus = "matched" | "pending-review" | "missing";

export type ZeekrImageWidth = 1448;
export type ZeekrImageHeight = 1086;
export type ZeekrImageAspectRatio = "4/3";

export interface ZeekrProductImage {
  /** matched 时为 /images/products/zeekr/... 路径;pending-review/missing 时为 null */
  publicPath: string | null;
  alt: string;
  /** matched 时必填,字面量;pending-review/missing 时为 null(为业务后续补图留口子) */
  width: ZeekrImageWidth | null;
  height: ZeekrImageHeight | null;
  aspectRatio: ZeekrImageAspectRatio | null;
}

export interface ZeekrProduct {
  /** zeekr-{modelLower}-{order},例 zeekr-9x-01 */
  id: string;
  model: ZeekrModel;
  orderInModel: number;
  /** 清洗后展示名称 */
  name: string;
  /** 源 Excel 原始名称 */
  rawName: string;
  category: ZeekrProductCategory;
  imageStatus: ZeekrImageStatus;
  image: ZeekrProductImage;
}

export interface ZeekrTopicMeta {
  title: string;
  description: string;
  totalProducts: 23; // 字面量,禁止漂移
  totalModels: 3; // 字面量,禁止漂移
  previewImage: string;
  ogImage: string;
}

// ---- 工具函数 ----

function modelLower(model: ZeekrModel): string {
  return model.toLowerCase();
}

function makeId(model: ZeekrModel, order: number): string {
  return `zeekr-${modelLower(model)}-${String(order).padStart(2, "0")}`;
}

function matchedImage(
  model: ZeekrModel,
  order: number,
  displayName: string,
): ZeekrProductImage {
  const slug = `${String(order).padStart(2, "0")}-${slugify(displayName)}.png`;
  const subdir = modelLower(model);
  return {
    publicPath: `/images/products/zeekr/${subdir}/${slug}`,
    alt: `极氪 ${model} ${displayName} 产品展示图`,
    width: 1448,
    height: 1086,
    aspectRatio: "4/3",
  };
}

function missingImage(model: ZeekrModel, displayName: string): ZeekrProductImage {
  return {
    publicPath: null,
    alt: `极氪 ${model} ${displayName} 图片待补充`,
    width: null,
    height: null,
    aspectRatio: null,
  };
}

function pendingReviewImage(
  model: ZeekrModel,
  displayName: string,
): ZeekrProductImage {
  return {
    publicPath: null,
    alt: `极氪 ${model} ${displayName} 图片待复核`,
    width: null,
    height: null,
    aspectRatio: null,
  };
}

function product(
  model: ZeekrModel,
  order: number,
  name: string,
  rawName: string,
  category: ZeekrProductCategory,
  imageStatus: ZeekrImageStatus,
  image: ZeekrProductImage,
): ZeekrProduct {
  return {
    id: makeId(model, order),
    model,
    orderInModel: order,
    name,
    rawName,
    category,
    imageStatus,
    image,
  };
}

/**
 * 简易 slug 化:中文保留(无法转 ASCII),仅处理英文/数字/空格/标点
 * 用于根据展示名生成 ASCII 文件名(与 migrate-zeekr-images.mjs 实际命名对齐)
 */
function slugify(name: string): string {
  const manualSlugs: Record<string, string> = {
    小桌板: "table",
    地板尾箱地板氛围灯: "floor-trunk-ambient",
    地板尾箱地板: "floor-trunk",
    后备箱垫7件套: "trunk-mat-7pc",
    门槛条10件套: "door-sill-10pc",
    天地门全套6件套: "tailgate-6pc",
    防虫网16件套: "bug-net-16pc",
    全包坐垫: "seat-cover",
    挡泥板内衬6件套: "mudguard-liner-6pc",
    双层脚垫: "double-layer-mat",
    外置门槛条: "exterior-sill",
    主副驾座椅防踢垫脚踏套: "kick-pedal-pad",
    冰箱垃圾桶按压款: "fridge-trash-press",
    冰箱防踢垃圾桶: "fridge-trash",
    底盘护板: "underbody-plate",
    三段式方向盘: "steering-wheel",
    三段式方向盘套: "steering-wheel-cover",
    后备箱储物盒: "trunk-storage",
    电动踏板盖: "epedal-cover",
    尾门防刮面板1件套: "tailgate-guard",
  };

  // 移除空格/+ 号
  const cleaned = name.replace(/[\s+]/g, "");
  if (manualSlugs[cleaned]) return manualSlugs[cleaned]!;

  // 兜底:pinyin 不可靠,直接返回 hex hash(避免空 slug)
  return `unknown-${simpleHash(cleaned)}`;
}

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

// ---- 23 条产品数据(按 PRD §6.2/§6.3/§6.4 + §8.3)----

export const zeekrProducts: ZeekrProduct[] = [
  // ===== 9X — 16 款(PRD §6.2 行 1-16)=====
  product(
    "9X",
    1,
    "小桌板",
    "小桌板",
    "内饰便利",
    "matched",
    matchedImage("9X", 1, "小桌板"),
  ),
  product(
    "9X",
    2,
    "地板+尾箱地板+氛围灯",
    "地板+尾箱地板+氛围灯",
    "地板尾箱",
    "matched",
    matchedImage("9X", 2, "地板+尾箱地板+氛围灯"),
  ),
  product(
    "9X",
    3,
    "后备箱垫-7件套",
    "后备箱垫-7件套",
    "尾箱防护",
    "matched",
    matchedImage("9X", 3, "后备箱垫-7件套"),
  ),
  product(
    "9X",
    4,
    "门槛条10件套",
    "门槛条10件套",
    "门槛防护",
    "matched",
    matchedImage("9X", 4, "门槛条10件套"),
  ),
  product(
    "9X",
    5,
    "天地门全套6件套",
    "天地门全套6件套",
    "车身防护",
    "matched",
    matchedImage("9X", 5, "天地门全套6件套"),
  ),
  product(
    "9X",
    6,
    "防虫网16件套",
    "防虫网16件套",
    "防护配件",
    "matched",
    matchedImage("9X", 6, "防虫网16件套"),
  ),
  product(
    "9X",
    7,
    "全包坐垫",
    "全包坐垫",
    "内饰舒适",
    "matched",
    matchedImage("9X", 7, "全包坐垫"),
  ),
  // 行 8:缺图(源 Excel 无 PNG,UI 降级)
  product(
    "9X",
    8,
    "挡泥板+内衬6件套",
    "挡泥板+内衬6件套",
    "挡泥板/内衬",
    "missing",
    missingImage("9X", "挡泥板+内衬6件套"),
  ),
  // 行 9:缺图(源 Excel 无 PNG,UI 降级)
  product(
    "9X",
    9,
    "双层脚垫",
    "双层脚垫",
    "地板脚垫",
    "missing",
    missingImage("9X", "双层脚垫"),
  ),
  product(
    "9X",
    10,
    "外置门槛条",
    "外置门槛条",
    "门槛防护",
    "matched",
    matchedImage("9X", 10, "外置门槛条"),
  ),
  product(
    "9X",
    11,
    "主副驾座椅防踢垫+脚踏套",
    "主副驾座椅防踢垫+脚踏套",
    "内饰保护",
    "matched",
    matchedImage("9X", 11, "主副驾座椅防踢垫+脚踏套"),
  ),
  // 行 12:清洗 `冰箱垃圾桶   按压款` → `冰箱垃圾桶按压款`
  product(
    "9X",
    12,
    "冰箱垃圾桶按压款",
    "冰箱垃圾桶   按压款",
    "内饰便利",
    "matched",
    matchedImage("9X", 12, "冰箱垃圾桶按压款"),
  ),
  product(
    "9X",
    13,
    "底盘护板",
    "底盘护板",
    "底盘防护",
    "matched",
    matchedImage("9X", 13, "底盘护板"),
  ),
  product(
    "9X",
    14,
    "三段式方向盘",
    "三段式方向盘",
    "内饰升级",
    "matched",
    matchedImage("9X", 14, "三段式方向盘"),
  ),
  // 行 15:源 `后备箱储物.png` 与 PRD 命名 `后备箱储物盒` 差异,需业务核对
  product(
    "9X",
    15,
    "后备箱储物盒",
    "后备箱储物",
    "尾箱收纳",
    "pending-review",
    pendingReviewImage("9X", "后备箱储物盒"),
  ),
  product(
    "9X",
    16,
    "电动踏板盖",
    "电动踏板盖",
    "电动踏板配件",
    "matched",
    matchedImage("9X", 16, "电动踏板盖"),
  ),

  // ===== 8X — 6 款(PRD §6.3 行 1-6)=====
  // 行 1 源文件名 `尾箱垫 7件套` 含 1 空格,清洗为 `尾箱垫7件套`
  product(
    "8X",
    1,
    "尾箱垫7件套",
    "尾箱垫 7件套",
    "尾箱防护",
    "matched",
    matchedImage("8X", 1, "尾箱垫7件套"),
  ),
  // 行 2 源文件名 `挡泥板+内衬  6件套` 含 2 空格,清洗为 `挡泥板+内衬6件套`
  product(
    "8X",
    2,
    "挡泥板+内衬6件套",
    "挡泥板+内衬  6件套",
    "挡泥板/内衬",
    "matched",
    matchedImage("8X", 2, "挡泥板+内衬6件套"),
  ),
  product(
    "8X",
    3,
    "门槛条10件套",
    "门槛条10件套",
    "门槛防护",
    "matched",
    matchedImage("8X", 3, "门槛条10件套"),
  ),
  product(
    "8X",
    4,
    "冰箱防踢垃圾桶",
    "冰箱防踢垃圾桶",
    "内饰便利",
    "matched",
    matchedImage("8X", 4, "冰箱防踢垃圾桶"),
  ),
  product(
    "8X",
    5,
    "尾门防刮面板1件套",
    "尾门防刮面板1件套",
    "尾门防护",
    "matched",
    matchedImage("8X", 5, "尾门防刮面板1件套"),
  ),
  product(
    "8X",
    6,
    "三段式方向盘套",
    "三段式方向盘套",
    "内饰保护",
    "matched",
    matchedImage("8X", 6, "三段式方向盘套"),
  ),

  // ===== 009 — 1 款(PRD §6.4 行 1)=====
  // 源文件名 `1-borad.png` 是 `board` 拼写错误,产品全名「地板+尾箱地板」
  product(
    "009",
    1,
    "地板+尾箱地板",
    "1-borad",
    "地板尾箱",
    "matched",
    matchedImage("009", 1, "地板+尾箱地板"),
  ),
];

// ---- 按车型分组(按 orderInModel 升序)----

export const zeekrProductsByModel: Record<ZeekrModel, ZeekrProduct[]> = {
  "9X": zeekrProducts
    .filter((p) => p.model === "9X")
    .sort((a, b) => a.orderInModel - b.orderInModel),
  "8X": zeekrProducts
    .filter((p) => p.model === "8X")
    .sort((a, b) => a.orderInModel - b.orderInModel),
  "009": zeekrProducts
    .filter((p) => p.model === "009")
    .sort((a, b) => a.orderInModel - b.orderInModel),
};

// ---- 车型展示标签(用于 Hero 锚点导航)----

export const zeekrModelLabel: Record<ZeekrModel, string> = {
  "9X": "极氪 9X",
  "8X": "极氪 8X",
  "009": "极氪 009",
};

export const zeekrModelSubdir: Record<ZeekrModel, string> = {
  "9X": "9x",
  "8X": "8x",
  "009": "009",
};

// ---- 页面元数据(PRD §12 字面量)----

export const zeekrTopicMeta: ZeekrTopicMeta = {
  title: "极氪改装专题",
  description:
    "覆盖极氪 9X、极氪 8X、极氪 009 三款车型共 23 款改装配件,按车型适配,座舱与尾箱统一升级,防护与便利并重。",
  totalProducts: 23,
  totalModels: 3,
  previewImage: "/images/products/zeekr/preview.png",
  ogImage: "/images/products/zeekr/preview.png",
};
