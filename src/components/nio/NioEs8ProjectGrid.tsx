"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { trackClick } from "@/lib/analytics";
import {
  NIO_ES8_PROJECT_COUNT,
  type NioEs8Scenario,
  type NioEs8ScenarioKey,
  type NioEs8UpgradeProject,
} from "@/lib/nio-products";

const EXPECTED_PROJECT_COUNT = NIO_ES8_PROJECT_COUNT;
const SCENARIO_KEYS: readonly NioEs8ScenarioKey[] = [
  "protection",
  "appearance",
  "family_cabin",
  "driving_protection",
];

function assertProjectCount(projects: readonly NioEs8UpgradeProject[]): void {
  if (projects.length !== EXPECTED_PROJECT_COUNT) {
    throw new Error(
      `NioEs8ProjectGrid expects ${EXPECTED_PROJECT_COUNT} projects, got ${projects.length}`,
    );
  }
}

export type NioEs8ProjectGridProps = {
  projects: readonly NioEs8UpgradeProject[];
  scenarios: readonly NioEs8Scenario[];
  modelKey: "ES8";
};

type ProjectCardProps = {
  project: NioEs8UpgradeProject;
  open: boolean;
  onToggle: () => void;
  scenarioNameByKey: Readonly<Record<NioEs8ScenarioKey, string>>;
};

function ProjectCard({
  project,
  open,
  onToggle,
  scenarioNameByKey,
}: ProjectCardProps) {
  const scenarioLabel = project.suitableFor
    .map((s) => (SCENARIO_KEYS as readonly string[]).includes(s) ? scenarioNameByKey[s as NioEs8ScenarioKey] : null)
    .filter((label): label is string => Boolean(label))
    .join(" · ");

  const handleClick = () => {
    trackClick("nio_es8_project_click", {
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
        aria-controls={`nio-es8-project-detail-${project.key}`}
        className="text-left w-full"
      >
        <div className="relative aspect-[4/3] bg-zinc-950 border-b border-zinc-800">
          <Image
            src={project.publicPath}
            alt={`${project.name} AI 预览图`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
          <span
            aria-hidden
            className="absolute top-2 left-2 text-xs font-bold w-8 h-8 flex items-center justify-center rounded-md bg-sky-500/80 text-white"
          >
            {String(project.order).padStart(2, "0")}
          </span>
          <span
            aria-hidden
            className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-[10px]"
          >
            AI 预览图
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
              className="border-sky-700/60 text-sky-300 bg-sky-950/30"
            >
              {project.category}
            </Badge>
            {scenarioLabel.length > 0 ? (
              <Badge
                variant="outline"
                className="border-sky-800/60 text-sky-400 bg-sky-950/20"
              >
                {scenarioLabel}
              </Badge>
            ) : null}
          </div>
        </div>
      </button>

      <div
        id={`nio-es8-project-detail-${project.key}`}
        className={`grid transition-all duration-200 ease-out border-t border-zinc-800 ${
          open
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 space-y-3 text-xs text-zinc-400 leading-relaxed">
            <p>
              <span className="text-sky-400 font-semibold">生成提示词：</span>
              {project.promptSummary}
            </p>
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
 * NIO ES8 17 项项目网格（Client）
 * plan §C.2：
 *   - 4 场景 tab 切换（默认"全部"）
 *   - 每张卡可点击展开 detail panel
 *   - 埋点 nio_es8_project_click（metadata 含 projectKey/name/category/scenarioKey/imageStatus）
 */
export function NioEs8ProjectGrid({
  projects,
  scenarios,
  modelKey,
}: NioEs8ProjectGridProps) {
  assertProjectCount(projects);

  const scenarioNameByKey = useMemo<Readonly<Record<NioEs8ScenarioKey, string>>>(() => {
    const map: Record<NioEs8ScenarioKey, string> = {
      protection: "",
      appearance: "",
      family_cabin: "",
      driving_protection: "",
    };
    for (const s of scenarios) {
      map[s.key] = s.name;
    }
    return map;
  }, [scenarios]);

  const [activeTab, setActiveTab] = useState<NioEs8ScenarioKey | "all">("all");
  const [openKey, setOpenKey] = useState<string | null>(null);

  // hash 高亮（来自 NioEs8Bundles 的 hashchange）
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

  const filteredProjects = useMemo<readonly NioEs8UpgradeProject[]>(() => {
    if (activeTab === "all") return projects;
    return projects.filter((p) => p.suitableFor.includes(activeTab));
  }, [projects, activeTab]);

  return (
    <section className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-sky-400 mb-3">PROJECTS</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {`蔚来 ES8 · ${projects.length} 个升级项目`}
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
            onClick={() => setActiveTab("all")}
            className={`px-3 py-2 rounded-md text-sm transition-colors border ${
              activeTab === "all"
                ? "bg-sky-500/20 border-sky-500 text-sky-200"
                : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-sky-700/60"
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
                onClick={() => setActiveTab(s.key)}
                className={`px-3 py-2 rounded-md text-sm transition-colors border ${
                  activeTab === s.key
                    ? "bg-sky-500/20 border-sky-500 text-sky-200"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-sky-700/60"
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