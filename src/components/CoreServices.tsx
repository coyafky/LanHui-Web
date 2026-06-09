import Link from "next/link";
import { ArrowRight, Boxes, Layers, ShieldCheck } from "lucide-react";
import { brand } from "@/lib/brand";

const SERVICES = [
  {
    icon: Boxes,
    title: "轻改方案库",
    description:
      "电动踏板、轮毂升级、底盘装甲，6大产品线覆盖外观个性化到功能实用性的全场景需求。",
    href: "/product",
    accent: "blue",
  },
  {
    icon: Layers,
    title: "车身膜专业服务",
    description:
      "隐形车衣、改色膜、隐私窗膜，采用进口TPU基材，专业无尘施工，防刮耐磨自修复。",
    href: "/product/window-film",
    accent: "orange",
  },
  {
    icon: ShieldCheck,
    title: "品质与质保",
    description:
      "专业技师持证上岗，施工全程记录，官方质保系统覆盖所有服务项目，售后无忧。",
    href: "/brand",
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
            从轻改方案到车身膜专业服务，再到品质质保，蓝辉轻改为每次升级保驾护航。
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
