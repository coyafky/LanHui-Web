import { Shield, Award, BadgeCheck } from "lucide-react";

const FEATURES = [
  {
    icon: Shield,
    title: "专业工艺标准",
    description:
      "持证技师团队，标准化施工流程，每一步都有品控标准，确保改装品质与安全。",
    color: "blue",
  },
  {
    icon: Award,
    title: "优质材料保障",
    description:
      "严选进口基材，TPU隐形车衣防刮自修复，窗膜隔热率≥60%，品质看得见。",
    color: "orange",
  },
  {
    icon: BadgeCheck,
    title: "官方质保承诺",
    description:
      "官方质保体系，施工全程记录可追溯，售后无忧，让您放心选择。",
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
            从工艺标准到材料品质，再到官方质保——层层保障，让每次升级更安心。
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
