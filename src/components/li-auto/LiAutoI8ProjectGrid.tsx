"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { trackClick } from "@/lib/analytics";
import {
  LI_AUTO_I8_PROJECT_COUNT,
  type LiAutoI8Category,
  type LiAutoI8Scenario,
  type LiAutoI8ScenarioKey,
  type LiAutoI8UpgradeProject,
} from "@/lib/li-auto-i8-products";

const CATEGORY_LABELS: Record<LiAutoI8Category, string> = {
  protection: "漆面保护",
  film: "膜系",
  appearance: "外观个性",
  family_cabin: "家庭座舱",
  cabin_protection: "座舱保护",
  cabin_comfort: "座舱舒适",
  chassis: "底盘防护",
  driving_protection: "行车防护",
  screen_care: "屏幕养护",
  interior_care: "内饰养护",
};

const EXPECTED_PROJECT_COUNT = LI_AUTO_I8_PROJECT_COUNT;
const SCENARIO_KEYS: readonly LiAutoI8ScenarioKey[] = [
  "protection",
  "family_cabin",
  "appearance",
  "smart_screen",
  "driving_protection",
];

function assertProjectCount(projects: readonly LiAutoI8UpgradeProject[]): void {
  if (projects.length !== EXPECTED_PROJECT_COUNT) {
    throw new Error(
      `LiAutoI8ProjectGrid expects ${EXPECTED_PROJECT_COUNT} projects, got ${projects.length}`,
    );
  }
}

export type LiAutoI8ProjectGridProps = {
  projects: readonly LiAutoI8UpgradeProject[];
  scenarios: readonly LiAutoI8Scenario[];
  modelKey: "I8";
};

type ProjectCardProps = {
  project: LiAutoI8UpgradeProject;
  open: boolean;
  onToggle: () => void;
  scenarioNameByKey: Readonly<Record<LiAutoI8ScenarioKey, string>>;
};

function ProjectCard({
  project,
  open,
  onToggle,
  scenarioNameByKey,
}: ProjectCardProps) {
  const scenarioLabel = project.suitableFor
    .map((s) => (SCENARIO_KEYS as readonly string[]).includes(s) ? scenarioNameByKey[s as LiAutoI8ScenarioKey] : null)
    .filter((label): label is string => Boolean(label))
    .join(" · ");

  const handleClick = () => {
    trackClick("li_auto_i8_project_click", {
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
        aria-controls={`li-auto-i8-project-detail-${project.key}`}
        className="text-left w-full"
      >
        <div className="relative aspect-[4/3] bg-zinc-950 border-b border-zinc-800 flex items-center justify-center overflow-hidden">
          {project.publicPath ? (
            <Image
              src={project.publicPath}
              alt={project.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <>
              {/* pending-review gradient placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-zinc-950 to-zinc-900" />
              <span
                aria-hidden
                className="relative text-5xl font-bold text-zinc-800 select-none"
              >
                {String(project.order).padStart(2, "0")}
              </span>
            </>
          )}
          <span
            aria-hidden
            className="absolute top-2 left-2 text-xs font-bold w-8 h-8 flex items-center justify-center rounded-md bg-amber-500/80 text-white"
          >
            {String(project.order).padStart(2, "0")}
          </span>
          {!project.publicPath && (
            <span className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-md bg-zinc-900/80 border border-zinc-700/60 text-zinc-400">
              图片审核中
            </span>
          )}
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
            {project.publicPath ? "功能预览 · 按车型确认适配" : "图片审核中 · 按车型确认适配"}
          </p>
        </div>
      </button>

      <div
        id={`li-auto-i8-project-detail-${project.key}`}
        className={`grid transition-all duration-200 ease-out border-t border-zinc-800 ${
          open
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 space-y-3 text-xs text-zinc-400 leading-relaxed">
            <p>
              <span className="font-semibold text-zinc-300">适用场景：</span>
              {scenarioLabel || "通用"}
            </p>
            {project.caution ? (
              <p className="text-amber-400 bg-amber-950/20 border border-amber-900/60 rounded-md px-3 py-2">
                <span className="font-semibold">注意：</span>
                {project.caution}
              </p>
            ) : null}
            <p className="text-[11px] text-zinc-600">
              具体安装可行性以到店评估为准。
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * 理想 i8 20 项项目网格（Client）
 * PRD §7：5 场景 tab 切换（默认"全部"）+ 每张卡可点击展开 detail panel
 * 埋点 li_auto_i8_project_click（metadata 含 projectKey/name/category/scenarioKey/imageStatus）
 */
export function LiAutoI8ProjectGrid({
  projects,
  scenarios,
  modelKey,
}: LiAutoI8ProjectGridProps) {
  assertProjectCount(projects);

  const scenarioNameByKey = useMemo<Readonly<Record<LiAutoI8ScenarioKey, string>>>(() => {
    const map: Record<LiAutoI8ScenarioKey, string> = {
      protection: "",
      family_cabin: "",
      appearance: "",
      smart_screen: "",
      driving_protection: "",
    };
    for (const s of scenarios) {
      map[s.key] = s.name;
    }
    return map;
  }, [scenarios]);

  const [activeTab, setActiveTab] = useState<LiAutoI8ScenarioKey | "all">("all");
  const [openKey, setOpenKey] = useState<string | null>(null);

  // hash 高亮（来自 LiAutoI8Bundles 的 hashchange）
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

  const filteredProjects = useMemo<readonly LiAutoI8UpgradeProject[]>(() => {
    if (activeTab === "all") return projects;
    return projects.filter((p) => p.suitableFor.includes(activeTab));
  }, [projects, activeTab]);

  const handleTabChange = useCallback(
    (next: LiAutoI8ScenarioKey | "all") => {
      if (next === activeTab) return;
      trackClick("li_auto_i8_scenario_filter", {
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
            {`理想 i8 · ${projects.length} 个升级项目`}
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
                {s.name}（{count}）
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
