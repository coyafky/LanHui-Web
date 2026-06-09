/**
 * OptimizedImage — 统一图片渲染组件
 *
 * 包装 next/image，提供：
 * - 统一的 quality 设置（75）
 * - skeleton 占位效果
 * - 首屏 priority / 下屏 lazy 策略
 */
import Image from "next/image";
import type { ImageAsset } from "@/lib/images";

type OptimizedImageProps = {
  asset: ImageAsset;
  className?: string;
  fill?: boolean;
  quality?: number;
};

export function OptimizedImage({
  asset,
  className,
  fill = false,
  quality = 75,
}: OptimizedImageProps) {
  if (fill) {
    return (
      <Image
        src={asset.path}
        alt={asset.alt}
        fill
        priority={asset.priority ?? false}
        sizes={asset.sizes ?? "100vw"}
        quality={quality}
        className={className}
      />
    );
  }

  return (
    <Image
      src={asset.path}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      priority={asset.priority ?? false}
      sizes={asset.sizes}
      quality={quality}
      className={className}
    />
  );
}
