/**
 * 蓝辉轻改图片资产注册表
 *
 * Phase 1：定义资产结构和占位路径。
 * Phase 2：替换为真实图片后，更新 width/height 为实际值。
 */

export type ImageAsset = {
  path: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  sizes?: string;
};

/** 首页图片资产 */
export const homeImages = {
  hero: {
    path: "/images/home/hero.png",
    alt: "蓝辉轻改 新能源汽车轻改装",
    width: 1920,
    height: 1080,
    priority: true,
    sizes: "100vw",
  },
  product: {
    path: "/images/home/product.png",
    alt: "产品中心",
    width: 800,
    height: 600,
    sizes: "(max-width: 768px) 100vw, 33vw",
  },
} satisfies Record<string, ImageAsset>;

/** 产品图片资产 */
export const productImages: Record<string, ImageAsset> = {
  "electric-steps": {
    path: "/images/products/electric-steps.png",
    alt: "电动踏板",
    width: 1200,
    height: 800,
    sizes: "(max-width: 768px) 100vw, 50vw",
  },
  wheels: {
    path: "/images/products/wheels.png",
    alt: "轮毂升级",
    width: 1200,
    height: 800,
    sizes: "(max-width: 768px) 100vw, 50vw",
  },
  chassis: {
    path: "/images/products/chassis.png",
    alt: "底盘装甲",
    width: 1200,
    height: 800,
    sizes: "(max-width: 768px) 100vw, 50vw",
  },
  "window-film": {
    path: "/images/products/window-film.png",
    alt: "汽车窗膜",
    width: 1200,
    height: 800,
    sizes: "(max-width: 768px) 100vw, 50vw",
  },
  "color-film": {
    path: "/images/products/color-film.png",
    alt: "改色膜",
    width: 1200,
    height: 800,
    sizes: "(max-width: 768px) 100vw, 50vw",
  },
  ppf: {
    path: "/images/products/ppf.png",
    alt: "隐形车衣",
    width: 1200,
    height: 800,
    sizes: "(max-width: 768px) 100vw, 50vw",
  },
};

/** 品牌图片资产 */
export const brandImages = {
  about: {
    path: "/images/brand/about_lanhui.png",
    alt: "关于蓝辉轻改",
    width: 1200,
    height: 800,
    sizes: "(max-width: 768px) 100vw, 50vw",
  },
} satisfies Record<string, ImageAsset>;

/** 门店图片资产 */
export const storeImages: Record<string, ImageAsset[]> = {
  "shunde-daliang": [
    {
      path: "/images/store/shunde-daliang-1.jpg",
      alt: "蓝辉轻改顺德大良店 外景",
      width: 800,
      height: 600,
      sizes: "(max-width: 768px) 100vw, 50vw",
    },
    {
      path: "/images/store/shunde-daliang-2.jpg",
      alt: "蓝辉轻改顺德大良店 施工区",
      width: 800,
      height: 600,
      sizes: "(max-width: 768px) 100vw, 50vw",
    },
  ],
};

/** 资质证书图片 */
export const certImages: ImageAsset[] = Array.from({ length: 6 }, (_, i) => ({
  path: `/images/cert/cert_${i + 1}.jpg`,
  alt: `蓝辉轻改资质证书 ${i + 1}`,
  width: 600,
  height: 400,
  sizes: "(max-width: 768px) 50vw, 33vw",
}));

/**
 * 根据 ImageAsset 生成 next/image 所需的 props
 */
export function getImageProps(asset: ImageAsset) {
  return {
    src: asset.path,
    alt: asset.alt,
    width: asset.width,
    height: asset.height,
    priority: asset.priority ?? false,
    sizes: asset.sizes,
  };
}
