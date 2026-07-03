"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AlertCircle, ImageIcon } from "lucide-react";
import { trackClick } from "@/lib/analytics";
import {
  GAOSHAN_8_CATEGORY_LABELS,
  GAOSHAN_8_PROJECT_TYPE_LABELS,
  type Gaoshan8Category,
  type Gaoshan8ProjectType,
  type Gaoshan8Scenario,
  type Gaoshan8UpgradeProject,
} from "@/lib/gaoshan-products";

type Gaoshan8ProjectGridProps = {
  projects: readonly Gaoshan8UpgradeProject[];
  scenarios: readonly Gaoshan8Scenario[];
};

const PROJECT_LENGTH = 23;
const CATEGORY_ORDER = Object.keys(
  GAOSHAN_8_CATEGORY_LABELS,
) as Gaoshan8Category[];

function assertProjectLength(projects: readonly Gaoshan8UpgradeProject[]): void {
  if (projects.length !== PROJECT_LENGTH) {
    throw new Error(
      `Gaoshan8ProjectGrid expects ${PROJECT_LENGTH} projects, got ${projects.length}`,
    );
  }
}

const PROJECT_TYPE_STYLES: Readonly<
  Record<Gaoshan8ProjectType, { color: string; bg: string; border: string } | null>
> = {
  standard: null,
  lighting: { color: "text-amber-400", bg: "bg-amber-950/40", border: "border-amber-900/60" },
  electric: { color: "text-blue-400", bg: "bg-blue-950/40", border: "border-blue-900/60" },
  kit: { color: "text-purple-400", bg: "bg-purple-950/40", border: "border-purple-900/60" },
};

type ProjectCardProps = {
  project: Gaoshan8UpgradeProject;
  open: boolean;
  onToggle: () => void;
};

