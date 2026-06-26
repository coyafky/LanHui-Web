import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type WenjieSeriesSubModel = {
  modelKey: "M6" | "M7" | "M8";
  navLabel: string;
  modelName: string;
  canonicalPath: string;
  projectCount: number;
  hero: string;
};

type WenjieSeriesSubModelsGridProps = {
  subModels: readonly WenjieSeriesSubModel[];
};

const SUB_MODEL_LENGTH = 3;

function assertSubModelLength(subModels: readonly WenjieSeriesSubModel[]): void {
  if (subModels.length !== SUB_MODEL_LENGTH) {
    throw new Error(
      `WenjieSeriesSubModelsGrid expects ${SUB_MODEL_LENGTH} sub-models, got ${subModels.length}`,
    );
  }
}

/**
 * 3 子车型卡片（PRD §10）
 * 每卡：4:3 图占位 + H3 + 数量 Badge + 简短 hero + 跳子页 CTA
 */
export function WenjieSeriesSubModelsGrid({ subModels }: WenjieSeriesSubModelsGridProps) {
  assertSubModelLength(subModels);

  return (
    <section className="py-16 md:py-20 bg-black border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-cyan-400 mb-3">
            BY MODEL
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            按车型找升级方案
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            3 个车型，分别整理专属项目清单与组合方案
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {subModels.map((m) => (
            <article
              key={m.modelKey}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col"
            >
              <div
                role="img"
                aria-label={`${m.modelName} 升级款式预览图`}
                className="relative aspect-[4/3] bg-zinc-950 border-b border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-500"
              >
                <ImageIcon className="w-8 h-8 mb-2" aria-hidden />
                <p className="text-xs">{m.modelName} 升级款式预览图待补</p>
              </div>
              <div className="p-5 flex flex-col gap-3 flex-1">
                <Badge
                  variant="outline"
                  className="border-cyan-700/60 text-cyan-400 bg-cyan-950/30 self-start"
                >
                  {m.projectCount} 个升级项目
                </Badge>
                <h3 className="text-lg font-bold text-white">
                  {m.modelName} 专属升级方案
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed flex-1">
                  {m.hero}
                </p>
                <Link
                  href={m.canonicalPath}
                  className="inline-flex items-center text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors mt-2"
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