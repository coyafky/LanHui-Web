"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { LedaoL90FaqItem } from "@/lib/ledao-l90-products";

type LedaoL90FaqProps = {
  items: readonly LedaoL90FaqItem[];
};

const FAQ_LENGTH = 6;

function assertFaqLength(items: readonly LedaoL90FaqItem[]): void {
  if (items.length !== FAQ_LENGTH) {
    throw new Error(
      `LedaoL90Faq expects ${FAQ_LENGTH} items, got ${items.length}`,
    );
  }
}

/**
 * 乐道 L90 FAQ 手风琴组件（Client Component）
 * 点击问题展开/收起回答
 * 主题色: orange，与极氪 9X 页面结构对齐
 */
export function LedaoL90Faq({ items }: LedaoL90FaqProps) {
  assertFaqLength(items);

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggleFaq(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <section
      className="py-16 md:py-20 bg-black border-t border-zinc-900"
      aria-labelledby="ledao-l90-faq-heading"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-sm tracking-widest text-orange-400 mb-3">FAQ</p>
          <h2
            id="ledao-l90-faq-heading"
            className="text-2xl md:text-3xl font-bold text-white"
          >
            常见问题
          </h2>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  aria-controls={`ledao-l90-faq-panel-${index}`}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-zinc-800/50 transition-colors"
                >
                  <span className="text-sm md:text-base font-semibold text-white">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 text-orange-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>
                <div
                  id={`ledao-l90-faq-panel-${index}`}
                  className={`grid transition-all duration-200 ease-out ${
                    isOpen
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
