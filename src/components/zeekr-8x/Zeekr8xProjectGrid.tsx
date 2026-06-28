"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { trackClick } from "@/lib/analytics";
import {
  ZEEKR_8X_PROJECT_COUNT,
  ZEEKR_8X_CATEGORY_LABELS,
  type Zeekr8xCategory,
  type Zeekr8xScenario,
  type Zeekr8xUpgradeProject,
} from "@/lib/zeekr-8x-products";

const EXPECTED_PROJECT_COUNT = ZEEKR_8X_PROJECT_COUNT;

function assertProjectCount(projects: readonly Zeekr8xUpgradeProject[]): void {
  if (projects.length !== EXPECTED_PROJECT_COUNT) {
    throw new Error(
      `Zeekr8xProjectGrid expects ${EXPECTED_PROJECT_COUNT} projects, got ${projects.length}`,
    );
  }
}

const ALL_CATEGORIES = Object.keys(ZEEKR_8X_CATEGORY_LABELS) as Zeekr8xCategory[];

export type Zeekr8xProjectGridProps = {
  readonly projects: readonly Zeekr8xUpgradeProject[];
  readonly modelKey: "8X";
};

type ProjectCardProps = {
  project: Zeekr8xUpgradeProject;
  open: boolean;
  onToggle: () => void;
};

function ProjectCard({ project, open, onToggle }: ProjectCardProps) {
  const handleClick = () => {
    trackClick("zeekr_8x_project_click", {
      projectId: project.id,
      projectName: project.name,
      category: project.category,
      imageStatus: project.imageStatus,
    });
    onToggle();
  };

  return (
    <article className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={open}
        aria-controls={`zeekr-8x-project-detail-${project.id}`}
        className="text-left w-full"
      >
        {/* 图片占位区（pending-review：无实图） */}
        <div className="relative aspect-[4/3] bg-zinc-950 border-b border-zinc-800 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-orange-400 mb-1">
              {String(project.order).padStart(2, "0")}
            </div>
            <p className="text-[11px] text-zinc-600">图片待补充</p>
          </div>
          {project.imageStatus === "generated-preview" ? (
            <span
              aria-hidden
              className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-orange-500/80 text-white"
            >
              预览图
            </span>
          ) : null}
        </div>

        <div className="p-4">
          <h3 className="text-base font-bold text-white mb-1.5">
            {project.name}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-3">
            {project.summary}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className="border-orange-700/60 text-orange-300 bg-orange-950/30"
            >
              {ZEEKR_8X_CATEGORY_LABELS[project.category]}
            </Badge>
          </div>
          <p className="text-[11px] text-zinc-500 mt-3">
            部分项目需到店评估适配性
          </p>
        </div>
      </button>

      <div
        id={`zeekr-8x-project-detail-${project.id}`}
        className={`grid transition-all duration-200 ease-out border-t border-zinc-800 ${
          open
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 space-y-3 text-xs text-zinc-400 leading-relaxed">
            {project.caution ? (
              <p className="text-amber-400 bg-amber-950/20 border border-amber-900/60 rounded-md px-3 py-2">
                <span className="font-semibold">注意：</span>
                {project.caution}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * 极氪 8X 17 项项目网格（Client）
 * - 全部分类 tab 筛选
 * - 每张卡可点击展开 detail panel（含 caution）
 * - 埋点 zeekr_8x_project_click
 * - 支持 hash 高亮（来自 Zeekr8xBundles 点击联动）
 */
export function Zeekr8xProjectGrid({
  projects,
  modelKey,
}: Zeekr8xProjectGridProps) {
  assertProjectCount(projects);

  const [activeCategory, setActiveCategory] = useState<Zeekr8xCategory | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  // hash 高亮（来自 Zeekr8xBundles 的 hashchange）
  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.replace(/^#/, "");
      const m = hash.match(/^project-(.+)$/);
      if (m && typeof m[1] === "string") {
        setOpenId(m[1]);
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const filteredProjects = useMemo<readonly Zeekr8xUpgradeProject[]>(() => {
    if (activeCategory === "all") return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [projects, activeCategory]);

  const handleTabChange = useCallback(
    (next: Zeekr8xCategory | "all") => {
      if (next === activeCategory) return;
      trackClick("zeekr_8x_category_filter", {
        categoryKey: next,
      });
      setActiveCategory(next);
    },
    [activeCategory],
  );

  return (
    <section className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-orange-400 mb-3">PROJECTS</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            极氪 8X · {projects.length} 个升级项目
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            按分类筛选；点击任意卡片展开详情。
          </p>
        </div>

        <div
          role="tablist"
          aria-label="按分类筛选项目"
          className="flex flex-wrap items-center gap-2 mb-8"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === "all"}
            onClick={() => handleTabChange("all")}
            className={`px-3 py-2 rounded-md text-sm transition-colors border ${
              activeCategory === "all"
                ? "bg-orange-500/20 border-orange-500 text-orange-200"
                : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-orange-700/60"
            }`}
          >
            全部（{projects.length}）
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const count = projects.filter((p) => p.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => handleTabChange(cat)}
                className={`px-3 py-2 rounded-md text-sm transition-colors border ${
                  activeCategory === cat
                    ? "bg-orange-500/20 border-orange-500 text-orange-200"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-orange-700/60"
                }`}
              >
                {ZEEKR_8X_CATEGORY_LABELS[cat]}（{count}）
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProjects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              open={openId === p.id}
              onToggle={() => setOpenId(openId === p.id ? null : p.id)}
            />
          ))}
        </div>

        <span className="sr-only">{`model: ${modelKey}`}</span>
      </div>
    </section>
  );
}
