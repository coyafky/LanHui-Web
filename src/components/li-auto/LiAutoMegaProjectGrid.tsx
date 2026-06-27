"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { trackClick } from "@/lib/analytics";
import {
  LI_AUTO_MEGA_PROJECT_COUNT,
  CATEGORY_LABELS,
  type LiAutoMegaCategory,
  type LiAutoMegaScenario,
  type LiAutoMegaScenarioKey,
  type LiAutoMegaUpgradeProject,
} from "@/lib/li-auto-mega-products";

const EXPECTED_PROJECT_COUNT = LI_AUTO_MEGA_PROJECT_COUNT;
const SCENARIO_KEYS: readonly LiAutoMegaScenarioKey[] = [
  "new_car_protection",
  "business_cabin",
  "appearance",
  "driving_protection",
  "lighting_detail",
];

const SCENARIO_TAB_LABELS: Record<LiAutoMegaScenarioKey, string> = {
  new_car_protection: "新车基础保护",
  business_cabin: "商务座舱",
  appearance: "外观个性",
  driving_protection: "行车防护",
  lighting_detail: "灯光细节",
};

function assertProjectCount(
  projects: readonly LiAutoMegaUpgradeProject[],
): void {
  if (projects.length !== EXPECTED_PROJECT_COUNT) {
    throw new Error(
      `LiAutoMegaProjectGrid expects ${EXPECTED_PROJECT_COUNT} projects, got ${projects.length}`,
    );
  }
}

export type LiAutoMegaProjectGridProps = {
  projects: readonly LiAutoMegaUpgradeProject[];
  scenarios: readonly LiAutoMegaScenario[];
  modelKey: string;
};

type ProjectCardProps = {
  project: LiAutoMegaUpgradeProject;
  open: boolean;
  onToggle: () => void;
  scenarioNameByKey: Readonly<Record<LiAutoMegaScenarioKey, string>>;
};

