import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Sparkles, Circle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { milestones } from "@/lib/history";

export const metadata: Metadata = {
  title: "品牌历程 | 蓝辉轻改 LANHUI",
  description:
    "蓝辉轻改品牌发展时间线，从 2026 年品牌成立到顺德大良店正式开放，记录品牌从起点到当下的关键节点。",
};

export default function HistoryPage() {
  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col">
        {/* Hero */}
        <section className="relative bg-zinc-950 text-white overflow-hidden">
          <div className="absolute inset-0 -z-0" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-zinc-950 to-zinc-950" />
            <div className="absolute -top-32 left-1/3 w-96 h-96 rounded-full bg-blue-700/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-orange-500/15 blur-3xl" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 text-center">
            <nav className="flex items-center justify-center text-sm text-zinc-500 mb-6">
              <Link href="/brand" className="hover:text-white transition-colors">
                品牌介绍
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-zinc-300">品牌历程</span>
            </nav>
            <p className="text-sm tracking-widest text-orange-400 mb-3">
              MILESTONES
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">品牌历程</h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
              从 2026 年品牌成立开始，记录每一个关键节点。
            </p>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 bg-zinc-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ol className="relative">
              {/* Center spine (desktop) */}
              <div
                className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-700/40 via-zinc-800 to-orange-700/40"
                aria-hidden
              />
              {/* Left spine (mobile) */}
              <div
                className="md:hidden absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-blue-700/40 via-zinc-800 to-orange-700/40"
                aria-hidden
              />

              {milestones.map((m, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <li
                    key={`${m.year}-${m.title}`}
                    className="relative mb-12 last:mb-0"
                  >
                    {/* Mobile layout */}
                    <div className="md:hidden pl-12">
                      <TimelineDot />
                      <MilestoneCard milestone={m} side="left" />
                    </div>

                    {/* Desktop alternating layout */}
                    <div
                      className={`hidden md:flex items-center gap-8 ${
                        isLeft ? "flex-row" : "flex-row-reverse"
                      }`}
                    >
                      <div className="w-1/2">
                        <MilestoneCard
                          milestone={m}
                          side={isLeft ? "left" : "right"}
                        />
                      </div>
                      <div className="relative z-10">
                        <TimelineDot />
                      </div>
                      <div className="w-1/2" />
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Future */}
        <section className="py-16 bg-black border-t border-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Sparkles className="w-10 h-10 text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">未完待续</h2>
            <p className="text-zinc-400 leading-relaxed">
              蓝辉轻改仍在持续生长，更多门店、产品与服务节点
              <br />
              将在
              <Link
                href="/news"
                className="text-orange-400 hover:text-orange-300 mx-1"
              >
                品牌资讯
              </Link>
              中持续更新。
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function TimelineDot() {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 shadow-lg shadow-blue-900/50"
        aria-hidden
      />
      <Circle className="absolute w-9 h-9 text-zinc-800" aria-hidden />
    </div>
  );
}

type Milestone = (typeof milestones)[number];

function MilestoneCard({
  milestone,
}: {
  milestone: Milestone;
  side: "left" | "right";
}) {
  const isHighlight = milestone.highlight;
  return (
    <article
      className={`relative bg-zinc-900 border rounded-2xl p-6 transition-all hover:border-zinc-700 ${
        isHighlight
          ? "border-orange-700/50 shadow-lg shadow-orange-900/10"
          : "border-zinc-800"
      }`}
    >
      {isHighlight && (
        <span className="absolute -top-3 right-4 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-500/10 border border-orange-700/50 text-orange-300">
          <Sparkles className="w-3 h-3" />
          里程碑
        </span>
      )}
      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
        <span className="text-blue-400 font-semibold tracking-wider">
          {milestone.year}
        </span>
        {milestone.month && (
          <>
            <span className="text-zinc-700">·</span>
            <span>{milestone.month}</span>
          </>
        )}
      </div>
      <h3
        className={`text-lg font-bold mb-2 ${
          isHighlight ? "text-white" : "text-zinc-100"
        }`}
      >
        {milestone.title}
      </h3>
      <p className="text-sm text-zinc-400 leading-relaxed">
        {milestone.description}
      </p>
    </article>
  );
}
