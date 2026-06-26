import { ImageIcon } from "lucide-react";

export type WenjieModelPosterStubProps = {
  modelKey: "M6" | "M7" | "M8";
  modelName: string;
  posters: readonly { key: string; label: string }[];
};

const POSTER_LENGTH = 4;

function assertPosterLength(
  posters: readonly { key: string; label: string }[],
): void {
  if (posters.length !== POSTER_LENGTH) {
    throw new Error(
      `WenjieModelPosterStub expects ${POSTER_LENGTH} posters, got ${posters.length}`,
    );
  }
}

/**
 * 二级页 4 张系列海报空态 — M6 / M7 / M8 共用
 * 2x2 网格，4:5 图占位 + 下方小字
 */
export function WenjieModelPosterStub({
  modelKey,
  modelName,
  posters,
}: WenjieModelPosterStubProps) {
  assertPosterLength(posters);

  return (
    <section
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900"
      aria-labelledby={`wenjie-${modelKey.toLowerCase()}-posters-heading`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-cyan-400 mb-3">
            POSTERS
          </p>
          <h2
            id={`wenjie-${modelKey.toLowerCase()}-posters-heading`}
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            {`${modelName} · 系列海报`}
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            4 张系列主题海报，资产待补
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {posters.map((p) => (
            <figure key={p.key} className="flex flex-col gap-2">
              <div
                role="img"
                aria-label={`${p.label} 待补`}
                className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-900 border border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-500"
              >
                <ImageIcon className="w-10 h-10 mb-2" aria-hidden />
                <p className="text-xs">系列海报 · 待补</p>
              </div>
              <figcaption className="text-xs text-zinc-500 text-center">
                {p.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
