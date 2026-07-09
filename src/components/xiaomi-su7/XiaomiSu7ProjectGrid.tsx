"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AlertCircle, ImageIcon } from "lucide-react";
import { trackClick } from "@/lib/analytics";
import {
  type XiaomiSu7Category,
  type XiaomiSu7Scenario,
  type XiaomiSu7UpgradeProject,
} from "@/lib/xiaomi-su7-upgrade-projects";

const CATEGORY_LABELS: Record<XiaomiSu7Category, string> = {
  paint_protection: "漆面保护",
  cabin_protection: "座舱保护",
  chassis_protection: "底盘防护",
  exterior_parts: "外观件",
  film_style: "膜系",
  cabin_comfort: "座舱舒适",
  electric_convenience: "电动便利",
  handling: "操控",
  infotainment: "智能影音",
};

const CATEGORY_ORDER: readonly XiaomiSu7Category[] = [
  "paint_protection",
  "film_style",
  "exterior_parts",
  "cabin_comfort",
  "cabin_protection",
  "chassis_protection",
  "electric_convenience",
  "handling",
  "infotainment",
];

type ProjectCardProps = {
  project: XiaomiSu7UpgradeProject;
  open: boolean;
  onToggle: () => void;
};

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
    trackClick("xiaomi_su7_project_click", {
      projectId: project.id,
      projectName: project.name,
      category: project.category,
      imageStatus: project.imageStatus,
    });
    onToggle();
  };

  const isMissing = project.imageStatus === "missing";

  return (
    <article className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={open}
        aria-controls={`xiaomi-su7-project-detail-${project.id}`}
        className="text-left w-full"
      >
        <div className={`relative aspect-[4/3] bg-zinc-950 border-b border-zinc-800 flex items-center justify-center overflow-hidden ${isMissing && !project.publicPath ? "border-dashed border-zinc-700" : ""}`}>
          {project.publicPath ? (
            <>
              <Image
                src={project.publicPath}
                alt={`小米 SU7 ${project.name} 效果预览图`}
                fill
                className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
              <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md border border-orange-700/60 bg-zinc-950/80 px-2 py-0.5 text-[10px] font-medium text-orange-200">
                {project.imageStatus === "pending-review" ? (
                  <AlertCircle className="h-3 w-3" aria-hidden />
                ) : null}
                {statusLabel}
              </span>
            </>
          ) : isMissing ? (
            <div className="flex flex-col items-center gap-2 text-zinc-600">
              <ImageIcon className="w-8 h-8" aria-hidden />
              <span className="text-xs">{statusLabel}</span>
            </div>
          ) : (
            <span className="text-zinc-700 text-sm">{statusLabel}</span>
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
        id={`xiaomi-su7-project-detail-${project.id}`}
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

export type XiaomiSu7ProjectGridProps = {
  projects: readonly XiaomiSu7UpgradeProject[];
  scenarios: readonly XiaomiSu7Scenario[];
};

export function XiaomiSu7ProjectGrid({
  projects,
  scenarios,
}: XiaomiSu7ProjectGridProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState<XiaomiSu7Category | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const activeScenario = useMemo(() => {
    if (!activeScenarioId) return null;
    return scenarios.find((s) => s.id === activeScenarioId) ?? null;
  }, [activeScenarioId, scenarios]);

  const handleHashChange = useCallback(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const projectMatch = hash.match(/^xiaomi-su7-project-(.+)$/);
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

  const scenarioFilteredProjects = useMemo<readonly XiaomiSu7UpgradeProject[]>(() => {
    if (!activeScenario) return projects;
    const idSet = new Set(activeScenario.projectIds);
    return projects.filter((p) => idSet.has(p.id));
  }, [projects, activeScenario]);

  const filteredProjects = useMemo<readonly XiaomiSu7UpgradeProject[]>(() => {
    if (activeCategory === "all") return scenarioFilteredProjects;
    return scenarioFilteredProjects.filter(
      (p) => p.category === activeCategory,
    );
  }, [scenarioFilteredProjects, activeCategory]);

  const handleScenarioClear = useCallback(() => {
    trackClick("xiaomi_su7_scenario_clear", {});
    setActiveScenarioId(null);
    setActiveCategory("all");
    window.location.hash = "";
  }, []);

  const handleCategoryChange = useCallback(
    (cat: XiaomiSu7Category | "all") => {
      if (cat === activeCategory) return;
      trackClick("xiaomi_su7_category_filter", {
        category: cat,
      });
      setActiveCategory(cat);
    },
    [activeCategory],
  );

  return (
    <section
      ref={sectionRef}
      id="xiaomi-su7-project-grid"
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-orange-400 mb-3">
            PROJECTS
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            小米 SU7 · {projects.length} 个升级项目
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
