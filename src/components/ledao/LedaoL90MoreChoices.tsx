"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { trackClick } from "@/lib/analytics";
import {
  LEDAO_L90_CATEGORY_LABELS,
  type LedaoL90MoreChoice,
  type LedaoL90Category,
} from "@/lib/ledao-l90-products";

type LedaoL90MoreChoicesProps = {
  items: readonly LedaoL90MoreChoice[];
};

const DEFAULT_VISIBLE = 4;

/**
 * "更多选择"组件（Client Component）— 按类别分组
 * 每组默认展示前 4 项，剩余可展开
 * 文字标签形态，无配图
 * PRD §9.2 展示规则
 */
export function LedaoL90MoreChoices({ items }: LedaoL90MoreChoicesProps) {
  // 按类别分组
  const grouped = new Map<LedaoL90Category, LedaoL90MoreChoice[]>();
  for (const item of items) {
    const existing = grouped.get(item.category) ?? [];
    existing.push(item);
    grouped.set(item.category, existing);
  }

  // 每组展开状态
  const [expandedCategories, setExpandedCategories] = useState<
    Set<LedaoL90Category>
  >(new Set());

  function toggleCategory(category: LedaoL90Category) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
    trackClick("more_choices_expand", {
      category,
      expanded: !expandedCategories.has(category),
    });
  }

  if (grouped.size === 0) return null;

  return (
    <section
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900"
      aria-labelledby="ledao-l90-more-choices-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-blue-400 mb-3">
            MORE CHOICES
          </p>
          <h2
            id="ledao-l90-more-choices-heading"
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            更多选择
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            更多可选轻改项目，按类别分类浏览
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {Array.from(grouped.entries()).map(([category, categoryItems]) => {
            const isExpanded = expandedCategories.has(category);
            const visibleItems = isExpanded
              ? categoryItems
              : categoryItems.slice(0, DEFAULT_VISIBLE);
            const hiddenCount = categoryItems.length - DEFAULT_VISIBLE;

            return (
              <article
                key={category}
                className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5"
              >
                <p className="text-xs font-semibold text-blue-400 mb-3 uppercase tracking-wider">
                  {LEDAO_L90_CATEGORY_LABELS[category]}
                </p>
                <ul className="space-y-2">
                  {visibleItems.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() =>
                          trackClick("more_choice_click", {
                            choiceId: item.id,
                            name: item.name,
                            category: item.category,
                          })
                        }
                        aria-label={`查看 ${item.name} 详情`}
                        className="w-full text-left text-sm text-zinc-300 hover:text-blue-400 transition-colors px-2 py-1 rounded-md hover:bg-blue-950/20"
                      >
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
                {hiddenCount > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="mt-3 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    aria-expanded={isExpanded}
                    aria-label={
                      isExpanded
                        ? "收起"
                        : `展开剩余 ${hiddenCount} 项`
                    }
                  >
                    <span>
                      {isExpanded
                        ? "收起"
                        : `展开剩余 ${hiddenCount} 项`}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    />
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
