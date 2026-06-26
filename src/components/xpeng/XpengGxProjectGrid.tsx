"use client";

import { useState } from "react";
import { ChevronDown, Image as ImageIcon, AlertCircle } from "lucide-react";
import { trackClick } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import {
  XPENG_GX_CATEGORY_LABELS,
  type XpengGxUpgradeProject,
} from "@/lib/xpeng-gx-products";

type XpengGxProjectGridProps = {
  projects: readonly XpengGxUpgradeProject[];
  highlightProjectIds?: readonly string[];
};

const PROJECT_LENGTH = 15;

function assertProjectLength(projects: readonly XpengGxUpgradeProject[]): void {
  if (projects.length !== PROJECT_LENGTH) {
    throw new Error(
      `XpengGxProjectGrid expects ${PROJECT_LENGTH} projects, got ${projects.length}`,
    );
  }
}

const SALE_STATUS_LABELS = {
  available: "现货可施工",
  preorder: "预售",
  "pending-review": "待确认",
} as const;

const SALE_STATUS_STYLES = {
  available: "border-emerald-900/60 text-emerald-400 bg-emerald-950/40",
  preorder: "border-amber-900/60 text-amber-400 bg-amber-950/40",
  "pending-review": "border-zinc-700 text-zinc-400 bg-zinc-900",
} as const;

/**
 * 15 个项目卡片（Client Component）— 可点击展开
 * SPEC §3.1 + 用户决策 #4：点击整卡 → 展开 suitableFor + caution + 触发 upgrade_project_click 埋点
 * 无 PhoneCta（用户决策 #4）
 * 支持 highlightProjectIds prop — BundleList 点击后高亮组合内项目（用户决策 #7）
 */
export function XpengGxProjectGrid({
  projects,
  highlightProjectIds = [],
}: XpengGxProjectGridProps) {
  assertProjectLength(projects);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const highlightSet = new Set(highlightProjectIds);

  function handleCardClick(project: XpengGxUpgradeProject) {
    const willExpand = expandedId !== project.id;
    setExpandedId(willExpand ? project.id : null);
    trackClick("upgrade_project_click", {
      projectId: project.id,
      name: project.name,
      category: project.category,
      saleStatus: project.saleStatus,
      expanded: willExpand,
    });
  }

  return (
    <section
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900"
      aria-labelledby="xpeng-gx-projects-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-emerald-400 mb-3">
            UPGRADE PROJECTS
          </p>
          <h2
            id="xpeng-gx-projects-heading"
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            15 个升级项目
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-3xl">
            点击任意项目卡查看适合人群与注意事项；预售项目会明确标注
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {projects.map((p) => {
            const orderLabel = p.order.toString().padStart(2, "0");
            const categoryLabel = XPENG_GX_CATEGORY_LABELS[p.category];
            const saleLabel = SALE_STATUS_LABELS[p.saleStatus];
            const saleStyle = SALE_STATUS_STYLES[p.saleStatus];
            const isExpanded = expandedId === p.id;
            const isHighlighted = highlightSet.has(p.id);
            const showCaution =
              p.saleStatus === "preorder" || Boolean(p.caution);

            return (
              <article
                key={p.id}
                id={`xpeng-gx-project-${p.id}`}
                className={`group bg-zinc-900 rounded-2xl border transition-colors flex flex-col text-left overflow-hidden ${
                  isHighlighted
                    ? "border-emerald-700/60 ring-1 ring-emerald-700/40"
                    : "border-zinc-800 hover:border-emerald-700/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleCardClick(p)}
                  aria-expanded={isExpanded}
                  aria-controls={`xpeng-gx-project-panel-${p.id}`}
                  aria-label={`查看 ${p.name} 详情`}
                  className="flex flex-col text-left flex-1"
                >
                  <div
                    role="img"
                    aria-label={`${p.name} 升级项目预览图`}
                    className="relative aspect-[4/3] bg-zinc-950 border-b border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-500"
                  >
                    <ImageIcon className="w-8 h-8 mb-2" aria-hidden />
                    <p className="text-xs">图片待补充</p>
                  </div>
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-emerald-900/60 text-emerald-400 bg-emerald-950/40"
                      >
                        {orderLabel}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-zinc-700 text-zinc-300"
                      >
                        {categoryLabel}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={saleStyle}
                      >
                        {saleLabel}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {p.summary}
                    </p>
                    <div className="mt-auto flex items-center justify-between text-xs text-zinc-500">
                      <span>{isExpanded ? "收起详情" : "查看详情"}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isExpanded ? "rotate-180 text-emerald-400" : ""
                        }`}
                        aria-hidden
                      />
                    </div>
                  </div>
                </button>

                <div
                  id={`xpeng-gx-project-panel-${p.id}`}
                  className={`grid transition-all duration-300 ease-out ${
                    isExpanded
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                  aria-hidden={!isExpanded}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 pt-1 border-t border-zinc-800 space-y-3">
                      <div>
                        <p className="text-xs text-emerald-400 font-semibold mb-1.5">
                          适合人群
                        </p>
                        <ul className="space-y-1">
                          {p.suitableFor.map((audience) => (
                            <li
                              key={audience}
                              className="text-xs text-zinc-300 flex items-start gap-1.5"
                            >
                              <span className="text-emerald-500 mt-0.5">·</span>
                              <span>{audience}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {showCaution && (
                        <div className="rounded-lg bg-amber-950/20 border border-amber-900/40 p-2.5 flex items-start gap-2">
                          <AlertCircle
                            className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5"
                            aria-hidden
                          />
                          <div className="text-xs text-amber-100/90 leading-relaxed">
                            <p className="font-semibold text-amber-400 mb-0.5">
                              {p.saleStatus === "preorder" ? "预售待确认" : "注意事项"}
                            </p>
                            <p>
                              {p.saleStatus === "preorder"
                                ? p.caution ??
                                  "项目处于预售或待确认状态,需到店确认排期和适配"
                                : p.caution}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}