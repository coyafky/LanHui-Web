/**
 * VehicleSilhouette — 车辆侧影 SVG inline
 *
 * 用于 ProductHero，避免使用 emoji 或图片位图。
 * 三种 variant 覆盖主站三类车型视觉：suv / sedan / mpv。
 */

type Variant = "suv" | "sedan" | "mpv";

type Props = {
  className?: string;
  variant?: Variant;
};

const VIEW_BOX = "0 0 800 320";

// 三种 variant 的车身轮廓 (x,y path)，用 800x320 视口
const BODY_PATHS: Record<Variant, string> = {
  // SUV — 高大方正
  suv: "M 80 220 L 130 140 L 220 100 L 380 80 L 540 90 L 640 130 L 720 180 L 720 230 L 80 230 Z",
  // 轿车 — 低矮流线
  sedan: "M 80 230 L 140 200 L 200 170 L 360 150 L 540 160 L 640 180 L 720 210 L 720 235 L 80 235 Z",
  // MPV — 高大方正偏厢式
  mpv: "M 80 220 L 110 130 L 200 95 L 580 95 L 660 110 L 720 160 L 720 230 L 80 230 Z",
};

const WINDOW_PATHS: Record<Variant, string> = {
  suv: "M 200 130 L 380 110 L 540 115 L 620 145 L 620 175 L 200 175 Z",
  sedan: "M 200 195 L 350 170 L 540 175 L 620 190 L 620 205 L 200 210 Z",
  mpv: "M 180 130 L 580 115 L 640 135 L 640 175 L 180 175 Z",
};

const WHEEL_X: Record<Variant, [number, number]> = {
  suv: [200, 600],
  sedan: [210, 590],
  mpv: [195, 605],
};

export function VehicleSilhouette({ className, variant = "suv" }: Props) {
  const body = BODY_PATHS[variant];
  const window = WINDOW_PATHS[variant];
  const [wheel1, wheel2] = WHEEL_X[variant];

  return (
    <svg
      viewBox={VIEW_BOX}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={`${variant} 车辆侧影`}
    >
      <defs>
        <linearGradient id="vehicleBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="55%" stopColor="currentColor" stopOpacity="0.7" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="vehicleWindow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0e7490" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="vehicleHighlight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="40%" stopColor="white" stopOpacity="0.18" />
          <stop offset="80%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 车身主体 */}
      <path d={body} fill="url(#vehicleBody)" stroke="currentColor" strokeWidth="1" />
      {/* 车身高光 */}
      <path d={body} fill="url(#vehicleHighlight)" />
      {/* 车窗 */}
      <path d={window} fill="url(#vehicleWindow)" />
      {/* 车轮 — 轮胎 */}
      <circle cx={wheel1} cy="240" r="34" fill="currentColor" />
      <circle cx={wheel2} cy="240" r="34" fill="currentColor" />
      {/* 车轮 — 轮毂 */}
      <circle cx={wheel1} cy="240" r="18" fill="#09090b" />
      <circle cx={wheel2} cy="240" r="18" fill="#09090b" />
      <circle cx={wheel1} cy="240" r="10" fill="currentColor" />
      <circle cx={wheel2} cy="240" r="10" fill="currentColor" />
      {/* 地面 */}
      <line x1="40" y1="280" x2="760" y2="280" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      <line x1="40" y1="284" x2="760" y2="284" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" />
    </svg>
  );
}
