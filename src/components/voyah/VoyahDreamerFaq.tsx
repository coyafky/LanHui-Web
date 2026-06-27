"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { VoyahDreamerFaqItem } from "@/lib/voyah-products";

type VoyahDreamerFaqProps = {
  items: readonly VoyahDreamerFaqItem[];
};

const FAQ_LENGTH = 7;

function assertFaqLength(items: readonly VoyahDreamerFaqItem[]): void {
  if (items.length !== FAQ_LENGTH) {
    throw new Error(
      `VoyahDreamerFaq expects ${FAQ_LENGTH} items, got ${items.length}`,
    );
  }
}

/**
 * 7 条 FAQ（Client Component）— 一次只展开一项
 * 圆角 2xl + 边框 zinc-800 + ChevronDown 旋转 + 300ms 过渡
 * 完整 a11y：aria-expanded + aria-controls + role="region"
 */
export function VoyahDreamerFaq({ items }: VoyahDreamerFaqProps) {
  assertFaqLength(items);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      className="py-16 md:py-20 bg-black border-t border-zinc-900"
      aria-labelledby="voyah-dreamer-faq-heading"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-sm tracking-widest text-violet-400 mb-3">FAQ</p>
          <h2
            id="voyah-dreamer-faq-heading"
            className="text-2xl md:text-3xl font-bold text-white"
          >
            常见问题
          </h2>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => {
            const open = openIndex === idx;
            const triggerId = `voyah-dreamer-faq-trigger-${idx}`;
            const panelId = `voyah-dreamer-faq-panel-${idx}`;
            return (
              <div
                key={item.question}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                <button
                  id={triggerId}
                  type="button"
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-zinc-800/50 transition-colors"
                  onClick={() => setOpenIndex(open ? null : idx)}
                  aria-expanded={open}
                  aria-controls={panelId}
                >
                  <span className="text-sm md:text-base font-semibold text-white">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 text-violet-400 transition-transform duration-300 ${
                      open ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  className={`grid transition-all duration-300 ease-out ${
                    open
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-zinc-400 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
