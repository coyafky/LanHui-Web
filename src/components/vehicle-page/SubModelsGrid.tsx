import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export type SubModelCard = {
  modelKey: string;
  modelName: string;
  canonicalPath: string;
  projectCount: number;
  hero: string;
  image: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
};

interface Props {
  models: readonly SubModelCard[];
  theme?: "orange" | "cyan" | "blue" | "green";
}

const THEME: Record<string, { badge: string; text: string; hover: string }> = {
  orange: { badge: "border-orange-700/60 text-orange-400 bg-orange-950/30", text: "text-orange-400", hover: "hover:text-orange-300" },
  cyan: { badge: "border-cyan-700/60 text-cyan-400 bg-cyan-950/30", text: "text-cyan-400", hover: "hover:text-cyan-300" },
  blue: { badge: "border-blue-700/60 text-blue-400 bg-blue-950/30", text: "text-blue-400", hover: "hover:text-blue-300" },
  green: { badge: "border-emerald-700/60 text-emerald-400 bg-emerald-950/30", text: "text-emerald-400", hover: "hover:text-emerald-300" },
};

export function SubModelsGrid({ models, theme = "orange" }: Props) {
  const t = THEME[theme] ?? THEME.orange;

  return (
    <section className="py-16 md:py-20 bg-black border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-orange-400 mb-3">BY MODEL</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">按车型找升级方案</h2>
          <p className="text-zinc-400 text-sm md:text-base">
            {models.length} 个车型，分别整理专属项目清单与组合方案
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {models.map((m) => (
            <article
              key={m.modelKey}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-zinc-950 border-b border-zinc-800">
                <Image
                  src={m.image.src}
                  alt={m.image.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-contain p-2"
                />
              </div>
              <div className="p-5 flex flex-col gap-3 flex-1">
                <span className={`self-start px-2.5 py-0.5 text-xs rounded-full border ${t.badge}`}>
                  {m.projectCount} 个升级项目
                </span>
                <h3 className="text-lg font-bold text-white">
                  {m.modelName} 专属升级方案
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed flex-1">{m.hero}</p>
                <Link
                  href={m.canonicalPath}
                  className={`inline-flex items-center text-sm font-medium ${t.text} ${t.hover} transition-colors mt-2`}
                >
                  进入{m.modelName}子页
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
