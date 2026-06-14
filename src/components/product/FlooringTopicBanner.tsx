import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Layers } from "lucide-react";

export function FlooringTopicBanner() {
  return (
    <Link
      href="/product/flooring"
      className="group block bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-amber-700/60 transition-all overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
        <div className="md:col-span-2 relative h-44 md:h-auto bg-zinc-950">
          <Image
            src="/images/products/flooring/图片/理想/1.png"
            alt="地板改装专题代表图：理想木纹咖地板总成"
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover"
            loading="lazy"
          />
        </div>
        <div className="md:col-span-3 p-6 md:p-8 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-400">
              <Layers className="w-5 h-5" />
            </span>
            <span className="text-xs tracking-widest text-amber-400">
              FLOORING TOPIC
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
            地板改装专题
          </h3>
          <p className="text-sm md:text-base text-zinc-400 mb-4 leading-relaxed">
            按品牌车型查看 MPV / 新能源地板总成、尾箱地板与迎宾踏板升级。
          </p>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-300">
              4 个热门品牌
            </span>
            <span className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-300">
              16 张产品图
            </span>
            <span className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-300">
              4 种颜色方案
            </span>
          </div>
          <span className="inline-flex items-center text-sm font-medium text-amber-400 group-hover:text-amber-300">
            查看专题
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}