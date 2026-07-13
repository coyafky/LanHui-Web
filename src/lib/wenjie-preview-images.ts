export type WenjiePreviewImageStatus = "real" | "product-preview" | "missing";

export type WenjiePreviewImageWidth = 1448;
export type WenjiePreviewImageHeight = 1086;
export type WenjiePreviewImageAspectRatio = "4/3";

export type WenjiePreviewImage = {
  publicPath: string | null;
  alt: string;
  width: WenjiePreviewImageWidth;
  height: WenjiePreviewImageHeight;
  aspectRatio: WenjiePreviewImageAspectRatio;
};

export type WenjiePreviewImageFields = {
  imageStatus: WenjiePreviewImageStatus;
  image: WenjiePreviewImage;
};

export const WENJIE_PREVIEW_IMAGE_WIDTH: WenjiePreviewImageWidth = 1448;
export const WENJIE_PREVIEW_IMAGE_HEIGHT: WenjiePreviewImageHeight = 1086;
export const WENJIE_PREVIEW_IMAGE_ASPECT_RATIO: WenjiePreviewImageAspectRatio = "4/3";

export type WenjieModelCategory = "M6" | "M7" | "M8";

export function buildWenjieMissingPreviewImage(
  name: string,
): WenjiePreviewImageFields {
  return {
    imageStatus: "missing",
    image: {
      publicPath: null,
      alt: `问界 ${name} 产品图待补充`,
      width: WENJIE_PREVIEW_IMAGE_WIDTH,
      height: WENJIE_PREVIEW_IMAGE_HEIGHT,
      aspectRatio: WENJIE_PREVIEW_IMAGE_ASPECT_RATIO,
    },
  };
}

export function buildWenjieProductPreviewImage(
  key: string,
  name: string,
  modelCategory?: WenjieModelCategory,
): WenjiePreviewImageFields {
  const publicPath = modelCategory
    ? `/images/products/wenjie/${modelCategory}/generated/${key}.webp`
    : `/images/products/wenjie/generated/${key.replace(/^wenjie-/, "")}.webp`;
  return {
    imageStatus: "product-preview",
    image: {
      publicPath,
      alt: `问界 ${name} 商品预览效果图`,
      width: WENJIE_PREVIEW_IMAGE_WIDTH,
      height: WENJIE_PREVIEW_IMAGE_HEIGHT,
      aspectRatio: WENJIE_PREVIEW_IMAGE_ASPECT_RATIO,
    },
  };
}

export const wenjieSeriesHeroImage: WenjiePreviewImage = {
  publicPath: "/images/products/wenjie/generated/series-hero.webp",
  alt: "问界系列轻改商品预览效果图",
  width: WENJIE_PREVIEW_IMAGE_WIDTH,
  height: WENJIE_PREVIEW_IMAGE_HEIGHT,
  aspectRatio: WENJIE_PREVIEW_IMAGE_ASPECT_RATIO,
};

export function getWenjieModelHeroImage(
  modelKey: WenjieModelCategory,
): WenjiePreviewImage {
  return {
    publicPath: `/images/products/wenjie/${modelKey}/generated/hero.webp`,
    alt: `问界 ${modelKey} 轻改商品预览效果图`,
    width: WENJIE_PREVIEW_IMAGE_WIDTH,
    height: WENJIE_PREVIEW_IMAGE_HEIGHT,
    aspectRatio: WENJIE_PREVIEW_IMAGE_ASPECT_RATIO,
  };
}
