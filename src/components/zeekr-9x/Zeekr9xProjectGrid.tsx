"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { trackClick } from "@/lib/analytics";
import {
  ZEEKR_9X_CATEGORY_LABELS,
  ZEEKR_9X_PROJECT_COUNT,
  type Zeekr9xCategory,
  type Zeekr9xScenario,
  type Zeekr9xUpgradeProject,
} from "@/lib/zeekr-9x-products";

const EXPECTED_PROJECT_COUNT = ZEEKR_9X_PROJECT_COUNT;

const CATEGORY_ORDER: readonly Zeekr9xCategory[] = [
  "paint_protection",
  "film_style",
  "exterior_parts",
  "cabin_protection",
  "chassis_protection",
  "handling",
  "infotainment",
];

function assertProjectCount(projects: readonly Zeekr9xUpgradeProject[]): void {
  if (projects.length !== EXPECTED_PROJECT_COUNT) {
    throw new Error(
      `Zeekr9xProjectGrid expects ${EXPECTED_PROJECT_COUNT} projects, got ${projects.length}`,
    );
  }
}

export type Zeekr9xProjectGridProps = {
  projects: readonly Zeekr9xUpgradeProject[];
  scenarios: readonly Zeekr9xScenario[];
};

type ProjectCardProps = {
  project: Zeekr9xUpgradeProject;
  open: boolean;
  onToggle: () => void;
};

function ProjectCard({ project, open, onToggle }: ProjectCardProps) {
  const handleClick = () => {
    trackClick("zeekr_9x_project_click", {
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
        aria-controls={`zeekr-9x-project-detail-${project.id}`}
        className="text-left w-full"
      >
        <div className="relative aspect-[4/3] bg-zinc-950 border-b border-zinc-800 flex items-center justify-center">
          <span className="text-zinc-700 text-sm">pending-review</span>
          <span
            aria-hidden
            className="absolute top-2 left-2 text-xs font-bold w-8 h-8 flex items-center justify-center rounded-md bg-orange-500/80 text-white"
          >
            {String(project.order).padStart(2, "0")}
          </span>
        </div>

        <div className="p-4">
          <h3 className="text-base font-bold text-white mb-1.5">
            {project.name}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-3">
            {project.summary}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-orange-900/60 text-orange-400 bg-orange-950/30 text-xs">
              {ZEEKR_9X_CATEGORY_LABELS[project.category]}
            </span>
            {project.suitableFor.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-md border border-zinc-700 text-zinc-400 bg-zinc-800/50 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-zinc-500 mt-3">
            功能预览 · 按车型确认适配
          </p>
        </div>
      </button>

      <div
        id={`zeekr-9x-project-detail-${project.id}`}
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
 * 极氪 9X 18 项项目网格（Client）
 * Plan §C.2：
 *   - 7 分类 tab 切换（默认"全部"）
 *   - 每张卡可点击展开 detail panel
 *   - 场景筛选（通过 #scenario-{id} hash 驱动）
 *   - 埋点 zeekr_9x_project_click
 */
export function Zeekr9xProjectGrid({
  projects,
  scenarios,
}: Zeekr9xProjectGridProps) {
  assertProjectCount(projects);

  const sectionRef = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState<Zeekr9xCategory | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const activeScenario = useMemo(() => {
    if (!activeScenarioId) return null;
    return scenarios.find((s) => s.id === activeScenarioId) ?? null;
  }, [activeScenarioId, scenarios]);

  // 解析 hash 驱动的场景筛选
  const handleHashChange = useCallback(() => {
    const hash = window.location.hash.replace(/^#/, "");
    // 项目展开: #zeekr-9x-project-{id}
    const projectMatch = hash.match(/^zeekr-9x-project-(.+)$/);
    if (projectMatch) {
      setOpenId(projectMatch[1]);
      setActiveScenarioId(null);
      return;
    }
    // 场景筛选: #scenario-{id}
    const scenarioMatch = hash.match(/^scenario-(.+)$/);
    if (scenarioMatch) {
      const sid = scenarioMatch[1];
      setActiveScenarioId(sid);
      // 滚动到项目网格区域
      sectionRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    // 无 hash → 全部
    setActiveScenarioId(null);
  }, []);

  useEffect(() => {
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [handleHashChange]);

  // 场景筛选后的项目
  const scenarioFilteredProjects = useMemo<readonly Zeekr9xUpgradeProject[]>(() => {
    if (!activeScenario) return projects;
    const idSet = new Set(activeScenario.projectIds);
    return projects.filter((p) => idSet.has(p.id));
  }, [projects, activeScenario]);

  // 分类筛选
  const filteredProjects = useMemo<readonly Zeekr9xUpgradeProject[]>(() => {
    if (activeCategory === "all") return scenarioFilteredProjects;
    return scenarioFilteredProjects.filter(
      (p) => p.category === activeCategory,
    );
  }, [scenarioFilteredProjects, activeCategory]);

  // 场景 filter tab 切换
  const handleScenarioClear = useCallback(() => {
    trackClick("zeekr_9x_scenario_clear", {});
    setActiveScenarioId(null);
    setActiveCategory("all");
    window.location.hash = "";
  }, []);

  // 分类 tab 切换
  const handleCategoryChange = useCallback(
    (cat: Zeekr9xCategory | "all") => {
      if (cat === activeCategory) return;
      trackClick("zeekr_9x_category_filter", {
        category: cat,
      });
      setActiveCategory(cat);
    },
    [activeCategory],
  );

  return (
    <section
      ref={sectionRef}
      id="zeekr-9x-project-grid"
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-orange-400 mb-3">
            PROJECTS
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            极氪 9X · {projects.length} 个升级项目
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            按分类筛选；点击任意卡片展开详情。
          </p>
        </div>

        {/* 场景筛选指示器 */}
        {activeScenario ? (
          <div className="flex items-center gap-2 mb-4 px-4 py-2 rounded-lg bg-orange-950/20 border border-orange-900/40">
            <span className="text-sm text-orange-300">
              当前筛选：{activeScenario.name}场景
            </span>
            <button
              type="button"
              onClick={handleScenarioClear}
              className="ml-auto text-xs px-2 py-1 rounded-md border border-orange-800/60 text-orange-400 hover:bg-orange-950/40 transition-colors"
            >
              清除筛选
            </button>
          </div>
        ) : null}

        {/* 分类 tab */}
        <div
          role="tablist"
          aria-label="按分类筛选项目"
          className="flex flex-wrap items-center gap-2 mb-8"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === "all"}
            onClick={() => handleCategoryChange("all")}
            className={`px-3 py-2 rounded-md text-sm transition-colors border ${
              activeCategory === "all"
                ? "bg-orange-500/20 border-orange-500 text-orange-200"
                : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-orange-700/60"
            }`}
          >
            全部（{scenarioFilteredProjects.length}）
          </button>
          {CATEGORY_ORDER.map((cat) => {
            const count = scenarioFilteredProjects.filter(
              (p) => p.category === cat,
            ).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-2 rounded-md text-sm transition-colors border ${
                  activeCategory === cat
                    ? "bg-orange-500/20 border-orange-500 text-orange-200"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-orange-700/60"
                }`}
              >
                {ZEEKR_9X_CATEGORY_LABELS[cat]}（{count}）
              </button>
            );
          })}
        </div>

        {/* 项目卡片网格 */}
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

        {filteredProjects.length === 0 ? (
          <p className="text-center text-zinc-500 text-sm py-8">
            当前筛选条件下没有项目
          </p>
        ) : null}
      </div>
    </section>
  );
}
