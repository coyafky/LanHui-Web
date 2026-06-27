import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type LiAutoSeriesSubModel = {
  modelKey: "one" | "i8" | "L9" | "MEGA";
  navLabel: string;
  modelName: string;
  canonicalPath: string;
  projectCount: number;
  hero: string;
  isPlanned: boolean;
};

type LiAutoSeriesSubModelsGridProps = {
  subModels: readonly LiAutoSeriesSubModel[];
};

const SUB_MODEL_LENGTH = 4;

function assertSubModelLength(subModels: readonly LiAutoSeriesSubModel[]): void {
  if (subModels.length !== SUB_MODEL_LENGTH) {
    throw new Error(
      `LiAutoSeriesSubModelsGrid expects ${SUB_MODEL_LENGTH} sub-models, got ${subModels.length}`,
    );
  }
}

/**
 * 3 子车型卡片（PRD §10）
 * 每卡：H3 + 数量 Badge + 简短 hero + 跳子页 CTA
 * i8 为 planned 状态，展示为灰色样式
 */
export function LiAutoSeriesSubModelsGrid({ subModels }: LiAutoSeriesSubModelsGridProps) {
  assertSubModelLength(subModels);

  return (
    <section className="py-16 md:py-20 bg-black border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-amber-400 mb-3">
            BY MODEL
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            按车型找升级方案
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            4 个车型，分别整理专属项目清单与组合方案
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {subModels.map((m) => (
            <article
              key={m.modelKey}
              className={`rounded-2xl border overflow-hidden flex flex-col ${
                m.isPlanned
                  ? "bg-zinc-900/50 border-zinc-800/50"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <div className={`relative aspect-[4/3] border-b ${
                m.isPlanned
                  ? "bg-zinc-950/50 border-zinc-800/30"
                  : "bg-zinc-950 border-zinc-800"
              }`}>
                <div
                  role="img"
                  aria-label={`${m.modelName} 升级款式功能预览图`}
                  className={`absolute inset-0 ${
                    m.isPlanned
                      ? "bg-gradient-to-br from-zinc-800/30 via-zinc-950 to-zinc-900"
                      : "bg-gradient-to-br from-amber-950/30 via-zinc-950 to-zinc-900"
                  }`}
                />
              </div>
              <div className="p-5 flex flex-col gap-3 flex-1">
                <Badge
                  variant="outline"
                  className={`self-start ${
                    m.isPlanned
                      ? "border-zinc-700/60 text-zinc-500 bg-zinc-950/30"
                      : "border-amber-700/60 text-amber-400 bg-amber-950/30"
                  }`}
                >
                  {m.projectCount} 个升级项目
                  {m.isPlanned && <span className="ml-2 text-[10px]">整理中</span>}
                </Badge>
                <h3 className="text-lg font-bold text-white">
                  {m.modelName} 专属升级方案
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed flex-1">
                  {m.hero}
                </p>
                {m.isPlanned ? (
                  <span className="inline-flex items-center text-sm font-medium text-zinc-500 mt-2">
                    整理中，敬请期待
                  </span>
                ) : (
                  <Link
                    href={m.canonicalPath}
                    className="inline-flex items-center text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors mt-2"
                  >
                    进入{m.modelName}子页
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
