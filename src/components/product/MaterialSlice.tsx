/**
 * MaterialSlice — 4 个材质切片（车衣/窗膜/轮毂/踏板）
 *
 * 用于 ProductHero，把抽象的"汽车轻改"翻译成具体可感知的材质：
 * - ppf (隐形车衣): 半透明反光膜片
 * - window-film (汽车窗膜): 光线透射效果
 * - wheel (轮毂升级): 金属结构线
 * - step (电动踏板): 安装位结构
 *
 * 每个 slice 是纯 RSC，hover 动效由外层 ProductHero 的 group-hover 触发。
 */

import { Shield, Sun, CircleDot, Wrench } from "lucide-react";

export type MaterialKey = "ppf" | "window-film" | "wheel" | "step";

type Slice = {
  key: MaterialKey;
  title: string;
  subtitle: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  Icon: typeof Shield;
};

const SLICES: readonly Slice[] = [
  {
    key: "ppf",
    title: "隐形车衣",
    subtitle: "漆面保护 · 半透明反光膜",
    accentText: "text-cyan-300",
    accentBg: "bg-cyan-950/30",
    accentBorder: "border-cyan-800/40",
    Icon: Shield,
  },
  {
    key: "window-film",
    title: "汽车窗膜",
    subtitle: "隔热防晒 · 光线透射",
    accentText: "text-blue-300",
    accentBg: "bg-blue-950/30",
    accentBorder: "border-blue-800/40",
    Icon: Sun,
  },
  {
    key: "wheel",
    title: "轮毂升级",
    subtitle: "金属结构 · 姿态匹配",
    accentText: "text-orange-300",
    accentBg: "bg-orange-950/30",
    accentBorder: "border-orange-800/40",
    Icon: CircleDot,
  },
  {
    key: "step",
    title: "电动踏板",
    subtitle: "高底盘上下车 · 安装位",
    accentText: "text-amber-300",
    accentBg: "bg-amber-950/30",
    accentBorder: "border-amber-800/40",
    Icon: Wrench,
  },
] as const;

type Props = {
  sliceKey: MaterialKey;
  href?: string;
};

export function MaterialSlice({ sliceKey, href }: Props) {
  const slice = SLICES.find((s) => s.key === sliceKey);
  if (!slice) return null;
  const { Icon } = slice;

  if (href) {
    return <MaterialSliceLink slice={slice} href={href} Icon={Icon} />;
  }
  return <MaterialSliceWrapper slice={slice} Icon={Icon} />;
}

function MaterialSliceWrapper({
  slice,
  Icon,
}: {
  slice: Slice;
  Icon: typeof Shield;
}) {
  return (
    <div
      className={`group/slice relative rounded-xl border ${slice.accentBorder} ${slice.accentBg} p-3 md:p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/30`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-lg ${slice.accentBg} border ${slice.accentBorder} flex items-center justify-center`}
        >
          <Icon className={`w-4 h-4 ${slice.accentText}`} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${slice.accentText}`}>{slice.title}</p>
          <p className="text-xs text-zinc-500 mt-0.5 leading-tight">{slice.subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function MaterialSliceLink({
  slice,
  Icon,
  href,
}: {
  slice: Slice;
  Icon: typeof Shield;
  href: string;
}) {
  return (
    <a
      href={href}
      className={`group/slice relative block rounded-xl border ${slice.accentBorder} ${slice.accentBg} p-3 md:p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/30`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-lg ${slice.accentBg} border ${slice.accentBorder} flex items-center justify-center transition-transform duration-300 group-hover/slice:rotate-3`}
        >
          <Icon className={`w-4 h-4 ${slice.accentText}`} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${slice.accentText}`}>{slice.title}</p>
          <p className="text-xs text-zinc-500 mt-0.5 leading-tight">{slice.subtitle}</p>
        </div>
      </div>
    </a>
  );
}

export const ALL_MATERIAL_SLICES = SLICES;
