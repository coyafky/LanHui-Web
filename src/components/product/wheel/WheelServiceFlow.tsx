import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { wheelProcess } from "@/lib/wheel-products";

export function WheelServiceFlow() {
  return (
    <section className="bg-black py-14 md:py-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-9 md:mb-11">
          <p className="text-xs tracking-widest text-sky-400 mb-3">
            SERVICE FLOW
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            轮毂升级到店流程
          </h2>
          <p className="mt-3 max-w-2xl text-sm md:text-base text-zinc-400">
            先确认原车数据，再选择视觉方向，最后完成安装、动平衡和交付复查。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {wheelProcess.map((item) => (
            <Card
              key={item.step}
              className="bg-zinc-900 border-zinc-800 text-zinc-100"
            >
              <CardHeader>
                <span className="text-xs tracking-widest text-sky-400">
                  {item.step}
                </span>
                <CardTitle className="text-white">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-sky-900/40 bg-sky-950/15 p-6 md:flex md:items-center md:justify-between md:gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white">
              轮毂数据需要实车确认
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              建议提前准备车型、年款、当前轮胎规格和想要的视觉方向，现场再确认可安装范围。
            </p>
          </div>
          <Link
            href="/contact"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-sky-400 px-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-sky-300 md:mt-0"
          >
            联系蓝辉轻改
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
