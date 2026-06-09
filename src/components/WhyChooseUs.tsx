import { Wrench, MapPin, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: Wrench,
    title: "轻改方案整合",
    description:
      "电动踏板、轮毂、底盘、车身膜一站式搭配，避免在不同门店之间反复沟通。",
    color: "blue",
  },
  {
    icon: MapPin,
    title: "本地门店交付",
    description:
      "以顺德大良店为服务中心，提供到店沟通、车型确认、方案推荐与施工交付。",
    color: "orange",
  },
  {
    icon: Sparkles,
    title: "兼顾颜值与实用",
    description:
      "不只追求外观，也关注上下车便利、行驶姿态、漆面保护与日常用车舒适。",
    color: "yellow",
  },
];

const COLOR_MAP: Record<string, { ring: string; bg: string; text: string }> = {
  blue: {
    ring: "border-blue-800/50",
    bg: "bg-blue-950/50",
    text: "text-blue-400",
  },
  orange: {
    ring: "border-orange-800/50",
    bg: "bg-orange-950/50",
    text: "text-orange-400",
  },
  yellow: {
    ring: "border-yellow-800/50",
    bg: "bg-yellow-950/50",
    text: "text-yellow-400",
  },
};

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-sm tracking-widest text-orange-400 mb-3">WHY LANHUI</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            为什么选择蓝辉轻改？
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            从轻改装备到车身膜服务，蓝辉轻改希望让每一次升级都更清晰、更稳妥。
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {FEATURES.map(({ icon: Icon, title, description, color }) => {
            const palette = COLOR_MAP[color]!;
            return (
              <div
                key={title}
                className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:border-zinc-700 hover:shadow-xl transition-all"
              >
                <div
                  className={`w-14 h-14 ${palette.bg} ${palette.text} rounded-xl flex items-center justify-center mb-6 border ${palette.ring}`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-zinc-400 leading-relaxed">{description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
