"use client";

import { Phone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { trackClick } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

type PhoneCtaProps = {
  /**
   * 来源标识，用于 analytics 埋点；规范为 "xiaomi_topic_hero" /
   * "xiaomi_product_consult_click" 等 snake_case。
   */
  source: string;
  label?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
  /** 附加 metadata，会合并进埋点 */
  metadata?: Record<string, unknown>;
};

/**
 * 电话咨询 CTA。
 *
 * 行为：
 *   - 当 brand.phoneTel 是 "tel:" 开头时渲染可点击链接 + 埋点。
 *   - 否则（当前默认 "#contact"）降级为禁用按钮 + "电话待补充" 提示，
 *     不触发埋点，避免误统计。
 */
export function PhoneCta({
  source,
  label = "电话咨询",
  variant = "default",
  size = "default",
  className,
  metadata,
}: PhoneCtaProps) {
  const telHref = brand.phoneTel;
  const isReady = telHref.startsWith("tel:");

  if (!isReady) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="电话待补充"
        className={cn(
          buttonVariants({ variant: "outline", size }),
          "cursor-not-allowed opacity-60",
          className,
        )}
      >
        <Phone className="w-4 h-4 mr-2" />
        电话待补充
      </button>
    );
  }

  return (
    <a
      href={telHref}
      aria-label={`${label}：${brand.phone}`}
      onClick={() => trackClick(source, metadata)}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      <Phone className="w-4 h-4 mr-2" />
      {label}
    </a>
  );
}