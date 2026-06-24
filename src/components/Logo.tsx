import Image from "next/image";
import { brand } from "@/lib/brand";

type LogoProps = {
  /**
   * Tailwind class for height. Width is auto-derived from the source aspect ratio
   * (logo.png is 2172×724, ~3:1).
   */
  className?: string;
  /**
   * Mark this logo instance as a high-priority LCP element (e.g. the header).
   * Should only be set for above-the-fold usages.
   */
  priority?: boolean;
};

const LOGO_WIDTH = 2172;
const LOGO_HEIGHT = 724;

export function Logo({ className = "h-10 w-auto", priority = false }: LogoProps) {
  return (
    <Image
      src="/images/logo/lanhui-logo.png"
      alt={`${brand.zh} ${brand.en}`}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      sizes="(max-width: 768px) 160px, 240px"
      className={className}
    />
  );
}
