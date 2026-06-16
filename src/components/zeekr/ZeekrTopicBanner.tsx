import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Car } from "lucide-react";
import { zeekrTopicMeta } from "@/lib/zeekr-products";

/**
 * 极氪改装专题入口横幅
 * PRD §5.1：标题 / 副标 / 统计 / CTA / 跳转 /product/zeekr
 * 主题色：orange-500/400（与 xiaomi 一致，区别于 wenjie cyan）
 */
export function ZeekrTopicBanner() {
  return (
    <Link
      href="/product/zeekr"
      className="group block bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-orange-700/60 transition-all overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
        <div className="md:col-span-2 relative h-44 md:h-auto bg-zinc-950">
          <Image
            src={zeekrTopicMeta.previewImage}
            alt="极氪 9X / 8X / 009 改装款式预览拼图"
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover"
            loading="lazy"
          />
        </div>
        <div className="md:col-span-3 p-6 md:p-8 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-orange-950/40 border border-orange-800/50 text-orange-400">
              <Car className="w-5 h-5" />
            </span>
            <span className="text-xs tracking-widest text-orange-400">
              ZEEKR TOPIC
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
            {zeekrTopicMeta.title}
          </h3>
          <p className="text-sm md:text-base text-zinc-400 mb-4 leading-relaxed">
            {zeekrTopicMeta.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-300">
              {zeekrTopicMeta.totalProducts} 个款式
            </span>
            <span className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-300">
              {zeekrTopicMeta.totalModels} 个车型
            </span>
            <span className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-300">
              9X / 8X / 009
            </span>
          </div>
          <span className="inline-flex items-center text-sm font-medium text-orange-400 group-hover:text-orange-300">
            查看专题
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