function ProjectCard({ project, open, onToggle }: ProjectCardProps) {
  const image = project.image ?? {
    publicPath: null,
    alt: `高山 8 ${project.name} 图片待补充`,
  };
  const categoryLabel = GAOSHAN_8_CATEGORY_LABELS[project.category];
  const typeLabel = GAOSHAN_8_PROJECT_TYPE_LABELS[project.projectType];
  const typeStyle = PROJECT_TYPE_STYLES[project.projectType];
  const statusLabel =
    project.imageStatus === "generated-preview"
      ? "效果预览"
      : project.imageStatus === "matched"
        ? "实拍匹配"
        : project.imageStatus === "pending-review"
          ? "待复核"
          : "图片待补充";

  const handleClick = () => {
    trackClick("gaoshan_8_project_click", {
      projectId: project.id,
      name: project.name,
      category: project.category,
      projectType: project.projectType,
      imageStatus: project.imageStatus,
    });
    onToggle();
  };

  return (
    <article
      id={`gaoshan-8-project-${project.id}`}
      className="group bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-teal-700/60 transition-colors flex flex-col text-left overflow-hidden scroll-mt-24"
    >
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={open}
        aria-controls={`gaoshan-8-project-panel-${project.id}`}
        aria-label={`查看 ${project.name} 详情`}
        className="flex flex-col text-left flex-1"
      >
        <div className="relative aspect-[4/3] bg-zinc-950 border-b border-zinc-800 flex items-center justify-center overflow-hidden">
          {image.publicPath ? (
            <>
              <Image
                src={image.publicPath}
                alt={image.alt}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md border border-teal-700/60 bg-zinc-950/80 px-2 py-0.5 text-[10px] font-medium text-teal-200">
                {project.imageStatus === "generated-preview" ? (
                  <AlertCircle className="h-3 w-3" aria-hidden />
                ) : null}
                {statusLabel}
              </span>
            </>
          ) : (
            <div
              role="img"
              aria-label={image.alt}
              className="flex flex-col items-center justify-center text-zinc-500"
            >
              <ImageIcon className="mb-2 h-8 w-8" aria-hidden />
              <p className="text-xs">{statusLabel}</p>
            </div>
          )}
          <span
            aria-hidden
            className="absolute top-2 left-2 text-xs font-bold w-8 h-8 flex items-center justify-center rounded-md bg-teal-500/80 text-white"
          >
            {String(project.order).padStart(2, "0")}
          </span>
        </div>

        <div className="p-4 flex flex-col gap-3 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-teal-900/60 text-teal-400 bg-teal-950/30 text-xs">
              {categoryLabel}
            </span>
            {typeLabel && typeStyle ? (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs ${typeStyle.color} ${typeStyle.bg} ${typeStyle.border}`}
              >
                {typeLabel}
              </span>
            ) : null}
            {project.suitableFor.slice(0, 1).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-md border border-zinc-700 text-zinc-400 bg-zinc-800/50 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors">
            {project.name}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
            {project.summary}
          </p>
          <p className="text-[11px] text-zinc-500 mt-auto">
            功能预览 · 按车型确认适配
          </p>
        </div>
      </button>

      <div
        id={`gaoshan-8-project-panel-${project.id}`}
        className={`grid transition-all duration-200 ease-out border-t border-zinc-800 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 space-y-3 text-xs text-zinc-400 leading-relaxed">
            <div>
              <p className="text-xs text-teal-400 font-semibold mb-1.5">
                适合人群
              </p>
              <ul className="space-y-1">
                {project.suitableFor.map((audience) => (
                  <li
                    key={audience}
                    className="text-xs text-zinc-300 flex items-start gap-1.5"
                  >
                    <span className="text-teal-500 mt-0.5">·</span>
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

/**
 * 高山 8 项目网格（Client Component）
 * 对齐 9X：场景 hash 筛选、分类 tab、图片卡片、点击展开详情。
 */
export function Gaoshan8ProjectGrid({
  projects,
  scenarios,
}: Gaoshan8ProjectGridProps) {
  assertProjectLength(projects);

  const sectionRef = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState<Gaoshan8Category | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeScenarioKey, setActiveScenarioKey] = useState<string | null>(null);

  const activeScenario = useMemo(() => {
    if (!activeScenarioKey) return null;
    return scenarios.find((s) => s.key === activeScenarioKey) ?? null;
  }, [activeScenarioKey, scenarios]);

  const handleHashChange = useCallback(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const projectMatch = hash.match(/^gaoshan-8-project-(.+)$/);
    if (projectMatch) {
      setOpenId(projectMatch[1]);
      setActiveScenarioKey(null);
      return;
    }

    const scenario = scenarios.find((s) => s.key === hash);
    if (scenario) {
      setActiveScenarioKey(scenario.key);
      sectionRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setActiveScenarioKey(null);
  }, [scenarios]);

  useEffect(() => {
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [handleHashChange]);

  const scenarioFilteredProjects = useMemo<readonly Gaoshan8UpgradeProject[]>(() => {
    if (!activeScenario) return projects;
    const idSet = new Set(activeScenario.projectIds);
    return projects.filter((p) => idSet.has(p.id));
  }, [projects, activeScenario]);

  const filteredProjects = useMemo<readonly Gaoshan8UpgradeProject[]>(() => {
    if (activeCategory === "all") return scenarioFilteredProjects;
    return scenarioFilteredProjects.filter((p) => p.category === activeCategory);
  }, [scenarioFilteredProjects, activeCategory]);

  const handleScenarioClear = useCallback(() => {
    trackClick("gaoshan_8_scenario_clear", {});
    setActiveScenarioKey(null);
    setActiveCategory("all");
    window.location.hash = "";
  }, []);

  const handleCategoryChange = useCallback(
    (next: Gaoshan8Category | "all") => {
      if (next === activeCategory) return;
      trackClick("gaoshan_8_category_filter", {
        category: next,
      });
      setActiveCategory(next);
    },
    [activeCategory],
  );

  return (
    <section
      ref={sectionRef}
      id="gaoshan-8-project-grid"
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900 scroll-mt-24"
      aria-labelledby="gaoshan-8-projects-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-teal-400 mb-3">
            PROJECTS
          </p>
          <h2
            id="gaoshan-8-projects-heading"
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            高山 8 · {projects.length} 个升级项目
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            按分类筛选；点击任意卡片展开详情。
          </p>
        </div>

        {activeScenario ? (
          <div className="flex items-center gap-2 mb-4 px-4 py-2 rounded-lg bg-teal-950/20 border border-teal-900/40">
            <span className="text-sm text-teal-300">
              当前筛选：{activeScenario.name}场景
            </span>
            <button
              type="button"
              onClick={handleScenarioClear}
              className="ml-auto text-xs px-2 py-1 rounded-md border border-teal-800/60 text-teal-400 hover:bg-teal-950/40 transition-colors"
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
                ? "bg-teal-500/20 border-teal-500 text-teal-200"
                : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-teal-700/60"
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
                    ? "bg-teal-500/20 border-teal-500 text-teal-200"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-teal-700/60"
                }`}
              >
                {GAOSHAN_8_CATEGORY_LABELS[cat]}（{count}）
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
