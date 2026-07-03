"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AlertCircle, ImageIcon } from "lucide-react";
import { trackClick } from "@/lib/analytics";
import {
  VOYAH_DREAMER_CATEGORY_LABELS,
  type VoyahDreamerCategory,
  type VoyahDreamerScenario,
  type VoyahDreamerUpgradeProject,
} from "@/lib/voyah-products";

type VoyahDreamerProjectGridProps = {
  projects: readonly VoyahDreamerUpgradeProject[];
  scenarios: readonly VoyahDreamerScenario[];
};

type ProjectCardProps = {
  project: VoyahDreamerUpgradeProject;
  open: boolean;
  onToggle: () => void;
};

const PROJECT_LENGTH = 17;

const CATEGORY_ORDER: readonly VoyahDreamerCategory[] = [
  "protection",
  "appearance",
  "chassis",
  "mpv_comfort",
  "interior_care",
];

function getHashState(scenarios: readonly VoyahDreamerScenario[]) {
  if (typeof window === "undefined") {
    return { openId: null, activeScenarioKey: null };
  }

  const hash = window.location.hash.replace(/^#/, "");
  const projectMatch = hash.match(/^voyah-dreamer-project-(.+)$/);
  if (projectMatch) {
    return { openId: projectMatch[1], activeScenarioKey: null };
  }

  const scenario = scenarios.find((s) => s.key === hash);
  if (scenario) {
    return { openId: null, activeScenarioKey: scenario.key };
  }

  return { openId: null, activeScenarioKey: null };
}

function assertProjectLength(projects: readonly VoyahDreamerUpgradeProject[]): void {
  if (projects.length !== PROJECT_LENGTH) {
    throw new Error(
      `VoyahDreamerProjectGrid expects ${PROJECT_LENGTH} projects, got ${projects.length}`,
    );
  }
}

function ProjectCard({ project, open, onToggle }: ProjectCardProps) {
  const statusLabel =
    project.imageStatus === "generated-preview"
      ? "效果预览"
      : project.imageStatus === "matched"
        ? "实拍匹配"
        : project.imageStatus === "pending-review"
          ? "待复核"
          : "图片待补充";

  const handleClick = () => {
    trackClick("voyah_dreamer_project_click", {
      projectId: project.id,
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
        aria-controls={`voyah-dreamer-project-detail-${project.id}`}
        className="text-left w-full"
      >
        <div className="relative aspect-[4/3] bg-zinc-950 border-b border-zinc-800 flex items-center justify-center overflow-hidden">
          {project.image.publicPath ? (
            <>
              <Image
                src={project.image.publicPath}
                alt={project.image.alt}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md border border-violet-700/60 bg-zinc-950/80 px-2 py-0.5 text-[10px] font-medium text-violet-200">
                {project.imageStatus === "generated-preview" ? (
                  <AlertCircle className="h-3 w-3" aria-hidden />
                ) : null}
                {statusLabel}
              </span>
            </>
          ) : (
            <div
              role="img"
              aria-label={project.image.alt}
              className="flex flex-col items-center justify-center text-zinc-500"
            >
              <ImageIcon className="mb-2 h-8 w-8" aria-hidden />
              <p className="text-xs">{statusLabel}</p>
            </div>
          )}
          <span
            aria-hidden
            className="absolute top-2 left-2 text-xs font-bold w-8 h-8 flex items-center justify-center rounded-md bg-violet-500/80 text-white"
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
            <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-violet-900/60 text-violet-400 bg-violet-950/30 text-xs">
              {VOYAH_DREAMER_CATEGORY_LABELS[project.category]}
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
        id={`voyah-dreamer-project-detail-${project.id}`}
        className={`grid transition-all duration-200 ease-out border-t border-zinc-800 ${
          open
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 space-y-3 text-xs text-zinc-400 leading-relaxed">
            <div>
              <p className="font-semibold text-violet-400 mb-1.5">适合人群</p>
              <ul className="space-y-1">
                {project.suitableFor.map((audience) => (
                  <li key={audience} className="flex items-start gap-1.5">
                    <span className="text-violet-500 mt-0.5">·</span>
                    <span>{audience}</span>
                  </li>
                ))}
              </ul>
            </div>
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

export function VoyahDreamerProjectGrid({
  projects,
  scenarios,
}: VoyahDreamerProjectGridProps) {
  assertProjectLength(projects);

  const sectionRef = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState<VoyahDreamerCategory | "all">("all");
  const [openId, setOpenId] = useState<string | null>(
    () => getHashState(scenarios).openId,
  );
  const [activeScenarioKey, setActiveScenarioKey] = useState<string | null>(
    () => getHashState(scenarios).activeScenarioKey,
  );

  const activeScenario = useMemo(() => {
    if (!activeScenarioKey) return null;
    return scenarios.find((s) => s.key === activeScenarioKey) ?? null;
  }, [activeScenarioKey, scenarios]);

  const handleHashChange = useCallback(() => {
    const hashState = getHashState(scenarios);
    setOpenId(hashState.openId);
    setActiveScenarioKey(hashState.activeScenarioKey);
  }, [scenarios]);

  useEffect(() => {
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [handleHashChange]);

  useEffect(() => {
    if (activeScenarioKey) {
      sectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeScenarioKey]);

  const scenarioFilteredProjects = useMemo<readonly VoyahDreamerUpgradeProject[]>(() => {
    if (!activeScenario) return projects;
    const idSet = new Set(activeScenario.projectIds);
    return projects.filter((p) => idSet.has(p.id));
  }, [projects, activeScenario]);

  const filteredProjects = useMemo<readonly VoyahDreamerUpgradeProject[]>(() => {
    if (activeCategory === "all") return scenarioFilteredProjects;
    return scenarioFilteredProjects.filter(
      (p) => p.category === activeCategory,
    );
  }, [scenarioFilteredProjects, activeCategory]);

  const handleScenarioClear = useCallback(() => {
    trackClick("voyah_dreamer_scenario_clear", {});
    setActiveScenarioKey(null);
    setActiveCategory("all");
    window.location.hash = "";
  }, []);

  const handleCategoryChange = useCallback(
    (cat: VoyahDreamerCategory | "all") => {
      if (cat === activeCategory) return;
      trackClick("voyah_dreamer_category_filter", {
        category: cat,
      });
      setActiveCategory(cat);
    },
    [activeCategory],
  );

  return (
    <section
      ref={sectionRef}
      id="voyah-dreamer-project-grid"
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900 scroll-mt-24"
      aria-labelledby="voyah-dreamer-projects-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-violet-400 mb-3">
            PROJECTS
          </p>
          <h2
            id="voyah-dreamer-projects-heading"
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            岚图梦想家 · {projects.length} 个升级项目
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            按分类筛选；点击任意卡片展开详情。
          </p>
        </div>

        {activeScenario ? (
          <div className="flex items-center gap-2 mb-4 px-4 py-2 rounded-lg bg-violet-950/20 border border-violet-900/40">
            <span className="text-sm text-violet-300">
              当前筛选：{activeScenario.name}场景
            </span>
            <button
              type="button"
              onClick={handleScenarioClear}
              className="ml-auto text-xs px-2 py-1 rounded-md border border-violet-800/60 text-violet-400 hover:bg-violet-950/40 transition-colors"
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
                ? "bg-violet-500/20 border-violet-500 text-violet-200"
                : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-violet-700/60"
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
                    ? "bg-violet-500/20 border-violet-500 text-violet-200"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-violet-700/60"
                }`}
              >
                {VOYAH_DREAMER_CATEGORY_LABELS[cat]}（{count}）
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

        {filteredProjects.length === 0 ? (
          <p className="text-center text-zinc-500 text-sm py-8">
            当前筛选条件下没有项目
          </p>
        ) : null}
      </div>
    </section>
  );
}
