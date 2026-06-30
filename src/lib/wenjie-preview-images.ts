export type WenjiePreviewImageStatus = "real" | "generated-preview" | "missing";

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

export function buildWenjieGeneratedPreviewImage(
  key: string,
  name: string,
  modelCategory?: WenjieModelCategory,
): WenjiePreviewImageFields {
  const publicPath = modelCategory
    ? `/images/products/wenjie/${modelCategory}/generated/${key}.png`
    : null;
  return {
    imageStatus: "generated-preview",
    image: {
      publicPath,
      alt: `问界 ${name} 功能预览图`,
      width: WENJIE_PREVIEW_IMAGE_WIDTH,
      height: WENJIE_PREVIEW_IMAGE_HEIGHT,
      aspectRatio: WENJIE_PREVIEW_IMAGE_ASPECT_RATIO,
    },
  };
}

export const wenjieSeriesHeroImage: WenjiePreviewImage = {
  publicPath: null,
  alt: "问界系列轻改功能预览图",
  width: WENJIE_PREVIEW_IMAGE_WIDTH,
  height: WENJIE_PREVIEW_IMAGE_HEIGHT,
  aspectRatio: WENJIE_PREVIEW_IMAGE_ASPECT_RATIO,
};

export function getWenjieModelHeroImage(
  modelKey: WenjieModelCategory,
): WenjiePreviewImage {
  return {
    publicPath: `/images/products/wenjie/${modelKey}/generated/hero.png`,
    alt: `问界 ${modelKey} 轻改功能预览图`,
    width: WENJIE_PREVIEW_IMAGE_WIDTH,
    height: WENJIE_PREVIEW_IMAGE_HEIGHT,
    aspectRatio: WENJIE_PREVIEW_IMAGE_ASPECT_RATIO,
  };
}
