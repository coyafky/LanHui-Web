"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { LiAutoI6FaqItem } from "@/lib/li-auto-i6-products";

const EXPECTED_FAQ_COUNT = 6;

type LiAutoI6FaqProps = {
  items: readonly LiAutoI6FaqItem[];
};

function assertFaqCount(items: readonly LiAutoI6FaqItem[]): void {
  if (items.length !== EXPECTED_FAQ_COUNT) {
    throw new Error(
      `LiAutoI6Faq expects ${EXPECTED_FAQ_COUNT} items, got ${items.length}`,
    );
  }
}

export function LiAutoI6Faq({ items }: LiAutoI6FaqProps) {
  assertFaqCount(items);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      className="py-16 md:py-20 bg-black border-t border-zinc-900"
      aria-labelledby="li-auto-i6-faq-heading"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-sm tracking-widest text-orange-400 mb-3">FAQ</p>
          <h2
            id="li-auto-i6-faq-heading"
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
                key={item.question}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-zinc-800/50 transition-colors"
                  aria-expanded={isOpen}
                  aria-controls={`li-auto-i6-faq-panel-${index}`}
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
                  id={`li-auto-i6-faq-panel-${index}`}
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
