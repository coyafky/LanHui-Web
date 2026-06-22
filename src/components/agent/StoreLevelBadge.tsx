import type { StoreLevel } from "@/lib/validations/store";
import { STORE_LEVEL_LABELS } from "@/lib/validations/store";
import { cn } from "@/lib/utils";

/**
 * 公开站门店等级 Badge —— 与 admin /admin/stores 列表配色对齐。
 *
 * 配色（PRD §16 D1 4 等级体系）：
 *   flagship   → amber  (旗舰)
 *   premium    → blue   (尊享)
 *   specialty  → cyan   (专营)
 *   member     → zinc   (会员)
 *
 * 两个变体：
 *   - "card"    在卡片图角标位置（顶右 + 半透明 backdrop-blur）
 *   - "inline"  在文本流内（名称旁 / 标题下）
 *
 * Server Component —— 无交互，SSG 可序列化。
 */
export function StoreLevelBadge({
  level,
  variant = "card",
  className,
}: {
  level: StoreLevel | undefined;
  variant?: "card" | "inline";
  className?: string;
}) {
  const effectiveLevel: StoreLevel = level ?? "flagship";

  const palette: Record<
    StoreLevel,
    { bg: string; text: string; border: string }
  > = {
    flagship: {
      bg: "bg-amber-500/15",
      text: "text-amber-300",
      border: "border-amber-400/30",
    },
    premium: {
      bg: "bg-blue-500/15",
      text: "text-blue-300",
      border: "border-blue-400/30",
    },
    specialty: {
      bg: "bg-cyan-500/15",
      text: "text-cyan-300",
      border: "border-cyan-400/30",
    },
    member: {
      bg: "bg-zinc-500/15",
      text: "text-zinc-300",
      border: "border-zinc-500/40",
    },
  };

  const colors = palette[effectiveLevel];

  if (variant === "inline") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
          colors.bg,
          colors.text,
          colors.border,
          className,
        )}
        aria-label={`门店等级:${STORE_LEVEL_LABELS[effectiveLevel]}`}
      >
        <span
          aria-hidden="true"
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            effectiveLevel === "flagship" && "bg-amber-400",
            effectiveLevel === "premium" && "bg-blue-400",
            effectiveLevel === "specialty" && "bg-cyan-400",
            effectiveLevel === "member" && "bg-zinc-400",
          )}
        />
        {STORE_LEVEL_LABELS[effectiveLevel]}
      </span>
    );
  }

  // card 变体：用于卡片图角标，backdrop-blur 与 LANHUI 角标共存
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold backdrop-blur-sm",
        colors.bg,
        colors.text,
        colors.border,
        className,
      )}
      aria-label={`门店等级:${STORE_LEVEL_LABELS[effectiveLevel]}`}
    >
      {STORE_LEVEL_LABELS[effectiveLevel]}
    </span>
  );
}