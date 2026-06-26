import { ImageIcon } from "lucide-react";

/**
 * 小鹏 GX 单车型轻改项目 · 海报空态（Server Component）
 * SPEC §4：海报 1055 × 1491 竖版, 4:5 比例, max-w-md 避免 mobile 横滚
 * 不引用 next/image / png / jpg —— 业务后续补图
 */
export function XpengGxPosterStub() {
  return (
    <section
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900"
      aria-labelledby="xpeng-gx-poster-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-emerald-400 mb-3">
            POSTER · 1055 × 1491
          </p>
          <h2
            id="xpeng-gx-poster-heading"
            className="text-2xl md:text-3xl font-bold text-white"
          >
            小鹏 GX 轻改项目 · 海报展示
          </h2>
          <p className="text-zinc-400 text-sm md:text-base mt-3 max-w-2xl mx-auto">
            海报原图待业务补充，规格 1055 × 1491（4:5 竖版）
          </p>
        </div>

        <div className="flex justify-center">
          <figure className="w-full max-w-md flex flex-col gap-3">
            <div
              role="img"
              aria-label="小鹏 GX 轻改项目海报 · 待补充（1055 × 1491）"
              className="relative aspect-[4/5] bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-500 p-6"
            >
              <ImageIcon
                className="w-16 h-16 text-zinc-700 mb-4"
                aria-hidden
              />
              <p className="text-sm text-zinc-400 font-medium text-center">
                小鹏 GX 轻改项目 · 海报待补充
              </p>
              <p className="text-xs text-zinc-600 mt-2 text-center">
                1055 × 1491
              </p>
            </div>
            <figcaption className="text-xs text-zinc-500 text-center">
              海报原图 · 业务方补充后展示
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}