function ProjectCard({
  project,
  open,
  onToggle,
  scenarioNameByKey,
}: ProjectCardProps) {
  const scenarioLabel = project.suitableFor
    .map((s) =>
      (SCENARIO_KEYS as readonly string[]).includes(s)
        ? scenarioNameByKey[s as LiAutoMegaScenarioKey]
        : null,
    )
    .filter((label): label is string => Boolean(label))
    .join(" · ");

  const handleClick = () => {
    trackClick("li_auto_mega_project_click", {
      projectKey: project.key,
      projectName: project.name,
      category: project.category,
      scenarioKey: project.suitableFor[0] ?? "unknown",
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
        aria-controls={`li-auto-mega-project-detail-${project.key}`}
        className="text-left w-full"
      >
        <div className="relative aspect-[4/3] bg-zinc-950 border-b border-zinc-800 flex items-center justify-center">
          {/* 占位区域 — 图片全 pending-review，无 publicPath */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full border-2 border-zinc-700 flex items-center justify-center">
              <span className="text-zinc-600 text-lg font-bold">
                {String(project.order).padStart(2, "0")}
              </span>
            </div>
            <span className="text-[11px] text-zinc-600">图片审核中</span>
          </div>
          <span
            aria-hidden
            className="absolute top-2 left-2 text-xs font-bold w-8 h-8 flex items-center justify-center rounded-md bg-amber-500/80 text-white"
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
            <Badge
              variant="outline"
              className="border-amber-700/60 text-amber-300 bg-amber-950/30"
            >
              {CATEGORY_LABELS[project.category]}
            </Badge>
            {scenarioLabel.length > 0 ? (
              <Badge
                variant="outline"
                className="border-amber-800/60 text-amber-400 bg-amber-950/20"
              >
                {scenarioLabel}
              </Badge>
            ) : null}
          </div>
          <p className="text-[11px] text-zinc-500 mt-3">
            功能预览 · 按车型确认适配
          </p>
        </div>
      </button>

      <div
        id={`li-auto-mega-project-detail-${project.key}`}
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
 * 理想 MEGA 18 项升级项目网格（Client）
 * plan §C.2：
 *   - 6 场景 tab 切换（默认"全部"）
 *   - 每张卡可点击展开 detail panel
 *   - 埋点 li_auto_mega_scenario_filter / li_auto_mega_project_click
 */
export function LiAutoMegaProjectGrid({
  projects,
  scenarios,
  modelKey,
}: LiAutoMegaProjectGridProps) {
  assertProjectCount(projects);

  const scenarioNameByKey = useMemo<
    Readonly<Record<LiAutoMegaScenarioKey, string>>
  >(() => {
    const map: Record<LiAutoMegaScenarioKey, string> = {
      new_car_protection: "",
      business_cabin: "",
      appearance: "",
      driving_protection: "",
      lighting_detail: "",
    };
    for (const s of scenarios) {
      map[s.key] = s.name;
    }
    return map;
  }, [scenarios]);

  const [activeTab, setActiveTab] = useState<LiAutoMegaScenarioKey | "all">(
    "all",
  );
  const [openKey, setOpenKey] = useState<string | null>(null);

  // hash 高亮（来自 LiAutoMegaBundles 的 hashchange）
  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.replace(/^#/, "");
      const m = hash.match(/^project-(.+)$/);
      if (m && typeof m[1] === "string") {
        setOpenKey(m[1]);
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const filteredProjects = useMemo<readonly LiAutoMegaUpgradeProject[]>(() => {
    if (activeTab === "all") return projects;
    return projects.filter((p) => p.suitableFor.includes(activeTab));
  }, [projects, activeTab]);

  /**
   * 场景 tab 切换 handler
   * - 用户实际切换时触发（scenarioKey 实际改变）
   * - 初次 mount 不触发（直接从初值判断）
   */
  const handleTabChange = useCallback(
    (next: LiAutoMegaScenarioKey | "all") => {
      if (next === activeTab) return;
      trackClick("li_auto_mega_scenario_filter", {
        scenarioKey: next,
      });
      setActiveTab(next);
    },
    [activeTab],
  );

  return (
    <section className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-amber-400 mb-3">PROJECTS</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {`理想 MEGA · ${projects.length} 个升级项目`}
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            按用车场景筛选；点击任意卡片展开详情。
          </p>
        </div>

        <div
          role="tablist"
          aria-label="按场景筛选项目"
          className="flex flex-wrap items-center gap-2 mb-8"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "all"}
            onClick={() => handleTabChange("all")}
            className={`px-3 py-2 rounded-md text-sm transition-colors border ${
              activeTab === "all"
                ? "bg-amber-500/20 border-amber-500 text-amber-200"
                : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-amber-700/60"
            }`}
          >
            全部（{projects.length}）
          </button>
          {scenarios.map((s) => {
            const count = projects.filter((p) =>
              p.suitableFor.includes(s.key),
            ).length;
            const tabLabel =
              SCENARIO_TAB_LABELS[s.key as LiAutoMegaScenarioKey] ?? s.name;
            return (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={activeTab === s.key}
                onClick={() => handleTabChange(s.key)}
                className={`px-3 py-2 rounded-md text-sm transition-colors border ${
                  activeTab === s.key
                    ? "bg-amber-500/20 border-amber-500 text-amber-200"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-amber-700/60"
                }`}
              >
                {tabLabel}（{count}）
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProjects.map((p) => (
            <ProjectCard
              key={p.key}
              project={p}
              open={openKey === p.key}
              onToggle={() => setOpenKey(openKey === p.key ? null : p.key)}
              scenarioNameByKey={scenarioNameByKey}
            />
          ))}
        </div>

        {/* 隐藏 modelKey 用途说明：避免 TS unused warning，又保留可观测扩展位 */}
        <span className="sr-only">{`model: ${modelKey}`}</span>
      </div>
    </section>
  );
}
