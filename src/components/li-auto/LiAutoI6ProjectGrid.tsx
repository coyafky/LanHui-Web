"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import type {
  LiAutoI6UpgradeProject,
  LiAutoI6Category,
  LiAutoI6Scenario,
  LiAutoI6ScenarioKey,
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

const STATUS_LABELS: Record<string, string> = {
  "pending-review": "图片审核中",
};

type LiAutoI6ProjectGridProps = {
  projects: readonly LiAutoI6UpgradeProject[];
  scenarios: readonly LiAutoI6Scenario[];
  modelKey: string;
};

export function LiAutoI6ProjectGrid({
  projects,
  scenarios,
  modelKey,
}: LiAutoI6ProjectGridProps) {
  const allTab = { key: "__all" as const, name: "全部项目", description: "", projectKeys: projects.map((p) => p.key) };
  const tabs = [allTab, ...scenarios] as const;

  const [activeTab, setActiveTab] = useState<string>("__all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (activeTab === "__all") return projects;
    const scenario = scenarios.find((s) => s.key === activeTab);
    if (!scenario) return projects;
    return projects.filter((p) => scenario.projectKeys.includes(p.key));
  }, [activeTab, projects, scenarios]);

  const toggleCard = (key: string) => {
    setExpandedCard(expandedCard === key ? null : key);
  };

  return (
    <section className="py-16 md:py-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-amber-400 mb-3">
            PROJECT CATALOG
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            20 项热门轻改产品目录
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            按场景筛选，快速找到你需要的项目
          </p>
        </div>

        {/* 场景 Tab */}
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => {
                  setActiveTab(tab.key);
                  setExpandedCard(null);
                }}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-amber-500/20 text-amber-400 border border-amber-700/60"
                    : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700"
                }`}
              >
                {tab.name}
                {tab.key !== "__all" && (
                  <span className="ml-1.5 text-[10px] opacity-60">
                    {(tab as LiAutoI6Scenario).projectKeys.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 项目网格 */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          role="tabpanel"
        >
          {filtered.map((project) => {
            const isExpanded = expandedCard === project.key;
            const scenarioKey = activeTab !== "__all" ? activeTab : undefined;

            return (
              <article
                key={project.key}
                id={`${modelKey}-${project.key}`}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden flex flex-col"
              >
                {/* 图片区域 */}
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
                  {project.imageStatus === "pending-review" && (
                    <span className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-md bg-zinc-900/80 border border-zinc-700/60 text-zinc-400">
                      {STATUS_LABELS["pending-review"]}
                    </span>
                  )}
                </div>

                {/* 卡片内容 */}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700/60 text-zinc-400">
                      {CATEGORY_LABELS[project.category]}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    {project.name}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {project.summary}
                  </p>

                  {/* 适搭配 Tags */}
                  {project.suitableFor.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.suitableFor.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 展开/收起按钮 */}
                  <button
                    type="button"
                    onClick={() => toggleCard(project.key)}
                    className="mt-auto text-xs text-amber-400 hover:text-amber-300 text-left transition-colors self-start"
                  >
                    {isExpanded ? "收起说明" : "查看详情"}
                  </button>

                  {/* 展开面板 */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-zinc-800 space-y-2 text-xs text-zinc-400">
                      {project.suitableFor.length > 0 && (
                        <p>
                          <span className="text-zinc-500">适合场景：</span>
                          {project.suitableFor.join("、")}
                        </p>
                      )}
                      {project.caution && (
                        <p>
                          <span className="text-amber-400/80">注意：</span>
                          {project.caution}
                        </p>
                      )}
                      <p className="text-zinc-500">
                        以到店确认车型年份、配置和安装位为准
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* 合规说明 */}
        <p className="text-xs text-zinc-500 mt-6 text-center">
          以上项目仅作轻改方向参考，具体以到店确认车型年份、配置、版本和施工评估为准
        </p>
      </div>
    </section>
  );
}
