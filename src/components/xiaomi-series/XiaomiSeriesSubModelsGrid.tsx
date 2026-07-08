import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type XiaomiSeriesSubModel = {
  modelKey: "SU7" | "YU7";
  navLabel: string;
  modelName: string;
  canonicalPath: string;
  projectCount: number;
  hero: string;
  image: {
    publicPath: string;
    alt: string;
    width: number;
    height: number;
  };
};

type XiaomiSeriesSubModelsGridProps = {
  subModels: readonly XiaomiSeriesSubModel[];
};

const SUB_MODEL_LENGTH = 2;

function assertSubModelLength(subModels: readonly XiaomiSeriesSubModel[]): void {
  if (subModels.length !== SUB_MODEL_LENGTH) {
    throw new Error(
      `XiaomiSeriesSubModelsGrid expects ${SUB_MODEL_LENGTH} sub-models, got ${subModels.length}`,
    );
  }
}

export function XiaomiSeriesSubModelsGrid({
  subModels,
}: XiaomiSeriesSubModelsGridProps) {
  assertSubModelLength(subModels);

  return (
    <section className="py-16 md:py-20 bg-black border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-orange-400 mb-3">
            BY MODEL
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            按车型找升级方案
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            2 个车型，分别整理专属项目清单与组合方案
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {subModels.map((m) => (
            <article
              key={m.modelKey}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-zinc-950 border-b border-zinc-800">
                <Image
                  src={m.image.publicPath}
                  alt={m.image.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-contain p-2"
                />
              </div>
              <div className="p-5 flex flex-col gap-3 flex-1">
                <Badge
                  variant="outline"
                  className="border-orange-700/60 text-orange-400 bg-orange-950/30 self-start"
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
                  className="inline-flex items-center text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors mt-2"
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
