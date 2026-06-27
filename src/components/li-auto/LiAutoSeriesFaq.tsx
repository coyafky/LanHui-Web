"use client";

import { useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import type { LiAutoSeriesFaqItem } from "@/lib/li-auto-series-upgrade-projects";

type LiAutoSeriesFaqProps = {
  items: readonly LiAutoSeriesFaqItem[];
};

const FAQ_LENGTH = 6;

function assertFaqLength(items: readonly LiAutoSeriesFaqItem[]): void {
  if (items.length !== FAQ_LENGTH) {
    throw new Error(
      `LiAutoSeriesFaq expects ${FAQ_LENGTH} items, got ${items.length}`,
    );
  }
}

/**
 * 6 条 FAQ 手风琴组件（Client Component）
 * PRD §12：一次只展开一个，aria-expanded / aria-controls
 */
export function LiAutoSeriesFaq({ items }: LiAutoSeriesFaqProps) {
  assertFaqLength(items);

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <section className="py-16 md:py-20 bg-black border-y border-zinc-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-amber-400 mb-3">
            FAQ
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            常见问题
          </h2>
        </div>

        <dl className="space-y-3">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `li-auto-series-faq-panel-${index}`;
            const buttonId = `li-auto-series-faq-button-${index}`;

            return (
              <div
                key={index}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden"
              >
                <dt>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(index)}
                    className="flex items-center justify-between w-full text-left px-5 py-4 text-sm font-medium text-white hover:bg-zinc-800/50 transition-colors"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </dt>
                {isOpen && (
                  <dd
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-5 pb-4 text-sm text-zinc-400 leading-relaxed"
                  >
                    {item.answer}
                  </dd>
                )}
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
