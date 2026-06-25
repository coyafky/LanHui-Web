"use client";

/**
 * ProductFAQ — 5 个常见问题 accordion
 *
 * PRD v3 §5.2 FAQS 数据
 * 分类: general / service / vehicle / compliance
 *
 * "use client" 因为需要 useState 管理展开状态
 * 实现: 单展开模式 (展开一项自动收起其他) — 减少视觉噪音
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQS, type ProductFAQ as FAQItem } from "@/lib/product-landing";

const CATEGORY_LABEL: Record<FAQItem["category"], string> = {
  general: "通用",
  service: "服务",
  vehicle: "车型",
  compliance: "合规",
};

const CATEGORY_COLOR: Record<FAQItem["category"], string> = {
  general: "text-blue-300 bg-blue-950/30 border-blue-800/40",
  service: "text-cyan-300 bg-cyan-950/30 border-cyan-800/40",
  vehicle: "text-violet-300 bg-violet-950/30 border-violet-800/40",
  compliance: "text-amber-300 bg-amber-950/30 border-amber-800/40",
};

export function ProductFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="py-12 md:py-16 bg-zinc-950 border-t border-zinc-900"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-xs tracking-widest text-zinc-400 mb-2">
            FAQ · 常见问题
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            关于产品中心
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            解答车主在选择项目时最常问的 5 个问题。具体方案以到店沟通为准。
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-xl border transition-colors ${
                  isOpen
                    ? "border-zinc-700 bg-zinc-900/60"
                    : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center gap-3 p-4 md:p-5 text-left"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${i}`}
                >
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] tracking-wider border ${CATEGORY_COLOR[faq.category]}`}
                  >
                    {CATEGORY_LABEL[faq.category]}
                  </span>
                  <span className="flex-1 text-sm md:text-base font-medium text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`flex-shrink-0 w-5 h-5 text-zinc-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={`faq-answer-${i}`}
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 md:px-5 pb-4 md:pb-5 text-sm text-zinc-400 leading-relaxed">
                      {faq.answer}
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
