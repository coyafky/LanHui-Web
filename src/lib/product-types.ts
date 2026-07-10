/**
 * 产品数据层共享类型与 helper
 *
 * 消除 ~30 个文件中对 ImageStatus、ProductImage、matchedImage、missingImage 等的重复定义。
 * 各品牌文件只需导入共享类型，保留品牌专属业务类型（category、scenario、tier 等）。
 */

// ── 字面量常量 ──

export const PRODUCT_IMAGE_WIDTH = 1448 as const;
export const PRODUCT_IMAGE_HEIGHT = 1086 as const;
export const PRODUCT_IMAGE_ASPECT_RATIO = "4/3" as const;

// ── 共享图片状态 ──

export type ImageStatus = "matched" | "generated-preview" | "pending-review" | "missing";

// ── 共享图片对象 ──

export interface ProductImage {
  readonly publicPath: string | null;
  readonly alt: string;
  readonly width: 1448 | null;
  readonly height: 1086 | null;
  readonly aspectRatio: "4/3" | null;
}

// ── 图片构建器 ──

export function matchedImage(publicPath: string, alt: string): ProductImage {
  return {
    publicPath,
    alt,
    width: PRODUCT_IMAGE_WIDTH,
    height: PRODUCT_IMAGE_HEIGHT,
    aspectRatio: PRODUCT_IMAGE_ASPECT_RATIO,
  };
}

export function missingImage(alt: string): ProductImage {
  return {
    publicPath: null,
    alt,
    width: null,
    height: null,
    aspectRatio: null,
  };
}

export function productPreviewImage(publicPath: string, alt: string): ProductImage {
  return {
    publicPath,
    alt,
    width: PRODUCT_IMAGE_WIDTH,
    height: PRODUCT_IMAGE_HEIGHT,
    aspectRatio: PRODUCT_IMAGE_ASPECT_RATIO,
  };
}

export function pendingReviewImage(alt: string): ProductImage {
  return {
    publicPath: null,
    alt,
    width: null,
    height: null,
    aspectRatio: null,
  };
}

// ── 通用 helper ──

export function buildProductAlt(
  brand: string,
  model: string,
  product: string,
  kind: string,
): string {
  return `${brand} ${model} ${product} ${kind}`;
}

export function makeProductId(...parts: string[]): string {
  return parts.filter(Boolean).join("-").toLowerCase();
}

export function slugifyProductName(
  name: string,
  overrides?: Record<string, string>,
): string {
  if (overrides && overrides[name] !== undefined) return overrides[name];
  return name
    .replace(/[（）()]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}
