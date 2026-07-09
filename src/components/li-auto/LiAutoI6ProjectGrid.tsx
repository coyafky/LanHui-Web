"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AlertCircle, ImageIcon } from "lucide-react";
import { trackClick } from "@/lib/analytics";
import type {
  LiAutoI6Category,
  LiAutoI6Scenario,
  LiAutoI6UpgradeProject,
} from "@/lib/li-auto-i6-products";

const CATEGORY_LABELS: Record<LiAutoI6Category, string> = {
  protection: "漆面保护",
  film: "膜系",
  appearance: "外观个性",
  cabin_protection: "座舱保护",
  cabin_atmosphere: "座舱氛围",
  cabin_comfort: "座舱舒适",
  chassis: "底盘防护",
  driving_protection: "行车防护",
  screen_care: "屏幕养护",
  interior_care: "内饰养护",
};

const CATEGORY_ORDER: readonly LiAutoI6Category[] = [
  "protection",
  "film",
  "appearance",
  "cabin_protection",
  "cabin_atmosphere",
  "cabin_comfort",
  "chassis",
  "driving_protection",
  "screen_care",
  "interior_care",
];

const EXPECTED_PROJECT_COUNT = 20;

type LiAutoI6ProjectGridProps = {
  projects: readonly LiAutoI6UpgradeProject[];
  scenarios: readonly LiAutoI6Scenario[];
};

type ProjectCardProps = {
  project: LiAutoI6UpgradeProject;
  open: boolean;
  onToggle: () => void;
};

function assertProjectCount(projects: readonly LiAutoI6UpgradeProject[]): void {
  if (projects.length !== EXPECTED_PROJECT_COUNT) {
    throw new Error(
      `LiAutoI6ProjectGrid expects ${EXPECTED_PROJECT_COUNT} projects, got ${projects.length}`,
    );
  }
}

function ProjectCard({ project, open, onToggle }: ProjectCardProps) {
  const statusLabel =
    project.imageStatus === "product-preview"
      ? "商品预览效果图"
      : project.imageStatus === "matched"
        ? "实拍匹配"
        : project.imageStatus === "pending-review"
          ? "待复核"
          : "图片待补充";

  const handleClick = () => {
    trackClick("li_auto_i6_project_click", {
      projectId: project.key,
      projectName: project.name,
      category: project.category,
      imageStatus: project.imageStatus,
    });
    onToggle();
  };

  return (
    <article className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={open}
        aria-controls={`li-auto-i6-project-detail-${project.key}`}
        className="text-left w-full"
      >
        <div className="relative aspect-[4/3] bg-zinc-950 border-b border-zinc-800 flex items-center justify-center overflow-hidden">
          {project.publicPath ? (
            <>
              <Image
                src={project.publicPath}
                alt={`理想 i6 ${project.name} 效果预览图`}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md border border-orange-700/60 bg-zinc-950/80 px-2 py-0.5 text-[10px] font-medium text-orange-200">
                
                {statusLabel}
              </span>
            </>
          ) : (
            <div
              role="img"
              aria-label={`理想 i6 ${project.name} 图片待补充`}
              className="flex flex-col items-center justify-center text-zinc-500"
            >
              <ImageIcon className="mb-2 h-8 w-8" aria-hidden />
              <p className="text-xs">{statusLabel}</p>
            </div>
          )}
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
              {CATEGORY_LABELS[project.category]}
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
        id={`li-auto-i6-project-detail-${project.key}`}
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

export function LiAutoI6ProjectGrid({
  projects,
  scenarios,
}: LiAutoI6ProjectGridProps) {
  assertProjectCount(projects);

  const sectionRef = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState<LiAutoI6Category | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const activeScenario = useMemo(() => {
    if (!activeScenarioId) return null;
    return scenarios.find((s) => s.key === activeScenarioId) ?? null;
  }, [activeScenarioId, scenarios]);

  const handleHashChange = useCallback(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const projectMatch = hash.match(/^li-auto-i6-project-(.+)$/);
    if (projectMatch) {
      setOpenId(projectMatch[1]);
      setActiveScenarioId(null);
      return;
    }

    const scenarioMatch = hash.match(/^scenario-(.+)$/);
    if (scenarioMatch) {
      setActiveScenarioId(scenarioMatch[1]);
      sectionRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setActiveScenarioId(null);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(handleHashChange);
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [handleHashChange]);

  const scenarioFilteredProjects = useMemo<readonly LiAutoI6UpgradeProject[]>(() => {
    if (!activeScenario) return projects;
    const keySet = new Set(activeScenario.projectKeys);
    return projects.filter((p) => keySet.has(p.key));
  }, [projects, activeScenario]);

  const filteredProjects = useMemo<readonly LiAutoI6UpgradeProject[]>(() => {
    if (activeCategory === "all") return scenarioFilteredProjects;
    return scenarioFilteredProjects.filter(
      (p) => p.category === activeCategory,
    );
  }, [scenarioFilteredProjects, activeCategory]);

  const handleScenarioClear = useCallback(() => {
    trackClick("li_auto_i6_scenario_clear", {});
    setActiveScenarioId(null);
    setActiveCategory("all");
    window.location.hash = "";
  }, []);

  const handleCategoryChange = useCallback(
    (cat: LiAutoI6Category | "all") => {
      if (cat === activeCategory) return;
      trackClick("li_auto_i6_category_filter", {
        category: cat,
      });
      setActiveCategory(cat);
    },
    [activeCategory],
  );

  return (
    <section
      ref={sectionRef}
      id="li-auto-i6-project-grid"
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-orange-400 mb-3">
            PROJECTS
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            理想 i6 · {projects.length} 个升级项目
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            按分类筛选；点击任意卡片展开详情。
          </p>
        </div>

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
                {CATEGORY_LABELS[cat]}（{count}）
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProjects.map((p) => (
            <ProjectCard
              key={p.key}
              project={p}
              open={openId === p.key}
              onToggle={() => setOpenId(openId === p.key ? null : p.key)}
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
