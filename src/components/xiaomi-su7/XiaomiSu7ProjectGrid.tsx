"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { trackClick } from "@/lib/analytics";
import {
  XIAOMI_SU7_PROJECT_COUNT,
  type XiaomiSu7Category,
  type XiaomiSu7UpgradeProject,
} from "@/lib/xiaomi-su7-upgrade-projects";

const EXPECTED_PROJECT_COUNT = XIAOMI_SU7_PROJECT_COUNT;

const CATEGORY_LABELS: Record<XiaomiSu7Category, string> = {
  cabin_protection: "座舱保护",
  chassis_protection: "底盘防护",
  exterior_parts: "外观件",
  film_style: "膜系",
  cabin_comfort: "座舱舒适",
  electric_convenience: "电动便利",
  handling: "操控",
};

function assertProjectCount(projects: readonly XiaomiSu7UpgradeProject[]): void {
  if (projects.length !== EXPECTED_PROJECT_COUNT) {
    throw new Error(
      `XiaomiSu7ProjectGrid expects ${EXPECTED_PROJECT_COUNT} projects, got ${projects.length}`,
    );
  }
}

type ProjectCardProps = {
  project: XiaomiSu7UpgradeProject;
  open: boolean;
  onToggle: () => void;
};

function ProjectCard({ project, open, onToggle }: ProjectCardProps) {
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
    <article className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={open}
        aria-controls={`xiaomi-su7-project-detail-${project.id}`}
        className="text-left w-full"
      >
        <div className={`relative aspect-[4/3] bg-zinc-950 border-b border-zinc-800 flex items-center justify-center ${isMissing ? "border-dashed border-zinc-700" : ""}`}>
          {isMissing ? (
            <div className="flex flex-col items-center gap-2 text-zinc-600">
              <ImageIcon className="w-8 h-8" aria-hidden />
              <span className="text-xs">图片待补充</span>
            </div>
          ) : (
            <span className="text-zinc-700 text-sm">pending-review</span>
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
            {project.suitableFor.length > 0 ? (
              <div>
                <span className="font-semibold text-zinc-300">适用：</span>
                {project.suitableFor.join("、")}
              </div>
            ) : null}
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
};

export function XiaomiSu7ProjectGrid({
  projects,
}: XiaomiSu7ProjectGridProps) {
  assertProjectCount(projects);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section
      id="xiaomi-su7-project-grid"
      className="py-16 md:py-20 bg-black border-t border-zinc-900 scroll-mt-24"
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
            点击任意卡片展开详情。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              open={openId === p.id}
              onToggle={() => setOpenId(openId === p.id ? null : p.id)}
            />
          ))}
        </div>

        {projects.length === 0 ? (
          <p className="text-center text-zinc-500 text-sm py-8">
            暂无项目
          </p>
        ) : null}
      </div>
    </section>
  );
}
