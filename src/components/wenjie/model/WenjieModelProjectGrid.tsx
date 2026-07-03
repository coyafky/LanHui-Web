"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AlertCircle, ImageIcon } from "lucide-react";
import { trackClick } from "@/lib/analytics";

type WenjieModelImageStatus = "real" | "generated-preview" | "missing";

type WenjieModelImage = {
  publicPath: string | null;
  alt: string;
  width: 1448;
  height: 1086;
  aspectRatio: "4/3";
};

type ProjectLike = {
  id: string;
  order: number;
  name: string;
  category: string;
  summary: string;
  suitableFor: readonly string[];
  caution?: string;
  imageStatus: WenjieModelImageStatus;
  image: WenjieModelImage;
  tier?: string;
};

type ScenarioLike = {
  key: string;
  name: string;
  projectIds: readonly string[];
};

export type WenjieModelProjectGridProps<
  TProject extends ProjectLike,
  TScenario extends ScenarioLike = ScenarioLike
> = {
  projects: readonly TProject[];
  scenarios?: readonly TScenario[];
  modelKey: "M6" | "M7" | "M8";
  titlePrefix: string;
  tierLabel?: string;
};

type ProjectCardProps<TProject extends ProjectLike> = {
  project: TProject;
  modelKey: "M6" | "M7" | "M8";
  open: boolean;
  onToggle: () => void;
};

const CATEGORY_LABELS: Record<string, string> = {
  protection: "新车保护",
  appearance: "外观个性",
  electric_convenience: "电动便利",
  chassis: "底盘与行车防护",
  family_cabin: "家庭座舱",
  screen_care: "屏幕保护",
  paint_protection: "漆面保护",
  film_style: "膜系",
  chassis_protection: "底盘防护",
  rear_cabin: "后舱便利",
  infotainment: "影音屏幕",
  exterior_parts: "外观件",
  outdoor_accessory: "户外配件",
  cabin_comfort: "座舱舒适",
  noise_sealing: "密封降噪",
};

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

function scenarioAnchorId(key: string): string {
  return key.replace(/^m[678]-scenario-/, "");
}

function WenjieModelProjectCard<TProject extends ProjectLike>({
  project,
  modelKey,
  open,
  onToggle,
}: ProjectCardProps<TProject>) {
  const statusLabel =
    project.imageStatus === "generated-preview"
      ? "效果预览"
      : project.imageStatus === "real"
        ? "实拍匹配"
        : "图片待补充";

  const handleClick = () => {
    trackClick("wenjie_model_project_click", {
      modelKey,
      projectId: project.id,
      projectName: project.name,
      category: project.category,
      imageStatus: project.imageStatus,
    });
    onToggle();
  };

  return (
    <article
      id={`wenjie-${modelKey.toLowerCase()}-project-${project.id}`}
      className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col"
    >
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={open}
        aria-controls={`wenjie-${modelKey.toLowerCase()}-project-detail-${project.id}`}
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
              <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md border border-orange-700/60 bg-zinc-950/80 px-2 py-0.5 text-[10px] font-medium text-orange-200">
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
              {getCategoryLabel(project.category)}
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
        id={`wenjie-${modelKey.toLowerCase()}-project-detail-${project.id}`}
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
 * 二级页项目网格 — M6 / M7 / M8 共用
 * 结构一比一对齐极氪 9X：分类 tab、hash 场景筛选、图片卡片、展开详情。
 */
export function WenjieModelProjectGrid<
  TProject extends ProjectLike,
  TScenario extends ScenarioLike = ScenarioLike
>({
  projects,
  scenarios,
  modelKey,
  titlePrefix,
  tierLabel,
}: WenjieModelProjectGridProps<TProject, TScenario>) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(projects.map((p) => p.category))),
    [projects],
  );

  const activeScenario = useMemo(() => {
    if (!activeScenarioId || !scenarios) return null;
    return (
      scenarios.find((s) => scenarioAnchorId(s.key) === activeScenarioId) ??
      null
    );
  }, [activeScenarioId, scenarios]);

  const handleHashChange = useCallback(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const projectMatch = hash.match(
      new RegExp(`^wenjie-${modelKey.toLowerCase()}-project-(.+)$`),
    );
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
  }, [modelKey]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(handleHashChange);
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [handleHashChange]);

  const scenarioFilteredProjects = useMemo<readonly TProject[]>(() => {
    if (!activeScenario) return projects;
    const idSet = new Set(activeScenario.projectIds);
    return projects.filter((p) => idSet.has(p.id));
  }, [projects, activeScenario]);

  const filteredProjects = useMemo<readonly TProject[]>(() => {
    if (activeCategory === "all") return scenarioFilteredProjects;
    return scenarioFilteredProjects.filter(
      (p) => p.category === activeCategory,
    );
  }, [scenarioFilteredProjects, activeCategory]);

  const handleScenarioClear = useCallback(() => {
    trackClick("wenjie_model_scenario_clear", { modelKey });
    setActiveScenarioId(null);
    setActiveCategory("all");
    window.location.hash = "";
  }, [modelKey]);

  const handleCategoryChange = useCallback(
    (cat: string | "all") => {
      if (cat === activeCategory) return;
      trackClick("wenjie_model_category_filter", {
        modelKey,
        category: cat,
      });
      setActiveCategory(cat);
    },
    [activeCategory, modelKey],
  );

  return (
    <section
      ref={sectionRef}
      id={`wenjie-${modelKey.toLowerCase()}-project-grid`}
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-orange-400 mb-3">
            PROJECTS
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {`${titlePrefix} · ${projects.length} 个项目`}
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            {tierLabel ?? "按分类筛选；点击任意卡片展开详情。"}
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
          {categories.map((cat) => {
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
                {getCategoryLabel(cat)}（{count}）
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProjects.map((p) => (
            <WenjieModelProjectCard
              key={p.id}
              project={p}
              modelKey={modelKey}
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
