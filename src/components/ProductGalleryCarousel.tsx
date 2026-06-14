"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductGalleryCarouselProps = {
  images: string[];
  title?: string;
  autoplayMs?: number;
};

export function ProductGalleryCarousel({
  images,
  title = "电动踏板",
  autoplayMs = 5000,
}: ProductGalleryCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [
      Autoplay({
        delay: autoplayMs,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi]
  );

  return (
    <div className="relative max-w-xl mx-auto">
      <div
        className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
        ref={emblaRef}
      >
        <div className="flex">
          {images.map((src, i) => (
            <div key={i} className="min-w-0 flex-[0_0_100%]">
              <div className="relative aspect-[16/10]">
                <img
                  src={src}
                  alt={`${title} ${i + 1}`}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={scrollPrev}
        aria-label="上一张"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-10 h-10 rounded-full bg-black/60 border border-zinc-700 text-zinc-300 hover:bg-black/80 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        aria-label="下一张"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-10 h-10 rounded-full bg-black/60 border border-zinc-700 text-zinc-300 hover:bg-black/80 hover:text-white transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollTo(i)}
            aria-label={`跳转到第 ${i + 1} 张`}
            className={cn(
              "h-2 rounded-full transition-all",
              i === selectedIndex
                ? "w-6 bg-blue-400"
                : "w-2 bg-zinc-600 hover:bg-zinc-500"
            )}
          />
        ))}
      </div>
    </div>
  );
}
