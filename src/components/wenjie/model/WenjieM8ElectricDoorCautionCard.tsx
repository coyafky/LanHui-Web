import { AlertTriangle } from "lucide-react";
import type { WenjieM8UpgradeProject } from "@/lib/wenjie-m8-upgrade-projects";

export type WenjieM8ElectricDoorCautionCardProps = {
  project: WenjieM8UpgradeProject;
};

const FALLBACK_CAUTION = "安装前需确认车辆配置适配性";

/**
 * M8 电动门专属警示卡
 * PRD §10 P0 — 仅在 M8 page 使用，不要 import 到 M6/M7
 * 警示文案从 project.caution 读取；如无则显示 fallback
 */
export function WenjieM8ElectricDoorCautionCard({
  project,
}: WenjieM8ElectricDoorCautionCardProps) {
  const cautionText =
    typeof project.caution === "string" && project.caution.length > 0
      ? project.caution
      : FALLBACK_CAUTION;

  return (
    <aside
      role="note"
      aria-label="电动门升级警示"
      className="border border-amber-500/40 bg-amber-950/20 rounded-2xl p-5 md:p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <AlertTriangle
            className="w-6 h-6 text-amber-400"
            aria-hidden
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs tracking-widest text-amber-300 mb-1.5 uppercase">
            重要提示
          </p>
          <h3 className="text-base md:text-lg font-bold text-white mb-2">
            电动门升级 · 安装前请确认
          </h3>
          <p className="text-sm text-amber-100/90 leading-relaxed mb-3">
            {cautionText}
          </p>
          <p className="text-xs text-amber-200/70">
            {`项目：问界 M8 商务升级 10 · 电动门`}
          </p>
        </div>
      </div>
    </aside>
  );
}
