"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Zeekr9xFaqItem } from "@/lib/zeekr-9x-products";

const EXPECTED_FAQ_COUNT = 6;

function assertFaqCount(items: readonly Zeekr9xFaqItem[]): void {
  if (items.length !== EXPECTED_FAQ_COUNT) {
    throw new Error(
      `Zeekr9xFaq expects ${EXPECTED_FAQ_COUNT} items, got ${items.length}`,
    );
  }
}

export type Zeekr9xFaqProps = {
  items: readonly Zeekr9xFaqItem[];
};

/**
 * 极氪 9X 6 条 FAQ（Client）
 * Plan §C.6：一次只展开一项；a11y aria-expanded/aria-controls。
 */
export function Zeekr9xFaq({ items }: Zeekr9xFaqProps) {
  assertFaqCount(items);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      className="py-16 md:py-20 bg-black border-t border-zinc-900"
      aria-labelledby="zeekr-9x-faq-heading"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-sm tracking-widest text-orange-400 mb-3">FAQ</p>
          <h2
            id="zeekr-9x-faq-heading"
            className="text-2xl md:text-3xl font-bold text-white"
          >
            常见问题
          </h2>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => {
            const open = openIndex === idx;
            return (
              <div
                key={item.question}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-zinc-800/50 transition-colors"
                  onClick={() => setOpenIndex(open ? null : idx)}
                  aria-expanded={open}
                  aria-controls={`zeekr-9x-faq-panel-${idx}`}
                >
                  <span className="text-sm md:text-base font-semibold text-white">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 text-orange-400 transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>
                <div
                  id={`zeekr-9x-faq-panel-${idx}`}
                  className={`grid transition-all duration-200 ease-out ${
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
