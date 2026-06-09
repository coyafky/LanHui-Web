import Link from "next/link";
import { ArrowRight, Settings, ShieldCheck, MapPin } from "lucide-react";
import { brand } from "@/lib/brand";

const SERVICES = [
  {
    icon: Settings,
    title: "轻改装备",
    description:
      "电动踏板、轮毂升级、底盘升级等服务，覆盖家用 SUV / MPV / 越野等常见车型。",
    href: "/product",
    accent: "blue",
  },
  {
    icon: ShieldCheck,
    title: "汽车膜系",
    description:
      "汽车窗膜、改色膜、隐形车衣，围绕隔热、隐私、漆面保护与颜色个性化。",
    href: "/product/window-film",
    accent: "orange",
  },
  {
    icon: MapPin,
    title: "顺德大良店",
    description:
      "到店咨询、车型确认、方案推荐与施工交付，当前唯一的线下服务中心。",
    href: "/agent",
    accent: "yellow",
  },
];

const ACCENT_MAP: Record<string, string> = {
  blue: "from-blue-500/30 to-blue-700/10 border-blue-800/40 text-blue-300",
  orange: "from-orange-500/30 to-orange-700/10 border-orange-800/40 text-orange-300",
  yellow: "from-yellow-500/30 to-yellow-700/10 border-yellow-800/40 text-yellow-300",
};

export function CoreServices() {
  return (
    <section className="py-20 bg-black border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-sm tracking-widest text-blue-400 mb-3">SERVICES</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">核心服务</h2>
          <p className="text-lg text-zinc-400">
            从轻改装备到汽车膜系，再到线下交付，蓝辉轻改提供一站式升级路径。
          </p>
        </div>

        {/* Service grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {SERVICES.map(({ icon: Icon, title, description, href, accent }) => {
            const accentClass = ACCENT_MAP[accent]!;
            return (
              <Link
                key={title}
                href={href}
                className="group block bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all duration-300"
              >
                <div
                  className={`h-32 bg-gradient-to-br ${accentClass} border-b flex items-center justify-center`}
                >
                  <Icon className="w-12 h-12" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                  <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                    {description}
                  </p>
                  <span className="text-orange-400 font-medium text-sm flex items-center">
                    了解更多
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Tail callout: only Shunde Daliang store is real */}
        <p className="mt-10 text-center text-sm text-zinc-500">
          门店网络建设中，当前以 {brand.currentStore} 为服务中心，更多城市门店陆续开放中。
        </p>
      </div>
    </section>
  );
}
