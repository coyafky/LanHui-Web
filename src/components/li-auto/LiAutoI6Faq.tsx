"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { LiAutoI6FaqItem } from "@/lib/li-auto-i6-products";

type LiAutoI6FaqProps = {
  items: readonly LiAutoI6FaqItem[];
};

export function LiAutoI6Faq({ items }: LiAutoI6FaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-20 bg-zinc-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sm tracking-widest text-amber-400 mb-3">FAQ</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            常见问题
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            关于理想 i6 升级项目的常见疑问
          </p>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-medium text-white hover:text-amber-400 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 ml-4 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-zinc-400 leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
