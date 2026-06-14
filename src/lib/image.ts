/**
 * 前台图片辅助函数（PRD §7.3）
 *
 * 注意：本文件独立于 src/lib/images.ts（ImageAsset 注册表）。
 * 该文件专门为「实体字段 → 渲染路径」服务。
 *
 * 优先级（本期）：
 *   getStoreImage: imagePath（新）→ imageUrl（过渡）→ 占位图
 *   getCityImage:  复用 provinceImageUrl → 全国默认占位图
 */

export const PLACEHOLDER_PATHS = {
  store: "/images/placeholders/store.webp",
  province: "/images/placeholders/province.webp",
} as const;

/**
 * 解析门店主图路径。
 * 优先级：imagePath（新字段）→ imageUrl（过渡期）→ 占位图。
 */
export function getStoreImage(store: {
  imagePath?: string | null;
  imageUrl?: string | null;
}): string {
  return (
    store.imagePath ||
    store.imageUrl ||
    PLACEHOLDER_PATHS.store
  );
}

/**
 * 解析城市页/城市列表的封面图。
 * 城市本身不持有图片字段，复用 Province 的图片。
 */
export function getCityImage(
  _city: unknown,
  provinceImageUrl: string | null,
): string {
  return provinceImageUrl || PLACEHOLDER_PATHS.province;
}
